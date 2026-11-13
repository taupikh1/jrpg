// B10 evidence: static reachability check for bh_fountain (B1) and npc_timm (B2).
// Uses the real ZoneManager + NavGrid + Pathfinder. Run from repo root: node docs/qa/evidence/batch-10/check_bh_fountain.mjs
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const u = (p) => pathToFileURL(resolve(ROOT, p)).href;
const { ZoneManager } = await import(u('src/engine/world/zones/ZoneManager.js'));
const { NavGrid } = await import(u('src/engine/world/navigation/NavGrid.js'));
const { findPath } = await import(u('src/engine/world/navigation/Pathfinder.js'));
const { DEMO_TILESET } = await import(u('content/world/demo-data.js'));
const bell = await import(u('content/world/bellhaven-data.js'));
const zm = new ZoneManager();
zm.registerTileset(DEMO_TILESET);
for (const k of Object.keys(bell)) if (k.startsWith('ZONE_')) zm.registerZone(bell[k]);
const z = zm.activate('bellhaven_plaza', 'start');
const grid = NavGrid.fromTilemap(z.tilemap);
const sp = z.spawnPoints?.find?.((s) => s.id === 'start') ?? { x: 16, y: 16 };
const s0 = [Math.floor(sp.x / 16), Math.floor(sp.y / 16)];
const tile = (px, py) => [Math.floor(px / 16), Math.floor(py / 16)];
const reach = (t) => !!findPath(grid, s0[0], s0[1], t[0], t[1]);

const [ftx, fty] = tile(176, 120);
console.log('B1 bh_fountain object at (176,120) -> tile', ftx, fty, 'walkable', grid.isWalkable(ftx, fty));
const nbs = [[ftx + 1, fty], [ftx - 1, fty], [ftx, fty + 1], [ftx, fty - 1]];
let anyNbWalkable = false;
for (const t of nbs) { const w = grid.isWalkable(t[0], t[1]); anyNbWalkable ||= w; console.log('  neighbor', t, 'walkable', w, 'reachable from start', reach(t)); }
// Interaction range is 28 px (InteractionComponent default). Find any walkable tile centre within 28 px of object centre.
const cx = 176 + 8, cy = 120 + 8;
let nearest = Infinity;
for (let tx = 0; tx < z.tilemap.width; tx++) for (let ty = 0; ty < z.tilemap.height; ty++) {
  if (!grid.isWalkable(tx, ty)) continue;
  const d = Math.hypot(tx * 16 + 8 - cx, ty * 16 + 8 - cy);
  if (d < nearest) nearest = d;
}
console.log('  nearest walkable tile centre to object centre (px):', nearest.toFixed(1), '| interaction range 28 px');
console.log('B1 RESULT:', (!anyNbWalkable && nearest > 28) ? 'UNREACHABLE (interaction impossible)' : 'REACHABLE');

const [ntx, nty] = tile(160, 164);
console.log('B2 npc_timm at (160,164) -> tile', ntx, nty, 'walkable', grid.isWalkable(ntx, nty), 'reachable', reach([ntx, nty]));
console.log('B2 RESULT:', grid.isWalkable(ntx, nty) && reach([ntx, nty]) ? 'FIXED (static)' : 'STILL DEFECT');
