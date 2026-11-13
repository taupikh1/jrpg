import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_PROGRESSION } from '../../../content/characters/progression.js';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';
import { ProgressionSystem } from '../../../src/engine/gameplay/progression/ProgressionSystem.js';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';

describe('Playable character roster and recruitment integration', () => {
  function makeScene() {
    const scene = Object.create(GameplayDemoScene.prototype);
    scene.stats = new CharacterStats(CHARACTER_PROGRESSION.orin.baseStats);
    scene.miraStats = new CharacterStats(CHARACTER_PROGRESSION.mira.baseStats);
    scene.kaelStats = new CharacterStats(CHARACTER_PROGRESSION.kael.baseStats);
    scene.ivenStats = new CharacterStats(CHARACTER_PROGRESSION.iven.baseStats);
    scene.taviStats = new CharacterStats(CHARACTER_PROGRESSION.tavi.baseStats);
    scene.progression = new ProgressionSystem();
    scene._ch1Flags = Object.create(null);
    scene._ch6Flags = Object.create(null);
    scene._ch7Flags = Object.create(null);
    scene._ch8Flags = Object.create(null);
    return scene;
  }

  it('keeps Orin and Mira runtime IDs and only adds Kael when the chapter-six party flag is present', () => {
    const scene = makeScene();
    assert.deepEqual(scene._activePartyMembers().map((m) => m.id), ['orin']);

    scene._ch1Flags.ch1_mira_follow = true;
    assert.deepEqual(scene._activePartyMembers().map((m) => m.id), ['orin', 'mira']);

    scene._ch6Flags.ch6_kael_joined = true;
    assert.deepEqual(scene._activePartyMembers().map((m) => m.id), ['orin', 'mira', 'kael']);
    assert.deepEqual(scene._battleParty().map((m) => m.id), ['orin', 'mira', 'kael']);
    assert.equal(scene._battleParty()[2].name, 'Kael Rowan');
    assert.equal(scene._battleParty()[2].stats, scene.kaelStats);
  });


  it('recruits Kael through the Chapter 6 story dialogue and supports a story-driven departure', () => {
    const events = new EventBus();
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    scene.init({ events, startMode: 'new' });
    assert.ok(scene.dialogue.get('ch6_kael_recruitment'));
    assert.ok(scene.dialogue.get('ch6_party_first_watch'));
    scene.dialogue.start('ch6_kael_recruitment');
    let advances = 0;
    while (scene.dialogue.isActive && advances++ < 20) scene.dialogue.advance();
    assert.equal(scene.dialogue.isActive, false);
    assert.equal(scene._ch6Flags.ch6_kael_joined, true);
    assert.deepEqual(scene._activePartyMembers().map((m) => m.id), ['orin', 'kael']);
    scene._applyDialogueEffects({ effects: { dismissMember: 'kael' } });
    assert.deepEqual(scene._activePartyMembers().map((m) => m.id), ['orin']);
    scene._applyDialogueEffects({ effects: { recruitMember: 'kael' } });
    assert.deepEqual(scene._activePartyMembers().map((m) => m.id), ['orin', 'kael']);
  });


  it('registers Iven and Tavi recruitment dialogues and persists their join/departure flags', () => {
    const events = new EventBus();
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    scene.init({ events, startMode: 'new' });
    assert.ok(scene.dialogue.get('ch7_iven_recruitment'));
    assert.ok(scene.dialogue.get('ch8_tavi_recruitment'));

    scene.dialogue.start('ch7_iven_recruitment');
    let advances = 0;
    while (scene.dialogue.isActive && advances++ < 20) scene.dialogue.advance();
    assert.equal(scene._ch7Flags.ch7_iven_joined, true);
    assert.deepEqual(scene._activePartyMembers().map((member) => member.id), ['orin', 'iven']);

    scene.dialogue.start('ch8_tavi_recruitment');
    advances = 0;
    while (scene.dialogue.isActive && advances++ < 20) scene.dialogue.advance();
    assert.equal(scene._ch8Flags.ch8_tavi_joined, true);
    assert.equal(scene._isPartyMemberActive('tavi'), true);

    scene._applyDialogueEffects({ effects: { dismissMember: 'iven' } });
    assert.equal(scene._ch7Flags.ch7_iven_departed, true);
    assert.equal(scene._isPartyMemberActive('iven'), false);
    scene._applyDialogueEffects({ effects: { dismissMember: 'tavi' } });
    assert.equal(scene._ch8Flags.ch8_tavi_departed, true);
    assert.equal(scene._isPartyMemberActive('tavi'), false);
    scene._applyDialogueEffects({ effects: { recruitMember: 'iven' } });
    scene._applyDialogueEffects({ effects: { recruitMember: 'tavi' } });
    assert.equal(scene._isPartyMemberActive('iven'), true);
    assert.equal(scene._isPartyMemberActive('tavi'), true);
  });

  it('round-trips Iven and Tavi HP/MP and story recruitment through the live scene save path', async () => {
    const adapter = new MemoryStorageAdapter();
    const scene = new GameplayDemoScene({ saveAdapter: adapter });
    scene.init({ events: new EventBus(), startMode: 'new' });
    scene._ch7Flags.ch7_iven_joined = true;
    scene._ch8Flags.ch8_tavi_joined = true;
    scene.ivenStats.hp = 21;
    scene.ivenStats.mp = 8;
    scene.taviStats.hp = 31;
    scene.taviStats.mp = 12;
    const saved = await scene._doSave();
    assert.equal(saved.ok, true);

    scene.ivenStats.hp = 1;
    scene.ivenStats.mp = 0;
    scene.taviStats.hp = 1;
    scene.taviStats.mp = 0;
    scene._ch7Flags.ch7_iven_joined = false;
    scene._ch8Flags.ch8_tavi_joined = false;
    await scene._doLoad();

    assert.equal(scene.ivenStats.hp, 21);
    assert.equal(scene.ivenStats.mp, 8);
    assert.equal(scene.taviStats.hp, 31);
    assert.equal(scene.taviStats.mp, 12);
    assert.equal(scene._ch7Flags.ch7_iven_joined, true);
    assert.equal(scene._ch8Flags.ch8_tavi_joined, true);
    assert.equal(scene._isPartyMemberActive('iven'), true);
    assert.equal(scene._isPartyMemberActive('tavi'), true);
  });

  it('keeps five recruited characters in the roster while enforcing four active battle slots', () => {
    const scene = makeScene();
    scene._ch1Flags.ch1_mira_follow = true;
    scene._ch6Flags.ch6_kael_joined = true;
    scene._ch7Flags.ch7_iven_joined = true;
    scene._ch8Flags.ch8_tavi_joined = true;
    assert.deepEqual(scene._activePartyMembers().map((member) => member.id), ['orin', 'mira', 'kael', 'tavi']);
    assert.equal(scene._isPartyMemberActive('iven'), false);
    scene._applyDialogueEffects({ effects: { dismissMember: 'kael' } });
    assert.deepEqual(scene._activePartyMembers().map((member) => member.id), ['orin', 'mira', 'tavi', 'iven']);
    assert.deepEqual(scene._battleParty().map((member) => member.id), ['orin', 'mira', 'tavi', 'iven']);
  });

  it('allows Iven and Tavi to participate in battle and receive character-specific EXP growth', () => {
    const scene = makeScene();
    scene._ch7Flags.ch7_iven_joined = true;
    scene._ch8Flags.ch8_tavi_joined = true;
    const party = scene._battleParty();
    const enemy = {
      id: 'arc2_roster_test_enemy', name: 'Musuh Uji', side: 'enemy',
      stats: new CharacterStats({ maxHp: 1, attack: 1, defense: 0, speed: 1, maxMp: 0 }),
    };
    const battle = new BattleManager({ rng: () => 0.99 });
    battle.start(party, [enemy], { exp: 12, gold: 0 });
    assert.deepEqual(battle.participants.filter((p) => p.side === 'player').map((p) => p.id), ['orin', 'tavi', 'iven']);
    const result = scene.progression.awardBattleExp(battle.participants, 12, {
      statsById: { orin: scene.stats, mira: scene.miraStats, kael: scene.kaelStats, iven: scene.ivenStats, tavi: scene.taviStats },
    });
    assert.deepEqual(result.grants.map((grant) => grant.characterId), ['orin', 'tavi', 'iven']);
    assert.equal(scene.progression.getState('iven').level, 2);
    assert.equal(scene.progression.getState('tavi').level, 2);
    assert.equal(scene.ivenStats.speed, CHARACTER_PROGRESSION.iven.baseStats.speed + CHARACTER_PROGRESSION.iven.growthPerLevel.speed);
    assert.equal(scene.taviStats.magicAttack, CHARACTER_PROGRESSION.tavi.baseStats.magicAttack + CHARACTER_PROGRESSION.tavi.growthPerLevel.magicAttack);
  });

  it('chains the Chapter 6 recruitment scene after the Chapter 5 departure banter', () => {
    const scene = Object.create(GameplayDemoScene.prototype);
    scene._dialogueLock = true;
    scene._dialogueDone = Object.create(null);
    scene._partySeen = Object.create(null);
    scene._partyQueue = [];
    scene._queuedDialogue = null;
    scene._storyNext = null;
    scene._onDialogueCompleted({ id: 'ch5_banter_departure' });
    assert.equal(scene._storyNext, 'ch6_kael_recruitment');
  });

  it('allows Kael to participate in battle and receive EXP while preserving existing members', () => {
    const scene = makeScene();
    scene._ch1Flags.ch1_mira_follow = true;
    scene._ch6Flags.ch6_kael_joined = true;
    const party = scene._battleParty();
    const enemy = {
      id: 'roster_test_enemy', name: 'Musuh Uji', side: 'enemy',
      stats: new CharacterStats({ maxHp: 1, attack: 1, defense: 0, speed: 1, maxMp: 0 }),
    };
    const battle = new BattleManager({ rng: () => 0.99 });
    battle.start(party, [enemy], { exp: 12, gold: 0 });

    assert.deepEqual(battle.participants.filter((p) => p.side === 'player').map((p) => p.id), ['orin', 'mira', 'kael']);
    const result = scene.progression.awardBattleExp(battle.participants, 12, {
      statsById: { orin: scene.stats, mira: scene.miraStats, kael: scene.kaelStats },
    });
    assert.deepEqual(result.grants.map((g) => g.characterId), ['orin', 'mira', 'kael']);
    assert.equal(scene.progression.getState('kael').level, 2);
    assert.equal(scene.kaelStats.defense, CHARACTER_PROGRESSION.kael.baseStats.defense + CHARACTER_PROGRESSION.kael.growthPerLevel.defense);
  });
});
