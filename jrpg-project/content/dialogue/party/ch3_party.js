/** Chapter 3 party banter — Orin & Mira */

export const CHAPTER_03_PARTY = [
  {
    id: 'ch3_party_road_bellhaven',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Orin', text: 'Perjalanan kita cukup panjang.', next: 'b' },
      b: { speaker: 'Mira', text: 'Kau sudah ingin beristirahat?', next: 'c' },
      c: {
        speaker: 'Orin',
        text: 'Sedikit. Tapi melihat kota sebesar ini membuatku lupa kalau kakiku lelah.',
        next: 'd',
      },
      d: {
        speaker: 'Mira',
        text: 'Kalau begitu, kita cari tempat untuk mengisi bekal setelah urusan kita selesai.',
      },
    },
  },
  {
    id: 'ch3_party_gate_bell',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Aku masih memikirkan suara lonceng tadi.', next: 'b' },
      b: { speaker: 'Orin', text: 'Kau yakin ada nada yang hilang?', next: 'c' },
      c: {
        speaker: 'Mira',
        text: 'Ya. Aku merasa seperti sedang menunggu sesuatu yang tidak pernah datang.',
        next: 'd',
      },
      d: { speaker: 'Orin', text: 'Semoga kita bisa menemukan penyebabnya.' },
    },
  },
  {
    id: 'ch3_party_market_names',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Orin', text: 'Ruli masih mengingat tawa temannya.', next: 'b' },
      b: { speaker: 'Mira', text: 'Tapi tidak namanya.', next: 'c' },
      c: { speaker: 'Orin', text: 'Menurutmu, apakah kenangan itu bisa kembali?', next: 'd' },
      d: {
        speaker: 'Mira',
        text: 'Aku tidak tahu. Tapi selama dia masih mengingat bahwa orang itu pernah berarti baginya, kenangan itu belum sepenuhnya hilang.',
      },
    },
  },
  {
    id: 'ch3_party_fountain_echo',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Air mancur itu terasa aneh.', next: 'b' },
      b: { speaker: 'Orin', text: 'Karena satu nadanya hilang?', next: 'c' },
      c: {
        speaker: 'Mira',
        text: 'Karena aku bisa merasakan ruang kosong di tempat nada itu seharusnya berada.',
        next: 'd',
      },
      d: { speaker: 'Orin', text: 'Seperti ada sesuatu yang sengaja diambil.', next: 'e' },
      e: { speaker: 'Mira', text: 'Itulah yang membuatku takut.' },
    },
  },
  {
    id: 'ch3_party_archive_door',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Orin', text: 'Kau siap kembali besok?', next: 'b' },
      b: { speaker: 'Mira', text: 'Aku tidak tahu apa yang akan kita temukan di sana.', next: 'c' },
      c: { speaker: 'Orin', text: 'Aku juga tidak.', next: 'd' },
      d: {
        speaker: 'Mira',
        text: 'Tapi kita sudah sampai sejauh ini bersama. Kita cari jawabannya bersama.',
        next: 'e',
      },
      e: { speaker: 'Orin', text: 'Setuju.' },
    },
  },
];
