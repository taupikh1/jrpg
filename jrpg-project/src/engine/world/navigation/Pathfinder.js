/**
 * A* pathfinding on a NavGrid (4-connected).
 */

/**
 * @typedef {Object} PathNode
 * @property {number} x
 * @property {number} y
 */

/**
 * @param {import('./NavGrid.js').NavGrid} grid
 * @param {number} startX
 * @param {number} startY
 * @param {number} goalX
 * @param {number} goalY
 * @param {object} [opts]
 * @param {number} [opts.maxExpanded=5000]
 * @returns {PathNode[]|null} path including start and goal, or null
 */
export function findPath(grid, startX, startY, goalX, goalY, opts = {}) {
  const maxExpanded = opts.maxExpanded ?? 5000;
  startX = startX | 0;
  startY = startY | 0;
  goalX = goalX | 0;
  goalY = goalY | 0;

  if (!grid.isWalkable(startX, startY) || !grid.isWalkable(goalX, goalY)) {
    return null;
  }
  if (startX === goalX && startY === goalY) {
    return [{ x: startX, y: startY }];
  }

  const key = (x, y) => y * grid.width + x;
  const open = new Map(); // key -> { x, y, g, f, parent }
  const closed = new Set();

  const h = (x, y) => Math.abs(x - goalX) + Math.abs(y - goalY);

  const start = {
    x: startX,
    y: startY,
    g: 0,
    f: h(startX, startY),
    parent: null,
  };
  open.set(key(startX, startY), start);

  const neighbors = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  let expanded = 0;
  while (open.size > 0 && expanded < maxExpanded) {
    // Pick lowest f
    let current = null;
    for (const n of open.values()) {
      if (!current || n.f < current.f || (n.f === current.f && n.g > current.g)) {
        current = n;
      }
    }
    if (!current) break;

    const ck = key(current.x, current.y);
    open.delete(ck);
    closed.add(ck);
    expanded += 1;

    if (current.x === goalX && current.y === goalY) {
      const path = [];
      let n = current;
      while (n) {
        path.push({ x: n.x, y: n.y });
        n = n.parent;
      }
      path.reverse();
      return path;
    }

    for (const [dx, dy] of neighbors) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const nk = key(nx, ny);
      if (closed.has(nk)) continue;
      const stepCost = grid.getCost(nx, ny);
      if (stepCost === Infinity) continue;

      const g = current.g + stepCost;
      const existing = open.get(nk);
      if (!existing || g < existing.g) {
        open.set(nk, {
          x: nx,
          y: ny,
          g,
          f: g + h(nx, ny),
          parent: current,
        });
      }
    }
  }

  return null;
}
