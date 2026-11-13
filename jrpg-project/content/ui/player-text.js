/**
 * Player-facing UI text (Bahasa Indonesia).
 * The engine (BattleManager, Inventory, SaveManager) keeps its English log and reason codes
 * for tests and debugging. Screens translate them here, at display time only.
 */

/** Battle command labels, in the order used by GameplayDemoScene. */
export const BATTLE_COMMANDS = Object.freeze(['Serang', 'Skill', 'Item', 'Bertahan', 'Kabur']);

/** What each battle command does, shown while it is selected. */
export const BATTLE_COMMAND_HELP = Object.freeze([
  'Serang musuh yang dipilih.',
  'Pilih skill serang atau pulih.',
  'Pilih item pertempuran.',
  'Bertahan pada giliran ini.',
  'Coba kabur dari pertarungan.',
]);

export const BATTLE_STATUS_LABELS = Object.freeze({
  poison: 'Racun',
  regen: 'Pemulihan',
  stun: 'Terhenti',
  silence: 'Bisu',
  slow: 'Lamban',
  haste: 'Cepat',
  attack_up: 'Serangan Naik',
  defense_down: 'Pertahanan Turun',
});

export const BATTLE_STATUS_SHORT = Object.freeze({
  poison: 'RAC', regen: 'PUL', stun: 'TER', silence: 'BIS',
  slow: 'LAM', haste: 'CEP', attack_up: 'ATK+', defense_down: 'DEF-',
});

export function battleStatusLabel(id) {
  return BATTLE_STATUS_LABELS[id] ?? String(id ?? 'Status');
}

export function battleAffinityMessage(affinity) {
  switch (affinity) {
    case 'weak': return 'Sangat efektif!';
    case 'resist': return 'Kurang efektif...';
    case 'immune': return 'Tidak berpengaruh!';
    default: return '';
  }
}

export function battlePhaseMessage(name, index) {
  const numericIndex = Number(index);
  const phase = Number.isFinite(numericIndex) && numericIndex >= 0 ? Math.floor(numericIndex) + 1 : 1;
  return `${name || 'Musuh'} memasuki fase ${phase}!`;
}

const LOG_PATTERNS = [
  [/^(.+) attacks (.+) for (\d+)( CRIT)?$/, (m) => `${m[1]} menyerang ${m[2]}: ${m[3]} dmg${m[4] ? ' (KRITIS)' : ''}`],
  [/^(.+) is defeated$/, (m) => `${m[1]} tumbang`],
  [/^(.+) heals (.+) for (\d+)$/, (m) => `${m[1]} memulihkan ${m[2]} +${m[3]} HP`],
  [/^(.+) uses (.+) on (.+) for (\d+)$/, (m) => `${m[1]} memakai ${m[2]} pada ${m[3]}: ${m[4]} dmg`],
  [/^(.+) uses item (.+)$/, (m) => `${m[1]} memakai ${m[2]}`],
  [/^(.+) defends$/, (m) => `${m[1]} bertahan`],
  [/^(.+) is affected by (.+)$/, (m) => `${m[1]} terkena ${battleStatusLabel(m[2])}`],
  [/^(.+) resists (.+)$/, (m) => `${m[1]} menahan efek ${battleStatusLabel(m[2])}`],
  [/^(.+) takes (\d+) from (.+)$/, (m) => `${m[1]} kehilangan ${m[2]} HP akibat ${battleStatusLabel(m[3])}`],
  [/^(.+) recovers (\d+) from (.+)$/, (m) => `${m[1]} memulihkan ${m[2]} HP dari ${battleStatusLabel(m[3])}`],
  [/^(.+) is stunned and loses the turn$/, (m) => `${m[1]} terkena Terhenti dan kehilangan giliran`],
  [/^(.+) enters phase (.+)$/, (m) => { const phase = m[2].match(/^p(\d+)$/i); return `${m[1]} memasuki fase ${phase?.[1] ?? m[2]}`; }],
  [/^Party escaped!$/, () => 'Kelompok berhasil kabur!'],
  [/^Escape failed!$/, () => 'Gagal kabur!'],
  [/^Victory!$/, () => 'Kemenangan!'],
  [/^Defeat\.\.\.$/, () => 'Kekalahan...'],
];

