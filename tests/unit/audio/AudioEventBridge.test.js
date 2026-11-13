import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/EventBus.js';
import { bindAudioEvents } from '../../../src/engine/audio/AudioEventBridge.js';

/** Stands in for AudioManager and records what the gameplay events asked for. */
function recorder() {
  const sfx = [];
  const holds = [];
  const tracks = [];
  return {
    sfx,
    holds,
    tracks,
    playSfx: (id, opts = {}) => { sfx.push({ id, delay: opts.delay ?? 0 }); return true; },
    setAmbientHold: (reason, on) => holds.push({ reason, on }),
    playAmbient: (track) => tracks.push(track),
  };
}

const ENEMY = new Set(['thorn1', 'thorn2']);
const ctx = {
  isEnemy: (id) => ENEMY.has(id),
  skillKindOf: (id) => ({ mira_mend: 'heal', mira_spark: 'magic', fire: 'magic' }[id] ?? 'magic'),
  ambientForZone: (zoneId) => ({ forest: 'forest_wind', village: 'village_breeze' }[zoneId] ?? null),
};

function setup() {
  const events = new EventBus();
  const audio = recorder();
  const dispose = bindAudioEvents(events, audio, ctx);
  const ids = () => audio.sfx.map((s) => s.id);
  return { events, audio, dispose, ids };
}

describe('Audio event bridge: turn-based combat', () => {
  it('battle start plays a sting and holds the area ambience', () => {
    const { events, audio, ids } = setup();
    events.emit('battle.started', { participants: [] });
    assert.deepEqual(ids(), ['battle_start']);
    assert.deepEqual(audio.holds, [{ reason: 'battle', on: true }]);
  });

  it('a party member attack plays a swing, then an impact and an enemy hurt cue', () => {
    const { events, audio } = setup();
    events.emit('battle.action_resolved', { type: 'attack', actorId: 'orin', targetId: 'thorn1', damage: 9 });
    assert.deepEqual(audio.sfx.map((s) => s.id), ['attack_physical', 'impact_weapon', 'damage_enemy']);
    assert.ok(audio.sfx[1].delay > 0, 'impact is scheduled after the swing');
  });

  it('an enemy attack on the party uses the enemy swing and the party hurt cue', () => {
    const { events, audio } = setup();
    events.emit('battle.action_resolved', { type: 'attack', actorId: 'thorn1', targetId: 'orin', damage: 4 });
    assert.deepEqual(audio.sfx.map((s) => s.id), ['enemy_attack', 'impact_weapon', 'damage_player']);
  });

  it('a miss or zero damage plays only the swing', () => {
    const { events, ids } = setup();
    events.emit('battle.action_resolved', { type: 'attack', actorId: 'orin', targetId: 'thorn1', damage: 0 });
    assert.deepEqual(ids(), ['attack_physical']);
  });

  it('healing uses the heal sound, magic uses the magic sound, and they differ', () => {
    const { events, ids } = setup();
    events.emit('battle.action_resolved', { type: 'skill', actorId: 'mira', targetId: 'orin', skill: 'mira_mend' });
    events.emit('battle.action_resolved', { type: 'skill', actorId: 'mira', targetId: 'thorn1', skill: 'mira_spark' });
    assert.equal(ids()[0], 'heal');
    assert.equal(ids()[1], 'magic_cast');
    assert.notEqual(ids()[0], ids()[1]);
  });

  it('item use, defend, and status feedback map to their own sounds', () => {
    const { events, ids } = setup();
    events.emit('battle.action_resolved', { type: 'item', actorId: 'orin', itemId: 'herb' });
    events.emit('battle.action_resolved', { type: 'defend', actorId: 'orin' });
    assert.deepEqual(ids(), ['item_use', 'defend']);
  });

  it('a defeated enemy and a knocked-out party member sound different', () => {
    const { events, ids } = setup();
    events.emit('battle.participant_defeated', { id: 'thorn2' });
    events.emit('battle.participant_defeated', { id: 'orin' });
    assert.deepEqual(ids(), ['enemy_defeat', 'party_ko']);
  });

  it('victory, defeat and escape each play once and the hold is released when the battle ends', () => {
    const { events, audio, ids } = setup();
    events.emit('battle.victory', { rewards: {} });
    events.emit('battle.ended', { result: 'victory' });
    events.emit('battle.defeat', {});
    events.emit('battle.escaped', {});
    assert.deepEqual(ids(), ['battle_victory', 'battle_defeat', 'battle_escape']);
    assert.deepEqual(audio.holds.at(-1), { reason: 'battle', on: false });
  });
});

