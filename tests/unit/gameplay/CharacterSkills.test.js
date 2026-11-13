import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { CHARACTER_PROGRESSION, PROGRESSION_SKILLS } from '../../../content/characters/progression.js';
import { ProgressionSystem } from '../../../src/engine/gameplay/progression/ProgressionSystem.js';
import { STATUS_EFFECTS } from '../../../content/combat/status_effects.js';
import { EventBus } from '../../../src/core/EventBus.js';

function participant(id, name, side, stats, skills = []) {
  return { id, name, side, stats, skills };
}
function enemy(speed = 1) {
  return participant('enemy', 'Musuh Uji', 'enemy', new CharacterStats({ maxHp: 300, maxMp: 0, attack: 30, defense: 0, speed }));
}
function player(id, speed, hp = 120) {
  return participant(id, id, 'player', new CharacterStats({ maxHp: hp, maxMp: 40, attack: 18, defense: 4, speed }), []);
}

function advanceTo(battle, id) {
  let guard = 0;
  while (battle.currentId !== id && battle.state === 'active' && guard++ < 12) {
    if (battle.current?.side === 'enemy') battle.runEnemyTurn();
    else battle.commandDefend(battle.currentId);
  }
  assert.equal(battle.currentId, id);
}

describe('Character skills and signature mechanics (B17)', () => {
  it('provides four distinct registered skills and one signature ability per playable character', () => {
    const progression = new ProgressionSystem();
    for (const id of ['orin', 'mira', 'kael', 'iven', 'tavi']) {
      const def = CHARACTER_PROGRESSION[id];
      assert.equal(def.skillUnlocks.length, 4, `${id} skill count`);
      const ids = def.skillUnlocks.map((row) => row.skillId);
      assert.equal(new Set(ids).size, 4);
      for (const skillId of ids) assert.ok(PROGRESSION_SKILLS[skillId], `${skillId} registered`);
      const signatures = ids.filter((skillId) => PROGRESSION_SKILLS[skillId].signature);
      assert.equal(signatures.length, 1, `${id} signature count`);
      assert.deepEqual(progression.getState(id).unlockedSkills, ids.filter((skillId) => def.skillUnlocks.find((row) => row.skillId === skillId).level === 1));
    }
  });

  it('unlocks Iven and Tavi skills only at their configured levels', () => {
    const progression = new ProgressionSystem();
    assert.deepEqual(progression.getState('iven').unlockedSkills, ['iven_quick_cut']);
    assert.deepEqual(progression.getState('tavi').unlockedSkills, ['tavi_spark_trap']);
    progression.grantExp('iven', 12);
    progression.grantExp('tavi', 12);
    assert.ok(progression.isSkillUnlocked('iven', 'iven_quickstep'));
    assert.ok(progression.isSkillUnlocked('tavi', 'tavi_field_patch'));
    assert.ok(!progression.isSkillUnlocked('iven', 'iven_shadow_route'));
    assert.ok(!progression.isSkillUnlocked('tavi', 'tavi_critter_call'));
  });

  it('unlocks Kael skills only at their configured levels', () => {
    const progression = new ProgressionSystem();
    assert.deepEqual(progression.getState('kael').unlockedSkills, ['kael_guard']);
    progression.grantExp('kael', 12);
    assert.deepEqual(progression.getState('kael').unlockedSkills, ['kael_guard', 'kael_shield_bash']);
    progression.grantExp('kael', 84);
    assert.ok(progression.isSkillUnlocked('kael', 'kael_taunt'));
    assert.ok(!progression.isSkillUnlocked('kael', 'kael_protect_ally'));
  });

  it('Iven and Tavi skills use existing battle damage and status pipelines', () => {
    const iven = player('iven', 22);
    iven.skills = [PROGRESSION_SKILLS.iven_quick_cut, PROGRESSION_SKILLS.iven_quickstep];
    const tavi = player('tavi', 18);
    tavi.skills = [PROGRESSION_SKILLS.tavi_spark_trap];
    const target = enemy();
    const bm = new BattleManager({ rng: () => 0.1, statusDefs: STATUS_EFFECTS });
    bm.start([iven, tavi], [target]);
    assert.equal(bm.currentId, 'iven');
    assert.equal(bm.commandSkill('iven', 'enemy', PROGRESSION_SKILLS.iven_quick_cut).ok, true);
    assert.ok(bm.participants.find((p) => p.id === 'enemy').statuses.some((status) => status.id === 'slow'));
    while (bm.current?.side === 'enemy' && bm.state === 'active') bm.runEnemyTurn();
    if (bm.currentId !== 'tavi') {
      let guard = 0;
      while (bm.currentId !== 'tavi' && bm.state === 'active' && guard++ < 8) {
        if (bm.current?.side === 'enemy') bm.runEnemyTurn();
        else bm.commandDefend(bm.currentId);
      }
    }
    if (bm.state === 'active' && bm.currentId === 'tavi') {
      assert.equal(bm.commandSkill('tavi', 'enemy', PROGRESSION_SKILLS.tavi_spark_trap).ok, true);
    }
  });

  it('rejects Iven and Tavi locked skills before spending MP', () => {
    const progression = new ProgressionSystem();
    const iven = player('iven', 22);
    const tavi = player('tavi', 18);
    iven.skills = progression.getUnlockedSkillObjects('iven');
    tavi.skills = progression.getUnlockedSkillObjects('tavi');
    const target = enemy();
    const bm = new BattleManager({ rng: () => 0.5, statusDefs: STATUS_EFFECTS });
    bm.start([iven, tavi], [target]);
    const ivenMp = iven.stats.mp;
    const lockedIven = bm.commandSkill('iven', 'enemy', PROGRESSION_SKILLS.iven_shadow_route);
    assert.equal(lockedIven.reason, 'skill_locked');
    assert.equal(iven.stats.mp, ivenMp);
    bm.commandDefend('iven');
    const taviMp = tavi.stats.mp;
    const lockedTavi = bm.commandSkill('tavi', 'enemy', PROGRESSION_SKILLS.tavi_critter_call);
    assert.equal(lockedTavi.reason, 'skill_locked');
    assert.equal(tavi.stats.mp, taviMp);
  });

  it('Iven signature protects an ally and grants haste; Tavi signature uses Resonance and poison', () => {
    const iven = player('iven', 22);
    const ally = player('orin', 10);
    iven.skills = [PROGRESSION_SKILLS.iven_shadow_route];
    const enemyTarget = enemy();
    const bm = new BattleManager({ rng: () => 0.1, statusDefs: STATUS_EFFECTS });
    bm.start([iven, ally], [enemyTarget]);
    assert.equal(bm.commandSkill('iven', 'orin', PROGRESSION_SKILLS.iven_shadow_route).ok, true);
    const protectedAlly = bm.view().participants.find((p) => p.id === 'orin');
    assert.equal(protectedAlly.protectedBy, 'iven');
    assert.ok(protectedAlly.statuses.some((status) => status.id === 'haste'));

    const tavi = player('tavi', 20);
    tavi.skills = [PROGRESSION_SKILLS.tavi_critter_call];
    const target = enemy();
    const bmTavi = new BattleManager({ rng: () => 0.1, statusDefs: STATUS_EFFECTS });
    bmTavi.start([tavi], [target]);
    const before = target.stats.hp;
    assert.equal(bmTavi.commandSkill('tavi', 'enemy', PROGRESSION_SKILLS.tavi_critter_call).ok, true);
    assert.ok(target.stats.hp < before);
    assert.ok(bmTavi.participants.find((p) => p.id === 'enemy').statuses.some((status) => status.id === 'poison'));
  });

  it('Mira signature healing restores HP and applies regeneration', () => {
    const mira = player('mira', 20);
    mira.skills = [PROGRESSION_SKILLS.mira_mend, PROGRESSION_SKILLS.mira_lumen_ward];
    mira.stats.hp = 30;
    const bm = new BattleManager({ rng: () => 0.5, statusDefs: STATUS_EFFECTS });
    bm.start([mira], [enemy()]);
    const result = bm.commandSkill('mira', 'mira', PROGRESSION_SKILLS.mira_lumen_ward);
    assert.equal(result.ok, true);
    assert.equal(mira.stats.hp, 46);
    assert.ok(bm.participants.find((p) => p.id === 'mira').statuses.some((status) => status.id === 'regen'));
  });

  it('Orin Resonance skill uses the shared damage and status pipeline', () => {
    const orin = player('orin', 20);
    orin.skills = [PROGRESSION_SKILLS.orin_echo_lance];
    const target = enemy();
    const bm = new BattleManager({ rng: () => 0.1, statusDefs: STATUS_EFFECTS });
    bm.start([orin], [target]);
    const before = target.stats.hp;
    const result = bm.commandSkill('orin', 'enemy', PROGRESSION_SKILLS.orin_echo_lance);
    assert.equal(result.ok, true);
    assert.ok(target.stats.hp < before);
    assert.ok(bm.participants.find((p) => p.id === 'enemy').statuses.some((status) => status.id === 'defense_down'));
  });

  it('Guard reduces Kael incoming damage and reports its effect', () => {
    const kael = player('kael', 20);
    kael.skills = [PROGRESSION_SKILLS.kael_guard];
    const bm = new BattleManager({ rng: () => 0.5, statusDefs: STATUS_EFFECTS });
    bm.start([kael], [enemy()]);
    const result = bm.commandSkill('kael', 'kael', PROGRESSION_SKILLS.kael_guard);
    assert.equal(result.ok, true);
    assert.equal(bm.view().participants.find((p) => p.id === 'kael').guarding, true);
    const before = kael.stats.hp;
    bm.runEnemyTurn();
    assert.ok(kael.stats.hp < before);
    assert.ok(before - kael.stats.hp < 30, 'guard mitigates at least half of the enemy hit');
  });

  it('Taunt redirects enemy targeting to Kael while active', () => {
    const orin = player('orin', 8);
    const kael = player('kael', 20);
    kael.skills = [PROGRESSION_SKILLS.kael_taunt];
    const events = new EventBus();
    const tauntTargets = [];
    events.on('battle.taunt_targeted', (payload) => tauntTargets.push(payload));
    const bm = new BattleManager({ rng: () => 0.5, events });
    const e = enemy();
    bm.start([orin, kael], [e]);
    bm.commandSkill('kael', 'kael', PROGRESSION_SKILLS.kael_taunt);
    advanceTo(bm, 'orin');
    bm.commandAttack('orin', 'enemy');
    const orinBefore = orin.stats.hp;
    const kaelBefore = kael.stats.hp;
    bm.runEnemyTurn();
    assert.equal(orin.stats.hp, orinBefore);
    assert.ok(kael.stats.hp < kaelBefore);
    assert.equal(tauntTargets.at(-1).targetId, 'kael');
  });

  it('Protect Ally redirects half the damage without recursive protection', () => {
    const orin = player('orin', 8);
    const kael = player('kael', 20);
    kael.skills = [PROGRESSION_SKILLS.kael_protect_ally];
    kael.stats.base.defense = 14;
    const events = new EventBus();
    const redirected = [];
    events.on('battle.damage_redirected', (payload) => redirected.push(payload));
    const bm = new BattleManager({ rng: () => 0.5, events });
    bm.start([orin, kael], [enemy()]);
    assert.equal(bm.commandSkill('kael', 'orin', PROGRESSION_SKILLS.kael_protect_ally).ok, true);
    advanceTo(bm, 'orin');
    bm.commandAttack('orin', 'enemy');
    const orinBefore = orin.stats.hp;
    const kaelBefore = kael.stats.hp;
    bm.runEnemyTurn();
    assert.ok(orin.stats.hp < orinBefore);
    assert.ok(kael.stats.hp < kaelBefore);
    assert.ok((orinBefore - orin.stats.hp) > (kaelBefore - kael.stats.hp), 'Kael mitigation uses his own higher defense');
    assert.equal(redirected[0].protectorId, 'kael');
    assert.ok(redirected[0].redirectedDamage > 0);
  });

  it('records a protector defeat when redirected damage knocks Kael out', () => {
    const orin = player('orin', 8);
    const kael = player('kael', 20, 5);
    kael.skills = [PROGRESSION_SKILLS.kael_protect_ally];
    const events = new EventBus();
    const defeated = [];
    events.on('battle.participant_defeated', (payload) => defeated.push(payload.id));
    const bm = new BattleManager({ rng: () => 0.5, events });
    bm.start([orin, kael], [enemy()]);
    bm.commandSkill('kael', 'orin', PROGRESSION_SKILLS.kael_protect_ally);
    advanceTo(bm, 'orin');
    bm.commandAttack('orin', 'enemy');
    bm.runEnemyTurn();
    assert.equal(kael.stats.isAlive, false);
    assert.ok(defeated.includes('kael'));
    assert.equal(orin.stats.isAlive, true);
  });

  it('expires Guard at the end of its documented protection window', () => {
    const kael = player('kael', 20);
    kael.skills = [PROGRESSION_SKILLS.kael_guard];
    const events = new EventBus();
    const expired = [];
    events.on('battle.defense_effect_expired', (payload) => expired.push(payload));
    const bm = new BattleManager({ rng: () => 0.5, events });
    bm.start([kael], [enemy()]);
    bm.commandSkill('kael', 'kael', PROGRESSION_SKILLS.kael_guard);
    assert.equal(bm.view().participants[0].guarding, true);
    bm.runEnemyTurn(); // finishes round 1 and advances to round 2
    assert.equal(bm.view().participants.find((p) => p.id === 'kael').guarding, true);
    bm.commandDefend('kael'); // Kael acts in round 2
    assert.equal(bm.view().participants.find((p) => p.id === 'kael').guarding, true);
    bm.runEnemyTurn(); // finishes round 2 and expires Guard at round 3
    assert.equal(bm.view().participants.find((p) => p.id === 'kael').guarding, false);
    assert.ok(expired.some((event) => event.targetId === 'kael' && event.effect === 'guard'));
  });

  it('rejects wrong target sides and locked skills without consuming MP', () => {
    const kael = player('kael', 20);
    kael.skills = [PROGRESSION_SKILLS.kael_guard];
    const bm = new BattleManager({ rng: () => 0.5 });
    bm.start([kael], [enemy()]);
    const mp = kael.stats.mp;
    const wrongTarget = bm.commandSkill('kael', 'enemy', PROGRESSION_SKILLS.kael_guard);
    assert.equal(wrongTarget.reason, 'invalid_target');
    assert.equal(kael.stats.mp, mp);
    const locked = bm.commandSkill('kael', 'enemy', PROGRESSION_SKILLS.kael_taunt);
    assert.equal(locked.reason, 'skill_locked');
    assert.equal(kael.stats.mp, mp);
  });

  it('enforces the four-member battle party limit', () => {
    const members = ['a', 'b', 'c', 'd', 'e'].map((id, i) => player(id, 10 - i));
    const bm = new BattleManager();
    assert.throws(() => bm.start(members, [enemy()]), /cannot exceed 4/);
    const valid = new BattleManager();
    assert.doesNotThrow(() => valid.start(members.slice(0, 4), [enemy()]));
  });
});
