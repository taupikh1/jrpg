import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { makeScene, playToEnd } from './sceneHarness.js';

const ID = 'ch1_party_orin_mira_travel';

describe('Chapter 1 travel banter lifecycle', () => {
  it('uses the shared queue and marks the actual dialogue ID only after successful start', () => {
    const { scene, dialogue } = makeScene();
    scene._ch1Flags.ch1_mira_follow = true;
    assert.equal(scene._partySeen[ID], undefined);
    assert.equal(scene._maybeCh1TravelBanter(), true);
    assert.equal(scene.started.at(-1), ID);
    assert.equal(scene._partySeen[ID], true);
    assert.equal(scene._partySeen.travel, undefined);
    playToEnd(scene, dialogue, ID);
    assert.equal(scene._maybeCh1TravelBanter(), false);
    assert.equal(scene.started.filter((id) => id === ID).length, 1);
  });

  it('does not mark travel banter seen when dialogue startup fails', () => {
    const { scene, dialogue } = makeScene();
    scene._ch1Flags.ch1_mira_follow = true;
    const start = dialogue.start.bind(dialogue);
    let fail = true;
    dialogue.start = (id) => {
      if (fail && id === ID) throw new Error('temporary startup failure');
      return start(id);
    };
    mock.method(console, 'error', () => {});
    assert.equal(scene._maybeCh1TravelBanter(), true);
    assert.equal(scene._partySeen[ID], undefined);
    assert.equal(scene._queuedDialogue, ID);
    fail = false;
    assert.equal(scene._maybeCh1TravelBanter(), true);
    assert.equal(scene._partySeen[ID], true);
    assert.equal(scene.started.at(-1), ID);
  });
});
