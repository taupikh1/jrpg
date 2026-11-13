# Batch 7.2.2 Final Chapter 1 Audit

## Root causes
1. **Party banter:** Single `_pendingParty` + missed `dialogue.completed` listener; automation skipped world-frame queue drain. Fixed with `_partyQueue`, `_enqueueParty`, completion listener.
2. **Jarek order:** Re-entrant interact while dialogue active could open wrong tree. Fixed with `_dialogueLock` + status-ordered branches (completed → active/progress|complete → accept).
3. **Pointer:** Interact only on KeyE. Fixed: pointer click confirms dialogue and tryInteract in world mode.

## Browser verification (http://127.0.0.1:4173/)
| Item | Status | Evidence |
|------|--------|----------|
| Opening | VERIFIED | Screenshot Indonesian opening |
| Jarek accept text | VERIFIED | "Pagar utara goyah…" |
| Jarek progress | VERIFIED | "Masih kurang…" |
| Jarek complete + gold 15 | VERIFIED | complete text + gold |
| Party after fragment | VERIFIED | partySeen.ch1_party_after_fragment |
| Party after slip | VERIFIED | partySeen.ch1_party_after_slip |
| Party travel (Mira flag) | VERIFIED | partySeen.travel + ch1_mira_follow |
| Pointer dialogue advance | VERIFIED | canvas PointerEvent advanced opening |
| Touch (simulated via pointer) | VERIFIED as simulation | pointerType mouse/touch-compatible path |
| Physical iPhone/Android | NOT VERIFIED | no devices |

## Regression
npm test → 149 pass; validator OK
