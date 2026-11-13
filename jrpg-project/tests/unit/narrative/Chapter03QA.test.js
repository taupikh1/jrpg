import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER_03_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_03.js';
import { QUEST_CH3_JEJAK } from '../../../content/quests/arc_01/quest_ch3_main.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';

describe('Chapter 3 QA gates', () => {
  it('finale applies ch3_completed via choice effects', () => {
    const fin = CHAPTER_03_DIALOGUES.find((d) => d.id === 'ch3_finale_bell_and_promise');
    const h = fin.nodes.h;
    assert.ok(h.choices?.length);
    assert.equal(h.choices[0].effects.flag, 'ch3_completed');
  });

  it('main quest does not complete without all five flags', () => {
    const q = new QuestLog(new EventBus());
    q.register(QUEST_CH3_JEJAK);
    q.accept(QUEST_CH3_JEJAK.id);
    q.notify('flag', 'ch3_dira_entry_done', 1);
    q.notify('flag', 'ch3_bren_records_clue', 1);
    assert.equal(q.getStatus(QUEST_CH3_JEJAK.id), 'active');
    q.notify('flag', 'ch3_venn_index_clue', 1);
    q.notify('flag', 'ch3_garet_archive_clue', 1);
    assert.equal(q.getStatus(QUEST_CH3_JEJAK.id), 'active');
    q.notify('flag', 'ch3_completed', 1);
    assert.equal(q.getStatus(QUEST_CH3_JEJAK.id), 'completed');
  });

  it('optional side quests are independent IDs', () => {
    assert.notEqual(QUEST_CH3_JEJAK.id, 'quest_bh_buku_tamu');
  });

  it('all ch3 scenes register without empty text', () => {
    const eng = new DialogueEngine();
    for (const d of CHAPTER_03_DIALOGUES) {
      eng.register(d);
      eng.start(d.id);
      const n = eng.currentNode();
      assert.ok(n, d.id);
      if (n.text !== undefined && n.text !== null) {
        assert.ok(String(n.text).trim().length > 0, d.id);
      }
      eng.end();
    }
  });
});
