/**
 * Canvas render surface + integer scaling / letterboxing for pixel art.
 * Does not import from core (except via constructor args from composition root).
 * @implements {import('../../core/ports/RenderSurfacePort.js').RenderSurfacePort}
 */
export class CanvasSurface {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} opts
   * @param {number} opts.logicalWidth
   * @param {number} opts.logicalHeight
   */
  constructor(canvas, opts) {
    if (!opts || !opts.logicalWidth || !opts.logicalHeight) {
      throw new TypeError('CanvasSurface requires logicalWidth and logicalHeight');
    }
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d', { alpha: false });
    this._baseLogicalW = opts.logicalWidth;
    this._baseLogicalH = opts.logicalHeight;
    this._logicalW = opts.logicalWidth;
    this._logicalH = opts.logicalHeight;
    this._scale = 1;
    this._offsetX = 0;
    this._offsetY = 0;

    if (this._ctx) {
      this._ctx.imageSmoothingEnabled = false;
    }

    this.setLogicalSize(this._logicalW, this._logicalH);
  }

  getContext2D() {
    return this._ctx;
  }

  getCssSize() {
    return {
      width: this._canvas.clientWidth,
      height: this._canvas.clientHeight,
    };
  }

  getElement() {
    return this._canvas;
  }

  setLogicalSize(w, h) {
    this._logicalW = w;
    this._logicalH = h;
    this._canvas.width = w;
    this._canvas.height = h;
    if (this._ctx) {
      this._ctx.imageSmoothingEnabled = false;
    }
  }

  /**
   * Fit an aspect-adaptive logical viewport into the available CSS area.
   * @param {number} cssW
   * @param {number} cssH
   */
  fitTo(cssW, cssH) {
    // Keep the base 4:3 viewport in portrait; expand the logical width in landscape.
    // This preserves square pixels while allowing the camera to reveal more world.
    const cssAspect = cssW > 0 && cssH > 0 ? cssW / cssH : this._baseLogicalW / this._baseLogicalH;
    const minAspect = this._baseLogicalW / this._baseLogicalH;
    const responsiveAspect = Math.max(minAspect, Math.min(2.2, cssAspect));
    const responsiveWidth = Math.max(this._baseLogicalW, Math.round(this._baseLogicalH * responsiveAspect));
    if (responsiveWidth !== this._logicalW || this._baseLogicalH !== this._logicalH) {
      this.setLogicalSize(responsiveWidth, this._baseLogicalH);
    }

    // Fractional fit gives the largest picture on phones. Integer scaling is kept when it
    // is 2x or larger (typical desktop), so pixels stay square there.
    const fit = Math.min(cssW / this._logicalW, cssH / this._logicalH);
    const whole = Math.floor(fit);
    const responsiveLandscape = this._logicalW > this._baseLogicalW;
    const scale = Math.max(0.25, responsiveLandscape ? fit : whole >= 2 ? whole : fit);

    const displayW = this._logicalW * scale;
    const displayH = this._logicalH * scale;
    const offsetX = Math.floor((cssW - displayW) / 2);
    const offsetY = Math.floor((cssH - displayH) / 2);

    this._scale = scale;
    this._offsetX = offsetX;
    this._offsetY = offsetY;

    this._canvas.style.width = `${displayW}px`;
    this._canvas.style.height = `${displayH}px`;
    this._canvas.style.marginLeft = `${offsetX}px`;
    this._canvas.style.marginTop = `${offsetY}px`;
    this._canvas.style.imageRendering = 'pixelated';
  }

  setDisplayTransform(scale, offsetX, offsetY) {
    this._scale = scale;
    this._offsetX = offsetX;
    this._offsetY = offsetY;
  }

  /**
   * Convert client (CSS) coordinates to logical canvas coordinates.
   * @param {number} clientX
   * @param {number} clientY
   * @returns {{ x: number, y: number }}
   */
  clientToLogical(clientX, clientY) {
    const rect = this._canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * this._logicalW;
    const y = ((clientY - rect.top) / rect.height) * this._logicalH;
    return { x, y };
  }

  get scale() {
    return this._scale;
  }

  get logicalWidth() {
    return this._logicalW;
  }

  get logicalHeight() {
    return this._logicalH;
  }
}
