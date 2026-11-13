# Spike HD 3D (Opsi A vs B) — protokol uji

Status: **prototipe, bukan produksi.** Dibuat di Batch Phase 1 untuk D-025. Tidak ada hasil pengukuran yang sudah dicatat.

## Isi
- `index.html`: satu file, WebGL mentah, tanpa dependensi, tanpa aset eksternal.
- Model karakter berupa kotak primitif. Prototipe ini **tidak menilai kualitas model**.
- Dua mode: **A** (bergerak bebas di dunia kontinu) dan **B** (bergerak per sel grid dengan data yang sama).
- Dua area dengan transisi (keluar di kotak kuning). Waktu transisi dicatat.
- Tombol **Hasil** menampilkan JSON pengukuran yang bisa disalin.

## Cara uji di iPhone (wajib untuk klaim "perangkat fisik")
1. Buka `index.html` di iPhone Safari (lewat hosting, mis. GitHub Pages, atau file yang disediakan). Catat versi iOS.
2. Isi kolom perangkat dengan model dan versi iOS, mis. `iPhone 13, iOS 17.5`.
3. Uji Mode A selama sekitar 60 detik: gerak di pad, pindah area lewat kotak kuning, lalu kembali.
4. Tekan **Mode** untuk beralih ke Mode B, dan ulangi langkah 3.
5. Uji **Skala** (auto dan 1x), lalu catat perbedaan FPS dan tampilan.
6. Tekan **Hasil**, salin JSON, dan kirimkan.
7. Catat juga secara manual: apakah teks HUD terpotong, apakah pad sentuh responsif, dan apakah ada pemanasan atau penurunan frame yang terlihat.

## Cara uji di desktop
Gunakan tombol panah atau WASD. Hasil desktop **tidak boleh** diklaim sebagai hasil iPhone. Tulis `perangkat_fisik` sebagai desktop dan catat browser.

## Yang belum diuji
- Android Chrome: belum diuji.
- Performa di iPhone: belum ada data.
- Kualitas visual terhadap referensi FF4 HD: tidak dinilai (model primitif).
- Pencahayaan, pemuatan aset, dan pemakaian memori pada aset nyata: tidak diuji.
