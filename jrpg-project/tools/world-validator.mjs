#!/usr/bin/env node
/**
 * World registry validator — content layer integrity.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REGIONS, ZONE_META, CONNECTIONS, listPlayableZones } from '../content/world/world-registry.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function fail(m) {
  errors.push(m);
}
function warn(m) {
  warnings.push(m);
}

// Unique region IDs
const regionIds = REGIONS.map((r) => r.id);
if (new Set(regionIds).size !== regionIds.length) fail('duplicate region ids');

// Expected 12 canon regions
const canonPath = join(root, 'content/narrative/canon-registry.json');
if (existsSync(canonPath)) {
  const canon = JSON.parse(readFileSync(canonPath, 'utf8'));
  for (const id of canon.regions || []) {
    if (!regionIds.includes(id)) fail(`canon region missing in world registry: ${id}`);
  }
  if (REGIONS.length !== 12) warn(`expected 12 regions, found ${REGIONS.length}`);
}

// Zone meta references
for (const [zoneId, meta] of Object.entries(ZONE_META)) {
  if (!meta.regionId) fail(`zone ${zoneId} missing regionId`);
  if (!regionIds.includes(meta.regionId)) fail(`zone ${zoneId} bad region ${meta.regionId}`);
  const reg = REGIONS.find((r) => r.id === meta.regionId);
  if (reg && !reg.zoneIds.includes(zoneId)) {
    fail(`region ${meta.regionId} zoneIds missing ${zoneId}`);
  }
}

// Connections
const playable = new Set(listPlayableZones());
for (const c of CONNECTIONS) {
  if (c.implemented) {
    if (!playable.has(c.fromZoneId)) fail(`conn ${c.id} from not playable`);
    if (!playable.has(c.toZoneId)) fail(`conn ${c.id} to not playable`);
  }
}

// Demo zone files exist conceptually via import path
const demoPath = join(root, 'content/world/demo-data.js');
if (!existsSync(demoPath)) fail('missing content/world/demo-data.js');

if (errors.length) {
  console.error('WORLD VALIDATOR FAIL');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log('WORLD VALIDATOR OK');
console.log(`Regions: ${REGIONS.length}; playable zones: ${[...playable].join(', ')}`);
if (warnings.length) {
  console.log('Warnings:');
  for (const w of warnings) console.log(' -', w);
}
process.exit(0);
