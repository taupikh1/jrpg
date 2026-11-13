# Phase 3 — Pixel-Art UI & Responsive Layout

Status: **IMPLEMENTED. TESTS AND VALIDATORS PASS. BROWSER-VERIFIED IN CHROMIUM (EMULATED PHONE AND DESKTOP VIEWPORTS).**
Not verified on a physical iPhone or Android device. Not deployed. Not released. Phase 4 was not started.

## Phase 2 gate

Checked against the source and the test run before editing, not only the report.

- Phase 2 unit tests and validators pass (363 tests now, including all Phase 2 tests).
- Phase 2 browser flow (menu → New Game → touch movement → NPC dialogue → pause → save → return → Continue) was re-run for this phase in both orientations. Results below.
- Phase 2 leftovers that the Phase 3 request listed as blockers are resolved (see "Phase 2 leftovers").
- Gate result: **passed**. Phase 2 controls work as before; the leftovers were UI issues, not broken controls.

## Audit (before editing)

- HUD: status line `Zone · Gold · HP · MP · quest` was wider than 320 px, cut off at the right edge in portrait.
- Toasts: engine strings reached the player in English (`Loaded Save slot1 @ village`).
- Inventory and quest log had no touch entry point. Phase 2 only exposed them through the keyboard `I`/`Q`.
- Battle: command labels overflowed their cells, party HP/MP lines sat on the row edge, and the rows were too short for the text.
- Dialogue: hint said `[E] lanjut`, which means nothing to a touch player.
- Text drawing was ad hoc in `GameplayDemoScene`: no shared text fitting, no shared row/panel states.

## What changed

