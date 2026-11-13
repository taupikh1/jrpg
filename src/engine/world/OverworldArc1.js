/**
 * Minimal overworld marker data for Arc I (FF6).
 * Full map rendering is future work; this provides positions and labels.
 */
export const ARC1_OVERWORLD_NODES = Object.freeze([
  { id: 'village', label: 'Desa Awal', x: 80, y: 160, zone: 'village' },
  { id: 'forest', label: 'Hutan', x: 140, y: 120, zone: 'forest' },
  { id: 'road', label: 'Jalan Bellhaven', x: 200, y: 100, zone: 'road_bellhaven' },
  { id: 'bellhaven', label: 'Bellhaven', x: 240, y: 80, zone: 'bellhaven_gate' },
  { id: 'archive', label: 'Arsip', x: 220, y: 140, zone: 'bellhaven_archive_hall' },
  { id: 'resonance', label: 'Situs Resonansi', x: 180, y: 180, zone: 'resonance_ancient_site' },
]);

export function nearestNode(x, y) {
  let best = ARC1_OVERWORLD_NODES[0];
  let bestD = Infinity;
  for (const n of ARC1_OVERWORLD_NODES) {
    const d = (n.x - x) ** 2 + (n.y - y) ** 2;
    if (d < bestD) { bestD = d; best = n; }
  }
  return best;
}
