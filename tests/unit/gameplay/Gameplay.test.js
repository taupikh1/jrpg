import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { ItemRegistry } from '../../../src/engine/gameplay/items/ItemRegistry.js';
import { Inventory } from '../../../src/engine/gameplay/inventory/Inventory.js';
import { Equipment } from '../../../src/engine/gameplay/equipment/Equipment.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { DamageCalculator } from '../../../src/engine/gameplay/battle/DamageCalculator.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { EventBus } from '../../../src/core/EventBus.js';
import { ITEMS, DIALOGUE_GUARD, QUEST_COLLECT_WOOD } from '../../../content/gameplay/demo-content.js';

function setupItems() {
  const registry = new ItemRegistry();
  for (const it of ITEMS) registry.register(it);
  return registry;
}

describe('CharacterStats', () => {
  it('applies and removes modifiers', () => {
    const s = new CharacterStats({ attack: 10 });
    assert.equal(s.attack, 10);
    s.addModifier('eq', { attack: 5 });
    assert.equal(s.attack, 15);
    s.removeModifier('eq');
    assert.equal(s.attack, 10);
  });

  it('damage and heal clamp', () => {
    const s = new CharacterStats({ maxHp: 50 });
    s.takeDamage(60);
    assert.equal(s.hp, 0);
    assert.equal(s.isAlive, false);
    s.heal(10);
    assert.equal(s.hp, 10);
  });
});

describe('Inventory', () => {
  it('add stack and capacity', () => {
    const inv = new Inventory({ registry: setupItems(), capacity: 2 });
    assert.equal(inv.add('herb', 5).ok, true);
    assert.equal(inv.count('herb'), 5);
    assert.equal(inv.add('wood_scrap', 1).ok, true);
    assert.equal(inv.add('ether_drop', 1).ok, false); // full
  });

  it('remove and use consumable', () => {
    const inv = new Inventory({ registry: setupItems(), capacity: 10 });
    const stats = new CharacterStats({ maxHp: 50 });
    stats.hp = 10;
    inv.add('herb', 2);
    const r = inv.use('herb', stats);
    assert.equal(r.ok, true);
    assert.equal(stats.hp, 35);
    assert.equal(inv.count('herb'), 1);
  });
});

describe('Equipment', () => {
  it('equip applies stats and unequip restores', () => {
    const registry = setupItems();
    const inv = new Inventory({ registry, capacity: 10 });
    const stats = new CharacterStats({ attack: 10, defense: 5 });
    const eq = new Equipment({ inventory: inv, stats, registry });
    inv.add('rusty_sword', 1);
    const r = eq.equip('rusty_sword');
    assert.equal(r.ok, true);
    assert.equal(stats.attack, 15);
    assert.equal(inv.count('rusty_sword'), 0);
    eq.unequip('weapon');
    assert.equal(stats.attack, 10);
    assert.equal(inv.count('rusty_sword'), 1);
  });

  it('rejects non-owned', () => {
    const registry = setupItems();
    const inv = new Inventory({ registry, capacity: 10 });
    const stats = new CharacterStats();
    const eq = new Equipment({ inventory: inv, stats, registry });
    assert.equal(eq.equip('rusty_sword').ok, false);
  });
});

describe('DialogueEngine', () => {
  it('starts advances and chooses', () => {
    const bus = new EventBus();
    const d = new DialogueEngine(bus);
    d.register(DIALOGUE_GUARD);
    d.start('village_guard_intro');
    assert.ok(d.currentNode().choices);
    const r = d.choose(0);
    assert.equal(r.ok, true);
    assert.ok(d.isActive);
    d.advance(); // may advance or end depending on nodes
  });

  it('rejects unknown dialogue', () => {
    const d = new DialogueEngine();
    assert.throws(() => d.start('nope'), /Unknown/);
  });
});

describe('QuestLog', () => {
  it('accept and progress via notify', () => {
    const bus = new EventBus();
    let completed = false;
    bus.on('quest.completed', () => {
      completed = true;
    });
    const q = new QuestLog(bus);
    q.register(QUEST_COLLECT_WOOD);
    assert.equal(q.accept('collect_wood').ok, true);
    q.notify('collect', 'wood_scrap', 2);
    assert.equal(q.getProgress('collect_wood').objectives[0].current, 2);
    q.notify('collect', 'wood_scrap', 1);
    assert.equal(q.getStatus('collect_wood'), 'completed');
    assert.equal(completed, true);
  });
});

describe('DamageCalculator', () => {
  it('physical never below 1', () => {
    const a = new CharacterStats({ attack: 1 });
    const d = new CharacterStats({ defense: 100 });
    const r = DamageCalculator.physical(a, d, { rng: () => 1 });
    assert.ok(r.damage >= 1);
  });
});

describe('BattleManager', () => {
  it('turn order by speed and attack to victory', () => {
    const bus = new EventBus();
    const inv = new Inventory({ registry: setupItems(), capacity: 10 });
    inv.add('herb', 3);
    const bm = new BattleManager({ events: bus, inventory: inv, rng: () => 0.9 });
    const hero = {
      id: 'h',
      name: 'Hero',
      side: 'player',
      stats: new CharacterStats({ maxHp: 50, attack: 20, defense: 5, speed: 15, maxMp: 20 }),
    };
    const foe = {
      id: 'e',
      name: 'Foe',
      side: 'enemy',
      stats: new CharacterStats({ maxHp: 20, attack: 5, defense: 0, speed: 5 }),
    };
    bm.start([hero], [foe], { gold: 1 });
    assert.equal(bm.currentId, 'h'); // faster
    // attack until victory
    let guard = 0;
    while (bm.state === 'active' && guard++ < 20) {
      if (bm.current?.side === 'player') bm.commandAttack('h', 'e');
      else bm.runEnemyTurn();
    }
    assert.equal(bm.state, 'ended');
    assert.ok(bm.log.some((l) => l.includes('Victory')));
  });

  it('defend reduces damage', () => {
    const bm = new BattleManager({ rng: () => 1 });
    const hero = {
      id: 'h',
      name: 'H',
      side: 'player',
      stats: new CharacterStats({ maxHp: 100, attack: 5, defense: 0, speed: 20 }),
    };
    const foe = {
      id: 'e',
      name: 'E',
      side: 'enemy',
      stats: new CharacterStats({ maxHp: 100, attack: 20, defense: 0, speed: 1 }),
    };
    bm.start([hero], [foe]);
    bm.commandDefend('h');
    // enemy turn
    if (bm.current?.side === 'enemy') bm.runEnemyTurn();
    // hero should have taken reduced damage
    assert.ok(hero.stats.hp > 100 - 20); // less than full unmitigated hit
  });

  it('item use consumes inventory', () => {
    const inv = new Inventory({ registry: setupItems(), capacity: 10 });
    inv.add('herb', 1);
    const bm = new BattleManager({ inventory: inv, rng: () => 1 });
    const hero = {
      id: 'h',
      name: 'H',
      side: 'player',
      stats: new CharacterStats({ maxHp: 50, speed: 20 }),
    };
    hero.stats.hp = 10;
    const foe = {
      id: 'e',
      name: 'E',
      side: 'enemy',
      stats: new CharacterStats({ maxHp: 5, speed: 1 }),
    };
    bm.start([hero], [foe]);
    const r = bm.commandItem('h', 'herb', 'h');
    assert.equal(r.ok, true);
    assert.equal(inv.count('herb'), 0);
    assert.ok(hero.stats.hp > 10);
  });
});
