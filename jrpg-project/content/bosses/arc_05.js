/** Arc V — the guardian of the original Resonance lattice. */
const p = (id, name, power, extra = {}) => ({ id, name, type: 'physical', power, ...extra });
const m = (id, name, element, power, extra = {}) => ({ id, name, type: 'magical', element, power, ...extra });
const fx = (id, chance = 0.3, duration = 1) => ({ id, chance, duration });
export const BOSSES_ARC_05 = [
  {
    id: 'lattice_origin_colossus', name: 'Kolossus Asal Kisi', arc: 5, chapter: 25, regionId: 'region_heart_lumerra',
    role: 'main_boss', optional: false, requiredForMainStory: true,
    description: 'Penjaga inti yang dibangun untuk menstabilkan Resonansi pertama, kini terpecah antara protokol lama dan dunia yang berubah.',
    maxHp: 3720, attack: 82, defense: 68, magicAttack: 91, magicDefense: 74, speed: 17, exp: 1280, gold: 880,
    affinities: { earth: 'resist', resonance: 'resist', lightning: 'weak', dark: 'neutral' },
    phases: [
      { id: 'p1', hpBelowPct: 1, actions: [p('origin_fist', 'Tinju Asal', 1.2), m('lattice_beam', 'Sinar Kisi', 'resonance', 1.0)] },
      { id: 'p2', hpBelowPct: 0.68, actions: [m('world_pulse', 'Denyut Dunia', 'light', 1.25, { effect: fx('slow', 0.25) }), p('tectonic_shift', 'Pergeseran Tektonik', 1.3)] },
      { id: 'p3', hpBelowPct: 0.32, actions: [m('origin_collapse', 'Runtuhnya Asal', 'resonance', 1.45, { effect: fx('defense_down', 0.3) }), p('last_foundation', 'Fondasi Terakhir', 1.5)] },
    ],
    rewards: { exp: 1280, gold: 880, items: [{ id: 'ether_drop', qty: 5 }] }, flagKey: 'ch25_boss_lattice_origin_colossus_defeated',
  },
];
