/** Arc IV — guardian shaped by the Curator's Stillness experiments. */
const p = (id, name, power, extra = {}) => ({ id, name, type: 'physical', power, ...extra });
const m = (id, name, element, power, extra = {}) => ({ id, name, type: 'magical', element, power, ...extra });
const fx = (id, chance = 0.3, duration = 1) => ({ id, chance, duration });
export const BOSSES_ARC_04 = [
  {
    id: 'regent_of_unwritten', name: 'Wali Halaman Terhapus', arc: 4, chapter: 20, regionId: 'region_underdeep',
    role: 'main_boss', optional: false, requiredForMainStory: true,
    description: 'Wali buatan yang menghapus nama dari catatan untuk menguji gagasan bahwa penderitaan dapat dihentikan dengan menghapus ingatan.',
    maxHp: 2860, attack: 68, defense: 54, magicAttack: 76, magicDefense: 63, speed: 18, exp: 980, gold: 680,
    affinities: { dark: 'resist', resonance: 'resist', light: 'weak', lightning: 'weak' },
    phases: [
      { id: 'p1', hpBelowPct: 1, actions: [p('regent_gavel', 'Palu Wali', 1.15), m('blank_decree', 'Titah Kosong', 'dark', 1.0)] },
      { id: 'p2', hpBelowPct: 0.7, actions: [m('name_erasure', 'Penghapusan Nama', 'resonance', 1.25, { effect: fx('silence', 0.3) }), p('sealed_sentence', 'Vonis Tersegel', 1.3)] },
      { id: 'p3', hpBelowPct: 0.33, actions: [m('stillness_court', 'Sidang Stillness', 'dark', 1.4, { effect: fx('defense_down', 0.3) }), p('final_redaction', 'Coretan Terakhir', 1.45)] },
    ],
    rewards: { exp: 980, gold: 680, items: [{ id: 'ether_drop', qty: 4 }] }, flagKey: 'ch20_boss_regent_of_unwritten_defeated',
  },
];
