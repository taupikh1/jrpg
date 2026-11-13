/**
 * Marks an entity as interactable within a range.
 */
export class InteractionComponent {
  /**
   * @param {object} [opts]
   * @param {number} [opts.range=28]
   * @param {boolean} [opts.enabled=true]
   * @param {string} [opts.prompt='Interact']
   * @param {(entity: import('../Entity.js').Entity, interactor: import('../Entity.js').Entity) => void} [opts.onInteract]
   */
  constructor(opts = {}) {
    this.range = opts.range ?? 28;
    this.enabled = opts.enabled !== false;
    this.prompt = opts.prompt ?? 'Interact';
    this.onInteract = opts.onInteract ?? null;
    this.oneShot = !!opts.oneShot;
    this.used = false;
  }

  onAttach() {}
  onDetach() {}

  /**
   * @param {import('../Entity.js').Entity} self
   * @param {import('../Entity.js').Entity} interactor
   */
  canInteract(self, interactor) {
    if (!this.enabled || this.used) return false;
    const dx = self.x - interactor.x;
    const dy = self.y - interactor.y;
    return Math.hypot(dx, dy) <= this.range;
  }

  /**
   * @param {import('../Entity.js').Entity} self
   * @param {import('../Entity.js').Entity} interactor
   */
  interact(self, interactor) {
    if (!this.canInteract(self, interactor)) return false;
    const result = this.onInteract ? this.onInteract(self, interactor) : undefined;
    // A callback may reject a one-shot interaction (for example, a pickup when
    // the inventory is full). Keep it available so the player can retry later.
    if (result === false) return false;
    if (this.oneShot) this.used = true;
    return true;
  }
}
