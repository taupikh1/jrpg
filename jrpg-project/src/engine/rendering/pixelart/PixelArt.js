import { PixBuf } from './PixBuf.js';
import { paintTile } from './TileArt.js';
import { paintCharacterSheet, charFrameRect, CHAR_W, CHAR_H, HERO_LOOK, NPC_LOOKS, deriveLook } from './CharacterArt.js';
import { paintPropStrip, propKindFor } from './PropArt.js';
import { paintEnemyStrip, enemyVisual } from './EnemyArt.js';
import { paintItemIcon, paintHeart } from './IconArt.js';
import { paintBattleStage, paintTitleBackdrop } from './Backdrops.js';

/**
 * Facade over all generated pixel art. Nothing is painted until configure() supplies a
 * PixBuf -> image converter (platform/browser does this). Without it every getter returns
 * null, so headless tests and fallbacks keep working with flat colours.
 */
class PixelArtLibrary {
  constructor() {
    this._toImage = null;
    this._cache = new Map();
    /** Animation clock in seconds, advanced by the scene. */
    this.time = 0;
  }

  configure({ toImage } = {}) {
    this._toImage = typeof toImage === 'function' ? toImage : null;
    this._cache.clear();
  }

  get ready() {
    return !!this._toImage;
  }

  setTime(t) {
    this.time = t;
  }

  _get(key, make) {
    if (!this._toImage) return null;
    let v = this._cache.get(key);
    if (v === undefined) {
      const pb = make();
      v = pb ? this._toImage(pb) : null;
      this._cache.set(key, v);
    }
    return v;
  }

  tile(theme, spec) {
    return this._get(`t|${theme}|${spec}`, () => paintTile(theme, spec));
  }

  // ---- characters -------------------------------------------------------------------
  lookFor(entity, color) {
    if (entity.type === 'player') return { key: 'hero', look: HERO_LOOK };
    const l = NPC_LOOKS[entity.id];
    if (l) return { key: entity.id, look: l };
    return { key: `${entity.id}|${color}`, look: deriveLook(entity.id, color) };
  }

  charSheet(key, look) {
    return this._get(`c|${key}`, () => paintCharacterSheet(look));
  }

  /** Draw a character entity (feet at entity.x / entity.y). */
  drawCharacter(ctx, entity, color, anim = {}) {
    const { key, look } = this.lookFor(entity, color);
    const img = this.charSheet(key, look);
    if (!img) return false;
    const moving = !!anim.moving;
    const frame = moving ? [1, 2, 3, 0][Math.floor(this.time * 9) % 4] : 0;
    const r = charFrameRect(entity.facing || 'down', frame);
    const dx = Math.round(entity.x - CHAR_W / 2);
    const dy = Math.round(entity.y - CHAR_H + 1);
    // soft ground shadow
    ctx.save();
    try {
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = '#140f1f';
      ctx.fillRect(dx + 4, dy + CHAR_H - 3, 8, 2);
      ctx.fillRect(dx + 3, dy + CHAR_H - 2, 10, 1);
      ctx.globalAlpha = 1;
      if (r.flipX) {
        ctx.translate(dx + CHAR_W, dy);
        ctx.scale(-1, 1);
        this._blitChar(ctx, img, r, 0, 0, moving);
      } else {
        this._blitChar(ctx, img, r, dx, dy, moving);
      }
    } finally {
      ctx.restore();
    }
    return true;
  }

