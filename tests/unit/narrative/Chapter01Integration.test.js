import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/EventBus.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { ItemRegistry } from '../../../src/engine/gameplay/items/ItemRegistry.js';
import { Inventory } from '../../../src/engine/gameplay/inventory/Inventory.js';
import { CHAPTER_01_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_01.js';
import { DIALOGUE_CH1_CRAFT_JAREK } from '../../../content/dialogue/npcs/ashwillow_npcs.js';
import { CHAPTER_01_PARTY_DIALOGUES } from '../../../content/dialogue/party/ch1_party.js';
import {
  QUEST_PAGAR_UTARA,
  DIALOGUE_QUEST_PAGAR_ACCEPT,
  DIALOGUE_QUEST_PAGAR_COMPLETE,
} from '../../../content/quests/arc_01/quest_pagar_utara.js';
import { ITEMS } from '../../../content/gameplay/demo-content.js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('Chapter 1 integration wiring', () => {
  it('GameplayDemoScene source registers chapter 1 dialogue ids', () => {
    const src = readFileSync(join(root, 'src/scenes/GameplayDemoScene.js'), 'utf8');
    assert.match(src, /CHAPTER_01_DIALOGUES/);
    assert.match(src, /ch1_elder_henn/);
    assert.match(src, /quest_pagar_utara/);
    assert.match(src, /_spawnVillageNpcs/);
    assert.match(src, /npc_henn/);
    assert.match(src, /npc_jarek/);
  });

  it('full dialogue pack loads and opening runs', () => {
    const eng = new DialogueEngine();
    for (const d of CHAPTER_01_DIALOGUES) eng.register(d);
    eng.register(DIALOGUE_CH1_CRAFT_JAREK);
    for (const d of CHAPTER_01_PARTY_DIALOGUES) eng.register(d);
    eng.register(DIALOGUE_QUEST_PAGAR_ACCEPT);
    eng.register(DIALOGUE_QUEST_PAGAR_COMPLETE);
    const node = eng.start('ch1_opening');
    assert.ok(node);
    assert.ok(eng.isActive);
    // advance to end
    let guard = 20;
    while (eng.isActive && guard-- > 0) {
      const n = eng.currentNode();
      if (n?.choices?.length) eng.choose(0);
      else eng.advance();
    }
    assert.equal(eng.isActive, false);
  });

  it('six NPC dialogue ids start', () => {
    const eng = new DialogueEngine();
    for (const d of CHAPTER_01_DIALOGUES) eng.register(d);
    eng.register(DIALOGUE_CH1_CRAFT_JAREK);
    const ids = [
      'ch1_elder_henn',
      'ch1_guard_renda',
      'ch1_merchant_soli',
      'ch1_villager_nima',
      'ch1_child_tori',
      'ch1_craft_jarek',
    ];
    for (const id of ids) {
      eng.start(id);
      assert.equal(eng.active.id, id);
      eng.end();
    }
  });

  it('quest_pagar_utara accept → collect → talk complete once', () => {
    const events = new EventBus();
    const log = new QuestLog(events);
    log.register(QUEST_PAGAR_UTARA);
    const registry = new ItemRegistry();
    for (const it of ITEMS) registry.register(it);
    const inv = new Inventory({ registry, capacity: 20, events });
    events.on('inventory.item_added', (p) => {
      if (p?.itemId) log.notify('collect', p.itemId, p.qty || 1);
    });
    let completed = 0;
    events.on('quest.completed', () => {
      completed += 1;
    });

    assert.equal(log.accept('quest_pagar_utara').ok, true);
    assert.equal(log.accept('quest_pagar_utara').ok, false); // no duplicate

    inv.add('wood_scrap', 3);
    assert.equal(log.getStatus('quest_pagar_utara'), 'active');
    log.notify('talk', 'character_jarek', 1);
    assert.equal(log.getStatus('quest_pagar_utara'), 'completed');
    assert.equal(completed, 1);

    // second complete path should not re-fire if already completed
    log.notify('talk', 'character_jarek', 1);
    assert.equal(completed, 1);
  });

  it('party dialogue ids resolve', () => {
    const eng = new DialogueEngine();
    for (const d of CHAPTER_01_PARTY_DIALOGUES) eng.register(d);
    for (const d of CHAPTER_01_PARTY_DIALOGUES) {
      eng.start(d.id);
      assert.ok(eng.isActive);
      eng.end();
    }
  });
});
