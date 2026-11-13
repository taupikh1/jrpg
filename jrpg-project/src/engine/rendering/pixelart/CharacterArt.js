import { PixBuf, darken, lighten, mix, hashStr, rng } from './PixBuf.js';
import { C, SKINS } from './Palette.js';

/**
 * Procedural 16x24 chibi characters. One sheet per look:
 *   rows: 0 = down, 1 = up, 2 = left (right is the mirrored left row)
 *   cols: 0 idle, 1 step A, 2 idle, 3 step B
 */
export const CHAR_W = 16;
export const CHAR_H = 24;
export const CHAR_FRAMES = 4;

function layout(look) {
  const child = look.build === 'child';
  const legLen = child ? 2 : 4;
  const torsoLen = child ? 4 : 6;
  const bootTop = 21;
  const legTop = bootTop - legLen;
  const torsoTop = legTop - torsoLen;
  const headTop = torsoTop - 9;
  return { child, legLen, torsoLen, bootTop, legTop, torsoTop, headTop };
}

function normalize(look) {
  const skin = SKINS[look.skin] || look.skin || C.skinLight;
  const top = look.top || '#4d6fba';
  return {
    hairStyle: 'short',
    outfit: 'tunic',
    build: 'adult',
    hair: '#4a3022',
    pants: '#3b3f63',
    boots: '#4a2f22',
    trim: lighten(top, 0.35),
    belt: '#6a4326',
    ...look,
    skin,
    skinShade: darken(skin, 0.18),
    top,
    topDark: darken(top, 0.28),
    topLight: lighten(top, 0.22),
  };
}

export function paintCharacter(rawLook, dir = 'down', frame = 0) {
  const look = normalize(rawLook);
  const L = layout(look);
  const pb = new PixBuf(CHAR_W, CHAR_H);
  const step = frame === 1 || frame === 3;
  const bob = step ? 1 : 0;
  const swing = [0, -1, 0, 1][frame];
  const ctx = { pb, look, L, dir, frame, step, bob, swing };

  if (dir === 'left') paintSide(ctx);
  else paintFrontBack(ctx, dir === 'up');

  pb.outline(look.outlineColor || C.ink);
  return pb;
}

// ----------------------------------------------------------------------------
// Front / back
// ----------------------------------------------------------------------------
function paintFrontBack(ctx, back) {
  const { pb, look, L, bob, step, swing, frame } = ctx;
  const ty = L.torsoTop - bob;
  const hy = L.headTop - bob;
  const stocky = look.build === 'stocky';
  const x0 = stocky ? 3 : 4;
  const x1 = stocky ? 12 : 11;

  // cape sits behind everything in front view, over the body in back view
  if (look.cape && !back) {
    pb.rect(2, ty + 1, 12, L.legTop - ty + 2, darken(look.cape, 0.2));
  }

  // ---- legs ----
  const legStart = L.legTop - bob;
  const lLift = step && swing === 1 ? 1 : 0;
  const rLift = step && swing === -1 ? 1 : 0;
  const robe = look.outfit === 'robe';
  if (!robe) {
    for (const [lx, lift] of [[5, lLift], [8, rLift]]) {
      pb.rect(lx, legStart, 3, L.bootTop - legStart + 0 - lift, lx === 5 ? look.pants : darken(look.pants, 0.14));
      const by = L.bootTop - lift;
      pb.rect(lx === 5 ? lx - 1 : lx, by, 4, 2, look.boots);
      pb.hline(lx === 5 ? lx - 1 : lx, by + 1, 4, darken(look.boots, 0.4));
      pb.hline(lx === 5 ? lx - 1 : lx, by, 4, lighten(look.boots, 0.12));
    }
  } else {
    // robe hem hides legs; tiny boot tips peek out
    pb.rect(5, L.bootTop + 1 - lLift, 2, 1, look.boots);
    pb.rect(9, L.bootTop + 1 - rLift, 2, 1, look.boots);
  }

  // ---- torso / outfit ----
  paintOutfitFront(ctx, ty, x0, x1, back);

  // ---- arms ----
  const sleeve = look.outfit === 'armor' ? C.s3 : look.top;
  const sleeveD = darken(sleeve, 0.22);
  const hand = look.gloves || look.skin;
  for (const [ax, off, side] of [[x0 - 2, swing, 'l'], [x1 + 1, -swing, 'r']]) {
    const ay = ty + 1 + off;
    const len = L.child ? 3 : 4;
    pb.rect(ax, ay, 2, len, side === 'l' ? sleeve : sleeveD);
    pb.rect(ax, ay + len, 2, 1, hand);
    if (look.outfit !== 'robe') pb.hline(ax, ay, 2, lighten(sleeve, 0.15));
  }

  // ---- head ----
  paintHeadFrontBack(ctx, hy, back);

  // ---- cape over body in back view ----
  if (look.cape && back) {
    const cy = ty;
    pb.rect(3, cy, 10, L.legTop - cy + 3, look.cape);
    pb.rect(3, cy, 1, L.legTop - cy + 3, lighten(look.cape, 0.12));
    pb.rect(12, cy, 1, L.legTop - cy + 3, darken(look.cape, 0.2));
    pb.hline(3, L.legTop + 2, 10, darken(look.cape, 0.3));
    pb.hline(5, cy + 1, 6, darken(look.cape, 0.12));
    // clasp
    pb.set(7, cy, look.clasp || C.y2);
    pb.set(8, cy, look.clasp || C.y2);
  }

  paintHeld(ctx, back ? 'back' : 'front');
}

