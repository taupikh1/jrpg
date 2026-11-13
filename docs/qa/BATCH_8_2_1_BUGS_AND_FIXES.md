# Bugs and Fixes — 8.2.1

1. **SW cache-first** hid code updates → network-first for `.js` / content paths; cache name bump.
2. **shopBuy on node effects** never ran → moved to choice effects.
3. **Missing Bren/Venn/Timm quest handlers** in `_onNpcInteract` → added.
4. **Timm completeQuest on first choice** → delivery-only dialogue when quest active.
5. **Stale dialogue lock** → clear lock when dialogue inactive before interact.
