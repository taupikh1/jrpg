import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TextureCache } from '../../../src/engine/rendering/TextureCache.js';

describe('TextureCache', () => {
  it('set and get', () => {
    const c = new TextureCache();
    const img = { width: 1, height: 1 };
    c.set('a', img);
    assert.equal(c.get('a'), img);
    assert.equal(c.has('a'), true);
    assert.equal(c.size, 1);
  });

  it('clear', () => {
    const c = new TextureCache();
    c.set('a', {});
    c.clear();
    assert.equal(c.size, 0);
  });
});
