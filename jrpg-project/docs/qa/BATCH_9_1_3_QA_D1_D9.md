# Batch 9.1.3 — QA D1–D9 (status jujur)

Dokumen ini mencatat apa yang sudah diverifikasi, dengan cara apa, dan apa yang belum. Klaim "terverifikasi" hanya dipakai bila ada bukti yang bisa diperiksa.

Legenda:
- **Browser**: dijalankan di Chromium lewat Playwright, bukti di `docs/qa/evidence/batch-9-1-3/`.
- **Tes**: tes unit di `tests/unit/`.
- **Statis**: audit data/kode tanpa menjalankan game.
- **Belum**: belum diuji.

Catatan metode: beberapa skenario browser memaksa flag prasyarat (misalnya `ch4_completed`) atau memindahkan pemain langsung ke posisi tertentu. Hasilnya dicatat sebagai bukti parsial, bukan permainan utuh.

## Ringkasan

| ID | Topik | Status | Bukti |
|---|---|---|---|
| D1 | Flag Arc I (`arc1_completed`, `chapter_06_unlocked`) | Terbukti parsial | Tes `Arc1ProgressionGate`; browser rantai finale (prasyarat dipaksa) |
| D2 | Storage dan save/load | Terbukti | Browser F5 → reload → F9; tes SaveManager yang sudah ada |
| D3 | Gating bab | Diimplementasikan, keputusan desain | Browser: terkunci dan terbuka |
| D4 | Overflow dialog | Terbukti | Tes `DialogueTextFit` (919 node); screenshot 2 adegan + venn |
| D5 | QuestLog | Terbukti parsial | Statis (36 target flag) + tes urutan quest Bab 5. Belum playthrough |
| D6 | Party banter | Sebagian | Browser: banter hutan Bab 2. Pemetaan lain belum diuji di browser |
| D7 | First Resonance dan finale | Terbukti parsial | Browser dari `ch5_first_resonance` sampai akhir (prasyarat dipaksa). Belum dari Bab 1 |
| D8 | Toast ID mentah | Terbukti | Tes `ToastNames`; browser 3 toast |
| D9 | A1–A5 dan bunga | Sebagian | Lihat rincian di bawah |

## Rincian

### D1 — Flag Arc I
- `arc1_completed` dan `chapter_06_unlocked` hanya diset oleh node finale `ch5_completed`. Tes `Arc1ProgressionGate` memastikan hanya satu baris yang memasang flag itu.
- Browser: setelah `ch5_first_resonance` selesai, rantai berjalan ke `ch5_unseen_observer`, lalu `ch5_arc1_finale`. Flag terpasang dan toast Bab 6 muncul.
- Belum: flag tidak terbuka lebih awal pada permainan normal dari Bab 1. Itu butuh playthrough.

### D2 — Storage
- Masalah: scene memakai `MemoryStorageAdapter`, sehingga save hilang saat reload. Juga flag cerita dan zona tidak disimpan.
- Perbaikan: `main.js` memakai `IndexedDBAdapter` bila tersedia. Flag `_ch1Flags` sampai `_ch5Flags` dan zona ikut disimpan dan dipulihkan.
- Browser: F5, reload halaman, lalu F9 memulihkan zona hutan, flag `ch2_first_echo_heard`, dan inventaris.

### D3 — Gating bab
- Keputusan desain: lihat CHANGELOG Tahap 5. Gate memblokir transisi di `ZoneManager.canEnter`.
- Browser: dari hutan tanpa `ch2_completed`, pemain tidak masuk ke jalan Bellhaven dan toast muncul. Setelah flag diset, transisi berhasil.
- Belum: gate untuk arsip dan situs kuno belum diuji di browser; hanya gate jalan Bellhaven.

### D4 — Overflow dialog
- Perbaikan: `TextWrap.js` (word-wrap), kotak menyesuaikan tinggi.
- Tes `DialogueTextFit` memeriksa semua node dialog. Dengan pengukuran 6 px per karakter, 592 dari 919 node tadinya akan overflow. Angka ini berbeda dari laporan lama (618 node, 309 lebar), dan pengukuran lebarnya masih perkiraan.
- Screenshot: `ch2_mira_personal_scene.png`, `ch3_road_bellhaven_first_view.png`, `venn_dialogue.png`.
- Belum: pengukuran dengan lebar font nyata di canvas.

### D5 — QuestLog
- Statis: semua 36 target flag objektif punya pemicu di dialog atau scene.
- Tes: urutan objektif `quest_ch5_resonansi_pertama` menyelesaikan quest hanya setelah `ch5_completed`.
- Belum: quest Bab 5 lainnya dan urutan penyelesaiannya di permainan nyata.

### D6 — Party banter
- Masalah: banter Bab 2 sampai 5 terdaftar tapi tidak pernah diputar. Hanya dua banter Bab 1 yang diantre.
- Perbaikan: `PARTY_AFTER_DIALOGUE` memetakan 20 banter ke dialog pemicunya. Pemetaan adalah pilihan desain.
- Browser: `ch2_party_forest_entry` diputar setelah `ch2_forest_entry`.
- Belum: 19 pemetaan lain belum diuji di browser. `ch5_banter_after_resonance` diputar setelah finale, bukan sebelumnya. Perlu keputusan.

