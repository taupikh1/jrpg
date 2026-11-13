/**
 * @typedef {Object} ClockPort
 * @property {() => number} now - Returns high-resolution time in milliseconds.
 */

/**
 * Runtime shape check for ClockPort.
 * @param {unknown} obj
 * @returns {asserts obj is ClockPort}
 */
export function assertClockPort(obj) {
  if (!obj || typeof obj.now !== 'function') {
    throw new TypeError('ClockPort requires a now() method');
  }
}
