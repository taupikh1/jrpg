import { CharacterStats } from '../stats/CharacterStats.js';

/**
 * Builds a runtime enemy participant from an injected content definition.
 * The battle engine stays content-agnostic; callers own catalogue lookup.
 */
export function createEnemyParticipant(definition, { id = definition?.id, name = definition?.name, statOverrides = {} } = {}) {
  if (!definition || typeof definition !== 'object' || !definition.id) {
    throw new TypeError('Enemy definition with a stable id is required');
  }
  const stats = new CharacterStats({
    maxHp: definition.maxHp,
    maxMp: 0,
    attack: definition.attack,
    defense: definition.defense,
    magicAttack: definition.magicAttack ?? 0,
    magicDefense: definition.magicDefense ?? 0,
    speed: definition.speed,
    ...statOverrides,
  });
  return {
    id: id ?? definition.id,
    definitionId: definition.id,
    name: name ?? definition.name,
    side: 'enemy',
    exp: definition.exp ?? 0,
    gold: definition.gold ?? 0,
    affinities: { ...(definition.affinities ?? {}) },
    ai: definition.ai ? { ...definition.ai, actions: [...(definition.ai.actions ?? [])] } : undefined,
    stats,
  };
}
