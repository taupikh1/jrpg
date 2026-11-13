import { Zone } from './Zone.js';
import { Tilemap } from '../tilemap/Tilemap.js';
import { Tileset } from '../tileset/Tileset.js';
import { CollisionWorld } from '../collision/Collision.js';
import { NavGrid } from '../navigation/NavGrid.js';
import { TilemapRenderer } from '../tilemap/TilemapRenderer.js';
import { ZoneArt } from '../../rendering/pixelart/ZoneArt.js';
import { PixelArt } from '../../rendering/pixelart/PixelArt.js';

/**
 * Registers zones, loads/activates one at a time, handles transitions.
 */
export class ZoneManager {
  /**
   * @param {object} [opts]
   * @param {import('../../core/EventBus.js').EventBus} [opts.events]
   * @param {import('../../rendering/TextureCache.js').TextureCache} [opts.textures]
   */
  constructor({ events = null, textures = null } = {}) {
    this.events = events;
    this.textures = textures;
    /** Optional gate: (targetZoneId) => null when open, or a reason string when locked. */
    this.canEnter = null;

    /** @type {Map<string, object>} raw zone definitions */
    this._defs = new Map();
    /** @type {Map<string, Tileset>} */
    this._tilesets = new Map();
    /** @type {Zone|null} */
    this.activeZone = null;
    /** @type {CollisionWorld} */
    this.collision = new CollisionWorld();
    /** @type {NavGrid|null} */
    this.navGrid = null;
    /** @type {TilemapRenderer|null} */
    this.tileRenderer = null;
  }

  /**
   * @param {import('../tileset/Tileset.js').TilesetData} data
   */
  registerTileset(data) {
    const ts = new Tileset(data);
    this._tilesets.set(ts.id, ts);
    return ts;
  }

  /**
   * Store zone definition (not yet instantiated).
   * @param {import('./Zone.js').ZoneData} data
   */
  registerZone(data) {
    if (!data?.id) throw new Error('Zone def requires id');
    if (this._defs.has(data.id)) throw new Error(`Zone "${data.id}" already registered`);
    this._defs.set(data.id, data);
  }

  hasZone(id) {
    return this._defs.has(id);
  }

  /**
   * Build and activate a zone.
   * @param {string} zoneId
   * @param {string} [spawnId]
   * @returns {Zone}
   */
  activate(zoneId, spawnId) {
    const def = this._defs.get(zoneId);
    if (!def) throw new Error(`Zone "${zoneId}" not registered`);

    if (this.activeZone?.id === zoneId) {
      return this.activeZone;
    }

    // Cleanup previous
    if (this.activeZone) {
      this.deactivate();
    }

    const tileset = this._tilesets.get(def.tilesetId);
    if (!tileset) throw new Error(`Tileset "${def.tilesetId}" not found for zone "${zoneId}"`);

    const tilemap = new Tilemap(def.tilemap, tileset);
    const zone = new Zone(def, tilemap);

    this.collision.clear();
    this.collision.setTilemap(tilemap);

    // Static solid objects
    for (const obj of zone.objects) {
      if (obj.solid) {
        this.collision.addObstacle({
          x: obj.x,
          y: obj.y,
          w: obj.w ?? 16,
          h: obj.h ?? 16,
        });
      }
    }

    // Transition triggers
    for (const conn of zone.connections) {
      if (conn.enabled === false) continue;
      this.collision.addTrigger(conn.id, conn.trigger, 'zone_exit', {
        targetZoneId: conn.targetZoneId,
        targetSpawnId: conn.targetSpawnId,
        type: conn.type,
      });
    }

    this.navGrid = NavGrid.fromTilemap(tilemap);
    this.tileRenderer = PixelArt.ready
      ? new ZoneArt(tilemap, zoneId, PixelArt)
      : this.textures
        ? new TilemapRenderer(tilemap, this.textures)
        : new TilemapRenderer(tilemap, { get: () => null });

    zone.active = true;
    this.activeZone = zone;

    const spawn = spawnId ? zone.getSpawn(spawnId) : zone.getDefaultSpawn();
    if (this.events) {
      this.events.emit('zone:activated', { zone, spawn });
    }

    return zone;
  }

  deactivate() {
    if (!this.activeZone) return;
    const prev = this.activeZone;
    prev.active = false;
    this.collision.clear();
    this.navGrid = null;
    this.tileRenderer = null;
    this.activeZone = null;
    if (this.events) {
      this.events.emit('zone:deactivated', { zoneId: prev.id });
    }
  }

  /**
   * Transition to another zone via connection id or explicit ids.
   * @param {string} targetZoneId
   * @param {string} targetSpawnId
   * @returns {{ zone: Zone, spawn: object }}
   */
  transitionTo(targetZoneId, targetSpawnId) {
    if (!this._defs.has(targetZoneId)) {
      throw new Error(`Cannot transition: zone "${targetZoneId}" not registered`);
    }
    const zone = this.activate(targetZoneId, targetSpawnId);
    const spawn = zone.getSpawn(targetSpawnId) || zone.getDefaultSpawn();
    if (this.events) {
      this.events.emit('zone:transition', {
        zoneId: targetZoneId,
        spawnId: spawn.id,
        x: spawn.x,
        y: spawn.y,
      });
    }
    return { zone, spawn };
  }

  /**
   * Check triggers at position and auto-transition if zone_exit.
   * @param {number} x
   * @param {number} y
   * @returns {{ zone: Zone, spawn: object }|null}
   */
  tryTransitionAt(x, y) {
    const hits = this.collision.triggersAt(x, y);
    for (const t of hits) {
      if (t.type === 'zone_exit' && t.data?.targetZoneId) {
        const reason = this.canEnter ? this.canEnter(t.data.targetZoneId) : null;
        if (reason) return { blocked: true, reason, zoneId: t.data.targetZoneId };
        return this.transitionTo(t.data.targetZoneId, t.data.targetSpawnId);
      }
    }
    return null;
  }
}
