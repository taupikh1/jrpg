import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ZoneManager } from '../../../src/engine/world/zones/ZoneManager.js';
import { NavGrid } from '../../../src/engine/world/navigation/NavGrid.js';
import { findPath } from '../../../src/engine/world/navigation/Pathfinder.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { DEMO_TILESET, ZONE_VILLAGE, ZONE_FOREST, ZONE_ROAD_BELLHAVEN } from '../../../content/world/demo-data.js';
import { QUEST_BUNGA_JALAN, ROAD_FLOWER_SPAWNS } from '../../../content/quests/arc_01/quest_bunga_jalan.js';

function roadZone() {
  const zm = new ZoneManager();
  zm.registerTileset(DEMO_TILESET);
  for (const z of [ZONE_VILLAGE, ZONE_FOREST, ZONE_ROAD_BELLHAVEN]) zm.registerZone(z);
  return zm.activate('road_bellhaven', 'start');
}

describe('Road flower spawns (source data + real tilemap)', () => {
  it('every spawn is a finite [x, y] pair', () => {
    for (const p of ROAD_FLOWER_SPAWNS) {
      assert.ok(Array.isArray(p) && p.length === 2);
      assert.ok(Number.isFinite(p[0]) && Number.isFinite(p[1]), JSON.stringify(p));
    }
  });

  it('there are at least as many spawns as the quest objective requires', () => {
    const need = QUEST_BUNGA_JALAN.objectives.find((o) => o.targetId === 'road_flower').count;
    assert.ok(ROAD_FLOWER_SPAWNS.length >= need);
  });

  it('every spawn is inside the zone, on a walkable tile, and reachable from the start', () => {
    const z = roadZone();
    const grid = NavGrid.fromTilemap(z.tilemap);
    const sp = z.spawnPoints?.find?.((s) => s.id === 'start') ?? { x: 32, y: 96 };
    const s0 = [Math.floor(sp.x / 16), Math.floor(sp.y / 16)];
    for (const [x, y] of ROAD_FLOWER_SPAWNS) {
      assert.ok(x > 0 && y > 0 && x < z.pixelWidth && y < z.pixelHeight, `inside zone ${x},${y}`);
      const tx = Math.floor(x / 16), ty = Math.floor(y / 16);
      assert.ok(grid.isWalkable(tx, ty), `tile ${tx},${ty} for flower ${x},${y} must be walkable`);
      const path = findPath(grid, s0[0], s0[1], tx, ty);
      assert.ok(path && path.length > 0, `reachable ${tx},${ty}`);
    }
  });
});

describe('Bunga Jalan quest flow (real QuestLog)', () => {
  function setup() {
    const events = new EventBus();
    const q = new QuestLog(events);
    q.register(QUEST_BUNGA_JALAN);
    const done = [];
    events.on('quest.completed', (p) => done.push(p));
    return { q, done };
  }

  it('objective progress changes per collection and completes once after talking to Ode', () => {
    const { q, done } = setup();
    q.accept('quest_bunga_jalan');
    for (let i = 1; i <= 3; i++) {
      q.notify('collect', 'road_flower', 1);
      assert.equal(q.getProgress('quest_bunga_jalan').objectives[0].current, i);
    }
    assert.equal(q.getStatus('quest_bunga_jalan'), 'active');
    q.notify('talk', 'character_ode', 1);
    assert.equal(q.getStatus('quest_bunga_jalan'), 'completed');
    // extra collection / talk must not re-complete or re-reward
    q.notify('collect', 'road_flower', 3);
    q.notify('talk', 'character_ode', 1);
    assert.equal(done.length, 1);
  });

  it('a 4th flower does not exceed the objective', () => {
    const { q } = setup();
    q.accept('quest_bunga_jalan');
    for (let i = 0; i < 4; i++) q.notify('collect', 'road_flower', 1);
    assert.equal(q.getProgress('quest_bunga_jalan').objectives[0].current, 3);
  });
});
