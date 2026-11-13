// Test harness (not a test file: not matched by the *.test.js globs).
// Builds a GameplayDemoScene instance with real EventBus, real DialogueEngine and
// real Chapter 5 dialogue/party content. Scene-side engine calls that need a browser
// (rendering, entities, camera) are stubbed as no-ops.
import { EventBus } from '../../../src/core/EventBus.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';
import { CHAPTER_05_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_05.js';
import { CHAPTER_04_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_04.js';
import { CHAPTER_05_PARTY } from '../../../content/dialogue/party/ch5_party.js';
import { CHAPTER_02_PARTY } from '../../../content/dialogue/party/ch2_party.js';
import { CHAPTER_03_PARTY } from '../../../content/dialogue/party/ch3_party.js';
import { CHAPTER_04_PARTY } from '../../../content/dialogue/party/ch4_party.js';
import { DIALOGUE_CH1_PARTY_ORIN_MIRA_TRAVEL } from '../../../content/dialogue/party/ch1_party.js';

export function makeScene() {
  const scene = Object.create(GameplayDemoScene.prototype);
  const events = new EventBus();
  const dialogue = new DialogueEngine(events);
  for (const d of [...CHAPTER_02_PARTY, ...CHAPTER_03_PARTY, ...CHAPTER_04_PARTY, ...CHAPTER_04_DIALOGUES, ...CHAPTER_05_DIALOGUES, ...CHAPTER_05_PARTY, DIALOGUE_CH1_PARTY_ORIN_MIRA_TRAVEL]) dialogue.register(d);
  const toasts = [];
  Object.assign(scene, {
    dialogue,
    _events: events,
    mode: 'world',
    _showToast: (m) => toasts.push(m),
    _toasts: toasts,
    _partySeen: Object.create(null),
    _partyQueue: [],
    _queuedDialogue: null,
    _queuedIsParty: false,
    _storyNext: null,
    _startFails: Object.create(null),
    _dialogueDone: Object.create(null),
    _dialogueLock: false,
    _ch1Flags: Object.create(null),
    _ch2Flags: Object.create(null),
    _ch3Flags: Object.create(null),
    _ch4Flags: Object.create(null),
    _ch5Flags: Object.create(null),
    _lastSafePos: null,
  });
  events.on('dialogue.completed', (p) => scene._onDialogueCompleted(p));
  // Same effect path as the real scene (flags, quest accept/objectives, chapter hooks).
  const applyFx = (p) => scene._applyDialogueEffects(p);
  events.on('dialogue.node_effects', applyFx);
  events.on('dialogue.choice_selected', applyFx);
  // Record which dialogues were actually started (wrapping keeps the real behavior).
  scene.started = [];
  const realStart = dialogue.start.bind(dialogue);
  dialogue.start = (id) => {
    const r = realStart(id);
    scene.started.push(id);
    return r;
  };
  return { scene, events, dialogue };
}

/** Play one dialogue to completion through the real engine (emits dialogue.completed). */
export function playToEnd(scene, dialogue, id) {
  scene._startDialogue(id);
  if (!scene.mode || scene.mode !== 'dialogue') throw new Error(`not started: ${id}`);
  dialogue.end();
  scene.mode = 'world';
}

/**
 * Play a dialogue as a player would: advance linear nodes (which emits node effects) and take
 * the first choice when a choice node appears. Emits dialogue.completed at the end.
 */
export function playThrough(scene, dialogue, id, pickChoice = 0) {
  scene._startDialogue(id);
  if (scene.mode !== 'dialogue') throw new Error(`not started: ${id}`);
  for (let guard = 0; dialogue.isActive && guard < 200; guard++) {
    const node = dialogue.currentNode();
    if (node?.choices?.length) dialogue.choose(pickChoice);
    else dialogue.advance();
  }
  scene.mode = 'world';
}
