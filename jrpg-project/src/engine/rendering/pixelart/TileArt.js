import { PixBuf, darken, lighten, mix, rng, hash2 } from './PixBuf.js';
import { C } from './Palette.js';

/**
 * 16x16 tile painters. Everything is generated from a theme + a small spec string so the
 * renderer only needs to ask for e.g. "grass:2", "edge:path:n" or "house:2:1:4:3:0".
 */
export const TILE = 16;

export const THEMES = {
  village: { kind: 'outdoor', grass: ['#4f9b47', '#3b7d3d', '#7bb856'], path: ['#cfa970', '#b58a55', '#e6cc92'], dirt: ['#8a6545', '#6d4c33', '#a98458'], border: 'trees', flowers: true },
  forest: { kind: 'outdoor', grass: ['#38773c', '#285a31', '#4f9348'], path: ['#9a7448', '#7c5a38', '#b58c5a'], dirt: ['#6b4c34', '#523826', '#86644a'], border: 'trees', dark: true, mushrooms: true },
  road: { kind: 'outdoor', grass: ['#6a9a48', '#527d3c', '#93b95c'], path: ['#c4a272', '#a98558', '#dec797'], dirt: ['#8c7a62', '#6e5e4b', '#ab9a7e'], border: 'trees', flowers: true, rocky: true },
  town: { kind: 'outdoor', grass: ['#62a54f', '#478b41', '#8cc45f'], path: ['#9b9ab0', '#74748c', '#c0c0d2'], dirt: ['#8a6545', '#6d4c33', '#a98458'], border: 'wall', cobble: true, flowers: true },
  archive: { kind: 'indoor', grass: ['#9a6a40', '#7c5230', '#b78552'], path: ['#9a2f3d', '#74202e', '#c04858'], dirt: ['#6d4c33', '#523826', '#86644a'], border: 'wall', floor: 'wood' },
  ruins: { kind: 'indoor', grass: ['#5e6078', '#4a4c62', '#7a7c94'], path: ['#8c8ea6', '#6e7088', '#b4b6cc'], dirt: ['#4e4a52', '#3a3640', '#686470'], border: 'wall', floor: 'stone', runes: true },
};

const ZONE_THEME = {
  village: 'village',
  forest: 'forest',
  road_bellhaven: 'road',
  resonance_ancient_site: 'ruins',
};

export function themeForZone(zoneId) {
  const id = String(zoneId || '');
  if (ZONE_THEME[id]) return ZONE_THEME[id];
  if (id.startsWith('bellhaven_archive')) return 'archive';
  if (id.startsWith('bellhaven')) return 'town';
  if (id.startsWith('resonance')) return 'ruins';
  return 'village';
}

const ROOFS = [
  ['#b8453d', '#8f3030', '#d9685a'],
  ['#3f6fa8', '#2e5282', '#5f8fc8'],
  ['#7a5a42', '#5a402e', '#9a7658'],
  ['#3f8a7a', '#2c6a5c', '#5fae9c'],
];

const seedOf = (theme, name, a = 0, b = 0) => {
  let h = 7;
  for (const ch of theme + name) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (h ^ (a * 977) ^ (b * 131)) >>> 0;
};

function speckle(pb, r, colors, count, w = 1, h = 1) {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(r() * (TILE - w + 1));
    const y = Math.floor(r() * (TILE - h + 1));
    pb.rect(x, y, w, h, colors[Math.floor(r() * colors.length)]);
  }
}

