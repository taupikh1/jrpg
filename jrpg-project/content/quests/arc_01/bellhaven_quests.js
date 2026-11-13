/** Bellhaven side quests */

export const QUEST_BH_BUKU_TAMU = {
  id: 'quest_bh_buku_tamu',
  name: 'Halaman yang Hilang',
  description: 'Juru tulis gerbang kehilangan tiga lembar catatan buku tamu.',
  prerequisites: [],
  objectives: [
    { id: 'collect_pages', type: 'collect', targetId: 'guest_page', count: 3, description: 'Kumpulkan Lembar Catatan (0/3)' },
    { id: 'return_bren', type: 'talk', targetId: 'character_bren', count: 1, description: 'Serahkan ke Juru Tulis Bren' },
  ],
  rewards: { items: [{ id: 'herb', qty: 1 }], gold: 8 },
};

export const QUEST_BH_INDEKS = {
  id: 'quest_bh_indeks',
  name: 'Serpihan Indeks',
  description: 'Arsiparis Venn membutuhkan satu serpihan indeks yang utuh.',
  prerequisites: [],
  objectives: [
    { id: 'collect_index', type: 'collect', targetId: 'index_shard', count: 1, description: 'Temukan Serpihan Indeks' },
    { id: 'return_venn', type: 'talk', targetId: 'character_venn', count: 1, description: 'Serahkan ke Arsiparis Venn' },
  ],
  rewards: { items: [{ id: 'ether_drop', qty: 1 }], gold: 12 },
};

export const QUEST_BH_PESAN = {
  id: 'quest_bh_pesan',
  name: 'Pesan Sebelum Senja',
  description: 'Sampaikan pesan Garet kepada anaknya Timm di alun-alun.',
  prerequisites: [],
  objectives: [
    { id: 'talk_timm', type: 'talk', targetId: 'character_timm', count: 1, description: 'Temui Timm di alun-alun' },
  ],
  rewards: { gold: 5 },
};

export const BELLHAVEN_QUESTS = [QUEST_BH_BUKU_TAMU, QUEST_BH_INDEKS, QUEST_BH_PESAN];
