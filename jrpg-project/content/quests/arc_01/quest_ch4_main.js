/** Chapter 4 main + side quests */

export const QUEST_CH4_ARSIP = {
  id: 'quest_ch4_arsip_tanpa_nama',
  name: 'Arsip Tanpa Nama',
  description:
    'Maera meminta Orin dan teman-temannya menyelidiki beberapa catatan di Arsip Bellhaven yang kehilangan nama dan bagian penting dari tulisannya.',
  prerequisites: [],
  objectives: [
    { id: 'start', type: 'flag', targetId: 'ch4_archive_investigation_started', count: 1, description: 'Terima permintaan Maera' },
    { id: 'nilo', type: 'flag', targetId: 'ch4_nilo_record_seen', count: 1, description: 'Periksa catatan Nilo' },
    { id: 'teren', type: 'flag', targetId: 'ch4_teren_record_seen', count: 1, description: 'Periksa tinta Teren' },
    { id: 'edda', type: 'flag', targetId: 'ch4_edda_record_seen', count: 1, description: 'Dengarkan kisah Edda' },
    { id: 'three', type: 'flag', targetId: 'ch4_three_records_resonated', count: 1, description: 'Saksikan Resonansi tiga catatan' },
    { id: 'fragment', type: 'flag', targetId: 'ch4_fragment_found', count: 1, description: 'Temukan fragmen Resonance' },
    { id: 'finale', type: 'flag', targetId: 'ch4_completed', count: 1, description: 'Selesaikan penyelidikan arsip' },
  ],
  rewards: { gold: 30 },
};

export const QUEST_CH4_SURAT = {
  id: 'quest_ch4_surat_tanpa_nama',
  name: 'Surat Tanpa Nama',
  description: 'Nilo menemukan surat tanpa nama. Periksa air mancur di alun-alun.',
  prerequisites: [],
  objectives: [
    { id: 'fountain', type: 'flag', targetId: 'ch4_fountain_inscription_seen', count: 1, description: 'Temukan ukiran di air mancur' },
    { id: 'return', type: 'talk', targetId: 'character_nilo', count: 1, description: 'Kembali ke Nilo' },
  ],
  rewards: { gold: 8, items: [{ id: 'herb', qty: 1 }] },
};

export const QUEST_CH4_KATALOG = {
  id: 'quest_ch4_katalog_kosong',
  name: 'Katalog yang Kosong',
  description: 'Bantu Teren mengumpulkan tiga lembar katalog yang tercecer.',
  prerequisites: [],
  objectives: [
    { id: 'collect', type: 'collect', targetId: 'ch4_catalog_fragment', count: 3, description: 'Kumpulkan lembar katalog (0/3)' },
    { id: 'return', type: 'talk', targetId: 'character_teren', count: 1, description: 'Serahkan ke Teren' },
  ],
  rewards: { gold: 10 },
};

export const CHAPTER_04_QUESTS = [QUEST_CH4_ARSIP, QUEST_CH4_SURAT, QUEST_CH4_KATALOG];