| File | Change |
|---|---|
| `src/engine/rendering/UiKit.js` | **New.** Shared palette, `drawPanel`, `drawRow` (selected / disabled / pressed states; label fitted to row width), `drawBar` (clamped), `fitText` (ellipsis by binary search on `measureText`), `drawFittedText`, `drawContinueIndicator` (blinking ▼), `drawSpeakerTag`. |
| `content/ui/player-text.js` | **New.** Display-only Indonesian text: battle log lines (`localizeBattleLog`), command labels, toast strings (`TOAST`), reason codes (`localizeReason`), interaction prompts, objective labels. Engine logs stay English (`Gameplay.test.js` asserts `Victory`). |
| `src/engine/gameplay/quests/QuestLog.js` | Read-only `listVisible()` (active then completed, with progress). No quest definition changed. |
| `src/scenes/GameplayDemoScene.js` | Rewrote render for HUD, dialogue, inventory, quest log, battle, pause, toasts using `UiKit`. HUD values draw in text colour (previously inherited the bar's black). Dialogue hint `AKSI / E: lanjut`. Battle party rows 26 px (was 22). Command grid uses 9 px font. Input/state logic for world, dialogue, battle, and pause unchanged. `BattleManager` not touched. |
| `src/scenes/MainMenuScene.js` | Uses `drawPanel` / `drawRow`. Removed a leftover footer panel that overlapped the New Game button (found in the portrait screenshot). The status message (e.g. `Belum ada permainan tersimpan.`) now has its own panel below the buttons. Menu options and save-check logic unchanged. |
| `src/core/Config.js`, `src/platform/browser/CanvasSurface.js` | Not changed in Phase 3 (logical 320×240 from Phase 2 kept). |
| `tests/unit/rendering/UiKit.test.js` | **New.** Fit, bar clamp, row states, label trimming, continue blink. |
| `tests/unit/ui/PlayerText.test.js` | **New.** Battle log translation, reason codes, toasts, prompts, objective labels. |
| `tests/unit/rendering/CanvasFit.test.js` | **New.** Phone portrait/landscape and desktop fit, centring, 4:3, nearest-neighbour. |
| `tests/unit/ui/ScreenLayout.test.js` | **New.** Draws each screen (world HUD, dialogue, inventory, quest, battle, pause, toast) into a recording context and asserts every text run is inside the 320×240 canvas. Also asserts battle command labels fit their cells. |
| `tests/unit/gameplay/MainMenuScene.test.js` | Stub context gained a `measureText` (needed by `fitText`). No assertion changed. |
| `package.json` | `npm test` also runs `tests/unit/ui/*.test.js`. |
| `CHANGELOG.md` | Phase 3 entry. |
| `docs/phase3/PHASE_3_REPORT.md`, `docs/phase3/screenshots/` | This report and browser screenshots. |

### Test expectations that changed

No assertion was weakened to make a test pass. Two expectation changes carried over from Phase 2 and are listed here so they are visible:

- `tests/unit/gameplay/PauseMenu.test.js`: indices updated for the 5-item pause menu (Phase 2 change).
- Save-failure wording changed to `Gagal menyimpan: …` (Phase 2 change, matched by a regex in the test).

Phase 3 failures during development were test bugs and were fixed in the tests, not by relaxing checks: a wrong rect index in `drawBar` test, an exact-match assertion on `drawRow` output that includes the `> ` marker, and the missing `measureText` stub in the menu test.

## Automated verification

Node v22, run in the project directory:

- `npm test`: **363 tests, 0 fail** (Phase 2: 330).
- `npm run check`: `OK: 383 berkas diperiksa, 167 modul ES (di luar legacy) dianalisis`.
- `npm run check:narrative`: `NARRATIVE VALIDATOR OK`.
- `npm run check:world`: `WORLD VALIDATOR OK`.

Limits of the layout tests: `ScreenLayout.test.js` uses a recording context with monospace width of 0.6 em per character. It catches overflow of the logical canvas and overflow of fixed-width cells, but real browser font metrics can differ slightly. The browser checks below cover the real metrics.

## Browser verification (Chromium, Playwright, real CDP touch events)

Setup: `python3 -m http.server 8765` in the project directory. Viewports: 390×664 portrait and 844×390 landscape, DPR 2, `hasTouch`, `isMobile`. Desktop 1280×720, DPR 1, no touch. Taps and holds were sent with `Input.dispatchTouchEvent`.

Scripted scene access: a few steps use `window.__JRPG__.scenes.current` to read state (mode, notice) and to start a battle directly (`_startBattle`). These are noted in the table.

| # | Check | Portrait 390×664 | Landscape 844×390 | Desktop 1280×720 |
|---|---|---|---|---|
| 1 | Main Menu at mobile viewport, touch overlay hidden | Pass after fix (footer panel overlapped New Game; removed) | Pass for menu state (no screenshot viewed) | — |
| 2 | Tap Permainan Baru starts session | Pass | Pass | Pass (keyboard Enter) |
| 3 | Opening dialogue, advance with touch AKSI to world | Pass | Pass | Pass (keyboard E) |
| 4 | HUD: status line not clipped, values readable | Pass. `Gold 20` and `25/25` inside the panel. | Pass | Pass |
| 5 | Dialogue: speaker tag, wrapped text, continue hint | Pass (hint text changed after the screenshot; see limits) | — | — |
| 6 | Pause from touch MENU | Pass | — | — |
| 7 | Catatan Quest opened by touch, MENU closes back to pause | Pass | — | — |
| 8 | Inventaris opened by touch, MENU closes back to pause | Pass | — | — |
| 9 | Resume by touch returns to world | Pass | — | — |
| 10 | Save Game, toast `Permainan tersimpan.` | Pass | Pass | — |
| 11 | Battle screen rendered and command menu drawn | Pass (started via `_startBattle`, not from a world encounter) | Pass (same) | — |
| 12 | Return to menu, Continue restores saved position exactly | Pass: saved (193.8, 112) equals restored | — | — |
| 13 | Console errors and page errors | None in any flow | None | None |
| 14 | Page scroll / overflow | None: scrollWidth/Height equal viewport | None | — |
| 15 | Touch overlay mounted on desktop | No (not mounted; `?touch=1` not used) | — | No |

The landscape battle and the desktop world were also checked visually. The desktop HUD check found the HUD values were dark on the dark band; this was fixed and the screenshot re-checked.

Evidence logs: `scratchpad/p3/evidence.json` (flow output), and screenshots in `docs/phase3/screenshots/`.

## Before / after

- Before (Phase 2, portrait, after Continue): `docs/phase3/screenshots/before-phase2-portrait-world.png`. HUD status line cut at the right edge.
- After (Phase 3, portrait, world): `after-portrait-world-hud.png`. Full status line visible.
- After (landscape world): `after-landscape-world-hud.png`.
- After (dialogue): `after-portrait-dialogue.png`.
- After (quest log, inventory): `after-portrait-quest-log.png`, `after-portrait-inventory.png`.
- After (battle): `after-portrait-battle.png`, `after-landscape-battle.png`. There is no Phase 2 battle screenshot to compare against: Phase 2 did not screenshot the battle.
- After (desktop): `after-desktop-1280x720-world.png`.
- After (Continue): `after-continue-restored.png`.

## Phase 2 leftovers

| Item | Status |
|---|---|
| HUD status line truncated on the right in portrait | **Fixed.** Verified in portrait, landscape, and desktop screenshots. |
| Toast text technical (`Loaded Save slot1 @ village`) | **Fixed for the strings in `TOAST` and the reason codes.** Save toast verified in the browser. The load toast was verified by unit test, not by a browser load. |
| Inventory and quest had no touch button | **Fixed.** Reachable from the pause menu by touch (Inventaris, Catatan Quest), closed by touch MENU. |

## Known defects and limitations

**Not verified:**
- Physical iPhone Safari and Android Chrome. All results are emulated Chromium with mobile viewports and CDP touch. Real devices can differ in safe-area handling, font metrics, touch latency and Safari gesture handling.
- GitHub Pages deployment and service worker behaviour.
- A full battle reached through the world on touch. The battle screen was started by script (`_startBattle`) and drawn. Command selection and targeting by touch were not played through.
- A load toast in the browser (Continue was verified; the load toast text was not captured).
- Dialogue hint `AKSI / E: lanjut` was changed after the screenshot used in the table; the new text was not re-inspected visually.
- Interior collision (building walls, NPC footprints) in the browser. Phase 2 limitation, unchanged.

**Limitations and visual issues still open:**
- The centred save/load toast sits over the battle log area and the battle panel borders. It is readable but covers the log while it shows.
- Pause, inventory, and quest panels are drawn at 96% alpha, so the map shows through faintly behind the text. Text contrast is still readable in the screenshots.
- Portrait keeps black bands above and below the 4:3 picture by design. Internal resolution 320×240 is unchanged.
- At fractional scale, some pixel edges look uneven (noted in Phase 2). Not changed.
- Landscape: on short screens the touch controls sit over the letterbox sides; checked at 844×390 only.
- Battle party rows are tight: the HP/MP line sits at the bottom edge of the highlight in landscape.
- Only Hero is in the party in the demo; a party with more than three members shows `+n lagi` and is untested.
- The debug HUD remains hidden unless `?debug=1`. Demo-coloured placeholder art and the village demo map are unchanged.

## Not changed (preservation)

Logical resolution 320×240, world coordinates, map and collision dimensions, camera logic, NPC positions, quest definitions, chapter progression, combat calculations, `BattleManager` state machine, enemy AI, save format (`SaveManager`, slot1), and all story text. No story dialogue was rewritten.

## Next

Phase 3 stops here. Phase 4 was not started. Physical-device testing is still needed before any mobile claim beyond emulation.
