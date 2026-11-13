/**
 * Persists battle mode preference in localStorage. Platform code only.
 * Does not touch save schema.
 */
export const BATTLE_SETTINGS_KEY = 'jrpg.battle.settings.v1';

export class BattleSettingsStore {
  /**
   * @param {object} [opts]
   * @param {Storage|null} [opts.storage]
   * @param {string} [opts.key]
   */
  constructor({ storage = globalThis.localStorage ?? null, key = BATTLE_SETTINGS_KEY } = {}) {
    this._storage = storage;
    this._key = key;
  }

  read() {
    try {
      const raw = this._storage ? this._storage.getItem(this._key) : null;
      const v = raw ? JSON.parse(raw) : null;
      if (v && ['round', 'atb_wait', 'atb_active'].includes(v.mode)) return v;
      return { mode: 'round' };
    } catch {
      return { mode: 'round' };
    }
  }

  write(value) {
    try {
      if (!this._storage) return false;
      const mode = ['round', 'atb_wait', 'atb_active'].includes(value?.mode) ? value.mode : 'round';
      this._storage.setItem(this._key, JSON.stringify({ mode }));
      return true;
    } catch {
      return false;
    }
  }
}
