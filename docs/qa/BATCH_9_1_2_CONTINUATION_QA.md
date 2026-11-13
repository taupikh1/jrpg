# Batch 9.1.2 Continuation — Checkpoint Audit

**Input:** `jrpg-project-batch9_1_2_CHECKPOINT.zip`  
**Audit date:** 2026-11-12  
**Scope:** inspect the supplied checkpoint, reconcile Claude's unfinished list with the actual files, run repository tests/validators, and make a conservative content-catalogue organization change.

## Repository baseline

- ZIP integrity: verified before extraction.
- Extracted project root: `jrpg-new/`.
- Automated suite at initial inspection: **280 passed, 0 failed, 0 skipped** (74 suites).
- `content/items`, `content/enemies`, and `content/entities` directories existed but contained no files.
- The item definitions were not missing: 11 definitions were embedded in `content/gameplay/demo-content.js`.
- One enemy definition (`thorn_sprite`, Sprite Duri) was also embedded in `content/gameplay/demo-content.js`.
- Runtime NPCs and interactable objects are currently spawned imperatively by `GameplayDemoScene`; no single declarative entity schema/loader is established. Duplicating those records into `content/entities` would create a second source of truth, so no fake catalogue was added.

## Changes made during this continuation

- Moved the 11 Arc I item definitions into `content/items/arc_01.js`.
- Moved the existing `thorn_sprite` enemy definition into `content/enemies/arc_01.js` and added a small lookup export.
- Preserved legacy exports from `content/gameplay/demo-content.js` to avoid breaking existing imports.
- Added catalogue tests for unique item IDs, compatibility exports, ItemRegistry registration, and the existing enemy lookup.
- Added README documentation to the three content directories explaining what is implemented and what is not.

## Findings reconciled against the Claude unfinished list

| Item | Checkpoint evidence | Status in this audit |
|---|---|---|
| Documentation | Existing `BATCH_9_1_2_*`, `BATCH_9_1_3_QA_D1_D9.md`, and handover files already exist | SOURCE VERIFIED; this continuation adds a reconciled report and updated handover |
| D1 Arc I flags | Finale chain and `arc1_completed` / `chapter_06_unlocked` assignments present; prior QA describes browser run with forced prerequisites | PARTIAL; normal Chapter 1→5 behavioral unlock not independently verified here |
| D2 storage | `main.js` selects IndexedDBAdapter when available; `_doLoad` restores flags and zone | SOURCE VERIFIED; browser reload test not repeated in this environment |
| D3 gating | `ZONE_GATES` includes road, Bellhaven districts, archive, and ancient site | SOURCE VERIFIED; prior QA contains partial browser evidence; full gate matrix not repeated |
| D4 dialog layout | `TextWrap.js` is used in dialogue rendering; prior QA includes screenshots and estimated text-fit test | SOURCE VERIFIED; canvas-font measurement not independently repeated |
| D5 QuestLog | Quest definitions and flags exist; prior QA says 36 flag targets have source triggers | PARTIAL; full runtime quest sequence not independently repeated |
| D6 banter | All 19 `PARTY_AFTER_DIALOGUE` mappings resolve to real trigger/content definitions; each is tested through enqueue → start → seen lifecycle | SOURCE + UNIT TEST VERIFIED; actual game browser playback remains NOT VERIFIED |
| D7 First Resonance/finale | `DIALOGUE_CHAIN` connects First Resonance → aftermath → banter → observer → finale | SOURCE VERIFIED; full natural browser run not performed |
| D8 toast names | `_questTitle` and `_itemTitle` exist; prior QA includes browser examples | SOURCE VERIFIED plus prior partial browser evidence |
| D9 dialogue effects/flowers | Existing tests and previous QA evidence present | TEST VERIFIED; complete fresh browser verification not performed |
| A6 zone transitions | World connectivity tests cover all declared exits and spawns | TEST VERIFIED; browser A6 remains NOT VERIFIED in this run |
| `ch2_note_0` | Position set to (100,96); reachable-spot test plus actual scene-spawn/InteractionSystem collection, full-inventory retry, and duplicate-prevention tests | TEST VERIFIED; walking/keyboard browser collection remains NOT VERIFIED |
| 404 | `index.html` uses a data URI favicon; prior report says favicon 404 did not recur | NOT REPRODUCED HERE; browser network capture blocked |
| D1 design: aftermath auto-chain | Current story chain automatically advances into `ch5_after_resonance` | IMPLEMENTED; user approval is recorded in the task instruction for this continuation |
| `ch5_banter_after_resonance` | In `DIALOGUE_CHAIN`, before `ch5_unseen_observer` | SOURCE VERIFIED |
| `ch1_party_orin_mira_travel` | Uses `_enqueueParty()` and `_startQueued()`; `_partySeen[id]` is set only after successful start; dedicated retry/success tests exist | SOURCE + UNIT TEST VERIFIED; browser playback NOT VERIFIED |
| Three failed story-chain starts | Critical story steps remain pending and retry with capped backoff; party banter retains its 3-attempt defer policy | SOURCE + UNIT TEST VERIFIED; browser failure injection NOT VERIFIED |
| Locked-zone trigger recovery | Uses `_safePosition()` on blocked transition; existing zone-safe tests | TEST VERIFIED; exact trigger-overlap browser case NOT VERIFIED |

