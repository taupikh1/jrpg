# P0/P1 — Ancient site access (CONFIRMED defect)
- Finding: no zone had a connection to `resonance_ancient_site`; the registry lists `conn_road_to_resonance` as implemented. The site only had `to_road` (landing at `near_gate`, i.e. the town gate side).
- Fix (smallest): road wall opened at tiles (18..19,11) below the south overlook path; connection `to_resonance_site` trigger (288,176,32,16) -> spawn `from_road`; new road spawn `from_resonance` (304,152); site `to_road` now returns to `from_resonance`.
- Not gated by chapter flags (no gating design found; other doors are ungated). Chapter 5 narrative route NOT verified.
- Also fixed latent: `bellhaven_plaza` spawn `start` was inside the fountain (solid); moved to (160,168). Unused by gameplay today.
- Tests: `tests/unit/world/WorldConnectivity.test.js` (7, integration over all zones): targets/spawns exist, spawns walkable and outside triggers, triggers reachable, whole graph reachable from village, registry vs data, round trip.
- **Browser runtime verified (Chromium, keyboard input only, no state injection)**: village -> forest -> road -> south path -> `resonance_ancient_site` (arrived spawn 160,225) -> exit -> road (304,154). Console errors: none. Script and screenshots: `evidence/batch-9-1-2/` (walk_ancient_site.mjs.txt (copy to .mjs to run), road_before_site.png, ancient_site_entry.png, ancient_site_return_to_road.png).
- Observation: `broken_cart` (solid) narrows the south path; the player must pass on its east side (x>=~305). Passable, but tight; not changed.
- Chapter 5 progression through the site not verified.
