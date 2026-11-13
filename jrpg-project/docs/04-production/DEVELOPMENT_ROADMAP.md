# Development Roadmap

Setiap batch: tujuan dan scope, dependency, file, acceptance dan exit, test plan, risiko. Batch hanya boleh dimulai setelah dependency-nya lulus gate. Urutan tidak punya dependensi melingkar (diperiksa manual: dependency selalu bernomor lebih kecil).

| Batch | Tujuan dan scope | Dependency | File utama | Acceptance dan exit | Test plan | Risiko |
|---|---|---|---|---|---|---|
| 0 | Arsitektur dan dokumentasi | - | docs/, konfigurasi root | Dokumen konsisten, validator proyek lulus | validate-project | Dokumen melenceng dari kenyataan |
| 1 | Core Engine: loop, scene, EventBus, renderer, input, config, logger, StateManager, core/ports, adapter platform, src/main.js | 0 | src/core, core/ports, engine/rendering, input, camera, platform/browser, src/main.js, tests/unit, script `npm test` | Scene Boot jalan di Canvas; D-009 terbukti (480x270, skala bilangan bulat, letterbox, resize, orientasi); jalan di subpath; input sentuh dan keyboard | `node --test`: GameLoop, SceneManager, EventBus, Input, konversi koordinat, tiap modul lain; manual iPhone Safari dan Android Chrome | Safari iOS canvas, audio, toolbar |
| 2 | Asset Pipeline dan generator | 0,1 | tools/*generator, asset-validator, assets/ | Aset lolos validator, gaya konsisten | validator + tinjau visual | Gaya AI tidak konsisten |
| 3 | Character dan NPC | 2 | entities/player, npc, party, content/characters | Karakter dari data, 4 arah, animasi jalan | unit data + visual | Skala sprite |
| 4 | Monster dan Boss assets | 2 | assets/monsters, bosses, content/creatures | Sheet idle, gerak, serang, kalah, bos 96x96 | validator + visual | Beban memori bos |
| 5 | Tileset dan Environment | 2 | assets/tilesets, engine/tilemap | Tileset luar, interior, gua; auto-edge | visual | Sambungan tile |
| 6 | Map Format dan Map Editor | 1,5 | data/schemas map, tools/map-editor | Peta dari JSON dimuat dan dirender, editor menyimpan JSON valid | unit + validator | Editor memakan waktu |
| 7 | Region dan Zone System | 1,6 | world/*, ZoneManager, content/world | Lazy load zona, transisi, spawn | integrasi + memori | Jeda saat transisi |
| 8 | Movement, Collision, Interaction | 1,7 | engine/collision, systems/exploration, interaction | Gerak, tabrakan, interaksi objek dari data | unit + gameplay | Tabrakan di sudut |
| 9 | Dialogue dan Narrative | 8 | narrative/DialogueManager, ui/dialogue | Dialog bercabang dari JSON, kotak dialog | unit + manual | Teks panjang di layar kecil |
| 10 | Quest dan Story Flags | 9 | QuestManager, FlagManager, ChapterManager | Quest berstatus, flag tersimpan di state | unit | Kompleksitas flag |
| 11 | Turn-based Battle Engine | 1,8 | systems/battle, scenes/BattleScene | Battle penuh lawan data, deterministik dengan seed | unit + simulasi | Rumus tidak seimbang |
| 12 | Enemy AI dan Boss mechanics | 11,4 | systems/enemy-ai | Pola AI, fase bos dari data | simulasi | Bos terlalu mudah/sulit |
| 13 | Party dan Progression | 11 | systems/party, character-progression | XP, level, kurva dari data | unit | Kurva |
| 14 | Inventory, Equipment, Items | 13 | systems/inventory, equipment, ui/inventory | Pakai, pasang, lepas item | unit + manual | Batas bobot UI |
| 15 | Skills, Magic, Elements | 11,13 | systems/skills, magic, elemental | Skill dan elemen dari data | unit | Kombinasi tak terduga |
| 16 | Economy, Shops, Crafting | 14 | systems/economy, shops, crafting | Toko dan resep dari data | unit | Inflasi ekonomi |
| 17 | Save, Load, Offline | 1,10,14 | systems/save, platform/storage, pwa | Save/migrasi/pemulihan lulus; offline berjalan | unit + offline + subpath | Eviction Safari, cache usang |
| 18 | UI, Audio, Mobile | 1,11 | ui/*, engine/audio, mobile-controls | Menu lengkap, audio setelah gesture, orientasi | manual perangkat nyata | Fragmentasi perangkat |
| 19 | Prologue dan Chapter 1 Vertical Slice | 3-18 | content/ prologue dan chapter 1 | Main dari judul sampai akhir bab 1 di mobile, offline, save | QA penuh slice | Integrasi lintas sistem |
| 20+ | Wilayah, cerita, chapter, dungeon, konten lanjutan | 19 | content/* | Per wilayah: validator + playtest | per konten | Scope creep |
| Final | Full QA, balancing, performa, offline, mobile, deploy | 20+ | tests/, RELEASE_CHECKLIST | Semua gate VERIFIED | QA menyeluruh | Regresi |
