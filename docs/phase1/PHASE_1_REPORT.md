# Phase 1 — Baseline Audit, Demo Exit & Playable Game Foundation

Status: **PARTIAL — startup integration implemented; mobile and full-game browser QA not done.**
Not released. Do not present as a playable release.

## What changed in this phase

| File | Change |
|---|---|
| `src/scenes/MainMenuScene.js` | New. Player-facing main menu with **Lanjutkan** (Continue) and **Permainan Baru** (New Game). Keyboard and tap. Settings and Credits are not shown (no functionality yet). |
| `src/main.js` | Startup now switches to `main-menu` instead of `gameplay-demo`. Developer HUD only with `?debug=1`. |
| `src/scenes/GameplayDemoScene.js` | `init` accepts `startMode` (`new` or `continue`). Continue skips the Chapter 1 opening and loads `slot1` on the first update. Demo labels, controls and perf stats are drawn only when `debugHud` is on. |
| `src/engine/input/Input.js` | Records every pointer-down per frame (`pointerDownsThisFrame()`), so taps shorter than one frame are no longer lost. |
| `tests/unit/gameplay/MainMenuScene.test.js` | 9 tests: no save, valid save, corrupted save, New Game mode, wrap-around navigation, tap, single-consumption of a tap, miss, render labels. |
| `tests/unit/gameplay/ContinueStartup.test.js` | 3 tests: New Game opens Chapter 1, Continue skips the opening, debug HUD is off by default. |
| `docs/phase1/PHASE_1_REPORT.md` | This report. |

Existing gameplay systems were not rebuilt. BattleManager, DamageCalculator, DialogueEngine, QuestLog, SaveManager, ZoneManager, story content and map data are untouched.

## A. Architecture map (as traced in the code)

1. `index.html` loads `src/main.js` as a module. Service worker and manifest are registered from `main.js`.
2. `main.js` builds the composition root: `CanvasSurface` (480×270 logical), `Input` (keyboard + pointer), `Game`, `SceneManager`, `SaveAdapter` (IndexedDB, or memory fallback).
3. `Game.start()` applies the viewport fit, then starts the loop. `SceneManager.switchTo()` runs `init` once, then `enter`.
4. Before this phase the first scene was `GameplayDemoScene`. It contains the full gameplay (zones, NPCs, dialogue, quests, battle, save/load). It is now reached through the menu.
5. Content (`content/`) is loaded by `GameplayDemoScene.init()`: Chapter 1–5 dialogue, party banter, quests, zones (village, forest, road to Bellhaven, Bellhaven, archive, resonance site), items, enemies.

## B. Feature status matrix

| Area | Status | Notes |
|---|---|---|
| Main menu | IMPLEMENTED (minimal) | Two real options. Settings and Credits absent on purpose. |
| New Game | IMPLEMENTED | Starts in `new` mode, plays Chapter 1 opening. Browser-verified. |
| Continue | IMPLEMENTED (minimal) | Only enabled when `slot1` loads and validates. Corrupted save shows a message and does not start a new game. Browser-verified after a save and reload. |
| Return to menu from gameplay | MISSING | Menu is only shown at startup. |
| World exploration | IMPLEMENTED | Village zone rendered and playable in browser (screenshot). Full Chapter 1→5 path NOT VERIFIED in browser. |
| Player movement | NOT VERIFIED | Only the menu and the world render were exercised in the browser. Touch d-pad is MISSING. |
| NPC interaction | NOT VERIFIED in browser | Covered by existing unit tests. |
| Pixel-art rendering | PARTIALLY IMPLEMENTED | Nearest-neighbour is set, but phone scaling is fractional (see defect D2). Most art is placeholder colour blocks. |
| Turn-based battle | NOT VERIFIED in browser | Existing code path, not exercised here. |
| Enemy AI | NOT VERIFIED | — |
| Skills and items | NOT VERIFIED | — |
| Dialogue | IMPLEMENTED | Opening dialogue advanced to world mode in browser. |
| Quests | NOT VERIFIED in browser | Unit tests only. |
| Chapter 1–5 progression | NOT VERIFIED in browser | Source and unit coverage exist; natural playthrough not done. |
| Inventory and equipment | NOT VERIFIED in browser | — |
| Save (F5) | IMPLEMENTED (keyboard only) | No touch save control yet. |
| Load / Continue | IMPLEMENTED | See Continue. Browser-verified. |
| Mobile controls | MISSING | No on-screen d-pad or action buttons. Tap works only on menu buttons. |
| Mobile layout | PARTIALLY IMPLEMENTED | Fits the phone width; text is small (see D2). Landscape NOT VERIFIED. |
| GitHub Pages deployment | NOT VERIFIED | Not deployed or checked from this session. |
| Service worker | NOT VERIFIED | Registered in code; caching behaviour not tested. |

## C. Demo exit findings

- **Why the game started in the demo:** `main.js` called `switchTo('gameplay-demo')` at boot. This is fixed.
- **Reusable as-is:** all gameplay logic in `GameplayDemoScene` (zones, NPCs, dialogue chains, quest hooks, battle, save/load).
- **Demo-only, now hidden by default:** the `Gameplay Demo · E talk · …` header, the controls line, `fps~ ents= F5 save F9 load`. They show only with `?debug=1`.
- **Still demo-facing (not yet removed):** the coloured-square placeholder art, the village demo map from `demo-data.js`, and the toast `Loaded Save slot1 @ village` (wording is technical).
- **Connection to the production flow:** menu → `switchTo('gameplay-demo', { startMode })`. The menu does not own any gameplay state.

