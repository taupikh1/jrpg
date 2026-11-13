# Save, Load, dan Migrasi

## Penyimpanan runtime
- Browser menyimpan slot melalui `IndexedDBAdapter` di database `jrpg_saves`, object store `slots`.
- Composition root memilih IndexedDB bila tersedia; jika tidak, runtime memakai `MemoryStorageAdapter`. Penyimpanan memori tidak bertahan setelah halaman ditutup.
- `SaveManager` membangun payload plain-data, memvalidasi saat simpan, dan memigrasikan sebelum memvalidasi saat load.

## Bentuk payload saat ini (save v6)
Payload memakai `version`, `slotId`, `createdAt`, `updatedAt`, `playtimeMs`, `displayName`, `player`, `inventory`, `equipment`, `quests`, `world.flags`, `gold`, `party`, dan `progression`.

`party.roster` menyimpan `recruited`, `departed`, dan daftar `active` dengan batas empat anggota battle. `party.roster.memberStats` menyimpan HP/MP Iven dan Tavi secara terpisah. HP/MP Orin disimpan di `player.stats`; HP/MP Mira dan Kael tetap memakai field party yang sudah ada. Level, EXP, dan skill terbuka disimpan di `progression`.

## Versi dan migrasi
Migrasi berantai dijalankan oleh `src/engine/persistence/SaveMigrations.js`:
- v1→v2: gold, world flags, dan facing.
- v2→v3: struktur party awal.
- v3→v4: progresi per karakter.
- v4→v5: roster, flag rekrut Kael, dan sinkronisasi skill.
- v5→v6: roster Arc II Iven/Tavi, progresi awal, flag Chapter 7/8, dan slot HP/MP Iven/Tavi.

`SAVE_VERSION` saat ini **6**. Save v1 sampai v5 tetap dapat dimuat melalui migrasi berurutan. Save dari versi lebih baru ditolak dan tidak ditimpa. Perubahan bentuk payload berikutnya wajib menaikkan versi, menambah migrasi, dan menambah fixture serta tes round-trip.

## Validasi dan batasan
`SaveValidator` memeriksa struktur inti payload, versi, posisi pemain, inventaris, equipment, quest, dan batas roster aktif. HP/MP karakter baru dipulihkan dengan clamp terhadap nilai maksimum hasil progression. Sistem checksum, backup slot, ekspor/impor JSON, dan autosave belum menjadi bagian implementasi runtime saat ini.
