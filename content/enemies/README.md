# Enemy and Boss Content

The catalogue is data-driven and grouped by story arc:

- `arc_01.js` through `arc_06.js`: 8–10 regular/elite enemy definitions per arc (9, 9, 8, 8, 8, 8; 50 total).
- `index.js`: stable global lookup via `ENEMY_CATALOG` and `getEnemyById`.
- `content/bosses/arc_01.js` through `arc_06.js`: six main story bosses, one optional Arc I mini-boss, and one optional Arc II boss.
- `content/bosses/index.js`: global boss lookup.

Every regular enemy defines stable IDs, canon region/habitat, ecology category, Indonesian bestiary text, combat stats, rewards, elemental affinities and a deterministic cyclic AI action list. Every main boss has at least two explicit HP-threshold phases; story bosses in later arcs use three phases. Optional bosses are marked `requiredForMainStory: false` and do not gate the main path.

`BattleManager` consumes injected participant data and never imports content. Scene/composition code owns catalogue lookup and participant construction. `tools/enemy-catalog-validator.mjs` validates all six enemy arcs and all boss definitions. Unit tests instantiate every catalogue entry in a real `BattleManager` encounter.

The catalogue does not claim that every enemy or boss has been placed in explorable maps. World placement and chapter flow remain separate work; chapters beyond the current demo world are not represented as playable locations yet.
