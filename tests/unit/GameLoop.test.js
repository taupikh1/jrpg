import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../../src/core/GameLoop.js';

/** Manual clock + scheduler for deterministic tests */
class FakeClock {
  constructor() {
    this.t = 0;
  }
  now() {
    return this.t;
  }
  advance(ms) {
    this.t += ms;
  }
}

class FakeScheduler {
  constructor() {
    this.callbacks = new Map();
    this.nextId = 1;
  }
  request(cb) {
    const id = this.nextId++;
    this.callbacks.set(id, cb);
    return id;
  }
  cancel(id) {
    this.callbacks.delete(id);
  }
  /** Fire the currently scheduled callback with given time */
  tick(time) {
    const entries = [...this.callbacks.entries()];
    for (const [id, cb] of entries) {
      this.callbacks.delete(id);
      cb(time);
    }
  }
  hasPending() {
    return this.callbacks.size > 0;
  }
}

describe('GameLoop', () => {
  it('calls update with delta seconds', () => {
    const clock = new FakeClock();
    const scheduler = new FakeScheduler();
    const deltas = [];
    const loop = new GameLoop({
      clock,
      scheduler,
      update: (dt) => deltas.push(dt),
    });

    loop.start();
    // First scheduled frame: establish baseline (dt ~ 0)
    scheduler.tick(0);
    // Advance clock and fire next frame
    clock.advance(16);
    scheduler.tick(16);

    assert.ok(deltas.length >= 1);
    // At least one of the deltas should be ~0.016
    const found = deltas.some((d) => Math.abs(d - 0.016) < 0.001);
    assert.ok(found, `expected ~0.016 in deltas, got ${JSON.stringify(deltas)}`);
    loop.stop();
  });

  it('clamps large delta', () => {
    const clock = new FakeClock();
    const scheduler = new FakeScheduler();
    const deltas = [];
    const loop = new GameLoop({
      clock,
      scheduler,
      maxDelta: 0.1,
      update: (dt) => deltas.push(dt),
    });

    loop.start();
    scheduler.tick(0);
    clock.advance(5000);
    scheduler.tick(5000);

    const clamped = deltas.filter((d) => d === 0.1);
    assert.ok(clamped.length >= 1, `expected clamped 0.1, got ${JSON.stringify(deltas)}`);
    loop.stop();
  });

  it('pause and resume', () => {
    const clock = new FakeClock();
    const scheduler = new FakeScheduler();
    let updates = 0;
    const loop = new GameLoop({
      clock,
      scheduler,
      update: () => {
        updates += 1;
      },
    });

    loop.start();
    scheduler.tick(0); // baseline
    const beforePause = updates;

    loop.pause();
    assert.equal(loop.isPaused, true);
    clock.advance(16);
    scheduler.tick(16);
    assert.equal(updates, beforePause, 'no updates while paused');

    loop.resume();
    clock.advance(16);
    scheduler.tick(32);
    assert.ok(updates > beforePause, 'updates resume after pause');
    loop.stop();
  });

  it('stop cancels further frames', () => {
    const clock = new FakeClock();
    const scheduler = new FakeScheduler();
    let updates = 0;
    const loop = new GameLoop({
      clock,
      scheduler,
      update: () => {
        updates += 1;
      },
    });

    loop.start();
    scheduler.tick(0);
    const afterFirst = updates;
    loop.stop();
    assert.equal(loop.isRunning, false);

    clock.advance(16);
    scheduler.tick(16); // should be no-op, no pending callback or ignored
    assert.equal(updates, afterFirst, 'no further updates after stop');
  });

  it('isRunning reflects state', () => {
    const clock = new FakeClock();
    const scheduler = new FakeScheduler();
    const loop = new GameLoop({
      clock,
      scheduler,
      update: () => {},
    });
    assert.equal(loop.isRunning, false);
    loop.start();
    assert.equal(loop.isRunning, true);
    loop.stop();
    assert.equal(loop.isRunning, false);
  });
});
