# Desain: Jalan Menuju Bellhaven

## Identitas zona
- **ID stabil:** `road_bellhaven`
- **Nama tampilan:** Jalan Menuju Bellhaven
- **Region:** `region_bellhaven`
- **Subregion:** `subregion_bellhaven_approach`
- **Tipe:** travel corridor / approach road
- **Bab:** chapter_03 (pendekatan; kota penuh belum diimplementasi)

## Geografi
Koridor debu barat→timur antara tepi Hutan Berbisik dan pandangan jauh atap Bellhaven.  
Iklim sedang, vegetasi semak + bebatuan, jalur utama di tengah.

## Koneksi
- Barat: `forest` (spawn `from_forest`)
- Timur: **batas naratif** — pemandangan kota, belum ada zona kota (hindari kota palsu)

## Konten
- NPC: Lyn (penjaga jalan), Ode (pedagang)
- Interactable: penanda mil, gerobak patah, pemandangan gerbang
- Quest opsional: `quest_bunga_jalan` (kumpulkan 3 Bunga Jalan)
- Encounter: pemicu ambush thorn/serigala (BattleManager demo)

## Bahasa
Semua teks pemain dalam Bahasa Indonesia alami.
