import { Config } from '../core/Config.js';
import { RenderPipeline } from '../engine/rendering/RenderPipeline.js';
import { SpriteRenderer } from '../engine/rendering/SpriteRenderer.js';
import { ZoneManager } from '../engine/world/zones/ZoneManager.js';
import { DEMO_TILESET, ZONE_VILLAGE, ZONE_FOREST, ZONE_ROAD_BELLHAVEN } from '../../content/world/demo-data.js';
import { BELLHAVEN_ZONES } from '../../content/world/bellhaven-data.js';
import { ARCHIVE_ZONES } from '../../content/world/archive-data.js';
import { CHAPTER_02_DIALOGUES } from '../../content/dialogue/arc_01/chapter_02.js';
import { CHAPTER_02_PARTY } from '../../content/dialogue/party/ch2_party.js';
import { CHAPTER_02_QUESTS } from '../../content/quests/arc_01/quest_ch2_main.js';
import { CHAPTER_04_DIALOGUES } from '../../content/dialogue/arc_01/chapter_04.js';
import { CHAPTER_05_DIALOGUES } from '../../content/dialogue/arc_01/chapter_05.js';
import { CHAPTER_05_PARTY } from '../../content/dialogue/party/ch5_party.js';
import { CHAPTER_06_PARTY } from '../../content/dialogue/party/ch6_party.js';
import { CHAPTER_07_PARTY } from '../../content/dialogue/party/ch7_party.js';
import { CHAPTER_08_PARTY } from '../../content/dialogue/party/ch8_party.js';
import {
  PARTY_MEMBER_DEFS as CORE_PARTY_MEMBER_DEFS,
  MAX_ACTIVE_PARTY_SIZE,
  getActivePartyIds,
  getPartyRosterSnapshot,
  restorePartyRosterFlags,
} from '../engine/gameplay/party/PartyRoster.js';
import { CHAPTER_05_QUESTS } from '../../content/quests/arc_01/quest_ch5_main.js';
import { RESONANCE_ZONES } from '../../content/world/resonance-site-data.js';
import { CHAPTER_04_PARTY } from '../../content/dialogue/party/ch4_party.js';
import { CHAPTER_04_QUESTS } from '../../content/quests/arc_01/quest_ch4_main.js';
import { BH_DIALOGUES } from '../../content/dialogue/npcs/bellhaven_npcs.js';
import { CHAPTER_03_DIALOGUES } from '../../content/dialogue/arc_01/chapter_03.js';
import { CHAPTER_03_PARTY } from '../../content/dialogue/party/ch3_party.js';
import { QUEST_CH3_JEJAK } from '../../content/quests/arc_01/quest_ch3_main.js';
import { BELLHAVEN_QUESTS } from '../../content/quests/arc_01/bellhaven_quests.js';
import { STATUS_EFFECTS } from '../../content/combat/status_effects.js';
import { Entity } from '../engine/entities/Entity.js';
import { bindAudioEvents } from '../engine/audio/AudioEventBridge.js';
import { ambientForZone, nextFootstepId } from '../engine/audio/AudioCatalog.js';
import { EntityManager } from '../engine/entities/EntityManager.js';
import { MovementComponent } from '../engine/entities/components/MovementComponent.js';
import { SpriteComponent } from '../engine/entities/components/SpriteComponent.js';
import { BATTLE_LAYOUT, partySlot, enemySlot } from './battle/BattleLayout.js';
import { BattlePresentation } from './battle/BattlePresentation.js';
import { FieldEncounters } from '../engine/world/FieldEncounters.js';
import { PixelArt } from '../engine/rendering/pixelart/PixelArt.js';
import { preloadEnemyVisuals, drawExternalEnemy } from '../engine/assets/ExternalEnemySprites.js';
import { InteractionComponent } from '../engine/entities/components/InteractionComponent.js';
import { PlayerController } from '../engine/entities/controllers/PlayerController.js';
import { InteractionSystem } from '../engine/entities/systems/InteractionSystem.js';
import { ItemRegistry } from '../engine/gameplay/items/ItemRegistry.js';
import { Inventory } from '../engine/gameplay/inventory/Inventory.js';
import { CharacterStats } from '../engine/gameplay/stats/CharacterStats.js';
import { Equipment } from '../engine/gameplay/equipment/Equipment.js';
import { DialogueEngine } from '../engine/gameplay/dialogue/DialogueEngine.js';
import { QuestLog } from '../engine/gameplay/quests/QuestLog.js';
import { BattleManager } from '../engine/gameplay/battle/BattleManager.js';
import { ProgressionSystem } from '../engine/gameplay/progression/ProgressionSystem.js';
import { CHARACTER_PROGRESSION } from '../../content/characters/progression.js';
import { getEnemyDefinition } from '../../content/enemies/arc_01.js';
import { createEnemyParticipant } from '../engine/gameplay/battle/createEnemyParticipant.js';
import { createBossParticipant } from '../engine/gameplay/battle/createBossParticipant.js';
import { getBossById } from '../../content/bosses/index.js';
import {
  ITEMS,
  DIALOGUE_GUARD,
  DIALOGUE_SIGN,
  QUEST_COLLECT_WOOD,
  SKILL_HEAL,
  SKILL_FIRE,
} from '../../content/gameplay/demo-content.js';

/** Mira's distinct support skill. Slightly stronger heal, higher cost. */
const MIRA_SKILL_MEND = {
  id: 'mira_mend',
  name: 'Jahitan Lembut',
  mpCost: 6,
  power: 28,
  type: 'heal',
};
/** Mira's light magic attack — weaker than Orin's Ember but faster character. */
const MIRA_SKILL_SPARK = {
  id: 'mira_spark',
  name: 'Percikan',
  mpCost: 3,
  power: 11,
  type: 'magical',
  element: 'light',
};
import {
  CHAPTER_01_DIALOGUES,
  DIALOGUE_CH1_OPENING,
} from '../../content/dialogue/arc_01/chapter_01.js';
import { DIALOGUE_CH1_CRAFT_JAREK } from '../../content/dialogue/npcs/ashwillow_npcs.js';
import { CHAPTER_01_PARTY_DIALOGUES } from '../../content/dialogue/party/ch1_party.js';
import {
  QUEST_PAGAR_UTARA,
  DIALOGUE_QUEST_PAGAR_ACCEPT,
  DIALOGUE_QUEST_PAGAR_PROGRESS,
  DIALOGUE_QUEST_PAGAR_COMPLETE,
} from '../../content/quests/arc_01/quest_pagar_utara.js';
import { ROAD_BELLHAVEN_DIALOGUES } from '../../content/dialogue/npcs/road_bellhaven_npcs.js';
import { chapterHookMessage } from '../../content/gameplay/chapter-notifications.js';
import { QUEST_BUNGA_JALAN, ROAD_FLOWER_SPAWNS } from '../../content/quests/arc_01/quest_bunga_jalan.js';
import { SaveManager } from '../engine/persistence/SaveManager.js';
import { wrapLines } from '../engine/rendering/TextWrap.js';
import {
  UI_COLORS, drawPanel, drawRow, drawBar, fitText, drawFittedText, drawContinueIndicator, drawSpeakerTag,
} from '../engine/rendering/UiKit.js';
import {
  TOAST, BATTLE_COMMANDS, BATTLE_COMMAND_HELP, BATTLE_STATUS_SHORT, battleStatusLabel, battleAffinityMessage, battlePhaseMessage, localizeBattleLog, localizeReason, localizePrompt, objectiveLabel,
} from '../../content/ui/player-text.js';
import { MemoryStorageAdapter } from '../engine/persistence/MemoryStorageAdapter.js';
import { PerformanceMonitor } from '../engine/performance/PerformanceMonitor.js';

/** Stable runtime IDs; Chapter 7/8 additions follow the Character Bible. */
const PARTY_MEMBER_DEFS = Object.freeze({
  ...CORE_PARTY_MEMBER_DEFS,
  // The newest Arc II recruit takes the fourth active slot; the earlier recruit remains in reserve.
  tavi: Object.freeze({ id: 'tavi', joinFlag: 'ch8_tavi_joined', leaveFlags: Object.freeze(['ch8_tavi_departed']) }),
  iven: Object.freeze({ id: 'iven', joinFlag: 'ch7_iven_joined', leaveFlags: Object.freeze(['ch7_iven_departed']) }),
});

function snapshotCurrentHpMp(stats) {
  return stats ? { hp: stats.hp, mp: stats.mp } : null;
}

/**
 * Story chain: after a dialogue completes for the first time, start the listed dialogue.
 * Arc I order (D1): First Resonance → aftermath → party banter → Unseen Observer → finale.
 * Replays of a step (e.g. re-talking to the activation stone) do not restart the chain.
 */
const DIALOGUE_CHAIN = {
  ch2_memory_trace: 'ch2_resonance_event',
  ch2_northern_path: 'ch2_finale',
  ch5_first_resonance: 'ch5_after_resonance',
  ch5_after_resonance: 'ch5_banter_after_resonance',
  ch5_banter_after_resonance: 'ch5_unseen_observer',
  ch5_unseen_observer: 'ch5_arc1_finale',
  ch5_banter_departure: 'ch6_kael_recruitment',
  ch6_kael_recruitment: 'ch6_party_first_watch',
};

/** Chapter 4 archive records; reading all three triggers the resonance beat. */
const CH4_RECORD_FLAGS = Object.freeze(['ch4_record_east', 'ch4_record_center', 'ch4_record_west']);

/** Party banter is non-critical and may be deferred after repeated start failures. */
const MAX_START_ATTEMPTS = 3;
/** Story-chain steps are critical progression; retry with a capped delay instead of dropping them. */
const STORY_RETRY_BASE_SECONDS = 1;
const STORY_RETRY_MAX_SECONDS = 8;

/** After this dialogue completes, queue the listed party banter (once). */
export const PARTY_AFTER_DIALOGUE = {
  ch2_forest_entry: 'ch2_party_forest_entry',
  ch2_first_echo: 'ch2_party_first_echo',
  ch2_old_stone_path: 'ch2_party_carvings',
  ch2_resonance_event: 'ch2_party_resonance',
  ch2_finale: 'ch2_party_departure',
  ch3_road_bellhaven_first_view: 'ch3_party_road_bellhaven',
  ch3_gate_entry_dira: 'ch3_party_gate_bell',
  ch3_market_venn_index_clue: 'ch3_party_market_names',
  ch3_plaza_fountain_missing_note: 'ch3_party_fountain_echo',
  ch3_archive_garet_warning: 'ch3_party_archive_door',
  ch4_archive_first_entry: 'ch4_party_archive_entry',
  ch4_edda_brother_memory: 'ch4_party_edda_memory',
  ch4_three_records_resonance: 'ch4_party_three_records',
  ch4_restricted_archive_entry: 'ch4_party_restricted_room',
  ch4_maera_finale: 'ch4_party_archive_departure',
  ch5_fragment_awakens: 'ch5_banter_fragment',
  ch5_memories_we_carry: 'ch5_banter_memories',
  ch5_obj_mural: 'ch5_banter_puzzle',
  ch5_arc1_finale: 'ch5_banter_departure',
};

/** Zone gates by chapter progress (D3). Remove an entry to open that zone again. */
const ZONE_GATES = {
  road_bellhaven: { flag: 'ch2_completed', msg: 'Jalan menuju Bellhaven masih belum bisa dilalui. Ada sesuatu di Hutan Berbisik yang belum kita selesaikan.' },
  bellhaven_gate: { flag: 'ch2_completed', msg: 'Gerbang Bellhaven belum terbuka. Selesaikan Bab 2 dulu.' },
  bellhaven_plaza: { flag: 'ch2_completed', msg: 'Alun-alun belum terbuka. Selesaikan Bab 2 dulu.' },
  bellhaven_market: { flag: 'ch2_completed', msg: 'Pasar belum terbuka. Selesaikan Bab 2 dulu.' },
  bellhaven_archive_hall: { flag: 'ch3_completed', msg: 'Arsip belum terbuka. Selesaikan Bab 3 dulu.' },
  resonance_ancient_site: { flag: 'ch4_completed', msg: 'Situs kuno belum terbuka. Selesaikan Bab 4 dulu.' },
};

/**
 * Main quest per chapter (Batch 9.2). Accepted when the chapter's first story beat starts, so the
 * quest log shows the objectives and flag progress/rewards actually apply in real play.
 * `flagsKey` names the scene flag table that feeds the quest's flag objectives.
 */
export const MAIN_QUEST_CHAPTERS = Object.freeze({
  quest_ch2_suara_hutan: { flagsKey: '_ch2Flags', prefix: 'ch2_' },
  quest_ch3_jejak_yang_kosong: { flagsKey: '_ch3Flags', prefix: 'ch3_' },
  quest_ch4_arsip_tanpa_nama: { flagsKey: '_ch4Flags', prefix: 'ch4_' },
  quest_ch5_resonansi_pertama: { flagsKey: '_ch5Flags', prefix: 'ch5_' },
});

const PAUSE_PANEL = Object.freeze({ y: 22, w: 200, h: 196 });
const PAUSE_MAIN_ITEMS = Object.freeze([
  { id: 'resume', label: 'Lanjutkan' },
  { id: 'inventory', label: 'Inventaris' },
  { id: 'quest', label: 'Catatan Quest' },
  { id: 'status', label: 'Status & Skill' },
  { id: 'save', label: 'Simpan Permainan' },
  { id: 'audio', label: 'Pengaturan Audio' },
  { id: 'menu', label: 'Kembali ke Menu Utama' },
]);
const PAUSE_CONFIRM_ITEMS = Object.freeze([
  { id: 'confirm_menu', label: 'Ya, kembali ke menu' },
  { id: 'cancel', label: 'Batal' },
]);
const PAUSE_AUDIO_ITEMS = Object.freeze([
  { id: 'audio_sfx', label: 'Efek suara' },
  { id: 'audio_ambient', label: 'Ambience' },
  { id: 'audio_mute', label: 'Senyap' },
  { id: 'audio_test_sfx', label: 'Tes efek suara' },
  { id: 'audio_test_ambient', label: 'Tes ambience' },
  { id: 'audio_back', label: 'Kembali' },
]);
/** Sound family per skill id. Unknown ids fall back to 'magic' in the audio bridge. */
const SKILL_KIND_BY_ID = Object.freeze({
  [MIRA_SKILL_MEND.id]: 'heal',
  [MIRA_SKILL_SPARK.id]: 'magic',
  mira_light_bind: 'magic',
  [SKILL_FIRE.id]: 'magic',
  [SKILL_HEAL.id]: 'heal',
  orin_surge: 'magic',
  iven_quick_cut: 'physical',
  iven_quickstep: 'magic',
  iven_smoke_bomb: 'magic',
  iven_shadow_route: 'magic',
  tavi_spark_trap: 'magic',
  tavi_field_patch: 'heal',
  tavi_snare_device: 'physical',
  tavi_critter_call: 'magic',
});
const DEBUG_BOSS_KEYS = Object.freeze({
  Digit1: 'warden_of_first_resonance', Digit2: 'oathbreaker_colossus',
  Digit3: 'verdant_memory_heart', Digit4: 'regent_of_unwritten',
  Digit5: 'lattice_origin_colossus', Digit6: 'vaelor_senn_resonant_form',
  Digit7: 'archive_veilkeeper', Digit8: 'starfall_astral_mantid',
});
/** Footstep rhythm: one step per this many logical pixels travelled. */
const FOOTSTEP_DISTANCE = 14;
/** Larger per-frame jumps are teleports (safe-position resets), not walking. */
const FOOTSTEP_MAX_JUMP = 24;

/** Row rectangle for a pause item, in logical pixels. Used for drawing and tap hit-testing. */
function pauseRowRect(sub, index, logicalWidth = Config.LOGICAL_WIDTH) {
  const top = sub === 'confirm' ? 80 : sub === 'main' ? 48 : 50;
  const step = sub === 'main' ? 20 : 25;
  const h = sub === 'main' ? 18 : 20;
  const panelX = (logicalWidth - PAUSE_PANEL.w) / 2;
  return { x: panelX + 16, y: top + index * step, w: PAUSE_PANEL.w - 32, h };
}

