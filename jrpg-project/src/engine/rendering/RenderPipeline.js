import { LayerManager, DEFAULT_LAYERS } from './LayerManager.js';
import { Camera } from './Camera.js';
import { Config } from '../../core/Config.js';

/**
 * Orchestrates clear → world layers (camera) → UI layers (screen).
 * Integrates with Batch 1 GameLoop via update/render callbacks.
 */
export class RenderPipeline {
  /**
   * @param {object} opts
   * @param {import('../../core/ports/RenderSurfacePort.js').RenderSurfacePort} opts.surface
   * @param {Camera} [opts.camera]
   * @param {LayerManager} [opts.layers]
   * @param {string} [opts.clearColor='#0d0a10']
   */
  constructor({ surface, camera, layers, clearColor = '#0d0a10' }) {
    this.surface = surface;
    this.camera =
      camera ||
      new Camera({
        viewportWidth: Config.LOGICAL_WIDTH,
        viewportHeight: Config.LOGICAL_HEIGHT,
      });
    this.layers = layers || new LayerManager();
    this.clearColor = clearColor;

    if (this.layers.getLayerNames().length === 0) {
      for (const def of DEFAULT_LAYERS) {
        this.layers.register(def);
      }
    }
  }

  /**
   * @param {number} dt
   */
  _syncViewport() {
    const width = this.surface?.logicalWidth ?? Config.LOGICAL_WIDTH;
    const height = this.surface?.logicalHeight ?? Config.LOGICAL_HEIGHT;
    if (this.camera.viewportWidth !== width || this.camera.viewportHeight !== height) {
      this.camera.setViewportSize(width, height);
    }
  }

  update(dt) {
    this._syncViewport();
    this.camera.update(dt);
  }

  /**
   * Full frame render.
   */
  render() {
    const ctx = this.surface?.getContext2D?.();
    if (!ctx) return;
    this._syncViewport();

    const w = this.surface?.logicalWidth ?? Config.LOGICAL_WIDTH;
    const h = this.surface?.logicalHeight ?? Config.LOGICAL_HEIGHT;

    ctx.save();
    try {
      // Ensure pixel art setting
      ctx.imageSmoothingEnabled = false;

      // Clear
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = this.clearColor;
      ctx.fillRect(0, 0, w, h);

      // Layers (camera applied inside non-screenSpace layers)
      this.layers.render(ctx, this.camera);
    } finally {
      ctx.restore();
    }
  }
}
