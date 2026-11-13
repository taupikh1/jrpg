# Batch 9.3B — Experience, Level Progression & Character Growth: Implementation Report

**Project:** *THE ATLAS OF UNREMEMBERED STARS* (`jrpg-project`)
**Scope:** EXP rewards & distribution, character level progression, character-specific stat growth, level-gated skill progression, Level-Up & Status/Skill UI, progression SFX audio wiring, Save Schema v4 (`v3 -> v4` migration), and directly compatible gameplay bug fixes from audit.
**Status legend:** `COMPLETE`, `PARTIAL`, `BLOCKED`, `NOT TESTED`.

---

## 1. Pre-implementation Audit

- **Repository state:** Imported non-git workspace (`jrpg-project`); pre-existing Batch 9.3A report (`docs/batch9.3a/BATCH_9_3A_AUDIO_IMPLEMENTATION_REPORT.md`) and codebase inspected directly against actual source files.
- **Playable party members identified:**
  - `orin` (Orin) — selalu aktif sejak awal permainan.
  - `mira` (Mira) — bergabung ke dalam pertempuran setelah pemain menyetujui ajakannya di Ashwillow (`_ch1Flags.ch1_mira_follow`). Tidak ada karakter ketiga yang dapat dimainkan di Arc I (dan tidak ada karakter baru yang dibuat di batch ini).
- **Enemy & encounter definitions inspected:**
  - `content/enemies/arc_01.js`: `thorn_sprite` (`Sprite Duri`, HP 28, ATK 8, DEF 2, SPD 10, `exp: 6`, `gold: 4`).
  - `GameplayDemoScene`: satu encounter naskah `road_ambush` (2× `thorn_sprite`, total 12 EXP & 8 Gold + 1 `herb`) serta pemicu pertempuran debug `KeyB` (ketika `?debug=1`).
- **Pre-existing systems audited:** `CharacterStats` (`base` + `_mods`), `Equipment` (5 slot: `weapon`, `head`, `body`, `accessory1`, `accessory2`), `BattleManager`, `QuestLog`, `AudioEventBridge`, `SaveSchema` (sebelumnya v3), dan `GameplayDemoScene`.

---

## 2. Batch 9.3A Dependency & Review Bug Fixes

### Status Gate Batch 9.3A
- **Verdict:** Batch 9.3A lolos sebagai prasyarat progresi: arsitektur `AudioPort` -> `AudioManager` -> `AudioEventBridge` bersih, 46 aset audio tersedia (termasuk `exp_gain`, `level_up`, `stat_up`, `skill_unlock`), dan seluruh `483/483` tes Batch 9.3A beserta validatornya bersih pada baseline awal.
- Catatan non-audio carry-over dari Batch 9.2 yang tercatat di laporan 9.3A tetap dicatat secara jujur dan tidak menyentuh ranah audio.

### Perbaikan Bug & Celah yang Ditangani Langsung di Batch 9.3B
1. **`BattleManager` tidak mengklaim/mendistribusikan hadiah EXP & potensi klaim ganda:** `BattleManager` kini melacak `result` (`'victory'|'defeat'|'escaped'`) dan `rewardsClaimed`, menghitung default `exp`/`gold` dari data musuh, dan membatasi klaim lewat `claimVictoryRewards()` (sekali saja, khusus kemenangan).
2. **Celah farming pertempuran debug (`KeyB`) & `road_ambush` berulang:** Pemicu debug `KeyB` kini dipaksa memakai `{ grantRewards: false, source: 'debug' }` sehingga menghasilkan `0 EXP / 0 Gold / 0 item`. Ambush `road_ambush` menyimpan flag persisten `_ch3Flags.ch3_road_ambush_cleared` agar tidak muncul kembali setelah dimuat ulang.
3. **Sub-menu `Skill` & `Item` di pertempuran tidak bisa diakses lewat UI (`_battleSub`):** Ditambahkan sub-menu `'skill'` (memakai daftar skill terbuka milik aktor aktif) dan `'item'` (mendukung `herb` dan `ether_drop` untuk memulihkan MP di tengah pertarungan).
4. **Kalah bertarung tidak memulihkan party dengan aman:** Kalah (`defeat`) kini memulihkan HP Orin dan Mira (jika sudah bergabung) ke `50% maxHp` (minimal 1) dan memindahkan pemain ke `_safePosition()` agar tidak soft-lock dengan `0 HP`.
5. **Perlengkapan terpasang hilang saat Save & Continue:** Diperbaiki pada `_doLoad()` — item yang sudah terpasang tidak lagi ada di `inventory.slots` karena dipindahkan ke `equipment.equipped[slot]`, sehingga `_doLoad()` sebelumnya gagal memasang kembali item terpasang (`leather_vest`) bila tidak ada duplikatnya di inventaris. Kini `_doLoad()` memulihkan slot terpasang dan modifiernya langsung dari `ItemRegistry` setelah `ProgressionSystem.importState()` menyinkronkan stat dasar level.
6. **UI Inventaris belum menampilkan slot baju (`body`) & melepas armor:** `_drawInventory` kini menampilkan `Senjata: ... | Baju: ...` dan `KeyU` kini dapat melepas `weapon` maupun `body`.
7. **Gulir Catatan Quest >4 entri:** `_drawQuest` kini menghitung jendela gulir `start = Math.max(0, this._questIndex - visible + 1)` sehingga quest ke-5 dan seterusnya tetap terlihat saat digulir.
8. **`QuestLog.complete(questId)` yang hilang untuk efek dialog `completeQuest`:** Ditambahkan di `QuestLog.js` agar efek dialog penyelesaian quest tidak lagi diam-diam terlewat.

