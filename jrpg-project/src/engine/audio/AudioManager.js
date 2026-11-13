/**
 * Central audio policy: SFX and ambience channels, volumes, mute, unlock, playback rules.
 * Engine layer: no browser APIs. All output goes through the injected AudioPort.
 *
 * Rules enforced here:
 *  - Nothing plays before unlock() succeeds (user gesture required on iOS and Android).
 *  - SFX and ambience have independent volumes; mute silences both.
 *  - At most one ambience track is active. Switching crossfades inside the port.
 *  - Ambience holds (pause menu, battle) silence the track without forgetting it.
 *  - The same SFX cannot re-trigger within its cooldown (rapid taps, repeated events).
 *  - Settings persist through an injected store. Gameplay save data is never touched.
 */
import { SFX_IDS, AMBIENT_IDS, ambientPath, sfxPath, sfxGain, allAudioPaths } from './AudioCatalog.js';

export const VOLUME_STEP = 0.1;
/** Ambience is intentionally quieter than SFX at equal volume settings. */
export const AMBIENT_MAX_GAIN = 0.6;
export const SFX_COOLDOWN_MS = 40;
const PREVIEW_CHANNEL = 'preview';
const AMBIENT_CHANNEL = 'ambient';

export const AUDIO_DEFAULTS = Object.freeze({ sfxVolume: 0.8, ambientVolume: 0.5, muted: false });

/**
 * Round to the nearest 0.1 step and clamp to [0, 1].
 * @param {unknown} v
 * @param {number} fallback
 */
export function normalizeVolume(v, fallback) {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fallback;
  const stepped = Math.round(Math.min(1, Math.max(0, n)) / VOLUME_STEP) * VOLUME_STEP;
  return Math.round(stepped * 10) / 10;
}

/**
 * Sanitize persisted settings. Anything unreadable falls back to defaults.
 * @param {unknown} raw
 */
export function sanitizeAudioSettings(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  return {
    sfxVolume: normalizeVolume(src.sfxVolume, AUDIO_DEFAULTS.sfxVolume),
    ambientVolume: normalizeVolume(src.ambientVolume, AUDIO_DEFAULTS.ambientVolume),
    muted: typeof src.muted === 'boolean' ? src.muted : AUDIO_DEFAULTS.muted,
  };
}

/** In-memory store, used when no persistent store is available. */
export class MemoryAudioSettingsStore {
  constructor() {
    this._value = null;
  }

  read() {
    return this._value;
  }

  write(value) {
    this._value = value;
    return true;
  }
}

export class AudioManager {
  /**
   * @param {object} opts
   * @param {import('../../core/ports/AudioPort.js').AudioPort} opts.port
   * @param {{ read: () => unknown, write: (v: object) => boolean }} [opts.settingsStore]
   * @param {() => number} [opts.now] - clock in milliseconds, injectable for tests
   */
  constructor({ port, settingsStore = null, now = () => Date.now() }) {
    if (!port) throw new TypeError('AudioManager requires a port');
    this._port = port;
    this._store = settingsStore ?? new MemoryAudioSettingsStore();
    this._now = now;
    this._settings = { ...AUDIO_DEFAULTS };
    this._unlocked = false;
    this._unlocking = null;
    this._wantedTrack = null; // ambience the game wants (zone-driven)
    this._loadedTrack = null; // ambience currently playing on the port
    this._ambientToken = 0;
    this._holds = new Set();
    this._lastPlayed = new Map();
    this._missing = new Set();
  }

  // ----- settings ---------------------------------------------------------

  get settings() {
    return { ...this._settings };
  }

  /** Load persisted settings. Safe to call more than once. */
  loadSettings() {
    let raw = null;
    try {
      raw = this._store.read();
    } catch {
      raw = null; // unreadable storage means defaults, never a crash
    }
    this._settings = sanitizeAudioSettings(raw);
    return this.settings;
  }

  _persist() {
    try {
      this._store.write({ ...this._settings });
    } catch {
      // Persistence is best-effort; audio keeps working in this session.
    }
  }

  setSfxVolume(value) {
    this._settings.sfxVolume = normalizeVolume(value, this._settings.sfxVolume);
    this._persist();
    return this._settings.sfxVolume;
  }

  setAmbientVolume(value) {
    this._settings.ambientVolume = normalizeVolume(value, this._settings.ambientVolume);
    this._persist();
    this._applyAmbientGain(0.2);
    return this._settings.ambientVolume;
  }

  setMuted(muted) {
    this._settings.muted = !!muted;
    this._persist();
    this._applyAmbientGain(0.2);
    return this._settings.muted;
  }

  // ----- lifecycle --------------------------------------------------------

  get unlocked() {
    return this._unlocked;
  }

  /**
   * Must be called from a user gesture. Safe to call repeatedly; concurrent calls share one attempt.
   * @returns {Promise<boolean>}
   */
  unlock() {
    if (this._unlocked) return Promise.resolve(true);
    if (!this._unlocking) {
      this._unlocking = Promise.resolve()
        .then(() => this._port.unlock())
        .then((ok) => {
          this._unlocked = !!ok;
          if (this._unlocked) {
            this._port.preload(allAudioPaths());
            this._applyAmbient(0.4);
          }
          return this._unlocked;
        })
        .catch(() => {
          this._unlocked = false;
          return false;
        })
        .finally(() => {
          this._unlocking = null;
        });
    }
    return this._unlocking;
  }

