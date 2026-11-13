import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../src/core/EventBus.js';

describe('EventBus', () => {
  it('subscribes and emits', () => {
    const bus = new EventBus();
    let called = 0;
    let payload = null;
    bus.on('test', (v) => {
      called += 1;
      payload = v;
    });
    bus.emit('test', 42);
    assert.equal(called, 1);
    assert.equal(payload, 42);
  });

  it('supports multiple listeners in registration order', () => {
    const bus = new EventBus();
    const order = [];
    bus.on('e', () => order.push(1));
    bus.on('e', () => order.push(2));
    bus.emit('e');
    assert.deepEqual(order, [1, 2]);
  });

  it('unsubscribes correctly', () => {
    const bus = new EventBus();
    let count = 0;
    const unsub = bus.on('x', () => {
      count += 1;
    });
    bus.emit('x');
    unsub();
    bus.emit('x');
    assert.equal(count, 1);
  });

  it('allows unsubscribe during emit without skipping remaining', () => {
    const bus = new EventBus();
    const order = [];
    const unsub2 = bus.on('e', () => {
      order.push('a');
      unsub2();
    });
    bus.on('e', () => order.push('b'));
    bus.emit('e');
    assert.deepEqual(order, ['a', 'b']);
    assert.equal(bus.listenerCount('e'), 1);
  });

  it('clear removes listeners', () => {
    const bus = new EventBus();
    bus.on('a', () => {});
    bus.on('b', () => {});
    bus.clear('a');
    assert.equal(bus.listenerCount('a'), 0);
    assert.equal(bus.listenerCount('b'), 1);
    bus.clear();
    assert.equal(bus.listenerCount('b'), 0);
  });
});
