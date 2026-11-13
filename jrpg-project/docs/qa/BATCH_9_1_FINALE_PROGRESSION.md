# Finale Progression
- Finale `ch5_arc1_finale` node h has a single choice "Menuju Kerajaan Mahkota Abu." with flag `ch5_completed` + `chapterHook: 'chapter_06'` (source verified).
- DEFECT P1 (fixed in source): `arc1_completed` did not exist anywhere; `chapterHook` only showed toast "Lanjut: chapter_06" with no unlock state. Fix: GameplayDemoScene flag handler now also sets `arc1_completed` and `chapter_06_unlocked` when `ch5_completed` fires. Regression: tests/unit/narrative/Arc1FinaleWiring.test.js (source-text test only, not runtime).
- Open (P2): toast text "Lanjut: chapter_06" is an unlocalized identifier shown to players.
- Negative path (flags stay false before the choice): not runtime verified.
