import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Config } from '../../src/core/Config.js';
import { CanvasSurface } from '../../src/platform/browser/CanvasSurface.js';

function makeSurface() {
  const canvas = { width: 0, height: 0, style: {}, getContext: () => ({}) };
  return new CanvasSurface(canvas, { logicalWidth: Config.LOGICAL_WIDTH, logicalHeight: Config.LOGICAL_HEIGHT });
}

describe('Responsive viewport scaling (D-022)', () => {
  it('keeps the 320x240 base viewport in portrait', () => {
    const surface = makeSurface();
    surface.fitTo(390, 844);
    assert.equal(surface.logicalWidth, 320);
    assert.equal(surface.logicalHeight, 240);
  });

  it('expands logical width to the iPhone 13 landscape aspect without changing height', () => {
    const surface = makeSurface();
    surface.fitTo(844, 390);
    assert.equal(surface.logicalHeight, 240);
    assert.equal(surface.logicalWidth, 519);
    assert.ok(Math.abs(surface.logicalWidth / surface.logicalHeight - 844 / 390) < 0.01);
  });

  it('returns to the base viewport after rotating from landscape back to portrait', () => {
    const surface = makeSurface();
    surface.fitTo(844, 390);
    assert.equal(surface.logicalWidth, 519);
    surface.fitTo(390, 844);
    assert.equal(surface.logicalWidth, 320);
    assert.equal(surface.logicalHeight, 240);
  });

  it('uses a responsive 16:9 viewport on desktop while preserving the base config', () => {
    const surface = makeSurface();
    surface.fitTo(1280, 720);
    assert.equal(surface.logicalWidth, 427);
    assert.equal(surface.logicalHeight, 240);
    assert.equal(Config.LOGICAL_WIDTH, 320);
    assert.equal(Config.LOGICAL_HEIGHT, 240);
  });

  it('caps extreme ultrawide logical aspect to avoid unbounded camera and UI widths', () => {
    const surface = makeSurface();
    surface.fitTo(3440, 1440);
    assert.equal(surface.logicalWidth, 528);
    assert.equal(surface.logicalHeight, 240);
  });

  it('client-to-logical conversion uses the current responsive canvas dimensions', () => {
    const surface = makeSurface();
    surface.fitTo(844, 390);
    const canvas = surface.getElement();
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 844, height: 390 });
    const point = surface.clientToLogical(422, 195);
    assert.ok(Math.abs(point.x - surface.logicalWidth / 2) < 0.01);
    assert.ok(Math.abs(point.y - surface.logicalHeight / 2) < 0.01);
  });
});
