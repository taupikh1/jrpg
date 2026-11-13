/** Chapter 6 opening and Kael recruitment. All player-facing text is Bahasa Indonesia. */
export const CHAPTER_06_PARTY = [
  {
    id: 'ch6_kael_recruitment',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Jalur utara membawa Orin dan Mira menjauh dari situs Resonance. Di sebuah persimpangan, seorang pria berjubah abu-abu berdiri dengan sikap waspada. Bekas luka membentang di rahangnya.',
        next: 'b',
      },
      b: {
        speaker: 'Kael',
        text: 'Kalian yang membangunkan simpul di selatan?',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Kami mencoba memahami apa yang terjadi. Kau siapa?',
        next: 'd',
      },
      d: {
        speaker: 'Kael',
        text: 'Kael Rowan. Dahulu aku bertugas di Pengawal Mahkota. Aku pernah gagal melindungi seorang utusan di perbatasan. Catatan resmi menghapus kejadian itu. Aku tidak.',
        next: 'e',
      },
      e: {
        speaker: 'Mira',
        text: 'Dan kau mengikuti kami karena mengira perjalanan ini berkaitan dengan laporan yang dihapus itu?',
        next: 'f',
      },
      f: {
        speaker: 'Kael',
        text: 'Aku mengikuti jejak yang sengaja dihilangkan. Kalau kalian menuju Mahkota Abu, jalur itu tidak aman untuk dilewati bertiga tanpa persiapan.',
        next: 'g',
      },
      g: {
        speaker: 'Orin',
        text: 'Kalau tujuan kita sejalan, berjalanlah bersama kami. Kita tidak harus menanggung semuanya sendirian.',
        next: 'h',
      },
      h: {
        speaker: 'Kael',
        text: 'Baik. Aku akan menjaga garis depan. Tapi kalau aku mulai terlalu keras kepala, katakan saja.',
        effects: { recruitMember: 'kael', flag: 'ch6_kael_recruited' },
      },
    },
  },
  {
    id: 'ch6_party_first_watch',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Mira',
        text: 'Kau selalu berdiri menghadap jalur masuk, Kael. Bahkan saat beristirahat.',
        next: 'b',
      },
      b: {
        speaker: 'Kael',
        text: 'Kebiasaan lama. Lebih mudah berjaga daripada tidur.',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Malam ini giliran kami. Kau juga bagian dari rombongan sekarang.',
        next: 'd',
      },
      d: {
        speaker: 'Kael',
        text: 'Kalau begitu, bangunkan aku bila ada masalah. Jangan mencoba menjadi pahlawan sendirian.',
        effects: { flag: 'ch6_party_first_watch_done' },
      },
    },
  },
];
