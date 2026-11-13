# Batch 8.1 Repository Audit

**Baseline:** 155 tests pass (Batch 8.0).

## Existing zones
- `village` (Desa Ashwillow), `forest` (Hutan Berbisik)
- Connections: village ↔ forest only (before this batch)

## Canon route for Chapter 3
Ashwillow → Whispering Wood → **road toward Bellhaven** (`region_bellhaven`).

## Reused systems
ZoneManager, Tilemap, Collision, NavGrid, InteractionSystem, DialogueEngine, QuestLog, BattleManager (demo KeyB / trigger), Inventory.

## Gaps addressed
- No Bellhaven approach zone
- Forest had no south exit toward Bellhaven
- No regional optional quest on the road
