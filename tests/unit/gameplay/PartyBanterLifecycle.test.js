// Bug A regression: banter must be marked seen only after its dialogue actually starts.
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { makeScene, playToEnd } from './sceneHarness.js';

const A = 'ch5_banter_puzzle';
const B = 'ch5_banter_fragment';
const C = 'ch5_banter_memories';

describe('party banter lifecycle (Bug A)', () => {
  it('enqueue then dequeue does not mark banter as seen', () => {
    const { scene } = makeScene();
    scene._enqueueParty(A);
    assert.deepEqual(scene._partyQueue, [A]);
    scene._maybePartyFollowup();
    assert.equal(scene._queuedDialogue, A);
    assert.equal(scene._partySeen[A], undefined);
  });

  it('failed dialogue startup keeps the banter eligible for retry', () => {
    const { scene, dialogue } = makeScene();
    mock.method(console, 'error', () => {});
    const real = dialogue.start;
    let fail = true;
    dialogue.start = (id) => {
      if (fail) { fail = false; throw new Error('boom'); }
      return real(id);
    };
    scene._enqueueParty(A);
    scene._maybePartyFollowup();
    scene._advanceQueuedDialogue();
    assert.equal(scene._partySeen[A], undefined, 'not seen after failed start');
    assert.equal(scene._queuedDialogue, A, 're-queued for retry');
    assert.equal(dialogue.isActive, false);
  });

  it('retried banter starts successfully and is then marked seen', () => {
    const { scene, dialogue } = makeScene();
    mock.method(console, 'error', () => {});
    const real = dialogue.start;
    let fail = true;
    dialogue.start = (id) => {
      if (fail) { fail = false; throw new Error('boom'); }
      return real(id);
    };
    scene._enqueueParty(A);
    scene._maybePartyFollowup();
    scene._advanceQueuedDialogue(); // fails, re-queued
    scene._advanceQueuedDialogue(); // retry succeeds
    assert.equal(dialogue.isActive, true);
    assert.equal(scene._partySeen[A], true);
    assert.equal(scene._queuedDialogue, null);
  });

  it('completed banter is not replayed', () => {
    const { scene, dialogue } = makeScene();
    scene._enqueueParty(A);
    scene._maybePartyFollowup();
    scene._advanceQueuedDialogue();
    playToEnd(scene, dialogue, A);
    scene._enqueueParty(A);
    assert.deepEqual(scene._partyQueue, []);
    scene._maybePartyFollowup();
    assert.equal(scene._queuedDialogue, null);
  });

  it('duplicate enqueues do not create duplicate playback', () => {
    const { scene } = makeScene();
    scene._enqueueParty(A);
    scene._enqueueParty(A);
    assert.deepEqual(scene._partyQueue, [A]);
    scene._maybePartyFollowup();
    scene._enqueueParty(A); // pending in _queuedDialogue
    assert.deepEqual(scene._partyQueue, []);
    assert.equal(scene._queuedDialogue, A);
  });

  it('multiple queued banters play in enqueue order', () => {
    const { scene, dialogue } = makeScene();
    scene._enqueueParty(A);
    scene._enqueueParty(B);
    scene._enqueueParty(C);
    for (let i = 0; i < 3; i++) {
      scene._maybePartyFollowup();
      assert.equal(scene._advanceQueuedDialogue(), true);
      playToEnd(scene, dialogue, scene.started.at(-1));
    }
    assert.deepEqual(scene.started, [A, B, C]);
    assert.ok(scene._partySeen[A] && scene._partySeen[B] && scene._partySeen[C]);
  });

  it('an active dialogue does not let the queue consume unrelated banter', () => {
    const { scene, dialogue } = makeScene();
    dialogue.start(A); // some other dialogue is on screen
    scene.mode = 'dialogue';
    scene._enqueueParty(B);
    scene._maybePartyFollowup();
    assert.equal(scene._queuedDialogue, null);
    assert.deepEqual(scene._partyQueue, [B]);
    assert.equal(scene._partySeen[B], undefined);
  });

  it('a banter that keeps failing is dropped after the attempt limit but stays eligible later', () => {
    const { scene, dialogue } = makeScene();
    mock.method(console, 'error', () => {});
    dialogue.start = () => { throw new Error('missing content'); };
    scene._enqueueParty(A);
    scene._maybePartyFollowup();
    for (let i = 0; i < 3; i++) scene._advanceQueuedDialogue();
    assert.equal(scene._queuedDialogue, null, 'dropped from queue');
    assert.equal(scene._partySeen[A], undefined, 'not marked seen');
    scene._enqueueParty(A);
    assert.deepEqual(scene._partyQueue, [A], 'eligible again on a later enqueue');
  });
});
