# Main Quest Bible (Phase F)
**THE ATLAS OF UNREMEMBERED STARS**  
**Status:** Detailed design. Compatible with existing QuestLog flag/objective style.  
**Language:** Player-facing titles and descriptions in Bahasa Indonesia.  
**Rule:** Every required flag is set somewhere in the intended flow. Optional content never gates the main path.

## Arc I — Existing + Audited

### quest_ch1_desa_yang_lupa
- **Chapter:** chapter_01
- **Title:** Desa yang Mulai Lupa
- **Start:** Otomatis saat opening / bicara dengan Sesepuh Henn
- **Narrative objective:** Cari tahu mengapa nama festival pendiri hilang.
- **Objective sequence:**
  1. Bicara dengan Sesepuh Henn (`ch1_elder_henn`)
  2. Tanya Renda, Soli, Nima (`ch1_investigate` set)
  3. Temui Mira di tepi desa (`ch1_mira_follow`)
  4. Periksa fragmen di sumur / tepi hutan (`ch1_resonance_fragment`)
  5. Saksikan slip memori (`ch1_memory_slip`)
  6. Terima arahan ke hutan (`ch1_to_forest`)
- **Locations:** village
- **NPCs:** Sesepuh Henn, Renda, Soli, Nima, Tori, Mira
- **Required battles:** None mandatory
- **Flags set:** `ch1_investigate`, `ch1_mira_follow`, `ch1_to_forest`
- **Flags checked:** none at start
- **Completion:** `ch1_to_forest` + ending scene
- **Rewards:** Small gold, 1 Herb Hutan
- **Next:** quest_ch2_suara_hutan
- **Chapter completion:** Flag `ch1_to_forest` + scene `ch1_ending`

### quest_ch2_suara_hutan (existing ID preserved)
- **Chapter:** chapter_02
- **Title:** Suara dari Dalam Hutan
- **Start:** Masuk forest setelah `ch1_to_forest`
- **Objective sequence (matches existing file):**
  1. Masuk hutan (`ch2_forest_entered`)
  2. Dengar gema (`ch2_first_echo_heard`)
  3. Temui Elara (`ch2_elara_met`)
  4. Temukan ukiran (`ch2_old_carvings_found`)
  5. Saksikan jejak ingatan (`ch2_memory_trace_seen`)
  6. Selesaikan peristiwa Resonance (`ch2_resonance_event_completed`)
  7. Terima petunjuk Elara (`ch2_elara_clue_received`)
  8. Keputusan Mira (`ch2_mira_committed`)
  9. Buka jalur utara (`ch2_northern_path_unlocked`)
  10. Selesai (`ch2_completed`)
- **Locations:** forest
- **NPCs:** Elara, Rhea (side)
- **Dialogue scenes:** Existing CHAPTER_02_DIALOGUES
- **Rewards:** 25 gold (existing)
- **Next:** quest_ch3_jejak_yang_kosong

### quest_ch3_jejak_yang_kosong (existing)
- **Chapter:** chapter_03
- **Start:** Tiba di road_bellhaven / bellhaven_gate
- **Objectives:** gate_entry → bren_clue → venn_clue → garet_clue → finale (`ch3_completed`)
- **Locations:** road_bellhaven, bellhaven_gate, plaza
- **NPCs:** Petugas gerbang, Bren, Venn, Garet
- **Rewards:** 25 gold
- **Next:** quest_ch4_arsip_tanpa_nama

### quest_ch4_arsip_tanpa_nama (existing)
- **Chapter:** chapter_04
- **Start:** Bicara Maera di arsip
- **Objectives:** start → nilo → teren → edda → three records → fragment → `ch4_completed`
- **Optional boss:** archive_veilkeeper (does not block)
- **Locations:** bellhaven_archive_*
- **Rewards:** 30 gold + Resonance fragment item
- **Next:** quest_ch5_resonansi_pertama

