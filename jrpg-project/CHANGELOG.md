## FF3–FF9 — Sisa batch dikerjakan sekaligus (konservatif) (2026-11-14)
- FF3: BattlePresentation diperluas (overlay, timing).
- FF4: FieldMenu.js — struktur menu lapangan ala FF4 (Item/Skill/Equip/Formasi/Status/Pengaturan).
- FF5: FieldEncounters sudah ada dari sebelumnya; fondasi siap.
- FF6: OverworldArc1.js — node peta Arc I.
- FF7: OptionalBgm.js — lapisan BGM opsional, default off (tidak melanggar kebijakan "no BGM" di AudioCatalog).
- FF8: FieldInteractions.js — chest dan inn logic.
- FF9: docs/handover/FF9_QA_CHECKLIST.md.
- Test baru: RemainingFF.test.js.
- Validasi: 655 → 659 test lulus; semua check OK.
- Visual / perangkat: NOT TESTED.

## FF3 + FF5 — Presentasi battle & Random encounter lapangan (2026-11-14)
- FF3: Modul `BattlePresentation` untuk intro/overlay, flash, dan timing kemenangan/kalah (dasar).
- FF5: Modul `FieldEncounters` untuk trigger random encounter berbasis langkah di zona tertentu (forest, road).
- Wiring dasar di `GameplayDemoScene.js`.
- Test baru untuk FieldEncounters.
- Validasi: 652 → 655 test lulus; semua check OK.
- Visual / perangkat: NOT TESTED.
- Catatan: spesifikasi lengkap FF3/FF4/FF6/FF8 tidak tersedia secara detail di dokumen prompt; implementasi bersifat konservatif sesuai aturan umum.

## FF2 — Mesin ATB (Active Time Battle), opt-in (2026-11-14)
- Mode battle: 'round' (default, perilaku lama tidak berubah), 'atb_wait', 'atb_active'.
- Gauge ATB per peserta, laju berdasarkan speed, update(dt) dari scene.
- BattleSettingsStore di platform (localStorage), default 'round'.
- Gauge tipis ditampilkan di jendela status party saat mode ATB.
- getTurnQueue pada mode ATB mengembalikan perkiraan berdasarkan waktu-untuk-penuh.
- Validasi: 650 → 652 test lulus; semua check lulus.
- Visual / perangkat: NOT TESTED.

## FF1 — Layout Battle ala Final Fantasy 4 (2026-11-14)
- Battle layout: musuh di kiri, party di kanan (menghadap kiri), jendela bawah untuk nama musuh, status party (HP/MP), dan perintah.
- Modul baru `src/scenes/battle/BattleLayout.js` sebagai satu sumber koordinat; semua gambar dan hit-test memakai modul ini.
- Sprite party per anggota (orin/mira/kael/iven/tavi) dihasilkan prosedural, menghadap kiri; fallback ke hero.
- Header "PERTEMPURAN · Ronde N" dihapus; chip nama pelaku saat ini dipertahankan. Pelat HP kecil dipertahankan karena tidak tumpang tindih jendela bawah.
- Validasi: 648 → 650 test lulus; `npm run check`, `check:world`, `check:narrative`, `check:enemies` lulus.
- Visual dan perangkat: NOT TESTED (tidak ada browser/perangkat di lingkungan eksekusi).

## B18 — Arc II Party Roster & Save v6 (2026-11-13)
- Characters: added Iven Marr (`iven`, Chapter 7) and Tavi Brindle (`tavi`, Chapter 8) using the approved Character Bible entries; existing runtime IDs remain unchanged.
- Recruitment: added Indonesian recruitment dialogue frameworks `ch7_iven_recruitment` and `ch8_tavi_recruitment`; join/departure flags are persisted and restored. Five recruited members are supported while battle remains capped at four active members; a full party places the fifth recruit in reserve.
- Gameplay: added four registered skills and one signature ability per new character, role-specific stat growth, battle participation, and EXP progression using existing battle/status mechanics.
- Save v6: added sequential v5→v6 migration, new progression defaults, Arc II roster flags, and independent Iven/Tavi HP/MP snapshots. Older save data is preserved.
- Scope limit: Chapter 7/8 world maps, main quests, NPC systems, and a manual reserve-party swap menu remain for later batches.
- Validation: 618/618 tests pass; `check`, `check:world`, and `check:narrative` pass. Physical iPhone/Android and browser visual tests remain NOT TESTED.

