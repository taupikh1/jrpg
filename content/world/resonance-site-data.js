/**
 * Ancient Resonance Site — Chapter 5
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

const W = 20;
const H = 16;
const g = fill(W, H, 1);
stamp(g, W, 0, 0, W, 1, 3);
stamp(g, W, 0, H - 1, W, 1, 3);
stamp(g, W, 0, 0, 1, H, 3);
stamp(g, W, W - 1, 0, 1, H, 3);
stamp(g, W, 1, Math.floor(H / 2) - 1, W - 2, 2, 2);
stamp(g, W, Math.floor(W / 2) - 1, 1, 2, H - 2, 2);
stamp(g, W, Math.floor(W / 2) - 1, H - 1, 2, 1, 2);
// pillars
stamp(g, W, 4, 3, 2, 2, 3);
stamp(g, W, 14, 3, 2, 2, 3);
stamp(g, W, 4, 11, 2, 2, 3);
stamp(g, W, 14, 11, 2, 2, 3);
// center instrument solid rim
stamp(g, W, 8, 6, 4, 1, 3);
stamp(g, W, 8, 9, 4, 1, 3);

export const ZONE_RESONANCE_SITE = {
  id: 'resonance_ancient_site',
  name: 'Situs Resonansi Kuno',
  description: 'Lingkaran pilar batu dan instrumen Resonance yang setengah terbangun.',
  tilesetId: 'demo_tiles',
  tilemap: {
    id: 'resonance_site_map',
    width: W,
    height: H,
    tileWidth: 16,
    tileHeight: 16,
    tilesetId: 'demo_tiles',
    layers: [{ name: 'ground', data: g, collision: true, visible: true }],
  },
  spawnPoints: [
    { id: 'from_road', x: 160, y: 224 },
    { id: 'start', x: 160, y: 128 },
  ],
  connections: [
    {
      id: 'to_road',
      targetZoneId: 'road_bellhaven',
      targetSpawnId: 'from_resonance',
      trigger: { x: 144, y: 240, w: 48, h: 16 },
      enabled: true,
      type: 'door',
    },
  ],
  objects: [],
  env: { biome: 'ruins', regionId: 'region_bellhaven', district: 'resonance' },
};

export const RESONANCE_ZONES = [ZONE_RESONANCE_SITE];
