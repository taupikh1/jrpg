/**
 * 2D camera: world ↔ screen, bounds, follow, shake, zoom.
 * Does not mutate world object positions.
 */

/**
 * @typedef {Object} CameraTarget
 * @property {number} x
 * @property {number} y
 */

export class Camera {
  /**
   * @param {object} [opts]
   * @param {number} [opts.viewportWidth=480]
   * @param {number} [opts.viewportHeight=270]
   * @param {number} [opts.x=0]
   * @param {number} [opts.y=0]
   * @param {number} [opts.zoom=1]
   */
  constructor(opts = {}) {
    this.viewportWidth = opts.viewportWidth ?? 480;
    this.viewportHeight = opts.viewportHeight ?? 270;
    this.x = opts.x ?? 0;
    this.y = opts.y ?? 0;
    this.zoom = opts.zoom ?? 1;

    /** @type {{ minX: number, minY: number, maxX: number, maxY: number }|null} */
    this.bounds = null;

    /** @type {CameraTarget|null} */
    this._followTarget = null;
    this.followLerp = 0.12;
    this.deadZoneW = 40;
    this.deadZoneH = 24;

    this._shakeTime = 0;
    this._shakeDuration = 0;
    this._shakeIntensity = 0;
    this._shakeOffsetX = 0;
    this._shakeOffsetY = 0;
  }

  /**
   * @param {number} minX
   * @param {number} minY
   * @param {number} maxX
   * @param {number} maxY
   */
  setBounds(minX, minY, maxX, maxY) {
    this.bounds = { minX, minY, maxX, maxY };
    this._clampToBounds();
  }

  clearBounds() {
    this.bounds = null;
  }

  /** Update the visible logical viewport after a responsive canvas resize. */
  setViewportSize(width, height) {
    this.viewportWidth = Math.max(1, Number(width) || 1);
    this.viewportHeight = Math.max(1, Number(height) || 1);
    this._clampToBounds();
  }

  /**
   * @param {CameraTarget|null} target
   */
  follow(target) {
    this._followTarget = target;
  }

  /**
   * Instant move (no lerp).
   * @param {number} x
   * @param {number} y
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this._clampToBounds();
  }

  /**
   * @param {number} z
   */
  setZoom(z) {
    this.zoom = Math.max(0.25, Math.min(4, z));
    this._clampToBounds();
  }

  /**
   * @param {number} intensity - pixels
   * @param {number} duration - seconds
   */
  shake(intensity, duration) {
    this._shakeIntensity = intensity;
    this._shakeDuration = duration;
    this._shakeTime = duration;
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    if (this._followTarget) {
      this._updateFollow(dt);
    }

    if (this._shakeTime > 0) {
      this._shakeTime -= dt;
      const t = Math.max(0, this._shakeTime / this._shakeDuration);
      const mag = this._shakeIntensity * t;
      this._shakeOffsetX = (Math.random() * 2 - 1) * mag;
      this._shakeOffsetY = (Math.random() * 2 - 1) * mag;
      if (this._shakeTime <= 0) {
        this._shakeOffsetX = 0;
        this._shakeOffsetY = 0;
      }
    }
  }

  _updateFollow() {
    const target = this._followTarget;
    if (!target) return;

    const halfW = this.viewportWidth / (2 * this.zoom);
    const halfH = this.viewportHeight / (2 * this.zoom);
    const camCenterX = this.x + halfW;
    const camCenterY = this.y + halfH;

    let dx = target.x - camCenterX;
    let dy = target.y - camCenterY;

    // Dead zone
    if (Math.abs(dx) < this.deadZoneW / 2) dx = 0;
    else dx -= Math.sign(dx) * (this.deadZoneW / 2);
    if (Math.abs(dy) < this.deadZoneH / 2) dy = 0;
    else dy -= Math.sign(dy) * (this.deadZoneH / 2);

    this.x += dx * this.followLerp;
    this.y += dy * this.followLerp;
    this._clampToBounds();
  }

  _clampToBounds() {
    if (!this.bounds) return;
    const viewW = this.viewportWidth / this.zoom;
    const viewH = this.viewportHeight / this.zoom;
    const boundsW = Math.max(0, this.bounds.maxX - this.bounds.minX);
    const boundsH = Math.max(0, this.bounds.maxY - this.bounds.minY);
    if (viewW >= boundsW) this.x = this.bounds.minX - (viewW - boundsW) / 2;
    else this.x = Math.min(Math.max(this.x, this.bounds.minX), this.bounds.maxX - viewW);
    if (viewH >= boundsH) this.y = this.bounds.minY - (viewH - boundsH) / 2;
    else this.y = Math.min(Math.max(this.y, this.bounds.minY), this.bounds.maxY - viewH);
  }

  /** Top-left of visible world area including shake */
  get viewX() {
    return this.x + this._shakeOffsetX;
  }

  get viewY() {
    return this.y + this._shakeOffsetY;
  }

  get viewWidth() {
    return this.viewportWidth / this.zoom;
  }

  get viewHeight() {
    return this.viewportHeight / this.zoom;
  }

  /**
   * @param {number} worldX
   * @param {number} worldY
   * @returns {{ x: number, y: number }}
   */
  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.viewX) * this.zoom,
      y: (worldY - this.viewY) * this.zoom,
    };
  }

  /**
   * @param {number} screenX
   * @param {number} screenY
   * @returns {{ x: number, y: number }}
   */
  screenToWorld(screenX, screenY) {
    return {
      x: screenX / this.zoom + this.viewX,
      y: screenY / this.zoom + this.viewY,
    };
  }

  /**
   * Axis-aligned visibility test for a world-space AABB.
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {number} [margin=0]
   */
  isVisible(x, y, w, h, margin = 0) {
    const vx = this.viewX - margin;
    const vy = this.viewY - margin;
    const vw = this.viewWidth + margin * 2;
    const vh = this.viewHeight + margin * 2;
    return x + w > vx && x < vx + vw && y + h > vy && y < vy + vh;
  }

  /**
   * Apply camera transform to context (call inside save/restore).
   * @param {CanvasRenderingContext2D} ctx
   */
  applyTransform(ctx) {
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.viewX, -this.viewY);
  }
}
