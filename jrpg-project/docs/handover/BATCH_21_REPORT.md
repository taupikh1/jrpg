# B21 — Boss Arc II dan Boss Opsional

- Main boss: `oathbreaker_colossus` — Kolossus Pematah Sumpah, Chapter 10, three phases.
- Optional boss: `starfall_astral_mantid` — Belalang Astral Starfall, Chapter 8, two phases.
- Optional encounter is explicitly marked `optional: true` and `requiredForMainStory: false`; the main boss has the inverse metadata. No main-story prerequisite points to the optional boss.
- Both definitions include rewards, affinities, phase action cycles, and persistent flag keys.
- With `?debug=1`, press `2` for the Arc II main boss or `8` for the optional boss.
- Automated tests verify the optional/main metadata and both encounters' phases, defeat, and reward claim. Full Chapter 6–10 world/quest flow is not implemented yet, so this is content/system readiness rather than a claim of playable Arc II chapter integration.
