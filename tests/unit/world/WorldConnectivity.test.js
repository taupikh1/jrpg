import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ZoneManager } from '../../../src/engine/world/zones/ZoneManager.js';
import { NavGrid } from '../../../src/engine/world/navigation/NavGrid.js';
import { findPath } from '../../../src/engine/world/navigation/Pathfinder.js';
import { DEMO_TILESET } from '../../../content/world/demo-data.js';
import { CONNECTIONS } from '../../../content/world/world-registry.js';

async function loadZones() {
  const zones = new Map();
  for (const f of fs.readdirSync('content/world').filter((n) => n.endsWith('.js'))) {
    const m = await import(pathToFileURL(path.resolve('content/world', f)).href);
    for (const v of Object.values(m)) {
      for (const z of Array.isArray(v) ? v : [v]) {
        if (z && z.id && z.tilemap && z.connections && z.spawnPoints) zones.set(z.id, z);
      }
    }
  }
  return zones;
}

const T = 16;
const rectTiles = (r) => {
  const out = [];
  for (let ty = Math.floor(r.y / T); ty <= Math.floor((r.y + r.h - 1) / T); ty++)
    for (let tx = Math.floor(r.x / T); tx <= Math.floor((r.x + r.w - 1) / T); tx++) out.push([tx, ty]);
  return out;
};
const inRect = (x, y, r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

describe('World connectivity (all zones, real tilemaps)', async () => {
  const zones = await loadZones();
  const zm = new ZoneManager();
  zm.registerTileset(DEMO_TILESET);
  for (const z of zones.values()) zm.registerZone(z);
  const grids = new Map();
  for (const id of zones.keys()) grids.set(id, NavGrid.fromTilemap(zm.activate(id).tilemap));

  it('loads the expected playable zones including the ancient site', () => {
    for (const id of ['village', 'forest', 'road_bellhaven', 'bellhaven_gate', 'resonance_ancient_site']) {
      assert.ok(zones.has(id), id);
    }
  });

  it('every connection targets an existing zone and spawn', () => {
    for (const z of zones.values()) {
      for (const c of z.connections) {
        const t = zones.get(c.targetZoneId);
        assert.ok(t, `${z.id}/${c.id} -> unknown zone ${c.targetZoneId}`);
        assert.ok(t.spawnPoints.some((s) => s.id === c.targetSpawnId), `${z.id}/${c.id} -> missing spawn ${c.targetSpawnId}`);
      }
    }
  });

  it('every spawn point is on a walkable tile and not inside an exit trigger', () => {
    for (const z of zones.values()) {
      const g = grids.get(z.id);
      for (const s of z.spawnPoints) {
        assert.ok(g.isWalkable(Math.floor(s.x / T), Math.floor(s.y / T)), `${z.id}/${s.id} blocked`);
        for (const c of z.connections) assert.ok(!inRect(s.x, s.y, c.trigger), `${z.id}/${s.id} spawns inside trigger ${c.id}`);
      }
    }
  });

  it('every exit trigger has a walkable, reachable tile from every spawn of its zone', () => {
    for (const z of zones.values()) {
      const g = grids.get(z.id);
      for (const c of z.connections) {
        const targets = rectTiles(c.trigger).filter(([tx, ty]) => g.isWalkable(tx, ty));
        assert.ok(targets.length > 0, `${z.id}/${c.id} trigger has no walkable tile`);
        for (const s of z.spawnPoints) {
          const ok = targets.some(([tx, ty]) => findPath(g, Math.floor(s.x / T), Math.floor(s.y / T), tx, ty)?.length > 0);
          assert.ok(ok, `${z.id}: ${c.id} unreachable from spawn ${s.id}`);
        }
      }
    }
  });

  it('every zone is reachable from the village via zone connections', () => {
    const seen = new Set(['village']);
    const q = ['village'];
    while (q.length) for (const c of zones.get(q.shift()).connections) if (!seen.has(c.targetZoneId)) { seen.add(c.targetZoneId); q.push(c.targetZoneId); }
    for (const id of zones.keys()) assert.ok(seen.has(id), `${id} unreachable from village`);
  });

  it('registry connections marked implemented exist in zone data', () => {
    for (const c of CONNECTIONS.filter((x) => x.implemented)) {
      const z = zones.get(c.fromZoneId);
      assert.ok(z, c.id);
      assert.ok(z.connections.some((k) => k.targetZoneId === c.toZoneId && k.enabled !== false), `${c.id} missing in zone data`);
    }
  });

  it('ancient site round trip: road -> site -> road lands on the entrance, not the gate', () => {
    const toSite = zones.get('road_bellhaven').connections.find((c) => c.targetZoneId === 'resonance_ancient_site');
    const back = zones.get('resonance_ancient_site').connections.find((c) => c.targetZoneId === 'road_bellhaven');
    assert.equal(toSite.targetSpawnId, 'from_road');
    assert.equal(back.targetSpawnId, 'from_resonance');
  });
});
