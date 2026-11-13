/**
 * Chapter 1 — The Village Beneath the Blue Sky
 * Player-facing text: Bahasa Indonesia (natural).
 * IDs stable; compatible with DialogueEngine.
 */

/** @type {import('../../../src/engine/gameplay/dialogue/DialogueEngine.js').DialogueDef} */
export const DIALOGUE_CH1_OPENING = {
  id: 'ch1_opening',
  startNode: 'narration',
  nodes: {
    narration: {
      speaker: null,
      text: 'Di bawah langit biru yang tenang, desa Ashwillow terbangun pelan. Asap dapur menari di udara pagi, dan angin membawa bau tanah basah.',
      next: 'orin_wake',
    },
    orin_wake: {
      speaker: 'Orin Vale',
      text: 'Hari ini terasa… aneh. Seperti ada yang hilang dari udara, tapi aku tidak tahu apa.',
      next: 'end',
    },
    end: {
      speaker: null,
      text: 'Orin mengencangkan tas kecilnya. Di luar, desa menunggu seperti biasa—setidaknya, begitu kelihatannya.',
    },
  },
};

/** @type {import('../../../src/engine/gameplay/dialogue/DialogueEngine.js').DialogueDef} */
export const DIALOGUE_CH1_ELDER_HENN = {
  id: 'ch1_elder_henn',
  startNode: 'greet',
  nodes: {
    greet: {
      speaker: 'Sesepuh Henn',
      text: 'Orin. Kau datang tepat waktu. Aku… aku ingin menyanyikan himne pendiri desa, tapi namanya… hilang dari lidahku.',
      choices: [
        {
          text: 'Mungkin hanya kelelahan, Sesepuh.',
          next: 'tired',
        },
        {
          text: 'Sejak kapan nama itu hilang?',
          next: 'when',
        },
        {
          text: 'Aku akan bantu mencari catatan lama.',
          next: 'help',
        },
      ],
    },
    tired: {
      speaker: 'Sesepuh Henn',
      text: 'Kelelahan tidak menghapus lagu yang sudah kupegang tujuh puluh tahun. Ini berbeda. Seperti lubang di kain yang dulu utuh.',
      next: 'offer',
    },
    when: {
      speaker: 'Sesepuh Henn',
      text: 'Baru pagi ini. Semalam masih jelas. Pagi ini… kosong. Dan aku bukan satu-satunya. Lihat papan nama di tepi jalan.',
      next: 'offer',
    },
    help: {
      speaker: 'Sesepuh Henn',
      text: 'Baik. Periksa arsip kecil di balai desa, dan tanyakan pada penjaga serta pedagang. Kalau kau menemukan serpihan yang aneh… bawa padaku.',
      next: 'offer',
      // effects applied by host when choice selected if engine supports; quest may be accepted elsewhere
    },
    offer: {
      speaker: 'Sesepuh Henn',
      text: 'Resonansi di tanah ini selalu lembut. Hari ini ia bergetar seperti orang yang lupa namanya sendiri.',
      choices: [
        {
          text: 'Aku akan menyelidiki.',
          next: 'accept_path',
          effects: { flag: 'ch1_investigate' },
        },
        {
          text: 'Beri aku waktu berpikir dulu.',
          next: 'later',
        },
      ],
    },
    accept_path: {
      speaker: 'Sesepuh Henn',
      text: 'Hati-hati di hutan utara. Kabarnya ada yang melihat cahaya yang tidak seharusnya ada di sana.',
      next: 'end',
    },
    later: {
      speaker: 'Sesepuh Henn',
      text: 'Pintu balai tetap terbuka. Jangan terlalu lama, Orin. Kenangan desa ini sedang retak.',
    },
    end: {
      speaker: null,
      text: 'Sesepuh menatap langit yang terlalu bersih, seolah mencari bintang yang hilang di siang hari.',
    },
  },
};

