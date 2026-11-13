/**
 * NPCs and environmental dialogue — Jalan Menuju Bellhaven (Chapter 3 approach)
 * Player-facing text: Bahasa Indonesia
 */

export const DIALOGUE_ROAD_GUARD = {
  id: 'road_npc_guard_lyn',
  startNode: 'hello',
  nodes: {
    hello: {
      speaker: 'Lyn',
      text: 'Perhentian. Jalan ini aman… sejauh pagi ini. Kalau kau menuju Bellhaven, ikuti debu di tengah, jangan belok ke semak basah.',
      choices: [
        { text: 'Ada bahaya di depan?', next: 'danger' },
        { text: 'Terima kasih, aku lewat.', next: 'bye' },
      ],
    },
    danger: {
      speaker: 'Lyn',
      text: 'Serigala jalanan kadang turun dari semak. Dan orang bilang peta di pos pos tidak cocok satu sama lain. Aneh, tapi bukan urusanku.',
      next: 'bye',
    },
    bye: {
      speaker: 'Lyn',
      text: 'Jaga langkahmu. Kota itu ramai, tapi ramai tidak selalu berarti aman.',
    },
  },
};

export const DIALOGUE_ROAD_MERCHANT = {
  id: 'road_npc_merchant_ode',
  startNode: 'pitch',
  nodes: {
    pitch: {
      speaker: 'Ode',
      text: 'Herb segar, sedikit mahal karena pemetik takut masuk hutan. Kau butuh?',
      choices: [
        { text: 'Tampilkan daganganmu.', next: 'shop_hint' },
        { text: 'Tidak sekarang.', next: 'later' },
      ],
    },
    shop_hint: {
      speaker: 'Ode',
      text: 'Aku hanya bawa sedikit. Kalau kau bantu kumpulkan tiga Bunga Jalan dari tepi jalur, aku tukar dengan Herb dan sedikit koin.',
      choices: [
        {
          text: 'Baik, aku bantu.',
          next: 'accept',
          effects: { acceptQuest: 'quest_bunga_jalan' },
        },
        { text: 'Lain kali saja.', next: 'later' },
      ],
    },
    accept: {
      speaker: 'Ode',
      text: 'Bagus. Bunganya kuning pucat, tumbuh di tepi bebatuan. Jangan petik yang sudah layu.',
    },
    later: {
      speaker: 'Ode',
      text: 'Kalau berubah pikiran, aku masih di sini sampai gerobak ini selesai diperbaiki.',
    },
  },
};

export const DIALOGUE_ROAD_MERCHANT_PROGRESS = {
  id: 'road_npc_merchant_ode_progress',
  startNode: 'wait',
  nodes: {
    wait: {
      speaker: 'Ode',
      text: 'Masih kurang. Tiga Bunga Jalan, utuh. Aku bisa menunggu.',
    },
  },
};

export const DIALOGUE_ROAD_MERCHANT_COMPLETE = {
  id: 'road_npc_merchant_ode_complete',
  startNode: 'done',
  nodes: {
    done: {
      speaker: 'Ode',
      text: 'Bagus sekali. Ini Herb dan beberapa koin. Semoga jalanmu ke Bellhaven tidak seberat gerobakku.',
      effects: { completeQuest: 'quest_bunga_jalan' },
    },
  },
};

export const DIALOGUE_ROAD_SIGN = {
  id: 'road_sign_mile',
  startNode: 'read',
  nodes: {
    read: {
      speaker: null,
      text: 'Batu penanda: «Ashwillow ← ½ hari · Bellhaven → 1 hari». Di bawahnya, goresan baru yang setengah terhapus: «…nama pos… hilang.»',
    },
  },
};

export const DIALOGUE_ROAD_CART = {
  id: 'road_obj_cart',
  startNode: 'look',
  nodes: {
    look: {
      speaker: null,
      text: 'Gerobak patah. Di dalamnya ada catatan perjalanan yang tinta-nya luntur di satu baris — seolah seseorang lupa apa yang baru ditulis.',
    },
  },
};

export const DIALOGUE_ROAD_GATE = {
  id: 'road_obj_gate_view',
  startNode: 'look',
  nodes: {
    look: {
      speaker: null,
      text: 'Di ujung timur, asap tipis dan atap-atap Bellhaven terlihat samar. Gerbang kota masih jauh; penjaga jalan bilang pos masuk ditutup sementara untuk pendataan ulang.',
    },
  },
};

export const ROAD_BELLHAVEN_DIALOGUES = [
  DIALOGUE_ROAD_GUARD,
  DIALOGUE_ROAD_MERCHANT,
  DIALOGUE_ROAD_MERCHANT_PROGRESS,
  DIALOGUE_ROAD_MERCHANT_COMPLETE,
  DIALOGUE_ROAD_SIGN,
  DIALOGUE_ROAD_CART,
  DIALOGUE_ROAD_GATE,
];
