# HANDOVER v2 — THE ATLAS OF UNREMEMBERED STARS
## Roadmap menuju JRPG bergaya FF4 HD: 30 chapter, 6 arc, party berkembang, boss bergimmick, tanpa BGM

Dokumen ini ditulis agar bisa dilanjutkan oleh AI atau pengembang lain tanpa konteks percakapan sebelumnya. Dokumen ini menggantikan HANDOVER_JRPG_ROADMAP.md (v1). Jika ada konflik antara v1 dan v2, v2 yang berlaku.

---

## Addendum status 2026-11-13 — G1 disetujui; Pre-B15C dan B15 dikerjakan atas otorisasi pemilik

Keputusan D-024 menyetujui Phase 1 (B11–B14), dan pemilik proyek secara eksplisit menyetujui **G1 pada 2026-11-13**. Pada 2026-11-13 pemilik kemudian secara eksplisit mengotorisasi pengerjaan Pre-B15C dan B15 pada ZIP terbaru, sehingga instruksi lama untuk menunggu review fisik sebelum B15 dikesampingkan untuk batch ini. Otorisasi tersebut tidak mengubah status tes fisik iPhone: perangkat iPhone 13 belum diuji oleh AI/container.

**B15 telah diimplementasikan**; lihat `docs/handover/B15_REPORT.md`. Kael Rowan dipilih dari entri ketiga Character Bible **Principal Party (8)** dan canon registry, dengan runtime ID `kael`; ID `orin` dan `mira` tetap. B16 dan B17 kemudian diselesaikan sebagai milestone gabungan berdasarkan D-030; B18 juga telah diselesaikan. Laporan tersedia di `B16_B17_COMBINED_REPORT.md` dan `BATCH_18_REPORT.md`.

**Pre-B15C responsive viewport telah diimplementasikan pada source/test level.** Canvas mempertahankan 320×240 sebagai basis portrait dan memperluas lebar logis secara adaptif di landscape; kamera dan UI mengikuti ukuran aktif. Tes fisik iPhone 13/Android masih pending. Lihat `docs/handover/PRE_B15C_REPORT.md`. Tidak ada migrasi renderer HD3D atau perubahan save format.

D-027 juga telah disetujui: BattleManager tidak mengimpor `content/`; definisi status disuntikkan dari scene melalui `statusDefs`. D-031 menetapkan save v6 mulai B18 untuk Iven/Tavi, dan menggeser save B20/B30/B32 menjadi v7/v8/v9.

D-021 menetapkan target presentasi HD 3D stylized dan menggantikan arah 2D/pixel-art sebelumnya, tetapi **belum mengotorisasi migrasi renderer penuh**. D-025/D-026 tetap berlaku: keputusan arsitektur rendering menunggu prototype WebGL dan pengujian perangkat. D-012 menetapkan tanpa BGM atau musik latar; hanya SFX dan ambience non-musikal. Judul dan beberapa bagian historis di bawah harus dibaca sesuai keputusan yang lebih baru ini.

---

## 0. Ringkasan untuk AI pengerja (baca ini dulu)

1. Kerjakan **satu batch per sesi**. Batch yang ditetapkan di bagian 11 adalah unit kerja. Jangan menggabungkan batch.
2. Batch hanya boleh dimulai setelah pengguna menyetujui **phase** yang memuat batch tersebut (lihat bagian 9). Setelah disetujui, jalankan batch sampai selesai tanpa meminta konfirmasi ulang untuk langkah teknis.
3. Sebelum mengubah kode, ambil **snapshot ZIP baseline** (bagian 1.3). Repo ini tidak memakai git.
4. Patuhi keputusan arsitektur yang sudah APPROVED di `docs/00-project/DECISION_LOG.md` (bagian 3).
5. Setiap batch ditutup dengan laporan sesuai template bagian 10, dengan **ZIP sebagai item pertama**.
6. Terapkan prinsip Ponytail (D-019) di setiap batch: implementasi paling kecil yang lengkap, benar, dan teruji. Jangan menambah fitur di luar scope.
7. Arah visual proyek adalah **HD 3D stylized JRPG** bergaya FF4 HD (D-021). Presentasi pixel-art 16-bit tradisional sudah tidak berlaku.
6. Jika terhenti karena batas penggunaan, ikuti protokol bagian 14.

---

## 1. Lingkungan kerja dan alur ZIP

### 1.1 Alur kerja nyata
- Pengguna bekerja dari **iPhone saja**, tanpa komputer. Pengguna mengunggah ZIP proyek ke sesi, menerima ZIP hasil, lalu menguji game di iPhone (Safari) lewat hosting atau file yang diberikan.
- AI pengerja bekerja di container Linux dengan Node.js. Perintah `npm test` dan validator hanya dijalankan di container, bukan di perangkat pengguna.
- Karena itu, setiap batch wajib menyertakan **Paket Uji iPhone** (bagian 10.4) sehingga pengguna bisa memverifikasi bagian yang tidak bisa diuji di container.

### 1.2 Struktur ZIP
- Nama ZIP: `jrpg-project-batchNN_<versi>.zip` (contoh: `jrpg-project-batch11_1.zip`), konsisten dengan penamaan sebelumnya.
- ZIP berisi seluruh folder `jrpg-project/`, tidak hanya file yang diubah. Pengecualian: `node_modules/` jangan dimasukkan.
- Sertakan `docs/handover/BATCH_NN_REPORT.md` di dalam ZIP.

### 1.3 Snapshot baseline (wajib, karena tidak ada git)
Sebelum batch dimulai:
1. Buat ZIP baseline `jrpg-project-batchNN_baseline.zip` dari kondisi awal.
2. Simpan daftar file dengan checksum: `find . -type f -not -path './node_modules/*' -exec sha256sum {} + > docs/handover/BATCH_NN_BASELINE_SHA.txt`.
3. Setelah selesai, gunakan daftar ini untuk menyusun "file yang diubah" di laporan (diff), bukan menebak dari ingatan.

### 1.4 Batas ukuran batch (untuk mencegah kehabisan token di tengah kerja)
- Maksimal sekitar **6 file konten** atau **3 file engine + tes yang terkait** dalam satu batch.
- Jika scope melebihi batas, pecah batch di tempat yang aman dan catat di `BATCH_NN_PARTIAL.md`. Jangan memperluas scope secara diam-diam.

---

## 2. Urutan baca untuk sesi baru

Baca dengan urutan ini sebelum mengerjakan batch apa pun:

1. Dokumen ini (v2), bagian 0 dan bagian batch yang akan dikerjakan.
2. `README.md` dan `docs/INDEX.md`.
3. `docs/00-project/DECISION_LOG.md` (keputusan yang sudah APPROVED).
4. `docs/00-project/RISK_REGISTER.md`.
5. Laporan batch terakhir di `docs/handover/` dan `CHANGELOG.md` (paling atas). Catatan: ada file handover lama di `docs/` (HANDOVER_BATCH_8_*) dan `docs/handover/`. Pakai yang paling baru menurut changelog.
6. `docs/narrative/CONTENT_SCHEMA.md`, `CONTENT_ID_REGISTRY.md`, `NARRATIVE_CONTINUITY_RULES.md`, `DIALOGUE_STYLE_GUIDE.md`.
7. Dokumen khusus batch (lihat bagian 11 untuk tiap batch).