---

## 3. EXP System, Formula, and Curve Evaluation (Arc I Ch 1–5)

- **Lokasi konfigurasi:** `content/characters/progression.js`
- **Batas maksimum level:** `MAX_LEVEL = 10`
- **Formula EXP ke level berikutnya:**
  ```js
  expToNextLevel(level) = 12 + 10 * (level - 1) + 6 * (level - 1)^2
  ```
  *(Mengembalikan `0` bila `level >= MAX_LEVEL`)*

| Transisi Level | EXP Dibutuhkan | Kumulatif Total EXP |
|---|---:|---:|
| Lv 1 -> Lv 2 | 12 | 12 |
| Lv 2 -> Lv 3 | 28 | 40 |
| Lv 3 -> Lv 4 | 56 | 96 |
| Lv 4 -> Lv 5 | 96 | 192 |
| Lv 5 -> Lv 6 | 148 | 340 |
| Lv 6 -> Lv 7 | 212 | 552 |
| Lv 7 -> Lv 8 | 288 | 840 |
| Lv 8 -> Lv 9 | 376 | 1.216 |
| Lv 9 -> Lv 10 | 476 | 1.692 |

### Evaluasi terhadap Konten Nyata Bab 1–5
- Di Arc I saat ini, encounter naskah yang tersedia di permainan normal adalah `road_ambush` di Jalur Bellhaven (2× `thorn_sprite`, masing-masing `6 EXP` = total **12 EXP**).
- Memilih `base = 12` membuat kemenangan pertama pada encounter nyata `road_ambush` langsung membawa Orin dan Mira dari **Level 1 -> Level 2** tanpa perlu farming tambahan.
- Kenaikan kuadratik (`+10*step + 6*step^2`) menjaga level menengah (Lv 3–6, tempat skill lanjutan `mira_light_bind` di Lv 3 dan `orin_surge` di Lv 4 berada) tetap terjangkau ketika encounter/boss Bab 2–5 ditambahkan nanti, sekaligus mencegah lonjakan instan ke Lv 10.

---

## 4. EXP Distribution Policy

Ditetapkan secara eksplisit di `ProgressionSystem.awardBattleExp()`:
- **Anggota aktif yang hidup (`side === 'player'` dan `stats.isAlive`):** masing-masing menerima **100%** total EXP encounter.
- **Anggota yang tumbang (`hp <= 0`) saat kemenangan:** menerima **0 EXP**.
- **Karakter yang belum direkrut/tidak aktif di battle (mis. Mira sebelum `ch1_mira_follow`):** menerima **0 EXP** dan tetap diinisialisasi aman di Level 1 saat bergabung.
- **Ekstensibilitas:** Daftar karakter didefinisikan berbasis kunci ID di `CHARACTER_PROGRESSION` sehingga penambahan anggota baru di chapter mendatang tidak memerlukan desain ulang mesin progresi.