// ---------------------------------------------------------------------------------------
// ground kinds
// ---------------------------------------------------------------------------------------
function paintGrass(t, v) {
  const T = THEMES[t];
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'grass', v));
  const [base, dark, light] = T.grass;
  if (T.floor === 'wood') return paintWoodFloor(T, v, r);
  if (T.floor === 'stone') return paintStoneFloor(T, v, r);
  pb.rect(0, 0, TILE, TILE, base);
  speckle(pb, r, [dark], 11);
  speckle(pb, r, [light], 8);
  // blades: tiny two-pixel strokes
  for (let i = 0; i < 4; i++) {
    const x = 1 + Math.floor(r() * 13);
    const y = 2 + Math.floor(r() * 12);
    pb.set(x, y, dark);
    pb.set(x, y - 1, light);
    pb.set(x + 1, y - 1, light);
  }
  if (v === 2 && T.flowers) {
    const cols = [['#fbf3dc', '#f1c94b'], ['#f6a6c0', '#f1c94b'], ['#b9a2f0', '#fbf3dc']];
    const n = 1 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) {
      const [pc, cc] = cols[Math.floor(r() * cols.length)];
      const x = 2 + Math.floor(r() * 11);
      const y = 3 + Math.floor(r() * 10);
      pb.set(x, y - 1, pc);
      pb.set(x - 1, y, pc);
      pb.set(x + 1, y, pc);
      pb.set(x, y + 1, pc);
      pb.set(x, y, cc);
      pb.set(x, y + 2, dark);
    }
  }
  if (v === 3 && T.mushrooms) {
    const x = 4 + Math.floor(r() * 7);
    const y = 6 + Math.floor(r() * 6);
    pb.rect(x, y + 1, 1, 2, '#e9ddc0');
    pb.hline(x - 1, y, 3, '#c24b49');
    pb.set(x, y - 1, '#c24b49');
    pb.set(x - 1, y, '#f8f1de');
    pb.hline(x - 1, y + 3, 3, darken(base, 0.35));
  } else if (v === 3) {
    const x = 3 + Math.floor(r() * 9);
    const y = 4 + Math.floor(r() * 8);
    pb.rect(x, y, 3, 2, '#8a8ba2');
    pb.hline(x, y, 2, '#b2b3c5');
    pb.hline(x, y + 2, 3, darken(base, 0.4));
  }
  if (v === 1 && T.dark) {
    // fallen leaf
    const x = 3 + Math.floor(r() * 9);
    const y = 4 + Math.floor(r() * 8);
    pb.set(x, y, '#c88a3a');
    pb.set(x + 1, y, '#a96a2a');
    pb.set(x + 1, y + 1, '#c88a3a');
  }
  return pb;
}

function paintWoodFloor(T, v, r) {
  const pb = new PixBuf(TILE, TILE);
  const [base, dark, light] = T.grass;
  pb.rect(0, 0, TILE, TILE, base);
  for (let p = 0; p < 4; p++) {
    const y = p * 4;
    pb.hline(0, y + 3, TILE, dark);
    pb.hline(0, y, TILE, mix(base, light, 0.35));
    const joint = 2 + Math.floor(r() * 11);
    pb.vline(joint, y, 4, dark);
    for (let i = 0; i < 2; i++) pb.set(Math.floor(r() * 16), y + 1 + Math.floor(r() * 2), mix(base, dark, 0.5));
  }
  return pb;
}

function paintStoneFloor(T, v, r) {
  const pb = new PixBuf(TILE, TILE);
  const [base, dark, light] = T.grass;
  pb.rect(0, 0, TILE, TILE, base);
  pb.hline(0, 7, TILE, dark);
  pb.hline(0, 15, TILE, dark);
  pb.vline(5 + (v % 3), 0, 8, dark);
  pb.vline(11 - (v % 3), 8, 8, dark);
  pb.hline(0, 0, TILE, mix(base, light, 0.4));
  pb.hline(0, 8, TILE, mix(base, light, 0.4));
  speckle(pb, r, [dark, light], 9);
  if (T.runes && v === 2) {
    const x = 5 + Math.floor(r() * 5);
    const y = 3 + Math.floor(r() * 3);
    pb.vline(x, y, 4, C.c1);
    pb.hline(x - 1, y + 1, 3, C.c2);
    pb.set(x + 1, y + 3, C.c1);
  }
  return pb;
}

