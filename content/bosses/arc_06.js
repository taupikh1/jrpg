/** Arc VI — final confrontation, with the Curator kept human and morally legible. */
const p = (id, name, power, extra = {}) => ({ id, name, type: 'physical', power, ...extra });
const m = (id, name, element, power, extra = {}) => ({ id, name, type: 'magical', element, power, ...extra });
const fx = (id, chance = 0.3, duration = 1) => ({ id, chance, duration });
export const BOSSES_ARC_06 = [
  {
    id: 'vaelor_senn_resonant_form', name: 'Vaelor Senn, Wujud Resonansi', arc: 6, chapter: 29, regionId: 'region_heart_lumerra',
    role: 'main_boss', optional: false, requiredForMainStory: true,
    description: 'Vaelor Senn, sang Kurator, menyatukan dirinya dengan kisi untuk mengakhiri siklus luka melalui penghapusan ingatan. Ia tetap manusia yang memilih jalan yang salah, bukan monster tanpa kehendak.',
    maxHp: 4680, attack: 96, defense: 76, magicAttack: 108, magicDefense: 88, speed: 23, exp: 1600, gold: 1100,
    affinities: { dark: 'resist', resonance: 'resist', light: 'weak', fire: 'neutral' },
    phases: [
      { id: 'p1', hpBelowPct: 1, actions: [p('vaelor_duel', 'Tebasan Sang Kurator', 1.2), m('curated_memory', 'Ingatan Pilihan', 'resonance', 1.05)] },
      { id: 'p2', hpBelowPct: 0.7, actions: [m('stillness_mandate', 'Titah Stillness', 'dark', 1.3, { effect: fx('silence', 0.3) }), p('lattice_brand', 'Cap Kisi', 1.35)] },
      { id: 'p3', hpBelowPct: 0.34, actions: [m('unforgotten_grief', 'Duka yang Tak Terhapus', 'resonance', 1.5, { effect: fx('defense_down', 0.3) }), p('last_editorial', 'Suntingan Terakhir', 1.5)] },
    ],
    rewards: { exp: 1600, gold: 1100, items: [{ id: 'ether_drop', qty: 6 }] }, flagKey: 'ch29_boss_vaelor_senn_resonant_form_defeated',
  },
];
