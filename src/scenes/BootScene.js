import { Config } from '../core/Config.js';

/**
 * Minimal boot / diagnostic scene for Batch 1.
 * Draws a solid background and status text so we can verify the loop + canvas.
 */
export class BootScene {
  constructor() {
    this._elapsed = 0;
    this._frames = 0;
    this._fps = 0;
    this._fpsTimer = 0;
    this._message = 'Batch 1 — Core Engine';
    this._inputRef = null;
  }

  /**
   * @param {object} data
   * @param {import('../engine/input/Input.js').Input} [data.input]
   */
  init(data = {}) {
    this._inputRef = data.input ?? null;
  }

  enter() {
    this._elapsed = 0;
    this._frames = 0;
    this._fps = 0;
    this._fpsTimer = 0;
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    this._elapsed += dt;
    this._frames += 1;
    this._fpsTimer += dt;
    if (this._fpsTimer >= 1) {
      this._fps = this._frames;
      this._frames = 0;
      this._fpsTimer -= 1;
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    const w = ctx.canvas?.width ?? Config.LOGICAL_WIDTH;
    const h = ctx.canvas?.height ?? Config.LOGICAL_HEIGHT;

    // Background
    ctx.fillStyle = '#1a1220';
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = '#ffd45c';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Title
    ctx.fillStyle = '#f6e7c1';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this._message, w / 2, 48);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#a89bb0';
    ctx.fillText(`${w}×${h} · integer scale · pixel art`, w / 2, 72);

    ctx.fillText(`t=${this._elapsed.toFixed(1)}s  fps≈${this._fps}`, w / 2, 100);

    // Input status
    if (this._inputRef) {
      const keys = [];
      for (const code of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyZ', 'KeyX', 'Space']) {
        if (this._inputRef.isDown(code)) keys.push(code.replace('Key', '').replace('Arrow', ''));
      }
      const ptr = this._inputRef.primaryPointer();
      const ptrText = ptr ? `ptr(${ptr.x.toFixed(0)},${ptr.y.toFixed(0)})` : 'ptr: none';
      ctx.fillStyle = '#7ec8a3';
      ctx.fillText(`keys: [${keys.join(' ')}]  ${ptrText}`, w / 2, 130);
    }

    ctx.fillStyle = '#6b5b7a';
    ctx.fillText('Core loop · SceneManager · EventBus · Input OK', w / 2, h - 24);
  }

  exit() {}
  destroy() {}
}
