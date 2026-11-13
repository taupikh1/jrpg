import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { applyStatus } from '../../../src/engine/gameplay/battle/StatusEffects.js';
import { STATUS_EFFECTS } from '../../../content/combat/status_effects.js';

function recorder() {
  const events = [];
  return { events, emit(name, payload) { events.push({ name, payload }); } };
}
function orin(extra = {}) {
  return { id: 'orin', name: 'Orin', side: 'player', stats: new CharacterStats({ maxHp: 60, maxMp: 25, attack: 12, defense: 6, speed: 12 }), ...extra };
}
function boss(extra = {}) {
  return { id: 'boss', name: 'Penjaga', side: 'enemy', stats: new CharacterStats({ maxHp: 500, attack: 1, defense: 0, speed: 6 }), ...extra };
}
function battle(rec, rng = () => 0.5) {
  return new BattleManager({ events: rec, rng, statusDefs: STATUS_EFFECTS });
}
/** Drives the battle until the predicate is true or the step limit is reached. Orin defends on his turns. */
function drive(bm, stop = () => false, limit = 60) {
  for (let i = 0; i < limit && bm.state === 'active' && !stop(); i++) {
    if (bm.currentId === 'orin') bm.commandDefend('orin');
    else bm.runEnemyTurn();
  }
}

describe('Status effects — damage over time and healing', () => {
  it('poison ticks at the owner turn start for its duration, then expires', () => {
    const rec = recorder();
    const bm = battle(rec);
    bm.start([orin()], [boss()]);
    applyStatus(bm.participants[0], STATUS_EFFECTS.poison, 3);
    drive(bm, () => bm.participants[0].statuses.length === 0);
    const ticks = rec.events.filter((e) => e.name === 'battle.status_tick' && e.payload.status === 'poison');
    assert.equal(ticks.length, 3);
    for (const t of ticks) assert.equal(t.payload.amount, Math.max(1, Math.floor(60 * 0.06)));
    assert.ok(rec.events.some((e) => e.name === 'battle.status_expired' && e.payload.status === 'poison'));
  });

  it('regen heals at turn start and never exceeds max HP', () => {
    const rec = recorder();
    const bm = battle(rec);
    bm.start([orin()], [boss()]);
    const o = bm.participants[0];
    o.stats.hp = 58;
    applyStatus(o, STATUS_EFFECTS.regen, 3);
    drive(bm, () => o.statuses.length === 0);
    assert.ok(o.stats.hp <= o.stats.maxHp);
    assert.equal(o.stats.hp, 60);
    const heals = rec.events.filter((e) => e.name === 'battle.status_tick' && e.payload.kind === 'heal');
    assert.ok(heals.length >= 1);
  });

  it('a stunned enemy loses its turn and the stun is consumed', () => {
    const rec = recorder();
    const bm = battle(rec);
    bm.start([orin({ skills: undefined })], [boss()]);
    const stunSkill = { id: 'stun_strike', name: 'Pukulan Terhenti', mpCost: 0, power: 1, type: 'physical', effect: { id: 'stun', duration: 1 } };
    const r = bm.commandSkill('orin', 'boss', stunSkill);
    assert.equal(r.ok, true);
    assert.equal(bm.currentId, 'orin', 'stunned enemy should be skipped back to orin');
    assert.equal(bm.round, 2);
    assert.equal(bm.participants[1].statuses.length, 0);
    assert.ok(bm.log.some((m) => m.includes('loses the turn')));
  });
});

describe('Status effects — death at turn start', () => {
  it('poison that kills an enemy at its turn start ends the battle once as victory', () => {
    const rec = recorder();
    const bm = battle(rec);
    bm.start([orin()], [boss({ stats: new CharacterStats({ maxHp: 10, attack: 1, defense: 0, speed: 6 }) })]);
    bm.participants[1].stats.hp = 1;
    applyStatus(bm.participants[1], STATUS_EFFECTS.poison, 3);
    const r = bm.commandDefend('orin');
    assert.equal(r.victory, true);
    assert.equal(bm.result, 'victory');
    assert.equal(rec.events.filter((e) => e.name === 'battle.ended').length, 1);
  });

  it('poison that kills the party leader at his turn start ends the battle once as defeat', () => {
    const rec = recorder();
    const bm = battle(rec);
    bm.start([orin()], [boss()]);
    bm.participants[0].stats.hp = 1;
    applyStatus(bm.participants[0], STATUS_EFFECTS.poison, 3);
    bm.commandDefend('orin');
    const r = bm.runEnemyTurn();
    assert.equal(r.defeat, true);
    assert.equal(bm.result, 'defeat');
    assert.equal(rec.events.filter((e) => e.name === 'battle.ended').length, 1);
  });
});

