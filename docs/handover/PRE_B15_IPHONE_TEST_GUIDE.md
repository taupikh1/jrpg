# PRE-B15 — Paket Uji iPhone

> Catatan build saat ini: canvas memakai logical width adaptif pada landscape agar mengisi viewport tanpa stretch/crop. Verifikasi nyata tetap diperlukan untuk memastikan viewport Safari, safe-area, peta, dan touch controls terlihat benar pada iPhone 13. Lihat `PRE_B15C_REPORT.md`.

**Tujuan:** memeriksa perilaku nyata di iPhone Safari dan Web App Add to Home Screen. Tes ini harus dilakukan pada build yang di-host melalui HTTPS (atau localhost untuk pengujian teknis). Unit test dan browser emulation bukan pengganti perangkat iPhone.

## Persiapan

1. Host seluruh isi ZIP pada HTTPS, misalnya GitHub Pages atau Netlify. Jangan mengunggah hanya `index.html`; seluruh folder `src/`, `content/`, `assets/`, `manifest.json`, dan `service-worker.js` harus tetap tersedia.
2. Buka URL game menggunakan Safari di iPhone.
3. Muat ulang halaman sekali setelah deployment selesai agar service worker baru dapat terpasang.
4. Gunakan Share → Add to Home Screen, lalu buka game dari ikon Home Screen.
5. Pastikan game berjalan sebagai standalone Web App, bukan tab Safari biasa.

## Daftar pengujian

| # | Langkah | Hasil yang diharapkan | Hasil pemilik |
|---|---|---|---|
| 1 | Buka game dalam portrait | Muncul instruksi singkat untuk memutar perangkat; halaman tidak scroll atau zoom tanpa sengaja | OK / GAGAL / TIDAK BISA DIUJI |
| 2 | Putar iPhone ke landscape | Instruksi menghilang; game tetap berjalan dan canvas terlihat tanpa elemen terpotong | OK / GAGAL / TIDAK BISA DIUJI |
| 3 | Mulai permainan dan gerakkan Orin memakai D-pad | D-pad dan tombol aksi berada di dalam area game, responsif, dan tidak tertinggal setelah rotasi | OK / GAGAL / TIDAK BISA DIUJI |
| 4 | Jelajahi desa dan hutan | Mira, Elara, serpihan Resonansi, dan catatan hutan berada di permukaan yang benar; tidak ada NPC/objek yang menimpa atap atau air | OK / GAGAL / TIDAK BISA DIUJI |
| 5 | Buka dan tutup menu jeda, inventaris, status, dan quest | Menu mudah dibaca, tombol tidak terpotong, gameplay tidak tertutup oleh HUD permanen | OK / GAGAL / TIDAK BISA DIUJI |
| 6 | Masuk dan keluar dari battle | Battle UI tetap terbaca; kontrol sentuh dan tombol AKSI berfungsi | OK / GAGAL / TIDAK BISA DIUJI |
| 7 | Simpan permainan, tutup Web App, lalu buka kembali dan lanjutkan | Save berhasil dimuat dan posisi/progres tetap konsisten | OK / GAGAL / TIDAK BISA DIUJI |
| 8 | Buka Safari kembali setelah orientasi berubah dan setelah app masuk background | Layout menyesuaikan viewport; input tidak macet; audio mengikuti kebijakan unlock/resume browser | OK / GAGAL / TIDAK BISA DIUJI |
| 9 | Periksa area gerbang, alun-alun, arsip, dan situs Resonansi | NPC/interactable dapat dijangkau; objek yang memang dipasang di rak/pilar/air mancur tetap tampak disengaja | OK / GAGAL / TIDAK BISA DIUJI |

## Form hasil

Isi satu baris per nomor:

- `1: OK` atau `1: GAGAL — <deskripsi>` atau `1: TIDAK BISA DIUJI`
- `2: ...`
- `3: ...`
- `4: ...`
- `5: ...`
- `6: ...`
- `7: ...`
- `8: ...`
- `9: ...`

Sertakan screenshot bila menemukan objek salah posisi, UI terpotong, atau kontrol menutupi gameplay. Catat model iPhone dan versi iOS. Jangan menganggap orientasi landscape dipaksa oleh iOS; pengujian harus memastikan prompt portrait dan layout landscape berfungsi.
