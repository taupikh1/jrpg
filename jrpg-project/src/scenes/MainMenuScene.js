import { PixelArt } from '../engine/rendering/pixelart/PixelArt.js';
import { Config } from '../core/Config.js';
import { SpriteRenderer } from '../engine/rendering/SpriteRenderer.js';
import { drawPanel, drawRow, UI_COLORS } from '../engine/rendering/UiKit.js';
import { SaveManager } from '../engine/persistence/SaveManager.js';
import { MemoryStorageAdapter } from '../engine/persistence/MemoryStorageAdapter.js';

/**
 * Player-facing main menu (Phase 1 foundation).
 * Options: Lanjutkan (Continue) and Permainan Baru (New Game) only.
 * Settings and Credits are intentionally absent until they have real functionality.
 *
 * Continue only starts the game when the save loads and validates. A missing or
 * corrupted save keeps the player in the menu with a message; it never silently
 * starts a new game.
 */

export const SAVE_SLOT = 'slot1';

const OPTION_CONTINUE = 'continue';
const OPTION_NEW = 'new';

/** Logical-pixel layout (Config.LOGICAL_WIDTH x LOGICAL_HEIGHT). */
const BUTTON_W = 200;
const BUTTON_H = 28;
const buttonX = (width) => (width - BUTTON_W) / 2;
const BUTTON_Y = { [OPTION_CONTINUE]: 128, [OPTION_NEW]: 166 };

export class MainMenuScene {
  /**
   * @param {object} options
   * @param {{ get: Function, put: Function, delete: Function, list: Function, isAvailable?: Function }} [options.saveAdapter]
   * @param {(startMode: 'new'|'continue', data: object) => Promise<void>} options.onStartGame
   *        Provided by the composition root. It creates a fresh gameplay session.
   */
  constructor(options = {}) {
    this._saveAdapter = options.saveAdapter ?? new MemoryStorageAdapter();
    this._onStartGame = options.onStartGame ?? null;
    /** Optional AudioManager; menu sounds only fire on real selection changes and confirmations. */
    this._audio = options.audio ?? null;
    this._input = null;
    this._selected = OPTION_NEW;
    this._saveStatus = 'unknown'; // 'unknown' | 'none' | 'ok' | 'invalid'
    this._message = '';
    this._busy = false;
    this._surfaceData = null;
  }

  /** Check the save slot once when the menu opens. */
  async enter(data = {}) {
    this._input = data.input ?? null;
    this._surfaceData = data;
    this._busy = false;
    this._message = '';
    await this._refreshSaveStatus();
    this._selected = this._continueAvailable() ? OPTION_CONTINUE : OPTION_NEW;
  }

  async _refreshSaveStatus() {
    try {
      const mgr = new SaveManager({ adapter: this._saveAdapter });
      const r = await mgr.load(SAVE_SLOT);
      if (r.ok) this._saveStatus = 'ok';
      else if (r.reason === 'not_found') this._saveStatus = 'none';
      else this._saveStatus = 'invalid';
    } catch (err) {
      console.error('[MainMenu] save check failed', err);
      this._saveStatus = 'invalid';
    }
  }

  _continueAvailable() {
    return this._saveStatus === 'ok';
  }

  update() {
    const input = this._input;
    if (!input || this._busy) return;

    const order = [OPTION_CONTINUE, OPTION_NEW];
    if (input.justPressed('ArrowUp') || input.justPressed('KeyW')) this._moveSelection(-1, order);
    if (input.justPressed('ArrowDown') || input.justPressed('KeyS')) this._moveSelection(1, order);
    if (input.justPressed('Enter') || input.justPressed('Space') || input.justPressed('KeyE')) {
      this._audio?.playSfx('ui_confirm');
      this._activate(this._selected);
    }

    // Tap / click (touch and mouse). Uses per-frame pointer-down events so quick taps are not lost.
    for (const tap of input.pointerDownsThisFrame?.() ?? []) {
      const hit = this._hitTest(tap.x, tap.y);
      if (hit) {
        this._selected = hit;
        this._audio?.playSfx('ui_confirm');
        this._activate(hit);
        break;
      }
    }
  }

  _moveSelection(delta, order) {
    const i = order.indexOf(this._selected);
    const next = order[(i + delta + order.length) % order.length];
    if (next !== this._selected) this._audio?.playSfx('ui_select');
    this._selected = next;
  }

  _hitTest(x, y) {
    const left = buttonX(this._surfaceData?.surface?.logicalWidth ?? Config.LOGICAL_WIDTH);
    for (const key of [OPTION_CONTINUE, OPTION_NEW]) {
      const top = BUTTON_Y[key];
      if (x >= left && x <= left + BUTTON_W && y >= top && y <= top + BUTTON_H) return key;
    }
    return null;
  }

  async _activate(option) {
    if (this._busy) return;
    if (option === OPTION_CONTINUE) {
      if (!this._continueAvailable()) {
        this._message = this._saveStatus === 'none'
          ? 'Belum ada permainan tersimpan.'
          : 'Data simpan tidak bisa dibaca. Pilih Permainan Baru.';
        return;
      }
      await this._startGame('continue');
      return;
    }
    if (option === OPTION_NEW) {
      await this._startGame('new');
    }
  }

  async _startGame(startMode) {
    if (!this._onStartGame) {
      this._message = 'Permainan tidak bisa dimulai.';
      return;
    }
    this._busy = true;
    try {
      await this._onStartGame(startMode, { ...this._surfaceData });
    } catch (err) {
      console.error('[MainMenu] failed to start game', err);
      this._busy = false;
      this._message = 'Gagal memulai permainan. Coba lagi.';
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  render(ctx) {
    const W = ctx.canvas?.width ?? Config.LOGICAL_WIDTH;
    const H = ctx.canvas?.height ?? Config.LOGICAL_HEIGHT;
    SpriteRenderer.fillRect(ctx, 0, 0, W, H, '#1a1220', 1);
    const backdrop = PixelArt.ready ? PixelArt.titleBackdrop() : null;
    if (backdrop) {
      const scale = Math.max(W / backdrop.width, H / backdrop.height);
      const drawW = backdrop.width * scale;
      const drawH = backdrop.height * scale;
      ctx.drawImage(backdrop, (W - drawW) / 2, (H - drawH) / 2, drawW, drawH);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f6e7c1';
    ctx.font = '16px monospace';
    ctx.fillText('THE ATLAS OF', W / 2, 62);
    ctx.fillText('UNREMEMBERED STARS', W / 2, 82);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#c4a574';
    ctx.fillText('Arc I · Bab 1–5', W / 2, 100);

    this._drawButton(ctx, OPTION_CONTINUE, 'Lanjutkan', this._continueAvailable());
    this._drawButton(ctx, OPTION_NEW, 'Permainan Baru', true);

    if (this._message) {
      // Status message in its own panel under the buttons, so it never overlaps a button.
      drawPanel(ctx, 10, 202, W - 20, 26, { alpha: 0.92 });
      ctx.fillStyle = '#e8a06a';
      ctx.font = '9px monospace';
      ctx.fillText(this._message, W / 2, 218);
    }
    ctx.textAlign = 'left';
  }

  _drawButton(ctx, key, label, enabled) {
    const top = BUTTON_Y[key];
    drawRow(
      ctx,
      { x: buttonX(ctx.canvas?.width ?? Config.LOGICAL_WIDTH), y: top, w: BUTTON_W, h: BUTTON_H },
      label,
      { selected: this._selected === key, disabled: !enabled, align: 'center' }
    );
  }

  exit() {}

  destroy() {}
}
