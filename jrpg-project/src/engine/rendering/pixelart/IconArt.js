import { PixBuf } from './PixBuf.js';
import { C } from './Palette.js';

/** 16x16 item icons (UI). */
const PAINT = {
  herb(pb) {
    pb.line(8, 14, 8, 6, '#3d7b3f');
    for (const [x, y, dx] of [[8, 5, 0], [6, 7, -1], [10, 7, 1], [5, 10, -1], [11, 10, 1]]) {
      pb.ellipse(x, y, 2.2, 1.6, '#5b9a48');
      pb.set(x + dx, y - 1, '#86b95a');
    }
    pb.hline(6, 14, 5, '#8d6a3a');
    pb.set(8, 3, '#b4d374');
  },
  potion(pb, col = '#3f84c6', hi = '#aadff3') {
    pb.rect(6, 2, 4, 3, '#cfa66b');
    pb.hline(6, 2, 4, '#e8cf96');
    pb.rect(5, 5, 6, 2, '#d6d7e3');
    pb.ellipse(7.5, 10, 4.6, 4.2, '#d6d7e3');
    pb.ellipse(7.5, 10.4, 3.6, 3.4, col);
    pb.hline(5, 9, 5, hi);
    pb.set(5, 11, hi);
    pb.hline(5, 13, 5, '#14101e55');
  },
  drop(pb) {
    pb.ellipse(8, 10, 4, 4, C.c1);
    pb.rect(7, 3, 2, 3, C.c1);
    pb.rect(6, 6, 4, 2, C.c1);
    pb.set(6, 9, C.c3);
    pb.set(6, 10, C.c3);
    pb.vline(11, 10, 2, C.c0);
  },
  scroll(pb) {
    pb.rect(3, 4, 10, 9, '#f1e5c0');
    pb.hline(3, 4, 10, '#fffbe8');
    pb.rect(2, 3, 12, 2, '#cfa66b');
    pb.rect(2, 12, 12, 2, '#cfa66b');
    pb.hline(5, 7, 6, '#8a7a6a');
    pb.hline(5, 9, 5, '#8a7a6a');
    pb.set(11, 10, '#c24b49');
  },
  page(pb) {
    pb.rect(4, 2, 8, 12, '#fbf3dc');
    pb.vline(11, 3, 11, '#d8c898');
    pb.hline(4, 13, 8, '#c8b890');
    pb.hline(5, 4, 5, '#8a7a6a');
    pb.hline(5, 6, 6, '#8a7a6a');
    pb.hline(5, 8, 4, '#8a7a6a');
    pb.set(10, 11, '#c24b49');
  },
  card(pb) {
    pb.rect(3, 4, 10, 8, '#f1e5c0');
    pb.hline(3, 4, 10, '#fffbe8');
    pb.rect(4, 5, 8, 2, '#e0d0a0');
    pb.hline(4, 8, 6, '#8a7a6a');
    pb.hline(4, 10, 4, '#8a7a6a');
    pb.set(11, 11, '#c24b49');
  },
  shard(pb, pal = [C.c0, C.c1, C.c2, C.c3]) {
    pb.rect(6, 4, 4, 9, pal[1]);
    pb.rect(5, 5, 6, 6, pal[1]);
    pb.rect(7, 2, 2, 2, pal[2]);
    pb.hline(6, 3, 4, pal[2]);
    pb.vline(6, 4, 7, pal[3]);
    pb.vline(10, 6, 6, pal[0]);
    pb.hline(6, 13, 4, pal[0]);
    pb.set(12, 3, pal[3]);
    pb.set(3, 8, pal[2]);
  },
  flower(pb) {
    pb.vline(8, 8, 6, '#3d7b3f');
    pb.set(7, 11, '#5b9a48');
    pb.set(9, 10, '#5b9a48');
    for (const [x, y] of [[8, 4], [6, 6], [10, 6], [7, 7], [9, 7], [8, 3]]) pb.rect(x - 0, y, 1, 1, '#f1c94b');
    pb.rect(7, 5, 3, 3, '#f1c94b');
    pb.set(8, 6, '#c24b49');
  },
  wood(pb) {
    for (const [x, y, w] of [[2, 9, 12], [3, 6, 11], [4, 3, 9]]) {
      pb.rect(x, y, w, 3, '#a97b47');
      pb.hline(x, y, w, '#cfa66b');
      pb.hline(x, y + 2, w, '#6a4326');
      pb.rect(x + w - 1, y, 1, 3, '#e0c088');
    }
  },
  sword(pb, blade = '#b2b3c5', rust = false) {
    pb.line(12, 2, 4, 10, blade);
    pb.line(13, 3, 5, 11, rust ? '#8a6a52' : '#d6d7e3');
    pb.line(3, 9, 7, 13, '#a6701f');
    pb.line(2, 12, 4, 14, '#5a3a24');
    pb.set(3, 12, '#f1c94b');
    if (rust) { pb.set(9, 5, '#a8561f'); pb.set(7, 7, '#a8561f'); pb.set(11, 3, '#a8561f'); }
  },
  vest(pb) {
    pb.rect(4, 3, 8, 11, '#8a5a30');
    pb.rect(3, 3, 2, 4, '#8a5a30');
    pb.rect(11, 3, 2, 4, '#8a5a30');
    pb.rect(6, 3, 4, 3, '#14101e');
    pb.vline(8, 6, 8, '#5a3a24');
    pb.hline(4, 3, 8, '#b3784a');
    pb.set(7, 8, '#f1c94b');
    pb.set(9, 8, '#f1c94b');
    pb.hline(4, 13, 8, '#5a3a24');
  },
  bag(pb) {
    pb.ellipse(8, 10, 5, 4.5, '#a97b47');
    pb.rect(6, 4, 4, 3, '#a97b47');
    pb.hline(5, 6, 6, '#5a3a24');
    pb.hline(5, 5, 6, '#cfa66b');
    pb.set(8, 10, '#f1c94b');
  },
  key(pb) {
    pb.ellipse(5, 5, 3, 3, C.y1);
    pb.ellipse(5, 5, 1.2, 1.2, '#14101e');
    pb.rect(7, 7, 2, 6, C.y1);
    pb.line(8, 7, 12, 11, C.y1);
    pb.rect(10, 10, 3, 2, C.y1);
    pb.set(4, 3, C.y3);
  },
};

