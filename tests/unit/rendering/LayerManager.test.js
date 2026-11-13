import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LayerManager } from '../../../src/engine/rendering/LayerManager.js';
import { Camera } from '../../../src/engine/rendering/Camera.js';

describe('LayerManager', () => {
  it('registers and orders layers', () => {
    const lm = new LayerManager();
    lm.register({ name: 'ui', order: 100, screenSpace: true });
    lm.register({ name: 'ground', order: 10 });
    lm.register({ name: 'characters', order: 40, ySort: true });
    assert.deepEqual(lm.getLayerNames(), ['ground', 'characters', 'ui']);
  });

  it('rejects duplicate layer', () => {
    const lm = new LayerManager();
    lm.register({ name: 'a', order: 0 });
    assert.throws(() => lm.register({ name: 'a', order: 1 }), /already/);
  });

  it('y-sorts items', () => {
    const lm = new LayerManager();
    lm.register({ name: 'chars', order: 0, ySort: true });
    const order = [];
    lm.add('chars', {
      x: 0,
      y: 50,
      draw: () => order.push(50),
    });
    lm.add('chars', {
      x: 0,
      y: 10,
      draw: () => order.push(10),
    });
    lm.add('chars', {
      x: 0,
      y: 30,
      draw: () => order.push(30),
    });

    const ctx = makeFakeCtx();
    const cam = new Camera({ viewportWidth: 480, viewportHeight: 270 });
    lm.render(ctx, cam);
    assert.deepEqual(order, [10, 30, 50]);
  });

  it('respects visibility', () => {
    const lm = new LayerManager();
    lm.register({ name: 'l', order: 0 });
    let drew = false;
    lm.add('l', { x: 0, y: 0, draw: () => { drew = true; } });
    lm.setVisible('l', false);
    lm.render(makeFakeCtx(), new Camera());
    assert.equal(drew, false);
  });

  it('screenSpace layer does not require world visibility', () => {
    const lm = new LayerManager();
    lm.register({ name: 'ui', order: 0, screenSpace: true });
    let drew = false;
    lm.add('ui', { x: 0, y: 0, draw: () => { drew = true; } });
    lm.render(makeFakeCtx(), new Camera());
    assert.equal(drew, true);
  });
});

function makeFakeCtx() {
  return {
    save() {},
    restore() {},
    globalAlpha: 1,
    scale() {},
    translate() {},
    fillRect() {},
    drawImage() {},
  };
}
