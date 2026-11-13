import { SpriteRenderer } from '../../rendering/SpriteRenderer.js';

/**
 * Renders a Tilemap with camera-based viewport culling.
 * Uses Batch 2 SpriteRenderer — no duplicate draw path.
 */
export class TilemapRenderer {
  /**
   * @param {import('./Tilemap.js').Tilemap} tilemap
   * @param {import('../../rendering/TextureCache.js').TextureCache} textures
   */
  constructor(tilemap, textures) {
    this.tilemap = tilemap;
    this.textures = textures;
  }

  /**
   * Draw all visible layers into ctx (already under camera transform if desired).
   * Prefer calling from a LayerManager item with camera for culling.
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('../../rendering/Camera.js').Camera} camera
   * @param {number} [marginTiles=1]
   */
  render(ctx, camera, marginTiles = 1) {
    const tm = this.tilemap;
    const ts = tm.tileset;
    const img = ts.imageKey ? this.textures.get(ts.imageKey) : null;

    const startTx = Math.max(0, Math.floor(camera.viewX / tm.tileWidth) - marginTiles);
    const startTy = Math.max(0, Math.floor(camera.viewY / tm.tileHeight) - marginTiles);
    const endTx = Math.min(
      tm.width - 1,
      Math.ceil((camera.viewX + camera.viewWidth) / tm.tileWidth) + marginTiles
    );
    const endTy = Math.min(
      tm.height - 1,
      Math.ceil((camera.viewY + camera.viewHeight) / tm.tileHeight) + marginTiles
    );

    for (const layer of tm.layers) {
      if (!layer.visible || layer.opacity <= 0) continue;

      ctx.save();
      try {
        ctx.globalAlpha = layer.opacity;
        for (let ty = startTy; ty <= endTy; ty++) {
          for (let tx = startTx; tx <= endTx; tx++) {
            const id = layer.data[ty * tm.width + tx];
            if (id <= 0) continue;
            // data: 0 = empty, 1..N = tileset index 0..N-1
            const rect = ts.getSourceRect(id - 1);
            if (!rect) continue;
            const wx = tx * tm.tileWidth;
            const wy = ty * tm.tileHeight;
            if (img) {
              SpriteRenderer.draw(ctx, img, {
                x: wx,
                y: wy,
                width: tm.tileWidth,
                height: tm.tileHeight,
                sx: rect.sx,
                sy: rect.sy,
                sw: rect.sw,
                sh: rect.sh,
              });
            } else {
              // Procedural fallback colors by tile id
              const colors = ['#000', '#3a7a48', '#5a3a20', '#6a6a70', '#4a8a3a', '#2a5a9a', '#8a4a2a'];
              SpriteRenderer.fillRect(
                ctx,
                wx,
                wy,
                tm.tileWidth,
                tm.tileHeight,
                colors[id % colors.length]
              );
            }
          }
        }
      } finally {
        ctx.restore();
      }
    }
  }

  /**
   * Count tiles that would be drawn in current view (for tests / diagnostics).
   * @param {import('../../rendering/Camera.js').Camera} camera
   */
  countVisibleTiles(camera, marginTiles = 0) {
    const tm = this.tilemap;
    const startTx = Math.max(0, Math.floor(camera.viewX / tm.tileWidth) - marginTiles);
    const startTy = Math.max(0, Math.floor(camera.viewY / tm.tileHeight) - marginTiles);
    const endTx = Math.min(
      tm.width - 1,
      Math.ceil((camera.viewX + camera.viewWidth) / tm.tileWidth) + marginTiles
    );
    const endTy = Math.min(
      tm.height - 1,
      Math.ceil((camera.viewY + camera.viewHeight) / tm.tileHeight) + marginTiles
    );
    let n = 0;
    for (const layer of tm.layers) {
      if (!layer.visible) continue;
      for (let ty = startTy; ty <= endTy; ty++) {
        for (let tx = startTx; tx <= endTx; tx++) {
          if (layer.data[ty * tm.width + tx] > 0) n += 1;
        }
      }
    }
    return n;
  }
}