function paintOutfitFront(ctx, ty, x0, x1, back) {
  const { pb, look, L } = ctx;
  const n = L.torsoLen;
  const top = look.top;
  const shade = look.topDark;
  const light = look.topLight;
  const mid = (x0 + x1 + 1) / 2;

  const body = () => {
    pb.rect(x0, ty, x1 - x0 + 1, n, top);
    pb.vline(x1, ty, n, shade);
    pb.vline(x0, ty + 1, n - 1, light);
  };

  switch (look.outfit) {
    case 'robe': {
      body();
      // flowing skirt
      const sy = ty + n;
      for (let y = sy; y <= L.bootTop + 0; y++) {
        const spread = Math.min(1, y - sy);
        pb.rect(x0 - spread, y, x1 - x0 + 1 + spread * 2, 1, top);
        pb.set(x1 + spread, y, shade);
        pb.set(x0 - spread, y, light);
      }
      pb.hline(x0 - 1, L.bootTop, x1 - x0 + 3, look.trim);
      pb.hline(x0 - 1, L.bootTop + 1, x1 - x0 + 3, darken(look.trim, 0.3));
      if (!back) {
        pb.vline(Math.floor(mid), ty, L.bootTop - ty + 1, darken(top, 0.18));
        pb.hline(x0, ty + n - 2, x1 - x0 + 1, look.belt);
      }
      pb.hline(x0, ty, x1 - x0 + 1, look.trim);
      break;
    }
    case 'dress': {
      body();
      const sy = ty + n - 1;
      const end = L.legTop + (L.child ? 0 : 2);
      for (let y = sy; y <= end; y++) {
        const spread = Math.min(2, y - sy + 1);
        pb.rect(x0 - spread, y, x1 - x0 + 1 + spread * 2, 1, top);
        pb.set(x1 + spread, y, shade);
        pb.set(x0 - spread, y, light);
      }
      pb.hline(x0 - 2, end, x1 - x0 + 5, look.trim);
      if (!back) {
        pb.hline(x0, ty + n - 2, x1 - x0 + 1, look.belt);
        pb.hline(x0, ty, x1 - x0 + 1, look.trim);
      }
      break;
    }
    case 'coat': {
      body();
      const tail = L.legTop;
      pb.rect(x0, tail, 3, 2, shade);
      pb.rect(x1 - 2, tail, 3, 2, shade);
      if (!back) {
        // open front with inner shirt
        pb.rect(Math.floor(mid) - 1, ty, 2, n, look.inner || C.white);
        pb.vline(Math.floor(mid) - 2, ty, n, shade);
        pb.vline(Math.floor(mid) + 1, ty, n, shade);
        pb.hline(x0, ty + n - 2, x1 - x0 + 1, look.belt);
        pb.set(Math.floor(mid), ty + n - 2, C.y2);
        pb.hline(x0, ty, 3, look.trim);
        pb.hline(x1 - 2, ty, 3, look.trim);
      } else {
        pb.vline(Math.floor(mid) - 1, ty + 1, n + 1, shade);
      }
      break;
    }
    case 'armor': {
      pb.rect(x0, ty, x1 - x0 + 1, n, C.s3);
      pb.rect(x0 + 1, ty + 1, x1 - x0 - 1, n - 2, look.top);
      pb.vline(x1, ty, n, C.s2);
      pb.hline(x0, ty, x1 - x0 + 1, C.s4);
      // pauldrons
      pb.rect(x0 - 2, ty, 3, 2, C.s4);
      pb.rect(x1, ty, 3, 2, C.s3);
      pb.hline(x0, ty + n - 2, x1 - x0 + 1, look.belt);
      if (!back) pb.set(Math.floor(mid), ty + 2, look.trim);
      pb.rect(x0, L.legTop, x1 - x0 + 1, 1, darken(look.top, 0.3));
      break;
    }
    case 'apron': {
      body();
      if (!back) {
        pb.rect(x0 + 1, ty + 1, x1 - x0 - 1, n - 1, look.apron || '#e5d8b4');
        pb.rect(x0 + 1, L.legTop, x1 - x0 - 1, 2, look.apron || '#e5d8b4');
        pb.vline(x1 - 1, ty + 1, n + 1, darken(look.apron || '#e5d8b4', 0.15));
        pb.hline(x0, ty + n - 2, x1 - x0 + 1, look.belt);
      } else {
        pb.hline(x0, ty + n - 2, x1 - x0 + 1, look.belt);
        pb.set(x0 + 1, ty + n - 1, look.apron || '#e5d8b4');
        pb.set(x1 - 1, ty + n - 1, look.apron || '#e5d8b4');
      }
      pb.hline(x0, ty, x1 - x0 + 1, look.trim);
      break;
    }
    default: {
      // tunic
      body();
      pb.hline(x0, ty, x1 - x0 + 1, look.trim);
      pb.hline(x0, ty + n - 2, x1 - x0 + 1, look.belt);
      if (!back) pb.set(Math.floor(mid), ty + n - 2, C.y2);
      pb.hline(x0, ty + n - 1, x1 - x0 + 1, shade);
      if (!back && look.vest) {
        pb.rect(x0, ty + 1, 2, n - 3, look.vest);
        pb.rect(x1 - 1, ty + 1, 2, n - 3, darken(look.vest, 0.2));
      }
    }
  }

  if (look.scarf) {
    pb.hline(x0, ty, x1 - x0 + 1, look.scarf);
    pb.hline(x0 + 1, ty - 0, x1 - x0 - 1, lighten(look.scarf, 0.2));
    if (!back) {
      pb.rect(x1 - 2, ty + 1, 2, 3, look.scarf);
      pb.hline(x1 - 2, ty + 3, 2, darken(look.scarf, 0.25));
    } else {
      pb.rect(x0 + 1, ty + 1, 2, 4, look.scarf);
    }
  }

  if (look.pack) {
    // satchel strap + bag
    for (let i = 0; i < n - 1; i++) pb.set(x0 + 1 + i, ty + 1 + i, look.packColor || '#7a4e2c');
    if (!back) {
      pb.rect(x1 - 1, ty + n - 2, 3, 3, look.packColor || '#7a4e2c');
      pb.hline(x1 - 1, ty + n - 2, 3, lighten(look.packColor || '#7a4e2c', 0.2));
      pb.set(x1, ty + n - 1, C.y2);
    } else {
      pb.rect(x0 + 1, ty + n - 3, 5, 4, look.packColor || '#7a4e2c');
      pb.hline(x0 + 1, ty + n - 3, 5, lighten(look.packColor || '#7a4e2c', 0.2));
    }
  }
}

