/**
 * Status effect definitions (data only). Engine reads these through BattleManager's
 * statusDefs option; the engine does not import content directly.
 *  - stacking: 'refresh' resets the duration when reapplied; 'none' ignores reapplication.
 *  - tick: damage or heal per owner turn start, as a fraction of max HP.
 *  - stat/pct: temporary modifier relative to the base stat (applied at apply time).
 *  - skipTurn: owner loses the turn. blocksSkills: owner cannot use skills.
 * Duration counts owner turn starts. Effects are battle-only and are never saved.
 */
export const STATUS_EFFECTS = Object.freeze({
  poison: { id: 'poison', name: 'Racun', stacking: 'refresh', duration: 3, tick: { kind: 'damage', pct: 0.06 } },
  regen: { id: 'regen', name: 'Pemulihan', stacking: 'refresh', duration: 3, tick: { kind: 'heal', pct: 0.06 } },
  stun: { id: 'stun', name: 'Terhenti', stacking: 'none', duration: 1, skipTurn: true },
  silence: { id: 'silence', name: 'Bisu', stacking: 'refresh', duration: 2, blocksSkills: true },
  slow: { id: 'slow', name: 'Lamban', stacking: 'refresh', duration: 3, stat: 'speed', pct: -0.3 },
  haste: { id: 'haste', name: 'Cepat', stacking: 'refresh', duration: 3, stat: 'speed', pct: 0.3 },
  attack_up: { id: 'attack_up', name: 'Serangan Naik', stacking: 'refresh', duration: 3, stat: 'attack', pct: 0.25 },
  defense_down: { id: 'defense_down', name: 'Pertahanan Turun', stacking: 'refresh', duration: 3, stat: 'defense', pct: -0.25 },
});
