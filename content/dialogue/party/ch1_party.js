/**
 * Party / companion interactions — Chapter 1 (Orin & Mira).
 * Respect knowledge matrix: no future secrets.
 */

export const DIALOGUE_CH1_PARTY_ORIN_MIRA_TRAVEL = {
  id: 'ch1_party_orin_mira_travel',
  startNode: 'path',
  nodes: {
    path: {
      speaker: 'Mira Solenne',
      text: 'Desamu tenang. Terlalu tenang untuk desa yang sedang kehilangan nama.',
      next: 'orin',
    },
    orin: {
      speaker: 'Orin Vale',
      text: 'Aku tumbuh di sini. Kalau Ashwillow bisa lupa, aku takut aku juga suatu hari lupa kenapa aku tinggal.',
      next: 'mira',
    },
    mira: {
      speaker: 'Mira Solenne',
      text: 'Maka kita catat. Bukan hanya di kertas—di langkah, di percakapan. Aku tidak mau jadi orang yang hanya ingat tinta.',
      choices: [
        {
          text: 'Terima kasih sudah ikut.',
          next: 'thanks',
        },
        {
          text: 'Kau tidak takut?',
          next: 'fear',
        },
      ],
    },
    thanks: {
      speaker: 'Mira Solenne',
      text: 'Jangan berterima kasih dulu. Berterima kasih setelah kita punya satu nama yang kembali.',
    },
    fear: {
      speaker: 'Mira Solenne',
      text: 'Takut. Tapi lebih takut membiarkan peta bohong tanpa saksi.',
    },
  },
};

export const DIALOGUE_CH1_PARTY_AFTER_FRAGMENT = {
  id: 'ch1_party_after_fragment',
  startNode: 'show',
  nodes: {
    show: {
      speaker: 'Orin Vale',
      text: 'Batu ini berdenyut. Aku tidak tahu harus menyebutnya apa.',
      next: 'mira',
    },
    mira: {
      speaker: 'Mira Solenne',
      text: 'Di Bellhaven orang bilang Resonansi. Aku bilang: jangan menelannya. Simpan, amati, bandingkan dengan tempat yang "bolong".',
      next: 'orin',
    },
    orin: {
      speaker: 'Orin Vale',
      text: 'Saat kupegang, desa terasa lebih jelas sebentar. Lalu rapuh lagi.',
      next: 'mira2',
    },
    mira2: {
      speaker: 'Mira Solenne',
      text: 'Itu petunjuk, bukan jawaban. Kita butuh lebih dari satu denyut untuk memahami pola.',
    },
  },
};

export const DIALOGUE_CH1_PARTY_AFTER_SLIP = {
  id: 'ch1_party_after_slip',
  startNode: 'react',
  nodes: {
    react: {
      speaker: 'Mira Solenne',
      text: 'Mereka lupa festival yang sama dalam satu napas. Itu bukan penyakit biasa.',
      next: 'orin',
    },
    orin: {
      speaker: 'Orin Vale',
      text: 'Aku marah. Dan takut. Tapi aku tidak mau berdiri diam sambil nama-nama menguap.',
      next: 'mira',
    },
    mira: {
      speaker: 'Mira Solenne',
      text: 'Kalau begitu kita berjalan. Hutan dulu. Bellhaven nanti. Satu garis di peta demi satu garis.',
    },
  },
};

export const CHAPTER_01_PARTY_DIALOGUES = [
  DIALOGUE_CH1_PARTY_ORIN_MIRA_TRAVEL,
  DIALOGUE_CH1_PARTY_AFTER_FRAGMENT,
  DIALOGUE_CH1_PARTY_AFTER_SLIP,
];
