/**
 * @implements {import('../../core/ports/FrameSchedulerPort.js').FrameSchedulerPort}
 */
export class RafScheduler {
  request(callback) {
    return requestAnimationFrame(callback);
  }

  cancel(handle) {
    cancelAnimationFrame(handle);
  }
}
