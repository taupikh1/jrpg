/** Chapter 5 main + side quests */

export const QUEST_CH5_RESONANSI = {
  id: 'quest_ch5_resonansi_pertama',
  name: 'Resonansi Pertama',
  description:
    'Fragmen arsip bereaksi. Orin dan Mira harus mengikuti jejak Resonance hingga situs kuno dan memahami ancaman The Stillness terhadap jaring ingatan dunia.',
  prerequisites: [],
  objectives: [
    { id: 'fragment', type: 'flag', targetId: 'ch5_fragment_investigated', count: 1, description: 'Selidiki fragmen' },
    { id: 'echo', type: 'flag', targetId: 'ch5_echo_found', count: 1, description: 'Temukan jejak di Bellhaven' },
    { id: 'scholar', type: 'flag', targetId: 'ch5_scholar_warned', count: 1, description: 'Dengar peringatan Lirien' },
    { id: 'memories', type: 'flag', targetId: 'ch5_memories_discussed', count: 1, description: 'Bicara tentang kenangan' },
    { id: 'site', type: 'flag', targetId: 'ch5_site_reached', count: 1, description: 'Capai situs kuno' },
    { id: 'resonance', type: 'flag', targetId: 'ch5_first_resonance_done', count: 1, description: 'Selesaikan Resonansi Pertama' },
    { id: 'aftermath', type: 'flag', targetId: 'ch5_aftermath_done', count: 1, description: 'Diskusi setelah gema' },
    { id: 'finale', type: 'flag', targetId: 'ch5_completed', count: 1, description: 'Selesaikan Arc I' },
  ],
  rewards: { gold: 40 },
};

export const QUEST_CH5_SUARA = {
  id: 'quest_ch5_suara_di_balik_batu',
  name: 'Suara di Balik Batu',
  description: 'Catat nada Resonance dari tiga titik di sekitar situs untuk Lirien.',
  prerequisites: [],
  objectives: [
    { id: 'a', type: 'flag', targetId: 'ch5_pillar_inspected', count: 1, description: 'Periksa pilar' },
    { id: 'b', type: 'flag', targetId: 'ch5_instrument_touched', count: 1, description: 'Sentuh instrumen' },
    { id: 'c', type: 'flag', targetId: 'ch5_mural_seen', count: 1, description: 'Pelajari mural' },
    { id: 'return', type: 'talk', targetId: 'character_lirien', count: 1, description: 'Lapor ke Lirien' },
  ],
  rewards: { gold: 10 },
};

export const QUEST_CH5_PESAN = {
  id: 'quest_ch5_pesan_yang_tertinggal',
  name: 'Pesan yang Tertinggal',
  description: 'Salin pesan pudar pada mural situs Resonance.',
  prerequisites: [],
  objectives: [
    { id: 'copy', type: 'flag', targetId: 'ch5_message_copied', count: 1, description: 'Salin pesan mural' },
  ],
  rewards: { gold: 6 },
};

export const CHAPTER_05_QUESTS = [QUEST_CH5_RESONANSI, QUEST_CH5_SUARA, QUEST_CH5_PESAN];
