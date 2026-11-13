# Batch 9.1.2 — Final report
**Verdict: FAIL (incomplete batch) — no regressions, but required scope not done and no browser verification.** Honest status: P0/P1 fixes done with automated tests; ancient-site route verified in a real browser; most investigation items not started. Correction: Chromium WAS available (/opt/pw-browsers); earlier 'no browser' statement was wrong.

## Done (tests executed: 193 -> 217 pass, 0 fail, 0 skipped; +22 added, 0 modified/deleted)
check / check:world / check:narrative: OK.
1. Terminal/mid node effects (DIALOGUE_EFFECTS). 2. Road flowers (ROAD_FLOWERS). 3. Chapter notifications (CHAPTER_NOTIFICATIONS). 4. Ancient site entrance (ANCIENT_SITE_ACCESS, confirmed defect, browser verified) + plaza spawn.
5. NEW (found by browser run): `this._maybeCh3FirstView` was called but never defined, throwing on every zone transition and skipping `_maybeCh2ForestEntry`/`_maybeCh4FirstEntry`/`_maybeCh5Start`; Chapter 3 first-view dialogue was never started, so `ch3_bellhaven_first_view_seen` was never set. Added the hook (same pattern as ch2/ch4) + `SceneHooks.test.js`. Browser: Chapter 2 forest-entry dialogue now fires; no page errors.

## Files modified
src/engine/gameplay/dialogue/DialogueEngine.js, src/scenes/GameplayDemoScene.js, content/quests/arc_01/quest_bunga_jalan.js, content/world/demo-data.js, content/world/bellhaven-data.js, content/world/resonance-site-data.js, CHANGELOG.md. New: content/gameplay/chapter-notifications.js, tests DialogueNodeEffects / RoadFlowers / WorldConnectivity / ChapterNotifications, docs.

## NOT done / not verified
Arc I flags behavioral test (flag logic only source-verified, needs scene instantiation), reload/storage behavior (MemoryStorageAdapter not tested), NoPath object investigation, chapter gating review, dialogue box overflow, QuestLog/party banter audit, First Resonance and finale, Service Worker/storage docs, regression doc, browser verification of the remaining scenarios (flowers, dialogue effects, notifications, layout, finale). Corresponding docs were not written to avoid fabricated claims.
Known: other toasts still print raw ids; 9.1.1 patches not recovered (see BASELINE).
Verification categories achieved: source, unit, integration, browser runtime/automation (ancient-site route + boot + SW active only). Not: touch, mobile, IndexedDB, offline, production, and all other targeted browser scenarios.
Evidence: `docs/qa/evidence/batch-9-1-2/` (real screenshots + walk script).
