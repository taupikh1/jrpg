import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterStats } from '../../../src/engine/gameplay/stats/CharacterStats.js';
import { BattleManager } from '../../../src/engine/gameplay/battle/BattleManager.js';
import { migrateSave, sampleV1Save } from '../../../src/engine/persistence/SaveMigrations.js';
import { createEmptySave, SAVE_VERSION } from '../../../src/engine/persistence/SaveSchema.js';
import { SaveManager } from '../../../src/engine/persistence/SaveManager.js';
import { MemoryStorageAdapter } from '../../../src/engine/persistence/MemoryStorageAdapter.js';

const SKILL_FIRE = { id: 'ember', name: 'Bara', mpCost: 4, power: 14, type: 'attack' };
const MIRA_MEND = { id: 'mira_mend', name: 'Jahitan Lembut', mpCost: 6, power: 28, type: 'heal' };
const MIRA_SPARK = { id: 'mira_spark', name: 'Percikan', mpCost: 3, power: 11, type: 'magical' };

function makeOrin() {
  return {
    id: 'orin',
    name: 'Orin',
    side: 'player',
    stats: new CharacterStats({ maxHp: 60, maxMp: 25, attack: 12, defense: 6, speed: 12 }),
    skills: [SKILL_FIRE],
  };
}
function makeMira() {
  return {
    id: 'mira',
    name: 'Mira',
    side: 'player',
    stats: new CharacterStats({ maxHp: 48, maxMp: 32, attack: 9, defense: 5, speed: 14, magicAttack: 14 }),
    skills: [MIRA_MEND, MIRA_SPARK],
  };
}
function makeEnemy(id = 'e1') {
  return {
    id,
    name: 'Thorn',
    side: 'enemy',
    stats: new CharacterStats({ maxHp: 20, attack: 6, defense: 2, speed: 6, maxMp: 0 }),
  };
}

describe('Party battle — two members', () => {
  it('initializes Orin and Mira as independent participants', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const orin = makeOrin();
    const mira = makeMira();
    bm.start([orin, mira], [makeEnemy()]);
    const party = bm.party();
    assert.equal(party.length, 2);
    assert.equal(party[0].id, 'orin');
    assert.equal(party[1].id, 'mira');
    assert.notEqual(party[0].stats, party[1].stats);
  });

  it('keeps HP and MP independent', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const orin = makeOrin();
    const mira = makeMira();
    bm.start([orin, mira], [makeEnemy()]);
    orin.stats.takeDamage(15);
    mira.stats.spendMp(6);
    assert.equal(orin.stats.hp, 45);
    assert.equal(mira.stats.hp, 48);
    assert.equal(orin.stats.mp, 25);
    assert.equal(mira.stats.mp, 26);
  });

  it('orders turns by speed (Mira faster than Orin)', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    bm.start([makeOrin(), makeMira()], [makeEnemy()]);
    // Mira speed 14 > Orin 12 > enemy 6
    assert.equal(bm.turnOrder[0], 'mira');
    assert.equal(bm.turnOrder[1], 'orin');
  });

  it('each character uses their own skills', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const orin = makeOrin();
    const mira = makeMira();
    const enemy = makeEnemy();
    bm.start([orin, mira], [enemy]);
    // Mira's turn first
    assert.equal(bm.currentId, 'mira');
    const healTarget = 'orin';
    orin.stats.hp = 20;
    const r = bm.commandSkill('mira', healTarget, MIRA_MEND);
    assert.equal(r.ok, true);
    assert.equal(orin.stats.hp, 48); // 20 + 28
    assert.equal(mira.stats.mp, 26); // 32 - 6
  });

  it('Orin can use Ember on enemy', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const orin = makeOrin();
    const mira = makeMira();
    const enemy = makeEnemy();
    bm.start([orin, mira], [enemy]);
    // skip mira
    bm.commandDefend('mira');
    assert.equal(bm.currentId, 'orin');
    const before = enemy.stats.hp;
    bm.commandSkill('orin', 'e1', SKILL_FIRE);
    assert.ok(enemy.stats.hp < before);
    assert.equal(orin.stats.mp, 21); // 25 - 4
  });

  it('Mira KO is skipped and recoverable by heal', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const orin = makeOrin();
    const mira = makeMira();
    const enemy = makeEnemy();
    bm.start([orin, mira], [enemy]);
    mira.stats.hp = 0;
    // rebuild order by ending a turn that skips dead
    // Force a fresh turn order check by calling _buildTurnOrder via end of defend on orin after skip
    bm._buildTurnOrder();
    bm.turnIndex = 0;
    // Mira should not be in turn order
    assert.equal(bm.turnOrder.includes('mira'), false);
    assert.equal(bm.turnOrder.includes('orin'), true);
    // Heal recovers her
    mira.stats.heal(20);
    assert.equal(mira.stats.isAlive, true);
    assert.equal(mira.stats.hp, 20);
  });

  it('party victory when all enemies down', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const orin = makeOrin();
    const mira = makeMira();
    const enemy = makeEnemy();
    enemy.stats.hp = 1;
    bm.start([orin, mira], [enemy]);
    // Mira attacks
    bm.commandAttack('mira', 'e1');
    assert.equal(bm.state, 'ended');
    assert.ok(bm.log.some((l) => l.includes('Victory')));
  });

  it('party defeat when both KO', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const orin = makeOrin();
    const mira = makeMira();
    orin.stats.hp = 1;
    mira.stats.hp = 1;
    const enemy = {
      id: 'e1', name: 'Thorn', side: 'enemy',
      stats: new CharacterStats({ maxHp: 20, attack: 100, defense: 2, speed: 6, maxMp: 0 }),
    };
    bm.start([orin, mira], [enemy]);
    // Let enemy act by forcing its turn
    bm.turnIndex = bm.turnOrder.indexOf('e1');
    bm.runEnemyTurn();
    // One down, other still up — not defeat yet
    const alive = bm.party().filter((p) => p.stats.isAlive);
    if (alive.length === 0) {
      assert.equal(bm.state, 'ended');
    } else {
      // finish the other
      alive[0].stats.hp = 0;
      bm._checkEnd();
      assert.equal(bm.state, 'ended');
    }
  });

  it('single-character battle still works (regression)', () => {
    const bm = new BattleManager({ rng: () => 0.5 });
    const orin = makeOrin();
    const enemy = makeEnemy();
    bm.start([orin], [enemy]);
    assert.equal(bm.party().length, 1);
    assert.equal(bm.party()[0].id, 'orin');
    bm.commandAttack('orin', 'e1');
    assert.ok(bm.log.length > 0);
  });
});

