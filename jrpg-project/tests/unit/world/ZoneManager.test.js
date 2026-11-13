import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ZoneManager } from '../../../src/engine/world/zones/ZoneManager.js';
import { DEMO_TILESET, ZONE_VILLAGE, ZONE_FOREST } from '../../../content/world/demo-data.js';
import { EventBus } from '../../../src/core/EventBus.js';

describe('ZoneManager', () => {
  function setup() {
    const events = new EventBus();
    const zm = new ZoneManager({ events, textures: { get: () => null } });
    zm.registerTileset(DEMO_TILESET);
    zm.registerZone(ZONE_VILLAGE);
    zm.registerZone(ZONE_FOREST);
    return { zm, events };
  }

  it('registers and activates zone', () => {
    const { zm } = setup();
    const z = zm.activate('village', 'start');
    assert.equal(z.id, 'village');
    assert.equal(z.active, true);
    assert.ok(zm.navGrid);
    assert.ok(zm.tileRenderer);
  });

  it('rejects unknown zone', () => {
    const { zm } = setup();
    assert.throws(() => zm.activate('nope'), /not registered/);
  });

  it('transition village → forest uses spawn', () => {
    const { zm } = setup();
    zm.activate('village', 'start');
    const { zone, spawn } = zm.transitionTo('forest', 'from_village');
    assert.equal(zone.id, 'forest');
    assert.equal(spawn.id, 'from_village');
    assert.equal(zm.activeZone.id, 'forest');
  });

  it('deactivate clears collision', () => {
    const { zm } = setup();
    zm.activate('village');
    zm.deactivate();
    assert.equal(zm.activeZone, null);
    assert.equal(zm.navGrid, null);
  });

  it('tryTransitionAt on exit trigger', () => {
    const { zm } = setup();
    zm.activate('village', 'start');
    // Village exit trigger around y=208
    const r = zm.tryTransitionAt(140, 212);
    assert.ok(r);
    assert.equal(r.zone.id, 'forest');
  });

  it('duplicate register throws', () => {
    const { zm } = setup();
    assert.throws(() => zm.registerZone(ZONE_VILLAGE), /already/);
  });

  it('collision solid tiles in village', () => {
    const { zm } = setup();
    zm.activate('village');
    // border wall
    assert.equal(zm.activeZone.tilemap.isSolid(0, 0), true);
    // path interior roughly
    assert.equal(zm.activeZone.tilemap.isSolid(10, 6), false);
  });
});
