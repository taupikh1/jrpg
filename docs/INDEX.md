# Dokumentasi Proyek

Indeks ini membantu menemukan dokumen aktif dan historis. Status implementasi harus ditentukan dari laporan QA terbaru, bukan dari keberadaan dokumen atau folder saja.

## Titik masuk

| Area | Lokasi |
|---|---|
| Ringkasan proyek dan keputusan | `docs/00-project/` |
| Desain game dan pertarungan | `docs/01-design/` |
| Arsitektur, schema, persistence | `docs/02-technical/` |
| Standar aset | `docs/03-art/` |
| Roadmap dan quality gates | `docs/04-production/` |
| Panduan kontribusi | `docs/05-guides/` |
| Dunia dan wilayah | `docs/world/` |
| Canon, karakter, dan narasi | `docs/narrative/` |
| Bab dan materi cerita | `docs/chapters/` |
| Audit dan bukti QA | `docs/qa/` |
| Instruksi pelanjutan pekerjaan | `docs/handover/` |

## QA terbaru

Mulai dari dokumen Batch 9.1.2, khususnya:

- `docs/qa/BATCH_9_1_2_CONTINUATION_QA.md`
- `docs/qa/BATCH_9_1_2_FINAL_RELEASE_GATE.md` (latest consolidated release decision)
- `docs/qa/BATCH_9_1_3_QA_D1_D9.md`
- `docs/qa/evidence/batch-9-1-2-canvas/` (isolated Chromium canvas layout evidence; not full game runtime)

Dokumen tersebut harus dibaca bersama bukti dan batasan yang dicantumkan di dalamnya. Jangan menganggap source inspection atau unit test sebagai bukti browser runtime.

## Konten game

| Folder | Fungsi | Status umum |
|---|---|---|
| `content/dialogue/` | Dialog bab, NPC, dan party | Sudah berisi konten Arc I |
| `content/quests/` | Definisi quest | Sudah berisi sebagian quest Arc I |
| `content/items/` | Katalog item | Katalog awal, belum lengkap |
| `content/enemies/` | Katalog musuh | 50 definisi lintas enam arc; placement map belum lengkap |
| `content/bosses/` | Boss utama dan opsional | 6 boss utama + 2 opsional/mini-boss; map/chapter flow belum lengkap |
| `content/entities/` | Data entity dunia | Belum memiliki katalog deklaratif lengkap |
| `content/world/` | Data zona dan dunia | Fondasi zona playable tersedia |

## Catatan pemeliharaan

- Pertahankan laporan QA historis agar keputusan dan regresi dapat ditelusuri.
- Jangan menghapus dokumen lama hanya karena batch-nya sudah lewat.
- Tandai klaim sebagai VERIFIED, SOURCE VERIFIED, TEST VERIFIED, NOT VERIFIED, NOT IMPLEMENTED, atau BLOCKED sesuai bukti.
- Perbarui indeks ini saat struktur dokumentasi berubah.

## Pointer tambahan (diperbarui Batch 10)

- Batch 9.3B (progresi, EXP, save v4): `docs/batch9.3b/BATCH_9_3B_PROGRESSION_REPORT.md`
- Status D1 sampai D9 (QA batch 9.1.3, termasuk addendum rekonsiliasi): `docs/qa/BATCH_9_1_3_QA_D1_D9.md`
- Bukti pemeriksaan B1 dan B2 (Batch 10): `docs/qa/evidence/batch-10/`
- Keputusan roadmap dan status D-011 sampai D-018: `docs/00-project/DECISION_LOG.md`
- Handover roadmap: `docs/handover/HANDOVER_JRPG_ROADMAP_v2.md`
- Pre-B15 world/PWA/UI implementation report: `docs/handover/PRE_B15_REPORT.md`
- Pre-B15 iPhone device test guide: `docs/handover/PRE_B15_IPHONE_TEST_GUIDE.md`
- Penilaian arsitektur HD 3D (USULAN): `docs/02-technical/HD_3D_REASSESSMENT.md`
- Pemetaan ID karakter (D-017): `docs/narrative/CHARACTER_ID_MAP.md`
- Laporan Phase 1 (battle B11 sampai B14): `docs/handover/PHASE_1_REPORT.md`
- Prototipe spike HD 3D (belum diukur): `prototypes/hd3d-spike/` (lihat `README.md`)

## Handover and batch reports
- `docs/handover/PRE_B15C_REPORT.md` — iPhone 13 landscape full-screen review and D-022 blocker.
- `docs/handover/B15_REPORT.md` — B15 character roster implementation and verification scope.
- `docs/handover/B15_BASELINE_SHA.txt` — SHA-256 inventory of the B15 input ZIP contents.

## Batch reports
- `handover/B16_B17_COMBINED_REPORT.md` — laporan gabungan B16/B17: roster, save v5, skill, combat, dan integrasi cerita.

