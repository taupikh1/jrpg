import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_LEVEL,
  EXP_CURVE_CONFIG,
  expToNextLevel,
  cumulativeExpForLevel,
  CHARACTER_PROGRESSION,
  PROGRESSION_SKILLS,
} from '../../../content/characters/progression.js';
import { getEnemyDefinition } from '../../../content/enemies/arc_01.js';
import { ProgressionSystem } from '../../../src/engine/gameplay/progression/ProgressionSystem.js';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { Equipment } from '../../../src/engine/gameplay/equipment/Equipment.js';
import { Inventory } from '../../../src/engine/gameplay/inventory/Inventory.js';
import { ItemRegistry } from '../../../src/engine/gameplay/items/ItemRegistry.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { ITEMS } from '../../../content/gameplay/demo-content.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';

function fakeInput() {
  let pressed = new Set();
  let downs = [];
  return {
    press(...codes) { pressed = new Set(codes); },
    tap(x, y) { downs.push({ x, y, pointerType: 'touch' }); },
    isDown() { return false; },
    justPressed(code) { return pressed.has(code); },
    pointerDownsThisFrame() { return downs; },
    primaryPointer() { return null; },
    endFrame() { pressed = new Set(); downs = []; },
  };
}

function frame(scene, input, ...codes) {
  input.press(...codes);
  scene.update(1 / 60);
  input.endFrame();
}

const tick = () => new Promise((r) => setTimeout(r, 15));

describe('EXP curve & character progression data', () => {
  it('computes monotonic EXP curve up to MAX_LEVEL and returns 0 at cap', () => {
    assert.equal(MAX_LEVEL, 10);
    assert.equal(expToNextLevel(1), 12);
    assert.equal(expToNextLevel(2), 28);
    let prev = 0;
    for (let lv = 1; lv < MAX_LEVEL; lv++) {
      const req = expToNextLevel(lv);
      assert.ok(req > prev, `lv ${lv} req (${req}) should exceed prev (${prev})`);
      prev = req;
    }
    assert.equal(expToNextLevel(MAX_LEVEL), 0);
    assert.equal(expToNextLevel(MAX_LEVEL + 5), 0);
    assert.equal(cumulativeExpForLevel(1), 0);
    assert.equal(cumulativeExpForLevel(2), EXP_CURVE_CONFIG.base);
  });

  it('defines distinct growth profiles for all five playable characters', () => {
    const orin = CHARACTER_PROGRESSION.orin;
    const mira = CHARACTER_PROGRESSION.mira;
    const kael = CHARACTER_PROGRESSION.kael;
    const iven = CHARACTER_PROGRESSION.iven;
    const tavi = CHARACTER_PROGRESSION.tavi;
    assert.ok(orin && mira && kael && iven && tavi);
    assert.equal(kael.id, 'kael');
    assert.equal(kael.name, 'Kael Rowan');
    assert.ok(kael.baseStats.maxHp > orin.baseStats.maxHp);
    assert.ok(kael.baseStats.defense > orin.baseStats.defense);
    assert.ok(kael.growthPerLevel.defense > orin.growthPerLevel.defense);
    assert.deepEqual(kael.skillUnlocks.map((row) => row.skillId), ['kael_guard', 'kael_shield_bash', 'kael_taunt', 'kael_protect_ally']);
    assert.ok(orin.growthPerLevel.maxHp > mira.growthPerLevel.maxHp);
    assert.ok(orin.growthPerLevel.attack > mira.growthPerLevel.attack);
    assert.ok(mira.growthPerLevel.maxMp > orin.growthPerLevel.maxMp);
    assert.ok(mira.growthPerLevel.magicAttack > orin.growthPerLevel.magicAttack);
    assert.ok(mira.growthPerLevel.speed > orin.growthPerLevel.speed);
    assert.ok(iven.baseStats.speed > orin.baseStats.speed);
    assert.ok(iven.growthPerLevel.speed > kael.growthPerLevel.speed);
    assert.ok(tavi.baseStats.magicAttack > mira.baseStats.magicAttack);
    assert.ok(tavi.growthPerLevel.maxMp > kael.growthPerLevel.maxMp);
  });
});

