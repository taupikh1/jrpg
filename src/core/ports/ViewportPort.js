/**
 * @typedef {Object} ViewportMetrics
 * @property {number} cssWidth
 * @property {number} cssHeight
 * @property {number} dpr
 * @property {'portrait'|'landscape'} orientation
 */

/**
 * @typedef {Object} ViewportPort
 * @property {() => ViewportMetrics} getMetrics
 * @property {(listener: (metrics: ViewportMetrics) => void) => () => void} onResize - Returns unsubscribe.
 */

/**
 * @param {unknown} obj
 * @returns {asserts obj is ViewportPort}
 */
export function assertViewportPort(obj) {
  if (!obj || typeof obj.getMetrics !== 'function' || typeof obj.onResize !== 'function') {
    throw new TypeError('ViewportPort requires getMetrics() and onResize() methods');
  }
}
