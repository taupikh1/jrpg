/**
 * Representative demo world data (Village + Forest).
 * Tile ids: 0 empty, 1 grass, 2 path, 3 wall/solid, 4 water (cost 3, solid), 5 dirt
 */

/** @type {import('../../src/engine/world/tileset/Tileset.js').TilesetData} */
export const DEMO_TILESET = {
  id: 'demo_tiles',
  tileWidth: 16,
  tileHeight: 16,
  columns: 8,
  tileCount: 8,
  imageKey: 'tiles',
  tiles: {
    0: { solid: false, cost: 1, terrain: 'grass' }, // used when id-1=0 → data value 1
    1: { solid: false, cost: 1, terrain: 'path' },
    2: { solid: true, cost: Infinity, terrain: 'wall' },
    3: { solid: true, cost: Infinity, terrain: 'water' },
    4: { solid: false, cost: 2, terrain: 'dirt' },
    5: { solid: false, cost: 1, terrain: 'forest' },
  },
};

function fill(w, h, v) {
  return Array(w * h).fill(v);
}

function stamp(data, w, x, y, tw, th, v) {
  for (let j = 0; j < th; j++) {
    for (let i = 0; i < tw; i++) {
      data[(y + j) * w + (x + i)] = v;
    }
  }
}

// --- Village 20x14 ---
const VW = 20;
const VH = 14;
const villageGround = fill(VW, VH, 1); // grass
// path
stamp(villageGround, VW, 2, 6, 16, 2, 2);
stamp(villageGround, VW, 9, 2, 2, 10, 2);
// border walls
stamp(villageGround, VW, 0, 0, VW, 1, 3);
stamp(villageGround, VW, 0, VH - 1, VW, 1, 3);
stamp(villageGround, VW, 0, 0, 1, VH, 3);
stamp(villageGround, VW, VW - 1, 0, 1, VH, 3);
// opening south for exit (clear wall)
stamp(villageGround, VW, 8, VH - 1, 4, 1, 2);
// building footprint
stamp(villageGround, VW, 3, 3, 4, 3, 3);

const villageDecals = fill(VW, VH, 0);
stamp(villageDecals, VW, 12, 4, 1, 1, 5);

