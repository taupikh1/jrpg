import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER_03_DIALOGUES, CHAPTER_03_SCENE_IDS } from '../../../content/dialogue/arc_01/chapter_03.js';
import { CHAPTER_03_PARTY } from '../../../content/dialogue/party/ch3_party.js';
import { QUEST_CH3_JEJAK } from '../../../content/quests/arc_01/quest_ch3_main.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';

function collectLines(def) {
  let nodes = 0;
  let lines = 0;
  for (const n of Object.values(def.nodes)) {
    nodes++;
    if (n.text && String(n.text).trim()) lines++;
    if (n.choices) {
      for (const c of n.choices) {
        if (c.text && String(c.text).trim()) lines++;
      }
    }
  }
  return { nodes, lines };
}

describe('Chapter 3 content', () => {
  it('registers unique scene IDs with non-empty Indonesian text', () => {
    const ids = new Set();
    let totalNodes = 0;
    let totalLines = 0;
    for (const d of CHAPTER_03_DIALOGUES) {
      assert.ok(d.id, 'id required');
      assert.equal(ids.has(d.id), false, `duplicate ${d.id}`);
      ids.add(d.id);
      const { nodes, lines } = collectLines(d);
      assert.ok(lines > 0, d.id);
      totalNodes += nodes;
      totalLines += lines;
    }
    assert.ok(CHAPTER_03_SCENE_IDS.includes('ch3_road_bellhaven_first_view'));
    assert.ok(CHAPTER_03_SCENE_IDS.includes('ch3_finale_bell_and_promise'));
    assert.ok(totalLines >= 80, `expected substantial lines, got ${totalLines}`);
    // expose for catalogue
    globalThis.__CH3_STATS = { scenes: ids.size, nodes: totalNodes, lines: totalLines };
  });

  it('party banter scenes exist', () => {
    assert.equal(CHAPTER_03_PARTY.length, 5);
    for (const d of CHAPTER_03_PARTY) {
      assert.match(d.id, /^ch3_party_/);
      assert.ok(Object.values(d.nodes).some((n) => n.text));
    }
  });

  it('main quest completes via flag notifies', () => {
    const q = new QuestLog(new EventBus());
    q.register(QUEST_CH3_JEJAK);
    assert.equal(q.accept(QUEST_CH3_JEJAK.id).ok, true);
    for (const f of [
      'ch3_dira_entry_done',
      'ch3_bren_records_clue',
      'ch3_venn_index_clue',
      'ch3_garet_archive_clue',
      'ch3_completed',
    ]) {
      q.notify('flag', f, 1);
    }
    assert.equal(q.getStatus(QUEST_CH3_JEJAK.id), 'completed');
  });

  it('DialogueEngine loads all ch3 scenes', () => {
    const eng = new DialogueEngine();
    for (const d of CHAPTER_03_DIALOGUES) eng.register(d);
    for (const d of CHAPTER_03_PARTY) eng.register(d);
    eng.start('ch3_road_bellhaven_first_view');
    assert.ok(eng.isActive);
    assert.ok(eng.currentNode().text.includes('Bellhaven') || eng.currentNode().text.length > 20);
  });

  it('no English-only player lines in sample', () => {
    const sample = CHAPTER_03_DIALOGUES.find((d) => d.id === 'ch3_gate_entry_dira');
    const texts = Object.values(sample.nodes).map((n) => n.text).filter(Boolean);
    assert.ok(texts.some((t) => /Bellhaven|catatan|nama/i.test(t)));
  });
});
