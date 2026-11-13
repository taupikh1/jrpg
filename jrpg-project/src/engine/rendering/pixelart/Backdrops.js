import { PixBuf, rng, mix } from './PixBuf.js';

function bands(pb, y0, y1, colors) {
  const n = colors.length;
  const h = (y1 - y0) / n;
  colors.forEach((c, i) => {
    const a = Math.round(y0 + i * h);
    const b = Math.round(y0 + (i + 1) * h);
    pb.rect(0, a, pb.width, b - a, c);
    // dithered seam toward the next band
    if (i < n - 1) for (let x = 0; x < pb.width; x++) if ((x + i) % 2 === 0) pb.set(x, b, colors[i + 1]);
  });
}

function hills(pb, base, amp, color, seed, period = 60) {
  const r = rng(seed);
  const ph = r() * 6;
  for (let x = 0; x < pb.width; x++) {
    const y = Math.round(base + Math.sin(x / period * 6.28 + ph) * amp + Math.sin(x / (period / 2.7) + ph * 2) * amp * 0.4);
    pb.rect(x, y, 1, pb.height - y, color);
  }
}

function pineRow(pb, y, color, hi, seed, step = 14, size = 1) {
  const r = rng(seed);
  for (let x = -4; x < pb.width + 4; x += step + Math.floor(r() * 6)) {
    const h = (14 + Math.floor(r() * 8)) * size;
    for (let i = 0; i < h; i++) {
      const w = Math.floor((i / h) * 6 * size) + 1;
      pb.hline(x - w, y - h + i, w * 2 + 1, color);
    }
    pb.vline(x, y - 2, 3, '#2a1f2a');
    pb.set(x - 1, y - h + 4, hi);
  }
}

/**
 * Battle stage: forest clearing at dusk, 110 px tall. The 320 px composition (moon, battle rings,
 * flowers) is centred; on wider landscape screens the sky, hills, pines and ground simply continue.
 * At width 320 the output is identical to the original fixed-size stage.
 */
export function paintBattleStage(theme = 'forest', width = 320) {
  const W = Math.max(320, Math.round(Number(width) || 320));
  const ox = Math.floor((W - 320) / 2);
  const H = 110;
  const pb = new PixBuf(W, H);
  const road = theme === 'road';
  bands(pb, 0, 62, road ? ['#2b3566', '#3d4a80', '#6a6aa0', '#c08a8a', '#f0b890'] : ['#1f2a50', '#2f3f72', '#4f5f94', '#8a78a8', '#d89aa0']);
  const r = rng(3);
  for (let i = 0; i < Math.round(28 * (W / 320)); i++) pb.set(Math.floor(r() * W), Math.floor(r() * 30), i % 4 ? '#c8d0f0' : '#ffffff');
  pb.ellipse(250 + ox, 28, 10, 10, '#f6efd2');
  pb.ellipse(247 + ox, 26, 8, 8, '#fffbe8');
  pb.ellipse(253 + ox, 31, 2, 2, '#e0d8b8');
  hills(pb, 56, 4, '#2a3560', 1, 90);
  pineRow(pb, 62, '#1d2a4a', '#2d3d66', 2, 12, 1);
  hills(pb, 66, 3, '#233a4a', 4, 70);
  pineRow(pb, 70, '#16312f', '#1f4a3a', 5, 17, 1);
  // ground
  for (let y = 68; y < H; y++) {
    const t = (y - 68) / (H - 68);
    pb.hline(0, y, W, mix('#3a7a3f', '#1f4a2e', t));
  }
  for (let i = 0; i < Math.round(420 * (W / 320)); i++) {
    const x = Math.floor(r() * W);
    const y = 69 + Math.floor(r() * 41);
    pb.set(x, y, i % 3 ? '#2a5a34' : '#5b9a48');
    if (i % 7 === 0) pb.set(x, y - 1, '#86b95a');
  }
  // dirt battle rings
  for (const cx of [78 + ox, 238 + ox]) {
    pb.ellipse(cx, 80, 52, 9, '#5a4a38');
    pb.ellipse(cx, 80, 50, 8, '#7a6448');
    for (let i = 0; i < 90; i++) {
      const x = cx - 50 + Math.floor(r() * 100);
      const y = 74 + Math.floor(r() * 12);
      const a = pb.get(x, y);
      if (a[0] === 0x7a && a[1] === 0x64) pb.set(x, y, i % 2 ? '#8e7654' : '#665238');
    }
  }
  for (const [fx, y] of [[40, 40], [120, 48], [190, 38], [290, 50], [160, 58]]) {
    const x = fx + ox;
    pb.set(x, y, '#f1e97a');
    pb.set(x + 1, y, '#9a9a3a');
  }
  return pb;
}

