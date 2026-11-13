/**
 * Central registry for entities. Safe removal during update.
 */
export class EntityManager {
  constructor() {
    /** @type {Map<string, import('./Entity.js').Entity>} */
    this._byId = new Map();
    /** @type {import('./Entity.js').Entity[]} */
    this._list = [];
    /** @type {Set<string>} */
    this._pendingRemove = new Set();
    this._updating = false;
  }

  get count() {
    return this._list.length;
  }

  /**
   * @param {import('./Entity.js').Entity} entity
   */
  add(entity) {
    if (this._byId.has(entity.id)) {
      throw new Error(`EntityManager: duplicate id "${entity.id}"`);
    }
    this._byId.set(entity.id, entity);
    this._list.push(entity);
    return entity;
  }

  /**
   * @param {string} id
   */
  get(id) {
    return this._byId.get(id) ?? null;
  }

  /**
   * @param {string} type
   */
  getByType(type) {
    return this._list.filter((e) => e.type === type && !e.destroyed);
  }

  /**
   * @param {string} id
   */
  remove(id) {
    if (this._updating) {
      this._pendingRemove.add(id);
      return;
    }
    this._removeNow(id);
  }

  _removeNow(id) {
    const e = this._byId.get(id);
    if (!e) return;
    e.destroy();
    this._byId.delete(id);
    this._list = this._list.filter((x) => x.id !== id);
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    this._updating = true;
    for (const e of this._list) {
      if (!e.destroyed && e.active) e.update(dt);
    }
    this._updating = false;
    if (this._pendingRemove.size) {
      for (const id of this._pendingRemove) this._removeNow(id);
      this._pendingRemove.clear();
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('../rendering/Camera.js').Camera} camera
   */
  render(ctx, camera, extras = null) {
    // Y-sort for depth. `extras` are non-entity drawables ({ y, draw(ctx) }) such as static props.
    const visible = this._list
      .filter((e) => e.visible && !e.destroyed)
      .sort((a, b) => a.y - b.y);
    const items = extras?.length
      ? [...visible, ...extras.map((x) => ({ y: x.y, _extra: x }))].sort((a, b) => a.y - b.y)
      : visible;
    for (const e of items) {
      if (e._extra) {
        e._extra.draw(ctx);
        continue;
      }
      if (camera && !camera.isVisible(e.x - e.w, e.y - e.h, e.w * 2, e.h * 2, 16)) continue;
      e.render(ctx, camera);
    }
  }

  /**
   * Remove all entities (e.g. zone unload).
   */
  clear() {
    for (const e of this._list) e.destroy();
    this._byId.clear();
    this._list = [];
    this._pendingRemove.clear();
  }

  /**
   * Clear entities belonging to a zone.
   * @param {string} zoneId
   */
  clearZone(zoneId) {
    const ids = this._list.filter((e) => e.zoneId === zoneId).map((e) => e.id);
    for (const id of ids) this._removeNow(id);
  }

  all() {
    return this._list.filter((e) => !e.destroyed);
  }
}
