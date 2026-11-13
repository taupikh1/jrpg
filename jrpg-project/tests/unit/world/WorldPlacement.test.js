import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/EventBus.js';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';

const ZONE_IDS = [
  'village',
  'forest',
  'road_bellhaven',
  'bellhaven_gate',
  'bellhaven_plaza',
  'bellhaven_market',
  'bellhaven_archive_hall',
  'bellhaven_archive_stacks',
  'bellhaven_archive_restricted',
  'resonance_ancient_site',
];

// These objects are intentionally attached to a designed structure (pool, shelf, pillar, or wall).
const INTENTIONAL_MOUNTS = new Set([
  'bh_fountain',
  'ch4_rec_east',
  'ch4_rec_west',
  'ch4_cat_0',
  'ch5_pillar',
  'ch5_mural',
]);

function blockedCells(tilemap, rect) {
  const x0 = Math.floor(rect.x / tilemap.tileWidth);
  const y0 = Math.floor(rect.y / tilemap.tileHeight);
  const x1 = Math.floor((rect.x + rect.w - 0.001) / tilemap.tileWidth);
  const y1 = Math.floor((rect.y + rect.h - 0.001) / tilemap.tileHeight);
  const hits = [];
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (tilemap.isSolid(tx, ty)) hits.push(`${tx},${ty}`);
    }
  }
  return hits;
}

function loadZone(zoneId) {
  const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
  scene.init({ events: new EventBus(), input: null, startMode: 'new' });
  // Exercise the conditional Chapter 5 market interactable during the placement sweep.
  scene._ch5Flags = { ch5_fragment_investigated: true, ch5_echo_found: false };
  const zone = scene.zones.activate(zoneId);
  scene._spawnWorld(zone);
  return { scene, zone };
}

describe('world object placement audit', () => {
  for (const zoneId of ZONE_IDS) {
    it(`${zoneId}: NPC footprints stay off walls and water`, () => {
      const { scene, zone } = loadZone(zoneId);
      const npcs = scene.entities.all().filter((e) => e.type === 'npc');
      for (const entity of npcs) {
        const hits = blockedCells(zone.tilemap, entity.getBounds());
        assert.deepEqual(hits, [], `${entity.id} at (${entity.x},${entity.y}) overlaps blocked tiles ${hits.join('; ')}`);
      }
      for (let i = 0; i < npcs.length; i++) {
        const a = npcs[i].getBounds();
        for (let j = i + 1; j < npcs.length; j++) {
          const b = npcs[j].getBounds();
          const overlaps = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
          assert.equal(overlaps, false, `${npcs[i].id} overlaps ${npcs[j].id}`);
        }
      }
      scene.destroy?.();
    });

    it(`${zoneId}: interactive objects are grounded or explicitly mounted`, () => {
      const { scene, zone } = loadZone(zoneId);
      for (const entity of scene.entities.all().filter((e) => e.type === 'object')) {
        const hits = blockedCells(zone.tilemap, entity.getBounds());
        if (hits.length) {
          assert.ok(INTENTIONAL_MOUNTS.has(entity.id), `${entity.id} unexpectedly overlaps blocked tiles ${hits.join('; ')}`);
        }
      }
      scene.destroy?.();
    });

    it(`${zoneId}: static collision props are placed on non-solid ground`, () => {
      const { scene, zone } = loadZone(zoneId);
      for (const object of zone.objects) {
        const hits = blockedCells(zone.tilemap, {
          x: object.x,
          y: object.y,
          w: object.w ?? 16,
          h: object.h ?? 16,
        });
        assert.deepEqual(hits, [], `${object.id} overlaps blocked tiles ${hits.join('; ')}`);
      }
      scene.destroy?.();
    });
  }
});
