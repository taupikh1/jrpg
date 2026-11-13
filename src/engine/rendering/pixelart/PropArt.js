import { PixBuf, makeStrip, darken, lighten, mix, rng } from './PixBuf.js';
import { C } from './Palette.js';

/**
 * World props and interactables. Each entry paints one frame into a PixBuf of (w x h).
 * Sprites are drawn anchored at bottom-centre of the entity.
 */
const sparkle = (pb, x, y, f, col = C.white) => {
  // 4-frame twinkle
  const s = f % 4;
  if (s === 0) pb.set(x, y, col);
  if (s === 1) { pb.set(x, y, col); pb.set(x - 1, y, mix(col, C.ink, 0.35)); pb.set(x + 1, y, mix(col, C.ink, 0.35)); pb.set(x, y - 1, mix(col, C.ink, 0.35)); pb.set(x, y + 1, mix(col, C.ink, 0.35)); }
  if (s === 2) { pb.set(x, y, col); }
};

const shadowEllipse = (pb, cx, cy, rx) => pb.ellipse(cx, cy, rx, 1.3, '#14102455');

const woodPost = (pb, x, y, h, w = 2) => {
  pb.rect(x, y, w, h, '#835731');
  pb.vline(x, y, h, '#a97b47');
  pb.vline(x + w - 1, y, h, '#5a3a24');
};

