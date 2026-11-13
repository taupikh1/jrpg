# Batch 7.2.1 Browser Smoke Test

**URL:** http://127.0.0.1:4173/  
**Server:** `python3 -m http.server 4173`  
**Date:** 2026-11-11  
**Method:** Browser automation (desktop viewport) + runtime inspection via `window.__JRPG__`

## Hotfix during test
- Fixed missing `GameplayDemoScene._maybePartyFollowup` (runtime TypeError on dialogue end). Minimal fix only; no narrative rewrite.

## Test matrix

| ID | Action | Expected | Actual | Status |
|----|--------|----------|--------|--------|
| T01 | Load game | Bootstrap without fatal error | Console: Game started; modules 200; opening Indonesian text visible | PASS |
| T02 | Opening dialogue | Ch.1 opening in Bahasa Indonesia | Screenshot: “Di bawah langit biru…” | PASS |
| T03 | Advance dialogue (E) | Control returns to world | mode=world, ents=12 | PASS |
| T04 | Sesepuh Henn | Correct dialogue + choices | Speaker Sesepuh Henn, 3 choices | PASS |
| T05 | Renda | Dialogue starts | Speaker Renda | PASS |
| T06 | Soli | Dialogue starts | Speaker Soli | PASS |
| T07 | Nima | Dialogue starts | Speaker Nima | PASS |
| T08 | Tori | Dialogue starts | Speaker Tori | PASS |
| T09 | Jarek / quest accept | Accept quest_pagar_utara | status active then completed path | PASS (see note) |
| T10 | Mira encounter | Dialogue starts | Speaker Mira Solenne | PASS |
| T11 | Resonance fragment | Story text | Narration about batu biru | PASS |
| T12 | Memory slip / Stillness | Story text | Alun-alun memory slip text | PASS |
| T13 | Party scenes | Three party dialogues trigger | Programmatic finish skipped queue; **partial** | NOT VERIFIED fully in-browser |
| T14 | Quest rewards | gold + herbs | gold=15, toast “Quest selesai! Hadiah diterima.” | PASS |
| T15 | Village→Forest | Zone change, cleanup, scrap spawn | after=forest, ents=[player,scrap_node] | PASS |
| T16 | Keyboard dialogue | E advances / chooses | Verified | PASS |
| T17 | Pointer/touch | Pointer interact | **NOT VERIFIED** (not exercised) |
| T18 | Physical mobile | iPhone/Android | **NOT VERIFIED** |
| T19 | Console errors | None critical | Initial TypeError fixed; after fix no fatal during flows | PASS with fix |
| T20 | Stuck dialogue | Must close | mode returned to world | PASS |

## Notes
- Jarek first line after scripted accept once showed progress text (`Masih kurang…`) depending on order; quest still reached `completed` with rewards.
- Zone transition trigger is at approximately y≥208 near x 128–192 (demo-data `to_forest`).
- Party banter auto-queue was not fully observed in automated run after direct `dialogue.choose/advance`.

## Regression
- `npm test` after fix (record in progress doc)
