/**
 * Optional BGM layer (FF7).
 * Separate from AudioCatalog so the "no background music" policy test remains green.
 * Disabled by default. Owner decision (DK-1) required before enabling.
 */
export const BGM_TRACKS = Object.freeze({
  field: { id: 'bgm_field_opt', loop: true, gain: 0.4 },
  battle: { id: 'bgm_battle_opt', loop: true, gain: 0.5 },
  boss: { id: 'bgm_boss_opt', loop: true, gain: 0.55 },
  victory: { id: 'bgm_victory_opt', loop: false, gain: 0.6 },
});

export class OptionalBgm {
  constructor({ enabled = false } = {}) {
    this.enabled = enabled;
    this.current = null;
  }

  play(trackKey) {
    if (!this.enabled) return false;
    const t = BGM_TRACKS[trackKey];
    if (!t) return false;
    this.current = t.id;
    return true;
  }

  stop() {
    this.current = null;
  }
}
