/**
 * Chapter 5 — The First Resonance (Arc I Finale)
 * Bahasa Indonesia
 */

export const CHAPTER_05_DIALOGUES = [
  {
    id: 'ch5_fragment_awakens',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Orin, tunggu. Fragmen itu mulai bergetar lagi.', next: 'b' },
      b: { speaker: 'Orin', text: 'Padahal aku belum menyentuhnya.', next: 'c' },
      c: {
        speaker: 'Mira',
        text: 'Bukan hanya bergetar. Ada sesuatu yang bergerak di dalamnya.',
        next: 'd',
      },
      d: { speaker: 'Orin', text: 'Seperti suara?', next: 'e' },
      e: {
        speaker: 'Mira',
        text: 'Lebih mirip ingatan. Tapi… bukan ingatan milikku.',
        next: 'f',
      },
      f: {
        speaker: null,
        text: 'Cahaya tipis menyebar dari fragmen. Untuk sesaat, Orin melihat bayangan kota-kota yang tidak dikenalnya, saling terhubung oleh garis cahaya.',
        next: 'g',
      },
      g: {
        speaker: 'Orin',
        text: 'Kalau begitu, kita cari tahu sebelum benda ini melakukan sesuatu yang tidak bisa kita hentikan.',
        choices: [
          {
            text: 'Kita harus memahami apa yang terjadi.',
            next: 'c1',
            effects: { flag: 'ch5_fragment_investigated' },
          },
          {
            text: 'Mungkin lebih baik kita menjauh dulu.',
            next: 'c2',
            effects: { flag: 'ch5_fragment_investigated' },
          },
        ],
      },
      c1: {
        speaker: 'Mira',
        text: 'Setuju. Aku merasakan arah — seolah fragmen menarik kita ke suatu tempat di luar Bellhaven.',
      },
      c2: {
        speaker: 'Mira',
        text: 'Menjauh tidak akan menghentikannya. Lebih baik kita temukan sumbernya sebelum getaran ini semakin kuat.',
      },
    },
  },
  {
    id: 'ch5_bellhaven_echo',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Di belakang gudang pasar, di bawah lapisan batu yang retak, terdapat ukiran Resonance yang hampir tertutup lumut. Ketika Orin mendekat, ukiran itu menyala samar.',
        next: 'b',
      },
      b: {
        speaker: 'Mira',
        text: 'Ini mirip simbol di fragmen. Mengapa tidak ada yang pernah melaporkannya?',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Mungkin karena hanya bereaksi pada orang tertentu. Atau pada fragmen itu sendiri.',
        next: 'd',
      },
      d: {
        speaker: null,
        text: 'Garis cahaya menunjuk ke utara, menjauh dari kota, menuju lereng yang jarang dilalui.',
        effects: { flag: 'ch5_echo_found' },
      },
    },
  },
  {
    id: 'ch5_scholars_warning',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Lirien',
        text: 'Kalian mengira tempat ini hanya reruntuhan?',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Kalau bukan, lalu apa?', next: 'c' },
      c: {
        speaker: 'Lirien',
        text: 'Sebuah simpul. Dahulu, banyak tempat terhubung melalui aliran Resonance.',
        next: 'd',
      },
      d: { speaker: 'Mira', text: 'Dan sekarang?', next: 'e' },
      e: {
        speaker: 'Lirien',
        text: 'Sekarang, sebagian simpul itu tidak lagi menjawab. Ada yang diam. Ada yang berteriak tanpa suara.',
        next: 'f',
      },
      f: {
        speaker: 'Lirien',
        text: 'Kalau kalian memaksa simpul yang rusak, Resonance bisa meluap. Bukan kekuatan yang kalian kendalikan — melainkan gelombang yang mencari jalan keluar.',
        next: 'g',
      },
      g: {
        speaker: 'Orin',
        text: 'Kami harus mencoba. Fragmen itu sudah membawa kami ke sini.',
        next: 'h',
      },
      h: {
        speaker: 'Lirien',
        text: 'Kalau begitu, dengarkan baik-baik: jangan biarkan satu orang menanggung seluruh aliran. Resonance adalah hubungan. Bukan beban seorang diri.',
        effects: { flag: 'ch5_scholar_warned' },
      },
    },
  },
  {
    id: 'ch5_scholar_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Lirien',
        text: 'Simpul di utara masih menunggu. Hati-hati. Tidak semua gema ingin diselamatkan.',
      },
    },
  },
  {
    id: 'ch5_scholar_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Lirien',
        text: 'Kalian sudah menyentuh sesuatu yang lama tertidur. Aku akan mencatat apa yang masih kuingat — sebelum itu juga menghilang.',
      },
    },
  },
  {
    id: 'ch5_memories_we_carry',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Di tepi jalur menuju situs kuno, Orin dan Mira berhenti. Fragmen di tangan Orin berdenyut pelan, seperti detak yang bukan miliknya.',
        next: 'b',
      },
      b: {
        speaker: 'Mira',
        text: 'Kalau sebuah kenangan terlalu menyakitkan, apa kita benar-benar harus terus mengingatnya?',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Aku tidak tahu. Tapi kalau kita menghapusnya, bagaimana kita tahu siapa diri kita setelahnya?',
        next: 'd',
      },
      d: {
        speaker: 'Mira',
        text: 'Kadang aku berharap jawabannya semudah itu.',
        next: 'e',
      },
      e: { speaker: 'Orin', text: 'Aku juga.', next: 'f' },
      f: {
        speaker: 'Mira',
        text: 'Di arsip, aku melihat orang-orang yang masih mencintai seseorang yang namanya sudah hilang. Itu lebih menakutkan daripada lupa total.',
        next: 'g',
      },
      g: {
        speaker: 'Orin',
        text: 'Karena mereka tahu ada yang hilang, tapi tidak tahu apa yang harus dijaga.',
        choices: [
          {
            text: 'Kita jaga apa yang masih tersisa.',
            next: 'c1',
            effects: { flag: 'ch5_memories_discussed' },
          },
          {
            text: 'Kita cari cara memulihkan yang hilang.',
            next: 'c2',
            effects: { flag: 'ch5_memories_discussed' },
          },
        ],
      },
      c1: {
        speaker: 'Mira',
        text: 'Ya. Setidaknya, kita tidak berpura-pura semuanya baik-baik saja.',
      },
      c2: {
        speaker: 'Mira',
        text: 'Itu yang kuinginkan. Tapi aku takut prosesnya akan meminta lebih dari yang siap kita berikan.',
      },
    },
  },
  {
    id: 'ch5_ancient_resonance_site',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Situs kuno itu berupa lingkaran pilar batu yang retak. Di tengahnya, sebuah instrumen batu berbentuk cawan menahan debu berabad-abad.',
        next: 'b',
      },
      b: {
        speaker: 'Mira',
        text: 'Lihat mural di dinding. Wilayah-wilayah saling terhubung seperti jaring.',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Dan di tengah jaring itu… sesuatu yang gelap. Seolah satu simpul telah dicabut.',
        next: 'd',
      },
      d: {
        speaker: null,
        text: 'Ketika fragmen didekatkan ke cawan, pilar-pilar mulai bergetar pelan.',
        effects: { flag: 'ch5_site_reached' },
      },
    },
  },
  {
    id: 'ch5_obj_pillar',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Pilar Resonance yang retak. Di permukaannya masih ada ukiran nama tempat yang tidak lagi ada di peta mana pun.',
        effects: { flag: 'ch5_pillar_inspected' },
      },
    },
  },
  {
    id: 'ch5_obj_instrument',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Instrumen batu berbentuk cawan. Ketika disentuh, terdengar nada rendah seperti lonceng yang jauh.',
        effects: { flag: 'ch5_instrument_touched' },
      },
    },
  },
  {
    id: 'ch5_obj_mural',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Mural menunjukkan jalur cahaya antar wilayah. Satu jalur putus di tengah, diganti coretan gelap yang tidak cocok dengan gaya ukiran aslinya.',
        effects: { flag: 'ch5_mural_seen' },
      },
    },
  },
  {
    id: 'ch5_first_resonance',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Cawan menerima fragmen. Cahaya naik dari tanah, menghubungkan pilar yang masih utuh. Angin berhenti. Suara dunia seolah tertahan.',
        next: 'b',
      },
      b: { speaker: 'Mira', text: 'Orin! Suaranya semakin keras!', next: 'c' },
      c: { speaker: 'Orin', text: 'Aku bisa mendengarnya…', next: 'd' },
      d: { speaker: 'Mira', text: 'Mendengar apa?', next: 'e' },
      e: {
        speaker: 'Orin',
        text: 'Orang-orang. Banyak sekali. Mereka memanggil nama tempat yang bahkan tidak kukenal.',
        next: 'f',
      },
      f: {
        speaker: 'Mira',
        text: 'Jangan ikuti suara itu. Tetap dengarkan suaraku!',
        next: 'g',
      },
      g: {
        speaker: 'Orin',
        text: 'Mira… ada sesuatu di balik semua ingatan ini.',
        next: 'h',
      },
      h: { speaker: 'Mira', text: 'Apa?', next: 'i' },
      i: {
        speaker: 'Orin',
        text: 'Keheningan. Bukan tidak adanya suara. Sesuatu sedang membuat dunia berhenti mengingat.',
        next: 'j',
      },
      j: {
        speaker: null,
        text: 'Gelombang Resonance menyapu situs. Untuk sesaat Orin melihat wajah-wajah tanpa nama, jalur cahaya yang putus, dan bayangan seseorang yang mengamati dari jauh — tanpa wajah yang bisa dikenali.',
        next: 'k',
      },
      k: {
        speaker: 'Mira',
        text: 'Orin! Kembali!',
        next: 'l',
      },
      l: {
        speaker: null,
        text: 'Cahaya mereda. Fragmen diam di dalam cawan, tetapi garis-garis tipis masih tersisa di udara, menunjuk ke arah yang belum pernah mereka tempuh.',
        effects: { flag: 'ch5_first_resonance_done' },
      },
    },
  },
  {
    id: 'ch5_after_resonance',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Mira',
        text: 'Kau masih mendengar mereka?',
        next: 'b',
      },
      b: {
        speaker: 'Orin',
        text: 'Tidak. Tapi aku tahu mereka masih ada di suatu tempat. Atau… pernah ada.',
        next: 'c',
      },
      c: {
        speaker: 'Mira',
        text: 'Situs ini tidak hancur. Hanya… terbangun sebagian.',
        next: 'd',
      },
      d: {
        speaker: 'Orin',
        text: 'The Stillness bukan sekadar menghapus nama. Ia merusak hubungan yang membuat dunia bisa mengingat dirinya sendiri.',
        choices: [
          {
            text: 'Kita harus menemukan simpul lain.',
            next: 'c1',
            effects: { flag: 'ch5_aftermath_done' },
          },
          {
            text: 'Kita butuh sekutu yang memahami Resonance.',
            next: 'c2',
            effects: { flag: 'ch5_aftermath_done' },
          },
        ],
      },
      c1: {
        speaker: 'Mira',
        text: 'Jalur cahaya itu menunjuk jauh. Aku tidak tahu ke mana, tapi aku siap.',
      },
      c2: {
        speaker: 'Mira',
        text: 'Lirien mungkin tahu seseorang. Atau setidaknya, ke mana catatan tentang simpul-simpul itu disimpan.',
      },
    },
  },
  {
    id: 'ch5_unseen_observer',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Jauh dari situs, di balik kabut yang tidak bergerak, seseorang — atau sesuatu — menatap ke arah cahaya yang baru padam.',
        next: 'b',
      },
      b: {
        speaker: null,
        text: 'Tidak ada nama yang terucap. Hanya satu bisikan yang tidak sampai ke telinga Orin maupun Mira:',
        next: 'c',
      },
      c: {
        speaker: null,
        text: '«Mereka menyentuh jaring itu terlalu cepat.»',
      },
    },
  },
  {
    id: 'ch5_arc1_finale',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Mira',
        text: 'Kita sudah melihat sendiri apa yang terjadi pada tempat ini.',
        next: 'b',
      },
      b: {
        speaker: 'Orin',
        text: 'Dan kita belum tahu berapa banyak tempat lain yang mengalami hal serupa.',
        next: 'c',
      },
      c: {
        speaker: 'Mira',
        text: 'Kalau begitu, kita cari jawabannya.',
        next: 'd',
      },
      d: {
        speaker: 'Orin',
        text: 'Bukan hanya untuk kita. Kalau Resonance benar-benar menghubungkan seluruh Lumerra, semua orang berhak tahu apa yang sedang terjadi.',
        next: 'e',
      },
      e: {
        speaker: 'Mira',
        text: 'Kalau perjalanan ini semakin berbahaya?',
        next: 'f',
      },
      f: {
        speaker: 'Orin',
        text: 'Kita hadapi bersama.',
        next: 'g',
      },
      g: {
        speaker: null,
        text: 'Angin kembali berhembus. Di utara, kontur tanah menjanjikan kerajaan-kerajaan yang belum mereka kenal — dan simpul-simpul Resonance yang menunggu untuk dipahami.',
        next: 'h',
      },
      h: {
        speaker: 'Mira',
        text: 'Arc kita di sini selesai. Tapi cerita Lumerra… baru dimulai.',
        choices: [
          {
            text: 'Menuju Kerajaan Mahkota Abu.',
            next: null,
            effects: {
              flag: 'ch5_completed',
              chapterHook: 'chapter_06',
            },
          },
        ],
      },
    },
  },
  // Side quests
  {
    id: 'ch5_side_stone_offer',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Lirien',
        text: 'Ada batu di sekitar situs yang bergetar pelan. Jika kau mendengar suaranya, catat nada yang kau rasakan. Aku ingin membandingkannya dengan catatan lama.',
        choices: [
          {
            text: 'Aku akan memeriksanya.',
            next: 'ok',
            effects: { acceptQuest: 'quest_ch5_suara_di_balik_batu' },
          },
          { text: 'Nanti saja.', next: 'no' },
        ],
      },
      ok: { speaker: 'Lirien', text: 'Cukup tiga titik. Jangan memaksa simpul utama.' },
      no: { speaker: 'Lirien', text: 'Baik.' },
    },
  },
  {
    id: 'ch5_side_stone_done',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Lirien',
        text: 'Nada-nada itu… tidak selaras. Seolah simpul-simpul kecil sedang mencari pusat yang sudah hilang. Terima kasih.',
        effects: { completeQuest: 'quest_ch5_suara_di_balik_batu' },
      },
    },
  },
  {
    id: 'ch5_side_message_offer',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Mira',
        text: 'Di mural itu ada tulisan kecil yang hampir pudar. Sepertinya pesan untuk seseorang yang akan datang jauh setelah penulisnya pergi.',
        choices: [
          {
            text: 'Mari kita salin pesannya.',
            next: 'ok',
            effects: { acceptQuest: 'quest_ch5_pesan_yang_tertinggal', flag: 'ch5_message_started' },
          },
          { text: 'Nanti kita perhatikan lagi.', next: 'no' },
        ],
      },
      ok: {
        speaker: 'Mira',
        text: 'Aku akan mencatat setiap huruf yang masih terbaca.',
      },
      no: { speaker: 'Mira', text: 'Baik.' },
    },
  },
  {
    id: 'ch5_side_message_done',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Mira',
        text: '«Jangan biarkan jaring putus hanya karena satu simpul takut diingat.» — Itu saja yang tersisa. Cukup untuk diingat.',
        effects: { completeQuest: 'quest_ch5_pesan_yang_tertinggal', flag: 'ch5_message_copied' },
      },
    },
  },
  {
    id: 'ch5_boss_resonance_phase2',
    startNode: 'start',
    nodes: {
      start: {
        speaker: 'Mira',
        text: 'Denyutnya berubah. Simpul itu seperti sedang mengingat sesuatu yang lama sekali terkubur.',
        next: 'orin',
      },
      orin: {
        speaker: 'Orin',
        text: 'Kalau ia masih menyimpan ingatan, berarti belum semuanya hilang. Kita harus bertahan.',
      },
    },
  },
  {
    id: 'ch5_boss_resonance_phase3',
    startNode: 'start',
    nodes: {
      start: {
        speaker: 'Penjaga Resonansi Pertama',
        text: 'SUMBER... TERBELAH... INGATAN... DIHAPUS...',
        next: 'mira',
      },
      mira: {
        speaker: 'Mira',
        text: 'Itu bukan perintah. Itu luka yang terus diulang. Orin, jangan biarkan simpul ini menelanmu.',
        next: 'orin',
      },
      orin: {
        speaker: 'Orin',
        text: 'Aku mendengarnya. Kali ini, kita hentikan siklusnya tanpa menghapus apa yang pernah terjadi.',
      },
    },
  },

];

export const CHAPTER_05_SCENE_IDS = CHAPTER_05_DIALOGUES.map((d) => d.id);