---

## 3. Keputusan arsitektur yang sudah APPROVED (wajib dipatuhi)

Diambil dari `DECISION_LOG.md`. Keputusan ini tidak boleh diubah tanpa persetujuan pengguna dan pencatatan baru di log.

| ID | Keputusan | Implikasi untuk pengerjaan |
|---|---|---|
| D-001 | JRPG 2D, turn-based, zone-based, scope MASSIVE | Target ukuran sudah disepakati; jangan memangkas scope tanpa keputusan |
| D-002 | Canvas 2D, Vanilla JS ES Modules, tanpa framework dan bundler wajib | Jangan menambah framework UI atau bundler |
| D-003 | Konten JSON/JS dengan ID permanen, validasi schema, manifest | Konten baru ditambahkan tanpa mengubah engine bila memungkinkan |
| D-004 | Save di IndexedDB, dengan versi dan migrasi | Setiap perubahan bentuk save wajib migrasi |
| D-005 | PWA dan Service Worker, jalur relatif untuk GitHub Pages | Jangan memakai path absolut |
| D-006 | Prototype v2 dipindah ke `legacy/`, tidak dihapus | Jangan hapus `legacy/`. Ubah hanya bila perlu dan dokumentasikan |
| D-007 | Folder target yang belum dipakai tidak dibuat dan dicatat di dokumen | Buat folder hanya saat dibutuhkan. Tanpa `.gitkeep` kosong |
| D-008 | Tanpa framework tes berat, mulai dari `node --test` dan skrip validator. Minim dependensi | Tes memakai `node --test`. Validator bukan pengganti unit test, dan unit test bukan pengganti tes integrasi |
| D-009 | Resolusi logis 480x270 (alternatif 320x180), rasio 16:9, image smoothing mati, dapat dipakai di iPhone Safari dan Android Chrome | **UNDER REVIEW (D-022).** Kode memakai 320x240. Arah HD 3D (D-021) membuat spesifikasi ini perlu ditetapkan ulang. Verifikasi di iPhone belum ada bukti |
| D-010 | Core hanya mengakses platform lewat port (`core/ports`), adapter di `platform`, `src/main.js` sebagai composition root | Logika battle, progresi, dan konten tidak boleh mengakses API browser langsung |
| D-017 | ID karakter: runtime `orin` dan `mira` tetap utama. Pemetaan di `docs/narrative/CHARACTER_ID_MAP.md` | Penyatuan ID wajib alias aman, migrasi save, dan tes mundur | **APPROVED** |
| D-019 | Prinsip Ponytail berlaku untuk semua batch | Instruksi pemilik proyek | **APPROVED** |
| D-020 | Karakter ketiga dan komposisi party ditentukan di B15 dari CHARACTER_BIBLE | Instruksi pemilik proyek | **APPROVED** |
| D-021 | Arah visual: HD 3D stylized JRPG bergaya FF4 HD. Bukan pixel-art 16-bit. Aset orisinal | Instruksi pemilik proyek | **APPROVED**. Implikasi arsitektur di `docs/02-technical/HD_3D_REASSESSMENT.md` |
| D-023 | Phase 0 selesai dan tidak diulang. Phase 1 kemudian disetujui melalui D-024 | Aturan gerbang | **APPROVED** untuk Phase 0; Phase 1 telah disetujui |

Keputusan tambahan yang perlu dicatat di log bila belum ada: drift ID karakter (bagian 5.4), dan keputusan D-011 dan seterusnya yang dibuat selama roadmap ini.

---

## 4. Aturan kerja global

### 4.1 Batasan repo
- Jangan ubah `legacy/` kecuali diperlukan dan didokumentasikan (D-006).
- Jangan restrukturisasi folder, memindahkan modul, atau mengganti nama file tanpa persetujuan.
- Jangan commit. Hasil diserahkan sebagai ZIP.
- Jangan membuat file kosong atau placeholder.

### 4.2 Orisinalitas
- Mirip FF4 berarti **sistem, struktur, dan rasa**: turn-based dengan ritme ATB (D3), party yang berkembang, boss bergimmick, dunia terbuka bertahap, musik kuat, durasi 25 sampai 35 jam.
- Jangan menyalin nama karakter, plot, dialog, desain musuh, lagu, atau aset dari karya Square Enix atau pihak ketiga lain.
- Semua nama, dialog, dan desain mengikuti bible di `docs/narrative/` dan `docs/world/`.
- Semua aset audio dibuat dari sintesis atau komposisi sendiri. Catat asal dan metode pembuatan tiap aset di `docs/03-art/` atau `docs/04-production/` sesuai struktur repo.

### 4.3 Bahasa
- Teks yang dibaca pemain: Bahasa Indonesia yang natural, mengikuti `DIALOGUE_STYLE_GUIDE.md`.
- Komentar dan identifier kode: ikuti konvensi file yang sudah ada.

### 4.4 Save dan kompatibilitas
- Perubahan bentuk data save wajib menaikkan `SAVE_VERSION`, menambah migrasi di `SaveMigrations.js`, dan menambah tes round-trip.
- Save v1 sampai v5 harus tetap bisa dimuat. Tambahkan fixture save lama ke tes agar regresi terdeteksi.
- Data korup disanitasi, bukan membuat game crash.

### 4.5 Verifikasi
Setiap batch wajib menjalankan, dan hasilnya dicatat:
- `npm test`
- `npm run check`
- `npm run check:world` bila batch menyentuh dunia atau zona
- `npm run check:narrative` bila batch menyentuh dialog, quest, flag, atau karakter
- Tes gameplay headless untuk battle dan progresi (lihat bagian 12)

Status yang boleh dipakai:
- **VERIFIED**: ada bukti (output tes, log, screenshot, atau hasil Paket Uji iPhone oleh pengguna).
- **NOT TESTED**: belum diuji.
- **NOT VERIFIED**: sudah diimplementasikan tetapi belum ada bukti.
- Dokumentasi atau fixture buatan tangan tidak cukup untuk VERIFIED.

### 4.6 Scope
- Setiap batch hanya melakukan tugas di batch tersebut.
- Temuan di luar scope dicatat di bagian 15 dan tidak dikerjakan.
- Angka balancing hanya diubah di Phase 9.

### 4.7 Pelaporan
- Jangan mengirim pembaruan status berulang atau narasi tiap langkah (membaca file, mencari, mengubah kode, menjalankan tes).
- Pesan sementara hanya dikirim jika: butuh input pengguna, ada aksi destruktif yang perlu persetujuan, ada blocker kritis, atau ada keputusan penting yang tidak bisa diambil aman dari bukti repo.
- Laporan akhir ditulis sekali di akhir batch, dengan format bagian 10.3.
- Bedakan dengan jelas **hasil terverifikasi** dan **asumsi belum diverifikasi**.

