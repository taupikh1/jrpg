/**
 * Chapter 4 — The Archive Without Names
 * All player-facing text: Bahasa Indonesia
 */

export const CHAPTER_04_DIALOGUES = [
  {
    id: 'ch4_archive_first_entry',
    startNode: 'n0',
    nodes: {
      n0: {
        speaker: null,
        text: 'Di balik pintu besar itu, udara terasa lebih dingin. Rak-rak batu menjulang hingga mendekati langit-langit, dipenuhi buku, gulungan, dan lembaran perkamen. Namun, hampir semua sampulnya kosong.',
        next: 'n1',
      },
      n1: {
        speaker: null,
        text: 'Beberapa pengunjung berdiri di depan rak, membaca halaman-halaman yang tampaknya tidak lagi menyimpan nama siapa pun.',
        next: 'n2',
      },
      n2: { speaker: 'Mira', text: 'Ini pasti arsip yang disebut Garet.', next: 'n3' },
      n3: { speaker: 'Orin', text: 'Lihat sampul buku itu. Sepertinya nama penulisnya pernah ada di sana.', next: 'n4' },
      n4: {
        speaker: null,
        text: 'Di ujung aula, seorang perempuan berjubah biru tua memperhatikan mereka. Ia menutup buku yang sedang dibacanya, lalu menghampiri.',
        next: 'n5',
      },
      n5: { speaker: 'Maera Voss', text: 'Kalian rombongan yang disebut Garet?', next: 'n6' },
      n6: {
        speaker: 'Orin',
        text: 'Benar. Kami datang karena ingin mengetahui apa yang terjadi pada arsip ini.',
        next: 'n7',
      },
      n7: {
        speaker: 'Maera Voss',
        text: 'Kalau begitu, kalian datang pada waktu yang tepat. Atau justru terlambat. Aku sendiri mulai kesulitan membedakannya.',
        next: 'n8',
      },
      n8: {
        speaker: 'Maera Voss',
        text: 'Namaku Maera Voss. Aku penjaga utama tempat ini.',
        next: 'n9',
      },
      n9: { speaker: 'Mira', text: 'Apa yang terjadi pada buku-buku di sini?', next: 'n10' },
      n10: {
        speaker: 'Maera Voss',
        text: 'Nama-nama menghilang. Awalnya hanya satu atau dua. Sekarang, beberapa catatan kehilangan nama penulis, pemilik, bahkan orang-orang yang disebut di dalamnya.',
        next: 'n11',
      },
      n11: { speaker: 'Orin', text: 'Apakah orang-orang itu juga kehilangan ingatan?', next: 'n12' },
      n12: {
        speaker: 'Maera Voss',
        text: 'Sebagian. Sebagian lainnya masih mengingat kisahnya, tetapi tidak lagi bisa menyebutkan siapa yang ada di dalamnya.',
        next: 'n13',
      },
      n13: {
        speaker: 'Maera Voss',
        text: 'Itulah yang paling menakutkan. Mereka masih tahu bahwa seseorang pernah berarti bagi mereka. Hanya namanya yang tidak bisa mereka temukan.',
        effects: { flag: 'ch4_entered_archive' },
      },
    },
  },
  {
    id: 'ch4_maera_archive_request',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Maera Voss',
        text: 'Aku tidak meminta kalian memperbaiki seluruh arsip. Itu pekerjaan yang bahkan tidak sanggup kulakukan sendiri.',
        next: 'b',
      },
      b: {
        speaker: 'Maera Voss',
        text: 'Aku hanya ingin kalian memeriksa tiga catatan yang berubah paling cepat.',
        next: 'c',
      },
      c: { speaker: 'Orin', text: 'Di mana kami harus mulai?', next: 'd' },
      d: {
        speaker: 'Maera Voss',
        text: 'Rak Timur menyimpan catatan perjalanan. Rak Tengah menyimpan surat-surat lama. Rak Barat menyimpan daftar penduduk yang pernah tinggal di Bellhaven.',
        next: 'e',
      },
      e: {
        speaker: 'Nilo',
        text: 'Jangan lupa memeriksa tanda Resonance di dekat rak tengah!',
        next: 'f',
      },
      f: { speaker: 'Maera Voss', text: 'Nilo, biarkan mereka memahami tugasnya terlebih dahulu.', next: 'g' },
      g: {
        speaker: 'Nilo',
        text: 'Maaf, Bu Maera. Aku hanya… tidak ingin kejadian kemarin terulang.',
        next: 'h',
      },
      h: {
        speaker: 'Maera Voss',
        text: 'Temukan tiga catatan itu. Jangan mencoba mengisi nama yang hilang dengan tebakan. Kita harus mengetahui apa yang sebenarnya terjadi.',
        choices: [
          {
            text: 'Kami akan memeriksanya.',
            next: 'c1',
            effects: { flag: 'ch4_archive_investigation_started' },
          },
          {
            text: 'Kenapa tidak meminta bantuan penjaga kota?',
            next: 'c2',
            effects: { flag: 'ch4_archive_investigation_started' },
          },
        ],
      },
      c1: {
        speaker: 'Maera Voss',
        text: 'Terima kasih. Berhati-hatilah saat menyentuh halaman yang bergetar. Beberapa catatan bereaksi terhadap Resonance.',
      },
      c2: {
        speaker: 'Maera Voss',
        text: 'Sudah. Mereka melihat buku-buku kosong dan menganggapnya kerusakan biasa. Mereka tidak melihat orang-orang yang mulai lupa siapa yang mereka cari.',
      },
    },
  },
  {
    id: 'ch4_maera_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Maera Voss',
        text: 'Masih banyak catatan yang harus diperiksa. Jangan terburu-buru menyimpulkan sesuatu hanya dari satu halaman.',
      },
    },
  },
  {
    id: 'ch4_maera_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Maera Voss',
        text: 'Aku mulai menuliskan kembali hal-hal yang masih kuingat. Mungkin suatu hari nanti seseorang akan menemukan catatan ini dan tahu bahwa kami pernah berusaha mempertahankan kisah-kisah itu.',
      },
    },
  },
  {
    id: 'ch4_nilo_moving_record',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Nilo',
        text: 'Kalian datang! Aku sudah menunggu seseorang yang bisa melihat apa yang kulihat.',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Apa yang terjadi?', next: 'c' },
      c: {
        speaker: 'Nilo',
        text: 'Halaman ini berubah sendiri. Kemarin masih ada nama di bagian atasnya. Tadi pagi, namanya hilang. Lalu kalimat terakhirnya berubah.',
        next: 'd',
      },
      d: { speaker: 'Mira', text: 'Berubah menjadi apa?', next: 'e' },
      e: {
        speaker: 'Nilo',
        text: 'Awalnya tertulis, «Aku akan kembali sebelum musim hujan.» Sekarang hanya tersisa, «Aku akan kembali sebelum…»',
        next: 'f',
      },
      f: { speaker: 'Orin', text: 'Kami akan memeriksanya.', next: 'g' },
      g: {
        speaker: 'Nilo',
        text: 'Kalau begitu, jangan tinggalkan halaman ini terlalu lama. Aku merasa sesuatu sedang menunggu di dalamnya.',
        next: 'h',
      },
      h: {
        speaker: null,
        text: 'Ketika Orin menyentuh tepi halaman, seberkas cahaya tipis muncul di antara serat kertas. Sesaat, terdengar suara seseorang memanggil dari kejauhan.',
        next: 'i',
      },
      i: { speaker: null, text: '«Jangan biarkan… namaku…»', next: 'j' },
      j: {
        speaker: null,
        text: 'Cahaya itu padam. Halaman kembali kosong.',
        next: 'k',
      },
      k: { speaker: 'Mira', text: 'Kau mendengarnya juga?', next: 'l' },
      l: {
        speaker: 'Orin',
        text: 'Ya. Sepertinya halaman itu menyimpan lebih dari sekadar tulisan.',
        effects: { flag: 'ch4_nilo_record_seen' },
      },
    },
  },
  {
    id: 'ch4_nilo_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Nilo',
        text: 'Aku sudah memeriksa halaman itu berkali-kali. Tetap saja, ada bagian yang tidak mau kembali.',
      },
    },
  },
  {
    id: 'ch4_nilo_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Nilo',
        text: 'Aku akan belajar merawat arsip ini dengan lebih baik. Kalau suatu hari ada nama yang kembali, aku ingin menjadi orang pertama yang melihatnya.',
      },
    },
  },
  {
    id: 'ch4_teren_ink_record',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Teren',
        text: 'Jangan sentuh meja itu dulu. Ada beberapa lembar yang sedang kuperbaiki.',
        next: 'b',
      },
      b: {
        speaker: 'Orin',
        text: 'Kami diminta memeriksa catatan yang kehilangan nama.',
        next: 'c',
      },
      c: { speaker: 'Teren', text: 'Kalau begitu, kalian harus melihat ini.', next: 'd' },
      d: {
        speaker: 'Teren',
        text: 'Tinta di halaman ini tidak memudar. Tidak ada bekas air, panas, atau goresan. Seolah-olah tulisannya tidak pernah ada.',
        next: 'e',
      },
      e: {
        speaker: 'Teren',
        text: 'Aku sudah mencoba berbagai cara untuk mengembalikannya. Tidak ada yang berhasil.',
        next: 'f',
      },
      f: {
        speaker: 'Teren',
        text: 'Kalau kalian menemukan cara untuk membaca halaman itu, beri tahu aku. Aku ingin tahu apakah pekerjaanku selama ini masih ada artinya.',
        effects: { flag: 'ch4_teren_record_seen' },
      },
    },
  },
  {
    id: 'ch4_teren_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Teren',
        text: 'Jangan menilai sebuah catatan hanya dari bagian yang sudah hilang. Kadang-kadang, bagian yang tersisa justru yang paling penting.',
      },
    },
  },
  {
    id: 'ch4_teren_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Teren',
        text: 'Aku sudah mulai menyusun katalog baru. Tidak sempurna, tapi setidaknya masih ada sesuatu yang bisa kita wariskan.',
      },
    },
  },
  {
    id: 'ch4_edda_brother_memory',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Edda', text: 'Maaf… apakah kalian bisa membantu?', next: 'b' },
      b: { speaker: 'Orin', text: 'Apa yang bisa kami lakukan?', next: 'c' },
      c: {
        speaker: 'Edda',
        text: 'Aku mencari catatan tentang keluargaku. Katanya arsip ini menyimpan daftar penduduk lama.',
        next: 'd',
      },
      d: {
        speaker: 'Edda',
        text: 'Aku tahu aku punya seorang kakak. Aku ingat suaranya, cara dia tertawa, bahkan kebiasaannya mengetuk meja saat berpikir.',
        next: 'e',
      },
      e: {
        speaker: 'Edda',
        text: 'Tapi namanya… aku tidak bisa mengingat namanya.',
        next: 'f',
      },
      f: {
        speaker: 'Edda',
        text: 'Setiap kali aku merasa hampir mengingatnya, ada sesuatu yang menghilangkan bagian terakhir itu.',
        next: 'g',
      },
      g: {
        speaker: 'Edda',
        text: 'Aku tidak ingin melupakan bahwa dia pernah ada.',
        choices: [
          {
            text: 'Kami akan membantumu mencari catatannya.',
            next: 'c1',
            effects: { flag: 'ch4_edda_help_promised' },
          },
          {
            text: 'Kami belum tahu apakah catatan itu bisa dipulihkan.',
            next: 'c2',
            effects: { flag: 'ch4_edda_honest_response' },
          },
        ],
      },
      c1: {
        speaker: 'Edda',
        text: 'Terima kasih. Aku tidak tahu apakah namanya masih bisa ditemukan. Tapi aku ingin mencoba.',
        effects: { flag: 'ch4_edda_record_seen' },
      },
      c2: {
        speaker: 'Edda',
        text: 'Aku mengerti. Aku hanya… tidak ingin berhenti mencari.',
        effects: { flag: 'ch4_edda_record_seen' },
      },
    },
  },
  {
    id: 'ch4_edda_repeat',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Edda',
        text: 'Aku masih mencoba mengingat suaranya. Ada beberapa hal kecil yang belum hilang.',
      },
    },
  },
  {
    id: 'ch4_edda_resolution',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Edda', text: 'Kalian menemukan sesuatu?', next: 'b' },
      b: {
        speaker: 'Orin',
        text: 'Kami menemukan sebuah catatan. Tapi belum ada nama yang berhasil dipulihkan.',
        next: 'c',
      },
      c: { speaker: 'Edda', text: 'Begitu, ya.', next: 'd' },
      d: {
        speaker: 'Edda',
        text: 'Aku tidak tahu apakah aku masih akan mengingat wajah kakakku besok. Tapi hari ini aku masih ingat bagaimana dia membuatku tertawa.',
        next: 'e',
      },
      e: {
        speaker: 'Orin',
        text: 'Itu tetap bagian dari dirinya.',
        next: 'f',
      },
      f: {
        speaker: 'Edda',
        text: 'Aku akan terus menuliskan apa pun yang masih kuingat. Aku tidak akan membiarkan kisahnya berhenti di sini.',
        effects: { flag: 'ch4_edda_resolved' },
      },
    },
  },
  {
    id: 'ch4_edda_after',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Edda',
        text: 'Aku menuliskan semua yang masih kuingat tentang kakakku. Aku tidak tahu apakah namanya akan kembali, tetapi aku tidak akan membiarkan kisahnya berhenti di sini.',
      },
    },
  },
  {
    id: 'ch4_three_records_resonance',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Ketiga catatan yang kalian periksa mulai memancarkan cahaya yang sama. Cahaya itu bergerak perlahan, seolah-olah sedang mencari sesuatu.',
        next: 'b',
      },
      b: { speaker: 'Mira', text: 'Ketiganya bereaksi bersamaan.', next: 'c' },
      c: {
        speaker: 'Orin',
        text: 'Bukan pola tulisan. Rasanya lebih seperti… sesuatu yang pernah terjadi.',
        next: 'd',
      },
      d: {
        speaker: null,
        text: 'Cahaya dari ketiga catatan berkumpul di sebuah rak tua. Di baliknya terdapat pintu kecil yang tertutup lapisan debu.',
        next: 'e',
      },
      e: { speaker: 'Mira', text: 'Ada ruang lain di belakang rak itu.', next: 'f' },
      f: {
        speaker: 'Maera Voss',
        text: 'Tidak mungkin. Ruang itu sudah lama ditutup. Karena catatan yang disimpan di sana tidak lagi dapat dibaca siapa pun. Termasuk aku.',
        effects: { flag: 'ch4_three_records_resonated' },
      },
    },
  },
  {
    id: 'ch4_restricted_archive_entry',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Ruangan itu jauh lebih kecil daripada aula utama. Tidak ada jendela, hanya sebuah meja batu dan lemari kaca yang dipenuhi lembaran tipis.',
        next: 'b',
      },
      b: {
        speaker: null,
        text: 'Di tengah meja terletak sebuah buku tanpa sampul. Halaman pertamanya kosong, tetapi cahaya samar bergerak di bawah permukaannya.',
        next: 'c',
      },
      c: { speaker: 'Maera Voss', text: 'Aku belum pernah melihat buku itu menyala.', next: 'd' },
      d: {
        speaker: 'Maera Voss',
        text: 'Catatan inventarisnya juga kehilangan nama. Yang tersisa hanya tanggal dan satu kalimat: «Jangan simpan kenangan hanya karena kau takut kehilangan seseorang.»',
        next: 'e',
      },
      e: {
        speaker: null,
        text: 'Ketika Orin mendekat, cahaya di bawah halaman bergerak semakin cepat.',
        next: 'f',
      },
      f: { speaker: null, text: '«Yang hilang bukan selalu yang dilupakan.»', next: 'g' },
      g: { speaker: null, text: '«Yang tersisa… adalah ikatan.»', next: 'h' },
      h: {
        speaker: null,
        text: 'Seluruh ruangan bergetar. Sebuah simbol muncul di halaman kosong, lalu perlahan membentuk pola bintang. Untuk sesaat, Orin melihat bayangan seseorang menulis dengan tangan gemetar.',
        next: 'i',
      },
      i: {
        speaker: null,
        text: '«Jika suatu hari namaku hilang, jangan biarkan mereka menghapus alasan aku pernah menulis.»',
        next: 'j',
      },
      j: {
        speaker: null,
        text: 'Bayangan itu lenyap. Sebuah lembaran kecil tertinggal di atas meja.',
        effects: { flag: 'ch4_restricted_seen' },
      },
    },
  },
  {
    id: 'ch4_fragment_discovery',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Orin', text: 'Ini bukan halaman biasa.', next: 'b' },
      b: { speaker: 'Mira', text: 'Ada tulisan di bagian bawahnya.', next: 'c' },
      c: {
        speaker: null,
        text: '«Resonance bukanlah tempat kenangan bersembunyi. Resonance adalah hubungan yang membuat kenangan tetap berarti.»',
        next: 'd',
      },
      d: {
        speaker: 'Maera Voss',
        text: 'Atau penjelasan dari seseorang yang pernah memahami fenomena ini lebih baik daripada kita.',
        next: 'e',
      },
      e: {
        speaker: null,
        text: 'Di sisi belakang lembaran terdapat simbol bintang yang sama dengan cahaya yang muncul di dalam buku.',
        next: 'f',
      },
      f: {
        speaker: 'Maera Voss',
        text: 'Ada tempat yang mungkin bisa membantu. Sebuah jalur penelitian lama yang disebut dalam catatan wilayah utara. Tetapi aku tidak bisa memastikan apakah tempat itu masih ada.',
        effects: { flag: 'ch4_fragment_found' },
      },
    },
  },
  {
    id: 'ch4_maera_finale',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Maera Voss',
        text: 'Kalian membawa fragmen itu. Arsip ini sudah menyimpannya terlalu lama tanpa memahami artinya.',
        next: 'b',
      },
      b: {
        speaker: 'Maera Voss',
        text: 'Aku akan menuliskan apa yang masih kuingat. Jangan menunggu sampai semuanya hilang baru mencoba mempertahankannya.',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Kami akan mencari tahu asal simbol ini.',
        next: 'd',
      },
      d: {
        speaker: null,
        text: 'Di luar jendela, lonceng Bellhaven mulai berbunyi. Cahaya pagi menyentuh halaman-halaman kosong di dalam arsip. Beberapa nama mungkin telah hilang, tetapi kisah yang pernah mereka tinggalkan belum sepenuhnya lenyap.',
        next: 'e',
      },
      e: { speaker: 'Mira', text: 'Kita punya petunjuk baru.', next: 'f' },
      f: {
        speaker: 'Orin',
        text: 'Kita akan mencari tahu ke mana fragmen ini membawa kita.',
        choices: [
          {
            text: 'Tutup Bab 4.',
            next: null,
            effects: { flag: 'ch4_completed', chapterHook: 'chapter_05' },
          },
        ],
      },
    },
  },
  // side quest dialogues
  {
    id: 'ch4_nilo_letter_offer',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Nilo',
        text: 'Aku menemukan surat ini di antara catatan lama. Tidak ada nama pengirim, tidak ada nama penerima. Tapi bagian akhirnya masih terbaca: seseorang menulis bahwa ia akan selalu menunggu di dekat air mancur.',
        choices: [
          {
            text: 'Kami akan mencari tahu.',
            next: 'ok',
            effects: { acceptQuest: 'quest_ch4_surat_tanpa_nama' },
          },
          { text: 'Lain kali saja.', next: 'no' },
        ],
      },
      ok: {
        speaker: 'Nilo',
        text: 'Terima kasih. Coba periksa air mancur di alun-alun.',
      },
      no: { speaker: 'Nilo', text: 'Baiklah. Aku akan menyimpannya dulu.' },
    },
  },
  {
    id: 'ch4_nilo_letter_done',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Nilo',
        text: 'Jadi seseorang memang pernah menunggu di sana. Kita mungkin tidak akan tahu siapa mereka. Tapi sekarang setidaknya pesan itu tidak hilang begitu saja.',
        effects: { completeQuest: 'quest_ch4_surat_tanpa_nama' },
      },
    },
  },
  {
    id: 'ch4_teren_catalog_offer',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Teren',
        text: 'Aku sedang menyusun ulang katalog yang tercecer. Beberapa lembar masih memiliki tanggal, tetapi nama pemiliknya lenyap. Aku tidak ingin membuangnya.',
        choices: [
          {
            text: 'Kami akan membantu mengumpulkannya.',
            next: 'ok',
            effects: { acceptQuest: 'quest_ch4_katalog_kosong' },
          },
          { text: 'Nanti saja.', next: 'no' },
        ],
      },
      ok: {
        speaker: 'Teren',
        text: 'Cari tiga lembar katalog di sekitar rak. Bawa ke sini.',
      },
      no: { speaker: 'Teren', text: 'Baik.' },
    },
  },
  {
    id: 'ch4_teren_catalog_done',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Teren',
        text: 'Kalian berhasil mengumpulkan semuanya. Aku akan menyimpan bagian yang masih tersisa. Kalau kita tidak bisa menyelamatkan semuanya, bukan berarti kita harus membuang apa yang masih ada.',
        effects: { completeQuest: 'quest_ch4_katalog_kosong' },
      },
    },
  },
  {
    id: 'ch4_obj_record_east',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Catatan perjalanan di Rak Timur. Beberapa tanggal masih terbaca, tetapi nama penulisnya kosong. Kertasnya sedikit bergetar.',
        effects: { flag: 'ch4_record_east' },
      },
    },
  },
  {
    id: 'ch4_obj_record_center',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Surat-surat lama di Rak Tengah. Kalimat terakhir terputus di tengah kata, seolah tinta berhenti sebelum selesai.',
        effects: { flag: 'ch4_record_center' },
      },
    },
  },
  {
    id: 'ch4_obj_record_west',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Daftar penduduk Rak Barat. Banyak baris kosong di kolom nama. Satu baris masih menyimpan deskripsi: «Saudara yang selalu mengetuk meja.»',
        effects: { flag: 'ch4_record_west' },
      },
    },
  },
  {
    id: 'ch4_obj_nameless_book',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Buku tanpa sampul di meja batu. Cahaya samar bergerak di bawah halaman.',
      },
    },
  },
  {
    id: 'ch4_obj_fragment',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Lembaran kecil dengan simbol bintang. Ini fragmen yang disebutkan dalam catatan Resonance.',
      },
    },
  },
  {
    id: 'ch4_obj_fountain_inscription',
    startNode: 'a',
    nodes: {
      a: {
        speaker: null,
        text: 'Di dekat kaki air mancur, ukiran kecil hampir tertutup lumut: «Untuk seseorang yang selalu pulang.»',
        effects: { flag: 'ch4_fountain_inscription_seen' },
      },
    },
  },
  {
    id: 'ch4_boss_veilkeeper_phase2',
    startNode: 'start',
    nodes: {
      start: {
        speaker: 'Penjaga Selubung Arsip',
        text: 'CATATAN TIDAK SAH. NAMA TIDAK TERDAFTAR. SEMUA JEJAK HARUS DIHAPUS.',
        next: 'orin',
      },
      orin: {
        speaker: 'Orin',
        text: 'Kami tidak datang untuk merampas arsip ini. Kami hanya ingin tahu siapa yang sengaja mengosongkannya.',
      },
    },
  },

];

export const CHAPTER_04_SCENE_IDS = CHAPTER_04_DIALOGUES.map((d) => d.id);