function paintHeadFrontBack(ctx, hy, back) {
  const { pb, look } = ctx;
  const skin = look.skin;
  const shade = look.skinShade;
  const rows = [
    [5, 10], [4, 11], [3, 12], [3, 12], [3, 12], [3, 12], [3, 12], [4, 11], [5, 10],
  ];
  const style = look.hairStyle;
  const hair = look.hair;
  const hairL = lighten(hair, 0.22);
  const hairD = darken(hair, 0.28);

  // long hair / ponytail pieces that sit behind the head+body in front view
  if (!back && (style === 'long' || style === 'bob')) {
    const len = style === 'long' ? 9 : 6;
    pb.rect(3, hy + 4, 2, len, hair);
    pb.rect(11, hy + 4, 2, len, hairD);
  }

  // skull
  rows.forEach(([a, b], r) => pb.hline(a, hy + r, b - a + 1, skin));
  if (back) {
    // everything is hair from behind, unless bald
    if (style === 'bald') {
      rows.forEach(([a, b], r) => pb.hline(a, hy + r, b - a + 1, skin));
      pb.hline(4, hy + 7, 8, shade);
    } else {
      rows.forEach(([a, b], r) => {
        if (r < 8) pb.hline(a, hy + r, b - a + 1, hair);
        else pb.hline(a + 1, hy + r, b - a - 1, hairD);
      });
      pb.hline(5, hy + 1, 4, hairL);
      pb.hline(5, hy + 2, 2, hairL);
      pb.vline(11, hy + 3, 5, hairD);
      pb.hline(4, hy + 7, 8, hairD);
    }
  } else {
    // face shading + features
    pb.hline(4, hy + 7, 8, skin);
    pb.hline(5, hy + 8, 6, shade);
    pb.set(4, hy + 6, shade);
    pb.set(11, hy + 6, shade);
    // eyes
    const eye = look.eyes || C.ink;
    pb.set(5, hy + 5, eye);
    pb.set(5, hy + 6, eye);
    pb.set(10, hy + 5, eye);
    pb.set(10, hy + 6, eye);
    if (look.child || look.build === 'child' || look.blush) {
      pb.set(4, hy + 7, C.blush);
      pb.set(11, hy + 7, C.blush);
    }
    pb.hline(7, hy + 7, 2, mix(skin, '#8a3d3d', 0.45));
    if (look.glasses) {
      pb.hline(4, hy + 5, 4, C.s4);
      pb.hline(9, hy + 5, 4, C.s4);
      pb.set(4, hy + 6, C.s4);
      pb.set(7, hy + 6, C.s4);
      pb.set(9, hy + 6, C.s4);
      pb.set(12, hy + 6, C.s4);
      pb.hline(4, hy + 7, 4, C.s3);
      pb.hline(9, hy + 7, 4, C.s3);
      pb.set(8, hy + 5, C.s4);
    }
  }

  if (!back && style !== 'bald') paintHairFront(ctx, hy, hair, hairL, hairD);
  if (back && style !== 'bald') paintHairBackExtras(ctx, hy, hair, hairD);

  if (!back && look.beard) {
    const b = look.beard;
    pb.hline(4, hy + 7, 8, b);
    pb.hline(4, hy + 8, 8, b);
    pb.hline(5, hy + 9, 6, darken(b, 0.12));
    pb.hline(6, hy + 10, 4, darken(b, 0.2));
    pb.hline(7, hy + 7, 2, mix(look.skin, '#8a3d3d', 0.5));
    if (look.mustache !== false) pb.hline(5, hy + 6, 6, b);
    pb.set(5, hy + 5, look.eyes || C.ink);
    pb.set(10, hy + 5, look.eyes || C.ink);
    pb.set(5, hy + 6, b);
    pb.set(10, hy + 6, b);
  }

  if (look.hat) paintHat(ctx, hy, back);
}

