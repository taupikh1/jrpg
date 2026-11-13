import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES as ARC_01, getEnemyDefinition } from '../../../content/enemies/arc_01.js';
import { ENEMIES_ARC_02, getArcTwoEnemyDefinition } from '../../../content/enemies/arc_02.js';
import { ENEMIES_ARC_03 } from '../../../content/enemies/arc_03.js';
import { ENEMIES_ARC_04 } from '../../../content/enemies/arc_04.js';
import { ENEMIES_ARC_05 } from '../../../content/enemies/arc_05.js';
import { ENEMIES_ARC_06 } from '../../../content/enemies/arc_06.js';
import { ENEMY_CATALOG, getEnemyById } from '../../../content/enemies/index.js';
import { ELEMENT_IDS } from '../../../content/combat/elements.js';
import { STATUS_EFFECTS } from '../../../content/combat/status_effects.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { createEnemyParticipant } from '../../../src/engine/gameplay/battle/createEnemyParticipant.js';

const player = () => ({
  id: 'orin', name: 'Orin', side: 'player',
  stats: new CharacterStats({ maxHp: 500, maxMp: 30, attack: 2, defense: 100, magicAttack: 2, magicDefense: 100, speed: 1 }),
});

function makeParticipant(definition) {
  return createEnemyParticipant(definition, { id: `test_${definition.id}` });
}

describe('B19 enemy catalogue', () => {
  it('contains 8–10 canon-grounded entries in each of six arcs with stable unique IDs', () => {
    const arcs = [ARC_01, ENEMIES_ARC_02, ENEMIES_ARC_03, ENEMIES_ARC_04, ENEMIES_ARC_05, ENEMIES_ARC_06];
    assert.deepEqual(arcs.map((entries) => entries.length), [9, 9, 8, 8, 8, 8]);
    assert.equal(ENEMY_CATALOG.length, 50);
    assert.equal(new Set(ENEMY_CATALOG.map((enemy) => enemy.id)).size, 50);
    assert.equal(getEnemyDefinition('thorn_sprite'), ARC_01[0]);
    assert.equal(getArcTwoEnemyDefinition('ash_crown_hound'), ENEMIES_ARC_02[0]);
    assert.equal(getEnemyById('stillness_harrier'), ENEMIES_ARC_02.at(-1));
    assert.equal(getEnemyById('dawn_reclaimer'), ENEMIES_ARC_06.at(-1));
    assert.equal(getEnemyById('unknown_enemy'), null);
  });

  it('every entry has complete combat, ecology, affinity and AI data', () => {
    for (const enemy of ENEMY_CATALOG) {
      assert.ok(enemy.name && enemy.description && enemy.habitat, enemy.id);
      assert.ok(enemy.regionId && enemy.category, enemy.id);
      for (const key of ['maxHp', 'attack', 'defense', 'magicAttack', 'magicDefense', 'speed', 'exp', 'gold']) {
        assert.ok(Number.isFinite(enemy[key]) && enemy[key] >= 0, `${enemy.id}.${key}`);
      }
      assert.ok(enemy.maxHp > 0, enemy.id);
      assert.ok(enemy.ai.style && enemy.ai.actions.length > 0, enemy.id);
      for (const [element, affinity] of Object.entries(enemy.affinities)) {
        assert.ok(ELEMENT_IDS.includes(element), `${enemy.id}: ${element}`);
        assert.ok(['weak', 'resist', 'immune', 'neutral'].includes(affinity), `${enemy.id}: ${affinity}`);
      }
      for (const action of enemy.ai.actions) {
        assert.ok(['physical', 'magical'].includes(action.type), `${enemy.id}/${action.id}`);
        assert.ok(action.power > 0, `${enemy.id}/${action.id}`);
        if (action.element) assert.ok(ELEMENT_IDS.includes(action.element), `${enemy.id}/${action.id}`);
        if (action.effect) assert.ok(STATUS_EFFECTS[action.effect.id], `${enemy.id}/${action.id}`);
      }
    }
  });

  it('every catalogue enemy executes an AI action in a real BattleManager encounter', () => {
    for (const definition of ENEMY_CATALOG) {
      const events = [];
      const battle = new BattleManager({
        events: { emit: (name, payload) => events.push({ name, payload }) },
        rng: () => 0.99,
        statusDefs: STATUS_EFFECTS,
      });
      const enemy = makeParticipant(definition);
      battle.start([player()], [enemy]);
      assert.equal(battle.current.side, 'enemy', `${definition.id}: expected enemy to act first`);
      battle.runEnemyTurn();
      const actionEvent = events.find((event) => event.name === 'battle.action_resolved');
      assert.ok(actionEvent, `${definition.id}: no action event emitted`);
      assert.equal(actionEvent.payload.type, 'enemy_action', `${definition.id}: wrong action event type`);
      assert.equal(actionEvent.payload.actorId, enemy.id);
      assert.ok(battle.participants.find((participant) => participant.id === 'orin').stats.hp < 500, `${definition.id}: action dealt no damage`);
    }
  });

  it('rejects a missing enemy definition instead of creating a malformed participant', () => {
    assert.throws(() => createEnemyParticipant(null), /Enemy definition/);
  });

  it('cycles regular enemy AI actions deterministically instead of falling back to a basic attack', () => {
    const definition = ENEMIES_ARC_02.find((enemy) => enemy.ai.actions.length > 1);
    const events = [];
    const battle = new BattleManager({ events: { emit: (name, payload) => events.push({ name, payload }) }, rng: () => 0.99, statusDefs: STATUS_EFFECTS });
    battle.start([player()], [makeParticipant(definition)]);
    const actionIds = [];
    for (let i = 0; i < 4 && battle.state === 'active'; i++) {
      if (battle.current.side === 'enemy') {
        battle.runEnemyTurn();
        const action = events.filter((event) => event.name === 'battle.action_resolved').at(-1);
        if (action) actionIds.push(action.payload.action);
      } else battle.commandDefend('orin');
    }
    assert.ok(actionIds.length >= 2);
    assert.notEqual(actionIds[0], actionIds[1]);
  });
});
