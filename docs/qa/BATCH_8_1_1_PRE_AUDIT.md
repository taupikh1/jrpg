# Batch 8.1.1 Pre-Audit

## Zone metrics
| Zone | Tiles | Pixel size | Tile size |
|------|-------|------------|-----------|
| forest | 24×16 | 384×256 | 16×16 |
| road_bellhaven | 28×12 | 448×192 | 16×16 |

Coordinates are **world pixels** (not tile indices).

## Forest → road
- Trigger: `{ x:160, y:208, w:64, h:16 }` → y∈[208,224] **inside** 256px height
- Spawn on road: `from_forest` (32, 96) on main path band y∈[80,112]
- API check: `tryTransitionAt(180,212)` → road_bellhaven OK

## Road → forest
- Trigger: `{ x:0, y:80, w:16, h:48 }`
- Spawn: forest `deep` (192, 180)

## Content
NPCs Lyn/Ode, flowers, mile/cart/gate, ambush one-shot, quest_bunga_jalan.

## Storage
GameplayDemoScene uses MemoryStorageAdapter in demo path (IndexedDB not claimed).

## Baseline tests
161 pass prior to this QA batch.
