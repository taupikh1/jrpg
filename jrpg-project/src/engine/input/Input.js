import { assertInputSourcePort } from '../../core/ports/InputSourcePort.js';

/**
 * High-level input state tracker.
 * Receives normalized events from one or more InputSourcePort instances.
 */
export class Input {
  /**
   * @param {import('../../core/ports/InputSourcePort.js').InputSourcePort[]} sources
   */
  constructor(sources = []) {
    this._keysDown = new Set();
    this._keysPressed = new Set();
    this._keysReleased = new Set();
    this._pointers = new Map();
    /** Pointer-down events seen since the last endFrame (so taps shorter than a frame are not lost). */
    this._pointerDownsFrame = [];
    this._unsubs = [];
    this._destroyed = false;

    for (const src of sources) {
      assertInputSourcePort(src);
      const unsub = src.subscribe((ev) => this._onEvent(ev));
      this._unsubs.push(unsub);
    }
  }

  /**
   * @param {import('../../core/ports/InputSourcePort.js').NormalizedInputEvent} ev
   */
  _onEvent(ev) {
    if (this._destroyed) return;

    switch (ev.type) {
      case 'keydown':
        if (ev.code && !this._keysDown.has(ev.code)) {
          this._keysPressed.add(ev.code);
        }
        if (ev.code) this._keysDown.add(ev.code);
        break;
      case 'keyup':
        if (ev.code) {
          this._keysDown.delete(ev.code);
          this._keysReleased.add(ev.code);
        }
        break;
      case 'pointerdown':
      case 'pointermove':
      case 'pointerup':
      case 'pointercancel': {
        const id = ev.pointerId ?? 0;
        if (ev.type === 'pointerup' || ev.type === 'pointercancel') {
          this._pointers.delete(id);
        } else {
          this._pointers.set(id, {
            x: ev.x ?? 0,
            y: ev.y ?? 0,
            clientX: ev.clientX ?? 0,
            clientY: ev.clientY ?? 0,
            pointerType: ev.pointerType ?? 'unknown',
            primary: !!ev.primary,
            down: ev.type === 'pointerdown' || this._pointers.get(id)?.down,
          });
          if (ev.type === 'pointerdown') {
            this._pointers.get(id).down = true;
            this._pointerDownsFrame.push({
              x: ev.x ?? 0,
              y: ev.y ?? 0,
              pointerType: ev.pointerType ?? 'unknown',
            });
          }
        }
        break;
      }
    }
  }

  /**
   * Call once per frame after update logic that consumes pressed/released.
   */
  endFrame() {
    this._keysPressed.clear();
    this._keysReleased.clear();
    this._pointerDownsFrame.length = 0;
  }

  /**
   * Pointer-down (tap / mouse press) events since the last endFrame, in logical coordinates.
   * Unlike pointers(), this keeps taps that were pressed and released within one frame.
   * @returns {ReadonlyArray<{x: number, y: number, pointerType: string}>}
   */
  pointerDownsThisFrame() {
    return this._pointerDownsFrame;
  }

  /**
   * @param {string} code
   * @returns {boolean}
   */
  isDown(code) {
    return this._keysDown.has(code);
  }

  /**
   * @param {string} code
   * @returns {boolean}
   */
  justPressed(code) {
    return this._keysPressed.has(code);
  }

  /**
   * @param {string} code
   * @returns {boolean}
   */
  justReleased(code) {
    return this._keysReleased.has(code);
  }

  /**
   * @returns {IterableIterator<object>}
   */
  pointers() {
    return this._pointers.values();
  }

  /**
   * Primary pointer (if any).
   * @returns {object|null}
   */
  primaryPointer() {
    for (const p of this._pointers.values()) {
      if (p.primary) return p;
    }
    return this._pointers.values().next().value ?? null;
  }

  destroy() {
    this._destroyed = true;
    for (const unsub of this._unsubs) unsub();
    this._unsubs.length = 0;
    this._keysDown.clear();
    this._keysPressed.clear();
    this._keysReleased.clear();
    this._pointers.clear();
    this._pointerDownsFrame.length = 0;
  }
}
