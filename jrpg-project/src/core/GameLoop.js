import { assertClockPort } from './ports/ClockPort.js';
import { assertFrameSchedulerPort } from './ports/FrameSchedulerPort.js';

/**
 * Frame-rate independent game loop using injected clock + scheduler ports.
 * Supports pause/resume, max delta clamping, and visibility handling.
 */
export class GameLoop {
  /**
   * @param {object} options
   * @param {import('./ports/ClockPort.js').ClockPort} options.clock
   * @param {import('./ports/FrameSchedulerPort.js').FrameSchedulerPort} options.scheduler
   * @param {(dt: number) => void} options.update - Called with delta seconds
   * @param {(alpha: number) => void} [options.render]
   * @param {number} [options.maxDelta=0.1] - Clamp large deltas (seconds)
   * @param {number} [options.fixedStep=0] - If >0, use fixed timestep accumulation
   */
  constructor({ clock, scheduler, update, render, maxDelta = 0.1, fixedStep = 0 }) {
    assertClockPort(clock);
    assertFrameSchedulerPort(scheduler);
    if (typeof update !== 'function') throw new TypeError('GameLoop requires update(dt)');

    this._clock = clock;
    this._scheduler = scheduler;
    this._update = update;
    this._render = render || (() => {});
    this._maxDelta = maxDelta;
    this._fixedStep = fixedStep;

    this._running = false;
    this._paused = false;
    this._handle = 0;
    this._lastTime = 0;
    this._accumulator = 0;
    this._rafBound = this._frame.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._paused = false;
    this._lastTime = this._clock.now();
    this._accumulator = 0;
    this._handle = this._scheduler.request(this._rafBound);
  }

  stop() {
    if (!this._running) return;
    this._running = false;
    if (this._handle) {
      this._scheduler.cancel(this._handle);
      this._handle = 0;
    }
  }

  pause() {
    this._paused = true;
  }

  resume() {
    if (!this._paused) return;
    this._paused = false;
    this._lastTime = this._clock.now();
    this._accumulator = 0;
  }

  get isRunning() {
    return this._running;
  }

  get isPaused() {
    return this._paused;
  }

  /**
   * @param {number} time - High-res timestamp from scheduler
   */
  _frame(time) {
    if (!this._running) return;

    this._handle = this._scheduler.request(this._rafBound);

    if (this._paused) {
      this._lastTime = time;
      this._render(1);
      return;
    }

    let dt = (time - this._lastTime) / 1000;
    this._lastTime = time;

    if (dt < 0) dt = 0;
    if (dt > this._maxDelta) dt = this._maxDelta;

    if (this._fixedStep > 0) {
      this._accumulator += dt;
      while (this._accumulator >= this._fixedStep) {
        this._update(this._fixedStep);
        this._accumulator -= this._fixedStep;
      }
      const alpha = this._accumulator / this._fixedStep;
      this._render(alpha);
    } else {
      this._update(dt);
      this._render(1);
    }
  }
}
