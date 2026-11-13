/** Chapter 7 party recruitment framework. Player-facing text is Bahasa Indonesia. */
export const CHAPTER_07_PARTY = [
  {
    id: 'ch7_iven_recruitment',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Di jalur perbatasan yang sunyi, seorang kurir berhenti di dekat penanda jalan yang nyaris kehilangan tulisannya. Selempang pengiriman melintang di dadanya, sementara matanya terus mengamati persimpangan.',
        next: 'b',
      },
      b: {
        speaker: 'Iven',
        text: 'Kalian mencari jalan yang aman, atau jawaban yang biasanya membuat jalan jadi berbahaya?',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Mungkin keduanya. Kau kurir di daerah ini?',
        next: 'd',
      },
      d: {
        speaker: 'Iven',
        text: 'Iven Marr. Aku mengantar pesan melewati jalur yang tidak tercantum di peta resmi. Kadang ada hal yang lebih penting daripada isi peti.',
        next: 'e',
      },
      e: {
        speaker: 'Mira',
        text: 'Kau pernah menyelundupkan sesuatu selain barang dagangan?',
        next: 'f',
      },
      f: {
        speaker: 'Iven',
        text: 'Pernah. Sebuah catatan yang seharusnya tetap tersembunyi. Aku tidak akan menceritakan semuanya di pinggir jalan.',
        next: 'g',
      },
      g: {
        speaker: 'Orin',
        text: 'Kami tidak meminta semua rahasiamu. Tapi kami butuh orang yang mengenal jalur ini. Berjalanlah bersama kami.',
        next: 'h',
      },
      h: {
        speaker: 'Iven',
        text: 'Untuk sementara, aku ikut. Jangan salah paham, aku masih menghitung risikonya. Hanya saja, membiarkan kalian tersesat tampaknya lebih merepotkan.',
        effects: { recruitMember: 'iven', flag: 'ch7_iven_recruited' },
      },
    },
  },
];
