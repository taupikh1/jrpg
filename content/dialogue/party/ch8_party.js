/** Chapter 8 party recruitment framework. Player-facing text is Bahasa Indonesia. */
export const CHAPTER_08_PARTY = [
  {
    id: 'ch8_tavi_recruitment',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Di sudut bengkel yang dipenuhi perkakas, seorang perakit muda sedang berusaha menenangkan alat kecil yang bergetar di atas meja. Seekor burung mungil bertengger di dekatnya, sama sekali tidak terganggu oleh percikan cahaya.',
        next: 'b',
      },
      b: {
        speaker: 'Tavi',
        text: 'Jangan sentuh tuas biru! Yang merah juga jangan. Sebenarnya, jangan sentuh apa pun sampai aku bilang aman.',
        next: 'c',
      },
      c: {
        speaker: 'Mira',
        text: 'Kau selalu menyambut tamu dengan daftar larangan?',
        next: 'd',
      },
      d: {
        speaker: 'Tavi',
        text: 'Hanya kalau tamunya datang tepat saat alat Resonance-ku sedang menguji batas kesabarannya. Aku Tavi Brindle. Mantan murid Guild Perakit, kalau mereka masih mau mengakuiku.',
        next: 'e',
      },
      e: {
        speaker: 'Orin',
        text: 'Apa yang terjadi?',
        next: 'f',
      },
      f: {
        speaker: 'Tavi',
        text: 'Mereka mengusirku karena alat-alatku dianggap terlalu berbahaya. Penilaian itu tidak sepenuhnya keliru. Tapi aku ingin membuat sesuatu yang bisa menolong, bukan sekadar membuat orang kagum atau ketakutan.',
        next: 'g',
      },
      g: {
        speaker: 'Mira',
        text: 'Kami sedang menghadapi masalah yang mungkin tidak bisa diselesaikan dengan peta dan keberanian saja. Keahlianmu bisa berguna.',
        next: 'h',
      },
      h: {
        speaker: 'Tavi',
        text: 'Petualangan lapangan? Perangkat uji? Makhluk-makhluk aneh? Tunggu, aku ikut! Aku sudah memperbaiki pengaman alat-alatku. Sebagian besar pengaman, setidaknya.',
        effects: { recruitMember: 'tavi', flag: 'ch8_tavi_recruited' },
      },
    },
  },
];
