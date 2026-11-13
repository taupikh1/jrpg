/**
 * Side quest vertical slice — Ashwillow
 * QuestLog-compatible definition + full dialogue pack (Indonesian).
 */

/** @type {import('../../../src/engine/gameplay/quests/QuestLog.js').QuestDef} */
export const QUEST_PAGAR_UTARA = {
  id: 'quest_pagar_utara',
  name: 'Pagar yang Goyah',
  description:
    'Jarek, tukang kayu desa, membutuhkan kayu bersih untuk memperbaiki pagar utara yang goyah sejak gejala aneh muncul.',
  prerequisites: [],
  objectives: [
    {
      id: 'collect_clean_wood',
      type: 'collect',
      targetId: 'wood_scrap',
      count: 3,
      description: 'Kumpulkan Kayu Bersih (0/3)',
    },
    {
      id: 'return_jarek',
      type: 'talk',
      targetId: 'character_jarek',
      count: 1,
      description: 'Kembalikan kayu kepada Jarek',
    },
  ],
  rewards: {
    items: [{ id: 'herb', qty: 2 }],
    gold: 15,
  },
};

export const DIALOGUE_QUEST_PAGAR_ACCEPT = {
  id: 'quest_pagar_utara_accept',
  startNode: 'ask',
  nodes: {
    ask: {
      speaker: 'Jarek',
      text: 'Pagar utara goyah. Aku bisa memperbaikinya, tapi stok kayu bersih habis. Pemetik takut masuk jalur hutan.',
      choices: [
        {
          text: 'Aku akan carikan tiga ikat kayu.',
          next: 'accept',
          effects: { acceptQuest: 'quest_pagar_utara' },
        },
        {
          text: 'Belum bisa sekarang.',
          next: 'decline',
        },
      ],
    },
    accept: {
      speaker: 'Jarek',
      text: 'Bagus. Jangan ambil kayu yang sudah hitam. Yang bersih saja—warna pucat, serat lurus.',
      next: 'end',
    },
    decline: {
      speaker: 'Jarek',
      text: 'Baik. Kalau kau berubah pikiran, aku masih di bengkel.',
    },
    end: {
      speaker: null,
      text: 'Jarek kembali mengetuk paku dengan ritme yang dipaksakan, seolah takut lupa lagi.',
    },
  },
};

export const DIALOGUE_QUEST_PAGAR_PROGRESS = {
  id: 'quest_pagar_utara_progress',
  startNode: 'check',
  nodes: {
    check: {
      speaker: 'Jarek',
      text: 'Masih kurang. Tiga ikat. Jangan terburu-buru sampai kau membawa yang lapuk.',
    },
  },
};

export const DIALOGUE_QUEST_PAGAR_COMPLETE = {
  id: 'quest_pagar_utara_complete',
  startNode: 'done',
  nodes: {
    done: {
      speaker: 'Jarek',
      text: 'Ini… bagus. Seratnya lurus. Dengan ini pagar utara bisa berdiri lagi.',
      next: 'thanks',
    },
    thanks: {
      speaker: 'Jarek',
      text: 'Ambil herb ini. Dan sedikit uang. Kalau langit aneh lagi, setidaknya desa punya batas yang jelas.',
      next: 'end',
      effects: { completeQuest: 'quest_pagar_utara' },
    },
    end: {
      speaker: null,
      text: 'Di kejauhan, angin menabrak pagar yang baru dikencangkan. Bunyinya solid—sebuah janji kecil di hari yang retak.',
    },
  },
};
