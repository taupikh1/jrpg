import { GameLoop } from './GameLoop.js';
import { SceneManager } from './SceneManager.js';
import { EventBus } from './EventBus.js';
import { Config } from './Config.js';
import { log } from './Logger.js';

/**
 * Top-level game orchestrator. Receives ports via constructor (composition root injects them).
 * Core must not touch browser globals (document/window).
 */
export class Game {
  /**
   * @param {object} deps
   * @param {import('./ports/ClockPort.js').ClockPort} deps.clock
   * @param {import('./ports/FrameSchedulerPort.js').FrameSchedulerPort} deps.scheduler
   * @param {import('./ports/ViewportPort.js').ViewportPort} deps.viewport
   * @param {import('./ports/RenderSurfacePort.js').RenderSurfacePort} deps.surface
   * @param {import('../engine/input/Input.js').Input} deps.input
   * @param {SceneManager} [deps.scenes]
   * @param {EventBus} [deps.events]
   */
  constructor({ clock, scheduler, viewport, surface, input, scenes, events }) {
    this.clock = clock;
    this.scheduler = scheduler;
    this.viewport = viewport;
    this.surface = surface;
    this.input = input;
    this.scenes = scenes || new SceneManager();
    this.events = events || new EventBus();

    this._unsubResize = null;
    this._loop = new GameLoop({
      clock,
      scheduler,
      maxDelta: Config.MAX_DELTA,
      update: (dt) => this._update(dt),
      render: (alpha) => this._render(alpha),
    });
  }

  start() {
    const metrics = this.viewport.getMetrics();
    this._applyViewport(metrics);

    this._unsubResize = this.viewport.onResize((m) => this._applyViewport(m));

    this._loop.start();
    log.info('Game started');
    this.events.emit('game:start');
  }

  stop() {
    this._loop.stop();
    if (this._unsubResize) {
      this._unsubResize();
      this._unsubResize = null;
    }
    this.events.emit('game:stop');
    log.info('Game stopped');
  }

  pause() {
    this._loop.pause();
    this.events.emit('game:pause');
  }

  resume() {
    this._loop.resume();
    this.events.emit('game:resume');
  }

  get isRunning() {
    return this._loop.isRunning;
  }

  get isPaused() {
    return this._loop.isPaused;
  }

  /**
   * @param {import('./ports/ViewportPort.js').ViewportMetrics} metrics
   */
  _applyViewport(metrics) {
    if (typeof this.surface.fitTo === 'function') {
      this.surface.fitTo(metrics.cssWidth, metrics.cssHeight);
    }
    this.events.emit('viewport:resize', metrics);
  }

  /**
   * @param {number} dt
   */
  _update(dt) {
    this.scenes.update(dt);
    this.input.endFrame();
  }

  /**
   * @param {number} alpha
   */
  _render(alpha) {
    const ctx = this.surface.getContext2D();
    if (!ctx) return;
    this.scenes.render(ctx, alpha);
  }
}
