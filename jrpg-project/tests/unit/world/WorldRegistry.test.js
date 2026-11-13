import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  REGIONS,
  ZONE_META,
  CONNECTIONS,
  getRegion,
  getRegionForZone,
  listPlayableZones,
} from '../../../content/world/world-registry.js';
import { ZONE_VILLAGE, ZONE_FOREST } from '../../../content/world/demo-data.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('World registry', () => {
  it('has 12 unique regions matching canon list size', () => {
    assert.equal(REGIONS.length, 12);
    assert.equal(new Set(REGIONS.map((r) => r.id)).size, 12);
  });

  it('playable zones map to ashwillow and whispering wood', () => {
    assert.ok(listPlayableZones().includes('bellhaven_gate'));
    assert.ok(listPlayableZones().includes('village'));
    assert.equal(getRegionForZone('village')?.id, 'region_ashwillow');
    assert.equal(getRegionForZone('forest')?.id, 'region_whispering_wood');
  });

  it('implemented connections are bidirectional village-forest', () => {
    const impl = CONNECTIONS.filter((c) => c.implemented);
    assert.ok(impl.some((c) => c.fromZoneId === 'village' && c.toZoneId === 'forest'));
    assert.ok(impl.some((c) => c.fromZoneId === 'forest' && c.toZoneId === 'village'));
  });

  it('demo zones keep stable ids and Indonesian display names', () => {
    assert.equal(ZONE_VILLAGE.id, 'village');
    assert.equal(ZONE_FOREST.id, 'forest');
    assert.match(ZONE_VILLAGE.name, /Ashwillow/i);
    assert.match(ZONE_FOREST.name, /Berbisik|Hutan/i);
  });

  it('canon registry regions all present', () => {
    const canon = JSON.parse(readFileSync(join(root, 'content/narrative/canon-registry.json'), 'utf8'));
    for (const id of canon.regions) {
      assert.ok(getRegion(id), id);
    }
  });
});

describe('world-validator.mjs', () => {
  it('exits 0', () => {
    const r = spawnSync(process.execPath, [join(root, 'tools/world-validator.mjs')], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr || r.stdout);
    assert.match(r.stdout, /WORLD VALIDATOR OK/);
  });
});