function paintPath(t, v) {
  const T = THEMES[t];
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'path', v));
  const [base, dark, light] = T.path;
  if (T.floor === 'wood') {
    // carpet runner
    pb.rect(0, 0, TILE, TILE, base);
    for (let y = 0; y < TILE; y += 4) for (let x = ((y / 4) % 2) * 4; x < TILE; x += 8) {
      pb.set(x + 2, y + 2, '#e0b84a');
      pb.set(x + 1, y + 2, dark);
      pb.set(x + 3, y + 2, dark);
      pb.set(x + 2, y + 1, dark);
      pb.set(x + 2, y + 3, dark);
    }
    speckle(pb, r, [dark], 6);
    return pb;
  }
  if (T.floor === 'stone') {
    pb.rect(0, 0, TILE, TILE, base);
    pb.hline(0, 0, TILE, light);
    pb.hline(0, 8, TILE, light);
    pb.hline(0, 7, TILE, dark);
    pb.hline(0, 15, TILE, dark);
    pb.vline(8, 0, 8, dark);
    pb.vline(3, 8, 8, dark);
    speckle(pb, r, [dark, light], 6);
    if (v === 1) {
      pb.hline(2, 4, 12, C.c1);
      pb.hline(6, 12, 8, C.c1);
      pb.set(8, 4, C.c3);
    }
    return pb;
  }
  if (T.cobble) {
    pb.rect(0, 0, TILE, TILE, dark);
    const rows = [[0, 5], [5, 5], [10, 6]];
    rows.forEach(([y, h], i) => {
      let x = i % 2 ? -3 : 0;
      while (x < TILE) {
        const w = 5 + Math.floor(r() * 3);
        const cx0 = Math.max(0, x + 1);
        const cx1 = Math.min(TILE - 1, x + w - 1);
        if (cx1 >= cx0) {
          pb.rect(cx0, y + 1, cx1 - cx0 + 1, h - 1, base);
          pb.hline(cx0, y + 1, cx1 - cx0 + 1, light);
          if (r() > 0.5) pb.set(cx0 + 1, y + 2, mix(base, dark, 0.4));
        }
        x += w;
      }
    });
    return pb;
  }
  pb.rect(0, 0, TILE, TILE, base);
  speckle(pb, r, [dark], 9);
  speckle(pb, r, [light], 7);
  for (let i = 0; i < 3; i++) {
    const x = 1 + Math.floor(r() * 12);
    const y = 1 + Math.floor(r() * 12);
    pb.rect(x, y, 2, 1, darken(base, 0.28));
    pb.set(x, y - 1, light);
  }
  if (T.rocky && v === 1) {
    pb.hline(0, 5, TILE, dark);
    pb.hline(0, 11, TILE, dark);
  }
  return pb;
}

function paintDirt(t, v) {
  const T = THEMES[t];
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'dirt', v));
  const [base, dark, light] = T.dirt;
  pb.rect(0, 0, TILE, TILE, base);
  speckle(pb, r, [dark], 12);
  speckle(pb, r, [light], 8);
  if (T.rocky || T.floor === 'stone') {
    for (let i = 0; i < 2; i++) {
      const x = 2 + Math.floor(r() * 9);
      const y = 3 + Math.floor(r() * 8);
      pb.rect(x, y, 4, 3, '#8a8ba2');
      pb.hline(x, y, 3, '#b2b3c5');
      pb.hline(x, y + 3, 4, '#444459');
      pb.set(x + 3, y, '#64657b');
    }
  } else if (T.floor === 'wood') {
    // rug accent under shelves
    pb.rect(0, 0, TILE, TILE, '#5a3a24');
    speckle(pb, r, [dark], 10);
  } else if (v % 2 === 1) {
    // furrows
    for (let y = 3; y < TILE; y += 5) {
      pb.hline(1, y, 14, dark);
      pb.hline(1, y + 1, 14, light);
    }
  }
  return pb;
}

export function paintWater(t, frame) {
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'water'));
  pb.rect(0, 0, TILE, TILE, C.w1);
  for (let y = 0; y < TILE; y += 4) pb.hline(0, y + 3, TILE, C.w0);
  for (let i = 0; i < 6; i++) {
    const baseX = Math.floor(r() * 12);
    const y = 1 + Math.floor(r() * 14);
    const x = (baseX + frame * 2 + (i % 2) * 3) % 14;
    pb.hline(x, y, 3, C.w3);
    if (i % 3 === 0) pb.set(x + 1, y - 1, C.w4);
  }
  speckle(pb, r, [C.w2], 8);
  if ((frame + 1) % 4 === 0) pb.set(3 + Math.floor(r() * 10), 3 + Math.floor(r() * 10), C.w4);
  return pb;
}

// ---------------------------------------------------------------------------------------
// edge overlays (drawn on top of path/dirt/water where they meet grass)
// ---------------------------------------------------------------------------------------
const SIDES = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };

