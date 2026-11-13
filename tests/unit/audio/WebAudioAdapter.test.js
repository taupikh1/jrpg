import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WebAudioAdapter, installUnlockOnGesture } from '../../../src/platform/browser/WebAudioAdapter.js';
import { LocalAudioSettingsStore, AUDIO_SETTINGS_KEY } from '../../../src/platform/browser/AudioSettingsStore.js';
import { assertAudioPort } from '../../../src/core/ports/AudioPort.js';

const tick = () => new Promise((resolve) => setImmediate(resolve));

class FakeGain {
  constructor() {
    this.gain = {
      value: 1,
      setValueAtTime: (v) => { this.gain.value = v; },
      linearRampToValueAtTime: (v) => { this.gain.value = v; },
      cancelScheduledValues: () => {},
    };
  }
  connect() {}
  disconnect() { this.disconnected = true; }
}

class FakeSource {
  constructor() {
    this.loop = false;
    this.started = null;
    this.stopped = null;
    this.onended = null;
  }
  connect() {}
  disconnect() {}
  start(t) { this.started = t; }
  stop(t) { this.stopped = t; }
}

function fakeContext({ state = 'suspended', decodeFails = false } = {}) {
  const ctx = {
    state,
    currentTime: 10,
    destination: {},
    sources: [],
    resumeCalls: 0,
    suspendCalls: 0,
    resume() { ctx.resumeCalls++; ctx.state = 'running'; return Promise.resolve(); },
    suspend() { ctx.suspendCalls++; ctx.state = 'suspended'; return Promise.resolve(); },
    createGain: () => new FakeGain(),
    createBufferSource: () => { const s = new FakeSource(); ctx.sources.push(s); return s; },
    decodeAudioData: (buf) => (decodeFails ? Promise.reject(new Error('bad audio')) : Promise.resolve({ bytes: buf.byteLength })),
  };
  return ctx;
}

const okFetch = () => (url) => Promise.resolve({ ok: !url.includes('missing'), status: url.includes('missing') ? 404 : 200, arrayBuffer: async () => new ArrayBuffer(16) });

function adapter({ ctx = fakeContext(), fetchFn = okFetch(), maxVoices } = {}) {
  let created = 0;
  const a = new WebAudioAdapter({
    basePath: '',
    createContext: () => { created++; return ctx; },
    fetchFn,
    maxVoices,
  });
  return { a, ctx, created: () => created };
}

describe('WebAudioAdapter: port shape', () => {
  it('implements the AudioPort contract', () => {
    assert.doesNotThrow(() => assertAudioPort(new WebAudioAdapter({ createContext: () => null })));
  });
});

describe('WebAudioAdapter: unlock and suspended contexts', () => {
  it('nothing plays before unlock: there is no context yet', () => {
    const { a } = adapter();
    assert.equal(a.playOneShot('assets/audio/sfx/ui_select.mp3'), false);
    assert.equal(a.state, 'none');
  });

  it('unlock resumes a suspended context and reports running', async () => {
    const { a, ctx } = adapter();
    assert.equal(await a.unlock(), true);
    assert.equal(ctx.resumeCalls, 1);
    assert.equal(a.state, 'running');
  });

  it('creates the context only once across repeated unlock calls', async () => {
    const { a, created } = adapter();
    await a.unlock();
    await a.unlock();
    assert.equal(created(), 1);
  });

  it('reports failure cleanly when there is no AudioContext at all', async () => {
    const a = new WebAudioAdapter({ createContext: () => null });
    assert.equal(await a.unlock(), false);
  });

  it('a context that throws on creation is treated as unavailable', async () => {
    const a = new WebAudioAdapter({ createContext: () => { throw new Error('blocked'); } });
    assert.equal(await a.unlock(), false);
  });

  it('a suspended context never starts a sound (no autoplay)', async () => {
    const { a, ctx } = adapter();
    await a.unlock();
    ctx.state = 'suspended';
    a.preload(['x.mp3']);
    await tick();
    assert.equal(a.playOneShot('x.mp3'), false);
  });

  it('suspend and resume follow the page lifecycle and never throw', async () => {
    const { a, ctx } = adapter();
    await a.unlock();
    a.suspend();
    assert.equal(ctx.suspendCalls, 1);
    a.resume();
    assert.equal(ctx.resumeCalls, 2);
    a.resume(); // already running: no extra call
    assert.equal(ctx.resumeCalls, 2);
  });
});

describe('WebAudioAdapter: decoding and missing files', () => {
  it('a sound is skipped on first request, then plays once decoded (never blocks gameplay)', async () => {
    const { a } = adapter();
    await a.unlock();
    a.preload(['assets/audio/sfx/ui_select.mp3']);
    assert.equal(a.playOneShot('assets/audio/sfx/ui_select.mp3'), false, 'not decoded yet');
    await tick();
    assert.equal(a.playOneShot('assets/audio/sfx/ui_select.mp3'), true);
  });

  it('a missing file is recorded and never throws', async () => {
    const { a } = adapter();
    await a.unlock();
    a.preload(['assets/audio/sfx/missing.mp3']);
    await tick();
    assert.deepEqual(a.getFailedPaths(), ['assets/audio/sfx/missing.mp3']);
    assert.equal(a.playOneShot('assets/audio/sfx/missing.mp3'), false);
  });

  it('a file that fails to decode is recorded as failed', async () => {
    const { a } = adapter({ ctx: fakeContext({ state: 'running', decodeFails: true }) });
    await a.unlock();
    a.preload(['corrupt.mp3']);
    await tick();
    assert.deepEqual(a.getFailedPaths(), ['corrupt.mp3']);
  });
});

