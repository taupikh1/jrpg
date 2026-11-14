/**
 * Prototype + migration seed registry.
 * Paths are relative to project root / served static root.
 */
import { artRegistry } from '../../src/engine/assets/ArtAssetRegistry.js';

const BASE = './assets/art-overhaul/prototype/';

export function registerPrototypeAssets() {
  const defs = [
    {
      id: 'hero_orin_idle',
      path: BASE + 'hero-idle.png',
      category: 'character',
      role: 'Orin stand-in',
      licenseStatus: 'LICENSE_UNVERIFIED',
      source: 'PixelSRPG-Forge / FarmLife.zip / base_idle_strip9.png',
      animation: {
        idle: { frameCount: 9, frameWidth: 96, frameHeight: 64, frameDuration: 0.15 },
      },
    },
    {
      id: 'hero_orin_walk',
      path: BASE + 'hero-walk.png',
      category: 'character',
      role: 'Orin stand-in walk',
      licenseStatus: 'LICENSE_UNVERIFIED',
      source: 'PixelSRPG-Forge / FarmLife.zip / base_walk_strip8.png',
      animation: {
        walk: { frameCount: 8, frameWidth: 96, frameHeight: 64, frameDuration: 0.1 },
      },
    },
    {
      id: 'npc_archive_scholar',
      path: BASE + 'chars-sandstone.png',
      category: 'npc',
      role: 'Archive scholar stand-in',
      licenseStatus: 'LICENSE_UNVERIFIED',
      source: 'PixelSRPG-Forge / Tiles-SandstoneDungeons / Characters-part-1.png',
      animation: {
        idle: { frameCount: 1, frameWidth: 32, frameHeight: 32, frameDuration: 0.2 },
      },
    },
    {
      id: 'enemy_rootbound_hare',
      path: BASE + 'bunny-idle.png',
      category: 'enemy',
      role: 'rootbound_hare visual',
      licenseStatus: 'LICENSE_UNVERIFIED',
      source: 'PixelSRPG-Forge / monster.zip / Bunny Idle',
      animation: {
        idle: { frameCount: 8, frameWidth: 34, frameHeight: 44, frameDuration: 0.12 },
      },
    },
    {
      id: 'enemy_rootbound_hare_run',
      path: BASE + 'bunny-run.png',
      category: 'enemy',
      licenseStatus: 'LICENSE_UNVERIFIED',
      source: 'PixelSRPG-Forge / monster.zip / Bunny Run',
      animation: {
        run: { frameCount: 12, frameWidth: 34, frameHeight: 44, frameDuration: 0.08 },
      },
    },
    {
      id: 'tileset_archive',
      path: BASE + 'tiles-sandstone.png',
      category: 'tileset',
      licenseStatus: 'LICENSE_UNVERIFIED',
      source: 'PixelSRPG-Forge / Tiles-SandstoneDungeons / Tiles-Door-packs.png',
      tileset: { tileWidth: 16, tileHeight: 16 },
    },
    {
      id: 'ui_window_accent',
      path: BASE + 'ui-green.png',
      category: 'ui',
      licenseStatus: 'LICENSE_UNVERIFIED',
      source: 'PixelSRPG-Forge / IconsPropsMonsters / Background/Green.png',
    },
  ];
  for (const d of defs) {
    if (!artRegistry.has(d.id)) artRegistry.register(d);
  }
  return artRegistry;
}
