import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager, MemoryAudioSettingsStore, sanitizeAudioSettings, normalizeVolume, SFX_COOLDOWN_MS, AMBIENT_MAX_GAIN } from '../../../src/engine/audio/AudioManager.js';
import { assertAudioPort } from '../../../src/core/ports/AudioPort.js';
import { SFX_IDS, AMBIENT_IDS, allAudioPaths } from '../../../src/engine/audio/AudioCatalog.js';

/** Records every call so tests can assert on what reached the output layer. */
function fakePort({ unlockOk = true, oneShotOk = true, loopOk = true, failed = [] } = {}) {
  // Outcomes are read from the object at call time, so a test can flip them mid-run.
  const port = {
    calls: [],
    unlockOk,
    oneShotOk,
    loopOk,
    unlock: async () => { port.calls.push(['unlock']); return port.unlockOk; },
    preload: (paths) => port.calls.push(['preload', paths.length]),
    playOneShot: (path, opts) => { port.calls.push(['oneshot', path, opts]); return port.oneShotOk; },
    startLoop: async (channel, opts) => { port.calls.push(['loop', channel, opts]); return port.loopOk; },
    setLoopGain: (channel, gain, fade) => port.calls.push(['gain', channel, gain, fade]),
    stopLoop: (channel, fade, delay) => port.calls.push(['stop', channel, fade, delay]),
    suspend: () => port.calls.push(['suspend']),
    resume: () => port.calls.push(['resume']),
    getFailedPaths: () => failed,
  };
  return port;
}

const tick = () => new Promise((resolve) => setImmediate(resolve));
const oneShots = (port) => port.calls.filter((c) => c[0] === 'oneshot');
const loops = (port) => port.calls.filter((c) => c[0] === 'loop');
const gains = (port) => port.calls.filter((c) => c[0] === 'gain');

function make({ port = fakePort(), store = new MemoryAudioSettingsStore(), clock = { t: 0 } } = {}) {
  const audio = new AudioManager({ port, settingsStore: store, now: () => clock.t });
  return { audio, port, store, clock };
}

describe('AudioPort contract', () => {
  it('accepts a complete port and rejects an incomplete one', () => {
    assert.doesNotThrow(() => assertAudioPort(fakePort()));
    assert.throws(() => assertAudioPort({ unlock() {} }), /AudioPort requires/);
  });
});

describe('AudioManager: unlock and autoplay rules', () => {
  it('plays nothing before the user gesture unlocks audio', () => {
    const { audio, port } = make();
    assert.equal(audio.playSfx('ui_select'), false);
    assert.equal(audio.playAmbient('forest_wind'), true, 'the wish is recorded, not played');
    assert.equal(oneShots(port).length, 0);
    assert.equal(loops(port).length, 0);
  });

  it('unlocks once, preloads every asset, and shares a single attempt', async () => {
    const { audio, port } = make();
    const [a, b] = await Promise.all([audio.unlock(), audio.unlock()]);
    assert.equal(a, true);
    assert.equal(b, true);
    assert.equal(port.calls.filter((c) => c[0] === 'unlock').length, 1);
    assert.deepEqual(port.calls.find((c) => c[0] === 'preload'), ['preload', allAudioPaths().length]);
    assert.equal(audio.unlocked, true);
  });

  it('stays locked when the port cannot start audio', async () => {
    const { audio } = make({ port: fakePort({ unlockOk: false }) });
    assert.equal(await audio.unlock(), false);
    assert.equal(audio.playSfx('ui_select'), false);
  });

  it('treats a throwing port as locked instead of crashing', async () => {
    const port = fakePort();
    port.unlock = async () => { throw new Error('no context'); };
    const { audio } = make({ port });
    assert.equal(await audio.unlock(), false);
  });

  it('starts a wanted ambience as soon as unlock succeeds', async () => {
    const { audio, port } = make();
    audio.playAmbient('village_breeze');
    await audio.unlock();
    await tick();
    const l = loops(port);
    assert.equal(l.length, 1);
    assert.equal(l[0][1], 'ambient');
    assert.equal(l[0][2].path, 'assets/audio/ambient/village_breeze.mp3');
  });
});

