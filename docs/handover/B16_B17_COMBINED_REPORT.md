# B16–B17 Combined Implementation Report

**Project:** THE ATLAS OF UNREMEMBERED STARS  
**Milestone:** `B16-B17 COMBINED: PARTY, CHARACTER GAMEPLAY & NARRATIVE INTEGRATION`  
**Status:** Implemented within the available project scope; automated tests and project validators pass.  
**Date:** 2026-11-13

## 1. Baseline provenance

- Baseline archive: `jrpg-project-b15_1.zip`
- Baseline size: 2,063,503 bytes
- Baseline SHA-256: `67493db57c848ad3f555999dda6bf27a028bb1dc14c346ba73444d2b1ad9abf1`
- Baseline archive integrity: `unzip -t` passed.
- Baseline inventory: 510 files.
- Final source inventory before packaging: 515 files (including this report).
- Source diff: 18 modified, 5 added, 0 deleted (the four implementation/test files plus this report).
- No dependencies installed or added. Original baseline archive was not modified.

## 2. Roadmap alignment

The combined work preserves the authoritative handover order:

- **Roadmap B16:** recruitment/departure flags, save schema v5 with v4→v5 migration, and maximum four active battle members.
- **Roadmap B17:** four registered skills per playable character, one marked signature ability per character, and role-based growth/level unlocks.
- **Additional approved combined scope:** Kael's Chapter 6 introduction, recruitment dialogue, and first party watch scene.

B18 and later batches were not started.

## 3. Party roster and recruitment

Added `src/engine/gameplay/party/PartyRoster.js`:

- Stable runtime IDs remain `orin`, `mira`, and `kael`.
- Orin is permanent; Mira and Kael are controlled by their existing chapter recruitment flags.
- Departure flags are tracked separately from recruitment history.
- Active roster enumeration is deterministic and capped at four.
- Save metadata stores `recruited`, `departed`, and current `active` member IDs.
- Dialogue effects can recruit or dismiss a supported roster member. Orin cannot be dismissed.

Kael joins through the Chapter 6 opening dialogue `ch6_kael_recruitment`, chained after `ch5_banter_departure`. His joining effect sets `ch6_kael_joined`. A follow-up scene, `ch6_party_first_watch`, adds a short Orin/Mira/Kael party interaction.

Save recovery preserves this sequence:

1. If Chapter 5 is complete but departure banter is unfinished, resume `ch5_banter_departure`.
2. Then resume Kael's recruitment scene.
3. After recruitment, resume the first-watch party scene if it has not completed.

## 4. Save schema v5

- `SAVE_VERSION` is now 5.
- Added `party.roster` with recruited/departed flags and active member IDs.
- Added sequential v4→v5 migration.
- Existing v4 chapter flags, party stats, progression, equipment, inventory, and quest data are preserved.
- Migration reconciles character skill unlocks against saved character levels so existing saves gain skills already earned under the new unlock table.
- Chapter 5 saves resume the appropriate pending banter/recruitment scene instead of silently skipping the new story sequence.
- `SaveValidator` checks roster structure, unique active IDs, and the four-member active limit.

Automated fixtures cover v3→v5, v4→v5, completed Chapter 5 saves, unfinished departure banter, Kael progression, and save/load round trips.

## 5. Character skills and progression

Each playable character now has four level-gated skill entries and exactly one signature skill marker:

| Character | Skills | Signature |
|---|---|---|
| Orin | Ember, Minor Heal, Dentuman Gema, Tombak Gema | Dentuman Gema |
| Mira | Jahitan Lembut, Percikan, Simpul Cahaya, Selimut Pendar | Jahitan Lembut |
| Kael | Benteng Diri, Hantaman Perisai, Tantang, Lindungi Sekutu | Lindungi Sekutu |

- Existing level cap remains 10.
- Skills unlock at the configured levels in `content/characters/progression.js`.
- Orin retains his hybrid physical/Resonance profile.
- Mira retains her healing/light-magic profile.
- Kael retains his high-HP/high-defense frontline profile.
- The skill menu supports four rows and shows a marker for signature abilities.
- Player-facing skill names and descriptions are Bahasa Indonesia.

## 6. Combat integration

Implemented through the existing BattleManager and skill command path. No second battle or skill registry was introduced.

