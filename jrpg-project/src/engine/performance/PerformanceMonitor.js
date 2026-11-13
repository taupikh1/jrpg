/**
 * Lightweight frame metrics derived from GameLoop dt — no second loop.
 */
export class PerformanceMonitor {
  constructor() {
    this._samples = [];
    this._maxSamples = 60;
    this.entityCount = 0;
    this.zoneId = '';
    this.assetCount = 0;
    this.enabled = true;
  }

  /**
   * @param {number} dt - seconds
   */
  sample(dt) {
    if (!this.enabled) return;
    const ms = dt * 1000;
    this._samples.push(ms);
    if (this._samples.length > this._maxSamples) this._samples.shift();
  }

  get frameTimeMs() {
    if (!this._samples.length) return 0;
    return this._samples[this._samples.length - 1];
  }

  get avgFrameTimeMs() {
    if (!this._samples.length) return 0;
    const sum = this._samples.reduce((a, b) => a + b, 0);
    return sum / this._samples.length;
  }

  get fps() {
    const avg = this.avgFrameTimeMs;
    if (avg <= 0) return 0;
    return Math.min(120, 1000 / avg);
  }

  get longFrames() {
    return this._samples.filter((ms) => ms > 33).length;
  }

  snapshot() {
    return {
      fps: Math.round(this.fps * 10) / 10,
      frameTimeMs: Math.round(this.frameTimeMs * 10) / 10,
      avgFrameTimeMs: Math.round(this.avgFrameTimeMs * 10) / 10,
      longFrames: this.longFrames,
      entityCount: this.entityCount,
      zoneId: this.zoneId,
      assetCount: this.assetCount,
    };
  }
}
