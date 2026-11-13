import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';

describe('FF2 ATB basic', () => {
  it('round mode is unchanged and ATB advances gauges', () => {
    const rng = () => 0.1;
    const bm = new BattleManager({ rng });
    const p1 = { id: 'p1', name: 'P1', side: 'player', stats: new CharacterStats({ hp: 10, maxHp: 10, speed: 20 }) };
    const e1 = { id: 'e1', name: 'E1', side: 'enemy', stats: new CharacterStats({ hp: 10, maxHp: 10, speed: 10 }) };
    bm.start([p1], [e1], {}, { mode: 'atb_active' });
    assert.equal(bm.mode, 'atb_active');
    const g0 = bm.atb.get('p1');
    bm.update(1.0);
    const g1 = bm.atb.get('p1');
    assert.ok(g1 > g0, 'gauge advanced');
    // faster should be ready sooner roughly
    bm.update(5.0);
    assert.ok(bm.readyQueue.length > 0 || bm.currentId, 'someone became ready');
  });

  it('default mode is round', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const p = { id: 'p', name: 'P', side: 'player', stats: new CharacterStats({ hp: 10, maxHp: 10 }) };
    const e = { id: 'e', name: 'E', side: 'enemy', stats: new CharacterStats({ hp: 10, maxHp: 10 }) };
    bm.start([p], [e]);
    assert.equal(bm.mode, 'round');
  });
});
