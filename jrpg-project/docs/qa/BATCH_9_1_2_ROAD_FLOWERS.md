# P1 — Road flowers
- Quest `quest_bunga_jalan` needs 3 `road_flower` (source: `content/quests/arc_01/quest_bunga_jalan.js`); spawns: 4.
- Root cause 1: `[[1,[x,y]],...].entries()` gave `pos=[i,[n,[x,y]]]` so x=index, y=array. Root cause 2 (found by tests): 4th point (360,130) is tile (22,8) = water (solid), unreachable. Root cause 3: `oneShot` consumed the flower even when inventory was full.
- Fix: `ROAD_FLOWER_SPAWNS` exported from the quest file ([80,48],[160,140],[320,48],[344,130]); scene validates finite coords (skips + console.error), consumes flower only on successful `inventory.add`, removes entity on pickup.
- Tests: `tests/unit/world/RoadFlowers.test.js` (5, unit/integration on real tilemap + pathfinder + QuestLog): finite coords, count >= objective, walkable+reachable, per-pickup progress, single completion, no over-count.
- Not verified: actual entity creation count and pickup by player input (browser). The quest's `road_npc_merchant_ode_complete` path was read in source only.
