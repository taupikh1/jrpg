/** Chapter 3 main quest */

export const QUEST_CH3_JEJAK = {
  id: 'quest_ch3_jejak_yang_kosong',
  name: 'Jejak yang Kosong',
  description:
    'Orin dan Mira tiba di Bellhaven untuk mencari informasi tentang Resonansi. Namun, kota itu sedang mengalami kejadian aneh. Nama-nama menghilang dari catatan, sementara sebagian penduduk mulai kehilangan ingatan tentang orang-orang yang pernah mereka kenal.',
  prerequisites: [],
  objectives: [
    {
      id: 'gate_entry',
      type: 'flag',
      targetId: 'ch3_dira_entry_done',
      count: 1,
      description: 'Temui petugas gerbang dan catat kedatangan di Bellhaven',
    },
    {
      id: 'bren_clue',
      type: 'flag',
      targetId: 'ch3_bren_records_clue',
      count: 1,
      description: 'Bicaralah dengan Bren mengenai catatan pengunjung yang hilang',
    },
    {
      id: 'venn_clue',
      type: 'flag',
      targetId: 'ch3_venn_index_clue',
      count: 1,
      description: 'Cari tahu kejanggalan pada indeks kota bersama Venn',
    },
    {
      id: 'garet_clue',
      type: 'flag',
      targetId: 'ch3_garet_archive_clue',
      count: 1,
      description: 'Temui Garet di depan Arsip Umum',
    },
    {
      id: 'finale',
      type: 'flag',
      targetId: 'ch3_completed',
      count: 1,
      description: 'Saksikan kejadian aneh saat lonceng kota berdentang',
    },
  ],
  rewards: { gold: 25 },
};

export const CH3_JOURNAL = {
  start:
    'Bellhaven tampak seperti kota yang hidup dan makmur. Namun, di balik ramainya pasar dan alunan lonceng, sejumlah kejanggalan mulai terlihat. Nama-nama menghilang dari catatan, sementara penduduk tidak lagi mengingat sebagian orang yang pernah mereka kenal.',
  complete:
    'Orin dan Mira menemukan bahwa kejadian aneh di Bellhaven berkaitan dengan catatan dan ingatan penduduk. Garet berjanji membantu mereka memperoleh izin untuk memasuki Arsip Umum. Jawaban yang mereka cari mungkin berada di balik pintu bangunan itu.',
};
