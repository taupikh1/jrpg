import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { applyStatus } from '../../../src/engine/gameplay/battle/StatusEffects.js';
import { STATUS_EFFECTS } from '../../../content/combat/status_effects.js';

function make(inventory = null) {
  const bm = new BattleManager({ rng: () => 0.5, inventory, statusDefs: STATUS_EFFECTS });
  const orin = { id: 'orin', name: 'Orin', side: 'player', stats: new CharacterStats({ maxHp: 60, maxMp: 25, attack: 12, defense: 6, speed: 12 }) };
  const mira = { id: 'mira', name: 'Mira', side: 'player', stats: new CharacterStats({ maxHp: 48, maxMp: 32, attack: 9, defense: 5, speed: 14 }) };
  const e = { id: 'e1', name: 'Duri', side: 'enemy', stats: new CharacterStats({ maxHp: 28, attack: 8, defense: 2, speed: 10 }) };
  bm.start([orin, mira], [e]);
  return { bm, orin, mira, e };
}

describe('Battle commands (B14)', () => {
  it('the current actor gets the available commands; items need an inventory', () => {
    const { bm } = make();
    const c = bm.availableCommands(bm.currentId);
    assert.equal(c.attack, true);
    assert.equal(c.skill, true);
    assert.equal(c.item, false);
    assert.equal(c.defend, true);
    assert.equal(c.escape, true);
  });

  it('a non-current actor gets nothing and a reason', () => {
    const { bm } = make();
    const other = bm.currentId === 'orin' ? 'mira' : 'orin';
    const c = bm.availableCommands(other);
    assert.deepEqual([c.attack, c.skill, c.item, c.defend, c.escape], [false, false, false, false, false]);
    assert.equal(c.reasons.all, 'not_your_turn');
  });

  it('silence removes skills from the command list with a reason', () => {
    const { bm } = make();
    applyStatus(bm.participants.find((p) => p.id === 'orin'), STATUS_EFFECTS.silence, 2);
    while (bm.currentId !== 'orin') bm.commandDefend(bm.currentId);
    const c = bm.availableCommands('orin');
    assert.equal(c.skill, false);
    assert.equal(c.reasons.skill, 'silenced');
    assert.equal(c.attack, true);
  });

  it('the turn queue starts with the current actor and follows speed order', () => {
    const { bm } = make();
    const q = bm.getTurnQueue(4);
    assert.equal(q[0], bm.currentId);
    assert.deepEqual(q, ['mira', 'orin', 'e1', 'mira']); // Mira SPD 14 > Orin 12 > Duri 10
  });

  it('the turn queue lists only living participants', () => {
    const { bm, e } = make();
    e.stats.hp = 0;
    assert.ok(!bm.getTurnQueue(10).includes('e1'));
  });

  it('view() returns a presentation snapshot with statuses and phase', () => {
    const { bm } = make();
    applyStatus(bm.participants.find((p) => p.id === 'orin'), STATUS_EFFECTS.poison, 3);
    const v = bm.view();
    assert.equal(v.state, 'active');
    assert.equal(v.participants.length, 3);
    const o = v.participants.find((p) => p.id === 'orin');
    assert.deepEqual(o.statuses, [{ id: 'poison', remaining: 3 }]);
    assert.equal(o.phaseId, null);
    assert.equal(o.hp, 60);
  });
});
