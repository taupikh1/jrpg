# BATCH 18 PLAN — Karakter Keempat dan Kelima (Arc II)

## Scope resmi
- Menambahkan Iven Marr (runtime ID `iven`) sebagai karakter playable keempat, direkrut pada Chapter 7.
- Menambahkan Tavi Brindle (runtime ID `tavi`) sebagai karakter playable kelima, direkrut pada Chapter 8.
- Menambahkan kerangka dialog rekrut di `content/dialogue/party/` dengan teks pemain dalam Bahasa Indonesia.
- Memperluas roster flag rekrut/keluar dan mempertahankan batas maksimal empat anggota aktif dalam battle.
- Menaikkan save ke v6 sesuai persetujuan pemilik proyek; migrasi v5→v6 dan kompatibilitas save v1–v5.
- Menyimpan HP/MP Iven dan Tavi secara terpisah, tanpa mengubah statistik karakter lama.
- Menambahkan skill unik, signature, dan kurva pertumbuhan yang sesuai peran agar keduanya dapat ikut battle dan progresi menggunakan sistem yang sudah ada.

## Daftar file perkiraan
- Engine: `src/scenes/GameplayDemoScene.js`, `src/engine/persistence/SaveSchema.js`, `src/engine/persistence/SaveMigrations.js`.
- Konten: `content/characters/progression.js`, `content/dialogue/party/ch7_party.js`, `content/dialogue/party/ch8_party.js`, `content/dialogue/index.js`.
- Tes: `tests/unit/gameplay/CharacterRoster.test.js`, `tests/unit/gameplay/CharacterSkills.test.js`, `tests/unit/gameplay/Progression.test.js`, `tests/unit/persistence/Save.test.js`.
- Dokumen: Decision Log, roadmap v2, Character ID Map, Content ID Registry, `docs/02-technical/SAVE_FORMAT.md`, README, CHANGELOG, docs index, laporan dan Paket Uji iPhone.

## Dokumen yang dibaca
- `README.md`, `docs/INDEX.md`, `docs/00-project/DECISION_LOG.md`, `docs/00-project/RISK_REGISTER.md`.
- `docs/handover/HANDOVER_JRPG_ROADMAP_v2.md`, `docs/handover/B16_B17_COMBINED_REPORT.md`, `CHANGELOG.md`.
- `docs/narrative/CHARACTER_BIBLE.md`, `CONTENT_SCHEMA.md`, `CONTENT_ID_REGISTRY.md`, `NARRATIVE_CONTINUITY_RULES.md`, `DIALOGUE_STYLE_GUIDE.md`, `MAIN_STORY_OUTLINE.md`, `CHARACTER_ID_MAP.md`, `CHARACTER_KNOWLEDGE_MATRIX.md`.
- Save, party, progression, dialogue, battle, scene, dan test modules terkait.

## Risiko dan batasan
- Chapter 7 dan 8 belum memiliki implementasi world/quest penuh; B18 hanya mendaftarkan kerangka dialog rekrut agar dapat dipakai oleh batch chapter berikutnya.
- Lima karakter dapat direkrut, tetapi maksimal empat menjadi anggota battle aktif. Anggota kelima tetap tersimpan sebagai roster cadangan ketika seluruh slot aktif terisi. Saat Tavi direkrut, ia mengambil slot aktif keempat dan Iven menjadi cadangan; bila Tavi keluar, Iven kembali aktif. Tidak ada menu pergantian manual baru dalam scope B18.
- Tidak mengubah renderer, D-022, sistem battle inti, level cap, dependensi, BGM, atau konten Chapter 7/8 selain kerangka dialog party.
- Save v6 dipakai untuk persistensi roster dan HP/MP dua karakter baru. Rencana versi save berikutnya digeser secara berurutan: B20 v7, B30 v8, B32 v9, dan v10 bila diperlukan.
