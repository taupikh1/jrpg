# Data Architecture dan Strategi JSON Schema

## ID konten
Format `tipe.nama-kebab`, huruf kecil, permanen, tidak pernah dipakai ulang. Tipe: `reg` region, `zon` zone, `map`, `npc`, `chr` playable, `mon`, `bos`, `itm`, `skl`, `spl`, `qst`, `dlg`, `shp`, `evt`, `enc` encounter table. Contoh: `mon.slime-hijau`, `zon.desa-awal`. Menghapus konten = tandai `deprecated`, jangan hapus ID.

## Berkas
Satu entitas per berkas JSON (kecuali tabel kecil), nama berkas = ID tanpa tipe, `kebab-case`. Setiap berkas memiliki `schemaVersion` dan `id`. Teks tampil tidak ditulis di data entitas; memakai kunci lokalisasi (`content/localization/id|en`).

## Validasi
JSON Schema (draft 2020-12) per tipe di `src/data/schemas`. `validators` memeriksa (a) bentuk, (b) referensi silang (setiap ID yang dirujuk ada), (c) duplikasi ID, (d) rentang nilai. `tools/content-validator` menjalankan semuanya offline dan dipakai CI. `registries` memuat data tervalidasi ke Map by ID; runtime hanya membaca dari registry. Validator tahap ini baru tersedia di Batch 1-2; sampai saat itu status: NOT VERIFIED.

## Manifest
`content/manifest.json`: daftar berkas per zona dengan hash isi dan versi konten, dipakai loader dan Service Worker.

## Hierarki dunia
WORLD → REGION → ZONE → MAP → LOCATION. Zone memuat: metadata, map dan collision, NPC dan spawn, encounter table, event lokal, transisi, musik dan ambience, kondisi waktu/cuaca, kunci progres. Zone adalah unit lazy-load.
