# Asset Mapping Proposal (Milestone 0)
**Proposal only. No files referenced that were not observed. MapleStory assets excluded from recommended mapping.**

| Existing Game Content | Required Category | Selected Source (observed) | Integration Method | License Status | Notes |
|-----------------------|-------------------|----------------------------|--------------------|----------------|-------|
| Orin / Mira / party | Playable character | No clear dedicated hero sheets found at top level | — | — | Gap. May use frames from Sandstone Characters-part or Dungeon_Character after verification. |
| NPCs | Character sprites | Sandstone Characters-part-*.png or dungeon character sheets | Sprite sheet + metadata | UNVERIFIED | Needs extraction + frame ID. |
| Regular enemies (thorn_sprite, etc.) | Monster sprites | monster.zip (Bat, Bee, Bunny, AngryPig, etc.) | Per-enemy sheet mapping | UNVERIFIED | Good animation frames (Idle/Walk/Hit). |
| Bosses | Large enemy | Larger frames from dungeon packs or scaled carefully | Custom scale, no stretch | UNVERIFIED | Must not reuse one sprite for all. |
| Village / forest / road zones | Terrain + props | CleanCity / FarmLife / 2D Pixel Dungeon tiles | Tileset via TilemapRenderer | UNVERIFIED | Extract and define tile size. |
| Archive / dungeon zones | Dungeon tiles | Tiles-SandstoneDungeons + 2D Pixel Dungeon | Tileset | UNVERIFIED | Strong candidate. |
| Items / inventory | Icons | IconsPropsMonsters.zip Items/ | Icon atlas | UNVERIFIED | Readable small icons. |
| Weapons / equipment icons | Icons | Prefer non-MapleStory sources only | — | High risk if MapleStory | Do not use MapleStory zip without approval. |
| Skills / UI | Icons + frames | IconsPropsMonsters + skill icons (non-MapleStory) | UI atlas | UNVERIFIED | |
| Battle background | Backdrop | None clearly identified | Procedural fallback or simple tiles | — | Gap. |

## Mapping Rules
- Do not invent filenames.
- Only map after full extract + license check of the specific zip.
- Preserve all runtime IDs, enemy IDs, zone IDs.
- Fallback to existing procedural art if a verified asset is unavailable.
