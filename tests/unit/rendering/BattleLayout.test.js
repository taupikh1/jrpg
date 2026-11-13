import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BATTLE_LAYOUT, partySlot, enemySlot } from '../../../src/scenes/battle/BattleLayout.js';

describe('FF1 BattleLayout', () => {
  it('all layout rectangles are inside 320x240', () => {
    const rects = [
      BATTLE_LAYOUT.enemyPanel,
      BATTLE_LAYOUT.partyStatusPanel,
      BATTLE_LAYOUT.commandPanel,
      BATTLE_LAYOUT.subList,
      ...BATTLE_LAYOUT.commandSlots,
    ];
    for (const r of rects) {
      assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= 320 && r.y + r.h <= 240, JSON.stringify(r));
    }
  });

  it('party and enemy slots do not overlap and stay in stage band', () => {
    for (let n = 1; n <= 4; n++) {
      const slots = Array.from({ length: n }, (_, i) => partySlot(i, n));
      for (const s of slots) {
        assert.ok(s.top >= BATTLE_LAYOUT.stageY0 - 10 && s.bottom <= BATTLE_LAYOUT.stageY1 + 10);
        assert.ok(s.left >= 200 && s.right <= 310);
      }
      // no mutual overlap (rough)
      for (let i = 0; i < slots.length; i++) for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i], b = slots[j];
        const overlap = !(a.right < b.left || b.right < a.left || a.bottom < b.top || b.bottom < a.top);
        assert.ok(!overlap, `party ${i} and ${j} overlap`);
      }
    }
    for (let n = 1; n <= 5; n++) {
      const slots = Array.from({ length: n }, (_, i) => enemySlot(i, n));
      for (const s of slots) {
        assert.ok(s.left >= 10 && s.right <= 180);
        assert.ok(s.top >= BATTLE_LAYOUT.stageY0 - 10 && s.bottom <= BATTLE_LAYOUT.stageY1 + 10);
      }
    }
  });
});
