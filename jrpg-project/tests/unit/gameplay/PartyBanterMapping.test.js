import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PARTY_AFTER_DIALOGUE } from '../../../src/scenes/GameplayDemoScene.js';
import { makeScene } from './sceneHarness.js';
import { CHAPTER_02_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_02.js';
import { CHAPTER_03_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_03.js';
import { CHAPTER_04_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_04.js';
import { CHAPTER_05_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_05.js';
import { CHAPTER_02_PARTY } from '../../../content/dialogue/party/ch2_party.js';
import { CHAPTER_03_PARTY } from '../../../content/dialogue/party/ch3_party.js';
import { CHAPTER_04_PARTY } from '../../../content/dialogue/party/ch4_party.js';
import { CHAPTER_05_PARTY } from '../../../content/dialogue/party/ch5_party.js';

const triggers = new Set([
  ...CHAPTER_02_DIALOGUES,
  ...CHAPTER_03_DIALOGUES,
  ...CHAPTER_04_DIALOGUES,
  ...CHAPTER_05_DIALOGUES,
].map((d) => d.id));
const partyIds = new Set([
  ...CHAPTER_02_PARTY,
  ...CHAPTER_03_PARTY,
  ...CHAPTER_04_PARTY,
  ...CHAPTER_05_PARTY,
].map((d) => d.id));

describe('chapter party banter mappings', () => {
  it('all 19 trigger and banter IDs resolve to real dialogue definitions', () => {
    assert.equal(Object.keys(PARTY_AFTER_DIALOGUE).length, 19);
    for (const [trigger, banter] of Object.entries(PARTY_AFTER_DIALOGUE)) {
      assert.ok(triggers.has(trigger), `missing trigger dialogue: ${trigger}`);
      assert.ok(partyIds.has(banter), `missing party dialogue: ${banter}`);
    }
  });

  it('each mapped banter queues, starts, and marks seen after its trigger completes', () => {
    for (const [trigger, banter] of Object.entries(PARTY_AFTER_DIALOGUE)) {
      const { scene, dialogue } = makeScene();
      scene._onDialogueCompleted({ id: trigger });
      assert.equal(scene._queuedDialogue, banter, `${trigger} should queue ${banter} as the next dialogue`);
      assert.equal(scene._partySeen[banter], undefined, 'queueing alone must not mark seen');
      assert.equal(scene._advanceQueuedDialogue(), true, `${banter} should start`);
      assert.equal(dialogue.active?.id, banter, `${trigger} should play ${banter}`);
      assert.equal(scene._partySeen[banter], true, 'successful start marks seen');
    }
  });
});
