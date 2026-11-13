/**
 * Normalized input event types.
 * @typedef {'keydown'|'keyup'|'pointerdown'|'pointerup'|'pointermove'|'pointercancel'} InputEventType
 */

/**
 * @typedef {Object} NormalizedInputEvent
 * @property {InputEventType} type
 * @property {string} [code] - Keyboard code (e.g. "KeyW", "ArrowUp")
 * @property {string} [key]
 * @property {number} [x] - Logical canvas X
 * @property {number} [y] - Logical canvas Y
 * @property {number} [clientX]
 * @property {number} [clientY]
 * @property {number} [pointerId]
 * @property {string} [pointerType]
 * @property {boolean} [primary]
 * @property {number} timeStamp
 */

/**
 * @typedef {Object} InputSourcePort
 * @property {(listener: (event: NormalizedInputEvent) => void) => () => void} subscribe - Returns unsubscribe.
 * @property {() => void} destroy
 */

/**
 * @param {unknown} obj
 * @returns {asserts obj is InputSourcePort}
 */
export function assertInputSourcePort(obj) {
  if (!obj || typeof obj.subscribe !== 'function' || typeof obj.destroy !== 'function') {
    throw new TypeError('InputSourcePort requires subscribe() and destroy() methods');
  }
}
