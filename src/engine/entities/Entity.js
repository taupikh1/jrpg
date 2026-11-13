/**
 * Lightweight entity with attachable components.
 * Not a full ECS — map of components by constructor name / key.
 */
let _nextId = 1;

export function resetEntityIdCounter(n = 1) {
  _nextId = n;
}

export class Entity {
  /**
   * @param {object} [opts]
   * @param {string} [opts.id]
   * @param {string} [opts.type='entity']
   * @param {number} [opts.x=0]
   * @param {number} [opts.y=0]
   * @param {number} [opts.w=12]
   * @param {number} [opts.h=12]
   */
  constructor(opts = {}) {
    this.id = opts.id ?? `e_${_nextId++}`;
    this.type = opts.type ?? 'entity';
    this.x = opts.x ?? 0;
    this.y = opts.y ?? 0;
    this.prevX = this.x;
    this.prevY = this.y;
    this.vx = 0;
    this.vy = 0;
    this.w = opts.w ?? 12;
    this.h = opts.h ?? 12;
    this.facing = opts.facing ?? 'down'; // up|down|left|right
    this.active = true;
    this.visible = true;
    this.destroyed = false;
    /** @type {Map<string, object>} */
    this._components = new Map();
    this.zoneId = opts.zoneId ?? null;
  }

  /**
   * @param {string} key
   * @param {object} component
   */
  add(key, component) {
    if (this._components.has(key)) {
      throw new Error(`Entity ${this.id}: component "${key}" already attached`);
    }
    this._components.set(key, component);
    if (typeof component.onAttach === 'function') component.onAttach(this);
    return component;
  }

  /**
   * @param {string} key
   */
  get(key) {
    return this._components.get(key) ?? null;
  }

  /**
   * @param {string} key
   */
  has(key) {
    return this._components.has(key);
  }

  /**
   * @param {string} key
   */
  remove(key) {
    const c = this._components.get(key);
    if (!c) return;
    if (typeof c.onDetach === 'function') c.onDetach(this);
    this._components.delete(key);
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    if (!this.active || this.destroyed) return;
    this.prevX = this.x;
    this.prevY = this.y;
    for (const c of this._components.values()) {
      if (typeof c.update === 'function') c.update(dt, this);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('../rendering/Camera.js').Camera} camera
   */
  render(ctx, camera) {
    if (!this.visible || this.destroyed) return;
    for (const c of this._components.values()) {
      if (typeof c.render === 'function') c.render(ctx, this, camera);
    }
  }

  destroy() {
    if (this.destroyed) return;
    for (const key of [...this._components.keys()]) {
      this.remove(key);
    }
    this.active = false;
    this.destroyed = true;
  }

  getBounds() {
    return {
      x: this.x - this.w / 2,
      y: this.y - this.h / 2,
      w: this.w,
      h: this.h,
    };
  }
}
