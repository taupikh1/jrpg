import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SpriteRenderer } from '../../../src/engine/rendering/SpriteRenderer.js';

describe('SpriteRenderer', () => {
  it('draw calls ctx.drawImage with save/restore', () => {
    const calls = [];
    const ctx = {
      save: () => calls.push('save'),
      restore: () => calls.push('restore'),
      translate: (...a) => calls.push(['translate', ...a]),
      rotate: (...a) => calls.push(['rotate', ...a]),
      scale: (...a) => calls.push(['scale', ...a]),
      drawImage: (...a) => calls.push(['drawImage', a.length]),
      globalAlpha: 1,
    };
    const img = { width: 16, height: 16 };
    SpriteRenderer.draw(ctx, img, { x: 10, y: 20, width: 16, height: 16 });
    assert.equal(calls[0], 'save');
    assert.equal(calls[calls.length - 1], 'restore');
    assert.ok(calls.some((c) => Array.isArray(c) && c[0] === 'drawImage'));
  });

  it('skips when opacity is 0', () => {
    let drew = false;
    const ctx = {
      save() {},
      restore() {},
      translate() {},
      rotate() {},
      scale() {},
      drawImage() {
        drew = true;
      },
      globalAlpha: 1,
    };
    SpriteRenderer.draw(ctx, { width: 8, height: 8 }, { x: 0, y: 0, opacity: 0 });
    assert.equal(drew, false);
  });

  it('fillRect uses save/restore', () => {
    const ops = [];
    const ctx = {
      save: () => ops.push('save'),
      restore: () => ops.push('restore'),
      fillRect: () => ops.push('fill'),
      globalAlpha: 1,
      fillStyle: '',
    };
    SpriteRenderer.fillRect(ctx, 0, 0, 10, 10, '#fff', 0.5);
    assert.deepEqual(ops, ['save', 'fill', 'restore']);
  });

  it('source rectangle path uses 9-arg drawImage', () => {
    let argCount = 0;
    const ctx = {
      save() {},
      restore() {},
      translate() {},
      rotate() {},
      scale() {},
      drawImage(...args) {
        argCount = args.length;
      },
      globalAlpha: 1,
    };
    SpriteRenderer.draw(
      ctx,
      { width: 64, height: 32 },
      { x: 0, y: 0, sx: 16, sy: 0, sw: 16, sh: 16, width: 16, height: 16 }
    );
    assert.equal(argCount, 9);
  });
});
