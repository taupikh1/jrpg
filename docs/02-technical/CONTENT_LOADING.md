# Content Loading dan Offline

1. Boot memuat `content/manifest.json` dan registry global kecil (elemen, status, item dasar).
2. `ZoneManager` memuat paket zona (map, NPC, encounter, event) saat pemain mendekati transisi; zona yang jauh dilepas.
3. Aset gambar zona dimuat sebagai atlas; `ResourceManager` menghitung referensi dan melepas.
4. Service Worker: precache app shell (HTML, JS, CSS, manifest); konten zona cache-first dengan nama cache berversi dari manifest; saat versi berubah, cache lama dibuang setelah klien baru aktif.
5. Basis URL dihitung dari `import.meta.url`, tidak pernah dari `/` absolut, agar jalan di `user.github.io/repo/`.
6. Status: SPECIFICATION COMPLETE, selebihnya NOT VERIFIED.
