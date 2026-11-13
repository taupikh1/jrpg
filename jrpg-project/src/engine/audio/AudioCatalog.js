/**
 * Audio content catalog: which sound plays where.
 * Pure data. Asset files are produced by tools/audio/generate-audio.py.
 *
 * Policy: this game has NO background music. Every entry here is a sound effect or an
 * environmental ambience loop. A test (tests/unit/audio/AudioCatalog.test.js) enforces this.
 */

export const AUDIO_ROOT = 'assets/audio';

/** Non-looping sound effects, keyed by id. Gain is a per-sound multiplier on top of SFX volume. */
export const SFX_GAIN = Object.freeze({
  ui_open: 0.8,
  ui_close: 0.8,
  npc_talk: 0.8,
  footstep_1: 0.6,
  footstep_2: 0.6,
  footstep_3: 0.6,
  reward: 0.9,
  damage_enemy: 0.9,
});

export const SFX_IDS = Object.freeze([
  // UI and menus
  'ui_select', 'ui_confirm', 'ui_cancel', 'ui_open', 'ui_close', 'ui_notify', 'ui_error',
  'ui_save_ok', 'ui_save_fail',
  // Quests, items and exploration
  'quest_accept', 'quest_complete', 'reward', 'item_pickup', 'item_use',
  'npc_talk', 'zone_enter', 'examine',
  'footstep_1', 'footstep_2', 'footstep_3',
  // Turn-based combat
  'battle_start', 'attack_physical', 'impact_weapon', 'enemy_attack', 'damage_player',
  'damage_enemy', 'magic_cast', 'heal', 'defend', 'status_apply', 'status_recover',
  'enemy_defeat', 'party_ko', 'battle_victory', 'battle_defeat', 'battle_escape',
  // Character progression: registered for future integration, not triggered in Batch 9.3A
  'exp_gain', 'level_up', 'stat_up', 'skill_unlock',
]);

export const FOOTSTEP_IDS = Object.freeze(['footstep_1', 'footstep_2', 'footstep_3']);

/** Environmental ambience loops, keyed by track id. */
export const AMBIENT_IDS = Object.freeze([
  'forest_wind', 'village_breeze', 'road_wind', 'town_murmur', 'archive_room_tone', 'ancient_hum',
]);

/**
 * Ambience per playable zone id (ZoneManager / content/world). Zones not listed here are silent.
 * Only zones that exist in the current world are mapped; no new locations are invented.
 */
export const ZONE_AMBIENT = Object.freeze({
  village: 'village_breeze',
  forest: 'forest_wind',
  road_bellhaven: 'road_wind',
  bellhaven_gate: 'town_murmur',
  bellhaven_plaza: 'town_murmur',
  bellhaven_market: 'town_murmur',
  bellhaven_archive_hall: 'archive_room_tone',
  bellhaven_archive_stacks: 'archive_room_tone',
  bellhaven_archive_restricted: 'archive_room_tone',
  resonance_ancient_site: 'ancient_hum',
});

/** @param {string} zoneId @returns {string|null} */
export function ambientForZone(zoneId) {
  return Object.prototype.hasOwnProperty.call(ZONE_AMBIENT, zoneId) ? ZONE_AMBIENT[zoneId] : null;
}

/** @param {string} id @returns {string} relative path to the SFX file */
export function sfxPath(id) {
  return `${AUDIO_ROOT}/sfx/${id}.mp3`;
}

/** @param {string} id @returns {string} relative path to the ambience file */
export function ambientPath(id) {
  return `${AUDIO_ROOT}/ambient/${id}.mp3`;
}

/** @param {string} id @returns {number} */
export function sfxGain(id) {
  return Object.prototype.hasOwnProperty.call(SFX_GAIN, id) ? SFX_GAIN[id] : 1;
}

/** Every asset path the game can request. */
export function allAudioPaths() {
  return [...SFX_IDS.map(sfxPath), ...AMBIENT_IDS.map(ambientPath)];
}

/**
 * Next footstep variant, never repeating the previous one. Random source is injectable for tests.
 * @param {string|null} previous
 * @param {() => number} [rng]
 */
export function nextFootstepId(previous, rng = Math.random) {
  const pool = FOOTSTEP_IDS.filter((id) => id !== previous);
  return pool[Math.floor(rng() * pool.length) % pool.length];
}