function paintEdge(t, kind, side, v) {
  const T = THEMES[t];
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'edge' + kind + side, v));
  const [gBase, gDark, gLight] = T.grass;

  if (T.kind === 'indoor') {
    // trim between floors
    const trim = T.floor === 'wood' ? '#e0b84a' : darken(T.path[0], 0.35);
    const shadow = darken(T.floor === 'wood' ? T.path[0] : T.grass[0], 0.3);
    for (let i = 0; i < TILE; i++) {
      const p = along(side, i, 0);
      const q = along(side, i, 1);
      pb.set(p[0], p[1], trim);
      pb.set(q[0], q[1], shadow);
    }
    return pb;
  }

  for (let i = 0; i < TILE; i++) {
    const depth = kind === 'water' ? 2 + (r() > 0.55 ? 1 : 0) : 1 + Math.floor(r() * 2.4);
    for (let d = 0; d < depth; d++) {
      const [x, y] = along(side, i, d);
      const edgePx = d === depth - 1;
      if (kind === 'water') {
        pb.set(x, y, edgePx ? C.d4 : mix(gBase, '#cfa66b', 0.2));
      } else {
        pb.set(x, y, edgePx ? gDark : r() > 0.7 ? gLight : gBase);
      }
    }
    if (kind !== 'water' && r() > 0.72) {
      const [x, y] = along(side, i, depth);
      pb.set(x, y, gLight);
    }
    if (kind === 'water') {
      const [x, y] = along(side, i, depth);
      pb.set(x, y, C.w4);
    }
  }
  return pb;
}

function along(side, i, d) {
  switch (side) {
    case 'n': return [i, d];
    case 's': return [i, TILE - 1 - d];
    case 'w': return [d, i];
    default: return [TILE - 1 - d, i];
  }
}

function paintCorner(t, kind, corner) {
  const T = THEMES[t];
  const pb = new PixBuf(TILE, TILE);
  if (T.kind === 'indoor') return pb;
  const [gBase, gDark] = T.grass;
  const flipX = corner.includes('e');
  const flipY = corner.includes('s');
  const px = (x, y, c) => pb.set(flipX ? TILE - 1 - x : x, flipY ? TILE - 1 - y : y, c);
  const dark = kind === 'water' ? C.d4 : gDark;
  px(0, 0, gBase);
  px(1, 0, gBase);
  px(0, 1, gBase);
  px(2, 0, dark);
  px(0, 2, dark);
  px(1, 1, dark);
  return pb;
}

// ---------------------------------------------------------------------------------------
// solid masses: border trees / walls, houses, shelves, ruins, stalls
// ---------------------------------------------------------------------------------------
function paintBorder(t, mask, v) {
  const T = THEMES[t];
  return T.border === 'trees' ? paintTreeLine(t, mask, v) : paintWallFace(t, mask, v);
}

const M_N = 1, M_E = 2, M_S = 4, M_W = 8; // bits set = neighbour is open (walkable)

function paintTreeLine(t, mask, v) {
  const T = THEMES[t];
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'tree', mask * 7 + v));
  const dark = T.dark;
  const c0 = dark ? '#173525' : '#1f4a2e';
  const c1 = dark ? '#245233' : '#2c6a38';
  const c2 = dark ? '#33703f' : '#3f8a46';
  const c3 = dark ? '#4a9150' : '#62ad55';
  // canopy mass
  const blobs = [[4, 5, 5.5], [11, 4, 5.5], [8, 9, 6.5], [3, 11, 5], [12, 11, 5.5]];
  for (const [bx, by, br] of blobs) pb.ellipse(bx + (r() - 0.5) * 1.5, by + (r() - 0.5) * 1.5, br, br - 0.5, c1);
  pb.rect(0, 0, TILE, TILE, c1);
  // open sides get a rounded, jagged silhouette
  const cut = (side) => {
    for (let i = 0; i < TILE; i++) {
      const edge = Math.abs(i - 7.5);
      const depth = 1 + Math.floor(r() * 2) + (edge > 5 ? 2 : 0);
      for (let d = 0; d < depth; d++) {
        const [x, y] = along(side, i, d);
        pb.set(x, y, null);
      }
    }
  };
  const openS = mask & M_S;
  if (mask & M_N) cut('n');
  if (mask & M_E) cut('e');
  if (mask & M_W) cut('w');
  if (openS) {
    for (let i = 0; i < TILE; i++) {
      const depth = 3 + Math.floor(r() * 2) + (Math.abs(i - 7.5) > 5 ? 1 : 0);
      for (let d = 0; d < depth; d++) {
        const [x, y] = along('s', i, d);
        pb.set(x, y, null);
      }
    }
  }
  // lighting: highlight clumps on upper-left, shade on lower-right
  for (let i = 0; i < 16; i++) {
    const x = Math.floor(r() * TILE);
    const y = Math.floor(r() * TILE * (openS ? 0.62 : 1));
    if (pb.alpha(x, y)) {
      pb.set(x, y, c2);
      if (pb.alpha(x + 1, y)) pb.set(x + 1, y, c2);
      if (r() > 0.6 && pb.alpha(x, y - 1)) pb.set(x, y - 1, c3);
    }
  }
  for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
    if (!pb.alpha(x, y)) continue;
    if (!pb.alpha(x, y + 1) || !pb.alpha(x + 1, y + 1)) pb.set(x, y, c0);
    else if (!pb.alpha(x, y - 1) && r() > 0.4) pb.set(x, y, c2);
  }
  if (openS) {
    // trunks + shadow
    for (const tx of [3, 10]) {
      pb.rect(tx, 10, 3, 5, '#5a3a24');
      pb.vline(tx, 10, 5, '#835731');
      pb.vline(tx + 2, 10, 5, '#38231a');
      pb.hline(tx - 1, 14, 5, '#38231a');
    }
    for (let x = 0; x < TILE; x++) if (r() > 0.25) pb.setUnder(x, 15, '#00000055');
  }
  return pb;
}

