# Project Ledger — Narrative Bible Production
**THE ATLAS OF UNREMEMBERED STARS**  
**Status:** In progress (discovery complete; architecture & chapter expansion underway)  
**Date:** 2026-11-14  
**Authority:** MASTER DIRECTIVE (narrative & content design only; no code changes)

## Confirmed Canon (verified from existing docs)
- Runtime IDs: `orin`, `mira`, `kael`, `iven`, `tavi` (CHARACTER_ID_MAP.md, progression.js).
- Six arcs, 30 chapters (MAIN_STORY_OUTLINE.md, HANDOVER v2).
- Arc I: Ch.1–5; Arc II: 6–10; Arc III: 11–15; Arc IV: 16–20; Arc V: 21–25; Arc VI: 26–30.
- Vaelor Senn = Curator; full identity reveal planned Chapter 20 (ANTAGONIST_BIBLE.md).
- 12 regions documented (REGIONAL_BIBLE.md); 10 playable zones currently implemented (world-registry.js + zone data).
- No background music (D-012 / AudioCatalog policy).
- All player-facing narrative in Bahasa Indonesia.
- Save compatibility and permanent IDs must be preserved.
- Chapter 6 has Kael recruitment + first-watch scene (implemented).
- Party roster up to 5 recruited, 4 active in battle.

## Existing Documents Inspected
- docs/narrative/MAIN_STORY_OUTLINE.md
- docs/narrative/CHARACTER_BIBLE.md
- docs/narrative/CHARACTER_ID_MAP.md
- docs/narrative/ANTAGONIST_BIBLE.md
- docs/narrative/CHARACTER_KNOWLEDGE_MATRIX.md
- docs/narrative/NARRATIVE_CONTINUITY_RULES.md
- docs/narrative/MASTER_TIMELINE.md
- docs/narrative/MYSTERY_REGISTER.md
- docs/narrative/FORESHADOWING_REGISTER.md
- docs/narrative/WORLD_BIBLE.md
- docs/narrative/REGIONAL_BIBLE.md
- docs/narrative/MONSTER_LORE_ARCHITECTURE.md
- docs/narrative/CONTENT_ID_REGISTRY.md
- docs/narrative/CONTENT_SCHEMA.md
- docs/handover/HANDOVER_JRPG_ROADMAP_v2.md
- docs/00-project/DECISION_LOG.md
- content/world/world-registry.js
- content/characters/progression.js (referenced)
- content/enemies/arc_01.js (sample)

## Documents Not Found (or not yet created under listed names)
- WORLD_MASTER_PLAN.md (regional + world bible exist instead)
- WORLD_CONNECTION_GRAPH.md (not present as standalone; neighbors exist in registry)
- Some chapter scripts beyond Ch.1–5 are outline-only.

## New Proposed Canon (this production)
- Detailed chapter-by-chapter narrative plans for Chapters 6–30 (expanding existing outlines).
- Expanded NPC voices, quest seeds, and dialogue samples in Bahasa Indonesia.
- Mystery and foreshadowing refinements that do not contradict existing registers.
- Ending variants (2–3) with clear requirements.

## Unresolved Decisions (require owner approval)
- Exact recruitment timing and full arc for Sera Nhal, Neris Avel, Bram Alder (currently no runtime IDs).
- Final ending count and precise flags (intended 2–3; details not locked).
- Whether optional overworld map (FF6) is narrative-mandatory or purely exploratory.
- Depth of Curator agent presence in early arcs (existing docs are light).

## Completion Status
| Stage | Status |
|-------|--------|
| 1. Repository & canon audit | COMPLETE (Phase A re-audit) |
| 2. Canon & continuity baseline | COMPLETE (this ledger) |
| 3. Complete story architecture | COMPLETE |
| 4. Chapter-by-chapter narrative plan | COMPLETE |
| 5. Character and relationship bible | COMPLETE |
| 6. World and location bible | COMPLETE |
| 7–12. Subsequent stages | PENDING |

## Continuity Risks
- Late-chapter outlines are thin; expansion must not contradict early planted mysteries.
- Runtime ID expansion for remaining party members not yet approved.
- HD 3D visual direction (D-021) is approved but not implemented; narrative must remain renderer-agnostic.

## Owner Approval Status
All new narrative material in this production is **proposed** until reviewed. Existing approved decisions (D-xxx, runtime IDs, no-BGM, etc.) remain untouched.


## Phase B Status
COMPLETE — Master Story Architecture (Ch.1–30) created. Chapters 1–5 respect Phase A audit (Mira timing noted). No code modified.


## Phase C Status
COMPLETE — Character and Party Bible expanded. Runtime IDs preserved. No code modified.


## Phase D Status
COMPLETE — World, Location, NPC, and Faction Bible. All existing region/zone IDs preserved. No code modified.


## Phase E Status
COMPLETE — Enemy, Monster, and Boss Bible. Existing IDs and optional/main flags preserved. No combat code or stats changed.


## Phase F Status
COMPLETE (deep) — Main/Side/Character quests, items, dependency matrix, and flag catalog. Existing quest IDs and flag style preserved. No code modified.


## Phase G Status
COMPLETE — Full dialogue and cutscene production for key scenes Chapters 6-30 in Bahasa Indonesia. Chapter 1-5 audited and preserved. No runtime dialogue files modified.


## Phase H Status
COMPLETE — Narrative continuity audit, updated timeline/mystery/foreshadowing, final ID registry, completeness matrix, and coding agent handover. All unresolved decisions listed. No code modified. Narrative bible (Phases A–H) finished as design.