- **Benteng Diri / Guard:** reduces Kael's incoming damage by 50% through the current round and the following round. It expires and emits `battle.defense_effect_expired`.
- **Tantang / Taunt:** enemy target selection prioritizes a living active taunter. Defeated or expired taunters are ignored. Target selection emits `battle.taunt_targeted`.
- **Lindungi Sekutu / Protect Ally:** redirects approximately half of incoming damage to Kael for the same protection window. The redirected portion uses Kael's own defense/magic defense, guard state, and elemental affinity; protection is not recursive. Redirection emits `battle.damage_redirected`. If Kael is defeated by redirected damage, the normal participant-defeated event is emitted.
- Wrong-side/self/ally targets and locked skills are rejected before MP is spent.
- The battle engine enforces a maximum of four player participants.
- Defensive effects are battle-only and are cleared when battle ends; they are not written into save data.

## 7. Narrative scope and limits

Implemented:
- Kael's first appearance and recruitment dialogue at the Chapter 6 transition.
- Approved former Crown Guard background and erased border-incident reference from the Character Bible.
- Short interactions with Orin and Mira that establish the party's initial dynamic.
- Stable dialogue IDs registered in the content ID registry.
- Story flags and save-resumable scene sequencing.

Not added:
- No Chapter 6 world map/zone was invented; the new scenes are the Chapter 6 opening transition content only.
- No NPC reaction dialogue was added because the current implemented world has no approved Kael-related NPC relationship or Chapter 6 location to attach it to.
- No new side quest was created because no existing approved side quest was found that naturally supports Kael without inventing canon.
- No additional optional camp-scene chain beyond the first-watch introduction was added.

These are explicit content limits, not claims that the full Chapter 6 or all narrative integration is complete.

## 8. Files changed

### Added (4)

- `src/engine/gameplay/party/PartyRoster.js`
- `content/dialogue/party/ch6_party.js`
- `tests/unit/gameplay/PartyRoster.test.js`
- `tests/unit/gameplay/CharacterSkills.test.js`
- `docs/handover/B16_B17_COMBINED_REPORT.md` (this report)

### Modified (18)

- `CHANGELOG.md`
- `docs/INDEX.md`
- `docs/00-project/DECISION_LOG.md`
- `docs/handover/HANDOVER_JRPG_ROADMAP_v2.md`
- `docs/narrative/CHARACTER_ID_MAP.md`
- `docs/narrative/CONTENT_ID_REGISTRY.md`
- `src/scenes/GameplayDemoScene.js`
- `src/engine/gameplay/battle/BattleManager.js`
- `src/engine/persistence/SaveSchema.js`
- `src/engine/persistence/SaveManager.js`
- `src/engine/persistence/SaveMigrations.js`
- `src/engine/persistence/SaveValidator.js`
- `content/characters/progression.js`
- `content/dialogue/index.js`
- `content/ui/player-text.js`
- `tests/unit/gameplay/CharacterRoster.test.js`
- `tests/unit/gameplay/Progression.test.js`
- `tests/unit/persistence/Save.test.js`

## 9. Verification evidence

Executed from the project root:

- `npm test` — **608/608 passed**, 0 failed.
- `npm run check` — **OK**, 515 project files inspected and 214 ES modules analyzed.
- `npm run check:world` — **WORLD VALIDATOR OK**, 12 regions and 10 playable zones.
- `npm run check:narrative` — **NARRATIVE VALIDATOR OK**.
- `node --check` on all changed JavaScript modules — passed.
- Baseline `unzip -t` — passed.

### Not run / not verified

- Browser visual/runtime test — NOT RUN. The extracted workspace has no `node_modules`; no dependency installation was attempted.
- Physical iPhone 13 Safari Add to Home Screen — NOT TESTED.
- Physical Android Chrome — NOT TESTED.
- Desktop browser visual test — NOT TESTED.
- Combat balance playtest against the full future boss roster — NOT RUN; only deterministic unit/integration tests were executed.

## 10. Compatibility and scope guard

- No changes to Orin/Mira runtime IDs.
- Kael runtime ID remains `kael`.
- Save version changed only through the explicit v4→v5 migration.
- No renderer migration, D-009/D-022 resolution change, BGM, or new dependency.
- No B18 work or later batch work was started.
- Original baseline archive remains untouched.

**Completion statement:** The combined B16/B17 implementation is complete for the current repository's implemented roster, battle engine, save model, and Chapter 6 opening transition. Full Chapter 6 world content, NPC reactions, side quests, physical-device verification, and later roster expansion remain outside this milestone.