describe('AudioManager: sound effects', () => {
  it('plays a known sound with volume times per-sound gain', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.setSfxVolume(0.5);
    assert.equal(audio.playSfx('footstep_1'), true);
    const call = oneShots(port).at(-1);
    assert.equal(call[1], 'assets/audio/sfx/footstep_1.mp3');
    assert.ok(Math.abs(call[2].gain - 0.5 * 0.6) < 1e-9);
  });

  it('rejects ids that are not in the catalog', async () => {
    const { audio, port } = make();
    await audio.unlock();
    assert.equal(audio.playSfx('does_not_exist'), false);
    assert.equal(oneShots(port).length, 0);
  });

  it('suppresses the same sound inside its cooldown, then allows it again', async () => {
    const { audio, port, clock } = make();
    await audio.unlock();
    assert.equal(audio.playSfx('ui_select'), true);
    clock.t = SFX_COOLDOWN_MS - 1;
    assert.equal(audio.playSfx('ui_select'), false, 'rapid repeat is dropped');
    clock.t = SFX_COOLDOWN_MS + 5;
    assert.equal(audio.playSfx('ui_select'), true);
    assert.equal(oneShots(port).length, 2);
  });

  it('does not apply the cooldown to different sounds', async () => {
    const { audio } = make();
    await audio.unlock();
    assert.equal(audio.playSfx('ui_select'), true);
    assert.equal(audio.playSfx('ui_confirm'), true);
  });

  it('passes a scheduled delay through to the port', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.playSfx('reward', { delay: 0.45 });
    assert.equal(oneShots(port).at(-1)[2].delay, 0.45);
  });

  it('does not record a cooldown when the port refused to start', async () => {
    const port = fakePort({ oneShotOk: false });
    const { audio, clock } = make({ port });
    await audio.unlock();
    assert.equal(audio.playSfx('ui_select'), false);
    port.oneShotOk = true;
    clock.t = 1;
    assert.equal(audio.playSfx('ui_select'), true, 'retry is not blocked by a refused attempt');
  });

  it('missing assets do not throw; they are reported through missingAssets', async () => {
    const port = fakePort({ failed: ['assets/audio/sfx/ui_select.mp3'] });
    port.playOneShot = () => false;
    const { audio } = make({ port });
    await audio.unlock();
    assert.doesNotThrow(() => audio.playSfx('ui_select'));
    assert.deepEqual(audio.missingAssets, ['assets/audio/sfx/ui_select.mp3']);
  });
});

describe('AudioManager: volumes and mute', () => {
  it('SFX volume and ambient volume are independent', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.playAmbient('forest_wind');
    await tick();
    const before = gains(port).length;
    audio.setSfxVolume(0.2);
    assert.equal(gains(port).length, before, 'changing SFX volume does not touch the ambience channel');
    audio.setAmbientVolume(0.9);
    audio.playSfx('ui_select');
    const sfxGain = oneShots(port).at(-1)[2].gain;
    assert.ok(Math.abs(sfxGain - 0.2) < 1e-9, 'SFX gain still follows SFX volume only');
    assert.equal(audio.settings.sfxVolume, 0.2);
    assert.equal(audio.settings.ambientVolume, 0.9);
  });

  it('ambience volume updates the live loop gain immediately', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.playAmbient('road_wind');
    await tick();
    audio.setAmbientVolume(1);
    const last = gains(port).at(-1);
    assert.equal(last[1], 'ambient');
    assert.ok(Math.abs(last[2] - AMBIENT_MAX_GAIN) < 1e-9);
  });

  it('global mute silences SFX and drops ambience to zero without forgetting the track', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.playAmbient('forest_wind');
    await tick();
    audio.setMuted(true);
    assert.equal(audio.playSfx('ui_select'), false);
    assert.equal(gains(port).at(-1)[2], 0);
    assert.equal(audio.wantedAmbient, 'forest_wind');
    audio.setMuted(false);
    assert.ok(gains(port).at(-1)[2] > 0, 'unmute restores ambience gain');
    assert.equal(audio.playSfx('ui_select'), true);
  });

  it('clamps and rounds volume values to 0.1 steps', () => {
    assert.equal(normalizeVolume(0.34, 0.8), 0.3);
    assert.equal(normalizeVolume(1.7, 0.8), 1);
    assert.equal(normalizeVolume(-2, 0.8), 0);
    assert.equal(normalizeVolume(NaN, 0.4), 0.4);
    assert.equal(normalizeVolume('loud', 0.4), 0.4);
  });
});

describe('AudioManager: persistence', () => {
  it('writes changed settings to the store and restores them on a new manager', () => {
    const store = new MemoryAudioSettingsStore();
    const first = make({ store }).audio;
    first.setSfxVolume(0.3);
    first.setAmbientVolume(0.7);
    first.setMuted(true);
    const second = make({ store }).audio;
    assert.deepEqual(second.loadSettings(), { sfxVolume: 0.3, ambientVolume: 0.7, muted: true });
  });

  it('falls back to defaults for missing or damaged settings', () => {
    assert.deepEqual(sanitizeAudioSettings(null), { sfxVolume: 0.8, ambientVolume: 0.5, muted: false });
    assert.deepEqual(sanitizeAudioSettings({ sfxVolume: 'x', ambientVolume: 9, muted: 'yes' }), {
      sfxVolume: 0.8,
      ambientVolume: 1,
      muted: false,
    });
  });

  it('keeps working when the store throws', async () => {
    const store = { read: () => { throw new Error('quota'); }, write: () => { throw new Error('quota'); } };
    const { audio } = make({ store });
    audio.loadSettings();
    audio.setSfxVolume(0.4);
    await audio.unlock();
    assert.equal(audio.playSfx('ui_select'), true);
  });

  it('never writes gameplay data: the store only receives the three audio keys', () => {
    const writes = [];
    const store = { read: () => null, write: (v) => { writes.push(v); return true; } };
    const { audio } = make({ store });
    audio.setSfxVolume(0.1);
    assert.deepEqual(Object.keys(writes.at(-1)).sort(), ['ambientVolume', 'muted', 'sfxVolume']);
  });
});

