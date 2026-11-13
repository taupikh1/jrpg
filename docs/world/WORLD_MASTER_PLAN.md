# World Master Plan — LUMERRA

**Title:** THE ATLAS OF UNREMEMBERED STARS  
**Architecture:** Zone-based (locked). Hierarchy: **World → Region → Subregion → Zone**.

## 1. World overview

Lumerra is a temperate-to-varied continent wrapped by coastal seas, cut by the **Spine of Echoes** (central highlands) and the **Ashen lowlands** to the west. Natural magic (**Resonance**) concentrates along old lattice scars; **The Stillness** frays memory densest near broken nodes and sealed Accord sites.

### Geographic logic

- Western river vales (Ashwillow, Bellhaven) → trade roads to coastal **Glass Lantern**.
- Northern **Ashen Crown** plains sit behind the **Silent March** border moors.
- Southern **Verdant Veil** jungles hide surface ruins above **Underdeep**.
- Eastern mist highlands hold **Sleeping Kings** libraries.
- Far core anomaly: **Heart of Lumerra** (endgame locus).
- **Starfall Plain** is an open grassland corridor between crown and coast.
- **Echo Road** is a scarred transit belt used in Arc V, not a starter biome.

### Climate (high level)

| Band | Regions | Climate |
|------|---------|---------|
| Mild river | Ashwillow, Bellhaven, Whispering Wood | Temperate, seasonal rain |
| Cool plains | Ashen Crown, Silent March, Starfall | Cool, windy |
| Maritime | Glass Lantern, coastal Tidefolk reach | Mild, humid |
| Lush / subterranean | Verdant Veil, Underdeep | Warm surface / cool deep |
| Highland mist | Sleeping Kings | Cool, fog |
| Anomalous | Heart of Lumerra, Echo Road scars | Unstable Resonance weather |

## 2. Major region registry (canonical 12)

| ID | Name | Type | Biome focus | Story arcs | Status |
|----|------|------|-------------|------------|--------|
| region_ashwillow | Ashwillow Vale | Heartland vale | River, village fields | Arc I Ch.1 | **Playable slice** |
| region_whispering_wood | Whispering Wood | Forest | Temperate woodland | Arc I Ch.2 | **Playable zone** (`forest`) |
| region_bellhaven | Bellhaven Reaches | Trade hills | Roads, market town | Arc I Ch.3–4 | Planned |
| region_ashen_crown | Ashen Crown Heartland | Kingdom core | Plains, capital approaches | Arc II Ch.6 | Planned |
| region_silent_march | Silent March | Border | Moors, watchposts | Arc II Ch.7 | Planned |
| region_glass_lantern | Glass Lantern | Port city-region | Urban coast | Arc II Ch.8 | Planned |
| region_starfall_plain | Starfall Plain | Corridor | Grassland, night sky | Arc II Ch.10 | Planned |
| region_verdant_veil | Verdant Veil | Ruin-jungle | Lush canopy | Arc III Ch.11 | Planned |
| region_underdeep | Underdeep | Subterranean | Cavern holds | Arc III Ch.12 | Planned |
| region_sleeping_kings | Sleeping Kings Range | Highland | Mist, libraries | Arc III Ch.13 | Planned |
| region_echo_road | Road of Forgotten Echoes | Scar road | Mixed ruined path | Arc V Ch.21 | Planned |
| region_heart_lumerra | Heart of Lumerra | Core anomaly | Lattice locus | Arc V–VI | Planned |

## 3. Hierarchy definitions

- **Region:** Narrative + geographic grouping (canon ID `region_*`).
- **Subregion:** Logical area inside a region (e.g. village core, forest edge).
- **Zone:** Single loadable `ZoneData` instance managed by `ZoneManager`.

## 4. Settlement hierarchy (framework)

Categories: village, trading_post, town, city, capital, outpost, ruined.

**Ashwillow (implemented context):** settlement_ashwillow_village — small village; elder, guard, merchant, crafter; Chapter 1 hub.

## 5. Dungeon framework (not fully implemented)

Types: story, optional, ruin, underdeep, lair, temple, secret, endgame.

Production of full dungeon maps is **out of Batch 8.0 scope** beyond registry stubs.

## 6. Stillness / Resonance geography

- Early symptoms: rural memory slips (Ashwillow).
- Border amnesia: Silent March treaties.
- Lattice tech exposure: Underdeep / Sleeping Kings.
- Climactic locus: Heart of Lumerra.

## 7. Production roadmap (post-8.0)

1. Bellhaven road zone (Ch.3)  
2. Archive approach (Ch.4)  
3. Ashen Crown approach (Ch.6)  
4. Remaining regions by arc order  

Measure completion by: zone playable + connection validated + chapter matrix link + tests.
