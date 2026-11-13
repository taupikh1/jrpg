# Regional Gameplay Framework

## Per-region content slots (future production)

| Slot | Purpose | Engine hook |
|------|---------|-------------|
| NPC roles | Elder, guard, merchant, quest givers | Entity + Interaction + Dialogue |
| Shops | Consumables / equipment | Inventory + ItemRegistry |
| Side quests | Regional stories | QuestLog |
| Gather nodes | Materials | Interact + inventory.item_added |
| Encounters | Habitat tables | BattleManager (later batches) |
| Dungeons | Optional/story | Zone connections |
| Mysteries | Stillness crumbs | Flags + dialogue |

## Ashwillow (current vertical slice)
- NPCs: Henn, Renda, Soli, Nima, Tori, Jarek, Mira encounter
- Quest: `quest_pagar_utara`
- Gather: forest `wood_scrap`
- Transition: village ↔ forest

## Design rules
1. Every settlement needs at least one gameplay verb (talk, trade, quest, rest, or gate).
2. Monster habitats must match biome (framework only in 8.0).
3. Do not mass-generate empty NPCs.
