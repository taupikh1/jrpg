# BATCH 18 — Karakter Keempat dan Kelima (Arc II)

## 1. ZIP (item pertama)
- File: `jrpg-project-batch18_1.zip`
- Ukuran dan SHA-256 final: tercantum pada companion `BATCH_18_DELIVERY_MANIFEST.md` yang diserahkan bersama ZIP.
- `unzip -t`: diverifikasi setelah arsip final dibuat; hasil rinci tercantum pada companion delivery manifest.
- Snapshot baseline: `jrpg-project-batch18_baseline.zip`, 2,105,700 bytes, SHA-256 `d824d967367172aa3c08fbf80260babe6017cedfc2b8a128bf92770c7aee5602`; `unzip -t` lulus.
- Manifest baseline: `BATCH_18_BASELINE_SHA.txt` berisi 516 checksum file baseline.

## 2. Yang diperiksa
- Handover v2 lengkap, Decision Log, Risk Register, laporan gabungan B16/B17, CHANGELOG, README, dan docs index.
- Character Bible, Character ID Map, Content Schema, Content ID Registry, Main Story Outline, Character Knowledge Matrix, Narrative Continuity Rules, dan Dialogue Style Guide.
- Save schema/migrations/manager/validator, PartyRoster, ProgressionSystem, DialogueEngine, BattleManager, GameplayDemoScene, dan tes terkait.
- Iven Marr (`character_iven_marr`) ditetapkan muncul pertama kali pada Chapter 7; Tavi Brindle (`character_tavi_brindle`) pada Chapter 8. Tidak ada karakter baru yang diciptakan di luar Character Bible.

## 3. Yang diimplementasikan
- **Iven Marr** dengan runtime ID permanen `iven`, join flag `ch7_iven_joined`, leave flag `ch7_iven_departed`, profil mobilitas/utilitas, pertumbuhan level, empat skill, dan satu signature `Jalur Bayangan`.
- **Tavi Brindle** dengan runtime ID permanen `tavi`, join flag `ch8_tavi_joined`, leave flag `ch8_tavi_departed`, profil gadget/kendali, pertumbuhan level, empat skill, dan satu signature `Gema Kawan Kecil`.
- Dialog rekrut Bahasa Indonesia: `ch7_iven_recruitment` dan `ch8_tavi_recruitment`. Dialog terdaftar di runtime dan efeknya mengubah status roster.
- Kedua karakter masuk ke battle, memakai skill dari progression registry, menerima EXP, dan tampil di Status & Skill saat aktif.
- Batas battle tetap maksimal empat anggota. Saat semua lima anggota sudah direkrut, Tavi (rekrutan terbaru) memakai slot aktif keempat dan Iven menjadi cadangan; jika Tavi keluar, Iven kembali aktif. Perekrutan tidak ditolak hanya karena empat slot battle sedang terisi.
- Save dinaikkan ke **v6** sesuai persetujuan pemilik. Migrasi v5→v6 menambahkan progresi, roster, flag Chapter 7/8, dan slot HP/MP Iven/Tavi. Data v1–v5 tetap dimigrasikan berurutan hingga v6.
- HP/MP Iven dan Tavi disimpan secara independen di `party.roster.memberStats` dan dipulihkan dengan clamp terhadap maksimum hasil progression.
- Decision Log D-031 dan tabel roadmap save diperbarui: B20 v7, B30 v8, B32 v9, v10 bila diperlukan.

## 4. File yang diubah (dibanding snapshot baseline)

### Modified (16)
- `CHANGELOG.md`
- `README.md`
- `content/characters/progression.js`
- `content/dialogue/index.js`
- `docs/00-project/DECISION_LOG.md`
- `docs/INDEX.md`
- `docs/02-technical/SAVE_FORMAT.md`
- `docs/handover/HANDOVER_JRPG_ROADMAP_v2.md`
- `docs/narrative/CHARACTER_ID_MAP.md`
- `docs/narrative/CONTENT_ID_REGISTRY.md`
- `src/engine/persistence/SaveMigrations.js`
- `src/engine/persistence/SaveSchema.js`
- `src/scenes/GameplayDemoScene.js`
- `tests/unit/gameplay/CharacterRoster.test.js`
- `tests/unit/gameplay/CharacterSkills.test.js`
- `tests/unit/gameplay/Progression.test.js`
- `tests/unit/persistence/Save.test.js`

