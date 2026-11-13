/**
 * Stateless sprite drawing helpers for Canvas 2D.
 * Does not own game logic. Safe save/restore per draw.
 */

/**
 * @typedef {Object} SpriteDrawOptions
 * @property {number} x - World or screen X (top-left unless anchor set)
 * @property {number} y
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [scaleX=1]
 * @property {number} [scaleY=1]
 * @property {number} [rotation=0] - Radians
 * @property {number} [opacity=1]
 * @property {number} [anchorX=0] - 0..1
 * @property {number} [anchorY=0]
 * @property {boolean} [flipX=false]
 * @property {boolean} [flipY=false]
 * @property {number} [sx] - Source rect
 * @property {number} [sy]
 * @property {number} [sw]
 * @property {number} [sh]
 * @property {string} [tint] - Optional fillStyle overlay (simple multiply-like via globalComposite)
 */

export class SpriteRenderer {
  /**
   * Draw an image/canvas with full transform support.
   * @param {CanvasRenderingContext2D} ctx
   * @param {CanvasImageSource} image
   * @param {SpriteDrawOptions} opts
   */
  static draw(ctx, image, opts) {
    if (!ctx || !image) return;

    const x = opts.x ?? 0;
    const y = opts.y ?? 0;
    const iw = /** @type {any} */ (image).width || 0;
    const ih = /** @type {any} */ (image).height || 0;
    const sw = opts.sw ?? iw;
    const sh = opts.sh ?? ih;
    const sx = opts.sx ?? 0;
    const sy = opts.sy ?? 0;
    const dw = opts.width ?? sw;
    const dh = opts.height ?? sh;
    const scaleX = opts.scaleX ?? 1;
    const scaleY = opts.scaleY ?? 1;
    const rotation = opts.rotation ?? 0;
    const opacity = opts.opacity ?? 1;
    const anchorX = opts.anchorX ?? 0;
    const anchorY = opts.anchorY ?? 0;
    const flipX = !!opts.flipX;
    const flipY = !!opts.flipY;

    if (opacity <= 0 || scaleX === 0 || scaleY === 0 || dw === 0 || dh === 0) return;

    ctx.save();
    try {
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

      const ox = dw * anchorX;
      const oy = dh * anchorY;

      ctx.translate(x, y);
      if (rotation !== 0) ctx.rotate(rotation);
      ctx.scale(flipX ? -scaleX : scaleX, flipY ? -scaleY : scaleY);

      const dx = flipX ? -dw + ox : -ox;
      const dy = flipY ? -dh + oy : -oy;

      if (opts.sx !== undefined || opts.sy !== undefined || opts.sw !== undefined || opts.sh !== undefined) {
        ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
      } else {
        ctx.drawImage(image, dx, dy, dw, dh);
      }
    } finally {
      ctx.restore();
    }
  }

  /**
   * Draw a solid rectangle (debug / placeholder).
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {string} color
   * @param {number} [opacity=1]
   */
  static fillRect(ctx, x, y, w, h, color, opacity = 1) {
    if (!ctx) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}
