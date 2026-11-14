# Project Architecture Audit — Existing JRPG (Milestone 0)
**Baseline:** /workspace/jrpg-project (current narrative + gameplay state)

## Renderer
- HTML5 Canvas 2D via `platform/browser/CanvasSurface.js`.
- No Phaser/Three.js/Godot. Stays Canvas 2D.

## Current Visual System
- Primary art is **procedural pixel art** generated at runtime:
  - `src/engine/rendering/pixelart/PixelArt.js` (facade)
  - `CharacterArt.js`, `EnemyArt.js`, `PropArt.js`, `ZoneArt.js`, `IconArt.js`, `Backdrops.js`
  - Shared palette in `Palette.js`
- SpriteRenderer + TextureCache + AssetManager exist and can load external images.
- TilemapRenderer supports tileset images via imageKey.

## World / Exploration
- Zone-based. Playable zones for Arc I (village, forest, road_bellhaven, bellhaven_*, resonance_ancient_site).
- Collision and transitions already defined.
- Camera and adaptive landscape width exist (320 base, expands in landscape).

## Battle
- Turn-based with optional light ATB.
- Battle presentation uses procedural or simple stage drawing.
- Enemy/boss data is data-driven (content/enemies, content/bosses).

## UI
- Custom UiKit / window drawing. No external UI atlas currently dominant.

## Asset Loading
- AssetManager registers images into TextureCache.
- Supports injectable loader (good for tests).
- Current public assets are minimal (icons, some evidence PNGs).

## Tests
- Existing unit tests and validators. Must be preserved.

## Implications for Overhaul
- External pixel sheets can be integrated without engine change by:
  1. Extracting selected sheets.
  2. Adding them under a new assets/art-overhaul/ path.
  3. Registering via AssetManager.
  4. Teaching SpriteRenderer / character/enemy drawers to prefer sheet frames when available, fall back to procedural.
- TilemapRenderer already accepts tileset images — world migration is feasible.
- No need to migrate engines.
- Mobile (iPhone 13 landscape) constraints already considered in prior responsive work; new assets must respect same logical resolution and safe areas.
