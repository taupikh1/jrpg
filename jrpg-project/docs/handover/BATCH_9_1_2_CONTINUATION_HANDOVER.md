# Batch 9.1.2 Continuation Handover

## Current checkpoint

Work was extracted from `jrpg-project-batch9_1_2_CHECKPOINT.zip` into a separate working directory. The original uploaded ZIP was not modified.

## Changes in this continuation

- Item catalogue moved to `content/items/arc_01.js` (11 definitions).
- Enemy catalogue moved to `content/enemies/arc_01.js` (one existing definition: `thorn_sprite`).
- Compatibility exports retained in `content/gameplay/demo-content.js`.
- `content/entities/README.md` documents why a declarative entity catalogue is not yet safe to create: runtime spawn logic remains in `GameplayDemoScene` and there is no canonical schema/loader.
- Added `tests/unit/gameplay/ContentCatalog.test.js`.
- Fixed one-shot inventory pickups so a full inventory does not consume the world object; callbacks explicitly reject the interaction when `Inventory.add()` fails.
- Added `tests/unit/gameplay/CollectibleInteraction.test.js`, including an actual scene-spawn and InteractionSystem regression for `ch2_note_0`.

## Remaining work

1. Complete browser A6 transition matrix and capture request/console logs.
2. Browser-test walking to `ch2_note_0`, collecting it, and confirming no duplicate; full-inventory retry now has source/unit/integration coverage.
3. Browser-play the 19 party banter mappings in the real game. Source and unit tests now confirm all 19 mappings resolve and complete the queue/start/seen lifecycle.
4. Investigate the one-off 404 with actual browser network logs.
5. Browser-verify `ch1_party_orin_mira_travel`; source and unit tests already show it uses the shared queue and only marks seen after a successful start.
6. Decide whether story-chain retries should remain capped at three; a third consecutive startup failure currently drops that chain step and can strand the Arc I finale.
7. Test locked-zone trigger recovery where the fallback spawn may overlap an exit trigger.
8. Continue the data-driven entity schema/loader as a separate scoped batch; do not duplicate scene-owned NPC/object definitions without migration tests.
9. Expand enemy and item content as production batches, not by inventing arbitrary filler entries.

## Current source/test correction

- The earlier note that `ch1_party_orin_mira_travel` bypasses the shared queue is stale. Current source routes it through `_enqueueParty()` / `_startQueued()`, and `ChapterOneTravelBanter.test.js` covers both successful start and retry after a temporary failure. Runtime browser playback is still unverified.

## Latest automated verification

- `npm test`: 291 passed, 0 failed, 0 skipped (79 suites).
- `npm run check`: OK; 368 files, 155 ES modules.
- `npm run check:narrative`: OK.
- `npm run check:world`: OK; 12 regions, 10 playable zones.

## Verification limitation

The current host's managed Chromium blocks localhost, container-IP, and `file://` navigation. Browser verification is therefore BLOCKED in this continuation. Use a local Claude/Playwright environment with browser access to complete runtime tests. Do not relabel unit tests as browser tests.


## Additional verification on 2026-11-12

- Chromium 144 + Python Playwright can launch and run isolated blank-page canvas tests. The managed policy still blocks navigation to the actual game via localhost, container IP, and `file://`.
- Imported the actual `TextWrap.js` module in Chromium and measured all 919 dialogue nodes with Canvas 2D `measureText()` at 10px monospace and 480×270. Result: 0 overflow cases; maximum box height 114px. Screenshots are in `docs/qa/evidence/batch-9-1-2-canvas/`.
- This is browser-backed canvas/layout verification only, not a full game browser run. A6, natural Chapter 1→5 playthrough, 19 banter mappings, pickup walking, network 404 capture, and locked-trigger recovery remain pending browser access.


## Latest independent audit (2026-11-12)

See `docs/qa/BATCH_9_1_2_FINAL_RELEASE_GATE.md` for the fresh re-run and consolidated decision. The current checkpoint passes 291/291 automated tests and all three project/narrative/world validators. A fresh Playwright navigation attempt to the local game was blocked by Chromium with `ERR_BLOCKED_BY_ADMINISTRATOR`; the release decision is therefore CONDITIONAL / NOT RELEASED.

**Important corrections to older notes:** the old three-attempt critical story-chain drop behavior is no longer current. Critical story steps now remain pending and retry with capped backoff; only non-critical party banter uses the three-attempt defer policy. The old note that the travel banter bypasses the shared queue is also stale; current source and unit tests cover the shared lifecycle.
