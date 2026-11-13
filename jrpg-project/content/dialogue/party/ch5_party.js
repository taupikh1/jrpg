/** Chapter 5 party banter — Orin & Mira */

export const CHAPTER_05_PARTY = [
  {
    id: 'ch5_banter_fragment',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Fragmen itu semakin sering bereaksi sejak arsip.', next: 'b' },
      b: { speaker: 'Orin', text: 'Seolah menunggu kita siap mendengar.', next: 'c' },
      c: { speaker: 'Mira', text: 'Atau memperingatkan bahwa kita belum siap.' },
    },
  },
  {
    id: 'ch5_banter_memories',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Orin',
        text: 'Aku tidak ingin menghapus kenangan, meski menyakitkan.',
        next: 'b',
      },
      b: {
        speaker: 'Mira',
        text: 'Aku juga. Tapi aku mengerti mengapa seseorang bisa tergoda.',
      },
    },
  },
  {
    id: 'ch5_banter_puzzle',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Mural itu seperti peta yang setengah dilupakan.', next: 'b' },
      b: { speaker: 'Orin', text: 'Yang putus bukan hanya garisnya — tapi alasan mengapa garis itu ada.' },
    },
  },
  {
    id: 'ch5_banter_after_resonance',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Kau sempat pergi jauh sekali.', next: 'b' },
      b: { speaker: 'Orin', text: 'Tanpa suaramu, aku mungkin tidak kembali.' },
    },
  },
  {
    id: 'ch5_banter_departure',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Mira',
        text: 'Dari desa, hutan, Bellhaven, arsip… sampai di sini.',
        next: 'b',
      },
      b: {
        speaker: 'Orin',
        text: 'Dan masih banyak jalan yang belum punya nama di peta kita.',
      },
    },
  },
];
