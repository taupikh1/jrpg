import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/EventBus.js';
import { DialogueEngine } from '../../../src/engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { ItemRegistry } from '../../../src/engine/gameplay/items/ItemRegistry.js';
import { Inventory } from '../../../src/engine/gameplay/inventory/Inventory.js';
import { BH_DIALOGUES } from '../../../content/dialogue/npcs/bellhaven_npcs.js';
import { BELLHAVEN_QUESTS } from '../../../content/quests/arc_01/bellhaven_quests.js';
import { ITEMS } from '../../../content/gameplay/demo-content.js';

describe('Bellhaven QA contracts', () => {
  it('herb shopBuy is on choice effects not only node', () => {
    const d = BH_DIALOGUES.find((x) => x.id === 'bh_merchant_herbs');
    const choice = d.nodes.a.choices.find((c) => c.next === 'buy');
    assert.equal(choice.effects.shopBuy.itemId, 'herb');
    assert.equal(choice.effects.shopBuy.cost, 5);
  });

  it('quest buku completes via notify collect+talk', () => {
    const events = new EventBus();
    const q = new QuestLog(events);
    for (const def of BELLHAVEN_QUESTS) q.register(def);
    assert.equal(q.accept('quest_bh_buku_tamu').ok, true);
    q.notify('collect', 'guest_page', 3);
    q.notify('talk', 'character_bren', 1);
    assert.equal(q.getStatus('quest_bh_buku_tamu'), 'completed');
  });

  it('quest indeks and pesan complete correctly', () => {
    const q = new QuestLog(new EventBus());
    for (const def of BELLHAVEN_QUESTS) q.register(def);
    q.accept('quest_bh_indeks');
    q.notify('collect', 'index_shard', 1);
    q.notify('talk', 'character_venn', 1);
    assert.equal(q.getStatus('quest_bh_indeks'), 'completed');
    q.accept('quest_bh_pesan');
    q.notify('talk', 'character_timm', 1);
    assert.equal(q.getStatus('quest_bh_pesan'), 'completed');
  });

  it('inventory supports guest_page and index_shard', () => {
    const reg = new ItemRegistry();
    for (const it of ITEMS) reg.register(it);
    const inv = new Inventory({ registry: reg });
    assert.equal(inv.add('guest_page', 3).ok, true);
    assert.equal(inv.count('guest_page'), 3);
    assert.equal(inv.add('index_shard', 1).ok, true);
  });

  it('merchant choose emits shopBuy effect', () => {
    const eng = new DialogueEngine(new EventBus());
    for (const d of BH_DIALOGUES) eng.register(d);
    eng.start('bh_merchant_herbs');
    const res = eng.choose(0);
    assert.equal(res.effects.shopBuy.cost, 5);
  });
});
