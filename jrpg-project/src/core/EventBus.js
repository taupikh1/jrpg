/**
 * Simple, leak-resistant event bus.
 * Safe to unsubscribe during emit. Predictable order (registration order).
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * @param {string} event
   * @param {Function} handler
   * @returns {() => void} unsubscribe function
   */
  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('EventBus.on: handler must be a function');
    }
    let set = this._listeners.get(event);
    if (!set) {
      set = new Set();
      this._listeners.set(event, set);
    }
    set.add(handler);
    return () => this.off(event, handler);
  }

  /**
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) this._listeners.delete(event);
    }
  }

  /**
   * @param {string} event
   * @param {...any} args
   */
  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (!set || set.size === 0) return;
    // Snapshot to allow safe removal during dispatch
    const handlers = Array.from(set);
    for (const handler of handlers) {
      if (set.has(handler)) {
        try {
          handler(...args);
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err);
        }
      }
    }
  }

  /**
   * Remove all listeners for one event, or all events if no argument.
   * @param {string} [event]
   */
  clear(event) {
    if (event === undefined) {
      this._listeners.clear();
    } else {
      this._listeners.delete(event);
    }
  }

  /**
   * @param {string} event
   * @returns {number}
   */
  listenerCount(event) {
    return this._listeners.get(event)?.size ?? 0;
  }
}
