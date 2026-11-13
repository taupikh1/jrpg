import { CharacterStats } from '../stats/CharacterStats.js';
import { DamageCalculator } from './DamageCalculator.js';
import { affinityFor, elementMultiplier } from './Elements.js';
import {
  applyStatus, clearStatuses, decrementStatuses, hasStatus, hasStatusFlag, tickStatuses, removeStatus,
} from './StatusEffects.js';

export const MAX_BATTLE_PARTY_SIZE = 4;

/**
 * Turn-based battle state machine.
 * States: idle → active → victory|defeat|escaped → ended
 *
 * Optional dependencies are injected (statusDefs), so the engine never imports content.
 * Battle state (statuses, phases, cursors) lives only in memory and is never saved.
 */

/**
 * @typedef {Object} BattleParticipant
 * @property {string} id
 * @property {string} name
 * @property {'player'|'enemy'} side
 * @property {CharacterStats} stats
 * @property {boolean} [defending]
 * @property {Record<string, 'weak'|'resist'|'immune'>} [affinities]
 * @property {{id: string, hpBelowPct: number, actions?: object[], onEnter?: {dialogueId?: string}|null}[]} [phases]
 * @property {object} [ai]
 */

export class BattleManager {
  /**
   * @param {object} [opts]
   * @param {import('../../../core/EventBus.js').EventBus} [opts.events]
   * @param {import('../inventory/Inventory.js').Inventory} [opts.inventory]
   * @param {() => number} [opts.rng]
   * @param {Record<string, object>} [opts.statusDefs] definitions keyed by status id (see content/combat)
   */
  constructor({ events = null, inventory = null, rng = Math.random, statusDefs = {} } = {}) {
    this.events = events;
    this.inventory = inventory;
    this.rng = rng;
    this.statusDefs = statusDefs ?? {};
    /** @type {BattleParticipant[]} */
    this.participants = [];
    /** @type {string} */
    this.state = 'idle';
    /** @type {string[]} turn order ids */
    this.turnOrder = [];
    this.turnIndex = 0;
    this.round = 0;
    this.log = [];
    this.rewards = null;
    this.rewardsClaimed = false;
    this.result = null;
    /** @type {{type: 'survive_turns', turns: number}|null} */
    this.winCondition = null;
    /** @type {'round'|'atb_wait'|'atb_active'} */
    this.mode = 'round';
    this.atbConfig = {
      baseRate: 0.15,
      speedFactor: (speed) => Math.min(1.2, 0.6 + (speed || 0) / ((speed || 0) + 40)),
    };
    /** @type {Map<string, number>} participantId -> atb gauge [0,1] */
    this.atb = new Map();
    this.paused = false;
    this.readyQueue = []; // FIFO of ready ids
  }

  /**
   * @param {BattleParticipant[]} party
   * @param {BattleParticipant[]} enemies
   * @param {object} [rewardDef]
   * @param {object} [options]
   * @param {{type: 'survive_turns', turns: number}} [options.winCondition]
   */
  start(party, enemies, rewardDef = {}, options = {}) {
    if (this.state === 'active') throw new Error('Battle already active');
    if (!Array.isArray(party) || party.length === 0) throw new TypeError('Battle requires a non-empty player party');
    if (party.length > MAX_BATTLE_PARTY_SIZE) throw new RangeError(`Battle party cannot exceed ${MAX_BATTLE_PARTY_SIZE} members`);
    this.participants = [...party, ...enemies].map((p) => ({
      ...p,
      defending: false,
      stats: p.stats,
      statuses: [],
      affinities: p.affinities ?? {},
      phaseIndex: -1,
      actionCursor: 0,
      guardUntilRound: 0,
      tauntUntilRound: 0,
      protectById: null,
      protectUntilRound: 0,
    }));
    // Clear leftovers from an interrupted battle so no status modifier leaks into later play or saves.
    for (const p of this.participants) clearStatuses(p);
    this.winCondition = options.winCondition?.type === 'survive_turns' ? { ...options.winCondition } : null;
    this.state = 'active';
    this.round = 1;
    this.log = [];
    this.rewardsClaimed = false;
    this.result = null;
    if (rewardDef && rewardDef.grantRewards === false) {
      this.rewards = { exp: 0, gold: 0, items: [], grantRewards: false };
    } else {
      const enemyExp = enemies.reduce((sum, e) => sum + Math.max(0, Number(e?.exp) || 0), 0);
      const enemyGold = enemies.reduce((sum, e) => sum + Math.max(0, Number(e?.gold) || 0), 0);
      const exp = rewardDef?.exp != null ? Math.max(0, Number(rewardDef.exp) || 0) : enemyExp;
      const gold = rewardDef?.gold != null ? Math.max(0, Number(rewardDef.gold) || 0) : enemyGold;
      const items = Array.isArray(rewardDef?.items) ? rewardDef.items.map((it) => ({ ...it })) : [];
      this.rewards = { ...(rewardDef || {}), exp, gold, items, grantRewards: true };
    }
    this.mode = options.mode || 'round';
    if (this.mode !== 'round') {
      this.atb.clear();
      this.readyQueue = [];
      for (const p of this.participants) {
        if (p.stats.isAlive) {
          const init = this.rng() * 0.3;
          this.atb.set(p.id, init);
        }
      }
    }
    this._buildTurnOrder();
    this.turnIndex = 0;
    if (this.events) this.events.emit('battle.started', { participants: this.participants.map((p) => p.id) });
    for (const p of this.participants) this._refreshPhase(p);
    this._emitTurn();
  }