- `docs/handover/BATCH_18_REPORT.md` — laporan B18, save v6, rekrut Iven/Tavi, tes, dan batasan.
- `docs/handover/BATCH_18_IPHONE_TEST_GUIDE.md` — Paket Uji iPhone untuk verifikasi manual B18.
- `docs/handover/PHASE_3_REPORT.md` — laporan gabungan B19–B25 dan bukti gerbang otomatis G3.
- `docs/handover/PHASE_3_IPHONE_TEST_GUIDE.md` — panduan uji browser dan perangkat manual Phase 3.
- `docs/handover/BATCH_19_REPORT.md` sampai `BATCH_25_REPORT.md` — laporan per batch Phase 3.
- `docs/02-technical/SAVE_FORMAT.md` — bentuk payload runtime save v6 dan urutan migrasi.
- `docs/handover/FF1_REPORT.md` — laporan FF1 layout battle ala FF4.
- `docs/handover/FF3_FF5_PROGRESS.md` — progress FF3 presentasi dan FF5 random encounter.
- `docs/handover/FF_REMAINING_DONE.md` — sisa batch FF3–FF9.
- `docs/narrative/PROJECT_LEDGER.md` — ledger produksi narrative bible.
- `docs/narrative/CHAPTER_EXPANSION_ARC2_TO_6.md` — perluasan chapter Arc II–VI.
- `docs/narrative/DIALOGUE_SAMPLE_CH6_KAEL.md` — contoh dialog produksi Chapter 6.
- `docs/narrative/STORY_ARCHITECTURE.md` — arsitektur cerita lengkap.
- `docs/narrative/CHARACTER_RELATIONSHIP_BIBLE_EXPANDED.md` — bible karakter & hubungan diperluas.
- `docs/narrative/WORLD_LOCATION_BIBLE_EXPANDED.md` — bible dunia & lokasi diperluas.
- `docs/narrative/CHAPTER_PLAN_CONSOLIDATED.md` — rencana chapter terkonsolidasi.
- `docs/narrative/CANON_AUDIT_REPORT.md` — Phase A audit report.
- `docs/narrative/CHAPTER_01_05_CANON_REFERENCE.md` — rekonstruksi Chapter 1–5.
- `docs/narrative/CHARACTER_CANON_MATRIX.md` — matriks canon karakter.
- `docs/narrative/WORLD_CANON_MATRIX.md` — matriks canon dunia.
- `docs/narrative/NARRATIVE_CONFLICT_REGISTER.md` — register konflik.
- `docs/narrative/MASTER_STORY_BIBLE.md` — Phase B master story.
- `docs/narrative/ARC_STRUCTURE.md` — struktur arc.
- `docs/narrative/CHAPTER_MASTER_MATRIX.md` — matriks chapter.
- `docs/narrative/ENDING_DESIGN.md` — desain ending.
- `docs/narrative/CHARACTER_BIBLE.md` — Phase C expanded.
- `docs/narrative/CHARACTER_RELATIONSHIP_MATRIX.md` — matriks hubungan.
- `docs/narrative/CHARACTER_KNOWLEDGE_MATRIX.md` — matriks pengetahuan.
- `docs/narrative/PARTY_INTERACTION_PLAN.md` — rencana interaksi party.
- `docs/narrative/CHARACTER_DIALOGUE_STYLE_GUIDE.md` — panduan suara.
- `docs/narrative/WORLD_MASTER_PLAN.md` — Phase D.
- `docs/narrative/WORLD_CONNECTION_GRAPH.md` — graf koneksi.
- `docs/narrative/REGION_BIBLE.md` — bible region.
- `docs/narrative/SETTLEMENT_BIBLE.md` — permukiman.
- `docs/narrative/DUNGEON_BIBLE.md` — dungeon.
- `docs/narrative/NPC_BIBLE.md` — NPC.
- `docs/narrative/FACTION_BIBLE.md` — faksi (diperluas).
- `docs/narrative/MONSTER_LORE_ARCHITECTURE.md` — Phase E.
- `docs/narrative/ENEMY_MASTER_BIBLE.md` — musuh.
- `docs/narrative/BOSS_BIBLE.md` — boss.
- `docs/narrative/ENEMY_REGION_PLACEMENT_MATRIX.md` — penempatan.
- `docs/narrative/BOSS_STORY_CONNECTION_MATRIX.md` — koneksi cerita.
- `docs/narrative/MAIN_QUEST_BIBLE.md` — Phase F main quests.
- `docs/narrative/SIDE_QUEST_BIBLE.md` — side quests.
- `docs/narrative/CHARACTER_QUEST_BIBLE.md` — character quests.
- `docs/narrative/ITEM_AND_EQUIPMENT_BIBLE.md` — item & equipment.
- `docs/narrative/QUEST_DEPENDENCY_MATRIX.md` — dependensi.
- `docs/narrative/STORY_FLAG_CATALOG.md` — katalog flag.
- `docs/narrative/FULL_DIALOGUE_MASTER_INDEX.md` — Phase G index.
- `docs/narrative/CHAPTER_01_05_DIALOGUE_AUDIT.md` — audit dialog Ch1-5.
- `docs/narrative/CHAPTER_06_10_FULL_DIALOGUE.md` — dialog penuh 6-10.
- `docs/narrative/CHAPTER_11_15_FULL_DIALOGUE.md` — dialog 11-15.
- `docs/narrative/CHAPTER_16_20_FULL_DIALOGUE.md` — dialog 16-20.
- `docs/narrative/CHAPTER_21_25_FULL_DIALOGUE.md` — dialog 21-25.
- `docs/narrative/CHAPTER_26_30_FULL_DIALOGUE.md` — dialog 26-30 + ending.
- `docs/narrative/NARRATIVE_CONTINUITY_AUDIT.md` — Phase H audit.
- `docs/narrative/FINAL_CONTENT_ID_REGISTRY.md` — registry akhir.
- `docs/narrative/CHAPTER_COMPLETENESS_MATRIX.md` — kelengkapan chapter.
- `docs/narrative/CODING_AGENT_IMPLEMENTATION_HANDOVER.md` — handover coding.
- `docs/art-overhaul/` — Milestone 0 art overhaul audit (no code changes).
- `docs/art-overhaul/` — Milestone 0 + Milestone 1 art prototype.
- `docs/art-overhaul/` — Art overhaul Milestones 0–6 (pipeline + catalogs + prototype).