---

## 5. Character-Specific Stat Growth

Didefinisikan di `CHARACTER_PROGRESSION` (`content/characters/progression.js`):

| Karakter | Peran | Stat Awal (Lv 1) | Pertumbuhan / Level | Profil Lv 10 (Base) |
|---|---|---|---|---|
| **Orin** | Serba bisa · Fisik & Resonansi | HP 60, MP 25, ATK 12, DEF 6, MATK 8, MDEF 4, SPD 12 | +8 HP, +3 MP, +2 ATK, +2 DEF, +1 MATK, +1 MDEF, +1 SPD | HP 132, MP 52, ATK 30, DEF 24, MATK 17, MDEF 13, SPD 21 |
| **Mira** | Penyembuh · Sihir Cahaya | HP 48, MP 32, ATK 9, DEF 5, MATK 14, MDEF 6, SPD 14 | +5 HP, +5 MP, +1 ATK, +1 DEF, +3 MATK, +2 MDEF, +2 SPD | HP 93, MP 77, ATK 18, DEF 14, MATK 41, MDEF 24, SPD 32 |

### Aturan Keselamatan Stat
- `ProgressionSystem.syncStats(id, stats)` hanya memperbarui `stats.base`, mempertahankan seluruh modifier aktif di `CharacterStats._mods` (seperti `Pedang Karat` +5 ATK atau `Rompi Kulit` +3 DEF).
- **Tidak ada auto-heal penuh saat naik level:** `hp` dan `mp` saat ini tetap pada nilainya sebelum level up (hanya di-clamp ke `[0, maxHp]` / `[0, maxMp]`).

---

## 6. Skill Progression & Battle Enforcement

| Karakter | Level Buka | ID Skill | Nama Tampilan | Biaya & Efek |
|---|---:|---|---|---|
| **Orin** | 1 | `ember` | Bara | 4 MP · `attack` (`fire`, power 14) |
| **Orin** | 2 | `minor_heal` | Pemulihan Kecil | 5 MP · `heal` (power 20) |
| **Orin** | 4 | `orin_surge` | Dentuman Gema | 7 MP · `attack` (`resonance`, power 18) |
| **Mira** | 1 | `mira_mend` | Jahitan Lembut | 6 MP · `heal` (power 28) |
| **Mira** | 1 | `mira_spark` | Percikan | 3 MP · `magical` (`light`, power 11) |
| **Mira** | 3 | `mira_light_bind` | Simpul Cahaya | 5 MP · `magical` (`light`, power 15) |

- **Penegakan nyata di pertempuran:** `GameplayDemoScene._battleParty()` hanya memasukkan skill dari `progression.getUnlockedSkillObjects(id)`. `BattleManager.commandSkill()` memverifikasi kepemilikan skill **sebelum** memotong MP (`{ ok: false, reason: 'skill_locked' }`). Duplikasi unlock dicegah di `grantExp()` dan disanitasi di `importState()`.
- **Kesenjangan jujur terkait efek status:** `BattleManager` belum memiliki mesin efek status (buff/debuff/stun), sehingga `Simpul Cahaya` diimplementasikan sebagai serangan sihir cahaya terfokus (tidak mengklaim efek ikat/stun yang belum ada di mesin battle).

---

## 7. Level-Up & Status/Skill UI (Bahasa Indonesia)

- **World HUD:** Menampilkan `Lv.<N> · Gold <G>` bersama bar HP/MP dan quest aktif.
- **Layar Status & Skill (`Status & Skill`):** Dapat dibuka lewat tombol `KeyC` atau baris **Status & Skill** pada Menu Jeda. Menampilkan tab `< Orin (1/2) >` (saat Mira bergabung), level, bar/angka EXP, seluruh stat (`HP`, `MP`, `ATK`, `DEF`, `MATK`, `MDEF`, `SPD`, `CRIT`) lengkap dengan bonus perlengkapan (`+N`), ringkasan perlengkapan/peran, serta daftar skill terbuka dan skill terkunci (`[Terkunci Lv.N] ...`).
- **Layar Ringkasan & Naik Level (`NAIK LEVEL!`):** Setelah layar kemenangan pertempuran (`+EXP  +Gold`, siapa saja yang naik level), kartu `NAIK LEVEL!` ditampilkan berurutan untuk setiap anggota party yang naik level beserta kenaikan stat dan skill baru yang terbuka, sebelum kembali ke eksplorasi dunia.
- **Sub-menu Battle:** Menu perintah `Serang / Skill / Item / Bertahan / Kabur` kini membuka daftar skill karakter aktif dan daftar item konsumsi (`Herb Hutan`, `Tetes Eter`), lengkap dengan pemilihan target sekutu untuk heal/item atau musuh untuk serangan.

