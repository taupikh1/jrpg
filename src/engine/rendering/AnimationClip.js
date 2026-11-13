/**
 * Data-driven animation clip (frame list + timing).
 */

/**
 * @typedef {Object} AnimFrame
 * @property {number} sx
 * @property {number} sy
 * @property {number} sw
 * @property {number} sh
 * @property {number} [duration] - override seconds for this frame
 */

/**
 * @typedef {Object} AnimationClipData
 * @property {string} name
 * @property {AnimFrame[]} frames
 * @property {number} [frameDuration=0.1]
 * @property {boolean} [loop=true]
 */

export class AnimationClip {
  /**
   * @param {AnimationClipData} data
   */
  constructor(data) {
    if (!data || !data.name || !Array.isArray(data.frames) || data.frames.length === 0) {
      throw new Error('AnimationClip requires name and non-empty frames');
    }
    this.name = data.name;
    this.frames = data.frames.map((f) => ({
      sx: f.sx ?? 0,
      sy: f.sy ?? 0,
      sw: f.sw ?? 16,
      sh: f.sh ?? 16,
      duration: f.duration,
    }));
    this.frameDuration = data.frameDuration ?? 0.1;
    this.loop = data.loop !== false;
  }

  get frameCount() {
    return this.frames.length;
  }

  /**
   * @param {number} index
   */
  getFrame(index) {
    const i = Math.max(0, Math.min(this.frames.length - 1, index));
    return this.frames[i];
  }

  /**
   * Duration of a specific frame in seconds.
   * @param {number} index
   */
  durationOf(index) {
    const f = this.getFrame(index);
    return f.duration ?? this.frameDuration;
  }
}
