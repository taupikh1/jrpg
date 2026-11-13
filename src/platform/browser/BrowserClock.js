/**
 * @implements {import('../../core/ports/ClockPort.js').ClockPort}
 */
export class BrowserClock {
  now() {
    return performance.now();
  }
}
