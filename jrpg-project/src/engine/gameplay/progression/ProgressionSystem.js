/**
 * Character EXP, level progression, stat growth, and skill unlock engine.
 * Pure gameplay logic — no browser APIs or canvas dependencies.
 */
import {
  MAX_LEVEL,
  EXP_CURVE_CONFIG,
  expToNextLevel,
  CHARACTER_PROGRESSION,
  PROGRESSION_SKILLS,
} from '../../../../content/characters/progression.js';

const STAT_KEYS = ['maxHp', 'maxMp', 'attack', 'defense', 'magicAttack', 'magicDefense', 'speed'];

export class ProgressionSystem {
  /**
   * @param {object} [opts]
   * @param {Record<string, object>} [opts.characters]
   * @param {Record<string, object>} [opts.skills]
   * @param {number} [opts.maxLevel]
   * @param {object} [opts.expCurve]
   * @param {import('../../../core/EventBus.js').EventBus} [opts.events]
   */
  constructor({
    characters = CHARACTER_PROGRESSION,
    skills = PROGRESSION_SKILLS,
    maxLevel = MAX_LEVEL,
    expCurve = EXP_CURVE_CONFIG,
    events = null,
  } = {}) {
    this.characters = characters;
    this.skills = skills;
    this.maxLevel = Math.max(1, Math.floor(maxLevel || MAX_LEVEL));
    this.expCurve = { ...expCurve, maxLevel: this.maxLevel };
    this.events = events;
    /** @type {Map<string, { id: string, level: number, exp: number, unlockedSkills: string[] }>} */
    this._state = new Map();
    for (const id of Object.keys(this.characters)) {
      this.ensureCharacter(id);
    }
  }

  /** @param {string} id */
  ensureCharacter(id) {
    if (this._state.has(id)) return this._state.get(id);
    const def = this.characters[id];
    const unlocked = def ? this._skillsUpToLevel(def, 1) : [];
    const entry = { id, level: 1, exp: 0, unlockedSkills: unlocked };
    this._state.set(id, entry);
    return entry;
  }

  /** @param {string} id */
  getDef(id) {
    return Object.prototype.hasOwnProperty.call(this.characters, id) ? this.characters[id] : null;
  }

  /** @param {number} level */
  expRequiredForNext(level) {
    if (level >= this.maxLevel) return 0;
    return expToNextLevel(level, this.expCurve);
  }

  /**
   * @param {object} def
   * @param {number} level
   * @returns {string[]}
   */
  _skillsUpToLevel(def, level) {
    const out = [];
    const seen = new Set();
    for (const row of def?.skillUnlocks ?? []) {
      if (row.level <= level && this.skills[row.skillId] && !seen.has(row.skillId)) {
        seen.add(row.skillId);
        out.push(row.skillId);
      }
    }
    return out;
  }

  /**
   * Deterministic base stats at a given level.
   * @param {string} id
   * @param {number} level
   */
  getBaseStatsForLevel(id, level) {
    const def = this.getDef(id);
    if (!def) return null;
    const lv = Math.max(1, Math.min(this.maxLevel, Math.floor(level || 1)));
    const steps = lv - 1;
    const base = { ...def.baseStats };
    for (const k of STAT_KEYS) {
      base[k] = (def.baseStats[k] ?? 0) + (def.growthPerLevel?.[k] ?? 0) * steps;
    }
    return base;
  }

  /**
   * Sync a live CharacterStats instance's `base` values to match the character's current level.
   * Preserves modifiers (`_mods`), and clamps current HP/MP without healing to full.
   * @param {string} id
   * @param {import('../stats/CharacterStats.js').CharacterStats} stats
   */
  syncStats(id, stats) {
    if (!stats?.base) return false;
    const st = this.ensureCharacter(id);
    const targetBase = this.getBaseStatsForLevel(id, st.level);
    if (!targetBase) return false;
    for (const k of STAT_KEYS) {
      stats.base[k] = targetBase[k];
    }
    if (targetBase.critChance != null) stats.base.critChance = targetBase.critChance;
    stats.hp = Math.max(0, Math.min(stats.maxHp, stats.hp));
    stats.mp = Math.max(0, Math.min(stats.maxMp, stats.mp));
    return true;
  }

