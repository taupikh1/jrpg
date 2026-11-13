import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { DamageCalculator } from '../../../src/engine/gameplay/battle/DamageCalculator.js';
import { affinityFor, elementMultiplier, AFFINITY_MULTIPLIER } from '../../../src/engine/gameplay/battle/Elements.js';
import { ELEMENT_IDS } from '../../../content/combat/elements.js';

const NO_CRIT = () => 0.5;
function setup(affinities, defending = false) {
  const events = [];
  const bm = new BattleManager({ events: { emit: (n, p) => events.push({ n, p }) }, rng: NO_CRIT });
  const o = { id: 'orin', name: 'Orin', side: 'player', stats: new CharacterStats({ maxHp: 60, maxMp: 25, attack: 12, defense: 6, speed: 12 }) };
  const e = { id: 'boss', name: 'Penjaga', side: 'enemy', affinities, stats: new CharacterStats({ maxHp: 999, attack: 1, defense: 0, speed: 6 }) };
  bm.start([o], [e]);
  const pe = bm.participants.find((p) => p.id === 'boss');
  if (defending) pe.defending = true;
  return { bm, o: bm.participants.find((p) => p.id === 'orin'), e: pe, events };
}
function rawPhysical(o, e) {
  return DamageCalculator.physical(o.stats, e.stats, { power: 1, rng: NO_CRIT }).damage;
}
const SKILL = (element) => ({ id: 'strike', name: 'Serang', mpCost: 0, power: 1, type: 'physical', element });

describe('Elemental affinity', () => {
  it('weak takes 1.5x damage', () => {
    const { bm, o, e } = setup({ fire: 'weak' });
    const raw = rawPhysical(o, e);
    bm.commandSkill('orin', 'boss', SKILL('fire'));
    assert.equal(e.stats.hp, 999 - Math.floor(raw * 1.5));
  });

  it('resist takes 0.5x damage, never less than 1', () => {
    const { bm, o, e } = setup({ ice: 'resist' });
    const raw = rawPhysical(o, e);
    bm.commandSkill('orin', 'boss', SKILL('ice'));
    assert.equal(e.stats.hp, 999 - Math.max(1, Math.floor(raw * 0.5)));
  });

  it('immune takes no damage and reports the affinity', () => {
    const { bm, e, events } = setup({ light: 'immune' });
    bm.commandSkill('orin', 'boss', SKILL('light'));
    assert.equal(e.stats.hp, 999);
    const ev = events.find((x) => x.n === 'battle.action_resolved');
    assert.equal(ev.p.affinity, 'immune');
    assert.equal(ev.p.damage, 0);
  });

  it('neutral (no element, or element without an affinity entry) keeps raw damage', () => {
    const a = setup({});
    const raw = rawPhysical(a.o, a.e);
    a.bm.commandSkill('orin', 'boss', SKILL(null));
    assert.equal(a.e.stats.hp, 999 - raw);
    const b = setup({});
    b.bm.commandSkill('orin', 'boss', SKILL('wind'));
    assert.equal(b.e.stats.hp, 999 - raw);
  });

  it('defend halves damage after the affinity multiplier', () => {
    const { bm, o, e } = setup({ fire: 'weak' }, true);
    const raw = rawPhysical(o, e);
    bm.commandSkill('orin', 'boss', SKILL('fire'));
    assert.equal(e.stats.hp, 999 - Math.max(1, Math.floor(Math.floor(raw * 1.5) * 0.5)));
  });

  it('attack events carry the affinity for the presentation layer', () => {
    const { bm, events } = setup({ fire: 'weak' });
    bm.commandAttack('orin', 'boss');
    assert.equal(events.find((x) => x.n === 'battle.action_resolved').p.affinity, 'neutral');
  });
});

describe('Elemental rules (pure)', () => {
  it('affinityFor returns neutral for unknown or missing values', () => {
    assert.equal(affinityFor('fire', { fire: 'super' }), 'neutral');
    assert.equal(affinityFor(null, { fire: 'weak' }), 'neutral');
    assert.equal(affinityFor('fire', undefined), 'neutral');
    assert.equal(elementMultiplier('fire', { fire: 'immune' }), AFFINITY_MULTIPLIER.immune);
  });

  it('content element ids are unique and non-empty', () => {
    assert.equal(new Set(ELEMENT_IDS).size, ELEMENT_IDS.length);
    assert.ok(ELEMENT_IDS.length >= 6);
    for (const id of ELEMENT_IDS) assert.match(id, /^[a-z]+$/);
  });
});
