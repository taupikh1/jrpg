import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { localizeBattleLog, localizeReason, localizePrompt, objectiveLabel, TOAST, BATTLE_COMMANDS, BATTLE_STATUS_LABELS, BATTLE_STATUS_SHORT, battleStatusLabel, battleAffinityMessage, battlePhaseMessage } from '../../../content/ui/player-text.js';

describe('localizeBattleLog', () => {
  it('translates every message BattleManager writes', () => {
    assert.equal(localizeBattleLog('Hero attacks Slime for 5'), 'Hero menyerang Slime: 5 dmg');
    assert.equal(localizeBattleLog('Hero attacks Slime for 9 CRIT'), 'Hero menyerang Slime: 9 dmg (KRITIS)');
    assert.equal(localizeBattleLog('Slime is defeated'), 'Slime tumbang');
    assert.equal(localizeBattleLog('Hero heals Mira for 12'), 'Hero memulihkan Mira +12 HP');
    assert.equal(localizeBattleLog('Hero uses Heal on Slime for 7'), 'Hero memakai Heal pada Slime: 7 dmg');
    assert.equal(localizeBattleLog('hero uses item herb'), 'hero memakai herb');
    assert.equal(localizeBattleLog('Hero defends'), 'Hero bertahan');
    assert.equal(localizeBattleLog('Orin is affected by poison'), 'Orin terkena Racun');
    assert.equal(localizeBattleLog('Orin takes 4 from poison'), 'Orin kehilangan 4 HP akibat Racun');
    assert.equal(localizeBattleLog('Mira recovers 3 from regen'), 'Mira memulihkan 3 HP dari Pemulihan');
    assert.equal(localizeBattleLog('Orin is stunned and loses the turn'), 'Orin terkena Terhenti dan kehilangan giliran');
    assert.equal(localizeBattleLog('Penjaga enters phase p2'), 'Penjaga memasuki fase 2');
    assert.equal(localizeBattleLog('Orin resists poison'), 'Orin menahan efek Racun');
    assert.equal(localizeBattleLog('Party escaped!'), 'Kelompok berhasil kabur!');
    assert.equal(localizeBattleLog('Escape failed!'), 'Gagal kabur!');
    assert.equal(localizeBattleLog('Victory!'), 'Kemenangan!');
    assert.equal(localizeBattleLog('Defeat...'), 'Kekalahan...');
  });

  it('leaves unknown lines unchanged rather than dropping them', () => {
    assert.equal(localizeBattleLog('something new'), 'something new');
  });

  it('does not change the engine log: localisation is for display only', () => {
    const engineLine = 'Victory!';
    localizeBattleLog(engineLine);
    assert.equal(engineLine, 'Victory!');
  });
});

describe('player-facing wording', () => {
  it('battle commands are Indonesian', () => {
    assert.deepEqual([...BATTLE_COMMANDS], ['Serang', 'Skill', 'Item', 'Bertahan', 'Kabur']);
  });

  it('battle status, affinity and phase feedback are localized', () => {
    assert.equal(battleStatusLabel('poison'), 'Racun');
    assert.equal(battleStatusLabel('unknown_status'), 'unknown_status');
    assert.equal(BATTLE_STATUS_LABELS.poison, 'Racun');
    assert.equal(BATTLE_STATUS_SHORT.poison, 'RAC');
    assert.equal(battleAffinityMessage('weak'), 'Sangat efektif!');
    assert.equal(battleAffinityMessage('resist'), 'Kurang efektif...');
    assert.equal(battleAffinityMessage('immune'), 'Tidak berpengaruh!');
    assert.equal(battleAffinityMessage('neutral'), '');
    assert.equal(battlePhaseMessage('Penjaga', 1), 'Penjaga memasuki fase 2!');
    assert.equal(battlePhaseMessage('Penjaga', undefined), 'Penjaga memasuki fase 1!');
  });

  it('reason codes map to Indonesian sentences', () => {
    assert.equal(localizeReason('full'), 'Inventaris penuh.');
    assert.equal(localizeReason('not_found'), 'Data tidak ditemukan.');
    assert.equal(localizeReason('silenced'), 'Dalam keadaan Bisu, skill tidak bisa digunakan.');
    assert.equal(localizeReason('something_unknown'), 'Tidak bisa dilakukan sekarang.');
  });

  it('toasts are Indonesian and carry the values they need', () => {
    assert.equal(TOAST.saved, 'Permainan tersimpan.');
    assert.equal(TOAST.loaded('Desa Ashwillow'), 'Permainan dimuat di Desa Ashwillow.');
    assert.equal(TOAST.used('Herb Hutan'), 'Memakai Herb Hutan.');
    assert.equal(TOAST.entered('Hutan'), 'Memasuki Hutan.');
    assert.match(TOAST.saveFailed(localizeReason('busy')), /^Gagal menyimpan: /);
  });

  it('interaction prompts are Indonesian', () => {
    assert.equal(localizePrompt('Talk'), 'Bicara');
    assert.equal(localizePrompt('Read'), 'Baca');
    assert.equal(localizePrompt('Interact'), 'Interaksi');
    assert.equal(localizePrompt('Something'), 'Interaksi');
  });

  it('objective labels drop the static count embedded in content', () => {
    assert.equal(objectiveLabel('Kumpulkan Kayu Bersih (0/3)'), 'Kumpulkan Kayu Bersih');
    assert.equal(objectiveLabel('Kembalikan kayu kepada Jarek'), 'Kembalikan kayu kepada Jarek');
  });
});
