/**
 * Arc I character progression definitions: EXP curve, growth profiles, and skill unlocks.
 * Pure data + pure deterministic curve helpers (no runtime or browser state).
 */
import { SKILL_FIRE, SKILL_HEAL } from '../gameplay/demo-content.js';

export const MAX_LEVEL = 10;

export const EXP_CURVE_CONFIG = Object.freeze({
  base: 12,
  linear: 10,
  quadratic: 6,
});

/**
 * EXP required to advance from `level` to `level + 1`.
 * Returns 0 at or above MAX_LEVEL.
 * @param {number} level
 * @param {{ base?: number, linear?: number, quadratic?: number, maxLevel?: number }} [config]
 */
export function expToNextLevel(level, config = EXP_CURVE_CONFIG) {
  const maxLv = config.maxLevel ?? MAX_LEVEL;
  if (!Number.isFinite(level) || level < 1) return config.base ?? EXP_CURVE_CONFIG.base;
  if (level >= maxLv) return 0;
  const step = Math.floor(level) - 1;
  const base = config.base ?? EXP_CURVE_CONFIG.base;
  const linear = config.linear ?? EXP_CURVE_CONFIG.linear;
  const quadratic = config.quadratic ?? EXP_CURVE_CONFIG.quadratic;
  return base + linear * step + quadratic * step * step;
}

/**
 * Total cumulative EXP needed from Level 1 (0 EXP) to reach `targetLevel`.
 * @param {number} targetLevel
 * @param {{ base?: number, linear?: number, quadratic?: number, maxLevel?: number }} [config]
 */
export function cumulativeExpForLevel(targetLevel, config = EXP_CURVE_CONFIG) {
  const lv = Math.max(1, Math.min(config.maxLevel ?? MAX_LEVEL, Math.floor(targetLevel || 1)));
  let total = 0;
  for (let i = 1; i < lv; i++) total += expToNextLevel(i, config);
  return total;
}

