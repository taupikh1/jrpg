import { findPath } from '../../world/navigation/Pathfinder.js';

/**
 * Path-following using existing NavGrid + A*.
 */
export class NavigationComponent {
  /**
   * @param {object} opts
   * @param {() => import('../../world/navigation/NavGrid.js').NavGrid|null} opts.getGrid
   * @param {number} [opts.tileSize=16]
   * @param {number} [opts.arriveDist=4]
   * @param {number} [opts.speed=40]
   */
  constructor(opts) {
    this.getGrid = opts.getGrid;
    this.tileSize = opts.tileSize ?? 16;
    this.arriveDist = opts.arriveDist ?? 4;
    this.speed = opts.speed ?? 40;
    /** @type {{ x: number, y: number }[]|null} */
    this.path = null;
    this.pathIndex = 0;
    this.active = false;
    this.reached = false;
    this.failed = false;
  }

  onAttach() {}
  onDetach() {
    this.cancel();
  }

  /**
   * @param {number} worldX
   * @param {number} worldY
   * @param {import('../Entity.js').Entity} entity
   */
  setDestination(worldX, worldY, entity) {
    const grid = this.getGrid();
    if (!grid) {
      this.failed = true;
      this.active = false;
      return false;
    }
    const sx = Math.floor(entity.x / this.tileSize);
    const sy = Math.floor(entity.y / this.tileSize);
    const gx = Math.floor(worldX / this.tileSize);
    const gy = Math.floor(worldY / this.tileSize);
    const path = findPath(grid, sx, sy, gx, gy);
    if (!path) {
      this.path = null;
      this.active = false;
      this.failed = true;
      this.reached = false;
      return false;
    }
    this.path = path;
    this.pathIndex = 0;
    this.active = true;
    this.failed = false;
    this.reached = false;
    return true;
  }

  cancel() {
    this.path = null;
    this.pathIndex = 0;
    this.active = false;
  }

  /**
   * @param {number} dt
   * @param {import('../Entity.js').Entity} entity
   */
  update(dt, entity) {
    if (!this.active || !this.path || this.pathIndex >= this.path.length) return;

    const node = this.path[this.pathIndex];
    const tx = node.x * this.tileSize + this.tileSize / 2;
    const ty = node.y * this.tileSize + this.tileSize / 2;
    const dx = tx - entity.x;
    const dy = ty - entity.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.arriveDist) {
      this.pathIndex += 1;
      if (this.pathIndex >= this.path.length) {
        this.active = false;
        this.reached = true;
        entity.vx = 0;
        entity.vy = 0;
      }
      return;
    }

    const step = Math.min(this.speed * dt, dist);
    entity.x += (dx / dist) * step;
    entity.y += (dy / dist) * step;
    entity.vx = (dx / dist) * this.speed;
    entity.vy = (dy / dist) * this.speed;
    if (Math.abs(dx) > Math.abs(dy)) entity.facing = dx < 0 ? 'left' : 'right';
    else entity.facing = dy < 0 ? 'up' : 'down';
  }
}
