# Side Quest Bible (Phase F)
**Optional content that enriches regions, NPCs, and mysteries. Never required for main story completion.**

## Existing (preserved)
### quest_pagar_utara
- Region: Ashwillow
- Start: Jarek
- Objectives: Collect 3 wood_scrap → return
- Reward: 2 Herb Hutan
- Expires: No
- Ending impact: None

### quest_bunga_jalan / quest_ch2_catatan_tercecer / quest_ch2_panggilan_tak_terjawab
- Forest / road sides already defined in source.
- Preserve IDs and flag targets.

### quest_ch4_surat_tanpa_nama / quest_ch4_katalog_kosong
- Archive sides. Preserve.

## New Regional Sides (detailed)

### quest_side_sumur_yang_berbisik
- **ID:** `quest_side_sumur_berbisik`
- **Region:** region_ashwillow
- **Start NPC:** Nima (after Ch.1)
- **Context:** Sumur tua mengeluarkan bisikan nama yang tidak lengkap.
- **Objectives:**
  1. Periksa sumur malam hari (`side_well_night_checked`)
  2. Kumpulkan 3 nama dari penduduk (`side_three_names_collected`)
  3. Kembalikan ke Nima
- **Reward:** 15 gold + small Resonance charm (accessory)
- **Consequence:** Nima remembers one more festival detail in epilogue if Memory ending.
- **Expires:** No

### quest_side_rute_hilang
- **ID:** `quest_side_rute_hilang`
- **Region:** region_bellhaven / road
- **Start:** Iven (after he joins) or road warden
- **Context:** Sebuah alamat pengiriman hilang semalam.
- **Objectives:** Walk the route → find blank door → report
- **Reward:** 20 gold + map fragment
- **Ending impact:** None (enriches Iven)

### quest_side_mainan_kedua
- **ID:** `quest_side_mainan_kedua`
- **Region:** region_glass_lantern
- **Start:** Tavi (after join)
- **Context:** Prototipe kedua mulai meniru pola lain.
- **Objectives:** Gather 3 scrap → assemble → decide to shut down or study
- **Branch:** Study gives lore; shut down gives safer reward
- **Reward:** Either lore document or 2 Ether Drop
- **Expires:** No

### quest_side_nyanyian_pesisir
- **ID:** `quest_side_nyanyian_pesisir`
- **Region:** Near Glass Lantern coast
- **Start:** Tide Chorus contact
- **Context:** Nyanyian yang menjaga nama-nama nelayan.
- **Objectives:** Learn 1 verse → protect singer from agent → return
- **Reward:** Song fragment item (lore)
- **Ending impact:** Minor epilogue flavor if completed

All side quests remain available after their chapter unless the region is story-locked later. None block main progression.