/** @type {import('../../../src/engine/gameplay/dialogue/DialogueEngine.js').DialogueDef} */
export const DIALOGUE_CH1_GUARD_RENDA = {
  id: 'ch1_guard_renda',
  startNode: 'hello',
  nodes: {
    hello: {
      speaker: 'Renda',
      text: 'Orin. Jalan utara aman… kira-kira. Tapi pohon-pohon di tepi hutan kelihatan gelisah. Daunnya bergetar tanpa angin.',
      choices: [
        {
          text: 'Ada yang aneh di pos jaga?',
          next: 'post',
        },
        {
          text: 'Sesepuh bilang ada cahaya di hutan.',
          next: 'light',
        },
        {
          text: 'Hati-hati juga, Renda.',
          next: 'care',
        },
      ],
    },
    post: {
      speaker: 'Renda',
      text: 'Papan penunjuk arah semalam masih bertuliskan "Hutan Berbisik". Pagi ini hurufnya pudar, seolah digosok hujan—padahal kemarin tidak hujan.',
      next: 'tip',
    },
    light: {
      speaker: 'Renda',
      text: 'Aku melihat kilau biru pucat sebelum subuh. Bukan api unggun. Lebih seperti… napas tanah. Jangan pergi sendirian kalau bisa.',
      next: 'tip',
    },
    care: {
      speaker: 'Renda',
      text: 'Heh. Kau yang biasanya hilang di semak. Kali ini dengarkan penasehatmu yang berseragam, ya.',
      next: 'tip',
    },
    tip: {
      speaker: 'Renda',
      text: 'Kalau kau ke hutan, bawa tali dan herb. Dan kalau bertemu Mira… katakan padanya papan itu sudah rusak. Ia akan marah pada petanya, bukan pada kita.',
    },
  },
};

/** @type {import('../../../src/engine/gameplay/dialogue/DialogueEngine.js').DialogueDef} */
export const DIALOGUE_CH1_MERCHANT_SOLI = {
  id: 'ch1_merchant_soli',
  startNode: 'call',
  nodes: {
    call: {
      speaker: 'Soli',
      text: 'Orin! Lihat dulu—hari ini harga herb naik karena pemetik takut masuk hutan. Aku tidak menyalahkan mereka.',
      choices: [
        {
          text: 'Ada berita dari luar desa?',
          next: 'news',
        },
        {
          text: 'Aku butuh persediaan ringan.',
          next: 'shop',
        },
        {
          text: 'Kau ingat nama pendiri desa?',
          next: 'founder',
        },
      ],
    },
    news: {
      speaker: 'Soli',
      text: 'Pedagang lewat bilang Bellhaven juga ribut soal kontrak yang "tiba-tiba kosong". Aku pikir itu urusan tukang tulis. Sekarang… aku tidak yakin.',
      next: 'end_soft',
    },
    shop: {
      speaker: 'Soli',
      text: 'Herb masih ada. Pedang karat juga, kalau kau nekat. Bayar lunas—kredit tidak berlaku saat langit aneh begini.',
      next: 'end_soft',
    },
    founder: {
      speaker: 'Soli',
      text: '…Aneh. Aku bisa menggambarkan patungnya. Tapi namanya? Seperti ada lubang di ingatanku. Jangan ceritakan ini pada pembeli, Orin.',
      next: 'end_soft',
    },
    end_soft: {
      speaker: 'Soli',
      text: 'Kalau kau menemukan kayu yang bersih di jalur hutan, tukar denganku. Desa butuh pagar yang tidak goyah.',
    },
  },
};

/** @type {import('../../../src/engine/gameplay/dialogue/DialogueEngine.js').DialogueDef} */
export const DIALOGUE_CH1_VILLAGER_NIMA = {
  id: 'ch1_villager_nima',
  startNode: 'wash',
  nodes: {
    wash: {
      speaker: 'Nima',
      text: 'Aku mencuci kain ini sejak pagi. Motifnya… dulu ada tulisan kecil di tepinya. Sekarang polos. Orin, kau pernah lihat kain berubah sendiri?',
      choices: [
        {
          text: 'Belum. Kapan terakhir kau baca tulisannya?',
          next: 'when',
        },
        {
          text: 'Mungkin luntur.',
          next: 'fade',
        },
      ],
    },
    when: {
      speaker: 'Nima',
      text: 'Semalam, sebelum tidur. Aku membacakannya untuk anakku. Pagi ini ia bertanya, "Ibu, lagunya ke mana?" Aku tidak punya jawaban.',
      next: 'close',
    },
    fade: {
      speaker: 'Nima',
      text: 'Luntur tidak menghapus makna secepat ini. Ini seperti seseorang mencabut benang dari cerita kami.',
      next: 'close',
    },
    close: {
      speaker: 'Nima',
      text: 'Kalau kau ke balai, bilang pada Sesepuh. Ia harus tahu kami juga lupa.',
    },
  },
};

