/** Chapter 2 main + side quests */

export const QUEST_CH2_SUARA = {
  id: 'quest_ch2_suara_hutan',
  name: 'Suara dari Dalam Hutan',
  description:
    'Orin dan Mira mendengar suara misterius di Hutan Berbisik. Mereka harus mencari sumber suara itu dan memahami hubungannya dengan Resonance.',
  prerequisites: [],
  objectives: [
    { id: 'enter', type: 'flag', targetId: 'ch2_forest_entered', count: 1, description: 'Masuk ke Hutan Berbisik' },
    { id: 'echo', type: 'flag', targetId: 'ch2_first_echo_heard', count: 1, description: 'Dengar gema pertama' },
    { id: 'elara', type: 'flag', targetId: 'ch2_elara_met', count: 1, description: 'Temui Elara' },
    { id: 'carvings', type: 'flag', targetId: 'ch2_old_carvings_found', count: 1, description: 'Temukan ukiran kuno' },
    { id: 'trace', type: 'flag', targetId: 'ch2_memory_trace_seen', count: 1, description: 'Saksikan jejak ingatan' },
    { id: 'resonance', type: 'flag', targetId: 'ch2_resonance_event_completed', count: 1, description: 'Selesaikan peristiwa Resonance' },
    { id: 'clue', type: 'flag', targetId: 'ch2_elara_clue_received', count: 1, description: 'Dapat petunjuk Elara' },
    { id: 'mira', type: 'flag', targetId: 'ch2_mira_committed', count: 1, description: 'Keputusan Mira' },
    { id: 'path', type: 'flag', targetId: 'ch2_northern_path_unlocked', count: 1, description: 'Buka jalur utara' },
    { id: 'done', type: 'flag', targetId: 'ch2_completed', count: 1, description: 'Selesaikan Bab 2' },
  ],
  rewards: { gold: 25 },
};

export const QUEST_CH2_CATATAN = {
  id: 'quest_ch2_catatan_tercecer',
  name: 'Catatan yang Tercecer',
  description: 'Kumpulkan catatan Elara yang terserak di sepanjang jalan batu.',
  prerequisites: [],
  objectives: [
    { id: 'collect', type: 'collect', targetId: 'ch2_elara_note', count: 3, description: 'Kumpulkan catatan (0/3)' },
    { id: 'return', type: 'talk', targetId: 'character_elara', count: 1, description: 'Kembalikan ke Elara' },
  ],
  rewards: { gold: 8, items: [{ id: 'herb', qty: 1 }] },
};

export const QUEST_CH2_PANGGILAN = {
  id: 'quest_ch2_panggilan_tak_terjawab',
  name: 'Panggilan yang Tak Terjawab',
  description: 'Bantu Rhea mencari jejak sahabatnya di dekat sungai hutan.',
  prerequisites: [],
  objectives: [
    { id: 'ribbon', type: 'flag', targetId: 'ch2_stream_ribbon_found', count: 1, description: 'Temukan pita di sungai' },
    { id: 'return', type: 'talk', targetId: 'character_rhea', count: 1, description: 'Kembali ke Rhea' },
  ],
  rewards: { gold: 6 },
};

export const CHAPTER_02_QUESTS = [QUEST_CH2_SUARA, QUEST_CH2_CATATAN, QUEST_CH2_PANGGILAN];
