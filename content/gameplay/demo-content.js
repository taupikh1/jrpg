/** Demo content — player-facing strings in Indonesian (Batch 7.1 localization). */

export { ITEMS } from '../items/arc_01.js';


export const DIALOGUE_GUARD = {
  id: 'village_guard_intro',
  startNode: 'hello',
  nodes: {
    hello: {
      speaker: 'Penjaga Desa',
      text: 'Pengembara, hutan perlu dibersihkan. Maukah kau membantu?',
      choices: [
        { text: 'Aku akan membantu.', next: 'accept', effects: { acceptQuest: 'collect_wood' } },
        { text: 'Tidak sekarang.', next: 'decline' },
      ],
    },
    accept: {
      speaker: 'Penjaga Desa',
      text: 'Kumpulkan 3 Kayu Bersih dari jalur hutan. Kembali jika sudah.',
      next: 'end_ok',
    },
    end_ok: {
      speaker: 'Penjaga Desa',
      text: 'Hati-hati di luar sana.',
    },
    decline: {
      speaker: 'Penjaga Desa',
      text: 'Baiklah. Tawaran ini tetap terbuka.',
    },
  },
};

export const DIALOGUE_SIGN = {
  id: 'village_sign',
  startNode: 'read',
  nodes: {
    read: {
      speaker: 'Papan Kayu',
      text: 'Jalur utara → Hutan Berbisik. Waspadai sprite duri.',
    },
  },
};

export const QUEST_COLLECT_WOOD = {
  id: 'collect_wood',
  name: 'Material Hutan',
  description: 'Kumpulkan kayu untuk desa.',
  objectives: [
    {
      id: 'get_wood',
      type: 'collect',
      targetId: 'wood_scrap',
      count: 3,
      description: 'Kumpulkan Kayu Bersih (0/3)',
    },
  ],
  rewards: {
    items: [{ id: 'herb', qty: 2 }],
    gold: 10,
  },
};

export const SKILL_HEAL = {
  id: 'minor_heal',
  name: 'Pemulihan Kecil',
  mpCost: 5,
  power: 20,
  type: 'heal',
};

export const SKILL_FIRE = {
  id: 'ember',
  name: 'Bara',
  mpCost: 4,
  power: 14,
  type: 'attack',
  element: 'fire',
};

export { ENEMY_SLIME, ENEMIES, getEnemyDefinition } from '../enemies/arc_01.js';
export { ENEMIES_ARC_02, getArcTwoEnemyDefinition } from '../enemies/arc_02.js';
export { ENEMY_CATALOG, getEnemyById } from '../enemies/index.js';
export { ENEMIES_ARC_03 } from '../enemies/arc_03.js';
export { ENEMIES_ARC_04 } from '../enemies/arc_04.js';
export { ENEMIES_ARC_05 } from '../enemies/arc_05.js';
export { ENEMIES_ARC_06 } from '../enemies/arc_06.js';
export { BOSS_CATALOG, getBossById } from '../bosses/index.js';