## B16–B17 Combined — Party, Character Gameplay & Narrative Integration (2026-11-13)
- Party roster: added story-flag-driven recruitment/departure state for Orin, Mira, and Kael; active battle party is capped at four members.
- Save v5: added roster snapshots and v4 → v5 migration. Existing chapter flags are preserved, progression skill unlocks are reconciled to character level, and completed Chapter 5 saves can resume the pending Kael recruitment scene.
- Chapter 6 story: added Kael's recruitment dialogue and first party watch scene in Bahasa Indonesia; chained the recruitment beat after Chapter 5 departure banter.
- Character skills: each playable character now has four registered skills and one marked signature ability. Added Orin's Tombak Gema, Mira's Selimut Pendar, and Kael's Hantaman Perisai, Benteng Diri, Tantang, and Lindungi Sekutu.
- Combat integration: guard mitigation, taunt-aware enemy target selection, and 50% ally damage interception are implemented in BattleManager. Invalid targets and locked skills are rejected before MP is spent. Battle party size is enforced at four.
- UI and IDs: four skill rows are selectable on touch/keyboard; signature skills are marked; new skill and dialogue IDs are recorded in `docs/narrative/CONTENT_ID_REGISTRY.md`.
- Validation: 608/608 tests pass; `check`, `check:world`, and `check:narrative` pass. Physical iPhone/Android and browser visual tests remain NOT RUN.
- Report: `docs/handover/B16_B17_COMBINED_REPORT.md`.

# Changelog

## Landscape Full-Fill — gameplay penuh layar di landscape (2026-11-14)
- Peta zona: `ZoneArt` kini mengisi area di luar peta (hutan mulus `forest:<v>` untuk tema pohon; dinding digelapkan untuk kota/interior). Jalan keluar tetap menerus ke luar peta. Tidak ada perubahan pada collision atau data zona.
- HUD dunia: Level/Gold, nama zona, bar HP/MP, dan baris quest menghormati inset notch dan tombol MENU sentuh (`hudInsets` dari `main.js` ke `GameplayDemoScene`).
- Battle: backdrop digenerate selebar layar (`paintBattleStage(theme, width)`; lebar 320 identik dengan sebelumnya), layout battle 320 px dipusatkan (`_battleOffsetX`), tap battle digeser (`_battleTaps`).
- Pengujian: 648/648 unit test lulus (+14 baru: `ZoneOuterFill.test.js`, `BattleLandscape.test.js`); `npm run check` lulus. Browser/iPhone nyata belum diuji.

## B19 — Katalog Musuh Arc I dan II (2026-11-13)
- Katalog Arc I diperluas menjadi 9 musuh dan katalog baru Arc II berisi 9 musuh; seluruh 18 ID stabil tercatat di `docs/narrative/CONTENT_ID_REGISTRY.md`.
- Setiap definisi memiliki habitat, kategori ekologi, deskripsi bestiary Bahasa Indonesia, statistik fisik/magis, EXP/gold, afinitas elemen, serta pola aksi AI siklis.
- `BattleManager` kini menjalankan `ai.actions` untuk musuh biasa; aksi fase boss tetap memakai jalur `boss_action`. AI dan status/elemen tetap data-driven, tanpa import konten dari engine.
- Ditambahkan `createEnemyParticipant()` untuk membangun runtime participant dari definisi yang diinjeksi; encounter Sprite Duri yang sudah ada memakai helper ini dan mempertahankan dua musuhnya.
- Ditambahkan `tools/enemy-catalog-validator.mjs`, `npm run check:enemies`, dan validasi tersebut masuk ke `npm run check` serta `npm run build`.
- Pengujian: 624/624 unit tests lulus; `check`, `check:world`, dan `check:narrative` lulus. Browser/device QA belum dijalankan. Katalog belum berarti semua musuh sudah ditempatkan di peta dunia.
- B18 manual device QA dan Gerbang G2 tetap berstatus menunggu pemilik proyek; B19 dikerjakan atas instruksi eksplisit pengguna.

