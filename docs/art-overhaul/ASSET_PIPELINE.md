# Asset Pipeline (Milestone 2)

## Components
- `src/engine/assets/ArtAssetRegistry.js` — data-driven registry (id, path, category, license, source, animation/tileset metadata).
- `content/art/prototype-registry.js` — concrete registrations for current prototype assets.
- Existing `AnimationClip` + `Animator` used for frame playback.
- Existing `AssetManager` / `TextureCache` remain the load path for production content.

## Flow
1. Register asset definition (metadata only).
2. Load image via path (AssetManager or Image).
3. Query `framesFor(id, state)` to get clip data.
4. Play with Animator.
5. On missing id, `missingReport()` returns diagnostics.

## Rules
- No hardcoded frame coordinates in gameplay logic when registry metadata exists.
- License status stored per asset.
- Fallback: if image fails to load, scene draws colored rect.
