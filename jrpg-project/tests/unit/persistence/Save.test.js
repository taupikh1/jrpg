import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateSave } from '../../../src/engine/persistence/SaveValidator.js';
import { migrateSave, sampleV1Save } from '../../../src/engine/persistence/SaveMigrations.js';
import { createEmptySave, SAVE_VERSION } from '../../../src/engine/persistence/SaveSchema.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';
import { SaveManager } from '../../../src/engine/persistence/SaveManager.js';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { ItemRegistry } from '../../../src/engine/gameplay/items/ItemRegistry.js';
import { Inventory } from '../../../src/engine/gameplay/inventory/Inventory.js';
import { Equipment } from '../../../src/engine/gameplay/equipment/Equipment.js';
import { QuestLog } from '../../../src/engine/gameplay/quests/QuestLog.js';
import { ITEMS, QUEST_COLLECT_WOOD } from '../../../content/gameplay/demo-content.js';

describe('SaveValidator', () => {
  it('accepts empty save', () => {
    const v = validateSave(createEmptySave('s1'));
    assert.equal(v.ok, true);
  });

  it('rejects garbage', () => {
    assert.equal(validateSave(null).ok, false);
    assert.equal(validateSave({}).ok, false);
  });

  it('rejects future version', () => {
    const s = createEmptySave('s1');
    s.version = 999;
    assert.equal(validateSave(s).ok, false);
  });
});

describe('SaveMigrations', () => {
  it('migrates v1 to current', () => {
    const v1 = sampleV1Save('slotA');
    assert.equal(v1.version, 1);
    assert.equal(v1.gold, undefined);
    const r = migrateSave(v1);
    assert.equal(r.ok, true);
    assert.equal(r.data.version, SAVE_VERSION);
    assert.equal(r.data.gold, 0);
    assert.ok(r.data.world.flags);
  });

  it('rejects future version', () => {
    const r = migrateSave({ version: 99, slotId: 'x' });
    assert.equal(r.ok, false);
  });
});

