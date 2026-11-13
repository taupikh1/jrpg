import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/EventBus.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { STATUS_EFFECTS } from '../../../content/combat/status_effects.js';
import { CHAPTER_04_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_04.js';
import { CHAPTER_05_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_05.js';
import { BOSS_CATALOG } from '../../../content/bosses/index.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';

function makeScene() {
  const scene = Object.create(GameplayDemoScene.prototype);
  scene._battleEventUnsubs = [];
  scene._battleDialogueActive = false;
  scene._choiceIndex = 0;
  scene._toast = '';
  scene._showToast = (message) => { scene._toast = message; };
  scene.battle = {
    participants: [{ id: 'boss_1', name: 'Penjaga Gema' }],
  };
  const events = new EventBus();
  scene.dialogue = new DialogueEngine(events);
  return { scene, events };
}

function input({ taps = [], pressed = [] } = {}) {
  const keys = new Set(pressed);
  return {
    justPressed: (key) => keys.has(key),
    pointerDownsThisFrame: () => taps,
  };
}

describe('GameplayDemoScene battle integration', () => {
  it('shows localized status applied and expired feedback', () => {
    const { scene, events } = makeScene();
    scene._bindBattleEvents(events);
    events.emit('battle.status_applied', { id: 'boss_1', status: 'poison' });
    assert.equal(scene._toast, 'Penjaga Gema terkena Racun.');
    events.emit('battle.status_expired', { id: 'boss_1', status: 'poison' });
    assert.equal(scene._toast, 'Efek Racun pada Penjaga Gema berakhir.');
  });

  it('shows elemental affinity feedback only for non-neutral results', () => {
    const { scene, events } = makeScene();
    scene._bindBattleEvents(events);
    events.emit('battle.action_resolved', { affinity: 'weak' });
    assert.equal(scene._toast, 'Sangat efektif!');
    events.emit('battle.action_resolved', { affinity: 'neutral' });
    assert.equal(scene._toast, 'Sangat efektif!');
    events.emit('battle.action_resolved', { affinity: 'immune' });
    assert.equal(scene._toast, 'Tidak berpengaruh!');
  });

  it('starts a registered boss phase dialogue without leaving battle mode', () => {
    const { scene, events } = makeScene();
    scene.mode = 'battle';
    scene.dialogue.register({
      id: 'boss_phase_intro',
      startNode: 'start',
      nodes: { start: { speaker: 'Penjaga Gema', text: 'Cahaya itu berubah.' } },
    });
    scene._bindBattleEvents(events);
    events.emit('battle.phase_entered', { id: 'boss_1', phaseId: 'p2', index: 1, dialogueId: 'boss_phase_intro' });
    assert.equal(scene._toast, 'Penjaga Gema memasuki fase 2!');
    assert.equal(scene._battleDialogueActive, true);
    assert.equal(scene.dialogue.currentNode().text, 'Cahaya itu berubah.');
    assert.equal(scene.mode, 'battle');
  });

  it('advances phase dialogue and returns control to battle without changing scene mode', () => {
    const { scene, events } = makeScene();
    scene.mode = 'battle';
    scene.dialogue.register({
      id: 'boss_phase_intro',
      startNode: 'first',
      nodes: {
        first: { text: 'Fase kedua dimulai.', next: 'last' },
        last: { text: 'Jangan lengah.' },
      },
    });
    scene._bindBattleEvents(events);
    events.emit('battle.phase_entered', { id: 'boss_1', index: 1, dialogueId: 'boss_phase_intro' });
    scene._updateBattleDialogue(input({ pressed: ['Enter'] }));
    assert.equal(scene.dialogue.currentNode().text, 'Jangan lengah.');
    assert.equal(scene._battleDialogueActive, true);
    scene._updateBattleDialogue(input({ pressed: ['Enter'] }));
    assert.equal(scene._battleDialogueActive, false);
    assert.equal(scene.mode, 'battle');
  });


  it('starts a registered boss, grants rewards once and records its persistent chapter flag on victory', () => {
    const scene = Object.create(GameplayDemoScene.prototype);
    const bossEvents = new EventBus();
    scene.battle = new BattleManager({ events: bossEvents, rng: () => 0.99, statusDefs: STATUS_EFFECTS });
    scene._battleParty = () => [{
      id: 'orin', name: 'Orin', side: 'player',
      stats: new CharacterStats({ maxHp: 5000, maxMp: 20, attack: 100000, defense: 500, magicAttack: 100000, magicDefense: 500, speed: 999 }),
    }];
    scene._bossFlags = Object.create(null);
    scene._ch5Flags = Object.create(null);
    scene._battleSummary = null;
    scene._battleBossDef = null;
    scene._battleSource = 'debug';
    scene._battleEventUnsubs = [];
    scene._showToast = () => {};
    scene.inventory = { add: () => ({ ok: true }) };
    scene.progression = { awardBattleExp: (_party, totalExp) => ({ totalExp, grants: [], levelUps: [] }) };
    scene.stats = {};
    scene.miraStats = null;
    scene.kaelStats = null;
    scene.ivenStats = null;
    scene.taviStats = null;
    scene.gold = 0;
    scene._audio = null;

    const started = scene._startBossBattle('warden_of_first_resonance');
    assert.equal(started.ok, true);
    assert.equal(scene.mode, 'battle');
    const boss = scene.battle.enemies()[0];
    const result = scene.battle.commandSkill('orin', boss.id, { id: 'finish', name: 'Serangan Uji', type: 'physical', power: 100 });
    assert.equal(result.victory, true);
    scene._finalizeEndedBattle();
    assert.equal(scene._ch5Flags.ch5_boss_warden_of_first_resonance_defeated, true);
    assert.equal(scene._bossFlags.ch5_boss_warden_of_first_resonance_defeated, true);
    assert.equal(scene.gold, 180);
    assert.equal(scene._battleSummary.result, 'victory');
    assert.equal(scene._startBossBattle('warden_of_first_resonance').reason, 'already_defeated');
  });


  it('includes persistent boss flags in the existing save payload without requiring a schema bump', async () => {
    const scene = Object.create(GameplayDemoScene.prototype);
    let savedWorldFlags = null;
    scene.saveManager = {
      buildPayload: (context) => { savedWorldFlags = context.worldFlags; return { world: { flags: context.worldFlags } }; },
      save: async () => ({ ok: true }),
    };
    Object.assign(scene, {
      player: {}, stats: {}, inventory: {}, equipment: {}, quests: {},
      zones: { activeZone: { id: 'village' } }, gold: 10, miraStats: null, kaelStats: null,
      ivenStats: null, taviStats: null, progression: null,
      _partyWorldFlags: () => ({}), _bossFlags: { ch5_boss_warden_of_first_resonance_defeated: true },
      _ch1Flags: {}, _ch2Flags: {}, _ch3Flags: {}, _ch4Flags: {}, _ch5Flags: { ch5_boss_warden_of_first_resonance_defeated: true },
      _ch6Flags: {}, _ch7Flags: {}, _ch8Flags: {}, _partySeen: {}, _dialogueDone: {},
      _showToast: () => {}, _audio: null,
    });
    const result = await scene._doSave();
    assert.equal(result.ok, true);
    assert.equal(savedWorldFlags.bosses.ch5_boss_warden_of_first_resonance_defeated, true);
    assert.equal(savedWorldFlags.ch5.ch5_boss_warden_of_first_resonance_defeated, true);
  });


  it('registers the Arc I boss phase dialogues referenced by the real boss data', () => {
    const { scene, events } = makeScene();
    for (const definition of [...CHAPTER_04_DIALOGUES, ...CHAPTER_05_DIALOGUES]) scene.dialogue.register(definition);
    const arcOneBosses = BOSS_CATALOG.filter((boss) => boss.arc === 1);
    const phaseDialogueIds = arcOneBosses.flatMap((boss) => boss.phases.map((phase) => phase.onEnter?.dialogueId).filter(Boolean));
    assert.deepEqual(new Set(phaseDialogueIds), new Set([
      'ch4_boss_veilkeeper_phase2', 'ch5_boss_resonance_phase2', 'ch5_boss_resonance_phase3',
    ]));
    scene._bindBattleEvents(events);
    events.emit('battle.phase_entered', { id: 'boss_1', index: 1, dialogueId: 'ch5_boss_resonance_phase2' });
    assert.equal(scene._battleDialogueActive, true);
    assert.equal(scene.dialogue.currentNode().text, 'Denyutnya berubah. Simpul itu seperti sedang mengingat sesuatu yang lama sekali terkubur.');
  });


  it('round-trips a defeated Arc I boss through the live GameplayDemoScene save/load path', async () => {
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    scene.init({ events: new EventBus(), startMode: 'new' });
    const flag = 'ch5_boss_warden_of_first_resonance_defeated';
    scene._bossFlags[flag] = true;
    scene._ch5Flags[flag] = true;
    const saved = await scene._doSave();
    assert.equal(saved.ok, true);
    scene._bossFlags[flag] = false;
    scene._ch5Flags[flag] = false;
    const loaded = await scene._doLoad();
    assert.equal(scene._bossFlags[flag], true);
    assert.equal(scene._ch5Flags[flag], true);
    scene.destroy?.();
  });

  it('unsubscribes old battle event listeners when rebound', () => {
    const { scene, events } = makeScene();
    scene._bindBattleEvents(events);
    assert.equal(events.listenerCount('battle.status_applied'), 1);
    scene._bindBattleEvents(null);
    assert.equal(events.listenerCount('battle.status_applied'), 0);
    assert.equal(events.listenerCount('battle.phase_entered'), 0);
  });


  it('opens and confirms a skill submenu through mobile touch controls', () => {
    const { scene } = makeScene();
    let usedSkill = null;
    const actor = {
      id: 'orin', side: 'player', stats: { isAlive: true },
      skills: [{ id: 'spark', name: 'Percikan', type: 'magical', mpCost: 2 }],
    };
    const enemy = { id: 'thorn1', side: 'enemy', stats: { isAlive: true } };
    scene.battle = {
      state: 'active', current: actor, result: null,
      party: () => [actor], enemies: () => [enemy],
      availableCommands: () => ({ attack: true, skill: true, item: true, defend: true, escape: true, reasons: {} }),
      commandSkill: (actorId, targetId, skill) => { usedSkill = { actorId, targetId, skillId: skill.id }; return { ok: true }; },
    };
    scene._battleSub = 'cmd';
    scene._battleCmd = 0;
    scene._battleTarget = 0;
    scene._battleConsumables = () => [];
    scene._finalizeEndedBattle = () => {};
    scene._audio = null;
    scene._updateBattle(input({ taps: [{ x: 20, y: 197 }] }));
    assert.equal(scene._battleSub, 'skill');
    scene._updateBattle(input({ taps: [{ x: 250, y: 223 }] }));
    assert.deepEqual(usedSkill, { actorId: 'orin', targetId: 'thorn1', skillId: 'spark' });
    assert.equal(scene._battleSub, 'cmd');
  });

  it('blocks a silenced actor from opening the skill submenu', () => {
    const { scene } = makeScene();
    const actor = { id: 'orin', side: 'player', skills: [], stats: { isAlive: true } };
    const enemy = { id: 'thorn1', side: 'enemy', stats: { isAlive: true } };
    scene.battle = {
      state: 'active', current: actor, result: null,
      party: () => [actor], enemies: () => [enemy],
      availableCommands: () => ({ attack: true, skill: false, item: true, defend: true, escape: true, reasons: { skill: 'silenced' } }),
    };
    scene._battleSub = 'cmd';
    scene._battleCmd = 0;
    scene._battleTarget = 0;
    scene._battleConsumables = () => [];
    scene._audio = null;
    scene._updateBattle(input({ taps: [{ x: 20, y: 197 }] }));
    assert.equal(scene._battleSub, 'cmd');
    assert.equal(scene._toast, 'Dalam keadaan Bisu, skill tidak bisa digunakan.');
  });

  it('executes a battle command when its mobile touch target is tapped', () => {
    const { scene } = makeScene();
    let defendedBy = null;
    const actor = { id: 'orin', side: 'player', skills: [], stats: { isAlive: true } };
    const enemy = { id: 'thorn1', side: 'enemy', stats: { isAlive: true } };
    scene.battle = {
      state: 'active',
      current: actor,
      result: null,
      party: () => [actor],
      enemies: () => [enemy],
      availableCommands: () => ({ attack: true, skill: true, item: true, defend: true, escape: true, reasons: {} }),
      commandDefend: (id) => { defendedBy = id; return { ok: true }; },
    };
    scene._battleSub = 'cmd';
    scene._battleCmd = 0;
    scene._battleTarget = 0;
    scene._battleConsumables = () => [];
    scene._finalizeEndedBattle = () => {};
    scene._audio = null;
    scene._updateBattle(input({ taps: [{ x: 90, y: 185 }] }));
    assert.equal(defendedBy, 'orin');
  });
});
