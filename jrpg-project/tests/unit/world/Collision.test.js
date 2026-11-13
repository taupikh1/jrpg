import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { aabbOverlap, pointInRect, CollisionWorld } from '../../../src/engine/world/collision/Collision.js';
import { Tileset } from '../../../src/engine/world/tileset/Tileset.js';
import { Tilemap } from '../../../src/engine/world/tilemap/Tilemap.js';

describe('Collision primitives', () => {
  it('aabbOverlap', () => {
    assert.equal(aabbOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 }), true);
    assert.equal(aabbOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 20, w: 5, h: 5 }), false);
  });

  it('pointInRect', () => {
    assert.equal(pointInRect(5, 5, { x: 0, y: 0, w: 10, h: 10 }), true);
    assert.equal(pointInRect(15, 5, { x: 0, y: 0, w: 10, h: 10 }), false);
  });
});

describe('CollisionWorld', () => {
  function map() {
    const ts = new Tileset({
      id: 't',
      tileWidth: 16,
      tileHeight: 16,
      columns: 4,
      tileCount: 4,
      tiles: { 0: { solid: false }, 2: { solid: true } },
    });
    // 3x3: solid at center
    const data = [1, 1, 1, 1, 3, 1, 1, 1, 1];
    return new Tilemap(
      {
        id: 'm',
        width: 3,
        height: 3,
        tileWidth: 16,
        tileHeight: 16,
        tilesetId: 't',
        layers: [{ name: 'g', data, collision: true }],
      },
      ts
    );
  }

  it('tile solid query', () => {
    const cw = new CollisionWorld(map());
    assert.equal(cw.isWorldSolid(24, 24), true); // center tile
    assert.equal(cw.isWorldSolid(4, 4), false);
  });

  it('isOccupiable and wouldCollide', () => {
    const cw = new CollisionWorld(map());
    assert.equal(cw.isOccupiable({ x: 0, y: 0, w: 8, h: 8 }), true);
    assert.equal(cw.isOccupiable({ x: 20, y: 20, w: 8, h: 8 }), false);
    assert.equal(cw.wouldCollide(0, 0, 8, 8, 20, 20), true);
  });

  it('triggers', () => {
    const cw = new CollisionWorld();
    cw.addTrigger('exit', { x: 10, y: 10, w: 20, h: 20 }, 'zone_exit', { targetZoneId: 'b' });
    assert.equal(cw.triggersAt(15, 15).length, 1);
    assert.equal(cw.triggersAt(0, 0).length, 0);
    assert.equal(cw.triggersOverlapping({ x: 0, y: 0, w: 15, h: 15 }).length, 1);
  });

  it('static obstacles', () => {
    const cw = new CollisionWorld();
    cw.addObstacle({ x: 50, y: 50, w: 10, h: 10 });
    assert.equal(cw.isOccupiable({ x: 52, y: 52, w: 4, h: 4 }), false);
    assert.equal(cw.isOccupiable({ x: 0, y: 0, w: 4, h: 4 }), true);
  });
});
