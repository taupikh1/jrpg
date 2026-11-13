/**
 * Chapter 3 — The Road to Bellhaven — main story dialogues
 * All player-facing text: Bahasa Indonesia
 */

/** @type {import('../../../src/engine/gameplay/dialogue/DialogueEngine.js').DialogueDef[]} */
export const CHAPTER_03_DIALOGUES = [
  // Scene 1 — First view of Bellhaven
  {
    id: 'ch3_road_bellhaven_first_view',
    startNode: 'n0',
    nodes: {
      n0: {
        speaker: null,
        text: 'Setelah perjalanan panjang melewati hutan, jalan berbatu itu akhirnya berakhir di sebuah bukit kecil. Dari atas sana, Orin dan Mira dapat melihat menara-menara Bellhaven menjulang di balik tembok kota. Cahaya matahari memantul pada jendela-jendela, sementara suara aktivitas penduduk samar-samar terbawa angin.',
        next: 'n1',
      },
      n1: { speaker: 'Orin', text: 'Bellhaven… akhirnya kita sampai.', next: 'n2' },
      n2: { speaker: 'Mira', text: 'Dari kejauhan, kota ini terlihat begitu ramai.', next: 'n3' },
      n3: { speaker: 'Orin', text: 'Kau sudah pernah ke sini?', next: 'n4' },
      n4: {
        speaker: 'Mira',
        text: 'Belum. Tapi aku pernah mendengar cerita tentang lonceng-loncengnya. Katanya, setiap jam memiliki rangkaian nada yang berbeda.',
        next: 'n5',
      },
      n5: { speaker: 'Orin', text: 'Kalau begitu, kita datang pada waktu yang tepat untuk mendengarnya.', next: 'n6' },
      n6: { speaker: 'Mira', text: 'Sebentar. Kau mendengar sesuatu yang aneh?', next: 'n7' },
      n7: { speaker: 'Orin', text: 'Loncengnya?', next: 'n8' },
      n8: {
        speaker: 'Mira',
        text: 'Ya. Ada satu nada yang seharusnya menyusul, tapi tidak terdengar.',
        next: 'n9',
      },
      n9: { speaker: 'Orin', text: 'Mungkin salah satu loncengnya rusak.', next: 'n10' },
      n10: {
        speaker: 'Mira',
        text: 'Belum tentu. Resonansi tidak selalu terasa dari sesuatu yang hadir. Kadang kita justru merasakannya dari sesuatu yang hilang.',
        next: 'n11',
      },
      n11: { speaker: 'Orin', text: 'Kau mulai bicara seperti sedang memecahkan teka-teki.', next: 'n12' },
      n12: {
        speaker: 'Mira',
        text: 'Aku juga berharap ini hanya teka-teki biasa.',
        choices: [
          {
            text: 'Kita cari tahu setelah masuk.',
            next: 'c1a',
            effects: { flag: 'ch3_bellhaven_first_view_seen' },
          },
          {
            text: 'Kau yakin ada sesuatu yang hilang?',
            next: 'c2a',
            effects: { flag: 'ch3_bellhaven_first_view_seen' },
          },
        ],
      },
      c1a: { speaker: 'Orin', text: 'Kita tidak akan mendapat jawaban dengan terus berdiri di sini.', next: 'c1b' },
      c1b: { speaker: 'Mira', text: 'Benar. Ayo.' },
      c2a: {
        speaker: 'Mira',
        text: 'Aku belum yakin. Tapi perasaan itu tidak seperti gema yang terputus.',
        next: 'c2b',
      },
      c2b: { speaker: 'Orin', text: 'Kalau begitu, kita periksa kota ini baik-baik.' },
    },
  },

  // Scene 2 — Lyn main story
  {
    id: 'ch3_road_lyn_warning',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Lyn',
        text: 'Berhenti sebentar. Jalan masuk Bellhaven sedang cukup padat. Kalian datang dari arah hutan?',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Benar. Kami hendak masuk kota.', next: 'c' },
      c: { speaker: 'Lyn', text: 'Ada keperluan khusus?', next: 'd' },
      d: {
        speaker: 'Orin',
        text: 'Kami sedang mencari informasi tentang catatan dan sejarah beberapa tempat.',
        next: 'e',
      },
      e: {
        speaker: 'Lyn',
        text: 'Kalau urusan catatan, kalian sebaiknya bertemu petugas gerbang atau orang-orang di alun-alun.',
        next: 'f',
      },
      f: { speaker: 'Mira', text: 'Apakah ada masalah dengan catatan kota?', next: 'g' },
      g: {
        speaker: 'Lyn',
        text: 'Belakangan ini ada beberapa kejanggalan. Daftar pengunjung tidak cocok dengan ingatan para penjaga.',
        next: 'h',
      },
      h: { speaker: 'Orin', text: 'Maksudmu?', next: 'i' },
      i: {
        speaker: 'Lyn',
        text: 'Ada nama yang tercatat, tetapi tak seorang pun ingat siapa pemiliknya.',
        next: 'j',
      },
      j: {
        speaker: 'Mira',
        text: 'Itu tidak terdengar seperti kesalahan administrasi biasa.',
        next: 'k',
      },
      k: {
        speaker: 'Lyn',
        text: 'Memang bukan. Tapi aku hanya penjaga jalan. Aku tidak tahu apa yang sebenarnya terjadi.',
        effects: { flag: 'ch3_lyn_warned' },
      },
    },
  },
  {
    id: 'ch3_road_lyn_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Lyn',
        text: 'Kalau kalian masuk kota, tetaplah waspada. Jangan langsung percaya pada semua yang tertulis di atas kertas.',
      },
    },
  },
  {
    id: 'ch3_road_lyn_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Lyn',
        text: 'Kalian berhasil menemukan petunjuk di dalam kota?',
        next: 'b',
      },
      b: {
        speaker: 'Orin',
        text: 'Kami menemukan cukup banyak hal untuk tahu bahwa masalahnya belum selesai.',
        next: 'c',
      },
      c: {
        speaker: 'Lyn',
        text: 'Kalau begitu, semoga kalian menemukan jawabannya sebelum keadaan memburuk.',
      },
    },
  },

  // Scene 3 — Ode
  {
    id: 'ch3_road_ode_bellhaven',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Ode',
        text: 'Perjalanan panjang, ya? Wajah kalian sudah seperti orang yang ingin segera menemukan tempat duduk.',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Bellhaven selalu seramai ini?', next: 'c' },
      c: {
        speaker: 'Ode',
        text: 'Biasanya lebih ramai. Orang-orang datang untuk berdagang, mencari kabar, atau sekadar mendengar pertunjukan lonceng.',
        next: 'd',
      },
      d: { speaker: 'Mira', text: 'Pertunjukan lonceng?', next: 'e' },
      e: {
        speaker: 'Ode',
        text: 'Setiap sore, lonceng kota memainkan rangkaian nada yang sudah dikenal sejak lama. Anak-anak sampai bisa menyenandungkannya.',
        next: 'f',
      },
      f: { speaker: 'Orin', text: 'Tapi hari ini ada nada yang hilang.', next: 'g' },
      g: { speaker: 'Ode', text: 'Kalian juga menyadarinya?', next: 'h' },
      h: { speaker: 'Mira', text: 'Jadi bukan hanya perasaanku.', next: 'i' },
      i: {
        speaker: 'Ode',
        text: 'Beberapa hari terakhir, orang-orang membicarakan hal yang sama. Ada yang bilang loncengnya rusak. Ada yang bilang mereka salah dengar.',
        next: 'j',
      },
      j: { speaker: 'Orin', text: 'Menurutmu apa yang terjadi?', next: 'k' },
      k: {
        speaker: 'Ode',
        text: 'Aku pedagang, bukan ahli sihir. Tapi aku tahu satu hal: ketika semua orang mulai meragukan ingatannya sendiri, biasanya ada masalah yang lebih besar daripada sekadar lonceng rusak.',
        effects: { flag: 'ch3_ode_talked' },
      },
    },
  },
  {
    id: 'ch3_road_ode_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Ode',
        text: 'Kalau kalian hendak ke pasar, ikuti jalan timur setelah melewati gerbang. Sulit tersesat di kota yang penuh suara, kecuali kalian lupa tujuan kalian sendiri.',
      },
    },
  },
  {
    id: 'ch3_road_ode_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Ode',
        text: 'Bellhaven tampak sama seperti kemarin. Tapi sekarang aku tidak yakin apakah itu kabar baik.',
      },
    },
  },

  // Scene 4 — Dira gate entry
  {
    id: 'ch3_gate_entry_dira',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Kapten Dira',
        text: 'Selamat datang di Bellhaven. Sebelum masuk, aku perlu mencatat nama dan tujuan kalian.',
        next: 'b',
      },
      b: {
        speaker: 'Orin',
        text: 'Namaku Orin Vale. Ini Mira Solenne. Kami datang untuk mencari informasi sejarah.',
        next: 'c',
      },
      c: { speaker: 'Kapten Dira', text: 'Baik. Tunggu sebentar, aku akan mencatatnya.', next: 'n' },
      n: {
        speaker: null,
        text: 'Dira membuka buku tamu dan mulai menulis. Namun, sebelum ia selesai, tinta pada salah satu baris di halaman sebelumnya tampak memudar. Dira mengerutkan kening.',
        next: 'd',
      },
      d: { speaker: 'Kapten Dira', text: 'Aneh.', next: 'e' },
      e: { speaker: 'Orin', text: 'Ada apa?', next: 'f' },
      f: {
        speaker: 'Kapten Dira',
        text: 'Baris ini tadi masih berisi nama. Sekarang kosong.',
        next: 'g',
      },
      g: { speaker: 'Mira', text: 'Apakah tintanya luntur?', next: 'h' },
      h: {
        speaker: 'Kapten Dira',
        text: 'Seharusnya tidak. Buku ini baru saja diperiksa.',
        next: 'i',
      },
      i: { speaker: 'Orin', text: 'Apa kejadian seperti ini sering terjadi?', next: 'j' },
      j: {
        speaker: 'Kapten Dira',
        text: 'Belakangan, terlalu sering untuk disebut kebetulan.',
        next: 'k',
      },
      k: { speaker: 'Mira', text: 'Siapa yang menangani catatan pengunjung?', next: 'l' },
      l: {
        speaker: 'Kapten Dira',
        text: 'Bren di alun-alun. Dia mengurus buku tamu dan daftar perjalanan. Cobalah bicara dengannya.',
        next: 'm',
      },
      m: { speaker: 'Orin', text: 'Terima kasih. Kami akan mencarinya.', next: 'o' },
      o: {
        speaker: 'Kapten Dira',
        text: 'Silakan masuk. Tapi kalau menemukan halaman kosong yang sebelumnya berisi tulisan, jangan langsung membuangnya.',
        choices: [
          {
            text: 'Apakah kau mengingat nama yang hilang?',
            next: 'c1a',
            effects: { flag: 'ch3_dira_entry_done' },
          },
          {
            text: 'Kami akan menemui Bren.',
            next: 'c2a',
            effects: { flag: 'ch3_dira_entry_done' },
          },
        ],
      },
      c1a: {
        speaker: 'Kapten Dira',
        text: 'Tidak. Aku tahu ada seseorang yang pernah tercatat di sana, tetapi namanya tidak bisa kuingat.',
        next: 'c1b',
      },
      c1b: { speaker: 'Mira', text: 'Kau bahkan tidak ingat wajahnya?', next: 'c1c' },
      c1c: { speaker: 'Kapten Dira', text: 'Aku… tidak yakin.' },
      c2a: {
        speaker: 'Kapten Dira',
        text: 'Dia berada tidak jauh dari papan pengumuman di alun-alun.',
      },
    },
  },
  {
    id: 'ch3_gate_dira_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Kapten Dira',
        text: 'Kalau kalian membutuhkan informasi tentang buku tamu, temui Bren. Aku masih harus menjaga gerbang.',
      },
    },
  },
  {
    id: 'ch3_gate_dira_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Kapten Dira',
        text: 'Aku sudah memeriksa catatan gerbang lagi. Ada beberapa baris yang kini benar-benar kosong.',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Kami akan mencari tahu penyebabnya.', next: 'c' },
      c: {
        speaker: 'Kapten Dira',
        text: 'Semoga kalian berhasil. Aku ingin kembali percaya pada catatan yang kubaca sendiri.',
      },
    },
  },

  // Scene 5 — Bren main
  {
    id: 'ch3_plaza_bren_missing_records',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Juru Tulis Bren',
        text: 'Selamat datang. Kalau kalian ingin mengisi buku tamu, tulis nama dengan jelas. Kertasnya agak rapuh.',
        next: 'b',
      },
      b: {
        speaker: 'Orin',
        text: 'Kami datang dari gerbang. Dira mengatakan ada catatan yang menghilang.',
        next: 'c',
      },
      c: { speaker: 'Juru Tulis Bren', text: 'Jadi kalian juga melihatnya.', next: 'd' },
      d: { speaker: 'Mira', text: 'Apa yang sebenarnya terjadi?', next: 'e' },
      e: {
        speaker: 'Juru Tulis Bren',
        text: 'Ada beberapa lembar catatan tamu yang hilang. Bukan robek, bukan dicuri. Halamannya masih utuh, tetapi tulisan di dalamnya kosong.',
        next: 'f',
      },
      f: { speaker: 'Orin', text: 'Seperti dihapus?', next: 'g' },
      g: {
        speaker: 'Juru Tulis Bren',
        text: 'Kalau dihapus, pasti ada bekasnya. Ini berbeda. Bahkan bekas tekanan pena pun kadang menghilang.',
        next: 'h',
      },
      h: {
        speaker: 'Mira',
        text: 'Apakah orang-orang yang tercatat di sana masih bisa diingat?',
        next: 'i',
      },
      i: {
        speaker: 'Juru Tulis Bren',
        text: 'Itulah bagian yang paling mengganggu. Beberapa orang mengingat pernah bertemu seseorang, tetapi mereka tidak mampu menyebutkan namanya.',
        next: 'j',
      },
      j: { speaker: 'Orin', text: 'Dan kau?', next: 'k' },
      k: {
        speaker: 'Juru Tulis Bren',
        text: 'Aku mulai membuat salinan catatan. Kalau halaman-halaman ini terus berubah, setidaknya kita masih punya sesuatu untuk dibandingkan.',
        next: 'l',
      },
      l: {
        speaker: 'Mira',
        text: 'Kau tidak harus menghadapi ini sendirian.',
        next: 'm',
      },
      m: {
        speaker: 'Juru Tulis Bren',
        text: 'Terima kasih. Tapi kota ini punya banyak masalah. Aku tidak ingin membebani orang yang baru datang.',
        choices: [
          {
            text: 'Kami akan membantu mencari penyebabnya.',
            next: 'c1',
            effects: { flag: 'ch3_bren_records_clue' },
          },
          {
            text: 'Apa ada orang lain yang mengetahui masalah ini?',
            next: 'c2',
            effects: { flag: 'ch3_bren_records_clue' },
          },
        ],
      },
      c1: {
        speaker: 'Juru Tulis Bren',
        text: 'Kalau begitu, mulai dari memeriksa catatan yang tersisa. Setiap petunjuk bisa berarti.',
      },
      c2: {
        speaker: 'Juru Tulis Bren',
        text: 'Venn di pasar sedang memeriksa indeks lama. Garet juga mengetahui banyak hal tentang arsip kota.',
      },
    },
  },

  // Scene 6 — Mirae fountain
  {
    id: 'ch3_plaza_fountain_missing_note',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Penjaja Mirae', text: 'Kalian datang untuk mendengarkan lonceng kota?', next: 'b' },
      b: {
        speaker: 'Orin',
        text: 'Kurasa kami datang untuk mendengarkan sesuatu yang tidak lagi terdengar.',
        next: 'c',
      },
      c: { speaker: 'Penjaja Mirae', text: 'Kalimat yang menarik. Lihatlah air mancur ini.', next: 'd' },
      d: {
        speaker: 'Mira',
        text: 'Ada empat nada yang biasanya terdengar dari bagian bawahnya.',
        next: 'e',
      },
      e: {
        speaker: 'Penjaja Mirae',
        text: 'Benar. Anak-anak sering menghitungnya sambil bermain. Satu, dua, tiga, empat. Tapi beberapa hari ini, nada terakhir tidak terdengar.',
        next: 'f',
      },
      f: { speaker: 'Orin', text: 'Apa mekanismenya rusak?', next: 'g' },
      g: {
        speaker: 'Penjaja Mirae',
        text: 'Aku sudah memeriksanya. Airnya mengalir seperti biasa.',
        next: 'h',
      },
      h: { speaker: 'Mira', text: 'Jadi yang berubah bukan airnya.', next: 'i' },
      i: {
        speaker: 'Penjaja Mirae',
        text: 'Mungkin kota ini kehilangan sesuatu yang belum kita pahami.',
        next: 'j',
      },
      j: { speaker: 'Orin', text: 'Apakah kau pernah mendengar kejadian seperti ini sebelumnya?', next: 'k' },
      k: {
        speaker: 'Penjaja Mirae',
        text: 'Tidak. Dan aku berharap tidak perlu mengalaminya lagi.',
        effects: { flag: 'ch3_mirae_fountain_clue' },
      },
    },
  },
  {
    id: 'ch3_plaza_mirae_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Penjaja Mirae',
        text: 'Dengarkan baik-baik. Kadang, sesuatu yang hilang meninggalkan ruang lebih besar daripada sesuatu yang masih ada.',
      },
    },
  },
  {
    id: 'ch3_plaza_mirae_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Penjaja Mirae',
        text: 'Loncengnya masih kehilangan satu nada. Setidaknya sekarang aku tahu bahwa aku tidak membayangkannya.',
      },
    },
  },

  // Scene 7 — Venn index
  {
    id: 'ch3_market_venn_index_clue',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Arsiparis Venn',
        text: 'Jangan sentuh tumpukan kertas yang diberi pita biru. Aku sudah mengaturnya tiga kali dan tetap tidak yakin urutannya benar.',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Kau sedang memeriksa catatan kota?', next: 'c' },
      c: {
        speaker: 'Arsiparis Venn',
        text: 'Lebih tepatnya, mencoba mengingat bagaimana catatan itu seharusnya tersusun.',
        next: 'd',
      },
      d: { speaker: 'Mira', text: 'Apa yang membuatmu kesulitan?', next: 'e' },
      e: {
        speaker: 'Arsiparis Venn',
        text: 'Aku menemukan beberapa indeks lama yang tidak cocok dengan daftar terbaru. Ada satu fragmen yang hilang, padahal aku yakin kemarin masih memilikinya.',
        next: 'f',
      },
      f: {
        speaker: 'Orin',
        text: 'Apakah fragmen itu berkaitan dengan nama-nama yang menghilang?',
        next: 'g',
      },
      g: {
        speaker: 'Arsiparis Venn',
        text: 'Aku belum bisa memastikan. Tapi urutan judul dan nama di dalamnya berubah tanpa alasan yang jelas.',
        next: 'h',
      },
      h: {
        speaker: 'Mira',
        text: 'Kau harus berhati-hati. Jangan memaksakan ingatan kalau ada sesuatu yang terasa salah.',
        next: 'i',
      },
      i: {
        speaker: 'Arsiparis Venn',
        text: 'Aku tahu. Tapi kalau tidak ada yang memeriksa catatan ini, siapa lagi?',
        next: 'j',
      },
      j: { speaker: 'Orin', text: 'Kami bisa membantu mencari petunjuk.', next: 'k' },
      k: {
        speaker: 'Arsiparis Venn',
        text: 'Kalau begitu, aku akan sangat berterima kasih.',
        effects: { flag: 'ch3_venn_index_clue' },
      },
    },
  },

  // Scene 8 — Ruli
  {
    id: 'ch3_market_ruli_memory',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Ruli',
        text: 'Kak, pernah nggak kalian lupa sesuatu yang seharusnya mudah diingat?',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Seperti apa?', next: 'c' },
      c: {
        speaker: 'Ruli',
        text: 'Temanku biasa bermain di dekat air mancur. Aku ingat tawanya. Aku juga ingat dia suka berlari terlalu cepat sampai sering jatuh.',
        next: 'd',
      },
      d: { speaker: 'Mira', text: 'Tapi kau tidak ingat namanya?', next: 'e' },
      e: { speaker: 'Ruli', text: 'Iya. Padahal aku tahu dia temanku.', next: 'f' },
      f: { speaker: 'Orin', text: 'Sudah berapa lama kau mengenalnya?', next: 'g' },
      g: { speaker: 'Ruli', text: 'Aku tidak tahu. Rasanya sudah lama sekali.', next: 'h' },
      h: {
        speaker: 'Mira',
        text: 'Apakah ada orang dewasa yang bisa membantumu mengingat?',
        next: 'i',
      },
      i: {
        speaker: 'Ruli',
        text: 'Aku sudah bertanya. Mereka bilang aku mungkin hanya salah ingat.',
        next: 'j',
      },
      j: {
        speaker: 'Orin',
        text: 'Kalau begitu, jangan salahkan dirimu. Ingatan yang terasa hilang bukan berarti kenangan itu tidak pernah ada.',
        next: 'k',
      },
      k: { speaker: 'Ruli', text: 'Kakak yakin?', next: 'l' },
      l: {
        speaker: 'Orin',
        text: 'Aku belum tahu jawabannya. Tapi aku akan berusaha mencari tahu.',
        effects: { flag: 'ch3_ruli_memory_clue' },
      },
    },
  },
  {
    id: 'ch3_market_ruli_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Ruli',
        text: 'Aku masih ingat tawanya. Rasanya tidak adil kalau aku bahkan tidak bisa mengingat namanya.',
      },
    },
  },
  {
    id: 'ch3_market_ruli_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Ruli',
        text: 'Kalau suatu hari aku ingat lagi, aku ingin mengajaknya bermain di sini.',
      },
    },
  },

  // Scene 9 — Garet archive
  {
    id: 'ch3_archive_garet_warning',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Kuli Garet',
        text: 'Kalian sedang memperhatikan papan nama arsip?',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Sebagian tulisannya tampak memudar.', next: 'c' },
      c: {
        speaker: 'Kuli Garet',
        text: 'Bukan hanya papan itu. Ada beberapa bagian pada peta kota yang mulai kehilangan nama.',
        next: 'd',
      },
      d: { speaker: 'Mira', text: 'Kau bekerja dengan peta?', next: 'e' },
      e: {
        speaker: 'Kuli Garet',
        text: 'Sudah bertahun-tahun. Aku mengenal jalan-jalan kota ini bahkan sebelum beberapa bangunan didirikan.',
        next: 'f',
      },
      f: { speaker: 'Orin', text: 'Apakah kau tahu penyebabnya?', next: 'g' },
      g: {
        speaker: 'Kuli Garet',
        text: 'Aku hanya mengetahui polanya. Setiap kali satu nada lonceng hilang, beberapa catatan kota ikut berubah.',
        next: 'h',
      },
      h: {
        speaker: 'Mira',
        text: 'Seolah-olah sesuatu sedang mengambil bagian dari ingatan kota.',
        next: 'i',
      },
      i: {
        speaker: 'Kuli Garet',
        text: 'Atau membuat orang berhenti mengingatnya. Kita belum tahu mana yang benar.',
        next: 'j',
      },
      j: { speaker: 'Orin', text: 'Bagaimana dengan arsip?', next: 'k' },
      k: {
        speaker: 'Kuli Garet',
        text: 'Arsip Umum sedang ditutup untuk pemeriksaan. Kalian belum bisa masuk.',
        next: 'l',
      },
      l: { speaker: 'Mira', text: 'Siapa yang memutuskan penutupan itu?', next: 'm' },
      m: {
        speaker: 'Kuli Garet',
        text: 'Petugas arsip. Aku hanya menjaga penanda luar dan peta kota.',
        next: 'n',
      },
      n: { speaker: 'Orin', text: 'Kalau kami menemukan petunjuk baru, bolehkah kami kembali?', next: 'o' },
      o: {
        speaker: 'Kuli Garet',
        text: 'Tentu. Tapi ada satu hal yang perlu kalian ingat: jangan menganggap semua catatan yang masih tertulis sebagai kebenaran mutlak.',
        effects: { flag: 'ch3_garet_archive_clue' },
      },
    },
  },

  // Scene 10 — Chapter 3 finale (bell + Garet promise)
  {
    id: 'ch3_finale_bell_and_promise',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Saat matahari mulai condong, lonceng Bellhaven berdentang. Nada-nada familiar mengisi udara—sampai satu ruang kosong di mana nada terakhir seharusnya terdengar.',
        next: 'b',
      },
      b: { speaker: 'Mira', text: 'Itu dia. Ruang yang hilang.', next: 'c' },
      c: { speaker: 'Orin', text: 'Bukan hanya lonceng. Catatan, nama, bahkan tawa yang diingat Ruli…', next: 'd' },
      d: {
        speaker: 'Kuli Garet',
        text: 'Kalian sudah mendengar cukup banyak. Besok pagi aku akan meminta izin agar kalian boleh memeriksa Arsip Umum.',
        next: 'e',
      },
      e: { speaker: 'Orin', text: 'Kenapa membantu kami?', next: 'f' },
      f: {
        speaker: 'Kuli Garet',
        text: 'Karena kota ini tidak boleh lupa bahwa ada yang hilang. Kalau kita diam, ruang kosong itu akan semakin besar.',
        next: 'g',
      },
      g: { speaker: 'Mira', text: 'Kami akan kembali.', next: 'h' },
      h: {
        speaker: 'Kuli Garet',
        text: 'Bagus. Istirahatlah. Jawaban yang kalian cari mungkin ada di balik pintu yang masih tertutup itu.',
        choices: [
          {
            text: 'Sampai jumpa besok.',
            next: null,
            effects: { flag: 'ch3_completed', chapterHook: 'chapter_04' },
          },
        ],
      },
    },
  },

  // Supporting NPCs — Salla, Timm, Nila, Korr expanded
  {
    id: 'ch3_plaza_salla',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Pemandu Salla',
        text: 'Alun-alun ini jantung Bellhaven. Kalau kalian mencari Bren, dia sering dekat papan. Venn lebih sering di pasar. Dan jangan heran kalau lonceng terdengar… kurang lengkap.',
        effects: { flag: 'ch3_salla_talked' },
      },
    },
  },
  {
    id: 'ch3_plaza_timm_ch3',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Timm',
        text: 'Ayah bilang kota ini sedang aneh. Aku cuma ingin dia pulang sebelum senja, seperti biasa.',
      },
    },
  },
  {
    id: 'ch3_market_nila_ch3',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Pedagang Nila',
        text: 'Herb masih ada. Harga sama: lima koin. Di tengah semua keanehan ini, setidaknya obat tidak ikut hilang dari rak.',
        choices: [
          {
            text: 'Beli satu (5 gold).',
            next: 'buy',
            effects: { shopBuy: { itemId: 'herb', cost: 5, qty: 1 } },
          },
          { text: 'Tidak jadi.', next: 'no' },
        ],
      },
      buy: { speaker: 'Pedagang Nila', text: 'Hati-hati di jalan. Bellhaven ramai, tapi ramai tidak selalu berarti aman.' },
      no: { speaker: 'Pedagang Nila', text: 'Kalau berubah pikiran, aku di sini.' },
    },
  },
  {
    id: 'ch3_market_korr_ch3',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Tukang Besi Korr',
        text: 'Pedang Karat, dua belas koin. Bukan karya terbaik, tapi lebih baik daripada tangan kosong di kota yang mulai lupa namanya sendiri.',
        choices: [
          {
            text: 'Beli Pedang Karat (12 gold).',
            next: 'buy',
            effects: { shopBuy: { itemId: 'rusty_sword', cost: 12, qty: 1 } },
          },
          { text: 'Hanya melihat.', next: 'no' },
        ],
      },
      buy: { speaker: 'Tukang Besi Korr', text: 'Pegang baik-baik.' },
      no: { speaker: 'Tukang Besi Korr', text: 'Lanjutkan.' },
    },
  },
];

export const CHAPTER_03_SCENE_IDS = CHAPTER_03_DIALOGUES.map((d) => d.id);
