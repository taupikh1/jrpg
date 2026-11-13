import { hash2 } from './PixBuf.js';
import { TILE, themeForZone, M_N, M_E, M_S, M_W } from './TileArt.js';

/**
 * Draws a Tilemap using generated pixel-art tiles instead of flat colours.
 * It understands the tile ids used by the content data:
 *   1 grass, 2 path, 3 wall/solid mass, 4 water (stall in the market), 5 dirt, 6 forest grass
 */
const KIND = { 0: 'empty', 1: 'grass', 2: 'path', 3: 'wall', 4: 'water', 5: 'dirt', 6: 'grass' };

const GRASSY = new Set(['grass', 'empty']);

export class ZoneArt {
  /**
   * @param {import('../../world/tilemap/Tilemap.js').Tilemap} tilemap
   * @param {string} zoneId
   * @param {{ tile: (theme:string, spec:string)=>any }} library
   */
  constructor(tilemap, zoneId, library) {
    this.tilemap = tilemap;
    this.zoneId = zoneId;
    this.theme = themeForZone(zoneId);
    this.lib = library;
    this.market = zoneId === 'bellhaven_market';
    this.time = 0;
    this._regions = tilemap.layers.map((layer) => this._analyze(layer));
  }

  kindAt(layer, tx, ty) {
    const tm = this.tilemap;
    if (tx < 0 || ty < 0 || tx >= tm.width || ty >= tm.height) return 'out';
    const id = layer.data[ty * tm.width + tx];
    const k = KIND[id] ?? 'grass';
    if (k === 'water' && this.market) return 'stall';
    return k;
  }

