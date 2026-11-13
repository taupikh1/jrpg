import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { PixelArt } from '../../../src/engine/rendering/pixelart/PixelArt.js';
import { ZoneArt } from '../../../src/engine/rendering/pixelart/ZoneArt.js';
import { Tilemap } from '../../../src/engine/world/tilemap/Tilemap.js';
import { Tileset } from '../../../src/engine/world/tileset/Tileset.js';
import { Camera } from '../../../src/engine/rendering/Camera.js';
import { DEMO_TILESET, ZONE_VILLAGE, ZONE_FOREST, ZONE_ROAD_BELLHAVEN } from '../../../content/world/demo-data.js';
import { BELLHAVEN_ZONES } from '../../../content/world/bellhaven-data.js';
import { ARCHIVE_ZONES } from '../../../content/world/archive-data.js';
import { RESONANCE_ZONES } from '../../../content/world/resonance-site-data.js';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';

const ZONES = [ZONE_VILLAGE, ZONE_FOREST, ZONE_ROAD_BELLHAVEN, ...BELLHAVEN_ZONES, ...ARCHIVE_ZONES, ...RESONANCE_ZONES];

/** Records which 16px grid cells receive a tile image. */
function recordingCtx() {
  const cells = new Set();
  return {
    cells,
    globalAlpha: 1,
    fillStyle: '#000',
    save() {},
    restore() {},
    fillRect() {},
    drawImage(img, x, y) {
      cells.add(`${Math.round(x / 16)},${Math.round(y / 16)}`);
    },
  };
}

describe('zone rendering covers a wide landscape screen', () => {
  afterEach(() => PixelArt.configure({}));

  for (const [vw, vh] of [[517, 240], [480, 240], [427, 240]]) {
    it(`fills every visible tile cell at ${vw}x${vh} for every zone (no black bars)`, () => {
      PixelArt.configure({ toImage: (pb) => pb });
      for (const def of ZONES) {
        const tm = new Tilemap(def.tilemap, new Tileset({ ...DEMO_TILESET, id: def.tilemap.tilesetId || DEMO_TILESET.id }));
        const art = new ZoneArt(tm, def.id, PixelArt);
        const cam = new Camera({ viewportWidth: vw, viewportHeight: vh });
        cam.setBounds(0, 0, tm.pixelWidth, tm.pixelHeight);
        for (const [px, py] of [[0, 0], [1e6, 1e6]]) {
          cam.setPosition(px, py);
          const ctx = recordingCtx();
          art.render(ctx, cam, 1, 0);
          const x0 = Math.floor(cam.viewX / 16);
          const y0 = Math.floor(cam.viewY / 16);
          const x1 = Math.ceil((cam.viewX + cam.viewWidth) / 16) - 1;
          const y1 = Math.ceil((cam.viewY + cam.viewHeight) / 16) - 1;
          for (let ty = y0; ty <= y1; ty++) {
            for (let tx = x0; tx <= x1; tx++) {
              assert.ok(ctx.cells.has(`${tx},${ty}`), `${def.id} ${vw}x${vh}: cell ${tx},${ty} left empty`);
            }
          }
        }
      }
    });
  }

  it('draws nothing outside the map when the map already fills the view', () => {
    PixelArt.configure({ toImage: (pb) => pb });
    const def = ZONE_FOREST;
    const tm = new Tilemap(def.tilemap, new Tileset({ ...DEMO_TILESET, id: def.tilemap.tilesetId || DEMO_TILESET.id }));
    const art = new ZoneArt(tm, def.id, PixelArt);
    const cam = new Camera({ viewportWidth: 320, viewportHeight: 240 });
    cam.setBounds(0, 0, tm.pixelWidth, tm.pixelHeight);
    cam.setPosition(32, 8);
    const ctx = recordingCtx();
    art.render(ctx, cam, 0, 0);
    for (const key of ctx.cells) {
      const [tx, ty] = key.split(',').map(Number);
      assert.ok(tx >= 0 && ty >= 0 && tx < tm.width && ty < tm.height, `unexpected outer cell ${key}`);
    }
  });

  it('keeps an open exit running outward instead of closing it with trees', () => {
    PixelArt.configure({ toImage: (pb) => pb });
    const def = ZONE_VILLAGE;
    const tm = new Tilemap(def.tilemap, new Tileset({ ...DEMO_TILESET, id: def.tilemap.tilesetId || DEMO_TILESET.id }));
    const art = new ZoneArt(tm, def.id, PixelArt);
    const specs = [];
    const orig = PixelArt.tile.bind(PixelArt);
    PixelArt.tile = (theme, spec) => {
      specs.push(spec);
      return orig(theme, spec);
    };
    try {
      const cam = new Camera({ viewportWidth: 517, viewportHeight: 240 });
      cam.setBounds(0, 0, tm.pixelWidth, tm.pixelHeight);
      cam.setPosition(0, 1e6);
      art.render(recordingCtx(), cam, 1, 0);
    } finally {
      delete PixelArt.tile;
    }
    assert.ok(specs.some((s) => s.startsWith('forest:')), 'dense canopy used beside the map');
    assert.ok(specs.some((s) => s.startsWith('path:')), 'path tiles present');
  });
});

describe('world HUD keeps clear of the notch and the MENU button', () => {
  function makeCtx() {
    const texts = [];
    const ctx = new Proxy(
      { texts, textAlign: 'left', font: '9px monospace', canvas: { width: 517, height: 240 } },
      {
        get(t, k) {
          if (k in t) return t[k];
          if (k === 'measureText') return (s) => ({ width: String(s).length * 5 });
          return () => {};
        },
        set(t, k, v) {
          t[k] = v;
          return true;
        },
      }
    );
    ctx.fillText = (text, x, y) => texts.push({ text, x, y, align: ctx.textAlign });
    return { ctx, texts };
  }

  function scene(hudInsets) {
    const s = Object.create(GameplayDemoScene.prototype);
    s._debugHud = false;
    s._hudInsets = hudInsets;
    s.zones = { activeZone: { name: 'Desa Ashwillow' } };
    s.progression = { getState: () => ({ level: 1 }) };
    s.gold = 20;
    s.stats = { hp: 60, maxHp: 60, mp: 25, maxMp: 25 };
    s.quests = { activeQuests: () => [] };
    return s;
  }

  it('right-aligns Level/Gold at the right edge when no inset is provided', () => {
    const { ctx, texts } = makeCtx();
    scene(null)._drawWorldHud(ctx, 517);
    const gold = texts.find((t) => t.text.includes('Gold'));
    assert.equal(gold.x, 517 - 6);
  });

  it('moves Level/Gold left of the MENU button and right of the notch', () => {
    const { ctx, texts } = makeCtx();
    scene(() => ({ left: 29, right: 44 }))._drawWorldHud(ctx, 517);
    const gold = texts.find((t) => t.text.includes('Gold'));
    const hp = texts.find((t) => t.text === 'HP');
    assert.equal(gold.x, 517 - 44);
    assert.equal(hp.x, 6 + 29);
  });

  it('ignores a failing inset provider', () => {
    const { ctx, texts } = makeCtx();
    scene(() => {
      throw new Error('boom');
    })._drawWorldHud(ctx, 517);
    assert.ok(texts.find((t) => t.text.includes('Gold')));
  });
});
