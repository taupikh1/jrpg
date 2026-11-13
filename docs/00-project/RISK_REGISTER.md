# Risk Register

| ID | Risiko | Dampak | Mitigasi | Pemilik batch |
| --- | --- | --- | --- | --- |
| R1 | Scope MASSIVE melebihi kapasitas | Proyek tidak selesai | Vertical slice (Batch 19) sebelum ekspansi; konten via data | Semua |
| R2 | Safari iOS: batas memori canvas, audio perlu gesture, eviction IndexedDB | Crash, save hilang | Atlas kecil, audio unlock, `navigator.storage.persist()`, ekspor save manual | 1, 17, 18 |
| R3 | Aset hasil AI tidak konsisten | Gaya pecah | Style block, design sheet, validator aset, rapikan manual | 2-5 |
| R4 | Circular dependency antar sistem | Sulit dirawat | Aturan lapisan, port/adapter, EventBus; pemeriksaan siklus dan arah impor di validator (IMPLEMENTED, belum teruji pada kode game nyata) | 1 |
| R5 | Save korup atau tak kompatibel antar versi | Progres hilang | Versi schema, migrasi berantai, checksum, backup slot | 17 |
| R6 | Subpath GitHub Pages merusak path aset | Game tidak jalan | Semua path relatif dari `import.meta.url`, tes subpath | 1, 17 |
| R7 | Service Worker menyajikan cache lama | Pemain tertinggal versi | Cache bernama versi, strategi update jelas | 17 |
| R8 | Keterbatasan perangkat pengembang (RAM 2GB) | Build dan tes lambat | Tanpa bundler berat, tes ringan | Semua |
| R9 | Data JSON besar memperlambat muat | Loading lama | Lazy load per zona, manifest | 7 |
| R10 | Klaim selesai tanpa bukti | Kualitas semu | Skala Quality Gate wajib | Semua |
