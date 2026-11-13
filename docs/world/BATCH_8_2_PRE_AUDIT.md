# Batch 8.2 Pre-Audit

**Baseline:** 161 tests pass (Batch 8.1.1).

## Existing playable chain
`village` ↔ `forest` ↔ `road_bellhaven` (east ends at narrative boundary, no city yet).

## Chapter 3 needs
Blueprint: road → enter Bellhaven (market atmosphere, council). Archive near city for Ch.4.

## Engine reuse
ZoneManager, Interaction, Dialogue, QuestLog, Inventory, gold on GameplayDemoScene. **No dedicated Shop class** — implement buys as interaction/dialogue effects.

## Strategy
Implement 3 core districts as separate zones: gate, plaza, market. Connect road→gate. Defer full government/archive/inn maps to later batches while placing NPC hooks and one archive interaction in plaza/gate.