### quest_ch5_resonansi_pertama (existing structure)
- **Chapter:** chapter_05
- **Start:** Setelah `ch4_completed`
- **Objectives:** fragment investigated → echo in Bellhaven → Lirien warning → memories discussed → site reached → first resonance → aftermath → `ch5_completed`
- **Boss:** warden_of_first_resonance (required)
- **Flag:** `ch5_boss_warden_of_first_resonance_defeated`
- **Rewards:** 40 gold + progression
- **Next:** Chapter 6 (Kael recruitment)

## Arc II — New Detailed Design

### quest_ch6_mahkota_abu
- **Chapter:** chapter_06
- **Title:** Laporan yang Tidak Sampai
- **Start NPC/event:** Tiba di Crownspire; kontak menyebut nama Kael
- **Narrative objective:** Temukan Kael dan bukti laporan perbatasan yang dikubur.
- **Objective sequence:**
  1. Masuk Crownspire (`ch6_crownspire_entered`)
  2. Bicara dengan arsiparis kecil (`ch6_archivist_met`)
  3. Temui Kael di pos jaga luar (`ch6_kael_met`)
  4. Ikuti Kael ke gudang laporan (`ch6_report_cache_found`)
  5. Hadapi agen yang mencoba menyita catatan (`ch6_agent_confronted`)
  6. Kael memutuskan bergabung (`ch6_kael_joined`)
  7. Selesai (`ch6_completed`)
- **Locations:** region_ashen_crown (Crownspire outskirts, small archive)
- **NPCs:** Arsiparis Mahkota, Kael Rowan, Agen Curator (pertama yang terang-terangan)
- **Required battle:** Small agent encounter (not a named boss)
- **Dialogue required:** Recruitment scene (see future Phase G)
- **Flags set:** `ch6_kael_joined`, `ch6_completed`
- **Rewards:** 50 gold, Kael joins party, 1 Ether Drop
- **Next:** quest_ch7_perbatasan_sunyi
- **Chapter completion:** `ch6_kael_joined` + `ch6_completed`

### quest_ch7_perbatasan_sunyi
- **Chapter:** chapter_07
- **Title:** Batu yang Mulus
- **Start:** Setelah `ch6_completed`, perjalanan ke Silent March
- **Objective sequence:**
  1. Tiba di pos jaga (`ch7_watchpost_reached`)
  2. Periksa batu perjanjian (`ch7_treaty_stone_examined`)
  3. Temui Iven Marr (`ch7_iven_met`)
  4. Kumpulkan saksi lokal yang ingat sebagian (`ch7_witnesses_gathered`)
  5. Cegah bentrokan kecil (`ch7_skirmish_resolved`)
  6. Iven bergabung (`ch7_iven_joined`)
  7. Selesai (`ch7_completed`)
- **Locations:** region_silent_march
- **NPCs:** Kapten Perbatasan, Iven Marr, penduduk pos
- **Flags set:** `ch7_iven_joined`, `ch7_completed`
- **Rewards:** 45 gold, Iven joins
- **Next:** quest_ch8_lentera_kaca

### quest_ch8_lentera_kaca
- **Chapter:** chapter_08
- **Title:** Mainan yang Ingat
- **Start:** Tiba di Glass Lantern
- **Objective sequence:**
  1. Masuk kota (`ch8_city_entered`)
  2. Temui Tavi di bengkel (`ch8_tavi_met`)
  3. Bantu selesaikan prototipe (`ch8_prototype_completed`)
  4. Prototipe membangunkan construct kecil (`ch8_construct_awakened`)
  5. Kalahkan construct (`ch8_construct_defeated`)
  6. Tavi bergabung (`ch8_tavi_joined`)
  7. Selesai (`ch8_completed`)
- **Locations:** region_glass_lantern
- **NPCs:** Tavi Brindle, Master Guild
- **Flags set:** `ch8_tavi_joined`, `ch8_completed`
- **Rewards:** 40 gold, Tavi joins, small accessory blueprint
- **Next:** quest_ch9_akord_pecah

