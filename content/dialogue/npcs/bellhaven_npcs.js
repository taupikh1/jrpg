/** Bellhaven NPC dialogues — Bahasa Indonesia */

export const BH_DIALOGUES = [
  {
    id: 'bh_gate_captain',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Kapten Dira',
        text: 'Selamat datang di Bellhaven. Jaga senjatamu tersarung di dalam tembok. Dewan sedang sibuk mendata ulang arsip — jangan heran jika ada nama yang hilang dari papan.',
        choices: [
          { text: 'Apa yang terjadi dengan arsip?', next: 'b' },
          { text: 'Saya hanya lewat.', next: 'c' },
        ],
      },
      b: {
        speaker: 'Kapten Dira',
        text: 'Catatan pos jaga semalam… beberapa baris kosong. Bukan tinta yang luntur. Seolah tidak pernah ditulis. Aneh, tapi bukan urusan penjarah.',
      },
      c: { speaker: 'Kapten Dira', text: 'Lanjutkan. Pasar di timur alun-alun.' },
    },
  },
  {
    id: 'bh_gate_clerk',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Juru Tulis Bren',
        text: 'Isi nama di buku tamu… tunggu. Halaman ini kosong lagi. Aku yakin sempat menulis tiga nama pagi ini.',
        choices: [
          {
            text: 'Mungkin aku bisa bantu mencari catatan.',
            next: 'quest',
            effects: { acceptQuest: 'quest_bh_buku_tamu' },
          },
          { text: 'Semoga beruntung.', next: 'bye' },
        ],
      },
      quest: {
        speaker: 'Juru Tulis Bren',
        text: 'Cari tiga Lembar Catatan di sekitar gerbang dan alun-alun. Kalau kau temukan, bawa ke sini.',
      },
      bye: { speaker: 'Juru Tulis Bren', text: 'Hati-hati di pasar. Harga naik karena jalur hutan sepi.' },
    },
  },
  {
    id: 'bh_gate_clerk_progress',
    startNode: 'a',
    nodes: { a: { speaker: 'Juru Tulis Bren', text: 'Masih kurang. Tiga lembar. Aku menunggu.' } },
  },
  {
    id: 'bh_gate_clerk_done',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Juru Tulis Bren',
        text: 'Ini dia. Beberapa baris masih buram, tapi lebih baik daripada kosong total. Terima kasih — ambil ini sebagai upah.',
        effects: { completeQuest: 'quest_bh_buku_tamu' },
      },
    },
  },
  {
    id: 'bh_notice',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Papan pengumuman: «Pasar buka hingga senja. Dilarang berdagang di luar kios resmi.» Di sudut, coretan samar: «Siapa yang mengingat nama jembatan lama?»',
      },
    },
  },
  {
    id: 'bh_plaza_guide',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Pemandu Salla',
        text: 'Alun-alun ini jantung Bellhaven. Barat gerbang, timur pasar. Utara ada sayap arsip — banyak yang bilang isinya “berkurang” tiap musim.',
      },
    },
  },
  {
    id: 'bh_plaza_child',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Ruli',
        text: 'Aku menggambar air mancur. Tapi kemarin… aku lupa warna ubin yang kulihat. Aneh, kan?',
      },
    },
  },
  {
    id: 'bh_archivist',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Arsiparis Venn',
        text: 'Pengunjung? Rak bagian barat ditutup sementara. Indeks nama keluarga… tidak lengkap. Jika kau menemukan serpihan indeks di kota, serahkan padaku.',
        choices: [
          {
            text: 'Aku akan mencari serpihan itu.',
            next: 'q',
            effects: { acceptQuest: 'quest_bh_indeks' },
          },
          { text: 'Hanya melihat-lihat.', next: 'bye' },
        ],
      },
      q: {
        speaker: 'Arsiparis Venn',
        text: 'Cukup satu Serpihan Indeks yang utuh. Pasar sering menimbun kertas bekas.',
      },
      bye: { speaker: 'Arsiparis Venn', text: 'Jangan menyentuh rak yang disegel.' },
    },
  },
  {
    id: 'bh_archivist_progress',
    startNode: 'a',
    nodes: { a: { speaker: 'Arsiparis Venn', text: 'Belum ada serpihan? Baik, aku menunggu.' } },
  },
  {
    id: 'bh_archivist_done',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Arsiparis Venn',
        text: 'Serpihan ini… cocok dengan celah di indeks. Nama yang hilang belum kembali, tapi setidaknya kita tahu ada yang hilang. Terima kasih.',
        effects: { completeQuest: 'quest_bh_indeks' },
      },
    },
  },
  {
    id: 'bh_fountain',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Air mancur batu tua. Di dasarnya, ukiran tahun pendirian kota — beberapa angka terkikis seolah tidak pernah dipahat.',
      },
    },
  },
  {
    id: 'bh_merchant_herbs',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Pedagang Nila',
        text: 'Herb Hutan, lima koin seikat. Stok terbatas.',
        choices: [
          {
            text: 'Beli satu (5 gold).',
            next: 'buy',
            effects: { shopBuy: { itemId: 'herb', cost: 5, qty: 1 } },
          },
          { text: 'Tidak jadi.', next: 'no' },
        ],
      },
      buy: {
        speaker: 'Pedagang Nila',
        text: 'Silakan. Semoga jarang kau butuhkan.',
      },
      no: { speaker: 'Pedagang Nila', text: 'Kalau berubah pikiran, aku di sini.' },
    },
  },
  {
    id: 'bh_merchant_tools',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Tukang Besi Korr',
        text: 'Bilah dan paku. Pedang Karat di etalase — dua belas koin. Bukan karya terbaik, tapi lebih baik daripada tangan kosong.',
        choices: [
          {
            text: 'Beli Pedang Karat (12 gold).',
            next: 'buy',
            effects: { shopBuy: { itemId: 'rusty_sword', cost: 12, qty: 1 } },
          },
          { text: 'Hanya melihat.', next: 'no' },
        ],
      },
      buy: {
        speaker: 'Tukang Besi Korr',
        text: 'Pegang baik-baik. Jangan salahkan aku jika patah di batu.',
      },
      no: { speaker: 'Tukang Besi Korr', text: 'Lanjutkan.' },
    },
  },
  {
    id: 'bh_vendor_rumor',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Penjaja Mirae',
        text: 'Kau dengar? Di Bellhaven orang bilang tukang tulis salah catat. Aku bilang pena tidak bisa menghapus sepagi itu.',
      },
    },
  },
  {
    id: 'bh_market_porter',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Kuli Garet',
        text: 'Karung ini berat. Kalau kau lihat anak kecil berkaos biru, bilang ayahnya masih di kios timur.',
        choices: [
          {
            text: 'Aku bisa sampaikan.',
            next: 'q',
            effects: { acceptQuest: 'quest_bh_pesan' },
          },
          { text: 'Maaf, aku sibuk.', next: 'no' },
        ],
      },
      q: {
        speaker: 'Kuli Garet',
        text: 'Namanya Timm. Biasanya di dekat air mancur. Sampaikan: «Ayah pulang sebelum senja.»',
      },
      no: { speaker: 'Kuli Garet', text: 'Baiklah.' },
    },
  },
  {
    id: 'bh_timm',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Timm',
        text: 'Ayah belum pulang…',
        choices: [
          { text: 'Semoga dia cepat kembali.', next: 'wait' },
        ],
      },
      wait: { speaker: 'Timm', text: 'Hmm.' },
    },
  },
  {
    id: 'bh_timm_deliver',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Timm',
        text: 'Pesan dari ayah? …Dia bilang pulang sebelum senja? Terima kasih! Aku tunggu di sini.',
      },
    },
  },
];