describe('Audio event bridge: items, quests, dialogue, saves', () => {
  it('picking up and using items', () => {
    const { events, ids } = setup();
    events.emit('inventory.item_added', { itemId: 'herb', qty: 1 });
    events.emit('inventory.item_used', { itemId: 'herb' });
    assert.deepEqual(ids(), ['item_pickup', 'item_use']);
  });

  it('quest accepted plays a sound', () => {
    const { events, ids } = setup();
    events.emit('quest.accepted', { id: 'quest_x' });
    assert.deepEqual(ids(), ['quest_accept']);
  });

  it('quest completed plays the completion sound, and a reward sound only when there is a reward', () => {
    const { events, audio } = setup();
    events.emit('quest.completed', { id: 'q1', rewards: {} });
    assert.deepEqual(audio.sfx.map((s) => s.id), ['quest_complete']);
    audio.sfx.length = 0;
    events.emit('quest.completed', { id: 'q2', rewards: { gold: 20 } });
    assert.deepEqual(audio.sfx.map((s) => s.id), ['quest_complete', 'reward']);
    assert.ok(audio.sfx[1].delay > 0);
  });

  it('starting dialogue plays an NPC voice blip; a successful save plays the save chime', () => {
    const { events, ids } = setup();
    events.emit('dialogue.started', { id: 'd1' });
    events.emit('save.written', { slotId: 'slot1' });
    assert.deepEqual(ids(), ['npc_talk', 'ui_save_ok']);
  });

  it('quest objective progress does not play a sound on its own', () => {
    const { events, ids } = setup();
    events.emit('quest.objective_updated', { id: 'q1' });
    assert.deepEqual(ids(), []);
  });
});

describe('Audio event bridge: area ambience', () => {
  it('entering a mapped zone sets its ambience', () => {
    const { events, audio } = setup();
    events.emit('zone:activated', { zone: { id: 'forest' }, spawn: {} });
    assert.deepEqual(audio.tracks, ['forest_wind']);
  });

  it('entering a zone without ambience silences the previous area', () => {
    const { events, audio } = setup();
    events.emit('zone:activated', { zone: { id: 'some_unmapped_zone' }, spawn: {} });
    assert.deepEqual(audio.tracks, [null]);
  });

  it('a zone event without a zone id does nothing', () => {
    const { events, audio } = setup();
    events.emit('zone:activated', {});
    assert.deepEqual(audio.tracks, []);
  });
});

describe('Audio event bridge: listener lifecycle', () => {
  it('dispose removes every listener, so later events play nothing', () => {
    const { events, audio, dispose } = setup();
    dispose();
    events.emit('battle.started', {});
    events.emit('zone:activated', { zone: { id: 'forest' } });
    events.emit('quest.accepted', {});
    assert.equal(audio.sfx.length, 0);
    assert.equal(audio.tracks.length, 0);
  });

  it('dispose is safe to call twice', () => {
    const { dispose } = setup();
    dispose();
    assert.doesNotThrow(() => dispose());
  });

  it('a second bind after dispose works and does not double up', () => {
    const events = new EventBus();
    const audio = recorder();
    const first = bindAudioEvents(events, audio, ctx);
    first();
    const second = bindAudioEvents(events, audio, ctx);
    events.emit('quest.accepted', {});
    assert.equal(audio.sfx.length, 1);
    second();
  });

  it('gameplay events are not changed by the bridge: listeners only observe', () => {
    const { events } = setup();
    const payload = { type: 'attack', actorId: 'orin', targetId: 'thorn1', damage: 9 };
    events.emit('battle.action_resolved', payload);
    assert.deepEqual(payload, { type: 'attack', actorId: 'orin', targetId: 'thorn1', damage: 9 });
  });
});

describe('Audio event bridge: character progression', () => {
  it('progression events map to exp_gain, level_up, stat_up, and skill_unlock with staggered delays', () => {
    const { events, audio, ids } = setup();
    events.emit('progression.exp_gained', { characterId: 'orin', amount: 12 });
    events.emit('progression.level_up', { characterId: 'orin', prevLevel: 1, newLevel: 2 });
    events.emit('progression.stat_up', { characterId: 'orin', statDeltas: { maxHp: 8 } });
    events.emit('progression.skill_unlock', { characterId: 'orin', skillId: 'minor_heal' });
    assert.deepEqual(ids(), ['exp_gain', 'level_up', 'stat_up', 'skill_unlock']);
    assert.equal(audio.sfx[0].delay, 0);
    assert.equal(audio.sfx[1].delay, 0);
    assert.ok(audio.sfx[2].delay > 0);
    assert.ok(audio.sfx[3].delay > audio.sfx[2].delay);
  });

  it('ignores zero or empty progression payloads', () => {
    const { events, ids } = setup();
    events.emit('progression.exp_gained', { characterId: 'orin', amount: 0 });
    events.emit('progression.skill_unlock', { characterId: 'orin', skills: [] });
    assert.deepEqual(ids(), []);
  });
});