function paintHairFront(ctx, hy, hair, hairL, hairD) {
  const { pb, look } = ctx;
  const style = look.hairStyle;
  // cap of hair
  pb.hline(5, hy + 0, 6, hair);
  pb.hline(4, hy + 1, 8, hair);
  pb.hline(3, hy + 2, 10, hair);
  pb.hline(3, hy + 3, 10, hair);
  pb.hline(5, hy + 0, 3, hairL);
  pb.hline(4, hy + 1, 3, hairL);
  if (style === 'spiky') {
    pb.set(4, hy - 1, hair);
    pb.set(6, hy - 1, hair);
    pb.set(7, hy - 2, hair);
    pb.set(9, hy - 1, hair);
    pb.set(11, hy - 1, hair);
    pb.set(5, hy + 0, hair);
    pb.set(10, hy - 0, hair);
  }
  // fringe: broken edge over the forehead
  pb.set(3, hy + 4, hair);
  pb.set(12, hy + 4, hairD);
  pb.set(3, hy + 5, hair);
  pb.set(12, hy + 5, hairD);
  pb.set(4, hy + 4, hair);
  pb.set(11, hy + 4, hair);
  pb.set(6, hy + 4, hair);
  pb.set(9, hy + 4, hair);
  if (style === 'curly') {
    for (const x of [3, 5, 7, 9, 11]) pb.set(x, hy - 1, hair);
    pb.set(2, hy + 3, hair);
    pb.set(13, hy + 3, hairD);
    pb.set(2, hy + 4, hair);
    pb.set(13, hy + 4, hairD);
  }
  if (style === 'long' || style === 'bob') {
    pb.vline(3, hy + 4, 2, hair);
    pb.vline(12, hy + 4, 2, hairD);
  }
  if (style === 'tied' || style === 'ponytail') {
    pb.set(13, hy + 3, hair);
    pb.rect(13, hy + 4, 1, 3, hairD);
  }
  if (style === 'bun') {
    pb.rect(6, hy - 2, 4, 2, hair);
    pb.hline(6, hy - 2, 4, hairL);
  }
  if (style === 'braid') {
    pb.rect(12, hy + 5, 2, 7, hairD);
    for (let i = 0; i < 7; i += 2) pb.set(13, hy + 5 + i, hair);
  }
  if (style === 'parted') {
    pb.set(7, hy + 3, hair);
    pb.set(8, hy + 4, hair);
    pb.set(8, hy + 3, hairD);
  }
}

function paintHairBackExtras(ctx, hy, hair, hairD) {
  const { pb, look } = ctx;
  const style = look.hairStyle;
  if (style === 'long' || style === 'bob') {
    const len = style === 'long' ? 11 : 7;
    pb.rect(4, hy + 8, 8, len - 3, hair);
    pb.vline(11, hy + 8, len - 3, hairD);
    pb.hline(4, hy + len + 4, 8, hairD);
  }
  if (style === 'tied' || style === 'ponytail') {
    pb.rect(6, hy + 8, 4, 6, hair);
    pb.vline(9, hy + 8, 6, hairD);
    pb.hline(6, hy + 8, 4, look.ribbon || C.r2);
  }
  if (style === 'bun') {
    pb.rect(6, hy - 2, 4, 3, hair);
    pb.hline(6, hy - 2, 4, lighten(hair, 0.2));
  }
  if (style === 'braid') {
    pb.rect(7, hy + 8, 2, 8, hairD);
    for (let i = 0; i < 8; i += 2) pb.hline(7, hy + 8 + i, 2, hair);
  }
  if (style === 'spiky') {
    for (const x of [4, 7, 10]) pb.set(x, hy - 1, hair);
    pb.set(8, hy - 2, hair);
  }
  if (style === 'curly') for (const x of [3, 5, 7, 9, 11]) pb.set(x, hy - 1, hair);
}

function paintHat(ctx, hy, back) {
  const { pb, look } = ctx;
  const h = look.hatColor || look.top;
  const hl = lighten(h, 0.2);
  const hd = darken(h, 0.28);
  switch (look.hat) {
    case 'cap':
      pb.hline(4, hy - 0, 8, h);
      pb.hline(3, hy + 1, 10, h);
      pb.hline(3, hy + 2, 10, hd);
      pb.hline(5, hy - 1, 6, hl);
      if (!back) pb.hline(3, hy + 3, 7, hd);
      break;
    case 'wizard':
      pb.hline(7, hy - 3, 2, h);
      pb.hline(6, hy - 2, 4, h);
      pb.hline(5, hy - 1, 6, h);
      pb.hline(4, hy + 0, 8, h);
      pb.hline(2, hy + 2, 12, hd);
      pb.hline(3, hy + 1, 10, h);
      pb.vline(10, hy - 1, 2, hd);
      pb.hline(4, hy + 1, 8, look.trim || C.y2);
      break;
    case 'hood':
      pb.hline(4, hy - 1, 8, h);
      pb.hline(3, hy + 0, 10, h);
      pb.hline(2, hy + 1, 12, h);
      pb.rect(2, hy + 2, 2, 8, h);
      pb.rect(12, hy + 2, 2, 8, hd);
      if (!back) {
        pb.hline(4, hy + 2, 8, h);
        pb.hline(4, hy + 3, 8, hd);
      } else {
        pb.rect(4, hy + 2, 8, 8, h);
        pb.vline(11, hy + 2, 8, hd);
      }
      pb.hline(5, hy - 1, 3, hl);
      break;
    case 'helm':
      pb.hline(4, hy - 0, 8, C.s4);
      pb.hline(3, hy + 1, 10, C.s3);
      pb.hline(3, hy + 2, 10, C.s3);
      pb.hline(3, hy + 3, 10, C.s2);
      pb.hline(5, hy - 0, 3, C.s5);
      if (!back) {
        pb.vline(7, hy + 3, 3, C.s2);
        pb.vline(8, hy + 3, 3, C.s2);
      }
      if (look.plume) {
        pb.rect(7, hy - 3, 2, 3, look.plume);
        pb.set(9, hy - 2, look.plume);
        pb.set(6, hy - 2, darken(look.plume, 0.25));
      }
      break;
    case 'headband':
      pb.hline(3, hy + 3, 10, h);
      pb.hline(3, hy + 4, 10, hd);
      if (back) pb.rect(12, hy + 4, 2, 3, h);
      break;
    case 'straw':
      pb.hline(5, hy - 0, 6, '#e3c97a');
      pb.hline(4, hy + 1, 8, '#e3c97a');
      pb.hline(1, hy + 2, 14, '#d4b45c');
      pb.hline(2, hy + 3, 12, '#b8933f');
      pb.hline(4, hy + 1, 8, h);
      break;
    case 'beret':
      pb.hline(4, hy - 1, 9, h);
      pb.hline(3, hy + 0, 10, h);
      pb.hline(3, hy + 1, 10, hd);
      pb.set(8, hy - 2, hd);
      break;
    case 'merchant':
      pb.hline(4, hy - 1, 8, h);
      pb.hline(3, hy + 0, 10, h);
      pb.hline(2, hy + 1, 12, hd);
      pb.hline(4, hy + 0, 8, hl);
      pb.set(11, hy - 1, look.feather || C.r2);
      pb.set(12, hy - 2, look.feather || C.r2);
      break;
    default:
  }
}

