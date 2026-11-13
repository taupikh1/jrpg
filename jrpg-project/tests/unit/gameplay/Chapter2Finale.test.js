import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeScene } from './sceneHarness.js';

describe('Bab 2 selesai lewat jalur utara', () => {
  it('jalur utara menyambung ke adegan penutup ch2_finale', () => {
    const { scene } = makeScene();
    scene._onDialogueCompleted({ id: 'ch2_northern_path' });
    assert.equal(scene._storyNext, 'ch2_finale');
  });
});

describe('Bab 2 chain from memory trace to Mira', () => {
  it('batu ukiran kedua memicu peristiwa Resonance', () => {
    const { scene } = makeScene();
    scene._onDialogueCompleted({ id: 'ch2_memory_trace' });
    assert.equal(scene._storyNext, 'ch2_resonance_event');
  });
});