const BY_ID = {
  herb: 'herb',
  ether_drop: 'drop',
  ch2_elara_note: 'scroll',
  ch4_catalog_fragment: 'card',
  item_resonance_fragment: 'shard',
  guest_page: 'page',
  index_shard: 'shardGold',
  road_flower: 'flower',
  wood_scrap: 'wood',
  rusty_sword: 'swordRust',
  leather_vest: 'vest',
};

export function paintItemIcon(id, category) {
  const pb = new PixBuf(16, 16);
  const name = BY_ID[id];
  if (name === 'shardGold') PAINT.shard(pb, [C.y0, C.y1, C.y2, C.y3]);
  else if (name === 'swordRust') PAINT.sword(pb, '#a99a8a', true);
  else if (name) PAINT[name](pb);
  else if (category === 'consumable') PAINT.potion(pb);
  else if (category === 'key') PAINT.key(pb);
  else if (category === 'equipment') PAINT.sword(pb);
  else PAINT.bag(pb);
  pb.outline(C.ink);
  return pb;
}

export function paintHeart(full = true) {
  const pb = new PixBuf(9, 8);
  const c = full ? '#e0485a' : '#4a3a52';
  const rows = ['.xx...xx.', 'xxxx.xxxx', 'xxxxxxxxx', 'xxxxxxxxx', '.xxxxxxx.', '..xxxxx..', '...xxx...', '....x....'];
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch === 'x' && pb.set(x, y, c)));
  if (full) { pb.set(1, 1, '#ff9aa8'); pb.set(2, 1, '#ff9aa8'); }
  pb.outline(C.ink);
  return pb;
}
