# Batch 8.3 Pre-Audit

**Baseline:** 169 tests pass (8.2.1).

## Existing IDs to preserve
Zones: road_bellhaven, bellhaven_gate, plaza, market  
Quests: quest_bh_buku_tamu, quest_bh_indeks, quest_bh_pesan  
NPCs: dira, bren, salla, ruli, venn, timm, nila, korr, mirae, garet, lyn, ode  

## DialogueEngine
Nodes with text, choices, next, effects (acceptQuest, completeQuest, shopBuy, flag).  
Node-level effects not auto-applied; use choice effects or scene handlers.

## Integration strategy
- New content modules under content/dialogue/arc_01/chapter_03.js, party/ch3_party.js  
- Main quest quest_ch3_jejak_yang_kosong  
- Story flags on GameplayDemoScene `_ch3Flags`  
- One-shot first-view via flag  
- NPC handlers branch on ch3 flags for main vs repeat vs post  

## SW
jrpg-shell-v8-2-1 network-first for JS — bump to v8-3 after content land.
