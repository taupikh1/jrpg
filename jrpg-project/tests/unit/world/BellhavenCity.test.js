import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ZoneManager } from '../../../src/engine/world/zones/ZoneManager.js';
import { DEMO_TILESET, ZONE_ROAD_BELLHAVEN } from '../../../content/world/demo-data.js';
import {
  ZONE_BELLHAVEN_GATE,
  ZONE_BELLHAVEN_PLAZA,
  ZONE_BELLHAVEN_MARKET,
  BELLHAVEN_ZONES,
} from '../../../content/world/bellhaven-data.js';
import { CONNECTIONS, ZONE_META } from '../../../content/world/world-registry.js';
import { BH_DIALOGUES } from '../../../content/dialogue/npcs/bellhaven_npcs.js';
import { BELLHAVEN_QUESTS } from '../../../content/quests/arc_01/bellhaven_quests.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';

describe('Bellhaven zones', () => {
  it('three districts register and interconnect', () => {
    const zm = new ZoneManager();
    zm.registerTileset(DEMO_TILESET);
    zm.registerZone(ZONE_ROAD_BELLHAVEN);
    for (const z of BELLHAVEN_ZONES) zm.registerZone(z);
    assert.equal(BELLHAVEN_ZONES.length, 3);
    const g = zm.activate('bellhaven_gate', 'from_road');
    assert.equal(g.id, 'bellhaven_gate');
    const tr = zm.tryTransitionAt(310, 112);
    assert.ok(tr);
    assert.equal(tr.zone.id, 'bellhaven_plaza');
  });

  it('road connects to gate', () => {
    assert.ok(CONNECTIONS.some((c) => c.fromZoneId === 'road_bellhaven' && c.toZoneId === 'bellhaven_gate' && c.implemented));
    assert.equal(ZONE_META.bellhaven_market.regionId, 'region_bellhaven');
  });

  it('dialogues and quests load', () => {
    const eng = new DialogueEngine();
    for (const d of BH_DIALOGUES) eng.register(d);
    eng.start('bh_gate_captain');
    assert.ok(eng.isActive);
    const q = new QuestLog(new EventBus());
    for (const def of BELLHAVEN_QUESTS) q.register(def);
    assert.equal(BELLHAVEN_QUESTS.length, 3);
  });
});