### quest_ch9_akord_pecah
- **Chapter:** chapter_09
- **Title:** Tinta yang Diangkat
- **Start:** Petunjuk dari Glass Lantern / Crown archive
- **Objective sequence:**
  1. Temukan arsip pinggir (`ch9_edge_archive_found`)
  2. Buktikan tinta diangkat secara kimia (`ch9_chemical_proof`)
  3. Kumpulkan tiga kesaksian kerajaan (`ch9_three_testimonies`)
  4. Konfirmasi keberadaan Accord (`ch9_accord_proof`)
  5. Selesai (`ch9_completed`)
- **Locations:** Mixed (Glass Lantern edge + Crown archive return)
- **Key discovery:** Accord exists as deliberate policy
- **Flags set:** `ch9_accord_proof`, `ch9_completed`
- **Rewards:** 60 gold, lore document “Catatan Accord”
- **Next:** quest_ch10_malam_bintang

### quest_ch10_malam_bintang
- **Chapter:** chapter_10
- **Title:** Malam Bintang Jatuh
- **Start:** Setelah `ch9_completed`, perjalanan ke Starfall Plain
- **Objective sequence:**
  1. Tiba di dataran (`ch10_plain_reached`)
  2. Lindungi festival (`ch10_festival_defended`)
  3. Saksikan konstelasi salah (`ch10_wrong_sky_seen`)
  4. Hadapi agen Curator secara terbuka (`ch10_agents_open`)
  5. Kalahkan Oathbreaker Colossus (`ch10_boss_oathbreaker_defeated`)
  6. Selesai Arc II (`ch10_completed`)
- **Boss:** oathbreaker_colossus (required)
- **Optional:** starfall_astral_mantid
- **Flags set:** `ch10_completed`, boss flag
- **Rewards:** 100 gold, significant progression, confirmation Curator is an organization
- **Next:** Chapter 11

## Arc III–VI — Structured Detailed Entries
*(Full objective chains; dialogue written in Phase G)*

### quest_ch11_tirai_hijau through quest_ch15_hening_pertama
- Follow Verdant Veil → Underdeep → Sleeping Kings → personal wounds (Ch.14) → First Silence climax.
- Key flags: `ch11_veil_entered`, `ch12_bram_recognition`, `ch14_personal_wounds`, `ch15_completed`, `ch15_boss_verdant_memory_heart_defeated`
- Neris and Bram appear as recurring / potential joins (no new runtime ID without approval).

### quest_ch16_kerajaan_terbelah through quest_ch20_nama_kurator
- Political escalation, cost of remembering, Kael report full truth (`ch18_report_exposed`), agents personal, Vaelor reveal.
- Critical flags: `ch18_report_exposed`, `ch20_vaelor_revealed`, `ch20_boss_regent_of_unwritten_defeated`, `ch20_offer_rejected` (or accepted for Ending B path)

### quest_ch21_jalan_gema through quest_ch25_kisi_mengingat
- Echo Road travel, personal mystery resolutions, lattice purpose confirmed.
- Flags: `ch21_echo_road_entered`, `ch24_personal_resolved`, `ch25_lattice_purpose_known`, `ch25_completed`

### quest_ch26_menuju_jantung through quest_ch30_fajar_tak_tertulis
- Approach Heart, final confrontations, ending branch.
- Flags: `ch28_final_choice`, `ch30_completed`, ending-specific flags (`ending_memory`, `ending_mercy`, `ending_unwritten`)

## General Rules
- Main quest never requires optional bosses or side quests.
- Every flag listed above is set by a specific scene or objective completion.
- Save-resume: interrupted scenes can be re-triggered by talking to the relevant NPC or re-entering the zone.
- All player-facing names and descriptions are in Bahasa Indonesia.
