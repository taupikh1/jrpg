/**
 * Finds nearest interactable target for an interactor entity.
 */
export class InteractionSystem {
  /**
   * @param {import('../EntityManager.js').EntityManager} manager
   */
  constructor(manager) {
    this.manager = manager;
    /** @type {import('../Entity.js').Entity|null} */
    this.currentTarget = null;
  }

  /**
   * @param {import('../Entity.js').Entity} interactor
   * @returns {import('../Entity.js').Entity|null}
   */
  findTarget(interactor) {
    let best = null;
    let bestDist = Infinity;
    for (const e of this.manager.all()) {
      if (e.id === interactor.id || e.destroyed) continue;
      const ic = e.get('interaction');
      if (!ic || !ic.canInteract(e, interactor)) continue;
      const d = Math.hypot(e.x - interactor.x, e.y - interactor.y);
      if (d < bestDist) {
        bestDist = d;
        best = e;
      }
    }
    this.currentTarget = best;
    return best;
  }

  /**
   * @param {import('../Entity.js').Entity} interactor
   * @returns {boolean}
   */
  tryInteract(interactor) {
    const target = this.findTarget(interactor);
    if (!target) return false;
    const ic = target.get('interaction');
    return ic ? ic.interact(target, interactor) : false;
  }
}
