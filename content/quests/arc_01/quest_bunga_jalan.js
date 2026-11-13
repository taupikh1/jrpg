/**
 * Optional side quest — Jalan Menuju Bellhaven
 */

/** @type {import('../../../src/engine/gameplay/quests/QuestLog.js').QuestDef} */
export const QUEST_BUNGA_JALAN = {
  id: 'quest_bunga_jalan',
  name: 'Bunga di Tepi Debu',
  description:
    'Ode, pedagang di jalan menuju Bellhaven, meminta tiga Bunga Jalan dari tepi bebatuan sebagai bahan barter.',
  prerequisites: [],
  objectives: [
    {
      id: 'collect_road_flower',
      type: 'collect',
      targetId: 'road_flower',
      count: 3,
      description: 'Kumpulkan Bunga Jalan (0/3)',
    },
    {
      id: 'return_ode',
      type: 'talk',
      targetId: 'character_ode',
      count: 1,
      description: 'Kembalikan bunga kepada Ode',
    },
  ],
  rewards: {
    items: [{ id: 'herb', qty: 2 }],
    gold: 10,
  },
};

/**
 * World positions [x, y] (pixels, road_bellhaven zone) of collectible Bunga Jalan.
 * Quest needs 3; a 4th is a spare. Every point must lie on a walkable tile
 * (guarded by tests/unit/world/RoadFlowers.test.js).
 */
export const ROAD_FLOWER_SPAWNS = [
  [80, 48],
  [160, 140],
  [320, 48],
  [344, 130],
];
