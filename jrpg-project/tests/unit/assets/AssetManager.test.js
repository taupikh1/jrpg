import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AssetManager } from '../../../src/engine/assets/AssetManager.js';
import { TextureCache } from '../../../src/engine/rendering/TextureCache.js';
import { PerformanceMonitor } from '../../../src/engine/performance/PerformanceMonitor.js';

describe('AssetManager', () => {
  it('registers and loads via injectable loader', async () => {
    const textures = new TextureCache();
    const fakeImg = { width: 8, height: 8 };
    const am = new AssetManager({
      textures,
      imageLoader: async () => fakeImg,
    });
    am.register('hero', 'image', 'fake://hero.png');
    const r1 = await am.load('hero');
    assert.equal(r1.ok, true);
    assert.equal(textures.get('hero'), fakeImg);
    const r2 = await am.load('hero');
    assert.equal(r2.cached, true);
    assert.equal(am.loadedCount, 1);
  });

  it('duplicate register throws', () => {
    const am = new AssetManager();
    am.register('a', 'image', 'x');
    assert.throws(() => am.register('a', 'image', 'y'), /already/);
  });

  it('unknown load fails', async () => {
    const am = new AssetManager();
    const r = await am.load('nope');
    assert.equal(r.ok, false);
  });

  it('load failure sets error status', async () => {
    const am = new AssetManager({
      imageLoader: async () => {
        throw new Error('boom');
      },
    });
    am.register('bad', 'image', 'x');
    const r = await am.load('bad');
    assert.equal(r.ok, false);
    assert.equal(am.getInfo('bad').status, 'error');
  });

  it('loadAll and unload', async () => {
    const textures = new TextureCache();
    const am = new AssetManager({
      textures,
      imageLoader: async (src) => ({ src }),
    });
    am.register('a', 'image', 'a');
    am.register('b', 'image', 'b');
    const batch = await am.loadAll(['a', 'b']);
    assert.equal(batch.ok, true);
    am.unload('a');
    assert.equal(am.getInfo('a').status, 'registered');
  });
});

describe('PerformanceMonitor', () => {
  it('samples fps from dt', () => {
    const m = new PerformanceMonitor();
    m.sample(0.016);
    m.sample(0.016);
    m.entityCount = 5;
    m.zoneId = 'village';
    const s = m.snapshot();
    assert.ok(s.fps > 50);
    assert.equal(s.entityCount, 5);
    assert.equal(s.zoneId, 'village');
  });
});
