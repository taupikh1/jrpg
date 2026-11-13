// Draws every gameplay screen into a recording context and checks that all text stays on the
// logical canvas. Text width is approximated (monospace, 0.6 em per character).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameplayDemoScene } from '../../../src/scenes/GameplayDemoScene.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';
import { Config } from '../../../src/core/Config.js';
import { BATTLE_COMMANDS as _UNUSED_BC } from '../../../content/ui/player-text.js';
import { QUEST_COLLECT_WOOD } from '../../../content/gameplay/demo-content.js';

const W = Config.LOGICAL_WIDTH;
const H = Config.LOGICAL_HEIGHT;

function recordingCtx() {
  const texts = [];
  const ctx = {
    font: '10px monospace',
    fillStyle: '#000',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    measureText(s) {
      const px = parseInt(this.font, 10) || 10;
      return { width: String(s).length * px * 0.6 };
    },
    fillRect() {},
    strokeRect() {},
    save() {}, restore() {},
    fillText(t, x, y) {
      const w = this.measureText(t).width;
      const px = parseInt(this.font, 10) || 10;
      let left = x;
      if (this.textAlign === 'right') left = x - w;
      if (this.textAlign === 'center') left = x - w / 2;
      texts.push({ t, left, right: left + w, y, top: y - px, bottom: y + px * 0.3 });
    },
  };
  return { ctx, texts };
}

function sceneFor(setup) {
  const scene = new GameplayDemoScene({ saveAdapter: new MemoryStorageAdapter() });
  scene.init({ events: new EventBus(), input: null, startMode: 'new' });
  setup(scene);
  return scene;
}

function assertInside(texts, label) {
  for (const t of texts) {
    assert.ok(t.left >= -0.5 && t.right <= W + 0.5, `${label}: "${t.t}" x ${t.left.toFixed(1)}..${t.right.toFixed(1)} leaves ${W}px`);
    assert.ok(t.top >= -0.5 && t.bottom <= H + 0.5, `${label}: "${t.t}" y ${t.top.toFixed(1)}..${t.bottom.toFixed(1)} leaves ${H}px`);
  }
}