function paintHeld(ctx, view) {
  const { pb, look, L, bob } = ctx;
  if (!look.held) return;
  const x = view === 'side' ? 13 : 14;
  const top = L.headTop - 2;
  if (look.held === 'staff') {
    pb.vline(x, top + 2, L.bootTop - top, '#8a5a30');
    pb.vline(x, top + 2, 1, '#a97b47');
    pb.ellipse(x, top + 1, 1, 1, look.staffGem || C.c2);
    pb.set(x, top, C.c3);
  } else if (look.held === 'spear') {
    pb.vline(x, top + 3, L.bootTop - top - 1, '#8a5a30');
    pb.rect(x - 0, top, 1, 3, C.s5);
    pb.set(x - 1, top + 2, C.s4);
    pb.set(x + 1, top + 2, C.s4);
    pb.set(x, top - 0, C.white);
  } else if (look.held === 'book') {
    if (view === 'front') {
      pb.rect(5, L.torsoTop + 2 - bob, 6, 4, look.bookColor || '#7a3a3a');
      pb.hline(5, L.torsoTop + 2 - bob, 6, lighten(look.bookColor || '#7a3a3a', 0.25));
      pb.vline(8, L.torsoTop + 2 - bob, 4, C.y1);
    }
  } else if (look.held === 'lantern') {
    pb.vline(x, L.torsoTop + 3, 3, '#6a4326');
    pb.rect(x - 1, L.torsoTop + 6, 3, 3, C.y2);
    pb.set(x, L.torsoTop + 7, C.y3);
    pb.hline(x - 1, L.torsoTop + 5, 3, C.ink2);
  }
}