  _sortByTurn(list) {
    return [...list].sort((a, b) => {
      const ds = b.stats.speed - a.stats.speed;
      if (ds !== 0) return ds;
      return a.id.localeCompare(b.id); // deterministic tie-break
    });
  }

  _buildTurnOrder() {
    const alive = this.participants.filter((p) => p.stats.isAlive);
    this.turnOrder = this._sortByTurn(alive).map((p) => p.id);
  }

  get currentId() {
    return this.turnOrder[this.turnIndex] ?? null;
  }

  get current() {
    return this.participants.find((p) => p.id === this.currentId) ?? null;
  }

  _emitTurn() {
    const c = this.current;
    if (c && this.events) {
      this.events.emit('battle.turn_started', { id: c.id, side: c.side, round: this.round });
    }
  }

  /** Advance ATB gauges. Call from scene with clamped dt. No-op in 'round' mode. */
  update(dt) {
    if (this.mode === 'round' || this.state !== 'active' || this.paused) return;
    const alive = this.participants.filter((p) => p.stats.isAlive);
    for (const p of alive) {
      if (this.readyQueue.includes(p.id)) continue;
      const rate = this.atbConfig.baseRate * this.atbConfig.speedFactor(p.stats.speed);
      let g = (this.atb.get(p.id) || 0) + rate * dt;
      if (g >= 1) {
        g = 1;
        if (!this.readyQueue.includes(p.id) && !this.currentId) {
          this.readyQueue.push(p.id);
        }
      }
      this.atb.set(p.id, g);
    }
    // If no current and ready, take the first
    if (!this.currentId && this.readyQueue.length > 0) {
      const nextId = this.readyQueue.shift();
      const p = this.participants.find((x) => x.id === nextId);
      if (p && p.stats.isAlive) {
        // set as current by putting at front of turnOrder for compatibility
        this.turnOrder = [nextId, ...this.turnOrder.filter((id) => id !== nextId)];
        this.turnIndex = 0;
        this._emitTurn();
      }
    }
  }

  setPaused(paused) {
    this.paused = !!paused;
  }


  _pushLog(msg) {
    this.log.push(msg);
    if (this.log.length > 40) this.log.shift();
  }

  /**
   * Applies raw damage with elemental affinity and defend. Returns the damage actually dealt.
   * @returns {{dealt: number, affinity: 'weak'|'resist'|'immune'|'neutral'}}
   */
  _mitigateDamage(target, amount) {
    if (amount <= 0) return 0;
    const guarded = target.defending || target.guardUntilRound >= this.round;
    const finalAmount = guarded ? Math.max(1, Math.floor(amount * 0.5)) : amount;
    const dealt = target.stats.takeDamage(finalAmount);
    if (dealt > 0) this._refreshPhase(target);
    return dealt;
  }