describe('gameplay screens keep text on the canvas', () => {
  it('world HUD and interaction hint', () => {
    const scene = sceneFor((s) => { s.mode = 'world'; s.zones.activeZone; });
    const { ctx, texts } = recordingCtx();
    scene._drawUI(ctx);
    assert.ok(texts.length > 0);
    assertInside(texts, 'world');
  });

  it('dialogue box with speaker and text', () => {
    const scene = sceneFor(() => {});
    const { ctx, texts } = recordingCtx();
    scene.mode = 'dialogue';
    scene._drawUI(ctx);
    assert.ok(texts.some((t) => t.t.length > 0));
    assertInside(texts, 'dialogue');
  });

  it('inventory with several items and a long description', () => {
    const scene = sceneFor((s) => {
      s.mode = 'inventory';
      s.inventory.add('herb', 2);
      s.inventory.add('rusty_sword', 1);
      s._invIndex = 0;
    });
    const { ctx, texts } = recordingCtx();
    scene._drawUI(ctx);
    assertInside(texts, 'inventory');
  });

  it('quest log with an active quest', () => {
    const scene = sceneFor((s) => {
      s.mode = 'quest';
      s.quests.accept(QUEST_COLLECT_WOOD.id);
    });
    const { ctx, texts } = recordingCtx();
    scene._drawUI(ctx);
    assert.ok(texts.some((t) => /Catatan Quest/.test(t.t)));
    assertInside(texts, 'quest');
  });

  it('battle with party, enemies and command menu', () => {
    const scene = sceneFor((s) => { s._startBattle(); });
    const { ctx, texts } = recordingCtx();
    scene._drawUI(ctx);
    assert.ok(texts.some((t) => /Serang$/.test(t.t)), 'command menu is drawn');
    assertInside(texts, 'battle');
  });

  it('every battle command label fits its 68px cell at the battle font size', () => {
    const BATTLE_COMMANDS = _UNUSED_BC;
    const scene = sceneFor((s) => { s._startBattle(); });
    const { ctx } = recordingCtx();
    ctx.font = '9px monospace';
    for (const label of BATTLE_COMMANDS) {
      const w = ctx.measureText('> ' + label).width;
      assert.ok(w <= 68 - 12, `"${label}" needs ${w.toFixed(1)}px, cell allows ${68 - 12}px`);
    }
    assert.ok(scene);
  });

  it('pause menu in both sub-screens', () => {
    const scene = sceneFor((s) => { s._openPause(); });
    const { ctx, texts } = recordingCtx();
    scene._drawUI(ctx);
    assertInside(texts, 'pause');
    scene._pauseSub = 'confirm';
    const r2 = recordingCtx();
    scene._drawUI(r2.ctx);
    assertInside(r2.texts, 'pause-confirm');
  });

  it('toast message is fitted, not clipped', () => {
    const scene = sceneFor((s) => { s.mode = 'world'; s._showToast('Pesan yang sangat panjang sekali untuk layar kecil dan HP sempit'); s._toastT = 2; });
    const { ctx, texts } = recordingCtx();
    scene._drawUI(ctx);
    assertInside(texts, 'toast');
  });

  it('status & skill screen keeps all text inside canvas (solo and with Mira)', () => {
    const scene = sceneFor((s) => {
      s.inventory.add('rusty_sword', 1);
      s.inventory.add('leather_vest', 1);
      s.equipment.equip('rusty_sword');
      s.equipment.equip('leather_vest');
      s._ch1Flags.ch1_mira_follow = true;
      s.progression.grantExp('orin', 40, { stats: s.stats });
      s.mode = 'status';
      s._statusMemberIdx = 0;
    });
    const r1 = recordingCtx();
    scene._drawUI(r1.ctx);
    assert.ok(r1.texts.some((t) => /Status & Skill/.test(t.t)));
    assertInside(r1.texts, 'status-orin');

    scene._statusMemberIdx = 1;
    const r2 = recordingCtx();
    scene._drawUI(r2.ctx);
    assert.ok(r2.texts.some((t) => /Mira/.test(t.t)));
    assertInside(r2.texts, 'status-mira');
  });

  it('level-up overlay keeps stat gains and unlocked skill text inside canvas', () => {
    const scene = sceneFor((s) => {
      s._levelUpQueue = [{
        characterId: 'orin',
        name: 'Orin',
        prevLevel: 1,
        newLevel: 2,
        statDeltas: { maxHp: 8, maxMp: 3, attack: 2, defense: 2, magicAttack: 1, magicDefense: 1, speed: 1 },
        unlockedSkills: [{ id: 'minor_heal', name: 'Pulih Ringan', mpCost: 4 }],
      }, {
        characterId: 'mira',
        name: 'Mira',
        prevLevel: 1,
        newLevel: 2,
        statDeltas: { maxHp: 5, maxMp: 5 },
        unlockedSkills: [],
      }];
      s.mode = 'levelup';
    });
    const { ctx, texts } = recordingCtx();
    scene._drawUI(ctx);
    assert.ok(texts.some((t) => /NAIK LEVEL!/.test(t.t)));
    assertInside(texts, 'levelup');
  });

  it('battle skill sub-menu, item sub-menu, and ended summary keep text inside canvas', () => {
    const scene = sceneFor((s) => {
      s.inventory.add('ether_drop', 2);
      s.progression.grantExp('orin', 150, { stats: s.stats }); // Lv4: 3 skills
      s._startBattle({ grantRewards: true, source: 'road_ambush' });
    });
    scene._battleSub = 'skill';
    const rs = recordingCtx();
    scene._drawUI(rs.ctx);
    assertInside(rs.texts, 'battle-skill');

    scene._battleSub = 'item';
    const ri = recordingCtx();
    scene._drawUI(ri.ctx);
    assertInside(ri.texts, 'battle-item');

    // End battle victory summary
    for (const e of scene.battle.enemies()) e.stats.hp = 0;
    scene.battle._checkEnd();
    scene._finalizeEndedBattle();
    const rv = recordingCtx();
    scene._drawUI(rv.ctx);
    assertInside(rv.texts, 'battle-victory');
  });
});