describe('SaveManager + MemoryAdapter', () => {
  it('save load list delete', async () => {
    const adapter = new MemoryStorageAdapter();
    const sm = new SaveManager({ adapter });
    const payload = createEmptySave('slot1');
    payload.player.x = 42;
    payload.gold = 7;
    assert.equal((await sm.save('slot1', payload)).ok, true);
    const loaded = await sm.load('slot1');
    assert.equal(loaded.ok, true);
    assert.equal(loaded.data.player.x, 42);
    assert.equal(loaded.data.gold, 7);
    const list = await sm.list();
    assert.equal(list.slots.length, 1);
    await sm.delete('slot1');
    assert.equal((await sm.load('slot1')).ok, false);
  });

  it('load migrates old save', async () => {
    const adapter = new MemoryStorageAdapter();
    const sm = new SaveManager({ adapter });
    await adapter.put('old', sampleV1Save('old'));
    const loaded = await sm.load('old');
    assert.equal(loaded.ok, true);
    assert.equal(loaded.data.version, SAVE_VERSION);
  });

  it('rejects invalid payload on save', async () => {
    const sm = new SaveManager({ adapter: new MemoryStorageAdapter() });
    const r = await sm.save('s', { version: 2 });
    assert.equal(r.ok, false);
  });

  it('buildPayload from gameplay objects', async () => {
    const registry = new ItemRegistry();
    for (const it of ITEMS) registry.register(it);
    const inv = new Inventory({ registry, capacity: 20 });
    inv.add('herb', 3);
    const stats = new CharacterStats({ maxHp: 60, attack: 12 });
    stats.hp = 40;
    const eq = new Equipment({ inventory: inv, stats, registry });
    inv.add('rusty_sword', 1);
    eq.equip('rusty_sword');
    const quests = new QuestLog();
    quests.register(QUEST_COLLECT_WOOD);
    quests.accept('collect_wood');
    quests.notify('collect', 'wood_scrap', 2);

    const sm = new SaveManager({ adapter: new MemoryStorageAdapter() });
    const payload = sm.buildPayload(
      {
        player: { x: 100, y: 50, facing: 'left', zoneId: 'forest' },
        stats,
        inventory: inv,
        equipment: eq,
        quests,
        zoneId: 'forest',
        gold: 15,
      },
      'slot2'
    );
    assert.equal(payload.player.x, 100);
    assert.equal(payload.player.stats.hp, 40);
    assert.equal(payload.inventory.slots.some((s) => s.itemId === 'herb'), true);
    assert.equal(payload.equipment.weapon, 'rusty_sword');
    assert.equal(payload.quests.states.collect_wood.progress.get_wood, 2);
    assert.equal(payload.gold, 15);

    await sm.save('slot2', payload);
    const loaded = await sm.load('slot2');
    assert.equal(loaded.data.equipment.weapon, 'rusty_sword');
    assert.equal(loaded.data.quests.states.collect_wood.status, 'active');
  });

  it('round-trips boss defeat flags through the flexible save-v6 world flag map', async () => {
    const sm = new SaveManager({ adapter: new MemoryStorageAdapter() });
    const payload = sm.buildPayload({
      worldFlags: {
        ch5: { ch5_boss_warden_of_first_resonance_defeated: true },
        bosses: {
          ch5_boss_warden_of_first_resonance_defeated: true,
          ch29_boss_vaelor_senn_resonant_form_defeated: true,
        },
      },
    }, 'boss-flags');
    assert.equal(payload.version, 6);
    assert.equal((await sm.save('boss-flags', payload)).ok, true);
    const loaded = await sm.load('boss-flags');
    assert.equal(loaded.ok, true);
    assert.equal(loaded.data.world.flags.ch5.ch5_boss_warden_of_first_resonance_defeated, true);
    assert.equal(loaded.data.world.flags.bosses.ch5_boss_warden_of_first_resonance_defeated, true);
    assert.equal(loaded.data.world.flags.bosses.ch29_boss_vaelor_senn_resonant_form_defeated, true);
  });

  it('round-trips Kael battle stats and roster state in save v6', async () => {
    const adapter = new MemoryStorageAdapter();
    const sm = new SaveManager({ adapter });
    const registry = new ItemRegistry();
    for (const it of ITEMS) registry.register(it);
    const inv = new Inventory({ registry, capacity: 20 });
    const stats = new CharacterStats({ maxHp: 60, attack: 12 });
    const kaelStats = new CharacterStats({ maxHp: 72, maxMp: 18, attack: 13, defense: 11, speed: 8 });
    kaelStats.hp = 41;
    kaelStats.mp = 7;
    const payload = sm.buildPayload({
      player: { x: 10, y: 20, zoneId: 'village' },
      stats,
      inventory: inv,
      equipment: new Equipment({ inventory: inv, stats, registry }),
      quests: new QuestLog(),
      kaelStats,
      worldFlags: { ch6: { ch6_kael_joined: true } },
    }, 'kael-slot');
    assert.equal(payload.version, SAVE_VERSION);
    assert.equal(payload.party.kael.hp, 41);
    assert.equal(payload.party.kael.mp, 7);
    assert.equal(payload.party.roster.recruited.kael, true);
    assert.deepEqual(payload.party.roster.active, ['orin', 'kael']);
    assert.equal(payload.world.flags.ch6.ch6_kael_joined, true);
    assert.equal((await sm.save('kael-slot', payload)).ok, true);
    const loaded = await sm.load('kael-slot');
    assert.equal(loaded.ok, true);
    assert.equal(loaded.data.party.kael.hp, 41);
    assert.equal(loaded.data.party.roster.recruited.kael, true);
    assert.deepEqual(loaded.data.party.roster.active, ['orin', 'kael']);
    assert.equal(loaded.data.world.flags.ch6.ch6_kael_joined, true);
  });

  it('migrates v3 save through v4-v6 with valid progression and roster defaults', () => {
    const v3 = createEmptySave('v3slot');
    v3.version = 3;
    delete v3.progression;
    const r = migrateSave(v3);
    assert.equal(r.ok, true);
    assert.equal(r.data.version, SAVE_VERSION);
    assert.equal(r.data.progression.orin.level, 1);
    assert.equal(r.data.progression.orin.exp, 0);
    assert.deepEqual(r.data.progression.orin.unlockedSkills, ['ember']);
    assert.equal(r.data.progression.mira.level, 1);
    assert.deepEqual(r.data.progression.mira.unlockedSkills, ['mira_mend', 'mira_spark']);
    assert.equal(r.data.progression.kael.level, 1);
    assert.deepEqual(r.data.progression.kael.unlockedSkills, ['kael_guard']);
    assert.equal(r.data.party.roster.recruited.orin, true);
    assert.equal(r.data.party.roster.recruited.mira, false);
    assert.equal(r.data.party.roster.recruited.kael, false);
    assert.equal(r.data.progression.iven.level, 1);
    assert.deepEqual(r.data.progression.iven.unlockedSkills, ['iven_quick_cut']);
    assert.equal(r.data.progression.tavi.level, 1);
    assert.deepEqual(r.data.progression.tavi.unlockedSkills, ['tavi_spark_trap']);
    assert.equal(r.data.party.roster.recruited.iven, false);
    assert.equal(r.data.party.roster.recruited.tavi, false);
    assert.deepEqual(r.data.party.roster.active, ['orin']);
  });

  it('migrates v4 roster flags and queues Kael recruitment for completed Chapter 5 saves', () => {
    const v4 = createEmptySave('v4slot');
    v4.version = 4;
    v4.world.flags = { ch1: { ch1_mira_follow: true }, ch5: { ch5_completed: true }, ch6: {}, meta: { dialogueDone: { ch5_banter_departure: true } } };
    v4.progression.kael = { level: 4, exp: 0, unlockedSkills: [] };
    const r = migrateSave(v4);
    assert.equal(r.ok, true);
    assert.equal(r.data.version, SAVE_VERSION);
    assert.deepEqual(r.data.party.roster.active, ['orin', 'mira']);
    assert.equal(r.data.party.roster.recruited.mira, true);
    assert.equal(r.data.world.flags.ch6.ch6_kael_recruitment_pending, true);
    assert.deepEqual(r.data.progression.kael.unlockedSkills, ['kael_guard', 'kael_shield_bash', 'kael_taunt']);
  });

  it('migrates v5 saves to v6 while preserving old state and adding Arc II roster data', () => {
    const v5 = createEmptySave('v5-arc2-slot');
    v5.version = 5;
    v5.player.x = 73;
    v5.gold = 91;
    v5.world.flags = {
      ch1: { ch1_mira_follow: true },
      ch6: { ch6_kael_joined: true },
      ch7: { ch7_iven_joined: true },
      ch8: { ch8_tavi_joined: true },
    };
    v5.progression.iven = undefined;
    v5.progression.tavi = undefined;
    delete v5.party.roster.recruited.iven;
    delete v5.party.roster.recruited.tavi;
    delete v5.party.roster.departed.iven;
    delete v5.party.roster.departed.tavi;
    delete v5.party.roster.memberStats;

    const migrated = migrateSave(v5);
    assert.equal(migrated.ok, true);
    assert.equal(migrated.data.version, 6);
    assert.equal(migrated.data.player.x, 73);
    assert.equal(migrated.data.gold, 91);
    assert.equal(migrated.data.party.roster.recruited.iven, true);
    assert.equal(migrated.data.party.roster.recruited.tavi, true);
    assert.equal(migrated.data.party.roster.departed.iven, false);
    assert.equal(migrated.data.party.roster.departed.tavi, false);
    assert.deepEqual(migrated.data.party.roster.active, ['orin', 'mira', 'kael', 'tavi']);
    assert.deepEqual(migrated.data.party.roster.memberStats, { iven: null, tavi: null });
    assert.deepEqual(migrated.data.progression.iven.unlockedSkills, ['iven_quick_cut']);
    assert.deepEqual(migrated.data.progression.tavi.unlockedSkills, ['tavi_spark_trap']);
  });

  it('round-trips Iven and Tavi HP/MP and their join/departure roster metadata in save v6', async () => {
    const adapter = new MemoryStorageAdapter();
    const sm = new SaveManager({ adapter });
    const registry = new ItemRegistry();
    for (const it of ITEMS) registry.register(it);
    const inv = new Inventory({ registry, capacity: 20 });
    const stats = new CharacterStats({ maxHp: 60, attack: 12 });
    const roster = {
      recruited: { orin: true, mira: true, kael: true, iven: true, tavi: true },
      departed: { orin: false, mira: false, kael: false, iven: false, tavi: false },
      active: ['orin', 'mira', 'kael', 'iven'],
      memberStats: { iven: { hp: 27, mp: 9 }, tavi: { hp: 33, mp: 14 } },
    };
    const payload = sm.buildPayload({
      player: { x: 10, y: 20, zoneId: 'village' },
      stats,
      inventory: inv,
      equipment: new Equipment({ inventory: inv, stats, registry }),
      quests: new QuestLog(),
      worldFlags: {
        ch7: { ch7_iven_joined: true },
        ch8: { ch8_tavi_joined: true, ch8_tavi_departed: false },
      },
      partyRoster: roster,
    }, 'arc2-slot');
    assert.equal(payload.version, SAVE_VERSION);
    assert.equal((await sm.save('arc2-slot', payload)).ok, true);
    const loaded = await sm.load('arc2-slot');
    assert.equal(loaded.ok, true);
    assert.deepEqual(loaded.data.party.roster.memberStats, roster.memberStats);
    assert.equal(loaded.data.party.roster.recruited.iven, true);
    assert.equal(loaded.data.party.roster.recruited.tavi, true);
    assert.equal(loaded.data.world.flags.ch7.ch7_iven_joined, true);
    assert.equal(loaded.data.world.flags.ch8.ch8_tavi_joined, true);
    assert.deepEqual(loaded.data.party.roster.active, ['orin', 'mira', 'kael', 'iven']);
  });

  it('migrates v4 Chapter 5 saves with unfinished departure banter before recruitment', () => {
    const v4 = createEmptySave('v4-banter-slot');
    v4.version = 4;
    v4.world.flags = { ch5: { ch5_completed: true }, ch6: {}, meta: { dialogueDone: {} } };
    const r = migrateSave(v4);
    assert.equal(r.ok, true);
    assert.equal(r.data.world.flags.ch6.ch6_kael_departure_banter_pending, true);
    assert.equal(r.data.world.flags.ch6.ch6_kael_recruitment_pending, undefined);
  });

});
