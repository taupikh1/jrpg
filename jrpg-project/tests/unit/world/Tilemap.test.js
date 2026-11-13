import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Tileset } from '../../../src/engine/world/tileset/Tileset.js';
import { Tilemap } from '../../../src/engine/world/tilemap/Tilemap.js';

function makeTileset() {
  return new Tileset({
    id: 't',
    tileWidth: 16,
    tileHeight: 16,
    columns: 4,
    tileCount: 4,
    tiles: {
      0: { solid: false, cost: 1 },
      1: { solid: false, cost: 1 },
      2: { solid: true, cost: Infinity },
      3: { solid: false, cost: 3 },
    },
  });
}

describe('Tileset', () => {
  it('source rect', () => {
    const ts = makeTileset();
    assert.deepEqual(ts.getSourceRect(0), { sx: 0, sy: 0, sw: 16, sh: 16 });
    assert.deepEqual(ts.getSourceRect(3), { sx: 48, sy: 0, sw: 16, sh: 16 });
    assert.equal(ts.getSourceRect(99), null);
  });

  it('solid and cost', () => {
    const ts = makeTileset();
    assert.equal(ts.isSolid(2), true);
    assert.equal(ts.isSolid(0), false);
    assert.equal(ts.getCost(3), 3);
  });
});

describe('Tilemap', () => {
  it('builds layers and queries tiles', () => {
    const ts = makeTileset();
    const data = [1, 1, 3, 1, 1, 1, 1, 1, 1];
    const tm = new Tilemap(
      {
        id: 'm',
        width: 3,
        height: 3,
        tileWidth: 16,
        tileHeight: 16,
        tilesetId: 't',
        layers: [{ name: 'ground', data, collision: true }],
      },
      ts
    );
    assert.equal(tm.getTile('ground', 2, 0), 3);
    assert.equal(tm.isSolid(2, 0), true);
    assert.equal(tm.isSolid(0, 0), false);
    assert.equal(tm.getCost(2, 0), Infinity);
  });

  it('rejects bad layer length', () => {
    const ts = makeTileset();
    assert.throws(
      () =>
        new Tilemap(
          {
            id: 'm',
            width: 2,
            height: 2,
            tilesetId: 't',
            layers: [{ name: 'g', data: [1, 1] }],
          },
          ts
        ),
      /length/
    );
  });

  it('world/tile conversion', () => {
    const ts = makeTileset();
    const tm = new Tilemap(
      {
        id: 'm',
        width: 4,
        height: 4,
        tileWidth: 16,
        tileHeight: 16,
        tilesetId: 't',
        layers: [{ name: 'g', data: Array(16).fill(1), collision: true }],
      },
      ts
    );
    assert.deepEqual(tm.worldToTile(20, 35), { tx: 1, ty: 2 });
    assert.deepEqual(tm.tileToWorld(1, 2), { x: 16, y: 32 });
  });

  it('out of bounds is solid', () => {
    const ts = makeTileset();
    const tm = new Tilemap(
      {
        id: 'm',
        width: 2,
        height: 2,
        tilesetId: 't',
        layers: [{ name: 'g', data: [1, 1, 1, 1], collision: true }],
      },
      ts
    );
    assert.equal(tm.isSolid(-1, 0), true);
    assert.equal(tm.isSolid(0, 5), true);
  });
});
