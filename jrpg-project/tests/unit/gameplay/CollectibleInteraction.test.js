import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Entity } from '../../../src/engine/entities/Entity.js';
import { EntityManager } from '../../../src/engine/entities/EntityManager.js';
import { InteractionSystem } from '../../../src/engine/entities/systems/InteractionSystem.js';
import { InteractionComponent } from '../../../src/engine/entities/components/InteractionComponent.js';
import { Inventory } from '../../../src/engine/gameplay/inventory/Inventory.js';
import { ItemRegistry } from '../../../src/engine/gameplay/items/ItemRegistry.js';
import { ITEMS } from '../../../content/items/arc_01.js';
import { makeScene } from './sceneHarness.js';

function inventory(capacity = 20) {
  const registry = new ItemRegistry();
  for (const item of ITEMS) registry.register(item);
  return new Inventory({ registry, capacity });
}

describe('one-shot collectible interactions', () => {
  it('keeps a one-shot interaction available when its callback rejects it', () => {
    let attempts = 0;
    const item = new Entity({ id: 'test_item', x: 10, y: 10 });
    const player = new Entity({ id: 'player', x: 10, y: 10 });
    item.add('interaction', new InteractionComponent({
      range: 18,
      oneShot: true,
      onInteract: () => { attempts += 1; return false; },
    }));
    const system = new InteractionSystem(new EntityManager());
    system.manager.add(item);
    assert.equal(system.tryInteract(player), false);
    assert.equal(item.get('interaction').used, false);
    assert.equal(system.tryInteract(player), false);
    assert.equal(attempts, 2);
  });

  it('consumes a one-shot interaction after a successful callback', () => {
    let attempts = 0;
    const item = new Entity({ id: 'test_item', x: 10, y: 10 });
    const player = new Entity({ id: 'player', x: 10, y: 10 });
    item.add('interaction', new InteractionComponent({
      range: 18,
      oneShot: true,
      onInteract: () => { attempts += 1; return true; },
    }));
    const system = new InteractionSystem(new EntityManager());
    system.manager.add(item);
    assert.equal(system.tryInteract(player), true);
    assert.equal(system.tryInteract(player), false);
    assert.equal(attempts, 1);
  });

  it('ch2_note_0 can be retried after inventory space becomes available, then cannot be collected twice', () => {
    const { scene } = makeScene();
    scene._spawnNpc = () => {};
    scene.entities = new EntityManager();
    scene.inventory = inventory(0);
    scene._spawnChapter2Forest();

    const note = scene.entities.get('ch2_note_0');
    assert.ok(note, 'the moved note must spawn in the forest');
    const player = new Entity({ id: 'player', x: 100, y: 120 });
    const interactions = new InteractionSystem(scene.entities);

    assert.equal(interactions.tryInteract(player), false);
    assert.equal(note.get('interaction').used, false);
    assert.equal(scene.inventory.count('ch2_elara_note'), 0);
    assert.match(scene._toasts.at(-1), /Inventaris penuh/);

    scene.inventory.capacity = 1;
    assert.equal(interactions.tryInteract(player), true);
    assert.equal(note.get('interaction').used, true);
    assert.equal(scene.inventory.count('ch2_elara_note'), 1);
    assert.equal(interactions.tryInteract(player), false);
    assert.equal(scene.inventory.count('ch2_elara_note'), 1);
  });
});
