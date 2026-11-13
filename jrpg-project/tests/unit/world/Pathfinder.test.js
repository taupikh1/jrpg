import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NavGrid } from '../../../src/engine/world/navigation/NavGrid.js';
import { findPath } from '../../../src/engine/world/navigation/Pathfinder.js';

describe('NavGrid + A*', () => {
  // 5x5 open grid
  function openGrid() {
    return new NavGrid(5, 5, () => 1);
  }

  // wall down the middle
  function wallGrid() {
    return new NavGrid(5, 5, (x, y) => (x === 2 && y > 0 && y < 4 ? Infinity : 1));
  }

  it('walkable checks', () => {
    const g = wallGrid();
    assert.equal(g.isWalkable(0, 0), true);
    assert.equal(g.isWalkable(2, 2), false);
  });

  it('finds path on open grid', () => {
    const path = findPath(openGrid(), 0, 0, 4, 4);
    assert.ok(path);
    assert.equal(path[0].x, 0);
    assert.equal(path[0].y, 0);
    assert.equal(path[path.length - 1].x, 4);
    assert.equal(path[path.length - 1].y, 4);
  });

  it('finds path around wall', () => {
    const path = findPath(wallGrid(), 0, 2, 4, 2);
    assert.ok(path);
    assert.ok(path.every((p) => !(p.x === 2 && p.y > 0 && p.y < 4)));
  });

  it('returns null when blocked', () => {
    const g = new NavGrid(3, 3, (x, y) => (x === 1 ? Infinity : 1));
    // fully separated columns
    const path = findPath(g, 0, 1, 2, 1);
    assert.equal(path, null);
  });

  it('returns null for unwalkable start/goal', () => {
    const g = wallGrid();
    assert.equal(findPath(g, 2, 2, 0, 0), null);
    assert.equal(findPath(g, 0, 0, 2, 2), null);
  });

  it('same cell path', () => {
    const path = findPath(openGrid(), 1, 1, 1, 1);
    assert.deepEqual(path, [{ x: 1, y: 1 }]);
  });
});
