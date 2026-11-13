# PRE-B15 — World Placement, iPhone Web App Landscape & Gameplay-First UI

**Date:** 2026-11-13  
**Status:** IMPLEMENTED; automated validation passed; physical-device review pending.  
**Gate:** Do not start B15 until the owner reviews this report and completes the iPhone test guide.

## 1. Baseline and provenance

- Authoritative input archive: `jrpg-project-phase1-integration_1.zip` (latest project archive found in the user's Library).
- Input size: 1,953,593 bytes.
- Input SHA-256: `eea164fd48ef54e93356649e58e004b0b11606075a8221beb97559c90a8ddb2c`.
- Input ZIP integrity: `unzip -t` passed; no corrupt entries.
- Runtime: Node.js v22.16.0; npm 10.9.2.
- Baseline snapshot before edits: `/mnt/data/jrpg-project-preb15-baseline.zip`.
- Baseline snapshot size: 1,953,593 bytes.
- Baseline snapshot SHA-256: `2043dafb30a4a8c4671fea149a27abb872740a87565d8035a72f31620b5f2257`.
- Baseline file checksum list: `docs/handover/PRE_B15_BASELINE_SHA.txt` (496 files).
- No `.git` directory was present. Final file changes are determined from the baseline checksum list.

## 2. What was inspected

- Latest HANDOVER v2, decision log, risk register, Phase 1 integration report, README, changelog, package scripts, and documentation index.
- All 10 currently playable zones: village, forest, road_bellhaven, bellhaven_gate, bellhaven_plaza, bellhaven_market, bellhaven_archive_hall, bellhaven_archive_stacks, bellhaven_archive_restricted, resonance_ancient_site.
- World tilemaps, tileset semantics, static collision props, runtime NPC/interactable spawn code, entity footprint semantics, collision, navigation, world rendering, and placement/reachability tests.
- Main menu, exploration HUD, toast, pause, dialogue, inventory, quest, status screens, touch controls, viewport sizing, PWA manifest, service worker, and app bootstrap.

## 3. Confirmed world placement defects and fixes

The audit found actual runtime footprints overlapping house/building tiles, water tiles, or the fountain structure. It also found one NPC pair visually overlapping. Fixes:

- Village: moved `npc_mira` out of the house footprint while keeping her near the guard/starting area; moved `resonance_fragment` onto walkable ground.
- Forest: moved `npc_elara` and `ch2_note_0` clear of the pond footprint.
- Bellhaven gate: moved `guest_page_0` off the guardhouse roof; corrected the notice-board clearing to use the shared tileset dirt ID 5 instead of water ID 4.
- Bellhaven plaza: moved `npc_ruli` and `npc_timm` clear of the fountain footprint. The fountain itself remains intentionally anchored to its pool structure.
- Ancient Resonance Site: moved `ch5_activate` from the solid upper rim onto nearby walkable floor.
- Village NPC layout: moved `npc_tori` to prevent its footprint overlapping `npc_nima`.
- Static props: moved the village well and Bellhaven broken cart off the main/side walking routes; updated the cart interaction anchor to match its visual prop.

Intentional mounted objects were retained and explicitly allowlisted in the placement test: fountain, archive shelf records/catalogue card, ancient pillar, and mural. These are designed to sit on their respective structures and are not treated as misplaced ground objects.

A key test defect was also corrected: previous NPC footprint tests treated spawn coordinates as top-left coordinates, while `Entity` and `_spawnNpc` use center coordinates. Tests now use the actual runtime footprint.

## 4. iPhone Safari Add to Home Screen / landscape implementation

- PWA manifest now declares `display: standalone` and `orientation: landscape`.
- Added iOS Add to Home Screen metadata, app title, status-bar configuration, viewport safe-area support, and a dedicated Apple touch icon.
- Added 192px and 512px app icons; service-worker shell cache bumped to v12 and includes all icons.
- Browser viewport now responds to `visualViewport` resize as well as window resize/orientation changes.
- Touch controls align to the fitted game canvas rather than the full device viewport, scale with viewport height, and account for safe-area insets.
- In portrait on touch devices, a compact Bahasa Indonesia rotate-device notice appears and gameplay touch controls are hidden until landscape returns.
- No reliance on `screen.orientation.lock()` was added because iOS Safari does not guarantee that API for this use.

## 5. Gameplay-first UI changes

- Exploration HUD height reduced from 36 to 32 logical pixels while retaining location, level/gold, HP/MP, and active quest summary.
- World-mode toasts moved below the HUD rather than appearing in the center of the playfield.
- Pause panel reduced from 240x204 to 200x196 logical pixels; the background dim overlay was reduced so more of the game world remains visible.
- Touch controls are compact, viewport-scaled, and bounded to the actual canvas.
- Main menu was already limited to the two real actions (Continue/New Game), so it was retained rather than redesigned without evidence.
- Inventory, status, and quest remain dedicated panels shown only when opened; dialogue remains a lower-screen reading panel. These are intentional focused screens, not persistent HUD clutter.

## 6. Files changed

The baseline comparison found **19 modified files, 10 new files, and 0 deleted files**.

### Modified

- `CHANGELOG.md`
- `content/world/bellhaven-data.js`
- `content/world/demo-data.js`
- `docs/00-project/DECISION_LOG.md`
- `docs/INDEX.md`
- `docs/handover/HANDOVER_JRPG_ROADMAP_v2.md`
- `docs/handover/PHASE_1_INTEGRATION_REPORT.md`
- `index.html`
- `manifest.json`
- `service-worker.js`
- `src/main.js`
- `src/platform/browser/BrowserViewport.js`
- `src/platform/browser/TouchControls.js`
- `src/scenes/GameplayDemoScene.js`
- `tests/unit/gameplay/CollectibleInteraction.test.js`
- `tests/unit/input/TouchControls.test.js`
- `tests/unit/world/NpcFootprint.test.js`
- `tests/unit/world/ObjectReachability.test.js`
- `tests/unit/world/PlazaNpcPlacement.test.js`

### New

- `assets/icons/apple-touch-icon.png`
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `docs/handover/PRE_B15_BASELINE_SHA.txt`
- `docs/handover/PRE_B15_IPHONE_TEST_GUIDE.md`
- `docs/handover/PRE_B15_PLAN.md`
- `tests/unit/BrowserViewport.test.js`
- `tests/unit/PwaExperience.test.js`
- `tests/unit/world/WorldPlacement.test.js`
- `docs/handover/PRE_B15_REPORT.md`

No package or dependency changes were made. No save schema or runtime character IDs were changed.

## 7. Tests and validators

Executed in the project directory:

- `npm test` — **583/583 passed**, 0 failed.
- `npm run check` — **OK**; 506 project files inspected and 209 ES modules analyzed.
- `npm run check:world` — **WORLD VALIDATOR OK**; 12 regions and 10 playable zones.
- `npm run check:narrative` — **NARRATIVE VALIDATOR OK**.
- Static HTTP smoke check — HTTP 200 for `/`, `manifest.json`, all three PNG icons, and `service-worker.js`.
- `unzip -t` — passed for the input archive and the baseline snapshot. Final delivery ZIP is separately verified at packaging time.

New automated coverage includes a runtime placement sweep across all 10 zones, NPC footprint and NPC-to-NPC overlap checks, static collision prop grounding, intentional mounted-object allowlists, PWA metadata/icon checks, visual viewport resize behavior, and touch overlay canvas alignment.

## 8. Verification status

| Item | Status | Evidence / limitation |
|---|---|---|
| Source placement data and runtime spawn footprints | TEST VERIFIED | 10-zone runtime placement sweep passes |
| Static props on non-solid ground | TEST VERIFIED | 10-zone static prop sweep passes |
| Interactable reachability regression cases | TEST VERIFIED | ObjectReachability tests pass |
| PWA manifest, iOS metadata, icons, service-worker shell | TEST VERIFIED | PwaExperience tests and project validator pass |
| VisualViewport and touch overlay alignment logic | TEST VERIFIED | Unit tests pass |
| Main menu/pause/HUD layout logic | TEST VERIFIED | Existing and updated UI tests pass; source layout inspected |
| Browser visual rendering | NOT TESTED | Chromium binary exists, but headless startup timed out in this container; no screenshot/browser runtime evidence was produced |
| Physical iPhone Safari Add to Home Screen | NOT TESTED | Must be run by owner using the included iPhone test guide |
| Physical Android Chrome | NOT TESTED | Must be run on device |
| 3D height/roof mesh placement | NOT APPLICABLE TO CURRENT RUNTIME | Current playable renderer/world is tile-based 2D; no 3D world meshes or height-field system are active. This batch did not migrate the renderer |

## 9. Important remaining limitation

The current logical canvas remains **320x240 (4:3)**. The app shell, orientation hint, viewport sizing, and touch controls are landscape-first, but the actual 4:3 game canvas will letterbox on the left and right on a wide iPhone landscape viewport. This was intentionally not changed: D-022's responsive rendering architecture is not implemented, and changing the logical resolution would affect fixed-coordinate scene/UI layouts. A true widescreen gameplay viewport requires a separate, measured responsive-rendering task and owner review.

The iOS manifest orientation is a hint, not a guarantee. In portrait, the app shows a rotate-device notice rather than claiming it can force rotation.

## 10. Next step

1. Owner downloads the ZIP and deploys it over HTTPS.
2. Owner completes `PRE_B15_IPHONE_TEST_GUIDE.md` on the actual iPhone.
3. Review any screenshots/defects and apply a bounded correction batch if needed.
4. Only after owner review may B15 begin. Character Bible approval remains a separate mandatory B15 gate.

**B15 has not started.**

> The final ZIP's exact size, SHA-256, and extraction result are provided with the delivery message to avoid embedding a self-referential archive hash inside the archive itself.
