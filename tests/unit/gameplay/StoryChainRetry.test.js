import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { makeScene } from './sceneHarness.js';

const STORY_STEP = 'ch5_unseen_observer';

describe('critical story-chain retry safety', () => {
  it('does not drop a story step after three failed starts and retries after backoff', () => {
    const { scene, dialogue } = makeScene();
    mock.method(console, 'error', () => {});
    let shouldFail = true;
    const realStart = dialogue.start.bind(dialogue);
    dialogue.start = (id) => {
      if (shouldFail && id === STORY_STEP) throw new Error('temporary registration failure');
      return realStart(id);
    };

    scene._storyNext = STORY_STEP;
    for (let attempt = 0; attempt < 3; attempt++) {
      scene._storyRetryTimer = 0;
      assert.equal(scene._advanceQueuedDialogue(), true);
      assert.equal(scene._storyNext, STORY_STEP, 'critical step remains pending');
      assert.ok(scene._storyRetryTimer > 0, 'retry uses a backoff delay');
      assert.equal(dialogue.isActive, false);
    }

    assert.equal(scene._advanceQueuedDialogue(), false, 'does not retry every frame');
    shouldFail = false;
    scene._storyRetryTimer = 0;
    assert.equal(scene._advanceQueuedDialogue(), true);
    assert.equal(dialogue.isActive, true);
    assert.equal(dialogue.active.id, STORY_STEP);
    assert.equal(scene._storyNext, null);
  });
});
