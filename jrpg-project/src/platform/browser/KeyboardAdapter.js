/**
 * @implements {import('../../core/ports/InputSourcePort.js').InputSourcePort}
 */
export class KeyboardAdapter {
  constructor() {
    /** @type {Set<Function>} */
    this._listeners = new Set();
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
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
        console.error('[KeyboardAdapter]', e);
      }
    }
  }

  _handleKeyDown(e) {
    // Avoid repeating keydown spam for held keys in some browsers
    if (e.repeat) return;
    this._emit({
      type: 'keydown',
      code: e.code,
      key: e.key,
      timeStamp: e.timeStamp,
    });
  }

  _handleKeyUp(e) {
    this._emit({
      type: 'keyup',
      code: e.code,
      key: e.key,
      timeStamp: e.timeStamp,
    });
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this._listeners.clear();
  }
}
