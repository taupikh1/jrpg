# Paket Prompt Aset: Game Pixel 2D ala Ni no Kuni

Untuk generator gambar AI. Prompt ditulis dalam bahasa Inggris supaya hasilnya lebih akurat, penjelasan dalam bahasa Indonesia.

## 0. Cara pakai

1. Tempel STYLE BLOCK (bagian 2) di awal setiap prompt supaya gaya selalu konsisten.
2. Buat MC dulu. Kalau desainnya sudah cocok, upload sebagai gambar referensi untuk semua aset lain, lalu tambahkan: Match the art style, outline and pixel size of the attached image.
3. Selalu minta background magenta datar (#FF00FF) supaya gampang dihapus jadi transparan.
4. Generator AI tidak pernah benar-benar pixel-perfect. Minta piksel besar dan tebal, lalu kecilkan pakai nearest-neighbor (Piskel di browser atau Aseprite) dan rapikan manual kalau perlu.
5. Kalau sprite sheet berantakan, pecah jadi satu baris per gambar atau satu pose per gambar.
6. Kirim hasilnya ke Claude. Kode loader, animasi, dan tabrakan aku yang tulis.

## 1. Ukuran target

| Aset | Ukuran akhir | Generate (8x) |
| --- | --- | --- |
| Tile | 16x16 | 128x128 |
| MC dan NPC | 24x32 (cell 32x32) | cell 256x256 |
| Monster kecil | 24x24 sampai 32x32 | cell 256x256 |
| Monster besar | 40x40 | cell 320x320 |
| Bos | 96x96 | cell 768x768 |
| Portrait dialog | 64x64 | 512x512 |
| Ikon item dan skill | 16x16 | 128x128 |
| Panel UI | 24x24 (nine-slice) | 192x192 |

Karakter 24x32 itu kira-kira 1,5 tile tinggi, sama seperti prototype yang sekarang.

## 2. STYLE BLOCK dan NEGATIVE BLOCK

STYLE BLOCK (tempel di awal semua prompt):

```
Pixel art for a 2D top-down JRPG, 16-bit SNES-era look with a warm hand-painted storybook fantasy feel. Clean 1-pixel dark plum outline (#2a1d2e) around every sprite. Soft saturated pastel colors, limited palette (max 20 colors per sprite), flat cel shading with one shade tone and one highlight tone, light from the top-left. Chunky, crisp, hand-placed pixels of one consistent size. No anti-aliasing, no gradients, no blur, no noise, no dithering. Cute chibi proportions. Plain flat solid magenta (#FF00FF) background.
```

NEGATIVE BLOCK (tempel di akhir semua prompt):

```
Do not make: 3D render, vector art, smooth shading, painterly brush strokes, photo, mixed pixel sizes, glow or bloom, drop shadows, text, letters, watermark.
```

Untuk tile dan background, hapus kalimat soal outline dan magenta, lalu ganti dengan:

```
No outlines between tiles. Fill the whole canvas. Seamless and tileable.
```

## 3. MC (karakter utama)

MC DESCRIPTION (tempel di tempat tulisan \[MC\]; ubah sesuai selera):

```
a young boy hero, chibi proportions (head about 40% of body height), messy chestnut-brown hair with one small ahoge tuft, large round blue eyes with a white highlight, rosy cheeks, royal-blue tunic with a golden-yellow belt, red scarf with a trailing tail, small tan leather backpack, dark navy trousers, brown boots
```

### 3.1 Design sheet (buat ini paling pertama)

```
[STYLE BLOCK] Character design sheet of [MC]. Show the same character in 4 views side by side on one row: front, back, right side, three-quarter front. Same size, same ground line, evenly spaced, full body, standing idle pose, large clean pixels. [NEGATIVE BLOCK]
```

### 3.2 Walk cycle

Kiri tidak perlu dibuat, nanti dibalik lewat kode.

```
[STYLE BLOCK] Sprite sheet of [MC], walk cycle. Grid of 3 rows x 4 columns with equal square cells. Row 1: walking facing down (toward the camera). Row 2: walking facing up (away from the camera). Row 3: walking facing right. 4 frames per row: contact, passing, contact with the opposite leg, passing. Character stays centered in each cell with feet on the same baseline. Consistent size and colors in every frame. [NEGATIVE BLOCK]
```

### 3.3 Idle dan emote

```
[STYLE BLOCK] Sprite sheet of [MC]. Row 1: idle facing down, 2 frames (slow breathing, then a blink). Row 2: happy jump, 4 frames. Row 3: surprised with a small exclamation mark above the head, 2 frames. Row 4: sleeping sitting down, 2 frames. Equal square cells, same baseline. [NEGATIVE BLOCK]
```

### 3.4 Aksi dan pertarungan

```
[STYLE BLOCK] Sprite sheet of [MC] holding a short adventurer's sword. Row 1: sword slash facing down, 4 frames (wind-up, swing, impact, recover). Row 2: sword slash facing up, 4 frames. Row 3: sword slash facing right, 4 frames. Row 4: hurt 2 frames, knocked out 3 frames, victory pose 2 frames. Equal square cells, same baseline, same size. [NEGATIVE BLOCK]
```

### 3.5 Portrait dialog

```
[STYLE BLOCK] Dialogue portrait bust of [MC], facing slightly right, in a 3x2 grid of 6 expressions: neutral, happy, sad, angry, surprised, determined. Same pose and framing, only the face changes. Slightly more detail than the field sprite but the same pixel size. [NEGATIVE BLOCK]
```

### 3.6 Familiar (teman kecil yang mengikuti MC)

```
[STYLE BLOCK] Sprite sheet of an original tiny round forest spirit companion, cream and soft-orange fur, a green leaf on its head, big sparkling eyes, small fox-like ears, floating. Row 1: idle float, 4 frames. Row 2: flying forward (down, up, right), 3 frames. Row 3: cheering 3 frames. Cell 32x32 look. [NEGATIVE BLOCK]
```

## 4. NPC

Template NPC diam (3 arah berdiri plus idle):

```
[STYLE BLOCK] Sprite sheet of an NPC: [NPC DESCRIPTION]. Same chibi proportions, outline and cell size as the hero sprite. Row 1: standing facing down, up, right (3 cells). Row 2: idle facing down, 2 frames. [NEGATIVE BLOCK]
```

Template NPC yang berjalan: pakai prompt walk cycle di 3.2, ganti \[MC\] dengan deskripsi NPC.

Daftar \[NPC DESCRIPTION\]:

1. Shopkeeper: a round friendly middle-aged woman, green apron, hair in a bun, coin pouch on the belt
2. Village elder: an old man with a long white beard, purple robe, wooden staff, tiny round glasses
3. Blacksmith: a broad man with soot on his cheek, leather apron, red headband, big hammer
4. Innkeeper: a cheerful man with a mustache, white shirt, rolled sleeves, tray holding a mug
5. Healer: a young woman, white and teal robe, leaf hair clip, small lantern staff
6. Town guard: light silver armor, helmet with a red plume, short spear
7. Village kid: a small child, big yellow hat, wooden toy sword, gap-toothed grin
8. Traveling merchant: huge backpack stacked with goods, striped scarf, goggles on the forehead
9. Fisher: straw hat, fishing rod over the shoulder, bucket in hand
10. Mysterious witch: pointed hat with a star, long purple cape, a black cat at her feet

## 5. Monster

Template:

```
[STYLE BLOCK] Monster sprite sheet: [MONSTER]. Cute but clearly hostile, front-facing with a slight view from above. Row 1: idle, 2 frames. Row 2: move, 4 frames. Row 3: attack, 3 frames (wind-up, strike, recover). Row 4: hurt 1 frame, then defeated 3 frames (shrinks and bursts into small star sparkles). Equal cells of [SIZE], same baseline. [NEGATIVE BLOCK]
```

Daftar \[MONSTER\] dan \[SIZE\]:

1. Green slime with a shiny highlight and a tiny sprout on top (24x24)
2. Mushroom walker, red-spotted cap, stubby legs, grumpy eyes (24x28)
3. Cave bat, round purple body, big ears, small fangs (24x24)
4. Wolf pup, grey fur, oversized paws, bared teeth (32x24)
5. Thorn bud, a carnivorous flower bud with leaf arms and a pink bloom (24x28)
6. Rock golem, mossy stone body, glowing amber eyes, chunky fists (40x40)
7. Lantern ghost, a floating ghost holding a small blue flame lantern (24x28)
8. Armored beetle, shiny teal shell, curved horn (32x24)

Bos:

```
[STYLE BLOCK] Boss sprite sheet: the Ancient Tree Guardian, a giant mossy tree with a carved wise-but-angry face, thick root arms, glowing amber eyes, flowers and mushrooms growing on its branches. Row 1: idle, 4 frames. Row 2: ground slam attack, 5 frames. Row 3: spinning branch attack, 4 frames. Row 4: enraged form with red glowing eyes, 4 frames. Row 5: defeated, 4 frames (leaves scatter and it crumbles). Equal cells of 96x96 look. [NEGATIVE BLOCK]
```

Bos kedua (opsional): Stone Dragon, naga batu di gua kristal, ganti deskripsi di prompt yang sama.

## 6. Tempat dan lingkungan

Untuk semua bagian ini pakai versi STYLE BLOCK khusus tile bila hasilnya berupa tile.

### 6.1 Tileset luar ruangan

```
[STYLE BLOCK for tiles] Top-down 3/4 RPG tileset sheet on a strict 16x16 pixel grid, 8 columns x 6 rows. Include: 3 grass variants (small flowers and tufts), dirt path center plus all edge and corner transitions to grass, water center plus shoreline edges and corners, sand, stone cobble path, low cliff edge with a shadow, dark forest ground. Warm lush storybook colors. [NEGATIVE BLOCK]
```

### 6.2 Pohon dan properti

```
[STYLE BLOCK] Sheet of outdoor props for a top-down JRPG, each on its own cell: 3 types of round-canopy trees, pine tree, bush, flower patch, tall grass, rock, mossy log, wooden fence segments, signpost, lamp post, stone well, barrels, crates, haystack, treasure chest closed and open, campfire with 3 animation frames. Same lighting and outline. [NEGATIVE BLOCK]
```

### 6.3 Bangunan desa

```
[STYLE BLOCK] Sheet of village buildings, front-facing with a slight view from above, cozy fairytale style: small cottage in two roof colors, item shop with an awning, inn with a hanging sign (no text), blacksmith with a chimney and anvil, small shrine, windmill, town gate, castle gate. Each building has a clear door that is readable as an entrance. [NEGATIVE BLOCK]
```

### 6.4 Interior

```
[STYLE BLOCK for tiles] Interior tileset on a 16x16 grid: wooden floor, stone floor, plaster wall with a top edge, window, door, stairs, plus furniture props: bed, table, chairs, bookshelf, counter, stove, rug, potted plant, barrel, hanging lamp. Warm cozy lighting. [NEGATIVE BLOCK]
```

### 6.5 Gua dan dungeon

```
[STYLE BLOCK for tiles] Cave and dungeon tileset on a 16x16 grid: stone floor, rock wall with top edges and corners, glowing blue crystals, torch with 3 flame frames, wooden door, locked door, stairs down and up, pressure plate, spikes, cracked wall, water pool. Moody but still colorful. [NEGATIVE BLOCK]
```

### 6.6 Background pertarungan dan langit

```
[STYLE BLOCK for backgrounds] Horizontal battle background, 320x180 look: sunlit forest clearing with layered parallax-ready layers (sky and clouds, far trees, near trees, ground). Provide each layer on a separate row. Seamless horizontally. [NEGATIVE BLOCK]
```

Ulangi dengan ganti deskripsi: cave with crystals, snowy field, desert ruins.

### 6.7 Peta dunia (opsional)

```
[STYLE BLOCK for tiles] Overworld map tileset on a 16x16 grid: ocean, shallow water, beach, grassland, forest, mountains, snow, desert, road, bridge, plus map icons: town, castle, cave entrance, ruins, dock, signpost. Simplified shapes readable from far away. [NEGATIVE BLOCK]
```

## 7. UI dan menu

Jangan minta AI membuat teks. Huruf dan angka nanti kutulis lewat kode memakai font pixel (misalnya Pixelify Sans atau Press Start 2P).

### 7.1 Panel dan dialog

```
[STYLE BLOCK for UI] Pixel art UI kit for a fantasy JRPG with a parchment-and-wood storybook theme: dialogue box with a separate name plate and a small bouncing next-arrow, menu panel frame designed for nine-slice (clean corners and edges), tabs (selected and unselected), buttons (normal, hovered, pressed, disabled), item slot (empty and selected), hand-shaped cursor, scrollbar. No text. [NEGATIVE BLOCK]
```

### 7.2 HUD

```
[STYLE BLOCK for UI] HUD kit: hero portrait frame, HP bar (red) and MP bar (blue) with empty, full, and frame parts, heart icons (full, half, empty), coin icon, mini-map frame, quest marker arrow, small buff and debuff status icons (poison, sleep, burn, shield, speed). No text. [NEGATIVE BLOCK]
```

### 7.3 Ikon item dan skill (16x16)

```
[STYLE BLOCK] Icon sheet, 16x16 look, 8 columns x 6 rows, each icon on its own cell: potions (red, blue, green), herb, mushroom, apple, bread, key, coin, gem, short sword, bow, staff, shield, helmet, boots, scarf, ring, amulet, map, scroll, pouch, backpack, wooden shield, fire spell, ice spell, heal spell, wind spell, slash skill, dash skill. Strong readable silhouettes. [NEGATIVE BLOCK]
```

### 7.4 Layar judul

```
[STYLE BLOCK for backgrounds] Title screen illustration, 16:9: a small boy hero with a red scarf seen from behind, standing on a hill overlooking a fairytale valley with a village and a giant glowing tree at sunset, soft drifting clouds. Leave the upper third empty for the game logo. No text. [NEGATIVE BLOCK]
```

### 7.5 Kontrol sentuh (HP)

```
[STYLE BLOCK for UI] Mobile touch controls in pixel art: translucent virtual joystick (base and knob), round action buttons A and B (normal and pressed), pause button, inventory button. No text. [NEGATIVE BLOCK]
```

## 8. Efek (FX)

```
[STYLE BLOCK] Effects sprite sheet, each effect as a row of 4 to 6 frames: sword slash arc, hit spark, magic circle appearing, heal sparkles rising, level-up burst, dust puff, water splash, fire burst, falling leaves, small star sparkle pop. Bright readable shapes. [NEGATIVE BLOCK]
```

## 9. Urutan kerja yang disarankan

1. STYLE BLOCK dan design sheet MC (3.1), sampai desainnya cocok.
2. Walk cycle MC (3.2), lalu kirim ke Claude untuk dites di game.
3. Tileset luar ruangan (6.1) dan properti (6.2).
4. Panel dialog dan HUD (7.1, 7.2).
5. NPC desa (bagian 4) dan bangunan (6.3).
6. Monster pertama (slime, jamur, serigala) dan efek pukulan (bagian 5, 8).
7. Aksi MC (3.4) dan portrait (3.5).
8. Interior, gua, bos, ikon, layar judul, peta dunia.

## 10. Kalau hasilnya jelek

- Piksel tidak seragam atau terlalu halus: tambahkan large chunky pixels, strictly no anti-aliasing, lalu kecilkan dengan nearest-neighbor.
- Desain berubah antar frame: generate satu baris per gambar dan upload design sheet sebagai referensi.
- Karakter bergeser antar cell: tambahkan same baseline, centered in each cell, atau rapikan manual di Piskel.
- Warna keluar dari palet: tambahkan max 20 colors, atau kurangi warna di editor.
- Background tidak datar: tambahkan exactly #FF00FF flat background, no shadow on the ground.
