# Asset License Audit — PixelSRPG-Forge (Milestone 0)
**Mandatory. Do not assume MIT covers individual images.**

## Repository-Level
- Repo LICENSE file is MIT.
- README states the MIT license covers organization/structure; individual assets may have different or unclear rights.
- Explicit warning in the master prompt matches this.

## Per-Group Assessment

| Asset Group | Observed Origin Signal | License Status | Recommendation |
|-------------|------------------------|----------------|----------------|
| weapons-MapleStory.zip | Filename + content style = MapleStory | LICENSE_UNVERIFIED / High risk | Do not use in release without clear proof of rights. Flag for owner. |
| Skill_Icons-MapleStory.zip | Filename = MapleStory | LICENSE_UNVERIFIED / High risk | Same as above. |
| monster.zip (Bat, Bee, Bunny, etc.) | Common free-pack style (possible itch.io or similar) | LICENSE_UNVERIFIED | Inspect inner READMEs/licenses after full extract. Usable only after verification. |
| 2D Pixel Dungeon Asset Pack | Common free tileset style | LICENSE_UNVERIFIED | Check for license file inside zip before use. |
| CleanCity.zip / FarmLife.zip / Basement of a Thief.zip | Various free packs | LICENSE_UNVERIFIED | Same. |
| Tiles-SandstoneDungeons.zip | Dungeon tileset | LICENSE_UNVERIFIED | Same. |
| IconsPropsMonsters.zip | UI/icons | LICENSE_UNVERIFIED | Same. |
| cave.png / Interior_*.png | Loose files | LICENSE_UNVERIFIED | Same. |
| Large 31k icons zip | Unknown bulk | LICENSE_UNVERIFIED | High caution; likely mixed sources. |

## Rules Applied
- No asset is claimed MIT or commercial-safe without evidence inside the archive.
- MapleStory-derived assets are marked high-risk and excluded from any proposed release mapping until owner provides proof.
- Attribution requirements unknown for most packs.

## Owner Decision Required
Before any release build that includes these assets:
1. Confirm rights for each pack actually used.
2. Approve or reject MapleStory-named content.
3. Decide whether to proceed with only packs that have clear free/open licenses after deeper inspection.
