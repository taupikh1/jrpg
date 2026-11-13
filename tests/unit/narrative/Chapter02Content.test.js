import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER_02_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_02.js';
import { CHAPTER_02_PARTY } from '../../../content/dialogue/party/ch2_party.js';
import { QUEST_CH2_SUARA, CHAPTER_02_QUESTS } from '../../../content/quests/arc_01/quest_ch2_main.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';

describe('Chapter 2 content', () => {
  it('scenes non-empty and unique', () => {
    const ids = new Set();
    let lines = 0;
    for (const d of CHAPTER_02_DIALOGUES) {
      assert.equal(ids.has(d.id), false, d.id);
      ids.add(d.id);
      for (const n of Object.values(d.nodes)) if (n.text?.trim()) lines++;
    }
    assert.ok(ids.has('ch2_forest_entry'));
    assert.ok(ids.has('ch2_mira_personal_scene'));
    assert.ok(ids.has('ch2_finale'));
    assert.ok(lines >= 70);
  });

  it('party five scenes', () => {
    assert.equal(CHAPTER_02_PARTY.length, 5);
  });

  it('main quest completes with all flags', () => {
    const q = new QuestLog(new EventBus());
    for (const def of CHAPTER_02_QUESTS) q.register(def);
    q.accept(QUEST_CH2_SUARA.id);
    for (const o of QUEST_CH2_SUARA.objectives) q.notify('flag', o.targetId, 1);
    assert.equal(q.getStatus(QUEST_CH2_SUARA.id), 'completed');
  });

  it('mira commitment and finale choice', () => {
    const mira = CHAPTER_02_DIALOGUES.find((d) => d.id === 'ch2_mira_personal_scene');
    assert.ok(Object.values(mira.nodes).some((n) => n.effects?.flag === 'ch2_mira_committed'));
    const fin = CHAPTER_02_DIALOGUES.find((d) => d.id === 'ch2_finale');
    const c = Object.values(fin.nodes).find((n) => n.choices);
    assert.equal(c.choices[0].effects.flag, 'ch2_completed');
  });
});
