/** Arc III — two-phase-plus story guardian for the ancient world. */
const p = (id, name, power, extra = {}) => ({ id, name, type: 'physical', power, ...extra });
const m = (id, name, element, power, extra = {}) => ({ id, name, type: 'magical', element, power, ...extra });
const fx = (id, chance = 0.3, duration = 1) => ({ id, chance, duration });
export const BOSSES_ARC_03 = [
  {
    id: 'verdant_memory_heart', name: 'Jantung Ingatan Rimba', arc: 3, chapter: 15, regionId: 'region_verdant_veil',
    role: 'main_boss', optional: false, requiredForMainStory: true,
    description: 'Inti penjaga hutan purba yang menyimpan gema peradaban sebelum kerajaan-kerajaan berdiri.',
    maxHp: 2100, attack: 54, defense: 42, magicAttack: 61, magicDefense: 49, speed: 16, exp: 760, gold: 510,
    affinities: { earth: 'resist', water: 'resist', fire: 'weak', dark: 'weak' },
    phases: [
      { id: 'p1', hpBelowPct: 1, actions: [p('root_crown', 'Mahkota Akar', 1.15), m('verdant_chorus', 'Paduan Rimba', 'earth', 1.0)] },
      { id: 'p2', hpBelowPct: 0.66, actions: [m('memory_bloom', 'Mekar Ingatan', 'light', 1.2), p('thorn_cascade', 'Hujan Duri', 1.25)] },
      { id: 'p3', hpBelowPct: 0.3, actions: [m('first_silence_echo', 'Gema Hening Pertama', 'dark', 1.35, { effect: fx('silence', 0.3) }), p('ancient_rootfall', 'Runtuhan Akar Purba', 1.4)] },
    ],
    rewards: { exp: 760, gold: 510, items: [{ id: 'herb', qty: 4 }] }, flagKey: 'ch15_boss_verdant_memory_heart_defeated',
  },
];
