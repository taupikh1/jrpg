# Batch 8.3.1 Chapter 3 Browser Audit

**Verdict target:** PASS WITH LIMITATIONS  
**Baseline tests:** 178 pass after QA fixes.

## Source inventory (independent recount)
| Metric | Value |
|--------|-------|
| Main/support scenes | 24 |
| Party banter | 5 |
| Nodes (main only) | 152 (+ party nodes) |
| Written lines | 162+ (0 empty) |
| Speakers | Orin, Mira, Lyn, Ode, Dira, Bren, Mirae, Venn, Ruli, Garet, Salla, Timm, Nila, Korr |

## Browser route
village → road_bellhaven → gate → plaza → market → return forest

## Runtime evidence (exact displayed text samples)
- first_view: “Setelah perjalanan panjang melewati hutan…”
- Lyn: “Berhenti sebentar. Jalan masuk Bellhaven…”
- Dira: “Selamat datang di Bellhaven. Sebelum masuk…”
- Bren: “Selamat datang. Kalau kalian ingin mengisi buku tamu…”
- Ruli: “Kak, pernah nggak kalian lupa sesuatu…”
- Mirae: “Kalian datang untuk mendengarkan lonceng kota?”
- Venn: “Jangan sentuh tumpukan kertas yang diberi pita biru…”
- Nila: “Herb masih ada. Harga sama: lima koin…”
- Korr: “Pedang Karat, dua belas koin…”
- Finale: “Saat matahari mulai condong, lonceng Bellhaven…”
- Party×5: Orin/Mira lines verified

## Shop
- Herb −5 gold **VERIFIED**
- Insufficient gold toast “Gold tidak cukup”, inventory unchanged **VERIFIED**

## Fixes in this batch
1. Finale `ch3_completed` moved to **choice** effects (node effects never applied by DialogueEngine).
2. Ode routes to ch3 dialogue when first view seen and bunga quest not active.
3. Garet routes to archive warning / finale when ch3 flags set.
4. Safer choice_selected / terminal effect handling.

## Persistence
GameplayDemoScene uses **MemoryStorageAdapter** — IndexedDB NOT VERIFIED.

## SW
jrpg-shell-v8-3 network-first for JS. Stale module risk remains until hard refresh after deploy.
