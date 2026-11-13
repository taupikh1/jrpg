> **Superseded status addendum 2026-11-13:** G1 was later explicitly approved by the owner. See `PHASE_1_INTEGRATION_REPORT.md` and `HANDOVER_JRPG_ROADMAP_v2.md` for the current gate status. Physical-device QA remains separate and pending.

# Phase 1 — Laporan (B11 sampai B14): fondasi battle

Status: implementasi selesai untuk logika battle. **Menunggu peninjauan pemilik proyek (D-024) sebelum G1 dinyatakan lolos.** Tidak ada lanjut otomatis ke Phase 2.

## Ringkasan hasil verifikasi (output nyata di container)
- `npm test`: **537 tes, 537 lulus, 0 gagal.** Termasuk 504 tes lama dan 33 tes baru.
- `npm run check`: OK (492 berkas, 205 modul ES).
- `npm run check:world`: OK (12 region, 10 zona playable).
- `npm run check:narrative`: OK.
- Perangkat fisik: **tidak diuji.** Semua hasil di atas dari Node.js di container. Tidak ada klaim verifikasi iPhone.

## Batas pengerjaan (Ponytail)
- Logika battle dan sistem gameplay terkait saja. Tidak ada migrasi rendering HD 3D.
- Tidak ada perubahan skema save. `SAVE_VERSION` tetap 4. Status battle tidak disimpan.
- Tidak ada dependensi baru.
- Engine tidak mengimpor `content/`. Definisi status diberikan lewat opsi konstruktor (D-027).

## B11 — Mesin status effect
Yang diimplementasikan:
- Definisi data: `content/combat/status_effects.js` (poison, regen, stun, silence, slow, haste, attack_up, defense_down).
- Logika: `src/engine/gameplay/battle/StatusEffects.js`. Status disimpan di peserta battle. Efek stat memakai modifier `CharacterStats` berprefiks `status:` dan dihapus saat battle berakhir.
- Durasi dihitung per awal giliran pemilik. Poison dan regen bekerja di awal giliran. Stun menghabiskan giliran.
- Stacking: `refresh` (reset durasi) atau `none` (abaikan).
- Efek dari skill (`effect`, dengan `chance` memakai RNG battle).
- Battle berakhir (menang, kalah, kabur) membersihkan semua status. `start()` juga membersihkan sisa dari battle yang terputus.

Belum:
- Ikon atau indikator status di UI.
- Tes khusus `haste` dan `defense_down`. Keduanya memakai jalur kode yang sama dengan `slow` dan `attack_up`, yang sudah diuji.

## B12 — Elemen dan kelemahan
Yang diimplementasikan:
- Aturan di `src/engine/gameplay/battle/Elements.js`: weak 1.5x, resist 0.5x (minimal 1), immune 0x, neutral 1x.
- Daftar elemen di `content/combat/elements.js`. Diuji unik dan tidak kosong.
- Afinitas peserta (`affinities`). Elemen tanpa entri atau nilai tidak dikenal dianggap neutral.
- Pertahanan (defend) diterapkan setelah pengali elemen.
- Event `battle.action_resolved` menyertakan `affinity` dan `damage`.

**Belum:** teks elemen di UI battle (mis. "Lemah terhadap cahaya!"). Ini belum dikerjakan karena UI battle akan dirancang ulang sesuai keputusan visual. Presentasi hanya perlu membaca `affinity` dari event.

## B13 — Kerangka fase boss
Yang diimplementasikan:
- Fase per peserta: `phases` dengan `hpBelowPct`, `actions`, dan `onEnter.dialogueId`.
- Fase hanya maju. Penyembuhan tidak memicu fase mundur (diuji).
- Event `battle.phase_entered` dengan `dialogueId`. Status yang aktif tetap ada saat fase berganti (diuji).
- Aksi boss berputar sesuai urutan fase. Aksi bisa memberi efek status (mis. stun).
- Kondisi menang `survive_turns`: menang bila party bertahan melewati N ronde meski boss masih hidup (diuji).

**Belum:** scene belum memulai dialog dari `dialogueId`. Event sudah dikirim, tetapi penyambungan ke sistem dialog belum dilakukan. Boss demo belum ditambahkan ke encounter.

## B14 — Command dan ritme ATB ringan
Yang diimplementasikan:
- `availableCommands(actorId)`: daftar perintah yang bisa dipakai beserta alasannya (mis. `silenced`, `not_your_turn`).
- `getTurnQueue(count)`: urutan giliran berikutnya, hanya peserta hidup. Urutan tetap deterministik berdasarkan kecepatan.
- `view()`: snapshot presentasi (HP, MP, status, fase) tanpa asumsi rendering.

**Belum:** menu command di scene belum diubah. Ritme ATB ringan hanya tersedia sebagai data urutan giliran. Meter visual ditunda ke presentasi HD.

## Perubahan perilaku yang perlu diketahui
- Saat giliran dilewati karena peserta sudah tumbang, pergantian ronde sekarang dihitung dan defend dibersihkan dengan cara yang sama seperti giliran normal. Sebelumnya bagian ini tidak menambah ronde. Tes lama tetap lulus.
- `commandEscape` sekarang membersihkan status sebelum battle berakhir.
- Kemenangan dengan `survive_turns` mengirim `reason: 'survived'` pada event `battle.victory`. Kemenangan biasa tetap `reason: 'defeated'`.

## Keamanan save
- Tidak ada perubahan bentuk data save. Tes save lama (round-trip dan migrasi) tetap lulus.
- Status tidak pernah masuk ke data save. Modifier status dihapus di akhir battle dan di awal battle berikutnya.

## Yang belum diverifikasi
- Semua perilaku battle baru diuji di Node, bukan di browser atau iPhone.
- Keseimbangan efek (durasi, persentase) belum diuji dengan permainan nyata. Angka dalam data adalah nilai awal.
- Integrasi scene untuk dialog fase dan UI elemen belum diuji.

## Spike HD 3D (D-025)
Prototipe dibuat di `prototypes/hd3d-spike/` (lihat `README.md` untuk protokol uji). **Belum ada hasil pengukuran.** Container tidak punya browser dengan WebGL, dan jaringan dimatikan. Yang sudah diverifikasi: sintaks skrip (`node --check`). Pemilihan Opsi A atau B menunggu hasil uji iPhone dan persetujuan pemilik.
