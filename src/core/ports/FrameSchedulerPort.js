/**
 * @typedef {Object} FrameSchedulerPort
 * @property {(callback: (time: number) => void) => number} request - Schedule a frame callback. Returns handle.
 * @property {(handle: number) => void} cancel - Cancel a scheduled callback.
 */

/**
 * @param {unknown} obj
 * @returns {asserts obj is FrameSchedulerPort}
 */
export function assertFrameSchedulerPort(obj) {
  if (!obj || typeof obj.request !== 'function' || typeof obj.cancel !== 'function') {
    throw new TypeError('FrameSchedulerPort requires request() and cancel() methods');
  }
}
