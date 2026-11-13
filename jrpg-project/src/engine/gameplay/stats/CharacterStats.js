/**
 * Character statistics with base values and stackable modifiers.
 * Order: base + sum(modifiers), clamped to >= 0 (HP/MP current capped by max).
 */
export class CharacterStats {
  /**
   * @param {object} [base]
   */
  constructor(base = {}) {
    this.base = {
      maxHp: base.maxHp ?? 50,
      maxMp: base.maxMp ?? 20,
      attack: base.attack ?? 10,
      defense: base.defense ?? 5,
      magicAttack: base.magicAttack ?? 8,
      magicDefense: base.magicDefense ?? 4,
      speed: base.speed ?? 10,
      critChance: base.critChance ?? 0.05,
    };
    this.hp = this.base.maxHp;
    this.mp = this.base.maxMp;
    /** @type {{ id: string, stats: Partial<typeof this.base> }[]} */
    this._mods = [];
  }

  /**
   * @param {string} id
   * @param {Partial<typeof this.base>} stats
   */
  addModifier(id, stats) {
    this.removeModifier(id);
    this._mods.push({ id, stats: { ...stats } });
  }

  /**
   * @param {string} id
   */
  removeModifier(id) {
    this._mods = this._mods.filter((m) => m.id !== id);
  }

  /**
   * Remove every modifier whose id starts with the prefix (used to clear battle-only effects).
   * @param {string} prefix
   */
  removeModifiersWithPrefix(prefix) {
    this._mods = this._mods.filter((m) => !m.id.startsWith(prefix));
  }

  /**
   * @param {keyof typeof this.base} key
   */
  get(key) {
    let v = this.base[key] ?? 0;
    for (const m of this._mods) {
      if (m.stats[key] != null) v += m.stats[key];
    }
    return Math.max(0, v);
  }

  get maxHp() {
    return this.get('maxHp');
  }
  get maxMp() {
    return this.get('maxMp');
  }
  get attack() {
    return this.get('attack');
  }
  get defense() {
    return this.get('defense');
  }
  get magicAttack() {
    return this.get('magicAttack');
  }
  get magicDefense() {
    return this.get('magicDefense');
  }
  get speed() {
    return this.get('speed');
  }
  get critChance() {
    return Math.min(1, this.get('critChance'));
  }

  /**
   * @param {number} amount
   */
  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + Math.max(0, amount));
  }

  /**
   * @param {number} amount
   * @returns {number} actual damage dealt
   */
  takeDamage(amount) {
    const d = Math.max(0, amount);
    const before = this.hp;
    this.hp = Math.max(0, this.hp - d);
    return before - this.hp;
  }

  /**
   * @param {number} amount
   * @returns {boolean}
   */
  spendMp(amount) {
    if (this.mp < amount) return false;
    this.mp -= amount;
    return true;
  }

  get isAlive() {
    return this.hp > 0;
  }

  snapshot() {
    return {
      hp: this.hp,
      mp: this.mp,
      maxHp: this.maxHp,
      maxMp: this.maxMp,
      attack: this.attack,
      defense: this.defense,
      speed: this.speed,
    };
  }
}
