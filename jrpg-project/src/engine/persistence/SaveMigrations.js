import { SAVE_VERSION, createEmptySave } from './SaveSchema.js';

/**
 * Sequential migrations. Each fn receives previous payload and returns next version.
 * v1 → v2: add gold, world.flags if missing.
 */
const MIGRATIONS = {
  1: (data) => {
    const next = { ...data, version: 2 };
    if (typeof next.gold !== 'number') next.gold = 0;
    if (!next.world) next.world = { flags: {} };
    if (!next.world.flags) next.world.flags = {};
    if (!next.player.facing) next.player = { ...next.player, facing: 'down' };
    return next;
  },
  2: (data) => {
    const next = { ...data, version: 3 };
    if (!next.party) next.party = { mira: null, kael: null };
    else if (!Object.prototype.hasOwnProperty.call(next.party, 'kael')) next.party = { ...next.party, kael: null };
    return next;
  },
  3: (data) => {
    const next = { ...data, version: 4 };
    const existing = next.progression && typeof next.progression === 'object' ? next.progression : {};
    next.progression = {
      orin: existing.orin && typeof existing.orin === 'object'
        ? {
            level: Math.max(1, Math.floor(Number(existing.orin.level) || 1)),
            exp: Math.max(0, Math.floor(Number(existing.orin.exp) || 0)),
            unlockedSkills: Array.isArray(existing.orin.unlockedSkills) ? [...existing.orin.unlockedSkills] : ['ember'],
          }
        : { level: 1, exp: 0, unlockedSkills: ['ember'] },
      mira: existing.mira && typeof existing.mira === 'object'
        ? {
            level: Math.max(1, Math.floor(Number(existing.mira.level) || 1)),
            exp: Math.max(0, Math.floor(Number(existing.mira.exp) || 0)),
            unlockedSkills: Array.isArray(existing.mira.unlockedSkills) ? [...existing.mira.unlockedSkills] : ['mira_mend', 'mira_spark'],
          }
        : { level: 1, exp: 0, unlockedSkills: ['mira_mend', 'mira_spark'] },
      kael: existing.kael && typeof existing.kael === 'object'
        ? {
            level: Math.max(1, Math.floor(Number(existing.kael.level) || 1)),
            exp: Math.max(0, Math.floor(Number(existing.kael.exp) || 0)),
            unlockedSkills: Array.isArray(existing.kael.unlockedSkills) ? [...existing.kael.unlockedSkills] : ['kael_guard'],
          }
        : { level: 1, exp: 0, unlockedSkills: ['kael_guard'] },
    };
    return next;
  },
  4: (data) => {
    const next = { ...data, version: 5 };
    const world = next.world && typeof next.world === 'object' ? next.world : { flags: {} };
    const flags = world.flags && typeof world.flags === 'object' ? world.flags : {};
    const ch1 = flags.ch1 && typeof flags.ch1 === 'object' ? flags.ch1 : {};
    const ch5 = flags.ch5 && typeof flags.ch5 === 'object' ? flags.ch5 : {};
    const ch6 = flags.ch6 && typeof flags.ch6 === 'object' ? flags.ch6 : {};
    const meta = flags.meta && typeof flags.meta === 'object' ? flags.meta : {};
    const joinedKael = ch6.ch6_kael_joined === true;
    const departureDone = meta.dialogueDone?.ch5_banter_departure === true;
    const pendingRecruitment = ch5.ch5_completed === true && !joinedKael && departureDone;
    const pendingDepartureBanter = ch5.ch5_completed === true && !joinedKael && !departureDone;
    const nextFlags = {
      ...flags,
      ch1: { ...ch1 },
      ch6: {
        ...ch6,
        ...(pendingRecruitment ? { ch6_kael_recruitment_pending: true } : {}),
        ...(pendingDepartureBanter ? { ch6_kael_departure_banter_pending: true } : {}),
      },
    };
    next.world = { ...world, flags: nextFlags };
    const progression = next.progression && typeof next.progression === 'object' ? { ...next.progression } : {};
    const skillUnlocks = {
      orin: [[1, 'ember'], [2, 'minor_heal'], [4, 'orin_surge'], [7, 'orin_echo_lance']],
      mira: [[1, 'mira_mend'], [1, 'mira_spark'], [3, 'mira_light_bind'], [7, 'mira_lumen_ward']],
      kael: [[1, 'kael_guard'], [2, 'kael_shield_bash'], [4, 'kael_taunt'], [7, 'kael_protect_ally']],
    };
    for (const [id, unlocks] of Object.entries(skillUnlocks)) {
      const state = progression[id] && typeof progression[id] === 'object' ? { ...progression[id] } : { level: 1, exp: 0, unlockedSkills: [] };
      const level = Math.max(1, Math.floor(Number(state.level) || 1));
      const unlocked = Array.isArray(state.unlockedSkills) ? [...state.unlockedSkills] : [];
      for (const [unlockLevel, skillId] of unlocks) {
        if (level >= unlockLevel && !unlocked.includes(skillId)) unlocked.push(skillId);
      }
      state.unlockedSkills = unlocked;
      progression[id] = state;
    }
    next.progression = progression;
    const previousParty = next.party && typeof next.party === 'object' ? next.party : {};
    next.party = {
      ...previousParty,
      mira: previousParty.mira ?? null,
      kael: previousParty.kael ?? null,
      roster: {
        recruited: {
          orin: true,
          mira: ch1.ch1_mira_follow === true,
          kael: joinedKael,
        },
        departed: {
          orin: false,
          mira: ch1.ch1_mira_departed === true,
          kael: ch6.ch6_kael_departed === true,
        },
        active: [
          'orin',
          ...(ch1.ch1_mira_follow === true && ch1.ch1_mira_departed !== true ? ['mira'] : []),
          ...(joinedKael && ch6.ch6_kael_departed !== true ? ['kael'] : []),
        ].slice(0, 4),
      },
    };
    return next;
  },
  5: (data) => {
    const next = { ...data, version: 6 };
    const world = next.world && typeof next.world === 'object' ? next.world : { flags: {} };
    const flags = world.flags && typeof world.flags === 'object' ? world.flags : {};
    const ch7 = flags.ch7 && typeof flags.ch7 === 'object' ? flags.ch7 : {};
    const ch8 = flags.ch8 && typeof flags.ch8 === 'object' ? flags.ch8 : {};
    next.world = { ...world, flags: { ...flags, ch7: { ...ch7 }, ch8: { ...ch8 } } };

    const progression = next.progression && typeof next.progression === 'object' ? { ...next.progression } : {};
    const newCharacters = {
      iven: {
        defaults: ['iven_quick_cut'],
        unlocks: [[1, 'iven_quick_cut'], [2, 'iven_quickstep'], [4, 'iven_smoke_bomb'], [7, 'iven_shadow_route']],
      },
      tavi: {
        defaults: ['tavi_spark_trap'],
        unlocks: [[1, 'tavi_spark_trap'], [2, 'tavi_field_patch'], [4, 'tavi_snare_device'], [7, 'tavi_critter_call']],
      },
    };
    for (const [id, config] of Object.entries(newCharacters)) {
      const raw = progression[id] && typeof progression[id] === 'object' ? progression[id] : {};
      const level = Math.max(1, Math.min(10, Math.floor(Number(raw.level) || 1)));
      const unlocked = Array.isArray(raw.unlockedSkills) ? [...raw.unlockedSkills] : [...config.defaults];
      for (const [unlockLevel, skillId] of config.unlocks) {
        if (level >= unlockLevel && !unlocked.includes(skillId)) unlocked.push(skillId);
      }
      progression[id] = {
        ...raw,
        level,
        exp: level >= 10 ? 0 : Math.max(0, Math.floor(Number(raw.exp) || 0)),
        unlockedSkills: unlocked,
      };
    }
    next.progression = progression;

    const party = next.party && typeof next.party === 'object' ? next.party : {};
    const previousRoster = party.roster && typeof party.roster === 'object' ? party.roster : {};
    const previousRecruited = previousRoster.recruited && typeof previousRoster.recruited === 'object' ? previousRoster.recruited : {};
    const previousDeparted = previousRoster.departed && typeof previousRoster.departed === 'object' ? previousRoster.departed : {};
    const recruited = {
      orin: true,
      mira: previousRecruited.mira === true || flags.ch1?.ch1_mira_follow === true,
      kael: previousRecruited.kael === true || flags.ch6?.ch6_kael_joined === true,
      iven: previousRecruited.iven === true || ch7.ch7_iven_joined === true,
      tavi: previousRecruited.tavi === true || ch8.ch8_tavi_joined === true,
    };
    const departed = {
      orin: false,
      mira: previousDeparted.mira === true || flags.ch1?.ch1_mira_departed === true,
      kael: previousDeparted.kael === true || flags.ch6?.ch6_kael_departed === true,
      iven: previousDeparted.iven === true || ch7.ch7_iven_departed === true,
      tavi: previousDeparted.tavi === true || ch8.ch8_tavi_departed === true,
    };
    const eligible = ['orin', 'mira', 'kael', 'tavi', 'iven'].filter((id) => recruited[id] && !departed[id]);
    const previousActive = Array.isArray(previousRoster.active) ? previousRoster.active : [];
    const active = [
      ...previousActive.filter((id) => eligible.includes(id)),
      ...eligible.filter((id) => !previousActive.includes(id)),
    ].slice(0, 4);
    const memberStats = previousRoster.memberStats && typeof previousRoster.memberStats === 'object'
      ? { ...previousRoster.memberStats }
      : {};
    if (!Object.prototype.hasOwnProperty.call(memberStats, 'iven')) memberStats.iven = null;
    if (!Object.prototype.hasOwnProperty.call(memberStats, 'tavi')) memberStats.tavi = null;
    next.party = {
      ...party,
      mira: party.mira ?? null,
      kael: party.kael ?? null,
      roster: { ...previousRoster, recruited, departed, active, memberStats },
    };
    return next;
  },
};

/**
 * @param {object} data
 * @returns {{ ok: boolean, data?: object, error?: string }}
 */
export function migrateSave(data) {
  if (!data || typeof data.version !== 'number') {
    return { ok: false, error: 'no_version' };
  }
  if (data.version > SAVE_VERSION) {
    return { ok: false, error: 'future_version' };
  }
  let current = { ...data };
  while (current.version < SAVE_VERSION) {
    const fn = MIGRATIONS[current.version];
    if (!fn) return { ok: false, error: `no_migration_from_v${current.version}` };
    current = fn(current);
  }
  return { ok: true, data: current };
}

/**
 * Sample v1 payload for tests.
 */
export function sampleV1Save(slotId = 'slot1') {
  const base = createEmptySave(slotId);
  delete base.gold;
  delete base.world;
  base.version = 1;
  return base;
}