/**
 * Seamless dense canopy used to fill the screen beyond a zone's edge (never walkable).
 * Blobs wrap around the tile so neighbouring tiles join without outline seams.
 */
function paintForestFill(t, v) {
  const T = THEMES[t];
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'forestfill', v));
  const dark = T.dark;
  const c0 = dark ? '#173525' : '#1f4a2e';
  const c1 = dark ? '#245233' : '#2c6a38';
  const c2 = dark ? '#33703f' : '#3f8a46';
  const c3 = dark ? '#4a9150' : '#62ad55';
  const blobs = [];
  for (let i = 0; i < 4; i++) blobs.push([r() * TILE, r() * TILE, 4.2 + r() * 2]);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      let best = -1;
      let lit = 0;
      for (const [bx, by, br] of blobs) {
        for (const ox of [-TILE, 0, TILE]) {
          for (const oy of [-TILE, 0, TILE]) {
            const dx = x - (bx + ox);
            const dy = y - (by + oy);
            const h = 1 - Math.hypot(dx, dy) / br;
            if (h > best) {
              best = h;
              lit = -(dx + dy);
            }
          }
        }
      }
      let c = c1;
      if (best < 0.08) c = c0;
      else if (best > 0.6 && lit > 0) c = c3;
      else if (best > 0.3 && lit > 0) c = c2;
      else if (best < 0.28 && lit < 0) c = c0;
      pb.set(x, y, c);
    }
  }
  return pb;
}

function paintWallFace(t, mask, v) {
  const T = THEMES[t];
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'wall', mask * 5 + v));
  const indoor = T.kind === 'indoor';
  const base = indoor ? (T.floor === 'stone' ? '#4a4c62' : '#6b5a68') : '#8d8ea6';
  const dark = darken(base, 0.3);
  const light = lighten(base, 0.22);
  const face = !!(mask & M_S); // open below → we look at the front of the wall

  if (face) {
    pb.rect(0, 0, TILE, TILE, base);
    // brick courses
    for (let y = 0; y < TILE; y += 4) {
      pb.hline(0, y + 3, TILE, dark);
      const off = (y / 4) % 2 ? 4 : 0;
      for (let x = off; x < TILE; x += 8) pb.vline(x, y, 3, dark);
      pb.hline(0, y, TILE, light);
    }
    speckle(pb, r, [light, dark], 6);
    pb.hline(0, 15, TILE, darken(base, 0.5));
    pb.hline(0, 14, TILE, dark);
    if (indoor && T.floor === 'wood') {
      // wainscot
      pb.rect(0, 8, TILE, 7, '#5a3a24');
      pb.hline(0, 8, TILE, '#a97b47');
      for (let x = 2; x < TILE; x += 5) pb.vline(x, 9, 5, '#38231a');
    }
    if (indoor && T.runes && v % 3 === 0) {
      pb.vline(7, 4, 5, C.c1);
      pb.hline(5, 6, 5, C.c1);
      pb.set(7, 3, C.c3);
    }
  } else {
    // top of the wall (seen from above)
    pb.rect(0, 0, TILE, TILE, indoor ? darken(base, 0.45) : lighten(base, 0.12));
    if (!indoor) {
      for (let x = 0; x < TILE; x += 8) {
        pb.rect(x + 1, 1, 6, 6, lighten(base, 0.28));
        pb.rect(x + 1, 9, 6, 6, lighten(base, 0.28));
        pb.hline(x + 1, 6, 6, darken(base, 0.1));
        pb.hline(x + 1, 14, 6, darken(base, 0.1));
      }
    } else {
      speckle(pb, r, [darken(base, 0.55), darken(base, 0.35)], 8);
    }
  }
  // rim light/shadow where it meets open floor on the other sides
  if (mask & M_N) pb.hline(0, 0, TILE, light);
  if (mask & M_W) pb.vline(0, 0, TILE, light);
  if (mask & M_E) pb.vline(15, 0, TILE, dark);
  return pb;
}

