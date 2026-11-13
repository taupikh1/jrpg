/**
 * Elemental affinity rules. Affinity per element is given by the target:
 * { fire: 'weak', ice: 'resist', light: 'immune' }. Missing or unknown entries are neutral.
 */
export const AFFINITY_MULTIPLIER = Object.freeze({ weak: 1.5, resist: 0.5, immune: 0, neutral: 1 });

/**
 * @param {string|null|undefined} element
 * @param {Record<string, string>|null|undefined} affinities
 * @returns {'weak'|'resist'|'immune'|'neutral'}
 */
export function affinityFor(element, affinities) {
  if (!element || !affinities) return 'neutral';
  const a = affinities[element];
  return Object.hasOwn(AFFINITY_MULTIPLIER, a) ? a : 'neutral';
}

/** @returns {number} multiplier applied to raw damage */
export function elementMultiplier(element, affinities) {
  return AFFINITY_MULTIPLIER[affinityFor(element, affinities)];
}
