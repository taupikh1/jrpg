/**
 * Tileset definition — maps tile IDs to source rects and metadata.
 */

/**
 * @typedef {Object} TileMeta
 * @property {boolean} [solid=false]
 * @property {number} [cost=1]
 * @property {string} [terrain]
 * @property {object} [props]
 */

/**
 * @typedef {Object} TilesetData
 * @property {string} id
 * @property {number} tileWidth
 * @property {number} tileHeight
 * @property {number} columns
 * @property {number} tileCount
 * @property {string} [imageKey]
 * @property {Record<string, TileMeta>} [tiles]
 */

export class Tileset {
  /**
   * @param {TilesetData} data
   */
  constructor(data) {
    if (!data?.id) throw new Error('Tileset requires id');
    if (!data.tileWidth || !data.tileHeight) throw new Error('Tileset requires tileWidth/tileHeight');
    if (!data.columns || data.columns < 1) throw new Error('Tileset requires columns >= 1');
    if (!data.tileCount || data.tileCount < 1) throw new Error('Tileset requires tileCount >= 1');

    this.id = data.id;
    this.tileWidth = data.tileWidth;
    this.tileHeight = data.tileHeight;
    this.columns = data.columns;
    this.tileCount = data.tileCount;
    this.imageKey = data.imageKey ?? null;
    /** @type {Map<number, TileMeta>} */
    this._meta = new Map();

    if (data.tiles) {
      for (const [k, v] of Object.entries(data.tiles)) {
        const id = Number(k);
        if (!Number.isInteger(id) || id < 0 || id >= this.tileCount) {
          throw new Error(`Tileset "${this.id}": invalid tile id ${k}`);
        }
        this._meta.set(id, {
          solid: !!v.solid,
          cost: v.cost ?? 1,
          terrain: v.terrain,
          props: v.props,
        });
      }
    }
  }

  /**
   * Source rect for tile id (0-based).
   * @param {number} tileId
   * @returns {{ sx: number, sy: number, sw: number, sh: number }|null}
   */
  getSourceRect(tileId) {
    if (!Number.isInteger(tileId) || tileId < 0 || tileId >= this.tileCount) return null;
    const col = tileId % this.columns;
    const row = Math.floor(tileId / this.columns);
    return {
      sx: col * this.tileWidth,
      sy: row * this.tileHeight,
      sw: this.tileWidth,
      sh: this.tileHeight,
    };
  }

  /**
   * @param {number} tileId
   * @returns {TileMeta}
   */
  getMeta(tileId) {
    return (
      this._meta.get(tileId) ?? {
        solid: false,
        cost: 1,
      }
    );
  }

  isSolid(tileId) {
    return !!this.getMeta(tileId).solid;
  }

  getCost(tileId) {
    const c = this.getMeta(tileId).cost;
    return c > 0 ? c : 1;
  }
}