### 4.8 ZIP
- ZIP dibuat dari state proyek terbaru.
- Verifikasi bisa dibuka dengan `unzip -t`.
- Hitung ukuran dan SHA-256 aktual (`sha256sum`).
- Jangan klaim ZIP tersedia jika pembuatannya gagal.

---

## 5. Konvensi konten

### 5.1 Struktur folder konten per arc
- Dialog: `content/dialogue/arc_0N/chapter_NN.js` (contoh: `chapter_06.js`).
- Dialog party: `content/dialogue/party/chN_party.js`.
- Dialog NPC: `content/dialogue/npcs/<area>_npcs.js`.
- Quest: `content/quests/arc_0N/quest_chNN_main.js` dan `quest_<nama>.js` untuk sidequest.
- Musuh: `content/enemies/arc_0N.js`.
- Item: `content/items/arc_0N.js`.
- Dunia: `content/world/<area>-data.js`, terdaftar di `world-registry.js`.
- Folder `arc_02` sampai `arc_06` dibuat saat pertama kali dibutuhkan (D-007).

### 5.2 Penamaan
- Export dialog: `DIALOGUE_CH<N>_<NAMA>` (contoh: `DIALOGUE_CH1_ELDER_HENN`), dan `id` dialog memakai huruf kecil `ch<N>_<nama>`.
- Flag cerita: `ch<N>_<snake_case>` (contoh: `ch1_mira_follow`, `ch3_road_ambush_cleared`).
- Flag boss: `ch<N>_boss_<bossId>_defeated`.
- ID item, musuh, dan skill: snake_case dan terdaftar di `CONTENT_ID_REGISTRY.md`.
- Tidak ada ID yang diubah setelah dipakai di save. Jika harus diubah, buat alias dan migrasi.

### 5.3 Format dialog dan quest
- Mengikuti `DialogueDef` dan `QuestDef` di `CONTENT_SCHEMA.md`.
- Node dialog memakai `speaker`, `text`, `choices`, dan `next`. Efek (`acceptQuest`, `setFlag`, dan lain-lain) ditulis di `effects` sesuai yang didukung `DialogueEngine`. Sebelum memakai efek baru, cek apakah sudah didukung. Jika belum, batch tersebut mengimplementasikannya dan mencatatnya di laporan.

### 5.4 Drift yang harus diselesaikan di Phase 0
- `progression.js` memakai kunci `orin` dan `mira`. `CONTENT_SCHEMA.md` memakai `character_orin_vale`. Putuskan satu konvensi, catat di `DECISION_LOG.md`, dan terapkan ke kode dan dokumen. Jangan mengganti ID yang sudah ada di save tanpa migrasi.
- `COMBAT_DESIGN.md` menyebut `systems/battle`, `systems/skills`, `systems/status-effects`, `content/combat`, dan `content/creatures`, yang belum tentu ada. Petakan ke path nyata.

### 5.5 Paket konten per chapter (dipakai di Phase 6 sampai 8)
Setiap chapter baru wajib mengisi semua item berikut, atau mencatat alasan jika ada yang tidak berlaku:
1. Entri di `CONTENT_ID_REGISTRY.md` untuk chapter, quest, boss, musuh baru, item baru, dan flag baru.
2. Dialog utama chapter (`chapter_NN.js`).
3. Dialog party dan NPC yang muncul di chapter.
4. Quest utama dan sidequest yang terhubung.
5. Musuh dan boss, dengan reward.
6. Item reward dan item kunci.
7. Zona dan spawn point di `content/world/`.
8. Flag cerita yang disetel dan dibaca. Setiap flag yang dibaca harus pernah disetel.
9. Pembaruan `MYSTERY_REGISTER.md`, `FORESHADOWING_REGISTER.md`, atau `MASTER_TIMELINE.md` bila chapter menambah atau menutup misteri.
10. Lolos `check:narrative` dan `check:world`.
11. Konsisten dengan `NARRATIVE_CONTINUITY_RULES.md` dan `CHARACTER_KNOWLEDGE_MATRIX.md`.

---

## 6. Kontrak data baru (usulan, perlu dikonfirmasi saat batch terkait)

Bagian ini berisi bentuk data yang diusulkan. Batch yang mengimplementasikan wajib menyesuaikan dengan kode yang sudah ada dan mencatat perbedaannya.

### 6.1 Status effect (B11)
```js
{
  id: 'poison',
  kind: 'debuff',            // buff | debuff | status | regen
  durationTurns: 3,
  stacking: 'refresh',       // refresh | stack | none
  onTurnStart: { damagePct: 0.06 },
  removeOn: ['battle_end'],
}
```
Daftar awal: `poison`, `stun`, `silence`, `slow`, `haste`, `regen`, `attack_up`, `defense_down`. Efek battle tidak disimpan ke save.

### 6.2 Elemen (B12)
- Daftar awal, disinkronkan dengan `MAGIC_SYSTEM.md`: `fire`, `ice`, `lightning`, `earth`, `wind`, `water`, `light`, `dark`, `resonance`.
- Tabel kelemahan dan resistensi di satu file data, dicek validator. Pengali: lemah 1.5, resisten 0.5, kebal 0, netral 1.0 (dapat diubah di Phase 9).

### 6.3 Fase boss (B13)
```js
{
  bossId: 'boss_arc1_warden',
  phases: [
    { id: 'p1', hpBelowPct: 1.0, actions: ['strike', 'bind'], onEnter: null },
    { id: 'p2', hpBelowPct: 0.5, actions: ['strike', 'quake'], onEnter: { dialogueId: 'ch5_boss_p2' } },
  ],
  winCondition: 'defeat',    // defeat | survive_turns
}
```

### 6.4 Roster party (B15 sampai B18)
```js
{
  id: 'mira',                 // konvensi final ditentukan di Phase 0 (lihat 5.4)
  name: 'Mira Solenne',
  role: 'healer_light',
  joinFlag: 'ch1_mira_follow',
  leaveFlags: [],             // flag yang membuatnya keluar sementara
  maxPartySize: 4,
  growth: { hp: 5, mp: 5, atk: 1, def: 1, matk: 3, mdef: 2, spd: 2 },
  skills: [{ id: 'mira_mend', unlockLevel: 1 }],
}
```

### 6.5 Versi save (usulan)

| Versi | Batch | Perubahan |
|---|---|---|
| 4 | (saat ini) | Progresi per karakter, unlocked skills, equipment |
| 5 | B16 | Roster: status rekrut dan keluar party |
| 6 | B18 | Roster Arc II: Iven dan Tavi, termasuk HP/MP karakter dan migrasi v5→v6 |
| 7 | B20 | Status boss (defeated) dan flag boss, bila tidak cukup dengan flag umum |
| 8 | B30 | Peta dunia: region yang terbuka, kendaraan yang dimiliki |
| 9 | B32 | Airship dan rute yang terbuka |
| 10 | Bila diperlukan | Perubahan lain yang ditemukan di Phase 6 sampai 8 |

