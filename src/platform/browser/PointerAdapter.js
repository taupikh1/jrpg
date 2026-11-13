/**
 * Pointer (mouse + touch) adapter. Converts client coords via a provided converter.
 * @implements {import('../../core/ports/InputSourcePort.js').InputSourcePort}
 */
export class PointerAdapter {
  /**
   * @param {HTMLElement} target
   * @param {(clientX: number, clientY: number) => {x: number, y: number}} clientToLogical
   */
  constructor(target, clientToLogical) {
    this._target = target;
    this._clientToLogical = clientToLogical;
    /** @type {Set<Function>} */
    this._listeners = new Set();

    this._onDown = this._handle.bind(this, 'pointerdown');
    this._onUp = this._handle.bind(this, 'pointerup');
    this._onMove = this._handle.bind(this, 'pointermove');
    this._onCancel = this._handle.bind(this, 'pointercancel');

    target.addEventListener('pointerdown', this._onDown);
    target.addEventListener('pointerup', this._onUp);
    target.addEventListener('pointermove', this._onMove);
    target.addEventListener('pointercancel', this._onCancel);
    // Prevent scrolling / browser gestures while interacting
    target.style.touchAction = 'none';
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _emit(ev) {
    for (const fn of this._listeners) {
      try {
        fn(ev);
      } catch (e) {
        console.error('[PointerAdapter]', e);
      }
    }
  }

  _handle(type, e) {
    const logical = this._clientToLogical(e.clientX, e.clientY);
    this._emit({
      type,
      x: logical.x,
      y: logical.y,
      clientX: e.clientX,
      clientY: e.clientY,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      primary: e.isPrimary,
      timeStamp: e.timeStamp,
    });
  }

  destroy() {
    this._target.removeEventListener('pointerdown', this._onDown);
    this._target.removeEventListener('pointerup', this._onUp);
    this._target.removeEventListener('pointermove', this._onMove);
    this._target.removeEventListener('pointercancel', this._onCancel);
    this._listeners.clear();
  }
}
