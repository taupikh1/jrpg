/**
 * Versioned save schema constants and plain-data contracts.
 * Never store class instances, functions, or DOM nodes.
 */
export const SAVE_VERSION = 6;

/**
 * @typedef {Object} SavePayload
 * @property {number} version
 * @property {string} slotId
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {number} [playtimeMs]
 * @property {string} [displayName]
 * @property {object} player
 * @property {object} inventory
 * @property {object} equipment
 * @property {object} quests
 * @property {object} [world]
 * @property {number} [gold]
 * @property {object} [party]
 * @property {object} [progression]
 */

/**
 * Minimal valid empty payload for tests / migration baselines.
 * @param {string} slotId
 * @returns {SavePayload}
 */
export function createEmptySave(slotId = 'slot1') {
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    slotId,
    createdAt: now,
    updatedAt: now,
    playtimeMs: 0,
    displayName: 'New Save',
    player: {
      zoneId: 'village',
      x: 160,
      y: 112,
      facing: 'down',
      stats: {
        maxHp: 60,
        maxMp: 25,
        hp: 60,
        mp: 25,
        attack: 12,
        defense: 6,
        magicAttack: 8,
        magicDefense: 4,
        speed: 12,
      },
    },
    inventory: { capacity: 20, slots: [] },
    equipment: { weapon: null, head: null, body: null, accessory1: null, accessory2: null },
    quests: { states: {} },
    world: { flags: {} },
    gold: 0,
    progression: {
      orin: { level: 1, exp: 0, unlockedSkills: ['ember'] },
      mira: { level: 1, exp: 0, unlockedSkills: ['mira_mend', 'mira_spark'] },
      kael: { level: 1, exp: 0, unlockedSkills: ['kael_guard'] },
      iven: { level: 1, exp: 0, unlockedSkills: ['iven_quick_cut'] },
      tavi: { level: 1, exp: 0, unlockedSkills: ['tavi_spark_trap'] },
    },
    party: {
      mira: null,
      kael: null,
      roster: {
        recruited: { orin: true, mira: false, kael: false, iven: false, tavi: false },
        departed: { orin: false, mira: false, kael: false, iven: false, tavi: false },
        active: ['orin'],
        memberStats: { iven: null, tavi: null },
      },
    },
  };
}