/** @type {import('../../../src/engine/gameplay/dialogue/DialogueEngine.js').DialogueDef} */
export const DIALOGUE_CH1_CHILD_TORI = {
  id: 'ch1_child_tori',
  startNode: 'play',
  nodes: {
    play: {
      speaker: 'Tori',
      text: 'Kak Orin! Aku menggambar peta desa. Tapi bagian utara… aku lupa bentuknya. Padahal kemarin aku masih ingat sungai kecilnya.',
      choices: [
        {
          text: 'Coba gambar apa yang masih kau ingat.',
          next: 'draw',
        },
        {
          text: 'Jangan dekat hutan dulu, ya.',
          next: 'warn',
        },
      ],
    },
    draw: {
      speaker: 'Tori',
      text: 'Oke! Aku gambar rumah Sesepuh dulu. Yang utara… nanti saja. Rasanya pusing kalau dipaksa.',
    },
    warn: {
      speaker: 'Tori',
      text: 'Ibu bilang begitu juga. Tapi cahaya biru itu cantik, Kak. Seperti bintang yang turun ke tanah.',
    },
  },
};

/** First meaningful Mira meeting in village context (canon join forest is Ch.2; Ch.1 = encounter / concern). */
export const DIALOGUE_CH1_MIRA_ENCOUNTER = {
  id: 'ch1_mira_encounter',
  startNode: 'spot',
  nodes: {
    spot: {
      speaker: 'Mira Solenne',
      text: 'Orin. Peta Ashwillowku tidak cocok dengan jalan yang kulihat. Aku menyalinnya seminggu lalu. Hari ini garis utaranya… bergeser.',
      choices: [
        {
          text: 'Sesepuh juga lupa himne pendiri.',
          next: 'elder',
        },
        {
          text: 'Kau dari Bellhaven?',
          next: 'from',
        },
        {
          text: 'Boleh kulihat petamu?',
          next: 'map',
        },
      ],
    },
    elder: {
      speaker: 'Mira Solenne',
      text: 'Bukan hanya desa ini, kalau begitu. Aku mendengar desas-desus di jalan. Aku belum punya bukti—hanya tinta yang membangkang.',
      next: 'offer_help',
    },
    from: {
      speaker: 'Mira Solenne',
      text: 'Bellhaven, ya. Aku menelusuri rute dagang. Tapi hari ini aku berhenti di sini karena petaku berbohong. Itu lebih menakutkan daripada hutan.',
      next: 'offer_help',
    },
    map: {
      speaker: 'Mira Solenne',
      text: 'Silakan. Lihat goresan ini—dulu sungai kecil. Sekarang kertasnya kosong di tempat yang sama. Aku tidak menghapusnya.',
      next: 'offer_help',
    },
    offer_help: {
      speaker: 'Mira Solenne',
      text: 'Kalau kau menyelidiki hutan utara, aku ikut. Bukan karena berani—karena aku tidak mau peta berikutnya juga bohong.',
      choices: [
        {
          text: 'Baik. Kita mulai dari tepi hutan.',
          next: 'accept',
          effects: { flag: 'ch1_mira_follow' },
        },
        {
          text: 'Tunggu di desa dulu. Aku cek sekeliling.',
          next: 'wait',
        },
      ],
    },
    accept: {
      speaker: 'Mira Solenne',
      text: 'Bagus. Dan Orin… kalau kau merasa udara "berlubang", bilang. Aku juga merasakannya.',
    },
    wait: {
      speaker: 'Mira Solenne',
      text: 'Baik. Aku akan memperbaiki catatan di balai. Jangan terlalu lama—kenangan tidak menunggu dengan sabar.',
    },
  },
};