describe('WebAudioAdapter: one-shot sounds', () => {
  it('schedules on the audio clock with the requested gain and delay', async () => {
    const { a, ctx } = adapter({ ctx: fakeContext({ state: 'running' }) });
    await a.unlock();
    a.preload(['s.mp3']);
    await tick();
    assert.equal(a.playOneShot('s.mp3', { gain: 0.4, delay: 0.25 }), true);
    const src = ctx.sources.at(-1);
    assert.equal(src.started, 10.25);
  });

  it('caps simultaneous voices and frees a slot when a sound ends', async () => {
    const { a, ctx } = adapter({ ctx: fakeContext({ state: 'running' }), maxVoices: 2 });
    await a.unlock();
    a.preload(['s.mp3']);
    await tick();
    assert.equal(a.playOneShot('s.mp3'), true);
    assert.equal(a.playOneShot('s.mp3'), true);
    assert.equal(a.playOneShot('s.mp3'), false, 'third voice is dropped');
    ctx.sources[0].onended();
    assert.equal(a.playOneShot('s.mp3'), true, 'a finished voice frees its slot');
  });
});

describe('WebAudioAdapter: looping channels', () => {
  it('a loop is marked as looping and fades in', async () => {
    const { a, ctx } = adapter({ ctx: fakeContext({ state: 'running' }) });
    await a.unlock();
    assert.equal(await a.startLoop('ambient', { path: 'a.mp3', gain: 0.3, fadeInSec: 0.5 }), true);
    const src = ctx.sources.at(-1);
    assert.equal(src.loop, true);
    assert.equal(src.started, 10);
  });

  it('starting a new loop on the same channel stops the previous one (crossfade)', async () => {
    const { a, ctx } = adapter({ ctx: fakeContext({ state: 'running' }) });
    await a.unlock();
    await a.startLoop('ambient', { path: 'a.mp3' });
    await a.startLoop('ambient', { path: 'b.mp3' });
    const [first, second] = ctx.sources;
    assert.ok(first.stopped !== null, 'previous loop is stopped after its fade');
    assert.equal(second.stopped, null);
  });

  it('stopLoop fades out and honours a delay (preview duration)', async () => {
    const { a, ctx } = adapter({ ctx: fakeContext({ state: 'running' }) });
    await a.unlock();
    await a.startLoop('preview', { path: 'p.mp3' });
    a.stopLoop('preview', 0.3, 4);
    const src = ctx.sources.at(-1);
    assert.ok(src.stopped >= 14, 'stop is scheduled after the delay');
  });

  it('a loop that cannot load returns false and does not leave a dangling channel', async () => {
    const { a } = adapter({ ctx: fakeContext({ state: 'running' }), fetchFn: okFetch() });
    await a.unlock();
    assert.equal(await a.startLoop('ambient', { path: 'missing.mp3' }), false);
  });
});

describe('installUnlockOnGesture', () => {
  function fakeTarget() {
    const listeners = new Map();
    return {
      listeners,
      addEventListener(type, fn) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(fn);
      },
      removeEventListener(type, fn) {
        listeners.get(type)?.delete(fn);
      },
      count() {
        let n = 0;
        for (const s of listeners.values()) n += s.size;
        return n;
      },
      fire(type) {
        for (const fn of [...(listeners.get(type) ?? [])]) fn({});
      },
    };
  }

  it('listens for taps, touches and keys, and calls the unlock on the first one', async () => {
    const target = fakeTarget();
    let calls = 0;
    installUnlockOnGesture(target, async () => { calls++; return false; });
    target.fire('touchend');
    await tick();
    assert.equal(calls, 1);
    assert.ok(target.count() > 0, 'keeps listening until audio is actually unlocked');
  });

  it('removes every listener once unlock succeeds', async () => {
    const target = fakeTarget();
    installUnlockOnGesture(target, async () => true);
    target.fire('pointerdown');
    await tick();
    assert.equal(target.count(), 0);
  });

  it('does not run the unlock again while one attempt is in flight', async () => {
    const target = fakeTarget();
    let calls = 0;
    installUnlockOnGesture(target, () => { calls++; return new Promise(() => {}); });
    target.fire('pointerdown');
    target.fire('pointerdown');
    target.fire('keydown');
    await tick();
    assert.equal(calls, 1);
  });

  it('the disposer removes listeners without unlocking', () => {
    const target = fakeTarget();
    const dispose = installUnlockOnGesture(target, async () => true);
    dispose();
    assert.equal(target.count(), 0);
  });
});

describe('LocalAudioSettingsStore', () => {
  function memStorage() {
    const data = new Map();
    return {
      data,
      getItem: (k) => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => data.set(k, String(v)),
    };
  }

  it('round-trips settings under its own key', () => {
    const storage = memStorage();
    const store = new LocalAudioSettingsStore({ storage });
    assert.equal(store.write({ sfxVolume: 0.2 }), true);
    assert.deepEqual(new LocalAudioSettingsStore({ storage }).read(), { sfxVolume: 0.2 });
    assert.ok(storage.data.has(AUDIO_SETTINGS_KEY));
    assert.equal(AUDIO_SETTINGS_KEY.includes('save'), false, 'does not share the gameplay save key');
  });

  it('returns null for corrupt JSON and never throws', () => {
    const storage = memStorage();
    storage.setItem(AUDIO_SETTINGS_KEY, '{not json');
    assert.equal(new LocalAudioSettingsStore({ storage }).read(), null);
  });

  it('reports failure instead of throwing when storage is unavailable', () => {
    const store = new LocalAudioSettingsStore({ storage: null });
    assert.equal(store.write({ a: 1 }), false);
    assert.equal(store.read(), null);
  });
});
