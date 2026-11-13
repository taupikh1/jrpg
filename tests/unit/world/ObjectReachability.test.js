import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Tileset } from '../../../src/engine/world/tileset/Tileset.js';
import { Tilemap } from '../../../src/engine/world/tilemap/Tilemap.js';
import { DEMO_TILESET, ZONE_FOREST } from '../../../content/world/demo-data.js';
import { ZONE_BELLHAVEN_GATE } from '../../../content/world/bellhaven-data.js';
import { ARCHIVE_ZONES } from '../../../content/world/archive-data.js';

// Player footprint and interaction distance match GameplayDemoScene / InteractionComponent.
const PW = 12;
const PH = 12;

function mapOf(zoneData) {
  return new Tilemap(zoneData.tilemap, new Tileset(DEMO_TILESET));
}

function walkable(map, x, y) {
  for (let ty = Math.floor(y / 16); ty <= Math.floor((y + PW - 1) / 16); ty++)
    for (let tx = Math.floor(x / 16); tx <= Math.floor((x + PW - 1) / 16); tx++)
      if (map.isSolid(tx, ty)) return false;
  return true;
}

/** Count 1px player top-left positions reachable from spawn that are within range of (ox,oy). */
function reachableSpotsNear(zoneData, spawnId, ox, oy, range) {
  const map = mapOf(zoneData);
  const sp = zoneData.spawnPoints.find((s) => s.id === spawnId) ?? zoneData.spawnPoints[0];
  const W = zoneData.tilemap.width * 16 - PW;
  const H = zoneData.tilemap.height * 16 - PH;
  if (!walkable(map, sp.x, sp.y)) return -1;
  const seen = new Uint8Array((W + 1) * (H + 1));
  const q = [[sp.x, sp.y]];
  seen[sp.y * (W + 1) + sp.x] = 1;
  let hits = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const [x, y] = q[qi];
    if (Math.hypot(ox - x, oy - y) <= range) hits++;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx > W || ny > H) continue;
      const k = ny * (W + 1) + nx;
      if (seen[k] || !walkable(map, nx, ny)) continue;
      seen[k] = 1;
      q.push([nx, ny]);
    }
  }
  return hits;
}

const archiveHall = ARCHIVE_ZONES.find((z) => z.id === 'bellhaven_archive_hall');
const archiveStacks = ARCHIVE_ZONES.find((z) => z.id === 'bellhaven_archive_stacks');

describe('interactable objects are reachable by walking', () => {
  it('ch2_note_0 (moved to 100,120) has reachable interaction spots in the forest', () => {
    assert.ok(reachableSpotsNear(ZONE_FOREST, 'start', 100, 120, 16) > 0);
  });

  for (const [id, ox, oy, range] of [
    ['ch2_note_1', 140, 60, 16],
    ['ch2_note_2', 180, 60, 16],
    ['ch2_echo_stone', 80, 80, 22],
  ]) {
    it(`${id} is reachable in the forest`, () => {
      assert.ok(reachableSpotsNear(ZONE_FOREST, 'start', ox, oy, range) > 0);
    });
  }

  for (const [id, ox, oy, range] of [
    ['ch4_rec_east', 60, 50, 20],
    ['ch4_rec_center', 176, 50, 20],
    ['ch4_rec_west', 280, 50, 20],
  ]) {
    it(`${id} is reachable in the archive hall`, () => {
      assert.ok(reachableSpotsNear(archiveHall, 'start', ox, oy, range) > 0);
    });
  }

  it('ch4_cat_0 is reachable in the archive stacks', () => {
    assert.ok(reachableSpotsNear(archiveStacks, 'start', 60, 160, 18) > 0);
  });

  for (const [i, ox, oy] of [[0, 80, 88], [1, 200, 150], [2, 260, 90]]) {
    it(`guest_page_${i} is reachable in the gate zone`, () => {
      assert.ok(reachableSpotsNear(ZONE_BELLHAVEN_GATE, 'start', ox, oy, 18) > 0);
    });
  }
});
