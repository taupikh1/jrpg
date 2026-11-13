# Phase 2 — Mobile Gameplay Foundation & In-Game Navigation

Status: **IMPLEMENTED AND VERIFIED IN CHROMIUM (EMULATED PHONE VIEWPORTS).**
Not verified on a physical iPhone or Android device. Not deployed to GitHub Pages. Not released.

## Audit of Phase 1 (before editing)

Read `docs/phase1/PHASE_1_REPORT.md` and the source. Discrepancies found:

- Phase 1 defect **D2** (phone scaling, small text) was listed as "not fixed". It is fixed in this phase (see "Scale").
- Phase 1 said "pointer input reliability improved". That was true for taps (`Input.pointerDownsThisFrame()`). The touch overlay did not exist yet.
- Phase 1 kept one `GameplayDemoScene` instance for the whole page. Returning to the menu and starting again would reuse stale state. This phase creates a fresh gameplay scene for each session.
- Pause and in-game menu did not exist. Pressing Escape in the world did nothing.

## What changed

| File | Change |
|---|---|
| `src/platform/browser/TouchControls.js` | **New.** On-screen D-pad, AKSI (action) and MENU buttons. Implements `InputSourcePort`, emitting the same key codes as the keyboard (`ArrowUp`…`ArrowRight`, `KeyE`, `KeyP`). Pointer capture, per-pointer tracking, release on cancel / lost capture / blur / tab hidden. |
| `src/engine/input/Input.js` (Phase 1) | Unchanged in this phase. Touch uses the existing `Input` path. |
| `src/scenes/GameplayDemoScene.js` | Pause menu (Lanjutkan, Simpan Permainan, Kembali ke Menu Utama) with a confirmation step. Escape or MENU opens it in free exploration only. Save reports success only when `SaveManager.save()` returns `ok`. Menu button shows a message during dialogue and other non-world modes. `onReturnToMenu` hook. |
| `src/scenes/MainMenuScene.js` | Calls `onStartGame(startMode)` supplied by the composition root, instead of switching scenes directly. |
| `src/main.js` | Composition root. Adds touch input source. Creates a fresh `GameplayDemoScene` for each session. Return-to-menu destroys the session scene. Touch overlay shown only in gameplay and only on touch devices (or `?touch=1`). |
| `src/platform/browser/CanvasSurface.js` | Fractional fit on phones (see "Scale"). |
| `src/core/Config.js` | Logical size 480×270 → **320×240** (4:3). |
| `index.html` | Styles for touch controls. Safe-area insets. Landscape size rule. 44px minimum. |
| `package.json` | `npm test` now also runs `tests/unit/input/*.test.js`. |
| `tests/unit/input/TouchControls.test.js` | **New.** 14 tests. |
| `tests/unit/gameplay/PauseMenu.test.js` | **New.** 12 tests. |
| `tests/unit/gameplay/MainMenuScene.test.js` | Updated for the `onStartGame` callback. |
| `tests/unit/Viewport.test.js`, `tests/unit/rendering/DialogueTextFit.test.js` | Updated expected logical size (320×240). |
| `docs/phase2/PHASE_2_REPORT.md` | This report. |

## Scale (requested with Phase 2)

- Before: logical 480×270 on a 390px-wide phone = 0.81× scale. Text was about 7 CSS px. Map and HUD were hard to read.
- Now: logical 320×240 on the same phone = 1.22× scale. Text is about 11 CSS px.
- `CanvasSurface.fitTo()`: integer scaling is kept when it is 2× or larger (desktop). Otherwise the scale is fractional, so the picture is as large as the screen allows. Pixels are nearest-neighbour, but at non-integer scales some pixel edges can look uneven.
- Checked against layouts: village map (320×224) fits without scrolling. Dialogue, pause menu, and battle layout still fit (the battle screen was not screenshot-checked; see limitations).

## Touch controls

- D-pad: up, down, left, right, held for continuous movement. Diagonal works through the same movement path as the keyboard (two codes held at once).
- AKSI (action): emits `KeyE`. Talks to NPCs and uses the existing `InteractionSystem`. No bypass of range or collision.
- MENU: emits `KeyP`. Opens pause in free exploration.
- Multi-touch: each pointer id is tracked. A direction stays held while any finger holds it. Lifting one finger does not stop the other.
- Interruptions: `pointercancel`, `lostpointercapture`, window `blur`, and `visibilitychange` (hidden) release every held code. Verified with a real CDP `touchCancel`.
- Hiding the overlay (menus) releases every held code.
- Pinch-zoom (`gesturestart`) is blocked on touch devices, where the overlay is mounted.
- Sizes: D-pad 52 px (portrait) and 46 px (landscape), AKSI 76 / 64 px, MENU 64×44 px. Minimum 44 px.
- Safe areas: `env(safe-area-inset-*)` on each control.

## Pause menu and navigation

- Opened by MENU (touch), `P`, or `Escape` (keyboard), in free exploration only.
- Resume: closes the menu. Player position, zone, stats, and quests are not reset (verified in browser and unit test).
- Save Game: reuses `SaveManager` and the `slot1` format. Message is "Permainan tersimpan." only after a successful save. Failure shows "Gagal menyimpan (reason)."
- Return to Main Menu: asks first ("Ya, kembali ke menu" / "Batal"; Batal is the default). Does not save automatically, so unsaved progress is lost on confirm. The confirm text says this.
- After returning, the main menu checks the save again. Continue loads `slot1` into a fresh gameplay scene.
- When the menu is pressed during dialogue, battle, or inventory, a message is shown instead of nothing.

