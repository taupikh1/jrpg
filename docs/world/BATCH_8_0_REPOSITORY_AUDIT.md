# Batch 8.0 — Repository Audit (Read-Only Findings)

**Baseline tests:** 149 pass, 0 fail (pre-implementation).  
**Date context:** continuation from Batch 7.2.2 checkpoint.

## World engine modules (reuse — do not duplicate)

| Module | Path | Role |
|--------|------|------|
| ZoneManager | `src/engine/world/zones/ZoneManager.js` | Register zones/tilesets, activate one zone, transitions |
| Zone | `src/engine/world/zones/Zone.js` | ZoneData runtime: spawns, connections, tilemap |
| Tilemap / Tileset / Renderer | `src/engine/world/tilemap/*`, `tileset/` | Grid maps, collision costs |
| CollisionWorld | `src/engine/world/collision/Collision.js` | Solid tiles, triggers, AABB |
| NavGrid + A* | `src/engine/world/navigation/NavGrid.js` | Pathfinding |
| GameplayDemoScene | `src/scenes/GameplayDemoScene.js` | Chapter 1 vertical play |

## Existing playable geography

| Zone ID | Display (demo) | Notes |
|---------|----------------|-------|
| `village` | Test Village | Chapter 1 Ashwillow stand-in; NPCs, quests, dialogue |
| `forest` | Whispering Forest path | Linked via `to_forest` / return triggers |

Connection: village south trigger → forest; forest north → village.

## Canon geography (Batch 7)

12 regions in `docs/narrative/REGIONAL_BIBLE.md` and `content/narrative/canon-registry.json`:

`region_ashwillow`, `region_whispering_wood`, `region_bellhaven`, `region_ashen_crown`, `region_silent_march`, `region_glass_lantern`, `region_starfall_plain`, `region_verdant_veil`, `region_underdeep`, `region_sleeping_kings`, `region_echo_road`, `region_heart_lumerra`

Hierarchy **not** yet encoded in zone data: zones lack `regionId` / `subregionId` metadata.

## Gaps

1. No world registry module linking regions → zones.
2. Zone IDs `village`/`forest` not aligned to canon ID style (`zone_*`) — **preserve** for compatibility; alias via metadata.
3. Only 2 playable zones; remaining regions documentation-only.
4. No world connection graph validator.
5. Player-facing zone names still partly English in demo-data (`Test Village`).

## Contracts to preserve

- `ZoneManager.registerZone`, `activate`, `tryTransitionAt`
- `ZoneData`: id, name, tilemap, spawnPoints, connections, env
- Entity cleanup on transition (GameplayDemoScene)
- Chapter 1 dialogue/quest IDs

## Architectural decision (Batch 8.0)

Reuse ZoneManager; add **content-layer** registries (`content/world/world-registry.js`) and optional zone metadata fields without forking the engine.
