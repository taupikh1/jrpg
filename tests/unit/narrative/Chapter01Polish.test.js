import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EventBus } from '../../../src/core/EventBus.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { ItemRegistry } from '../../../src/engine/gameplay/items/ItemRegistry.js';
import { Inventory } from '../../../src/engine/gameplay/inventory/Inventory.js';
import {
  QUEST_PAGAR_UTARA,
  DIALOGUE_QUEST_PAGAR_ACCEPT,
  DIALOGUE_QUEST_PAGAR_PROGRESS,
  DIALOGUE_QUEST_PAGAR_COMPLETE,
} from '../../../content/quests/arc_01/quest_pagar_utara.js';
import { CHAPTER_01_PARTY_DIALOGUES } from '../../../content/dialogue/party/ch1_party.js';
import { ITEMS } from '../../../content/gameplay/demo-content.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const sceneSrc = readFileSync(join(root, 'src/scenes/GameplayDemoScene.js'), 'utf8');

describe('Party queue wiring in scene source', () => {
  it('uses party queue helpers', () => {
    assert.match(sceneSrc, /_partyQueue/);
    assert.match(sceneSrc, /_enqueueParty/);
    assert.match(sceneSrc, /_enqueuePartyFollowup/);
    assert.match(sceneSrc, /dialogue\.completed/);
  });
  it('pointer click handled in world and dialogue', () => {
    assert.match(sceneSrc, /ptrClick/);
    assert.match(sceneSrc, /primaryPointer/);
  });
  it('jarek interaction guards dialogue lock', () => {
    assert.match(sceneSrc, /_dialogueLock/);
    assert.match(sceneSrc, /quest_pagar_utara_accept/);
  });
});

describe('Jarek quest dialogue order', () => {
  it('accept choice registers quest once; progress when active without wood', () => {
    const events = new EventBus();
    const quests = new QuestLog(events);
    quests.register(QUEST_PAGAR_UTARA);
    const eng = new DialogueEngine(events);
    eng.register(DIALOGUE_QUEST_PAGAR_ACCEPT);
    eng.register(DIALOGUE_QUEST_PAGAR_PROGRESS);
    eng.register(DIALOGUE_QUEST_PAGAR_COMPLETE);

    let accepts = 0;
    events.on('quest.accepted', () => {
      accepts += 1;
    });

    eng.start('quest_pagar_utara_accept');
    assert.equal(eng.currentNode().speaker, 'Jarek');
    assert.ok(eng.currentNode().choices?.length >= 2);
    // accept branch — mirror scene handler applying effects
    const choiceResult = eng.choose(0);
    if (choiceResult.effects?.acceptQuest) {
      const r = quests.accept(choiceResult.effects.acceptQuest);
      assert.equal(r.ok, true);
    }
    assert.equal(quests.getStatus('quest_pagar_utara'), 'active');
    assert.equal(accepts, 1);
    // drain
    while (eng.isActive) {
      const n = eng.currentNode();
      if (n.choices?.length) eng.choose(0);
      else eng.advance();
    }
    // second accept should fail
    assert.equal(quests.accept('quest_pagar_utara').ok, false);

    eng.start('quest_pagar_utara_progress');
    assert.match(eng.currentNode().text, /Masih kurang|tiga/i);
  });

  it('refuse branch does not accept', () => {
    const events = new EventBus();
    const quests = new QuestLog(events);
    quests.register(QUEST_PAGAR_UTARA);
    const eng = new DialogueEngine(events);
    eng.register(DIALOGUE_QUEST_PAGAR_ACCEPT);
    eng.start('quest_pagar_utara_accept');
    eng.choose(1); // decline
    assert.equal(quests.getStatus('quest_pagar_utara'), 'available');
  });
});

describe('Party dialogues still load', () => {
  it('three party ids walk', () => {
    const eng = new DialogueEngine();
    for (const d of CHAPTER_01_PARTY_DIALOGUES) eng.register(d);
    assert.equal(CHAPTER_01_PARTY_DIALOGUES.length, 3);
    for (const d of CHAPTER_01_PARTY_DIALOGUES) {
      eng.start(d.id);
      assert.ok(eng.isActive);
      while (eng.isActive) {
        const n = eng.currentNode();
        if (n.choices?.length) eng.choose(0);
        else eng.advance();
      }
    }
  });
});