---

## 8. Audio Integration

`src/engine/audio/AudioEventBridge.js` kini berlangganan event progresi yang dipancarkan `ProgressionSystem`:
- `progression.exp_gained` (bila `amount > 0`) -> `exp_gain`
- `progression.level_up` -> `level_up`
- `progression.stat_up` -> `stat_up` (delay `0.18s`)
- `progression.skill_unlock` -> `skill_unlock` (delay `0.35s`)
- Hadiah item/gold saat menang pertempuran memutar SFX `reward` (`delay: 0.25s`), dan seluruh ID skill baru (`minor_heal`, `orin_surge`, `mira_light_bind`) dipetakan di `SKILL_KIND_BY_ID`.

---

## 9. Save System & Backward Compatibility (`SAVE_VERSION = 4`)

- `SaveSchema.js`: `SAVE_VERSION = 4`, field `progression` menyimpan `{ level, exp, unlockedSkills }` per karakter.
- `SaveMigrations.js`: menambahkan migrasi berurutan `v3 -> v4` sehingga save lama v1, v2, dan v3 otomatis bermigrasi ke v4 dengan nilai awal yang valid.
- `SaveValidator.js` & `ProgressionSystem.importState()`: memvalidasi tipe `progression`, membatasi level `[1..MAX_LEVEL]`, membuang EXP berlebih/negatif, mencegah skill masa depan terbuka pada level yang terlalu rendah, dan menghapus duplikasi skill dari payload korup.
- Urutan pemulihan `_doLoad()` memulihkan inventaris -> membersihkan modifier equipment sementara -> mengimpor progresi & stat dasar level -> memasang kembali equipment dari `d.equipment` -> meng-clamp HP/MP saat ini -> memulihkan quest, flag Bab 1–5, dan zona.

---

## 10. Automated Tests & Validators

- **`npm test`:** **504 / 504 tes lulus** (`131 suites`, `0 fail`, `0 skipped`; naik dari 483 pada Batch 9.3A).
  - Cakupan baru di `tests/unit/gameplay/Progression.test.js` (kurva EXP, profil Orin vs Mira, multi-level jump, max-level clamp, pelestarian modifier perlengkapan & bebas auto-heal, distribusi EXP KO/aktif, sanitasi save korup, skill-locking tanpa pengurangan MP, klaim hadiah sekali, nol hadiah saat kabur/kalah/debug `KeyB`, flag anti-farming `ch3_road_ambush_cleared`, battle skill/item `ether_drop`, defeat safe recovery, unequip baju, `QuestLog.complete`, Save & Continue round-trip v4, scroll Catatan Quest >4 entri).
  - Ekstensi di `tests/unit/audio/AudioEventBridge.test.js`, `tests/unit/persistence/Save.test.js`, `tests/unit/ui/ScreenLayout.test.js` (memastikan `status`, `levelup`, sub-menu `battle`, dan layar hasil berada dalam kanvas 320×240 tanpa terpotong), serta pembaruan indeks baris tergeser yang terverifikasi pada `tests/unit/gameplay/PauseMenu.test.js` dan `tests/unit/gameplay/PartyBattle.test.js`.
- **`npm run check`:** `OK: 474 berkas diperiksa, 196 modul ES (di luar legacy) dianalisis` (`0 error`).
- **`npm run check:narrative`:** `NARRATIVE VALIDATOR OK`.
- **`npm run check:world`:** `WORLD VALIDATOR OK` (`Regions: 12; playable zones: 10`).

---

## 11. Browser & Runtime Verification Status

