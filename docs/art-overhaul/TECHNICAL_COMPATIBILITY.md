# Technical Compatibility Report (Milestone 0)

## Compatible
- Canvas 2D + existing SpriteRenderer / TextureCache / AssetManager can load external PNGs.
- TilemapRenderer already supports image-based tilesets.
- Small pixel frame sizes (32–48 px) match current logical resolution approach.
- Transparency preserved in observed PNGs.
- No engine migration required.

## Processing Needed
- Extract all candidate nested zips.
- Identify consistent tile/frame dimensions per pack.
- Generate simple animation metadata (JSON) for Idle/Walk/Hit.
- Normalize naming and place under assets/art-overhaul/ without breaking existing paths.
- Create atlas or individual loads (start with individual for simplicity — Ponytail).

## Risks
- Mixed art styles across packs (dungeon vs city vs monsters) may need palette or scale harmonization.
- MapleStory assets must be excluded until cleared.
- Large 31k icon zip is oversized for mobile; do not load wholesale.
- No ready overworld maps — zones must be rebuilt from tiles.

## Mobile
- Keep sprite scale integer.
- Avoid large uncompressed atlases.
- Test on iPhone 13 landscape safe areas after Milestone 1 prototype.
