# PRE-B15 — World Placement, iPhone Web App & Gameplay-First UI

**Authorized:** 2026-11-13 by project owner  
**Status:** Implementation and automated QA complete; physical iPhone review pending.  
**Next gate:** Owner reviews `PRE_B15_REPORT.md` and completes `PRE_B15_IPHONE_TEST_GUIDE.md`. B15 must not start automatically.

## Scope

1. Audit world NPC, interactable, and static prop placement in all 10 currently playable zones.
2. Correct confirmed overlap with house/building footprints, water, solid tiles, and walkable routes.
3. Improve iPhone Safari Add to Home Screen standalone PWA metadata and landscape-first behavior.
4. Keep touch controls aligned with the actual game canvas and respect safe areas.
5. Simplify the exploration HUD, world toast placement, and pause menu while preserving dedicated inventory/status/quest screens.
6. Preserve Android Chrome and desktop support.

## Files expected to change

- `content/world/demo-data.js`
- `content/world/bellhaven-data.js`
- `src/scenes/GameplayDemoScene.js`
- `src/platform/browser/BrowserViewport.js`
- `src/platform/browser/TouchControls.js`
- `src/main.js`
- `index.html`, `manifest.json`, `service-worker.js`
- `assets/icons/`
- Focused tests under `tests/unit/`
- `CHANGELOG.md`, `docs/00-project/DECISION_LOG.md`, and `docs/handover/`

## Documents inspected

- `docs/handover/HANDOVER_JRPG_ROADMAP_v2.md`
- `docs/00-project/DECISION_LOG.md`
- `docs/00-project/RISK_REGISTER.md`
- `docs/handover/PHASE_1_INTEGRATION_REPORT.md`
- `docs/INDEX.md`
- `README.md`, `CHANGELOG.md`, `package.json`
- World data, tilemap, collision, rendering, scene, viewport, touch, PWA, and UI implementations
- Existing world placement, reachability, viewport, touch, pause-menu, and UI tests

## Constraints and risks

- Do not migrate the renderer or change logical resolution D-009/D-022 in this batch.
- Current renderer remains 320x240 (4:3); landscape screens may show horizontal letterboxing.
- iOS Safari may ignore manifest orientation. The app must not rely on `screen.orientation.lock()`; show a rotate-device notice in portrait.
- Physical iPhone Safari and Android Chrome testing is owner-side and remains pending.
- Mounted objects on shelves, pillars, walls, and the fountain structure are intentional and must not be moved merely because their anchors overlap solid tiles.
