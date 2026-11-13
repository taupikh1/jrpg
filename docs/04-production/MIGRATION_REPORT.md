# Laporan Migrasi

Struktur lama (zip `jrpg-project` sebelumnya): ratusan folder dengan stub TODO, script klasik berstate global.

| Item | Tindakan | Alasan |
| --- | --- | --- |
| Kode prototype (21 berkas JS + CSS + index) | Dipindah ke `legacy/prototype-v2/`; satu-satunya perubahan: tautan `manifest.json` di index dihapus karena berkasnya tidak ada di folder itu | Aturan 9.2; tetap bisa dijalankan |
| Versi satu berkas | `legacy/MC_Pixel_Prototype_v2_singlefile.html` | Cadangan |
| Stub TODO dan `.gitkeep` | Dihapus (tidak ada implementasi yang hilang) | Aturan 9.5 |
| Folder target kosong | Tidak dibuat; dicatat di TECHNICAL_ARCHITECTURE | Aturan 9.5 |
| `ASSET_PROMPTS.md` | Dipertahankan di `docs/03-art/` | Sumber standar aset |
| Script klasik ke ES Modules | Ditunda ke Batch 1 (rewrite, bukan konversi) | Prototype bukan fondasi |

Rollback: zip lama tetap ada di hasil sebelumnya.
