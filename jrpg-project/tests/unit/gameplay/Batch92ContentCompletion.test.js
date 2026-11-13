import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeScene, playThrough as playToEnd } from './sceneHarness.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { CHAPTER_02_QUESTS } from '../../../content/quests/arc_01/quest_ch2_main.js';
import { CHAPTER_03_DIALOGUES } from '../../../content/dialogue/arc_01/chapter_03.js';
import { QUEST_CH3_JEJAK } from '../../../content/quests/arc_01/quest_ch3_main.js';
import { CHAPTER_04_QUESTS } from '../../../content/quests/arc_01/quest_ch4_main.js';
import { CHAPTER_05_QUESTS } from '../../../content/quests/arc_01/quest_ch5_main.js';
import { ZONE_BELLHAVEN_MARKET } from '../../../content/world/bellhaven-data.js';
import { Tileset } from '../../../src/engine/world/tileset/Tileset.js';
import { Tilemap } from '../../../src/engine/world/tilemap/Tilemap.js';
import { DEMO_TILESET } from '../../../content/world/demo-data.js';
import { MAIN_QUEST_CHAPTERS } from '../../../src/scenes/GameplayDemoScene.js';

function withQuests(scene) {
  const events = new EventBus();
  const q = new QuestLog(events);
  for (const d of [...CHAPTER_02_QUESTS, QUEST_CH3_JEJAK, ...CHAPTER_04_QUESTS, ...CHAPTER_05_QUESTS]) q.register(d);
  scene.quests = q;
  scene.entities = { add() {}, get() { return null; } };
  return q;
}

describe('Batch 9.2: main quests are accepted in real play', () => {
  it('chapter entry accepts the matching main quest exactly once', () => {
    const { scene } = makeScene();
    const q = withQuests(scene);
    scene._ch2Flags._entry_started = true;
    scene._ensureMainQuest('quest_ch2_suara_hutan');
    assert.equal(q.getStatus('quest_ch2_suara_hutan'), 'active');
    scene._ensureMainQuest('quest_ch2_suara_hutan');
    assert.equal(q.getStatus('quest_ch2_suara_hutan'), 'active');
  });

  it('backfills flags already set in the chapter when the quest is accepted late', () => {
    const { scene } = makeScene();
    const q = withQuests(scene);
    scene._ch2Flags.ch2_forest_entered = true;
    scene._ch2Flags.ch2_first_echo_heard = true;
    scene._ensureMainQuest('quest_ch2_suara_hutan');
    const prog = q.getProgress('quest_ch2_suara_hutan');
    const byId = Object.fromEntries(prog.objectives.map((o) => [o.id, o.current]));
    assert.equal(byId.enter, 1);
    assert.equal(byId.echo, 1);
    assert.equal(byId.elara, 0);
  });

  it('old saves: migration accepts quests for chapters already started', () => {
    const { scene } = makeScene();
    const q = withQuests(scene);
    scene._ch4Flags._entry_started = true;
    scene._ch5Flags.ch5_fragment_investigated = true;
    scene._migrateMainQuests();
    assert.equal(q.getStatus('quest_ch4_arsip_tanpa_nama'), 'active');
    assert.equal(q.getStatus('quest_ch5_resonansi_pertama'), 'active');
    assert.equal(q.getStatus('quest_ch2_suara_hutan'), 'available');
  });

  it('every mapped main quest exists in the registered quest set', () => {
    for (const id of Object.keys(MAIN_QUEST_CHAPTERS)) {
      assert.ok([...CHAPTER_02_QUESTS, QUEST_CH3_JEJAK, ...CHAPTER_04_QUESTS, ...CHAPTER_05_QUESTS].some((d) => d.id === id), id);
    }
  });
});

describe('Batch 9.2: Chapter 4 three-records resonance', () => {
  it('does not queue the resonance beat until all three records were read', () => {
    const { scene } = makeScene();
    withQuests(scene);
    scene._ch4Flags.ch4_record_east = true;
    scene._ch4Flags.ch4_record_center = true;
    scene._onDialogueCompleted({ id: 'ch4_obj_record_center' });
    assert.equal(scene._storyNext, null);
  });

  it('queues the resonance beat once all three records were read', () => {
    const { scene } = makeScene();
    withQuests(scene);
    scene._ch4Flags.ch4_record_east = true;
    scene._ch4Flags.ch4_record_center = true;
    scene._ch4Flags.ch4_record_west = true;
    scene._onDialogueCompleted({ id: 'ch4_obj_record_west' });
    assert.equal(scene._storyNext, 'ch4_three_records_resonance');
  });

  it('the resonance beat sets its flag and objective through the real dialogue', () => {
    const { scene, dialogue } = makeScene();
    const q = withQuests(scene);
    q.accept('quest_ch4_arsip_tanpa_nama');
    playToEnd(scene, dialogue, 'ch4_three_records_resonance');
    assert.equal(scene._ch4Flags.ch4_three_records_resonated, true);
    const obj = q.getProgress('quest_ch4_arsip_tanpa_nama').objectives.find((o) => o.id === 'three');
    assert.equal(obj.current, 1);
  });
});

