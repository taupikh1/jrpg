# Naming Conventions

| Objek | Aturan | Contoh |
| --- | --- | --- |
| Berkas kelas/modul utama | PascalCase.js | `BattleManager.js` |
| Berkas fungsi/utilitas | camelCase.js | `clampValue.js` |
| Kelas | PascalCase | `ZoneManager` |
| Fungsi dan variabel | camelCase | `loadZone()` |
| Konstanta | UPPER_SNAKE_CASE | `MAX_PARTY_SIZE` |
| Event | `domain:aksi` | `quest:updated` |
| Data JSON dan aset | kebab-case | `slime-hijau.json` |
| ID konten | `tipe.kebab` | `npc.penjaga-toko` |
| Aset spritesheet | `<tipe>_<nama>_<aksi>_<WxH>.png` | `mon_slime-hijau_idle_24x24.png` |
| Kunci lokalisasi | `domain.id.field` | `npc.penjaga-toko.greeting` |

Tanpa spasi, tanpa huruf besar pada data dan aset, tanpa karakter non-ASCII pada path.