export function paintHouse(t, c, rr, w, h, roofIdx, seed = 0) {
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'house', c * 13 + rr * 7 + roofIdx + seed));
  const [rb, rd, rl] = ROOFS[roofIdx % ROOFS.length];
  const faceRow = rr === h - 1;
  if (!faceRow) {
    pb.rect(0, 0, TILE, TILE, rb);
    // shingle rows
    for (let y = 0; y < TILE; y += 4) {
      pb.hline(0, y + 3, TILE, rd);
      const off = (y / 4 + rr) % 2 ? 4 : 0;
      for (let x = off; x < TILE; x += 8) {
        pb.vline(x, y, 3, rd);
        pb.set(x + 1, y, rl);
      }
      pb.hline(0, y, TILE, mix(rb, rl, 0.35));
    }
    if (rr === 0) {
      pb.rect(0, 0, TILE, 3, rl);
      pb.hline(0, 3, TILE, rd);
      pb.hline(0, 0, TILE, lighten(rl, 0.3));
    }
    if (c === 0) pb.vline(0, 0, TILE, rd);
    if (c === w - 1) pb.vline(15, 0, TILE, darken(rd, 0.25));
    if (c === 0) pb.vline(1, 0, TILE, rl);
    if (rr === h - 2) {
      pb.hline(0, 14, TILE, rd);
      pb.hline(0, 15, TILE, darken(rd, 0.45));
    }
    // chimney
    if (rr === 0 && c === w - 2 && w > 2) {
      pb.rect(5, -0, 6, 8, '#7a6e78');
      pb.rect(5, 0, 6, 2, '#a89ca6');
      pb.vline(10, 0, 8, '#4a424e');
      pb.hline(5, 7, 6, '#4a424e');
    }
  } else {
    const plaster = '#e2d2a8';
    const plasterD = '#c4b088';
    pb.rect(0, 0, TILE, TILE, plaster);
    for (let i = 0; i < 6; i++) pb.set(Math.floor(r() * 16), 3 + Math.floor(r() * 7), plasterD);
    // eave shadow
    pb.hline(0, 0, TILE, '#7a6a58');
    pb.hline(0, 1, TILE, plasterD);
    pb.hline(0, 2, TILE, plasterD);
    // timber frame
    pb.vline(0, 0, TILE, '#5a3a24');
    pb.vline(15, 0, TILE, '#5a3a24');
    pb.hline(0, 3, TILE, '#6d4a2e');
    // foundation
    pb.rect(0, 12, TILE, 4, '#7c7d94');
    pb.hline(0, 12, TILE, '#a4a5bb');
    pb.vline(5, 13, 3, '#4e4f66');
    pb.vline(11, 12, 3, '#4e4f66');
    pb.hline(0, 15, TILE, '#3a3a50');
    const doorCol = Math.floor((w - 1) / 2);
    if (c === doorCol && w >= 2) {
      pb.rect(3, 3, 10, 13, '#5a3a24');
      pb.rect(4, 4, 8, 12, '#835731');
      pb.vline(8, 4, 12, '#5a3a24');
      pb.hline(4, 4, 8, '#a97b47');
      pb.set(10, 10, C.y2);
      pb.set(6, 10, C.y2);
      pb.rect(2, 15, 12, 1, '#a4a5bb');
    } else if (c % 2 === 1 || w === 1 || c === 0 && w <= 2) {
      // window
      pb.rect(4, 5, 8, 6, '#5a3a24');
      pb.rect(5, 6, 6, 4, '#9ad4e8');
      pb.hline(5, 6, 6, '#d2f2fa');
      pb.vline(8, 6, 4, '#5a3a24');
      pb.hline(5, 8, 6, '#5a3a24');
      pb.hline(3, 11, 10, '#835731');
      pb.set(5, 12 - 0, '#c24b49');
    }
  }
  return pb;
}

