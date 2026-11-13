/**
 * Bellhaven city zones — Batch 8.2 foundation
 * Tile ids match DEMO_TILESET (1 grass, 2 path, 3 wall, 4 water/stall, 5 dirt, 6 forest-ish)
 */

function fill(w, h, v) {
  return Array(w * h).fill(v);
}
function stamp(data, w, x, y, tw, th, v) {
  for (let j = 0; j < th; j++) {
    for (let i = 0; i < tw; i++) {
      const xx = x + i;
      const yy = y + j;
      if (xx >= 0 && yy >= 0 && xx < w && yy < (arguments[2] !== undefined ? 9999 : 9999)) data[yy * w + xx] = v;
    }
  }
}

function makeCityGround(W, H) {
  const g = fill(W, H, 1);
  // outer walls
  stamp(g, W, 0, 0, W, 1, 3);
  stamp(g, W, 0, H - 1, W, 1, 3);
  stamp(g, W, 0, 0, 1, H, 3);
  stamp(g, W, W - 1, 0, 1, H, 3);
  // main cross road
  stamp(g, W, 1, Math.floor(H / 2) - 1, W - 2, 2, 2);
  stamp(g, W, Math.floor(W / 2) - 1, 1, 2, H - 2, 2);
  return g;
}

// --- GATE 20x14 ---
const GW = 20;
const GH = 14;
const gateGround = makeCityGround(GW, GH);
// west entry opening from road
stamp(gateGround, GW, 0, Math.floor(GH / 2) - 1, 1, 2, 2);
// east to plaza
stamp(gateGround, GW, GW - 1, Math.floor(GH / 2) - 1, 1, 2, 2);
// guard building footprint
stamp(gateGround, GW, 3, 2, 4, 3, 3);
// notice board clearing uses the shared tileset dirt id (5); id 4 is water.
stamp(gateGround, GW, 14, 3, 3, 2, 5);

/** @type {import('../../src/engine/world/zones/Zone.js').ZoneData} */
export const ZONE_BELLHAVEN_GATE = {
  id: 'bellhaven_gate',
  name: 'Gerbang Bellhaven',
  description: 'Pintu masuk kota — pos jaga dan papan pengumuman.',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'bellhaven_gate_map',
    width: GW,
    height: GH,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [{ name: 'ground', data: gateGround, collision: true, visible: true }],
  },
  spawnPoints: [
    { id: 'from_road', x: 32, y: 112 },
    { id: 'from_plaza', x: 288, y: 112 },
    { id: 'start', x: 32, y: 112 },
  ],
  connections: [
    {
      id: 'to_road',
      targetZoneId: 'road_bellhaven',
      targetSpawnId: 'near_gate',
      trigger: { x: 0, y: 96, w: 16, h: 40 },
      enabled: true,
      type: 'door',
    },
    {
      id: 'to_plaza',
      targetZoneId: 'bellhaven_plaza',
      targetSpawnId: 'from_gate',
      trigger: { x: 304, y: 96, w: 16, h: 40 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [],
  env: { biome: 'city', regionId: 'region_bellhaven', district: 'gate' },
};

// --- PLAZA 22x16 ---
const PW = 22;
const PH = 16;
const plazaGround = makeCityGround(PW, PH);
stamp(plazaGround, PW, 0, Math.floor(PH / 2) - 1, 1, 2, 2);
stamp(plazaGround, PW, PW - 1, Math.floor(PH / 2) - 1, 1, 2, 2);
stamp(plazaGround, PW, Math.floor(PW / 2) - 1, 0, 2, 1, 2);
stamp(plazaGround, PW, Math.floor(PW / 2) - 1, PH - 1, 2, 1, 2);
// fountain block (solid)
stamp(plazaGround, PW, 9, 6, 4, 4, 3);
// archive annex footprint north
stamp(plazaGround, PW, 15, 2, 5, 3, 3);

/** @type {import('../../src/engine/world/zones/Zone.js').ZoneData} */
export const ZONE_BELLHAVEN_PLAZA = {
  id: 'bellhaven_plaza',
  name: 'Alun-Alun Bellhaven',
  description: 'Pusat kota — air mancur, jalan ke pasar dan arsip.',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'bellhaven_plaza_map',
    width: PW,
    height: PH,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [{ name: 'ground', data: plazaGround, collision: true, visible: true }],
  },
  spawnPoints: [
    { id: 'from_gate', x: 32, y: 128 },
    { id: 'from_market', x: 320, y: 128 },
    { id: 'start', x: 160, y: 168 },
  ],
  connections: [
    {
      id: 'to_gate',
      targetZoneId: 'bellhaven_gate',
      targetSpawnId: 'from_plaza',
      trigger: { x: 0, y: 112, w: 16, h: 40 },
      enabled: true,
      type: 'door',
    },
    {
      id: 'to_market',
      targetZoneId: 'bellhaven_market',
      targetSpawnId: 'from_plaza',
      trigger: { x: 336, y: 112, w: 16, h: 40 },
      enabled: true,
      type: 'door',
    },
    {
      id: 'to_archive',
      targetZoneId: 'bellhaven_archive_hall',
      targetSpawnId: 'from_plaza',
      trigger: { x: 160, y: 0, w: 48, h: 16 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [],
  env: { biome: 'city', regionId: 'region_bellhaven', district: 'plaza' },
};

// --- MARKET 22x14 ---
const MW = 22;
const MH = 14;
const marketGround = makeCityGround(MW, MH);
stamp(marketGround, MW, 0, Math.floor(MH / 2) - 1, 1, 2, 2);
// Market stall footprints intentionally use tile id 4, rendered as stalls by ZoneArt.
stamp(marketGround, MW, 4, 2, 3, 2, 4);
stamp(marketGround, MW, 10, 2, 3, 2, 4);
stamp(marketGround, MW, 16, 2, 3, 2, 4);
stamp(marketGround, MW, 6, 10, 4, 2, 4);

/** @type {import('../../src/engine/world/zones/Zone.js').ZoneData} */
export const ZONE_BELLHAVEN_MARKET = {
  id: 'bellhaven_market',
  name: 'Pasar Bellhaven',
  description: 'Pasar utama — pedagang, gerobak, dan desas-desus harga.',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'bellhaven_market_map',
    width: MW,
    height: MH,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [{ name: 'ground', data: marketGround, collision: true, visible: true }],
  },
  spawnPoints: [
    { id: 'from_plaza', x: 32, y: 112 },
    { id: 'start', x: 160, y: 112 },
  ],
  connections: [
    {
      id: 'to_plaza',
      targetZoneId: 'bellhaven_plaza',
      targetSpawnId: 'from_market',
      trigger: { x: 0, y: 96, w: 16, h: 40 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [],
  env: { biome: 'city', regionId: 'region_bellhaven', district: 'market' },
};

export const BELLHAVEN_ZONES = [ZONE_BELLHAVEN_GATE, ZONE_BELLHAVEN_PLAZA, ZONE_BELLHAVEN_MARKET];
