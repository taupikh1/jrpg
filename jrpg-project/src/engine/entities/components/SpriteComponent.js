import { SpriteRenderer } from '../../rendering/SpriteRenderer.js';
import { PixelArt } from '../../rendering/pixelart/PixelArt.js';

/**
 * Renders a solid color or texture for an entity.
 */
export class SpriteComponent {
  /**
   * @param {object} [opts]
   * @param {string} [opts.color='#e8c84a']
   * @param {CanvasImageSource} [opts.image]
   * @param {import('../../rendering/Animator.js').Animator} [opts.animator]
   */
  constructor(opts = {}) {
    this.color = opts.color ?? '#e8c84a';
    this.image = opts.image ?? null;
    this.animator = opts.animator ?? null;
    this.anchorX = opts.anchorX ?? 0.5;
    this.anchorY = opts.anchorY ?? 1;
    this._lastX = null;
    this._lastY = null;
    this._moving = false;
    this._phase = Math.random() * 2;
  }

  onAttach() {}
  onDetach() {
    this.animator = null;
    this.image = null;
  }

  /**
   * @param {number} dt
   * @param {import('../Entity.js').Entity} entity
   */
  update(dt, entity) {
    if (this.animator) this.animator.update(dt);
    if (this._lastX !== null) {
      this._moving = Math.abs(entity.x - this._lastX) + Math.abs(entity.y - this._lastY) > 0.01;
    }
    this._lastX = entity.x;
    this._lastY = entity.y;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('../Entity.js').Entity} entity
   */
  render(ctx, entity) {
    const frame = this.animator?.getCurrentFrame?.();
    if (this.image && frame) {
      SpriteRenderer.draw(ctx, this.image, {
        x: entity.x,
        y: entity.y,
        width: entity.w,
        height: entity.h,
        anchorX: this.anchorX,
        anchorY: this.anchorY,
        sx: frame.sx,
        sy: frame.sy,
        sw: frame.sw,
        sh: frame.sh,
        flipX: entity.facing === 'left',
      });
    } else if (this.image) {
      SpriteRenderer.draw(ctx, this.image, {
        x: entity.x,
        y: entity.y,
        width: entity.w,
        height: entity.h,
        anchorX: this.anchorX,
        anchorY: this.anchorY,
        flipX: entity.facing === 'left',
      });
    } else if (PixelArt.ready && this._drawPixelArt(ctx, entity)) {
      // drawn by the generated pixel-art library
    } else {
      SpriteRenderer.fillRect(
        ctx,
        entity.x - entity.w / 2,
        entity.y - entity.h,
        entity.w,
        entity.h,
        this.color
      );
    }
  }

  /** Characters and props come from the procedural pixel-art library, keyed by entity id/type. */
  _drawPixelArt(ctx, entity) {
    if (entity.type === 'player' || entity.type === 'npc') {
      return PixelArt.drawCharacter(ctx, entity, this.color, { moving: this._moving });
    }
    const kind = PixelArt.propKind(entity.id, this.color);
    return PixelArt.drawProp(ctx, kind, entity.x, entity.y, this._phase);
  }
}