export const PROPS = {
  signpost: {
    w: 16, h: 20, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 8, 18, 5);
      woodPost(pb, 7, 7, 12);
      pb.rect(2, 3, 12, 7, '#b88a52');
      pb.hline(2, 3, 12, '#dcb878');
      pb.hline(2, 9, 12, '#7a5430');
      pb.vline(13, 3, 7, '#8a6238');
      pb.set(3, 4, '#5a3a24');
      pb.set(12, 8, '#5a3a24');
      pb.hline(4, 5, 7, '#5a3a24');
      pb.hline(4, 7, 5, '#7a5430');
      pb.set(11, 4, '#5a3a24');
      pb.set(12, 5, '#5a3a24');
      pb.set(11, 6, '#5a3a24');
    },
  },
  milestone: {
    w: 12, h: 16, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 6, 14, 5);
      pb.rect(2, 3, 8, 11, '#9a9bb2');
      pb.rect(3, 2, 6, 1, '#9a9bb2');
      pb.hline(3, 2, 6, '#c8c9da');
      pb.vline(2, 3, 11, '#c8c9da');
      pb.vline(9, 3, 11, '#6c6d86');
      pb.hline(2, 13, 8, '#5a5b72');
      pb.hline(4, 5, 4, '#4a4c62');
      pb.hline(4, 7, 3, '#4a4c62');
      pb.hline(4, 9, 4, '#4a4c62');
      pb.set(4, 11, '#4f8a48');
      pb.set(5, 11, '#4f8a48');
    },
  },
  noticeboard: {
    w: 22, h: 22, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 11, 20, 8);
      woodPost(pb, 3, 12, 8, 2);
      woodPost(pb, 17, 12, 8, 2);
      pb.rect(1, 2, 20, 13, '#6a4326');
      pb.rect(2, 3, 18, 11, '#b88a52');
      pb.hline(2, 3, 18, '#dcb878');
      const papers = [[3, 4, 5, 6, '#f8f1de'], [9, 5, 4, 5, '#f1e0a8'], [14, 4, 5, 7, '#f8f1de']];
      for (const [x, y, w, h, c] of papers) {
        pb.rect(x, y, w, h, c);
        pb.hline(x + 1, y + 2, w - 2, '#8a7a6a');
        pb.hline(x + 1, y + 4, w - 3, '#8a7a6a');
        pb.set(x + Math.floor(w / 2), y, '#c24b49');
      }
      pb.rect(0, 1, 22, 1, '#8a5a30');
    },
  },
  well: {
    w: 24, h: 28, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 12, 25, 9);
      // basin
      pb.rect(3, 15, 18, 9, '#8a8ba2');
      pb.ellipse(11.5, 15, 9, 4, '#a4a5bb');
      pb.ellipse(11.5, 15, 7, 2.6, '#1c3a6a');
      pb.ellipse(11.5, 15, 5.5, 1.8, '#2b5b9b');
      pb.hline(8, 15, 3, '#6db3e2');
      for (let y = 18; y < 24; y += 3) {
        pb.hline(3, y, 18, '#64657b');
        pb.vline(y % 2 ? 7 : 11, y - 3, 3, '#64657b');
        pb.vline(y % 2 ? 15 : 18, y - 3, 3, '#64657b');
      }
      pb.hline(3, 23, 18, '#444459');
      pb.vline(3, 16, 8, '#c4c5d6');
      pb.vline(20, 16, 8, '#5a5b72');
      // posts + roof
      pb.rect(4, 5, 2, 12, '#835731');
      pb.rect(18, 5, 2, 12, '#5a3a24');
      pb.rect(0, 1, 24, 3, '#b8453d');
      pb.rect(3, 0, 18, 1, '#d9685a');
      pb.hline(0, 4, 24, '#8f3030');
      pb.hline(3, 2, 18, '#d9685a');
      pb.vline(11, 4, 5, '#5a3a24');
      pb.rect(10, 9, 3, 3, '#a97b47');
    },
  },
  stump: {
    w: 20, h: 18, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 10, 16, 8);
      pb.rect(3, 7, 14, 8, '#6a4326');
      pb.ellipse(9.5, 7, 7, 3.5, '#a97b47');
      pb.ellipse(9.5, 7, 5.2, 2.5, '#cfa66b');
      pb.ellipse(9.5, 7, 3, 1.5, '#a97b47');
      pb.set(9, 7, '#835731');
      pb.vline(3, 8, 7, '#835731');
      pb.vline(16, 8, 7, '#38231a');
      for (const x of [6, 9, 12]) pb.vline(x, 10, 4, '#5a3a24');
      pb.hline(2, 15, 3, '#5a3a24');
      pb.hline(15, 15, 3, '#38231a');
      pb.set(14, 4, '#4f8a48');
      pb.set(15, 5, '#4f8a48');
    },
  },
  cart: {
    w: 28, h: 20, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 14, 18, 11);
      // box tilted
      pb.rect(4, 6, 18, 8, '#835731');
      pb.hline(4, 6, 18, '#cfa66b');
      pb.vline(4, 6, 8, '#a97b47');
      pb.vline(21, 6, 8, '#5a3a24');
      for (let x = 7; x < 21; x += 4) pb.vline(x, 7, 7, '#5a3a24');
      pb.hline(4, 13, 18, '#38231a');
      // broken plank
      pb.line(20, 5, 26, 10, '#a97b47');
      pb.line(20, 6, 26, 11, '#6a4326');
      // wheel (left, intact)
      pb.ellipse(8, 14, 4, 4, '#5a3a24');
      pb.ellipse(8, 14, 2.2, 2.2, '#a97b47');
      pb.set(8, 14, '#38231a');
      pb.line(4, 14, 12, 14, '#38231a');
      pb.line(8, 10, 8, 18, '#38231a');
      // missing wheel: axle stub + dust
      pb.rect(21, 14, 3, 2, '#38231a');
      // spilled sacks
      pb.rect(10, 3, 6, 4, '#d8c898');
      pb.hline(10, 3, 6, '#f0e6c0');
      pb.set(12, 4, '#a98458');
      pb.rect(23, 15, 4, 3, '#d8c898');
      pb.hline(23, 15, 4, '#f0e6c0');
    },
  },
  fountain: {
    w: 24, h: 34, frames: 4, fps: 6,
    paint(pb, f) {
      // pillar standing in the plaza pool (the pool itself is drawn by the tilemap)
      pb.ellipse(11.5, 31, 6, 2.4, '#8a8ba2');
      pb.ellipse(11.5, 30, 5, 1.8, '#c4c5d6');
      pb.rect(8, 16, 7, 14, '#a4a5bb');
      pb.vline(8, 16, 14, '#d6d7e3');
      pb.vline(14, 16, 14, '#64657b');
      pb.ellipse(11.5, 16, 7, 3, '#c4c5d6');
      pb.ellipse(11.5, 16, 5.5, 2, '#3f84c6');
      pb.rect(10, 9, 3, 7, '#a4a5bb');
      pb.vline(10, 9, 7, '#d6d7e3');
      pb.ellipse(11.5, 9, 4, 1.6, '#c4c5d6');
      const h = 5 + (f % 2);
      pb.vline(11, 8 - h, h, '#aadff3');
      pb.vline(12, 9 - h, h, '#6db3e2');
      pb.set(9, 11 + (f % 2), '#aadff3');
      pb.set(14, 11 + ((f + 1) % 2), '#aadff3');
      pb.set(7, 15, '#6db3e2');
      pb.set(16, 15, '#6db3e2');
      pb.set(11, 7 - h, '#ffffff');
    },
  },
  echostone: {
    w: 16, h: 26, frames: 4, fps: 4,
    paint(pb, f) {
      shadowEllipse(pb, 8, 24, 6);
      pb.rect(3, 6, 10, 18, '#7b7c94');
      pb.rect(4, 3, 8, 3, '#7b7c94');
      pb.rect(5, 2, 6, 1, '#7b7c94');
      pb.hline(5, 2, 6, '#b2b3c5');
      pb.vline(3, 6, 18, '#a4a5bb');
      pb.vline(12, 6, 18, '#4e4f66');
      pb.hline(3, 23, 10, '#3a3a50');
      pb.set(4, 5, '#a4a5bb');
      const glow = [C.c1, C.c2, C.c3, C.c2][f];
      const dim = [C.c0, C.c1, C.c2, C.c1][f];
      pb.vline(8, 8, 9, dim);
      pb.hline(6, 11, 5, glow);
      pb.hline(5, 15, 2, dim);
      pb.hline(9, 15, 2, dim);
      pb.set(8, 6, glow);
      pb.set(7, 19, dim);
      pb.set(9, 19, dim);
      pb.hline(7, 20, 3, glow);
      sparkle(pb, 13, 4 + (f % 2), f + 1, C.c3);
      pb.set(4, 22, '#4f8a48');
      pb.set(5, 23, '#4f8a48');
    },
  },
  carving: {
    w: 18, h: 22, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 9, 20, 7);
      pb.rect(3, 4, 12, 16, '#c8b690');
      pb.rect(4, 2, 10, 2, '#c8b690');
      pb.hline(4, 2, 10, '#e8dcb8');
      pb.vline(3, 4, 16, '#e0d0a8');
      pb.vline(14, 4, 16, '#8a7a58');
      pb.hline(3, 19, 12, '#6a5a3c');
      // spiral glyph
      const g = '#6a5a3c';
      pb.hline(6, 6, 6, g);
      pb.vline(11, 6, 6, g);
      pb.hline(6, 11, 6, g);
      pb.vline(6, 8, 4, g);
      pb.hline(6, 8, 3, g);
      pb.hline(7, 14, 4, g);
      pb.set(9, 9, g);
      pb.set(4, 17, '#4f8a48');
      pb.set(5, 18, '#4f8a48');
    },
  },
  stream: {
    w: 24, h: 12, frames: 4, fps: 4,
    paint(pb, f) {
      pb.ellipse(11.5, 6, 11, 4.5, '#3b7d3d');
      pb.ellipse(11.5, 6, 10, 3.8, '#6d4c33');
      pb.ellipse(11.5, 6, 9, 3.2, '#2b5b9b');
      pb.ellipse(11.5, 6, 7, 2.2, '#3f84c6');
      for (let i = 0; i < 3; i++) pb.hline(4 + ((i * 6 + f * 2) % 14), 4 + i, 3, '#aadff3');
      for (const [x, y] of [[3, 8], [19, 3], [20, 8]]) {
        pb.rect(x, y, 3, 2, '#8a8ba2');
        pb.hline(x, y, 2, '#c4c5d6');
      }
      sparkle(pb, 12, 5, f, C.white);
    },
  },
  ancienttree: {
    w: 44, h: 52, frames: 2, fps: 1.5,
    paint(pb, f) {
      shadowEllipse(pb, 22, 49, 15);
      // roots + trunk
      pb.rect(16, 28, 12, 22, '#5a3a24');
      pb.rect(14, 44, 16, 5, '#5a3a24');
      pb.vline(16, 28, 21, '#835731');
      pb.vline(27, 28, 21, '#38231a');
      pb.rect(10, 47, 6, 2, '#5a3a24');
      pb.rect(28, 47, 6, 2, '#38231a');
      pb.vline(20, 30, 14, '#38231a');
      pb.vline(23, 34, 10, '#38231a');
      // knot "face"
      pb.rect(19, 38, 2, 2, '#14101e');
      pb.rect(24, 38, 2, 2, '#14101e');
      pb.hline(21, 42, 3, '#14101e');
      pb.set(20, 38, C.c2);
      pb.set(25, 38, C.c2);
      // canopy
      const blobs = [[22, 12, 14], [11, 20, 10], [33, 20, 10], [22, 24, 12], [14, 10, 8], [30, 9, 8]];
      for (const [x, y, r] of blobs) pb.ellipse(x, y, r, r * 0.82, '#1f4a2e');
      for (const [x, y, r] of blobs) pb.ellipse(x - 1, y - 1, r - 2, (r - 2) * 0.82, '#2c6a38');
      for (const [x, y, r] of blobs.slice(0, 4)) pb.ellipse(x - 2, y - 3, r - 6, (r - 6) * 0.8, '#3f8a46');
      const r2 = rng(7);
      for (let i = 0; i < 18; i++) {
        const x = 6 + Math.floor(r2() * 32);
        const y = 3 + Math.floor(r2() * 26);
        if (pb.alpha(x, y)) pb.set(x, y, i % 3 ? '#62ad55' : '#86b95a');
      }
      // glowing motes drifting
      for (let i = 0; i < 4; i++) {
        const x = 8 + i * 9;
        const y = 14 + ((i * 7 + f * 2) % 9);
        pb.set(x, y, C.c2);
      }
    },
  },
  trailmarker: {
    w: 16, h: 24, frames: 2, fps: 2,
    paint(pb, f) {
      shadowEllipse(pb, 8, 22, 6);
      pb.rect(4, 17, 8, 4, '#8a8ba2');
      pb.hline(4, 17, 8, '#c4c5d6');
      pb.rect(6, 15, 4, 2, '#a4a5bb');
      woodPost(pb, 7, 3, 14, 2);
      // flag
      const wave = f;
      pb.rect(9, 3, 5, 4, '#c24b49');
      pb.hline(9, 3, 5, '#e97d5c');
      pb.set(14 + 0, 4 + wave, '#c24b49');
      pb.set(14, 6 - wave, '#8d2d3b');
      pb.hline(9, 6, 5, '#8d2d3b');
      pb.set(7, 2, '#d99b2d');
      pb.set(8, 2, '#d99b2d');
    },
  },
  note: {
    w: 12, h: 10, frames: 4, fps: 4,
    paint(pb, f) {
      pb.ellipse(6, 8, 4.5, 1.2, '#14102444');
      pb.rect(2, 3, 8, 5, '#f1e5c0');
      pb.hline(2, 3, 8, '#fffbe8');
      pb.vline(2, 3, 5, '#d8c898');
      pb.hline(2, 7, 8, '#a98458');
      pb.hline(4, 4, 4, '#8a7a6a');
      pb.hline(4, 6, 3, '#8a7a6a');
      pb.rect(8, 2, 3, 2, '#e8d8a8');
      pb.set(10, 2, '#c24b49');
      sparkle(pb, 9, 1, f, C.y3);
    },
  },
  woodscrap: {
    w: 18, h: 14, frames: 2, fps: 1,
    paint(pb, f) {
      shadowEllipse(pb, 9, 12, 7);
      for (const [x, y, w] of [[2, 8, 12], [4, 5, 11], [3, 2, 9]]) {
        pb.rect(x, y, w, 3, '#a97b47');
        pb.hline(x, y, w, '#cfa66b');
        pb.hline(x, y + 2, w, '#6a4326');
        pb.rect(x + w - 1, y, 1, 3, '#e0c088');
        pb.set(x + w - 1, y + 1, '#835731');
      }
      pb.set(14, 9, '#5a3a24');
      sparkle(pb, 13, 3, f * 2, C.y3);
    },
  },
  logbench: {
    w: 28, h: 16, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 14, 14, 11);
      pb.rect(3, 6, 22, 7, '#6a4326');
      pb.hline(3, 6, 22, '#a97b47');
      pb.hline(3, 7, 22, '#835731');
      pb.rect(2, 7, 2, 5, '#cfa66b');
      pb.rect(24, 7, 2, 5, '#cfa66b');
      pb.set(3, 9, '#835731');
      pb.set(24, 9, '#835731');
      pb.hline(3, 12, 22, '#38231a');
      for (const [x, c] of [[7, '#f6a6c0'], [11, '#fbf3dc'], [20, '#b9a2f0'], [16, '#f1c94b']]) {
        pb.set(x, 4, c);
        pb.set(x - 1, 5, c);
        pb.set(x + 1, 5, c);
        pb.set(x, 6, '#f1c94b');
        pb.set(x, 3, '#4f8a48');
      }
    },
  },
  northmarker: {
    w: 20, h: 28, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 10, 26, 8);
      pb.rect(3, 22, 14, 3, '#7b7c94');
      pb.hline(3, 22, 14, '#b2b3c5');
      pb.rect(5, 6, 3, 17, '#9a9bb2');
      pb.rect(12, 6, 3, 17, '#8a8ba2');
      pb.vline(5, 6, 17, '#c8c9da');
      pb.vline(14, 6, 17, '#5a5b72');
      pb.rect(4, 3, 12, 4, '#a4a5bb');
      pb.hline(4, 3, 12, '#d6d7e3');
      pb.hline(4, 6, 12, '#64657b');
      // arrow carved
      pb.hline(8, 4, 5, '#4a4c62');
      pb.set(12, 3, '#4a4c62');
      pb.set(12, 5, '#4a4c62');
      pb.set(6, 12, '#4f8a48');
      pb.set(6, 13, '#4f8a48');
      pb.set(13, 16, '#4f8a48');
      pb.hline(8, 14, 3, '#c8c9da');
    },
  },
  pillar: {
    w: 18, h: 36, frames: 4, fps: 3,
    paint(pb, f) {
      shadowEllipse(pb, 9, 34, 7);
      pb.rect(3, 28, 12, 6, '#7b7c94');
      pb.hline(3, 28, 12, '#b2b3c5');
      pb.rect(5, 6, 8, 23, '#9a9bb2');
      pb.vline(5, 6, 23, '#c8c9da');
      pb.vline(12, 6, 23, '#5a5b72');
      pb.rect(3, 3, 12, 4, '#8a8ba2');
      pb.hline(3, 3, 12, '#c8c9da');
      pb.hline(3, 6, 12, '#4e4f66');
      pb.hline(3, 33, 12, '#3a3a50');
      pb.set(14, 5, '#4e4f66');
      const glow = [C.c1, C.c2, C.c3, C.c2][f];
      pb.vline(9, 10, 12, glow);
      pb.hline(7, 14, 5, glow);
      pb.hline(7, 20, 5, C.c0);
      pb.set(8, 24, glow);
      pb.set(10, 24, glow);
      // crack + moss
      pb.line(6, 8, 8, 12, '#4e4f66');
      pb.rect(5, 26, 4, 2, '#4f8a48');
      pb.set(5, 26, '#76b05a');
    },
  },
  instrument: {
    w: 24, h: 30, frames: 4, fps: 3,
    paint(pb, f) {
      shadowEllipse(pb, 12, 28, 9);
      pb.line(4, 26, 10, 6, '#835731');
      pb.line(5, 26, 11, 6, '#a97b47');
      pb.line(20, 26, 14, 6, '#5a3a24');
      pb.line(19, 26, 13, 6, '#835731');
      pb.hline(8, 20, 8, '#6a4326');
      pb.rect(10, 3, 5, 4, '#a97b47');
      pb.hline(10, 3, 5, '#cfa66b');
      // crystal on top
      const glow = [C.c1, C.c2, C.c3, C.c2][f];
      pb.rect(11, 0, 3, 3, glow);
      pb.set(12, 0, C.c3);
      // strings
      for (let i = 0; i < 5; i++) {
        const x = 9 + i * 2;
        pb.vline(x, 8, 12, i % 2 ? '#e0d8c0' : '#c0b8a0');
      }
      pb.vline(9 + (f % 5) * 2, 10, 8, glow);
      pb.rect(5, 26, 4, 2, '#4e4f66');
      pb.rect(16, 26, 4, 2, '#4e4f66');
    },
  },
  mural: {
    w: 28, h: 26, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 14, 24, 11);
      pb.rect(2, 3, 24, 20, '#7b7c94');
      pb.rect(3, 4, 22, 18, '#c8b690');
      pb.hline(2, 3, 24, '#b2b3c5');
      pb.vline(2, 3, 20, '#a4a5bb');
      pb.vline(25, 3, 20, '#4e4f66');
      pb.hline(2, 22, 24, '#3a3a50');
      // painted figures
      pb.rect(5, 12, 3, 8, '#3f6fa8');
      pb.rect(5, 9, 3, 3, '#d99a69');
      pb.rect(10, 13, 3, 7, '#c24b49');
      pb.rect(10, 10, 3, 3, '#d99a69');
      pb.rect(15, 14, 3, 6, '#3f8a7a');
      pb.rect(15, 11, 3, 3, '#d99a69');
      // star overhead
      pb.set(20, 8, '#d99b2d');
      pb.hline(19, 9, 3, '#f1c94b');
      pb.set(20, 10, '#d99b2d');
      pb.set(20, 7, '#f1c94b');
      pb.hline(4, 20, 18, '#8a6a3a');
      pb.rect(21, 15, 3, 5, '#4f8a48');
    },
  },
  glyphcircle: {
    w: 34, h: 22, frames: 4, fps: 4,
    paint(pb, f) {
      const glow = [C.c1, C.c2, C.c3, C.c2][f];
      const dim = [C.c0, C.c1, C.c2, C.c1][f];
      pb.ellipse(16.5, 12, 16, 8, '#2e2240');
      pb.ellipse(16.5, 12, 14.5, 7, '#4a4c62');
      pb.ellipse(16.5, 12, 13, 6, '#2e2240');
      pb.ellipse(16.5, 12, 11.5, 5, '#64657b');
      pb.ellipse(16.5, 12, 8, 3.2, '#2e2240');
      pb.ellipse(16.5, 12, 7, 2.6, dim);
      pb.set(16, 12, C.c3);
      pb.set(17, 12, C.c3);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        pb.set(Math.round(16.5 + Math.cos(a) * 12.3), Math.round(12 + Math.sin(a) * 5.6), glow);
      }
      // rising light
      pb.vline(16, 3 - (f % 2), 9, glow);
      pb.vline(17, 5, 7, dim);
      sparkle(pb, 12, 5 + (f % 3), f, C.c3);
      sparkle(pb, 22, 6 + ((f + 1) % 3), f + 2, C.c3);
    },
  },
  lectern: {
    w: 18, h: 24, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 9, 22, 7);
      pb.rect(7, 12, 4, 10, '#6a4326');
      pb.vline(7, 12, 10, '#a97b47');
      pb.rect(4, 20, 10, 2, '#5a3a24');
      pb.line(3, 10, 14, 10, '#a97b47');
      pb.rect(3, 4, 12, 7, '#835731');
      pb.hline(3, 4, 12, '#cfa66b');
      pb.rect(4, 5, 10, 5, '#f1e5c0');
      pb.vline(9, 5, 5, '#c8b890');
      pb.hline(5, 6, 3, '#8a7a6a');
      pb.hline(5, 8, 3, '#8a7a6a');
      pb.hline(10, 6, 3, '#8a7a6a');
      pb.hline(10, 8, 3, '#8a7a6a');
      pb.rect(13, 2, 2, 4, '#c24b49');
    },
  },
  catalogcard: {
    w: 12, h: 12, frames: 4, fps: 4,
    paint(pb, f) {
      pb.ellipse(6, 10, 4.5, 1.2, '#14102444');
      pb.rect(2, 3, 8, 7, '#f1e5c0');
      pb.hline(2, 3, 8, '#fffbe8');
      pb.vline(2, 3, 7, '#d8c898');
      pb.hline(2, 9, 8, '#a98458');
      pb.rect(3, 4, 6, 2, '#e0d0a0');
      pb.hline(3, 7, 5, '#8a7a6a');
      pb.set(8, 3, '#c24b49');
      sparkle(pb, 10, 2, f, C.y3);
    },
  },
  pedestalbook: {
    w: 20, h: 28, frames: 4, fps: 3,
    paint(pb, f) {
      const glow = [C.c1, C.c2, C.c3, C.c2][f];
      shadowEllipse(pb, 10, 26, 8);
      pb.rect(4, 19, 12, 6, '#7b7c94');
      pb.hline(4, 19, 12, '#b2b3c5');
      pb.rect(6, 12, 8, 7, '#8a8ba2');
      pb.vline(6, 12, 7, '#c4c5d6');
      pb.vline(13, 12, 7, '#5a5b72');
      pb.hline(4, 24, 12, '#3a3a50');
      // open book
      pb.rect(3, 8, 7, 5, '#e8dcb8');
      pb.rect(10, 8, 7, 5, '#d8c898');
      pb.hline(3, 8, 14, '#fffbe8');
      pb.vline(10, 8, 5, '#6a4326');
      pb.hline(3, 13, 14, '#6a4326');
      pb.hline(4, 10, 4, '#8a7a6a');
      pb.hline(12, 10, 4, '#8a7a6a');
      // glow
      pb.hline(5, 7, 3, glow);
      pb.hline(12, 7, 3, glow);
      sparkle(pb, 10, 3 + (f % 3), f, C.c3);
      sparkle(pb, 5, 4, f + 1, C.c2);
      sparkle(pb, 15, 5, f + 2, C.c2);
    },
  },
  shard: {
    w: 14, h: 20, frames: 4, fps: 4,
    paint(pb, f, tint) {
      const hue = tint || 'cyan';
      const pal = hue === 'gold'
        ? [C.y0, C.y1, C.y2, C.y3]
        : hue === 'violet' ? [C.p1, C.p2, C.p3, '#e8d8ff'] : [C.c0, C.c1, C.c2, C.c3];
      const bob = [0, -1, -1, 0][f];
      pb.ellipse(7, 18, 4, 1.1, '#14102455');
      const y = 5 + bob;
      pb.rect(5, y + 2, 4, 7, pal[1]);
      pb.rect(4, y + 3, 6, 4, pal[1]);
      pb.rect(6, y, 2, 2, pal[2]);
      pb.hline(5, y + 1, 4, pal[2]);
      pb.vline(5, y + 2, 5, pal[3]);
      pb.vline(9, y + 3, 5, pal[0]);
      pb.hline(5, y + 9, 4, pal[0]);
      pb.set(7, y + 10, pal[0]);
      pb.set(6, y + 3, pal[3]);
      sparkle(pb, 11, 4 + (f % 2), f, pal[3]);
      sparkle(pb, 2, 10 - (f % 2), f + 2, pal[2]);
    },
  },
  shardgold: { alias: 'shard', tint: 'gold' },
  shardviolet: { alias: 'shard', tint: 'violet' },
  page: {
    w: 12, h: 10, frames: 4, fps: 4,
    paint(pb, f) {
      pb.ellipse(6, 8, 4.5, 1.2, '#14102444');
      pb.rect(2, 2, 8, 6, '#fbf3dc');
      pb.hline(2, 2, 8, '#ffffff');
      pb.vline(9, 3, 5, '#d8c898');
      pb.hline(2, 7, 8, '#c8b890');
      pb.hline(3, 3, 5, '#8a7a6a');
      pb.hline(3, 5, 4, '#8a7a6a');
      pb.set(8, 4, '#c24b49');
      sparkle(pb, 10, 1, f, C.y3);
    },
  },
  slip: {
    w: 12, h: 14, frames: 4, fps: 3,
    paint(pb, f) {
      const g = [C.p2, C.p3, '#e8d8ff', C.p3][f];
      const bob = [0, -1, -1, 0][f];
      pb.ellipse(6, 12, 4.5, 1.1, '#14102455');
      pb.rect(3, 4 + bob, 6, 7, '#efe0ff');
      pb.hline(3, 4 + bob, 6, '#ffffff');
      pb.vline(8, 5 + bob, 6, '#b392d9');
      pb.hline(4, 6 + bob, 4, '#8667b1');
      pb.hline(4, 8 + bob, 3, '#8667b1');
      pb.set(5, 10 + bob, g);
      sparkle(pb, 10, 2 + bob, f, g);
      sparkle(pb, 1, 8, f + 2, g);
    },
  },
  flower: {
    w: 10, h: 12, frames: 2, fps: 1.5,
    paint(pb, f) {
      pb.ellipse(5, 10, 3.5, 1, '#14102444');
      pb.vline(5, 6, 5, '#3d7b3f');
      pb.set(4, 8, '#5b9a48');
      pb.set(3, 7, '#5b9a48');
      pb.set(6, 9, '#5b9a48');
      pb.set(7, 8, '#5b9a48');
      const sway = f;
      for (const [x, y] of [[5 + sway, 3], [3 + sway, 4], [7 + sway, 4], [4 + sway, 5], [6 + sway, 5], [5 + sway, 2]]) pb.set(x, y, '#f1c94b');
      pb.set(5 + sway, 4, '#c24b49');
      pb.set(4 + sway, 3, '#fbe993');
      pb.set(6 + sway, 3, '#fbe993');
    },
  },
  viewpoint: {
    w: 22, h: 28, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 11, 26, 9);
      pb.rect(3, 18, 16, 7, '#8a8ba2');
      pb.hline(3, 18, 16, '#c4c5d6');
      pb.vline(3, 18, 7, '#c4c5d6');
      pb.vline(18, 18, 7, '#5a5b72');
      pb.hline(3, 24, 16, '#3a3a50');
      pb.vline(8, 19, 5, '#64657b');
      pb.vline(13, 19, 5, '#64657b');
      // tripod + telescope
      pb.line(7, 18, 11, 10, '#5a3a24');
      pb.line(15, 18, 11, 10, '#5a3a24');
      pb.line(11, 18, 11, 10, '#835731');
      pb.rect(5, 5, 11, 3, '#d99b2d');
      pb.hline(5, 5, 11, '#f1c94b');
      pb.hline(5, 7, 11, '#a6701f');
      pb.rect(3, 4, 3, 5, '#a6701f');
      pb.set(3, 5, '#f1c94b');
      pb.rect(15, 6, 3, 2, '#5a3a24');
      pb.set(10, 9, '#a6701f');
    },
  },
  ambush: {
    w: 22, h: 20, frames: 2, fps: 2,
    paint(pb, f) {
      shadowEllipse(pb, 11, 18, 9);
      const blobs = [[6, 11, 5], [15, 11, 5], [11, 8, 6], [11, 13, 6]];
      for (const [x, y, r] of blobs) pb.ellipse(x, y, r, r * 0.85, '#1f4a2e');
      for (const [x, y, r] of blobs) pb.ellipse(x - 0.5, y - 1, r - 1.5, (r - 1.5) * 0.85, '#2c6a38');
      for (const [x, y, r] of blobs.slice(2)) pb.ellipse(x - 1, y - 2, r - 3.5, (r - 3.5) * 0.8, '#3f8a46');
      // thorns
      for (const [x, y] of [[2, 8], [4, 4], [9, 2], [14, 3], [18, 5], [19, 10], [3, 14]]) {
        pb.set(x, y, '#d8c898');
        pb.set(x + (x > 10 ? 1 : -1), y - 1, '#a98458');
      }
      // watching eyes
      const blink = f === 1;
      pb.rect(8, 10, 2, blink ? 1 : 2, '#f1c94b');
      pb.rect(13, 10, 2, blink ? 1 : 2, '#f1c94b');
      if (!blink) {
        pb.set(9, 11, '#c24b49');
        pb.set(14, 11, '#c24b49');
      }
      pb.set(7, 3, '#c24b49');
      pb.set(15, 5, '#c24b49');
    },
  },
  cabinet: {
    w: 20, h: 26, frames: 1,
    paint(pb) {
      shadowEllipse(pb, 10, 24, 8);
      pb.rect(2, 6, 16, 18, '#6a4326');
      pb.hline(2, 6, 16, '#a97b47');
      pb.vline(2, 6, 18, '#835731');
      pb.vline(17, 6, 18, '#38231a');
      for (let y = 8; y < 23; y += 5) {
        pb.rect(4, y, 12, 4, '#835731');
        pb.hline(4, y, 12, '#cfa66b');
        pb.rect(8, y + 1, 4, 2, '#e8d8a8');
        pb.set(9, y + 1, '#c8b890');
      }
      pb.hline(2, 23, 16, '#38231a');
    },
  },
  gem: {
    w: 12, h: 14, frames: 4, fps: 3,
    paint(pb, f) {
      pb.ellipse(6, 12, 4, 1, '#14102455');
      pb.rect(4, 5, 4, 6, C.y1);
      pb.rect(3, 6, 6, 3, C.y1);
      pb.hline(5, 4, 2, C.y2);
      pb.vline(4, 5, 5, C.y3);
      pb.vline(8, 6, 4, C.y0);
      sparkle(pb, 10, 3, f, C.y3);
    },
  },
};