  /** Label connected wall / stall masses so houses, shelves and tree lines can be told apart. */
  _analyze(layer) {
    const tm = this.tilemap;
    const info = new Map();
    const seen = new Set();
    for (let ty = 0; ty < tm.height; ty++) {
      for (let tx = 0; tx < tm.width; tx++) {
        const k = this.kindAt(layer, tx, ty);
        if (k !== 'wall' && k !== 'stall') continue;
        const idx = ty * tm.width + tx;
        if (seen.has(idx)) continue;
        const cells = [];
        const stack = [[tx, ty]];
        seen.add(idx);
        let touchesEdge = false;
        while (stack.length) {
          const [x, y] = stack.pop();
          cells.push([x, y]);
          if (x === 0 || y === 0 || x === tm.width - 1 || y === tm.height - 1) touchesEdge = true;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if (this.kindAt(layer, nx, ny) !== k) continue;
            const ni = ny * tm.width + nx;
            if (seen.has(ni)) continue;
            seen.add(ni);
            stack.push([nx, ny]);
          }
        }
        const xs = cells.map((c) => c[0]);
        const ys = cells.map((c) => c[1]);
        const x0 = Math.min(...xs);
        const y0 = Math.min(...ys);
        const w = Math.max(...xs) - x0 + 1;
        const h = Math.max(...ys) - y0 + 1;
        const roof = Math.floor(hash2(x0, y0, 11) * 4);
        for (const [x, y] of cells) {
          info.set(y * tm.width + x, { kind: k, border: k === 'wall' && touchesEdge, x0, y0, w, h, c: x - x0, r: y - y0, roof });
        }
      }
    }
    return info;
  }

  render(ctx, camera, marginTiles = 1, time = this.lib.time || 0) {
    const tm = this.tilemap;
    const fromTx = Math.floor(camera.viewX / tm.tileWidth) - marginTiles;
    const fromTy = Math.floor(camera.viewY / tm.tileHeight) - marginTiles;
    const toTx = Math.ceil((camera.viewX + camera.viewWidth) / tm.tileWidth) + marginTiles;
    const toTy = Math.ceil((camera.viewY + camera.viewHeight) / tm.tileHeight) + marginTiles;
    const startTx = Math.max(0, fromTx);
    const startTy = Math.max(0, fromTy);
    const endTx = Math.min(tm.width - 1, toTx);
    const endTy = Math.min(tm.height - 1, toTy);

    // Landscape screens are wider than most zones. Fill the area around the map so the
    // picture always covers the whole screen instead of leaving black bars.
    // (toTx / toTy overshoot by one tile; the outer pass uses the exact last visible tile.)
    const lastTx = toTx - 1;
    const lastTy = toTy - 1;
    if (fromTx < 0 || fromTy < 0 || lastTx > tm.width - 1 || lastTy > tm.height - 1) {
      this._drawOuter(ctx, fromTx, fromTy, lastTx, lastTy, time);
    }

    tm.layers.forEach((layer, li) => {
      if (!layer.visible || layer.opacity <= 0) return;
      ctx.save();
      try {
        ctx.globalAlpha = layer.opacity;
        for (let ty = startTy; ty <= endTy; ty++) {
          for (let tx = startTx; tx <= endTx; tx++) {
            if (layer.data[ty * tm.width + tx] <= 0) continue;
            this._drawTile(ctx, layer, li, tx, ty, tx * tm.tileWidth, ty * tm.tileHeight, time);
          }
        }
      } finally {
        ctx.restore();
      }
    });
  }

  /**
   * Cells outside the map copy the nearest edge cell of the base layer: solid border
   * (trees / walls) becomes a dense mass, and an open exit (path) keeps running outward.
   * The player can never walk here; collision treats out-of-bounds as blocked.
   */
  _drawOuter(ctx, fromTx, fromTy, toTx, toTy, time) {
    const tm = this.tilemap;
    const layer = tm.layers[0];
    if (!layer) return;
    ctx.save();
    try {
      ctx.globalAlpha = layer.opacity > 0 ? 1 : 0;
      for (let ty = fromTy; ty <= toTy; ty++) {
        for (let tx = fromTx; tx <= toTx; tx++) {
          if (tx >= 0 && ty >= 0 && tx < tm.width && ty < tm.height) continue;
          const cx = Math.min(tm.width - 1, Math.max(0, tx));
          const cy = Math.min(tm.height - 1, Math.max(0, ty));
          const wx = tx * tm.tileWidth;
          const wy = ty * tm.tileHeight;
          const kind = this.kindAt(layer, cx, cy);
          if (kind === 'wall' || kind === 'stall' || kind === 'out' || kind === 'empty') {
            this._drawDeepBorder(ctx, tx, ty, wx, wy);
          } else {
            this._drawTile(ctx, layer, 0, cx, cy, wx, wy, time);
          }
        }
      }
    } finally {
      ctx.restore();
    }
  }

  _drawDeepBorder(ctx, tx, ty, wx, wy) {
    const T = this.theme;
    const indoor = T === 'archive' || T === 'ruins';
    if (!indoor && T !== 'town') {
      // dense canopy, seamless between tiles
      this._put(ctx, `forest:${Math.floor(hash2(tx, ty, 9) * 3)}`, wx, wy);
      return;
    }
    // walls / interiors: the solid mass, shaded so it reads as out of reach
    this._put(ctx, `border:0:${Math.floor(hash2(tx, ty, 9) * 3)}`, wx, wy);
    ctx.save();
    try {
      ctx.globalAlpha = indoor ? 0.62 : 0.34;
      ctx.fillStyle = '#0d0a10';
      ctx.fillRect(wx, wy, this.tilemap.tileWidth, this.tilemap.tileHeight);
    } finally {
      ctx.restore();
    }
  }

  _put(ctx, spec, wx, wy) {
    const img = this.lib.tile(this.theme, spec);
    if (img) ctx.drawImage(img, wx, wy);
  }

  _variant(tx, ty, seed) {
    const h = hash2(tx, ty, seed);
    return h < 0.52 ? 0 : h < 0.72 ? 1 : h < 0.88 ? 2 : 3;
  }

  _drawTile(ctx, layer, li, tx, ty, wx, wy, time) {
    const kind = this.kindAt(layer, tx, ty);
    const base = li === 0;
    switch (kind) {
      case 'grass':
        this._put(ctx, `grass:${this._variant(tx, ty, 3)}`, wx, wy);
        break;
      case 'path':
      case 'dirt': {
        if (!base) this._put(ctx, `grass:${this._variant(tx, ty, 3)}`, wx, wy);
        this._put(ctx, `${kind}:${hash2(tx, ty, 5) < 0.7 ? 0 : 1}`, wx, wy);
        this._edges(ctx, layer, kind, tx, ty, wx, wy);
        break;
      }
      case 'water': {
        const frame = Math.floor(time * 2.2) % 4;
        this._put(ctx, `water:${frame}`, wx, wy);
        this._waterEdges(ctx, layer, tx, ty, wx, wy);
        break;
      }
      case 'wall':
        this._drawWall(ctx, layer, li, tx, ty, wx, wy);
        break;
      case 'stall': {
        const r = this._regions[li].get(ty * this.tilemap.width + tx);
        this._put(ctx, `grass:0`, wx, wy);
        if (r) this._put(ctx, `stall:${r.c}:${r.r}:${r.w}:${r.h}:${r.roof % 3}`, wx, wy);
        break;
      }
      default:
        break;
    }
  }

  _edges(ctx, layer, kind, tx, ty, wx, wy) {
    const open = (dx, dy) => GRASSY.has(this.kindAt(layer, tx + dx, ty + dy));
    const sides = { n: open(0, -1), e: open(1, 0), s: open(0, 1), w: open(-1, 0) };
    for (const [s, on] of Object.entries(sides)) {
      if (on) this._put(ctx, `edge:${kind}:${s}:${Math.floor(hash2(tx, ty, s.charCodeAt(0)) * 3)}`, wx, wy);
    }
    for (const [name, dx, dy, a, b] of [['nw', -1, -1, 'n', 'w'], ['ne', 1, -1, 'n', 'e'], ['sw', -1, 1, 's', 'w'], ['se', 1, 1, 's', 'e']]) {
      if (!sides[a] && !sides[b] && open(dx, dy)) this._put(ctx, `corner:${kind}:${name}`, wx, wy);
    }
  }

  _waterEdges(ctx, layer, tx, ty, wx, wy) {
    const shore = (dx, dy) => {
      const k = this.kindAt(layer, tx + dx, ty + dy);
      return k === 'grass' || k === 'path' || k === 'dirt' || k === 'empty';
    };
    for (const [s, dx, dy] of [['n', 0, -1], ['e', 1, 0], ['s', 0, 1], ['w', -1, 0]]) {
      if (shore(dx, dy)) this._put(ctx, `edge:water:${s}:${Math.floor(hash2(tx, ty, s.charCodeAt(0)) * 3)}`, wx, wy);
    }
  }

  _drawWall(ctx, layer, li, tx, ty, wx, wy) {
    const tm = this.tilemap;
    const r = this._regions[li].get(ty * tm.width + tx);
    if (!r) return;
    const T = this.theme;
    const indoor = T === 'archive' || T === 'ruins';
    if (r.border) {
      const open = (dx, dy) => {
        const k = this.kindAt(layer, tx + dx, ty + dy);
        return k !== 'wall' && k !== 'out';
      };
      let mask = 0;
      if (open(0, -1)) mask |= M_N;
      if (open(1, 0)) mask |= M_E;
      if (open(0, 1)) mask |= M_S;
      if (open(-1, 0)) mask |= M_W;
      const trees = !indoor && T !== 'town';
      if (trees) this._put(ctx, `grass:${this._variant(tx, ty, 3)}`, wx, wy);
      this._put(ctx, `border:${mask}:${Math.floor(hash2(tx, ty, 9) * 3)}`, wx, wy);
      return;
    }
    // freestanding mass
    if (T === 'archive') this._put(ctx, `shelf:${r.c}:${r.r}:${r.w}:${r.h}:${Math.floor(hash2(r.x0, r.y0, 4) * 50)}`, wx, wy);
    else if (T === 'ruins') this._put(ctx, `ruin:${r.c}:${r.r}:${r.w}:${r.h}:${Math.floor(hash2(r.x0, r.y0, 4) * 50)}`, wx, wy);
    else if (T === 'town' && r.w === 4 && r.h === 4) {
      this._put(ctx, 'path:0', wx, wy);
      this._put(ctx, `basin:${r.c}:${r.r}:${r.w}:${r.h}:${Math.floor(this.lib.time * 2.2) % 4}`, wx, wy);
    } else this._put(ctx, `house:${r.c}:${r.r}:${r.w}:${r.h}:${r.roof}`, wx, wy);
  }
}

export { TILE };
