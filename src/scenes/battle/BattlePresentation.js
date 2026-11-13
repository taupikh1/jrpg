/**
 * Lightweight battle presentation helpers (FF3).
 * Transitions, simple attack flashes, victory banner timing.
 * Does not own battle logic; scene drives it.
 */
export class BattlePresentation {
  constructor() {
    this.phase = 'idle'; // idle | intro | active | victory | defeat | escape
    this.timer = 0;
    this.introDuration = 0.6;
    this.victoryDuration = 1.2;
    this.flash = 0;
  }

  startIntro() {
    this.phase = 'intro';
    this.timer = this.introDuration;
  }

  startVictory() {
    this.phase = 'victory';
    this.timer = this.victoryDuration;
  }

  startDefeat() {
    this.phase = 'defeat';
    this.timer = 0.8;
  }

  update(dt) {
    if (this.timer > 0) {
      this.timer = Math.max(0, this.timer - dt);
      if (this.timer === 0 && this.phase === 'intro') this.phase = 'active';
    }
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 4);
  }

  triggerFlash() {
    this.flash = 0.25;
  }

  shouldBlockInput() {
    return this.phase === 'intro' || (this.phase === 'victory' && this.timer > 0.4);
  }

  getOverlayAlpha() {
    if (this.phase === 'intro') return Math.min(1, this.timer / this.introDuration);
    if (this.flash > 0) return this.flash * 0.4;
    return 0;
  }
}
