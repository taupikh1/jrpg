import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER_05_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_05.js';
import { CHAPTER_05_PARTY } from '../../../content/dialogue/party/ch5_party.js';
import { QUEST_CH5_RESONANSI, CHAPTER_05_QUESTS } from '../../../content/quests/arc_01/quest_ch5_main.js';
import { RESONANCE_ZONES } from '../../../content/world/resonance-site-data.js';
import { ZoneManager } from '../../../src/engine/world/zones/ZoneManager.js';
import { DEMO_TILESET } from '../../../content/world/demo-data.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';

describe('Chapter 5 content', () => {
  it('dialogue non-empty unique', () => {
    const ids = new Set();
    let lines = 0;
    for (const d of CHAPTER_05_DIALOGUES) {
      assert.equal(ids.has(d.id), false, d.id);
      ids.add(d.id);
      for (const n of Object.values(d.nodes)) if (n.text?.trim()) lines++;
    }
    assert.ok(ids.has('ch5_fragment_awakens'));
    assert.ok(ids.has('ch5_first_resonance'));
    assert.ok(ids.has('ch5_arc1_finale'));
    assert.ok(lines >= 60);
  });

  it('party five', () => assert.equal(CHAPTER_05_PARTY.length, 5));

  it('resonance zone loads', () => {
    const zm = new ZoneManager();
    zm.registerTileset(DEMO_TILESET);
    for (const z of RESONANCE_ZONES) zm.registerZone(z);
    const a = zm.activate('resonance_ancient_site', 'from_road');
    assert.equal(a.id, 'resonance_ancient_site');
  });

  it('main quest completes with flags', () => {
    const q = new QuestLog(new EventBus());
    for (const def of CHAPTER_05_QUESTS) q.register(def);
    q.accept(QUEST_CH5_RESONANSI.id);
    for (const o of QUEST_CH5_RESONANSI.objectives) q.notify('flag', o.targetId, 1);
    assert.equal(q.getStatus(QUEST_CH5_RESONANSI.id), 'completed');
  });

  it('finale sets ch5_completed via choice', () => {
    const fin = CHAPTER_05_DIALOGUES.find((d) => d.id === 'ch5_arc1_finale');
    const c = Object.values(fin.nodes).find((n) => n.choices);
    assert.equal(c.choices[0].effects.flag, 'ch5_completed');
    assert.equal(c.choices[0].effects.chapterHook, 'chapter_06');
  });
});
