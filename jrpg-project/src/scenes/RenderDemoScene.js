import { Config } from '../core/Config.js';
import { RenderPipeline } from '../engine/rendering/RenderPipeline.js';
import { SpriteRenderer } from '../engine/rendering/SpriteRenderer.js';
import { Animator } from '../engine/rendering/Animator.js';
import { TextureCache } from '../engine/rendering/TextureCache.js';

/**
 * Technical demo for Batch 2 Rendering Engine.
 * Shows: sprites, camera follow, bounds, animation, layers, parallax, y-sort, culling, UI overlay.
 */
export class RenderDemoScene {
  constructor() {
    /** @type {RenderPipeline|null} */
    this.pipeline = null;
    /** @type {TextureCache|null} */
    this.textures = null;
    /** @type {Animator|null} */
    this.animator = null;
    this._dummy = { x: 240, y: 200 };
    this._input = null;
    this._elapsed = 0;
    this._moveSpeed = 80;
  }

  /**
   * @param {object} data
   * @param {import('../core/ports/RenderSurfacePort.js').RenderSurfacePort} data.surface
   * @param {import('../engine/input/Input.js').Input} data.input
   * @param {TextureCache} data.textures
   */
  init(data = {}) {
    this._input = data.input ?? null;
    this.textures = data.textures ?? new TextureCache();
    this.pipeline = new RenderPipeline({ surface: data.surface });

    const cam = this.pipeline.camera;
    cam.setBounds(0, 0, 960, 540);
    cam.setPosition(0, 0);
    cam.follow(this._dummy);
    cam.followLerp = 0.1;

    this.animator = new Animator();
    this.animator.addClip({
      name: 'walk',
      frameDuration: 0.15,
      loop: true,
      frames: [
        { sx: 0, sy: 0, sw: 16, sh: 16 },
        { sx: 16, sy: 0, sw: 16, sh: 16 },
        { sx: 32, sy: 0, sw: 16, sh: 16 },
        { sx: 48, sy: 0, sw: 16, sh: 16 },
      ],
    });
    this.animator.addClip({
      name: 'idle',
      frameDuration: 0.4,
      loop: true,
      frames: [{ sx: 0, sy: 16, sw: 16, sh: 16 }],
    });
    this.animator.play('walk');

    this._buildWorld();
  }

  enter() {
    this._elapsed = 0;
  }