/** Title screen backdrop: 320 x 240 starry valley with the village on the hill. */
export function paintTitleBackdrop() {
  const W = 320;
  const H = 240;
  const pb = new PixBuf(W, H);
  bands(pb, 0, 150, ['#0f1130', '#171a44', '#222658', '#2f3470', '#4a4688', '#7a5a96', '#c27a9a', '#f0a888']);
  const r = rng(11);
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * 80);
    pb.set(x, y, i % 5 === 0 ? '#ffffff' : i % 2 ? '#9aa6e0' : '#c8d0f8');
    if (i % 11 === 0) { pb.set(x - 1, y, '#6a76b8'); pb.set(x + 1, y, '#6a76b8'); pb.set(x, y - 1, '#6a76b8'); pb.set(x, y + 1, '#6a76b8'); }
  }
  // big moon
  pb.ellipse(238, 54, 24, 24, '#e8e0c0');
  pb.ellipse(236, 52, 22, 22, '#f6efd2');
  pb.ellipse(230, 46, 5, 4, '#e0d8b8');
  pb.ellipse(244, 62, 4, 3, '#e0d8b8');
  pb.ellipse(246, 46, 3, 2, '#e0d8b8');
  // glowing constellation (the Atlas)
  const pts = [[60, 36], [82, 28], [104, 40], [96, 62], [70, 66], [128, 52]];
  pts.forEach(([x, y], i) => {
    pb.set(x, y, '#fff2a8');
    pb.set(x - 1, y, '#e8c860');
    pb.set(x + 1, y, '#e8c860');
    pb.set(x, y - 1, '#e8c860');
    pb.set(x, y + 1, '#e8c860');
    if (i) pb.line(pts[i - 1][0], pts[i - 1][1], x, y, '#6a6aa0');
  });
  pts.forEach(([x, y]) => pb.set(x, y, '#ffffff'));
  hills(pb, 130, 10, '#3a3a78', 21, 120);
  pineRow(pb, 142, '#2a2a5a', '#3a3a78', 22, 16, 1);
  hills(pb, 150, 8, '#252a5a', 23, 80);
  hills(pb, 172, 12, '#1d3a4a', 24, 100);
  pineRow(pb, 182, '#16303a', '#1f4a4a', 25, 13, 2);
  // village on the hill
  const hx = 156;
  const hy = 170;
  pb.ellipse(hx + 40, hy + 22, 90, 24, '#1a3a34');
  for (const [dx, dy, w, h2, rc] of [[0, 0, 20, 12, '#7a3030'], [26, 4, 16, 10, '#3a4a78'], [-24, 6, 14, 9, '#5a3a2a'], [50, 8, 18, 9, '#7a3030']]) {
    pb.rect(hx + dx, hy + dy + 4, w, h2 - 4 + 6, '#4a3a4a');
    for (let i = 0; i < 5; i++) pb.hline(hx + dx - 2 + i, hy + dy + i * 1 - 1 + 4, w + 4 - i * 2, rc);
    pb.rect(hx + dx + 4, hy + dy + 8, 3, 3, '#ffd870');
    pb.rect(hx + dx + w - 8, hy + dy + 8, 3, 3, '#ffd870');
  }
  // foreground cliff + grass
  pb.rect(0, 200, W, 40, '#10241f');
  hills(pb, 204, 5, '#0e1f1c', 31, 70);
  for (let i = 0; i < 160; i++) {
    const x = Math.floor(r() * W);
    const y = 204 + Math.floor(r() * 36);
    pb.set(x, y, i % 3 ? '#183a2e' : '#26543c');
  }
  pineRow(pb, 232, '#0a1816', '#10302a', 41, 22, 2);
  return pb;
}
