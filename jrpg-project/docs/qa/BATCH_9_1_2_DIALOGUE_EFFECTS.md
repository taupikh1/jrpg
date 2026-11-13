# P0 — Dialogue node effects
- Severity: P0. Repro: complete `ch4_fragment_discovery`; `ch4_fragment_found` never set.
- Root cause: `DialogueEngine` emitted effects only for choices; 47 choiceless terminal nodes (+2 mid-dialogue nodes in `quest_pagar_utara_complete`) had `effects` that nothing delivered.
- Fix: `DialogueEngine.advance()` emits `dialogue.node_effects` when the player advances past a node with `effects` (once per pass). `end()`/Escape never emits it, so interrupted dialogue grants nothing. `GameplayDemoScene` handler extracted into `applyDialogueEffects`, registered for both `dialogue.choice_selected` and `dialogue.node_effects`. Dead `_pendingNodeEffects` branch removed.
- Behavior change: terminal effects now run through the full handler (ch1..ch5 flag prefixes, quests, chapterHook), not only ch3 flags.
- Tests (integration, real engine + EventBus + all real content): `tests/unit/gameplay/DialogueNodeEffects.test.js` (7): delivery once, not on mere arrival, interruption, state cleanup, choice effects, mid-node effect, all 47 real effect nodes, `ch4_fragment_discovery`.
- NOT verified: scene-level application (scene needs browser/canvas), repeat-interaction idempotence in scene (engine replays effect each completed run; flag setting is idempotent by nature, quest accept/complete/shopBuy handlers not audited for re-run), chapters 1-5 in browser.
