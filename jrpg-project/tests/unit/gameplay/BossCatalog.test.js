import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_CATALOG, getBossById } from '../../../content/bosses/index.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { createBossParticipant } from '../../../src/engine/gameplay/battle/createBossParticipant.js';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { STATUS_EFFECTS } from '../../../content/combat/status_effects.js';

function party({ speed = 1, attack = 1, defense = 999, hp = 50000 } = {}) {
  return [{ id: 'orin', name: 'Orin', side: 'player', stats: new CharacterStats({ maxHp: hp, maxMp: 50, attack, defense, magicAttack: attack, magicDefense: defense, speed }) }];
}

function makeBattle(boss, player = party()) {
  const events = [];
  const battle = new BattleManager({ events: { emit: (name, payload) => events.push({ name, payload }) }, rng: () => 0.99, statusDefs: STATUS_EFFECTS });
  const participant = createBossParticipant(boss);
  battle.start(player, [participant], { ...boss.rewards, grantRewards: true });
  return { battle, participant, events };
}

describe('Phase 3 boss catalogue', () => {
  it('registers six main bosses and two optional encounters across all six arcs', () => {
    assert.equal(BOSS_CATALOG.length, 8);
    assert.equal(BOSS_CATALOG.filter((boss) => boss.role === 'main_boss').length, 6);
    assert.equal(BOSS_CATALOG.filter((boss) => boss.optional).length, 2);
    for (let arc = 1; arc <= 6; arc++) assert.equal(BOSS_CATALOG.filter((boss) => boss.arc === arc && boss.role === 'main_boss').length, 1);
    assert.equal(getBossById('oathbreaker_colossus')?.chapter, 10);
    assert.equal(getBossById('starfall_astral_mantid')?.requiredForMainStory, false);
    assert.equal(getBossById('missing_boss'), null);
  });

  it('every boss enters its opening phase, executes a phase action and exposes valid reward data', () => {
    for (const boss of BOSS_CATALOG) {
      const { battle, participant, events } = makeBattle(boss);
      const phaseEvents = events.filter((event) => event.name === 'battle.phase_entered');
      assert.equal(phaseEvents[0]?.payload.phaseId, 'p1', `${boss.id}: opening phase`);
      assert.equal(battle.current?.side, 'enemy', `${boss.id}: boss should act first`);
      battle.runEnemyTurn();
      assert.ok(events.some((event) => event.name === 'battle.action_resolved' && event.payload.type === 'boss_action'), `${boss.id}: phase action not executed`);
      assert.ok(participant.stats.hp > 0);
      assert.ok(boss.rewards.exp > 0 && boss.rewards.gold > 0);
      assert.ok(boss.rewards.items.every((item) => item.qty > 0));
    }
  });

  it('every boss can be defeated through BattleManager, advances all phases and grants rewards once', () => {
    for (const boss of BOSS_CATALOG) {
      const { battle, participant, events } = makeBattle(boss, party({ speed: 999, attack: 160, hp: 50000 }));
      const hit = { id: 'test_finisher', name: 'Hantaman Uji', type: 'physical', power: 1.2 };
      let result = null;
      for (let turn = 0; turn < 200 && battle.state === 'active'; turn++) {
        if (battle.current?.side === 'player') result = battle.commandSkill('orin', participant.id, hit);
        else battle.runEnemyTurn();
      }
      assert.equal(result?.victory, true, `${boss.id}: victory`);
      assert.equal(battle.result, 'victory');
      const entered = events.filter((event) => event.name === 'battle.phase_entered').map((event) => event.payload.phaseId);
      assert.deepEqual(entered, boss.phases.map((phase) => phase.id), `${boss.id}: every phase should be reached even on a threshold-crossing hit`);
      const claim = battle.claimVictoryRewards();
      assert.equal(claim.ok, true);
      assert.equal(claim.rewards.exp, boss.rewards.exp);
      assert.equal(claim.rewards.gold, boss.rewards.gold);
      assert.deepEqual(claim.rewards.items, boss.rewards.items);
      assert.equal(battle.claimVictoryRewards().reason, 'already_claimed');
    }
  });

  it('rejects malformed boss definitions before a battle can start', () => {
    assert.throws(() => createBossParticipant({ id: 'bad_boss', phases: [] }), /at least two phases/);
  });

  it('keeps optional bosses explicitly outside the main-story completion requirement', () => {
    const optional = BOSS_CATALOG.filter((boss) => boss.optional);
    assert.ok(optional.length >= 2);
    for (const boss of optional) {
      assert.equal(boss.requiredForMainStory, false);
      assert.notEqual(boss.role, 'main_boss');
    }
  });
});
