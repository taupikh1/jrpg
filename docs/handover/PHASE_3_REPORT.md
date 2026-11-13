# PHASE 3 — Musuh dan Boss (B19–B25)

**Tanggal:** 2026-11-13  
**Baseline:** `jrpg-project-batch18_1.zip`  
**Baseline SHA-256:** `a0c60fa59382df32fb253fbedcd4b5faa59102a16137b96a6c9aafb88e15887f`  
**Status implementasi:** selesai untuk scope B19–B25  
**Status gate:** G3 automated gate PASS; penerimaan pemilik proyek masih pending. G2/manual B18 device QA juga belum dinyatakan lulus.

## 1. Ringkasan Phase 3

Phase 3 menambahkan katalog musuh dan roster boss untuk enam arc cerita tanpa mengubah save schema atau menambah dependency.

| Batch | Scope | Hasil |
|---|---|---|
| B19 | Musuh Arc I–II | 9 + 9 musuh |
| B20 | Boss utama + mini-boss Arc I | `warden_of_first_resonance`, `archive_veilkeeper` |
| B21 | Boss utama + boss opsional Arc II | `oathbreaker_colossus`, `starfall_astral_mantid` |
| B22 | Musuh Arc III–IV | 8 + 8 musuh |
| B23 | Boss utama Arc III–IV | `verdant_memory_heart`, `regent_of_unwritten` |
| B24 | Musuh Arc V–VI | 8 + 8 musuh |
| B25 | Boss utama Arc V–VI | `lattice_origin_colossus`, `vaelor_senn_resonant_form` |

**Hasil akhir:** 50 musuh reguler/elite dan 8 boss (6 boss utama, 2 boss opsional/mini-boss). Setiap arc memiliki tepat satu boss utama. Setiap boss utama memiliki tiga fase; boss opsional/mini-boss masing-masing memiliki dua fase.

## 2. Arsitektur dan implementasi

### Enemy catalogues
- `content/enemies/arc_01.js` sampai `arc_06.js`: 9, 9, 8, 8, 8, 8 definisi.
- `content/enemies/index.js`: katalog gabungan dan lookup stabil `getEnemyById()`.
- Setiap musuh memiliki ID stabil, nama/deskripsi Bahasa Indonesia, arc, region/habitat, kategori ekologi, statistik, reward, afinitas elemen, serta aksi AI siklis deterministik.
- `createEnemyParticipant()` mengubah definisi konten menjadi participant runtime.
- `BattleManager` menjalankan `ai.actions` musuh reguler secara siklis dan tetap memakai `boss_action` untuk aksi fase boss. Engine tidak mengimpor folder `content/`; definisi tetap diinjeksi dari lapisan scene/composition.

### Boss catalogues
- `content/bosses/arc_01.js` sampai `arc_06.js` dan `content/bosses/index.js`.
- `createBossParticipant()` membuat participant boss dengan fase, afinitas, statistik, dan reward.
- Setiap fase memiliki ambang HP yang menurun, daftar aksi deterministik, dan dialog `onEnter` bila diperlukan.
- Dua boss opsional ditandai `optional: true` dan `requiredForMainStory: false`; tidak ada prasyarat jalur utama yang menunjuk ke boss opsional.
- Boss Arc I memiliki tiga dialog transisi fase yang terdaftar di katalog dialog Chapter 4/5.
- `GameplayDemoScene._startBossBattle()` memulai encounter boss dan mengelola reward serta flag kemenangan.

### Debug access
Dengan `?debug=1` pada browser desktop, tombol angka memulai encounter uji:
- `1–6`: boss utama Arc I–VI.
- `7`: mini-boss opsional Arc I.
- `8`: boss opsional Arc II.

Ini adalah shortcut pengembangan untuk menguji sistem, bukan klaim bahwa chapter Arc II–VI atau encounter-nya sudah ditempatkan ke world map playable.

