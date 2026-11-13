import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Tileset } from '../../../src/engine/world/tileset/Tileset.js';
import { Tilemap } from '../../../src/engine/world/tilemap/Tilemap.js';
import { DEMO_TILESET, ZONE_VILLAGE, ZONE_FOREST } from '../../../content/world/demo-data.js';
import { ZONE_BELLHAVEN_PLAZA } from '../../../content/world/bellhaven-data.js';

// _spawnNpc receives center coordinates; footprint is centered at x/y (w 12, h 14).
const SETS = {
  village: [ZONE_VILLAGE, [['npc_guard', 120, 100], ['npc_henn', 80, 120], ['npc_renda', 140, 70], ['npc_soli', 200, 130], ['npc_nima', 90, 160], ['npc_tori', 116, 176], ['npc_jarek', 220, 100], ['npc_mira', 120, 128]]],
  forest: [ZONE_FOREST, [['npc_elara', 140, 100], ['npc_rhea', 220, 180]]],
  plaza: [ZONE_BELLHAVEN_PLAZA, [['npc_ruli', 128, 176], ['npc_venn', 280, 88], ['npc_timm', 188, 176], ['npc_salla', 80, 100]]],
};

describe('NPC spawn footprints are on walkable tiles', () => {
  for (const [zone, [zd, npcs]] of Object.entries(SETS)) {
    const map = new Tilemap(zd.tilemap, new Tileset(DEMO_TILESET));
    for (const [id, x, y] of npcs) {
      it(`${zone}: ${id} center at (${x},${y})`, () => {
        const left = x - 6;
        const top = y - 7;
        for (let tx = Math.floor(left / 16); tx <= Math.floor((left + 12 - 0.001) / 16); tx++)
          for (let ty = Math.floor(top / 16); ty <= Math.floor((top + 14 - 0.001) / 16); ty++)
            assert.equal(map.isSolid(tx, ty), false, `solid tile ${tx},${ty}`);
      });
    }
  }
});
