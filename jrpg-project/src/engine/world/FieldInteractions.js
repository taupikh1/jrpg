/**
 * Field interaction helpers (FF8): chests and inns.
 * Pure logic; scene owns presentation.
 */
export function openChest(chestId, alreadyOpened = false) {
  if (alreadyOpened) return { ok: false, reason: 'already_opened' };
  // Deterministic sample rewards; real data would come from content.
  const rewards = {
    chest_forest_1: { gold: 15, items: [{ id: 'potion', qty: 1 }] },
    chest_road_1: { gold: 8, items: [] },
    chest_archive_1: { gold: 0, items: [{ id: 'ether', qty: 1 }] },
  };
  const reward = rewards[chestId] || { gold: 5, items: [] };
  return { ok: true, reward, chestId };
}

export function innRest(party, cost = 10, gold = 0) {
  if (gold < cost) return { ok: false, reason: 'no_gold', cost };
  const restored = party.map((p) => ({
    id: p.id,
    hp: p.stats.maxHp,
    mp: p.stats.maxMp,
  }));
  return { ok: true, cost, restored, goldLeft: gold - cost };
}
