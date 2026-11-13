import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { STATUS_EFFECTS } from '../../../content/combat/status_effects.js';
import { applyStatus } from '../../../src/engine/gameplay/battle/StatusEffects.js';

const PHASES = [
  { id: 'p1', hpBelowPct: 1.0, actions: [{ id: 'strike', name: 'Pukulan', type: 'physical', power: 1 }] },
  {
    id: 'p2',
    hpBelowPct: 0.5,
    onEnter: { dialogueId: 'boss_p2' },
    actions: [
      { id: 'quake', name: 'Gempa', type: 'physical', power: 1, element: 'earth' },
      { id: 'bind', name: 'Ikatan', type: 'physical', power: 1, effect: { id: 'stun', duration: 1 } },
    ],
  },
];
const SKILL = { id: 'hit', name: 'Hantam', mpCost: 0, power: 2, type: 'physical' };

function make(opts = {}) {
  const events = [];
  const bm = new BattleManager({ events: { emit: (n, p) => events.push({ n, p }) }, rng: () => 0.5, statusDefs: STATUS_EFFECTS });
  const orin = { id: 'orin', name: 'Orin', side: 'player', stats: new CharacterStats({ maxHp: 60, maxMp: 25, attack: 12, defense: 6, speed: 12 }) };
  const boss = {
    id: 'boss', name: 'Penjaga', side: 'enemy', phases: opts.phases ?? PHASES,
    stats: new CharacterStats({ maxHp: 100, attack: 1, defense: 0, speed: 6 }),
  };
  bm.start([orin], [boss], {}, opts.battle ?? {});
  return { bm, orin, boss, events };
}
const phaseEvents = (events) => events.filter((e) => e.n === 'battle.phase_entered').map((e) => e.p);

describe('Boss phases', () => {
  it('enters the first phase at battle start without dialogue', () => {
    const { bm, events } = make();
    assert.equal(bm.view().participants.find((p) => p.id === 'boss').phaseId, 'p1');
    assert.deepEqual(phaseEvents(events).map((p) => [p.phaseId, p.dialogueId]), [['p1', null]]);
  });

  it('enters p2 exactly once when HP drops to the threshold, with its dialogue id', () => {
    const { bm, boss, events } = make();
    for (let i = 0; i < 20 && boss.stats.hp > 50; i++) {
      if (bm.currentId === 'orin') bm.commandSkill('orin', 'boss', SKILL);
      else bm.runEnemyTurn();
    }
    assert.ok(boss.stats.hp <= 50);
    const p2 = phaseEvents(events).filter((p) => p.phaseId === 'p2');
    assert.equal(p2.length, 1);
    assert.equal(p2[0].dialogueId, 'boss_p2');
  });

  it('phases only advance: healing the boss back does not re-enter p1', () => {
    const { bm, boss, events } = make();
    bm.commandSkill('orin', 'boss', SKILL);
    while (boss.stats.hp > 50 && bm.state === 'active') {
      if (bm.currentId === 'orin') bm.commandSkill('orin', 'boss', SKILL);
      else bm.runEnemyTurn();
    }
    boss.stats.hp = boss.stats.maxHp;
    const before = phaseEvents(events).length;
    if (bm.currentId === 'orin') bm.commandDefend('orin');
    assert.equal(phaseEvents(events).length, before);
    assert.equal(bm.view().participants.find((p) => p.id === 'boss').phaseId, 'p2');
  });

  it('active statuses on the boss survive a phase transition', () => {
    const { bm, boss } = make();
    applyStatus(bm.participants.find((p) => p.id === 'boss'), STATUS_EFFECTS.defense_down, 10);
    while (bm.state === 'active' && boss.stats.hp > 50) {
      if (bm.currentId === 'orin') bm.commandSkill('orin', 'boss', SKILL);
      else bm.runEnemyTurn();
    }
    assert.equal(bm.view().participants.find((p) => p.id === 'boss').phaseId, 'p2');
    assert.ok(bm.participants.find((p) => p.id === 'boss').statuses.some((s) => s.id === 'defense_down'));
  });

  it('the boss cycles its phase actions in order and its effects reach the party', () => {
    const { bm, boss, orin } = make();
    while (bm.state === 'active' && boss.stats.hp > 50) {
      if (bm.currentId === 'orin') bm.commandSkill('orin', 'boss', SKILL);
      else bm.runEnemyTurn();
    }
    const mark = bm.log.length;
    const bossActions = [];
    for (let i = 0; i < 12 && bm.state === 'active'; i++) {
      if (bm.currentId === 'orin') bm.commandDefend('orin');
      else bm.runEnemyTurn();
      for (const line of bm.log.slice(mark)) {
        const m = line.match(/uses (Gempa|Ikatan) on/);
        if (m && (bossActions.length === 0 || bossActions[bossActions.length - 1] !== line)) bossActions.push(line);
      }
    }
    const names = bossActions.map((l) => l.match(/uses (Gempa|Ikatan)/)[1]);
    assert.ok(names.length >= 2, `boss acted ${names.length} times`);
    assert.deepEqual(names.slice(0, 2), ['Gempa', 'Ikatan'], 'phase actions must start from the first entry in order');
    for (let i = 0; i < names.length; i++) assert.equal(names[i], i % 2 === 0 ? 'Gempa' : 'Ikatan');
    assert.ok(bm.log.some((l) => l.includes('Orin is stunned and loses the turn')), 'Ikatan stun should skip Orin once');
    assert.equal(orin.stats.isAlive, true);
  });

  it('survive_turns ends in victory when the party outlasts the limit, even with the boss alive', () => {
    const { bm, boss, events } = make({ battle: { winCondition: { type: 'survive_turns', turns: 3 } } });
    for (let i = 0; i < 60 && bm.state === 'active'; i++) {
      if (bm.currentId === 'orin') bm.commandDefend('orin');
      else bm.runEnemyTurn();
    }
    assert.equal(bm.result, 'victory');
    assert.ok(boss.stats.isAlive);
    const v = events.find((e) => e.n === 'battle.victory');
    assert.equal(v.p.reason, 'survived');
    assert.ok(bm.round > 3);
  });

  it('defeat still ends the battle when the party falls', () => {
    const { bm, orin } = make({ battle: { winCondition: { type: 'survive_turns', turns: 3 } } });
    orin.stats.hp = 1;
    for (let i = 0; i < 20 && bm.state === 'active'; i++) {
      if (bm.currentId === 'orin') bm.commandDefend('orin');
      else bm.runEnemyTurn();
    }
    assert.equal(bm.result, 'defeat');
  });
});