  /**
   * Read-only progression snapshot for UI/tests.
   * @param {string} id
   */
  getState(id) {
    const st = this.ensureCharacter(id);
    const def = this.getDef(id);
    const isMax = st.level >= this.maxLevel;
    const expToNext = isMax ? 0 : this.expRequiredForNext(st.level);
    const ratio = isMax ? 1 : expToNext > 0 ? Math.max(0, Math.min(1, st.exp / expToNext)) : 0;
    const nextUnlock = (def?.skillUnlocks ?? [])
      .filter((u) => u.level > st.level && !st.unlockedSkills.includes(u.skillId))
      .sort((a, b) => a.level - b.level)[0] ?? null;
    return {
      id: st.id,
      name: def?.name ?? id,
      title: def?.title ?? '',
      role: def?.role ?? '',
      level: st.level,
      maxLevel: this.maxLevel,
      exp: st.exp,
      expToNext,
      remaining: isMax ? 0 : Math.max(0, expToNext - st.exp),
      progressRatio: ratio,
      isMaxLevel: isMax,
      unlockedSkills: [...st.unlockedSkills],
      nextSkillUnlock: nextUnlock
        ? { level: nextUnlock.level, skill: this.skills[nextUnlock.skillId] ?? null }
        : null,
    };
  }

  /** @param {string} id */
  getUnlockedSkillObjects(id) {
    const st = this.ensureCharacter(id);
    return st.unlockedSkills.map((sid) => this.skills[sid]).filter(Boolean);
  }

  /**
   * Full skill progression list for status display (unlocked and locked preview).
   * @param {string} id
   */
  getSkillCatalogForCharacter(id) {
    const st = this.ensureCharacter(id);
    const def = this.getDef(id);
    if (!def) return [];
    const unlockedSet = new Set(st.unlockedSkills);
    return (def.skillUnlocks ?? []).map((u) => ({
      level: u.level,
      unlocked: unlockedSet.has(u.skillId),
      skill: this.skills[u.skillId] ?? null,
    })).filter((row) => row.skill);
  }

  /**
   * @param {string} id
   * @param {string} skillId
   */
  isSkillUnlocked(id, skillId) {
    const st = this.ensureCharacter(id);
    return st.unlockedSkills.includes(skillId);
  }

  /**
   * Grant EXP to one character, applying level-ups, stat growth, and skill unlocks safely.
   * Handles multi-level jumps and max-level clamping.
   * @param {string} id
   * @param {number} amount
   * @param {object} [opts]
   * @param {import('../stats/CharacterStats.js').CharacterStats} [opts.stats]
   */
  grantExp(id, amount, { stats = null } = {}) {
    const st = this.ensureCharacter(id);
    const def = this.getDef(id);
    const rawGain = Math.floor(Number(amount) || 0);
    if (rawGain <= 0 || !def || st.level >= this.maxLevel) {
      if (st.level >= this.maxLevel) st.exp = 0;
      return {
        characterId: id,
        name: def?.name ?? id,
        gained: 0,
        prevLevel: st.level,
        newLevel: st.level,
        leveledUp: false,
        exp: st.exp,
        expToNext: this.expRequiredForNext(st.level),
        statDeltas: {},
        unlockedSkills: [],
      };
    }

    const prevLevel = st.level;
    const prevBase = this.getBaseStatsForLevel(id, prevLevel);
    st.exp += rawGain;

    const newlyUnlocked = [];
    while (st.level < this.maxLevel) {
      const need = this.expRequiredForNext(st.level);
      if (need <= 0 || st.exp < need) break;
      st.exp -= need;
      st.level += 1;
      for (const row of def.skillUnlocks ?? []) {
        if (row.level <= st.level && this.skills[row.skillId] && !st.unlockedSkills.includes(row.skillId)) {
          st.unlockedSkills.push(row.skillId);
          newlyUnlocked.push(this.skills[row.skillId]);
        }
      }
    }

    if (st.level >= this.maxLevel) {
      st.level = this.maxLevel;
      st.exp = 0;
    }

    const leveledUp = st.level > prevLevel;
    const nextBase = this.getBaseStatsForLevel(id, st.level);
    const statDeltas = {};
    let anyStatIncrease = false;
    if (leveledUp && prevBase && nextBase) {
      for (const k of STAT_KEYS) {
        const d = (nextBase[k] ?? 0) - (prevBase[k] ?? 0);
        if (d !== 0) {
          statDeltas[k] = d;
          if (d > 0) anyStatIncrease = true;
        }
      }
    }

    if (stats) this.syncStats(id, stats);

    if (this.events) {
      this.events.emit('progression.exp_gained', {
        characterId: id,
        amount: rawGain,
        exp: st.exp,
        level: st.level,
        leveledUp,
      });
      if (leveledUp) {
        this.events.emit('progression.level_up', {
          characterId: id,
          name: def.name,
          prevLevel,
          newLevel: st.level,
          statDeltas,
          unlockedSkills: newlyUnlocked,
        });
        if (anyStatIncrease) {
          this.events.emit('progression.stat_up', {
            characterId: id,
            statDeltas,
          });
        }
        if (newlyUnlocked.length > 0) {
          this.events.emit('progression.skill_unlock', {
            characterId: id,
            skills: newlyUnlocked,
            skillId: newlyUnlocked[0].id,
          });
        }
      }
    }

    return {
      characterId: id,
      name: def.name,
      gained: rawGain,
      prevLevel,
      newLevel: st.level,
      leveledUp,
      exp: st.exp,
      expToNext: this.expRequiredForNext(st.level),
      statDeltas,
      unlockedSkills: newlyUnlocked,
    };
  }

