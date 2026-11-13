# Chapter 1–5 Canon Reference
**Status:** Reconstructed from existing source files and documentation.  
**Rule:** Only events confirmed in code or approved docs are listed as existing. Placeholders marked explicitly.

## chapter_01 — The Village Beneath the Blue Sky
- **Opening:** Desa Ashwillow pagi hari. Orin merasakan ada yang hilang.
- **Main objective:** Selidiki gejala lupa nama (festival pendiri).
- **Implemented scenes:** `ch1_opening`, `ch1_elder_henn`, `ch1_guard_renda`, `ch1_merchant_soli`, `ch1_villager_nima`, `ch1_child_tori`, `ch1_mira_encounter`, `ch1_resonance_fragment`, `ch1_memory_slip`, `ch1_ending`
- **Characters:** Orin (permanent), Mira (joins via `ch1_mira_follow`)
- **NPCs:** Sesepuh Henn, Renda, Soli, Nima, Tori
- **Locations:** `village` (region_ashwillow)
- **Enemies:** Early forest-edge / village-adjacent (thorn_sprite etc. from arc_01)
- **Boss:** None
- **Flags set:** `ch1_investigate`, `ch1_mira_follow`, `ch1_to_forest`
- **Mysteries planted:** Stillness symptoms (elder forgets founder name)
- **Placeholders:** Full side-quest integration for village NPCs is light.
- **Continuity notes:** Mira recruitment flag is in Chapter 1 dialogue even though outline places her join in Chapter 2. See Conflict Register.

## chapter_02 — A Voice in the Forgotten Forest
- **Opening:** Masuk Hutan Berbisik.
- **Main objective:** Cari sumber suara, temui Elara, selesaikan peristiwa Resonance.
- **Quest:** `quest_ch2_suara_hutan` + sides (`quest_ch2_catatan_tercecer`, `quest_ch2_panggilan_tak_terjawab`)
- **Key flags:** `ch2_forest_entered`, `ch2_first_echo_heard`, `ch2_elara_met`, `ch2_old_carvings_found`, `ch2_mira_committed`, `ch2_completed`
- **Characters:** Orin, Mira
- **Locations:** `forest` (region_whispering_wood)
- **Mysteries:** Half-erased carvings, memory traces
- **Status:** Dialogue and quest structure exist.

## chapter_03 — The Road to Bellhaven
- **Opening:** Perjalanan jalan.
- **Quest:** `quest_ch3_main` (file exists)
- **Locations:** `road_bellhaven`
- **NPCs:** Road NPCs defined
- **Status:** Implemented structure present.

## chapter_04 — The Archive Without Names
- **Opening:** Arsip Bellhaven.
- **Quest:** `quest_ch4_main`
- **Boss:** `archive_veilkeeper` (optional mini-boss, flag `ch4_boss_archive_veilkeeper_defeated`)
- **Locations:** `bellhaven_archive_hall`, `bellhaven_archive_stacks`, `bellhaven_archive_restricted`
- **Mysteries:** Deliberate erasure, Sera trail
- **Status:** Dialogue + boss defined.

## chapter_05 — The First Resonance
- **Opening:** Investigasi fragmen menuju situs kuno.
- **Quest:** `quest_ch5_main` + sides
- **Boss:** `warden_of_first_resonance` (main, required, flag `ch5_boss_warden_of_first_resonance_defeated`)
- **Locations:** `resonance_ancient_site`
- **Climax:** Orin’s Resonance surge. Arc I ends.
- **Flags:** `ch5_first_resonance_done`, `ch5_completed`
- **Status:** Full structure present.

## Summary
Chapters 1–5 have concrete dialogue files, quest definitions, zone links, and two boss definitions. Mira’s recruitment timing differs between outline and runtime flag. All other listed events are backed by source.