## Automated verification

Commands run in the project, Node v22.23.4:

- `npm test`: **330 tests, 88 suites, 330 pass, 0 fail, 0 skipped.** (Phase 1: 303.)
- `npm run check`: `OK: 376 berkas diperiksa, 161 modul ES (di luar legacy) dianalisis`
- `npm run check:narrative`: `NARRATIVE VALIDATOR OK`
- `npm run check:world`: `WORLD VALIDATOR OK`, 12 regions, 10 playable zones.

Tests added in this phase cover: D-pad directions, press and release, pointer cancellation, multiple simultaneous pointers, no stuck input after `releaseAll`/`release`, action button integration with `Input.justPressed`, MENU/Escape opening pause, Resume state preservation, save success and failure, return-to-menu confirmation, single return call, and Continue restoring a saved position in a fresh session.

## Browser verification (Chromium, Playwright, real CDP touch events)

Setup: `python3 -m http.server` on localhost. Viewports: 390×664 portrait, 844×390 landscape, DPR 2, `hasTouch`, `isMobile`. Touch sent with `Input.dispatchTouchEvent` (real touch pointers), and `page.touchscreen.tap` for taps.

Results, identical in both orientations:

| # | Requirement | Result |
|---|---|---|
| 1 | Main Menu → New Game | Pass. Tap on Permainan Baru starts session. Opening dialogue shown. Advanced with AKSI to world mode. |
| 2 | Touch movement, four directions | Pass. Each direction moves 49 px in 700 ms and stops within 250 ms of release (stable over the following 400 ms). |
| 3 | Collision | Partial. Held toward the top-left map corner: position stays at (22.3, 22.2) while held. This tests the map boundary. **Collision against an interior building or NPC footprint was not browser-tested.** Unit tests cover collision data. |
| 4 | NPC interaction with AKSI | Pass. Player placed beside `npc_guard` (position set by script, see limitation). AKSI opened "Penjaga Desa" dialogue. |
| 5 | Pause and Resume | Pass. MENU opens "JEDA" overlay. Lanjutkan returns to world. Player position unchanged. |
| 6 | Save Game | Pass. Message "Permainan tersimpan." IndexedDB `jrpg_saves` contains key `slot1`. |
| 7 | Return to Main Menu | Pass. Confirm step shown, then `main-menu` scene. Touch overlay hidden in the menu. |
| 8 | Continue restores progress | Pass. Continue enters `gameplay-demo` in world mode, no opening repeated, position restored to the saved coordinates (after a full page reload). |
| 9 | Pointer cancellation, no stuck movement | Pass. Right held, then `touchCancel`: no movement in the next 600 ms. |
| 10 | Portrait and landscape layouts | Pass for overlap and fit: all buttons clear of the canvas, canvas fully inside viewport, no page scroll. Rotation from portrait to landscape with no reload: scene kept, canvas refitted, controls redrawn. |

Also checked: no page or console errors during any flow. Multi-touch: two fingers (up + right) hold both codes; lifting the right finger leaves up held.

Screenshots (in the project's scratchpad folder, `p2/`):
`portrait-1-menu.png`, `portrait-2-opening.png`, `portrait-3-npc-dialogue.png`, `portrait-4-pause.png`, `portrait-5-saved.png`, `portrait-6-confirm.png`, `portrait-7-menu-again.png`, `portrait-8-continued.png`, the same set with `landscape-` prefix, plus `rotate-a-portrait.png` and `rotate-b-landscape.png`.

Evidence log of the full flow: `p2/flow-evidence.json`. Test output: `p2/npm-test.txt`, `p2/check.txt`.

## Known defects and limitations

**Not verified:**
- Physical iPhone Safari and Android Chrome. All browser results are emulated (Chromium with mobile viewport and CDP touch). Real devices can differ in safe-area handling, touch latency, and Safari gesture handling.
- GitHub Pages deployment and service-worker behaviour.
- Interior collision (building walls, NPC footprints) in the browser.
- Full Chapter 1→5 playthrough on touch.
- Battle, inventory, and quest screens on touch. Battle uses the D-pad and AKSI in code, but was not played.

**Limitations:**
- NPC interaction test placed the player beside the NPC by script. The interaction itself used the real AKSI button.
- Landscape: controls sit over the black letterbox at the sides. They do not overlap the canvas at 844×390, but on shorter landscape screens they may.
- Phone HUD: the status line (`HP … | quest`) is wider than 320 px and is cut off at the right edge in portrait. This is Phase 3 (UI) territory and was not changed.
- Toast wording is technical, for example "Loaded Save slot1 @ village". Phase 4.
- Inventory and quest screens have no touch button. Only the pause menu, D-pad, and AKSI are touch-accessible. Keyboard `I` and `Q` still work on desktop.
- Save from touch uses the pause menu. The keyboard `F5` quick-save is still available on desktop.
- The "Gameplay Demo" debug HUD is hidden unless `?debug=1`. Demo-coloured placeholder art and the village demo map are unchanged (Phase 3).
- Orientation locking and an "Add to Home Screen" prompt were not added.

**Known discrepancy with the Phase 1 report:** the Phase 1 report lists the logical size as 480×270. It is now 320×240.

## Changed-file list and branch

- Branch: **not created.** The uploaded project is a ZIP with no `.git` directory. Create `phase-2-mobile` from the Phase 1 branch before merging.
- Commit: **none made.**
- Deployment: **none.**
