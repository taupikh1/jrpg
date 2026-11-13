import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Tileset } from '../../../src/engine/world/tileset/Tileset.js';
import { Tilemap } from '../../../src/engine/world/tilemap/Tilemap.js';
import { DEMO_TILESET } from '../../../content/world/demo-data.js';
import { ZONE_BELLHAVEN_PLAZA } from '../../../content/world/bellhaven-data.js';

// NPC footprint as spawned by GameplayDemoScene._spawnNpc (center x/y, w 12, h 14).
const NPC_W = 12;
const NPC_H = 14;

function plazaMap() {
  const tileset = new Tileset(DEMO_TILESET);
  return new Tilemap(ZONE_BELLHAVEN_PLAZA.tilemap, tileset);
}

function footprintBlocked(map, centerX, centerY) {
  const x = centerX - NPC_W / 2;
  const y = centerY - NPC_H / 2;
  const x0 = Math.floor(x / 16);
  const y0 = Math.floor(y / 16);
  const x1 = Math.floor((x + NPC_W - 0.001) / 16);
  const y1 = Math.floor((y + NPC_H - 0.001) / 16);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (map.isSolid(tx, ty)) return { tx, ty };
    }
  }
  return null;
}

describe('Bellhaven plaza NPC placement', () => {
  const plaza = [
    ['npc_salla', 80, 100],
    ['npc_ruli', 128, 176],
    ['npc_venn', 280, 88],
    ['npc_timm', 188, 176],
  ];

  for (const [id, x, y] of plaza) {
    it(`${id} footprint at (${x},${y}) does not overlap solid tiles`, () => {
      const hit = footprintBlocked(plazaMap(), x, y);
      assert.equal(hit, null, `${id} overlaps solid tile ${hit && `${hit.tx},${hit.ty}`}`);
    });
  }

  it('npc_venn old center position (280,70) was inside the archive annex (regression guard)', () => {
    assert.notEqual(footprintBlocked(plazaMap(), 280, 70), null);
  });
});