describe('ProgressionSystem engine', () => {
  it('handles single and multi-level jumps with skill unlocks and no duplicate skills', () => {
    const events = new EventBus();
    const emitted = [];
    events.on('progression.exp_gained', (e) => emitted.push(['exp', e]));
    events.on('progression.level_up', (e) => emitted.push(['lv', e]));
    events.on('progression.stat_up', (e) => emitted.push(['stat', e]));
    events.on('progression.skill_unlock', (e) => emitted.push(['skill', e]));

    const prog = new ProgressionSystem({ events });
    const orinStats = new CharacterStats(CHARACTER_PROGRESSION.orin.baseStats);
    orinStats.hp = 35;
    orinStats.mp = 10;

    // 12 + 28 + 56 = 96 EXP -> reaches Lv 4 in one jump (unlocking minor_heal @ Lv2 and orin_surge @ Lv4)
    const res = prog.grantExp('orin', 100, { stats: orinStats });
    assert.equal(res.prevLevel, 1);
    assert.equal(res.newLevel, 4);
    assert.equal(res.leveledUp, true);
    assert.equal(res.exp, 4);
    assert.deepEqual(res.unlockedSkills.map((s) => s.id), ['minor_heal', 'orin_surge']);
    assert.deepEqual(prog.getState('orin').unlockedSkills, ['ember', 'minor_heal', 'orin_surge']);

    // Max HP/MP increased, current HP/MP NOT accidentally healed to full
    assert.equal(orinStats.maxHp, 60 + 3 * 8);
    assert.equal(orinStats.hp, 35);
    assert.equal(orinStats.mp, 10);

    // Events fired cleanly
    assert.ok(emitted.some(([k]) => k === 'exp'));
    assert.ok(emitted.some(([k]) => k === 'lv'));
    assert.ok(emitted.some(([k]) => k === 'stat'));
    assert.ok(emitted.some(([k]) => k === 'skill'));

    // Subsequent EXP cannot duplicate already-unlocked skills
    const res2 = prog.grantExp('orin', 200, { stats: orinStats });
    assert.equal(res2.unlockedSkills.length, 0);
    const unlocked = prog.getState('orin').unlockedSkills;
    assert.equal(new Set(unlocked).size, unlocked.length);
  });

  it('tracks Kael progression and applies his approved defensive growth profile', () => {
    const prog = new ProgressionSystem();
    const stats = new CharacterStats(CHARACTER_PROGRESSION.kael.baseStats);
    const result = prog.grantExp('kael', 12, { stats });
    assert.equal(result.newLevel, 2);
    assert.equal(stats.maxHp, 82);
    assert.equal(stats.defense, 14);
    assert.equal(stats.hp, 72);
    assert.deepEqual(prog.getState('kael').unlockedSkills, ['kael_guard', 'kael_shield_bash']);

    const saved = prog.exportState();
    const restored = new ProgressionSystem();
    restored.importState(saved);
    assert.equal(restored.getState('kael').level, 2);
    assert.equal(restored.getState('kael').exp, 0);
  });

  it('clamps cleanly at MAX_LEVEL without overflow', () => {
    const prog = new ProgressionSystem();
    const res = prog.grantExp('mira', 999999);
    assert.equal(res.newLevel, MAX_LEVEL);
    assert.equal(res.exp, 0);
    assert.equal(res.expToNext, 0);
    assert.equal(prog.getState('mira').isMaxLevel, true);

    const extra = prog.grantExp('mira', 500);
    assert.equal(extra.gained, 0);
    assert.equal(extra.leveledUp, false);
    assert.equal(prog.getState('mira').level, MAX_LEVEL);
    assert.equal(prog.getState('mira').exp, 0);
  });

  it('preserves equipment stat modifiers during level-up without corruption or double-application', () => {
    const reg = new ItemRegistry();
    for (const it of ITEMS) reg.register(it);
    const inv = new Inventory({ registry: reg, capacity: 20 });
    inv.add('rusty_sword', 1);
    inv.add('leather_vest', 1);

    const prog = new ProgressionSystem();
    const stats = new CharacterStats(CHARACTER_PROGRESSION.orin.baseStats);
    const eq = new Equipment({ inventory: inv, stats, registry: reg });
    eq.equip('rusty_sword'); // +5 ATK
    eq.equip('leather_vest'); // +3 DEF
    assert.equal(stats.attack, 17);
    assert.equal(stats.defense, 9);

    prog.grantExp('orin', 12, { stats }); // Lv 2 (+2 ATK, +2 DEF)
    assert.equal(stats.base.attack, 14);
    assert.equal(stats.attack, 19);
    assert.equal(stats.base.defense, 8);
    assert.equal(stats.defense, 11);

    eq.unequip('weapon');
    eq.unequip('body');
    assert.equal(stats.attack, 14);
    assert.equal(stats.defense, 8);
  });

  it('enforces active living EXP distribution policy (KO members get 0 EXP)', () => {
    const prog = new ProgressionSystem();
    const orinStats = new CharacterStats(CHARACTER_PROGRESSION.orin.baseStats);
    const miraStats = new CharacterStats(CHARACTER_PROGRESSION.mira.baseStats);
    miraStats.hp = 0; // KO'd

    const res = prog.awardBattleExp(
      [
        { id: 'orin', side: 'player', stats: orinStats },
        { id: 'mira', side: 'player', stats: miraStats },
      ],
      12,
      { statsById: { orin: orinStats, mira: miraStats } }
    );
    assert.equal(res.grants.length, 1);
    assert.equal(prog.getState('orin').level, 2);
    assert.equal(prog.getState('mira').level, 1);
    assert.equal(prog.getState('mira').exp, 0);
  });

  it('sanitizes corrupt or incomplete progression data on importState', () => {
    const prog = new ProgressionSystem();
    prog.importState({
      orin: { level: 999, exp: -50, unlockedSkills: ['ember', 'ember', 'nonexistent'] },
      mira: { level: 1, exp: 99999, unlockedSkills: ['mira_light_bind', 'mira_spark'] },
    });
    const orin = prog.getState('orin');
    assert.equal(orin.level, MAX_LEVEL);
    assert.equal(orin.exp, 0);
    assert.equal(new Set(orin.unlockedSkills).size, orin.unlockedSkills.length);
    assert.ok(!orin.unlockedSkills.includes('nonexistent'));

    const mira = prog.getState('mira');
    assert.equal(mira.level, 1);
    assert.ok(mira.exp < expToNextLevel(1));
    assert.ok(!mira.unlockedSkills.includes('mira_light_bind'), 'future-level skill stripped on Lv 1 restore');
  });
});

