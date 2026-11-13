/**
 * Arc II enemy catalogue: The Shattered Kingdoms (Chapters 6–10).
 * Encounters reflect the heartland, border moors, Glass Lantern and Starfall Plain.
 */
const physical = (id, name, power = 1, extra = {}) => ({ id, name, type: 'physical', power, ...extra });
const magical = (id, name, element, power = 1, extra = {}) => ({ id, name, type: 'magical', element, power, ...extra });
const status = (id, chance = 0.25, duration) => ({ id, chance, ...(duration ? { duration } : {}) });

export const ENEMIES_ARC_02 = [
  {
    id: 'ash_crown_hound', name: 'Anjing Bara Mahkota', arc: 2, regionId: 'region_ashen_crown', habitat: 'padang rumput dekat pos kerajaan', category: 'hostile_creature',
    description: 'Anjing pemburu berbulu kelabu yang beradaptasi dengan tanah hangat di sekitar tungku kerajaan.',
    maxHp: 62, attack: 14, defense: 6, magicAttack: 4, magicDefense: 5, speed: 13, exp: 25, gold: 15,
    affinities: { fire: 'resist', ice: 'weak', earth: 'neutral' },
    ai: { style: 'pack_hunter', actions: [physical('crown_pounce', 'Terjangan Mahkota', 1.15), physical('ember_bite', 'Gigitan Bara', 0.95, { element: 'fire' })] },
  },
  {
    id: 'cinder_lancer', name: 'Penyulut Arang', arc: 2, regionId: 'region_ashen_crown', habitat: 'jalan patroli dan lahan terbakar', category: 'hostile_creature',
    description: 'Kadal bertanduk yang menyimpan bara di rongga sisiknya dan menyerang saat terpojok.',
    maxHp: 54, attack: 12, defense: 7, magicAttack: 11, magicDefense: 7, speed: 9, exp: 27, gold: 17,
    affinities: { fire: 'resist', water: 'weak', ice: 'weak' },
    ai: { style: 'elemental', actions: [physical('cinder_gore', 'Seruduk Bara', 1.0), magical('cinder_spit', 'Ludah Bara', 'fire', 1.1)] },
  },
  {
    id: 'march_watcher', name: 'Pengawas Rawa Perbatasan', arc: 2, regionId: 'region_silent_march', habitat: 'rawa dan parit perbatasan', category: 'hostile_creature',
    description: 'Burung rawa besar yang mengawasi gerakan di antara pos-pos perbatasan.',
    maxHp: 57, attack: 13, defense: 5, magicAttack: 5, magicDefense: 6, speed: 16, exp: 28, gold: 18,
    affinities: { wind: 'resist', lightning: 'weak', water: 'resist' },
    ai: { style: 'scout', actions: [physical('marsh_dive', 'Terjunan Rawa', 1.05), physical('hooked_talon', 'Cengkeram Kait', 0.85, { effect: status('slow', 0.3) })] },
  },
  {
    id: 'oathbound_wraith', name: 'Arwah Sumpah Lama', arc: 2, regionId: 'region_silent_march', habitat: 'batu penanda perjanjian yang terlupakan', category: 'corrupted_creature',
    description: 'Sisa gema para penjaga perjanjian yang terus mengulang sumpah tanpa mengingat isinya.',
    maxHp: 69, attack: 7, defense: 7, magicAttack: 15, magicDefense: 11, speed: 10, exp: 34, gold: 21,
    affinities: { dark: 'resist', light: 'weak', resonance: 'resist' },
    ai: { style: 'hexer', actions: [magical('oath_shard', 'Pecahan Sumpah', 'dark', 1.0), magical('broken_clause', 'Pasal Terputus', 'resonance', 0.8, { effect: status('defense_down', 0.25) })] },
  },
  {
    id: 'glasswing_drone', name: 'Drone Sayap Kaca', arc: 2, regionId: 'region_glass_lantern', habitat: 'lorong servis dan atap bengkel', category: 'ancient_guardian',
    description: 'Perangkat terbang hasil rekayasa Resonansi yang lepas dari kendali bengkel guild.',
    maxHp: 49, attack: 8, defense: 4, magicAttack: 15, magicDefense: 8, speed: 18, exp: 32, gold: 24,
    affinities: { wind: 'resist', lightning: 'weak', earth: 'weak' },
    ai: { style: 'ranged_disruptor', actions: [magical('prism_ping', 'Sinar Prisma', 'light', 0.95), magical('static_burst', 'Letupan Statis', 'lightning', 0.85, { effect: status('slow', 0.25) })] },
  },
  {
    id: 'resonance_golem', name: 'Golem Resonansi', arc: 2, regionId: 'region_glass_lantern', habitat: 'ruang uji guild dan fondasi kota', category: 'ancient_guardian',
    description: 'Rangka batu yang bergerak mengikuti pola Resonansi dari inti buatan.',
    maxHp: 112, attack: 17, defense: 13, magicAttack: 9, magicDefense: 12, speed: 5, exp: 46, gold: 31,
    affinities: { earth: 'resist', fire: 'resist', lightning: 'weak', water: 'neutral' },
    ai: { style: 'bulwark', actions: [physical('lattice_fist', 'Tinju Kisi', 1.25), magical('core_discharge', 'Luapan Inti', 'resonance', 0.9)] },
  },
  {
    id: 'starfall_raptor', name: 'Raptor Bintang Jatuh', arc: 2, regionId: 'region_starfall_plain', habitat: 'padang terbuka setelah hujan meteor', category: 'hostile_creature',
    description: 'Pemangsa padang yang tertarik pada serpihan bercahaya dari langit malam.',
    maxHp: 74, attack: 18, defense: 7, magicAttack: 7, magicDefense: 6, speed: 17, exp: 43, gold: 28,
    affinities: { wind: 'resist', fire: 'weak', light: 'resist' },
    ai: { style: 'predator', actions: [physical('meteor_pounce', 'Terjangan Meteor', 1.2), physical('starclaw', 'Cakar Bintang', 0.95, { effect: status('poison', 0.18) })] },
  },
  {
    id: 'lattice_mimic', name: 'Peniru Kisi', arc: 2, regionId: 'region_silent_march', habitat: 'reruntuhan pos pengawas kuno', category: 'magical_wildlife',
    description: 'Koloni organisme Resonansi yang meniru bentuk benda untuk berlindung di reruntuhan.',
    maxHp: 82, attack: 11, defense: 9, magicAttack: 14, magicDefense: 10, speed: 7, exp: 41, gold: 29,
    affinities: { resonance: 'resist', earth: 'resist', dark: 'weak' },
    ai: { style: 'adaptive', actions: [physical('shard_snap', 'Jepit Serpihan', 0.95), magical('false_memory', 'Ingatan Palsu', 'resonance', 0.85, { effect: status('defense_down', 0.25) })] },
  },
  {
    id: 'stillness_harrier', name: 'Penyambar Sunyi', arc: 2, regionId: 'region_starfall_plain', habitat: 'tepi kawah dan titik jatuh bintang', category: 'corrupted_creature',
    description: 'Pemangsa yang terseret ke sekitar kawah setelah gelombang Stillness mengacaukan nalurinya.',
    maxHp: 91, attack: 15, defense: 8, magicAttack: 16, magicDefense: 10, speed: 14, exp: 52, gold: 36,
    affinities: { dark: 'resist', resonance: 'immune', light: 'weak', ice: 'weak' },
    ai: { style: 'disruptor', actions: [physical('quiet_rend', 'Sobekan Hening', 1.05), magical('null_howl', 'Lolongan Nihil', 'dark', 0.95, { effect: status('silence', 0.25, 1) })] },
  },
];

export function getArcTwoEnemyDefinition(id) { return ENEMIES_ARC_02.find((enemy) => enemy.id === id) ?? null; }
