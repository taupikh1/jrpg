# B20 — Boss Arc I dan Mini-boss

## Content
- Main boss: `warden_of_first_resonance` — Penjaga Resonansi Pertama, Chapter 5, three HP-threshold phases.
- Optional mini-boss: `archive_veilkeeper` — Penjaga Selubung Arsip, Chapter 4, two phases.
- Both have Indonesian descriptions, elemental affinities, deterministic phase action cycles, EXP/gold/item rewards, and persistent defeat flag keys.
- Added phase dialogue `ch4_boss_veilkeeper_phase2`, `ch5_boss_resonance_phase2`, and `ch5_boss_resonance_phase3`; all are registered through the existing Chapter 4/5 dialogue catalogues.
- Added `_startBossBattle()` and debug launch keys. With `?debug=1`, press `1` for the main boss or `7` for the optional mini-boss.

## Persistence
- Main boss flag: `ch5_boss_warden_of_first_resonance_defeated`.
- Defeat flags are stored in `world.flags.bosses` and mirrored into Chapter 4/5 flags where available.
- Save remains v6. The existing world flag payload is flexible, so no schema migration was needed.

## Verification
- Scene integration test defeats the main boss, checks reward grant and defeat flag, and confirms duplicate launch is blocked.
- Save tests round-trip boss flags.
- Boss catalogue tests exercise phase entry/action and victory reward claims.
