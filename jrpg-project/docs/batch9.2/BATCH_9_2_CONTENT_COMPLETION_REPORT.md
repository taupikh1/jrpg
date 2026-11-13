# Batch 9.2 — Arc I Content & Gameplay Completion Audit

Status: **PARTIAL — automated gate passes; browser runtime NOT RUN; release NOT claimed.**

## 1. Repository version inspected
- Input: `jrpg-project-pixelart-fix5.zip` (extracted to `jrpg-new/`), package `jrpg-project@0.8.0`.
- Prerequisite reading: `docs/qa/BATCH_9_1_2_FINAL_RELEASE_GATE.md`, `docs/handover/BATCH_9_1_2_CONTINUATION_HANDOVER.md`, `docs/phase3/PHASE_3_REPORT.md`.
- Previous gate status: CONDITIONAL / NOT RELEASED; blockers were browser-only (NOT VERIFIED). Not resolved in this batch.

## 2. Automated results (executed, observed)
| Command | Result |
|---|---|
| `npm test` (before this batch) | 382 pass, 0 fail |
| `npm test` (after this batch) | **395 pass, 0 fail, 0 skipped** (13 new tests in `tests/unit/gameplay/Batch92ContentCompletion.test.js`) |
| `npm run check` | exit 0, OK |
| `npm run check:narrative` | exit 0, NARRATIVE VALIDATOR OK |
| `npm run check:world` | exit 0, WORLD VALIDATOR OK (12 regions, 10 playable zones) |

## 3. Content inventory (derived from source)
- Dialogues: 154 definitions, 623 nodes, 0 duplicate ids.
- NPC spawns in scene: 27; every spawn dialogue id resolves.
- Quests: 16 defined (4 main chapter quests Bab 2–5; 12 side quests incl. Arc I side quest sets).
- Items: 11 (`content/items/arc_01.js`). Equipment: 2 (`rusty_sword`, `leather_vest`).
- Enemies: 1 definition (`thorn_sprite`). Battle encounters in scene use inline enemy stats (`Thorn Sprite` x2 in `_startBattle`), not the catalogue.
- Bosses: 0.
- Playable characters: Orin, Mira. Kael, Tavi, Sera are NOT Arc I characters per `docs/narrative/CHARACTER_BIBLE.md` (first appear Ch.6, Ch.8, Ch.4-trail/joins Ch.9–11). Not added.
- Zones: 12 regions, 10 playable.
- EXP / level-up system: **not present**. Battle rewards are gold and items only.

## 4. Chapter 1–5 completeness matrix
| Chapter | Story chain | Main quest | Status |
|---|---|---|---|
| 1 | opening, Henn, Mira encounter, fragment, memory slip, to-forest hook | none (pagar utara side quest) | PARTIALLY COMPLETE — `ch1_ending` UNUSED (see §12) |
| 2 | forest entry, echo, carvings, resonance, finale | `quest_ch2_suara_hutan` | Was UNUSED in play (never accepted). **FIXED** — accepted on forest entry. Source/unit verified; browser NOT RUN |
| 3 | road view, gate, market, plaza, archive entry | `quest_ch3_jejak_yang_kosong` | Was UNUSED in play. **FIXED** — accepted on first road-view |
| 4 | archive entry, three records, fountain, restricted room | `quest_ch4_arsip_tanpa_nama` | Was UNUSED in play. **FIXED** — accepted on archive entry. Three-records beat was UNREACHABLE; **FIXED** |
| 5 | fragment, echo, scholar, site, resonance, finale | `quest_ch5_resonansi_pertama` | Was UNUSED in play; echo and memories beats UNREACHABLE. **FIXED** |

Chapter completeness is NOT marked VERIFIED COMPLETE: no clean-profile browser playthrough was run.

## 5. Character and party matrix
| Character | Status |
|---|---|
| Orin | Implemented. Stats/skills/battle present. Save persistence covered by existing tests. VERIFIED (source/unit) |
| Mira | Joins via `ch1_mira_follow`. Own stats (`miraStats`), skills `mira_mend`, `mira_spark`. Party banter mapping present. VERIFIED (source/unit); browser NOT RUN |
| Kael / Tavi / Sera | Not Arc I. Not implemented. Correctly absent. NOT APPLICABLE for Arc I |

