/**
 * In-memory storage adapter for tests (no IndexedDB).
 * Implements same interface as IndexedDBAdapter.
 */
export class MemoryStorageAdapter {
  constructor() {
    /** @type {Map<string, object>} */
    this._store = new Map();
  }

  async isAvailable() {
    return true;
  }

  /**
   * @param {string} slotId
   * @param {object} data
   */
  async put(slotId, data) {
    this._store.set(slotId, structuredClone ? structuredClone(data) : JSON.parse(JSON.stringify(data)));
    return { ok: true };
  }

  /**
   * @param {string} slotId
   */
  async get(slotId) {
    if (!this._store.has(slotId)) return { ok: false, reason: 'not_found' };
    const data = this._store.get(slotId);
    return {
      ok: true,
      data: structuredClone ? structuredClone(data) : JSON.parse(JSON.stringify(data)),
    };
  }

  /**
   * @param {string} slotId
   */
  async delete(slotId) {
    this._store.delete(slotId);
    return { ok: true };
  }

  async list() {
    return {
      ok: true,
      slots: [...this._store.entries()].map(([slotId, data]) => ({
        slotId,
        version: data.version,
        updatedAt: data.updatedAt,
        displayName: data.displayName,
        zoneId: data.player?.zoneId,
      })),
    };
  }

  async clear() {
    this._store.clear();
    return { ok: true };
  }
}
