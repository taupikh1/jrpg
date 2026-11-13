# BATCH 10 — Laporan akhir (Phase 0: baseline, verifikasi, dan drift)

## 1. ZIP
ZIP hasil dibuat di luar repo (`jrpg-project-batch10_1.zip`). Nama, ukuran, hasil `unzip -t`, dan SHA-256 dicantumkan di jawaban chat, karena laporan ini ada di dalam ZIP dan tidak bisa memuat checksum ZIP-nya sendiri.

## 2. Yang diperiksa
- Snapshot baseline: `jrpg-project-batch10_baseline.zip` (dibuat sebelum perubahan apa pun) dan `docs/handover/BATCH_10_BASELINE_SHA.txt` (474 berkas).
- Baseline tes dan validator (lihat 5).
- Bug terbuka B1 dan B2, serta daftar D1 sampai D9 (lihat 6).
- Drift dokumen dan ID (lihat 8).
- Tautan `docs/INDEX.md`.

## 3. Yang diimplementasikan
- Tidak ada perubahan perilaku game. Tidak ada bug yang diperbaiki di batch ini.
- Keputusan pemilik proyek dicatat di `DECISION_LOG.md` sebagai D-011 sampai D-015 (APPROVED): batas level 10 sampai Phase 6, tanpa BGM (ambience tidak boleh menyerupai musik), gaya tempur turn-based dengan ritme ATB ringan, platform iPhone dan desktop dengan Android Chrome tetap didukung, dan dua sampai tiga ending.
- Pemetaan drift dan konvensi ID dicatat sebagai D-016 (PROPOSED) dan D-017 (OPEN).
- D-018 mencatat bahwa D-009 tetap NOT VERIFIED.
- Roadmap v2.1: B26 sampai B29 dibatalkan, batch aktif menjadi 38.
- `docs/INDEX.md`: ditambah pointer ke Batch 9.3B, QA D1 sampai D9, bukti Batch 10, dan keputusan roadmap. Semua path yang dirujuk INDEX sudah dicek dan ada.

## 4. File yang diubah (dari diff baseline)
- Diubah: `docs/00-project/DECISION_LOG.md`, `docs/INDEX.md`.
- Baru: `docs/handover/BATCH_10_PLAN.md`, `docs/handover/BATCH_10_REPORT.md`, `docs/handover/HANDOVER_JRPG_ROADMAP_v2.md`, `docs/qa/evidence/batch-10/check_bh_fountain.mjs`, `docs/qa/evidence/batch-10/check_bh_fountain.output.txt`, `docs/handover/BATCH_10_BASELINE_SHA.txt`.
- Tidak ada file di `src/`, `content/`, `tests/`, `tools/`, atau `legacy/` yang berubah.

## 5. Tes dan validator (output nyata)
Baseline (sebelum perubahan) dan setelah perubahan:
- `npm test`: 504 tes, 131 suites, 504 lulus, 0 gagal, 0 dilewati. Sama dengan klaim 9.3B.
- `npm run check`: OK, 475 berkas pada baseline (termasuk file checksum yang dibuat batch ini), 479 berkas setelah perubahan, 196 lalu 197 modul ES. Kenaikan modul ES disebabkan oleh `check_bh_fountain.mjs` yang ditambahkan. Angka 474 di klaim 9.3B tidak lagi cocok karena ada file yang ditambahkan sesudahnya.
- `npm run check:world`: WORLD VALIDATOR OK, 12 region, 10 zona playable.
- `npm run check:narrative`: NARRATIVE VALIDATOR OK.
- Validator `check` melaporkan bahwa pemeriksaan tautan antar dokumen markdown masih NOT VERIFIED. Tautan `docs/INDEX.md` dicek manual oleh batch ini.

## 6. Status bug dan D1 sampai D9
### B1 — `bh_fountain` (dicek dengan `docs/qa/evidence/batch-10/check_bh_fountain.mjs`)
- Status: **STILL DEFECT** (verifikasi statis dan reachability, bukan browser).
- Bukti: objek `bh_fountain` di (176,120) jatuh di tile (11,7), yang tidak bisa dilewati. Keempat tetangganya juga tidak bisa dilewati. Tile yang bisa dilewati terdekat berjarak 33.0 px dari pusat objek, sedangkan jarak interaksi `InteractionComponent` adalah 28 px. Akibatnya interaksi tidak bisa dipicu.
- Catatan: tidak ada tes yang mencakup `bh_fountain`. Batch ini tidak memperbaikinya (di luar scope).

### B2 — `npc_timm`
- Status: **FIXED (statis)**. NPC berada di (160,164), tile (10,10), bisa dilewati dan dapat dijangkau dari titik awal.
- Browser belum diuji ulang di batch ini.

### D1 sampai D9
- Daftar D1 sampai D9 **ditemukan** di `docs/qa/BATCH_9_1_3_QA_D1_D9.md`. Ini adalah daftar QA batch 9.1.3 dengan status per item (D1 flag Arc I, D2 storage, D3 gating bab, D4 overflow dialog, D5 QuestLog, D6 party banter, D7 First Resonance dan finale, D8 toast ID mentah, D9 A1 sampai A5 dan bunga), termasuk addendum rekonsiliasi 2026-11-12.
- Status yang dicatat di dokumen itu **tidak diverifikasi ulang** di batch ini. Browser tidak tersedia di container (lihat 7). Semua item yang membutuhkan browser ditandai NOT TESTED pada batch ini.
- Pemilik proyek perlu mengonfirmasi bahwa dokumen ini memang daftar D1 sampai D9 yang dimaksud. Jika tidak, item tersebut tetap NOT FOUND.

