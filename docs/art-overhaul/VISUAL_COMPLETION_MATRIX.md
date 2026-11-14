# Visual Completion Matrix
**Audit of actual source after remediation. SHA of prior ZIP verified:**  
`a691ce7175a6156f2f96d8cec1cf6236c2a5db96e5f6ddcb6bb77761a190bb29`

Counts from source, not estimates.

| Category | Identified | Fully migrated | Partial | Still procedural / placeholder | Missing | Notes |
|----------|------------|----------------|---------|--------------------------------|---------|-------|
| Playable zones (Arc I) | 10 | 0 | 1 (prototype archive room) | 9 | outdoor tilesets | village, forest, road, bellhaven_*, resonance_ancient_site still procedural |
| Towns / villages | 2 (Ashwillow, Bellhaven) | 0 | 0 | 2 | city tiles | |
| Dungeons / interiors | 3 archive zones + site | 0 | 1 prototype | 3 | — | |
| Orin | 1 | 0 | 1 (stand-in in prototype) | production field/battle procedural | dedicated hero sheet | |
| Mira | 1 | 0 | 0 | 1 | suitable sheet | |
| Other party (kael, iven, tavi) | 3 | 0 | 0 | 3 | suitable sheets | |
| NPCs | multiple in dialogue | 0 | 1 (prototype scholar) | rest | role-matched sheets | |
| Regular enemies | 50 defs (arc_01–06) | 0 | 9 Arc I mapped to external sheets in battle | 41 | matching sheets | IDs/stats unchanged |
| Elite | included in enemy defs | 0 | 0 | all | — | |
| Bosses | 8 multi-phase (across arcs) | 0 | 0 | 8 | distinct boss sheets | phases untouched |
| Items | existing catalogue | 0 | 0 | all icons procedural | icon atlas | effects unchanged |
| Equipment | existing | 0 | 0 | procedural | non-MapleStory icons | |
| Battle effects | procedural / none external | 0 | 0 | all | effect sprites | |
| Menus / UI | main menu, battle, inventory | 0 | 1 (prototype window accent) | production UI procedural | UI frame set | |

## Source files involved
- `content/enemies/arc_0*.js` — enemy IDs
- `content/bosses/arc_0*.js` — boss IDs
- `src/engine/rendering/pixelart/*` — procedural fallback
- `src/scenes/GameplayDemoScene.js` — now tries external enemy draw
- `src/engine/assets/ExternalEnemySprites.js` — new bridge
- `content/art/enemy-visuals.js` — mappings
- `assets/art-overhaul/enemies/*` — extracted sheets
- `src/scenes/ArtPrototypeScene.js` — prototype

No completion percentage invented. Partial = asset registered and drawable in at least one path.