// ----------------------------------------------------------------------------
// Side view (facing left)
// ----------------------------------------------------------------------------
function paintSide(ctx) {
  const { pb, look, L, bob, step, swing, frame } = ctx;
  const ty = L.torsoTop - bob;
  const hy = L.headTop - bob;
  const stocky = look.build === 'stocky';
  const x0 = 5;
  const x1 = stocky ? 11 : 10;
  const robe = look.outfit === 'robe';
  const dress = look.outfit === 'dress';

  // cape trailing behind (right side)
  if (look.cape) {
    const sway = step ? 1 : 0;
    pb.rect(10, ty + 1, 3 + sway, L.legTop - ty + 3, look.cape);
    pb.vline(12 + sway, ty + 1, L.legTop - ty + 3, darken(look.cape, 0.25));
    pb.hline(10, L.legTop + 3, 3 + sway, darken(look.cape, 0.3));
  }

  // ---- legs ----
  const legStart = L.legTop - bob;
  const legH = L.bootTop - legStart;
  if (!robe) {
    const front = step ? (swing === -1 ? -2 : 2) : 0; // offset of the leading leg
    const spots = step ? [[6 - front, true], [6 + front, false]] : [[6, true], [6, false]];
    for (const [lx, isFront] of spots) {
      const col = isFront ? look.pants : darken(look.pants, 0.22);
      pb.rect(lx, legStart, 3, legH, col);
      const bx = lx - 1;
      pb.rect(bx, L.bootTop, 5, 2, isFront ? look.boots : darken(look.boots, 0.2));
      pb.hline(bx, L.bootTop + 1, 5, darken(look.boots, 0.4));
      pb.set(bx, L.bootTop, lighten(look.boots, 0.12));
    }
  } else {
    pb.rect(5 - (step ? 1 : 0), L.bootTop + 1, 2, 1, look.boots);
    pb.rect(8 + (step ? 1 : 0), L.bootTop + 1, 2, 1, look.boots);
  }

  // ---- torso ----
  pb.rect(x0, ty, x1 - x0 + 1, L.torsoLen, look.top);
  pb.vline(x1, ty, L.torsoLen, look.topDark);
  pb.vline(x0, ty + 1, L.torsoLen - 1, look.topLight);
  pb.hline(x0, ty, x1 - x0 + 1, look.trim);
  if (look.outfit === 'armor') {
    pb.rect(x0, ty, x1 - x0 + 1, L.torsoLen, C.s3);
    pb.rect(x0 + 1, ty + 1, x1 - x0 - 1, L.torsoLen - 2, look.top);
    pb.rect(x0 - 1, ty, 3, 2, C.s4);
  }
  if (look.outfit === 'apron') {
    pb.rect(x0, ty + 1, 2, L.torsoLen + 1, look.apron || '#e5d8b4');
    pb.rect(x0, L.legTop, 2, 2, look.apron || '#e5d8b4');
  }
  if (look.outfit === 'coat') {
    pb.rect(x0, L.legTop, x1 - x0 + 1, 2, look.topDark);
    pb.hline(x0, ty + 1, 1, look.inner || C.white);
  }
  if (robe || dress) {
    const sy = ty + L.torsoLen - (dress ? 1 : 0);
    const end = robe ? L.bootTop : L.legTop + (L.child ? 0 : 2);
    for (let y = sy; y <= end; y++) {
      const sp = Math.min(dress ? 2 : 1, y - sy + 1);
      pb.rect(x0 - sp, y, x1 - x0 + 1 + sp * 2, 1, look.top);
      pb.set(x1 + sp, y, look.topDark);
      pb.set(x0 - sp, y, look.topLight);
    }
    pb.hline(x0 - 2, end, x1 - x0 + 5, look.trim);
    if (robe) pb.hline(x0 - 1, L.bootTop + 1, x1 - x0 + 3, darken(look.trim, 0.3));
  }
  pb.hline(x0, ty + L.torsoLen - 2, x1 - x0 + 1, look.belt);
  if (look.scarf) {
    pb.hline(x0, ty, x1 - x0 + 1, look.scarf);
    pb.rect(x1 - 1, ty + 1, 2, 4, look.scarf);
    pb.hline(x1 - 1, ty + 4, 2, darken(look.scarf, 0.25));
  }
  if (look.pack) {
    pb.rect(x1 - 2, ty + 2, 4, 4, look.packColor || '#7a4e2c');
    pb.hline(x1 - 2, ty + 2, 4, lighten(look.packColor || '#7a4e2c', 0.2));
    pb.set(x1 - 1, ty + 3, C.y2);
    pb.line(x0 + 1, ty + 1, x1 - 2, ty + 4, look.packColor || '#7a4e2c');
  }

  // ---- head ----
  const skin = look.skin;
  const rows = [[5, 10], [4, 11], [4, 11], [4, 11], [4, 11], [4, 11], [4, 11], [4, 10], [5, 9]];
  const hair = look.hair;
  const hairL = lighten(hair, 0.22);
  const hairD = darken(hair, 0.28);
  const style = look.hairStyle;
  const bald = style === 'bald';
  rows.forEach(([a, b], r) => pb.hline(a, hy + r, b - a + 1, skin));
  pb.set(3, hy + 6, skin); // nose
  pb.hline(5, hy + 8, 4, look.skinShade);
  pb.set(5, hy + 5, look.eyes || C.ink);
  pb.set(5, hy + 6, look.eyes || C.ink);
  if (look.child || look.blush) pb.set(6, hy + 7, C.blush);
  pb.set(4, hy + 7, mix(skin, '#8a3d3d', 0.45));
  if (look.glasses) {
    pb.hline(3, hy + 5, 4, C.s4);
    pb.set(3, hy + 6, C.s4);
    pb.set(6, hy + 6, C.s4);
    pb.hline(7, hy + 5, 3, C.s3);
  }
  if (!bald) {
    // hair mass: top + back
    pb.hline(5, hy + 0, 6, hair);
    pb.hline(4, hy + 1, 8, hair);
    pb.hline(4, hy + 2, 8, hair);
    pb.hline(4, hy + 3, 5, hair);
    pb.rect(8, hy + 3, 4, 5, hair);
    pb.hline(5, hy + 0, 3, hairL);
    pb.hline(4, hy + 1, 3, hairL);
    pb.vline(11, hy + 3, 5, hairD);
    pb.hline(8, hy + 8, 2, hairD);
    pb.set(5, hy + 3, hair);
    pb.set(6, hy + 4, hair);
    pb.set(4, hy + 4, hair);
    if (style === 'long' || style === 'bob') {
      const len = style === 'long' ? 9 : 5;
      pb.rect(8, hy + 8, 4, len, hair);
      pb.vline(11, hy + 8, len, hairD);
    }
    if (style === 'tied' || style === 'ponytail') {
      pb.rect(12, hy + 3, 2, 6, hair);
      pb.vline(13, hy + 3, 6, hairD);
      pb.set(12, hy + 3, look.ribbon || C.r2);
    }
    if (style === 'bun') {
      pb.rect(9, hy - 2, 4, 3, hair);
      pb.hline(9, hy - 2, 4, hairL);
    }
    if (style === 'braid') {
      pb.rect(11, hy + 5, 2, 8, hairD);
      for (let i = 0; i < 8; i += 2) pb.set(12, hy + 5 + i, hair);
    }
    if (style === 'spiky') {
      for (const x of [5, 7, 9, 11]) pb.set(x, hy - 1, hair);
      pb.set(8, hy - 2, hair);
    }
    if (style === 'curly') for (const x of [4, 6, 8, 10]) pb.set(x, hy - 1, hair);
  }
  if (look.beard) {
    pb.rect(4, hy + 7, 5, 2, look.beard);
    pb.hline(5, hy + 9, 4, darken(look.beard, 0.15));
    pb.hline(5, hy + 10, 2, darken(look.beard, 0.25));
    pb.set(3, hy + 6, look.beard);
    pb.set(4, hy + 6, look.beard);
  }

  // ---- arm (in front of the torso) ----
  const sleeve = look.outfit === 'armor' ? C.s3 : look.top;
  const ax = 6 + swing * 2;
  const ay = ty + 1;
  const len = L.child ? 3 : 4;
  pb.rect(ax, ay, 2, len, sleeve);
  pb.hline(ax, ay, 2, lighten(sleeve, 0.15));
  pb.vline(ax + 1, ay, len, darken(sleeve, 0.18));
  pb.rect(ax, ay + len, 2, 1, look.gloves || skin);

  if (look.hat) paintHatSide(ctx, hy);
  paintHeld(ctx, 'side');
}

