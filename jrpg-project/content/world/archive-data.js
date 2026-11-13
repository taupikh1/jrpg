/**
 * Bellhaven Archive interior zones — Batch 8.4
 */

function fill(w, h, v) {
  return Array(w * h).fill(v);
}
function stamp(data, w, x, y, tw, th, v) {
  const h = Math.floor(data.length / w);
  for (let j = 0; j < th; j++) {
    for (let i = 0; i < tw; i++) {
      const xx = x + i;
      const yy = y + j;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h) data[yy * w + xx] = v;
    }
  }
}

function hallGround(W, H) {
  const g = fill(W, H, 1);
  stamp(g, W, 0, 0, W, 1, 3);
  stamp(g, W, 0, H - 1, W, 1, 3);
  stamp(g, W, 0, 0, 1, H, 3);
  stamp(g, W, W - 1, 0, 1, H, 3);
  // aisle
  stamp(g, W, 1, Math.floor(H / 2) - 1, W - 2, 2, 2);
  stamp(g, W, Math.floor(W / 2) - 1, 1, 2, H - 2, 2);
  // south exit opening to plaza
  stamp(g, W, Math.floor(W / 2) - 1, H - 1, 2, 1, 2);
  // north to stacks
  stamp(g, W, Math.floor(W / 2) - 1, 0, 2, 1, 2);
  // shelves blocks
  stamp(g, W, 3, 2, 3, 2, 3);
  stamp(g, W, W - 6, 2, 3, 2, 3);
  stamp(g, W, 3, H - 5, 3, 2, 3);
  stamp(g, W, W - 6, H - 5, 3, 2, 3);
  return g;
}

const HW = 22;
const HH = 16;
const hallG = hallGround(HW, HH);

export const ZONE_ARCHIVE_HALL = {
  id: 'bellhaven_archive_hall',
  name: 'Balai Arsip Bellhaven',
  description: 'Aula utama arsip — rak batu dan catatan tanpa nama.',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'archive_hall_map',
    width: HW,
    height: HH,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [{ name: 'ground', data: hallG, collision: true, visible: true }],
  },
  spawnPoints: [
    { id: 'from_plaza', x: 176, y: 224 },
    { id: 'from_stacks', x: 176, y: 32 },
    { id: 'start', x: 176, y: 128 },
  ],
  connections: [
    {
      id: 'to_plaza',
      targetZoneId: 'bellhaven_plaza',
      targetSpawnId: 'from_gate',
      trigger: { x: 160, y: 240, w: 48, h: 16 },
      enabled: true,
      type: 'door',
    },
    {
      id: 'to_stacks',
      targetZoneId: 'bellhaven_archive_stacks',
      targetSpawnId: 'from_hall',
      trigger: { x: 160, y: 0, w: 48, h: 16 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [],
  env: { biome: 'archive', regionId: 'region_bellhaven', district: 'archive' },
};

const SW = 20;
const SH = 14;
const stacksG = hallGround(SW, SH);
// west restricted opening (unlocked later via flag in scene — connection always present)
stamp(stacksG, SW, 0, Math.floor(SH / 2) - 1, 1, 2, 2);

export const ZONE_ARCHIVE_STACKS = {
  id: 'bellhaven_archive_stacks',
  name: 'Ruang Rak Tanpa Nama',
  description: 'Barisan rak tempat catatan bergerak dan tinta hilang.',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'archive_stacks_map',
    width: SW,
    height: SH,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [{ name: 'ground', data: stacksG, collision: true, visible: true }],
  },
  spawnPoints: [
    { id: 'from_hall', x: 160, y: 192 },
    { id: 'from_restricted', x: 32, y: 112 },
    { id: 'start', x: 160, y: 112 },
  ],
  connections: [
    {
      id: 'to_hall',
      targetZoneId: 'bellhaven_archive_hall',
      targetSpawnId: 'from_stacks',
      trigger: { x: 144, y: 208, w: 48, h: 16 },
      enabled: true,
      type: 'door',
    },
    {
      id: 'to_restricted',
      targetZoneId: 'bellhaven_archive_restricted',
      targetSpawnId: 'from_stacks',
      trigger: { x: 0, y: 96, w: 16, h: 40 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [],
  env: { biome: 'archive', regionId: 'region_bellhaven', district: 'archive' },
};

const RW = 16;
const RH = 12;
const restG = hallGround(RW, RH);
stamp(restG, RW, RW - 1, Math.floor(RH / 2) - 1, 1, 2, 2);

export const ZONE_ARCHIVE_RESTRICTED = {
  id: 'bellhaven_archive_restricted',
  name: 'Ruang Arsip Terlarang',
  description: 'Ruang kecil tanpa jendela — buku tanpa nama dan Resonansi.',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'archive_restricted_map',
    width: RW,
    height: RH,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [{ name: 'ground', data: restG, collision: true, visible: true }],
  },
  spawnPoints: [
    { id: 'from_stacks', x: 224, y: 96 },
    { id: 'start', x: 128, y: 96 },
  ],
  connections: [
    {
      id: 'to_stacks',
      targetZoneId: 'bellhaven_archive_stacks',
      targetSpawnId: 'from_restricted',
      trigger: { x: 240, y: 80, w: 16, h: 40 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [],
  env: { biome: 'archive', regionId: 'region_bellhaven', district: 'archive' },
};

export const ARCHIVE_ZONES = [ZONE_ARCHIVE_HALL, ZONE_ARCHIVE_STACKS, ZONE_ARCHIVE_RESTRICTED];
