import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';

describe('GameplayDemoScene startup modes', () => {
  it('New Game starts the Chapter 1 opening dialogue', () => {
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    scene.init({ events: new EventBus(), startMode: 'new' });
    assert.equal(scene.mode, 'dialogue');
    assert.equal(scene._pendingContinue, false);
  });

  it('Continue skips the opening and schedules a save load instead', () => {
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    scene.init({ events: new EventBus(), startMode: 'continue' });
    assert.notEqual(scene.mode, 'dialogue');
    assert.equal(scene._pendingContinue, true);
    assert.equal(scene._openingDone, true);
  });

  it('debug HUD is off by default so players never see demo labels', () => {
    const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
    assert.equal(scene._debugHud, false);
    const debug = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter(), debugHud: true });
    assert.equal(debug._debugHud, true);
  });
});
