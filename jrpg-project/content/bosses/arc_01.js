/** Arc I story bosses. All player-facing names and action text are Indonesian. */
const p = (id, name, power, extra = {}) => ({ id, name, type: 'physical', power, ...extra });
const m = (id, name, element, power, extra = {}) => ({ id, name, type: 'magical', element, power, ...extra });
const fx = (id, chance = 0.3, duration = 1) => ({ id, chance, duration });

export const BOSSES_ARC_01 = [
  {
    id: 'archive_veilkeeper', name: 'Penjaga Selubung Arsip', arc: 1, chapter: 4, regionId: 'region_bellhaven',
    role: 'mini_boss', optional: true, requiredForMainStory: false,
    description: 'Automaton arsip yang menjaga ruang terlarang dan menganggap setiap nama baru sebagai ancaman.',
    maxHp: 420, attack: 20, defense: 14, magicAttack: 23, magicDefense: 18, speed: 9, exp: 120, gold: 85,
    affinities: { resonance: 'resist', lightning: 'weak', dark: 'resist' },
    phases: [
      { id: 'p1', hpBelowPct: 1, actions: [p('archive_sweep', 'Sapu Rak Arsip', 1.05), m('index_flash', 'Kilatan Indeks', 'light', 0.9)] },
      { id: 'p2', hpBelowPct: 0.55, onEnter: { dialogueId: 'ch4_boss_veilkeeper_phase2' }, actions: [m('sealed_record', 'Catatan Tersegel', 'resonance', 1.15, { effect: fx('silence', 0.3) }), p('binding_chain', 'Rantai Pengikat', 1.1, { effect: fx('slow', 0.25) })] },
    ],
    rewards: { exp: 120, gold: 85, items: [{ id: 'herb', qty: 2 }] },
    flagKey: 'ch4_boss_archive_veilkeeper_defeated',
  },
  {
    id: 'warden_of_first_resonance', name: 'Penjaga Resonansi Pertama', arc: 1, chapter: 5, regionId: 'region_bellhaven',
    role: 'main_boss', optional: false, requiredForMainStory: true,
    description: 'Penjaga simpul tua yang bangkit ketika Resonansi Orin menyentuh inti yang lama tertidur.',
    maxHp: 760, attack: 27, defense: 19, magicAttack: 31, magicDefense: 23, speed: 11, exp: 260, gold: 180,
    affinities: { resonance: 'resist', earth: 'resist', dark: 'weak', lightning: 'weak' },
    phases: [
      { id: 'p1', hpBelowPct: 1, actions: [p('rooted_hammer', 'Palu Akar', 1.1), m('resonance_pulse', 'Denyut Resonansi', 'resonance', 0.95)] },
      { id: 'p2', hpBelowPct: 0.65, onEnter: { dialogueId: 'ch5_boss_resonance_phase2' }, actions: [m('memory_tide', 'Pasang Ingatan', 'resonance', 1.2, { effect: fx('slow', 0.25) }), p('guardian_surge', 'Terjangan Penjaga', 1.2)] },
      { id: 'p3', hpBelowPct: 0.3, onEnter: { dialogueId: 'ch5_boss_resonance_phase3' }, actions: [m('first_silence', 'Hening Pertama', 'dark', 1.25, { effect: fx('silence', 0.3) }), p('shattered_seal', 'Segel Terbelah', 1.3)] },
    ],
    rewards: { exp: 260, gold: 180, items: [{ id: 'herb', qty: 3 }] },
    flagKey: 'ch5_boss_warden_of_first_resonance_defeated',
  },
];
