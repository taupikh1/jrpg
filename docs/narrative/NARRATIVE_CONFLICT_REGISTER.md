# Narrative Conflict Register
**Status:** Phase A audit. Only conflicts with evidence from source or approved docs.

## NC-001 — Mira recruitment chapter
- **Sources:** `MAIN_STORY_OUTLINE.md` (joins Ch.2) vs `content/dialogue/arc_01/chapter_01.js` (`ch1_mira_encounter` sets `ch1_mira_follow`) vs `PartyRoster.js`
- **Conflict:** Outline places Mira’s join in Chapter 2; runtime flag and dialogue are in Chapter 1.
- **Player impact:** Mira is available earlier than the outline states.
- **Recommended resolution:** Treat runtime as authoritative for gameplay. Update outline note to “Mira encounter and follow flag in Ch.1; full commitment beat may continue into Ch.2”.
- **Owner approval:** Recommended (small documentation alignment).

## NC-002 — Chapter 2 title vs quest name
- **Sources:** Outline “A Voice in the Forgotten Forest” vs quest `quest_ch2_suara_hutan` (“Suara dari Dalam Hutan”)
- **Conflict:** Minor naming difference.
- **Impact:** None on gameplay.
- **Resolution:** Keep both; quest name is player-facing Indonesian.
- **Owner approval:** Not required.

## NC-003 — Boss optional status
- **Sources:** `content/bosses/arc_01.js` marks `archive_veilkeeper` as `optional: true, requiredForMainStory: false`
- **Conflict:** None found. Matches “optional mini-boss” intent.
- **Status:** Confirmed consistent.

## NC-004 — Later party members
- **Sources:** CHARACTER_BIBLE lists Sera, Neris, Bram; no runtime IDs or join flags yet.
- **Conflict:** Planned vs implemented.
- **Impact:** Cannot recruit them in current build.
- **Resolution:** Keep as planned. Do not invent runtime IDs without approval.
- **Owner approval:** Required before implementation.

## NC-005 — Region playable status
- **Sources:** REGIONAL_BIBLE vs world-registry.js `status: 'planned'` for regions after Bellhaven.
- **Conflict:** None. Documentation and code agree that only Arc I zones are currently playable.
- **Status:** Consistent.

## Summary
One material documentation/runtime mismatch (Mira timing). All other checked items are either consistent or explicitly planned-but-not-implemented. No silent canon rewrites performed.
