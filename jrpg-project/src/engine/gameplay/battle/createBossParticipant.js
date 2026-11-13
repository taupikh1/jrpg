import { CharacterStats } from '../stats/CharacterStats.js';

/** Build a battle participant from injected boss content; battle engine stays content-agnostic. */
export function createBossParticipant(definition, { id = definition?.id, statOverrides = {} } = {}) {
  if (!definition || typeof definition !== 'object' || !definition.id || !Array.isArray(definition.phases) || definition.phases.length < 2) {
    throw new TypeError('Boss definition with a stable id and at least two phases is required');
  }
  return {
    id: id ?? definition.id,
    definitionId: definition.id,
    name: definition.name,
    side: 'enemy',
    exp: definition.rewards?.exp ?? definition.exp ?? 0,
    gold: definition.rewards?.gold ?? definition.gold ?? 0,
    affinities: { ...(definition.affinities ?? {}) },
    phases: definition.phases.map((phase) => ({
      ...phase,
      actions: Array.isArray(phase.actions) ? phase.actions.map((action) => ({ ...action })) : [],
      onEnter: phase.onEnter ? { ...phase.onEnter } : null,
    })),
    stats: new CharacterStats({
      maxHp: definition.maxHp, maxMp: 0, attack: definition.attack,
      defense: definition.defense, magicAttack: definition.magicAttack ?? 0,
      magicDefense: definition.magicDefense ?? 0, speed: definition.speed,
      ...statOverrides,
    }),
  };
}
