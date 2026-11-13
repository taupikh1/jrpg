/**
 * Single source of truth for FF4-style battle layout (320x240 space).
 * All drawing and hit-testing must use these rectangles / slots.
 * Coordinates are in the 320-wide logical battle space (before _battleOffsetX).
 */
export const BATTLE_LAYOUT = Object.freeze({
  // Background band for sprites
  stageY0: 14,
  stageY1: 124,

  // Bottom panels (y ≈ 176..236)
  enemyPanel: { x: 6, y: 176, w: 110, h: 60 },
  partyStatusPanel: { x: 120, y: 176, w: 194, h: 60 },
  commandPanel: { x: 6, y: 176, w: 150, h: 60 }, // overlays enemy panel when open

  // Command buttons inside command panel (existing order/ids preserved)
  // Area tap: roughly x=10+col*72, y=178+row*17, w=68, h=15 but adjusted to fit
  commandSlots: [
    { id: 'attack',  label: 'Serang',   x: 10, y: 182, w: 68, h: 16 },
    { id: 'skill',   label: 'Skill',    x: 82, y: 182, w: 68, h: 16 },
    { id: 'item',    label: 'Item',     x: 10, y: 200, w: 68, h: 16 },
    { id: 'defend',  label: 'Bertahan', x: 82, y: 200, w: 68, h: 16 },
    { id: 'escape',  label: 'Kabur',    x: 10, y: 218, w: 68, h: 16 },
  ],

  // Sub-list / target area (used by skill/item/target selection)
  subList: { x: 6, y: 176, w: 308, h: 60 },
});

/** Party slot (i = 0..3). Diagonal staggered, feet y, facing left. */
export function partySlot(i, count) {
  const n = Math.max(1, Math.min(4, count || 1));
  const idx = Math.min(i, n - 1);
  // Proposed: y = 64,82,100,118 ; x = 262,238,262,238
  const ys = [70, 90, 110, 130];
  const xs = [270, 230, 270, 230];
  return {
    x: xs[idx] ?? 250,
    y: ys[idx] ?? 100,
    // bounding box for hit / overlap test (approx sprite)
    left: (xs[idx] ?? 250) - 8,
    right: (xs[idx] ?? 250) + 8,
    top: (ys[idx] ?? 100) - 32,
    bottom: (ys[idx] ?? 100) + 4,
  };
}

/** Enemy slot (i = 0..4). Left side, columns. */
export function enemySlot(i, count) {
  const n = Math.max(1, Math.min(5, count || 1));
  if (n === 1) {
    return { x: 96, y: 96, left: 96 - 20, right: 96 + 20, top: 96 - 40, bottom: 96 + 4 };
  }
  // Spread in 24..170
  const cols = n <= 3 ? 1 : 2;
  const col = i % cols;
  const row = Math.floor(i / cols);
  const xBase = 40 + col * 70;
  const yBase = 70 + row * 28;
  const x = Math.min(160, xBase);
  const y = Math.min(118, yBase);
  return {
    x,
    y,
    left: x - 18,
    right: x + 18,
    top: y - 36,
    bottom: y + 4,
  };
}

/** All interactive rectangles for hit-testing (commands, targets, etc.) */
export function getHitRects(mode, battle, players, enemies) {
  const rects = [];
  // Always include command slots when player turn and not in sub-menu
  if (mode === 'command') {
    for (const s of BATTLE_LAYOUT.commandSlots) {
      rects.push({ ...s, type: 'command', id: s.id });
    }
  }
  // Target sprites
  if (mode === 'target') {
    const side = battle?.targetSide || 'enemy';
    const list = side === 'player' ? players : enemies;
    list.forEach((p, i) => {
      const slot = side === 'player' ? partySlot(i, list.length) : enemySlot(i, list.length);
      rects.push({
        type: 'target',
        id: p.id,
        x: slot.left,
        y: slot.top,
        w: slot.right - slot.left,
        h: slot.bottom - slot.top,
      });
    });
  }
  return rects;
}
