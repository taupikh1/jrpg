/**
 * Audio output contract. Implemented by platform/browser/WebAudioAdapter.js.
 * Engine code talks only to this port, never to AudioContext or HTMLAudioElement.
 *
 * @typedef {Object} AudioPort
 * @property {() => Promise<boolean>} unlock - Create or resume the output from a user gesture. Resolves true when audio can play.
 * @property {(paths: string[]) => void} preload - Decode assets in the background. Never blocks gameplay.
 * @property {(path: string, opts?: { gain?: number, delay?: number }) => boolean} playOneShot - Start a non-looping sound. False when not ready, missing or over the voice limit.
 * @property {(channel: string, opts: { path: string, gain?: number, fadeInSec?: number }) => Promise<boolean>} startLoop - Start a loop on a named channel, crossfading away from the previous loop on that channel.
 * @property {(channel: string, gain: number, fadeSec?: number) => void} setLoopGain - Change a channel's gain smoothly.
 * @property {(channel: string, fadeSec?: number, delaySec?: number) => void} stopLoop - Fade out and stop a channel, optionally after a delay.
 * @property {() => void} suspend - Pause output (app hidden or tab in background).
 * @property {() => void} resume - Resume output after suspend.
 * @property {() => string[]} getFailedPaths - Asset paths that failed to load or decode.
 */

/**
 * Runtime shape check for AudioPort.
 * @param {unknown} obj
 * @returns {asserts obj is AudioPort}
 */
export function assertAudioPort(obj) {
  const required = [
    'unlock', 'preload', 'playOneShot', 'startLoop', 'setLoopGain',
    'stopLoop', 'suspend', 'resume', 'getFailedPaths',
  ];
  for (const name of required) {
    if (!obj || typeof obj[name] !== 'function') {
      throw new TypeError(`AudioPort requires a ${name}() method`);
    }
  }
}
