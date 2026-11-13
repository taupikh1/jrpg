# B15 — Roster and Third Playable Character

**Status:** IMPLEMENTED; automated tests pass.
**Baseline:** `jrpg-project-preb15_1.zip`
**Scope:** Character roster foundation only. B16 has not started.

## 0. Baseline provenance and file diff

- Input archive: `jrpg-project-preb15_1.zip`
- Input size: 2,028,459 bytes
- Input SHA-256: `7dee9d3dccfe59ca7eac6dd38bebe4fbac2263bd4e0b9bdba011540ff6be37da`
- Input ZIP integrity: passed `unzip -t` before work.
- Baseline inventory: `docs/handover/B15_BASELINE_SHA.txt` (506 files).
- Final source inventory before packaging: 510 files.
- Diff against baseline: 25 modified, 4 added, 0 deleted (Pre-B15C responsive viewport + B15 roster).


### Modified files (25)

- `CHANGELOG.md`
- `content/characters/progression.js`
- `docs/00-project/DECISION_LOG.md`
- `docs/INDEX.md`
- `docs/handover/HANDOVER_JRPG_ROADMAP_v2.md`
- `docs/handover/PRE_B15_IPHONE_TEST_GUIDE.md`
- `docs/narrative/CHARACTER_ID_MAP.md`
- `src/core/Config.js`
- `src/engine/persistence/SaveManager.js`
- `src/engine/persistence/SaveMigrations.js`
- `src/engine/persistence/SaveSchema.js`
- `src/engine/rendering/Camera.js`
- `src/engine/rendering/RenderPipeline.js`
- `src/platform/browser/CanvasSurface.js`
- `src/scenes/BootScene.js`
- `src/scenes/EntityDemoScene.js`
- `src/scenes/GameplayDemoScene.js`
- `src/scenes/MainMenuScene.js`
- `src/scenes/RenderDemoScene.js`
- `src/scenes/WorldDemoScene.js`
- `tests/unit/Viewport.test.js`
- `tests/unit/gameplay/Progression.test.js`
- `tests/unit/persistence/Save.test.js`
- `tests/unit/rendering/Camera.test.js`
- `tests/unit/rendering/CanvasFit.test.js`

### Added files (4)

- `docs/handover/B15_BASELINE_SHA.txt`
- `docs/handover/B15_REPORT.md`
- `docs/handover/PRE_B15C_REPORT.md`
- `tests/unit/gameplay/CharacterRoster.test.js`

## 1. Character Bible gate

`docs/narrative/CHARACTER_BIBLE.md` is titled **Character Bible — Principal Party (8)** and defines `character_kael_rowan — Kael Rowan` as the third principal-party entry after Orin and Mira. It specifies his first appearance in Chapter 6, his former Crown Guard background, stoic/protective personality, and frontline defender combat identity. `content/narrative/canon-registry.json` also includes `character_kael_rowan`. This is the existing, canon-listed character selected under D-020; no new character or lore was invented. The document does not expose a separate per-character approval boolean, so the evidence is its explicit inclusion in the Principal Party roster and canon registry.

## 2. Runtime identity

- Existing runtime IDs `orin` and `mira` remain unchanged.
- Added runtime ID `kael` mapped to `character_kael_rowan` in `docs/narrative/CHARACTER_ID_MAP.md`.
- No runtime ID aliases or save-version migration were needed.

## 3. Implementation

- Added Kael's progression profile in `content/characters/progression.js`, based on his documented frontline-defender role. Base and per-level stats are initial gameplay tuning values, not narrative canon.
- Progression registry remains data-driven and keyed by stable runtime ID.
- Added Kael's live `CharacterStats` instance and progression synchronization.
- Centralized active-member enumeration in `GameplayDemoScene._activePartyMembers()` so the status screen and battle party use the same party membership source.
- Kael becomes an active party member only when `ch6_kael_joined` is present in the Chapter 6 world flags. This is a compatibility seam for the upcoming B16 recruitment flow; B15 does not invent a recruitment scene or Chapter 6 dialogue.
- Kael can enter the existing BattleManager participant list and receives battle EXP while alive and active.
- Added optional Kael HP/MP data to the existing save payload and optional `ch6` world flags. Existing save version remains v4; older saves without these optional fields continue to load with Kael at default level and not recruited.
- Progression import/export includes Kael automatically through the existing character-keyed progression registry.
- Pre-B15C: landscape canvas width now adapts to the viewport (iPhone 13 reference 844×390 CSS → 519×240 logical), camera viewport follows the canvas, small maps are centered, and screen-space layouts use active canvas dimensions. Portrait retains the 320×240 base.

## 4. Combat scope deliberately deferred

Kael's Character Bible describes taunt and ally guarding. The current battle engine does not yet implement taunt redirection or ally-cover targeting. B15 therefore does not fake these abilities with unrelated effects. Kael currently uses the existing basic attack/defend commands. His unique taunt/guard skill implementation remains for the dedicated skill batch (B17), while B16 handles recruitment and party changes.

## 5. Tests

Added focused tests for:

- Kael's Character Bible/runtime mapping and defensive growth profile.
- Progression, level-up stat growth, and progression save/restore.
- Party membership gating and stable Orin/Mira IDs.
- Kael battle participant creation and EXP distribution.
- Optional Kael battle stats and Chapter 6 flag save round-trip without changing save version.

Actual verification from the working project:

- `npm test` — **590/590 passed**, 0 failed.
- `npm run check` — **OK**, 510 files inspected and 210 ES modules analyzed.
- `npm run check:world` — **WORLD VALIDATOR OK**, 12 regions and 10 playable zones.
- `npm run check:narrative` — **NARRATIVE VALIDATOR OK**.
- `node --check` — passed for the modified scene, SaveManager, CanvasSurface, Camera, RenderPipeline, and character progression module.
- `npm run dev` / Express HTTP smoke — **NOT RUN**: this extracted workspace has no `node_modules` and `express` is not installed. No dependency installation was attempted.
- Physical iPhone Safari and Android Chrome — **NOT TESTED**.
- Browser visual rendering — **NOT TESTED**.


## 6. Not implemented / not claimed

- Chapter 6 recruitment dialogue or story event (B16).
- Taunt/ally-cover battle mechanics and unique Kael skills (B17).
- Final HD3D character model, animation, portrait, or new audio.
- Physical iPhone/Android QA.
- Physical-device validation of the responsive iPhone landscape viewport; see `PRE_B15C_REPORT.md`.

## 7. Next bounded milestone

B16: connect the existing `ch6_kael_joined` flag to the approved Chapter 6 recruitment flow, party changes, and save compatibility. Do not start it without owner review of this B15 delivery.