export function paintShelf(t, c, rr, w, h, seed = 0) {
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'shelf', c * 17 + rr * 5 + seed));
  const wood = '#6a4326';
  const woodL = '#a97b47';
  const woodD = '#38231a';
  pb.rect(0, 0, TILE, TILE, woodD);
  const bookCols = ['#c24b49', '#3f6fa8', '#d99b2d', '#3f8a7a', '#8667b1', '#e8d8a8', '#8a4a2a', '#4f9b47'];
  const rowsY = [1, 6, 11];
  for (const y of rowsY) {
    pb.rect(0, y + 4, TILE, 1, wood);
    pb.hline(0, y + 4, TILE, woodL);
    let x = 1;
    while (x < 15) {
      const bw = 2 + Math.floor(r() * 2);
      const bh = 3 + Math.floor(r() * 2);
      const col = bookCols[Math.floor(r() * bookCols.length)];
      if (r() > 0.12) {
        pb.rect(x, y + 4 - bh, bw, bh, col);
        pb.vline(x, y + 4 - bh, bh, lighten(col, 0.25));
        pb.set(x + bw - 1, y + 4 - bh, darken(col, 0.25));
        if (r() > 0.6) pb.hline(x, y + 4 - bh + 1, bw, '#f1c94b');
      }
      x += bw + (r() > 0.85 ? 1 : 0);
    }
  }
  pb.vline(0, 0, TILE, wood);
  pb.vline(15, 0, TILE, woodD);
  if (rr === 0) {
    pb.rect(0, 0, TILE, 2, woodL);
    pb.hline(0, 2, TILE, wood);
  }
  if (rr === h - 1) {
    pb.rect(0, 13, TILE, 3, wood);
    pb.hline(0, 13, TILE, woodL);
    pb.hline(0, 15, TILE, woodD);
  }
  return pb;
}

export function paintRuinBlock(t, c, rr, w, h, seed = 0) {
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'ruin', c * 11 + rr * 3 + seed));
  const base = '#767892';
  const dark = '#4a4c62';
  const light = '#a4a6bf';
  pb.rect(0, 0, TILE, TILE, base);
  for (let y = 0; y < TILE; y += 8) {
    pb.hline(0, y + 7, TILE, dark);
    const off = (y / 8 + rr) % 2 ? 8 : 0;
    pb.vline((off + 8) % 16, y, 7, dark);
    pb.hline(0, y, TILE, mix(base, light, 0.5));
  }
  speckle(pb, r, [dark, light], 8);
  // moss
  for (let i = 0; i < 4; i++) {
    const x = Math.floor(r() * 14);
    const y = Math.floor(r() * 14);
    pb.rect(x, y, 3, 2, '#4f8a48');
    pb.set(x, y, '#76b05a');
  }
  if (r() > 0.4) {
    const x = 4 + Math.floor(r() * 6);
    pb.vline(x, 3, 6, C.c1);
    pb.hline(x - 2, 5, 5, C.c2);
    pb.set(x, 2, C.c3);
  }
  if (rr === 0) {
    pb.hline(0, 0, TILE, '#d6d7e3');
    pb.hline(0, 1, TILE, light);
  }
  if (c === 0) pb.vline(0, 0, TILE, light);
  if (rr === h - 1) {
    pb.hline(0, 15, TILE, '#2a2a3b');
    pb.hline(0, 14, TILE, dark);
  }
  if (c === w - 1) pb.vline(15, 0, TILE, dark);
  return pb;
}