## Browser environment limitation

A Chromium 144 binary is available. A local static server was started on port 8765, but Chromium's managed browsing policy displayed `127.0.0.1 is blocked` and `172.26.39.240 is blocked`. A `file://` navigation was also blocked by policy. Therefore this run could not execute game JavaScript or capture valid game-runtime evidence. This is an environment blocker, not a game defect. The local static server and Chromium process are stopped after the attempt.

## Content catalogue reality

| Directory | Current contents | Honest status |
|---|---|---|
| `content/items/` | `arc_01.js`, README | 11 item definitions organized; not a broad catalogue |
| `content/enemies/` | `arc_01.js`, README | 1 enemy definition; no complete encounter/AI/loot ecosystem |
| `content/entities/` | README only | Declarative catalogue/loader NOT IMPLEMENTED; runtime entities still exist and are spawned by scene code |

The project target of 100–150 monsters and 30–50 bosses is not met by this checkpoint. No monster volume was fabricated to make the folders look populated.

## Verification

The exact final test and validator counts are recorded below after the catalogue tests were added. Browser, physical mobile, offline, and production GitHub Pages verification are not claimed by this audit.

## Follow-up regression: one-shot collectible retry (2026-11-12)

A code-path review found that `InteractionComponent` marked every `oneShot` interaction as used even when an inventory-backed callback failed because the inventory was full. This could permanently consume a collectible without granting its item.

- `InteractionComponent.interact()` now treats an explicit callback return value of `false` as a rejected interaction and leaves a one-shot interaction available.
- The Arc I pickups for `ch2_elara_note`, `ch4_catalog_fragment`, `guest_page`, and `index_shard` now return `Inventory.add(...).ok`.
- `tests/unit/gameplay/CollectibleInteraction.test.js` checks generic rejected/successful one-shot behavior and exercises the actual `GameplayDemoScene._spawnChapter2Forest()` + `InteractionSystem` path for `ch2_note_0`.
- The `ch2_note_0` regression confirms: full inventory → no item granted and pickup remains retryable; free a slot → item granted; interact again → no duplicate item.
- This is source/unit/integration verification. It does not replace the still-pending browser test for walking to the note and pressing the interaction key.

## Final automated verification after follow-up changes

- `npm test`: **291 passed, 0 failed, 0 skipped** (79 suites).
- `npm run check`: OK; 368 files checked, 155 ES modules analyzed.
- `npm run check:world`: OK; 12 regions and 10 playable zones.
- `npm run check:narrative`: OK.
- Browser runtime: BLOCKED by host browsing policy as described above.


## Follow-up regression: critical story-chain retry (2026-11-12)

The previous three-attempt drop behavior could permanently discard a critical story-chain step (for example, `ch5_unseen_observer`) after a transient startup failure. This could strand Arc I even though the step had not completed.

- Story-chain steps now remain in `_storyNext` after a failed start and retry with capped backoff (1, 2, 4, then 8 seconds). They are not silently dropped.
- Party banter remains non-critical: after three consecutive failed starts it is deferred and remains eligible for a later enqueue.
- `tests/unit/gameplay/StoryChainRetry.test.js` injects three consecutive startup failures, verifies the pending story step survives and backoff prevents per-frame retry, then verifies successful recovery.
- `tests/unit/gameplay/PartyBanterMapping.test.js` verifies all 19 mapped trigger and party dialogue IDs exist and that every mapping queues, starts, and marks seen only after successful start.
- Automated result: 291 passed, 0 failed, 0 skipped.

## D4 additional browser-canvas measurement (2026-11-12)

- Chromium 144.0.7559.96 + Python Playwright launched successfully. Full game navigation remains blocked by the managed browser policy, so this is an isolated canvas test, not game runtime QA.
- The actual `src/engine/rendering/TextWrap.js` module was imported into a blank Chromium page. All **919 dialogue nodes** were measured using a real Canvas 2D context at the game's `10px monospace` font and 480×270 logical resolution.
- Result: **0 overflow cases**; maximum dialogue box height 114 px.
- Isolated canvas screenshots for the start nodes of `ch2_mira_personal_scene` and `ch3_road_bellhaven_first_view` are in `docs/qa/evidence/batch-9-1-2-canvas/`. These screenshots validate wrapping/layout only; they do not prove the game scene, controls, or dialogue progression works in-browser.