## PRE-B15 — World placement, iPhone PWA landscape & gameplay-first UI (2026-11-13)
- World placement: moved village Mira and Resonance fragment off the house footprint; moved forest Elara and `ch2_note_0` clear of the pond; moved `guest_page_0` off the guardhouse roof; moved plaza NPCs clear of the fountain footprint; moved `ch5_activate` onto walkable floor; separated overlapping village NPCs.
- Tile semantics: corrected Bellhaven gate notice-board clearing from shared tileset water ID 4 to dirt ID 5. Moved the village well and Bellhaven broken cart off primary walkable routes while preserving their stable interaction identity.
- Placement QA: corrected NPC footprint tests to use entity-center coordinates; added runtime placement sweep across 10 zones for NPCs, interactables, static props, intentional mounted objects, and NPC-to-NPC overlap.
- iPhone PWA: standalone/landscape manifest, iOS Add to Home Screen metadata, app icons, safe-area and dynamic viewport CSS, portrait rotate notice, visualViewport resize handling, canvas-aligned touch controls, and service-worker shell cache v12.
- UI: reduced exploration HUD height, moved world toasts below the HUD, compacted the pause panel and reduced dimming; touch buttons now scale and stay inside the actual game canvas. Dedicated inventory/status/quest screens remain focused panels.
- Validation: 583/583 unit tests pass; `check`, `check:world`, and `check:narrative` pass. Physical iPhone Safari and Android Chrome testing remains pending. Current internal canvas remains 320x240 (4:3), so landscape view still letterboxes horizontally until D-022 responsive rendering work is separately approved/implemented.
- Report: `docs/handover/PRE_B15_REPORT.md`; owner test guide: `docs/handover/PRE_B15_IPHONE_TEST_GUIDE.md`.

## Batch 9.3B — Pengalaman (EXP), Kenaikan Level & Pertumbuhan Karakter
- Konten & kurva (`content/characters/progression.js`): `MAX_LEVEL = 10`, kurva konfigurabel `12 + 10*(lv-1) + 6*(lv-1)^2`, profil pertumbuhan terpisah untuk Orin (HP/ATK/DEF) dan Mira (MP/MATK/MDEF/SPD), serta skill terbuka bertahap (`ember`, `minor_heal`, `orin_surge` untuk Orin; `mira_mend`, `mira_spark`, `mira_light_bind` untuk Mira).
- Sistem progresi (`src/engine/gameplay/progression/ProgressionSystem.js`): pemberian EXP berjenjang, lonjakan multi-level dalam satu hadiah EXP, batas maksimum level, pertumbuhan stat dasar tanpa menyentuh modifier perlengkapan maupun auto-heal penuh HP/MP, serta aturan distribusi EXP (anggota aktif yang hidup mendapat 100% EXP pertempuran; KO/belum bergabung mendapat 0).
- Pertempuran & anti-farming (`BattleManager.js`, `GameplayDemoScene.js`): hadiah EXP/gold terhitung dari definisi musuh (`content/enemies/arc_01.js`), klaim hadiah tunggal (`claimVictoryRewards`), nol hadiah pada kalah/kabur/pertempuran debug (`KeyB`), ambush `road_ambush` satu kali permanen via flag `ch3_road_ambush_cleared`, validasi skill terkunci di `BattleManager.commandSkill`, sub-menu Skill & Item (termasuk `ether_drop`), dan pemulihan aman saat kalah (50% HP ke titik aman).
- UI & Audio (`GameplayDemoScene.js`, `AudioEventBridge.js`, `player-text.js`): HUD level (`Lv.N`), layar `Status & Skill` (`KeyC` / Menu Jeda, tab Orin & Mira), overlay `NAIK LEVEL!` berurutan, pemakaian/lepas baju (`leather_vest`), gulir daftar quest >4 entri, serta pemutaran SFX `exp_gain`, `level_up`, `stat_up`, dan `skill_unlock`.
- Save Schema v4 (`SaveSchema.js`, `SaveMigrations.js`, `SaveValidator.js`, `SaveManager.js`): migrasi v3 -> v4, sanitasi data korup saat muat, serta perbaikan pemulihan slot perlengkapan terpasang langsung di `_doLoad()` agar tidak hilang saat reload.
- Perbaikan tambahan: `QuestLog.complete()` ditambahkan untuk memperbaiki efek dialog `completeQuest`.
- Tes: 483 -> 504 lulus; `check`, `check:narrative`, dan `check:world` bersih. Lihat `docs/batch9.3b/BATCH_9_3B_PROGRESSION_REPORT.md`.

