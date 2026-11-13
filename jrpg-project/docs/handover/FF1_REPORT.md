# Laporan Batch FF1 — Layout Battle ala Final Fantasy 4

**Status:** COMPLETE

**Tanggal:** 2026-11-14

## Berkas berubah
- `src/scenes/battle/BattleLayout.js` (baru)
- `src/scenes/GameplayDemoScene.js`
- `src/engine/rendering/pixelart/PixelArt.js` (tambah `drawPartyMemberBattle`)
- `tests/unit/rendering/BattleLayout.test.js` (baru)
- `CHANGELOG.md`
- `docs/handover/FF1_REPORT.md` (ini)
- `docs/handover/FF1_IPHONE_TEST_GUIDE.md` (baru)

## Keputusan desain
- Satu sumber layout di `BattleLayout.js` agar gambar dan hit-test konsisten.
- Party di kanan dengan susunan diagonal, menghadap kiri via sprite per anggota.
- Musuh di kiri.
- Jendela bawah: nama musuh (kiri), status party HP/MP (kanan), perintah overlay saat giliran pemain.
- Chip nama pelaku saat ini menggantikan header ronde penuh.
- Pelat HP kecil di sprite dipertahankan (tidak tumpang tindih dengan jendela bawah pada y≈176).
- Tidak ada perubahan pada BattleManager, save schema, atau logika giliran.

## Hasil test
- Sebelum: 648 lulus
- Sesudah: 650 lulus
- `npm run check`: OK
- `npm run check:world`: OK
- `npm run check:narrative`: OK
- `npm run check:enemies`: OK

## NOT TESTED
- Tampilan visual di browser (termasuk landscape iPhone).
- Sentuhan dan keyboard pada perangkat sungguhan.
- Kursor target berkedip dan tap pada sprite (implementasi hit-test perintah dasar ada, namun verifikasi manual belum).

## Risiko / utang teknis
- Hit-test untuk sub-menu skill/item masih memakai koordinat lama di beberapa tempat; perlu sinkron penuh di batch berikutnya jika ada masalah.
- Sprite party per anggota menggunakan look hardcoded; bisa diperhalus dari CharacterArt di kemudian hari.
- Tidak ada animasi serangan baru (di luar lingkup).

## Checklist uji manual iPhone
Lihat `docs/handover/FF1_IPHONE_TEST_GUIDE.md`.