  _applyDamage(target, raw, element, context = {}) {
    const targetMultiplier = elementMultiplier(element, target.affinities);
    const targetDamage = targetMultiplier === 0 ? 0 : Math.max(1, Math.floor(raw * targetMultiplier));
    const protector = target.protectUntilRound >= this.round
      ? this.participants.find((p) => p.id === target.protectById && p.side === target.side && p.stats.isAlive)
      : null;
    let redirectedDamage = 0;
    let dealt = 0;
    if (protector && protector.id !== target.id && targetDamage > 1) {
      let protectorRaw = raw;
      if (context.attacker && context.kind === 'physical') {
        protectorRaw = Math.max(1, Math.floor(context.attacker.attack * (context.power ?? 1) - protector.stats.defense * 0.5));
        if (context.critical) protectorRaw = Math.floor(protectorRaw * 1.5);
      } else if (context.attacker && context.kind === 'magical') {
        protectorRaw = Math.max(1, Math.floor(context.attacker.magicAttack * (context.power ?? 1) - protector.stats.magicDefense * 0.5));
      }
      const protectorMultiplier = elementMultiplier(element, protector.affinities);
      const protectorDamage = protectorMultiplier === 0 ? 0 : Math.max(1, Math.floor(protectorRaw * protectorMultiplier));
      const targetShare = Math.ceil(targetDamage / 2);
      const protectorShare = Math.floor(protectorDamage / 2);
      dealt = this._mitigateDamage(target, targetShare);
      redirectedDamage = this._mitigateDamage(protector, protectorShare);
      if (redirectedDamage > 0) {
        this._pushLog(`${protector.name} menanggung ${redirectedDamage} kerusakan untuk ${target.name}`);
        if (this.events) this.events.emit('battle.damage_redirected', {
          sourceId: target.id, protectorId: protector.id, redirectedDamage,
        });
      }
      if (!protector.stats.isAlive) this._onDefeated(protector, protector.id);
    } else {
      dealt = this._mitigateDamage(target, targetDamage);
    }
    return { dealt, redirectedDamage, affinity: affinityFor(element, target.affinities) };
  }

  _targetMode(skill) {
    if (skill?.target) return skill.target;
    return skill?.type === 'heal' ? 'ally' : 'enemy';
  }

  _validate(actorId, targetId) {
    if (this.state !== 'active') return { ok: false, reason: 'not_active' };
    if (this.currentId !== actorId) return { ok: false, reason: 'not_your_turn' };
    const actor = this.participants.find((p) => p.id === actorId);
    const target = this.participants.find((p) => p.id === targetId);
    if (!actor?.stats.isAlive || !target?.stats.isAlive) return { ok: false, reason: 'invalid' };
    return { ok: true, actor, target };
  }

  /**
   * @param {string} actorId
   * @param {string} targetId
   */
  commandAttack(actorId, targetId) {
    const v = this._validate(actorId, targetId);
    if (!v.ok) return v;
    const { actor, target } = v;
    const result = DamageCalculator.physical(actor.stats, target.stats, { rng: this.rng });
    const { dealt, redirectedDamage, affinity } = this._applyDamage(target, result.damage, null, { attacker: actor.stats, kind: 'physical', power: 1, critical: result.critical });
    this._pushLog(`${actor.name} attacks ${target.name} for ${dealt}${result.critical ? ' CRIT' : ''}`);
    if (this.events) {
      this.events.emit('battle.action_resolved', {
        type: 'attack',
        actorId,
        targetId,
        damage: dealt,
        redirectedDamage,
        critical: result.critical,
        affinity,
      });
    }
    if (!target.stats.isAlive) this._onDefeated(target, targetId);
    return this._endTurn();
  }