/** Index of the pause row under (x, y), or -1. */
function pauseRowAt(sub, x, y, logicalWidth = Config.LOGICAL_WIDTH) {
  const items = sub === 'confirm' ? PAUSE_CONFIRM_ITEMS : sub === 'audio' ? PAUSE_AUDIO_ITEMS : PAUSE_MAIN_ITEMS;
  for (let i = 0; i < items.length; i++) {
    const r = pauseRowRect(sub, i, logicalWidth);
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

/**
 * Batch 5 integrated gameplay demo.
 * Modes: world | dialogue | inventory | battle
 */
export class GameplayDemoScene {
  constructor(options = {}) {
    this._saveAdapter = options.saveAdapter ?? null;
    /** Developer HUD (demo labels, controls, perf stats). Off for players; enabled via ?debug=1. */
    this._debugHud = !!options.debugHud;
    /** Provided by the composition root; leaves gameplay and shows the main menu. */
    this._onReturnToMenu = options.onReturnToMenu ?? null;
    /**
     * Optional () => ({ left, right }) in logical px: space the HUD must keep clear for the notch /
     * rounded corners and the on-screen MENU button. Absent in tests and on desktop.
     */
    this._hudInsets = typeof options.hudInsets === 'function' ? options.hudInsets : null;
    this._pendingContinue = false;
    this._pauseSub = 'main';
    this._pauseIndex = 0;
    this._pauseNotice = '';
    this._leaving = false;
    this._uiTime = 0;
    this._overlayReturn = 'world';
    this._questIndex = 0;
    this._statusMemberIdx = 0;
    this._levelUpQueue = [];
    this.mode = 'world';
    this.pipeline = null;
    this.zones = null;
    this.entities = null;
    this.player = null;
    this.controller = null;
    this.interaction = null;
    this.registry = null;
    this.inventory = null;
    this.stats = null;
    this.progression = null;
    this.equipment = null;
    this.dialogue = null;
    this.quests = null;
    this.battle = null;
    this._input = null;
    this._events = null;
    this._toast = '';
    this._toastT = 0;
    this._choiceIndex = 0;
    this._invIndex = 0;
    this._battleCmd = 0;
    this._battleTarget = 0;
    this._battleSub = 'cmd';
    this._battleSubIndex = 0;
    this._battleSummary = null;
    this._battleSource = 'debug';
    this._battleBossDef = null;
    this._bossFlags = Object.create(null);
    this._battleEventUnsubs = [];
    this._battleDialogueActive = false;
    this.gold = 20; // demo starting gold for shops
    this.miraStats = null;
    this.kaelStats = null;
    this.ivenStats = null;
    this.taviStats = null;
    this.saveManager = null;
    this.perf = null;
  }

  init(data = {}) {
    preloadEnemyVisuals().catch(() => {});
    this._input = data.input;
    this._events = data.events;
    this._audio = data.audio ?? null;
    if (this._audio && data.events) {
      this._audioUnbind = bindAudioEvents(data.events, this._audio, {
        isEnemy: (id) => this.battle?.participants?.find((p) => p.id === id)?.side === 'enemy',
        skillKindOf: (id) => SKILL_KIND_BY_ID[id] ?? 'magic',
        ambientForZone,
      });
    }

    this.registry = new ItemRegistry();
    for (const it of ITEMS) this.registry.register(it);

    this.inventory = new Inventory({ registry: this.registry, capacity: 20, events: data.events });
    this.progression = new ProgressionSystem({ events: data.events });
    this.stats = new CharacterStats({ maxHp: 60, maxMp: 25, attack: 12, defense: 6, speed: 12 });
    // Mira: faster, higher magic, lower HP. Independent from Orin's exploration stats.
    this.miraStats = new CharacterStats({
      maxHp: 48, maxMp: 32, attack: 9, defense: 5, speed: 14,
      magicAttack: 14, magicDefense: 6,
    });
    this.kaelStats = new CharacterStats({
      maxHp: 72, maxMp: 18, attack: 13, defense: 11, speed: 8,
      magicAttack: 5, magicDefense: 8,
    });
    this.ivenStats = new CharacterStats(CHARACTER_PROGRESSION.iven.baseStats);
    this.taviStats = new CharacterStats(CHARACTER_PROGRESSION.tavi.baseStats);
    this.progression.syncStats('orin', this.stats);
    this.progression.syncStats('mira', this.miraStats);
    this.progression.syncStats('kael', this.kaelStats);
    this.progression.syncStats('iven', this.ivenStats);
    this.progression.syncStats('tavi', this.taviStats);
    this.equipment = new Equipment({
      inventory: this.inventory,
      stats: this.stats,
      registry: this.registry,
      events: data.events,
    });

    this.dialogue = new DialogueEngine(data.events);
    this.dialogue.register(DIALOGUE_GUARD);
    this.dialogue.register(DIALOGUE_SIGN);
    for (const d of CHAPTER_01_DIALOGUES) this.dialogue.register(d);
    this.dialogue.register(DIALOGUE_CH1_CRAFT_JAREK);
    for (const d of CHAPTER_01_PARTY_DIALOGUES) this.dialogue.register(d);
    this.dialogue.register(DIALOGUE_QUEST_PAGAR_ACCEPT);
    this.dialogue.register(DIALOGUE_QUEST_PAGAR_PROGRESS);
    this.dialogue.register(DIALOGUE_QUEST_PAGAR_COMPLETE);

    this.quests = new QuestLog(data.events);
    this.quests.register(QUEST_COLLECT_WOOD);
    this.quests.register(QUEST_BUNGA_JALAN);
    for (const q of BELLHAVEN_QUESTS) this.quests.register(q);
    this.quests.register(QUEST_CH3_JEJAK);
    for (const q of CHAPTER_02_QUESTS) this.quests.register(q);
    for (const q of CHAPTER_04_QUESTS) this.quests.register(q);
    for (const q of CHAPTER_05_QUESTS) this.quests.register(q);
    for (const d of ROAD_BELLHAVEN_DIALOGUES) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of BH_DIALOGUES) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_03_DIALOGUES) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_03_PARTY) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_02_DIALOGUES) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_02_PARTY) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_04_DIALOGUES) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_04_PARTY) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_05_DIALOGUES) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_05_PARTY) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_06_PARTY) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_07_PARTY) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    for (const d of CHAPTER_08_PARTY) {
      try { this.dialogue.register(d); } catch (_) {}
    }
    this.quests.register(QUEST_PAGAR_UTARA);
    this._ch1Flags = Object.create(null);
    this._ch3Flags = Object.create(null);
    this._ch2Flags = Object.create(null);
    this._ch4Flags = Object.create(null);
    this._ch5Flags = Object.create(null);
    this._ch6Flags = Object.create(null);
    this._ch7Flags = Object.create(null);
    this._ch8Flags = Object.create(null);
    this._partySeen = Object.create(null);
    this._dialogueDone = Object.create(null);
    this._storyNext = null;
    this._queuedIsParty = false;
    this._startFails = Object.create(null);
    this._storyRetryTimer = 0;
    this._lastSafePos = null;
    this._openingDone = false;
    this._partyQueue = [];
    this._ptrWasDown = false;
    this._dialogueLock = false;

    this.battle = new BattleManager({ events: data.events, inventory: this.inventory, rng: () => 0.3, statusDefs: STATUS_EFFECTS });
    this._battlePresentation = new BattlePresentation();
    this._fieldEncounters = new FieldEncounters({ rng: () => 0.05 });
    this._bindBattleEvents(data.events);

    // Wire events for quest progress
    data.events?.on?.('inventory.item_added', (p) => {
      if (p?.itemId) this.quests.notify('collect', p.itemId, p.qty || 1);
    });
    data.events?.on?.('quest.completed', (p) => {
      const rewards = p?.rewards;
      if (rewards?.items) {
        for (const r of rewards.items) this.inventory.add(r.id, r.qty || 1);
      }
      if (rewards?.gold) this.gold += rewards.gold;
      this._showToast('Quest selesai! Hadiah diterima.');
    });
    data.events?.on?.('dialogue.completed', (p) => this._onDialogueCompleted(p));
    data.events?.on?.('dialogue.choice_selected', (p) => this._applyDialogueEffects(p));
    data.events?.on?.('dialogue.node_effects', (p) => this._applyDialogueEffects(p));

    this.pipeline = new RenderPipeline({ surface: data.surface });
    this.zones = new ZoneManager({ events: data.events, textures: data.textures });
    this.zones.canEnter = (zoneId) => this._zoneLockReason(zoneId);
    this.zones.registerTileset(DEMO_TILESET);
    this.zones.registerZone(ZONE_VILLAGE);
    this.zones.registerZone(ZONE_FOREST);
    this.zones.registerZone(ZONE_ROAD_BELLHAVEN);
    for (const z of BELLHAVEN_ZONES) this.zones.registerZone(z);
    for (const z of ARCHIVE_ZONES) this.zones.registerZone(z);
    for (const z of RESONANCE_ZONES) this.zones.registerZone(z);
    this.entities = new EntityManager();
    this.interaction = new InteractionSystem(this.entities);

    const zone = this.zones.activate('village', 'start');
    this._spawnWorld(zone);
    this._applyCamera();
    this._rebuildLayers();

    // starter items
    this.inventory.add('herb', 2);
    this.inventory.add('rusty_sword', 1);

    this.saveManager = new SaveManager({ adapter: this._saveAdapter ?? new MemoryStorageAdapter(), events: data.events });
    this.perf = new PerformanceMonitor();

    // Continue: restore the saved session instead of replaying the opening.
    // The main menu has already verified the save; the load runs on the first update().
    if (data.startMode === 'continue') {
      this._openingDone = true;
      this._pendingContinue = true;
    }

    // Chapter 1 opening narrative (once, New Game only)
    if (!this._openingDone) {
      this.dialogue.start('ch1_opening');
      this.mode = 'dialogue';
      this._choiceIndex = 0;
      this._openingDone = true;
    }
  }

  _forceCompleteQuest(questId) {
    const st = this.quests._state?.get(questId);
    const def = this.quests._defs?.get(questId);
    if (!st || !def) return { ok: false };
    if (st.status === 'completed') return { ok: false, reason: 'already' };
    // mark objectives complete
    for (const obj of def.objectives) st.progress[obj.id] = obj.count || 1;
    st.status = 'completed';
    if (def.rewards?.items) {
      for (const it of def.rewards.items) this.inventory.add(it.id, it.qty || 1);
    }
    if (def.rewards?.gold) this.gold = (this.gold || 0) + def.rewards.gold;
    this._events?.emit?.('quest.completed', { id: questId, rewards: def.rewards || {} });
    return { ok: true };
  }

  _startDialogue(id) {
    if (!this.dialogue) return;
    if (this.dialogue.isActive || this.mode === 'dialogue') return;
    try {
      this.dialogue.start(id);
      this.mode = 'dialogue';
      this._choiceIndex = 0;
      this._dialogueLock = true;
    } catch (err) {
      this._dialogueLock = false;
      console.error(`dialog gagal dimulai: ${id}`);
      this._showToast('Percakapan ini belum tersedia.');
    }
  }

  /** Entity x/y are world-space center coordinates; w/h define the collision footprint. */
  _spawnNpc(id, x, y, color, dialogueId, range = 26) {
    const e = new Entity({ id, type: 'npc', x, y, w: 12, h: 14, zoneId: this.zones.activeZone?.id });
    e.add('sprite', new SpriteComponent({ color }));
    e.add(
      'interaction',
      new InteractionComponent({
        range,
        onInteract: () => this._onNpcInteract(id, dialogueId),
      })
    );
    this.entities.add(e);
    return e;
  }

  _onNpcInteract(npcId, defaultDialogueId) {
    // Clear stale lock when dialogue already ended
    if (!this.dialogue?.isActive) {
      this._dialogueLock = false;
      if (this.mode === 'dialogue') this.mode = 'world';
    }
    if (this.mode === 'dialogue' || this.dialogue?.isActive) {
      return; // prevent double-open / order quirks
    }
    // Bellhaven quest NPCs
    if (npcId === 'npc_bren') {
      const st = this.quests.getStatus('quest_bh_buku_tamu');
      if (st === 'completed') { this._startDialogue('bh_gate_clerk'); return; }
      if (st === 'active') {
        if (this.inventory.count('guest_page') >= 3) {
          this.inventory.remove('guest_page', 3);
          this.quests.notify('collect', 'guest_page', 3);
          this.quests.notify('talk', 'character_bren', 1);
          this._startDialogue('bh_gate_clerk_done');
          return;
        }
        this._startDialogue('bh_gate_clerk_progress');
        return;
      }
      this._startDialogue('bh_gate_clerk');
      return;
    }
    if (npcId === 'npc_venn') {
      const st = this.quests.getStatus('quest_bh_indeks');
      if (st === 'completed') { this._startDialogue('bh_archivist'); return; }
      if (st === 'active') {
        if (this.inventory.count('index_shard') >= 1) {
          this.inventory.remove('index_shard', 1);
          this.quests.notify('collect', 'index_shard', 1);
          this.quests.notify('talk', 'character_venn', 1);
          this._startDialogue('bh_archivist_done');
          return;
        }
        this._startDialogue('bh_archivist_progress');
        return;
      }
      this._startDialogue('bh_archivist');
      return;
    }
    if (npcId === 'npc_timm') {
      const st = this.quests.getStatus('quest_bh_pesan');
      if (st === 'active') {
        this.quests.notify('talk', 'character_timm', 1);
        this._startDialogue('bh_timm_deliver');
        return;
      }
      this._startDialogue('bh_timm');
      return;
    }
    // Quest-aware Ode (road) + Chapter 3
    if (npcId === 'npc_ode') {
      const st = this.quests.getStatus('quest_bunga_jalan');
      if (st === 'active') {
        const n = this.inventory.count('road_flower');
        if (n >= 3) {
          this.inventory.remove('road_flower', 3);
          this.quests.notify('collect', 'road_flower', 3);
          this.quests.notify('talk', 'character_ode', 1);
          this._startDialogue('road_npc_merchant_ode_complete');
          return;
        }
        this._startDialogue('road_npc_merchant_ode_progress');
        return;
      }
      if (this._ch3Flags?.ch3_completed) { this._startDialogue('ch3_road_ode_after'); return; }
      if (this._ch3Flags?.ch3_ode_talked) { this._startDialogue('ch3_road_ode_repeat'); return; }
      if (this._ch3Flags?.ch3_bellhaven_first_view_seen) {
        this._startDialogue('ch3_road_ode_bellhaven');
        return;
      }
      this._startDialogue(st === 'completed' ? 'road_npc_merchant_ode' : 'road_npc_merchant_ode');
      return;
    }
    // Quest-aware Jarek
    if (npcId === 'npc_jarek') {
      const st = this.quests.getStatus('quest_pagar_utara');
      if (st === 'completed') {
        this._startDialogue('ch1_craft_jarek');
        return;
      }
      if (st === 'active') {
        const wood = this.inventory.count('wood_scrap');
        if (wood >= 3) {
          this.inventory.remove('wood_scrap', 3);
          this.quests.notify('collect', 'wood_scrap', 3);
          this.quests.notify('talk', 'character_jarek', 1);
          this._startDialogue('quest_pagar_utara_complete');
          return;
        }
        this._startDialogue('quest_pagar_utara_progress');
        return;
      }
      // available / unknown → acceptance offer (ask node)
      this._startDialogue('quest_pagar_utara_accept');
      return;
    }

    // Chapter 3 main-story dialogue routing
    if (npcId === 'npc_lyn') {
      if (this._ch3Flags.ch3_completed) { this._startDialogue('ch3_road_lyn_after'); return; }
      if (this._ch3Flags.ch3_lyn_warned) { this._startDialogue('ch3_road_lyn_repeat'); return; }
      this._startDialogue('ch3_road_lyn_warning');
      return;
    }
    if (npcId === 'npc_ode' && this._ch3Flags.ch3_bellhaven_first_view_seen) {
      // keep quest_bunga flow if active; else ch3
      const st = this.quests.getStatus('quest_bunga_jalan');
      if (st === 'active' || st === 'completed') {
        // fall through to existing ode handler above — already returned if ode
      }
    }
    if (npcId === 'npc_dira') {
      if (this._ch3Flags.ch3_completed) { this._startDialogue('ch3_gate_dira_after'); return; }
      if (this._ch3Flags.ch3_dira_entry_done) { this._startDialogue('ch3_gate_dira_repeat'); return; }
      this._startDialogue('ch3_gate_entry_dira');
      return;
    }
    if (npcId === 'npc_bren' && this._ch3Flags.ch3_bellhaven_first_view_seen && !this._ch3Flags.ch3_bren_records_clue) {
      // prefer main story once before side-quest branch if not yet done
      const qst = this.quests.getStatus('quest_bh_buku_tamu');
      if (qst !== 'active') {
        this._startDialogue('ch3_plaza_bren_missing_records');
        return;
      }
    }
    if (npcId === 'npc_mirae') {
      if (this._ch3Flags.ch3_completed) { this._startDialogue('ch3_plaza_mirae_after'); return; }
      if (this._ch3Flags.ch3_mirae_fountain_clue) { this._startDialogue('ch3_plaza_mirae_repeat'); return; }
      this._startDialogue('ch3_plaza_fountain_missing_note');
      return;
    }
    if (npcId === 'npc_venn' && this._ch3Flags.ch3_bren_records_clue && !this._ch3Flags.ch3_venn_index_clue) {
      const qst = this.quests.getStatus('quest_bh_indeks');
      if (qst !== 'active') {
        this._startDialogue('ch3_market_venn_index_clue');
        return;
      }
    }
    if (npcId === 'npc_ruli') {
      if (this._ch3Flags.ch3_completed) { this._startDialogue('ch3_market_ruli_after'); return; }
      if (this._ch3Flags.ch3_ruli_memory_clue) { this._startDialogue('ch3_market_ruli_repeat'); return; }
      this._startDialogue('ch3_market_ruli_memory');
      return;
    }
    if (npcId === 'npc_garet') {
      if (this._ch3Flags?.ch3_garet_archive_clue && !this._ch3Flags?.ch3_completed && this._ch3Flags?.ch3_venn_index_clue) {
        this._startDialogue('ch3_finale_bell_and_promise');
        return;
      }
      if (this._ch3Flags?.ch3_venn_index_clue && !this._ch3Flags?.ch3_garet_archive_clue) {
        this._startDialogue('ch3_archive_garet_warning');
        return;
      }
      if (this._ch3Flags?.ch3_completed) {
        this._startDialogue('ch3_archive_garet_warning');
        return;
      }
    }
    if (npcId === 'npc_lirien') {
      if (this._ch5Flags?.ch5_completed) { this._startDialogue('ch5_scholar_after'); return; }
      const st = this.quests.getStatus('quest_ch5_suara_di_balik_batu');
      if (st === 'active' && this._ch5Flags?.ch5_pillar_inspected && this._ch5Flags?.ch5_instrument_touched && this._ch5Flags?.ch5_mural_seen) {
        this.quests.notify('talk', 'character_lirien', 1);
        this._startDialogue('ch5_side_stone_done');
        return;
      }
      if (this._ch5Flags?.ch5_scholar_warned) {
        if (st !== 'active' && st !== 'completed') this._startDialogue('ch5_side_stone_offer');
        else this._startDialogue('ch5_scholar_repeat');
        return;
      }
      this._startDialogue('ch5_scholars_warning');
      return;
    }
    if (npcId === 'npc_elara') {
      if (this._ch2Flags?.ch2_completed) { this._startDialogue('ch2_elara_after'); return; }
      if (this._ch2Flags?.ch2_resonance_event_completed && !this._ch2Flags?.ch2_elara_clue_received) {
        this._startDialogue('ch2_elara_revelation'); return;
      }
      const stN = this.quests.getStatus('quest_ch2_catatan_tercecer');
      if (stN === 'active' && this.inventory.count('ch2_elara_note') >= 3) {
        this.inventory.remove('ch2_elara_note', 3);
        this.quests.notify('collect', 'ch2_elara_note', 3);
        this.quests.notify('talk', 'character_elara', 1);
        this._startDialogue('ch2_elara_notes_done');
        return;
      }
      if (this._ch2Flags?.ch2_elara_met) {
        if (stN !== 'active' && stN !== 'completed') this._startDialogue('ch2_elara_notes_offer');
        else this._startDialogue('ch2_elara_repeat');
        return;
      }
      this._startDialogue('ch2_elara_first');
      return;
    }
    if (npcId === 'npc_rhea') {
      const st = this.quests.getStatus('quest_ch2_panggilan_tak_terjawab');
      if (st === 'active' && this._ch2Flags?.ch2_stream_ribbon_found) {
        this.quests.notify('talk', 'character_rhea', 1);
        this._startDialogue('ch2_rhea_done');
        return;
      }
      if (this._ch2Flags?.ch2_rhea_met || st === 'completed') {
        this._startDialogue('ch2_rhea_repeat');
        return;
      }
      this._startDialogue('ch2_rhea_first');
      return;
    }
    if (npcId === 'npc_maera') {
      if (this._ch4Flags?.ch4_completed) { this._startDialogue('ch4_maera_after'); return; }
      if (this._ch4Flags?.ch4_fragment_found && !this._ch4Flags?.ch4_completed) { this._startDialogue('ch4_maera_finale'); return; }
      if (this._ch4Flags?.ch4_archive_investigation_started) { this._startDialogue('ch4_maera_repeat'); return; }
      this._startDialogue('ch4_maera_archive_request');
      return;
    }
    if (npcId === 'npc_nilo') {
      const st = this.quests.getStatus('quest_ch4_surat_tanpa_nama');
      if (this._ch4Flags?.ch4_completed) { this._startDialogue('ch4_nilo_after'); return; }
      if (st === 'active' && this._ch4Flags?.ch4_fountain_inscription_seen) {
        this.quests.notify('talk', 'character_nilo', 1);
        this._startDialogue('ch4_nilo_letter_done');
        return;
      }
      if (this._ch4Flags?.ch4_nilo_record_seen) {
        if (st !== 'active' && st !== 'completed') this._startDialogue('ch4_nilo_letter_offer');
        else this._startDialogue('ch4_nilo_repeat');
        return;
      }
      this._startDialogue('ch4_nilo_moving_record');
      return;
    }
    if (npcId === 'npc_teren') {
      const st = this.quests.getStatus('quest_ch4_katalog_kosong');
      if (this._ch4Flags?.ch4_completed) { this._startDialogue('ch4_teren_after'); return; }
      if (st === 'active' && this.inventory.count('ch4_catalog_fragment') >= 3) {
        this.inventory.remove('ch4_catalog_fragment', 3);
        this.quests.notify('collect', 'ch4_catalog_fragment', 3);
        this.quests.notify('talk', 'character_teren', 1);
        this._startDialogue('ch4_teren_catalog_done');
        return;
      }
      if (this._ch4Flags?.ch4_teren_record_seen) {
        if (st !== 'active' && st !== 'completed') this._startDialogue('ch4_teren_catalog_offer');
        else this._startDialogue('ch4_teren_repeat');
        return;
      }
      this._startDialogue('ch4_teren_ink_record');
      return;
    }
    if (npcId === 'npc_edda') {
      if (this._ch4Flags?.ch4_completed || this._ch4Flags?.ch4_edda_resolved) { this._startDialogue('ch4_edda_after'); return; }
      if (this._ch4Flags?.ch4_fragment_found) { this._startDialogue('ch4_edda_resolution'); return; }
      if (this._ch4Flags?.ch4_edda_record_seen) { this._startDialogue('ch4_edda_repeat'); return; }
      this._startDialogue('ch4_edda_brother_memory');
      return;
    }
    if (npcId === 'npc_salla') {
      this._startDialogue('ch3_plaza_salla');
      return;
    }
    if (npcId === 'npc_nila' && this._ch3Flags.ch3_bellhaven_first_view_seen) {
      this._startDialogue('ch3_market_nila_ch3');
      return;
    }
    if (npcId === 'npc_korr' && this._ch3Flags.ch3_bellhaven_first_view_seen) {
      this._startDialogue('ch3_market_korr_ch3');
      return;
    }

    this._startDialogue(defaultDialogueId);
  }  _countItem(id) {
    const slot = this.inventory.slots?.find((s) => s.itemId === id);
    return slot?.qty || 0;
  }

  _removeItem(id, qty) {
    const slot = this.inventory.slots?.find((s) => s.itemId === id);
    if (!slot) return false;
    slot.qty -= qty;
    if (slot.qty <= 0) this.inventory.slots = this.inventory.slots.filter((s) => s !== slot);
    return true;
  }

  _spawnZoneNpcs(zone) {
    if (!zone) return;
    if (zone.id === 'village' || zone.id === 'ashwillow' || zone.id === ZONE_VILLAGE?.id) {
      this._spawnVillageNpcs();
    }
    if (zone.id === 'forest') {
      this._spawnChapter2Forest();
      const scrap = new Entity({ id: 'scrap_node', type: 'object', x: 200, y: 140, w: 12, h: 12, zoneId: zone.id });
      scrap.add('sprite', new SpriteComponent({ color: '#8a6a3a' }));
      scrap.add(
        'interaction',
        new InteractionComponent({
          range: 20,
          onInteract: () => {
            const r = this.inventory.add('wood_scrap', 1);
            if (r.ok) this._showToast('Mengambil Kayu Bersih');
            else this._showToast('Inventaris penuh');
          },
        })
      );
      this.entities.add(scrap);
    }
    if (zone.id === 'road_bellhaven') {
      this._spawnRoadNpcs();
    }
    if (zone.id === 'bellhaven_gate' || zone.id === 'bellhaven_plaza' || zone.id === 'bellhaven_market') {
      this._spawnBellhaven(zone.id);
    }
    if (String(zone.id).startsWith('bellhaven_archive')) {
      this._spawnArchive(zone.id);
    }
    if (zone.id === 'resonance_ancient_site') {
      this._spawnResonanceSite();
    }
  }

  _spawnChapter2Forest() {
    this._spawnNpc('npc_elara', 140, 100, '#608060', 'ch2_elara_first', 28);
    this._spawnNpc('npc_rhea', 220, 180, '#a090b0', 'ch2_rhea_first', 26);
    const objs = [
      ['ch2_echo_stone', 64, 120, 'ch2_first_echo', '#80c0ff'],
      ['ch2_carving_1', 280, 70, 'ch2_old_stone_path', '#c0b090'],
      ['ch2_carving_2', 300, 120, 'ch2_memory_trace', '#c0a070'],
      ['ch2_stream', 180, 200, 'ch2_obj_stream', '#6090c0'],
      ['ch2_tree', 50, 150, 'ch2_obj_ancient_tree', '#406040'],
      ['ch2_marker', 320, 40, 'ch2_obj_trail_marker', '#a09070'],
      ['ch2_mira_spot', 150, 210, 'ch2_mira_personal_scene', '#d0c0a0'],
      ['ch2_north', 200, 30, 'ch2_northern_path', '#b0b0a0'],
    ];
    for (const [id, x, y, dlg, col] of objs) {
      const o = new Entity({ id, type: 'object', x, y, w: 12, h: 12, zoneId: 'forest' });
      o.add('sprite', new SpriteComponent({ color: col }));
      o.add('interaction', new InteractionComponent({
        range: 28,
        onInteract: () => {
          // gate mira scene
          if (id === 'ch2_mira_spot' && !this._ch2Flags?.ch2_resonance_event_completed) {
            this._showToast('Belum saatnya.');
            return;
          }
          if (id === 'ch2_north' && !this._ch2Flags?.ch2_mira_committed) {
            this._showToast('Bicaralah dengan Mira dulu.');
            return;
          }
          // Save from before the chain fix: memory trace seen but the resonance never started.
          if (id === 'ch2_carving_2' && this._ch2Flags?.ch2_memory_trace_seen && !this._ch2Flags?.ch2_resonance_event_completed) {
            this._startDialogue('ch2_resonance_event');
            return;
          }
          // Save from before the chain fix: northern path already seen but Bab 2 never closed.
          if (id === 'ch2_north' && this._ch2Flags?.ch2_northern_path_unlocked && !this._ch2Flags?.ch2_completed) {
            this._startDialogue('ch2_finale');
            return;
          }
          this._startDialogue(dlg);
        },
      }));
      this.entities.add(o);
    }
    for (let i = 0; i < 3; i++) {
      const o = new Entity({ id: 'ch2_note_' + i, type: 'object', x: 100 + i * 40, y: i === 0 ? 120 : 60, w: 8, h: 8, zoneId: 'forest' });
      o.add('sprite', new SpriteComponent({ color: '#e8e0c0' }));
      o.add('interaction', new InteractionComponent({
        range: 16, oneShot: true,
        onInteract: () => {
          const r = this.inventory.add('ch2_elara_note', 1);
          this._showToast(r.ok ? 'Mengambil catatan Elara' : 'Inventaris penuh');
          return r.ok;
        },
      }));
      this.entities.add(o);
    }
  }

  /** Chapter 5 Bellhaven echo carving behind the market stalls (flag ch5_echo_found). */
  _spawnCh5Echo(zoneId) {
    if (zoneId !== 'bellhaven_market') return;
    const f = this._ch5Flags;
    if (!f?.ch5_fragment_investigated || f.ch5_echo_found) return;
    const carving = new Entity({ id: 'ch5_echo_carving', type: 'object', x: 280, y: 24, w: 12, h: 12, zoneId });
    carving.add('sprite', new SpriteComponent({ color: '#80d0ff' }));
    carving.add('interaction', new InteractionComponent({
      range: 20,
      onInteract: () => this._startDialogue('ch5_bellhaven_echo'),
    }));
    this.entities.add(carving);
  }

  _maybeCh3FirstView(zoneId) {
    if (zoneId === 'road_bellhaven' && !this._ch3Flags?.ch3_bellhaven_first_view_seen && !this._ch3Flags?._first_view_started) {
      if (!this._ch3Flags) this._ch3Flags = Object.create(null);
      this._ch3Flags._first_view_started = true;
      this._ensureMainQuest('quest_ch3_jejak_yang_kosong');
      this._startDialogue('ch3_road_bellhaven_first_view');
    }
  }

  _maybeCh2ForestEntry(zoneId) {
    if (zoneId === 'forest' && !this._ch2Flags?.ch2_forest_entered && !this._ch2Flags?._entry_started) {
      if (!this._ch2Flags) this._ch2Flags = Object.create(null);
      this._ch2Flags._entry_started = true;
      this._ensureMainQuest('quest_ch2_suara_hutan');
      this._startDialogue('ch2_forest_entry');
    }
  }

  _spawnResonanceSite() {
    this._spawnNpc('npc_lirien', 80, 100, '#7080a0', 'ch5_scholars_warning', 28);
    for (const [id, x, y, dlg, col] of [
      ['ch5_pillar', 70, 60, 'ch5_obj_pillar', '#909090'],
      ['ch5_instrument', 160, 120, 'ch5_obj_instrument', '#a0b0d0'],
      ['ch5_mural', 250, 70, 'ch5_obj_mural', '#c0b090'],
      ['ch5_activate', 128, 128, 'ch5_first_resonance', '#80d0ff'],
    ]) {
      const o = new Entity({ id, type: 'object', x, y, w: 12, h: 12, zoneId: 'resonance_ancient_site' });
      o.add('sprite', new SpriteComponent({ color: col }));
      o.add('interaction', new InteractionComponent({
        range: 22,
        onInteract: () => {
          if (id === 'ch5_activate' && !this._ch5Flags?.ch5_site_reached) {
            this._startDialogue('ch5_ancient_resonance_site');
            return;
          }
          if (id === 'ch5_activate' && this._ch5Flags?.ch5_first_resonance_done) {
            this._startDialogue('ch5_after_resonance');
            return;
          }
          if (id === 'ch5_mural' && this._ch5Flags?.ch5_mural_seen) {
            const st = this.quests.getStatus('quest_ch5_pesan_yang_tertinggal');
            if (st === 'active') { this._startDialogue('ch5_side_message_done'); return; }
            if (st === 'available') { this._startDialogue('ch5_side_message_offer'); return; }
          }
          this._startDialogue(dlg);
        },
      }));
      this.entities.add(o);
    }
  }

  _maybeCh5Start() {
    if (this._ch4Flags?.ch4_completed && !this._ch5Flags?.ch5_fragment_investigated && !this._ch5Flags?._started) {
      if (!this._ch5Flags) this._ch5Flags = Object.create(null);
      this._ch5Flags._started = true;
      this._ensureMainQuest('quest_ch5_resonansi_pertama');
      this._startDialogue('ch5_fragment_awakens');
    }
  }

  /**
   * Accept a chapter's main quest once and replay flags already set in that chapter into its
   * objectives (covers saves made before this quest was ever accepted). No-op if not 'available'.
   */
  _ensureMainQuest(questId) {
    const meta = MAIN_QUEST_CHAPTERS[questId];
    if (!meta || !this.quests || this.quests.getStatus(questId) !== 'available') return false;
    if (!this.quests.accept(questId).ok) return false;
    const flags = this[meta.flagsKey] || {};
    for (const f of Object.keys(flags)) {
      if (f.startsWith(meta.prefix)) {
        try { this.quests.notify('flag', f, 1); } catch (_) {}
      }
    }
    return true;
  }

  /** Accept main quests for chapters the loaded save has already started (old saves). */
  _migrateMainQuests() {
    const started = {
      quest_ch2_suara_hutan: !!(this._ch2Flags?._entry_started || this._ch2Flags?.ch2_forest_entered),
      quest_ch3_jejak_yang_kosong: !!(this._ch3Flags?._first_view_started || this._ch3Flags?.ch3_bellhaven_first_view_seen),
      quest_ch4_arsip_tanpa_nama: !!(this._ch4Flags?._entry_started || this._ch4Flags?.ch4_entered_archive),
      quest_ch5_resonansi_pertama: !!(this._ch5Flags?._started || this._ch5Flags?.ch5_fragment_investigated),
    };
    for (const [id, yes] of Object.entries(started)) if (yes) this._ensureMainQuest(id);
  }

  /**
   * Chapter 5 'ch5_memories_we_carry' (flag ch5_memories_discussed): plays once on the road to the
   * ancient site, after the fragment has been investigated.
   */
  _maybeCh5Memories(zoneId) {
    const f = this._ch5Flags;
    if (zoneId !== 'road_bellhaven' || !f?.ch5_fragment_investigated) return false;
    if (f.ch5_memories_discussed || f._memories_started) return false;
    f._memories_started = true;
    this._startDialogue('ch5_memories_we_carry');
    return true;
  }

  _spawnArchive(zoneId) {
    if (zoneId === 'bellhaven_archive_hall') {
      this._spawnNpc('npc_maera', 200, 100, '#4060a0', 'ch4_maera_archive_request', 28);
      this._spawnNpc('npc_edda', 80, 160, '#c0a0b0', 'ch4_edda_brother_memory', 26);
      // East/west records are intentionally mounted on the shelf faces; the center record sits in the aisle.
      for (const [id, x, y, dlg] of [['ch4_rec_east', 60, 50, 'ch4_obj_record_east'], ['ch4_rec_center', 176, 50, 'ch4_obj_record_center'], ['ch4_rec_west', 280, 50, 'ch4_obj_record_west']]) {
        const o = new Entity({ id, type: 'object', x, y, w: 12, h: 12, zoneId });
        o.add('sprite', new SpriteComponent({ color: '#d0c8a0' }));
        o.add('interaction', new InteractionComponent({ range: 20, onInteract: () => this._startDialogue(dlg) }));
        this.entities.add(o);
      }
    }
    if (zoneId === 'bellhaven_archive_stacks') {
      this._spawnNpc('npc_nilo', 100, 100, '#70a070', 'ch4_nilo_moving_record', 26);
      this._spawnNpc('npc_teren', 220, 120, '#a08060', 'ch4_teren_ink_record', 26);
      // Catalogue fragments are intentionally placed on the shelf faces.
      for (let i = 0; i < 3; i++) {
        const o = new Entity({ id: 'ch4_cat_' + i, type: 'object', x: 60 + i * 50, y: 160, w: 10, h: 10, zoneId });
        o.add('sprite', new SpriteComponent({ color: '#e0d0b0' }));
        o.add('interaction', new InteractionComponent({
          range: 18, oneShot: true,
          onInteract: () => {
            const r = this.inventory.add('ch4_catalog_fragment', 1);
            this._showToast(r.ok ? 'Mengambil lembar katalog' : 'Inventaris penuh');
            return r.ok;
          },
        }));
        this.entities.add(o);
      }
    }
    if (zoneId === 'bellhaven_archive_restricted') {
      const book = new Entity({ id: 'ch4_nameless_book', type: 'object', x: 128, y: 80, w: 14, h: 14, zoneId });
      book.add('sprite', new SpriteComponent({ color: '#a0b0d0' }));
      book.add('interaction', new InteractionComponent({
        range: 22,
        onInteract: () => {
          if (!this._ch4Flags?.ch4_restricted_seen) this._startDialogue('ch4_restricted_archive_entry');
          else this._startDialogue('ch4_obj_nameless_book');
        },
      }));
      this.entities.add(book);
      const frag = new Entity({ id: 'ch4_fragment_obj', type: 'object', x: 160, y: 100, w: 10, h: 10, zoneId });
      frag.add('sprite', new SpriteComponent({ color: '#80d0ff' }));
      frag.add('interaction', new InteractionComponent({
        range: 20,
        onInteract: () => {
          if (!this._ch4Flags?.ch4_fragment_found) this._startDialogue('ch4_fragment_discovery');
          else this._startDialogue('ch4_obj_fragment');
        },
      }));
      this.entities.add(frag);
    }
  }

  _maybeCh4FirstEntry(zoneId) {
    if (zoneId === 'bellhaven_archive_hall' && !this._ch4Flags?.ch4_entered_archive && !this._ch4Flags?._entry_started) {
      if (!this._ch4Flags) this._ch4Flags = Object.create(null);
      this._ch4Flags._entry_started = true;
      this._ensureMainQuest('quest_ch4_arsip_tanpa_nama');
      this._startDialogue('ch4_archive_first_entry');
    }
  }


  _spawnBellhaven(zoneId) {
    if (zoneId === 'bellhaven_gate') {
      this._spawnNpc('npc_dira', 100, 100, '#5a7a9a', 'bh_gate_captain', 28);
      this._spawnNpc('npc_bren', 180, 120, '#c0b090', 'bh_gate_clerk', 26);
      const board = new Entity({ id: 'bh_notice', type: 'object', x: 240, y: 60, w: 14, h: 14, zoneId });
      board.add('sprite', new SpriteComponent({ color: '#a09060' }));
      board.add('interaction', new InteractionComponent({ range: 22, onInteract: () => this._startDialogue('bh_notice') }));
      this.entities.add(board);
      for (const [i, pos] of [[0, [80, 88]], [1, [200, 150]], [2, [260, 90]]]) {
        const pg = new Entity({ id: `guest_page_${i}`, type: 'object', x: pos[0], y: pos[1], w: 10, h: 10, zoneId });
        pg.add('sprite', new SpriteComponent({ color: '#f0e8d0' }));
        pg.add('interaction', new InteractionComponent({
          range: 18, oneShot: true,
          onInteract: () => {
            const r = this.inventory.add('guest_page', 1);
            this._showToast(r.ok ? 'Mengambil Lembar Catatan' : 'Inventaris penuh');
            return r.ok;
          },
        }));
        this.entities.add(pg);
      }
    }
    if (zoneId === 'bellhaven_plaza') {
      this._spawnNpc('npc_salla', 80, 100, '#90a0c0', 'bh_plaza_guide', 26);
      this._spawnNpc('npc_ruli', 128, 176, '#f0c070', 'bh_plaza_child', 24);
      this._spawnNpc('npc_venn', 280, 88, '#b0a8c8', 'bh_archivist', 28);
      this._spawnNpc('npc_timm', 188, 176, '#70c0e0', 'bh_timm', 24);
      // The fountain is intentionally anchored to the solid fountain/pool footprint.
      const fountain = new Entity({ id: 'bh_fountain', type: 'object', x: 176, y: 120, w: 16, h: 16, zoneId });
      fountain.add('sprite', new SpriteComponent({ color: '#60a0d0' }));
      fountain.add('interaction', new InteractionComponent({
        range: 24,
        onInteract: () => {
          const surat = this.quests?.getStatus('quest_ch4_surat_tanpa_nama');
          if (surat === 'active' && !this._ch4Flags?.ch4_fountain_inscription_seen) this._startDialogue('ch4_obj_fountain_inscription');
          else this._startDialogue('bh_fountain');
        },
      }));
      this.entities.add(fountain);
    }
    if (zoneId === 'bellhaven_market') {
      this._spawnNpc('npc_nila', 100, 80, '#60b070', 'bh_merchant_herbs', 26);
      this._spawnNpc('npc_korr', 200, 80, '#808080', 'bh_merchant_tools', 26);
      this._spawnNpc('npc_mirae', 280, 100, '#d080a0', 'bh_vendor_rumor', 24);
      this._spawnNpc('npc_garet', 140, 140, '#a07050', 'bh_market_porter', 26);
      this._spawnCh5Echo(zoneId);
      const shard = new Entity({ id: 'index_shard_obj', type: 'object', x: 300, y: 150, w: 10, h: 10, zoneId });
      shard.add('sprite', new SpriteComponent({ color: '#e0d0a0' }));
      shard.add('interaction', new InteractionComponent({
        range: 18, oneShot: true,
        onInteract: () => {
          const r = this.inventory.add('index_shard', 1);
          this._showToast(r.ok ? 'Mengambil Serpihan Indeks' : 'Inventaris penuh');
          return r.ok;
        },
      }));
      this.entities.add(shard);
    }
  }

  _spawnRoadNpcs() {
    this._spawnNpc('npc_lyn', 120, 96, '#6a90b8', 'road_npc_guard_lyn', 28);
    this._spawnNpc('npc_ode', 240, 100, '#c09050', 'road_npc_merchant_ode', 28);
    // mile marker
    const sign = new Entity({ id: 'road_mile', type: 'object', x: 200, y: 72, w: 12, h: 12, zoneId: this.zones.activeZone?.id });
    sign.add('sprite', new SpriteComponent({ color: '#a09070' }));
    sign.add('interaction', new InteractionComponent({ range: 22, onInteract: () => this._startDialogue('road_sign_mile') }));
    this.entities.add(sign);
    // broken cart
    const cart = new Entity({ id: 'road_cart', type: 'object', x: 266, y: 135, w: 16, h: 14, zoneId: this.zones.activeZone?.id });
    cart.add('sprite', new SpriteComponent({ color: '#705040' }));
    cart.add('interaction', new InteractionComponent({ range: 22, onInteract: () => this._startDialogue('road_obj_cart') }));
    this.entities.add(cart);
    // gate view at east
    const gate = new Entity({ id: 'road_gate_view', type: 'object', x: 400, y: 96, w: 14, h: 14, zoneId: this.zones.activeZone?.id });
    gate.add('sprite', new SpriteComponent({ color: '#8090a0' }));
    gate.add('interaction', new InteractionComponent({ range: 24, onInteract: () => this._startDialogue('road_obj_gate_view') }));
    this.entities.add(gate);
    // flower nodes
    for (const [i, pos] of ROAD_FLOWER_SPAWNS.entries()) {
      const [fx, fy] = Array.isArray(pos) ? pos : [];
      if (!Number.isFinite(fx) || !Number.isFinite(fy)) {
        console.error(`road_flower_${i}: koordinat tidak valid`, pos);
        continue;
      }
      const f = new Entity({ id: `road_flower_${i}`, type: 'object', x: fx, y: fy, w: 10, h: 10, zoneId: this.zones.activeZone?.id });
      f.add('sprite', new SpriteComponent({ color: '#e8d060' }));
      f.add(
        'interaction',
        new InteractionComponent({
          range: 18,
          onInteract: () => {
            const r = this.inventory.add('road_flower', 1);
            if (r.ok) {
              this._showToast('Mengambil Bunga Jalan');
              // consume only on success so a full inventory never loses the flower
              f.get('interaction').enabled = false;
              this.entities.remove(f.id);
            } else this._showToast('Inventaris penuh');
          },
        })
      );
      this.entities.add(f);
    }
    // optional thorn encounter trigger (persisted once defeated so players cannot infinitely farm EXP)
    if (!this._ch3Flags?.ch3_road_ambush_cleared) {
      const ambush = new Entity({ id: 'road_ambush', type: 'object', x: 340, y: 96, w: 12, h: 12, zoneId: this.zones.activeZone?.id });
      ambush.add('sprite', new SpriteComponent({ color: '#406040' }));
      ambush.add(
        'interaction',
        new InteractionComponent({
          range: 20,
          oneShot: true,
          onInteract: () => {
            this._showToast('Sprite Duri melompat dari semak!');
            this._startBattle({ grantRewards: true, source: 'road_ambush' });
          },
        })
      );
      this.entities.add(ambush);
    }
  }

  _spawnVillageNpcs() {
    // Preserve demo guard + sign for regression
    if (!this.entities.get('npc_guard')) {
      this._spawnNpc('npc_guard', 120, 100, '#6a9ae8', 'village_guard_intro', 28);
    }
    if (!this.entities.get('sign')) {
      const sign = new Entity({ id: 'sign', type: 'object', x: 180, y: 90, w: 14, h: 14, zoneId: this.zones.activeZone?.id });
      sign.add('sprite', new SpriteComponent({ color: '#c4a574' }));
      sign.add(
        'interaction',
        new InteractionComponent({
          range: 22,
          onInteract: () => this._startDialogue('village_sign'),
        })
      );
      this.entities.add(sign);
    }
    // Chapter 1 named NPCs
    this._spawnNpc('npc_henn', 80, 120, '#d4c4a8', 'ch1_elder_henn', 28);
    this._spawnNpc('npc_renda', 140, 70, '#5a8ad0', 'ch1_guard_renda', 28);
    this._spawnNpc('npc_soli', 200, 130, '#d0a060', 'ch1_merchant_soli', 26);
    this._spawnNpc('npc_nima', 90, 160, '#c090a0', 'ch1_villager_nima', 26);
    this._spawnNpc('npc_tori', 116, 176, '#f0d080', 'ch1_child_tori', 24);
    this._spawnNpc('npc_jarek', 220, 100, '#8a7060', 'ch1_craft_jarek', 26);
    // Story interactables
    // Keep story interactables on walkable ground, not inside the nearby house footprint.
    const fragment = new Entity({ id: 'resonance_fragment', type: 'object', x: 240, y: 80, w: 10, h: 10, zoneId: this.zones.activeZone?.id });
    fragment.add('sprite', new SpriteComponent({ color: '#80d0ff' }));
    fragment.add(
      'interaction',
      new InteractionComponent({
        range: 22,
        onInteract: () => {
          this._startDialogue('ch1_resonance_fragment');
          if (!this._partySeen.after_fragment) {
            this._partySeen.after_fragment = true;
            // queue party beat after dialogue ends — simple flag for next E near player rest
            this._pendingParty = 'ch1_party_after_fragment';
          }
        },
      })
    );
    this.entities.add(fragment);

    const slip = new Entity({ id: 'memory_slip', type: 'object', x: 160, y: 150, w: 12, h: 12, zoneId: this.zones.activeZone?.id });
    slip.add('sprite', new SpriteComponent({ color: '#b080c0' }));
    slip.add(
      'interaction',
      new InteractionComponent({
        range: 24,
        onInteract: () => {
          this._startDialogue('ch1_memory_slip');
          this._pendingParty = 'ch1_party_after_slip';
        },
      })
    );
    this.entities.add(slip);

    const mira = this._spawnNpc('npc_mira', 120, 128, '#90c8a0', 'ch1_mira_encounter', 28);
  }

  _spawnWorld(zone) {
    this.entities.clear();
    const spawn = zone.getSpawn('start') || zone.getDefaultSpawn();
    const player = new Entity({
      id: 'player',
      type: 'player',
      x: spawn.x,
      y: spawn.y,
      w: 12,
      h: 12,
      zoneId: zone.id,
    });
    player.add('movement', new MovementComponent({ speed: 70, collision: this.zones.collision }));
    player.add('sprite', new SpriteComponent({ color: '#e8c84a' }));
    this.entities.add(player);
    this.player = player;
    this.controller = new PlayerController({ input: this._input, entity: player });

    this._spawnZoneNpcs(zone);
  }

  /** Static zone objects (well, stump, wrecked cart...) drawn as pixel-art props, y-sorted with entities. */
  _propDrawables() {
    const z = this.zones?.activeZone;
    if (!z || !PixelArt.ready) return null;
    if (this._propCacheZone !== z.id) {
      this._propCacheZone = z.id;
      this._propCache = (z.objects || [])
        .map((o) => ({ kind: PixelArt.propKind(o.id), o }))
        .filter(({ kind }) => kind !== 'none' && kind !== 'gem')
        .map(({ kind, o }) => ({
          y: o.y + o.h,
          draw: (ctx) => PixelArt.drawProp(ctx, kind, o.x + o.w / 2, o.y + o.h, 0),
        }));
    }
    return this._propCache;
  }

  _applyCamera() {
    const z = this.zones.activeZone;
    const cam = this.pipeline.camera;
    cam.setBounds(0, 0, z.pixelWidth, z.pixelHeight);
    cam.follow(this.player);
    cam.followLerp = 0.12;
  }

  _rebuildLayers() {
    const layers = this.pipeline.layers;
    layers.clearAll();
    const self = this;
    layers.add('ground', {
      x: 0,
      y: 0,
      width: 9999,
      height: 9999,
      draw: (ctx, camera) => self.zones.tileRenderer?.render(ctx, camera, 1),
    });
    layers.add('characters', {
      x: 0,
      y: 0,
      width: 9999,
      height: 9999,
      draw: (ctx, camera) => {
        if (self.mode === 'world') self.entities.render(ctx, camera, self._propDrawables());
      },
    });
    layers.add('ui', {
      x: 0,
      y: 0,
      draw: (ctx) => self._drawUI(ctx),
    });
  }

  /** Applies dialogue effects (flags, quests, shop, chapter hooks). Shared by the real event wiring and tests. */
  _applyDialogueEffects(p) {
    const fx = p?.effects;
    if (!fx) return;
    if (fx.acceptQuest) {
      const r = this.quests.accept(fx.acceptQuest);
      if (r.ok) this._showToast(`Quest diterima: ${this._questTitle(fx.acceptQuest)}`);
    }
    if (fx.recruitMember) {
      if (this._setPartyMemberStatus(fx.recruitMember, true)) {
        const memberName = ({ kael: 'Kael Rowan', iven: 'Iven Marr', tavi: 'Tavi Brindle', mira: 'Mira Solenne' })[fx.recruitMember] || fx.recruitMember;
        const reserve = this._isPartyMemberActive(fx.recruitMember) ? '' : ' sebagai anggota cadangan';
        this._showToast(`${memberName} bergabung${reserve}.`);
      }
    }
    if (fx.dismissMember) {
      if (this._setPartyMemberStatus(fx.dismissMember, false)) this._showToast(`${fx.dismissMember} meninggalkan rombongan sementara.`);
    }
    if (fx.completeQuest) {
      try {
        const r = typeof this.quests.complete === 'function'
          ? this.quests.complete(fx.completeQuest)
          : null;
        if (r?.ok) this._showToast(`Quest selesai: ${this._questTitle(fx.completeQuest)}`);
      } catch (_) {}
    }
    if (fx.flag) {
      const flagName = String(fx.flag);
      const chapterMatch = /^ch(\d+)_/.exec(flagName);
      const chapterFlags = chapterMatch ? this[`_ch${chapterMatch[1]}Flags`] : this._ch1Flags;
      if (chapterFlags) chapterFlags[flagName] = true;
      if (flagName.startsWith('ch3_')) {
        if (!this._ch3Flags) this._ch3Flags = Object.create(null);
        this._ch3Flags[fx.flag] = true;
        try { this.quests.notify('flag', fx.flag, 1); } catch (_) {}
        try { this._onCh3Flag?.(fx.flag); } catch (_) {}
      }
      if (flagName.startsWith('ch2_')) {
        if (!this._ch2Flags) this._ch2Flags = Object.create(null);
        this._ch2Flags[fx.flag] = true;
        try { this.quests.notify('flag', fx.flag, 1); } catch (_) {}
        try { this._onCh2Flag?.(fx.flag); } catch (_) {}
      }
      if (flagName.startsWith('ch5_')) {
        if (!this._ch5Flags) this._ch5Flags = Object.create(null);
        this._ch5Flags[fx.flag] = true;
        try { this.quests.notify('flag', fx.flag, 1); } catch (_) {}
        try { this._onCh5Flag?.(fx.flag); } catch (_) {}
        if (fx.flag === 'ch5_completed') {
          this._ch5Flags.arc1_completed = true;
          this._ch5Flags.chapter_06_unlocked = true;
          if (!this._ch6Flags?.ch6_kael_joined) this._ch6Flags.ch6_kael_departure_banter_pending = true;
        }
      }
      if (flagName.startsWith('ch4_')) {
        if (!this._ch4Flags) this._ch4Flags = Object.create(null);
        this._ch4Flags[fx.flag] = true;
        try { this.quests.notify('flag', fx.flag, 1); } catch (_) {}
        try { this._onCh4Flag?.(fx.flag); } catch (_) {}
      }
      if (flagName.startsWith('ch6_')) {
        if (!this._ch6Flags) this._ch6Flags = Object.create(null);
        this._ch6Flags[flagName] = true;
        try { this.quests.notify('flag', flagName, 1); } catch (_) {}
      }
    }
    if (fx.shopBuy) {
      const { itemId, cost, qty } = fx.shopBuy;
      if ((this.gold || 0) < cost) this._showToast('Gold tidak cukup');
      else {
        const r = this.inventory.add(itemId, qty || 1);
        if (r.ok) {
          this.gold -= cost;
          this._showToast(`Membeli ${this._itemTitle(itemId)} (-${cost} gold)`);
        } else this._showToast('Inventaris penuh');
      }
    }
    if (fx.chapterHook) this._showToast(chapterHookMessage(fx.chapterHook));
  }

  _onDialogueCompleted(p) {
    this._dialogueLock = false;
    const id = p?.id;
    if (id === 'ch5_banter_departure' && this._ch6Flags) {
      this._ch6Flags.ch6_kael_departure_banter_pending = false;
      if (!this._ch6Flags.ch6_kael_joined) this._ch6Flags.ch6_kael_recruitment_pending = true;
    }
    if (id === 'ch6_party_first_watch' && this._ch6Flags) this._ch6Flags.ch6_party_first_watch_pending = false;
    // Chapter 4: once all three archive records have been read, the resonance beat plays (Batch 9.2).
    if (id?.startsWith('ch4_obj_record_') && CH4_RECORD_FLAGS.every((f) => this._ch4Flags?.[f])
        && !this._ch4Flags?.ch4_three_records_resonated && !this._dialogueDone.ch4_three_records_resonance) {
      this._storyNext = 'ch4_three_records_resonance';
    }
    // story chain: each step runs on its first completion only
    const first = !this._dialogueDone[id];
    this._dialogueDone[id] = true;
    const next = first ? DIALOGUE_CHAIN[id] : null;
    if (next) this._storyNext = next;
    // party banter that follows a chapter beat
    const party = PARTY_AFTER_DIALOGUE[id];
    if (party) this._enqueueParty(party);
    this._enqueuePartyFollowup();
  }

  _enqueueParty(id) {
    if (!id) return;
    if (this._partySeen[id]) return;
    if (this._partyQueue.includes(id)) return;
    if (this._queuedDialogue === id) return;
    this._partyQueue.push(id);
  }

  _enqueuePartyFollowup() {
    // legacy single pending → queue
    if (this._pendingParty) {
      const id = this._pendingParty;
      this._pendingParty = null;
      this._enqueueParty(id);
    }
    this._maybePartyFollowup();
  }

  _maybeCh1TravelBanter() {
    const id = 'ch1_party_orin_mira_travel';
    if (!this._ch1Flags?.ch1_mira_follow || this._partySeen[id]) return false;
    this._enqueueParty(id);
    this._maybePartyFollowup();
    if (this._queuedDialogue === id) return this._advanceQueuedDialogue();
    return false;
  }

  _maybePartyFollowup() {
    if (this.dialogue?.isActive) return;
    if (this._storyNext || this._queuedDialogue) return;
    if (!this._partyQueue.length) return;
    // Dequeue only. _partySeen is set in _startQueued once the dialogue has actually started.
    this._queuedDialogue = this._partyQueue.shift();
    this._queuedIsParty = true;
  }

  /**
   * Start the next pending dialogue. Story steps take priority over party banter.
   * Returns true when a dialogue was attempted this frame.
   */
  _advanceQueuedDialogue() {
    if (this._storyNext && this._storyRetryTimer > 0) return false;
    if (this._storyNext) {
      const id = this._storyNext;
      this._storyNext = null;
      this._startQueued(id, false);
      return true;
    }
    if (this._queuedDialogue) {
      const id = this._queuedDialogue;
      const isParty = this._queuedIsParty;
      this._queuedDialogue = null;
      this._queuedIsParty = false;
      this._startQueued(id, isParty);
      return true;
    }
    return false;
  }

  /**
   * Start a queued dialogue. Seen-state is recorded only on a successful start.
   * A failed start keeps the entry eligible: it is re-queued up to MAX_START_ATTEMPTS.
   */
  _startQueued(id, isParty) {
    const before = this.dialogue?.isActive;
    this._startDialogue(id);
    if (this.mode === 'dialogue' && this.dialogue?.isActive && !before) {
      delete this._startFails[id];
      if (isParty) this._partySeen[id] = true;
      return true;
    }
    const attempts = (this._startFails[id] || 0) + 1;
    this._startFails[id] = attempts;
    if (isParty) {
      if (attempts < MAX_START_ATTEMPTS) {
        this._queuedDialogue = id;
        this._queuedIsParty = true;
      } else {
        // Non-critical banter is deferred. It remains eligible for a later enqueue.
        delete this._startFails[id];
        console.error(`banter ditunda setelah ${attempts} percobaan: ${id}`);
      }
      return false;
    }

    // Never discard a critical story step: a missing/transient dialogue registration
    // must not silently strand the Arc I finale. Back off to avoid per-frame retries.
    this._storyNext = id;
    const delay = Math.min(
      STORY_RETRY_MAX_SECONDS,
      STORY_RETRY_BASE_SECONDS * (2 ** Math.min(attempts - 1, 3))
    );
    this._storyRetryTimer = delay;
    if (attempts === MAX_START_ATTEMPTS) {
      console.error(`story chain tertahan; akan mencoba lagi: ${id}`);
    }
    return false;
  }

  _zoneLockReason(zoneId) {
    const gate = ZONE_GATES[zoneId];
    if (!gate) return null;
    const flags = [this._ch2Flags, this._ch3Flags, this._ch4Flags, this._ch5Flags];
    const done = flags.some((f) => f?.[gate.flag]);
    return done ? null : gate.msg;
  }

  /** Zone-exit handling: gate step-back (locked) or enter the target zone. */
  _handleZoneTrigger() {
    const tr = this.zones.tryTransitionAt(this.player.x, this.player.y);
    if (!tr) {
      this._lastSafePos = { zoneId: this.zones.activeZone?.id ?? null, x: this.player.x, y: this.player.y };
    }
    if (tr?.blocked) {
      // zone locked by chapter progress: step back to a safe spot in the current zone
      const safe = this._safePosition();
      this.player.x = safe.x;
      this.player.y = safe.y;
      if (!this._gateToastShown) {
        this._showToast(tr.reason);
        this._gateToastShown = true;
      }
    } else if (tr) {
      this._gateToastShown = false;
      this._lastSafePos = null;
      const px = tr.spawn.x;
      const py = tr.spawn.y;
      const pid = this.player.id;
      // remove non-player entities of old zone
      for (const e of [...this.entities.all()]) {
        if (e.id !== pid) this.entities.remove(e.id);
      }
      this.player.zoneId = tr.zone.id;
      this.player.x = px;
      this.player.y = py;
      const mov = this.player.get('movement');
      if (mov) mov.collision = this.zones.collision;
      // spawn zone NPCs without clearing player
      this._spawnZoneNpcs(tr.zone);
      this._applyCamera();
      this._rebuildLayers();
      this._showToast(TOAST.entered(tr.zone.name));
      this._audio?.playSfx('zone_enter');
      this._maybeCh3FirstView(tr.zone.id);
      this._maybeCh2ForestEntry?.(tr.zone.id);
      this._maybeCh4FirstEntry?.(tr.zone.id);
      this._maybeCh5Start?.();
      this._maybeCh5Memories?.(tr.zone.id);
    }
  }

  /** Footsteps follow real walking distance. A stationary player makes no sound. */
  _updateFootsteps() {
    const p = this.player;
    if (!p || !this._audio) return;
    const zoneId = this.zones?.activeZone?.id ?? null;
    const prev = this._stepPrev;
    this._stepPrev = { x: p.x, y: p.y, zoneId };
    if (!prev || prev.zoneId !== zoneId) return;
    const d = Math.hypot(p.x - prev.x, p.y - prev.y);
    if (d < 0.01 || d > FOOTSTEP_MAX_JUMP) return;
    this._stepTravel = (this._stepTravel || 0) + d;
    if (this._stepTravel < FOOTSTEP_DISTANCE) return;
    this._stepTravel -= FOOTSTEP_DISTANCE;
    this._lastFootstep = nextFootstepId(this._lastFootstep ?? null);
    this._audio.playSfx(this._lastFootstep);
  }

  /** Walkability of the player's footprint at a position in the active zone. */
  _isOccupiableAt(x, y) {
    const w = this.player?.w ?? 12;
    const h = this.player?.h ?? 14;
    // position is the entity centre; movement tests the same top-left box (x - w/2, y - h/2)
    return this.zones.collision.isOccupiable({ x: x - w / 2, y: y - h / 2, w, h });
  }

  /**
   * Safe spot in the active zone: the remembered position if it was recorded in this zone
   * and is still walkable; otherwise a walkable spawn of this zone (preferring one not on a trigger).
   */
  _safePosition() {
    const zone = this.zones.activeZone;
    const p = this._lastSafePos;
    if (p && zone && p.zoneId === zone.id && this._isOccupiableAt(p.x, p.y)) {
      return { x: p.x, y: p.y };
    }
    const spawns = zone?.spawnPoints ?? [];
    const clear = spawns.find(
      (s) => this._isOccupiableAt(s.x, s.y) && this.zones.collision.triggersAt(s.x, s.y).length === 0
    );
    const any = spawns.find((s) => this._isOccupiableAt(s.x, s.y));
    const chosen = clear ?? any;
    if (chosen) return { x: chosen.x, y: chosen.y };
    return { x: this.player.x, y: this.player.y };
  }

  _questTitle(id) {
    return this.quests?.getDef?.(id)?.name ?? 'Quest baru';
  }

  _itemTitle(id) {
    return this.inventory?.registry?.get?.(id)?.name ?? 'Barang';
  }

  _bindBattleEvents(events) {
    for (const unsub of this._battleEventUnsubs) unsub?.();
    this._battleEventUnsubs = [];
    if (typeof events?.on !== 'function') return;

    const on = (name, handler) => this._battleEventUnsubs.push(events.on(name, handler));
    on('battle.status_applied', ({ id, status } = {}) => {
      const participant = this.battle?.participants?.find((p) => p.id === id);
      if (participant && status) this._showToast(`${participant.name} terkena ${battleStatusLabel(status)}.`);
    });
    on('battle.status_expired', ({ id, status } = {}) => {
      const participant = this.battle?.participants?.find((p) => p.id === id);
      if (participant && status) this._showToast(`Efek ${battleStatusLabel(status)} pada ${participant.name} berakhir.`);
    });
    on('battle.action_resolved', ({ affinity } = {}) => {
      const message = battleAffinityMessage(affinity);
      if (message) this._showToast(message);
    });
    on('battle.phase_entered', ({ id, index, dialogueId } = {}) => {
      const participant = this.battle?.participants?.find((p) => p.id === id);
      this._showToast(battlePhaseMessage(participant?.name, index));
      if (!dialogueId || !this.dialogue?.get?.(dialogueId)) return;
      try {
        this.dialogue.start(dialogueId);
        this._battleDialogueActive = true;
        this._choiceIndex = 0;
      } catch (error) {
        console.error(`[GameplayDemoScene] boss phase dialogue unavailable: ${dialogueId}`, error);
      }
    });
  }

  _updateBattleDialogue(input) {
    if (!this.dialogue?.isActive) {
      this._battleDialogueActive = false;
      return;
    }
    const taps = input?.pointerDownsThisFrame?.() ?? [];
    const confirm = input?.justPressed('KeyE') || input?.justPressed('Enter') || input?.justPressed('Space') || taps.length > 0;
    if (input?.justPressed('Escape')) {
      this.dialogue.end();
      this._battleDialogueActive = false;
      return;
    }
    const node = this.dialogue.currentNode();
    if (node?.choices?.length) {
      if (input?.justPressed('ArrowUp')) this._choiceIndex = Math.max(0, this._choiceIndex - 1);
      if (input?.justPressed('ArrowDown')) this._choiceIndex = Math.min(node.choices.length - 1, this._choiceIndex + 1);
      if (confirm) {
        this.dialogue.choose(this._choiceIndex);
        if (!this.dialogue.isActive) this._battleDialogueActive = false;
      }
    } else if (confirm) {
      this.dialogue.advance();
      if (!this.dialogue.isActive) this._battleDialogueActive = false;
    }
  }

  _showToast(m) {
    this._toast = m;
    this._toastT = 2.5;
  }

  update(dt) {
    this._uiTime += dt;
    this._artT = (this._artT || 0) + dt;
    PixelArt.setTime(this._artT);
    if (this._pendingContinue) {
      this._pendingContinue = false;
      this._doLoad();
    }
    if (this._toastT > 0) this._toastT -= dt;
    if (this._storyRetryTimer > 0) this._storyRetryTimer = Math.max(0, this._storyRetryTimer - dt);
    const input = this._input;

    if (this._leaving) return;

    // The menu is only available in free exploration. Say so instead of ignoring the press.
    const menuOpenable = ['world', 'pause', 'inventory', 'quest', 'status'].includes(this.mode);
    if (!menuOpenable && input?.justPressed('KeyP')) {
      this._showToast(TOAST.menuBlocked);
    }

    if (this.mode === 'world') {
      // Pause: Escape (keyboard) or the on-screen MENU button (KeyP). Only in free exploration,
      // so the same key never ends a dialogue or closes the inventory.
      if (input?.justPressed('Escape') || input?.justPressed('KeyP')) {
        this._openPause();
        return;
      }
      if (this._advanceQueuedDialogue()) return;
      // Party travel banter uses the same retry/seen lifecycle as every queued banter.
      if (this._maybeCh1TravelBanter()) return;
      this.controller?.update();
      this.entities.update(dt);
      this._updateFootsteps();
      const pp = input?.primaryPointer?.();
      const ptrDown = !!(pp && pp.down);
      const ptrClick = ptrDown && !this._ptrWasDown;
      this._ptrWasDown = ptrDown;
      if (this.controller?.interactPressed || ptrClick) {
        this.interaction.tryInteract(this.player);
      } else {
        this.interaction.findTarget(this.player);
      }

      if (input?.justPressed('KeyI')) this._openOverlay('inventory');
      if (input?.justPressed('KeyQ')) this._openOverlay('quest');
      if (input?.justPressed('KeyC')) this._openOverlay('status');
      if (this._debugHud && input?.justPressed('KeyB')) this._startBattle({ grantRewards: false, source: 'debug' });
      if (this._debugHud) {
        const bossId = Object.entries(DEBUG_BOSS_KEYS).find(([key]) => input?.justPressed(key))?.[1];
        if (bossId) {
          const started = this._startBossBattle(bossId);
          if (!started.ok) this._showToast(started.reason === 'already_defeated' ? 'Boss ini sudah dikalahkan.' : 'Pertemuan boss tidak dapat dimulai.');
        }
      }
      if (input?.justPressed('F5') || input?.justPressed('KeyF')) {
        this._doSave();
      }
      if (input?.justPressed('F9') || input?.justPressed('KeyL')) {
        this._doLoad();
      }
      if (this.perf) {
        this.perf.sample(dt);
        this.perf.entityCount = this.entities?.count ?? 0;
        this.perf.zoneId = this.zones?.activeZone?.id ?? '';
      }

      this._handleZoneTrigger();
      this.pipeline.update(dt);
    } else if (this.mode === 'dialogue') {
      this._updateDialogue(input);
    } else if (this.mode === 'inventory') {
      this._updateInventory(input);
    } else if (this.mode === 'battle') {
      this._updateBattle(input);
    } else if (this.mode === 'quest') {
      this._updateQuest(input);
    } else if (this.mode === 'status') {
      this._updateStatus(input);
    } else if (this.mode === 'levelup') {
      this._updateLevelUp(input);
    } else if (this.mode === 'pause') {
      this._updatePause(input);
    }
  }

  // ----- Pause menu -------------------------------------------------------

  _openPause() {
    this.mode = 'pause';
    this._audio?.playSfx('ui_open');
    this._audio?.setAmbientHold('pause', true);
    this._pauseSub = 'main';
    this._pauseIndex = 0;
    this._pauseNotice = '';
    // Stop the character without touching position, zone or entities.
    this.player?.get?.('movement')?.setDirection?.(0, 0);
  }

  _closePause() {
    this.mode = 'world';
    this._audio?.setAmbientHold('pause', false);
    this._audio?.playSfx('ui_close');
    this._pauseSub = 'main';
    this._pauseNotice = '';
  }

  /** Inventory, quest log and status screens open on top of the pause menu or the world, and close back to it. */
  _openOverlay(mode) {
    this._audio?.playSfx('ui_open');
    this._overlayReturn = this.mode === 'pause' ? 'pause' : 'world';
    this.mode = mode;
    this._invIndex = 0;
    this._questIndex = 0;
    this._statusMemberIdx = 0;
    this.player?.get?.('movement')?.setDirection?.(0, 0);
  }

  _closeOverlay() {
    this._audio?.playSfx('ui_close');
    this.mode = this._overlayReturn === 'pause' ? 'pause' : 'world';
  }

  _questRows() {
    return this.quests.listVisible();
  }

  _pauseItems() {
    if (this._pauseSub === 'audio') return this._audioPauseItems();
    return this._pauseSub === 'confirm' ? PAUSE_CONFIRM_ITEMS : PAUSE_MAIN_ITEMS;
  }

  /** Audio rows with live values. Labels are Bahasa Indonesia. */
  _audioPauseItems() {
    const s = this._audio?.settings ?? { sfxVolume: 0, ambientVolume: 0, muted: false };
    const pct = (v) => `${Math.round(v * 100)}%`;
    return [
      { id: 'audio_sfx', label: `Efek suara: ${pct(s.sfxVolume)}` },
      { id: 'audio_ambient', label: `Ambience: ${pct(s.ambientVolume)}` },
      { id: 'audio_mute', label: `Senyap: ${s.muted ? 'Ya' : 'Tidak'}` },
      { id: 'audio_test_sfx', label: 'Tes efek suara' },
      { id: 'audio_test_ambient', label: 'Tes ambience' },
      { id: 'audio_back', label: 'Kembali' },
    ];
  }

  _updatePause(input) {
    if (!input) return;
    const items = this._pauseItems();
    const count = items.length;
    const prevIndex = this._pauseIndex;
    if (input.justPressed('ArrowUp')) this._pauseIndex = (this._pauseIndex + count - 1) % count;
    if (input.justPressed('ArrowDown')) this._pauseIndex = (this._pauseIndex + 1) % count;
    if (this._pauseIndex !== prevIndex) this._audio?.playSfx('ui_select');
    if (this._pauseSub === 'audio' && (input.justPressed('ArrowLeft') || input.justPressed('ArrowRight'))) {
      this._adjustAudioRow(items[this._pauseIndex].id, input.justPressed('ArrowRight') ? 1 : -1, false);
    }

    if (input.justPressed('Escape') || input.justPressed('KeyP')) {
      if (this._pauseSub === 'confirm') {
        this._pauseSub = 'main';
        this._pauseIndex = PAUSE_MAIN_ITEMS.findIndex((i) => i.id === 'menu');
        this._audio?.playSfx('ui_cancel');
      } else if (this._pauseSub === 'audio') {
        this._pauseSub = 'main';
        this._pauseIndex = PAUSE_MAIN_ITEMS.findIndex((i) => i.id === 'audio');
        this._audio?.playSfx('ui_cancel');
      } else {
        this._closePause();
      }
      return;
    }

    for (const tap of input.pointerDownsThisFrame?.() ?? []) {
      const hit = pauseRowAt(this._pauseSub, tap.x, tap.y, this.pipeline?.surface?.logicalWidth ?? Config.LOGICAL_WIDTH);
      if (hit >= 0) {
        this._pauseIndex = hit;
        this._activatePause(items[hit].id);
        return;
      }
    }

    if (input.justPressed('KeyE') || input.justPressed('Enter')) {
      this._activatePause(items[this._pauseIndex].id);
    }
  }

  _activatePause(id) {
    if (id.startsWith('audio_')) {
      this._activateAudioRow(id);
      return;
    }
    if (id !== 'resume') this._audio?.playSfx('ui_confirm');
    switch (id) {
      case 'resume':
        this._closePause();
        break;
      case 'audio':
        this._pauseSub = 'audio';
        this._pauseIndex = 0;
        break;
      case 'inventory':
        this._openOverlay('inventory');
        break;
      case 'quest':
        this._openOverlay('quest');
        break;
      case 'status':
        this._openOverlay('status');
        break;
      case 'save':
        this._pauseNotice = 'Menyimpan...';
        this._doSave();
        break;
      case 'menu':
        this._pauseSub = 'confirm';
        this._pauseIndex = 1; // default to "Batal" so an accidental press does not leave
        break;
      case 'confirm_menu':
        this._leaveToMenu();
        break;
      case 'cancel':
        this._pauseSub = 'main';
        this._pauseIndex = PAUSE_MAIN_ITEMS.findIndex((i) => i.id === 'menu');
        break;
      default:
        break;
    }
  }

  /** Enter or tap on an audio row. Volume rows step by 0.1 and wrap around. */
  _activateAudioRow(id) {
    const a = this._audio;
    if (id === 'audio_back') {
      this._pauseSub = 'main';
      this._pauseIndex = PAUSE_MAIN_ITEMS.findIndex((i) => i.id === 'audio');
      this._audio?.playSfx('ui_cancel');
      return;
    }
    if (!a) {
      this._pauseNotice = 'Audio tidak tersedia.';
      return;
    }
    if (id === 'audio_test_sfx') {
      if (a.settings.muted) this._pauseNotice = 'Audio sedang senyap.';
      else if (a.settings.sfxVolume <= 0) this._pauseNotice = 'Volume efek suara 0%.';
      else a.playSfx('ui_confirm');
      return;
    }
    if (id === 'audio_test_ambient') {
      if (a.settings.muted) this._pauseNotice = 'Audio sedang senyap.';
      else if (!a.unlocked) this._pauseNotice = 'Audio belum siap.';
      else a.previewAmbient(ambientForZone(this.zones?.activeZone?.id) ?? 'village_breeze', 4);
      return;
    }
    this._adjustAudioRow(id, 1, true);
  }

  /** Change one audio row. wrap=true cycles 0 to 100%; false clamps at both ends. */
  _adjustAudioRow(id, dir, wrap) {
    const a = this._audio;
    if (!a) return;
    const step = (v) => {
      let next = Math.round((v + dir * 0.1) * 10) / 10;
      if (next > 1) next = wrap ? 0 : 1;
      if (next < 0) next = wrap ? 1 : 0;
      return next;
    };
    if (id === 'audio_sfx') a.setSfxVolume(step(a.settings.sfxVolume));
    else if (id === 'audio_ambient') a.setAmbientVolume(step(a.settings.ambientVolume));
    else if (id === 'audio_mute') a.setMuted(!a.settings.muted);
    else return;
    this._pauseNotice = '';
    if (id !== 'audio_ambient') a.playSfx('ui_select');
  }

  _leaveToMenu() {
    if (!this._onReturnToMenu) {
      this._closePause();
      return;
    }
    this._leaving = true;
    Promise.resolve(this._onReturnToMenu()).catch((err) => {
      console.error('[GameplayDemoScene] return to menu failed', err);
    });
  }

  _drawPause(ctx) {
    const W = ctx.canvas?.width ?? Config.LOGICAL_WIDTH;
    const H = ctx.canvas?.height ?? Config.LOGICAL_HEIGHT;
    SpriteRenderer.fillRect(ctx, 0, 0, W, H, '#000', 0.42);
    const p = { ...PAUSE_PANEL, x: (W - PAUSE_PANEL.w) / 2 };
    drawPanel(ctx, p.x, p.y, p.w, p.h, { alpha: 0.97 });
    ctx.font = '11px monospace';
    ctx.fillStyle = UI_COLORS.accent;
    ctx.fillText(this._pauseSub === 'audio' ? 'AUDIO' : 'JEDA', p.x + 12, p.y + 18);

    const items = this._pauseItems();
    if (this._pauseSub === 'confirm') {
      ctx.font = '9px monospace';
      ctx.fillStyle = UI_COLORS.warn;
      ctx.fillText('Progres yang belum disimpan akan hilang.', p.x + 12, p.y + 40);
    }
    items.forEach((item, i) => {
      drawRow(ctx, pauseRowRect(this._pauseSub, i, W), item.label, { selected: i === this._pauseIndex, align: 'left' });
    });

    if (this._pauseNotice && this._pauseSub === 'main') {
      ctx.font = '9px monospace';
      drawFittedText(ctx, this._pauseNotice, p.x + 12, p.y + p.h - 10, p.w - 24, UI_COLORS.speaker);
    }
    if (this._pauseNotice && this._pauseSub === 'audio') {
      ctx.font = '9px monospace';
      drawFittedText(ctx, this._pauseNotice, p.x + 60, p.y + 18, p.w - 72, UI_COLORS.speaker);
    }
  }

  _updateDialogue(input) {
    if (!this.dialogue.isActive) {
      this.mode = 'world';
      this._dialogueLock = false;
      this._enqueuePartyFollowup();
      return;
    }
    const pp = input?.primaryPointer?.();
    const ptrDown = !!(pp && pp.down);
    const ptrClick = ptrDown && !this._ptrWasDown;
    this._ptrWasDown = ptrDown;
    const confirm =
      input?.justPressed('KeyE') ||
      input?.justPressed('Enter') ||
      input?.justPressed('Space') ||
      ptrClick;

    const node = this.dialogue.currentNode();
    if (node?.choices?.length) {
      if (input?.justPressed('ArrowUp')) this._choiceIndex = Math.max(0, this._choiceIndex - 1);
      if (input?.justPressed('ArrowDown'))
        this._choiceIndex = Math.min(node.choices.length - 1, this._choiceIndex + 1);
      // pointer: cycle not required — confirm selects current choice
      if (confirm) {
        this.dialogue.choose(this._choiceIndex);
        if (!this.dialogue.isActive) {
          this.mode = 'world';
          this._dialogueLock = false;
          this._enqueuePartyFollowup();
        }
      }
    } else {
      if (confirm) {
        const r = this.dialogue.advance();
        if (r === 'ended' || !this.dialogue.isActive) {
          this.mode = 'world';
          this._dialogueLock = false;
          this._enqueuePartyFollowup();
        }
      }
    }
    if (input?.justPressed('Escape')) {
      this.dialogue.end();
      this.mode = 'world';
      this._dialogueLock = false;
      this._enqueuePartyFollowup();
    }
  }

  _updateInventory(input) {
    const list = this.inventory.list();
    if (list.length) {
      const invPrev = this._invIndex;
      if (input?.justPressed('ArrowUp')) this._invIndex = Math.max(0, this._invIndex - 1);
      if (input?.justPressed('ArrowDown')) this._invIndex = Math.min(list.length - 1, this._invIndex + 1);
      if (this._invIndex !== invPrev) this._audio?.playSfx('ui_select');
    }
    if (input?.justPressed('KeyE') || input?.justPressed('Enter')) {
      const slot = list[this._invIndex];
      if (slot) {
        const def = slot.def;
        if (def.category === 'consumable') {
          const r = this.inventory.use(slot.itemId, this.stats);
          this._showToast(r.ok ? TOAST.used(def.name) : localizeReason(r.reason));
        } else if (def.category === 'equipment') {
          const r = this.equipment.equip(slot.itemId);
          this._showToast(r.ok ? TOAST.equipped(def.name) : localizeReason(r.reason));
        }
      }
    }
    if (input?.justPressed('KeyU')) {
      if (this.equipment.get('weapon')) {
        this.equipment.unequip('weapon');
        this._showToast(TOAST.unequippedWeapon);
      } else if (this.equipment.get('body')) {
        this.equipment.unequip('body');
        this._showToast(TOAST.unequippedBody);
      } else {
        this._showToast(TOAST.noEquipment);
      }
    }
    if (input?.justPressed('KeyI') || input?.justPressed('Escape') || input?.justPressed('KeyP')) {
      this._closeOverlay();
    }
  }

  _updateQuest(input) {
    const count = this._questRows().length;
    if (count) {
      const questPrev = this._questIndex;
      if (input?.justPressed('ArrowUp')) this._questIndex = Math.max(0, this._questIndex - 1);
      if (input?.justPressed('ArrowDown')) this._questIndex = Math.min(count - 1, this._questIndex + 1);
      if (this._questIndex !== questPrev) this._audio?.playSfx('ui_select');
    }
    if (input?.justPressed('KeyQ') || input?.justPressed('Escape') || input?.justPressed('KeyP')) {
      this._closeOverlay();
    }
  }

  _statusMembers() {
    return this._activePartyMembers();
  }

  _updateStatus(input) {
    const members = this._statusMembers();
    if (members.length > 1) {
      const prev = this._statusMemberIdx;
      if (input?.justPressed('ArrowLeft')) this._statusMemberIdx = (this._statusMemberIdx + members.length - 1) % members.length;
      if (input?.justPressed('ArrowRight')) this._statusMemberIdx = (this._statusMemberIdx + 1) % members.length;
      if (this._statusMemberIdx !== prev) this._audio?.playSfx('ui_select');
    }
    if (input?.justPressed('KeyC') || input?.justPressed('Escape') || input?.justPressed('KeyP')) {
      this._closeOverlay();
    }
  }

  _updateLevelUp(input) {
    if (!this._levelUpQueue.length) {
      this.mode = 'world';
      return;
    }
    const ptr = input?.pointerDownsThisFrame?.() ?? [];
    if (input?.justPressed('Escape')) {
      this._levelUpQueue.length = 0;
      this._audio?.playSfx('ui_close');
      this.mode = 'world';
      return;
    }
    if (input?.justPressed('KeyE') || input?.justPressed('Enter') || input?.justPressed('Space') || ptr.length > 0) {
      this._levelUpQueue.shift();
      if (this._levelUpQueue.length > 0) {
        this._audio?.playSfx('ui_confirm');
      } else {
        this._audio?.playSfx('ui_close');
        this.mode = 'world';
      }
    }
  }

  _partyWorldFlags() {
    return {
      ch1: this._ch1Flags || {}, ch2: this._ch2Flags || {}, ch3: this._ch3Flags || {},
      ch4: this._ch4Flags || {}, ch5: this._ch5Flags || {}, ch6: this._ch6Flags || {},
      ch7: this._ch7Flags || {}, ch8: this._ch8Flags || {},
    };
  }

  _isPartyMemberActive(id) {
    return getActivePartyIds(this._partyWorldFlags(), { maxSize: MAX_ACTIVE_PARTY_SIZE, definitions: PARTY_MEMBER_DEFS }).includes(id);
  }

  _isMiraInParty() { return this._isPartyMemberActive('mira'); }
  _isKaelInParty() { return this._isPartyMemberActive('kael'); }

  _activePartyMembers() {
    const runtime = {
      orin: { id: 'orin', name: 'Orin', stats: this.stats, isLeader: true },
      mira: { id: 'mira', name: 'Mira', stats: this.miraStats, isLeader: false },
      kael: { id: 'kael', name: 'Kael Rowan', stats: this.kaelStats, isLeader: false },
      iven: { id: 'iven', name: 'Iven Marr', stats: this.ivenStats, isLeader: false },
      tavi: { id: 'tavi', name: 'Tavi Brindle', stats: this.taviStats, isLeader: false },
    };
    return getActivePartyIds(this._partyWorldFlags(), { maxSize: MAX_ACTIVE_PARTY_SIZE, definitions: PARTY_MEMBER_DEFS })
      .map((id) => runtime[id])
      .filter((member) => member?.stats);
  }

  _setPartyMemberStatus(id, recruited) {
    const def = PARTY_MEMBER_DEFS[id];
    if (!def || def.permanent || !def.joinFlag) return false;
    const chapter = /^ch(\d+)_/.exec(def.joinFlag)?.[1];
    const flags = chapter ? this[`_ch${chapter}Flags`] : null;
    if (!flags) return false;
    if (recruited) {
      flags[def.joinFlag] = true;
      for (const leaveFlag of def.leaveFlags || []) {
        const leaveChapter = /^ch(\d+)_/.exec(leaveFlag)?.[1];
        const leaveFlags = leaveChapter ? this[`_ch${leaveChapter}Flags`] : null;
        if (leaveFlags) leaveFlags[leaveFlag] = false;
      }
      if (id === 'kael') {
        flags.ch6_kael_recruitment_pending = false;
        flags.ch6_kael_departure_banter_pending = false;
        flags.ch6_party_first_watch_pending = true;
      }
    } else {
      const leaveFlag = def.leaveFlags?.[0];
      const leaveChapter = /^ch(\d+)_/.exec(leaveFlag || '')?.[1];
      const leaveFlags = leaveChapter ? this[`_ch${leaveChapter}Flags`] : null;
      if (!leaveFlag || !leaveFlags) return false;
      leaveFlags[leaveFlag] = true;
    }
    return true;
  }

  /** Build battle participants from the active story roster without changing runtime IDs. */
  _battleParty() {
    return this._activePartyMembers().map((member) => {
      const unlocked = this.progression?.getUnlockedSkillObjects(member.id) ?? [];
      const fallbackSkills = member.id === 'orin'
        ? [SKILL_FIRE]
        : member.id === 'mira' ? [MIRA_SKILL_MEND, MIRA_SKILL_SPARK] : [];
      return {
        id: member.id,
        name: member.name,
        side: 'player',
        stats: member.stats,
        skills: unlocked.length ? unlocked : fallbackSkills,
      };
    });
  }

  _startBattle(options = {}) {
    this._battleBossDef = null;
    const grantRewards = !!options.grantRewards;
    const source = options.source || (grantRewards ? 'encounter' : 'debug');
    const party = this._battleParty();
    const def = getEnemyDefinition('thorn_sprite') || {
      id: 'thorn_sprite', name: 'Sprite Duri', maxHp: 28, attack: 8, defense: 2, speed: 10, exp: 6, gold: 4,
    };
    const e1 = createEnemyParticipant(def, { id: 'thorn1' });
    const e2 = createEnemyParticipant(def, {
      id: 'thorn2',
      statOverrides: {
        attack: Math.max(1, def.attack - 1),
        defense: def.defense + 1,
        speed: def.speed + 1,
      },
    });
    const rewardDef = grantRewards
      ? { grantRewards: true, items: [{ id: 'herb', qty: 1 }], source }
      : { grantRewards: false, source };
    this.battle.start(party, [e1, e2], rewardDef);
    this._battleSkillIndex = 0;
    this._battleSub = 'cmd';
    this._battleSubIndex = 0;
    this._battleSummary = null;
    this._battleSource = source;
    this.mode = 'battle';
    this._battleFx = Object.create(null);
    this._battleFloats = [];
    this._battleCmd = 0;
    this._battleTarget = 0;
  }

  /** Start a registered story/optional boss encounter without coupling content to BattleManager. */
  _startBossBattle(bossId, options = {}) {
    const definition = getBossById(bossId);
    if (!definition) return { ok: false, reason: 'unknown_boss' };
    const defeated = this._bossFlags?.[definition.flagKey] === true
      || this[`_ch${definition.chapter}Flags`]?.[definition.flagKey] === true;
    if (defeated && options.allowReplay !== true) return { ok: false, reason: 'already_defeated' };
    const party = this._battleParty();
    if (!Array.isArray(party) || party.length === 0) return { ok: false, reason: 'empty_party' };
    const boss = createBossParticipant(definition);
    const grantRewards = options.grantRewards !== false;
    const rewardDef = grantRewards
      ? { ...definition.rewards, grantRewards: true, source: `boss:${definition.id}` }
      : { grantRewards: false, source: `boss:${definition.id}` };
    this.battle.start(party, [boss], rewardDef);
    this._battleSkillIndex = 0;
    this._battleSub = 'cmd';
    this._battleSubIndex = 0;
    this._battleSummary = null;
    this._battleSource = `boss:${definition.id}`;
    this._battleBossDef = definition;
    this.mode = 'battle';
    this._battleFx = Object.create(null);
    this._battleFloats = [];
    this._battleCmd = 0;
    this._battleTarget = 0;
    return { ok: true, bossId: definition.id, optional: definition.optional };
  }

  _battleConsumables() {
    return this.inventory.list().filter((s) => s.def?.category === 'consumable' && s.def?.battleUsable !== false && s.qty > 0);
  }

  _finalizeEndedBattle() {
    if (this._battleSummary) return;
    if (this.battle.result === 'victory') {
      const claim = this.battle.claimVictoryRewards();
      if (claim.ok) {
        const rw = claim.rewards;
        if (rw.grantRewards) {
          if (this._battleBossDef?.flagKey) {
            const flagKey = this._battleBossDef.flagKey;
            if (!this._bossFlags) this._bossFlags = Object.create(null);
            this._bossFlags[flagKey] = true;
            const chapterFlags = this[`_ch${this._battleBossDef.chapter}Flags`];
            if (chapterFlags) chapterFlags[flagKey] = true;
          }
          for (const r of rw.items || []) this.inventory.add(r.id, r.qty || 1);
          if (rw.gold) this.gold += rw.gold;
          if (rw.gold || (rw.items && rw.items.length)) this._audio?.playSfx('reward', { delay: 0.25 });
          const expRes = this.progression.awardBattleExp(this.battle.party(), rw.exp || 0, {
            statsById: { orin: this.stats, mira: this.miraStats, kael: this.kaelStats, iven: this.ivenStats, tavi: this.taviStats },
          });
          if (this._battleSource === 'road_ambush') {
            if (!this._ch3Flags) this._ch3Flags = Object.create(null);
            this._ch3Flags.ch3_road_ambush_cleared = true;
          }
          this._battleSummary = {
            result: 'victory',
            exp: expRes.totalExp,
            gold: rw.gold || 0,
            items: rw.items || [],
            grants: expRes.grants,
            levelUps: expRes.levelUps,
          };
          return;
        }
      }
      this._battleSummary = { result: 'victory', exp: 0, gold: 0, items: [], grants: [], levelUps: [] };
      return;
    }
    if (this.battle.result === 'defeat') {
      this._battleSummary = { result: 'defeat', exp: 0, gold: 0, items: [], grants: [], levelUps: [] };
      return;
    }
    this._battleSummary = { result: 'escaped', exp: 0, gold: 0, items: [], grants: [], levelUps: [] };
  }

  _updateBattle(input) {
    // ATB advance (no-op in round mode)
    if (this._battlePresentation) this._battlePresentation.update(Math.min(0.05, this.pipeline?.clock?.delta ?? 0.016));
    if (this.battle && typeof this.battle.update === 'function') {
      const dt = Math.min(0.05, this.pipeline?.clock?.delta ?? 0.016);
      this.battle.update(dt);
    }
    if (this._battleDialogueActive) {
      this._updateBattleDialogue(input);
      return;
    }
    if (this.battle.state === 'ended') {
      this._finalizeEndedBattle();
      const ptr = input?.pointerDownsThisFrame?.() ?? [];
      if (input?.justPressed('KeyE') || input?.justPressed('Enter') || input?.justPressed('Escape') || ptr.length > 0) {
        if (this.battle.result === 'defeat') {
          this.stats.hp = Math.max(1, Math.floor(this.stats.maxHp * 0.5));
          if (this._isMiraInParty() && this.miraStats) {
            this.miraStats.hp = Math.max(1, Math.floor(this.miraStats.maxHp * 0.5));
          }
          const safe = this._safePosition();
          if (this.player) {
            this.player.x = safe.x;
            this.player.y = safe.y;
          }
          this._showToast('Kelompok pulih di titik aman.');
          this.mode = 'world';
          return;
        }
        const levelUps = this._battleSummary?.levelUps ?? [];
        if (levelUps.length > 0) {
          this._levelUpQueue.push(...levelUps);
          this._battleSummary = null;
          this.mode = 'levelup';
          return;
        }
        this.mode = 'world';
      }
      return;
    }
    const cur = this.battle.current;
    if (cur?.side === 'enemy') {
      this.battle.runEnemyTurn();
      if (this.battle.state === 'ended') this._finalizeEndedBattle();
      return;
    }
    if (!cur) return;

    const enemies = this.battle.enemies().filter((e) => e.stats.isAlive);
    const allies = this.battle.party().filter((p) => p.stats.isAlive);
    const actorSkills = cur.skills?.length ? cur.skills : [SKILL_FIRE];

    if (this._battleSub === 'skill') {
      const len = actorSkills.length;
      const idx = Math.max(0, Math.min(len - 1, this._battleSubIndex));
      const activeSkill = actorSkills[idx];
      const activeMode = activeSkill?.target || (activeSkill?.type === 'heal' ? 'ally' : 'enemy');
      const activePool = activeMode === 'self' ? [cur] : activeMode === 'ally'
        ? (activeSkill?.type === 'protect' ? allies.filter((p) => p.id !== cur.id) : allies) : enemies;
      const before = `${idx},${this._battleTarget}`;
      let tapConfirm = false;
      for (const tap of this._battleTaps(input)) {
        if (tap.x >= 10 && tap.x <= 152 && tap.y >= 189 && tap.y <= 229) {
          const row = Math.floor((tap.y - 189) / 10);
          if (row < Math.min(4, len)) this._battleSubIndex = row;
        } else if (tap.x >= 172 && tap.x <= 308 && tap.y >= 196 && tap.y <= 212) {
          if (activePool.length) this._battleTarget = (this._battleTarget + 1) % activePool.length;
        } else if (tap.x >= 226 && tap.x <= 308 && tap.y >= 216 && tap.y <= 237) {
          tapConfirm = true;
        }
      }
      const selectedSkill = actorSkills[this._battleSubIndex % len];
      const selectedMode = selectedSkill?.target || (selectedSkill?.type === 'heal' ? 'ally' : 'enemy');
      const selectedPool = selectedMode === 'self' ? [cur] : selectedMode === 'ally'
        ? (selectedSkill?.type === 'protect' ? allies.filter((p) => p.id !== cur.id) : allies) : enemies;
      if (input?.justPressed('ArrowUp')) this._battleSubIndex = (idx + len - 1) % len;
      if (input?.justPressed('ArrowDown')) this._battleSubIndex = (idx + 1) % len;
      if (input?.justPressed('ArrowLeft') || input?.justPressed('ArrowRight')) {
        const dir = input.justPressed('ArrowRight') ? 1 : -1;
        if (selectedPool.length) this._battleTarget = (this._battleTarget + dir + selectedPool.length) % selectedPool.length;
      }
      if (before !== `${this._battleSubIndex},${this._battleTarget}`) this._audio?.playSfx('ui_select');
      if (input?.justPressed('Escape')) {
        this._battleSub = 'cmd';
        this._audio?.playSfx('ui_cancel');
        return;
      }
      if (input?.justPressed('KeyE') || input?.justPressed('Enter') || tapConfirm) {
        const skill = actorSkills[this._battleSubIndex % len];
        const targetMode = skill?.target || (skill?.type === 'heal' ? 'ally' : 'enemy');
        const pool = targetMode === 'self' ? [cur] : targetMode === 'ally'
          ? (skill?.type === 'protect' ? allies.filter((p) => p.id !== cur.id) : allies) : enemies;
        const target = pool[this._battleTarget] || pool[0];
        if (skill && target) {
          const r = this.battle.commandSkill(cur.id, target.id, skill);
          if (!r.ok) {
            this._showToast(localizeReason(r.reason));
            this._audio?.playSfx('ui_error');
          } else {
            this._battleSub = 'cmd';
            this._battleSubIndex = 0;
            if (this.battle.state === 'ended') this._finalizeEndedBattle();
          }
        }
      }
      return;
    }

    if (this._battleSub === 'item') {
      const items = this._battleConsumables();
      if (!items.length) {
        this._battleSub = 'cmd';
        return;
      }
      const len = items.length;
      const idx = Math.max(0, Math.min(len - 1, this._battleSubIndex));
      const before = `${idx},${this._battleTarget}`;
      let tapConfirm = false;
      for (const tap of this._battleTaps(input)) {
        if (tap.x >= 10 && tap.x <= 152 && tap.y >= 189 && tap.y <= 229) {
          const row = Math.floor((tap.y - 189) / 10);
          if (row < Math.min(4, len)) this._battleSubIndex = row;
        } else if (tap.x >= 172 && tap.x <= 308 && tap.y >= 196 && tap.y <= 212) {
          if (allies.length) this._battleTarget = (this._battleTarget + 1) % allies.length;
        } else if (tap.x >= 226 && tap.x <= 308 && tap.y >= 216 && tap.y <= 237) {
          tapConfirm = true;
        }
      }
      if (input?.justPressed('ArrowUp')) this._battleSubIndex = (idx + len - 1) % len;
      if (input?.justPressed('ArrowDown')) this._battleSubIndex = (idx + 1) % len;
      if (input?.justPressed('ArrowLeft') || input?.justPressed('ArrowRight')) {
        const dir = input.justPressed('ArrowRight') ? 1 : -1;
        if (allies.length) this._battleTarget = (this._battleTarget + dir + allies.length) % allies.length;
      }
      if (before !== `${this._battleSubIndex},${this._battleTarget}`) this._audio?.playSfx('ui_select');
      if (input?.justPressed('Escape')) {
        this._battleSub = 'cmd';
        this._audio?.playSfx('ui_cancel');
        return;
      }
      if (input?.justPressed('KeyE') || input?.justPressed('Enter') || tapConfirm) {
        const slot = items[this._battleSubIndex % len];
        const target = allies[this._battleTarget] || allies[0] || { id: cur.id };
        if (slot) {
          const r = this.battle.commandItem(cur.id, slot.itemId, target.id);
          if (!r.ok) {
            this._showToast(localizeReason(r.reason));
            this._audio?.playSfx('ui_error');
          } else {
            this._battleSub = 'cmd';
            this._battleSubIndex = 0;
            if (this.battle.state === 'ended') this._finalizeEndedBattle();
          }
        }
      }
      return;
    }

    // Main command menu ('cmd')
    const cmds = ['Attack', 'Skill', 'Item', 'Defend', 'Escape'];
    const available = this.battle.availableCommands(cur.id);
    const usableItems = this._battleConsumables().length > 0;
    const commandEnabled = [available.attack, available.skill, available.item && usableItems, available.defend, available.escape];
    let tapConfirm = false;
    for (const tap of this._battleTaps(input)) {
      let hit = -1;
      for (let i = 0; i < cmds.length; i++) {
        const col = i < 3 ? 0 : 1;
        const row = i < 3 ? i : i - 3;
        const x = 10 + col * 72;
        const y = 178 + row * 17;
        if (tap.x >= x && tap.x <= x + 68 && tap.y >= y && tap.y <= y + 15) hit = i;
      }
      if (hit >= 0) {
        this._battleCmd = hit;
        tapConfirm = true;
      } else if (tap.y >= 34 && tap.y <= 122 && tap.x >= 170 && enemies.length) {
        const startX = enemies.length > 1 ? 208 : 240;
        this._battleTarget = Math.max(0, Math.min(enemies.length - 1, Math.round((tap.x - startX) / 64)));
      }
    }
    const cursorBefore = `${this._battleCmd},${this._battleTarget}`;
    if (input?.justPressed('ArrowUp')) this._battleCmd = (this._battleCmd + cmds.length - 1) % cmds.length;
    if (input?.justPressed('ArrowDown')) this._battleCmd = (this._battleCmd + 1) % cmds.length;
    if (input?.justPressed('ArrowLeft') || input?.justPressed('ArrowRight')) {
      const dir = input.justPressed('ArrowRight') ? 1 : -1;
      if (enemies.length) this._battleTarget = Math.max(0, Math.min(enemies.length - 1, this._battleTarget + dir));
    }
    if (cursorBefore !== `${this._battleCmd},${this._battleTarget}`) {
      this._audio?.playSfx('ui_select');
    }
    if (input?.justPressed('KeyE') || input?.justPressed('Enter') || tapConfirm) {
      const actorId = cur.id;
      if (!commandEnabled[this._battleCmd]) {
        const reason = this._battleCmd === 2 && !usableItems ? 'no_battle_items' : available.reasons?.[['attack', 'skill', 'item', 'defend', 'escape'][this._battleCmd]];
        this._showToast(reason === 'silenced' ? 'Dalam keadaan Bisu, skill tidak bisa digunakan.' : reason === 'no_battle_items' ? TOAST.noBattleItems : localizeReason(reason));
        this._audio?.playSfx('ui_error');
        return;
      }
      switch (this._battleCmd) {
        case 0: {
          const target = enemies[this._battleTarget] || enemies[0];
          if (target) this.battle.commandAttack(actorId, target.id);
          break;
        }
        case 1: {
          this._battleSub = 'skill';
          this._battleSubIndex = 0;
          this._battleTarget = 0;
          this._audio?.playSfx('ui_confirm');
          return;
        }
        case 2: {
          const items = this._battleConsumables();
          if (!items.length) {
            this._showToast(TOAST.noBattleItems);
            this._audio?.playSfx('ui_error');
            return;
          }
          this._battleSub = 'item';
          this._battleSubIndex = 0;
          this._battleTarget = 0;
          this._audio?.playSfx('ui_confirm');
          return;
        }
        case 3:
          this.battle.commandDefend(actorId);
          break;
        case 4:
          this.battle.commandEscape(actorId, 0.7);
          break;
      }
      if (this.battle.state === 'ended') this._finalizeEndedBattle();
    }
  }


  async _doSave() {
    if (!this.saveManager) {
      this._pauseNotice = TOAST.saveFailed(localizeReason('no_manager'));
      this._audio?.playSfx('ui_save_fail');
      return { ok: false, reason: 'no_manager' };
    }
    const payload = this.saveManager.buildPayload(
      {
        player: this.player,
        stats: this.stats,
        inventory: this.inventory,
        equipment: this.equipment,
        quests: this.quests,
        zoneId: this.zones?.activeZone?.id,
        gold: this.gold,
        miraStats: this.miraStats,
        kaelStats: this.kaelStats,
        progression: this.progression,
        partyRoster: {
          ...getPartyRosterSnapshot(this._partyWorldFlags(), PARTY_MEMBER_DEFS),
          memberStats: {
            iven: snapshotCurrentHpMp(this.ivenStats),
            tavi: snapshotCurrentHpMp(this.taviStats),
          },
        },
        worldFlags: {
          ch1: { ...(this._ch1Flags || {}) },
          ch2: { ...(this._ch2Flags || {}) },
          ch3: { ...(this._ch3Flags || {}) },
          ch4: { ...(this._ch4Flags || {}) },
          ch5: { ...(this._ch5Flags || {}) },
          ch6: { ...(this._ch6Flags || {}) },
          ch7: { ...(this._ch7Flags || {}) },
          ch8: { ...(this._ch8Flags || {}) },
          bosses: { ...(this._bossFlags || {}) },
          // one-time story/banter bookkeeping so a reload does not replay finished beats
          meta: { partySeen: { ...(this._partySeen || {}) }, dialogueDone: { ...(this._dialogueDone || {}) } },
        },
      },
      'slot1'
    );
    const r = await this.saveManager.save('slot1', payload);
    if (!r.ok) this._audio?.playSfx('ui_save_fail');
    // Only a completed save is reported as saved.
    this._pauseNotice = r.ok ? TOAST.saved : TOAST.saveFailed(localizeReason(r.reason));
    this._showToast(r.ok ? TOAST.saved : TOAST.saveFailed(localizeReason(r.reason)));
    return r;
  }

  _enterZoneAt(zoneId, x, y) {
    const pid = this.player.id;
    this.zones.transitionTo(zoneId, null);
    this._lastSafePos = null;
    const zone = this.zones.activeZone;
    for (const e of [...this.entities.all()]) if (e.id !== pid) this.entities.remove(e.id);
    this.player.zoneId = zone.id;
    this.player.x = x;
    this.player.y = y;
    const mov = this.player.get('movement');
    if (mov) mov.collision = this.zones.collision;
    this._spawnZoneNpcs(zone);
    this._applyCamera();
    this._rebuildLayers();
  }

  async _doLoad() {
    if (!this.saveManager) return;
    const r = await this.saveManager.load('slot1');
    if (!r.ok) {
      this._showToast(TOAST.loadFailed(localizeReason(r.reason)));
      return;
    }
    const d = r.data;
    this.gold = d.gold ?? 0;
    // restore inventory first
    this.inventory.slots = (d.inventory.slots || []).map((s) => ({ ...s }));
    // clear active equipment modifiers cleanly before syncing progression base stats
    for (const slot of Object.keys(this.equipment.equipped)) {
      if (this.equipment.equipped[slot]) {
        this.stats.removeModifier(`equip:${slot}`);
        this.equipment.equipped[slot] = null;
      }
    }
    // restore progression (levels, exp, unlocked skills) and recalculate base stats cleanly
    if (this.progression) {
      this.progression.importState(d.progression, {
        statsById: { orin: this.stats, mira: this.miraStats, kael: this.kaelStats, iven: this.ivenStats, tavi: this.taviStats },
      });
    }
    // restore equipped items directly onto equipment slots and apply their stat modifiers
    for (const [slot, itemId] of Object.entries(d.equipment || {})) {
      if (!itemId || !Object.prototype.hasOwnProperty.call(this.equipment.equipped, slot)) continue;
      const def = this.registry.get(itemId);
      if (def && def.category === 'equipment' && def.equipSlot === slot) {
        this.equipment.equipped[slot] = itemId;
        if (def.stats) this.stats.addModifier(`equip:${slot}`, def.stats);
      }
    }
    // restore HP/MP safely clamped to current effective max values
    this.stats.hp = Math.max(0, Math.min(this.stats.maxHp, d.player.stats.hp ?? this.stats.maxHp));
    this.stats.mp = Math.max(0, Math.min(this.stats.maxMp, d.player.stats.mp ?? this.stats.maxMp));
    if (d.party?.mira && this.miraStats) {
      const m = d.party.mira;
      this.miraStats.hp = Math.max(0, Math.min(this.miraStats.maxHp, m.hp ?? this.miraStats.maxHp));
      this.miraStats.mp = Math.max(0, Math.min(this.miraStats.maxMp, m.mp ?? this.miraStats.maxMp));
    }
    if (d.party?.kael && this.kaelStats) {
      const k = d.party.kael;
      this.kaelStats.hp = Math.max(0, Math.min(this.kaelStats.maxHp, k.hp ?? this.kaelStats.maxHp));
      this.kaelStats.mp = Math.max(0, Math.min(this.kaelStats.maxMp, k.mp ?? this.kaelStats.maxMp));
    }
    const savedMemberStats = d.party?.roster?.memberStats || {};
    for (const [id, stats] of [['iven', this.ivenStats], ['tavi', this.taviStats]]) {
      const saved = savedMemberStats[id];
      if (!stats || !saved || typeof saved !== 'object') continue;
      if (Number.isFinite(saved.hp)) stats.hp = Math.max(0, Math.min(stats.maxHp, saved.hp));
      if (Number.isFinite(saved.mp)) stats.mp = Math.max(0, Math.min(stats.maxMp, saved.mp));
    }
    // restore quests
    if (d.quests?.states && this.quests._state) {
      for (const [id, st] of Object.entries(d.quests.states)) {
        if (this.quests._state.has(id)) {
          this.quests._state.set(id, { status: st.status, progress: { ...st.progress } });
        }
      }
    }
    // restore story flags
    const wf = d.world?.flags || {};
    this._ch1Flags = Object.assign(Object.create(null), wf.ch1 || {});
    this._ch2Flags = Object.assign(Object.create(null), wf.ch2 || {});
    this._ch3Flags = Object.assign(Object.create(null), wf.ch3 || {});
    this._ch4Flags = Object.assign(Object.create(null), wf.ch4 || {});
    this._ch5Flags = Object.assign(Object.create(null), wf.ch5 || {});
    this._ch6Flags = Object.assign(Object.create(null), wf.ch6 || {});
    this._ch7Flags = Object.assign(Object.create(null), wf.ch7 || {});
    this._ch8Flags = Object.assign(Object.create(null), wf.ch8 || {});
    this._bossFlags = Object.assign(Object.create(null), wf.bosses || {});
    const restoredFlags = restorePartyRosterFlags(wf, d.party?.roster || {}, PARTY_MEMBER_DEFS);
    this._ch1Flags = Object.assign(Object.create(null), restoredFlags.ch1 || this._ch1Flags);
    this._ch6Flags = Object.assign(Object.create(null), restoredFlags.ch6 || this._ch6Flags);
    this._ch7Flags = Object.assign(Object.create(null), restoredFlags.ch7 || this._ch7Flags);
    this._ch8Flags = Object.assign(Object.create(null), restoredFlags.ch8 || this._ch8Flags);
    this._partySeen = Object.assign(Object.create(null), wf.meta?.partySeen || {});
    this._dialogueDone = Object.assign(Object.create(null), wf.meta?.dialogueDone || {});
    if (this._ch6Flags.ch6_party_first_watch_pending && this._ch6Flags.ch6_kael_joined) {
      this._storyNext = 'ch6_party_first_watch';
    } else if (this._ch6Flags.ch6_kael_recruitment_pending && !this._ch6Flags.ch6_kael_joined) {
      this._storyNext = 'ch6_kael_recruitment';
    } else if (this._ch6Flags.ch6_kael_departure_banter_pending && !this._dialogueDone.ch5_banter_departure) {
      this._storyNext = 'ch5_banter_departure';
    }
    this._migrateMainQuests();
    // restore zone (same entity setup as a normal zone change), then position.
    // A save pointing at a zone that is still locked is not trusted: load the village instead.
    this._lastSafePos = null;
    const savedZone = d.player.zoneId;
    const lock = savedZone ? this._zoneLockReason(savedZone) : null;
    const zoneId = lock ? 'village' : savedZone;
    if (zoneId && this.zones?.activeZone?.id !== zoneId && this.zones?.hasZone?.(zoneId)) {
      this._enterZoneAt(zoneId, d.player.x, d.player.y);
    } else if (this.zones?.activeZone?.id === 'road_bellhaven' && this._ch3Flags?.ch3_road_ambush_cleared) {
      this.entities.remove('road_ambush');
    }
    if (this.player) {
      const target = lock
        ? (this.zones.activeZone?.getDefaultSpawn?.() ?? { x: this.player.x, y: this.player.y })
        : { x: d.player.x, y: d.player.y };
      // saved coordinates must be walkable in the restored zone; otherwise use that zone's safe spot
      const ok = this._isOccupiableAt(target.x, target.y);
      const pos = ok ? target : this._safePosition();
      this.player.x = pos.x;
      this.player.y = pos.y;
      this.player.facing = d.player.facing || 'down';
      this._lastSafePos = ok ? { zoneId: this.zones.activeZone?.id ?? null, x: pos.x, y: pos.y } : null;
    }
    this._showToast(lock ? lock : TOAST.loaded(this.zones?.activeZone?.name ?? zoneId));
  }

  _drawUI(ctx) {
    const W = ctx.canvas?.width ?? Config.LOGICAL_WIDTH;
    const H = ctx.canvas?.height ?? Config.LOGICAL_HEIGHT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    if (this.mode === 'world') {
      this._drawWorldHud(ctx, W);
      this._drawInteractHint(ctx, W, H);
    }
    if (this.mode === 'dialogue' && this.dialogue?.isActive) this._drawDialogue(ctx, W, H);
    if (this.mode === 'inventory') this._drawInventory(ctx, W, H);
    if (this.mode === 'quest') this._drawQuest(ctx, W, H);
    if (this.mode === 'status') this._drawStatus(ctx, W, H);
    if (this.mode === 'battle') {
      this._drawBattle(ctx, W, H);
      if (this._battleDialogueActive && this.dialogue?.isActive) this._drawDialogue(ctx, W, H);
    }
    if (this.mode === 'levelup') this._drawLevelUp(ctx, W, H);
    if (this.mode === 'pause') this._drawPause(ctx);

    if (this._toastT > 0 && this._toast && this.mode !== 'pause' && !this._battleDialogueActive) {
      ctx.font = '10px monospace';
      const text = fitText(ctx, this._toast, W - 60);
      const tw = Math.min(W - 40, Math.ceil(ctx.measureText(text).width) + 20);
      const toastY = this.mode === 'world' ? 40 : H / 2 - 11;
      drawPanel(ctx, (W - tw) / 2, toastY, tw, 22, { alpha: 0.9 });
      ctx.fillStyle = UI_COLORS.text;
      ctx.textAlign = 'center';
      ctx.fillText(text, W / 2, toastY + 15);
      ctx.textAlign = 'left';
    }
  }

  /** Top bar: location, level, gold, HP/MP bars and the main quest line. Values come from game state. */
  _drawWorldHud(ctx, W) {
    if (this._debugHud) {
      SpriteRenderer.fillRect(ctx, 0, 0, W, 14, '#000', 0.55);
      ctx.font = '9px monospace';
      ctx.fillStyle = UI_COLORS.text;
      const perf = this.perf?.snapshot();
      ctx.fillText(`Gameplay Demo · E talk · I inv · C stat · Q quest · B battle${perf ? ` · fps~${perf.fps}` : ''}`, 4, 10);
    }
    const top = this._debugHud ? 16 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.fillRect(0, top, W, 32);
    ctx.fillStyle = UI_COLORS.accent;
    ctx.fillRect(0, top + 32, W, 1);

    let insets = null;
    try {
      insets = this._hudInsets ? this._hudInsets() : null;
    } catch (_) {
      insets = null;
    }
    const padL = 6 + Math.max(0, Math.round(insets?.left ?? 0));
    const padR = Math.max(6, Math.round(insets?.right ?? 0));

    const orinProg = this.progression?.getState('orin');
    const lvLabel = orinProg ? `Lv.${orinProg.level} · Gold ${this.gold}` : `Gold ${this.gold}`;
    ctx.font = '9px monospace';
    drawFittedText(ctx, this.zones?.activeZone?.name ?? '', padL, top + 10, W - padL - padR - 102, UI_COLORS.speaker);
    ctx.textAlign = 'right';
    ctx.fillStyle = UI_COLORS.accent;
    ctx.fillText(lvLabel, W - padR, top + 10);
    ctx.textAlign = 'left';

    this._drawHudBar(ctx, padL, top + 13, 'HP', this.stats.hp, this.stats.maxHp, UI_COLORS.hp, UI_COLORS.hpBack);
    this._drawHudBar(ctx, padL + 160, top + 13, 'MP', this.stats.mp, this.stats.maxMp, UI_COLORS.mp, UI_COLORS.mpBack);

    const aq = this.quests.activeQuests()[0];
    const quest = aq
      ? `Quest: ${aq.def.name} (${aq.objectives[0].current}/${aq.objectives[0].need})`
      : 'Tidak ada quest aktif.';
    ctx.font = '8px monospace';
    drawFittedText(ctx, quest, padL, top + 29, W - padL - padR, UI_COLORS.text);
  }

  _drawHudBar(ctx, x, y, label, value, max, color, back) {
    ctx.font = '8px monospace';
    ctx.fillStyle = UI_COLORS.text;
    ctx.fillText(label, x, y + 6);
    drawBar(ctx, x + 18, y, 96, 5, value, max, color, back);
    // drawBar leaves fillStyle at its shadow colour; restore the text colour before the value.
    ctx.fillStyle = UI_COLORS.text;
    ctx.fillText(`${value}/${max}`, x + 118, y + 6);
  }

  /** Small hint near the bottom when something can be used with AKSI / E. */
  _drawInteractHint(ctx, W, H) {
    const target = this.interaction?.currentTarget;
    const ic = target?.get?.('interaction');
    if (!ic) return;
    ctx.font = '9px monospace';
    const text = `[E] ${localizePrompt(ic.prompt)}`;
    const w = Math.ceil(ctx.measureText(text).width) + 14;
    drawPanel(ctx, (W - w) / 2, H - 24, w, 16, { alpha: 0.9 });
    ctx.fillStyle = UI_COLORS.accent;
    ctx.fillText(text, (W - w) / 2 + 7, H - 13);
  }

  _drawDialogue(ctx, W, H) {
    const node = this.dialogue.currentNode();
    const choices = node?.choices ?? null;
    ctx.font = '10px monospace';
    const measure = (str) => ctx.measureText(str).width;
    const LINE = 13;
    const boxX = 10;
    const boxW = W - 20;
    const textW = boxW - 20;
    const textLines = wrapLines(node?.text || '', textW, measure);
    const footerH = choices ? choices.length * 15 + 4 : 16;
    const boxH = Math.max(64, 18 + textLines.length * LINE + 8 + footerH);
    const boxY = H - 8 - boxH;

    drawPanel(ctx, boxX, boxY, boxW, boxH, { alpha: 0.94 });
    drawSpeakerTag(ctx, boxX + 8, boxY - 7, node?.speaker || '', boxW - 16);

    ctx.fillStyle = UI_COLORS.text;
    textLines.forEach((line, n) => ctx.fillText(line, boxX + 10, boxY + 18 + n * LINE));

    const fy = boxY + 18 + textLines.length * LINE + 6;
    if (choices) {
      choices.forEach((c, i) => {
        const row = { x: boxX + 6, y: fy + i * 15 - 10, w: boxW - 12, h: 14 };
        ctx.font = '10px monospace';
        const label = fitText(ctx, c.text, row.w - 24);
        drawRow(ctx, row, label, { selected: i === this._choiceIndex });
      });
    } else {
      ctx.font = '8px monospace';
      ctx.fillStyle = UI_COLORS.textDim;
      ctx.fillText('AKSI / E: lanjut', boxX + 10, boxY + boxH - 6);
      drawContinueIndicator(ctx, boxX + boxW - 12, boxY + boxH - 4, this._uiTime);
    }
  }

  /** Shared frame for inventory and quest log. */
  _drawScreenFrame(ctx, W, H, title) {
    const x = 12;
    const y = 10;
    const w = W - 24;
    const h = H - 20;
    drawPanel(ctx, x, y, w, h, { alpha: 0.96 });
    ctx.font = '11px monospace';
    ctx.fillStyle = UI_COLORS.accent;
    ctx.fillText(title, x + 10, y + 18);
    return { x, y, w, h };
  }

  _drawInventory(ctx, W, H) {
    const f = this._drawScreenFrame(ctx, W, H, 'Inventaris');
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = UI_COLORS.textDim;
    ctx.fillText(`ATK ${this.stats.attack}  DEF ${this.stats.defense}`, f.x + f.w - 10, f.y + 18);
    ctx.textAlign = 'left';

    const weaponId = this.equipment.get('weapon');
    const bodyId = this.equipment.get('body');
    const weaponName = weaponId ? this._itemTitle(weaponId) : '-';
    const bodyName = bodyId ? this._itemTitle(bodyId) : '-';
    ctx.font = '8px monospace';
    drawFittedText(ctx, `Senjata: ${weaponName}  |  Baju: ${bodyName}`, f.x + 10, f.y + 31, f.w - 20, UI_COLORS.speaker);

    const list = this.inventory.list();
    const listTop = f.y + 40;
    const rowH = 15;
    const visible = Math.max(1, Math.floor((f.h - 110) / rowH));
    if (!list.length) {
      ctx.font = '10px monospace';
      ctx.fillStyle = UI_COLORS.textDim;
      ctx.fillText('Inventaris kosong.', f.x + 12, listTop + 12);
    }
    this._invIndex = Math.min(this._invIndex, Math.max(0, list.length - 1));
    const start = Math.max(0, this._invIndex - visible + 1);
    list.slice(start, start + visible).forEach((s, k) => {
      const i = start + k;
      const equipped = s.itemId === weaponId || s.itemId === bodyId ? ' [dipasang]' : '';
      ctx.font = '10px monospace';
      const label = fitText(ctx, `${s.def?.name ?? s.itemId} x${s.qty}${equipped}`, f.w - 40);
      drawRow(ctx, { x: f.x + 6, y: listTop + k * rowH, w: f.w - 12, h: rowH - 1 }, label, { selected: i === this._invIndex });
    });

    const sel = list[this._invIndex];
    const descY = f.y + f.h - 50;
    ctx.fillStyle = UI_COLORS.rowFill;
    ctx.fillRect(f.x + 6, descY - 4, f.w - 12, 30);
    ctx.font = '9px monospace';
    ctx.fillStyle = UI_COLORS.text;
    const icon = sel && PixelArt.ready ? PixelArt.itemIcon(sel.itemId, sel.def?.category) : null;
    if (icon) ctx.drawImage(icon, f.x + 10, descY - 2);
    if (sel?.def?.description) {
      const lines = wrapLines(sel.def.description, f.w - 28 - (icon ? 22 : 0), (t) => ctx.measureText(t).width).slice(0, 2);
      lines.forEach((l, n) => ctx.fillText(l, f.x + 12 + (icon ? 22 : 0), descY + 8 + n * 11));
    }
    ctx.font = '8px monospace';
    ctx.fillStyle = UI_COLORS.textDim;
    drawFittedText(ctx, 'AKSI/E pakai · U lepas alat · I/MENU tutup', f.x + 10, f.y + f.h - 8, f.w - 20, UI_COLORS.textDim);
  }

  _drawQuest(ctx, W, H) {
    const f = this._drawScreenFrame(ctx, W, H, 'Catatan Quest');
    const rows = this._questRows();
    if (!rows.length) {
      ctx.font = '10px monospace';
      ctx.fillStyle = UI_COLORS.textDim;
      ctx.fillText('Belum ada quest.', f.x + 12, f.y + 40);
    }
    this._questIndex = Math.min(this._questIndex, Math.max(0, rows.length - 1));
    const rowH = 16;
    const visible = 4;
    const start = Math.max(0, this._questIndex - visible + 1);
    rows.slice(start, start + visible).forEach((q, k) => {
      const i = start + k;
      ctx.font = '10px monospace';
      const suffix = q.status === 'completed' ? ' (selesai)' : '';
      const label = fitText(ctx, `${q.def.name}${suffix}`, f.w - 36);
      drawRow(ctx, { x: f.x + 6, y: f.y + 26 + k * rowH, w: f.w - 12, h: rowH - 1 }, label, {
        selected: i === this._questIndex,
        disabled: q.status === 'completed',
      });
    });

    const q = rows[this._questIndex];
    if (!q) return;
    const shownCount = Math.min(rows.length, visible);
    const top = f.y + 26 + shownCount * rowH + 8;
    ctx.font = '9px monospace';
    const measure = (t) => ctx.measureText(t).width;
    let y = top + 8;
    if (q.def.description) {
      wrapLines(q.def.description, f.w - 28, measure).slice(0, 3).forEach((l) => {
        ctx.fillStyle = UI_COLORS.text;
        ctx.fillText(l, f.x + 12, y);
        y += 11;
      });
      y += 3;
    }
    for (const o of q.objectives) {
      const done = o.current >= o.need;
      const text = `${done ? '[x]' : '[ ]'} ${objectiveLabel(o.description ?? o.id)} ${o.current}/${o.need}`;
      wrapLines(text, f.w - 28, measure).slice(0, 2).forEach((l) => {
        ctx.fillStyle = done ? UI_COLORS.ok : UI_COLORS.text;
        ctx.fillText(l, f.x + 12, y);
        y += 11;
      });
    }
    ctx.font = '8px monospace';
    drawFittedText(ctx, '▲▼ pilih quest · MENU/Q tutup', f.x + 10, f.y + f.h - 8, f.w - 20, UI_COLORS.textDim);
  }

  _drawStatus(ctx, W, H) {
    const f = this._drawScreenFrame(ctx, W, H, 'Status & Skill');
    const members = this._statusMembers();
    this._statusMemberIdx = Math.max(0, Math.min(members.length - 1, this._statusMemberIdx));
    const member = members[this._statusMemberIdx];
    const prog = this.progression?.getState(member.id);
    const st = member.stats;

    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = members.length > 1 ? UI_COLORS.accent : UI_COLORS.textDim;
    const tabHint = members.length > 1
      ? `< ${member.name} (${this._statusMemberIdx + 1}/${members.length}) >`
      : member.name;
    ctx.fillText(tabHint, f.x + f.w - 10, f.y + 18);
    ctx.textAlign = 'left';

    const lv = prog?.level ?? 1;
    ctx.font = '10px monospace';
    drawFittedText(ctx, `${member.name} · Level ${lv}`, f.x + 10, f.y + 33, f.w - 20, UI_COLORS.speaker);

    // EXP bar & value
    const isMax = !!prog?.isMaxLevel;
    const expText = isMax ? 'EXP: MAKS' : `EXP: ${prog?.exp ?? 0}/${prog?.expToNext ?? 12}`;
    ctx.font = '8px monospace';
    drawFittedText(ctx, expText, f.x + 10, f.y + 45, 110, UI_COLORS.accent);
    drawBar(ctx, f.x + 122, f.y + 39, f.w - 134, 6, isMax ? 1 : (prog?.exp ?? 0), isMax ? 1 : (prog?.expToNext || 1), UI_COLORS.accent, '#2b2214');

    // Two-column stat grid
    const col1X = f.x + 10;
    const col2X = f.x + 152;
    const statY = f.y + 59;
    ctx.font = '8px monospace';
    const leftStats = [
      `HP  : ${st.hp}/${st.maxHp}`,
      `MP  : ${st.mp}/${st.maxMp}`,
      `ATK : ${st.attack}${st.attack > st.base.attack ? ` (+${st.attack - st.base.attack})` : ''}`,
      `DEF : ${st.defense}${st.defense > st.base.defense ? ` (+${st.defense - st.base.defense})` : ''}`,
    ];
    const rightStats = [
      `MATK: ${st.magicAttack}`,
      `MDEF: ${st.magicDefense}`,
      `SPD : ${st.speed}`,
      `CRIT: ${Math.round(st.critChance * 100)}%`,
    ];
    leftStats.forEach((line, idx) => drawFittedText(ctx, line, col1X, statY + idx * 11, 134, UI_COLORS.text));
    rightStats.forEach((line, idx) => drawFittedText(ctx, line, col2X, statY + idx * 11, 128, UI_COLORS.text));

    // Equipment summary for Orin
    const eqY = statY + 47;
    if (member.id === 'orin') {
      const wpn = this.equipment.get('weapon');
      const body = this.equipment.get('body');
      const eqText = `Alat: ${wpn ? this._itemTitle(wpn) : '-'} · ${body ? this._itemTitle(body) : '-'}`;
      drawFittedText(ctx, eqText, f.x + 10, eqY, f.w - 20, UI_COLORS.textDim);
    } else {
      drawFittedText(ctx, `Peran: ${prog?.role || 'Penyembuh & Sihir'}`, f.x + 10, eqY, f.w - 20, UI_COLORS.textDim);
    }

    // Skill progression list (unlocked + locked preview)
    const skillHeaderY = eqY + 14;
    ctx.font = '9px monospace';
    drawFittedText(ctx, 'Daftar Skill:', f.x + 10, skillHeaderY, f.w - 20, UI_COLORS.accent);
    const catalog = this.progression?.getSkillCatalogForCharacter(member.id) ?? [];
    ctx.font = '8px monospace';
    catalog.slice(0, 4).forEach((entry, idx) => {
      const y = skillHeaderY + 12 + idx * 12;
      const line = entry.unlocked
        ? `${entry.skill.name} (${entry.skill.mpCost} MP) - ${entry.skill.description || ''}`
        : `[Terkunci Lv.${entry.level}] ${entry.skill.name}`;
      drawFittedText(ctx, line, f.x + 12, y, f.w - 24, entry.unlocked ? UI_COLORS.text : UI_COLORS.disabled);
    });

    ctx.font = '8px monospace';
    const footer = members.length > 1 ? '◀▶ ganti anggota · C/MENU tutup' : 'C/MENU tutup';
    drawFittedText(ctx, footer, f.x + 10, f.y + f.h - 8, f.w - 20, UI_COLORS.textDim);
  }

  _drawLevelUp(ctx, W, H) {
    SpriteRenderer.fillRect(ctx, 0, 0, W, H, '#000', 0.65);
    const card = this._levelUpQueue[0];
    if (!card) return;
    const x = 20;
    const y = 26;
    const w = W - 40;
    const h = H - 52;
    drawPanel(ctx, x, y, w, h, { alpha: 0.97 });

    ctx.font = '11px monospace';
    drawFittedText(ctx, 'NAIK LEVEL!', x + 12, y + 20, w - 24, UI_COLORS.accent);

    ctx.font = '10px monospace';
    drawFittedText(ctx, `${card.name}: Level ${card.prevLevel} -> Level ${card.newLevel}`, x + 12, y + 38, w - 24, UI_COLORS.speaker);

    const deltas = card.statDeltas || {};
    const statLabels = [
      ['maxHp', 'HP Maks'],
      ['maxMp', 'MP Maks'],
      ['attack', 'ATK'],
      ['defense', 'DEF'],
      ['magicAttack', 'MATK'],
      ['magicDefense', 'MDEF'],
      ['speed', 'SPD'],
    ].filter(([k]) => (deltas[k] ?? 0) > 0);

    ctx.font = '8px monospace';
    drawFittedText(ctx, 'Peningkatan Status:', x + 12, y + 54, w - 24, UI_COLORS.ok);
    statLabels.forEach(([key, label], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = x + 14 + col * 126;
      const sy = y + 67 + row * 12;
      drawFittedText(ctx, `${label} +${deltas[key]}`, sx, sy, 120, UI_COLORS.text);
    });

    const skills = card.unlockedSkills || [];
    const skillY = y + 120;
    if (skills.length > 0) {
      ctx.font = '9px monospace';
      drawFittedText(ctx, 'Skill Baru Terbuka:', x + 12, skillY, w - 24, UI_COLORS.accent);
      ctx.font = '8px monospace';
      skills.slice(0, 2).forEach((sk, idx) => {
        drawFittedText(ctx, `• ${sk.name} (${sk.mpCost} MP)`, x + 14, skillY + 13 + idx * 12, w - 28, UI_COLORS.text);
      });
    } else {
      ctx.font = '8px monospace';
      drawFittedText(ctx, 'Kekuatan kelompok terus berkembang.', x + 12, skillY + 8, w - 24, UI_COLORS.textDim);
    }

    ctx.font = '8px monospace';
    const rem = this._levelUpQueue.length > 1 ? ` (${this._levelUpQueue.length - 1} lagi)` : '';
    drawFittedText(ctx, `Tekan AKSI / E untuk lanjut${rem}`, x + 12, y + h - 10, w - 24, UI_COLORS.textDim);
  }

  /** Battle UI is laid out for 320 px; on wider landscape screens it is centred. */
  _battleOffsetX(W = this.pipeline?.surface?.logicalWidth ?? Config.LOGICAL_WIDTH) {
    return Math.max(0, Math.floor((W - Config.LOGICAL_WIDTH) / 2));
  }

  /** Pointer taps in the battle layout's own 320 px coordinates. */
  _battleTaps(input) {
    const taps = input?.pointerDownsThisFrame?.() ?? [];
    const ox = this._battleOffsetX();
    return ox === 0 ? taps : taps.map((t) => ({ ...t, x: t.x - ox }));
  }

  _battleStageTheme() {
    return this.zones?.activeZone?.id === 'road_bellhaven' ? 'road' : 'forest';
  }

  _drawBattle(ctx, W, H) {
    const BW = Config.LOGICAL_WIDTH;
    const ox = this._battleOffsetX(W);
    if (ox <= 0) {
      this._drawBattleInner(ctx, W, H, false);
      return;
    }
    // Wide landscape: full-width backdrop, with the 320 px battle layout centred on top.
    SpriteRenderer.fillRect(ctx, 0, 0, W, H, '#1a2030', 1);
    const stage = PixelArt.ready ? PixelArt.battleStage(this._battleStageTheme(), W) : null;
    if (stage) ctx.drawImage(stage, 0, 14);
    ctx.save();
    try {
      ctx.translate(ox, 0);
      this._drawBattleInner(ctx, BW, H, !!stage);
    } finally {
      ctx.restore();
    }
  }

  /** @param {boolean} wideBackdrop true when a full-width backdrop is already drawn behind the layout */
  _drawBattleInner(ctx, W, H, wideBackdrop = false) {
    const b = this.battle;
    this._battleWideBackdrop = wideBackdrop;
    if (!wideBackdrop) SpriteRenderer.fillRect(ctx, 0, 0, W, H, '#1a2030', 1);

    const players = b.participants.filter((p) => p.side === 'player');
    const enemies = b.participants.filter((p) => p.side !== 'player');
    const art = PixelArt.ready;
    if (art) this._drawBattleStage(ctx, W, players, enemies);
    // FF3 presentation overlay
    if (this._battlePresentation) {
      const a = this._battlePresentation.getOverlayAlpha();
      if (a > 0.01) {
        ctx.fillStyle = `rgba(10,8,20,${a})`;
        ctx.fillRect(0, 0, W, H);
      }
    }
    else {
      // Fallback colored boxes at new layout positions
      players.forEach((p, i) => {
        const s = partySlot(i, players.length);
        SpriteRenderer.fillRect(ctx, s.left, s.top, s.right - s.left, s.bottom - s.top, '#3a5aa8', 0.8);
      });
      enemies.forEach((p, i) => {
        const s = enemySlot(i, enemies.length);
        SpriteRenderer.fillRect(ctx, s.left, s.top, s.right - s.left, s.bottom - s.top, '#c24b49', 0.8);
      });
    }

    // Compact current-actor chip (full queue hidden; getTurnQueue still available)
    const currentName = b.current?.name ?? '';
    if (currentName && b.state === 'active') {
      ctx.font = '8px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      const tw = ctx.measureText(currentName).width + 12;
      ctx.fillRect(6, 6, tw, 12);
      ctx.fillStyle = UI_COLORS.accent;
      ctx.fillText(currentName, 10, 15);
    }
    const playerTurn = b.state === 'active' && b.current?.side === 'player';

    const logY = art ? 126 : 120;
    const logH = art ? 44 : 50;
    drawPanel(ctx, 6, logY, W - 12, logH, { alpha: 0.9 });
    ctx.font = '9px monospace';
    const logLines = b.log.slice(-3).map(localizeBattleLog);
    logLines.forEach((l, i) => {
      ctx.fillStyle = i === logLines.length - 1 ? UI_COLORS.text : UI_COLORS.textDim;
      drawFittedText(ctx, l, 12, logY + 12 + i * 13, W - 24, ctx.fillStyle);
    });

    // New FF4-style bottom windows
    const ew = BATTLE_LAYOUT.enemyPanel;
    const pw = BATTLE_LAYOUT.partyStatusPanel;
    drawPanel(ctx, ew.x, ew.y, ew.w, ew.h, { alpha: 0.94 });
    drawPanel(ctx, pw.x, pw.y, pw.w, pw.h, { alpha: 0.94 });

    // Enemy names (with counts for duplicates)
    ctx.font = '8px monospace';
    const nameCounts = {};
    for (const e of enemies) {
      nameCounts[e.name] = (nameCounts[e.name] || 0) + 1;
    }
    const uniqueNames = [...new Set(enemies.map(e => e.name))];
    uniqueNames.slice(0, 4).forEach((name, i) => {
      const cnt = nameCounts[name];
      const txt = cnt > 1 ? `${name} ×${cnt}` : name;
      ctx.fillStyle = UI_COLORS.enemy;
      ctx.fillText(txt, ew.x + 6, ew.y + 14 + i * 12);
    });

    // Party status rows
    players.slice(0, 4).forEach((p, i) => {
      const ry = pw.y + 8 + i * 13;
      const active = p.id === b.currentId;
      ctx.font = '8px monospace';
      ctx.fillStyle = !p.stats.isAlive ? UI_COLORS.disabled : active ? UI_COLORS.accent : UI_COLORS.text;
      const prefix = active ? '▶ ' : '  ';
      drawFittedText(ctx, `${prefix}${p.name}`, pw.x + 4, ry + 8, 60, ctx.fillStyle);
      ctx.fillStyle = UI_COLORS.textDim;
      ctx.fillText(`HP ${p.stats.hp}/${p.stats.maxHp}`, pw.x + 66, ry + 8);
      ctx.fillText(`MP ${p.stats.mp}/${p.stats.maxMp}`, pw.x + 130, ry + 8);
      // ATB gauge (hidden in round mode)
      if (b.mode && b.mode !== 'round' && b.atb) {
        const g = b.atb.get(p.id) || 0;
        const gx = pw.x + 170;
        const gy = ry + 2;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(gx, gy, 20, 6);
        ctx.fillStyle = g >= 1 ? '#f1c94b' : '#8a9ab0';
        ctx.fillRect(gx, gy, Math.round(20 * g), 6);
      }
    });

    if (b.state === 'ended') {
      const sum = this._battleSummary;
      ctx.font = '8px monospace';
      if (b.result === 'victory' && sum) {
        drawFittedText(ctx, 'Menang!', 14, 188, 134, UI_COLORS.ok);
        drawFittedText(ctx, `+${sum.exp} EXP  +${sum.gold} Gold`, 14, 201, 134, UI_COLORS.accent);
        const lvTxt = sum.levelUps?.length
          ? `Naik Level: ${sum.levelUps.map((u) => `${u.name} Lv.${u.newLevel}`).join(', ')}`
          : 'Semua anggota aman.';
        drawFittedText(ctx, lvTxt, 14, 214, 134, UI_COLORS.text);
      } else if (b.result === 'defeat') {
        drawFittedText(ctx, 'Kalah dalam pertempuran.', 14, 192, 134, UI_COLORS.enemy);
        drawFittedText(ctx, 'Pulih ke titik aman.', 14, 206, 134, UI_COLORS.textDim);
      } else {
        drawFittedText(ctx, 'Berhasil kabur.', 14, 196, 134, UI_COLORS.text);
      }
      ctx.font = '9px monospace';
      drawFittedText(ctx, 'Tekan AKSI / E lanjut.', 172, 206, 134, UI_COLORS.accent);
      return;
    }
    if (!playerTurn) {
      ctx.font = '9px monospace';
      ctx.fillStyle = UI_COLORS.textDim;
      ctx.fillText('Menunggu giliran...', 14, 206);
      return;
    }

    const alive = enemies.filter((e) => e.stats.isAlive);
    const allies = players.filter((p) => p.stats.isAlive);
    const actor = b.current;

    if (this._battleSub === 'skill') {
      const actorSkills = actor?.skills?.length ? actor.skills : [SKILL_FIRE];
      const selIdx = this._battleSubIndex % actorSkills.length;
      const skill = actorSkills[selIdx];
      const targetMode = skill?.target || (skill?.type === 'heal' ? 'ally' : 'enemy');
      const targetPool = targetMode === 'self' ? [actor] : targetMode === 'ally'
        ? (skill?.type === 'protect' ? allies.filter((p) => p.id !== actor?.id) : allies) : alive;
      const target = targetPool[this._battleTarget] || targetPool[0];

      ctx.font = '8px monospace';
      drawFittedText(ctx, `Skill ${actor?.name ?? ''}:`, 12, 185, 138, UI_COLORS.accent);
      actorSkills.slice(0, 4).forEach((sk, idx) => {
        const disabled = (actor?.stats?.mp ?? 0) < (sk.mpCost ?? 0);
        drawRow(ctx, { x: 10, y: 189 + idx * 10, w: 142, h: 10 }, `${sk.signature ? '✦ ' : ''}${sk.name} (${sk.mpCost}MP)`, {
          selected: idx === selIdx,
          disabled,
          font: '8px monospace',
        });
      });

      ctx.font = '9px monospace';
      drawFittedText(ctx, skill?.name ?? '', 172, 186, 136, UI_COLORS.accent);
      drawFittedText(ctx, `‹ ${target?.name ?? '-'} ›`, 172, 198, 136, UI_COLORS.speaker);
      ctx.font = '8px monospace';
      wrapLines(skill?.description ?? '', 136, (t) => ctx.measureText(t).width)
        .slice(0, 2)
        .forEach((l, n) => {
          ctx.fillStyle = UI_COLORS.text;
          ctx.fillText(l, 172, 210 + n * 10);
        });
      drawRow(ctx, { x: 226, y: 216, w: 82, h: 15 }, 'Pakai', { selected: true, font: '8px monospace' });
      drawFittedText(ctx, 'Tap target untuk ganti', 172, 232, 136, UI_COLORS.textDim);
      return;
    }

    if (this._battleSub === 'item') {
      const items = this._battleConsumables();
      const selIdx = items.length ? this._battleSubIndex % items.length : 0;
      const itemSlot = items[selIdx];
      const target = allies[this._battleTarget] || allies[0];

      ctx.font = '8px monospace';
      drawFittedText(ctx, 'Pilih Item:', 12, 185, 138, UI_COLORS.accent);
      items.slice(0, 3).forEach((s, idx) => {
        drawRow(ctx, { x: 10, y: 189 + idx * 14, w: 142, h: 13 }, `${s.def?.name ?? s.itemId} x${s.qty}`, {
          selected: idx === selIdx,
          font: '8px monospace',
        });
      });

      ctx.font = '9px monospace';
      drawFittedText(ctx, itemSlot?.def?.name ?? '-', 172, 186, 136, UI_COLORS.accent);
      drawFittedText(ctx, `‹ ${target?.name ?? '-'} ›`, 172, 198, 136, UI_COLORS.speaker);
      ctx.font = '8px monospace';
      drawFittedText(ctx, itemSlot?.def?.description ?? '', 172, 212, 136, UI_COLORS.text);
      drawRow(ctx, { x: 226, y: 216, w: 82, h: 15 }, 'Pakai', { selected: true, font: '8px monospace' });
      drawFittedText(ctx, 'Tap target untuk ganti', 172, 232, 136, UI_COLORS.textDim);
      return;
    }

    const available = b.availableCommands(actor?.id);
    const hasItems = this._battleConsumables().length > 0;
    const commandEnabled = [available.attack, available.skill, available.item && hasItems, available.defend, available.escape];
    // Command window overlays enemy window
    const cw = BATTLE_LAYOUT.commandPanel;
    drawPanel(ctx, cw.x, cw.y, cw.w, cw.h, { alpha: 0.96 });
    BATTLE_LAYOUT.commandSlots.forEach((slot, i) => {
      drawRow(ctx, slot, slot.label, {
        selected: i === this._battleCmd,
        disabled: !commandEnabled[i],
        font: '9px monospace',
      });
    });

    const target = alive[this._battleTarget] || alive[0];
    const actorProg = this.progression?.getState(actor?.id);
    const actorTag = actorProg ? `${actor?.name ?? ''} Lv.${actorProg.level}` : `${actor?.name ?? ''}`;
    ctx.font = '9px monospace';
    drawFittedText(ctx, actorTag, 172, 186, 136, UI_COLORS.accent);
    drawFittedText(ctx, `Target: ${target?.name ?? '-'}`, 172, 198, 136, UI_COLORS.speaker);
    ctx.font = '8px monospace';
    wrapLines(BATTLE_COMMAND_HELP[this._battleCmd] ?? '', 136, (t) => ctx.measureText(t).width)
      .slice(0, 2)
      .forEach((l, n) => {
        ctx.fillStyle = UI_COLORS.text;
        ctx.fillText(l, 172, 210 + n * 10);
      });
    ctx.fillStyle = UI_COLORS.textDim;
    ctx.fillText('◀▶ target · ▲▼ pilih', 172, 231);
  }

  /** Pixel-art battle stage: backdrop, sprites, hit flashes, damage numbers and compact HP plates. */
  _drawBattleStage(ctx, W, players, enemies) {
    const b = this.battle;
    const t = PixelArt.time;
    const dt = Math.min(0.1, Math.max(0, t - (this._fxLastT ?? t)));
    this._fxLastT = t;
    const fx = (this._battleFx ||= Object.create(null));
    const floats = (this._battleFloats ||= []);

    const stage = this._battleWideBackdrop ? null : PixelArt.battleStage(this._battleStageTheme());
    if (stage) ctx.drawImage(stage, 0, 14);

    const slots = [
      ...players.map((p, i) => ({ p, ...partySlot(i, players.length) })),
      ...enemies.map((p, i) => ({ p, ...enemySlot(i, enemies.length) })),
    ];

    for (const { p, x, y } of slots) {
      const st = (fx[p.id] ||= { hp: p.stats.hp, hit: 0, fade: 1 });
      if (p.stats.hp < st.hp) {
        st.hit = 0.4;
        floats.push({ x, y: y - 46, text: String(st.hp - p.stats.hp), t: 0, color: p.side === 'player' ? '#ff8a8a' : '#ffe27a' });
      } else if (p.stats.hp > st.hp) {
        floats.push({ x, y: y - 46, text: '+' + (p.stats.hp - st.hp), t: 0, color: '#8aff9a' });
      }
      st.hp = p.stats.hp;
      st.hit = Math.max(0, st.hit - dt);
      if (!p.stats.isAlive) st.fade = Math.max(0, st.fade - dt * 1.6);
      else st.fade = 1;
      const shake = st.hit > 0 ? Math.round(Math.sin(st.hit * 60) * 3) : 0;
      const opts = { flash: st.hit > 0 ? st.hit / 0.4 : 0, alpha: st.fade, dx: shake };
      if (st.fade > 0) {
        if (p.side === 'player') PixelArt.drawPartyMemberBattle(ctx, p.id, x, y, opts);
        else if (!drawExternalEnemy(ctx, p.defId || p.id, x, y, opts)) PixelArt.drawEnemy(ctx, p, x, y, opts);
      }
      // active-turn marker
      if (b.state === 'active' && p.id === b.currentId && p.stats.isAlive) {
        const bob = Math.round(Math.sin(t * 6) * 2);
        const my = y - (p.side === 'player' ? 52 : 38) + bob;
        ctx.fillStyle = '#f1c94b';
        ctx.fillRect(x - 3, my, 7, 1);
        ctx.fillRect(x - 2, my + 1, 5, 1);
        ctx.fillRect(x - 1, my + 2, 3, 1);
        ctx.fillRect(x, my + 3, 1, 1);
      }
      // compact HP plate
      const w = 60;
      const px = Math.round(x - w / 2);
      ctx.font = '8px monospace';
      const statusText = p.statuses?.map((status) => BATTLE_STATUS_SHORT[status.id] ?? status.id.slice(0, 3).toUpperCase()).join(' ');
      drawFittedText(ctx, p.name, px, y + 9, w, p.stats.isAlive ? UI_COLORS.text : UI_COLORS.disabled);
      drawBar(ctx, px, y + 11, w, 4, p.stats.hp, p.stats.maxHp, !p.stats.isAlive ? UI_COLORS.disabled : p.side === 'player' ? UI_COLORS.ok : UI_COLORS.enemy);
      if (p.side === 'player') {
        ctx.font = '7px monospace';
        ctx.fillStyle = UI_COLORS.textDim;
        ctx.fillText(`${p.stats.hp}/${p.stats.maxHp} MP ${p.stats.mp}`, px, y + 22);
      }
      if (statusText) {
        ctx.font = '6px monospace';
        ctx.fillStyle = UI_COLORS.warn;
        drawFittedText(ctx, statusText, px, y + 30, w, UI_COLORS.warn);
      }
    }

    // floating numbers
    ctx.font = 'bold 10px monospace';
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.t += dt;
      if (f.t > 0.9) { floats.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, (0.9 - f.t) * 3);
      ctx.fillStyle = '#14101e';
      ctx.fillText(f.text, f.x - 5, f.y - f.t * 22 + 1);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x - 6, f.y - f.t * 22);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left';
  }

  /** One side of the battle: name, HP bar and MP (party only). The active turn is highlighted. */
  _drawBattlePanel(ctx, x, y, w, h, title, list, color, showMp) {
    drawPanel(ctx, x, y, w, h, { alpha: 0.94 });
    ctx.font = '8px monospace';
    ctx.fillStyle = UI_COLORS.speaker;
    ctx.fillText(title, x + 6, y + 10);
    const rowH = 26;
    const maxRows = Math.floor((h - 16) / rowH);
    list.slice(0, maxRows).forEach((p, i) => {
      const ry = y + 14 + i * rowH;
      const active = this.battle.state === 'active' && p.id === this.battle.currentId;
      const alive = p.stats.isAlive;
      if (active) {
        ctx.fillStyle = UI_COLORS.rowSelected;
        ctx.fillRect(x + 3, ry - 1, w - 6, rowH - 2);
      }
      ctx.font = '9px monospace';
      ctx.fillStyle = !alive ? UI_COLORS.disabled : active ? UI_COLORS.accent : UI_COLORS.text;
      const tag = !alive ? ' (tumbang)' : p.defending || p.guardUntilRound >= this.battle.round ? ' (bertahan)' : p.tauntUntilRound >= this.battle.round ? ' (menantang)' : '';
      const protectTag = p.protectUntilRound >= this.battle.round ? ' [dilindungi]' : '';
      const statusTag = p.statuses?.length ? ` [${p.statuses.map((status) => BATTLE_STATUS_SHORT[status.id] ?? status.id.slice(0, 3).toUpperCase()).join(',')}]` : '';
      drawFittedText(ctx, `${active ? '>' : ' '}${p.name}${tag}${protectTag}${statusTag}`, x + 6, ry + 8, w - 12, ctx.fillStyle);
      drawBar(ctx, x + 6, ry + 10, w - 12, 4, p.stats.hp, p.stats.maxHp, alive ? color : UI_COLORS.disabled);
      ctx.font = '8px monospace';
      ctx.fillStyle = UI_COLORS.textDim;
      const mp = showMp ? `  MP ${p.stats.mp}/${p.stats.maxMp}` : '';
      ctx.fillText(`HP ${p.stats.hp}/${p.stats.maxHp}${mp}`, x + 6, ry + 20);
    });
    if (list.length > maxRows) {
      ctx.font = '8px monospace';
      ctx.fillStyle = UI_COLORS.textDim;
      ctx.fillText(`+${list.length - maxRows} lagi`, x + w - 46, y + h - 5);
    }
  }

  render() {
    this.pipeline.render();
  }

  exit() {
    for (const unsub of this._battleEventUnsubs) unsub?.();
    this._battleEventUnsubs = [];
    this._battleDialogueActive = false;
    this._audioUnbind?.();
    this._audioUnbind = null;
    this._audio?.setAmbientHold('battle', false);
    this._audio?.setAmbientHold('pause', false);
    this._audio?.playAmbient(null);
    this.entities?.clear();
    this.zones?.deactivate();
  }

  destroy() {
    this.exit();
  }
}