## Batch 9.3A — Efek suara dan ambience (tanpa musik latar)
- Audio: tidak ada musik latar sama sekali. Hanya efek suara (SFX) dan ambience lingkungan per zona.
- Arsitektur: `AudioPort` (core) -> `AudioManager` dan `AudioEventBridge` (engine/audio, tanpa API browser) -> `WebAudioAdapter` dan `LocalAudioSettingsStore` (platform/browser).
- Aset: 40 efek suara dan 6 loop ambience, dibuat dengan `tools/audio/generate-audio.py` (sintesis, bukan sampel pihak ketiga), disimpan di `assets/audio/`.
- Integrasi: pertempuran, quest, item, dialog, simpan, pindah zona, langkah kaki (berdasarkan jarak tempuh), dan navigasi menu.
- Pengaturan audio di menu jeda: volume efek suara, volume ambience, senyap, dan tes suara. Disimpan terpisah dari data save.
- Mobile: audio mulai setelah sentuhan atau tombol pertama. Tab yang disembunyikan menangguhkan audio.
- Tes: 395 -> 483. Dua tes menu jeda diperbarui karena baris "Pengaturan Audio" ditambahkan sebelum "Kembali ke Menu Utama".

## Rombak Pixel Art 2D
- Perubahan: seluruh tampilan diganti dari kotak warna menjadi pixel art 2D yang digambar lewat kode (`src/engine/rendering/pixelart/`), tanpa file gambar eksternal.
- Dunia: tile rumput/jalan/tanah/air (animasi), pohon, rumah beratap, rak buku arsip, reruntuhan beresonansi, kios pasar, dan kolam air mancur alun-alun. Tiap zona punya tema sendiri.
- Karakter: Orin (hero) dan 28 NPC punya sprite 16x24 dengan 4 arah dan animasi jalan; NPC lain otomatis diturunkan dari warna aslinya.
- Objek: papan, sumur, gerobak, batu gema, pohon kuno, pilar/alat resonansi, kristal, lembar catatan, bunga, dan lain-lain (berkedip/bersinar).
- Pertempuran: panggung pixel art, sprite hero dan Sprite Duri, kilatan saat kena, angka damage, penanda giliran.
- UI: latar menu utama bergambar, ikon item di inventaris.
- Fallback: jika kanvas tidak tersedia (tes headless), game kembali ke warna datar. Tes: 363 -> 368.

## Phase 3 — Pixel-art UI & responsive layout
- Perubahan: HUD dirancang ulang; baris status tidak lagi terpotong di tepi kanan pada layar portrait.
- Perubahan: dialog, pertempuran, inventaris, dan catatan quest memakai gaya visual yang sama (`UiKit`).
- Perubahan: baris pertempuran dan label perintah dipotong dengan elipsis bila tidak muat, bukan meluap.
- Perubahan: toast dan pesan simpan/muat dalam bahasa Indonesia (`content/ui/player-text.js`), hanya di tampilan.
- Perubahan: hint dialog menyebut AKSI untuk pengguna sentuh.
- Tes: 330 → 363. Lihat docs/phase3/PHASE_3_REPORT.md.

## Phase 2 — Mobile gameplay foundation
- Fitur: kontrol sentuh (D-pad, AKSI, MENU) lewat sumber input `TouchControls`, memakai kode tombol yang sama dengan keyboard.
- Fitur: menu jeda (Lanjutkan, Simpan Permainan, Kembali ke Menu Utama dengan konfirmasi). Simpan hanya dilaporkan berhasil jika benar-benar berhasil.
- Perubahan: resolusi logis 480×270 → 320×240 agar teks terbaca di HP.
- Perubahan: setiap sesi membuat scene gameplay baru; Kembali ke Menu Utama lalu Lanjutkan tidak membawa state lama.
- Fix: tap yang lebih cepat dari satu frame kini tidak hilang (`Input.pointerDownsThisFrame`).
- Tes: 303 → 330. Lihat docs/phase2/PHASE_2_REPORT.md.

