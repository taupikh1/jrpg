/** Chapter 4 party banter */

export const CHAPTER_04_PARTY = [
  {
    id: 'ch4_party_archive_entry',
    startNode: 'a',
    nodes: {
      a: {
        speaker: 'Mira',
        text: 'Tempat ini membuatku merasa seolah-olah sedang berjalan di dalam ingatan seseorang.',
        next: 'b',
      },
      b: { speaker: 'Orin', text: 'Karena semua benda di sini menyimpan sesuatu?', next: 'c' },
      c: {
        speaker: 'Mira',
        text: 'Mungkin. Tapi aku juga merasa ada sesuatu yang sedang mencoba dilupakan.',
        next: 'd',
      },
      d: { speaker: 'Orin', text: 'Kalau begitu, jangan sampai kita ikut melupakannya.' },
    },
  },
  {
    id: 'ch4_party_edda_memory',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Orin', text: 'Kita belum berhasil menemukan nama kakaknya.', next: 'b' },
      b: {
        speaker: 'Mira',
        text: 'Setidaknya kita bisa membantunya menjaga hal-hal yang masih dia ingat.',
        next: 'c',
      },
      c: {
        speaker: 'Orin',
        text: 'Seseorang tidak seharusnya menghadapi semuanya sendirian.',
      },
    },
  },
  {
    id: 'ch4_party_three_records',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Kalian merasakan getaran yang sama?', next: 'b' },
      b: {
        speaker: 'Orin',
        text: 'Ya. Seolah-olah ketiga catatan itu saling mengenal.',
        next: 'c',
      },
      c: {
        speaker: 'Mira',
        text: 'Mungkin yang menghubungkan mereka bukan tulisannya, melainkan orang-orang di baliknya.',
      },
    },
  },
  {
    id: 'ch4_party_restricted_room',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Orin', text: 'Ruangan ini terasa berbeda. Resonance di sini lebih kuat.', next: 'b' },
      b: {
        speaker: 'Mira',
        text: 'Jangan bertindak gegabah. Kita belum tahu apa yang disimpan di tempat ini.',
      },
    },
  },
  {
    id: 'ch4_party_archive_departure',
    startNode: 'a',
    nodes: {
      a: { speaker: 'Mira', text: 'Aku masih memikirkan kata-kata Maera.', next: 'b' },
      b: {
        speaker: 'Orin',
        text: 'Tentang menjaga sesuatu sebelum semuanya hilang?',
        next: 'c',
      },
      c: {
        speaker: 'Mira',
        text: 'Ya. Mungkin kita terlalu sering menganggap kenangan akan selalu ada.',
        next: 'd',
      },
      d: { speaker: 'Orin', text: 'Padahal sesuatu yang berarti tetap perlu dijaga.' },
    },
  },
];