  _blitChar(ctx, img, r, dx, dy, moving) {
    // idle breathing: head + torso sink one pixel every other half second
    const breathe = !moving && Math.floor(this.time * 1.6) % 2 === 1;
    if (!breathe) {
      ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, dx, dy, CHAR_W, CHAR_H);
      return;
    }
    const split = 17;
    ctx.drawImage(img, r.sx, r.sy + split, r.sw, CHAR_H - split, dx, dy + split, CHAR_W, CHAR_H - split);
    ctx.drawImage(img, r.sx, r.sy, r.sw, split, dx, dy + 1, CHAR_W, split);
  }

  // ---- props ------------------------------------------------------------------------
  propKind(id, color) {
    return propKindFor(id, color);
  }

  propStrip(kind) {
    if (!this._toImage) return null;
    const k = `p|${kind}`;
    if (!this._cache.has(k)) {
      const s = paintPropStrip(kind);
      this._cache.set(k, s ? { ...s, img: this._toImage(s.strip) } : null);
    }
    return this._cache.get(k);
  }

  /** Draw a prop with its bottom-centre at (x, y). Returns false if nothing was drawn. */
  drawProp(ctx, kind, x, y, phase = 0) {
    if (kind === 'none') return true;
    const s = this.propStrip(kind);
    if (!s) return false;
    const f = s.frames > 1 ? Math.floor((this.time + phase) * s.fps) % s.frames : 0;
    ctx.drawImage(s.img, f * s.w, 0, s.w, s.h, Math.round(x - s.w / 2), Math.round(y - s.h + 2), s.w, s.h);
    return true;
  }

  // ---- enemies ----------------------------------------------------------------------
  enemyStrip(variant) {
    return this._get(`e|${variant}`, () => paintEnemyStrip('thorn', variant));
  }

  enemyVisual(p) {
    return enemyVisual(p);
  }

  /** Draw an enemy at 2x, bottom-centre at (x, y). opts: {flash, alpha, dx, dy} */
  drawEnemy(ctx, participant, x, y, opts = {}) {
    const v = enemyVisual(participant);
    const img = this.enemyStrip(v.variant);
    if (!img) return false;
    const f = Math.floor(this.time * 2.2 + (participant.id?.length || 0)) % 2;
    ctx.save();
    try {
      ctx.globalAlpha = opts.alpha ?? 1;
      ctx.drawImage(img, f * 16, 0, 16, 16, Math.round(x - 16 + (opts.dx || 0)), Math.round(y - 32 + (opts.dy || 0)), 32, 32);
      if (opts.flash) {
        ctx.globalAlpha = Math.min(0.85, opts.flash);
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(img, f * 16, 0, 16, 16, Math.round(x - 16 + (opts.dx || 0)), Math.round(y - 32 + (opts.dy || 0)), 32, 32);
      }
    } finally {
      ctx.restore();
    }
    return true;
  }

  /** Hero in battle: side-facing (right), 2x. */
  drawHeroBattle(ctx, x, y, opts = {}) {
    const entity = { id: 'player', type: 'player' };
    const { key, look } = this.lookFor(entity, null);
    const img = this.charSheet(key, look);
    if (!img) return false;
    const r = charFrameRect('right', 0);
    const idle = Math.floor(this.time * 2) % 2;
    ctx.save();
    try {
      ctx.globalAlpha = opts.alpha ?? 1;
      const dx = Math.round(x - CHAR_W + (opts.dx || 0));
      const dy = Math.round(y - CHAR_H * 2 + (opts.dy || 0) + (idle ? 0 : 1));
      ctx.translate(dx + CHAR_W * 2, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, CHAR_W * 2, CHAR_H * 2);
      if (opts.flash) {
        ctx.globalAlpha = Math.min(0.85, opts.flash);
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, CHAR_W * 2, CHAR_H * 2);
      }
    } finally {
      ctx.restore();
    }
    return true;
  }


  /** Party member in battle: faces left, 2x. Uses member-specific look when available. */
  drawPartyMemberBattle(ctx, memberId, x, y, opts = {}) {
    // Map party id -> look (extend NPC_LOOKS style or derive)
    const looks = {
      orin: { skin: 'light', hair: '#5a2f26', hairStyle: 'spiky', outfit: 'coat', top: '#3a5aa8', trim: '#e0b84a', scarf: '#2fa7a0' },
      mira: { skin: 'light', hair: '#3b2a3f', hairStyle: 'tied', outfit: 'dress', top: '#6fb88c', trim: '#f0e6b0', ribbon: '#e8785a' },
      kael: { skin: 'tan', hair: '#2a1f1a', hairStyle: 'short', outfit: 'armor', top: '#4a6a9a', trim: '#e8d070', hat: 'helm' },
      iven: { skin: 'light', hair: '#a07a4a', hairStyle: 'short', outfit: 'tunic', top: '#5a82b0', trim: '#e0e0f0' },
      tavi: { skin: 'light', hair: '#c88a3a', hairStyle: 'spiky', outfit: 'tunic', top: '#f0d080', trim: '#fff6d0', build: 'child' },
    };
    const look = looks[memberId] || HERO_LOOK;
    const key = memberId ? `party|${memberId}` : 'hero';
    const img = this.charSheet(key, look);
    if (!img) return this.drawHeroBattle(ctx, x, y, opts);
    const r = charFrameRect('left', 0); // face left
    const idle = Math.floor(this.time * 2) % 2;
    ctx.save();
    try {
      ctx.globalAlpha = opts.alpha ?? 1;
      const dx = Math.round(x - CHAR_W + (opts.dx || 0));
      const dy = Math.round(y - CHAR_H * 2 + (opts.dy || 0) + (idle ? 0 : 1));
      // no flip for left-facing (assuming left row is already left)
      ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, dx, dy, CHAR_W * 2, CHAR_H * 2);
      if (opts.flash) {
        ctx.globalAlpha = Math.min(0.85, opts.flash);
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, dx, dy, CHAR_W * 2, CHAR_H * 2);
      }
    } finally {
      ctx.restore();
    }
    return true;
  }

  // ---- ui / backdrops ---------------------------------------------------------------
  itemIcon(id, category) {
    return this._get(`i|${id}|${category}`, () => paintItemIcon(id, category));
  }

  heart(full) {
    return this._get(`h|${full ? 1 : 0}`, () => paintHeart(full));
  }

  battleStage(theme = 'forest', width = 320) {
    const w = Math.max(320, Math.round(Number(width) || 320));
    return this._get(`bs|${theme}|${w}`, () => paintBattleStage(theme, w));
  }

  titleBackdrop() {
    return this._get('title', () => paintTitleBackdrop());
  }
}

export const PixelArt = new PixelArtLibrary();
export { PixBuf };