## Batch 9.1.2 (partial)
- Fix: choiceless dialogue node effects now delivered (`dialogue.node_effects`), shared handler in `GameplayDemoScene`.
- Fix: road flower spawn coordinates, unreachable 4th flower, flower lost on full inventory.
- Fix: chapter hook toasts in Indonesian via `content/gameplay/chapter-notifications.js`.
- Fix: added road -> Situs Resonansi Kuno entrance and return spawn; moved blocked plaza `start` spawn.
- Fix: missing `_maybeCh3FirstView` hook (threw on every zone transition, blocked ch2/ch4/ch5 entry hooks, Ch3 first view never started).
- Tests: 193 -> 217.

## Batch 9.1.3 (tahap 1 + 2)
- npc_venn dipindah ke (280,88) dari dalam annex solid (280,70). Browser: dialog terbuka.
- npc_timm dipindah ke (160,164) dari dalam blok air mancur (160,140). Browser: dialog terbuka.
- Dialog: word-wrap via src/engine/rendering/TextWrap.js, kotak menyesuaikan tinggi. Tes DialogueTextFit (919 node). Screenshot: ch2_mira_personal_scene, ch3_road_bellhaven_first_view.
- 404 favicon.ico: <link rel="icon" href="data:,">. Tidak muncul di run browser.
- ch2_note_0 dipindah ke (100,96) dari dalam blok batu di forest (tidak punya posisi valid). Tes ObjectReachability.
- Koreksi: ch2_echo_stone, ch4_rec_east/west, ch4_cat_0, guest_page_* ternyata bisa dijangkau (BFS di kolisi tile).
- Tes NpcFootprint: semua NPC village, forest, plaza berada di tile walkable (footprint 12x14). jarek, elara, ruli, mira lolos.
- Browser (verify_tahap2.mjs.txt):
  - A1: node tanpa pilihan (ch2_first_echo) menerapkan flag ch2_first_echo_heard.
  - A4: inventaris penuh, bunga tetap di dunia, toast "Inventaris penuh".
  - A5: chapterHook memunculkan toast "Bab 3 telah terbuka." (payload disuntikkan lewat event, bukan lewat akhir Bab 2 sungguhan).
  - Bunga jalan: keempat bunga bisa diambil.
  - A8: dialog hutan ch2_forest_entry selesai tanpa error konsol.
- Tes: 239+ lulus. Validator bersih.

## Tahap 3
- D7 (blocker, diperbaiki): setelah First Resonance tidak ada yang memulai ch5_unseen_observer dan ch5_arc1_finale, jadi Arc I tidak pernah selesai. Ditambahkan DIALOGUE_CHAIN di GameplayDemoScene. Browser: rantai berjalan, arc1_completed dan chapter_06_unlocked terpasang, toast Bab 6 muncul. Catatan: pengujian memaksa ch4_completed dan ch5_site_reached, belum lewat seluruh Bab 1-4.
- D6 (blocker, diperbaiki): banter Bab 2-5 terdaftar tapi tidak pernah diputar. Ditambahkan PARTY_AFTER_DIALOGUE (20 pemetaan, satu per banter). Browser: ch2_party_forest_entry diputar setelah ch2_forest_entry. Pemetaan adalah pilihan desain; banter ch5_banter_after_resonance diputar setelah finale, bukan sebelumnya.
- D2 (diperbaiki): save memakai MemoryStorageAdapter sehingga hilang setiap reload. main.js sekarang memakai IndexedDBAdapter jika tersedia. Flag cerita (_ch1Flags.._ch5Flags) dan zona ikut disimpan dan dipulihkan saat load (sebelumnya hanya posisi). Browser: F5, reload, F9 memulihkan zona, flag, dan inventaris.
- D1: flag arc1_completed dan chapter_06_unlocked hanya diset oleh node finale ch5_completed. Tes Arc1ProgressionGate.
- D5: audit statis, semua 36 target flag objektif punya pemicu. Tes urutan objektif quest_ch5_resonansi_pertama.
- Tes: 255/255 lulus. Validator bersih.

