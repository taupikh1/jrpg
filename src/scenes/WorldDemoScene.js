import { Config } from '../core/Config.js';
import { RenderPipeline } from '../engine/rendering/RenderPipeline.js';
import { SpriteRenderer } from '../engine/rendering/SpriteRenderer.js';
import { ZoneManager } from '../engine/world/zones/ZoneManager.js';
import { findPath } from '../engine/world/navigation/Pathfinder.js';
import { DEMO_TILESET, ZONE_VILLAGE, ZONE_FOREST } from '../../content/world/demo-data.js';

/**
 * Batch 3 technical demo: tilemap, zones, collision, pathfinding, transitions.
 */
export class WorldDemoScene {
  constructor() {
    this.pipeline = null;
    this.zones = null;
    this._input = null;
    this._player = { x: 160, y: 112, w: 12, h: 12 };
    this._path = null;
    this._status = '';
    this._moveSpeed = 70;
  }

  /**
   * @param {object} data
   */
  init(data = {}) {
    this._input = data.input ?? null;
    this.pipeline = new RenderPipeline({ surface: data.surface });
    this.zones = new ZoneManager({
      events: data.events ?? null,
      textures: data.textures ?? null,
    });

    this.zones.registerTileset(DEMO_TILESET);
    this.zones.registerZone(ZONE_VILLAGE);
    this.zones.registerZone(ZONE_FOREST);

    const zone = this.zones.activate('village', 'start');
    this._player.x = zone.getSpawn('start').x;
    this._player.y = zone.getSpawn('start').y;
    this._applyCamera(zone);
    this._rebuildLayers();
    this._status = `Zone: ${zone.name}`;
  }

  _applyCamera(zone) {
    const cam = this.pipeline.camera;
    cam.setBounds(0, 0, zone.pixelWidth, zone.pixelHeight);
    cam.follow(this._player);
    cam.followLerp = 0.15;
    cam.deadZoneW = 20;
    cam.deadZoneH = 16;
    cam.setPosition(
      Math.max(0, this._player.x - this.pipeline.camera.viewportWidth / 2),
      Math.max(0, this._player.y - this.pipeline.camera.viewportHeight / 2)
    );
  }

  _rebuildLayers() {
    const layers = this.pipeline.layers;
    layers.clearAll();
    // Ensure default layers exist
    for (const name of layers.getLayerNames()) {
      layers.clearLayer(name);
    }

    const zm = this.zones;
    const player = this._player;
    const self = this;

    // Ground via tilemap renderer (world space)
    layers.add('ground', {
      x: 0,
      y: 0,
      width: zm.activeZone.pixelWidth,
      height: zm.activeZone.pixelHeight,
      draw: (ctx, camera) => {
        if (zm.tileRenderer) zm.tileRenderer.render(ctx, camera, 1);
      },
    });

    // Static objects
    for (const obj of zm.activeZone.objects) {
      layers.add('world_objects', {
        x: obj.x,
        y: obj.y,
        width: obj.w ?? 16,
        height: obj.h ?? 16,
        draw: (ctx) => {
          SpriteRenderer.fillRect(
            ctx,
            obj.x,
            obj.y,
            obj.w ?? 16,
            obj.h ?? 16,
            obj.solid ? '#8a5a3a' : '#5a8a5a'
          );
        },
      });
    }

    // Player + path
    layers.add('characters', {
      get x() {
        return player.x;
      },
      get y() {
        return player.y;
      },
      width: 12,
      height: 12,
      draw: (ctx) => {
        if (self._path) {
          ctx.save();
          ctx.strokeStyle = '#ffd45c';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          for (let i = 0; i < self._path.length; i++) {
            const p = self._path[i];
            const cx = p.x * 16 + 8;
            const cy = p.y * 16 + 8;
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
          }
          ctx.stroke();
          ctx.restore();
        }
        SpriteRenderer.fillRect(ctx, player.x - 6, player.y - 6, 12, 12, '#e8c84a');
      },
    });

    // UI
    layers.add('ui', {
      x: 0,
      y: 0,
      draw: (ctx) => {
        SpriteRenderer.fillRect(ctx, 0, 0, ctx.canvas?.width ?? Config.LOGICAL_WIDTH, 32, '#000', 0.6);
        ctx.fillStyle = '#f6e7c1';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Batch 3 World Demo — arrows move · X pathfind · zone triggers auto', 6, 14);
        ctx.fillText(self._status, 6, 26);
      },
    });
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    const input = this._input;
    const col = this.zones.collision;
    let dx = 0;
    let dy = 0;
    if (input) {
      if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx -= 1;
      if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx += 1;
      if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy -= 1;
      if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy += 1;
      if (input.justPressed('KeyX')) {
        this._runPathfind();
      }
    }

    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      const mx = (dx / len) * this._moveSpeed * dt;
      const my = (dy / len) * this._moveSpeed * dt;
      const p = this._player;
      // axis separated for sliding
      if (!col.wouldCollide(p.x - 6, p.y - 6, p.w, p.h, mx, 0)) p.x += mx;
      if (!col.wouldCollide(p.x - 6, p.y - 6, p.w, p.h, 0, my)) p.y += my;
    }

    // Zone transition check
    const result = this.zones.tryTransitionAt(this._player.x, this._player.y);
    if (result) {
      this._player.x = result.spawn.x;
      this._player.y = result.spawn.y;
      this._path = null;
      this._applyCamera(result.zone);
      this._rebuildLayers();
      this._status = `Entered ${result.zone.name} @ ${result.spawn.id}`;
    } else if (this.zones.activeZone) {
      this._status = `${this.zones.activeZone.name}  pos(${this._player.x.toFixed(0)},${this._player.y.toFixed(0)})`;
    }

    this.pipeline.update(dt);
  }

  _runPathfind() {
    const grid = this.zones.navGrid;
    if (!grid) return;
    const tm = this.zones.activeZone.tilemap;
    const start = tm.worldToTile(this._player.x, this._player.y);
    // Goal: opposite corner-ish walkable
    let goalX = tm.width - 3;
    let goalY = tm.height - 3;
    if (!grid.isWalkable(goalX, goalY)) {
      goalX = 3;
      goalY = 3;
    }
    const path = findPath(grid, start.tx, start.ty, goalX, goalY);
    this._path = path;
    this._status = path
      ? `Path ${path.length} steps → (${goalX},${goalY})`
      : `No path to (${goalX},${goalY})`;
  }

  render() {
    this.pipeline.render();
  }

  exit() {
    this.zones?.deactivate();
  }

  destroy() {
    this.zones?.deactivate();
    this.pipeline = null;
    this.zones = null;
  }
}
