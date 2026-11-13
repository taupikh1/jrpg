/**
 * Frame-rate independent movement with optional collision world.
 */
export class MovementComponent {
  /**
   * @param {object} [opts]
   * @param {number} [opts.speed=60]
   * @param {import('../../world/collision/Collision.js').CollisionWorld} [opts.collision]
   */
  constructor(opts = {}) {
    this.speed = opts.speed ?? 60;
    this.collision = opts.collision ?? null;
    this.enabled = opts.enabled !== false;
    /** @type {{ x: number, y: number }} input direction (normalized externally or here) */
    this.dirX = 0;
    this.dirY = 0;
    this.moving = false;
  }

  onAttach() {}
  onDetach() {}

  /**
   * @param {number} x - -1..1
   * @param {number} y - -1..1
   */
  setDirection(x, y) {
    const len = Math.hypot(x, y);
    if (len > 0) {
      this.dirX = x / len;
      this.dirY = y / len;
      this.moving = true;
    } else {
      this.dirX = 0;
      this.dirY = 0;
      this.moving = false;
    }
  }

  stop() {
    this.dirX = 0;
    this.dirY = 0;
    this.moving = false;
  }

  /**
   * @param {number} dt
   * @param {import('../Entity.js').Entity} entity
   */
  update(dt, entity) {
    if (!this.enabled || !this.moving) {
      entity.vx = 0;
      entity.vy = 0;
      return;
    }

    const mx = this.dirX * this.speed * dt;
    const my = this.dirY * this.speed * dt;
    entity.vx = this.dirX * this.speed;
    entity.vy = this.dirY * this.speed;

    // Facing from dominant axis
    if (Math.abs(this.dirX) > Math.abs(this.dirY)) {
      entity.facing = this.dirX < 0 ? 'left' : 'right';
    } else if (this.dirY !== 0) {
      entity.facing = this.dirY < 0 ? 'up' : 'down';
    }

    const col = this.collision;
    const hw = entity.w / 2;
    const hh = entity.h / 2;

    if (!col) {
      entity.x += mx;
      entity.y += my;
      return;
    }

    // Axis-separated resolution
    if (mx !== 0 && !col.wouldCollide(entity.x - hw, entity.y - hh, entity.w, entity.h, mx, 0)) {
      entity.x += mx;
    }
    if (my !== 0 && !col.wouldCollide(entity.x - hw, entity.y - hh, entity.w, entity.h, 0, my)) {
      entity.y += my;
    }
  }
}