Party architecture: `_battleParty()` builds a party list from story state; no two-member hard cap in the code path.

## 6. NPC audit
- 27 spawned NPCs; all dialogue ids resolve (checked by script).
- Placement defects previously fixed (npc_venn, npc_timm) are retained.
- NPCs whose dialogue is reachable only by story flags were checked in code; no NPC was moved.
- Not verified: walkability and interaction range for every NPC in a real browser.

## 7. Dialogue and narrative audit
- Integrity checked by script: no missing `next`/choice targets, no empty text, no unreachable nodes among the 154 dialogues (4 flagged `next: null` are engine-terminated choices — false positive).
- Dialogues with no runtime trigger (UNUSED): `ch1_ending`, `ch2_obj_silent_stone`, `ch3_plaza_timm_ch3`, `ch5_bellhaven_echo` (now wired), `ch5_memories_we_carry` (now wired), `ch4_three_records_resonance` (now wired), `ch4_obj_fountain_inscription` (now wired), `ch5_side_message_offer` / `ch5_side_message_done` (now wired), `ch4_obj_record_*` (already wired).
- Remaining UNUSED: `ch1_ending`, `ch2_obj_silent_stone`, `ch3_plaza_timm_ch3`. See §12.
- Dialogue text was not rewritten. No new narrative text was written in this batch.

## 8. Side quest matrix
| Quest | Status |
|---|---|
| quest_ch2_catatan_tercecer | PARTIAL — talk/collect wired; not browser verified |
| quest_ch2_panggilan_tak_terjawab | PARTIAL — ribbon flag set in dialogue; not browser verified |
| quest_ch3_jejak_yang_kosong | FIXED (acceptance). Objectives depend on chapter flags; browser NOT RUN |
| quest_ch4_arsip_tanpa_nama | FIXED (acceptance + three-records objective) |
| quest_ch4_surat_tanpa_nama | FIXED — fountain inscription now triggerable while active (was BROKEN: objective unreachable) |
| quest_ch4_katalog_kosong | PARTIAL — collection via items, not browser verified |
| quest_ch5_resonansi_pertama | FIXED (acceptance, echo, memories reachable) |
| quest_ch5_suara_di_balik_batu | PARTIAL — three flags reachable at site; not browser verified |
| quest_ch5_pesan_yang_tertinggal | FIXED — mural triggers offer/copy (was INACCESSIBLE) |
| quest_bh_buku_tamu / quest_bh_indeks / quest_bh_pesan | PARTIAL — NPC-driven; not browser verified |
| quest_pagar_utara | PARTIAL — NPC-driven; not browser verified |
| quest_bunga_jalan | PARTIAL — flower collection; flower consumed only on success |
| collect_wood (village intro) | PARTIAL — registered; not browser verified |

## 9. Location and exploration audit
- Bellhaven Market echo carving (280,24) added: walkable and reachable from market start by BFS (test added).
- Zone gates unchanged. Zone connectivity validated by `check:world`.
- Not browser verified: spawn overlaps with exit triggers, locked-zone recovery (handover item 7).

## 10. Enemy and boss matrix
- `thorn_sprite` (catalogue): definition exists; battle encounters use inline stats instead. Duplicate source of truth — noted, not refactored (out of bounded scope).
- Boss: none. Not added (no confirmed requirement in blueprint).

## 11. Item, equipment, skill audit
- 11 items: each has id, name, description, category, stackLimit. No placeholder text found.
- Equipment slot definitions: `weapon`, `body`. Compatibility not browser tested.
- Skills: `minor_heal`, `ember`, `mira_mend`, `mira_spark` — in battle code paths.