Versi final harus ditulis di `DECISION_LOG.md` saat batch dijalankan. Jika daftar ini tidak cocok dengan kebutuhan batch, batch tersebut mencatat alasannya dan memperbarui tabel ini.

---

## 7. Definisi "mirip FF4" dan target terukur

| Pilar | Indikator | Target | Dicek di |
|---|---|---|---|
| Struktur cerita | Chapter aktif, arc, boss klimaks per arc | 30 chapter, 6 arc, 1 boss utama per arc | B51 |
| Durasi | Waktu tempuh jalur utama (uji QA) | 25 sampai 35 jam | B50 |
| Party | Karakter playable, pergantian party | 5 sampai 6 karakter, party aktif maksimal 4 | B18, B50 |
| Battle | Status effect, elemen, fase boss, command ATB-like | Semua fitur ada dan teruji | B11 sampai B14 |
| Boss | Jumlah dan fase | 6 boss utama (2 sampai 3 fase), minimal 2 boss opsional | B20 sampai B25 |
| Musuh | Jumlah jenis | sekitar 40, 8 sampai 10 per arc | B19 sampai B24 |
| Progresi | Batas level, skill terbuka | Level 30 sampai 50 (sesuai D1), skill bertahap | B47 |
| Dunia | Peta dunia, kendaraan, dungeon | Peta dunia, perahu, airship, satu dungeon per arc | B30 sampai B33 |
| Audio | SFX dan ambience saja, tanpa musik latar (D-012). Ambience tidak boleh menyerupai musik | Tidak ada track BGM | B26 sampai B29 dibatalkan |
| Rasa | Pacing | Setiap arc punya puncak dan reward yang terasa | B37, B46, B50 |
| Visual | Presentasi HD 3D stylized, aset orisinal, tanpa pixel-art 16-bit | Sesuai D-021. Keputusan Opsi A atau B di spike visual |

---

## 8. Keputusan pengguna

**Status (diperbarui Batch 10):** D1, D3, D4, dan D5 disetujui sesuai default. D2 disetujui dengan perubahan: **tanpa BGM atau musik latar** (D-012). Semua keputusan tercatat di `DECISION_LOG.md` sebagai D-011 sampai D-015 dan tidak boleh diubah tanpa persetujuan pemilik proyek.

Keputusan ini harus diambil sebelum phase yang bergantung padanya.

| No | Pertanyaan | Opsi | Default jika tidak dijawab | Dibutuhkan sebelum |
|---|---|---|---|---|
| D1 | Batas level | (a) tetap 10 sampai demo, (b) 30 sampai 50 sejak awal | (a) sampai Phase 6, lalu naik di Phase 9 | B47 |
| D2 | Sumber musik | (a) sintesis seperti SFX, (b) komposisi manual dengan bantuan AI, (c) campuran | (c): sintesis untuk ambience dan jingle, komposisi untuk BGM utama | B26 |
| D3 | Gaya tempur | (a) turn-based dengan ritme ATB (semacam "active turn" ringan), (b) ATB penuh real-time | (a) | B14 |
| D4 | Platform utama | (a) iPhone dan desktop, (b) desktop saja | (a) | B49 |
| D5 | Jumlah ending | (a) satu ending, (b) dua sampai tiga ending berdasarkan pilihan, (c) lebih dari tiga | (b) | B46 |

Default hanya boleh dipakai jika pengguna sudah menyetujui default tersebut atau tidak menjawab sampai batas phase. Jika tidak ada jawaban, catat default yang dipakai di `DECISION_LOG.md` sebagai "default sementara".

---

## 9. Gerbang dan milestone

### 9.1 Aturan persetujuan
- Persetujuan diberikan **per phase**, bukan per batch. Pengguna bisa menyetujui satu phase sekaligus.
- Setelah phase disetujui, batch di dalamnya dijalankan berurutan tanpa konfirmasi ulang untuk langkah teknis.
- Di akhir phase, berhenti dan tunggu persetujuan untuk phase berikutnya, kecuali pengguna sudah menyetujui beberapa phase sekaligus.

### 9.2 Gerbang
| Gerbang | Setelah | Kriteria lolos |
|---|---|---|
| G0 | Phase 0 | Baseline hijau atau selisih tercatat. D-009 diverifikasi. Drift ID selesai |
| G1 | Phase 1 | Battle punya status, elemen, fase boss, dan command. Tes gameplay lolos |
| G2 | Phase 2 | Party 3 sampai 4 karakter bisa direkrut, keluar, dan disimpan dengan benar |
| G-VIS | Spike visual (setelah Phase 1, sebelum aset karakter Phase 2) | Satu karakter dan satu zona dirender 3D di iPhone dengan frame rate layak. Keputusan Opsi A atau B diambil pemilik proyek |
| G3 | Phase 3 | Boss Arc I sampai VI bisa dikalahkan di demo. Katalog musuh lolos validator |
| G4 | Phase 4 | Dibatalkan (D-012) |
| G5 | Phase 5 | Dunia dapat dijelajahi dengan perahu dan airship sesuai urutan cerita |
| **G-VS** | Phase 6 | **Vertical slice**: chapter 1 sampai 10 dimainkan utuh, tanpa soft-lock. Pengguna menyetujui arah |
| G7 | Phase 7 | Chapter 11 sampai 20 lolos narasi dan dunia |
| G8 | Phase 8 | Ending dan semua flag klimaks lolos |
| G9 | Phase 9 | Balancing lolos simulasi. Save dan offline lolos |
| G10 | Phase 10 | QA penuh lolos dan ZIP rilis terverifikasi |

Jika G-VS gagal, berhenti di Phase 6 dan buat rencana koreksi. Jangan lanjut ke Phase 7.

---

## 10. Template batch (wajib dipakai)

### 10.1 Header batch
Setiap batch dimulai dengan dokumen `docs/handover/BATCH_NN_PLAN.md` yang berisi:
- Nomor dan nama batch
- Scope (copy dari bagian 11)
- Daftar file yang akan dibuat atau diubah (perkiraan)
- Daftar dokumen yang dibaca
- Risiko khusus batch ini

Pembuatan plan singkat itu tidak perlu dikirim ke pengguna sebagai pesan terpisah. Cukup disimpan di ZIP.

### 10.2 Langkah eksekusi
1. Snapshot baseline (bagian 1.3).
2. Baca dokumen yang relevan (bagian 2).
3. Implementasi.
4. Tes dan validator (bagian 4.5 dan 12).
5. Perbarui dokumen yang terdampak (`CHANGELOG.md`, `CONTENT_ID_REGISTRY.md`, `DECISION_LOG.md` bila ada keputusan baru, dan dokumen desain bila kode berubah).
6. Buat Paket Uji iPhone (10.4).
7. Buat ZIP hasil dan diff file (bagian 4.8).
8. Tulis laporan akhir (10.3).