  /**
   * @param {string} actorId
   * @param {string} targetId
   * @param {object} skill - { id, name, mpCost, power, type: 'physical'|'magical'|'heal', element?, effect? }
   */
  commandSkill(actorId, targetId, skill) {
    const v = this._validate(actorId, targetId);
    if (!v.ok) return v;
    if (!skill || typeof skill.id !== 'string' || !['attack', 'physical', 'magical', 'heal', 'guard', 'taunt', 'protect'].includes(skill.type)) return { ok: false, reason: 'invalid' };
    const { actor, target } = v;
    if (Array.isArray(actor.skills) && !actor.skills.some((s) => s.id === skill.id)) {
      return { ok: false, reason: 'skill_locked' };
    }
    if (hasStatusFlag(actor, this.statusDefs, 'blocksSkills')) return { ok: false, reason: 'silenced' };
    const targetMode = this._targetMode(skill);
    if ((targetMode === 'self' && target.id !== actor.id)
      || (targetMode === 'ally' && (target.side !== actor.side || (skill.type === 'protect' && target.id === actor.id)))
      || (targetMode === 'enemy' && target.side === actor.side)) {
      return { ok: false, reason: 'invalid_target' };
    }
    if (!this.participants.some((p) => p.side !== actor.side && p.stats.isAlive) && ['attack', 'magical'].includes(skill.type)) {
      return { ok: false, reason: 'invalid_target' };
    }
    if (!actor.stats.spendMp(skill.mpCost ?? 0)) return { ok: false, reason: 'no_mp' };

    let damage = 0;
    let redirectedDamage = 0;
    let affinity = 'neutral';
    if (skill.type === 'heal') {
      const amount = skill.power ?? 20;
      target.stats.heal(amount);
      this._pushLog(`${actor.name} memulihkan ${target.name} sebesar ${amount} HP`);
    } else if (skill.type === 'guard') {
      actor.guardUntilRound = this.round + 1;
      this._pushLog(`${actor.name} memperkuat pertahanannya`);
      if (this.events) this.events.emit('battle.defense_effect_applied', { actorId, targetId: actorId, effect: 'guard', expiresRound: actor.guardUntilRound });
    } else if (skill.type === 'taunt') {
      actor.tauntUntilRound = this.round + 1;
      this._pushLog(`${actor.name} menantang musuh untuk menghadapinya`);
      if (this.events) this.events.emit('battle.defense_effect_applied', { actorId, targetId: actorId, effect: 'taunt', expiresRound: actor.tauntUntilRound });
    } else if (skill.type === 'protect') {
      target.protectById = actor.id;
      target.protectUntilRound = this.round + 1;
      this._pushLog(`${actor.name} bersiap melindungi ${target.name}`);
      if (this.events) this.events.emit('battle.defense_effect_applied', { actorId, targetId, effect: 'protect', expiresRound: target.protectUntilRound });
    } else {
      const calc = skill.type === 'magical' ? DamageCalculator.magical : DamageCalculator.physical;
      const result = calc(actor.stats, target.stats, { power: skill.power ?? 1.2, rng: this.rng });
      ({ dealt: damage, redirectedDamage, affinity } = this._applyDamage(target, result.damage, skill.element, {
        attacker: actor.stats, kind: skill.type === 'magical' ? 'magical' : 'physical', power: skill.power ?? 1.2, critical: result.critical,
      }));
      this._pushLog(`${actor.name} menggunakan ${skill.name} pada ${target.name} (${damage} kerusakan${redirectedDamage ? `, ${redirectedDamage} dialihkan` : ''})`);
      if (!target.stats.isAlive) this._onDefeated(target, targetId);
    }
    if (skill.effect && target.stats.isAlive) this._tryEffect(target, skill.effect);
    if (this.events) {
      this.events.emit('battle.action_resolved', { type: 'skill', actorId, targetId, skill: skill.id, damage, redirectedDamage, affinity });
    }
    return this._endTurn();
  }

  /**
   * @param {string} actorId
   * @param {string} itemId
   * @param {string} targetId
   */
  commandItem(actorId, itemId, targetId) {
    if (this.state !== 'active' || this.currentId !== actorId) return { ok: false, reason: 'not_your_turn' };
    if (!this.inventory) return { ok: false, reason: 'no_inventory' };
    const target = this.participants.find((p) => p.id === targetId);
    if (!target) return { ok: false, reason: 'invalid' };
    const result = this.inventory.use(itemId, target.stats);
    if (!result.ok) return result;
    this._pushLog(`${actorId} uses item ${itemId}`);
    if (this.events) this.events.emit('battle.action_resolved', { type: 'item', actorId, itemId, targetId });
    return this._endTurn();
  }

  /**
   * @param {string} actorId
   */
  commandDefend(actorId) {
    if (this.state !== 'active' || this.currentId !== actorId) return { ok: false, reason: 'not_your_turn' };
    const actor = this.participants.find((p) => p.id === actorId);
    if (!actor) return { ok: false, reason: 'invalid' };
    actor.defending = true;
    this._pushLog(`${actor.name} defends`);
    if (this.events) this.events.emit('battle.action_resolved', { type: 'defend', actorId });
    return this._endTurn();
  }

