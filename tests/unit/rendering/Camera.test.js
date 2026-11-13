import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Camera } from '../../../src/engine/rendering/Camera.js';
import { RenderPipeline } from '../../../src/engine/rendering/RenderPipeline.js';

describe('Camera', () => {
  it('worldToScreen and screenToWorld round-trip', () => {
    const cam = new Camera({ viewportWidth: 480, viewportHeight: 270, x: 100, y: 50 });
    const s = cam.worldToScreen(140, 80);
    assert.equal(s.x, 40);
    assert.equal(s.y, 30);
    const w = cam.screenToWorld(s.x, s.y);
    assert.equal(w.x, 140);
    assert.equal(w.y, 80);
  });

  it('respects bounds', () => {
    const cam = new Camera({ viewportWidth: 100, viewportHeight: 100 });
    cam.setBounds(0, 0, 200, 200);
    cam.setPosition(-50, -50);
    assert.equal(cam.x, 0);
    assert.equal(cam.y, 0);
    cam.setPosition(500, 500);
    assert.equal(cam.x, 100);
    assert.equal(cam.y, 100);
  });

  it('resizes responsively and centers maps smaller than the viewport', () => {
    const cam = new Camera({ viewportWidth: 320, viewportHeight: 240 });
    cam.setBounds(0, 0, 320, 224);
    cam.setViewportSize(520, 240);
    assert.equal(cam.viewWidth, 520);
    assert.equal(cam.x, -100);
    assert.equal(cam.y, -8);
    assert.equal(cam.worldToScreen(160, 112).x, 260);
  });

  it('syncs the render camera to the responsive surface viewport', () => {
    const surface = {
      logicalWidth: 519,
      logicalHeight: 240,
      getContext2D: () => ({ save() {}, restore() {}, setTransform() {}, fillRect() {} }),
    };
    const pipeline = new RenderPipeline({ surface });
    pipeline.update(0);
    assert.equal(pipeline.camera.viewportWidth, 519);
    assert.equal(pipeline.camera.viewportHeight, 240);
  });

  it('follow moves toward target', () => {
    const cam = new Camera({ viewportWidth: 100, viewportHeight: 100, x: 0, y: 0 });
    cam.followLerp = 1;
    cam.deadZoneW = 0;
    cam.deadZoneH = 0;
    cam.follow({ x: 200, y: 200 });
    cam.update(0.016);
    assert.ok(cam.x > 0);
    assert.ok(cam.y > 0);
  });

  it('zoom changes view size', () => {
    const cam = new Camera({ viewportWidth: 480, viewportHeight: 270 });
    cam.setZoom(2);
    assert.equal(cam.viewWidth, 240);
    assert.equal(cam.viewHeight, 135);
  });

  it('isVisible culling', () => {
    const cam = new Camera({ viewportWidth: 100, viewportHeight: 100, x: 0, y: 0 });
    assert.equal(cam.isVisible(10, 10, 20, 20), true);
    assert.equal(cam.isVisible(500, 500, 10, 10), false);
  });

  it('shake eventually settles', () => {
    const cam = new Camera();
    cam.shake(10, 0.1);
    cam.update(0.05);
    // offset may be non-zero mid-shake
    cam.update(0.2);
    assert.equal(cam._shakeOffsetX, 0);
    assert.equal(cam._shakeOffsetY, 0);
  });
});
