/**
 * Higher-level asset lifecycle on top of TextureCache.
 * Does not replace TextureCache — registers images into it.
 */
export class AssetManager {
  /**
   * @param {object} [opts]
   * @param {import('../rendering/TextureCache.js').TextureCache} [opts.textures]
   * @param {(url: string) => Promise<CanvasImageSource>} [opts.imageLoader] - injectable for tests
   */
  constructor({ textures = null, imageLoader = null } = {}) {
    this.textures = textures;
    /** @type {Map<string, { type: string, src: string, status: string, error?: string }>} */
    this._registry = new Map();
    /** @type {Map<string, Promise<any>>} */
    this._pending = new Map();
    this._imageLoader = imageLoader;
    this._jsonCache = new Map();
  }

  /**
   * @param {string} id
   * @param {'image'|'json'} type
   * @param {string} src
   */
  register(id, type, src) {
    if (this._registry.has(id)) {
      throw new Error(`Asset "${id}" already registered`);
    }
    this._registry.set(id, { type, src, status: 'registered' });
  }

  /**
   * @param {string} id
   */
  getInfo(id) {
    return this._registry.get(id) ?? null;
  }

  get loadedCount() {
    let n = 0;
    for (const a of this._registry.values()) if (a.status === 'loaded') n += 1;
    return n;
  }

  get registeredCount() {
    return this._registry.size;
  }

  /**
   * @param {string} id
   */
  async load(id) {
    const info = this._registry.get(id);
    if (!info) return { ok: false, reason: 'unknown' };
    if (info.status === 'loaded') return { ok: true, cached: true };
    if (this._pending.has(id)) return this._pending.get(id);

    const promise = this._doLoad(id, info).finally(() => this._pending.delete(id));
    this._pending.set(id, promise);
    return promise;
  }

  async _doLoad(id, info) {
    info.status = 'loading';
    try {
      if (info.type === 'image') {
        const img = await this._loadImage(info.src);
        if (this.textures) this.textures.set(id, img);
        info.status = 'loaded';
        return { ok: true, asset: img };
      }
      if (info.type === 'json') {
        const data = await this._loadJson(info.src);
        this._jsonCache.set(id, data);
        info.status = 'loaded';
        return { ok: true, asset: data };
      }
      info.status = 'error';
      info.error = 'bad_type';
      return { ok: false, reason: 'bad_type' };
    } catch (err) {
      info.status = 'error';
      info.error = String(err?.message || err);
      return { ok: false, reason: info.error };
    }
  }

  _loadImage(src) {
    if (this._imageLoader) return this._imageLoader(src);
    return new Promise((resolve, reject) => {
      if (typeof Image === 'undefined') {
        reject(new Error('Image_unavailable'));
        return;
      }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`load_failed:${src}`));
      img.src = src;
    });
  }

  async _loadJson(src) {
    if (typeof fetch === 'undefined') throw new Error('fetch_unavailable');
    const res = await fetch(src);
    if (!res.ok) throw new Error(`http_${res.status}`);
    return res.json();
  }

  /**
   * @param {string[]} ids
   */
  async loadAll(ids) {
    const results = await Promise.all(ids.map((id) => this.load(id)));
    return {
      ok: results.every((r) => r.ok),
      results,
    };
  }

  /**
   * Get JSON asset.
   * @param {string} id
   */
  getJson(id) {
    return this._jsonCache.get(id) ?? null;
  }

  /**
   * Unload non-shared asset by id (removes from texture cache if present).
   * @param {string} id
   */
  unload(id) {
    const info = this._registry.get(id);
    if (!info) return;
    if (info.type === 'image' && this.textures?._images) {
      this.textures._images.delete(id);
    }
    this._jsonCache.delete(id);
    info.status = 'registered';
  }

  clear() {
    for (const id of [...this._registry.keys()]) this.unload(id);
    this._pending.clear();
  }
}
