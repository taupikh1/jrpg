import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { paintBattleStage } from '../../../src/engine/rendering/pixelart/Backdrops.js';
import { PixelArt } from '../../../src/engine/rendering/pixelart/PixelArt.js';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';

const sha = (pb) => crypto.createHash('sha256').update(Buffer.from(pb.data)).digest('hex').slice(0, 16);
const hex = (c) => '#' + [0, 1, 2].map((i) => c[i].toString(16).padStart(2, '0')).join('');

describe('battle backdrop on landscape', () => {
  afterEach(() => PixelArt.configure({}));

  it('keeps the original 320 px stage unchanged (regression guard)', () => {
    assert.equal(sha(paintBattleStage('forest')), '868ef021a975d611');
    assert.equal(sha(paintBattleStage('road')), '084d0bed917d0f00');
    assert.equal(sha(paintBattleStage('forest', 100)), '868ef021a975d611', 'never narrower than 320');
  });

  it('paints a full-width stage with the composition centred', () => {
    const pb = paintBattleStage('forest', 517);
    assert.equal(pb.width, 517);
    assert.equal(pb.height, 110);
    const ox = Math.floor((517 - 320) / 2);
    assert.equal(hex(pb.get(250 + ox, 28)), '#fffbe8', 'moon moves with the centred layout');
    assert.notEqual(hex(pb.get(250, 28)), '#fffbe8', 'nothing left behind at the old position');
    // every column is fully opaque: no empty strip beside the scene
    for (const x of [0, 10, 258, 516]) for (const y of [0, 55, 109]) assert.equal(pb.get(x, y)[3], 255, `${x},${y}`);
  });

  it('caches stages per width', () => {
    PixelArt.configure({ toImage: (pb) => pb });
    const a = PixelArt.battleStage('forest', 517);
    assert.equal(a.width, 517);
    assert.equal(PixelArt.battleStage('forest', 517), a);
    assert.equal(PixelArt.battleStage('forest').width, 320);
  });
});

describe('battle layout is centred on wide screens', () => {
  function scene(logicalWidth) {
    const s = Object.create(GameplayDemoScene.prototype);
    s.pipeline = { surface: { logicalWidth } };
    return s;
  }

  it('offset is zero at 320 and half the extra width when wider', () => {
    assert.equal(scene(320)._battleOffsetX(), 0);
    assert.equal(scene(300)._battleOffsetX(), 0);
    assert.equal(scene(517)._battleOffsetX(), 98);
    assert.equal(scene(480)._battleOffsetX(), 80);
  });

  it('shifts taps into the 320 px battle coordinates', () => {
    const input = { pointerDownsThisFrame: () => [{ x: 108, y: 190, id: 1 }] };
    assert.deepEqual(scene(517)._battleTaps(input), [{ x: 10, y: 190, id: 1 }]);
    assert.deepEqual(scene(320)._battleTaps(input), [{ x: 108, y: 190, id: 1 }]);
    assert.deepEqual(scene(517)._battleTaps({}), []);
  });

  it('draws the layout translated by the offset on wide screens only', () => {
    const calls = [];
    const ctx = {
      canvas: { width: 517, height: 240 },
      save: () => calls.push('save'),
      restore: () => calls.push('restore'),
      translate: (x) => calls.push(`translate:${x}`),
      drawImage: () => calls.push('backdrop'),
      fillRect() {},
      fillStyle: '',
      globalAlpha: 1,
    };
    PixelArt.configure({ toImage: (pb) => pb });
    const s = scene(517);
    s.zones = { activeZone: { id: 'village' } };
    s._drawBattleInner = (c, w, h, wide) => calls.push(`inner:${w}:${wide}`);
    s._drawBattle(ctx, 517, 240);
    assert.deepEqual(calls.filter((c) => c !== 'save' && c !== 'restore'), ['backdrop', 'translate:98', 'inner:320:true']);

    calls.length = 0;
    s._drawBattle({ ...ctx, canvas: { width: 320, height: 240 } }, 320, 240);
    assert.deepEqual(calls, ['inner:320:false']);
  });
});
