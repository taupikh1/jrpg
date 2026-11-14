# Asset Registry Reference

| Field | Required | Description |
|-------|----------|-------------|
| id | yes | Stable asset id |
| path | yes | URL/path relative to served root |
| category | yes | character / npc / enemy / tileset / ui / item |
| licenseStatus | no | Default LICENSE_UNVERIFIED |
| source | no | Provenance string |
| animation | no | Map of state → { frameCount, frameWidth, frameHeight, frameDuration, originX, originY, loop } |
| tileset | no | { tileWidth, tileHeight } |
| role | no | Narrative role note |

API: `register`, `get`, `has`, `list(category?)`, `framesFor(id, state)`, `missingReport(ids)`.