/** Canonical skill definitions indexed by skill ID. */
export const PROGRESSION_SKILLS = Object.freeze({
  [SKILL_FIRE.id]: Object.freeze({
    ...SKILL_FIRE,
    description: 'Serangan bara api ke satu musuh.',
  }),
  [SKILL_HEAL.id]: Object.freeze({
    ...SKILL_HEAL,
    description: 'Memulihkan 20 HP satu sekutu.',
  }),
  orin_surge: Object.freeze({
    id: 'orin_surge',
    name: 'Dentuman Gema',
    mpCost: 7,
    power: 18,
    type: 'attack',
    element: 'resonance',
    description: 'Serangan resonansi kuat ke satu musuh.',
    signature: true,
    target: 'enemy',
  }),
  orin_echo_lance: Object.freeze({
    id: 'orin_echo_lance',
    name: 'Tombak Gema',
    mpCost: 9,
    power: 24,
    type: 'magical',
    element: 'resonance',
    effect: { id: 'defense_down', duration: 2, chance: 0.45 },
    target: 'enemy',
    description: 'Hantaman Resonance yang dapat melemahkan pertahanan musuh.',
  }),
  mira_mend: Object.freeze({
    id: 'mira_mend',
    name: 'Jahitan Lembut',
    mpCost: 6,
    power: 28,
    type: 'heal',
    description: 'Memulihkan 28 HP satu sekutu.',
    signature: true,
    target: 'ally',
  }),
  mira_spark: Object.freeze({
    id: 'mira_spark',
    name: 'Percikan',
    mpCost: 3,
    power: 11,
    type: 'magical',
    element: 'light',
    description: 'Serangan cahaya cepat ke satu musuh.',
  }),
  mira_light_bind: Object.freeze({
    id: 'mira_light_bind',
    name: 'Simpul Cahaya',
    mpCost: 5,
    power: 15,
    type: 'magical',
    element: 'light',
    description: 'Serangan cahaya terfokus ke satu musuh.',
    target: 'enemy',
  }),
  mira_lumen_ward: Object.freeze({
    id: 'mira_lumen_ward',
    name: 'Selimut Pendar',
    mpCost: 8,
    power: 16,
    type: 'heal',
    effect: { id: 'regen', duration: 3 },
    target: 'ally',
    description: 'Memulihkan HP dan memberi pemulihan bertahap kepada satu sekutu.',
  }),
  kael_shield_bash: Object.freeze({
    id: 'kael_shield_bash',
    name: 'Hantaman Perisai',
    mpCost: 4,
    power: 16,
    type: 'attack',
    target: 'enemy',
    effect: { id: 'slow', duration: 2, chance: 0.35 },
    description: 'Menghantam musuh dengan perisai dan dapat memperlambatnya.',
  }),
  kael_guard: Object.freeze({
    id: 'kael_guard',
    name: 'Benteng Diri',
    mpCost: 3,
    power: 0,
    type: 'guard',
    target: 'self',
    description: 'Mengurangi separuh kerusakan yang diterima Kael hingga akhir putaran berikutnya.',
  }),
  kael_taunt: Object.freeze({
    id: 'kael_taunt',
    name: 'Tantang',
    mpCost: 5,
    power: 0,
    type: 'taunt',
    target: 'self',
    description: 'Memancing musuh agar memprioritaskan Kael sampai akhir putaran berikutnya.',
  }),
  kael_protect_ally: Object.freeze({
    id: 'kael_protect_ally',
    name: 'Lindungi Sekutu',
    mpCost: 7,
    power: 0,
    type: 'protect',
    target: 'ally',
    signature: true,
    description: 'Kael menanggung separuh kerusakan yang seharusnya diterima sekutu terpilih hingga akhir putaran berikutnya.',
  }),
  iven_quick_cut: Object.freeze({
    id: 'iven_quick_cut',
    name: 'Sayat Cepat',
    mpCost: 3,
    power: 1.2,
    type: 'attack',
    target: 'enemy',
    effect: { id: 'slow', duration: 2, chance: 0.25 },
    description: 'Serangan kilat yang kadang memperlambat gerak lawan.',
  }),
  iven_quickstep: Object.freeze({
    id: 'iven_quickstep',
    name: 'Langkah Kilat',
    mpCost: 4,
    power: 0,
    type: 'guard',
    target: 'self',
    effect: { id: 'haste', duration: 2 },
    description: 'Menghindari jalur serangan, memperkuat pertahanan, dan meningkatkan kecepatan Iven.',
  }),
  iven_smoke_bomb: Object.freeze({
    id: 'iven_smoke_bomb',
    name: 'Bom Asap',
    mpCost: 6,
    power: 1.05,
    type: 'attack',
    target: 'enemy',
    element: 'wind',
    effect: { id: 'silence', duration: 2, chance: 0.35 },
    description: 'Perangkat asap yang mengacaukan konsentrasi satu musuh.',
  }),
  iven_shadow_route: Object.freeze({
    id: 'iven_shadow_route',
    name: 'Jalur Bayangan',
    mpCost: 8,
    power: 0,
    type: 'protect',
    target: 'ally',
    signature: true,
    effect: { id: 'haste', duration: 3 },
    description: 'Iven memotong jalur serangan untuk melindungi sekutu dan mempercepat geraknya.',
  }),
  tavi_spark_trap: Object.freeze({
    id: 'tavi_spark_trap',
    name: 'Perangkap Percik',
    mpCost: 4,
    power: 1.1,
    type: 'magical',
    target: 'enemy',
    element: 'lightning',
    effect: { id: 'stun', duration: 1, chance: 0.2 },
    description: 'Perangkat Resonance yang menyetrum dan kadang menghentikan gerak lawan.',
  }),
  tavi_field_patch: Object.freeze({
    id: 'tavi_field_patch',
    name: 'Tambal Lapangan',
    mpCost: 6,
    power: 18,
    type: 'heal',
    target: 'ally',
    effect: { id: 'regen', duration: 2 },
    description: 'Perangkat perawatan rakitan yang memulihkan HP dan memberi regenerasi.',
  }),
  tavi_snare_device: Object.freeze({
    id: 'tavi_snare_device',
    name: 'Jerat Gema',
    mpCost: 5,
    power: 1.0,
    type: 'attack',
    target: 'enemy',
    effect: { id: 'slow', duration: 3, chance: 0.5 },
    description: 'Perangkap kecil yang menahan gerak satu musuh.',
  }),
  tavi_critter_call: Object.freeze({
    id: 'tavi_critter_call',
    name: 'Gema Kawan Kecil',
    mpCost: 9,
    power: 1.35,
    type: 'magical',
    target: 'enemy',
    element: 'resonance',
    signature: true,
    effect: { id: 'poison', duration: 3, chance: 0.35 },
    description: 'Ledakan Resonance yang meniru panggilan makhluk kecil dan berpeluang meracuni lawan.',
  }),
});