  /**
   * @param {string} actorId
   * @param {number} [chance=0.5]
   */
  commandEscape(actorId, chance = 0.5) {
    if (this.state !== 'active' || this.currentId !== actorId) return { ok: false, reason: 'not_your_turn' };
    if (this.rng() < chance) {
      this.state = 'escaped';
      this.result = 'escaped';
      this._pushLog('Party escaped!');
      if (this.events) this.events.emit('battle.escaped', {});
      this._clearAllStatuses();
      this.state = 'ended';
      if (this.events) this.events.emit('battle.ended', { result: 'escaped' });
      return { ok: true, escaped: true };
    }
    this._pushLog('Escape failed!');
    return this._endTurn();
  }

  /** Lists which commands the current actor may use. */
  availableCommands(actorId) {
    const none = { attack: false, skill: false, item: false, defend: false, escape: false, reasons: {} };
    const actor = this.participants.find((p) => p.id === actorId);
    if (this.state !== 'active' || this.currentId !== actorId || !actor?.stats.isAlive) {
      return { ...none, reasons: { all: 'not_your_turn' } };
    }
    const enemiesAlive = this.participants.some((p) => p.side !== actor.side && p.stats.isAlive);
    const silenced = hasStatusFlag(actor, this.statusDefs, 'blocksSkills');
    return {
      attack: enemiesAlive,
      skill: !silenced,
      item: !!this.inventory,
      defend: true,
      escape: true,
      reasons: silenced ? { skill: 'silenced' } : {},
    };
  }

  /**
   * Upcoming actors in order: the rest of this round, then the next round by current speed.
   * Lists living participants only. Does not change state.
   * @returns {string[]}
   */
  getTurnQueue(count = 8) {
    if (this.mode !== 'round') {
      // Estimate based on time-to-full
      const alive = this.participants.filter((p) => p.stats.isAlive);
      const estimates = alive.map((p) => {
        const g = this.atb.get(p.id) || 0;
        const rate = this.atbConfig.baseRate * this.atbConfig.speedFactor(p.stats.speed);
        const ttf = rate > 0 ? (1 - g) / rate : 999;
        return { id: p.id, ttf };
      }).sort((a, b) => a.ttf - b.ttf || a.id.localeCompare(b.id));
      return estimates.slice(0, count).map((e) => e.id);
    }
    const queue = [];
    for (let i = this.turnIndex; i < this.turnOrder.length && queue.length < count; i++) {
      const p = this.participants.find((x) => x.id === this.turnOrder[i]);
      if (p?.stats.isAlive) queue.push(p.id);
    }
    const alive = this._sortByTurn(this.participants.filter((p) => p.stats.isAlive));
    for (const p of alive) {
      if (queue.length >= count) break;
      queue.push(p.id);
    }
    return queue;
  }

  /** Presentation-ready snapshot (no rendering assumptions). */
  view() {
    return {
      state: this.state,
      round: this.round,
      currentId: this.currentId,
      participants: this.participants.map((p) => ({
        id: p.id,
        name: p.name,
        side: p.side,
        alive: p.stats.isAlive,
        hp: p.stats.hp,
        maxHp: p.stats.maxHp,
        mp: p.stats.mp,
        maxMp: p.stats.maxMp,
        statuses: p.statuses.map((s) => ({ id: s.id, remaining: s.remaining })),
        guarding: p.guardUntilRound >= this.round,
        taunting: p.tauntUntilRound >= this.round,
        protectedBy: p.protectUntilRound >= this.round ? p.protectById : null,
        phaseId: p.phaseIndex >= 0 ? p.phases?.[p.phaseIndex]?.id ?? null : null,
      })),
    };
  }

  _onDefeated(target, targetId) {
    this._pushLog(`${target.name} is defeated`);
    if (this.events) this.events.emit('battle.participant_defeated', { id: targetId });
  }

  _tryEffect(target, effect) {
    if (!effect || !target.stats.isAlive) return null;
    const chance = effect.chance ?? 1;
    if (chance < 1 && !(this.rng() < chance)) {
      this._pushLog(`${target.name} resists ${effect.id}`);
      return { ok: false, reason: 'chance' };
    }
    const def = this.statusDefs[effect.id];
    const r = applyStatus(target, def, effect.duration ?? def?.duration);
    if (r.ok) {
      this._pushLog(`${target.name} is affected by ${effect.id}`);
      if (this.events) this.events.emit('battle.status_applied', { id: target.id, status: effect.id });
    }
    return r;
  }

  /** Advances to the next actor index; a wrap starts a new round and clears defend. */
  _advanceTurn() {
    this.turnIndex += 1;
    if (this.turnIndex >= this.turnOrder.length) {
      this.round += 1;
      for (const p of this.participants) p.defending = false;
      this._expireRoundEffects();
      this._buildTurnOrder();
      this.turnIndex = 0;
    }
  }

