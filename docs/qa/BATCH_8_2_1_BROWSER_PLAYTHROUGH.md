# Batch 8.2.1 Browser Playthrough

**URL:** http://127.0.0.1:4173/  
**Server:** python3 -m http.server 4173

## Route verification
| Step | Result |
|------|--------|
| village → forest → road → gate | **VERIFIED** |
| gate → plaza → market | **VERIFIED** |
| market → plaza → gate → road → forest | **VERIFIED** |
| Spawns navigable | **VERIFIED** (API + scene transition) |

## NPCs
All 10 interact (speakers correct ID names). **VERIFIED** with automation.

## Quests (after handler fix + cache bypass)
| Quest | Status |
|-------|--------|
| quest_bh_buku_tamu | **VERIFIED** completed |
| quest_bh_indeks | **VERIFIED** completed |
| quest_bh_pesan | **VERIFIED** completed |

## Shop
shopBuy on **choice** effects (not node-only). Insufficient gold guarded in listener.

## Critical infra fix
Service worker was **cache-first** for all GETs, pinning stale `GameplayDemoScene.js`. Updated to **network-first for JS/content** (`jrpg-shell-v8-2-1`).