/** Playable character growth profiles. Runtime IDs remain stable and map to Character Bible IDs. */
export const CHARACTER_PROGRESSION = Object.freeze({
  orin: Object.freeze({
    id: 'orin',
    name: 'Orin',
    title: 'Penjaga Ashwillow',
    role: 'Serba bisa · Fisik & Resonansi',
    baseStats: Object.freeze({
      maxHp: 60,
      maxMp: 25,
      attack: 12,
      defense: 6,
      magicAttack: 8,
      magicDefense: 4,
      speed: 12,
      critChance: 0.05,
    }),
    growthPerLevel: Object.freeze({
      maxHp: 8,
      maxMp: 3,
      attack: 2,
      defense: 2,
      magicAttack: 1,
      magicDefense: 1,
      speed: 1,
    }),
    skillUnlocks: Object.freeze([
      Object.freeze({ level: 1, skillId: 'ember' }),
      Object.freeze({ level: 2, skillId: 'minor_heal' }),
      Object.freeze({ level: 4, skillId: 'orin_surge' }),
      Object.freeze({ level: 7, skillId: 'orin_echo_lance' }),
    ]),
  }),
  mira: Object.freeze({
    id: 'mira',
    name: 'Mira',
    title: 'Kartografer Muda',
    role: 'Penyembuh · Sihir Cahaya',
    baseStats: Object.freeze({
      maxHp: 48,
      maxMp: 32,
      attack: 9,
      defense: 5,
      magicAttack: 14,
      magicDefense: 6,
      speed: 14,
      critChance: 0.05,
    }),
    growthPerLevel: Object.freeze({
      maxHp: 5,
      maxMp: 5,
      attack: 1,
      defense: 1,
      magicAttack: 3,
      magicDefense: 2,
      speed: 2,
    }),
    skillUnlocks: Object.freeze([
      Object.freeze({ level: 1, skillId: 'mira_mend' }),
      Object.freeze({ level: 1, skillId: 'mira_spark' }),
      Object.freeze({ level: 3, skillId: 'mira_light_bind' }),
      Object.freeze({ level: 7, skillId: 'mira_lumen_ward' }),
    ]),
  }),
  iven: Object.freeze({
    id: 'iven',
    name: 'Iven Marr',
    title: 'Kurir Perbatasan',
    role: 'Mobilitas · Utilitas',
    baseStats: Object.freeze({
      maxHp: 52, maxMp: 24, attack: 11, defense: 5,
      magicAttack: 8, magicDefense: 6, speed: 16, critChance: 0.08,
    }),
    growthPerLevel: Object.freeze({
      maxHp: 6, maxMp: 3, attack: 2, defense: 1,
      magicAttack: 1, magicDefense: 1, speed: 3,
    }),
    skillUnlocks: Object.freeze([
      Object.freeze({ level: 1, skillId: 'iven_quick_cut' }),
      Object.freeze({ level: 2, skillId: 'iven_quickstep' }),
      Object.freeze({ level: 4, skillId: 'iven_smoke_bomb' }),
      Object.freeze({ level: 7, skillId: 'iven_shadow_route' }),
    ]),
  }),
  tavi: Object.freeze({
    id: 'tavi',
    name: 'Tavi Brindle',
    title: 'Perakit Resonance',
    role: 'Gadget · Kendali',
    baseStats: Object.freeze({
      maxHp: 50, maxMp: 36, attack: 8, defense: 5,
      magicAttack: 15, magicDefense: 9, speed: 11, critChance: 0.05,
    }),
    growthPerLevel: Object.freeze({
      maxHp: 5, maxMp: 5, attack: 1, defense: 1,
      magicAttack: 3, magicDefense: 2, speed: 1,
    }),
    skillUnlocks: Object.freeze([
      Object.freeze({ level: 1, skillId: 'tavi_spark_trap' }),
      Object.freeze({ level: 2, skillId: 'tavi_field_patch' }),
      Object.freeze({ level: 4, skillId: 'tavi_snare_device' }),
      Object.freeze({ level: 7, skillId: 'tavi_critter_call' }),
    ]),
  }),
  kael: Object.freeze({
    id: 'kael',
    name: 'Kael Rowan',
    title: 'Mantan Pengawal Mahkota',
    role: 'Garda garis depan · Pertahanan & perlindungan',
    baseStats: Object.freeze({
      maxHp: 72,
      maxMp: 18,
      attack: 13,
      defense: 11,
      magicAttack: 5,
      magicDefense: 8,
      speed: 8,
      critChance: 0.04,
    }),
    growthPerLevel: Object.freeze({
      maxHp: 10,
      maxMp: 2,
      attack: 2,
      defense: 3,
      magicAttack: 0,
      magicDefense: 2,
      speed: 1,
    }),
    skillUnlocks: Object.freeze([
      Object.freeze({ level: 1, skillId: 'kael_guard' }),
      Object.freeze({ level: 2, skillId: 'kael_shield_bash' }),
      Object.freeze({ level: 4, skillId: 'kael_taunt' }),
      Object.freeze({ level: 7, skillId: 'kael_protect_ally' }),
    ]),
  }),
});

export function getCharacterProgressionDef(id) {
  return Object.prototype.hasOwnProperty.call(CHARACTER_PROGRESSION, id) ? CHARACTER_PROGRESSION[id] : null;
}

export function listCharacterProgressionIds() {
  return Object.keys(CHARACTER_PROGRESSION);
}