### D7 — First Resonance dan finale
- Masalah yang ditemukan: setelah First Resonance tidak ada yang memulai `ch5_unseen_observer` dan `ch5_arc1_finale`. Arc I tidak bisa selesai.
- Perbaikan: `DIALOGUE_CHAIN`.
- Browser: `ch5_first_resonance` → `ch5_unseen_observer` → `ch5_arc1_finale` → banter. Prasyarat `ch4_completed` dan `ch5_site_reached` dipaksa.
- Belum: First Resonance dari Bab 1 sampai finale tanpa pemaksaan flag.

### D8 — Toast ID mentah
- Perbaikan: `_questTitle` dan `_itemTitle`. Pesan gagal dialog diganti pesan umum; ID hanya masuk console.
- Tes `ToastNames` memastikan setiap quest dan item yang dipakai efek dialog punya nama.
- Browser: `Membeli Herb Hutan (-5 gold)`, `Quest diterima: Serpihan Indeks`, `Quest diterima: Suara di Balik Batu`.

### D9 — A1–A5 dan bunga
- A1 (efek dialog tanpa pilihan): browser. Node `ch2_first_echo` tanpa pilihan memasang flag `ch2_first_echo_heard`.
- A2/A3 (bunga bisa diambil): browser, keempat bunga jalan diambil dengan memindahkan pemain ke samping tiap bunga. Keterjangkauan dicek oleh tes `RoadFlowers`. Pengambilan dengan berjalan sendiri belum diuji.
- A4 (bunga saat inventaris penuh): browser. Bunga tetap di dunia dan toast "Inventaris penuh" muncul.
- A5 (notifikasi bab): browser, tetapi payload `chapterHook` disuntikkan langsung lewat event. Toast "Bab 3 telah terbuka." muncul. Belum lewat akhir Bab 2 yang sungguhan.
- A6 (transisi zona): tidak diuji ulang di batch ini. Laporan sebelumnya menyebut terbukti, tetapi itu belum saya verifikasi sendiri.
- A8 (dialog hutan Bab 2): browser, `ch2_forest_entry` selesai tanpa error konsol.
- Tambahan: `ch2_note_0` dipindah ke (100,96) karena tidak punya posisi valid. Pengambilannya belum diuji di browser.

## Yang tidak berubah atau belum diverifikasi
- Error 404 satu kali: sumbernya `/favicon.ico`, ditangani dengan `<link rel="icon" href="data:,">`. Tidak muncul di run browser berikutnya, tetapi tidak bisa dipastikan hilang di semua kondisi.
- Permainan utuh Bab 1 sampai finale belum pernah dijalankan.
- NPC di tile solid: tes `NpcFootprint` lolos untuk semua NPC village, forest, dan plaza. Audit lama yang menandai jarek, elara, ruli, dan mira kemungkinan memakai ukuran footprint yang berbeda.

---

## Checkpoint reconciliation addendum (2026-11-12)

This addendum supersedes stale statements above where the supplied `jrpg-project-batch9_1_2_CHECKPOINT.zip` contains later implementation changes.

- **D6/D7 ordering correction:** the current `DIALOGUE_CHAIN` is `ch5_first_resonance` → `ch5_after_resonance` → `ch5_banter_after_resonance` → `ch5_unseen_observer` → `ch5_arc1_finale`. Therefore the after-resonance banter is in the story chain before the observer, not after the finale. This is source-verified; the full natural runtime chain remains only partially browser-verified.
- **D2 storage correction:** current `src/main.js` selects `IndexedDBAdapter` when `isAvailable()` succeeds and falls back to `MemoryStorageAdapter` otherwise. The current adapter selected in a specific browser session must be observed at runtime; do not state unconditionally that the scene always uses MemoryStorageAdapter.
- **D3 gating correction:** current `ZONE_GATES` gates the Bellhaven road and districts on `ch2_completed`, the archive hall on `ch3_completed`, and the ancient site on `ch4_completed`. The forest and village are not gated. This is source-verified; not every gate has a fresh browser test in this continuation.
- **D1:** the current source sets `arc1_completed` and `chapter_06_unlocked` in the Chapter 5 completion handling. A normal Chapter 1-to-5 playthrough without forced flags remains unverified.
- **D6 lifecycle:** `_partySeen` is updated by `_startQueued` only after a successful dialogue start for queued banter. The direct Chapter 1 travel banter was an exception and was changed in this continuation to use the shared queue lifecycle. Unit tests now cover successful start and retry after a temporary start failure.
- **Current test baseline:** 285 passed, 0 failed, 0 skipped (76 suites) after this continuation's changes. This does not convert unrun browser cases into VERIFIED.


## Later continuation correction (2026-11-12)

The subsequent Batch 9.1.2 continuation added `CollectibleInteraction.test.js` and fixed the one-shot inventory pickup behavior. `ch2_note_0` now has scene-spawn + InteractionSystem test coverage for full-inventory retry, successful collection, and duplicate prevention. This is not browser walking/keyboard evidence; the browser check remains pending. See `BATCH_9_1_2_CONTINUATION_QA.md` for the current consolidated status.


## 2026-11-12 continuation: browser canvas measurement

The D4 fit estimate has since been checked with actual Chromium Canvas 2D text metrics. The real `TextWrap.js` module was imported into Chromium 144 through a blank-page test fixture. All 919 dialogue nodes were measured at 10px monospace and 480×270; zero overflow cases, maximum dialogue box height 114px. See `docs/qa/evidence/batch-9-1-2-canvas/`. This does not verify full game runtime or input flow.
