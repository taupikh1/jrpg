// D2 zone gating (ZONE_GATES via ZoneManager.canEnter) and Bug B (_lastSafePos) with real zone data.
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { ZoneManager } from '../../../src/engine/world/zones/ZoneManager.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { DEMO_TILESET, ZONE_VILLAGE, ZONE_FOREST, ZONE_ROAD_BELLHAVEN } from '../../../content/world/demo-data.js';
import { makeScene } from './sceneHarness.js';

function world() {
  const { scene } = makeScene();
  const events = new EventBus();
  const zones = new ZoneManager({ events, textures: { get: () => null } });
  zones.registerTileset(DEMO_TILESET);
  zones.registerZone(ZONE_VILLAGE);
  zones.registerZone(ZONE_FOREST);
  zones.registerZone(ZONE_ROAD_BELLHAVEN);
  zones.canEnter = (id) => scene._zoneLockReason(id);
  scene.zones = zones;
  scene.entities = { all: () => [], remove() {}, add() {} };
  scene.player = { id: 'player', x: 0, y: 0, w: 12, h: 14, zoneId: null, facing: 'down', get: () => null };
  for (const m of ['_spawnZoneNpcs', '_applyCamera', '_rebuildLayers', '_maybeCh3FirstView',
    '_maybeCh2ForestEntry', '_maybeCh4FirstEntry', '_maybeCh5Start']) scene[m] = () => {};
  return { scene, zones };
}

/** Centre of a zone_exit trigger that leads to targetZoneId. */
function exitCentre(zones, targetZoneId) {
  const t = zones.collision.triggers.find((x) => x.data?.targetZoneId === targetZoneId);
  assert.ok(t, `exit to ${targetZoneId} exists`);
  return { x: t.rect.x + t.rect.w / 2, y: t.rect.y + t.rect.h / 2 };
}

