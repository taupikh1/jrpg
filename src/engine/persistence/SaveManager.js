import { validateSave } from './SaveValidator.js';
import { migrateSave } from './SaveMigrations.js';
import { SAVE_VERSION, createEmptySave } from './SaveSchema.js';
import { getPartyRosterSnapshot } from '../gameplay/party/PartyRoster.js';

/**
 * High-level save API. Storage adapter is injected (Memory or IndexedDB).
 */
export class SaveManager {
  /**
   * @param {object} opts
   * @param {{ put: Function, get: Function, delete: Function, list: Function, isAvailable?: Function }} opts.adapter
   * @param {import('../../core/EventBus.js').EventBus} [opts.events]
   */
  constructor({ adapter, events = null }) {
    this.adapter = adapter;
    this.events = events;
    this._saving = false;
  }

  get isBusy() {
    return this._saving;
  }

  /**
   * Snapshot plain data from live gameplay objects.
   * @param {object} ctx
   * @param {string} slotId
   */
  buildPayload(ctx, slotId) {
    const player = ctx.player;
    const stats = ctx.stats;
    const inv = ctx.inventory;
    const eq = ctx.equipment;
    const quests = ctx.quests;
    const zoneId = ctx.zoneId || player?.zoneId || 'village';

    const questStates = {};
    if (quests?._state) {
      for (const [id, st] of quests._state) {
        questStates[id] = { status: st.status, progress: { ...st.progress } };
      }
    }

    return {
      version: SAVE_VERSION,
      slotId,
      createdAt: ctx.createdAt || Date.now(),
      updatedAt: Date.now(),
      playtimeMs: ctx.playtimeMs || 0,
      displayName: ctx.displayName || `Save ${slotId}`,
      player: {
        zoneId,
        x: player?.x ?? 160,
        y: player?.y ?? 112,
        facing: player?.facing || 'down',
        stats: {
          maxHp: stats?.base?.maxHp ?? stats?.maxHp ?? 60,
          maxMp: stats?.base?.maxMp ?? stats?.maxMp ?? 25,
          hp: stats?.hp ?? 60,
          mp: stats?.mp ?? 25,
          attack: stats?.base?.attack ?? 12,
          defense: stats?.base?.defense ?? 6,
          speed: stats?.base?.speed ?? 12,
          magicAttack: stats?.base?.magicAttack ?? 8,
          magicDefense: stats?.base?.magicDefense ?? 4,
        },
      },
      inventory: {
        capacity: inv?.capacity ?? 20,
        slots: (inv?.slots || []).map((s) => ({ itemId: s.itemId, qty: s.qty })),
      },
      equipment: { ...(eq?.equipped || createEmptySave().equipment) },
      quests: { states: questStates },
      world: { flags: { ...(ctx.worldFlags || {}) } },
      gold: ctx.gold ?? 0,
      party: {
        roster: ctx.partyRoster ?? getPartyRosterSnapshot(ctx.worldFlags || {}),
        mira: ctx.miraStats
          ? {
              maxHp: ctx.miraStats.base?.maxHp ?? ctx.miraStats.maxHp,
              maxMp: ctx.miraStats.base?.maxMp ?? ctx.miraStats.maxMp,
              hp: ctx.miraStats.hp,
              mp: ctx.miraStats.mp,
              attack: ctx.miraStats.base?.attack ?? 9,
              defense: ctx.miraStats.base?.defense ?? 5,
              speed: ctx.miraStats.base?.speed ?? 14,
              magicAttack: ctx.miraStats.base?.magicAttack ?? 14,
              magicDefense: ctx.miraStats.base?.magicDefense ?? 6,
            }
          : null,
        kael: ctx.kaelStats
          ? {
              maxHp: ctx.kaelStats.base?.maxHp ?? ctx.kaelStats.maxHp,
              maxMp: ctx.kaelStats.base?.maxMp ?? ctx.kaelStats.maxMp,
              hp: ctx.kaelStats.hp,
              mp: ctx.kaelStats.mp,
              attack: ctx.kaelStats.base?.attack ?? 13,
              defense: ctx.kaelStats.base?.defense ?? 11,
              speed: ctx.kaelStats.base?.speed ?? 8,
              magicAttack: ctx.kaelStats.base?.magicAttack ?? 5,
              magicDefense: ctx.kaelStats.base?.magicDefense ?? 8,
            }
          : null,
      },
      progression: ctx.progression?.exportState?.()
        ?? ctx.progression
        ?? createEmptySave().progression,
    };
  }

  /**
   * @param {string} slotId
   * @param {object} payload - plain save data
   */
  async save(slotId, payload) {
    if (this._saving) return { ok: false, reason: 'busy' };
    this._saving = true;
    try {
      const data = { ...payload, slotId, updatedAt: Date.now(), version: payload.version || SAVE_VERSION };
      const v = validateSave(data);
      if (!v.ok) return { ok: false, reason: 'invalid', errors: v.errors };
      const result = await this.adapter.put(slotId, data);
      if (result.ok && this.events) this.events.emit('save.written', { slotId });
      return result;
    } finally {
      this._saving = false;
    }
  }

  /**
   * Load, migrate, validate — does not apply to game state.
   * @param {string} slotId
   */
  async load(slotId) {
    const raw = await this.adapter.get(slotId);
    if (!raw.ok) return raw;
    const migrated = migrateSave(raw.data);
    if (!migrated.ok) return { ok: false, reason: migrated.error };
    const v = validateSave(migrated.data);
    if (!v.ok) return { ok: false, reason: 'invalid', errors: v.errors };
    return { ok: true, data: migrated.data };
  }

  /**
   * @param {string} slotId
   */
  async delete(slotId) {
    const r = await this.adapter.delete(slotId);
    if (r.ok && this.events) this.events.emit('save.deleted', { slotId });
    return r;
  }

  async list() {
    return this.adapter.list();
  }
}