function paintHatSide(ctx, hy) {
  const { pb, look } = ctx;
  const h = look.hatColor || look.top;
  const hl = lighten(h, 0.2);
  const hd = darken(h, 0.28);
  switch (look.hat) {
    case 'cap':
      pb.hline(5, hy - 0, 7, h);
      pb.hline(4, hy + 1, 8, h);
      pb.hline(2, hy + 2, 10, hd);
      pb.hline(6, hy - 1, 4, hl);
      break;
    case 'wizard':
      pb.hline(8, hy - 3, 2, h);
      pb.hline(7, hy - 2, 4, h);
      pb.hline(5, hy - 1, 7, h);
      pb.hline(4, hy + 0, 8, h);
      pb.hline(2, hy + 2, 12, hd);
      pb.hline(3, hy + 1, 10, h);
      pb.hline(4, hy + 1, 8, look.trim || C.y2);
      break;
    case 'hood':
      pb.hline(4, hy - 1, 8, h);
      pb.hline(3, hy + 0, 10, h);
      pb.rect(8, hy + 1, 5, 9, h);
      pb.rect(4, hy + 1, 4, 3, h);
      pb.hline(4, hy + 3, 4, hd);
      pb.vline(12, hy + 1, 9, hd);
      pb.hline(5, hy - 1, 3, hl);
      break;
    case 'helm':
      pb.hline(5, hy - 0, 7, C.s4);
      pb.hline(4, hy + 1, 8, C.s3);
      pb.hline(4, hy + 2, 8, C.s3);
      pb.hline(4, hy + 3, 8, C.s2);
      pb.hline(5, hy + 0, 3, C.s5);
      if (look.plume) {
        pb.rect(8, hy - 3, 2, 3, look.plume);
        pb.set(10, hy - 2, look.plume);
        pb.set(11, hy - 1, darken(look.plume, 0.25));
      }
      break;
    case 'headband':
      pb.hline(4, hy + 3, 8, h);
      pb.rect(12, hy + 3, 2, 3, h);
      break;
    case 'straw':
      pb.hline(5, hy - 0, 6, '#e3c97a');
      pb.hline(4, hy + 1, 8, h);
      pb.hline(1, hy + 2, 14, '#d4b45c');
      pb.hline(2, hy + 3, 12, '#b8933f');
      break;
    case 'beret':
      pb.hline(5, hy - 1, 8, h);
      pb.hline(4, hy + 0, 9, h);
      pb.hline(4, hy + 1, 8, hd);
      break;
    case 'merchant':
      pb.hline(5, hy - 1, 7, h);
      pb.hline(4, hy + 0, 8, h);
      pb.hline(2, hy + 1, 11, hd);
      pb.set(11, hy - 1, look.feather || C.r2);
      pb.set(12, hy - 2, look.feather || C.r2);
      break;
    default:
  }
}

// ----------------------------------------------------------------------------
// Sheets
// ----------------------------------------------------------------------------
export function paintCharacterSheet(look) {
  const sheet = new PixBuf(CHAR_W * CHAR_FRAMES, CHAR_H * 3);
  ['down', 'up', 'left'].forEach((dir, row) => {
    for (let f = 0; f < CHAR_FRAMES; f++) {
      sheet.blit(paintCharacter(look, dir, f), f * CHAR_W, row * CHAR_H);
    }
  });
  return sheet;
}

const DIR_ROW = { down: 0, up: 1, left: 2, right: 2 };
export function charFrameRect(dir, frame) {
  return { sx: frame * CHAR_W, sy: (DIR_ROW[dir] ?? 0) * CHAR_H, sw: CHAR_W, sh: CHAR_H, flipX: dir === 'right' };
}

// ----------------------------------------------------------------------------
// Looks
// ----------------------------------------------------------------------------
export const HERO_LOOK = {
  skin: 'light', hair: '#5a2f26', hairStyle: 'spiky', outfit: 'coat', top: '#3a5aa8', trim: '#e0b84a',
  inner: '#f0e6cc', pants: '#40445f', boots: '#5a3624', belt: '#7a4a28', scarf: '#2fa7a0', pack: true, blush: false,
};

