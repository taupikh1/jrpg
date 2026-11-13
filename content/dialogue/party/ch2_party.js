/** Chapter 2 party banter — Orin & Mira only */

export const CHAPTER_02_PARTY = [
  {
    id: 'ch2_party_forest_entry',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Hutan ini lebih sunyi daripada yang kubayangkan.', next: 'b' },
      b: { speaker: 'Orin', text: 'Padahal orang-orang menyebutnya Hutan Berbisik.', next: 'c' },
      c: {
        speaker: 'Mira',
        text: 'Mungkin mereka mendengar sesuatu yang tidak bisa kita dengar. Atau kita belum cukup lama berada di sini.',
      },
    },
  },
  {
    id: 'ch2_party_first_echo',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Orin', text: 'Suara itu seperti mengenalku.', next: 'b' },
      b: {
        speaker: 'Mira',
        text: 'Mungkin karena Resonance merespons sesuatu di dalam dirimu. Kita tidak boleh menganggap semua yang kita dengar sebagai kebenaran.',
      },
    },
  },
  {
    id: 'ch2_party_carvings',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Mira',
        text: 'Ukiran itu pasti dibuat untuk menyampaikan sesuatu.',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Tapi sebagian besar sudah hilang.', next: 'c' },
      c: {
        speaker: 'Mira',
        text: 'Meski begitu, masih ada pola yang bisa kita pelajari. Berarti kita belum kehilangan semuanya.',
      },
    },
  },
  {
    id: 'ch2_party_resonance',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Kau masih merasa pusing?', next: 'b' },
      b: { speaker: 'Orin', text: 'Sedikit. Tapi aku baik-baik saja.', next: 'c' },
      c: {
        speaker: 'Mira',
        text: 'Kau tidak harus selalu memaksakan diri. Pastikan kau benar-benar tahu.',
      },
    },
  },
  {
    id: 'ch2_party_departure',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Orin',
        text: 'Rasanya aneh meninggalkan tempat ini tanpa mengetahui siapa yang memanggil.',
        next: 'b',
      },
      b: {
        speaker: 'Mira',
        text: 'Kita tidak harus menemukan semua jawaban hari ini. Kita akan mencari tahu di Bellhaven. Setidaknya sekarang kita tahu ke mana harus melangkah.',
      },
    },
  },
];
