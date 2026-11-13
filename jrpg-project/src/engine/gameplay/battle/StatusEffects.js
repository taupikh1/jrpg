/**
 * Battle-only status effects. Each active status is tracked on the participant
 * (participant.statuses) and stat changes use CharacterStats modifiers with a
 * "status:" prefix, so they can be cleared in one call and are never saved.
 */
import { CharacterStats } from '../stats/CharacterStats.js';

export const STATUS_MOD_PREFIX = 'status:';

export function hasStatus(p, id) {
  return p.statuses.some((s) => s.id === id);
}

/** True when any active status (from defs) carries the given flag, e.g. 'skipTurn'. */
export function hasStatusFlag(p, defs, flag) {
  return p.statuses.some((s) => defs?.[s.id]?.[flag] === true);
}

/**
 * @returns {{ok: boolean, reason?: string, refreshed?: boolean}}
 */
export function applyStatus(p, def, duration) {
  if (!def) return { ok: false, reason: 'unknown_status' };
  if (!Number.isInteger(duration) || duration < 1) return { ok: false, reason: 'bad_duration' };
  const existing = p.statuses.find((s) => s.id === def.id);
  if (existing) {
    if (def.stacking === 'none') return { ok: false, reason: 'already_active' };
    existing.remaining = duration;
    return { ok: true, refreshed: true };
  }
  p.statuses.push({ id: def.id, remaining: duration });
  if (def.stat) {
    const base = p.stats.base[def.stat] ?? 0;
    p.stats.addModifier(STATUS_MOD_PREFIX + def.id, { [def.stat]: Math.round(base * def.pct) });
  }
  return { ok: true, refreshed: false };
}

export function removeStatus(p, id) {
  p.statuses = p.statuses.filter((s) => s.id !== id);
  p.stats.removeModifier(STATUS_MOD_PREFIX + id);
}

/** Clears every status and every status stat modifier on this participant. */
export function clearStatuses(p) {
  p.statuses = [];
  if (p.stats instanceof CharacterStats) p.stats.removeModifiersWithPrefix(STATUS_MOD_PREFIX);
}

/**
 * Applies damage/heal over time for the owner's turn start.
 * @returns {{id: string, kind: 'damage'|'heal', amount: number}[]}
 */
export function tickStatuses(p, defs) {
  const out = [];
  for (const s of [...p.statuses]) {
    const tick = defs?.[s.id]?.tick;
    if (!tick) continue;
    const amount = Math.max(1, Math.floor(p.stats.maxHp * tick.pct));
    if (tick.kind === 'damage') {
      out.push({ id: s.id, kind: 'damage', amount: p.stats.takeDamage(amount) });
    } else {
      const before = p.stats.hp;
      p.stats.heal(amount);
      out.push({ id: s.id, kind: 'heal', amount: p.stats.hp - before });
    }
  }
  return out;
}

/** Counts one owner turn down; removes expired statuses. @returns {string[]} expired ids */
export function decrementStatuses(p) {
  const expired = [];
  for (const s of p.statuses) {
    s.remaining -= 1;
    if (s.remaining <= 0) expired.push(s.id);
  }
  for (const id of expired) removeStatus(p, id);
  return expired;
}