  /**
   * Runs owner-turn-start effects. @returns {'act'|'skip'|'dead'}
   */
  _beginTurn(actor) {
    for (const t of tickStatuses(actor, this.statusDefs)) {
      const verb = t.kind === 'damage' ? 'takes' : 'recovers';
      this._pushLog(`${actor.name} ${verb} ${t.amount} from ${t.id}`);
      if (this.events) this.events.emit('battle.status_tick', { id: actor.id, status: t.id, kind: t.kind, amount: t.amount });
    }
    if (!actor.stats.isAlive) {
      this._onDefeated(actor, actor.id);
      return 'dead';
    }
    const skip = hasStatusFlag(actor, this.statusDefs, 'skipTurn');
    if (skip) this._pushLog(`${actor.name} is stunned and loses the turn`);
    for (const id of decrementStatuses(actor)) {
      if (this.events) this.events.emit('battle.status_expired', { id: actor.id, status: id });
    }
    return skip ? 'skip' : 'act';
  }

  _endTurn() {
    // In ATB modes, reset the actor's gauge after action
    if (this.mode !== 'round' && this.currentId) {
      this.atb.set(this.currentId, 0);
      this.readyQueue = this.readyQueue.filter((id) => id !== this.currentId);
      this.turnOrder = [];
      this.turnIndex = 0;
    }
    this._advanceTurn();
    let guard = 0;
    while (this.state === 'active' && guard++ < 40) {
      if (this.turnOrder.length === 0) break;
      const c = this.current;
      if (!c || !c.stats.isAlive) {
        this._advanceTurn();
        continue;
      }
      const begin = this._beginTurn(c);
      if (begin === 'act') break;
      const ended = this._checkEnd();
      if (ended) return { ok: true, ...ended };
      this._advanceTurn();
    }
    const result = this._checkEnd();
    if (result) return { ok: true, ...result };
    this._emitTurn();
    return { ok: true };
  }

  _expireRoundEffects() {
    for (const p of this.participants) {
      for (const [key, effect] of [['guardUntilRound', 'guard'], ['tauntUntilRound', 'taunt']]) {
        if (p[key] > 0 && p[key] < this.round) {
          p[key] = 0;
          if (this.events) this.events.emit('battle.defense_effect_expired', { targetId: p.id, effect });
        }
      }
      if (p.protectUntilRound > 0 && p.protectUntilRound < this.round) {
        p.protectUntilRound = 0;
        p.protectById = null;
        if (this.events) this.events.emit('battle.defense_effect_expired', { targetId: p.id, effect: 'protect' });
      }
    }
  }

  _clearAllStatuses() {
    for (const p of this.participants) {
      clearStatuses(p);
      p.guardUntilRound = 0;
      p.tauntUntilRound = 0;
      p.protectUntilRound = 0;
      p.protectById = null;
    }
  }

  _checkEnd() {
    const playersAlive = this.participants.some((p) => p.side === 'player' && p.stats.isAlive);
    const enemiesAlive = this.participants.some((p) => p.side === 'enemy' && p.stats.isAlive);
    if (!enemiesAlive) {
      this._finish('victory', 'defeated');
      return { victory: true, rewards: this.rewards };
    }
    if (playersAlive && this.winCondition?.type === 'survive_turns' && this.round > this.winCondition.turns) {
      this._finish('victory', 'survived');
      return { victory: true, rewards: this.rewards };
    }
    if (!playersAlive) {
      this._finish('defeat', 'defeated');
      return { defeat: true };
    }
    return null;
  }

  _finish(result, reason) {
    this._clearAllStatuses();
    this.state = 'victory';
    this.result = result;
    if (result === 'victory') {
      this._pushLog(reason === 'survived' ? 'Victory! The party held out.' : 'Victory!');
      if (this.events) this.events.emit('battle.victory', { rewards: this.rewards, reason });
    } else {
      this._pushLog('Defeat...');
      if (this.events) this.events.emit('battle.defeat', {});
    }
    this.state = 'ended';
    if (this.events) this.events.emit('battle.ended', result === 'victory' ? { result, rewards: this.rewards } : { result });
  }