### Added (6)
- `content/dialogue/party/ch7_party.js`
- `content/dialogue/party/ch8_party.js`
- `docs/handover/BATCH_18_BASELINE_SHA.txt`
- `docs/handover/BATCH_18_PLAN.md`
- `docs/handover/BATCH_18_IPHONE_TEST_GUIDE.md`
- `docs/handover/BATCH_18_REPORT.md`

### Deleted
- Tidak ada.

## 5. Tes dan validator (output aktual)
- Baseline sebelum perubahan: `npm test` — 608/608 lulus, 0 gagal.
- Final: `npm test` — **618/618 lulus**, 0 gagal, 147 suite.
- `npm run check` — **OK**, 522 berkas diperiksa dan 216 modul ES dianalisis.
- `npm run check:world` — **WORLD VALIDATOR OK**, 12 region dan 10 zona playable.
- `npm run check:narrative` — **NARRATIVE VALIDATOR OK**.
- `node --check` pada seluruh modul JavaScript yang diubah — lulus.
- Tes integrasi mencakup pendaftaran dan penyelesaian dialog rekrut, join/leave/rejoin, batas empat anggota aktif, battle/EXP kedua karakter, migrasi v5→v6, kompatibilitas migrasi lama, dan save/load HP/MP dari jalur `GameplayDemoScene`.
- Tidak ada dependensi baru; tidak menjalankan `npm install`.

## 6. Status verifikasi
- Save schema v6 dan migrasi v5→v6: **VERIFIED** oleh tes otomatis.
- Migrasi fixture save v1–v5 ke versi terkini: **VERIFIED** oleh tes otomatis yang tersedia.
- Rekrut, keluar, dan rejoin Iven/Tavi: **VERIFIED** oleh tes integrasi.
- Batas empat anggota battle dan pergantian slot cadangan berbasis flag: **VERIFIED** oleh tes integrasi.
- Battle, skill, EXP, dan pertumbuhan Iven/Tavi: **VERIFIED** oleh tes otomatis deterministik.
- Browser visual/runtime: **NOT TESTED**.
- iPhone 13 Safari Add to Home Screen: **NOT TESTED**; perlu Paket Uji iPhone oleh pemilik.
- Android Chrome dan desktop browser visual: **NOT TESTED**.

## 7. Paket Uji iPhone
- Panduan: `docs/handover/BATCH_18_IPHONE_TEST_GUIDE.md`.
- Mencakup portrait/landscape, safe area, kontrol sentuh, Status & Skill, masuk/keluar battle, migrasi save v5→v6, serta save/load ulang.
- Chapter 7/8 world dan quest belum ada; dialog rekrut baru didaftarkan sebagai kerangka dan diuji otomatis. Pengujian langsung melalui world menunggu B34/B35.

## 8. Batasan yang tersisa
- Tidak membuat world map, NPC, main quest, side quest, encounter, atau chapter flow penuh untuk Chapter 7/8; sesuai batas B18.
- Belum ada menu manual untuk memilih anggota cadangan. Urutan aktif deterministik saat lima karakter direkrut: Orin, Mira, Kael, Tavi; Iven menjadi cadangan. Jika Tavi keluar, Iven mengisi slot aktif.
- Belum ada pengujian visual browser maupun perangkat fisik.

## 9. Keputusan sementara dan perlu konfirmasi
- D-031: save v6 mulai B18, migrasi v5→v6, dan penomoran berikutnya B20 v7, B30 v8, B32 v9. **Disetujui pemilik proyek pada 2026-11-13.**
- Tidak ada keputusan lain yang memerlukan konfirmasi untuk scope B18.

## 10. Langkah berikutnya yang disarankan
- Jalankan Paket Uji iPhone pada ZIP B18 dan laporkan hasilnya.
- Setelah Phase 2/G2 diterima berdasarkan hasil yang tersedia, minta persetujuan Phase 3 sebelum memulai B19 — Katalog Musuh Arc I dan II.
