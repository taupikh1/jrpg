/**
 * Art Asset Registry — data-driven pipeline for external pixel assets.
 * Stores metadata (source, license, frames). Does not load images itself;
 * callers use AssetManager or Image() with the registered path.
 */
export class ArtAssetRegistry {
  constructor() {
    /** @type {Map<string, object>} */
    this._assets = new Map();
  }

  /**
   * @param {object} def
   * @param {string} def.id
   * @param {string} def.path
   * @param {string} def.category
   * @param {string} [def.licenseStatus]
   * @param {string} [def.source]
   * @param {object} [def.animation]
   * @param {object} [def.tileset]
   */
  register(def) {
    if (!def?.id || !def.path) throw new Error('ArtAsset requires id and path');
    if (this._assets.has(def.id)) throw new Error(`Art asset "${def.id}" already registered`);
    this._assets.set(def.id, {
      licenseStatus: 'LICENSE_UNVERIFIED',
      source: 'PixelSRPG-Forge',
      ...def,
    });
    return def.id;
  }

  get(id) {
    return this._assets.get(id) ?? null;
  }

  has(id) {
    return this._assets.has(id);
  }

  list(category) {
    const all = [...this._assets.values()];
    return category ? all.filter((a) => a.category === category) : all;
  }

  /**
   * Build AnimationClip-compatible frame list from sheet metadata.
   * @param {string} id
   * @param {string} state - e.g. 'idle' | 'walk'
   */
  framesFor(id, state) {
    const asset = this.get(id);
    if (!asset?.animation?.[state]) return null;
    const anim = asset.animation[state];
    const frames = [];
    const count = anim.frameCount ?? 1;
    const fw = anim.frameWidth;
    const fh = anim.frameHeight;
    for (let i = 0; i < count; i++) {
      frames.push({
        sx: (anim.originX ?? 0) + i * fw,
        sy: anim.originY ?? 0,
        sw: fw,
        sh: fh,
        duration: anim.frameDuration,
      });
    }
    return {
      name: `${id}:${state}`,
      frames,
      frameDuration: anim.frameDuration ?? 0.12,
      loop: anim.loop !== false,
    };
  }

  missingReport(requestedIds) {
    return requestedIds.filter((id) => !this.has(id));
  }
}

export const artRegistry = new ArtAssetRegistry();
