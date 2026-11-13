import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PixBuf } from '../../../src/engine/rendering/pixelart/PixBuf.js';
import { paintCharacterSheet, HERO_LOOK, NPC_LOOKS, deriveLook, CHAR_W, CHAR_H } from '../../../src/engine/rendering/pixelart/CharacterArt.js';
import { PROPS, paintPropStrip, propKindFor } from '../../../src/engine/rendering/pixelart/PropArt.js';
import { paintTile, themeForZone } from '../../../src/engine/rendering/pixelart/TileArt.js';
import { paintThornSprite } from '../../../src/engine/rendering/pixelart/EnemyArt.js';
import { paintItemIcon } from '../../../src/engine/rendering/pixelart/IconArt.js';
import { PixelArt } from '../../../src/engine/rendering/pixelart/PixelArt.js';
import { ITEMS } from '../../../content/items/arc_01.js';

const opaque = (pb) => { let n = 0; for (let i = 3; i < pb.data.length; i += 4) if (pb.data[i]) n++; return n; };

describe('pixel art generation', () => {
  it('draws the hero and every named NPC on all frames and directions', () => {
    for (const look of [HERO_LOOK, ...Object.values(NPC_LOOKS), deriveLook('npc_x', '#336699')]) {
      const sheet = paintCharacterSheet(look);
      assert.equal(sheet.width, CHAR_W * 4);
      assert.equal(sheet.height, CHAR_H * 3);
      for (let row = 0; row < 3; row++) for (let f = 0; f < 4; f++) {
        const fr = new PixBuf(CHAR_W, CHAR_H).blit(sheet, 0, 0, { sx: f * CHAR_W, sy: row * CHAR_H, sw: CHAR_W, sh: CHAR_H });
        assert.ok(opaque(fr) > 120, 'character frame is not empty');
      }
    }
  });

  it('every prop paints every frame', () => {
    for (const kind of Object.keys(PROPS)) {
      const s = paintPropStrip(kind);
      assert.ok(s && opaque(s.strip) > 20, kind);
    }
  });

  it('known entity ids map to a dedicated prop', () => {
    for (const id of ['sign', 'bh_notice', 'bh_fountain', 'ch2_echo_stone', 'ch5_pillar', 'guest_page_1', 'road_flower_2', 'well', 'stump']) {
      assert.notEqual(propKindFor(id), 'gem', id);
      assert.ok(propKindFor(id) === 'none' || PROPS[propKindFor(id)], id);
    }
  });

  it('paints tiles for all themes, enemy and an icon for each item', () => {
    for (const z of ['village', 'forest', 'road_bellhaven', 'bellhaven_plaza', 'bellhaven_archive_hall', 'resonance_ancient_site']) {
      const theme = themeForZone(z);
      for (const spec of ['grass:0', 'grass:2', 'path:0', 'dirt:1', 'water:2', 'edge:path:n:0', 'border:4:1', 'house:0:0:4:3:1', 'shelf:0:0:3:2:1', 'ruin:0:0:2:2:1', 'stall:0:0:3:2:1', 'basin:1:1:4:4:0']) {
        assert.equal(paintTile(theme, spec).width, 16, `${theme} ${spec}`);
      }
    }
    assert.ok(opaque(paintThornSprite(0)) > 80);
    for (const it of ITEMS) assert.ok(opaque(paintItemIcon(it.id, it.category)) > 20, it.id);
  });

  it('is inert without a canvas converter (headless fallback)', () => {
    PixelArt.configure({});
    assert.equal(PixelArt.ready, false);
    assert.equal(PixelArt.tile('village', 'grass:0'), null);
  });
});