- **Server HTTP lokal (`server.js`, port 3000):** terverifikasi aktif dan mengembalikan HTTP `200 OK` untuk aplikasi.
- **Headless Browser / Playwright visual run:** **`NOT TESTED`** di sesi ini karena sandbox runtime saat ini tidak memiliki biner Chromium/Playwright (`NO_BROWSER`) dan penambahan dependency eksternal besar tidak diizinkan dalam ruang lingkup batch. Verifikasi tata letak kanvas dijalankan secara deterministik melalui `ScreenLayout.test.js` pada rendering context perekam 320×240.

---

## 12. Known Limitations & Honest Gaps

1. **Encounter musuh Arc I terbatas:** Konten saat ini hanya memiliki `thorn_sprite` dan satu pemicu tempur naskah (`road_ambush`), sehingga level 3–10 dirancang dan diverifikasi melalui sistem dan tes unit/simulasi sambil menunggu penambahan encounter/boss pada batch konten berikutnya.
2. **Belum ada sistem status effect di `BattleManager`:** Skill disusun berbasis `attack`, `magical`, dan `heal`.
3. **Pengujian browser interaktif & perangkat seluler nyata:** Belum dijalankan langsung pada batch ini (lihat Bagian 11).
4. **Carry-over Batch 9.2:** Catatan audit naskah historis di laporan sebelumnya tidak diubah.

---

## 13. Classification Summary

| Requirement | Status | Notes |
|---|---|---|
| Pre-implementation audit & 9.3A gate check | COMPLETE | Audit sumber aktual + temuan bug diperbaiki |
| EXP rewards from enemy definitions & single-claim guard | COMPLETE | `BattleManager.claimVictoryRewards()` + `road_ambush` |
| No EXP on defeat/escape/debug `KeyB` & non-farmable ambush | COMPLETE | `grantRewards: false` & `ch3_road_ambush_cleared` |
| Explicit EXP distribution policy (Orin, Mira, extensible) | COMPLETE | 100% aktif hidup, 0 KO/belum bergabung |
| Level progression, multi-level jump & MAX_LEVEL cap | COMPLETE | `MAX_LEVEL = 10`, formula kuadratik terukur |
| Character-specific stat growth (Orin vs Mira, modifier-safe, no auto-heal) | COMPLETE | Terintegrasi `CharacterStats` & `Equipment` |
| Level-gated skill progression & battle enforcement | COMPLETE | Sub-menu Skill/Item + guard `skill_locked` |
| Level-Up notification UI & Status/Skill screen (Bahasa Indonesia) | COMPLETE | `Status & Skill` (`KeyC`/Pause) + `NAIK LEVEL!` |
| Progression SFX audio wiring | COMPLETE | `exp_gain`, `level_up`, `stat_up`, `skill_unlock` |
| Save Schema v4 + v3->v4 migration + equipment reload fix | COMPLETE | Sanitasi payload korup + round-trip teruji |
| Automated unit/integration tests & validators | COMPLETE | `504/504` tests + `check` / `narrative` / `world` OK |
| Headless Chromium / Mobile real-device browser test | NOT TESTED | `NO_BROWSER` di sandbox; diverifikasi via `ScreenLayout` Node |

---

## 14. Files Added & Changed

**Added:**
- `content/characters/progression.js`
- `src/engine/gameplay/progression/ProgressionSystem.js`
- `tests/unit/gameplay/Progression.test.js`
- `docs/batch9.3b/BATCH_9_3B_PROGRESSION_REPORT.md`

**Changed:**
- `src/engine/gameplay/battle/BattleManager.js`
- `src/engine/gameplay/quests/QuestLog.js`
- `src/engine/audio/AudioEventBridge.js`
- `src/engine/persistence/SaveSchema.js`
- `src/engine/persistence/SaveMigrations.js`
- `src/engine/persistence/SaveManager.js`
- `src/engine/persistence/SaveValidator.js`
- `src/scenes/GameplayDemoScene.js`
- `content/ui/player-text.js`
- `tests/unit/audio/AudioEventBridge.test.js`
- `tests/unit/persistence/Save.test.js`
- `tests/unit/ui/ScreenLayout.test.js`
- `tests/unit/gameplay/PartyBattle.test.js`
- `tests/unit/gameplay/PauseMenu.test.js`
- `CHANGELOG.md`

**Not changed:** `package.json`, `tools/validate-project.mjs`, skrip cerita/dialog utama, audio assets (`assets/audio/`), kontrol sentuh, tidak ada musik latar.
