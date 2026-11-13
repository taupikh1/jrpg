/**
 * On-screen touch controls (D-pad, action, menu).
 *
 * Acts as an InputSourcePort: each press emits the same keydown/keyup codes the keyboard
 * uses (ArrowUp…, KeyE, KeyP), so gameplay reads touch through the existing Input system.
 *
 * Reliability rules:
 * - Pointer events only (no touch events), so one finger never produces two actions.
 * - Each pointer id is tracked. A code is released only when the last pointer holding it lets go.
 * - pointercancel, lost capture, window blur and tab hiding release everything, so movement
 *   cannot get stuck after an interruption.
 *
 * The logic (press / release / releaseAll) has no DOM dependency and is unit-tested directly.
 * DOM wiring lives in mount() and is only used in the browser.
 *
 * @implements {import('../../core/ports/InputSourcePort.js').InputSourcePort}
 */

/** Button → keyboard code. Shared with the keyboard so gameplay code needs no changes. */
export const TOUCH_BINDINGS = Object.freeze({
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  action: 'KeyE',
  menu: 'KeyP',
});

const BUTTON_LABELS = Object.freeze({
  up: '▲',
  down: '▼',
  left: '◀',
  right: '▶',
  action: 'AKSI',
  menu: 'MENU',
});

export class TouchControls {
  constructor() {
    /** @type {Set<Function>} */
    this._listeners = new Set();
    /** pointerId → code */
    this._held = new Map();
    /** code → number of pointers holding it */
    this._counts = new Map();
    /** @type {HTMLElement|null} */
    this._root = null;
    /** @type {Array<{el: HTMLElement, code: string, pointerId?: number}>} */
    this._buttons = [];
    /** @type {Array<() => void>} */
    this._cleanups = [];
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _emit(type, code) {
    const ev = { type, code, key: code, timeStamp: 0 };
    for (const fn of this._listeners) {
      try {
        fn(ev);
      } catch (e) {
        console.error('[TouchControls]', e);
      }
    }
  }

  /**
   * @param {number} pointerId
   * @param {string} code
   */
  press(pointerId, code) {
    // One pointer holds one control at a time.
    if (this._held.has(pointerId)) this.release(pointerId);
    this._held.set(pointerId, code);
    const n = (this._counts.get(code) ?? 0) + 1;
    this._counts.set(code, n);
    if (n === 1) this._emit('keydown', code);
    this._refreshButtons();
  }

  /** @param {number} pointerId */
  release(pointerId) {
    const code = this._held.get(pointerId);
    if (code === undefined) return;
    this._held.delete(pointerId);
    const n = (this._counts.get(code) ?? 1) - 1;
    if (n <= 0) {
      this._counts.delete(code);
      this._emit('keyup', code);
    } else {
      this._counts.set(code, n);
    }
    this._refreshButtons();
  }

  releaseAll() {
    for (const id of [...this._held.keys()]) this.release(id);
  }

  /** Codes currently held by at least one pointer. */
  heldCodes() {
    return [...this._counts.keys()];
  }

  /** Keep the touch overlay aligned to the actual game canvas, including letterboxed viewports. */
  setBounds(rect) {
    if (!this._root || !rect) return;
    this._root.style.left = `${Math.round(rect.left)}px`;
    this._root.style.top = `${Math.round(rect.top)}px`;
    this._root.style.width = `${Math.max(0, Math.round(rect.width))}px`;
    this._root.style.height = `${Math.max(0, Math.round(rect.height))}px`;
  }

  /** Build the overlay in the document and wire pointer handlers. Browser only. */
  mount(doc = globalThis.document, win = globalThis.window) {
    const root = doc.createElement('div');
    root.id = 'touch-controls';
    root.setAttribute('aria-label', 'Kontrol sentuh');
    root.innerHTML = `
      <div class="tc-dpad">
        <span></span>${this._btnHtml('up')}<span></span>
        ${this._btnHtml('left')}<span class="tc-hub"></span>${this._btnHtml('right')}
        <span></span>${this._btnHtml('down')}<span></span>
      </div>
      <div class="tc-action-wrap">${this._btnHtml('action')}</div>
      <div class="tc-menu-wrap">${this._btnHtml('menu')}</div>`;
    doc.body.appendChild(root);
    this._root = root;

    for (const [name, code] of Object.entries(TOUCH_BINDINGS)) {
      const el = root.querySelector(`[data-control="${name}"]`);
      if (!el) continue;
      const entry = { el, code };
      this._buttons.push(entry);
      const onDown = (e) => {
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch (_) { /* unsupported: pointerup still reaches us */ }
        this.press(e.pointerId, code);
      };
      const onUp = (e) => this.release(e.pointerId);
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
      el.addEventListener('lostpointercapture', onUp);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
      this._cleanups.push(() => {
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        el.removeEventListener('lostpointercapture', onUp);
      });
    }

    if (win) {
      const onBlur = () => this.releaseAll();
      const onVis = () => { if (doc.hidden) this.releaseAll(); };
      // Stop iOS pinch-zoom while touching the game.
      const onGesture = (e) => e.preventDefault();
      win.addEventListener('blur', onBlur);
      doc.addEventListener('visibilitychange', onVis);
      doc.addEventListener('gesturestart', onGesture, { passive: false });
      this._cleanups.push(() => {
        win.removeEventListener('blur', onBlur);
        doc.removeEventListener('visibilitychange', onVis);
        doc.removeEventListener('gesturestart', onGesture);
      });
    }
    return root;
  }

  _btnHtml(name) {
    const label = BUTTON_LABELS[name];
    const aria = { up: 'Atas', down: 'Bawah', left: 'Kiri', right: 'Kanan', action: 'Interaksi', menu: 'Menu' }[name];
    return `<button type="button" class="tc-btn tc-${name}" data-control="${name}" aria-label="${aria}" tabindex="-1">${label}</button>`;
  }

  _refreshButtons() {
    for (const b of this._buttons) {
      b.el.classList.toggle('tc-active', (this._counts.get(b.code) ?? 0) > 0);
    }
  }

  /** @param {boolean} visible */
  setVisible(visible) {
    if (this._root) this._root.style.display = visible ? '' : 'none';
    if (!visible) this.releaseAll();
  }

  destroy() {
    this.releaseAll();
    for (const fn of this._cleanups) fn();
    this._cleanups.length = 0;
    this._buttons.length = 0;
    if (this._root?.parentNode) this._root.parentNode.removeChild(this._root);
    this._root = null;
    this._listeners.clear();
  }
}

/** Touch-capable device, or ?touch=1 for testing on a desktop browser. */
export function shouldShowTouchControls(win = globalThis.window) {
  if (!win) return false;
  if (new URLSearchParams(win.location?.search ?? '').has('touch')) return true;
  return (win.navigator?.maxTouchPoints ?? 0) > 0;
}