/** @type {import('../../src/engine/world/zones/Zone.js').ZoneData} */
export const ZONE_VILLAGE = {
  id: 'village',
  name: 'Desa Ashwillow',
  description: 'Desa di lembah Ashwillow — titik awal Bab 1.',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'village_map',
    width: VW,
    height: VH,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [
      { name: 'ground', data: villageGround, collision: true, visible: true },
      { name: 'decals', data: villageDecals, collision: false, visible: true },
    ],
  },
  spawnPoints: [
    { id: 'start', x: 160, y: 112 },
    { id: 'from_forest', x: 160, y: 200 },
  ],
  connections: [
    {
      id: 'to_forest',
      targetZoneId: 'forest',
      targetSpawnId: 'from_village',
      trigger: { x: 128, y: 208, w: 64, h: 16 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [
    { id: 'well', x: 216, y: 64, w: 16, h: 16, solid: true, layer: 'world_objects' },
  ],
  env: { biome: 'village' },
};

// --- Forest 24x16 ---
const FW = 24;
const FH = 16;
const forestGround = fill(FW, FH, 6); // forest grass (id 6 → index 5)
// clear path
stamp(forestGround, FW, 1, 7, 22, 2, 2);
stamp(forestGround, FW, 11, 1, 2, 14, 2);
// walls / trees as solids
stamp(forestGround, FW, 0, 0, FW, 1, 3);
stamp(forestGround, FW, 0, FH - 1, FW, 1, 3);
stamp(forestGround, FW, 0, 0, 1, FH, 3);
stamp(forestGround, FW, FW - 1, 0, 1, FH, 3);
// opening north back to village
stamp(forestGround, FW, 10, 0, 4, 1, 2);
// south exit opening toward Bellhaven road
stamp(forestGround, FW, 10, FH - 1, 4, 1, 2);
// water pond (solid)
stamp(forestGround, FW, 4, 3, 4, 3, 4);
// dirt patch (higher cost)
stamp(forestGround, FW, 16, 10, 5, 3, 5);

/** @type {import('../../src/engine/world/zones/Zone.js').ZoneData} */
export const ZONE_FOREST = {
  id: 'forest',
  name: 'Hutan Berbisik',
  description: 'Forest demo zone with terrain costs',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'forest_map',
    width: FW,
    height: FH,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [{ name: 'ground', data: forestGround, collision: true, visible: true }],
  },
  spawnPoints: [
    { id: 'from_village', x: 192, y: 32 },
    { id: 'deep', x: 192, y: 180 },
  ],
  connections: [
    {
      id: 'to_village',
      targetZoneId: 'village',
      targetSpawnId: 'from_forest',
      trigger: { x: 160, y: 0, w: 64, h: 16 },
      enabled: true,
      type: 'door',
    },
    {
      id: 'to_road_bellhaven',
      targetZoneId: 'road_bellhaven',
      targetSpawnId: 'from_forest',
      trigger: { x: 160, y: 208, w: 64, h: 16 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [
    { id: 'stump', x: 80, y: 140, w: 16, h: 16, solid: true },
  ],
  env: { biome: 'forest' },
};


// --- Road to Bellhaven 28x12 ---
const RW = 28;
const RH = 12;
const roadGround = fill(RW, RH, 1); // grass
// main road path horizontal
stamp(roadGround, RW, 0, 5, RW, 2, 2);
// side path north
stamp(roadGround, RW, 10, 1, 2, 5, 2);
// side path south to overlook
stamp(roadGround, RW, 18, 7, 2, 4, 2);
// border walls
stamp(roadGround, RW, 0, 0, RW, 1, 3);
stamp(roadGround, RW, 0, RH - 1, RW, 1, 3);
stamp(roadGround, RW, 0, 0, 1, RH, 3);
stamp(roadGround, RW, RW - 1, 0, 1, RH, 3);
// openings: west from forest, east approach gate (still open wall as path)
stamp(roadGround, RW, 0, 5, 1, 2, 2);
stamp(roadGround, RW, RW - 1, 5, 1, 2, 2);
// south opening at the end of the overlook path -> Situs Resonansi Kuno
stamp(roadGround, RW, 18, RH - 1, 2, 1, 2);
// rocks / dirt patches
stamp(roadGround, RW, 6, 2, 3, 2, 5);
stamp(roadGround, RW, 22, 8, 3, 2, 4);

/** @type {import('../../src/engine/world/zones/Zone.js').ZoneData} */
export const ZONE_ROAD_BELLHAVEN = {
  id: 'road_bellhaven',
  name: 'Jalan Menuju Bellhaven',
  description: 'Jalur debu antara tepi Hutan Berbisik dan pendekatan kota Bellhaven.',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'road_bellhaven_map',
    width: RW,
    height: RH,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [{ name: 'ground', data: roadGround, collision: true, visible: true }],
  },
  spawnPoints: [
    { id: 'from_forest', x: 32, y: 96 },
    { id: 'start', x: 32, y: 96 },
    { id: 'near_gate', x: 400, y: 96 },
    { id: 'from_resonance', x: 304, y: 152 },
  ],
  connections: [
    {
      id: 'to_forest',
      targetZoneId: 'forest',
      targetSpawnId: 'deep',
      trigger: { x: 0, y: 80, w: 16, h: 48 },
      enabled: true,
      type: 'door',
    },
    {
      id: 'to_bellhaven_gate',
      targetZoneId: 'bellhaven_gate',
      targetSpawnId: 'from_road',
      trigger: { x: 432, y: 80, w: 16, h: 48 },
      enabled: true,
      type: 'door',
    },
    {
      id: 'to_resonance_site',
      targetZoneId: 'resonance_ancient_site',
      targetSpawnId: 'from_road',
      trigger: { x: 288, y: 176, w: 32, h: 16 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [
    { id: 'mile_marker', x: 200, y: 72, w: 12, h: 12, solid: false },
    { id: 'broken_cart', x: 256, y: 128, w: 20, h: 14, solid: true },
  ],
  env: { biome: 'road', regionId: 'region_bellhaven' },
};
