/**
 * Ashwillow named NPCs — profiles + ambient dialogue (Indonesian).
 */

export const NPC_ASHWILLOW = [
  {
    id: 'character_elder_henn',
    name: 'Sesepuh Henn',
    role: 'village_elder',
    regionId: 'region_ashwillow',
    personality: 'Bijak, tenang, ketakutan tersembunyi saat ingatan retak',
    background: 'Penjaga tradisi lisan Ashwillow selama puluhan tahun',
    voice: 'Lambat, penuh jeda, jarang meninggikan suara',
    dialogueIds: ['ch1_elder_henn'],
  },
  {
    id: 'character_renda',
    name: 'Renda',
    role: 'guard',
    regionId: 'region_ashwillow',
    personality: 'Tegas, peduli, humor kering',
    background: 'Penjaga gerbang utara; mengenal Orin sejak kecil',
    voice: 'Singkat, praktis, kadang menggoda',
    dialogueIds: ['ch1_guard_renda'],
  },
  {
    id: 'character_soli',
    name: 'Soli',
    role: 'merchant',
    regionId: 'region_ashwillow',
    personality: 'Cekatan, waspada pada rumor, hangat pada pelanggan tetap',
    background: 'Pedagang herb dan peralatan; jalur Bellhaven',
    voice: 'Cepat, tawar-menawar, diselingi kabar angin',
    dialogueIds: ['ch1_merchant_soli'],
  },
  {
    id: 'character_nima',
    name: 'Nima',
    role: 'villager',
    regionId: 'region_ashwillow',
    personality: 'Lembut, cemas, jujur',
    background: 'Penenun; ibu dari Tori',
    voice: 'Halus, sering bertanya',
    dialogueIds: ['ch1_villager_nima'],
  },
  {
    id: 'character_tori',
    name: 'Tori',
    role: 'child',
    regionId: 'region_ashwillow',
    personality: 'Ceria, penasaran, mudah takut pada hal abstrak',
    background: 'Anak Nima; suka menggambar peta sederhana',
    voice: 'Polos, singkat, penuh seru',
    dialogueIds: ['ch1_child_tori'],
  },
  {
    id: 'character_jarek',
    name: 'Jarek',
    role: 'craftsperson',
    regionId: 'region_ashwillow',
    personality: 'Pendiam, teliti, kesal bila alat "lupa" fungsinya',
    background: 'Tukang kayu pagar desa',
    voice: 'Sedikit kata, banyak gestur',
    dialogueIds: ['ch1_craft_jarek'],
  },
];

export const DIALOGUE_CH1_CRAFT_JAREK = {
  id: 'ch1_craft_jarek',
  startNode: 'work',
  nodes: {
    work: {
      speaker: 'Jarek',
      text: 'Paku ini… aku lupa ukuran yang biasa kupakai. Aneh. Tanganku ingat, kepalaku tidak.',
      choices: [
        {
          text: 'Butuh kayu tambahan?',
          next: 'wood',
        },
        {
          text: 'Istirahat sebentar.',
          next: 'rest',
        },
      ],
    },
    wood: {
      speaker: 'Jarek',
      text: 'Kalau kau dapat kayu bersih dari jalur hutan, bawakan. Pagar utara goyah sejak pagi.',
    },
    rest: {
      speaker: 'Jarek',
      text: 'Tidak. Kalau aku berhenti, aku takut lupa cara memegang palu.',
    },
  },
};
