import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER_04_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_04.js';
import { CHAPTER_04_PARTY } from '../../../content/dialogue/party/ch4_party.js';
import { CHAPTER_04_QUESTS, QUEST_CH4_ARSIP } from '../../../content/quests/arc_01/quest_ch4_main.js';
import { ARCHIVE_ZONES } from '../../../content/world/archive-data.js';
import { ZoneManager } from '../../../src/engine/world/zones/ZoneManager.js';
import { DEMO_TILESET } from '../../../content/world/demo-data.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';

describe('Chapter 4 content', () => {
  it('archive zones load and interconnect', () => {
    const zm = new ZoneManager();
    zm.registerTileset(DEMO_TILESET);
    for (const z of ARCHIVE_ZONES) zm.registerZone(z);
    assert.equal(ARCHIVE_ZONES.length, 3);
    const h = zm.activate('bellhaven_archive_hall', 'from_plaza');
    assert.equal(h.id, 'bellhaven_archive_hall');
    const tr = zm.tryTransitionAt(176, 8);
    assert.ok(tr);
    assert.equal(tr.zone.id, 'bellhaven_archive_stacks');
  });

  it('dialogues non-empty Indonesian and unique ids', () => {
    const ids = new Set();
    let lines = 0;
    for (const d of CHAPTER_04_DIALOGUES) {
      assert.equal(ids.has(d.id), false, d.id);
      ids.add(d.id);
      for (const n of Object.values(d.nodes)) {
        if (n.text?.trim()) lines++;
      }
    }
    assert.ok(ids.has('ch4_archive_first_entry'));
    assert.ok(ids.has('ch4_maera_finale'));
    assert.ok(lines >= 80);
  });

  it('party banter five scenes', () => {
    assert.equal(CHAPTER_04_PARTY.length, 5);
  });

  it('main quest completes with all flags', () => {
    const q = new QuestLog(new EventBus());
    for (const def of CHAPTER_04_QUESTS) q.register(def);
    q.accept(QUEST_CH4_ARSIP.id);
    for (const o of QUEST_CH4_ARSIP.objectives) {
      q.notify('flag', o.targetId, 1);
    }
    assert.equal(q.getStatus(QUEST_CH4_ARSIP.id), 'completed');
  });

  it('finale choice sets ch4_completed', () => {
    const fin = CHAPTER_04_DIALOGUES.find((d) => d.id === 'ch4_maera_finale');
    const last = Object.values(fin.nodes).find((n) => n.choices);
    assert.equal(last.choices[0].effects.flag, 'ch4_completed');
  });
});