export function resolveProp(kind) {
  let p = PROPS[kind];
  if (!p) return null;
  let tint = null;
  if (p.alias) {
    tint = p.tint;
    p = PROPS[p.alias];
  }
  return { ...p, tint };
}

export function paintPropStrip(kind) {
  const p = resolveProp(kind);
  if (!p) return null;
  const strip = makeStrip(p.frames, p.w, p.h, (pb, f) => {
    p.paint(pb, f, p.tint);
  });
  // outline each frame separately so they never bleed into neighbours
  const out = new PixBuf(strip.width, strip.height);
  for (let f = 0; f < p.frames; f++) {
    const fr = new PixBuf(p.w, p.h);
    fr.blit(strip, 0, 0, { sx: f * p.w, sy: 0, sw: p.w, sh: p.h });
    fr.outline(C.ink);
    out.blit(fr, f * p.w, 0);
  }
  return { strip: out, w: p.w, h: p.h, frames: p.frames, fps: p.fps || 1 };
}

// ---------------------------------------------------------------------------------------
// which prop an entity or zone object should show
// ---------------------------------------------------------------------------------------
const EXACT = {
  sign: 'signpost',
  road_mile: 'milestone',
  road_cart: 'none',
  road_gate_view: 'viewpoint',
  road_ambush: 'ambush',
  bh_notice: 'noticeboard',
  bh_fountain: 'fountain',
  index_shard_obj: 'shardgold',
  resonance_fragment: 'shard',
  memory_slip: 'slip',
  scrap_node: 'woodscrap',
  ch2_echo_stone: 'echostone',
  ch2_carving_1: 'carving',
  ch2_carving_2: 'carving',
  ch2_stream: 'stream',
  ch2_tree: 'ancienttree',
  ch2_marker: 'trailmarker',
  ch2_mira_spot: 'logbench',
  ch2_north: 'northmarker',
  ch4_nameless_book: 'pedestalbook',
  ch4_fragment_obj: 'shard',
  ch5_pillar: 'pillar',
  ch5_instrument: 'instrument',
  ch5_mural: 'mural',
  ch5_activate: 'glyphcircle',
  // zone objects
  well: 'well',
  stump: 'stump',
  broken_cart: 'cart',
  mile_marker: 'none',
};

export function propKindFor(id, color) {
  const key = String(id || '');
  if (EXACT[key]) return EXACT[key];
  if (/^ch2_note_/.test(key)) return 'note';
  if (/^ch4_rec_/.test(key)) return 'lectern';
  if (/^ch4_cat_/.test(key)) return 'catalogcard';
  if (/^guest_page_/.test(key)) return 'page';
  if (/^road_flower_/.test(key)) return 'flower';
  if (/shard|fragment/.test(key)) return 'shard';
  if (/page|note|slip/.test(key)) return 'page';
  void color;
  return 'gem';
}
