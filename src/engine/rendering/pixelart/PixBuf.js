/**
 * Pure-JS RGBA pixel buffer used to paint pixel art in code.
 * No browser APIs: conversion to a canvas happens in platform/browser via PixelArt.configure().
 */
const _cache = new Map();

/** @param {string|number[]|null} c */
export function parseColor(c) {
  if (c == null) return [0, 0, 0, 0];
  if (Array.isArray(c)) return c;
  let v = _cache.get(c);
  if (v) return v;
  let h = String(c).replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255];
  _cache.set(c, v);
  return v;
}

const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

/** Mix two colors (t=0 → a, t=1 → b). */
export function mix(a, b, t) {
  const A = parseColor(a);
  const B = parseColor(b);
  return '#' + hex2(A[0] + (B[0] - A[0]) * t) + hex2(A[1] + (B[1] - A[1]) * t) + hex2(A[2] + (B[2] - A[2]) * t);
}
export const darken = (c, t = 0.25) => mix(c, '#14101e', t);
export const lighten = (c, t = 0.25) => mix(c, '#fff8e8', t);

/** Deterministic PRNG (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function hash2(x, y, seed = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class PixBuf {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  set(x, y, c) {
    x |= 0;
    y |= 0;
    if (!this.inBounds(x, y)) return this;
    const [r, g, b, a] = parseColor(c);
    const i = (y * this.width + x) * 4;
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = a;
    return this;
  }

  /** Returns [r,g,b,a]; transparent outside bounds. */
  get(x, y) {
    if (!this.inBounds(x, y)) return [0, 0, 0, 0];
    const i = (y * this.width + x) * 4;
    return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
  }

  alpha(x, y) {
    return this.inBounds(x, y) ? this.data[(y * this.width + x) * 4 + 3] : 0;
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }

  hline(x, y, len, c) {
    return this.rect(x, y, len, 1, c);
  }

  vline(x, y, len, c) {
    return this.rect(x, y, 1, len, c);
  }

  line(x0, y0, x1, y1, c) {
    let dx = Math.abs(x1 - x0);
    let dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }

  /** Filled ellipse centred at (cx,cy) with radii rx, ry (pixel centres). */
  ellipse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / (rx + 0.35);
        const dy = (y - cy) / (ry + 0.35);
        if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      }
    }
    return this;
  }

  /** Only paint where the pixel is still transparent. */
  setUnder(x, y, c) {
    if (this.alpha(x, y) === 0) this.set(x, y, c);
    return this;
  }

  /** Only paint where the pixel is already opaque. */
  setOver(x, y, c) {
    if (this.alpha(x, y) > 0) this.set(x, y, c);
    return this;
  }

  rectOver(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.setOver(x + i, y + j, c);
    return this;
  }

  clear() {
    this.data.fill(0);
    return this;
  }

  clone() {
    const p = new PixBuf(this.width, this.height);
    p.data.set(this.data);
    return p;
  }

  /** Copy src (or a source rect of it) into this buffer; transparent source pixels are skipped. */
  blit(src, dx = 0, dy = 0, opts = {}) {
    const sx = opts.sx ?? 0;
    const sy = opts.sy ?? 0;
    const sw = opts.sw ?? src.width - sx;
    const sh = opts.sh ?? src.height - sy;
    for (let j = 0; j < sh; j++) {
      for (let i = 0; i < sw; i++) {
        const px = opts.flipX ? sw - 1 - i : i;
        const a = src.alpha(sx + px, sy + j);
        if (a === 0) continue;
        const [r, g, b] = src.get(sx + px, sy + j);
        this.set(dx + i, dy + j, [r, g, b, a]);
      }
    }
    return this;
  }

  /** Add a 1px outline (4-neighbourhood, or 8 when diag) around opaque pixels, drawn only on empty pixels. */
  outline(c, diag = false) {
    const add = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.alpha(x, y) !== 0) continue;
        const n =
          this.alpha(x - 1, y) || this.alpha(x + 1, y) || this.alpha(x, y - 1) || this.alpha(x, y + 1) ||
          (diag && (this.alpha(x - 1, y - 1) || this.alpha(x + 1, y - 1) || this.alpha(x - 1, y + 1) || this.alpha(x + 1, y + 1)));
        if (n) add.push([x, y]);
      }
    }
    for (const [x, y] of add) this.set(x, y, c);
    return this;
  }

  /** Darken opaque pixels that sit on the lower/right silhouette edge (cheap cel shading). */
  edgeShade(amount = 0.22, dirs = [[0, 1]]) {
    const out = this.clone();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.alpha(x, y)) continue;
        for (const [dx, dy] of dirs) {
          if (!this.alpha(x + dx, y + dy)) {
            const [r, g, b, a] = this.get(x, y);
            out.set(x, y, [r, g, b, a].map((v, i) => (i < 3 ? v * (1 - amount) : v)));
          }
        }
      }
    }
    this.data.set(out.data);
    return this;
  }

  /** Replace every pixel of colour `from` with `to`. */
  swap(from, to) {
    const F = parseColor(from);
    const T = parseColor(to);
    for (let i = 0; i < this.data.length; i += 4) {
      if (this.data[i] === F[0] && this.data[i + 1] === F[1] && this.data[i + 2] === F[2] && this.data[i + 3] === F[3]) {
        this.data[i] = T[0];
        this.data[i + 1] = T[1];
        this.data[i + 2] = T[2];
        this.data[i + 3] = T[3];
      }
    }
    return this;
  }

  /** Multiply all opaque pixels toward a flash colour (hit flash). */
  tinted(color, t) {
    const out = this.clone();
    const C = parseColor(color);
    for (let i = 0; i < out.data.length; i += 4) {
      if (!out.data[i + 3]) continue;
      out.data[i] += (C[0] - out.data[i]) * t;
      out.data[i + 1] += (C[1] - out.data[i + 1]) * t;
      out.data[i + 2] += (C[2] - out.data[i + 2]) * t;
    }
    return out;
  }
}

/** Horizontal strip of equally sized frames in a single buffer. */
export function makeStrip(frames, fw, fh, paint) {
  const pb = new PixBuf(fw * frames, fh);
  for (let f = 0; f < frames; f++) {
    const fr = new PixBuf(fw, fh);
    paint(fr, f);
    pb.blit(fr, f * fw, 0);
  }
  return pb;
}