## 12. Progression and reward audit
- EXP: NOT IMPLEMENTED. Battle reward = gold and items only.
- Quest rewards: granted via `quest.completed` event handler (verified in source).
- **P3 (confirmed by source):** `QuestLog` has no `complete()` method. Dialogue effects `completeQuest` are a no-op; quests finish only via objectives. All current quests reach completion through objectives, so no reward is lost, but the effect is dead code. Not changed (bounded P3; changing it would alter behavior of quest completion paths).
- **Open decision (P3, not fixed):** `ch1_ending` is never played. Wiring it changes the Chapter 1 ending order relative to `ch1_memory_slip` and party banter; that is a narrative decision for the owner.

## 13. Confirmed defects and fixes
| ID | Sev | Defect | Fix | Test |
|---|---|---|---|---|
| D1 | P1 | Main quests Bab 2–5 never accepted in play; logs empty, rewards unreachable | `_ensureMainQuest` on chapter entry; backfill of flags; `_migrateMainQuests` for old saves | Batch92: accept, backfill, migration |
| D2 | P1 | `ch5_bellhaven_echo` never triggered; Ch5 echo objective impossible | `_spawnCh5Echo` at market, (280,24) | reachability BFS + spawn gating |
| D3 | P1 | `ch5_memories_we_carry` never triggered; `ch5_memories_discussed` objective impossible | `_maybeCh5Memories` on road transition | once-only test |
| D4 | P1 | Ch4 three-records beat never triggered; objective 'three' impossible; banter unreachable | queue `ch4_three_records_resonance` when all 3 record flags set | conditional + flag/objective test |
| D5 | P2 | Fountain inscription unreachable; quest_ch4_surat could not complete | fountain handler starts inscription while quest active | inscription flag/objective test |
| D6 | P2 | Mural side quest unreachable | mural handler: offer / done | decline + accept + copy-completion test |
| D7 | P2 | Save/load replayed one-time banter and story steps | `world.flags.meta` stores `partySeen`, `dialogueDone` | NOT UNIT TESTED (save payload round trip) |
| D8 | P2 | Battle debug key `B` starts battles in normal play (farmable gold/items) | gated by `_debugHud` | NOT UNIT TESTED (key input) |
| D9 | P3 | Enemy name "Thorn Sprite" in English; toast "Serigala" mismatched | renamed "Sprite Duri"; toast "Sprite Duri melompat dari semak!" | existing suite |

Also structural: effect handler moved from a constructor closure to `_applyDialogueEffects` prototype method (same behavior; enables harness tests). `MAIN_QUEST_CHAPTERS` exported.

## 14. Regression results
- Full suite 395/395 after changes. Pre-existing 382 unchanged in assertions; no test weakened.
- Harness fixed: `sceneHarness.js` now registers Chapter 4 dialogues, forwards dialogue effects to the scene, and adds `playThrough` (advances nodes so node effects fire). `playToEnd` is kept unchanged for existing tests.

## 15. Remaining content gaps
1. No EXP/level system; battle rewards are gold/items only.
2. One encounter (one-shot ambush on road). No boss. Enemy catalogue has 1 entry; encounter stats are inline.
3. Kael, Tavi, Sera: correctly absent for Arc I.
4. `ch1_ending` unused: needs owner decision on placement.
5. `ch2_obj_silent_stone`, `ch3_plaza_timm_ch3`: unused dialogues; no trigger designed.
6. `completeQuest` effect is a no-op (P3).
7. Entity catalogue not implemented (`content/entities/README.md`).

## 16. Release-readiness assessment
- Automated gate: PASS (395/395, validators OK).
- Browser runtime: **NOT RUN.** Environment blocks game navigation in prior batches; not re-attempted successfully in this batch. All browser-dependent items remain NOT TESTED.
- Clean-profile Ch1→5 playthrough: NOT TESTED.
- Save/load round trip in a real browser: NOT TESTED.
- Recommendation: NOT RELEASE-READY. Treat the P1 fixes as source-verified only until a browser playthrough confirms: quest log shows each main quest on chapter entry; Ch5 echo, memories, mural, and Ch4 three-records/fountain fire in order; Muat does not replay banter.