export function paintStall(t, c, rr, w, h, seed = 0) {
  const pb = new PixBuf(TILE, TILE);
  const r = rng(seedOf(t, 'stall', c * 7 + rr * 19 + seed));
  const cols = [['#c24b49', '#f8f1de'], ['#3f6fa8', '#f8f1de'], ['#3f8a7a', '#f1c94b']][seed % 3];
  if (rr === 0) {
    pb.rect(0, 0, TILE, TILE, cols[1]);
    for (let x = 0; x < TILE; x += 8) pb.rect(x, 0, 4, TILE, cols[0]);
    pb.hline(0, 0, TILE, lighten(cols[0], 0.3));
    for (let x = 0; x < TILE; x++) {
      const scallop = (x % 4 === 0 || x % 4 === 3) ? 14 : 15;
      if (scallop === 14) pb.set(x, 15, null);
    }
    pb.hline(0, 13, TILE, darken(cols[0], 0.3));
    pb.rect(0, 14, TILE, 2, null);
    pb.hline(0, 14, TILE, '#00000040');
  } else {
    pb.rect(0, 0, TILE, TILE, '#00000000');
    // posts
    if (c === 0) pb.rect(0, 0, 2, TILE, '#5a3a24');
    if (c === w - 1) pb.rect(14, 0, 2, TILE, '#5a3a24');
    // counter
    pb.rect(0, 7, TILE, 9, '#835731');
    pb.hline(0, 7, TILE, '#c99a5a');
    pb.hline(0, 8, TILE, '#a97b47');
    pb.hline(0, 15, TILE, '#38231a');
    pb.vline(5, 9, 6, '#6a4326');
    pb.vline(10, 9, 6, '#6a4326');
    // goods
    const goods = [['#c24b49', '#8d2d3b'], ['#f1c94b', '#a6701f'], ['#86b95a', '#3d7b3f'], ['#e9ddc0', '#a98458'], ['#8667b1', '#5b3f80']];
    for (let i = 0; i < 3; i++) {
      const [g, gd] = goods[Math.floor(r() * goods.length)];
      const x = 1 + i * 5;
      pb.rect(x, 4, 4, 3, g);
      pb.hline(x, 6, 4, gd);
      pb.set(x + 1, 4, lighten(g, 0.35));
    }
  }
  return pb;
}

export function paintBasin(t, c, rr, w, h, frame = 0) {
  const pb = new PixBuf(TILE, TILE);
  const W = w * TILE;
  const H = h * TILE;
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const px = c * TILE + x;
      const py = rr * TILE + y;
      const dx = (px + 0.5 - W / 2) / (W / 2);
      const dy = (py + 0.5 - H / 2) / (H / 2);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 1) continue;
      if (d > 0.9) pb.set(x, y, dy < 0 ? '#d6d7e3' : '#5a5b72');
      else if (d > 0.8) pb.set(x, y, dy < 0 ? '#b2b3c5' : '#7b7c94');
      else if (d > 0.76) pb.set(x, y, '#444459');
      else {
        let col = d > 0.55 ? '#2b5b9b' : '#3f84c6';
        if ((px * 3 + py * 5 + frame * 7) % 13 === 0) col = '#6db3e2';
        if ((px + py * 2 + frame * 3) % 17 === 0) col = '#aadff3';
        pb.set(x, y, col);
      }
    }
  }
  return pb;
}

export function paintShadow() {
  const pb = new PixBuf(TILE, TILE);
  pb.rect(0, 0, TILE, TILE, '#14102440');
  return pb;
}

// ---------------------------------------------------------------------------------------
// dispatcher
// ---------------------------------------------------------------------------------------
/** @param {string} spec e.g. "grass:2", "edge:path:n:0", "house:1:0:4:3:2" */
export function paintTile(theme, spec) {
  const p = spec.split(':');
  const num = (i) => Number(p[i] ?? 0);
  switch (p[0]) {
    case 'grass': return paintGrass(theme, num(1));
    case 'path': return paintPath(theme, num(1));
    case 'dirt': return paintDirt(theme, num(1));
    case 'water': return paintWater(theme, num(1));
    case 'edge': return paintEdge(theme, p[1], p[2], num(3));
    case 'corner': return paintCorner(theme, p[1], p[2]);
    case 'border': return paintBorder(theme, num(1), num(2));
    case 'forest': return paintForestFill(theme, num(1));
    case 'house': return paintHouse(theme, num(1), num(2), num(3), num(4), num(5), num(6));
    case 'shelf': return paintShelf(theme, num(1), num(2), num(3), num(4), num(5));
    case 'ruin': return paintRuinBlock(theme, num(1), num(2), num(3), num(4), num(5));
    case 'basin': return paintBasin(theme, num(1), num(2), num(3), num(4), num(5));
    case 'stall': return paintStall(theme, num(1), num(2), num(3), num(4), num(5));
    default: return paintGrass(theme, 0);
  }
}

export { M_N, M_E, M_S, M_W, SIDES, hash2 };
