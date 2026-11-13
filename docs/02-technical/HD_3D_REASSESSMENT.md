# Penilaian ulang arsitektur terhadap target HD 3D stylized (D-021)

Status: **USULAN, menunggu keputusan pemilik proyek.** Dokumen ini tidak mengubah kode. Tidak ada implementasi yang dimulai dari dokumen ini.

Dasar: keputusan D-019 (Ponytail), D-021 (arah visual HD 3D), dan D-022 (D-009 ditinjau ulang).

## 1. Kondisi saat ini (diperiksa di Batch 10)

| Aspek | Kondisi nyata | Sumber |
|---|---|---|
| Render | Canvas 2D, tanpa WebGL, tanpa 3D | `src/engine/rendering/`, `src/platform/browser/CanvasSurface.js` |
| Visual | Pixel-art yang digambar lewat kode, tanpa aset gambar eksternal | `src/engine/rendering/pixelart/` (PixBuf, CharacterArt, PropArt, TileArt, dll.) |
| Resolusi logis | 320x240 (4:3), `PIXEL_ART: true` | `src/core/Config.js` |
| Dokumen resolusi | Masih tertulis 480x270 | `TECHNICAL_ARCHITECTURE.md` baris 278 dan D-009 |
| Skala | Skala bilangan bulat, `imageSmoothingEnabled = false` | `CanvasSurface.js`, `RenderPipeline.js` |
| Dunia | Grid tile, `NavGrid`, `Pathfinder`, collision tile | `src/engine/world/`, `content/world/*-data.js` |
| Logika | Battle, progresi, dialog, quest, save terpisah dari render lewat port | `src/core/ports/`, D-010 |
| Dependensi | Hanya `express` (server dev). Tanpa framework render | `package.json` |
| Tes | 504 tes, mayoritas logika. Tidak ada tes visual 3D | `npm test` |

## 2. Dampak arah HD 3D

**Yang bisa dipertahankan (logika):** battle, progresi, EXP, skill, save dan migrasi, dialog, quest, flag, konten, validator narasi dan dunia, serta pathfinding grid. Ini bergantung pada port (D-010) dan tidak bergantung pada gaya visual.

**Yang harus diganti (presentasi):** seluruh `src/engine/rendering/pixelart/`, sprite 16x24, tile pixel, kamera 2D, `CanvasSurface` dengan skala nearest-neighbour, dan semua UI yang diukur dalam piksel 320x240.

**Yang perlu keputusan:** resolusi logis dan skala (D-022), dan apakah dunia menjadi 3D penuh atau tetap berbasis grid dengan presentasi 3D.

**Aset:** pixel-art dibuat dari kode. HD 3D membutuhkan model, tekstur, dan animasi yang tidak bisa dibuat dari kode seperti SFX. `docs/03-art/ASSET_PROMPTS.md` berisi prompt pixel-art dan perlu direvisi.

## 3. Pilihan arsitektur

### Opsi A — Dunia 3D penuh
- Render WebGL dengan kamera perspektif, model 3D, dan collision 3D.
- Dampak: kolisi dan navigasi grid harus diganti atau diadaptasi. Zona, tilemap, dan semua tes world berubah. Risiko regresi besar.
- Dependensi: raw WebGL, atau library seperti three.js. Pemilihan ini memerlukan persetujuan (D-008, D-019).
- Risiko: performa di iPhone belum diuji. Biaya aset tinggi.

### Opsi B — 2.5D: logika grid dipertahankan, presentasi 3D
- Logika tetap grid (`NavGrid`, tilemap, zona, collision). Render menampilkan karakter dan objek sebagai model atau billboard 3D di atas kamera perspektif.
- Dampak: kolisi, zona, dan save tidak berubah. Tes world tetap berlaku. Pergantian terbatas ke layer render.
- Dependensi: sama dengan Opsi A, tetapi permukaan kode yang berubah lebih kecil.
- Risiko: sudut kamera dan oklusi perlu didesain. Estimasi kualitas HD perlu bukti visual.

### Opsi C — HD 2D (sprite beresolusi tinggi di canvas 2D)
- Tidak memenuhi "3D" di D-021. Tidak direkomendasikan.

## 4. Rekomendasi (Ponytail)
Opsi B. Opsi ini mempertahankan logika yang sudah diuji, menghindari dependensi baru di tahap awal, dan membatasi perubahan ke layer render. Keputusan final tetap ada pada pemilik proyek.

Langkah yang disarankan: **satu batch spike terpisah** (di luar Phase 1) untuk membuktikan di iPhone bahwa satu karakter dan satu zona bisa dirender 3D dengan frame rate yang layak. Spike ini hanya boleh dimulai setelah pemilik proyek menyetujuinya. Hasilnya menentukan Opsi A atau B.

Dependensi baru (mis. three.js) tidak ditambahkan tanpa persetujuan terpisah. Raw WebGL cukup untuk kebutuhan kecil dan lebih sesuai dengan prinsip Ponytail, tetapi ini harus dibuktikan di spike.

## 5. Dampak pada roadmap
- **Phase 1 (battle):** logika (status, elemen, fase boss, command) tidak bergantung pada gaya visual. Bagian UI battle perlu diubah mengikuti keputusan visual.
- **Phase 2 sampai 3:** model karakter dan musuh bergantung pada keputusan ini. Pembuatan model 3D harus menunggu spike.
- **Phase 5 (dunia):** peta dan kendaraan paling terdampak. Keputusan Opsi A atau B harus sudah ada sebelum Phase 5.
- **Gerbang baru yang diusulkan:** "G-VIS" (spike visual) setelah Phase 1 dan sebelum Phase 2 pada asset karakter.

## 6. Tes dan verifikasi yang diperlukan
- Tes logika tetap otomatis.
- Presentasi 3D tidak bisa diuji sepenuhnya dengan unit test. Diperlukan bukti visual di iPhone (Paket Uji iPhone) dan, bila memungkinkan, screenshot dari browser yang dapat diverifikasi.
- Setiap perubahan render harus menjalankan ulang tes world dan save untuk memastikan tidak ada regresi logika.
- Performa diukur di iPhone sungguhan (frame rate dan waktu muat). Belum ada data.

## 7. Batasan dokumen ini
- Tidak ada pengukuran performa. Semua klaim soal frame rate dan kualitas adalah **NOT VERIFIED**.
- Tidak ada kode yang dibuat atau diuji untuk dokumen ini.
- Penilaian aset dan biaya produksi belum dilakukan.

## 8. Kepatuhan orisinalitas
- Gaya HD 3D dapat terinspirasi, tetapi model, desain karakter, layout, dan aset tidak boleh meniru karya Square Enix.
- Semua aset dibuat orisinal dan asalnya dicatat.

## 9. Dokumen yang perlu direvisi setelah keputusan
- `docs/02-technical/TECHNICAL_ARCHITECTURE.md` (resolusi, rendering, skala)
- `docs/03-art/ASSET_PROMPTS.md` (prompt pixel-art)
- `docs/00-project/PROJECT_OVERVIEW.md` (arah visual)
- `docs/00-project/DECISION_LOG.md` (D-009 dan D-022)