/** Hand-tuned looks for named characters. Keys are entity ids. */
export const NPC_LOOKS = {
  npc_mira: { skin: 'light', hair: '#3b2a3f', hairStyle: 'tied', outfit: 'dress', top: '#6fb88c', trim: '#f0e6b0', ribbon: '#e8785a', belt: '#7a4a28', blush: true, boots: '#5a3a28' },
  npc_elara: { skin: 'tan', hair: '#d8d4c8', hairStyle: 'long', outfit: 'robe', top: '#4f8058', trim: '#c9b36a', hat: 'hood', hatColor: '#3c6446', pack: true },
  npc_rhea: { skin: 'pale', hair: '#6a4a8a', hairStyle: 'bob', outfit: 'dress', top: '#9a84b8', trim: '#f2e0ff', blush: true, boots: '#4a3a5a' },
  npc_lirien: { skin: 'pale', hair: '#e8e8f0', hairStyle: 'long', outfit: 'robe', top: '#5d78a8', trim: '#f0d878', glasses: true, held: 'book', bookColor: '#8a3a3a' },
  npc_maera: { skin: 'light', hair: '#8a6a4a', hairStyle: 'bun', outfit: 'robe', top: '#35539a', trim: '#e0c860', glasses: true },
  npc_edda: { skin: 'pale', hair: '#b8b4b8', hairStyle: 'bun', outfit: 'dress', top: '#b58aa0', trim: '#f0e0e8', apron: '#e8dcc8' },
  npc_nilo: { skin: 'dark', hair: '#2a1f1a', hairStyle: 'short', outfit: 'tunic', top: '#6ca06c', trim: '#d8e0a0', vest: '#8a6a3a' },
  npc_teren: { skin: 'tan', hair: '#3a2a20', hairStyle: 'short', outfit: 'coat', top: '#8a6a4a', trim: '#d0b070', beard: '#3a2a20', inner: '#ddd0b0', stocky: true },
  npc_dira: { skin: 'tan', hair: '#2a2a3a', hairStyle: 'ponytail', outfit: 'armor', top: '#4a6a9a', trim: '#e8d070', hat: 'helm', plume: '#c24b49', held: 'spear', pants: '#35405a' },
  npc_bren: { skin: 'light', hair: '#a07a4a', hairStyle: 'short', outfit: 'tunic', top: '#c0b090', trim: '#6a5a40', hat: 'cap', hatColor: '#6a5a40', vest: '#7a6a50', glasses: true },
  npc_salla: { skin: 'tan', hair: '#2a1a1a', hairStyle: 'ponytail', outfit: 'dress', top: '#8aa0c8', trim: '#f0f0ff', ribbon: '#f1c94b', blush: true },
  npc_ruli: { skin: 'tan', hair: '#6a3a1a', hairStyle: 'short', outfit: 'tunic', top: '#f0c070', trim: '#fff0c0', build: 'child', blush: true, pants: '#7a5a3a' },
  npc_venn: { skin: 'pale', hair: '#e0e0ea', hairStyle: 'long', outfit: 'robe', top: '#a8a0c8', trim: '#f2e8a0', glasses: true, held: 'staff', staffGem: '#b392d9' },
  npc_timm: { skin: 'light', hair: '#c88a3a', hairStyle: 'spiky', outfit: 'tunic', top: '#6cc0e0', trim: '#fff', build: 'child', blush: true, pants: '#4a5a7a' },
  npc_nila: { skin: 'tan', hair: '#4a2f1f', hairStyle: 'braid', outfit: 'apron', top: '#5fb06f', trim: '#d6f0b0', apron: '#e8e0c0', hat: 'headband', hatColor: '#e8c84a' },
  npc_korr: { skin: 'dark', hair: '#2a2a2a', hairStyle: 'bald', outfit: 'apron', top: '#7a7a82', trim: '#b0b0b8', apron: '#8a6a4a', beard: '#2a2a2a', build: 'stocky', gloves: '#5a4a3a' },
  npc_mirae: { skin: 'light', hair: '#7a2a4a', hairStyle: 'curly', outfit: 'dress', top: '#d880a0', trim: '#ffe0ec', blush: true, hat: 'beret', hatColor: '#a8486a' },
  npc_garet: { skin: 'tan', hair: '#5a3a24', hairStyle: 'short', outfit: 'tunic', top: '#a07050', trim: '#d0a070', build: 'stocky', hat: 'headband', hatColor: '#c24b49', pack: true, packColor: '#6a4a2a' },
  npc_lyn: { skin: 'light', hair: '#c88a4a', hairStyle: 'ponytail', outfit: 'armor', top: '#5a82b0', trim: '#e0e0f0', held: 'spear', hat: 'helm', plume: '#4d8ad0', pants: '#35405a' },
  npc_ode: { skin: 'tan', hair: '#2a1a10', hairStyle: 'short', outfit: 'coat', top: '#b88a48', trim: '#f0d890', hat: 'merchant', hatColor: '#7a3a2a', beard: '#2a1a10', inner: '#f0e6cc', pack: true, packColor: '#5a3a1a' },
  npc_guard: { skin: 'light', hair: '#4a3a2a', hairStyle: 'short', outfit: 'armor', top: '#5a8ae0', trim: '#f0e090', hat: 'helm', plume: '#e8c84a', held: 'spear', pants: '#35405a' },
  npc_henn: { skin: 'pale', hair: '#f0eee8', hairStyle: 'bald', outfit: 'robe', top: '#c8b890', trim: '#8a6a3a', beard: '#f0eee8', held: 'staff', staffGem: '#f1c94b', stocky: false },
  npc_renda: { skin: 'dark', hair: '#1a1a22', hairStyle: 'ponytail', outfit: 'armor', top: '#4a78c8', trim: '#e8d878', hat: 'helm', plume: '#c24b49', held: 'spear', pants: '#35405a' },
  npc_soli: { skin: 'tan', hair: '#7a4a1a', hairStyle: 'curly', outfit: 'coat', top: '#c89850', trim: '#fff0b8', hat: 'merchant', hatColor: '#4a6a3a', inner: '#f0e6cc', pack: true, packColor: '#6a4a2a' },
  npc_nima: { skin: 'light', hair: '#6a3a2a', hairStyle: 'bun', outfit: 'dress', top: '#c08ca0', trim: '#fce8f0', apron: '#f0e6d0', blush: true },
  npc_tori: { skin: 'light', hair: '#e0a84a', hairStyle: 'short', outfit: 'tunic', top: '#f0d080', trim: '#fff6d0', build: 'child', blush: true, pants: '#7a5a3a' },
  npc_jarek: { skin: 'tan', hair: '#3a2a20', hairStyle: 'short', outfit: 'apron', top: '#8a7060', trim: '#c0a080', apron: '#6a5440', beard: '#4a3426', build: 'stocky', gloves: '#5a4a3a' },
};

const PALETTE_TOPS = ['#c0392b', '#2c82c9', '#27ae60', '#8e44ad', '#d68910', '#16a085'];

/** Build a look for an entity that has no hand-tuned entry, using its tint colour. */
export function deriveLook(id, color) {
  const r = rng(hashStr(String(id)));
  const skins = ['pale', 'light', 'light', 'tan', 'tan', 'dark'];
  const styles = ['short', 'long', 'ponytail', 'bun', 'curly', 'bob'];
  const hairs = ['#3a2a20', '#5a3a24', '#8a6a3a', '#2a2a2a', '#c8a050', '#7a3a2a', '#d8d4c8'];
  const outfits = ['tunic', 'coat', 'dress', 'robe'];
  return {
    skin: skins[Math.floor(r() * skins.length)],
    hair: hairs[Math.floor(r() * hairs.length)],
    hairStyle: styles[Math.floor(r() * styles.length)],
    outfit: outfits[Math.floor(r() * outfits.length)],
    top: color || PALETTE_TOPS[Math.floor(r() * PALETTE_TOPS.length)],
  };
}