describe('Status effects — command restrictions and stat changes', () => {
  it('silence blocks skills but not basic attacks', () => {
    const bm = battle(recorder());
    bm.start([orin({ skills: [{ id: 'ember' }] })], [boss()]);
    applyStatus(bm.participants[0], STATUS_EFFECTS.silence, 2);
    const skill = { id: 'ember', name: 'Bara', mpCost: 4, power: 1, type: 'physical' };
    assert.deepEqual(bm.commandSkill('orin', 'boss', skill), { ok: false, reason: 'silenced' });
    assert.equal(bm.availableCommands('orin').skill, false);
    assert.equal(bm.commandAttack('orin', 'boss').ok, true);
  });

  it('slow reduces speed and attack_up raises attack; both revert when they expire', () => {
    const bm = battle(recorder());
    bm.start([orin()], [boss()]);
    const o = bm.participants[0];
    applyStatus(o, STATUS_EFFECTS.slow, 1);
    assert.equal(o.stats.speed, 12 - Math.round(12 * 0.3));
    applyStatus(o, STATUS_EFFECTS.attack_up, 1);
    assert.equal(o.stats.attack, 12 + Math.round(12 * 0.25));
    drive(bm, () => o.statuses.length === 0);
    assert.equal(o.stats.speed, 12);
    assert.equal(o.stats.attack, 12);
  });

  it('stacking "none" ignores a reapplied stun while it is active; "refresh" resets duration', () => {
    const bm = battle(recorder());
    bm.start([orin()], [boss()]);
    const o = bm.participants[0];
    assert.equal(applyStatus(o, STATUS_EFFECTS.stun, 1).ok, true);
    assert.deepEqual(applyStatus(o, STATUS_EFFECTS.stun, 1), { ok: false, reason: 'already_active' });
    applyStatus(o, STATUS_EFFECTS.poison, 1);
    const r = applyStatus(o, STATUS_EFFECTS.poison, 3);
    assert.equal(r.refreshed, true);
    assert.equal(o.statuses.find((s) => s.id === 'poison').remaining, 3);
  });

  it('effect chance is rolled with the battle RNG; a failed roll applies nothing', () => {
    const skill = { id: 'venom', name: 'Racun', mpCost: 0, power: 1, type: 'physical', effect: { id: 'poison', duration: 2, chance: 0.5 } };
    const miss = battle(recorder(), () => 0.9);
    miss.start([orin()], [boss()]);
    miss.commandSkill('orin', 'boss', skill);
    assert.equal(miss.participants[1].statuses.length, 0);
    const hit = battle(recorder(), () => 0.1);
    hit.start([orin()], [boss()]);
    hit.commandSkill('orin', 'boss', skill);
    assert.deepEqual(hit.participants[1].statuses.map((s) => s.id), ['poison']);
  });

  it('an unknown status id is rejected without crashing', () => {
    const bm = battle(recorder());
    bm.start([orin()], [boss()]);
    const r = applyStatus(bm.participants[0], undefined, 2);
    assert.deepEqual(r, { ok: false, reason: 'unknown_status' });
    assert.equal(bm.participants[0].statuses.length, 0);
  });
});

describe('Status effects — lifetime and save safety', () => {
  it('all statuses and their stat modifiers are cleared when the battle ends in victory', () => {
    const rec = recorder();
    const bm = battle(rec);
    bm.start([orin()], [boss({ stats: new CharacterStats({ maxHp: 1, attack: 1, defense: 0, speed: 6 }) })]);
    const o = bm.participants[0];
    applyStatus(o, STATUS_EFFECTS.attack_up, 3);
    const r = bm.commandAttack('orin', 'boss');
    assert.equal(r.victory, true);
    assert.equal(o.statuses.length, 0);
    assert.equal(o.stats.attack, 12, 'attack modifier must not survive the battle');
  });

  it('start() removes leftover status modifiers from an interrupted battle', () => {
    const o = orin();
    o.stats.addModifier('status:attack_up', { attack: 3 });
    const bm = battle(recorder());
    bm.start([o], [boss()]);
    assert.equal(o.stats.attack, 12);
  });
});
