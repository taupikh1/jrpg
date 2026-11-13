import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fitText, drawBar, drawRow, drawPanel, drawContinueIndicator, UI_COLORS } from '../../../src/engine/rendering/UiKit.js';

/** Fake 2D context: monospace text, 6px per character at 10px, recording draw calls. */
function recCtx() {
  const calls = [];
  const ctx = {
    font: '10px monospace',
    fillStyle: '#000',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    measureText(s) {
      const px = parseInt(this.font, 10) || 10;
      return { width: String(s).length * px * 0.6 };
    },
    fillRect(x, y, w, h) { calls.push({ op: 'rect', x, y, w, h, fill: this.fillStyle }); },
    fillText(t, x, y) { calls.push({ op: 'text', t, x, y, fill: this.fillStyle }); },
    save() {}, restore() {},
  };
  return { ctx, calls };
}

describe('fitText', () => {
  it('returns text unchanged when it fits', () => {
    const { ctx } = recCtx();
    ctx.font = '10px monospace';
    assert.equal(fitText(ctx, 'Hero', 100), 'Hero');
  });

  it('trims with an ellipsis so the result never exceeds maxWidth', () => {
    const { ctx } = recCtx();
    ctx.font = '10px monospace';
    const out = fitText(ctx, 'Kumpulkan Kayu Bersih untuk desa', 60);
    assert.ok(out.endsWith('…'));
    assert.ok(ctx.measureText(out).width <= 60, `width ${ctx.measureText(out).width} > 60`);
  });

  it('handles a width smaller than one character', () => {
    const { ctx } = recCtx();
    ctx.font = '10px monospace';
    assert.equal(fitText(ctx, 'abc', 1), '…');
  });
});

describe('drawBar', () => {
  it('fills proportionally and clamps to the bar', () => {
    const { ctx, calls } = recCtx();
    drawBar(ctx, 0, 0, 100, 6, 50, 100, '#f00');
    // Each drawBar emits three rects: back, fill, shadow line. Fill is the second of each triple.
    const rects = () => calls.filter((c) => c.op === 'rect');
    assert.equal(rects()[1].w, 50);
    drawBar(ctx, 0, 0, 100, 6, 500, 100, '#f00');
    assert.equal(rects()[4].w, 100);
    drawBar(ctx, 0, 0, 100, 6, -5, 100, '#f00');
    assert.equal(rects()[7].w, 0);
  });

  it('empty when max is zero (no divide-by-zero)', () => {
    const { ctx, calls } = recCtx();
    drawBar(ctx, 0, 0, 100, 6, 10, 0, '#f00');
    assert.equal(calls.filter((c) => c.op === 'rect')[1].w, 0);
  });
});

describe('drawRow states', () => {
  it('shows the selection marker only when selected and enabled', () => {
    const { ctx, calls } = recCtx();
    drawRow(ctx, { x: 0, y: 0, w: 100, h: 20 }, 'Lanjutkan', { selected: true });
    drawRow(ctx, { x: 0, y: 30, w: 100, h: 20 }, 'Simpan', { selected: false });
    const texts = calls.filter((c) => c.op === 'text').map((c) => c.t);
    assert.equal(texts[0], '> Lanjutkan');
    assert.equal(texts[1], '  Simpan');
  });

  it('a disabled selected row has no marker and a dim colour', () => {
    const { ctx, calls } = recCtx();
    drawRow(ctx, { x: 0, y: 0, w: 100, h: 20 }, 'Lanjutkan', { selected: true, disabled: true });
    const t = calls.find((c) => c.op === 'text');
    assert.equal(t.t, '  Lanjutkan');
    assert.equal(t.fill, UI_COLORS.disabled);
  });

  it('pressed uses the same highlight as selected', () => {
    const { ctx, calls } = recCtx();
    drawRow(ctx, { x: 0, y: 0, w: 100, h: 20 }, 'Batal', { pressed: true });
    const bg = calls.find((c) => c.op === 'rect');
    assert.equal(bg.fill, UI_COLORS.rowSelected);
  });
});

describe('drawPanel and continue indicator', () => {
  it('draws a fill and a border', () => {
    const { ctx, calls } = recCtx();
    drawPanel(ctx, 10, 10, 100, 50);
    assert.ok(calls.filter((c) => c.op === 'rect').length >= 5);
  });

  it('the continue arrow blinks with time', () => {
    const { ctx, calls } = recCtx();
    drawContinueIndicator(ctx, 0, 0, 0.0);
    drawContinueIndicator(ctx, 0, 0, 0.5);
    const shown = calls.filter((c) => c.op === 'text' && c.t === '▼');
    assert.equal(shown.length, 1, 'visible in one of two half-second phases');
  });
});

describe('drawRow label fitting', () => {
  it('a long label is trimmed so it stays inside the row width', () => {
    const { ctx, calls } = recCtx();
    drawRow(ctx, { x: 0, y: 0, w: 68, h: 15 }, 'Bertahan Sepanjang Malam', { font: '9px monospace' });
    const t = calls.find((c) => c.op === 'text');
    ctx.font = '9px monospace';
    assert.ok(t.t.endsWith('…'));
    assert.ok(ctx.measureText(t.t).width <= 68 - 12);
  });
});