## Tahap 4
- D8: toast memakai nama tampilan, bukan ID. Quest diterima, Quest selesai (_questTitle), Membeli (_itemTitle). Pesan gagal dialog sekarang generik; ID hanya masuk console.
- Tes ToastNames: setiap quest dan item yang dipakai efek dialog punya nama.
- Browser: "Membeli Herb Hutan (-5 gold)", "Quest diterima: Serpihan Indeks", "Quest diterima: Suara di Balik Batu".
- Tes: 257/257 lulus.

## Tahap 5
- D3: zona dikunci sesuai progres bab lewat ZONE_GATES di GameplayDemoScene. Keputusan desain (dikerjakan dengan asumsi, bisa dibalik dengan menghapus entri di ZONE_GATES):
  - road_bellhaven, bellhaven_gate, bellhaven_plaza, bellhaven_market: perlu ch2_completed.
  - bellhaven_archive_hall: perlu ch3_completed.
  - resonance_ancient_site: perlu ch4_completed.
  - Hutan dan desa tidak dikunci.
- Mekanisme: ZoneManager.canEnter. Transisi yang terkunci dibatalkan, pemain kembali ke posisi aman terakhir, dan toast alasannya muncul sekali.
- Load save memakai jalur pemulihan zona sendiri dan tidak melewati gate.
- Browser: terkunci tetap di hutan dengan toast; setelah ch2_completed, masuk ke jalan Bellhaven.
- Tes: 257/257 lulus. Validator bersih.

## Tahap 6
- Dokumen QA: docs/qa/BATCH_9_1_3_QA_D1_D9.md. Berisi status per item (terbukti, parsial, sebagian, belum) dengan bukti dan batas metodenya.
- CHANGELOG diperbarui untuk tahap 1 sampai 6.

## Remaining verification after continuation
- Browser A6 transition matrix and `ch2_note_0` collection remain NOT VERIFIED in this host.
- 19 party-banter runtime mappings still need browser playback audit; unit/source checks are not substitutes.
- The one-off 404 needs fresh browser network capture; it was not reproducible here because browser navigation is blocked.
- Normal Chapter 1→5 playthrough and natural Arc I finale remain NOT VERIFIED end-to-end.
- `ch1_party_orin_mira_travel` now uses the shared party queue; unit tests cover successful start and retry after a temporary startup failure. Browser playback remains unverified.
- Story-chain startup is capped at three consecutive attempts; a permanent startup failure can drop a step. This remains a known risk.
- Locked-zone trigger-overlap recovery has unit coverage, but the exact browser edge case remains NOT VERIFIED.

## Batch 9.1.2 continuation — checkpoint reconciliation (2026-11-12)
- Reconciled Claude's unfinished list against the supplied checkpoint. Existing QA files were present, including `BATCH_9_1_3_QA_D1_D9.md`; earlier notes claiming no QA documents existed were stale.
- Content organization: moved the 11 existing Arc I item definitions to `content/items/arc_01.js` and the existing `thorn_sprite` definition to `content/enemies/arc_01.js`.
- Compatibility: retained legacy exports through `content/gameplay/demo-content.js`; existing scene/tests do not need import-path changes.
- `content/entities/` remains without declarative entity definitions because NPC/interactable spawn behavior is still scene-owned and no canonical schema/loader exists. Added documentation instead of creating duplicate records.
- Added content-catalogue regression tests and directory documentation.
- Browser verification in this host was blocked: managed Chromium refused localhost, container-IP, and file navigation. No new browser claims are made.
- Remaining: fresh browser A6, `ch2_note_0`, 19 banter mappings, normal Chapter 1→5 playthrough, and 404 network capture; capped story-chain retry risk; locked-zone trigger-overlap browser case. The Chapter 1 travel banter lifecycle itself is source- and unit-test-verified; browser playback is pending.


