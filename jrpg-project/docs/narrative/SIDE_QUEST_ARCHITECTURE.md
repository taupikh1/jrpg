# Side Quest Architecture

## Targets (future production)
- 200–300 standard side quests
- 30–50 hidden quests
- Multi-stage chains; character questlines; regional sets

## Categories
| Category | Purpose | Example objective types |
|----------|---------|-------------------------|
| character | Personal arcs | talk, reach, custom |
| village | Local life | collect, deliver |
| investigation | Mystery crumbs | talk, reach |
| exploration | Map reward | reach |
| monster | Ecology / safety | defeat |
| collection | Materials | collect |
| dungeon | Optional delves | defeat, reach |
| faction | Reputation | talk, deliver |
| historical | Lore | talk, reach |
| hidden | Secret history | custom flags |
| chain | Multi-stage | sequential quest IDs |

## Continuity Policy
- Side quests may alter later NPC lines via quest status flags in QuestLog.
- Must not soft-lock main chapters except documented windows (e.g. post ch.19 some travel quests close).
- Avoid pure fetch without story beat (NPC motive, world detail, or character color).
- Hidden quests may reveal Accord/lattice crumbs that main path also covers later (no exclusivity of critical truth).

## Engine mapping
Objectives use Batch 5 types: `talk`, `collect`, `defeat`, `reach`, `custom`.
Rewards: items/gold via existing Inventory events.
