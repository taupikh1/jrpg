# Pemetaan ID Karakter: runtime dan Character Bible

Status: APPROVED (D-017). Pemetaan `kael` ditambahkan pada B15; ID runtime `orin` dan `mira` tetap tidak berubah.

## Aturan
- ID runtime adalah ID utama gameplay, `progression.js`, battle, dan save. ID yang saat ini aktif/terdaftar: `orin`, `mira`, `kael`, `iven`, dan `tavi`.
- ID Character Bible (`character_*`) dipakai di dokumen narasi dan `CONTENT_SCHEMA.md`.
- Penyatuan ID di masa depan wajib: (1) memakai alias aman, sehingga ID lama tetap dikenali; (2) migrasi save dengan versi baru; (3) tes kompatibilitas mundur yang memuat fixture save lama.
- Tidak boleh mengganti ID runtime secara langsung.

## Pemetaan saat ini

| ID runtime | ID Character Bible | Nama | Lokasi runtime | Catatan |
|---|---|---|---|---|
| `orin` | `character_orin_vale` | Orin Vale | `content/characters/progression.js` | Karakter selalu aktif sejak awal |
| `mira` | `character_mira_solenne` | Mira Solenne | `content/characters/progression.js` | Bergabung setelah `ch1_mira_follow` |
| `kael` | `character_kael_rowan` | Kael Rowan | `content/characters/progression.js` | Karakter ketiga roster; direkrut melalui dialog pembuka Chapter 6 dengan flag `ch6_kael_joined` |
| `iven` | `character_iven_marr` | Iven Marr | `content/characters/progression.js` | Karakter keempat; kerangka rekrut Chapter 7 dengan flag `ch7_iven_joined` |
| `tavi` | `character_tavi_brindle` | Tavi Brindle | `content/characters/progression.js` | Karakter kelima; kerangka rekrut Chapter 8 dengan flag `ch8_tavi_joined` |

Karakter lain yang belum memiliki ID runtime: `character_sera_nhal`, `character_neris_avel`, dan `character_bram_alder`. Pemetaannya ditentukan saat karakter itu diimplementasikan pada batch berikutnya.

## Catatan
- Sumber: `docs/narrative/CHARACTER_BIBLE.md` dan `content/characters/progression.js` (diperiksa di Batch 10).
- NPC (`npc_*`) dan ID lain di `BELLHAVEN_NPC_ROSTER.md` bukan karakter party dan tidak termasuk pemetaan ini.
