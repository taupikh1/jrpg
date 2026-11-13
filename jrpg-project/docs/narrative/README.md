# Narrative Documentation — THE ATLAS OF UNREMEMBERED STARS

Canonical story foundation for the Lumerra JRPG.

**Working title:** THE ATLAS OF UNREMEMBERED STARS  
**World:** Lumerra  
**Batch:** 7 (Story Bible & Narrative Architecture)

## Document Index

| File | Purpose |
|------|---------|
| [STORY_BIBLE.md](./STORY_BIBLE.md) | High-level pitch, themes, structure |
| [WORLD_BIBLE.md](./WORLD_BIBLE.md) | World identity and regions overview |
| [WORLD_HISTORY.md](./WORLD_HISTORY.md) | Chronological history |
| [MAGIC_SYSTEM.md](./MAGIC_SYSTEM.md) | Resonance rules |
| [STILLNESS_LORE.md](./STILLNESS_LORE.md) | Central mystery mechanics |
| [CHARACTER_BIBLE.md](./CHARACTER_BIBLE.md) | Orin + 7 companions |
| [PARTY_RELATIONSHIPS.md](./PARTY_RELATIONSHIPS.md) | Relationship matrix |
| [ANTAGONIST_BIBLE.md](./ANTAGONIST_BIBLE.md) | Vaelor Senn / The Curator |
| [FACTION_BIBLE.md](./FACTION_BIBLE.md) | Kingdoms and organizations |
| [REGIONAL_BIBLE.md](./REGIONAL_BIBLE.md) | 12 major regions |
| [MAIN_STORY_OUTLINE.md](./MAIN_STORY_OUTLINE.md) | 30 chapters / 6 arcs |
| [SIDE_QUEST_ARCHITECTURE.md](./SIDE_QUEST_ARCHITECTURE.md) | Quest categories & policy |
| [MONSTER_LORE_ARCHITECTURE.md](./MONSTER_LORE_ARCHITECTURE.md) | Ecology rules |
| [DIALOGUE_STYLE_GUIDE.md](./DIALOGUE_STYLE_GUIDE.md) | Voice standards + samples |
| [NARRATIVE_CONTINUITY_RULES.md](./NARRATIVE_CONTINUITY_RULES.md) | Continuity policy |
| [MASTER_TIMELINE.md](./MASTER_TIMELINE.md) | Full timeline |
| [MYSTERY_REGISTER.md](./MYSTERY_REGISTER.md) | Mysteries → resolutions |
| [FORESHADOWING_REGISTER.md](./FORESHADOWING_REGISTER.md) | Clue → payoff map |
| [CHARACTER_KNOWLEDGE_MATRIX.md](./CHARACTER_KNOWLEDGE_MATRIX.md) | Who knows what when |
| [STORY_DEPENDENCY_GRAPH.md](./STORY_DEPENDENCY_GRAPH.md) | Chapter prerequisites |
| [CONTENT_ID_REGISTRY.md](./CONTENT_ID_REGISTRY.md) | Stable IDs |
| [CONTENT_SCHEMA.md](./CONTENT_SCHEMA.md) | JSON schemas for engine |
| [CHANGELOG.md](./CHANGELOG.md) | Canon revisions |

## Canon Rules

1. Future batches must not contradict this bible without a documented CHANGELOG entry.
2. All content IDs use the registry format (`character_*`, `chapter_*`, etc.).
3. Dialogue and quest JSON must match schemas compatible with Batch 5 DialogueEngine and QuestLog.
4. No copyrighted external IP.

## Engine Compatibility

- Dialogue → `DialogueEngine` (nodes, choices, effects)
- Quests → `QuestLog` (objectives: talk, collect, defeat, reach, custom)
- Items → `ItemRegistry` / Inventory
- Zones → `ZoneManager` (Batch 3)
- Saves → Batch 6 SaveManager (quest states, inventory, position)
