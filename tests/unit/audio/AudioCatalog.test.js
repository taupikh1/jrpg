import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  SFX_IDS, AMBIENT_IDS, ZONE_AMBIENT, SFX_GAIN, FOOTSTEP_IDS,
  ambientForZone, nextFootstepId, sfxPath, ambientPath, allAudioPaths,
} from '../../../src/engine/audio/AudioCatalog.js';
import { REGIONS } from '../../../content/world/world-registry.js';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..', '..');
const SFX_DIR = join(ROOT, 'assets', 'audio', 'sfx');
const AMBIENT_DIR = join(ROOT, 'assets', 'audio', 'ambient');

/** The policy from Batch 9.3A: no background music anywhere in the audio content. */
const MUSIC_WORDS = /music|musik|bgm|theme|soundtrack|song|melod|track_battle|boss_/i;

describe('Audio catalog: no background music', () => {
  it('no sound or ambience id names a music or soundtrack category', () => {
    for (const id of [...SFX_IDS, ...AMBIENT_IDS]) {
      assert.doesNotMatch(id, MUSIC_WORDS, `"${id}" looks like music`);
    }
  });

  it('the asset folders contain exactly the catalog files and nothing else', () => {
    const sfxFiles = readdirSync(SFX_DIR).map((f) => f.replace(/\.mp3$/, '')).sort();
    const ambFiles = readdirSync(AMBIENT_DIR).map((f) => f.replace(/\.mp3$/, '')).sort();
    assert.deepEqual(sfxFiles, [...SFX_IDS].sort(), 'no extra or missing sound effect files');
    assert.deepEqual(ambFiles, [...AMBIENT_IDS].sort(), 'no extra or missing ambience files');
  });

  it('every asset file is a non-empty mp3', () => {
    for (const p of allAudioPaths()) {
      const abs = join(ROOT, p);
      assert.ok(existsSync(abs), `${p} exists`);
      assert.ok(statSync(abs).size > 1000, `${p} has real audio data`);
    }
  });

  it('the generator script contains no melody or soundtrack code', () => {
    const text = readFileSync(join(ROOT, 'tools', 'audio', 'generate-audio.py'), 'utf8');
    assert.doesNotMatch(text, /melody|soundtrack|bgm|background music/i);
  });
});

describe('Audio catalog: zones and ambience', () => {
  const playableZones = REGIONS.filter((r) => r.status === 'playable').flatMap((r) => r.zoneIds);

  it('every playable zone has an ambience assignment', () => {
    for (const zoneId of playableZones) {
      assert.ok(ambientForZone(zoneId), `playable zone "${zoneId}" needs ambience`);
    }
  });

  it('ambience is only mapped to zones that exist in the world registry (no invented locations)', () => {
    const known = new Set(REGIONS.flatMap((r) => r.zoneIds));
    for (const zoneId of Object.keys(ZONE_AMBIENT)) {
      assert.ok(known.has(zoneId), `"${zoneId}" is not a real zone`);
    }
  });

  it('every mapped track is a real ambience id', () => {
    for (const track of Object.values(ZONE_AMBIENT)) {
      assert.ok(AMBIENT_IDS.includes(track), `${track} is not in AMBIENT_IDS`);
    }
  });

  it('unknown or prototype-like zone ids are silent', () => {
    assert.equal(ambientForZone('not_a_zone'), null);
    assert.equal(ambientForZone('constructor'), null);
    assert.equal(ambientForZone('__proto__'), null);
  });

  it('per-sound gain only refers to real sound effects', () => {
    for (const id of Object.keys(SFX_GAIN)) assert.ok(SFX_IDS.includes(id), id);
  });

  it('path helpers produce the folder layout the adapter expects', () => {
    assert.equal(sfxPath('ui_select'), 'assets/audio/sfx/ui_select.mp3');
    assert.equal(ambientPath('forest_wind'), 'assets/audio/ambient/forest_wind.mp3');
  });
});

describe('Footstep variation', () => {
  it('never repeats the previous variant', () => {
    let seed = 7;
    const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    let prev = null;
    for (let i = 0; i < 300; i++) {
      const next = nextFootstepId(prev, rng);
      assert.ok(FOOTSTEP_IDS.includes(next));
      assert.notEqual(next, prev);
      prev = next;
    }
  });

  it('uses every variant over time', () => {
    let seed = 3;
    const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const seen = new Set();
    let prev = null;
    for (let i = 0; i < 100; i++) { prev = nextFootstepId(prev, rng); seen.add(prev); }
    assert.equal(seen.size, FOOTSTEP_IDS.length);
  });
});
