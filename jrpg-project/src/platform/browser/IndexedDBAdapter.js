/**
 * Browser IndexedDB adapter. Keep out of core gameplay imports.
 */
const DB_NAME = 'jrpg_saves';
const STORE = 'slots';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB_unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error || new Error('idb_open_failed'));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'slotId' });
      }
    };
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('aborted'));
  });
}

export class IndexedDBAdapter {
  async isAvailable() {
    try {
      if (typeof indexedDB === 'undefined') return false;
      const db = await openDb();
      db.close();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @param {string} slotId
   * @param {object} data
   */
  async put(slotId, data) {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ ...data, slotId });
      await txDone(tx);
      db.close();
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: String(err?.message || err) };
    }
  }

  /**
   * @param {string} slotId
   */
  async get(slotId) {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(slotId);
      const data = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      await txDone(tx);
      db.close();
      if (!data) return { ok: false, reason: 'not_found' };
      return { ok: true, data };
    } catch (err) {
      return { ok: false, reason: String(err?.message || err) };
    }
  }

  /**
   * @param {string} slotId
   */
  async delete(slotId) {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(slotId);
      await txDone(tx);
      db.close();
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: String(err?.message || err) };
    }
  }

  async list() {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      const rows = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
      await txDone(tx);
      db.close();
      return {
        ok: true,
        slots: rows.map((data) => ({
          slotId: data.slotId,
          version: data.version,
          updatedAt: data.updatedAt,
          displayName: data.displayName,
          zoneId: data.player?.zoneId,
        })),
      };
    } catch (err) {
      return { ok: false, reason: String(err?.message || err), slots: [] };
    }
  }

  async clear() {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      await txDone(tx);
      db.close();
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: String(err?.message || err) };
    }
  }
}
