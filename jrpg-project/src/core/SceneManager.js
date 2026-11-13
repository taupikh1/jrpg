/**
 * Scene lifecycle manager.
 * Scenes may implement: init?, enter?, update(dt)?, render(ctx, alpha)?, exit?, destroy?
 */
export class SceneManager {
  constructor() {
    /** @type {Map<string, object>} */
    this._scenes = new Map();
    /** @type {string|null} */
    this._currentKey = null;
    /** @type {object|null} */
    this._current = null;
    this._switching = false;
  }

  /**
   * @param {string} key
   * @param {object} scene
   */
  register(key, scene) {
    if (!key || typeof key !== 'string') throw new TypeError('Scene key must be a non-empty string');
    if (!scene || typeof scene !== 'object') throw new TypeError('Scene must be an object');
    if (this._scenes.has(key)) {
      throw new Error(`Scene "${key}" is already registered`);
    }
    this._scenes.set(key, scene);
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this._scenes.has(key);
  }

  get currentKey() {
    return this._currentKey;
  }

  get current() {
    return this._current;
  }

  /**
   * Switch to a registered scene. Calls exit on previous, enter on new.
   * @param {string} key
   * @param {object} [data]
   */
  async switchTo(key, data = {}) {
    if (this._switching) {
      console.warn('[SceneManager] Switch already in progress, ignoring');
      return;
    }
    if (!this._scenes.has(key)) {
      throw new Error(`Scene "${key}" is not registered`);
    }
    if (this._currentKey === key) return;

    this._switching = true;
    try {
      const next = this._scenes.get(key);

      if (this._current && typeof this._current.exit === 'function') {
        await this._current.exit();
      }

      this._current = next;
      this._currentKey = key;

      if (typeof next.init === 'function' && !next.__initialized) {
        await next.init(data);
        next.__initialized = true;
      }
      if (typeof next.enter === 'function') {
        await next.enter(data);
      }
    } finally {
      this._switching = false;
    }
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    if (this._current && typeof this._current.update === 'function') {
      this._current.update(dt);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} alpha
   */
  render(ctx, alpha) {
    if (this._current && typeof this._current.render === 'function') {
      this._current.render(ctx, alpha);
    }
  }

  /**
   * Destroy a scene or all scenes.
   * @param {string} [key]
   */
  async destroy(key) {
    if (key === undefined) {
      if (this._current && typeof this._current.destroy === 'function') {
        await this._current.destroy();
      }
      for (const scene of this._scenes.values()) {
        if (typeof scene.destroy === 'function' && scene !== this._current) {
          await scene.destroy();
        }
      }
      this._scenes.clear();
      this._current = null;
      this._currentKey = null;
      return;
    }

    const scene = this._scenes.get(key);
    if (!scene) return;
    if (this._currentKey === key) {
      if (typeof scene.exit === 'function') await scene.exit();
      this._current = null;
      this._currentKey = null;
    }
    if (typeof scene.destroy === 'function') await scene.destroy();
    this._scenes.delete(key);
  }
}
