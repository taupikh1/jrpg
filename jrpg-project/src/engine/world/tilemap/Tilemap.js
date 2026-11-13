/**
 * Multi-layer tilemap backed by typed arrays for memory efficiency.
 * Tile value 0 = empty. Positive IDs map into the associated tileset.
 */

/**
 * @typedef {Object} TileLayerData
 * @property {string} name
 * @property {number[]} data - row-major, length = width * height
 * @property {boolean} [visible=true]
 * @property {number} [opacity=1]
 * @property {boolean} [collision=false] - if true, solids from this layer contribute to collision
 */

/**
 * @typedef {Object} TilemapData
 * @property {string} id
 * @property {number} width
 * @property {number} height
 * @property {number} tileWidth
 * @property {number} tileHeight
 * @property {string} tilesetId
 * @property {TileLayerData[]} layers
 */

export class Tilemap {
  /**
   * @param {TilemapData} data
   * @param {import('../tileset/Tileset.js').Tileset} tileset
   */
  constructor(data, tileset) {
    if (!data?.id) throw new Error('Tilemap requires id');
    if (!data.width || !data.height) throw new Error('Tilemap requires width/height');
    if (!tileset) throw new Error('Tilemap requires tileset');
    if (data.tilesetId && data.tilesetId !== tileset.id) {
      throw new Error(`Tilemap tilesetId "${data.tilesetId}" != tileset "${tileset.id}"`);
    }

    this.id = data.id;
    this.width = data.width;
    this.height = data.height;
    this.tileWidth = data.tileWidth || tileset.tileWidth;
    this.tileHeight = data.tileHeight || tileset.tileHeight;
    this.tileset = tileset;
    this.pixelWidth = this.width * this.tileWidth;
    this.pixelHeight = this.height * this.tileHeight;

    /** @type {{ name: string, data: Uint16Array, visible: boolean, opacity: number, collision: boolean }[]} */
    this.layers = [];

    if (!Array.isArray(data.layers) || data.layers.length === 0) {
      throw new Error(`Tilemap "${this.id}": requires at least one layer`);
    }

    const expected = this.width * this.height;
    for (const layer of data.layers) {
      if (!layer.name) throw new Error('Tile layer requires name');
      if (!Array.isArray(layer.data) || layer.data.length !== expected) {
        throw new Error(
          `Layer "${layer.name}": data length ${layer.data?.length} != ${expected}`
        );
      }
      const arr = new Uint16Array(expected);
      for (let i = 0; i < expected; i++) {
        const v = layer.data[i] | 0;
        if (v < 0 || v > tileset.tileCount) {
          throw new Error(`Layer "${layer.name}": tile id ${v} out of range`);
        }
        arr[i] = v;
      }
      this.layers.push({
        name: layer.name,
        data: arr,
        visible: layer.visible !== false,
        opacity: layer.opacity ?? 1,
        collision: !!layer.collision,
      });
    }
  }

  /**
   * @param {number} tx
   * @param {number} ty
   */
  inBounds(tx, ty) {
    return tx >= 0 && ty >= 0 && tx < this.width && ty < this.height;
  }

  /**
   * @param {string} layerName
   * @param {number} tx
   * @param {number} ty
   * @returns {number} tile id or 0
   */
  getTile(layerName, tx, ty) {
    if (!this.inBounds(tx, ty)) return 0;
    const layer = this.layers.find((l) => l.name === layerName);
    if (!layer) return 0;
    return layer.data[ty * this.width + tx];
  }

  /**
   * First solid tile across collision layers at cell.
   * @param {number} tx
   * @param {number} ty
   * @returns {boolean}
   */
  isSolid(tx, ty) {
    if (!this.inBounds(tx, ty)) return true; // out of bounds = blocked
    const idx = ty * this.width + tx;
    for (const layer of this.layers) {
      if (!layer.collision) continue;
      const id = layer.data[idx];
      // data: 0 empty, 1..N → tileset index 0..N-1
      if (id > 0 && this.tileset.isSolid(id - 1)) return true;
    }
    return false;
  }

  /**
   * Movement cost at cell (max cost among collision-layer tiles, or 1).
   * @param {number} tx
   * @param {number} ty
   */
  getCost(tx, ty) {
    if (!this.inBounds(tx, ty)) return Infinity;
    if (this.isSolid(tx, ty)) return Infinity;
    const idx = ty * this.width + tx;
    let cost = 1;
    for (const layer of this.layers) {
      if (!layer.collision) continue;
      const id = layer.data[idx];
      if (id > 0) cost = Math.max(cost, this.tileset.getCost(id - 1));
    }
    return cost;
  }

  /**
   * World pixel → tile coords.
   * @param {number} wx
   * @param {number} wy
   */
  worldToTile(wx, wy) {
    return {
      tx: Math.floor(wx / this.tileWidth),
      ty: Math.floor(wy / this.tileHeight),
    };
  }

  /**
   * @param {number} tx
   * @param {number} ty
   */
  tileToWorld(tx, ty) {
    return {
      x: tx * this.tileWidth,
      y: ty * this.tileHeight,
    };
  }
}
