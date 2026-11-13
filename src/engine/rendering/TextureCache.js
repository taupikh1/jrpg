/**
 * Minimal texture registry for Batch 2.
 * Does not touch browser globals — images are registered from platform/main.
 */
export class TextureCache {
  constructor() {
    /** @type {Map<string, CanvasImageSource>} */
    this._images = new Map();
  }

  /**
   * @param {string} key
   * @param {CanvasImageSource} image
   */
  set(key, image) {
    if (!key || !image) throw new Error('TextureCache.set requires key and image');
    this._images.set(key, image);
  }

  /**
   * @param {string} key
   * @returns {CanvasImageSource|null}
   */
  get(key) {
    return this._images.get(key) ?? null;
  }

  has(key) {
    return this._images.has(key);
  }

  clear() {
    this._images.clear();
  }

  get size() {
    return this._images.size;
  }
}
