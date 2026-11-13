import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ZoneManager } from '../../../src/engine/world/zones/ZoneManager.js';
import {
  DEMO_TILESET,
  ZONE_VILLAGE,
  ZONE_FOREST,
  ZONE_ROAD_BELLHAVEN,
} from '../../../content/world/demo-data.js';
import { ZONE_META, CONNECTIONS, getRegionForZone } from '../../../content/world/world-registry.js';
import { ROAD_BELLHAVEN_DIALOGUES } from '../../../content/dialogue/npcs/road_bellhaven_npcs.js';
import { QUEST_BUNGA_JALAN } from '../../../content/quests/arc_01/quest_bunga_jalan.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';

describe('ZONE_ROAD_BELLHAVEN', () => {
  it('registers and activates with valid dimensions', () => {
    const zm = new ZoneManager();
    zm.registerTileset(DEMO_TILESET);
    zm.registerZone(ZONE_VILLAGE);
    zm.registerZone(ZONE_FOREST);
    zm.registerZone(ZONE_ROAD_BELLHAVEN);
    const z = zm.activate('road_bellhaven', 'from_forest');
    assert.equal(z.id, 'road_bellhaven');
    assert.ok(z.pixelWidth > 0);
    assert.ok(z.pixelHeight > 0);
    assert.match(z.name, /Bellhaven/i);
  });

  it('connects forest → road and road → forest', () => {
    assert.ok(CONNECTIONS.some((c) => c.implemented && c.fromZoneId === 'forest' && c.toZoneId === 'road_bellhaven'));
    assert.ok(CONNECTIONS.some((c) => c.implemented && c.fromZoneId === 'road_bellhaven' && c.toZoneId === 'forest'));
    const forest = ZONE_FOREST.connections.find((c) => c.targetZoneId === 'road_bellhaven');
    assert.ok(forest);
    const back = ZONE_ROAD_BELLHAVEN.connections.find((c) => c.targetZoneId === 'forest');
    assert.ok(back);
  });

  it('maps to region_bellhaven in registry', () => {
    assert.equal(ZONE_META.road_bellhaven.regionId, 'region_bellhaven');
    assert.equal(getRegionForZone('road_bellhaven')?.id, 'region_bellhaven');
  });

  it('tryTransitionAt from forest south trigger hits road', () => {
    const zm = new ZoneManager();
    zm.registerTileset(DEMO_TILESET);
    zm.registerZone(ZONE_FOREST);
    zm.registerZone(ZONE_ROAD_BELLHAVEN);
    zm.activate('forest', 'deep');
    const tr = zm.tryTransitionAt(180, 212);
    assert.ok(tr);
    assert.equal(tr.zone.id, 'road_bellhaven');
  });
});

describe('Road content', () => {
  it('dialogues register and walk', () => {
    const eng = new DialogueEngine();
    for (const d of ROAD_BELLHAVEN_DIALOGUES) eng.register(d);
    assert.ok(ROAD_BELLHAVEN_DIALOGUES.length >= 5);
    eng.start('road_npc_guard_lyn');
    assert.ok(eng.isActive);
  });

  it('quest_bunga_jalan accepts and tracks', () => {
    const events = new EventBus();
    const q = new QuestLog(events);
    q.register(QUEST_BUNGA_JALAN);
    assert.equal(q.accept('quest_bunga_jalan').ok, true);
    assert.equal(q.getStatus('quest_bunga_jalan'), 'active');
  });
});