describe('Save compatibility — party v3', () => {
  it('v2 migrates to v3 with null mira', () => {
    const v2 = createEmptySave();
    v2.version = 2;
    delete v2.party;
    const r = migrateSave(v2);
    assert.equal(r.ok, true);
    assert.equal(r.data.version, SAVE_VERSION);
    assert.equal(r.data.party.mira, null);
  });

  it('v1 migrates through to current save version with party and progression', () => {
    const r = migrateSave(sampleV1Save());
    assert.equal(r.ok, true);
    assert.equal(r.data.version, SAVE_VERSION);
    assert.ok(r.data.party);
    assert.ok(r.data.progression);
  });

  it('SaveManager round-trips Mira stats without touching Orin', async () => {
    const storage = new MemoryStorageAdapter();
    const sm = new SaveManager({ adapter: storage });
    const orinStats = new CharacterStats({ maxHp: 60, maxMp: 25, attack: 12 });
    orinStats.hp = 40;
    const miraStats = new CharacterStats({ maxHp: 48, maxMp: 32, attack: 9, speed: 14 });
    miraStats.hp = 30;
    miraStats.mp = 20;
    const payload = sm.buildPayload(
      {
        player: { x: 100, y: 100, zoneId: 'village' },
        stats: orinStats,
        inventory: { capacity: 20, slots: [] },
        equipment: { equipped: {} },
        quests: { _state: new Map() },
        gold: 10,
        miraStats,
        worldFlags: { ch1: { ch1_mira_follow: true } },
      },
      'slot1'
    );
    assert.equal(payload.player.stats.hp, 40);
    assert.equal(payload.party.mira.hp, 30);
    assert.equal(payload.party.mira.mp, 20);
    const saved = await sm.save('slot1', payload);
    assert.equal(saved.ok, true);
    const loaded = await sm.load('slot1');
    assert.equal(loaded.ok, true);
    assert.equal(loaded.data.player.stats.hp, 40);
    assert.equal(loaded.data.party.mira.hp, 30);
    assert.equal(loaded.data.party.mira.mp, 20);
    // Orin exploration stats unchanged by Mira
    assert.notEqual(loaded.data.player.stats.hp, loaded.data.party.mira.hp);
  });
});