  /**
   * EXP distribution policy:
   * - Active living party members in the battle receive 100% of the encounter EXP.
   * - Knocked-out members (hp <= 0) and unrecruited/inactive members receive 0 EXP.
   * @param {Array<{ id: string, side: string, stats: object }>} participants
   * @param {number} totalExp
   * @param {{ statsById?: Record<string, object> }} [opts]
   */
  awardBattleExp(participants, totalExp, { statsById = {} } = {}) {
    const exp = Math.floor(Number(totalExp) || 0);
    if (exp <= 0 || !Array.isArray(participants)) {
      return { totalExp: 0, grants: [], levelUps: [] };
    }
    const eligible = participants.filter((p) => p?.side === 'player' && p?.stats?.isAlive && this.getDef(p.id));
    const grants = [];
    const levelUps = [];
    for (const member of eligible) {
      const statsObj = statsById[member.id] ?? member.stats;
      const res = this.grantExp(member.id, exp, { stats: statsObj });
      grants.push(res);
      if (res.leveledUp) levelUps.push(res);
    }
    return { totalExp: exp, grants, levelUps };
  }

  /** Plain serializable snapshot for saves. */
  exportState() {
    const out = {};
    for (const [id, st] of this._state.entries()) {
      out[id] = {
        level: st.level,
        exp: st.exp,
        unlockedSkills: [...st.unlockedSkills],
      };
    }
    return out;
  }

  /**
   * Restore progression state safely from a save payload (sanitizing corrupt/incomplete fields).
   * @param {Record<string, any> | null | undefined} saved
   * @param {{ statsById?: Record<string, object> }} [opts]
   */
  importState(saved, { statsById = {} } = {}) {
    const src = saved && typeof saved === 'object' ? saved : {};
    for (const id of Object.keys(this.characters)) {
      const def = this.characters[id];
      const raw = src[id] && typeof src[id] === 'object' ? src[id] : {};
      const lv = Math.max(1, Math.min(this.maxLevel, Math.floor(Number(raw.level) || 1)));
      const isMax = lv >= this.maxLevel;
      const maxForLevel = isMax ? 0 : Math.max(0, this.expRequiredForNext(lv) - 1);
      const rawExp = Math.max(0, Math.floor(Number(raw.exp) || 0));
      const exp = isMax ? 0 : Math.min(rawExp, maxForLevel);

      // Guaranteed level-appropriate unlocks + preserve valid saved unlocked skills without duplicates
      const unlocked = [];
      const seen = new Set();
      for (const sid of this._skillsUpToLevel(def, lv)) {
        if (!seen.has(sid)) {
          seen.add(sid);
          unlocked.push(sid);
        }
      }
      if (Array.isArray(raw.unlockedSkills)) {
        for (const sid of raw.unlockedSkills) {
          if (typeof sid === 'string' && this.skills[sid] && !seen.has(sid)) {
            const rule = (def.skillUnlocks ?? []).find((u) => u.skillId === sid);
            if (!rule || rule.level <= lv) {
              seen.add(sid);
              unlocked.push(sid);
            }
          }
        }
      }
      this._state.set(id, { id, level: lv, exp, unlockedSkills: unlocked });
      if (statsById[id]) this.syncStats(id, statsById[id]);
    }
  }
}
