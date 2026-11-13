/**
 * Chapter 2 — A Voice in the Forgotten Forest
 * Bahasa Indonesia — Orin & Mira only in party banter
 */

export const CHAPTER_02_DIALOGUES = [
  {
    id: 'ch2_forest_entry',
    startNode: 'n0',
    nodes: {
      n0: {
        speaker: null,
        text: 'Pepohonan semakin rapat ketika Orin dan Mira melangkah lebih jauh ke dalam hutan. Cahaya matahari hanya menembus sela-sela dedaunan, membentuk garis-garis tipis di atas tanah.',
        next: 'n1',
      },
      n1: {
        speaker: null,
        text: 'Angin bergerak pelan, tetapi suara daun yang bergesekan terdengar seperti bisikan yang saling memanggil.',
        next: 'n2',
      },
      n2: { speaker: 'Mira', text: 'Jadi, ini Hutan Berbisik.', next: 'n3' },
      n3: { speaker: 'Orin', text: 'Kau pernah datang ke sini?', next: 'n4' },
      n4: {
        speaker: 'Mira',
        text: 'Tidak. Tapi aku pernah mendengar cerita tentang tempat ini. Orang-orang bilang hutan ini bisa mengulang suara yang pernah didengarnya.',
        next: 'n5',
      },
      n5: {
        speaker: 'Orin',
        text: 'Menurutmu yang mana — gema biasa, atau hutan yang menyimpan sesuatu?',
        next: 'n6',
      },
      n6: {
        speaker: 'Mira',
        text: 'Aku belum tahu. Aku lebih suka melihat sendiri sebelum mempercayai cerita orang.',
        next: 'n7',
      },
      n7: {
        speaker: null,
        text: 'Orin memperhatikan pepohonan di sekeliling mereka. Untuk sesaat, ia merasa mendengar seseorang memanggil dari balik kabut.',
        next: 'n8',
      },
      n8: { speaker: null, text: '«Orin…»', next: 'n9' },
      n9: { speaker: 'Orin', text: 'Kau mendengarnya?', next: 'n10' },
      n10: { speaker: 'Mira', text: 'Mendengar apa?', next: 'n11' },
      n11: {
        speaker: 'Orin',
        text: 'Ada yang memanggil namaku.',
        next: 'n12',
      },
      n12: {
        speaker: 'Mira',
        text: 'Jangan terburu-buru mendekat. Kita bahkan belum tahu apakah suara itu benar-benar berasal dari seseorang. Kalau begitu, kita cari sumbernya bersama-sama.',
        effects: { flag: 'ch2_forest_entered' },
      },
    },
  },
  {
    id: 'ch2_first_echo',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Di antara akar pohon tua, Orin menemukan sebuah batu yang permukaannya dipenuhi garis-garis tipis. Garis itu berkilau ketika ia mendekat.',
        next: 'b',
      },
      b: { speaker: 'Mira', text: 'Orin, lihat batu itu.', next: 'c' },
      c: { speaker: 'Orin', text: 'Ada sesuatu yang bergerak di dalamnya.', next: 'd' },
      d: {
        speaker: null,
        text: 'Ketika Orin menyentuh permukaannya, suara samar kembali terdengar.',
        next: 'e',
      },
      e: { speaker: null, text: '«Jangan… biarkan… jalan itu…»', next: 'f' },
      f: { speaker: 'Orin', text: 'Jalan apa?', next: 'g' },
      g: { speaker: null, text: '«Yang tidak lagi memiliki nama…»', next: 'h' },
      h: {
        speaker: null,
        text: 'Cahaya di batu itu padam.',
        next: 'i',
      },
      i: {
        speaker: 'Mira',
        text: 'Aku tidak mendengar kata-katanya dengan jelas. Tapi aku merasakan getarannya. Mirip Resonance di desa, tapi jauh lebih tua.',
        next: 'j',
      },
      j: {
        speaker: 'Orin',
        text: 'Apakah suara itu mencoba memberi tahu kita sesuatu?',
        next: 'k',
      },
      k: {
        speaker: 'Mira',
        text: 'Mungkin. Tapi kita perlu menemukan sumbernya sebelum menarik kesimpulan.',
        effects: { flag: 'ch2_first_echo_heard' },
      },
    },
  },
  {
    id: 'ch2_elara_first',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Elara',
        text: 'Kalian bukan penduduk desa yang biasa melewati jalur ini.',
        next: 'b',
      },
      b: {
        speaker: 'Orin',
        text: 'Kami datang karena mendengar suara aneh dari dalam hutan.',
        next: 'c',
      },
      c: { speaker: 'Elara', text: 'Suara?', next: 'd' },
      d: {
        speaker: 'Mira',
        text: 'Seperti seseorang yang mencoba memanggil dari tempat yang jauh.',
        next: 'e',
      },
      e: {
        speaker: 'Elara',
        text: 'Kalau begitu, kalian sudah mendengarnya juga. Aku tahu suara itu sudah ada sejak lama. Tapi aku tidak tahu siapa yang mengeluarkannya.',
        next: 'f',
      },
      f: {
        speaker: 'Mira',
        text: 'Apakah orang-orang pernah mencoba mencarinya?',
        next: 'g',
      },
      g: {
        speaker: 'Elara',
        text: 'Pernah. Sebagian kembali tanpa menemukan apa pun. Sebagian lainnya mengatakan bahwa mereka menemukan sesuatu, tetapi tidak bisa mengingat apa yang mereka lihat.',
        next: 'h',
      },
      h: {
        speaker: 'Orin',
        text: 'Apakah itu berhubungan dengan The Stillness?',
        next: 'i',
      },
      i: {
        speaker: 'Elara',
        text: 'Aku tidak tahu nama yang kalian gunakan. Tapi aku tahu hutan ini mulai kehilangan sesuatu yang dulu selalu dijaganya — jejak. Itulah yang tidak bisa lagi kuingat.',
        next: 'j',
      },
      j: {
        speaker: 'Elara',
        text: 'Jika kalian benar-benar ingin mencari sumber suara itu, ikuti jalan tua di sebelah timur. Tetapi jangan mengira semua yang kalian dengar berasal dari masa sekarang.',
        effects: { flag: 'ch2_elara_met' },
      },
    },
  },
  {
    id: 'ch2_elara_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Elara',
        text: 'Jalan batu masih ada di sebelah timur. Hati-hati. Tidak semua suara di hutan ini ingin kalian temukan.',
      },
    },
  },
  {
    id: 'ch2_elara_revelation',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Elara',
        text: 'Kalian berhasil mencapai jalan batu itu.',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Kau tahu apa yang ada di sana?', next: 'c' },
      c: {
        speaker: 'Elara',
        text: 'Aku pernah mendengar suara yang sama ketika masih kecil. Setiap kali aku mencoba menjelaskannya, ada bagian yang hilang dari ingatanku.',
        next: 'd',
      },
      d: {
        speaker: 'Elara',
        text: 'Dulu, seseorang pernah berkata bahwa jalan batu itu mengarah ke tempat orang-orang berkumpul untuk mempelajari arus Resonance. Jalur lama di utara pernah menghubungkan hutan ini dengan jalan menuju Bellhaven.',
        next: 'e',
      },
      e: {
        speaker: 'Mira',
        text: 'Jadi perjalanan kita seharusnya dilanjutkan ke sana.',
        next: 'f',
      },
      f: {
        speaker: 'Elara',
        text: 'Jika kalian mencari jawaban, Bellhaven mungkin memiliki catatan yang lebih lengkap. Tetapi jangan mengira semua jawaban akan membuat kalian merasa lebih tenang.',
        effects: { flag: 'ch2_elara_clue_received' },
      },
    },
  },
  {
    id: 'ch2_elara_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Elara',
        text: 'Bellhaven menunggu di ujung jalur utara. Aku akan tetap di sini, menjaga apa yang masih bisa diingat.',
      },
    },
  },
  {
    id: 'ch2_old_stone_path',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Di balik pepohonan, sebuah jalan batu muncul dari bawah lapisan tanah dan akar. Permukaannya dipenuhi ukiran yang sebagian besar telah terkikis.',
        next: 'b',
      },
      b: {
        speaker: 'Mira',
        text: 'Ukiran ini tidak dibuat oleh penduduk desa. Polanya berulang, tetapi tidak seperti lambang keluarga atau tanda wilayah yang biasa digunakan.',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Ada bagian yang sengaja dihapus?',
        next: 'd',
      },
      d: {
        speaker: 'Mira',
        text: 'Sepertinya begitu. Bekasnya terlalu teratur untuk dianggap kerusakan alami.',
        next: 'e',
      },
      e: {
        speaker: null,
        text: 'Orin mendekat. Salah satu ukiran memancarkan cahaya redup ketika ia menyentuhnya.',
        next: 'f',
      },
      f: { speaker: null, text: '«Nama… yang tertinggal…»', next: 'g' },
      g: { speaker: 'Orin', text: 'Suara itu kembali.', next: 'h' },
      h: { speaker: 'Mira', text: 'Kali ini aku juga mendengarnya.', next: 'i' },
      i: { speaker: null, text: '«Jangan… lupakan… ikatan…»', next: 'j' },
      j: {
        speaker: 'Mira',
        text: 'Perhatikan bagian tengahnya. Ada simbol yang sama dengan pola Resonance yang kita temukan sebelumnya. Kita harus mencari bagian lain dari pola tersebut.',
        effects: { flag: 'ch2_old_carvings_found' },
      },
    },
  },
  {
    id: 'ch2_memory_trace',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Ketika Orin mendekati ukiran kedua, udara di sekitarnya berubah dingin. Cahaya tipis muncul di antara celah batu.',
        next: 'b',
      },
      b: {
        speaker: 'Mira',
        text: 'Jangan sentuh dulu. Ada sesuatu yang berbeda kali ini.',
        next: 'c',
      },
      c: {
        speaker: null,
        text: 'Bayangan samar muncul di hadapan mereka. Sosok itu tampak sedang berdiri di jalan batu, tetapi wajahnya tidak dapat dikenali.',
        next: 'd',
      },
      d: {
        speaker: null,
        text: '«Jika jalan ini masih diingat, berarti seseorang masih mencari.»',
        next: 'e',
      },
      e: { speaker: 'Orin', text: 'Siapa kau?', next: 'f' },
      f: { speaker: null, text: '«Nama kami… telah hilang.»', next: 'g' },
      g: { speaker: 'Mira', text: 'Apa yang terjadi pada kalian?', next: 'h' },
      h: { speaker: null, text: '«Yang tersisa… hanyalah suara.»', next: 'i' },
      i: {
        speaker: null,
        text: 'Bayangan itu mengangkat tangan ke arah ukiran, kemudian menghilang.',
        next: 'j',
      },
      j: {
        speaker: 'Mira',
        text: 'Sekarang aku yakin ini bukan sekadar legenda tentang hutan yang bisa meniru suara.',
        effects: { flag: 'ch2_memory_trace_seen' },
      },
    },
  },
  {
    id: 'ch2_resonance_event',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Ketika Orin dan Mira mendekati bagian terdalam dari jalan batu, seluruh ukiran mulai berpendar. Cahaya dari satu batu berpindah ke batu lainnya.',
        next: 'b',
      },
      b: { speaker: 'Mira', text: 'Orin, mundur sedikit!', next: 'c' },
      c: {
        speaker: null,
        text: 'Suara-suara samar terdengar bersamaan. Beberapa memanggil nama yang tidak lagi dapat dikenali.',
        next: 'd',
      },
      d: { speaker: null, text: '«Jangan tinggalkan kami…»', next: 'e' },
      e: { speaker: null, text: '«Kami pernah berada di sini…»', next: 'f' },
      f: { speaker: null, text: '«Siapa yang akan mengingat nama kami?»', next: 'g' },
      g: {
        speaker: 'Orin',
        text: 'Mereka semua seperti sedang mencari seseorang.',
        next: 'h',
      },
      h: {
        speaker: null,
        text: 'Cahaya menyebar dari ukiran menuju tanah. Orin melihat sekilas sebuah tempat yang tidak dikenalnya, dipenuhi bangunan batu dan cahaya bintang. Lalu cahaya menghilang. Orin terduduk sejenak.',
        next: 'i',
      },
      i: { speaker: 'Mira', text: 'Orin! Kau tidak apa-apa?', next: 'j' },
      j: {
        speaker: 'Orin',
        text: 'Aku baik-baik saja. Hanya sedikit pusing. Suara-suara itu… mereka tidak hanya ingin didengar. Rasanya mereka takut benar-benar dilupakan.',
        next: 'k',
      },
      k: {
        speaker: 'Mira',
        text: 'Kalau begitu, mungkin kita perlu mengetahui siapa mereka sebelum mencoba menjawab panggilan itu.',
        effects: { flag: 'ch2_resonance_event_completed' },
      },
    },
  },
  {
    id: 'ch2_mira_personal_scene',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Menjelang sore, Orin dan Mira berhenti di dekat aliran sungai kecil. Suara hutan terdengar lebih tenang daripada sebelumnya.',
        next: 'b',
      },
      b: { speaker: 'Mira', text: 'Orin, boleh aku bertanya sesuatu?', next: 'c' },
      c: { speaker: 'Orin', text: 'Tentu.', next: 'd' },
      d: {
        speaker: 'Mira',
        text: 'Kenapa kau terus mencari jawaban tentang suara-suara itu?',
        next: 'e',
      },
      e: {
        speaker: 'Orin',
        text: 'Karena aku merasa semuanya saling terhubung. Sejak kejadian di desa, aku terus melihat orang-orang kehilangan bagian dari hidup mereka. Aku tidak ingin hanya berjalan pergi seolah-olah semuanya tidak pernah terjadi.',
        next: 'f',
      },
      f: {
        speaker: 'Mira',
        text: 'Aku mengerti. Awalnya aku hanya ingin mengetahui apa yang terjadi di desa. Tapi setelah melihat hutan ini, aku sadar masalahnya jauh lebih besar.',
        next: 'g',
      },
      g: { speaker: 'Orin', text: 'Kau bisa kembali jika ingin.', next: 'h' },
      h: {
        speaker: 'Mira',
        text: 'Aku tahu. Tapi aku belum ingin kembali. Ada terlalu banyak hal yang belum kita pahami. Dan sepertinya perjalanan ini tidak akan menjadi lebih mudah jika kita menghadapinya sendirian.',
        next: 'i',
      },
      i: { speaker: 'Orin', text: 'Kalau begitu, kita lanjutkan bersama.', next: 'j' },
      j: {
        speaker: 'Mira',
        text: 'Ya. Tapi satu hal — kalau nanti kau mendengar suara aneh lagi, jangan langsung menyentuh apa pun.',
        next: 'k',
      },
      k: {
        speaker: 'Orin',
        text: 'Aku akan mencoba mengingatnya.',
        next: 'l',
      },
      l: {
        speaker: 'Mira',
        text: 'Pastikan kau benar-benar mengingatnya.',
        effects: { flag: 'ch2_mira_committed' },
      },
    },
  },
  {
    id: 'ch2_northern_path',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Di ujung utara hutan, jalur batu menipis dan menyatu dengan jalan tanah yang lebih lebar. Di kejauhan, kontur jalan menuju Bellhaven mulai terlihat.',
        next: 'b',
      },
      b: {
        speaker: 'Mira',
        text: 'Ini pasti jalur yang disebut Elara.',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Bellhaven… kita akan mencari jawaban di sana.',
        effects: { flag: 'ch2_northern_path_unlocked' },
      },
    },
  },
  {
    id: 'ch2_finale',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Hutan Berbisik tertinggal di belakang mereka. Suara daun masih terdengar, tetapi panggilan yang sempat memanggil nama Orin tidak lagi mengikutinya.',
        next: 'b',
      },
      b: {
        speaker: 'Mira',
        text: 'Kita tidak menemukan siapa yang memanggil. Tapi kita tahu ke mana harus melangkah.',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Bellhaven. Catatan Resonance. Dan mungkin jawaban tentang nama-nama yang hilang.',
        next: 'd',
      },
      d: {
        speaker: 'Mira',
        text: 'Bersama.',
        choices: [
          {
            text: 'Melanjutkan ke jalan Bellhaven.',
            next: null,
            effects: { flag: 'ch2_completed', chapterHook: 'chapter_03' },
          },
        ],
      },
    },
  },
  // Side: Elara notes
  {
    id: 'ch2_elara_notes_offer',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Elara',
        text: 'Ada beberapa catatan yang kutinggalkan di sepanjang jalan batu. Sebagian berisi pengamatan tentang ukiran kuno.',
        choices: [
          {
            text: 'Kami akan mencarinya.',
            next: 'ok',
            effects: { acceptQuest: 'quest_ch2_catatan_tercecer' },
          },
          { text: 'Nanti saja.', next: 'no' },
        ],
      },
      ok: {
        speaker: 'Elara',
        text: 'Terima kasih. Tidak semua yang tertulis di sana bisa kupulihkan, tetapi aku tidak ingin kehilangan sisanya.',
      },
      no: { speaker: 'Elara', text: 'Baiklah.' },
    },
  },
  {
    id: 'ch2_elara_notes_done',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Elara',
        text: 'Terima kasih. Ternyata masih ada beberapa bagian yang bisa dibaca. Ada satu catatan tentang jalur utara. Aku akan menyimpannya dengan lebih baik kali ini.',
        effects: { completeQuest: 'quest_ch2_catatan_tercecer' },
      },
    },
  },
  // Side: Rhea
  {
    id: 'ch2_rhea_first',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Rhea',
        text: 'Dulu aku sering datang ke sini bersama seseorang. Kami biasa duduk di dekat aliran sungai dan mendengarkan suara hutan.',
        next: 'b',
      },
      b: {
        speaker: 'Rhea',
        text: 'Dia masih mengenaliku, tapi sepertinya ada sesuatu yang berubah. Aku hanya ingin tahu apakah dia masih mengingat tempat ini.',
        choices: [
          {
            text: 'Kami akan membantu mencari tahu.',
            next: 'ok',
            effects: { acceptQuest: 'quest_ch2_panggilan_tak_terjawab', flag: 'ch2_rhea_met' },
          },
          { text: 'Maaf, kami harus pergi.', next: 'no' },
        ],
      },
      ok: {
        speaker: 'Rhea',
        text: 'Coba periksa dekat sungai. Mungkin masih ada sesuatu yang tersisa.',
      },
      no: { speaker: 'Rhea', text: 'Baiklah.' },
    },
  },
  {
    id: 'ch2_rhea_done',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Rhea',
        text: 'Jadi, dia memang pernah berada di sini. Tidak apa-apa. Setidaknya sekarang aku tahu bahwa tempat ini masih menyimpan jejak kami.',
        effects: { completeQuest: 'quest_ch2_panggilan_tak_terjawab' },
      },
    },
  },
  {
    id: 'ch2_rhea_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Rhea',
        text: 'Aku masih datang ke sini sesekali. Kadang-kadang cukup duduk diam di dekat sungai.',
      },
    },
  },
  // Landmarks
  {
    id: 'ch2_obj_ancient_tree',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Batang pohon ini dipenuhi goresan lama. Sebagian membentuk pola yang menyerupai ukiran pada jalan batu.',
      },
    },
  },
  {
    id: 'ch2_obj_silent_stone',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Batu itu terasa dingin saat disentuh. Tidak ada cahaya yang muncul, tetapi Orin merasa pernah melihat pola serupa.',
      },
    },
  },
  {
    id: 'ch2_obj_trail_marker',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Penanda jalan ini hampir tertutup lumut. Arah yang ditunjukkannya mengarah ke utara.',
      },
    },
  },
  {
    id: 'ch2_obj_stream',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Air mengalir tanpa suara yang berarti. Di antara gemericiknya, Orin merasa mendengar bisikan yang sangat jauh. Sebuah pita kecil terikat pada akar pohon.',
        effects: { flag: 'ch2_stream_ribbon_found' },
      },
    },
  },
];

export const CHAPTER_02_SCENE_IDS = CHAPTER_02_DIALOGUES.map((d) => d.id);
