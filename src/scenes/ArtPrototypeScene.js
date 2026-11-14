/**
 * Art Overhaul — Milestone 1/2 Visual Prototype
 * Uses ArtAssetRegistry pipeline.
 * Launch via ?artproto=1
 */
import { registerPrototypeAssets } from '../../content/art/prototype-registry.js';
import { Animator } from '../engine/rendering/Animator.js';

export class ArtPrototypeScene {
  constructor() {
    this.assets = {};
    this.loaded = false;
    this.player = { x: 160, y: 140, dir: 1, moving: false, frame: 0 };
    this.npc = { x: 80, y: 90, talked: false };
    this.enemy = { x: 240, y: 160, alive: true, frame: 0 };
    this.cam = { x: 0, y: 0 };
    this.mode = 'explore'; // explore | talk | battle
    this.talkText = '';
    this.battle = { turn: 'player', log: 'Rootbound Hare muncul!', enemyHp: 40, playerHp: 60 };
    this.keys = new Set();
    this.time = 0;
    this.tileSize = 16;
    // Simple solid map: 1 = wall
    this.mapW = 20;
    this.mapH = 14;
    this.solids = this._buildSolids();
  }

  _buildSolids() {
    const s = [];
    for (let y = 0; y < this.mapH; y++) {
      const row = [];
      for (let x = 0; x < this.mapW; x++) {
        row.push(x === 0 || y === 0 || x === this.mapW - 1 || y === this.mapH - 1 ? 1 : 0);
      }
      s.push(row);
    }
    // A few interior pillars
    s[4][6] = 1;
    s[4][7] = 1;
    s[8][12] = 1;
    return s;
  }

  async enter(game) {
    this.game = game;
    this.registry = registerPrototypeAssets();
    this.playerAnim = new Animator();
    const idle = this.registry.framesFor('hero_orin_idle', 'idle');
    const walk = this.registry.framesFor('hero_orin_walk', 'walk');
    if (idle) this.playerAnim.addClip(idle);
    if (walk) this.playerAnim.addClip(walk);
    this.playerAnim.play('hero_orin_idle:idle');

    const base = './assets/art-overhaul/prototype/';
    const names = ['bunny-idle', 'bunny-run', 'chars-sandstone', 'hero-idle', 'hero-walk', 'tiles-sandstone', 'ui-green'];
    await Promise.all(names.map((n) => this._load(base + n + '.png', n)));
    this.loaded = true;
    this._diagnostics = this.registry.missingReport([
      'hero_orin_idle', 'hero_orin_walk', 'npc_archive_scholar', 'enemy_rootbound_hare', 'tileset_archive',
    ]);
    this._onKey = (e) => {
      if (e.type === 'keydown') this.keys.add(e.key.toLowerCase());
      else this.keys.delete(e.key.toLowerCase());
      if (e.type === 'keydown' && (e.key === 'e' || e.key === 'Enter')) this._interact();
      if (e.type === 'keydown' && e.key === 'Escape' && this.mode !== 'explore') this.mode = 'explore';
    };
    window.addEventListener('keydown', this._onKey);
    window.addEventListener('keyup', this._onKey);
  }

