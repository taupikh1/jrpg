# Asset Inventory — PixelSRPG-Forge (Milestone 0)
**Date:** 2026-11-14  
**Source:** Extracted from attached PixelSRPG-Forge-main.zip  
**Status:** Audit only. No assets integrated.

## Repository Structure
The pack is organized as category folders containing mostly nested ZIP archives (not loose ready-to-use files).

| Category Folder | Contents Observed | Format | Notes |
|-----------------|-------------------|--------|-------|
| Characters_角色人物 | monster.zip (~97 PNGs) | Nested zip | Bat, Bee, Bunny, AngryPig, etc. with Idle/Walk/Hit frames. No clear hero party sheets at top level. |
| Weapons_武器装备 | weapons-MapleStory.zip (728 PNGs) | Nested zip | Named MapleStory. High license risk. |
| Skill_Icons_技能图标 | Skill_Icons-MapleStory.zip + previews | Nested zip | MapleStory origin. High license risk. |
| UI_Elements_界面元素 | IconsPropsMonsters.zip (173 PNGs) + preview | Nested zip | Backgrounds, item boxes, props. |
| Buildings_建筑场景 | Tiles-SandstoneDungeons.zip | Nested zip | Dungeon tiles, doors, props, character parts. |
| Terrain_地形地块 | cave.png only | Single PNG | Very limited loose terrain. |
| Asset_Packs_素材套图 | 2D Pixel Dungeon, CleanCity, FarmLife, Basement of a Thief | Nested zips | Mixed tilesets + animations. |
| Interior_Decoration_室内装饰 | Interior_1.png, Interior_2.png | Loose PNGs | Two interior references. |
| other_其他素材3万多张 | Large icons zip | Nested zip | ~31k small icons claimed. |

## Asset Categories Present
- Monster sprites with basic animations (idle/walk/hit/fly) — usable style, small frame sizes (~32–46 px).
- Dungeon and city tilesets (Sandstone, 2D Pixel Dungeon, CleanCity).
- UI/item icon sheets.
- Weapon and skill icon collections (MapleStory-sourced).
- Limited loose terrain (one cave image).

## Missing or Incomplete for Full JRPG Overhaul
- No ready-made complete overworld maps.
- No clearly labeled, high-quality multi-directional hero sheets for Orin/Mira/Kael-style party at top level.
- Very little loose terrain variety (grass, water, forest tiles not immediately available as organized tilesets outside nested packs).
- No dedicated battle background sets identified in quick inventory.
- Audio not the focus; no BGM to be added anyway.

## Compatibility Notes
- Most content is PNG with transparency.
- Frame sizes are small and consistent with pixel art.
- Nested zips require extraction and metadata creation before use.
- Current JRPG uses procedural pixel generation + TilemapRenderer; external sheets can be loaded via existing AssetManager/TextureCache.

## Licensing Flag
See ASSET_LICENSE_AUDIT.md. Many assets (especially MapleStory-named) are LICENSE_UNVERIFIED or high-risk.