describe('zone gating through the real transition path (D2)', () => {
  it('locked road is denied before ch2_completed and the player stays in the forest', () => {
    const { scene, zones } = world();
    zones.activate('forest', 'from_village');
    scene.player.zoneId = 'forest';
    const c = exitCentre(zones, 'road_bellhaven');
    scene.player.x = c.x; scene.player.y = c.y;
    scene._handleZoneTrigger();
    assert.equal(zones.activeZone.id, 'forest');
    assert.ok(scene._toasts.at(-1).includes('Jalan menuju Bellhaven'));
  });

  it('allowed after legitimate ch2_completed', () => {
    const { scene, zones } = world();
    zones.activate('forest', 'from_village');
    scene.player.zoneId = 'forest';
    scene._ch2Flags.ch2_completed = true;
    const c = exitCentre(zones, 'road_bellhaven');
    scene.player.x = c.x; scene.player.y = c.y;
    scene._handleZoneTrigger();
    assert.equal(zones.activeZone.id, 'road_bellhaven');
  });

  it('Desa Ashwillow and Hutan Berbisik are never gated', () => {
    const { scene } = world();
    assert.equal(scene._zoneLockReason('village'), null);
    assert.equal(scene._zoneLockReason('forest'), null);
  });

  it('only the load path uses direct zone entry, and load re-checks the gate', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../../../src/scenes/GameplayDemoScene.js', import.meta.url), 'utf8');
    const callers = src.split('\n').filter((l) => /_enterZoneAt\(/.test(l) && !/^\s*_enterZoneAt\(zoneId, x, y\) \{/.test(l));
    assert.equal(callers.length, 1, 'single caller');
    assert.match(src, /lock \? 'village' : savedZone/);
  });

  it('reloading does not unlock a gated zone (flags restored from save)', async () => {
    const { scene, zones } = world();
    zones.activate('forest', 'from_village');
    scene.player.zoneId = 'forest';
    scene.saveManager = { load: async () => ({ ok: true, data: loadData('forest', 100, 100) }) };
    stubLoadDeps(scene);
    await scene._doLoad();
    const c = exitCentre(zones, 'road_bellhaven');
    scene.player.x = c.x; scene.player.y = c.y;
    scene._handleZoneTrigger();
    assert.equal(zones.activeZone.id, 'forest');
  });
});

describe('_lastSafePos is zone-scoped and valid (Bug B)', () => {
  it('after entering a zone, recovery never returns to coordinates of the previous zone', () => {
    const { scene, zones } = world();
    // Zone A: village, record a safe position from real walking state.
    zones.activate('village', 'start');
    scene.player.zoneId = 'village';
    const startA = zones.activeZone.getSpawn('start');
    scene.player.x = startA.x; scene.player.y = startA.y;
    scene._handleZoneTrigger();
    assert.equal(scene._lastSafePos.zoneId, 'village');
    // Transition to zone B (forest, ungated).
    const c = exitCentre(zones, 'forest');
    scene.player.x = c.x; scene.player.y = c.y;
    scene._handleZoneTrigger();
    assert.equal(zones.activeZone.id, 'forest');
    assert.equal(scene._lastSafePos, null, 'safe position reset on zone change');
    // Recovery condition in zone B: standing on the locked road exit right after arrival.
    const r = exitCentre(zones, 'road_bellhaven');
    scene.player.x = r.x; scene.player.y = r.y;
    scene._handleZoneTrigger();
    assert.notDeepEqual({ x: scene.player.x, y: scene.player.y }, { x: startA.x, y: startA.y }, 'not zone A coords');
    assert.equal(scene._isOccupiableAt(scene.player.x, scene.player.y), true, 'landed on walkable tile of forest');
  });

  it('a stale safe position recorded in another zone is ignored during recovery', () => {
    const { scene, zones } = world();
    zones.activate('forest', 'from_village');
    scene.player.zoneId = 'forest';
    const forestSpawn = zones.activeZone.getSpawn('from_village');
    const villageStart = ZONE_VILLAGE.spawnPoints.find((s) => s.id === 'start');
    scene._lastSafePos = { zoneId: 'village', x: villageStart.x, y: villageStart.y }; // leftover from zone A
    const r = exitCentre(zones, 'road_bellhaven');
    scene.player.x = r.x; scene.player.y = r.y;
    scene._handleZoneTrigger();
    assert.notDeepEqual({ x: scene.player.x, y: scene.player.y }, { x: villageStart.x, y: villageStart.y });
    assert.equal(scene.player.x, forestSpawn.x);
    assert.equal(scene.player.y, forestSpawn.y);
  });

  it('recovery uses the current zone safe position when one was recorded in that zone', () => {
    const { scene, zones } = world();
    zones.activate('forest', 'from_village');
    scene.player.zoneId = 'forest';
    const spawn = zones.activeZone.getSpawn('from_village');
    scene.player.x = spawn.x; scene.player.y = spawn.y;
    scene._handleZoneTrigger(); // records forest safe pos
    const r = exitCentre(zones, 'road_bellhaven');
    scene.player.x = r.x; scene.player.y = r.y;
    scene._handleZoneTrigger();
    assert.equal(scene.player.x, spawn.x);
    assert.equal(scene.player.y, spawn.y);
  });

  it('load with a valid saved position restores it and records a zone-scoped safe pos', async () => {
    const { scene, zones } = world();
    zones.activate('village', 'start');
    const spawn = zones.activeZone.getSpawn('from_village') ?? { x: 0, y: 0 };
    scene._lastSafePos = { zoneId: 'village', x: 999, y: 999 }; // stale from before load
    scene.saveManager = { load: async () => ({ ok: true, data: loadData('forest', 192, 32) }) };
    stubLoadDeps(scene);
    await scene._doLoad();
    assert.equal(zones.activeZone.id, 'forest');
    assert.equal(scene.player.x, 192);
    assert.equal(scene.player.y, 32);
    assert.deepEqual(scene._lastSafePos, { zoneId: 'forest', x: 192, y: 32 });
    assert.notEqual(spawn, null);
  });

  it('load with an invalid saved position falls back to a walkable spot in the restored zone', async () => {
    const { scene, zones } = world();
    zones.activate('village', 'start');
    scene._lastSafePos = { zoneId: 'village', x: 160, y: 112 };
    scene.saveManager = { load: async () => ({ ok: true, data: loadData('forest', 0, 0) }) }; // border wall
    stubLoadDeps(scene);
    await scene._doLoad();
    assert.equal(zones.activeZone.id, 'forest');
    assert.notDeepEqual({ x: scene.player.x, y: scene.player.y }, { x: 160, y: 112 }, 'no stale village coords');
    assert.equal(scene._isOccupiableAt(scene.player.x, scene.player.y), true);
  });

  it('save pointing at a locked zone loads the village instead (gate not bypassed)', async () => {
    const { scene, zones } = world();
    zones.activate('village', 'start');
    scene.saveManager = { load: async () => ({ ok: true, data: loadData('road_bellhaven', 192, 216) }) };
    stubLoadDeps(scene);
    await scene._doLoad();
    assert.equal(zones.activeZone.id, 'village');
    assert.match(scene._toasts.at(-1), /Jalan menuju Bellhaven/);
  });
});

function loadData(zoneId, x, y) {
  return {
    displayName: 'test',
    player: { zoneId, x, y, facing: 'down', stats: { hp: 1, mp: 1 } },
    gold: 0,
    inventory: { slots: [] },
    equipment: {},
    quests: {},
    world: { flags: { ch1: {}, ch2: {}, ch3: {}, ch4: {}, ch5: {} } },
  };
}

function stubLoadDeps(scene) {
  scene.stats = { hp: 0, mp: 0 };
  scene.inventory = { slots: [] };
  scene.equipment = { equipped: {}, unequip() {}, equip() {} };
  scene.quests = { _state: null };
  scene.gold = 0;
  mock.method(console, 'error', () => {});
}
