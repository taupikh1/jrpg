/**
 * Arc I enemy catalogue: The Awakening (Chapters 1–5).
 * Definitions are data-only. Battle rules and AI execution remain engine-owned.
 */
const physical = (id, name, power = 1, extra = {}) => ({ id, name, type: 'physical', power, ...extra });
const magical = (id, name, element, power = 1, extra = {}) => ({ id, name, type: 'magical', element, power, ...extra });
const status = (id, chance = 0.25, duration) => ({ id, chance, ...(duration ? { duration } : {}) });

export const ENEMY_SLIME = {
  id: 'thorn_sprite', name: 'Sprite Duri', arc: 1, regionId: 'region_whispering_wood', habitat: 'semak berhutan', category: 'hostile_creature',
  description: 'Makhluk kecil berlapis duri yang menjaga rumpun tempatnya bersarang.',
  maxHp: 28, attack: 8, defense: 2, magicAttack: 4, magicDefense: 2, speed: 10, exp: 6, gold: 4,
  affinities: { earth: 'resist', fire: 'weak' }, ai: { style: 'skirmisher', actions: [physical('thorn_prick', 'Tusuk Duri', 0.9)] },
};

export const ENEMIES = [
  ENEMY_SLIME,
  {
    id: 'mossback_tortoise', name: 'Kura Punggung Lumut', arc: 1, regionId: 'region_ashwillow', habitat: 'tepi sungai dan padang lembap', category: 'magical_wildlife',
    description: 'Kura-kura tua dengan lumut Resonansi yang mengeras di tempurungnya.',
    maxHp: 66, attack: 9, defense: 11, magicAttack: 3, magicDefense: 8, speed: 4, exp: 12, gold: 7,
    affinities: { water: 'resist', earth: 'resist', fire: 'weak', lightning: 'weak' },
    ai: { style: 'bulwark', actions: [physical('shell_bash', 'Hantaman Tempurung', 1.15), physical('low_rumble', 'Guncangan Rendah', 0.75, { effect: status('slow', 0.2) })] },
  },
  {
    id: 'whisper_moth', name: 'Ngengat Pembisik', arc: 1, regionId: 'region_whispering_wood', habitat: 'kanopi hutan saat senja', category: 'magical_wildlife',
    description: 'Ngengat bercahaya yang mengikuti gema suara dari batu-batu tua.',
    maxHp: 34, attack: 5, defense: 3, magicAttack: 11, magicDefense: 7, speed: 13, exp: 10, gold: 6,
    affinities: { wind: 'resist', light: 'resist', fire: 'weak' },
    ai: { style: 'disruptor', actions: [magical('hush_dust', 'Debu Senyap', 'wind', 0.8, { effect: status('silence', 0.3, 1) }), physical('wing_flick', 'Kibasan Sayap', 0.65)] },
  },
  {
    id: 'rootbound_hare', name: 'Kelinci Akar', arc: 1, regionId: 'region_whispering_wood', habitat: 'akar pohon dan semak rendah', category: 'hostile_creature',
    description: 'Hewan lincah yang bulunya tersangkut akar hidup setelah sarangnya terganggu.',
    maxHp: 31, attack: 10, defense: 2, magicAttack: 4, magicDefense: 3, speed: 17, exp: 8, gold: 5,
    affinities: { earth: 'resist', fire: 'weak', wind: 'weak' },
    ai: { style: 'ambusher', actions: [physical('root_dash', 'Terjang Akar', 1.1), physical('hind_kick', 'Tendangan Belakang', 0.85)] },
  },
  {
    id: 'echo_wisp', name: 'Kelana Gema', arc: 1, regionId: 'region_bellhaven', habitat: 'jalan berbatu dan reruntuhan arsip', category: 'magical_wildlife',
    description: 'Gumpalan cahaya yang mengulang potongan suara dari tempat yang pernah dilaluinya.',
    maxHp: 38, attack: 4, defense: 4, magicAttack: 12, magicDefense: 9, speed: 11, exp: 13, gold: 8,
    affinities: { light: 'resist', dark: 'weak', resonance: 'resist' },
    ai: { style: 'caster', actions: [magical('echo_burst', 'Letupan Gema', 'resonance', 1.05), magical('fading_note', 'Nada Memudar', 'wind', 0.75, { effect: status('slow', 0.25) })] },
  },
  {
    id: 'briar_stalker', name: 'Pengintai Belukar', arc: 1, regionId: 'region_whispering_wood', habitat: 'jalur hutan yang jarang dilalui', category: 'hostile_creature',
    description: 'Pemangsa kecil yang bersembunyi di balik sulur dan menyerang saat mangsa lengah.',
    maxHp: 46, attack: 13, defense: 5, magicAttack: 3, magicDefense: 4, speed: 12, exp: 15, gold: 9,
    affinities: { earth: 'resist', fire: 'weak' },
    ai: { style: 'assassin', actions: [physical('briar_lunge', 'Lompatan Sulur', 1.25), physical('barbed_rake', 'Cakaran Berduri', 0.9, { effect: status('poison', 0.2) })] },
  },
  {
    id: 'riverglass_eel', name: 'Belut Kaca Sungai', arc: 1, regionId: 'region_ashwillow', habitat: 'lubuk sungai berarus pelan', category: 'magical_wildlife',
    description: 'Belut transparan yang menyimpan kilau Resonansi di sepanjang punggungnya.',
    maxHp: 43, attack: 9, defense: 4, magicAttack: 10, magicDefense: 6, speed: 15, exp: 14, gold: 10,
    affinities: { water: 'resist', lightning: 'weak', ice: 'resist' },
    ai: { style: 'skirmisher', actions: [physical('glass_snap', 'Gigitan Kaca', 0.95), magical('current_arc', 'Lengkung Arus', 'water', 0.9)] },
  },
  {
    id: 'archive_sentinel', name: 'Penjaga Arsip Retak', arc: 1, regionId: 'region_bellhaven', habitat: 'ruang arsip yang tertutup', category: 'ancient_guardian',
    description: 'Sisa mesin penjaga yang masih menjalankan perintah lama tanpa memahami siapa yang dilindunginya.',
    maxHp: 78, attack: 12, defense: 10, magicAttack: 8, magicDefense: 9, speed: 6, exp: 24, gold: 16,
    affinities: { earth: 'resist', lightning: 'weak', resonance: 'resist' },
    ai: { style: 'sentinel', actions: [physical('seal_strike', 'Pukulan Segel', 1.1), magical('record_pulse', 'Denyut Rekaman', 'resonance', 0.85, { effect: status('defense_down', 0.2) })] },
  },
  {
    id: 'stillness_hollow', name: 'Rongga Sunyi', arc: 1, regionId: 'region_bellhaven', habitat: 'sekitar simpul Resonansi yang melemah', category: 'corrupted_creature',
    description: 'Makhluk yang kehilangan orientasi setelah sarangnya tersapu gejala Stillness.',
    maxHp: 58, attack: 10, defense: 6, magicAttack: 12, magicDefense: 7, speed: 8, exp: 22, gold: 14,
    affinities: { resonance: 'immune', light: 'weak', dark: 'resist' },
    ai: { style: 'disruptor', actions: [magical('blank_wave', 'Gelombang Hampa', 'dark', 1.0), magical('memory_drain', 'Kuras Ingatan', 'resonance', 0.8, { effect: status('silence', 0.25, 1) })] },
  },
];

export function getEnemyDefinition(id) { return ENEMIES.find((enemy) => enemy.id === id) ?? null; }
