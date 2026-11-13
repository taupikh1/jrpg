// D1: Arc I order is First Resonance → aftermath → party banter → Unseen Observer → finale.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeScene, playToEnd } from './sceneHarness.js';

describe('Arc I order (D1)', () => {
  it('runs the full chain in the approved order via real dialogue completion', () => {
    const { scene, dialogue } = makeScene();
    playToEnd(scene, dialogue, 'ch5_first_resonance');
    while (scene._storyNext) {
      assert.equal(scene._advanceQueuedDialogue(), true);
      playToEnd(scene, dialogue, scene.started.at(-1));
    }
    assert.deepEqual(scene.started, [
      'ch5_first_resonance',
      'ch5_after_resonance',
      'ch5_banter_after_resonance',
      'ch5_unseen_observer',
      'ch5_arc1_finale',
    ]);
  });

  it('banter after resonance is not placed after the finale', () => {
    const { scene, dialogue } = makeScene();
    playToEnd(scene, dialogue, 'ch5_first_resonance');
    while (scene._storyNext) {
      scene._advanceQueuedDialogue();
      playToEnd(scene, dialogue, scene.started.at(-1));
    }
    const banter = scene.started.indexOf('ch5_banter_after_resonance');
    const finale = scene.started.indexOf('ch5_arc1_finale');
    const observer = scene.started.indexOf('ch5_unseen_observer');
    assert.ok(banter >= 0 && banter < observer && observer < finale);
  });

  it('replaying the aftermath (activation stone) does not restart the chain', () => {
    const { scene, dialogue } = makeScene();
    playToEnd(scene, dialogue, 'ch5_first_resonance');
    while (scene._storyNext) {
      scene._advanceQueuedDialogue();
      playToEnd(scene, dialogue, scene.started.at(-1));
    }
    const before = scene.started.length;
    playToEnd(scene, dialogue, 'ch5_after_resonance');
    assert.equal(scene._storyNext, null);
    assert.equal(scene.started.length, before + 1, 'only the replayed dialogue starts');
  });

  it('the Arc I banter is not also in the party queue (no duplicate playback)', () => {
    const { scene } = makeScene();
    scene._onDialogueCompleted({ id: 'ch5_first_resonance' });
    assert.deepEqual(scene._partyQueue, []);
  });
});
