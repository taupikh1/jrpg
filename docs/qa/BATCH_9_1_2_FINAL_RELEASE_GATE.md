# Batch 9.1.2 — Final QA & Release Gate (2026-11-12)

## Decision

**CONDITIONAL — NOT RELEASED.** The automated source/test gate passes. Full game-browser runtime QA is blocked by the managed Chromium navigation policy in this environment. This archive is a QA checkpoint, not a claim of a fully verified release.

## Scope and provenance

- Audited input: `jrpg-project-batch9_1_2-continuation-v3.zip` (Library file, 634,290 bytes).
- Input SHA-256: `516a6624c26a5dd306bc9670ae74a5012704ad19db279dc3560e0928171034ae`.
- Archive integrity: verified with Python `zipfile.testzip()`; 462 entries; no corrupt member reported.
- Extracted project root: `jrpg-new/`.
- Runtime used for this audit: Node.js v22.16.0, npm 10.9.2, Chromium executable `/usr/bin/chromium`; Python Playwright available.

## Fresh checks executed

| Check | Result | Evidence |
|---|---|---|
| `npm test` | PASS | 291 tests, 0 failed, 0 skipped; 79 suites; 5.44s |
| `npm run check` | PASS | 368 files checked; 155 ES modules analyzed; validator reports remaining planned checks |
| `npm run check:narrative` | PASS | `NARRATIVE VALIDATOR OK` |
| `npm run check:world` | PASS | 12 regions; 10 playable zones |
| ZIP integrity | PASS | 462 entries; `testzip()` returned `None` |
| Browser navigation to game | BLOCKED | Chromium `page.goto('http://127.0.0.1:8765/')` returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` |

## Source and test review

- Arc I chain is ordered: First Resonance → aftermath → after-resonance party banter → Unseen Observer → Arc I finale. Source and `Arc1Order` tests cover ordering and replay behavior.
- Critical story-chain startup failures are retained and retried with capped 1/2/4/8-second backoff; `StoryChainRetry` injects three failures and verifies recovery. This is not a test of a real browser failure.
- Nineteen `PARTY_AFTER_DIALOGUE` mappings resolve to defined trigger and party dialogue IDs. Unit tests exercise enqueue → start → seen lifecycle. Actual in-game playback for all mappings remains NOT VERIFIED.
- `ch1_party_orin_mira_travel` uses the shared queue lifecycle; unit coverage exists. Browser playback remains NOT VERIFIED.
- Bellhaven/Archive/Ancient Site chapter gates are present in source. Zone connectivity and safe-position behavior have automated coverage. Full browser gate matrix and exact trigger-overlap recovery remain NOT VERIFIED.
- `ch2_note_0` is at (100,96). Scene-spawn/InteractionSystem tests cover full-inventory retry, successful pickup, and duplicate prevention. Walking to it and pressing the interaction key in the real game remains NOT VERIFIED.
- One-shot collectible callbacks reject failed inventory additions, preserving pickups when inventory is full.
- Canvas layout: the repository's `TextWrap.js` was measured in an isolated Chromium page against 919 dialogue nodes at 10px monospace / 480×270. The recorded evidence reports zero overflow and 114px maximum box height. This validates text wrapping only, not game scene execution.
- The 404 favicon issue was not freshly reproduced because game navigation was blocked. Current source uses a data-URI favicon. Status: NOT REPRODUCED in this run, not proven universally fixed.
- Storage adapter selection, save/reload persistence, natural Chapter 1→5 progression, and final unlock have source/unit coverage but were not freshly exercised in a real browser during this audit.

## Browser blocker details

A local Python static server was started on port 8765 and Chromium was launched through Playwright. Navigation to `http://127.0.0.1:8765/` failed with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Therefore no real game JavaScript, keyboard input, zone transitions, network requests, or runtime console could be observed. This is an environment restriction; it is not evidence of a game defect or of successful gameplay.

## Remaining release blockers

1. Run a clean-profile Chapter 1→5 browser playthrough without forcing story flags.
2. Browser-test A6 zone transitions and every chapter gate before/after its required flag.
3. Browser-walk to `ch2_note_0`, collect it, retry with full inventory, and verify no duplicate.
4. Exercise all 19 party banter mappings in the actual game and record trigger, playback, speaker, ordering, and duplicate behavior.
5. Capture browser console and network logs; investigate the one-off 404 if it recurs.
6. Exercise locked-zone trigger recovery and IndexedDB save/reload in a real browser.
7. Repeat physical iPhone Safari / Android Chrome, offline, and deployed GitHub Pages checks before claiming platform readiness.

## Content scope warning

The project is not content-complete: `content/enemies/arc_01.js` contains one enemy definition; `content/items/arc_01.js` contains 11 item definitions; a declarative entity catalogue/loader is not implemented. The long-term target counts for monsters, bosses, NPCs, and quests are not met. This is not a blocker for the narrow automated gate, but it is a blocker for any claim that the overall JRPG is content-complete.

## Release rule

Do not label this checkpoint READY. Promote it only after the browser blockers above have reproducible evidence. Keep historical QA documents, but treat this report as the latest consolidated release-gate status for this checkpoint.