### 10.3 Format laporan akhir
```
# BATCH NN — <nama>
## 1. ZIP (item pertama)
- Nama file, ukuran, SHA-256, hasil `unzip -t`
## 2. Yang diperiksa
## 3. Yang diimplementasikan
## 4. File yang diubah (dari diff baseline)
## 5. Tes dan validator (perintah + output ringkas nyata)
## 6. Status verifikasi (VERIFIED / NOT TESTED / NOT VERIFIED per item)
## 7. Paket Uji iPhone (ringkasan dan link ke bagian 10.4)
## 8. Batasan yang tersisa
## 9. Keputusan yang diambil sementara (default) dan perlu konfirmasi
## 10. Langkah berikutnya yang disarankan
```

### 10.4 Paket Uji iPhone
Berisi:
- Cara menjalankan game (hosting atau file lokal yang didukung).
- Daftar uji 5 sampai 10 langkah, masing-masing dengan **langkah** dan **hasil yang diharapkan**.
- Formulir hasil sederhana: `OK`, `GAGAL: <deskripsi>`, atau `TIDAK BISA DIUJI`.
- Minimal mencakup: layar portrait dan landscape, input sentuh, masuk dan keluar battle, save dan load, dan bila ada, pergantian musik.

---

## 11. Rencana batch (B10 sampai B51)

Total: **42 batch** dalam 10 phase, dengan B26 sampai B29 dibatalkan sehingga batch aktif menjadi **38**. Angka ini naik dari estimasi v1 (sekitar 35) karena batch dipecah agar sesuai batas ukuran di bagian 1.4.

Format tiap batch: tujuan, tugas, file perkiraan, tes, dan Definisi Selesai (DoD).

---

### PHASE 0 — Stabilisasi

#### B10 — Baseline, verifikasi, dan drift
**Tujuan:** baseline yang bisa dipercaya sebelum ada perubahan konten atau engine.

Tugas:
1. Snapshot baseline dan checksum (1.3).
2. Jalankan `npm test`, `npm run check`, `npm run check:world`, `npm run check:narrative`. Catat output nyata dan bandingkan dengan klaim laporan 9.3B (504 tes, 474 file, 12 region, 10 zona playable).
3. Verifikasi bug yang masih terbuka dari audit sebelumnya:
   - B1: `bh_fountain`
   - B2: `npc_timm`
   - D1 sampai D9 (pemeriksaan yang belum selesai). Jika daftar D1 sampai D9 tidak ditemukan di repo, tulis "tidak ditemukan di repo" dan minta daftarnya dari pengguna.
   Untuk tiap item tulis status: `FIXED`, `STILL DEFECT`, atau `NOT TESTED`, dengan bukti.
4. Verifikasi D-009 (resolusi dan tampilan di iPhone Safari). Lakukan verifikasi lewat tes atau Paket Uji iPhone. Jika belum bisa, tandai NOT TESTED.
5. Selesaikan drift ID karakter (5.4) dan catat keputusannya di `DECISION_LOG.md`.
6. Petakan drift `COMBAT_DESIGN.md` ke kode nyata dan catat di `DECISION_LOG.md`.
7. Perbaiki `docs/INDEX.md` agar hanya mengarah ke dokumen yang ada.

File perkiraan: `docs/handover/BATCH_10_*`, `docs/00-project/DECISION_LOG.md`, `docs/INDEX.md`, dan file konfigurasi tes jika diperlukan.

Tes: tidak ada perubahan perilaku game. Tes lama harus tetap lulus.

DoD:
- Semua perintah verifikasi dijalankan dan outputnya dicatat.
- Daftar bug memiliki status untuk setiap item.
- D-009 berstatus VERIFIED atau NOT TESTED dengan alasan.
- Drift ID selesai dan tercatat.
- Tidak ada perubahan perilaku game.

---

### PHASE 1 — Fondasi battle

#### B11 — Mesin status effect
**Tujuan:** buff, debuff, stun, poison, silence, slow, haste, regen, attack_up, defense_down berjalan di battle.

Tugas:
- Modul `StatusEffectManager` (atau nama yang disepakati) di `src/engine/gameplay/battle/`.
- Definisi efek sesuai 6.1. Efek dibaca dari data di `content/` (bukan hardcode di engine).
- Tick efek di awal giliran aktor. Efek berakhir saat battle selesai.
- Integrasi ke `BattleManager` dan `DamageCalculator` tanpa mengubah API publik yang sudah dipakai `GameplayDemoScene`.
- Skill dan item demo yang memakai efek.

Tes: unit test per efek dengan seed deterministik. Tes "efek tidak bocor ke battle berikutnya". Tes lama tetap lulus.

DoD: semua efek daftar awal lulus tes. Tidak ada efek yang tersimpan ke save.

#### B12 — Elemen, kelemahan, dan urutan giliran
**Tujuan:** sistem elemen dan prioritas aksi.

Tugas:
- Tabel elemen di satu file data (6.2) dan dicek validator baru atau validator yang ada.
- Pengali damage untuk kelemahan, resistensi, kebal, dan netral.
- Urutan giliran berdasarkan SPD dengan bobot untuk aksi khusus.
- Teks elemen di UI battle (contoh: "Lemah terhadap cahaya!"), dalam Bahasa Indonesia.

Tes: tes pengali untuk tiap kombinasi elemen dasar. Tes urutan giliran dengan SPD sama (harus deterministik).

DoD: validator elemen lolos. Tidak ada elemen yang dipakai tapi tidak terdaftar.

#### B13 — Kerangka fase boss
**Tujuan:** boss dengan fase, ambang HP, pola aksi, dan kondisi menang.

Tugas:
- Struktur data sesuai 6.3.
- Transisi fase: dialog (`onEnter.dialogueId`) dan perubahan pola aksi.
- Kondisi menang `survive_turns` sebagai opsi.
- Efek status aktif tidak hilang saat transisi fase, kecuali dinyatakan di data.

Tes: demo boss 2 fase dikalahkan dalam tes otomatis. Tes transisi fase. Tes `survive_turns`.

DoD: demo boss lulus tes. Validator fase boss ditambahkan.

#### B14 — Command battle dan rasa ATB (sesuai D3)
**Tujuan:** command battle terasa lebih hidup.

Tugas (jika D3 = (a)):
- Meter giliran ringan yang terisi berdasarkan SPD, tetap turn-based secara logika.
- Menu command: Serang, Skill, Item, Bertahan, Kabur, dan Pertahankan.
- Indikator giliran di UI.

Jika D3 = (b), batch ini ditulis ulang sebelum dimulai.

Tes: urutan giliran tetap deterministik meskipun meter ditampilkan.

DoD: G1 lolos. Tes gameplay headless untuk battle lengkap (bagian 12) lolos.

**Gerbang G1 dicek di sini.**

---

### PRE-B15 — World Placement, iPhone Web App Landscape & Gameplay-First UI

**Wajib diselesaikan dan direview sebelum B15.** Otorisasi pemilik proyek: 2026-11-13.

