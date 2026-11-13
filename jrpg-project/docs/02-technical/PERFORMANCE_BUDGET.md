# Performance Budget

Semua angka di bawah adalah **TARGET**, bukan hasil pengukuran. Pengukuran nyata dicatat di tabel terpisah saat ada.

| Aspek | Target | Hasil terukur |
| --- | --- | --- |
| Frame rate perangkat menengah | 60 FPS, batas bawah 30 FPS | NOT VERIFIED |
| Resolusi logis | 480x270 utama, 320x180 alternatif, skala bilangan bulat, letterbox (lihat TECHNICAL_ARCHITECTURE bagian 6) | NOT VERIFIED |
| Waktu muat awal (online) | secepat mungkin, anggaran ditetapkan setelah ukuran bundel diketahui | NOT VERIFIED |
| Pemuatan zona | tanpa jeda terlihat saat transisi | NOT VERIFIED |
| Memori | atlas per zona dilepas saat keluar | NOT VERIFIED |

Praktik: object pooling untuk partikel dan efek, tanpa alokasi per frame di loop utama, `dt` dibatasi, offscreen canvas untuk tile statis. Uji perangkat: minimal satu iPhone dan satu Android kelas menengah (belum ditentukan).
