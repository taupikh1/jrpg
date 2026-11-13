/**
 * Item definition registry with validation.
 */

const CATEGORIES = new Set(['consumable', 'equipment', 'quest', 'material', 'key', 'misc']);
const SLOTS = new Set(['weapon', 'head', 'body', 'accessory1', 'accessory2']);

/**
 * @typedef {Object} ItemDef
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {'consumable'|'equipment'|'quest'|'material'|'key'|'misc'} category
 * @property {number} [stackLimit=99]
 * @property {number} [sellValue]
 * @property {boolean} [usable]
 * @property {boolean} [battleUsable]
 * @property {string} [equipSlot]
 * @property {object} [stats] - equipment modifiers
 * @property {object} [effect] - e.g. { heal: 20 } or { restoreMp: 10 }
 */

export class ItemRegistry {
  constructor() {
    /** @type {Map<string, ItemDef>} */
    this._items = new Map();
  }

  /**
   * @param {ItemDef} def
   */
  register(def) {
    if (!def?.id || !def.name) throw new Error('Item requires id and name');
    if (this._items.has(def.id)) throw new Error(`Duplicate item id "${def.id}"`);
    if (!CATEGORIES.has(def.category)) throw new Error(`Invalid category "${def.category}"`);
    const stackLimit = def.stackLimit ?? 99;
    if (stackLimit < 1) throw new Error(`Invalid stackLimit for ${def.id}`);
    if (def.category === 'equipment') {
      if (!def.equipSlot || !SLOTS.has(def.equipSlot)) {
        throw new Error(`Equipment "${def.id}" needs valid equipSlot`);
      }
    }
    const normalized = {
      ...def,
      stackLimit,
      description: def.description ?? '',
      usable: def.usable ?? def.category === 'consumable',
      battleUsable: def.battleUsable ?? false,
    };
    this._items.set(def.id, Object.freeze(normalized));
    return normalized;
  }

  /**
   * @param {string} id
   * @returns {ItemDef|null}
   */
  get(id) {
    return this._items.get(id) ?? null;
  }

  has(id) {
    return this._items.has(id);
  }

  all() {
    return [...this._items.values()];
  }
}