## 7. Verifikasi browser dan D-009
- Container tidak punya Chromium. Playwright CLI ada, tetapi browsernya tidak terpasang, dan jaringan dimatikan sehingga browser tidak bisa diunduh.
- **D-009 (resolusi 480x270, iPhone Safari, Android Chrome): NOT VERIFIED.** Perlu Paket Uji iPhone.
- Semua item browser di bagian 6 ditandai NOT TESTED.

## 8. Drift dokumen dan ID
- **COMBAT_DESIGN.md** (diusulkan sebagai D-016): `systems/battle` menjadi `src/engine/gameplay/battle/`. `systems/status-effects` dan `content/combat` belum ada dan akan dibuat di B11 bila diperlukan. `content/creatures` menjadi `content/enemies/`. Skill saat ini didefinisikan di `content/characters/progression.js`.
- **ID karakter** (OPEN sebagai D-017): runtime memakai `orin` dan `mira`. `CHARACTER_BIBLE.md` dan `CONTENT_SCHEMA.md` memakai `character_orin_vale` dan `character_mira_solenne`. Tidak ada perubahan kode. Batch ini tidak mengganti ID karena save bergantung pada ID runtime.
- **Karakter ketiga** (untuk B15): `CHARACTER_BIBLE.md` sudah memuat Kael Rowan, Tavi Brindle, Sera Nhal, Iven Marr, Neris Avel, dan Bram Alder. Batch ini belum menentukan siapa karakter ketiga party. Keputusan itu menunggu B15.

## 9. Batasan yang tersisa
- B1 tidak diperbaiki dan perlu batch khusus atau persetujuan untuk diperbaiki.
- Status D1 sampai D9 tidak diverifikasi ulang.
- D-009 dan semua pengujian browser tetap NOT VERIFIED atau NOT TESTED.
- Ambience dari Batch 9.3A dibuat oleh `tools/audio/generate-audio.py` dan menurut komentar di file itu berbasis noise, tanpa penyusunan nada. Ini **tidak diverifikasi dengan mendengarkan**. Pemilik proyek perlu memeriksa sebelum G5 sesuai D-012.

## 10. Keputusan sementara dan perlu konfirmasi
- D-017 (konvensi ID karakter): rekomendasi mempertahankan `orin` dan `mira`. Menunggu keputusan pemilik.
- Daftar D1 sampai D9: apakah `BATCH_9_1_3_QA_D1_D9.md` adalah daftar yang dimaksud.
- Arti "prinsip Ponytail" yang disebut dalam instruksi. Kata "ponytail" tidak ditemukan sebagai prinsip di dokumen repo. Satu-satunya kemunculan ada di `CharacterArt.js` sebagai gaya rambut. Batch ini tidak mengasumsikan arti apa pun.

## 11. Langkah berikutnya yang disarankan
1. Pemilik proyek menjawab: D-017, daftar D1 sampai D9, dan arti "prinsip Ponytail".
2. Pemilik proyek menyetujui atau menolak D-016.
3. Pemilik proyek menjalankan Paket Uji iPhone untuk D-009 dan memeriksa ambience.
4. Setelah persetujuan, B1 bisa dijadwalkan sebagai perbaikan terpisah.
5. B11 dimulai hanya setelah Phase 0 disetujui secara resmi.

---

## Addendum (pemeriksaan ulang setelah keputusan pemilik proyek)

Phase 0 tetap selesai dan tidak dimulai ulang. Temuan di atas dibaca ulang dengan arah visual baru.

- **Arah visual:** D-021 mengubah target menjadi HD 3D stylized JRPG bergaya FF4 HD. Bagian 6 dan 9 di atas (D-009, pixel-art, `TECHNICAL_ARCHITECTURE.md`, `ASSET_PROMPTS.md`) berlaku sebagai **kondisi lama**. Penilaian arsitektur ada di `docs/02-technical/HD_3D_REASSESSMENT.md`.
- **Resolusi:** kode memakai 320x240 (`src/core/Config.js`), sedangkan D-009 dan `TECHNICAL_ARCHITECTURE.md` masih menulis 480x270. Ini drift yang ditemukan di batch ini dan dicatat sebagai D-022 (UNDER REVIEW).
- **B1 `bh_fountain`:** status tetap STILL DEFECT. Perbaikan B1 bergantung pada layer presentasi yang mungkin berubah. Perbaikan logika kolisi dan interaksi tetap bisa dilakukan secara terpisah setelah keputusan, sebagai batch khusus.
- **B2 `npc_timm`:** status tetap FIXED (statis).
- **D-017 (ID karakter):** APPROVED. Pemetaan ada di `docs/narrative/CHARACTER_ID_MAP.md`. Tidak ada perubahan kode.
- **D-019 (Ponytail):** berlaku untuk seluruh batch.
- **D-020 (B15):** karakter ketiga ditentukan di B15, dari `CHARACTER_BIBLE.md`.
- **Status gerbang:** Phase 0 selesai. Phase 1 belum disetujui secara eksplisit. Batch 11 belum dimulai.
