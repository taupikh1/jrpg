# Sprite Standards dan Asset Pipeline

Sumber ukuran dan prompt: `ASSET_PROMPTS.md`. Ringkasan: tile 16x16; MC dan NPC 24x32 (cell 32x32); monster kecil 24-32; monster besar 40x40; bos 96x96; portrait 64x64; ikon 16x16; panel UI 24x24 nine-slice. Outline 1 piksel `#2a1d2e`, cahaya kiri-atas, maksimal 20 warna per sprite, tanpa anti-aliasing.

## Pipeline
1. Sumber: generator AI (prompt di ASSET_PROMPTS) atau gambar kode (`tools/*-generator`).
2. Latar magenta `#FF00FF` dihapus, kecilkan dengan nearest-neighbor, rapikan di Piskel atau Aseprite.
3. Simpan PNG ke `assets/<kategori>/` dengan penamaan di ASSET_NAMING, sertakan berkas metadata JSON (ukuran cell, frame, anchor, durasi).
4. `tools/asset-validator` memeriksa ukuran, palet, penamaan, dan metadata.
5. Muat lewat `AssetManager` per zona.
Prototype `legacy/` menggambar sprite lewat kode; ini dipertahankan sebagai fallback dan referensi gaya.