describe('Batch 9.2: Chapter 4 fountain inscription', () => {
  it('the inscription dialogue sets its flag and completes the fountain objective', () => {
    const { scene, dialogue } = makeScene();
    const q = withQuests(scene);
    q.accept('quest_ch4_surat_tanpa_nama');
    playToEnd(scene, dialogue, 'ch4_obj_fountain_inscription');
    assert.equal(scene._ch4Flags.ch4_fountain_inscription_seen, true);
    const obj = q.getProgress('quest_ch4_surat_tanpa_nama').objectives.find((o) => o.id === 'fountain');
    assert.equal(obj.current, 1);
  });
});

describe('Batch 9.2: Chapter 5 side quests and echo', () => {
  it('declining the mural offer leaves the quest available; accepting it starts the quest', () => {
    const { scene, dialogue } = makeScene();
    const q = withQuests(scene);
    scene._ch5Flags.ch5_mural_seen = true;
    playToEnd(scene, dialogue, 'ch5_side_message_offer', 1); // "Nanti kita perhatikan lagi."
    assert.equal(q.getStatus('quest_ch5_pesan_yang_tertinggal'), 'available');
    playToEnd(scene, dialogue, 'ch5_side_message_offer', 0); // "Mari kita salin pesannya."
    assert.equal(q.getStatus('quest_ch5_pesan_yang_tertinggal'), 'active');
  });

  it('the mural copy line completes the quest through its flag objective', () => {
    const { scene, dialogue } = makeScene();
    const q = withQuests(scene);
    q.accept('quest_ch5_pesan_yang_tertinggal');
    playToEnd(scene, dialogue, 'ch5_side_message_done');
    assert.equal(scene._ch5Flags.ch5_message_copied, true);
    assert.equal(q.getStatus('quest_ch5_pesan_yang_tertinggal'), 'completed');
  });

  it('Bellhaven echo carving has a walkable, reachable interaction spot', () => {
    const map = new Tilemap(ZONE_BELLHAVEN_MARKET.tilemap, new Tileset(DEMO_TILESET));
    const PW = 12;
    const walk = (x, y) => {
      for (let ty = Math.floor(y / 16); ty <= Math.floor((y + PW - 1) / 16); ty++)
        for (let tx = Math.floor(x / 16); tx <= Math.floor((x + PW - 1) / 16); tx++)
          if (map.isSolid(tx, ty)) return false;
      return true;
    };
    const sp = ZONE_BELLHAVEN_MARKET.spawnPoints.find((s) => s.id === 'start');
    const W = ZONE_BELLHAVEN_MARKET.tilemap.width * 16 - PW;
    const H = ZONE_BELLHAVEN_MARKET.tilemap.height * 16 - PW;
    const seen = new Uint8Array((W + 1) * (H + 1));
    const queue = [[sp.x, sp.y]];
    seen[sp.y * (W + 1) + sp.x] = 1;
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx > W || ny > H) continue;
        const k = ny * (W + 1) + nx;
        if (seen[k] || !walk(nx, ny)) continue;
        seen[k] = 1;
        queue.push([nx, ny]);
      }
    }
    let hits = 0;
    for (const [x, y] of queue) if (Math.hypot(280 - x, 24 - y) <= 20) hits++;
    assert.ok(hits > 0, 'no reachable spot within interaction range of the echo carving');
  });

  it('echo carving spawns only after the fragment is investigated and not after it was found', () => {
    const { scene } = makeScene();
    let added = 0;
    scene.entities = { add() { added++; } };
    scene.zones = { activeZone: { id: 'bellhaven_market' } };
    scene._spawnCh5Echo('bellhaven_market');
    assert.equal(added, 0);
    scene._ch5Flags.ch5_fragment_investigated = true;
    scene._spawnCh5Echo('bellhaven_market');
    assert.equal(added, 1);
    scene._ch5Flags.ch5_echo_found = true;
    scene._spawnCh5Echo('bellhaven_market');
    assert.equal(added, 1);
  });

  it('memories dialogue plays once on the road after the fragment is investigated', () => {
    const { scene, dialogue } = makeScene();
    scene.mode = 'world';
    assert.equal(scene._maybeCh5Memories('road_bellhaven'), false);
    scene._ch5Flags.ch5_fragment_investigated = true;
    assert.equal(scene._maybeCh5Memories('village'), false);
    assert.equal(scene._maybeCh5Memories('road_bellhaven'), true);
    assert.ok(scene.started.includes('ch5_memories_we_carry'));
    dialogue.end(); scene.mode = 'world';
    assert.equal(scene._maybeCh5Memories('road_bellhaven'), false);
  });
});
