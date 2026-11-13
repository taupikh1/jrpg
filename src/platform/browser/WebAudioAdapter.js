/**
 * Web Audio implementation of AudioPort. Only platform code may touch AudioContext.
 *
 * Mobile notes:
 *  - The context is created and resumed synchronously inside the first user gesture
 *    (iOS Safari and Android Chrome reject audio started from timers or load events).
 *  - Decoding happens in the background. A sound that is not decoded yet is skipped, never queued,
 *    so the game never waits on audio.
 *  - Failed fetches or decodes are remembered and reported through getFailedPaths().
 */

export const MAX_VOICES = 16;

const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'keydown'];

function defaultCreateContext() {
  const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
  return Ctor ? new Ctor() : null;
}

export class WebAudioAdapter {
  /**
   * @param {object} [opts]
   * @param {string} [opts.basePath] - prefix for asset paths; default is the page directory
   * @param {() => any} [opts.createContext] - AudioContext factory, injectable for tests
   * @param {(url: string) => Promise<{ ok: boolean, arrayBuffer: () => Promise<ArrayBuffer> }>} [opts.fetchFn]
   * @param {number} [opts.maxVoices]
   */
  constructor({
    basePath = './',
    createContext = defaultCreateContext,
    fetchFn = (url) => globalThis.fetch(url),
    maxVoices = MAX_VOICES,
  } = {}) {
    this._basePath = basePath;
    this._createContext = createContext;
    this._fetch = fetchFn;
    this._maxVoices = maxVoices;
    this._ctx = null;
    this._buffers = new Map(); // path -> AudioBuffer
    this._pending = new Map(); // path -> Promise<AudioBuffer|null>
    this._failed = new Set();
    this._voices = 0;
    this._loops = new Map(); // channel -> { source, gain }
  }

  /**
   * Create or resume the context. Call synchronously from a gesture handler.
   * @returns {Promise<boolean>}
   */
  unlock() {
    try {
      if (!this._ctx) this._ctx = this._createContext();
      if (!this._ctx) return Promise.resolve(false);
      // resume() must be called synchronously inside the gesture; the result is awaited below.
      const resuming = this._ctx.state === 'suspended' && typeof this._ctx.resume === 'function'
        ? this._ctx.resume()
        : null;
      return Promise.resolve(resuming)
        .catch(() => undefined)
        .then(() => this._ctx.state === 'running');
    } catch {
      return Promise.resolve(false);
    }
  }

  get state() {
    return this._ctx ? this._ctx.state : 'none';
  }

  /** @param {string[]} paths */
  preload(paths) {
    for (const p of paths) this._load(p);
  }

  _load(path) {
    if (this._buffers.has(path)) return Promise.resolve(this._buffers.get(path));
    if (this._failed.has(path)) return Promise.resolve(null);
    if (!this._ctx) return Promise.resolve(null);
    if (!this._pending.has(path)) {
      const job = this._fetch(this._basePath + path)
        .then((res) => {
          if (!res || !res.ok) throw new Error(`HTTP ${res && res.status}`);
          return res.arrayBuffer();
        })
        .then((data) => this._ctx.decodeAudioData(data))
        .then((buffer) => {
          this._buffers.set(path, buffer);
          return buffer;
        })
        .catch(() => {
          this._failed.add(path);
          return null;
        })
        .finally(() => this._pending.delete(path));
      this._pending.set(path, job);
    }
    return this._pending.get(path);
  }

  /**
   * @returns {boolean} true when the sound was started. False when not ready, missing or over the voice limit.
   */
  playOneShot(path, { gain = 1, delay = 0 } = {}) {
    if (!this._ctx || this._ctx.state !== 'running') return false;
    const buffer = this._buffers.get(path);
    if (!buffer) {
      this._load(path);
      return false;
    }
    if (this._voices >= this._maxVoices) return false;
    const ctx = this._ctx;
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    source.buffer = buffer;
    gainNode.gain.value = Math.max(0, gain);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    this._voices++;
    source.onended = () => {
      this._voices = Math.max(0, this._voices - 1);
      source.disconnect();
      gainNode.disconnect();
    };
    source.start(ctx.currentTime + Math.max(0, delay));
    return true;
  }

  /**
   * Start a looping track on a channel, fading out the previous one on that channel.
   * @returns {Promise<boolean>} true when the loop is playing
   */
  async startLoop(channel, { path, gain = 1, fadeInSec = 0.3 }) {
    if (!this._ctx || this._ctx.state !== 'running') return false;
    const buffer = await this._load(path);
    if (!buffer || !this._ctx) return false;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const fade = Math.max(0.01, fadeInSec);
    const previous = this._loops.get(channel);
    if (previous) this._fadeOutLoop(previous, now, fade);

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(Math.max(0, gain), now + fade);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(now);
    this._loops.set(channel, { source, gain: gainNode });
    return true;
  }

  _fadeOutLoop(loop, now, fadeSec) {
    try {
      loop.gain.gain.cancelScheduledValues(now);
      loop.gain.gain.setValueAtTime(loop.gain.gain.value, now);
      loop.gain.gain.linearRampToValueAtTime(0, now + fadeSec);
      loop.source.stop(now + fadeSec + 0.05);
    } catch {
      // already stopped
    }
  }

  setLoopGain(channel, gain, fadeSec = 0.2) {
    const loop = this._loops.get(channel);
    if (!loop || !this._ctx) return;
    const now = this._ctx.currentTime;
    loop.gain.gain.cancelScheduledValues(now);
    loop.gain.gain.setValueAtTime(loop.gain.gain.value, now);
    loop.gain.gain.linearRampToValueAtTime(Math.max(0, gain), now + Math.max(0.01, fadeSec));
  }

  stopLoop(channel, fadeSec = 0.3, delaySec = 0) {
    const loop = this._loops.get(channel);
    if (!loop || !this._ctx) return;
    const now = this._ctx.currentTime + Math.max(0, delaySec);
    this._fadeOutLoop(loop, now, Math.max(0.01, fadeSec));
    this._loops.delete(channel);
  }

  suspend() {
    if (this._ctx && typeof this._ctx.suspend === 'function' && this._ctx.state === 'running') {
      this._ctx.suspend().catch(() => undefined);
    }
  }

  resume() {
    if (this._ctx && typeof this._ctx.resume === 'function' && this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => undefined);
    }
  }

  getFailedPaths() {
    return [...this._failed];
  }
}

/**
 * Call onGesture on the first tap or key press until it resolves true. Then remove all listeners.
 * Installed once by the composition root. Duplicate installs are prevented by the returned disposer.
 *
 * @param {EventTarget} target
 * @param {() => Promise<boolean>} onGesture
 * @returns {() => void} dispose
 */
export function installUnlockOnGesture(target, onGesture) {
  let done = false;
  let busy = false;
  const handler = () => {
    if (done || busy) return;
    busy = true;
    Promise.resolve()
      .then(() => onGesture())
      .then((ok) => {
        if (ok) finish();
      })
      .catch(() => undefined)
      .finally(() => {
        busy = false;
      });
  };
  const finish = () => {
    if (done) return;
    done = true;
    for (const type of UNLOCK_EVENTS) target.removeEventListener(type, handler, true);
  };
  for (const type of UNLOCK_EVENTS) target.addEventListener(type, handler, { capture: true, passive: true });
  return finish;
}