  _buildWorld() {
    const layers = this.pipeline.layers;
    const tex = this.textures;
    const sky = tex.get('sky');
    const grass = tex.get('grass');
    const tree = tex.get('tree');
    const hero = tex.get('hero');
    const rock = tex.get('rock');

    // Background (parallax 0.3)
    layers.add('background', {
      x: 0,
      y: 0,
      width: 960,
      height: 540,
      draw: (ctx) => {
        if (sky) {
          for (let i = 0; i < 4; i++) {
            SpriteRenderer.draw(ctx, sky, { x: i * 240, y: 0, width: 240, height: 180 });
          }
        } else {
          SpriteRenderer.fillRect(ctx, 0, 0, 960, 180, '#3a2a4a');
        }
      },
    });

    // Ground tiles
    layers.add('ground', {
      x: 0,
      y: 120,
      width: 960,
      height: 420,
      draw: (ctx) => {
        if (grass) {
          for (let gy = 120; gy < 540; gy += 32) {
            for (let gx = 0; gx < 960; gx += 32) {
              SpriteRenderer.draw(ctx, grass, { x: gx, y: gy, width: 32, height: 32 });
            }
          }
        } else {
          SpriteRenderer.fillRect(ctx, 0, 120, 960, 420, '#2d5a3a');
        }
      },
    });

    // Static world objects with y-sort (trees / rocks)
    const props = [
      { x: 80, y: 180, kind: 'tree' },
      { x: 200, y: 260, kind: 'tree' },
      { x: 400, y: 200, kind: 'rock' },
      { x: 520, y: 320, kind: 'tree' },
      { x: 700, y: 240, kind: 'rock' },
      { x: 850, y: 380, kind: 'tree' },
      { x: 100, y: 400, kind: 'rock' },
      { x: 600, y: 160, kind: 'tree' },
    ];
    for (const p of props) {
      const img = p.kind === 'tree' ? tree : rock;
      const h = p.kind === 'tree' ? 48 : 24;
      const w = p.kind === 'tree' ? 32 : 24;
      layers.add('world_objects', {
        x: p.x,
        y: p.y,
        width: w,
        height: h,
        draw: (ctx) => {
          if (img) {
            SpriteRenderer.draw(ctx, img, {
              x: p.x,
              y: p.y,
              width: w,
              height: h,
              anchorX: 0.5,
              anchorY: 1,
            });
          } else {
            SpriteRenderer.fillRect(ctx, p.x - w / 2, p.y - h, w, h, p.kind === 'tree' ? '#1a4a2a' : '#6a6a6a');
          }
        },
      });
    }

    // Animated character (dummy target)
    const dummy = this._dummy;
    const animator = this.animator;
    layers.add('characters', {
      x: dummy.x,
      y: dummy.y,
      width: 16,
      height: 16,
      get x() {
        return dummy.x;
      },
      get y() {
        return dummy.y;
      },
      draw: (ctx) => {
        const frame = animator.getCurrentFrame();
        if (hero && frame) {
          SpriteRenderer.draw(ctx, hero, {
            x: dummy.x,
            y: dummy.y,
            width: 16,
            height: 16,
            anchorX: 0.5,
            anchorY: 1,
            sx: frame.sx,
            sy: frame.sy,
            sw: frame.sw,
            sh: frame.sh,
          });
        } else {
          SpriteRenderer.fillRect(ctx, dummy.x - 8, dummy.y - 16, 16, 16, '#e8c84a');
        }
      },
    });

    // Foreground fringe (slightly faster parallax)
    layers.add('foreground', {
      x: 0,
      y: 0,
      width: 960,
      height: 40,
      draw: (ctx) => {
        SpriteRenderer.fillRect(ctx, 0, 500, 960, 40, '#0a1a10', 0.35);
      },
    });

    // UI overlay (screen space)
    const self = this;
    layers.add('ui', {
      x: 0,
      y: 0,
      draw: (ctx) => {
        SpriteRenderer.fillRect(ctx, 0, 0, ctx.canvas?.width ?? Config.LOGICAL_WIDTH, 28, '#000000', 0.55);
        ctx.fillStyle = '#f6e7c1';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Batch 2 Render Demo — arrows move · Z shake', 8, 18);
        ctx.textAlign = 'right';
        ctx.fillText(
          `cam(${self.pipeline.camera.x.toFixed(0)},${self.pipeline.camera.y.toFixed(0)})  dummy(${dummy.x.toFixed(0)},${dummy.y.toFixed(0)})`,
          (ctx.canvas?.width ?? Config.LOGICAL_WIDTH) - 8,
          18
        );
      },
    });
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    this._elapsed += dt;
    const input = this._input;
    let moving = false;
    if (input) {
      let dx = 0;
      let dy = 0;
      if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx -= 1;
      if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx += 1;
      if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy -= 1;
      if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy += 1;
      if (dx || dy) {
        const len = Math.hypot(dx, dy) || 1;
        this._dummy.x += (dx / len) * this._moveSpeed * dt;
        this._dummy.y += (dy / len) * this._moveSpeed * dt;
        this._dummy.x = Math.max(16, Math.min(944, this._dummy.x));
        this._dummy.y = Math.max(140, Math.min(520, this._dummy.y));
        moving = true;
      }
      if (input.justPressed('KeyZ')) {
        this.pipeline.camera.shake(6, 0.35);
      }
    }

    if (moving) {
      if (this.animator.currentClipName !== 'walk') this.animator.play('walk');
    } else {
      if (this.animator.currentClipName !== 'idle') this.animator.play('idle');
    }

    this.animator.update(dt);
    this.pipeline.update(dt);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    // Pipeline owns clear + layer draws; scene render is invoked by Game with surface context.
    // We ignore the passed ctx and use pipeline (same surface).
    this.pipeline.render();
  }

  exit() {
    this.pipeline?.layers.clearAll();
  }

  destroy() {
    this.pipeline = null;
    this.textures = null;
    this.animator = null;
  }
}