  _load(src, key) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => { this.assets[key] = img; res(); };
      img.onerror = () => { this.assets[key] = null; res(); };
      img.src = src;
    });
  }

  exit() {
    window.removeEventListener('keydown', this._onKey);
    window.removeEventListener('keyup', this._onKey);
  }

  update(dt) {
    if (!this.loaded) return;
    this.time += dt;
    if (this.mode === 'explore') this._updateExplore(dt);
    else if (this.mode === 'battle') this._updateBattle(dt);
    this.enemy.frame = Math.floor(this.time * 6) % 8;
    this.player.frame = Math.floor(this.time * (this.player.moving ? 8 : 4)) % (this.player.moving ? 8 : 9);
    if (this.playerAnim) {
      const want = this.player.moving ? 'hero_orin_walk:walk' : 'hero_orin_idle:idle';
      if (this.playerAnim.currentClipName !== want) this.playerAnim.play(want);
      this.playerAnim.update(dt);
    }
  }

  _updateExplore(dt) {
    let dx = 0, dy = 0;
    const speed = 70;
    if (this.keys.has('arrowleft') || this.keys.has('a')) dx -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) dx += 1;
    if (this.keys.has('arrowup') || this.keys.has('w')) dy -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) dy += 1;
    this.player.moving = dx !== 0 || dy !== 0;
    if (dx !== 0) this.player.dir = dx > 0 ? 1 : -1;
    const nx = this.player.x + dx * speed * dt;
    const ny = this.player.y + dy * speed * dt;
    if (!this._blocked(nx, this.player.y)) this.player.x = nx;
    if (!this._blocked(this.player.x, ny)) this.player.y = ny;
    // Camera follow
    this.cam.x = this.player.x - 160;
    this.cam.y = this.player.y - 100;
    // Enemy contact
    if (this.enemy.alive && Math.hypot(this.player.x - this.enemy.x, this.player.y - this.enemy.y) < 18) {
      this.mode = 'battle';
      this.battle = { turn: 'player', log: 'Rootbound Hare menyerang!', enemyHp: 40, playerHp: 60 };
    }
  }

  _blocked(x, y) {
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);
    if (tx < 0 || ty < 0 || tx >= this.mapW || ty >= this.mapH) return true;
    return this.solids[ty][tx] === 1;
  }

  _interact() {
    if (this.mode === 'battle') {
      this._battleAction('attack');
      return;
    }
    const d = Math.hypot(this.player.x - this.npc.x, this.player.y - this.npc.y);
    if (d < 28) {
      this.mode = 'talk';
      this.npc.talked = true;
      this.talkText = 'Arsiparis: "Nama-nama di rak ini mulai pudar. Hati-hati dengan kelinci akar di lorong timur."';
    } else if (this.mode === 'talk') {
      this.mode = 'explore';
    }
  }

  _battleAction(kind) {
    if (this.battle.turn !== 'player') return;
    if (kind === 'attack') {
      this.battle.enemyHp -= 12;
      this.battle.log = 'Orin menyerang! (12)';
    }
    if (this.battle.enemyHp <= 0) {
      this.battle.log = 'Musuh kalah. Kembali menjelajah.';
      this.enemy.alive = false;
      setTimeout(() => { this.mode = 'explore'; }, 600);
      return;
    }
    this.battle.turn = 'enemy';
    setTimeout(() => {
      this.battle.playerHp -= 6;
      this.battle.log = 'Rootbound Hare menyerang! (6)';
      this.battle.turn = 'player';
      if (this.battle.playerHp <= 0) {
        this.battle.log = 'Kalah. Kembali ke awal ruangan.';
        this.player.x = 160;
        this.player.y = 140;
        this.battle.playerHp = 60;
        setTimeout(() => { this.mode = 'explore'; }, 700);
      }
    }, 500);
  }

  render(ctx, alpha) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.fillStyle = '#1a1420';
    ctx.fillRect(0, 0, width, height);
    if (!this.loaded) {
      ctx.fillStyle = '#f8f1de';
      ctx.font = '14px sans-serif';
      ctx.fillText('Memuat prototype...', 20, 40);
      return;
    }
    ctx.save();
    ctx.translate(-this.cam.x, -this.cam.y);
    this._drawMap(ctx);
    this._drawNpc(ctx);
    if (this.enemy.alive) this._drawEnemy(ctx);
    this._drawPlayer(ctx);
    ctx.restore();
    this._drawUI(ctx, width, height);
  }

  _drawMap(ctx) {
    const tiles = this.assets['tiles-sandstone'];
    for (let y = 0; y < this.mapH; y++) {
      for (let x = 0; x < this.mapW; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        if (tiles) {
          // Sample a floor-like region (approximate dark floor tiles)
          const sx = (this.solids[y][x] ? 16 : 0);
          const sy = (this.solids[y][x] ? 16 : 32);
          ctx.drawImage(tiles, sx, sy, 16, 16, px, py, 16, 16);
        } else {
          ctx.fillStyle = this.solids[y][x] ? '#3a2a22' : '#2a241c';
          ctx.fillRect(px, py, 16, 16);
        }
      }
    }
  }

  _drawPlayer(ctx) {
    const sheet = this.player.moving ? this.assets['hero-walk'] : this.assets['hero-idle'];
    const frame = this.playerAnim?.getCurrentFrame?.();
    if (sheet && frame) {
      ctx.save();
      const fw = frame.sw;
      const fh = frame.sh;
      if (this.player.dir < 0) {
        ctx.translate(this.player.x, this.player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(sheet, frame.sx, frame.sy, fw, fh, -fw / 2, -fh + 8, fw, fh);
      } else {
        ctx.drawImage(sheet, frame.sx, frame.sy, fw, fh, this.player.x - fw / 2, this.player.y - fh + 8, fw, fh);
      }
      ctx.restore();
    } else if (sheet) {
      const frames = this.player.moving ? 8 : 9;
      const fw = sheet.width / frames;
      const fh = sheet.height;
      const f = this.player.frame % frames;
      ctx.save();
      if (this.player.dir < 0) {
        ctx.translate(this.player.x + fw / 2, this.player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(sheet, f * fw, 0, fw, fh, -fw / 2, -fh + 8, fw, fh);
      } else {
        ctx.drawImage(sheet, f * fw, 0, fw, fh, this.player.x - fw / 2, this.player.y - fh + 8, fw, fh);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#e97d5c';
      ctx.fillRect(this.player.x - 6, this.player.y - 10, 12, 16);
    }
  }

  _drawNpc(ctx) {
    const sheet = this.assets['chars-sandstone'];
    if (sheet) {
      // Top-left character cell approx 16x24 or so; draw a portion
      ctx.drawImage(sheet, 0, 0, 32, 32, this.npc.x - 16, this.npc.y - 28, 32, 32);
    } else {
      ctx.fillStyle = '#6db3e2';
      ctx.fillRect(this.npc.x - 6, this.npc.y - 12, 12, 16);
    }
  }

  _drawEnemy(ctx) {
    const sheet = this.assets['bunny-idle'];
    if (sheet) {
      const fw = 34;
      const f = this.enemy.frame % 8;
      ctx.drawImage(sheet, f * fw, 0, fw, 44, this.enemy.x - 17, this.enemy.y - 40, 34, 44);
    }
  }

  _drawUI(ctx, w, h) {
    // Dialogue / battle window
    if (this.mode === 'talk') {
      this._window(ctx, 10, h - 70, w - 20, 60);
      ctx.fillStyle = '#f8f1de';
      ctx.font = '12px sans-serif';
      this._wrapText(ctx, this.talkText, 20, h - 48, w - 40, 14);
      ctx.fillText('[E / Enter] tutup', 20, h - 18);
    } else if (this.mode === 'battle') {
      this._window(ctx, 10, h - 90, w - 20, 80);
      ctx.fillStyle = '#f8f1de';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Orin HP: ${this.battle.playerHp}    Hare HP: ${this.battle.enemyHp}`, 20, h - 68);
      ctx.fillText(this.battle.log, 20, h - 50);
      ctx.fillText('[E / Enter] Serang    [Esc] kabur (eksplor)', 20, h - 28);
    } else {
      ctx.fillStyle = '#f8f1de';
      ctx.font = '11px sans-serif';
      ctx.fillText('Art Prototype — Arsip (Arc I) | WASD/Arrows gerak | E interaksi | Sentuh musuh = battle', 8, 16);
    }
  }

  _window(ctx, x, y, w, h) {
    const ui = this.assets['ui-green'];
    ctx.fillStyle = 'rgba(20,16,28,0.92)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#86b95a';
    ctx.strokeRect(x, y, w, h);
    if (ui) ctx.drawImage(ui, x + 2, y + 2, 12, 12);
  }

  _wrapText(ctx, text, x, y, maxW, lh) {
    const words = text.split(' ');
    let line = '';
    let yy = y;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxW) {
        ctx.fillText(line, x, yy);
        line = word + ' ';
        yy += lh;
      } else line = test;
    }
    ctx.fillText(line, x, yy);
  }
}
