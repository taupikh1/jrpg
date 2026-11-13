/**
 * Navigation grid derived from a Tilemap (or explicit walkability).
 */

export class NavGrid {
  /**
   * @param {number} width
   * @param {number} height
   * @param {(tx: number, ty: number) => number} costFn - returns Infinity if blocked
   */
  constructor(width, height, costFn) {
    if (width < 1 || height < 1) throw new Error('NavGrid requires positive size');
    this.width = width;
    this.height = height;
    this._costFn = costFn;
  }

  /**
   * Build from Tilemap collision layers.
   * @param {import('../tilemap/Tilemap.js').Tilemap} tilemap
   */
  static fromTilemap(tilemap) {
    return new NavGrid(tilemap.width, tilemap.height, (tx, ty) => tilemap.getCost(tx, ty));
  }

  /**
   * @param {number} tx
   * @param {number} ty
   */
  inBounds(tx, ty) {
    return tx >= 0 && ty >= 0 && tx < this.width && ty < this.height;
  }

  /**
   * @param {number} tx
   * @param {number} ty
   */
  isWalkable(tx, ty) {
    if (!this.inBounds(tx, ty)) return false;
    return this._costFn(tx, ty) < Infinity;
  }

  /**
   * @param {number} tx
   * @param {number} ty
   */
  getCost(tx, ty) {
    if (!this.inBounds(tx, ty)) return Infinity;
    return this._costFn(tx, ty);
  }
}