describe('AudioManager: ambience channel', () => {
  it('starts one loop per track and does not stack a repeat of the same track', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.playAmbient('forest_wind');
    audio.playAmbient('forest_wind');
    await tick();
    assert.equal(loops(port).length, 1);
  });

  it('switching areas starts the new track on the same channel (crossfade is in the port)', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.playAmbient('forest_wind');
    await tick();
    audio.playAmbient('town_murmur');
    await tick();
    const l = loops(port);
    assert.equal(l.length, 2);
    assert.equal(l[1][1], 'ambient');
    assert.match(l[1][2].path, /town_murmur\.mp3$/);
  });

  it('null silences the area ambience with a fade', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.playAmbient('forest_wind');
    await tick();
    audio.playAmbient(null);
    assert.deepEqual(port.calls.at(-1).slice(0, 2), ['stop', 'ambient']);
  });

  it('pause and battle holds silence the loop and releasing them restores it', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.playAmbient('ancient_hum');
    await tick();
    audio.setAmbientHold('pause', true);
    assert.equal(gains(port).at(-1)[2], 0);
    audio.setAmbientHold('battle', true);
    audio.setAmbientHold('pause', false);
    assert.equal(gains(port).at(-1)[2], 0, 'still silent while the battle hold is active');
    assert.equal(audio.ambientHeld, true);
    audio.setAmbientHold('battle', false);
    assert.ok(gains(port).at(-1)[2] > 0);
    assert.equal(audio.ambientHeld, false);
  });

  it('unknown or music-like track ids are refused', async () => {
    const { audio, port } = make();
    await audio.unlock();
    assert.equal(audio.playAmbient('battle_theme'), false);
    assert.equal(audio.playAmbient('boss_music'), false);
    assert.equal(loops(port).length, 0);
  });

  it('a track that fails to decode can be requested again later', async () => {
    const port = fakePort({ loopOk: false });
    const { audio } = make({ port });
    await audio.unlock();
    audio.playAmbient('forest_wind');
    await tick();
    port.loopOk = true;
    audio.playAmbient(null);
    audio.playAmbient('forest_wind');
    await tick();
    assert.equal(loops(port).length, 2, 'the second request retries the failed loop');
  });

  it('a stale load that finishes after a newer request is ignored', async () => {
    const port = fakePort();
    let release;
    port.startLoop = (channel, opts) => {
      port.calls.push(['loop', channel, opts]);
      return new Promise((resolve) => { release = () => resolve(false); });
    };
    const { audio } = make({ port });
    await audio.unlock();
    audio.playAmbient('forest_wind');
    audio.playAmbient(null);
    audio.playAmbient('village_breeze');
    release();
    await tick();
    assert.equal(audio.wantedAmbient, 'village_breeze');
  });

  it('preview plays for a short time even while ambience is held', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.setAmbientHold('pause', true);
    assert.equal(audio.previewAmbient('village_breeze', 4), true);
    const start = loops(port).at(-1);
    assert.equal(start[1], 'preview');
    assert.ok(start[2].gain > 0, 'preview is audible while held');
    const stop = port.calls.filter((c) => c[0] === 'stop' && c[1] === 'preview').at(-1);
    assert.equal(stop[3], 4, 'preview stops after its duration');
  });

  it('stopAll clears the wanted track and stops both channels', async () => {
    const { audio, port } = make();
    await audio.unlock();
    audio.playAmbient('forest_wind');
    audio.stopAll();
    assert.equal(audio.wantedAmbient, null);
    const stops = port.calls.filter((c) => c[0] === 'stop').map((c) => c[1]);
    assert.ok(stops.includes('ambient') && stops.includes('preview'));
  });
});

describe('AudioManager: lifecycle', () => {
  it('suspend and resume delegate to the port and never throw', () => {
    const port = fakePort();
    const { audio } = make({ port });
    audio.suspend();
    audio.resume();
    assert.deepEqual(port.calls.map((c) => c[0]), ['suspend', 'resume']);
    port.suspend = () => { throw new Error('closed'); };
    assert.doesNotThrow(() => audio.suspend());
  });

  it('every catalog id is covered by the catalog lists', () => {
    assert.equal(new Set(SFX_IDS).size, SFX_IDS.length);
    assert.equal(new Set(AMBIENT_IDS).size, AMBIENT_IDS.length);
  });
});