  /**
   * Enters every phase whose threshold the participant has reached. Phases only advance.
   */
  _refreshPhase(p) {
    const phases = p.phases;
    if (!Array.isArray(phases) || phases.length === 0 || !p.stats.isAlive) return;
    const pct = p.stats.hp / p.stats.maxHp;
    let target = p.phaseIndex;
    for (let i = p.phaseIndex + 1; i < phases.length; i++) {
      if (pct <= phases[i].hpBelowPct) target = i;
    }
    for (let i = p.phaseIndex + 1; i <= target; i++) {
      p.phaseIndex = i;
      p.actionCursor = 0;
      const phase = phases[i];
      this._pushLog(`${p.name} enters phase ${phase.id}`);
      if (this.events) {
        this.events.emit('battle.phase_entered', {
          id: p.id,
          phaseId: phase.id,
          index: i,
          dialogueId: phase.onEnter?.dialogueId ?? null,
        });
      }
    }
  }

  /**
   * Simple enemy AI. Bosses with an active phase cycle through its actions;
   * other enemies attack the first living player.
   */
  _selectEnemyTarget(actor) {
    const living = this.participants.filter((p) => p.side === 'player' && p.stats.isAlive);
    if (!living.length) return null;
    const taunts = living.filter((p) => p.tauntUntilRound >= this.round)
      .sort((a, b) => b.tauntUntilRound - a.tauntUntilRound || a.id.localeCompare(b.id));
    const target = taunts[0] || living[0];
    if (taunts.length && this.events) {
      this.events.emit('battle.taunt_targeted', { enemyId: actor?.id ?? null, targetId: target.id });
    }
    return target;
  }

  runEnemyTurn() {
    const actor = this.current;
    if (!actor || actor.side !== 'enemy' || this.state !== 'active') return null;
    const target = this._selectEnemyTarget(actor);
    if (!target) return this._checkEnd();
    const phase = actor.phaseIndex >= 0 ? actor.phases?.[actor.phaseIndex] : null;
    const actions = phase?.actions?.length ? phase.actions : actor.ai?.actions;
    if (Array.isArray(actions) && actions.length) {
      const action = actions[actor.actionCursor % actions.length];
      actor.actionCursor += 1;
      return this._performAction(actor, target, action, phase?.actions?.length ? 'boss_action' : 'enemy_action');
    }
    return this.commandAttack(actor.id, target.id);
  }

  _performAction(actor, target, action, eventType = 'enemy_action') {
    const calc = action.type === 'magical' ? DamageCalculator.magical : DamageCalculator.physical;
    const result = calc(actor.stats, target.stats, { power: action.power ?? 1, rng: this.rng });
    const { dealt, redirectedDamage, affinity } = this._applyDamage(target, result.damage, action.element, {
      attacker: actor.stats, kind: action.type === 'magical' ? 'magical' : 'physical', power: action.power ?? 1, critical: result.critical,
    });
    this._pushLog(`${actor.name} uses ${action.name} on ${target.name} for ${dealt}`);
    if (this.events) {
      this.events.emit('battle.action_resolved', {
        type: eventType,
        actorId: actor.id,
        targetId: target.id,
        action: action.id,
        damage: dealt,
        redirectedDamage,
        affinity,
      });
    }
    if (!target.stats.isAlive) this._onDefeated(target, target.id);
    else this._tryEffect(target, action.effect);
    return this._endTurn();
  }

  /**
   * Claim battle victory rewards at most once.
   * Returns failure if battle did not end in victory or rewards were already claimed.
   */
  claimVictoryRewards() {
    if (this.state !== 'ended' || this.result !== 'victory') {
      return { ok: false, reason: 'not_victory' };
    }
    if (this.rewardsClaimed) {
      return { ok: false, reason: 'already_claimed' };
    }
    this.rewardsClaimed = true;
    const rw = this.rewards;
    if (!rw || rw.grantRewards === false) {
      return { ok: true, rewards: { exp: 0, gold: 0, items: [], grantRewards: false } };
    }
    return {
      ok: true,
      rewards: {
        ...rw,
        exp: Math.max(0, Number(rw.exp) || 0),
        gold: Math.max(0, Number(rw.gold) || 0),
        items: Array.isArray(rw.items) ? rw.items.map((it) => ({ ...it })) : [],
        grantRewards: true,
      },
    };
  }

  party() {
    return this.participants.filter((p) => p.side === 'player');
  }

  enemies() {
    return this.participants.filter((p) => p.side === 'enemy');
  }
}
