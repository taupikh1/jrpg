import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ArtAssetRegistry } from '../../../src/engine/assets/ArtAssetRegistry.js';

describe('ArtAssetRegistry', () => {
  it('registers and returns frames for a sheet', () => {
    const reg = new ArtAssetRegistry();
    reg.register({
      id: 'test_idle',
      path: './x.png',
      category: 'character',
      animation: { idle: { frameCount: 4, frameWidth: 16, frameHeight: 16, frameDuration: 0.1 } },
    });
    const clip = reg.framesFor('test_idle', 'idle');
    assert.equal(clip.frames.length, 4);
    assert.equal(clip.frames[2].sx, 32);
    assert.equal(reg.missingReport(['test_idle', 'missing']).length, 1);
  });

  it('rejects duplicate ids', () => {
    const reg = new ArtAssetRegistry();
    reg.register({ id: 'a', path: './a.png', category: 'ui' });
    assert.throws(() => reg.register({ id: 'a', path: './b.png', category: 'ui' }));
  });
});
