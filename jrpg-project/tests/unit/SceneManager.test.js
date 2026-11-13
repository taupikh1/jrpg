import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SceneManager } from '../../src/core/SceneManager.js';

function makeScene(name) {
  return {
    name,
    inited: false,
    entered: false,
    exited: false,
    destroyed: false,
    updates: 0,
    async init() {
      this.inited = true;
    },
    async enter() {
      this.entered = true;
    },
    async exit() {
      this.exited = true;
    },
    async destroy() {
      this.destroyed = true;
    },
    update() {
      this.updates += 1;
    },
    render() {},
  };
}

describe('SceneManager', () => {
  it('registers and switches scenes', async () => {
    const sm = new SceneManager();
    const a = makeScene('A');
    const b = makeScene('B');
    sm.register('a', a);
    sm.register('b', b);

    await sm.switchTo('a');
    assert.equal(sm.currentKey, 'a');
    assert.equal(a.inited, true);
    assert.equal(a.entered, true);

    await sm.switchTo('b');
    assert.equal(sm.currentKey, 'b');
    assert.equal(a.exited, true);
    assert.equal(b.inited, true);
    assert.equal(b.entered, true);
  });

  it('rejects unknown scene', async () => {
    const sm = new SceneManager();
    await assert.rejects(() => sm.switchTo('missing'), /not registered/);
  });

  it('rejects duplicate registration', () => {
    const sm = new SceneManager();
    sm.register('x', makeScene('X'));
    assert.throws(() => sm.register('x', makeScene('X2')), /already registered/);
  });

  it('update and render call current scene', async () => {
    const sm = new SceneManager();
    const s = makeScene('S');
    sm.register('s', s);
    await sm.switchTo('s');
    sm.update(0.016);
    assert.equal(s.updates, 1);
  });

  it('destroy cleans up', async () => {
    const sm = new SceneManager();
    const s = makeScene('S');
    sm.register('s', s);
    await sm.switchTo('s');
    await sm.destroy('s');
    assert.equal(s.destroyed, true);
    assert.equal(sm.has('s'), false);
    assert.equal(sm.currentKey, null);
  });

  it('init is only called once', async () => {
    const sm = new SceneManager();
    let initCount = 0;
    const s = {
      async init() {
        initCount += 1;
      },
      async enter() {},
      async exit() {},
    };
    sm.register('s', s);
    await sm.switchTo('s');
    await sm.switchTo('s'); // no-op same scene
    // force leave and re-enter
    sm.register('t', { async enter() {}, async exit() {} });
    await sm.switchTo('t');
    await sm.switchTo('s');
    assert.equal(initCount, 1);
  });
});