## D. Confirmed defects

**D1 — Quick taps were lost (FIXED).**
- File: `src/engine/input/Input.js`, `_onEvent`. `pointerup` removes the pointer, so a tap released within one frame never reached the scene.
- Observed: in Chromium, the New Game tap did nothing.
- Impact: any touch scene relying on edge detection missed fast taps. Mobile players would see buttons that often do nothing.
- Fix: `pointerDownsThisFrame()` records each pointer-down until `endFrame()`.

**D2 — Phone scaling is fractional and small (CONFIRMED, NOT FIXED).**
- File: `src/platform/browser/CanvasSurface.js`, `fitTo()`.
- Observed (browser screenshot, 390 px wide): canvas drawn at ~0.81 CSS px per logical px, 390×219 css px. The village map (20×14 tiles of 16 px = 320×224 logical) fills only part of the canvas, leaving dark bands at right and bottom. HUD text is about 7 css px.
- Impact: small, slightly soft text on phones. Integer scaling is impossible at this width.
- Smallest safe correction: larger HUD font, or a portrait-friendly logical size. Not changed in Phase 1 because it touches visuals (Phase 3) and camera framing.

**D3 — Demo labels visible to players (FIXED).**
- File: `src/scenes/GameplayDemoScene.js`, `_drawUI`.
- Fix: debug-only through `?debug=1`.

**D4 — Suspected, not verified:** Continue loads through `_doLoad()`, which on failure shows a toast and keeps a fresh world. The menu pre-checks the save, so this path should be rare, but it is not proven impossible (for example, if the save changes between menu and load).

## E. Pixel-art integration strategy (for Phase 3)

- Keep `Config.LOGICAL_WIDTH/HEIGHT` and tile sizes. Do not change map dimensions or collision.
- Replace `buildDemoTextures()` and the `fillRect` fallback in `SpriteComponent` with real atlases, keyed by existing entity ids.
- Keep nearest-neighbour (`image-rendering: pixelated`, `imageSmoothingEnabled = false`), which are already set.
- Decide the phone layout first (D2): either a portrait logical size or a landscape-lock hint. This affects every HUD and dialogue box.

## F. Seven-phase dependency map

- Phase 2 (menu) depends on Phase 1 `startMode` and on `SaveManager`. Settings and Credits need their own functionality first.
- Phase 3 depends on D2 (layout decision) and on the existing `SpriteComponent` fallback.
- Phase 4 depends on removing the debug HUD fully and on touch controls (currently missing).
- Phase 5 depends on browser playthrough of Chapter 1→5 (not done).
- Phase 6 depends on a touch save control and on return-to-menu.
- Phase 7 depends on all of the above plus a real device.

## G. Phase 2 specification (what remains)

1. Return to menu from gameplay (a menu action that calls `GameplayDemoScene`'s exit and re-enter; or a fresh gameplay scene instance). Currently not possible without reloading the page.
2. Continue: show the save's display name and last-saved time (from `SaveManager.list()`).
3. Surface a "save failed" and "load failed" state visibly in the menu, not only as a toast.
4. Settings and Credits: only once they do something real.
5. Browser test: New Game → Chapter 1 opening → save → reload → Continue → same position and inventory.

## H. QA baseline (what was actually run)

Commands run in the extracted project (Node v22.23.4):

- `npm test`: **303 tests, 81 suites, 303 pass, 0 fail, 0 skipped.** (Before this phase: 291 tests, 79 suites, all passing.)
- `npm run check`: `OK: 372 berkas diperiksa, 158 modul ES dianalisis` (before: 369 files, 155 modules).
- `npm run check:narrative`: `NARRATIVE VALIDATOR OK`.
- `npm run check:world`: `WORLD VALIDATOR OK`, 12 regions.

Browser tests (Chromium via Playwright, local `python3 -m http.server`, 390×664 viewport, DPR 2, touch):

- Boot: loads to `main-menu`, no console or page errors.
- Menu render: correct layout, Continue disabled when no save.
- New Game by tap: switches to `gameplay-demo`, Chapter 1 opening appears; advancing with Enter reaches `world` mode.
- Save (F5), reload, Continue by tap: enters `gameplay-demo` in `world` mode with no opening; HUD shows no demo labels; save loaded (`Loaded Save slot1 @ village`).
- No console or page errors across the flow.

Not done:

- Physical iPhone or Android device. Mobile results are emulation only.
- Touch movement, NPC interaction, battle, inventory, quests, and Chapter 1→5 playthrough in the browser.
- Landscape rotation.
- GitHub Pages deployment and service worker offline behaviour.
- Corrupted-save path in the browser (covered by unit test only).

## I. Changed files and branch

- Branch: **not created.** The uploaded project is a ZIP with no `.git` directory, so no feature branch or commit SHA exists. Create `phase-1-startup` from `main` before merging these changes.
- Changed and new files: see the table in "What changed in this phase".
- No commit made.
