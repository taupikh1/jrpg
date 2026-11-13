import { AnimationClip } from './AnimationClip.js';

/**
 * Plays AnimationClips with delta-time based frame progression.
 */
export class Animator {
  constructor() {
    /** @type {Map<string, AnimationClip>} */
    this._clips = new Map();
    /** @type {AnimationClip|null} */
    this._current = null;
    this._frameIndex = 0;
    this._elapsed = 0;
    this._playing = false;
    this._finished = false;
    /** @type {((name: string) => void)|null} */
    this.onComplete = null;
  }

  /**
   * @param {AnimationClip|import('./AnimationClip.js').AnimationClipData} clipOrData
   */
  addClip(clipOrData) {
    const clip = clipOrData instanceof AnimationClip ? clipOrData : new AnimationClip(clipOrData);
    this._clips.set(clip.name, clip);
    return clip;
  }

  /**
   * @param {string} name
   * @param {boolean} [restart=true]
   */
  play(name, restart = true) {
    const clip = this._clips.get(name);
    if (!clip) {
      throw new Error(`Animation clip "${name}" not found`);
    }
    if (this._current === clip && !restart && this._playing) return;
    this._current = clip;
    this._frameIndex = 0;
    this._elapsed = 0;
    this._playing = true;
    this._finished = false;
  }

  pause() {
    this._playing = false;
  }

  resume() {
    if (this._current && !this._finished) this._playing = true;
  }

  stop() {
    this._playing = false;
    this._frameIndex = 0;
    this._elapsed = 0;
    this._finished = false;
  }

  reset() {
    this._frameIndex = 0;
    this._elapsed = 0;
    this._finished = false;
  }

  /**
   * @param {number} dt - seconds
   */
  update(dt) {
    if (!this._playing || !this._current || this._finished) return;

    this._elapsed += dt;
    let guard = 0;
    while (guard++ < 32) {
      const dur = this._current.durationOf(this._frameIndex);
      if (this._elapsed < dur) break;
      this._elapsed -= dur;
      if (this._frameIndex + 1 >= this._current.frameCount) {
        if (this._current.loop) {
          this._frameIndex = 0;
        } else {
          this._frameIndex = this._current.frameCount - 1;
          this._playing = false;
          this._finished = true;
          if (this.onComplete) this.onComplete(this._current.name);
          break;
        }
      } else {
        this._frameIndex += 1;
      }
    }
  }

  get currentClipName() {
    return this._current?.name ?? null;
  }

  get frameIndex() {
    return this._frameIndex;
  }

  get isPlaying() {
    return this._playing;
  }

  get isFinished() {
    return this._finished;
  }

  /**
   * Current source rectangle for the active frame, or null.
   * @returns {{ sx: number, sy: number, sw: number, sh: number }|null}
   */
  getCurrentFrame() {
    if (!this._current) return null;
    const f = this._current.getFrame(this._frameIndex);
    return { sx: f.sx, sy: f.sy, sw: f.sw, sh: f.sh };
  }
}
