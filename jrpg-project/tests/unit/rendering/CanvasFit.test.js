import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CanvasSurface } from '../../../src/platform/browser/CanvasSurface.js';
import { Config } from '../../../src/core/Config.js';

function fakeCanvas() {
  return { width: 0, height: 0, style: {}, getContext: () => ({}) };
}

function fit(cssW, cssH) {
  const c = fakeCanvas();
  const s = new CanvasSurface(c, { logicalWidth: Config.LOGICAL_WIDTH, logicalHeight: Config.LOGICAL_HEIGHT });
  s.fitTo(cssW, cssH);
  return { scale: s.scale, logicalW: s.logicalWidth, logicalH: s.logicalHeight, w: parseFloat(c.style.width), h: parseFloat(c.style.height), left: parseFloat(c.style.marginLeft), top: parseFloat(c.style.marginTop), style: c.style };
}

describe('canvas fit for phones and desktops', () => {
  it('phone portrait (390x664) fills the width with a fractional scale', () => {
    const r = fit(390, 664);
    assert.ok(Math.abs(r.scale - 390 / 320) < 1e-9, `scale ${r.scale}`);
    assert.equal(r.w, 390);
    assert.equal(r.left, 0);
  });

  it('phone landscape (844x390) expands the logical viewport and fills the screen without distortion', () => {
    const r = fit(844, 390);
    assert.equal(r.logicalH, 240);
    assert.ok(r.logicalW > 320);
    assert.ok(Math.abs(r.w - 844) < 1);
    assert.ok(Math.abs(r.h - 390) < 1);
    assert.ok(Math.abs(r.w / r.h - r.logicalW / r.logicalH) < 0.01);
  });

  it('desktop keeps whole-number scaling for square pixels', () => {
    assert.ok(Math.abs(fit(1280, 720).scale - 3) < 0.01);
    assert.ok(Math.abs(fit(1920, 1080).scale - 4.5) < 0.01);
  });

  it('the picture is centred and never larger than the viewport', () => {
    for (const [w, h] of [[390, 664], [844, 390], [1280, 720], [360, 640], [1024, 1366]]) {
      const r = fit(w, h);
      assert.ok(r.w <= w + 1e-6 && r.h <= h + 1e-6, `${w}x${h}`);
      assert.ok(Math.abs(r.left - (w - r.w) / 2) <= 1);
      assert.ok(Math.abs(r.top - (h - r.h) / 2) <= 1);
    }
  });

  it('keeps the base 4:3 viewport in portrait and adapts to landscape aspect', () => {
    const portrait = fit(390, 664);
    const landscape = fit(844, 390);
    assert.equal(portrait.logicalW, 320);
    assert.equal(portrait.logicalH, 240);
    assert.ok(Math.abs(portrait.w / portrait.h - 4 / 3) < 0.01);
    assert.ok(Math.abs(landscape.w / landscape.h - 844 / 390) < 0.01);
  });

  it('pixel art uses nearest-neighbour scaling', () => {
    assert.equal(fit(390, 664).style.imageRendering, 'pixelated');
  });
});