describe('Battle rewards, skill-locking & GameplayDemoScene progression integration', () => {
  it('enforces unlocked skills in BattleManager and consumes no MP on locked skills', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const orinStats = new CharacterStats(CHARACTER_PROGRESSION.orin.baseStats);
    const enemy = {
      id: 't1', name: 'Sprite Duri', side: 'enemy', exp: 6, gold: 4,
      stats: new CharacterStats({ maxHp: 28, attack: 8, defense: 2, speed: 6, maxMp: 0 }),
    };
    bm.start([{ id: 'orin', name: 'Orin', side: 'player', stats: orinStats, skills: [PROGRESSION_SKILLS.ember] }], [enemy]);
    const locked = bm.commandSkill('orin', 't1', PROGRESSION_SKILLS.orin_surge);
    assert.equal(locked.ok, false);
    assert.equal(locked.reason, 'skill_locked');
    assert.equal(orinStats.mp, 25);
  });

  it('prevents duplicate EXP/reward claims, awards 0 on defeat/escape, and disables debug rewards', () => {
    const thorn = getEnemyDefinition('thorn_sprite');
    assert.ok(thorn && thorn.exp === 6);

    // 1. Victory claims once only
    const bm = new BattleManager({ rng: () => 0.99 });
    const orinStats = new CharacterStats(CHARACTER_PROGRESSION.orin.baseStats);
    const e1 = { id: 't1', name: thorn.name, side: 'enemy', exp: thorn.exp, gold: thorn.gold, stats: new CharacterStats({ maxHp: 1, attack: 1, defense: 0, speed: 1, maxMp: 0 }) };
    const e2 = { id: 't2', name: thorn.name, side: 'enemy', exp: thorn.exp, gold: thorn.gold, stats: new CharacterStats({ maxHp: 1, attack: 1, defense: 0, speed: 1, maxMp: 0 }) };
    bm.start([{ id: 'orin', name: 'Orin', side: 'player', stats: orinStats, skills: [] }], [e1, e2]);
    bm.commandAttack('orin', 't1');
    if (bm.current?.side === 'enemy') bm.runEnemyTurn();
    bm.commandAttack('orin', 't2');
    assert.equal(bm.state, 'ended');
    assert.equal(bm.result, 'victory');

    const firstClaim = bm.claimVictoryRewards();
    assert.equal(firstClaim.ok, true);
    assert.equal(firstClaim.rewards.exp, 12);
    assert.equal(firstClaim.rewards.gold, 8);
    const secondClaim = bm.claimVictoryRewards();
    assert.equal(secondClaim.ok, false);
    assert.equal(secondClaim.reason, 'already_claimed');

    // 2. Escape cannot claim rewards
    const bmEsc = new BattleManager({ rng: () => 0.1 });
    bmEsc.start([{ id: 'orin', name: 'Orin', side: 'player', stats: new CharacterStats(CHARACTER_PROGRESSION.orin.baseStats) }], [{
      id: 't1', name: thorn.name, side: 'enemy', exp: 6, gold: 4, stats: new CharacterStats({ maxHp: 28, attack: 5, defense: 2, speed: 1, maxMp: 0 }),
    }]);
    bmEsc.commandEscape('orin', 0.9);
    assert.equal(bmEsc.result, 'escaped');
    assert.equal(bmEsc.claimVictoryRewards().ok, false);

    // 3. Debug battle grants 0 EXP/gold/items
    const bmDbg = new BattleManager({ rng: () => 0.99 });
    const eDbg = { id: 't1', name: thorn.name, side: 'enemy', exp: 6, gold: 4, stats: new CharacterStats({ maxHp: 1, attack: 1, defense: 0, speed: 1, maxMp: 0 }) };
    bmDbg.start([{ id: 'orin', name: 'Orin', side: 'player', stats: new CharacterStats(CHARACTER_PROGRESSION.orin.baseStats) }], [eDbg], { grantRewards: false });
    bmDbg.commandAttack('orin', 't1');
    const dbgClaim = bmDbg.claimVictoryRewards();
    assert.equal(dbgClaim.ok, true);
    assert.equal(dbgClaim.rewards.exp, 0);
    assert.equal(dbgClaim.rewards.gold, 0);
  });

  it('road_ambush victory awards EXP, triggers level-up screen, sets non-farmable flag, and returns to world safely', () => {
    const input = fakeInput();
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    scene.init({ events: new EventBus(), input, startMode: 'new' });
    scene.mode = 'world';
    scene._ch1Flags.ch1_mira_follow = true;
    scene._startBattle({ grantRewards: true, source: 'road_ambush' });

    // Force enemies down so battle ends immediately in victory
    for (const e of scene.battle.enemies()) e.stats.hp = 0;
    scene.battle._checkEnd();
    scene._finalizeEndedBattle();

    assert.equal(scene.battle.result, 'victory');
    assert.equal(scene._battleSummary.exp, 12);
    assert.equal(scene.progression.getState('orin').level, 2);
    assert.equal(scene.progression.getState('mira').level, 2);
    assert.equal(scene._ch3Flags.ch3_road_ambush_cleared, true);
    assert.equal(scene._battleSummary.levelUps.length, 2);

    // Dismiss victory summary -> transitions to levelup queue (Orin, then Mira)
    frame(scene, input, 'KeyE');
    assert.equal(scene.mode, 'levelup');
    assert.equal(scene._levelUpQueue.length, 2);
    frame(scene, input, 'KeyE'); // dismiss Orin
    assert.equal(scene.mode, 'levelup');
    assert.equal(scene._levelUpQueue.length, 1);
    frame(scene, input, 'KeyE'); // dismiss Mira
    assert.equal(scene.mode, 'world');

    // Re-entering road_bellhaven will not respawn road_ambush
    scene._enterZoneAt('road_bellhaven', 80, 96);
    assert.equal(scene.entities.get('road_ambush'), null);
  });

  it('battle sub-menus use unlocked skills and ether_drop, and defeat recovers party safely', () => {
    const input = fakeInput();
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    scene.init({ events: new EventBus(), input, startMode: 'new' });
    scene.mode = 'world';
    scene.inventory.add('ether_drop', 1);
    scene.stats.mp = 10;
    scene._startBattle({ grantRewards: false, source: 'debug' });

    // Choose Skill sub-menu (index 1)
    frame(scene, input, 'ArrowDown');
    frame(scene, input, 'KeyE');
    assert.equal(scene._battleSub, 'skill');
    frame(scene, input, 'Escape');
    assert.equal(scene._battleSub, 'cmd');

    // Choose Item sub-menu (index 2): slot 0 is starter herb, slot 1 is ether_drop
    frame(scene, input, 'ArrowDown');
    frame(scene, input, 'KeyE');
    assert.equal(scene._battleSub, 'item');
    frame(scene, input, 'ArrowDown'); // select ether_drop
    frame(scene, input, 'KeyE');
    assert.equal(scene.stats.mp, 20);

    // Defeat safely recovers Orin HP instead of soft-locking at 0 HP
    scene.stats.hp = 0;
    scene.battle._checkEnd();
    scene._finalizeEndedBattle();
    frame(scene, input, 'KeyE');
    assert.equal(scene.mode, 'world');
    assert.ok(scene.stats.hp > 0);
  });

  it('Inventory unequip handles armor (body) slot and QuestLog.complete works', () => {
    const input = fakeInput();
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    scene.init({ events: new EventBus(), input, startMode: 'new' });
    scene.mode = 'world';
    scene.inventory.add('leather_vest', 1);
    scene.equipment.equip('leather_vest');
    assert.equal(scene.stats.defense, 9);

    scene._openOverlay('inventory');
    frame(scene, input, 'KeyU');
    assert.equal(scene.equipment.get('body'), null);
    assert.equal(scene.stats.defense, 6);

    const ql = new QuestLog();
    ql.register({ id: 'q_test', name: 'Test', objectives: [{ id: 'o1', type: 'talk', target: 'npc', need: 1 }] });
    ql.accept('q_test');
    const c = ql.complete('q_test');
    assert.equal(c.ok, true);
    assert.equal(ql.getStatus('q_test'), 'completed');
  });

  it('Save & Continue restores levels, EXP, unlockedSkills, equipment, and cleared ambush without double stats', async () => {
    const adapter = new MemoryStorageAdapter();
    const inputA = fakeInput();
    const a = new GameplayDemoScene({ saveAdapter: adapter });
    a.init({ events: new EventBus(), input: inputA, startMode: 'new' });
    a.mode = 'world';
    a._ch1Flags.ch1_mira_follow = true;
    a.inventory.add('rusty_sword', 1);
    a.inventory.add('leather_vest', 1);
    a.equipment.equip('rusty_sword');
    a.equipment.equip('leather_vest');
    a.progression.grantExp('orin', 40, { stats: a.stats }); // Lv 3 (0 leftover), unlocked minor_heal
    a.progression.grantExp('mira', 45, { stats: a.miraStats }); // Lv 3 (+5 leftover), unlocked mira_light_bind
    a.stats.hp = 45;
    a.miraStats.hp = 33;
    a._ch3Flags.ch3_road_ambush_cleared = true;
    await a._doSave();

    const b = new GameplayDemoScene({ saveAdapter: adapter });
    b.init({ events: new EventBus(), input: fakeInput(), startMode: 'continue' });
    b.update(1 / 60);
    await tick();

    assert.equal(b.progression.getState('orin').level, 3);
    assert.equal(b.progression.getState('orin').exp, 0);
    assert.deepEqual(b.progression.getState('orin').unlockedSkills, ['ember', 'minor_heal']);
    assert.equal(b.progression.getState('mira').level, 3);
    assert.equal(b.progression.getState('mira').exp, 5);
    assert.deepEqual(b.progression.getState('mira').unlockedSkills, ['mira_mend', 'mira_spark', 'mira_light_bind']);

    // Lv 3 Orin base ATK = 12 + 2*2 = 16, +5 rusty_sword = 21 (NOT double-applied!)
    assert.equal(b.stats.base.attack, 16);
    assert.equal(b.stats.attack, 21);
    assert.equal(b.stats.defense, 13); // 6 + 2*2 + 3 leather_vest
    assert.equal(b.stats.hp, 45);
    assert.equal(b.miraStats.hp, 33);
    assert.equal(b._ch3Flags.ch3_road_ambush_cleared, true);
  });

  it('QuestLog overlay scrolls past 4 quests when navigating down', () => {
    const input = fakeInput();
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    scene.init({ events: new EventBus(), input, startMode: 'new' });
    scene.mode = 'world';
    // Accept 5 quests so total visible > 4
    const ids = [...scene.quests._defs.keys()].slice(0, 5);
    for (const qid of ids) scene.quests.accept(qid);
    scene._openOverlay('quest');
    assert.equal(scene._questIndex, 0);
    for (let i = 0; i < 4; i++) frame(scene, input, 'ArrowDown');
    assert.equal(scene._questIndex, 4);
    frame(scene, input, 'ArrowUp');
    assert.equal(scene._questIndex, 3);
  });
});