Scope:
1. Audit seluruh zona aktif untuk NPC, interactable, dan static props yang menimpa tile solid/water, bangunan/atap, atau jalur.
2. Perbaiki posisi, ground alignment, overlap, dan obstacle yang mengganggu rute tanpa mengubah identitas objek atau progression.
3. Siapkan iPhone Safari Add to Home Screen sebagai standalone PWA dengan landscape-first layout, safe-area, portrait rotate notice, dan touch controls yang sejajar dengan game canvas.
4. Rapikan HUD, toast, pause menu, dan kontrol agar gameplay menjadi fokus utama.
5. Pertahankan Android Chrome dan desktop; jangan memaksa iOS orientation lock.
6. Pertahankan 320x240 sebagai ukuran basis/portrait; landscape memakai logical width adaptif D-022 pada CanvasSurface. Jangan mengganti renderer atau mengubah resolusi basis secara diam-diam.

Status implementasi dan bukti: `docs/handover/PRE_B15_REPORT.md`. Tes iPhone fisik wajib diselesaikan oleh pemilik melalui `docs/handover/PRE_B15_IPHONE_TEST_GUIDE.md`. B15 telah diotorisasi secara eksplisit oleh pemilik; keterbatasan full-screen dicatat terpisah di `PRE_B15C_REPORT.md`.

---

### PHASE 2 — Party dan roster

#### B15 — Roster dan karakter ketiga
**Status 2026-11-13: IMPLEMENTED.** Lihat `docs/handover/B15_REPORT.md`.
- Keputusan D-020: karakter ketiga dan komposisi party ditentukan di batch ini dari `CHARACTER_BIBLE.md`. Jika tidak ada karakter yang sudah ditetapkan, berhenti dan minta persetujuan.
- Gunakan ID runtime (`orin`, `mira`) dan pemetaan di `docs/narrative/CHARACTER_ID_MAP.md` (D-017).
**Tujuan:** roster dibaca dari data, dengan karakter ketiga.

Tugas:
- Cek `CHARACTER_BIBLE.md` untuk karakter ketiga. Jika tidak ada, minta keputusan pengguna sebelum mengimplementasikan.
- Tambahkan karakter ketiga ke `content/characters/progression.js` dengan konvensi ID dari B10.
- Ubah pembacaan roster agar berbasis kunci ID.

Tes: karakter ketiga bisa masuk party, ikut battle, dan mendapat EXP. Tes progresi diperluas.

DoD: tidak ada regresi di Orin dan Mira.

#### B16 — Rekrut dan keluar party, save v5
**Tujuan:** party bisa berubah sesuai cerita.

Tugas:
- Flag rekrut dan keluar (6.4).
- Save v5 dengan migrasi v4 ke v5 (6.5).
- Party aktif maksimal 4 di battle.

Tes: round-trip save v5. Migrasi fixture save v4 ke v5. Tes party berubah sesuai flag.

DoD: save v4 lama tetap dimuat. Tes migrasi lolos.

**Status 2026-11-13 (combined B16–B17): IMPLEMENTED.** Save v5, migrasi v4→v5, roster flag rekrut/keluar, party battle maksimal 4, dan alur rekrut Kael Chapter 6 diimplementasikan. Lihat `B16_B17_COMBINED_REPORT.md`.

#### B17 — Skill unik dan pertumbuhan per karakter
**Tujuan:** setiap karakter punya identitas.

Tugas:
- Tiap karakter punya 3 sampai 4 skill unik dan satu kemampuan khas.
- Kurva pertumbuhan sesuai peran (penyerang, penyembuh, penyihir, tank).

Tes: kurva per karakter. Tidak ada skill terkunci yang bisa dipakai (ini sudah diuji untuk Orin dan Mira di 9.3B, perluas ke karakter baru).

DoD: tes kurva lolos. Konten skill terdaftar di `CONTENT_ID_REGISTRY.md`.

**Status 2026-11-13 (combined B16–B17): IMPLEMENTED.** Orin, Mira, dan Kael masing-masing memiliki empat skill terdaftar dengan satu kemampuan khas; mekanik Kael terhubung ke sistem battle. Dialog rekrut dan adegan jaga malam pertama Kael tersedia di pembuka Chapter 6. Lihat `B16_B17_COMBINED_REPORT.md`.

#### B18 — Karakter keempat dan kelima (Arc II)
**Tujuan:** roster lengkap sampai Arc II.

Tugas:
- Dua karakter tambahan dengan rekrut di Arc II.
- Kerangka dialog rekrut di `content/dialogue/party/`.

Tes: rekrut dan keluar untuk kedua karakter. Save round-trip.

DoD: G2 lolos.

**Status 2026-11-13: IMPLEMENTED.** Iven Marr (`iven`, Chapter 7) dan Tavi Brindle (`tavi`, Chapter 8) ditambahkan dari Character Bible. Keduanya memiliki profil pertumbuhan dan empat skill terdaftar, dialog rekrut Bahasa Indonesia, flag join/leave, integrasi battle/EXP, dan persistensi HP/MP pada save v6. Migrasi v5→v6 menjaga data lama. Lima karakter dapat direkrut; battle tetap membatasi anggota aktif menjadi empat. Chapter 7/8 world/quest penuh dan menu pergantian anggota cadangan tidak termasuk B18. Lihat `BATCH_18_REPORT.md`.

**Gerbang G2:** automated acceptance checks pass; uji perangkat fisik masih menunggu Paket Uji iPhone.


---

### PHASE 3 — Musuh dan boss

#### B19 — Katalog musuh Arc I dan II
- 8 sampai 10 musuh per arc, di `content/enemies/arc_01.js` dan `arc_02.js`.
- Format sesuai `CONTENT_SCHEMA.md`. ID terdaftar.
- Tes: validator musuh lolos. Setiap musuh bisa dipakai di encounter uji.

#### B20 — Boss Arc I dan mini-boss
- Satu boss utama dan satu mini-boss untuk Arc I, memakai kerangka B13.
- Mengacu `ANTAGONIST_BIBLE.md` dan `MONSTER_LORE_ARCHITECTURE.md`.
- Flag `ch5_boss_<id>_defeated`. Save v7 bila diperlukan (6.5).
- Tes: boss dikalahkan di demo, fase berjalan, reward terdaftar.

#### B21 — Boss Arc II dan boss opsional
- Boss utama Arc II dan satu boss opsional.
- Jalur utama tetap bisa diselesaikan tanpa boss opsional.
- Tes: jalur utama lolos tanpa boss opsional.

#### B22 — Musuh Arc III dan IV
- 8 sampai 10 musuh per arc. Validator lolos.

#### B23 — Boss Arc III dan IV
- Boss utama Arc III dan IV.
- Tes: masing-masing punya minimal 2 fase.

#### B24 — Musuh Arc V dan VI
- Lengkapi katalog hingga sekitar 40 jenis.

#### B25 — Boss Arc V dan VI
- Boss utama Arc V dan VI.
- Tes: semua boss utama dan opsional lolos validator.

**Gerbang G3 dicek di sini.**

---

### PHASE 4 — Musik dan audio (DIBATALKAN, D-012)

**Seluruh batch di phase ini dibatalkan. Jangan dikerjakan.** Audio yang masih berlaku hanya SFX dan ambience yang sudah ada dan yang diperbarui sesuai aturan D-012.

