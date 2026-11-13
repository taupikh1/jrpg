# Quest Dependency Matrix (Phase F)

## Main Chain
```
quest_ch1_desa_yang_lupa
  → quest_ch2_suara_hutan
    → quest_ch3_jejak_yang_kosong
      → quest_ch4_arsip_tanpa_nama
        → quest_ch5_resonansi_pertama
          → quest_ch6_mahkota_abu
            → quest_ch7_perbatasan_sunyi
              → quest_ch8_lentera_kaca
                → quest_ch9_akord_pecah
                  → quest_ch10_malam_bintang
                    → Arc III mains (ch11–15)
                      → Arc IV (ch16–20)
                        → Arc V (ch21–25)
                          → Arc VI (ch26–30)
```

## Flag Dependencies (critical path)
| Flag | Set by | Required for |
|------|--------|--------------|
| ch1_to_forest | Ch.1 ending | Enter Ch.2 |
| ch2_completed | Ch.2 finale | Ch.3 |
| ch3_completed | Ch.3 finale | Ch.4 |
| ch4_completed | Ch.4 finale | Ch.5 |
| ch5_completed + boss flag | Ch.5 | Ch.6 |
| ch6_kael_joined | Ch.6 recruitment | Kael in party; Ch.7 |
| ch7_iven_joined | Ch.7 | Iven in party |
| ch8_tavi_joined | Ch.8 | Tavi in party |
| ch9_accord_proof | Ch.9 | Ch.10 context |
| ch10_completed | Ch.10 boss | Arc III |
| ch15_completed | Ch.15 boss | Arc IV |
| ch20_vaelor_revealed | Ch.20 | Arc V |
| ch25_lattice_purpose_known | Ch.25 | Arc VI |
| ch30_completed | Final | Endings |

## Optional
- All `quest_side_*` and `quest_char_*` have no hard dependency on each other.
- Character quests check chapter flags but do not block main.
- No circular dependencies.

## Soft-lock Prevention
- Every main objective can be re-triggered by zone entry or NPC talk.
- Optional bosses never required.
- Party join flags are set in dedicated scenes that can be replayed if interrupted.
