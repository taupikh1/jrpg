import { SAVE_VERSION } from './SaveSchema.js';

/**
 * Validate plain save objects. Returns { ok, errors[] }.
 * @param {unknown} data
 */
export function validateSave(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { ok: false, errors: ['not_object'] };
  }
  const d = /** @type {Record<string, any>} */ (data);
  if (typeof d.version !== 'number') errors.push('missing_version');
  if (d.version > SAVE_VERSION) errors.push('future_version');
  if (typeof d.slotId !== 'string' || !d.slotId) errors.push('missing_slotId');
  if (!d.player || typeof d.player !== 'object') errors.push('missing_player');
  else {
    if (typeof d.player.zoneId !== 'string') errors.push('player.zoneId');
    if (typeof d.player.x !== 'number' || typeof d.player.y !== 'number') errors.push('player.position');
    if (!d.player.stats || typeof d.player.stats !== 'object') errors.push('player.stats');
  }
  if (!d.inventory || !Array.isArray(d.inventory.slots)) errors.push('inventory.slots');
  if (!d.equipment || typeof d.equipment !== 'object') errors.push('equipment');
  if (!d.quests || typeof d.quests !== 'object') errors.push('quests');
  if (d.progression !== undefined && (!d.progression || typeof d.progression !== 'object')) errors.push('progression');
  if (d.party?.roster !== undefined) {
    const roster = d.party.roster;
    if (!roster || typeof roster !== 'object') errors.push('party.roster');
    else {
      if (!roster.recruited || typeof roster.recruited !== 'object') errors.push('party.roster.recruited');
      if (!roster.departed || typeof roster.departed !== 'object') errors.push('party.roster.departed');
      if (roster.active !== undefined && (!Array.isArray(roster.active) || roster.active.length > 4 || roster.active.some((id) => typeof id !== 'string') || new Set(roster.active).size !== roster.active.length)) errors.push('party.roster.active');
    }
  }
  return { ok: errors.length === 0, errors };
}
