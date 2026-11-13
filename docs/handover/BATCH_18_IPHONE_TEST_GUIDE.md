# Paket Uji iPhone — B18

## Tujuan
Memeriksa kompatibilitas save lama dan perilaku gameplay dasar setelah B18. Paket ini tidak mengklaim bahwa Chapter 7/8 sudah bisa dimainkan: dialog rekrut Iven dan Tavi sudah terdaftar dan diuji otomatis, tetapi belum dipasang ke world/quest chapter yang akan dibuat pada batch Phase 6.

## Persiapan
1. Unggah ZIP B18 ke hosting yang biasa dipakai (GitHub Pages/Netlify) setelah mengekstrak seluruh isi ZIP ke root situs. Jangan menghapus data situs Safari sebelum tes migrasi.
2. Buka URL game di Safari pada iPhone 13.
3. Jika sebelumnya sudah memiliki save v5 dari build B16/B17, gunakan data situs yang sama agar migrasi otomatis v5→v6 dapat diuji.
4. Untuk pengujian standalone, gunakan Add to Home Screen lalu buka ikon aplikasi.

## Langkah uji

### 1. Orientasi portrait
- **Langkah:** Buka game dalam orientasi portrait.
- **Hasil yang diharapkan:** instruksi rotasi tampil; layar tidak membeku atau menampilkan kontrol di luar area aplikasi.
- **Hasil:** `OK` / `GAGAL: <deskripsi>` / `TIDAK BISA DIUJI`.

### 2. Gameplay landscape dan safe area
- **Langkah:** Putar iPhone ke landscape dan buka kembali game standalone.
- **Hasil yang diharapkan:** area gameplay, HUD, tombol sentuh, dan panel UI terlihat; elemen penting tidak tertutup notch atau indikator Home.
- **Hasil:** `OK` / `GAGAL: <deskripsi>` / `TIDAK BISA DIUJI`.

### 3. Kontrol sentuh
- **Langkah:** Gunakan kontrol sentuh untuk berjalan, mengubah arah, dan berinteraksi dengan NPC/objek di area awal.
- **Hasil yang diharapkan:** input diterima satu kali per sentuhan, karakter bergerak sesuai arah, dan interaksi membuka dialog yang tepat.
- **Hasil:** `OK` / `GAGAL: <deskripsi>` / `TIDAK BISA DIUJI`.

### 4. Layar Status & Skill
- **Langkah:** Buka menu jeda lalu pilih `Status & Skill`; pindah anggota dengan kontrol navigasi yang tersedia.
- **Hasil yang diharapkan:** anggota yang sudah direkrut ditampilkan dengan HP/MP, level, dan skill; tidak ada teks terpotong atau layar macet.
- **Catatan:** Iven/Tavi belum dapat direkrut lewat jalur world pada build ini karena world/quest Chapter 7/8 belum dibuat. Uji perekrutan keduanya ditangani oleh tes otomatis B18.
- **Hasil:** `OK` / `GAGAL: <deskripsi>` / `TIDAK BISA DIUJI`.

### 5. Masuk battle
- **Langkah:** Jika progres save sudah membuka Chapter 3, pergi ke jalan menuju Bellhaven dan dekati encounter penyergapan di jalur tersebut. Jika belum, lanjutkan cerita sampai jalur itu terbuka.
- **Hasil yang diharapkan:** battle dimulai, anggota party yang aktif muncul, dan perintah Serang/Skill/Item/Bertahan/Kabur dapat dipilih.
- **Hasil:** `OK` / `GAGAL: <deskripsi>` / `TIDAK BISA DIUJI`.

### 6. Keluar battle dan reward
- **Langkah:** Selesaikan encounter dengan menang atau kabur.
- **Hasil yang diharapkan:** layar battle ditutup dengan benar; reward hanya diberikan saat menang dan tidak ada soft-lock.
- **Hasil:** `OK` / `GAGAL: <deskripsi>` / `TIDAK BISA DIUJI`.

### 7. Migrasi save v5 ke v6
- **Langkah:** Pada Safari yang masih menyimpan save dari build B16/B17, pilih Continue/Load tanpa menghapus data situs.
- **Hasil yang diharapkan:** save lama dimuat tanpa kembali ke awal; posisi, inventory, equipment, quest, progresi Orin/Mira/Kael, flag cerita, dan gold tetap ada. Data Iven/Tavi dimulai aman pada nilai awal sampai direkrut.
- **Hasil:** `OK` / `GAGAL: <deskripsi>` / `TIDAK BISA DIUJI`.

### 8. Save dan load ulang
- **Langkah:** Simpan permainan, tutup aplikasi standalone, buka kembali, lalu Continue/Load.
- **Hasil yang diharapkan:** posisi dan progres tersimpan; tidak ada error migrasi berulang, data kosong, atau reset karakter lama.
- **Hasil:** `OK` / `GAGAL: <deskripsi>` / `TIDAK BISA DIUJI`.

## Ringkasan hasil
- Perangkat / versi iOS:
- Cara membuka game (Safari / Add to Home Screen):
- Tanggal pengujian:
- Hasil langkah 1–8:
- Screenshot atau rekaman jika ada:
- Bug yang ditemukan:
