/**
 * Simple field random encounter trigger (FF5).
 * Counts steps in encounter-enabled zones and rolls against rate.
 * Deterministic when rng is injected.
 */
export class FieldEncounters {
  constructor({ rng = Math.random, zones = ['forest', 'road_bellhaven'], rate = 0.08, minSteps = 8 } = {}) {
    this.rng = rng;
    this.enabledZones = new Set(zones);
    this.rate = rate;
    this.minSteps = minSteps;
    this.steps = 0;
    this.lastZone = null;
  }

  onMove(zoneId, distance = 1) {
    if (!this.enabledZones.has(zoneId)) {
      this.steps = 0;
      this.lastZone = zoneId;
      return false;
    }
    if (zoneId !== this.lastZone) {
      this.steps = 0;
      this.lastZone = zoneId;
    }
    this.steps += Math.max(0, distance);
    if (this.steps < this.minSteps) return false;
    if (this.rng() < this.rate) {
      this.steps = 0;
      return true;
    }
    return false;
  }

  reset() {
    this.steps = 0;
  }
}
