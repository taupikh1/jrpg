/**
 * Ordered render layers with optional parallax and y-sorting.
 */

/**
 * @typedef {Object} RenderItem
 * @property {number} x
 * @property {number} y
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [depth] - explicit z; if absent and ySort, uses y
 * @property {(ctx: CanvasRenderingContext2D, camera: import('./Camera.js').Camera) => void} draw
 * @property {boolean} [visible]
 */

/**
 * @typedef {Object} LayerDef
 * @property {string} name
 * @property {number} order
 * @property {boolean} [screenSpace=false] - true = UI, ignore camera
 * @property {number} [parallax=1] - 0 = fixed, 1 = normal, <1 = slower
 * @property {boolean} [ySort=false]
 * @property {boolean} [visible=true]
 * @property {number} [opacity=1]
 */

export class LayerManager {
  constructor() {
    /** @type {Map<string, { def: LayerDef, items: RenderItem[] }>} */
    this._layers = new Map();
    /** @type {LayerDef[]} */
    this._order = [];
  }

  /**
   * @param {LayerDef} def
   */
  register(def) {
    if (!def?.name) throw new Error('Layer requires name');
    if (this._layers.has(def.name)) {
      throw new Error(`Layer "${def.name}" already registered`);
    }
    const normalized = {
      name: def.name,
      order: def.order ?? 0,
      screenSpace: !!def.screenSpace,
      parallax: def.parallax ?? 1,
      ySort: !!def.ySort,
      visible: def.visible !== false,
      opacity: def.opacity ?? 1,
    };
    this._layers.set(def.name, { def: normalized, items: [] });
    this._rebuildOrder();
  }

  _rebuildOrder() {
    this._order = [...this._layers.values()]
      .map((l) => l.def)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * @param {string} name
   * @param {RenderItem} item
   */
  add(name, item) {
    const layer = this._layers.get(name);
    if (!layer) throw new Error(`Layer "${name}" not found`);
    layer.items.push(item);
  }

  /**
   * @param {string} name
   */
  clearLayer(name) {
    const layer = this._layers.get(name);
    if (layer) layer.items.length = 0;
  }

  clearAll() {
    for (const layer of this._layers.values()) {
      layer.items.length = 0;
    }
  }

  /**
   * @param {string} name
   * @param {boolean} visible
   */
  setVisible(name, visible) {
    const layer = this._layers.get(name);
    if (layer) layer.def.visible = visible;
  }

  /**
   * @param {string} name
   * @param {number} opacity
   */
  setOpacity(name, opacity) {
    const layer = this._layers.get(name);
    if (layer) layer.def.opacity = opacity;
  }

  getLayerNames() {
    return this._order.map((d) => d.name);
  }

  /**
   * Render all visible layers in order.
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./Camera.js').Camera} camera
   */
  render(ctx, camera) {
    for (const def of this._order) {
      if (!def.visible || def.opacity <= 0) continue;
      const { items } = this._layers.get(def.name);

      let sorted = items;
      if (def.ySort && items.length > 1) {
        sorted = items.slice().sort((a, b) => {
          const da = a.depth ?? a.y ?? 0;
          const db = b.depth ?? b.y ?? 0;
          return da - db;
        });
      }

      ctx.save();
      try {
        ctx.globalAlpha = def.opacity;

        if (!def.screenSpace) {
          // Parallax: shift camera origin
          const px = camera.viewX * def.parallax;
          const py = camera.viewY * def.parallax;
          ctx.scale(camera.zoom, camera.zoom);
          ctx.translate(-px, -py);
        }

        for (const item of sorted) {
          if (item.visible === false) continue;
          if (!def.screenSpace) {
            const w = item.width ?? 16;
            const h = item.height ?? 16;
            // Culling in parallax space is approximate; use camera with parallax offset
            const cullCam = {
              viewX: camera.viewX * def.parallax,
              viewY: camera.viewY * def.parallax,
              viewWidth: camera.viewWidth,
              viewHeight: camera.viewHeight,
              isVisible(x, y, iw, ih, margin = 8) {
                return (
                  x + iw > this.viewX - margin &&
                  x < this.viewX + this.viewWidth + margin &&
                  y + ih > this.viewY - margin &&
                  y < this.viewY + this.viewHeight + margin
                );
              },
            };
            if (!cullCam.isVisible(item.x, item.y, w, h)) continue;
          }
          item.draw(ctx, camera);
        }
      } finally {
        ctx.restore();
      }
    }
  }
}

/** Default JRPG layer stack */
export const DEFAULT_LAYERS = [
  { name: 'background', order: 0, parallax: 0.3 },
  { name: 'ground', order: 10, parallax: 1 },
  { name: 'ground_decals', order: 20, parallax: 1 },
  { name: 'world_objects', order: 30, parallax: 1, ySort: true },
  { name: 'characters', order: 40, parallax: 1, ySort: true },
  { name: 'foreground', order: 50, parallax: 1.15 },
  { name: 'vfx', order: 60, parallax: 1 },
  { name: 'ui', order: 100, screenSpace: true },
];
