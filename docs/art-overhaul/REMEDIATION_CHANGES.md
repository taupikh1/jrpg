# Remediation Changes (this pass)

## Added
- `assets/art-overhaul/enemies/` — 10 extracted monster sheets
- `content/art/enemy-visuals.js` — maps 9 existing Arc I enemy IDs to sheets
- `src/engine/assets/ExternalEnemySprites.js` — preload + draw bridge
- `docs/art-overhaul/VISUAL_COMPLETION_MATRIX.md`
- `docs/art-overhaul/REMAINING_WORK.md`

## Modified
- `src/scenes/GameplayDemoScene.js`  
  - Preloads external enemy visuals on init  
  - Battle draw uses external sprite when available, else procedural

## Not changed
- Enemy/boss stats, AI, phases, loot
- Story, quests, flags, runtime IDs, save format
- Zone collision and transitions

## License
All new sheets: LICENSE_UNVERIFIED, source PixelSRPG-Forge / monster.zip.