#### B26 — Pipeline musik dan track percobaan
- Generator musik di `tools/audio/` (sesuai D2). Output di `assets/audio/music/`.
- Tambah `AudioCatalog` untuk BGM.
- Satu track percobaan untuk kota dan satu untuk battle.
- Catat asal dan metode setiap track.

Tes: track bisa diputar. Tidak ada aset dari sumber luar. Paket Uji iPhone mencakup pemutaran track.

#### B27 — BGM inti: judul, kota, dan eksplorasi
- Track untuk judul dan kota utama. Track eksplorasi per zona.
- Volume musik bisa diatur di menu jeda (SFX dan ambience sudah ada di 9.3A).

#### B28 — BGM battle, boss, dan momen cerita
- Track battle biasa, boss, dan momen cerita kunci.

#### B29 — Crossfade dan audio QA
- Crossfade dan transisi antar zona.
- Tes: audio event bridge mencakup musik. Tidak ada dua musik yang main bersamaan tanpa disengaja.

**G4 dibatalkan (D-012).**

---

### PHASE 5 — Dunia dan transportasi

#### B30 — Peta dunia
- Peta dunia yang menghubungkan region, sesuai `WORLD_CONNECTION_GRAPH.md` dan `WORLD_MASTER_PLAN.md`.
- Save v8 bila diperlukan.
- Tes: `check:world` lolos. Semua region bisa dicapai sesuai urutan cerita.

#### B31 — Perahu dan encounter overworld
- Perahu untuk perjalanan air, hanya di titik yang diatur cerita.
- Encounter overworld dengan frekuensi yang bisa diatur.

#### B32 — Airship
- Airship di pertengahan permainan. Save v9 bila diperlukan.
- Tes: tidak ada soft-lock karena kendaraan.

#### B33 — Dungeon Arc I sampai III
- Satu dungeon utama per arc.
- Tes: `check:world` lolos.

**Gerbang G5 dicek di sini.**

---

### PHASE 6 — Vertical slice (chapter 1 sampai 10)

Setiap batch memakai paket konten chapter (5.5).

#### B34 — Chapter 6 dan 7
- Dialog, quest, flag, dan boss sesuai `MAIN_STORY_OUTLINE.md`.
- Catatan: chapter 1 sampai 5 sudah ada dialognya, tetapi boss dan reward Arc I dibuat di B20. Verifikasi bahwa chapter 1 sampai 5 terhubung dengan boss tersebut.

#### B35 — Chapter 8 dan 9
- Sama seperti B34.

#### B36 — Chapter 10 dan sidequest Arc II
- Klimaks Arc II dan sidequest yang terhubung.

#### B37 — QA vertical slice
- Mainkan chapter 1 sampai 10 dari awal sampai akhir di iPhone (Paket Uji iPhone yang dijalankan pengguna).
- Catat waktu tempuh, titik soft-lock, dan momen yang membosankan.
- Laporan dengan bukti.

**G-VS dicek di sini. Jangan lanjut ke Phase 7 sebelum G-VS disetujui.**

---

### PHASE 7 — Arc III dan IV (chapter 11 sampai 20)

Lima batch, masing-masing dua chapter beserta boss, dungeon, dan sidequest yang terhubung.

- **B38**: chapter 11 dan 12
- **B39**: chapter 13 dan 14
- **B40**: chapter 15 dan 16
- **B41**: chapter 17 dan 18
- **B42**: chapter 19 dan 20, dengan dungeon Arc IV

Setiap batch wajib menjalankan `check:narrative` dan `check:world`, dan mencatat satu sesi QA singkat di Paket Uji iPhone.

**G7 dicek setelah B42.**

---

### PHASE 8 — Arc V dan VI (chapter 21 sampai 30)

- **B43**: chapter 21 sampai 23
- **B44**: chapter 24 sampai 26
- **B45**: chapter 27 sampai 28
- **B46**: chapter 29 sampai 30, klimaks, boss akhir, dan ending sesuai D5

**G8 dicek setelah B46.**

---

### PHASE 9 — Balancing dan polishing

#### B47 — Kurva level dan EXP
- Naikkan batas level sesuai D1.
- Atur kurva EXP supaya total EXP sesuai durasi 25 sampai 35 jam.
- Tes: simulasi progresi dengan seed.

#### B48 — Balancing battle
- Stat musuh dan boss, efek status, dan elemen.
- Simulasi otomatis dengan seed untuk mencari boss yang terlalu mudah atau terlalu sulit.
- Tes: tidak ada boss yang tidak bisa dikalahkan dalam simulasi.

#### B49 — Save, offline, dan performa
- Save-load seluruh game. Migrasi dari semua versi.
- Mode offline dan PWA (`service-worker.js`).
- IndexedDB dan fallback memory.
- Performa di iPhone: waktu muat, frame rate di peta dunia.
- Paket Uji iPhone yang luas (sesuai D4).

**G9 dicek di sini.**

---

### PHASE 10 — Rilis dan QA

#### B50 — QA penuh
- Mainkan jalur utama dari awal sampai ending di iPhone (pengguna) dan browser (AI, jika bisa).
- Catat semua bug dengan status `OPEN`, `FIXED`, atau `NOT TESTED`.

#### B51 — Rilis
- Changelog, panduan pemain singkat, dan ZIP rilis.
- Verifikasi ZIP sesuai 4.8.

**G10 dicek di sini.**

---

## 12. Strategi tes

### 12.1 Jenis tes
- **Unit test** (`tests/unit/`): satu modul, deterministik, memakai `node --test` (D-008).
- **Tes gameplay headless**: menjalankan battle, progresi, dan dialog dari awal sampai akhir tanpa browser, dengan seed. Lokasi: `tests/gameplay/` (folder dibuat saat pertama kali dibutuhkan, sesuai D-007).
- **Validator** (`tools/`): `validate-project.mjs`, `world-validator.mjs`, `narrative-validator.mjs`. Setiap konten baru harus lolos validator.
- **Tes save**: round-trip dan migrasi dari fixture save lama.
- **Paket Uji iPhone**: dijalankan pengguna, bukan AI.

### 12.2 Aturan
- Semua tes deterministik. RNG memakai seed.
- Tes baru untuk setiap fitur baru. Tes lama tidak boleh dihapus untuk membuat hijau.
- Jika tes lama gagal karena perubahan yang disengaja, perbarui tes dan catat alasannya di laporan.

### 12.3 Pelaporan hasil tes
Laporkan jumlah tes, jumlah lulus, dan jumlah gagal dari output nyata. Jangan menulis angka dari perkiraan.

---

## 13. Risiko utama

