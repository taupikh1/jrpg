/**
 * Persists audio settings in localStorage. Platform code only.
 * This key is separate from gameplay save slots, so audio changes never touch player progress.
 */
export const AUDIO_SETTINGS_KEY = 'jrpg.audio.settings.v1';

export class LocalAudioSettingsStore {
  /**
   * @param {object} [opts]
   * @param {Storage|null} [opts.storage]
   * @param {string} [opts.key]
   */
  constructor({ storage = globalThis.localStorage ?? null, key = AUDIO_SETTINGS_KEY } = {}) {
    this._storage = storage;
    this._key = key;
  }

  read() {
    try {
      const raw = this._storage ? this._storage.getItem(this._key) : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  write(value) {
    try {
      if (!this._storage) return false;
      this._storage.setItem(this._key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
}
