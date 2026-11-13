import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_MENU_ITEMS, fieldMenuAt } from '../../src/scenes/field/FieldMenu.js';
import { openChest, innRest } from '../../src/engine/world/FieldInteractions.js';
import { OptionalBgm } from '../../src/engine/audio/OptionalBgm.js';
import { nearestNode } from '../../src/engine/world/OverworldArc1.js';

describe('Remaining FF batches (FF4/FF6/FF7/FF8)', () => {
  it('FF4 field menu has expected items', () => {
    assert.ok(FIELD_MENU_ITEMS.length >= 6);
    assert.equal(fieldMenuAt(0).id, 'item');
    assert.equal(fieldMenuAt(-1).id, FIELD_MENU_ITEMS.at(-1).id);
  });

  it('FF8 chest and inn', () => {
    const c = openChest('chest_forest_1', false);
    assert.equal(c.ok, true);
    assert.ok(c.reward.gold > 0);
    const already = openChest('chest_forest_1', true);
    assert.equal(already.ok, false);

    const party = [{ id: 'orin', stats: { maxHp: 30, maxMp: 10 } }];
    const bad = innRest(party, 10, 5);
    assert.equal(bad.ok, false);
    const good = innRest(party, 10, 20);
    assert.equal(good.ok, true);
    assert.equal(good.goldLeft, 10);
  });

  it('FF7 optional BGM is off by default', () => {
    const bgm = new OptionalBgm();
    assert.equal(bgm.play('field'), false);
    bgm.enabled = true;
    assert.equal(bgm.play('battle'), true);
    assert.equal(bgm.current, 'bgm_battle_opt');
  });

  it('FF6 overworld nearest node', () => {
    const n = nearestNode(100, 150);
    assert.ok(n && n.id);
  });
});
