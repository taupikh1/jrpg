/**
 * Enemy visual mappings (external sheets).
 * IDs match content/enemies. Gameplay unchanged.
 */
import { artRegistry } from '../../src/engine/assets/ArtAssetRegistry.js';

const BASE = './assets/art-overhaul/enemies/';

const ENEMY_VISUALS = [
  { id: 'thorn_sprite', file: 'plant.png', fw: 44, fh: 42, frames: 11, note: 'plant sheet' },
  { id: 'mossback_tortoise', file: 'turtle.png', fw: 44, fh: 26, frames: 14, note: 'turtle sheet' },
  { id: 'whisper_moth', file: 'bat.png', fw: 46, fh: 30, frames: 12, note: 'bat sheet' },
  { id: 'rootbound_hare', file: 'hare.png', fw: 34, fh: 44, frames: 8, note: 'bunny sheet' },
  { id: 'echo_wisp', file: 'ghost.png', fw: 44, fh: 30, frames: 10, note: 'ghost sheet' },
  { id: 'briar_stalker', file: 'mushroom.png', fw: 32, fh: 32, frames: 14, note: 'mushroom sheet' },
  { id: 'riverglass_eel', file: 'slime.png', fw: 44, fh: 30, frames: 10, note: 'slime sheet' },
  { id: 'archive_sentinel', file: 'rino.png', fw: 52, fh: 34, frames: 11, note: 'rino sheet' },
  { id: 'stillness_hollow', file: 'snail.png', fw: 38, fh: 24, frames: 15, note: 'snail sheet' },
  { id: 'chicken_scout', file: 'chicken.png', fw: 32, fh: 34, frames: 13, note: 'optional extra' },
];

export function registerEnemyVisuals() {
  for (const e of ENEMY_VISUALS) {
    const assetId = `enemy_vis_${e.id}`;
    if (artRegistry.has(assetId)) continue;
    artRegistry.register({
      id: assetId,
      path: BASE + e.file,
      category: 'enemy',
      enemyId: e.id,
      licenseStatus: 'LICENSE_UNVERIFIED',
      source: `PixelSRPG-Forge / monster.zip / ${e.note}`,
      animation: {
        idle: { frameCount: e.frames, frameWidth: e.fw, frameHeight: e.fh, frameDuration: 0.12 },
      },
    });
  }
  return artRegistry;
}

export function enemyVisualId(enemyId) {
  return `enemy_vis_${enemyId}`;
}
