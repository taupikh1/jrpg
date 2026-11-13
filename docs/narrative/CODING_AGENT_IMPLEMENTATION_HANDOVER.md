# Coding Agent Implementation Handover (Phase H)
**Narrative design is complete enough for implementation. Do not invent missing story.**

## Mapping to Roadmap Batches
| Batch | Chapters | Primary Narrative Sources |
|-------|----------|---------------------------|
| B34 | 6–7 | MAIN_QUEST_BIBLE, CHAPTER_06_10_FULL_DIALOGUE, CHARACTER_BIBLE |
| B35 | 8–9 | Same + ITEM_AND_EQUIPMENT_BIBLE |
| B36 | 10 + Arc II sides | CHAPTER_06_10_FULL_DIALOGUE, SIDE_QUEST_BIBLE, BOSS_BIBLE |
| B38–B42 | 11–20 | CHAPTER_11_15 & 16_20 dialogue, quest bibles, Vaelor reveal |
| B43–B46 | 21–30 | CHAPTER_21_25 & 26_30 dialogue, ENDING_DESIGN, final flags |

## Implementation Rules
- Preserve all runtime IDs and existing save compatibility.
- Use existing QuestLog flag/objective style.
- Player-facing text must stay in Bahasa Indonesia (copy from dialogue docs).
- Optional bosses and side quests must never gate main progression.
- Do not reveal Vaelor’s identity before the Chapter 20 scene.
- No background music.

## What Is Ready
- Full story architecture and chapter matrix.
- Detailed main quests for 1–10; structured for 11–30.
- Key dialogue scenes for all major beats and endings.
- Character voices, knowledge rules, and relationship beats.
- World, NPC, faction, enemy, and boss narrative placement.
- Flag catalog and dependency matrix.
- Three endings with conditions.

## What Still Needs Owner Decision Before Full Implementation
1. Runtime IDs + exact join chapters for Sera Nhal, Neris Avel, Bram Alder.
2. Final numeric balance for new items/equipment.
3. Precise flag thresholds for Ending C (if relationship values are added later).
4. Approval of any new zone layouts beyond existing Arc I playable zones.

## What a Coding Agent Must Not Do
- Invent new main story events.
- Change existing character motivations or the Chapter 20 reveal timing.
- Make optional content mandatory.
- Modify save schema without a version bump and migration test.

Narrative phase (A–H) is complete as design. Implementation remains separate.
