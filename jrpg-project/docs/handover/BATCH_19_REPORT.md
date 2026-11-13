# B19 — Katalog Musuh Arc I dan II

## Scope and implementation
- Arc I: 9 enemies in `content/enemies/arc_01.js`.
- Arc II: 9 enemies in `content/enemies/arc_02.js`.
- Added `content/enemies/index.js`, `createEnemyParticipant.js`, and deterministic cyclic enemy actions in `BattleManager`.
- The existing road encounter now builds its Sprite Duri participants through the shared factory and carries affinity/AI data.
- Every enemy definition includes stable ID, Indonesian name/description, region/habitat, ecology category, stats, rewards, affinities, and AI actions.

## Verification
- Every Arc I/II entry is instantiated and performs a real action through `BattleManager` in automated tests.
- Catalogue validation checks count, ID, region, category, stats, affinity, status, and action contracts.
- The combined Phase 3 final gate later revalidates this catalogue together with Arcs III–VI and all bosses.

## Boundaries
- Catalogue availability is not the same as world placement. Only the existing Sprite Duri road encounter is currently wired to a playable map trigger; the other definitions are tested as combat encounters but are not all placed in maps.
- No new visual assets or map zones were created in this batch.