/** Resonance fragment discovery */
export const DIALOGUE_CH1_RESONANCE_FRAGMENT = {
  id: 'ch1_resonance_fragment',
  startNode: 'find',
  nodes: {
    find: {
      speaker: null,
      text: 'Di antara akar pohon tua dekat tepi hutan, batu kecil berdenyut biru lembut. Bukan panas. Bukan dingin. Seperti detak yang tertahan.',
      next: 'orin',
    },
    orin: {
      speaker: 'Orin Vale',
      text: 'Ini… menjawab sesuatu di dadaku. Seolah ada yang memanggil, tapi lupa kata-katanya.',
      choices: [
        {
          text: '(Menggenggam batu itu)',
          next: 'hold',
        },
        {
          text: '(Menyimpannya dengan hati-hati)',
          next: 'pocket',
        },
      ],
    },
    hold: {
      speaker: null,
      text: 'Denyutnya mereda, seolah lega disentuh. Di kejauhan, angin membawa bisikan yang bukan bahasa—hanya rasa: jangan lupa.',
      next: 'after',
    },
    pocket: {
      speaker: null,
      text: 'Batu itu tenang di saku. Orin merasa desa di belakangnya sedikit lebih jelas—dan sedikit lebih rapuh.',
      next: 'after',
    },
    after: {
      speaker: 'Orin Vale',
      text: 'Aku harus menunjukkan ini pada Sesepuh. Dan pada Mira, kalau ia masih di sini.',
    },
  },
};

/** Memory-slip incident (Stillness symptom) */
export const DIALOGUE_CH1_MEMORY_SLIP = {
  id: 'ch1_memory_slip',
  startNode: 'square',
  nodes: {
    square: {
      speaker: null,
      text: 'Di alun-alun, beberapa warga berhenti di tengah kalimat. Seseorang tertawa gugup. Seseorang menangis tanpa tahu sebabnya.',
      next: 'henn',
    },
    henn: {
      speaker: 'Sesepuh Henn',
      text: 'Nama festival musim semi… hilang dari kami semua sekaligus. Bukan satu orang. Bukan satu rumah. Seluruh Ashwillow.',
      next: 'orin',
    },
    orin: {
      speaker: 'Orin Vale',
      text: 'Ini bukan cuaca. Dan bukan usia. Ada yang merenggut ingatan dari tanah ini.',
      next: 'mira',
    },
    mira: {
      speaker: 'Mira Solenne',
      text: 'Kalau peta dan lagu hilang bersamaan, sumbernya mungkin sama. Hutan utara—atau sesuatu di bawahnya.',
      next: 'resolve',
    },
    resolve: {
      speaker: 'Sesepuh Henn',
      text: 'Orin. Mira. Pergilah dengan hati-hati. Bawa apa yang kalian temukan. Ashwillow tidak bisa lupa lebih banyak dari ini.',
      choices: [
        {
          text: 'Kami akan ke hutan.',
          next: 'to_forest',
          effects: { flag: 'ch1_to_forest', chapterHook: 'chapter_02' },
        },
      ],
    },
    to_forest: {
      speaker: null,
      text: 'Langit tetap biru. Tapi di bawahnya, desa yang dulu utuh mulai belajar apa artinya kehilangan nama.',
    },
  },
};

/** Chapter 1 ending hook */
export const DIALOGUE_CH1_ENDING = {
  id: 'ch1_ending',
  startNode: 'road',
  nodes: {
    road: {
      speaker: null,
      text: 'Jalan setapak menuju Hutan Berbisik terbuka. Di belakang, asap dapur masih naik. Di depan, daun bergetar tanpa angin.',
      next: 'orin',
    },
    orin: {
      speaker: 'Orin Vale',
      text: 'Kalau ingatan bisa dicuri, kita harus mengambilnya kembali—sebelum kita lupa alasan untuk melawan.',
      next: 'mira',
    },
    mira: {
      speaker: 'Mira Solenne',
      text: 'Aku akan menggambar setiap langkah. Kalau peta bohong lagi, setidaknya kita punya saksi.',
      next: 'close',
    },
    close: {
      speaker: null,
      text: 'Bab satu berakhir di ambang hutan. Di balik ranting, sesuatu yang lama tertidur mulai mendengar namanya disebut lagi—meski nama itu hampir hilang.',
    },
  },
};

export const CHAPTER_01_DIALOGUES = [
  DIALOGUE_CH1_OPENING,
  DIALOGUE_CH1_ELDER_HENN,
  DIALOGUE_CH1_GUARD_RENDA,
  DIALOGUE_CH1_MERCHANT_SOLI,
  DIALOGUE_CH1_VILLAGER_NIMA,
  DIALOGUE_CH1_CHILD_TORI,
  DIALOGUE_CH1_MIRA_ENCOUNTER,
  DIALOGUE_CH1_RESONANCE_FRAGMENT,
  DIALOGUE_CH1_MEMORY_SLIP,
  DIALOGUE_CH1_ENDING,
];
