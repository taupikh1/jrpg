import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/EventBus.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { QUEST_CH5_RESONANSI } from '../../../content/quests/arc_01/quest_ch5_main.js';

// Order in which chapter-5 flags are set during play (mirrors chapter_05 dialogue + scene).
const ORDER = ['ch5_fragment_investigated', 'ch5_echo_found', 'ch5_scholar_warned', 'ch5_memories_discussed', 'ch5_site_reached', 'ch5_first_resonance_done', 'ch5_aftermath_done', 'ch5_completed'];

describe('Arc I progression gate (D1, D5)', () => {
  it('resonansi pertama completes only on the final flag, in objective order', () => {
    const q = new QuestLog(new EventBus());
    q.register(QUEST_CH5_RESONANSI);
    q.accept(QUEST_CH5_RESONANSI.id);
    for (const flag of ORDER.slice(0, -1)) {
      q.notify('flag', flag, 1);
      assert.notEqual(q.getStatus(QUEST_CH5_RESONANSI.id), 'completed', `completed too early at ${flag}`);
    }
    q.notify('flag', 'ch5_completed', 1);
    assert.equal(q.getStatus(QUEST_CH5_RESONANSI.id), 'completed');
  });

  it('ch5_completed is set only by the Arc I finale node', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../../../content/dialogue/arc_01/chapter_05.js', import.meta.url), 'utf8');
    const hits = src.split('\n').filter((l) => l.includes("flag: 'ch5_completed'"));
    assert.equal(hits.length, 1);
  });
});
