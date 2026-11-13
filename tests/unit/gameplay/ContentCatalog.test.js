import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS as LEGACY_ITEMS } from '../../../content/gameplay/demo-content.js';
import { ITEMS } from '../../../content/items/arc_01.js';
import { ENEMIES, ENEMY_SLIME, getEnemyDefinition } from '../../../content/enemies/arc_01.js';
import { ItemRegistry } from '../../../src/engine/gameplay/items/ItemRegistry.js';

describe('Arc I content catalogues', () => {
  it('keeps the legacy demo import compatible with the dedicated item catalogue', () => {
    assert.equal(LEGACY_ITEMS, ITEMS);
    assert.equal(ITEMS.length, 11);
    assert.equal(new Set(ITEMS.map((item) => item.id)).size, ITEMS.length);
  });

  it('registers every Arc I item with the production ItemRegistry', () => {
    const registry = new ItemRegistry();
    for (const item of ITEMS) registry.register(item);
    assert.equal(registry.all().length, 11);
    assert.ok(registry.has('herb'));
    assert.ok(registry.has('rusty_sword'));
    assert.ok(registry.has('road_flower'));
  });

  it('exposes the existing thorn sprite through the enemy catalogue', () => {
    assert.equal(ENEMIES.length, 9);
    assert.equal(getEnemyDefinition('thorn_sprite'), ENEMY_SLIME);
    assert.equal(getEnemyDefinition('missing_enemy'), null);
    assert.ok(ENEMY_SLIME.maxHp > 0 && ENEMY_SLIME.attack > 0);
  });
});
