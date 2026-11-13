import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Animator } from '../../../src/engine/rendering/Animator.js';
import { AnimationClip } from '../../../src/engine/rendering/AnimationClip.js';

describe('AnimationClip', () => {
  it('rejects empty frames', () => {
    assert.throws(() => new AnimationClip({ name: 'x', frames: [] }), /frames/);
  });

  it('stores frames and duration', () => {
    const clip = new AnimationClip({
      name: 'walk',
      frameDuration: 0.1,
      frames: [
        { sx: 0, sy: 0, sw: 16, sh: 16 },
        { sx: 16, sy: 0, sw: 16, sh: 16 },
      ],
    });
    assert.equal(clip.frameCount, 2);
    assert.equal(clip.durationOf(0), 0.1);
  });
});

describe('Animator', () => {
  function make() {
    const a = new Animator();
    a.addClip({
      name: 'walk',
      frameDuration: 0.1,
      loop: true,
      frames: [
        { sx: 0, sy: 0, sw: 8, sh: 8 },
        { sx: 8, sy: 0, sw: 8, sh: 8 },
        { sx: 16, sy: 0, sw: 8, sh: 8 },
      ],
    });
    a.addClip({
      name: 'once',
      frameDuration: 0.1,
      loop: false,
      frames: [
        { sx: 0, sy: 0, sw: 8, sh: 8 },
        { sx: 8, sy: 0, sw: 8, sh: 8 },
      ],
    });
    return a;
  }

  it('advances frames with delta time', () => {
    const a = make();
    a.play('walk');
    assert.equal(a.frameIndex, 0);
    a.update(0.1);
    assert.equal(a.frameIndex, 1);
    a.update(0.1);
    assert.equal(a.frameIndex, 2);
  });

  it('loops', () => {
    const a = make();
    a.play('walk');
    a.update(0.1);
    a.update(0.1);
    a.update(0.1);
    assert.equal(a.frameIndex, 0);
    assert.equal(a.isPlaying, true);
  });

  it('non-loop finishes and stops', () => {
    const a = make();
    let done = null;
    a.onComplete = (n) => {
      done = n;
    };
    a.play('once');
    a.update(0.1);
    a.update(0.1);
    assert.equal(a.isFinished, true);
    assert.equal(a.isPlaying, false);
    assert.equal(done, 'once');
    assert.equal(a.frameIndex, 1);
  });

  it('pause and resume', () => {
    const a = make();
    a.play('walk');
    a.update(0.1);
    assert.equal(a.frameIndex, 1);
    a.pause();
    a.update(0.5);
    assert.equal(a.frameIndex, 1);
    a.resume();
    a.update(0.1);
    assert.equal(a.frameIndex, 2);
  });

  it('stop resets', () => {
    const a = make();
    a.play('walk');
    a.update(0.2);
    a.stop();
    assert.equal(a.frameIndex, 0);
    assert.equal(a.isPlaying, false);
  });

  it('getCurrentFrame returns source rect', () => {
    const a = make();
    a.play('walk');
    const f = a.getCurrentFrame();
    assert.deepEqual(f, { sx: 0, sy: 0, sw: 8, sh: 8 });
  });
});
