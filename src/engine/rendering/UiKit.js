/**
 * Shared pixel-art UI drawing helpers (panels, rows, bars, text fitting).
 * Pure canvas 2D drawing: no DOM, no game state. Used by every in-game screen so the
 * HUD, dialogue, battle, menus and quest log share one visual language.
 */

/** Palette. Keep in sync with index.html styles for the touch overlay. */
export const UI_COLORS = Object.freeze({
  text: '#f6e7c1',
  textDim: '#a09070',
  speaker: '#c4a574',
  accent: '#e8c84a',
  warn: '#e8a06a',
  panel: '#1a1020',
  panelEdge: '#c4a574',
  rowFill: '#2a1d2e',
  rowSelected: '#5a3a6a',
  disabled: '#6b6070',
  hp: '#d2464b',
  hpBack: '#3a1a1e',
  mp: '#4b8fd2',
  mpBack: '#1a2a3e',
  ok: '#8fdf8f',
  enemy: '#df8f8f',
  shadow: '#000',
});

/**
 * Filled panel with a two-tone pixel border.
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawPanel(ctx, x, y, w, h, { fill = UI_COLORS.panel, edge = UI_COLORS.panelEdge, alpha = 0.95 } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.fillStyle = edge;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}

/**
 * Selectable row (menu entry, list item).
 * States: normal, selected (marker + highlight), disabled (dimmed). `pressed` shows the
 * same highlight as selected, so a tap on a row gives immediate feedback.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number,y:number,w:number,h:number}} r
 * @param {string} label
 * @param {{selected?: boolean, disabled?: boolean, pressed?: boolean, align?: 'left'|'center'}} [state]
 */
export function drawRow(ctx, r, label, { selected = false, disabled = false, pressed = false, align = 'left', font = '10px monospace' } = {}) {
  const active = selected || pressed;
  ctx.fillStyle = active ? UI_COLORS.rowSelected : UI_COLORS.rowFill;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  if (active) {
    ctx.fillStyle = UI_COLORS.accent;
    ctx.fillRect(r.x, r.y, 2, r.h);
  }
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = disabled ? UI_COLORS.disabled : active ? UI_COLORS.accent : UI_COLORS.text;
  const marker = selected && !disabled ? '> ' : '  ';
  // Label is trimmed with an ellipsis rather than spilling past the row's right edge.
  const text = fitText(ctx, marker + label, r.w - 12);
  if (align === 'center') {
    ctx.textAlign = 'center';
    ctx.fillText(text, r.x + r.w / 2, r.y + r.h / 2);
  } else {
    ctx.textAlign = 'left';
    ctx.fillText(text, r.x + 8, r.y + r.h / 2);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

/**
 * Horizontal bar (HP / MP / progress), clamped to [0, max].
 */
export function drawBar(ctx, x, y, w, h, value, max, color, back = UI_COLORS.hpBack) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  ctx.fillStyle = back;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.round(w * ratio), h);
  ctx.fillStyle = UI_COLORS.shadow;
  ctx.fillRect(x, y, w, 1);
}

/**
 * Fits text into maxWidth by trimming the end and adding an ellipsis.
 * Returns the text unchanged when it already fits.
 * @param {CanvasRenderingContext2D} ctx - font must already be set
 */
export function fitText(ctx, text, maxWidth) {
  const s = String(text ?? '');
  if (ctx.measureText(s).width <= maxWidth) return s;
  const ell = '…';
  let lo = 0;
  let hi = s.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(s.slice(0, mid) + ell).width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return s.slice(0, lo) + ell;
}

/**
 * Draws a line of text fitted to a width, so it never spills past its panel.
 */
export function drawFittedText(ctx, text, x, y, maxWidth, color = UI_COLORS.text) {
  ctx.fillStyle = color;
  ctx.fillText(fitText(ctx, text, maxWidth), x, y);
}

/**
 * Blinking "more text" indicator (▼). `time` is in seconds.
 */
export function drawContinueIndicator(ctx, x, y, time) {
  if (Math.floor(time * 2) % 2 !== 0) return;
  ctx.fillStyle = UI_COLORS.accent;
  ctx.font = '8px monospace';
  ctx.fillText('▼', x, y);
}

/**
 * Speaker tab sitting on the top edge of a dialogue box.
 */
export function drawSpeakerTag(ctx, x, y, name, maxWidth) {
  ctx.font = '9px monospace';
  const label = fitText(ctx, name || '', maxWidth - 12);
  const w = Math.min(maxWidth, Math.ceil(ctx.measureText(label).width) + 12);
  ctx.fillStyle = UI_COLORS.rowSelected;
  ctx.fillRect(x, y, w, 14);
  ctx.fillStyle = UI_COLORS.accent;
  ctx.fillRect(x, y + 13, w, 1);
  ctx.fillStyle = UI_COLORS.text;
  ctx.fillText(label, x + 6, y + 10);
  return w;
}
