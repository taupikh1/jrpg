# Main Quest Audit

**ID:** quest_ch3_jejak_yang_kosong

## Objectives (source)
1. ch3_dira_entry_done
2. ch3_bren_records_clue
3. ch3_venn_index_clue
4. ch3_garet_archive_clue
5. ch3_completed

## Negative / positive browser results
| Case | Result |
|------|--------|
| Finale opened, choice not selected | quest remains **active**, ch3_completed false |
| Finale choice selected | quest **completed**, flag true |
| Partial flags only | remains active (unit + logic) |

## Setting sites
- Choice effects on main story dialogues (flag)
- Finale choice: `Sampai jumpa besok.` → `ch3_completed` + chapterHook chapter_04

## Independence
Optional side quests (bh_*) do not gate main completion.