## Batch 9.1.2 continuation — collectible retry fix (2026-11-12)
- Fix: one-shot interactions now remain available when their callback explicitly returns `false`.
- Fix: Arc I inventory pickups (`ch2_elara_note`, `ch4_catalog_fragment`, `guest_page`, `index_shard`) return the inventory-add result, so a full inventory no longer permanently consumes the pickup.
- Regression coverage: `CollectibleInteraction.test.js` verifies rejected one-shot retries, successful one-shot consumption, and the actual `ch2_note_0` scene spawn/collection path including retry after inventory space becomes available and duplicate prevention.
- Browser playthrough remains BLOCKED in this host; this is unit/integration evidence, not browser verification.


## Batch 9.1.2 continuation — critical story-chain retry and canvas QA (2026-11-12)
- Fix: critical story-chain steps are no longer dropped after three startup failures. They remain pending and retry with capped 1/2/4/8-second backoff; non-critical party banter keeps its three-attempt defer behavior.
- Regression: `StoryChainRetry.test.js` covers three failures, pending-step retention, backoff, and eventual successful recovery. `PartyBanterMapping.test.js` verifies all 19 mapped trigger/content IDs and queue/start/seen lifecycle.
- Browser canvas QA: imported the actual `TextWrap.js` module into Chromium 144 and measured all 919 dialogue nodes using Canvas 2D `measureText()` at 10px monospace. Result: zero overflow cases; max dialogue box height 114px. Isolated screenshots are stored in `docs/qa/evidence/batch-9-1-2-canvas/`.
- Limitation: managed Chromium still blocks navigation to the actual game; this does not count as full browser runtime QA.
- Verification: 291 tests passed; project validator 368 files / 155 ES modules; narrative and world validators passed.


## Batch 9.1.2 — final QA gate reconciliation (2026-11-12)
- Re-ran the full automated suite from the v3 checkpoint: 291 passed, 0 failed, 0 skipped (79 suites).
- Re-ran project, narrative, and world validators; all exited successfully.
- Corrected stale handover risk notes: critical story-chain steps now retry indefinitely with capped 1/2/4/8-second backoff; the three-attempt defer policy applies only to non-critical party banter.
- Re-attempted real game navigation with Chromium/Playwright against a local static server; blocked by `ERR_BLOCKED_BY_ADMINISTRATOR`. Full browser QA remains BLOCKED, so this checkpoint is CONDITIONAL and is not declared released.
- Added `docs/qa/BATCH_9_1_2_FINAL_RELEASE_GATE.md` as the consolidated current status and remaining browser checklist.

## 2026-11-13 — B15 Character Roster Foundation
- Added Kael Rowan (`kael` → `character_kael_rowan`) as the third Character Bible principal-party member.
- Preserved `orin` and `mira` runtime IDs and existing save version v4.
- Added Kael progression, party-flag integration seam, battle participation, EXP distribution, and optional save state.
- Documented the unresolved iPhone 13 widescreen canvas limitation; no stretching, cropping, or unapproved renderer migration.


## Phase 3 — Enemies and bosses (B19–B25)

- Expanded data-driven enemy catalogues to 50 regular/elite enemy definitions across all six story arcs.
- Added six main story bosses, one optional Arc I mini-boss, and one optional Arc II boss, each with explicit multi-phase combat data and registered rewards.
- Added injected boss participant construction and scene-level boss encounter entry, victory flags, and persistence through the existing save-v6 world flag structure.
- Added global content lookup, catalogue validation, deterministic encounter tests, phase/reward tests, and documentation updates.
- No new dependencies, no BGM, no save schema bump, no chapter-map placement claim.

## Phase 3 runtime compatibility fix (2026-11-13)
- Guarded touch-overlay viewport alignment so an older cached `TouchControls` module cannot abort application startup when `setBounds` is unavailable.
- Bumped the service-worker shell cache from `jrpg-shell-v12` to `jrpg-shell-v13` so activation removes stale cached modules and reloads the current app shell.
- Updated PWA configuration tests for the compatibility guard and cache version.
- Verification: `npm test` (634/634), `npm run check`, `npm run check:world`, `npm run check:narrative`, and `npm run check:enemies` passed.
- Physical iPhone/Android Safari/Chrome verification remains NOT RUN.
