# Project Overview (Executive Summary)

Original 2D Fantasy JRPG skala MASSIVE, dibangun bertahap dengan HTML5 Canvas 2D, Vanilla JavaScript (ES Modules), CSS3, konten JSON, save IndexedDB, PWA/offline, deploy GitHub Pages. Target: desktop dan mobile (prioritas iPhone Safari dan Android Chrome). Single-player, tanpa backend untuk gameplay inti. Semua IP orisinal.

Titik awal: prototype pixel gaya JRPG (`legacy/`) yang membuktikan gaya visual, gerak, monster, NPC, dan HUD dasar. Prototype itu dibekukan sebagai referensi, bukan fondasi: ia memakai script klasik dengan state global dan melanggar keputusan arsitektur (ES Modules, data-driven).

Batch 0 hanya menetapkan arsitektur dan dokumentasi. Tidak ada kode game baru yang ditulis. Batch 1 belum dimulai.

Tiga lapisan: ENGINE (teknologi), GAME SYSTEMS (aturan), GAME CONTENT (data dan aset). Engine tidak boleh tahu nama karakter atau wilayah.
