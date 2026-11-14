/**
 * External enemy sprite bridge.
 * Loads registered enemy visuals and draws them in battle.
 * Falls back silently if asset missing.
 */
import { artRegistry } from './ArtAssetRegistry.js';
import { enemyVisualId, registerEnemyVisuals } from '../../../content/art/enemy-visuals.js';

const cache = new Map();
let ready = false;

export async function preloadEnemyVisuals() {
  registerEnemyVisuals();
  const enemies = artRegistry.list('enemy').filter((a) => a.enemyId);
  await Promise.all(enemies.map((a) => loadOne(a)));
  ready = true;
  return cache.size;
}

function loadOne(asset) {
  if (cache.has(asset.enemyId)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      cache.set(asset.enemyId, { img, asset });
      resolve();
    };
    img.onerror = () => resolve();
    img.src = asset.path;
  });
}

export function drawExternalEnemy(ctx, enemyId, x, y, opts = {}) {
  if (!ready) return false;
  const entry = cache.get(enemyId);
  if (!entry) return false;
  const anim = entry.asset.animation?.idle;
  if (!anim) return false;
  const t = (performance.now?.() ?? 0) / 1000;
  const frame = Math.floor(t / (anim.frameDuration || 0.12)) % anim.frameCount;
  const fw = anim.frameWidth;
  const fh = anim.frameHeight;
  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  const dx = opts.dx || 0;
  ctx.drawImage(entry.img, frame * fw, 0, fw, fh, x - fw / 2 + dx, y - fh, fw, fh);
  ctx.restore();
  return true;
}

export function externalEnemyCount() {
  return cache.size;
}
