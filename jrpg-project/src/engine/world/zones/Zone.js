/**
 * Zone definition and runtime state.
 */

/**
 * @typedef {Object} SpawnPoint
 * @property {string} id
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} ZoneConnection
 * @property {string} id
 * @property {string} targetZoneId
 * @property {string} targetSpawnId
 * @property {{ x: number, y: number, w: number, h: number }} trigger
 * @property {boolean} [enabled=true]
 * @property {string} [type]
 */

/**
 * @typedef {Object} ZoneObject
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {number} [w]
 * @property {number} [h]
 * @property {string} [spriteKey]
 * @property {string} [layer]
 * @property {boolean} [solid]
 * @property {object} [props]
 */

/**
 * @typedef {Object} ZoneData
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {object} tilemap - TilemapData
 * @property {string} tilesetId
 * @property {SpawnPoint[]} spawnPoints
 * @property {ZoneConnection[]} [connections]
 * @property {ZoneObject[]} [objects]
 * @property {object} [env]
 */

export class Zone {
  /**
   * @param {ZoneData} data
   * @param {import('../tilemap/Tilemap.js').Tilemap} tilemap
   */
  constructor(data, tilemap) {
    if (!data?.id) throw new Error('Zone requires id');
    if (!tilemap) throw new Error('Zone requires tilemap');

    this.id = data.id;
    this.name = data.name || data.id;
    this.description = data.description || '';
    this.tilemap = tilemap;
    this.spawnPoints = Array.isArray(data.spawnPoints) ? data.spawnPoints.slice() : [];
    this.connections = Array.isArray(data.connections) ? data.connections.slice() : [];
    this.objects = Array.isArray(data.objects) ? data.objects.slice() : [];
    this.env = data.env || {};

    this.active = false;
    this.loaded = true;

    // Validate spawn points
    for (const sp of this.spawnPoints) {
      if (!sp.id || typeof sp.x !== 'number' || typeof sp.y !== 'number') {
        throw new Error(`Zone "${this.id}": invalid spawn point`);
      }
    }
    for (const c of this.connections) {
      if (!c.id || !c.targetZoneId || !c.targetSpawnId || !c.trigger) {
        throw new Error(`Zone "${this.id}": invalid connection`);
      }
    }
  }

  /**
   * @param {string} spawnId
   * @returns {SpawnPoint|null}
   */
  getSpawn(spawnId) {
    return this.spawnPoints.find((s) => s.id === spawnId) ?? null;
  }

  getDefaultSpawn() {
    return this.spawnPoints[0] ?? { id: 'default', x: 32, y: 32 };
  }

  get pixelWidth() {
    return this.tilemap.pixelWidth;
  }

  get pixelHeight() {
    return this.tilemap.pixelHeight;
  }
}
