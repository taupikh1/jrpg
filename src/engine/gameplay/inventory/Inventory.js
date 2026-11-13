/**
 * Slot-based inventory with stacking.
 */
export class Inventory {
  /**
   * @param {object} opts
   * @param {import('../items/ItemRegistry.js').ItemRegistry} opts.registry
   * @param {number} [opts.capacity=20]
   * @param {import('../../../core/EventBus.js').EventBus} [opts.events]
   */
  constructor({ registry, capacity = 20, events = null }) {
    this.registry = registry;
    this.capacity = capacity;
    this.events = events;
    /** @type {{ itemId: string, qty: number }[]} */
    this.slots = [];
  }

  /**
   * @param {string} itemId
   * @param {number} [qty=1]
   * @returns {{ ok: boolean, reason?: string, added?: number }}
   */
  add(itemId, qty = 1) {
    const def = this.registry.get(itemId);
    if (!def) return { ok: false, reason: 'unknown_item' };
    if (qty < 1) return { ok: false, reason: 'invalid_qty' };

    let remaining = qty;
    // Fill existing stacks
    for (const slot of this.slots) {
      if (slot.itemId !== itemId) continue;
      const space = def.stackLimit - slot.qty;
      if (space <= 0) continue;
      const take = Math.min(space, remaining);
      slot.qty += take;
      remaining -= take;
      if (remaining === 0) break;
    }
    // New stacks
    while (remaining > 0) {
      if (this.slots.length >= this.capacity) {
        if (this.events) {
          this.events.emit('inventory.item_added', { itemId, qty: qty - remaining, partial: true });
        }
        return remaining === qty
          ? { ok: false, reason: 'full' }
          : { ok: true, added: qty - remaining, reason: 'partial' };
      }
      const take = Math.min(def.stackLimit, remaining);
      this.slots.push({ itemId, qty: take });
      remaining -= take;
    }
    if (this.events) this.events.emit('inventory.item_added', { itemId, qty });
    return { ok: true, added: qty };
  }

  /**
   * @param {string} itemId
   * @param {number} [qty=1]
   * @returns {{ ok: boolean, reason?: string }}
   */
  remove(itemId, qty = 1) {
    if (this.count(itemId) < qty) return { ok: false, reason: 'insufficient' };
    let left = qty;
    for (let i = this.slots.length - 1; i >= 0 && left > 0; i--) {
      const slot = this.slots[i];
      if (slot.itemId !== itemId) continue;
      const take = Math.min(slot.qty, left);
      slot.qty -= take;
      left -= take;
      if (slot.qty <= 0) this.slots.splice(i, 1);
    }
    if (this.events) this.events.emit('inventory.item_removed', { itemId, qty });
    return { ok: true };
  }

  /**
   * @param {string} itemId
   */
  count(itemId) {
    return this.slots.filter((s) => s.itemId === itemId).reduce((n, s) => n + s.qty, 0);
  }

  has(itemId, qty = 1) {
    return this.count(itemId) >= qty;
  }

  /**
   * Use a consumable on a CharacterStats target.
   * @param {string} itemId
   * @param {import('../stats/CharacterStats.js').CharacterStats} stats
   */
  use(itemId, stats) {
    const def = this.registry.get(itemId);
    if (!def || !def.usable) return { ok: false, reason: 'not_usable' };
    if (!this.has(itemId)) return { ok: false, reason: 'insufficient' };
    const effect = def.effect || {};
    if (effect.heal) stats.heal(effect.heal);
    if (effect.restoreMp) stats.mp = Math.min(stats.maxMp, stats.mp + effect.restoreMp);
    this.remove(itemId, 1);
    if (this.events) this.events.emit('inventory.item_used', { itemId });
    return { ok: true };
  }

  list() {
    return this.slots.map((s) => ({
      ...s,
      def: this.registry.get(s.itemId),
    }));
  }

  get usedSlots() {
    return this.slots.length;
  }
}
