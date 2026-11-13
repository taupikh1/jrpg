/**
 * Equipment slots backed by inventory ownership + CharacterStats modifiers.
 */
export class Equipment {
  /**
   * @param {object} opts
   * @param {import('../inventory/Inventory.js').Inventory} opts.inventory
   * @param {import('../stats/CharacterStats.js').CharacterStats} opts.stats
   * @param {import('../items/ItemRegistry.js').ItemRegistry} opts.registry
   * @param {import('../../../core/EventBus.js').EventBus} [opts.events]
   * @param {string[]} [opts.slots]
   */
  constructor({ inventory, stats, registry, events = null, slots }) {
    this.inventory = inventory;
    this.stats = stats;
    this.registry = registry;
    this.events = events;
    this.slotNames = slots || ['weapon', 'head', 'body', 'accessory1', 'accessory2'];
    /** @type {Record<string, string|null>} */
    this.equipped = Object.fromEntries(this.slotNames.map((s) => [s, null]));
  }

  /**
   * @param {string} itemId
   * @returns {{ ok: boolean, reason?: string, replaced?: string|null }}
   */
  equip(itemId) {
    const def = this.registry.get(itemId);
    if (!def) return { ok: false, reason: 'unknown_item' };
    if (def.category !== 'equipment') return { ok: false, reason: 'not_equipment' };
    const slot = def.equipSlot;
    if (!this.slotNames.includes(slot)) return { ok: false, reason: 'bad_slot' };
    if (!this.inventory.has(itemId)) return { ok: false, reason: 'not_owned' };

    const prev = this.equipped[slot];
    // Remove from inventory (equip stores reference by id)
    const rem = this.inventory.remove(itemId, 1);
    if (!rem.ok) return { ok: false, reason: rem.reason };

    if (prev) {
      this.stats.removeModifier(`equip:${slot}`);
      this.inventory.add(prev, 1);
    }

    this.equipped[slot] = itemId;
    if (def.stats) this.stats.addModifier(`equip:${slot}`, def.stats);

    if (this.events) {
      this.events.emit('equipment.changed', { slot, itemId, previous: prev });
    }
    return { ok: true, replaced: prev };
  }

  /**
   * @param {string} slot
   */
  unequip(slot) {
    const itemId = this.equipped[slot];
    if (!itemId) return { ok: false, reason: 'empty' };
    this.stats.removeModifier(`equip:${slot}`);
    this.equipped[slot] = null;
    this.inventory.add(itemId, 1);
    if (this.events) this.events.emit('equipment.changed', { slot, itemId: null, previous: itemId });
    return { ok: true, itemId };
  }

  get(slot) {
    return this.equipped[slot] ?? null;
  }
}
