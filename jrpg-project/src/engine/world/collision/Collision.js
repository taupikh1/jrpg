/**
 * 2D collision primitives and tilemap queries.
 * No physics simulation — foundation for Batch 4 entities.
 */

/**
 * @typedef {Object} Rect
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 */

/**
 * @param {Rect} a
 * @param {Rect} b
 */
export function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * @param {number} px
 * @param {number} py
 * @param {Rect} r
 */
export function pointInRect(px, py, r) {
  return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
}

/**
 * @param {Rect} a
 * @param {Rect} b
 */
export function rectsEqual(a, b) {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

export class CollisionWorld {
  /**
   * @param {import('../tilemap/Tilemap.js').Tilemap} [tilemap]
   */
  constructor(tilemap = null) {
    this.tilemap = tilemap;
    /** @type {Rect[]} */
    this.staticObstacles = [];
    /** @type {{ id: string, rect: Rect, type: string, data?: object }[]} */
    this.triggers = [];
  }

  /**
   * @param {import('../tilemap/Tilemap.js').Tilemap|null} tilemap
   */
  setTilemap(tilemap) {
    this.tilemap = tilemap;
  }

  /**
   * @param {Rect} rect
   */
  addObstacle(rect) {
    this.staticObstacles.push({ ...rect });
  }

  /**
   * @param {string} id
   * @param {Rect} rect
   * @param {string} [type='trigger']
   * @param {object} [data]
   */
  addTrigger(id, rect, type = 'trigger', data = {}) {
    this.triggers.push({ id, rect: { ...rect }, type, data });
  }

  clear() {
    this.staticObstacles.length = 0;
    this.triggers.length = 0;
    this.tilemap = null;
  }

  /**
   * @param {number} wx
   * @param {number} wy
   */
  isWorldSolid(wx, wy) {
    if (!this.tilemap) return false;
    const { tx, ty } = this.tilemap.worldToTile(wx, wy);
    return this.tilemap.isSolid(tx, ty);
  }

  /**
   * Can a rectangle occupy this world position? (no solid tiles / obstacles)
   * @param {Rect} rect
   */
  isOccupiable(rect) {
    if (this.tilemap) {
      const x0 = Math.floor(rect.x / this.tilemap.tileWidth);
      const y0 = Math.floor(rect.y / this.tilemap.tileHeight);
      const x1 = Math.floor((rect.x + rect.w - 0.001) / this.tilemap.tileWidth);
      const y1 = Math.floor((rect.y + rect.h - 0.001) / this.tilemap.tileHeight);
      for (let ty = y0; ty <= y1; ty++) {
        for (let tx = x0; tx <= x1; tx++) {
          if (this.tilemap.isSolid(tx, ty)) return false;
        }
      }
    }
    for (const o of this.staticObstacles) {
      if (aabbOverlap(rect, o)) return false;
    }
    return true;
  }

  /**
   * Would moving from `from` by (dx,dy) with size (w,h) collide?
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {number} dx
   * @param {number} dy
   */
  wouldCollide(x, y, w, h, dx, dy) {
    return !this.isOccupiable({ x: x + dx, y: y + dy, w, h });
  }

  /**
   * Triggers overlapping a point.
   * @param {number} px
   * @param {number} py
   */
  triggersAt(px, py) {
    return this.triggers.filter((t) => pointInRect(px, py, t.rect));
  }

  /**
   * Triggers overlapping a rect.
   * @param {Rect} rect
   */
  triggersOverlapping(rect) {
    return this.triggers.filter((t) => aabbOverlap(rect, t.rect));
  }

  /**
   * World bounds from tilemap if present.
   * @returns {Rect|null}
   */
  getBounds() {
    if (!this.tilemap) return null;
    return {
      x: 0,
      y: 0,
      w: this.tilemap.pixelWidth,
      h: this.tilemap.pixelHeight,
    };
  }
}
