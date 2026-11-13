import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FieldEncounters } from '../../../src/engine/world/FieldEncounters.js';

describe('FF5 FieldEncounters', () => {
  it('does not trigger before minSteps', () => {
    const fe = new FieldEncounters({ rng: () => 0, minSteps: 5, rate: 1 });
    assert.equal(fe.onMove('forest', 1), false);
    assert.equal(fe.onMove('forest', 1), false);
    assert.equal(fe.onMove('forest', 1), false);
    assert.equal(fe.onMove('forest', 1), false);
  });

  it('can trigger after minSteps with high rate', () => {
    const fe = new FieldEncounters({ rng: () => 0, minSteps: 3, rate: 1 });
    fe.onMove('forest', 1);
    fe.onMove('forest', 1);
    assert.equal(fe.onMove('forest', 1), true);
  });

  it('ignores non-enabled zones', () => {
    const fe = new FieldEncounters({ rng: () => 0, rate: 1, minSteps: 1 });
    assert.equal(fe.onMove('village', 10), false);
  });
});
