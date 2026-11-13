/** Arc II story bosses. */
const p = (id, name, power, extra = {}) => ({ id, name, type: 'physical', power, ...extra });
const m = (id, name, element, power, extra = {}) => ({ id, name, type: 'magical', element, power, ...extra });
const fx = (id, chance = 0.3, duration = 1) => ({ id, chance, duration });

export const BOSSES_ARC_02 = [
  {
    id: 'starfall_astral_mantid', name: 'Belalang Astral Starfall', arc: 2, chapter: 8, regionId: 'region_starfall_plain',
    role: 'optional_boss', optional: true, requiredForMainStory: false,
    description: 'Pemangsa langit yang mengumpulkan serpihan bintang jatuh di dataran sunyi. Ia menjaga sarang, bukan rahasia kerajaan.',
    maxHp: 980, attack: 36, defense: 24, magicAttack: 42, magicDefense: 28, speed: 21, exp: 360, gold: 240,
    affinities: { wind: 'resist', lightning: 'resist', ice: 'weak', earth: 'neutral' },
    phases: [
      { id: 'p1', hpBelowPct: 1, actions: [p('astral_scythe', 'Sabit Astral', 1.15), m('meteor_dust', 'Debu Meteor', 'light', 0.95)] },
      { id: 'p2', hpBelowPct: 0.5, actions: [m('starfall_lattice', 'Kisi Bintang Jatuh', 'lightning', 1.25, { effect: fx('slow', 0.3) }), p('skyfold_strike', 'Tebasan Lipat Langit', 1.3)] },
    ],
    rewards: { exp: 360, gold: 240, items: [{ id: 'ether_drop', qty: 2 }] },
    flagKey: 'ch8_boss_starfall_astral_mantid_defeated',
  },
  {
    id: 'oathbreaker_colossus', name: 'Kolossus Pematah Sumpah', arc: 2, chapter: 10, regionId: 'region_starfall_plain',
    role: 'main_boss', optional: false, requiredForMainStory: true,
    description: 'Mesin perang kuno yang dibangunkan oleh agen Curator untuk memecah segel di bawah hujan bintang.',
    maxHp: 1480, attack: 43, defense: 32, magicAttack: 48, magicDefense: 36, speed: 12, exp: 520, gold: 360,
    affinities: { earth: 'resist', resonance: 'resist', lightning: 'weak', water: 'weak' },
    phases: [
      { id: 'p1', hpBelowPct: 1, actions: [p('oathbreaker_fist', 'Tinju Pematah Sumpah', 1.15), m('broken_accord', 'Perjanjian Retak', 'resonance', 0.95)] },
      { id: 'p2', hpBelowPct: 0.68, actions: [m('starless_wave', 'Gelombang Tanpa Bintang', 'dark', 1.2, { effect: fx('slow', 0.25) }), p('siege_step', 'Langkah Pengepungan', 1.25)] },
      { id: 'p3', hpBelowPct: 0.32, actions: [m('falling_constellation', 'Rasi yang Runtuh', 'lightning', 1.35, { effect: fx('defense_down', 0.3) }), p('last_oath', 'Sumpah Terakhir', 1.4)] },
    ],
    rewards: { exp: 520, gold: 360, items: [{ id: 'ether_drop', qty: 3 }] },
    flagKey: 'ch10_boss_oathbreaker_colossus_defeated',
  },
];