## 3. Save dan kompatibilitas

- Save tetap **v6**. Tidak ada save schema bump.
- Flag utama Arc I: `ch5_boss_warden_of_first_resonance_defeated`.
- Semua boss memiliki `flagKey` stabil. Flag disimpan dalam `world.flags.bosses`; flag Chapter 4/5 juga dicerminkan ke map chapter terkait.
- Save/load live `GameplayDemoScene` dan SaveManager round-trip diuji.
- Runtime character IDs, party aktif maksimum empat, dan struktur save roster B18 tidak diubah.

## 4. Validasi dan hasil tes aktual

| Pemeriksaan | Hasil |
|---|---|
| `npm run build` | PASS; project validator + enemy/boss validator |
| Project validator | PASS; 551 file diperiksa, 235 modul ES dianalisis |
| Enemy/boss validator | PASS; 50 musuh, 6 boss utama, 2 boss opsional/mini-boss |
| `npm run check:world` | PASS; 12 region, 10 zona playable |
| `npm run check:narrative` | PASS |
| `npm test` | PASS; 634/634 test, 0 gagal (run final) |
| Enemy encounter tests | PASS; semua 50 definisi menjadi participant dan mengeksekusi aksi melalui BattleManager |
| Boss encounter tests | PASS; semua 8 boss masuk fase, menjalankan aksi fase, dapat dikalahkan, melewati semua ambang fase, dan reward hanya dapat diklaim sekali |
| Boss flag/save tests | PASS; reward, flag Chapter 5, save-v6 round-trip, dan live scene save/load |
| No-BGM regression tests | PASS dalam suite otomatis |
| Browser visual / iPhone 13 Safari / Android Chrome manual QA | NOT RUN |

## 5. Batasan yang belum selesai

1. **World placement belum selesai.** Katalog musuh/boss bukan berarti seluruh encounter sudah ditempatkan di peta. Hanya encounter Sprite Duri yang sudah ada sebelumnya di world demo; boss bisa diluncurkan melalui debug shortcut.
2. **Chapter 6–30 belum menjadi world/quest flow playable.** Konten Arc II–VI tersedia dan diuji sebagai sistem/encounter, bukan sebagai kampanye yang sudah dapat dimainkan dari awal sampai akhir.
3. **Belum ada produksi visual asset/animasi baru** untuk 50 musuh dan 8 boss. Arah HD 3D proyek tidak diubah; tidak ada migrasi renderer.
4. **Belum ada human playtest balancing.** Angka statistik adalah baseline data untuk iterasi, bukan klaim keseimbangan final.
5. **Uji fisik iPhone/Android dan browser visual belum dijalankan.** Gunakan `PHASE_3_IPHONE_TEST_GUIDE.md` untuk pengujian manual.
6. **G2 B18 dan G3 Phase 3 belum mendapat penerimaan akhir pemilik proyek.** Pekerjaan Phase 3 dilakukan atas instruksi eksplisit pemilik meskipun uji perangkat B18 ditunda.

## 6. Keputusan yang dipertahankan

- D-019 Ponytail: perubahan sekecil mungkin yang lengkap, reuse arsitektur, tanpa dependency baru.
- D-021/D-022: tidak ada migrasi renderer atau perubahan resolusi logis pada Phase 3.
- D-027: `BattleManager` tidak mengimpor content; data boss/musuh diinjeksi dari scene.
- D-031: save v6 dipertahankan; flag boss memakai struktur `world.flags` yang sudah ada.
- D-012: tidak ada BGM; hanya SFX/ambience yang sudah ada.

## 7. File laporan

- `BATCH_19_REPORT.md` sampai `BATCH_25_REPORT.md`: laporan tiap batch.
- `PHASE_3_IPHONE_TEST_GUIDE.md`: panduan pengujian manual.
- `HANDOVER_JRPG_ROADMAP_v2.md`: addendum status Phase 3.
