/**
 * Quest log with objectives driven by gameplay events.
 */

/**
 * @typedef {Object} QuestObjective
 * @property {string} id
 * @property {string} type - collect|talk|defeat|reach|custom
 * @property {string} [targetId]
 * @property {number} [count=1]
 * @property {string} description
 */

/**
 * @typedef {Object} QuestDef
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string[]} [prerequisites]
 * @property {QuestObjective[]} objectives
 * @property {object} [rewards] - { items?: {id,qty}[], gold?: number, exp?: number }
 */

export class QuestLog {
  /**
   * @param {import('../../../core/EventBus.js').EventBus} [events]
   */
  constructor(events = null) {
    this.events = events;
    /** @type {Map<string, QuestDef>} */
    this._defs = new Map();
    /** @type {Map<string, { status: string, progress: Record<string, number> }>} */
    this._state = new Map();
  }

  /**
   * @param {QuestDef} def
   */
  register(def) {
    if (!def?.id || !def.name || !Array.isArray(def.objectives) || !def.objectives.length) {
      throw new Error('Quest requires id, name, objectives');
    }
    if (this._defs.has(def.id)) throw new Error(`Duplicate quest "${def.id}"`);
    this._defs.set(def.id, def);
    this._state.set(def.id, { status: 'available', progress: {} });
  }

  getDef(id) {
    return this._defs.get(id) ?? null;
  }

  getStatus(id) {
    return this._state.get(id)?.status ?? null;
  }

  /**
   * @param {string} questId
   */
  accept(questId) {
    const def = this._defs.get(questId);
    const st = this._state.get(questId);
    if (!def || !st) return { ok: false, reason: 'unknown' };
    if (st.status !== 'available' && st.status !== 'locked') {
      return { ok: false, reason: 'invalid_state' };
    }
    if (def.prerequisites) {
      for (const pre of def.prerequisites) {
        if (this.getStatus(pre) !== 'completed') {
          return { ok: false, reason: 'prerequisites' };
        }
      }
    }
    st.status = 'active';
    st.progress = {};
    for (const obj of def.objectives) st.progress[obj.id] = 0;
    if (this.events) this.events.emit('quest.accepted', { id: questId });
    return { ok: true };
  }

  /**
   * Complete a quest explicitly (e.g. from a dialogue turn-in effect).
   * Prevents duplicate completion or rewards.
   * @param {string} questId
   */
  complete(questId) {
    const def = this._defs.get(questId);
    const st = this._state.get(questId);
    if (!def || !st) return { ok: false, reason: 'unknown' };
    if (st.status === 'completed') return { ok: false, reason: 'already_completed' };
    for (const obj of def.objectives) {
      st.progress[obj.id] = obj.count ?? 1;
    }
    st.status = 'completed';
    if (this.events) this.events.emit('quest.completed', { id: questId, rewards: def.rewards || {} });
    return { ok: true };
  }

  /**
   * Progress an objective by type/target from real gameplay events.
   * @param {string} type
   * @param {string} [targetId]
   * @param {number} [amount=1]
   */
  notify(type, targetId = null, amount = 1) {
    for (const [qid, st] of this._state) {
      if (st.status !== 'active') continue;
      const def = this._defs.get(qid);
      for (const obj of def.objectives) {
        if (obj.type !== type) continue;
        if (obj.targetId && obj.targetId !== targetId) continue;
        const need = obj.count ?? 1;
        const prev = st.progress[obj.id] || 0;
        if (prev >= need) continue;
        st.progress[obj.id] = Math.min(need, prev + amount);
        if (this.events) {
          this.events.emit('quest.objective_updated', {
            questId: qid,
            objectiveId: obj.id,
            progress: st.progress[obj.id],
            need,
          });
        }
      }
      this._tryComplete(qid);
    }
  }

  _tryComplete(questId) {
    const def = this._defs.get(questId);
    const st = this._state.get(questId);
    if (!def || st.status !== 'active') return false;
    const done = def.objectives.every((o) => (st.progress[o.id] || 0) >= (o.count ?? 1));
    if (!done) return false;
    st.status = 'completed';
    if (this.events) this.events.emit('quest.completed', { id: questId, rewards: def.rewards || {} });
    return true;
  }

  /**
   * @param {string} questId
   */
  getProgress(questId) {
    const def = this._defs.get(questId);
    const st = this._state.get(questId);
    if (!def || !st) return null;
    return {
      status: st.status,
      objectives: def.objectives.map((o) => ({
        ...o,
        current: st.progress[o.id] || 0,
        need: o.count ?? 1,
      })),
    };
  }

  /**
   * Quests the player has started or finished, active first. Read-only, for the quest log screen.
   */
  listVisible() {
    const rank = { active: 0, completed: 1 };
    return [...this._defs.keys()]
      .filter((id) => rank[this._state.get(id)?.status] !== undefined)
      .sort((a, b) => rank[this._state.get(a).status] - rank[this._state.get(b).status])
      .map((id) => ({ id, def: this._defs.get(id), ...this.getProgress(id) }));
  }

  activeQuests() {
    return [...this._state.entries()]
      .filter(([, s]) => s.status === 'active')
      .map(([id]) => ({ id, ...this.getProgress(id), def: this._defs.get(id) }));
  }
}