/**
 * Translate one battle log line for display. Unknown lines are returned unchanged.
 * @param {string} line
 */
export function localizeBattleLog(line) {
  const s = String(line ?? '');
  for (const [re, fn] of LOG_PATTERNS) {
    const m = s.match(re);
    if (m) return fn(m);
  }
  return s;
}

/** Toasts shown after actions. Functions take the values they need. */
export const TOAST = Object.freeze({
  saved: 'Permainan tersimpan.',
  saveFailed: (reason) => `Gagal menyimpan: ${reason}`,
  loaded: (zone) => `Permainan dimuat di ${zone}.`,
  loadFailed: (reason) => `Gagal memuat: ${reason}`,
  noSave: 'Belum ada permainan tersimpan.',
  used: (name) => `Memakai ${name}.`,
  equipped: (name) => `Memasang ${name}.`,
  unequippedWeapon: 'Senjata dilepas.',
  unequippedBody: 'Pelindung dilepas.',
  noEquipment: 'Tidak ada perlengkapan terpasang.',
  noBattleItems: 'Tidak ada item pertempuran.',
  noMp: 'MP tidak cukup.',
  skillLocked: 'Skill belum terbuka.',
  levelUp: (name, lv) => `${name} naik ke Level ${lv}!`,
  noActiveQuest: 'Tidak ada quest aktif.',
  entered: (zone) => `Memasuki ${zone}.`,
  menuBlocked: 'Selesaikan dulu percakapan atau aksi ini untuk membuka menu.',
  questDone: 'Quest selesai! Hadiah diterima.',
  inventoryFull: 'Inventaris penuh.',
});

/** Reason codes returned by engine systems → player wording. */
const REASON_TEXT = Object.freeze({
  full: 'Inventaris penuh.',
  partial: 'Inventaris hampir penuh.',
  unknown_item: 'Barang tidak dikenal.',
  invalid_qty: 'Jumlah tidak valid.',
  insufficient: 'Barang tidak cukup.',
  not_usable: 'Barang ini tidak bisa dipakai.',
  not_equipment: 'Barang ini bukan perlengkapan.',
  bad_slot: 'Slot tidak valid.',
  not_owned: 'Barang tidak dimiliki.',
  empty: 'Slot kosong.',
  locked: 'Belum bisa diakses.',
  skill_locked: 'Skill belum terbuka.',
  no_mp: 'MP tidak cukup.',
  invalid_target: 'Target tidak sesuai untuk skill ini.',
  not_found: 'Data tidak ditemukan.',
  invalid: 'Data simpan rusak.',
  busy: 'Penyimpanan sedang berjalan.',
  no_manager: 'Sistem simpan tidak tersedia.',
  silenced: 'Dalam keadaan Bisu, skill tidak bisa digunakan.',
  not_your_turn: 'Belum giliran anggota ini.',
  no_battle_items: 'Tidak ada item pertempuran.',
});

/** Interaction prompts from content → player wording. */
const PROMPT_TEXT = Object.freeze({ Talk: 'Bicara', Read: 'Baca', Interact: 'Interaksi' });

/** @param {string} prompt */
export function localizePrompt(prompt) {
  return PROMPT_TEXT[prompt] ?? 'Interaksi';
}

/** Quest objective text without the static "(0/3)" count that some content embeds. */
export function objectiveLabel(text) {
  return String(text ?? '').replace(/\s*\(\d+\/\d+\)\s*$/, '');
}

/**
 * @param {string} code
 * @returns {string}
 */
export function localizeReason(code) {
  return REASON_TEXT[code] ?? 'Tidak bisa dilakukan sekarang.';
}
