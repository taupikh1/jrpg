/**
 * Documented damage formulas for turn-based combat.
 */
export class DamageCalculator {
  /**
   * Physical: max(1, atk - def) with optional crit.
   * @param {import('../stats/CharacterStats.js').CharacterStats} attacker
   * @param {import('../stats/CharacterStats.js').CharacterStats} defender
   * @param {object} [opts]
   * @param {number} [opts.power=1]
   * @param {() => number} [opts.rng] - 0..1
   */
  static physical(attacker, defender, opts = {}) {
    const power = opts.power ?? 1;
    const rng = opts.rng ?? Math.random;
    let dmg = Math.max(1, Math.floor(attacker.attack * power - defender.defense * 0.5));
    const crit = rng() < attacker.critChance;
    if (crit) dmg = Math.floor(dmg * 1.5);
    return { damage: Math.max(1, dmg), critical: crit };
  }

  /**
   * Magical: max(1, matk - mdef * 0.5)
   */
  static magical(attacker, defender, opts = {}) {
    const power = opts.power ?? 1;
    let dmg = Math.max(1, Math.floor(attacker.magicAttack * power - defender.magicDefense * 0.5));
    return { damage: dmg, critical: false };
  }
}
