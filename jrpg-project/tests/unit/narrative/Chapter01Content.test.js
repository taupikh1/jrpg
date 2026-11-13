import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTER_01_DIALOGUES,
  DIALOGUE_CH1_ELDER_HENN,
  DIALOGUE_CH1_OPENING,
} from '../../../content/dialogue/arc_01/chapter_01.js';
import { NPC_ASHWILLOW, DIALOGUE_CH1_CRAFT_JAREK } from '../../../content/dialogue/npcs/ashwillow_npcs.js';
import { CHAPTER_01_PARTY_DIALOGUES } from '../../../content/dialogue/party/ch1_party.js';
import {
  QUEST_PAGAR_UTARA,
  DIALOGUE_QUEST_PAGAR_ACCEPT,
  DIALOGUE_QUEST_PAGAR_COMPLETE,
} from '../../../content/quests/arc_01/quest_pagar_utara.js';
import { DIALOGUE_GUARD, QUEST_COLLECT_WOOD, ITEMS } from '../../../content/gameplay/demo-content.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';

function countLines(def) {
  let lines = 0;
  for (const node of Object.values(def.nodes)) {
    if (node.text) lines += 1;
    if (node.choices) lines += node.choices.length;
  }
  return lines;
}

function assertGraph(def) {
  assert.ok(def.id && def.startNode && def.nodes[def.startNode], def.id);
  for (const [nid, node] of Object.entries(def.nodes)) {
    if (node.next) assert.ok(def.nodes[node.next], `${def.id} missing next ${node.next} from ${nid}`);
    if (node.choices) {
      for (const c of node.choices) {
        assert.ok(def.nodes[c.next], `${def.id} bad choice next ${c.next}`);
        assert.ok(c.text && c.text.length > 0, 'empty choice');
      }
    }
  }
}

describe('Chapter 1 production dialogues', () => {
  it('has at least 10 scene definitions', () => {
    assert.ok(CHAPTER_01_DIALOGUES.length >= 10);
  });

  it('all graphs resolve', () => {
    for (const d of CHAPTER_01_DIALOGUES) assertGraph(d);
    assertGraph(DIALOGUE_CH1_CRAFT_JAREK);
    for (const d of CHAPTER_01_PARTY_DIALOGUES) assertGraph(d);
  });

  it('unique dialogue ids', () => {
    const ids = [
      ...CHAPTER_01_DIALOGUES.map((d) => d.id),
      DIALOGUE_CH1_CRAFT_JAREK.id,
      ...CHAPTER_01_PARTY_DIALOGUES.map((d) => d.id),
      DIALOGUE_QUEST_PAGAR_ACCEPT.id,
      DIALOGUE_QUEST_PAGAR_COMPLETE.id,
    ];
    assert.equal(ids.length, new Set(ids).size);
  });

  it('Indonesian player text present (sample)', () => {
    const sample = DIALOGUE_CH1_ELDER_HENN.nodes.greet.text;
    assert.match(sample, /himne|desa|hilang/i);
    assert.ok(!/The sky was kinder/.test(sample));
  });

  it('registers in DialogueEngine', () => {
    const eng = new DialogueEngine();
    for (const d of CHAPTER_01_DIALOGUES) eng.register(d);
    eng.start('ch1_elder_henn');
    assert.equal(eng.active?.id, 'ch1_elder_henn');
    assert.ok(eng.currentNode().text.length > 0);
  });

  it('counts nodes and lines', () => {
    let nodes = 0;
    let lines = 0;
    for (const d of CHAPTER_01_DIALOGUES) {
      nodes += Object.keys(d.nodes).length;
      lines += countLines(d);
    }
    assert.ok(nodes >= 40, `nodes=${nodes}`);
    assert.ok(lines >= 50, `lines=${lines}`);
  });
});

describe('Ashwillow NPCs', () => {
  it('has named NPCs with roles', () => {
    assert.ok(NPC_ASHWILLOW.length >= 6);
    const roles = new Set(NPC_ASHWILLOW.map((n) => n.role));
    assert.ok(roles.has('village_elder'));
    assert.ok(roles.has('guard'));
    assert.ok(roles.has('merchant'));
  });
});

describe('Side quest pagar utara', () => {
  it('quest registers and accepts via dialogue effect id', () => {
    const log = new QuestLog();
    log.register(QUEST_PAGAR_UTARA);
    assert.equal(log.accept('quest_pagar_utara').ok, true);
  });

  it('accept dialogue graphs and references quest id', () => {
    assertGraph(DIALOGUE_QUEST_PAGAR_ACCEPT);
    const choice = DIALOGUE_QUEST_PAGAR_ACCEPT.nodes.ask.choices.find((c) => c.effects?.acceptQuest);
    assert.equal(choice.effects.acceptQuest, 'quest_pagar_utara');
  });
});

describe('Demo localization Indonesian', () => {
  it('guard dialogue is Indonesian', () => {
    assert.match(DIALOGUE_GUARD.nodes.hello.text, /Pengembara|membantu|hutan/i);
    assert.ok(!/Traveler, the forest/.test(DIALOGUE_GUARD.nodes.hello.text));
  });

  it('items use Indonesian names', () => {
    assert.equal(ITEMS.find((i) => i.id === 'herb').name, 'Herb Hutan');
    assert.match(QUEST_COLLECT_WOOD.name, /Material|Hutan/i);
  });
});
