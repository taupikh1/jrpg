# Batch 8.1.1 Browser Playthrough

**URL:** http://127.0.0.1:4173/  
**Server:** `python3 -m http.server 4173`  
**Tool:** browser automation + `window.__JRPG__`

| Test | Result | Evidence |
|------|--------|----------|
| A Chapter 1 village boot | **VERIFIED** | zone village, 12 ents, opening ID text |
| B Village→Forest | **VERIFIED** | zone forest, spawn from village |
| C Forest→road_bellhaven | **VERIFIED** | zone id, name Jalan Menuju Bellhaven, spawn (32,96), NPCs present |
| D Lyn dialogue | **VERIFIED** | speaker Lyn, Indonesian text |
| E Ode + quest accept | **VERIFIED** | status active |
| F Collect flowers | **VERIFIED** | inv ≥3 |
| G Quest complete + rewards | **VERIFIED** | status completed, gold 10, herb increased |
| H Gate landmark | **VERIFIED** | Bellhaven view narration |
| I Ambush→battle | **PARTIALLY VERIFIED** | battle mode active then restored to world; demo AI path not fully UI-walked |
| J Road→Forest return | **VERIFIED** | forest, spawn deep (192,180), scrap_node |
| Softlock / console fatal | **VERIFIED** none during scripted path |
| Physical mobile | **NOT VERIFIED** |