  /** Pause output when the app is hidden. Ambience state is kept. */
  suspend() {
    try {
      this._port.suspend();
    } catch {
      // ignore: suspension is best-effort
    }
  }

  resume() {
    try {
      this._port.resume();
    } catch {
      // ignore
    }
  }

  // ----- sound effects ----------------------------------------------------

  /**
   * Play a one-shot effect. Returns true only when playback actually started.
   * @param {string} id
   * @param {{ delay?: number }} [opts] - delay in seconds, scheduled on the audio clock
   */
  playSfx(id, opts = {}) {
    if (!this._unlocked || this._settings.muted || this._settings.sfxVolume <= 0) return false;
    if (!SFX_IDS.includes(id)) return false;
    const now = this._now();
    const last = this._lastPlayed.get(id);
    if (opts.delay === undefined && last !== undefined && now - last < SFX_COOLDOWN_MS) return false;
    const path = sfxPath(id);
    const started = this._port.playOneShot(path, {
      gain: this._settings.sfxVolume * sfxGain(id),
      delay: opts.delay ?? 0,
    });
    if (started) this._lastPlayed.set(id, now);
    return started;
  }

  // ----- ambience ---------------------------------------------------------

  /**
   * Set the ambience for the current area. null silences ambience.
   * Crossfades when the track changes. Repeating the same track does nothing.
   * @param {string|null} trackId
   */
  playAmbient(trackId) {
    if (trackId !== null && !AMBIENT_IDS.includes(trackId)) return false;
    if (trackId === this._wantedTrack) return true;
    this._wantedTrack = trackId;
    this._applyAmbient(0.6);
    return true;
  }

  /**
   * Silence ambience while a reason holds (for example 'pause' or 'battle').
   * The track keeps playing silently underneath, so the release is seamless.
   * @param {string} reason
   * @param {boolean} on
   */
  setAmbientHold(reason, on) {
    if (on) this._holds.add(reason);
    else this._holds.delete(reason);
    this._applyAmbientGain(0.4);
  }

  get ambientHeld() {
    return this._holds.size > 0;
  }

  /** The track the game currently wants, regardless of unlock or hold state. */
  get wantedAmbient() {
    return this._wantedTrack;
  }

  /**
   * Play a track for a few seconds from the settings screen, even while paused or in battle.
   * @param {string} trackId
   * @param {number} [seconds]
   */
  previewAmbient(trackId, seconds = 4) {
    if (!this._unlocked || !AMBIENT_IDS.includes(trackId)) return false;
    const gain = this._settings.muted ? 0 : this._settings.ambientVolume * AMBIENT_MAX_GAIN;
    this._port.startLoop(PREVIEW_CHANNEL, { path: ambientPath(trackId), gain, fadeInSec: 0.2 });
    this._port.stopLoop(PREVIEW_CHANNEL, 0.3, seconds);
    return true;
  }

  // ----- diagnostics ------------------------------------------------------

  /** Asset paths that failed to load. The game keeps running without them. */
  get missingAssets() {
    for (const p of this._port.getFailedPaths()) this._missing.add(p);
    return [...this._missing];
  }

  /** Stop everything and forget transient state. Settings are kept. */
  stopAll() {
    this._wantedTrack = null;
    this._loadedTrack = null;
    this._holds.clear();
    this._ambientToken++;
    this._port.stopLoop(AMBIENT_CHANNEL, 0.2);
    this._port.stopLoop(PREVIEW_CHANNEL, 0.1);
  }

  // ----- internals --------------------------------------------------------

  _effectiveAmbientGain() {
    if (this._settings.muted || this._holds.size > 0 || this._wantedTrack === null) return 0;
    return this._settings.ambientVolume * AMBIENT_MAX_GAIN;
  }

  _applyAmbientGain(fadeSec) {
    if (!this._unlocked) return;
    this._port.setLoopGain(AMBIENT_CHANNEL, this._effectiveAmbientGain(), fadeSec);
  }

  _applyAmbient(fadeSec) {
    if (!this._unlocked) return;
    const want = this._wantedTrack;
    if (want === this._loadedTrack) {
      this._applyAmbientGain(fadeSec);
      return;
    }
    const token = ++this._ambientToken;
    if (want === null) {
      this._loadedTrack = null;
      this._port.stopLoop(AMBIENT_CHANNEL, fadeSec);
      return;
    }
    this._loadedTrack = want;
    const gain = this._effectiveAmbientGain();
    Promise.resolve(
      this._port.startLoop(AMBIENT_CHANNEL, { path: ambientPath(want), gain, fadeInSec: fadeSec })
    )
      .then((ok) => {
        // Ignore results for a track that was replaced while it was loading.
        if (token !== this._ambientToken) return;
        if (!ok) this._loadedTrack = null;
      })
      .catch(() => {
        if (token === this._ambientToken) this._loadedTrack = null;
      });
  }
}

