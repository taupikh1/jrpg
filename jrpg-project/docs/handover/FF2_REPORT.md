# Laporan Batch FF2 — Mesin ATB (opt-in)

**Status:** COMPLETE (inti) / PARTIAL (UI pengaturan penuh)

**Tanggal:** 2026-11-14

## Berkas berubah
- `src/engine/gameplay/battle/BattleManager.js`
- `src/platform/browser/BattleSettingsStore.js` (baru)
- `src/scenes/GameplayDemoScene.js` (update call + gauge)
- `tests/unit/gameplay/BattleATB.test.js` (baru)
- `CHANGELOG.md`
- `docs/handover/FF2_REPORT.md`

## Keputusan desain
- Default tetap 'round' agar semua test lama lulus tanpa perubahan.
- ATB menggunakan gauge [0,1], laju = baseRate * f(speed), RNG injectable.
- Mode wait/active dibedakan lewat paused flag (scene dapat set saat menu terbuka).
- Tidak mengubah save schema.

## Hasil test
- Sebelum: 650 lulus
- Sesudah: 652 lulus
- Semua validator OK

## NOT TESTED
- Visual gauge dan gameplay ATB di browser/perangkat.
- Integrasi penuh submenu pengaturan jeda (store sudah ada, wiring menu minimal).

## Risiko
- AI musuh di mode ATB menggunakan jalur yang sama; perlu uji deadlock lebih luas.
- Pengaturan mode belum sepenuhnya diekspos di UI jeda (dapat ditambahkan di batch berikutnya).
