import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Input } from '../../src/engine/input/Input.js';

class FakeSource {
  constructor() {
    this.listeners = new Set();
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(ev) {
    for (const fn of this.listeners) fn(ev);
  }
  destroy() {
    this.listeners.clear();
  }
}

describe('Input', () => {
  it('tracks key down / pressed / released', () => {
    const src = new FakeSource();
    const input = new Input([src]);

    src.emit({ type: 'keydown', code: 'KeyA', timeStamp: 1 });
    assert.equal(input.isDown('KeyA'), true);
    assert.equal(input.justPressed('KeyA'), true);

    input.endFrame();
    assert.equal(input.justPressed('KeyA'), false);
    assert.equal(input.isDown('KeyA'), true);

    src.emit({ type: 'keyup', code: 'KeyA', timeStamp: 2 });
    assert.equal(input.isDown('KeyA'), false);
    assert.equal(input.justReleased('KeyA'), true);

    input.endFrame();
    assert.equal(input.justReleased('KeyA'), false);
    input.destroy();
  });

  it('tracks pointer', () => {
    const src = new FakeSource();
    const input = new Input([src]);

    src.emit({
      type: 'pointerdown',
      pointerId: 1,
      x: 100,
      y: 50,
      primary: true,
      pointerType: 'touch',
      timeStamp: 1,
    });
    const p = input.primaryPointer();
    assert.ok(p);
    assert.equal(p.x, 100);
    assert.equal(p.y, 50);
    assert.equal(p.down, true);

    src.emit({ type: 'pointerup', pointerId: 1, timeStamp: 2 });
    assert.equal(input.primaryPointer(), null);
    input.destroy();
  });

  it('destroy unsubscribes', () => {
    const src = new FakeSource();
    const input = new Input([src]);
    assert.equal(src.listeners.size, 1);
    input.destroy();
    assert.equal(src.listeners.size, 0);
  });
});