Daftar lengkap di `RISK_REGISTER.md`. Tambahan untuk roadmap ini:

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Tidak ada git | Sulit melacak perubahan dan rollback | Snapshot ZIP per batch dan daftar checksum (1.3) |
| Pengguna hanya di iPhone | Bug di iPhone baru terlihat di akhir | Paket Uji iPhone wajib setiap batch dan D-009 diverifikasi lebih awal |
| Konten dan dokumen tidak sinkron | Dialog bertentangan dengan bible | Paket konten chapter (5.5) dan validator narasi wajib |
| Save lama rusak | Pemain kehilangan progres | Fixture save lama dan migrasi wajib |
| ID karakter tidak konsisten | Save dan dialog rusak | Selesaikan drift di B10 |
| Ambience terdengar seperti musik | Melanggar D-012 | Audit pendengaran oleh pemilik proyek sebelum G5 (lihat catatan B10) |
| Batch terlalu besar | Token habis di tengah batch | Batas ukuran (1.4) dan protokol berhenti (14) |
| Keputusan pengguna belum ada | Batch berjalan dengan asumsi salah | Default dicatat dan persetujuan per phase |
| Scope membengkak | Target 25 sampai 35 jam terlewati | Target durasi dicek di G-VS dan B50 |

---

## 14. Protokol berhenti dan eskalasi

### 14.1 Berhenti karena batas penggunaan
1. Simpan semua perubahan yang sudah ada.
2. Simpan log dan hasil tes yang sudah dijalankan.
3. Tulis `docs/handover/BATCH_NN_PARTIAL.md` berisi: tugas terakhir yang selesai, tugas yang belum, file yang sedang dikerjakan, dan hasil tes terakhir.
4. Buat ZIP parsial dan tandai namanya dengan `_partial`.
5. Jangan membuat laporan akhir yang dibuat-buat. Laporkan apa adanya.

### 14.2 Berhenti dan tanya pengguna
Berhenti dan tanya jika:
- Ada keputusan D1 sampai D5 yang dibutuhkan batch tetapi belum dijawab (dan tidak ada default yang disetujui).
- Ada konflik antara dokumen desain dan kode yang tidak bisa diputuskan dari bukti repo.
- Perubahan akan merusak save yang sudah ada tanpa migrasi yang jelas.
- Ada aksi yang tidak bisa dibatalkan, misalnya menghapus file atau data.
- Ada blocker kritis yang menghentikan tes atau build.

### 14.3 Jangan berhenti untuk hal ini
- Langkah teknis yang sudah termasuk di scope batch.
- Konfirmasi ulang untuk langkah yang sudah disetujui di phase.

---

## 15. Temuan lanjutan (dicatat, belum dikerjakan)

Diisi selama pengerjaan. Format: `[batch ditemukan] lokasi — deskripsi — batch yang disarankan`.

- (kosong)

---

## 16. Riwayat dokumen

### 16.1 Hasil review v1 (perubahan utama di v2)

| No | Temuan di v1 | Perbaikan di v2 |
|---|---|---|
| 1 | Repo tidak memakai git, tetapi v1 tidak mengatur snapshot | Snapshot ZIP dan checksum wajib (1.3) |
| 2 | Keputusan D-001 sampai D-010 yang sudah APPROVED tidak disebut | Tabel keputusan APPROVED (bagian 3) |
| 3 | Pengguna bekerja dari iPhone, tidak ada alur uji iPhone | Alur ZIP dan Paket Uji iPhone (1.1, 10.4) |
| 4 | Referensi "lihat D5" tanpa definisi | D5 ditambahkan (bagian 8) |
| 5 | Phase 0 digabung dengan Batch 10 battle | Phase 0 jadi B10 tersendiri, numerasi batch diulang |
| 6 | Drift ID karakter (`orin` vs `character_orin_vale`) tidak disebut | Drift masuk B10 (5.4) |
| 7 | D-009 (resolusi iPhone) masih NOT VERIFIED dan tidak disebut | Verifikasi di B10 dan Paket Uji iPhone |
| 8 | Batch terlalu besar (mis. boss Arc III sampai VI sekaligus) | Batas ukuran batch (1.4) dan pemecahan batch |
| 9 | Format data (status, elemen, boss, party, save) belum ditulis | Kontrak data (bagian 6) |
| 10 | Format dialog dan quest belum ditulis | Konvensi konten (bagian 5) |
| 11 | Tidak ada template laporan dan protokol berhenti yang lengkap | Template (10) dan protokol (14) |
| 12 | Gerbang persetujuan tidak jelas per batch atau per phase | Persetujuan per phase dan daftar gerbang (9) |
| 13 | Estimasi 35 batch tidak sesuai isi | Diganti 42 batch dengan alasan (11) |

### 16.2 Riwayat versi

| Versi | Keterangan |
|---|---|
| 1.0 | Versi awal, disusun dari analisis batch 9.3B |
| 2.0 | Revisi lengkap: aturan repo, kontrak data, template batch, dan 42 batch |
| 2.1 | Keputusan D1 sampai D5 disetujui, BGM dibatalkan (B26 sampai B29), batch aktif 38 |
| 2.2 | D-017, D-019, D-020, D-021, D-023 disetujui. Arah HD 3D menggantikan pixel-art. D-009 UNDER REVIEW. Ditambah gerbang G-VIS. Phase 0 selesai, Phase 1 menunggu persetujuan |
| 2.3 | Addendum historis 2026-11-13: D-024 menyetujui Phase 1; status G1 pending kemudian disupersede oleh persetujuan eksplisit pemilik pada 2026-11-13. D-027 disetujui. Pre-B15 wajib direview sebelum B15 |
| 2.4 | B16/B17 digabung sesuai D-030; B18 diselesaikan dengan save v6 sesuai D-031. Nomor save B20/B30/B32 digeser ke v7/v8/v9 |

---

## 17. Addendum status Phase 3 (2026-11-13)

Atas instruksi eksplisit pemilik proyek, B19 sampai B25 dikerjakan sebagai satu rangkaian Phase 3 dari baseline B18:

- **B19:** 9 musuh Arc I dan 9 musuh Arc II.
- **B20:** boss utama dan mini-boss Arc I, termasuk flag Chapter 5, reward, serta dialog transisi fase.
- **B21:** boss utama dan boss opsional Arc II; boss opsional tidak menjadi prasyarat jalur utama.
- **B22:** masing-masing 8 musuh Arc III dan Arc IV.
- **B23:** boss utama Arc III dan Arc IV.
- **B24:** masing-masing 8 musuh Arc V dan Arc VI.
- **B25:** boss utama Arc V dan Arc VI; total akhir enam boss utama dan dua boss opsional/mini-boss.

Hasil katalog: **50 musuh** (9, 9, 8, 8, 8, 8) dan **8 boss** (6 utama, 2 opsional/mini-boss). Semua musuh diuji sebagai participant encounter melalui BattleManager; seluruh boss diuji untuk phase entry/action, defeat, dan reward claim. Boss defeat flags menggunakan world flag save v6 yang sudah fleksibel; tidak ada save schema bump.

**Status gerbang:** automated Phase 3 gate PASS berdasarkan validator dan tes yang tercatat di `docs/handover/PHASE_3_REPORT.md`. G3 tetap menunggu review/penerimaan pemilik proyek. Penempatan seluruh musuh/boss ke world map, playable chapter flow Arc II–VI, visual assets, playtest balancing manusia, serta uji fisik iPhone/Android belum diklaim selesai.
