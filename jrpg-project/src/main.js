/**
 * Composition root.
 * Startup: boot → main menu. A session (New Game / Continue) creates a fresh gameplay
 * scene; "Kembali ke Menu Utama" destroys it and returns to the menu.
 */
import { BrowserClock } from './platform/browser/BrowserClock.js';
import { IndexedDBAdapter } from './platform/browser/IndexedDBAdapter.js';
import { MemoryStorageAdapter } from './engine/persistence/MemoryStorageAdapter.js';
import { RafScheduler } from './platform/browser/RafScheduler.js';
import { BrowserViewport } from './platform/browser/BrowserViewport.js';
import { CanvasSurface } from './platform/browser/CanvasSurface.js';
import { KeyboardAdapter } from './platform/browser/KeyboardAdapter.js';
import { PointerAdapter } from './platform/browser/PointerAdapter.js';
import { TouchControls, shouldShowTouchControls } from './platform/browser/TouchControls.js';
import { buildDemoTextures } from './platform/browser/ProceduralTextures.js';
import { pixBufToCanvas } from './platform/browser/PixelArtCanvas.js';
import { PixelArt } from './engine/rendering/pixelart/PixelArt.js';
import { Input } from './engine/input/Input.js';
import { Game } from './core/Game.js';
import { SceneManager } from './core/SceneManager.js';
import { EventBus } from './core/EventBus.js';
import { TextureCache } from './engine/rendering/TextureCache.js';
import { GameplayDemoScene } from './scenes/GameplayDemoScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { Config } from './core/Config.js';
import { log } from './core/Logger.js';
import { registerServiceWorker } from './platform/browser/registerServiceWorker.js';
import { WebAudioAdapter, installUnlockOnGesture } from './platform/browser/WebAudioAdapter.js';
import { LocalAudioSettingsStore } from './platform/browser/AudioSettingsStore.js';
import { AudioManager } from './engine/audio/AudioManager.js';

const MENU_KEY = 'main-menu';
const GAMEPLAY_KEY = 'gameplay-demo';

function createCanvas() {
  const existing = document.getElementById('game-canvas');
  if (existing) return /** @type {HTMLCanvasElement} */ (existing);
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.style.display = 'block';
  canvas.style.background = '#000';
  // iOS Safari turns a long press on the canvas into an image/selection callout ("Salin") and can
  // swallow the tap. The game uses its own input, so block the browser's selection and menu here.
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('selectstart', (e) => e.preventDefault());
  document.body.appendChild(canvas);
  return canvas;
}

function showFatal(message) {
  const el = document.createElement('div');
  el.style.cssText =
    'position:fixed;inset:0;display:grid;place-items:center;background:#2a1d2e;color:#f6e7c1;font-family:system-ui;padding:1.5rem;text-align:center;z-index:9999';
  el.innerHTML = `<h1>Failed to start</h1><p>${message}</p>`;
  document.body.appendChild(el);
}

async function bootstrap() {
  try {
    document.body.innerHTML = '';
    document.body.style.cssText =
      'position:fixed;inset:0;margin:0;background:#0d0a10;overflow:hidden;width:100%;height:100vh;height:100dvh;touch-action:none;';

    const canvas = createCanvas();
    const surface = new CanvasSurface(canvas, {
      logicalWidth: Config.LOGICAL_WIDTH,
      logicalHeight: Config.LOGICAL_HEIGHT,
    });
    const clock = new BrowserClock();
    const scheduler = new RafScheduler();
    const viewport = new BrowserViewport();
    const keyboard = new KeyboardAdapter();
    const pointer = new PointerAdapter(canvas, (cx, cy) => surface.clientToLogical(cx, cy));
    const touch = new TouchControls();
    const input = new Input([keyboard, pointer, touch]);
    PixelArt.configure({ toImage: pixBufToCanvas });
    const textures = new TextureCache();
    for (const [k, v] of Object.entries(buildDemoTextures())) textures.set(k, v);

    // Touch overlay only on touch-capable devices (or ?touch=1 for testing).
    const showTouch = shouldShowTouchControls(window);
    if (showTouch) touch.mount(document, window);
    touch.setVisible(false);

    const orientationNotice = document.createElement('div');
    orientationNotice.className = 'orientation-notice';
    orientationNotice.setAttribute('role', 'status');
    orientationNotice.setAttribute('aria-live', 'polite');
    orientationNotice.innerHTML = '<span class="orientation-icon" aria-hidden="true">↻</span><span>Putar perangkat ke posisi horizontal untuk bermain dengan nyaman.</span>';
    orientationNotice.hidden = true;
    document.body.appendChild(orientationNotice);

    let sessionActive = false;
    // Safe-area probe: lets the in-canvas HUD stay clear of the notch / rounded corners.
    const safeProbe = document.createElement('div');
    safeProbe.setAttribute('aria-hidden', 'true');
    safeProbe.style.cssText =
      'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);';
    document.body.appendChild(safeProbe);
    const isPortrait = () => {
      const query = window.matchMedia?.('(orientation: portrait)');
      if (query) return query.matches;
      return window.innerHeight > window.innerWidth;
    };
    /** Space (logical px) the world HUD keeps clear: safe-area overlap + the on-screen MENU button. */
    const hudInsets = () => {
      const scale = surface.scale || 1;
      const rect = canvas.getBoundingClientRect();
      const cs = window.getComputedStyle(safeProbe);
      const safeLeft = Math.max(0, (parseFloat(cs.paddingLeft) || 0) - rect.left);
      const safeRight = Math.max(0, (parseFloat(cs.paddingRight) || 0) - (window.innerWidth - rect.right));
      // MENU button (TouchControls): 54px wide, max(10px, safe-area) from the canvas edge, plus a gap.
      const menuReserve = showTouch && sessionActive && !isPortrait() ? Math.max(10, safeRight) + 54 + 6 : safeRight;
      return { left: Math.ceil(safeLeft / scale), right: Math.ceil(menuReserve / scale) };
    };
    const syncMobileLayout = () => {
      // Older cached TouchControls modules may not expose viewport alignment yet.
      // Keep startup safe while the service worker refreshes the module cache.
      if (typeof touch.setBounds === 'function') {
        touch.setBounds(canvas.getBoundingClientRect());
      }
      const portrait = showTouch && isPortrait();
      orientationNotice.hidden = !portrait;
      touch.setVisible(showTouch && sessionActive && !portrait);
    };
    window.addEventListener('resize', syncMobileLayout, { passive: true });
    window.addEventListener('orientationchange', syncMobileLayout, { passive: true });
    window.visualViewport?.addEventListener('resize', syncMobileLayout, { passive: true });
    window.addEventListener('pageshow', syncMobileLayout);

    const scenes = new SceneManager();
    const events = new EventBus();
    // Audio: no BGM. Output starts only after the first user gesture (iOS and Android rule).
    const audio = new AudioManager({
      port: new WebAudioAdapter({ basePath: './' }),
      settingsStore: new LocalAudioSettingsStore(),
    });
    audio.loadSettings();
    installUnlockOnGesture(window, () => audio.unlock());
    const idb = new IndexedDBAdapter();
    const saveAdapter = (await idb.isAvailable()) ? idb : new MemoryStorageAdapter();
    // Developer HUD is opt-in only (?debug=1); players never see demo labels.
    const debugHud = new URLSearchParams(window.location.search).has('debug');
    const sessionBase = { surface, input, textures, events, audio };

    async function returnToMenu() {
      sessionActive = false;
      touch.setVisible(false);
      if (scenes.has(GAMEPLAY_KEY)) await scenes.destroy(GAMEPLAY_KEY);
      await scenes.switchTo(MENU_KEY, sessionBase);
      syncMobileLayout();
    }

    /** New Game / Continue: always a fresh gameplay scene, so no state leaks between sessions. */
    async function beginSession(startMode) {
      sessionActive = true;
      if (scenes.has(GAMEPLAY_KEY)) await scenes.destroy(GAMEPLAY_KEY);
      scenes.register(
        GAMEPLAY_KEY,
        new GameplayDemoScene({ saveAdapter, debugHud, onReturnToMenu: returnToMenu, hudInsets })
      );
      syncMobileLayout();
      await scenes.switchTo(GAMEPLAY_KEY, { ...sessionBase, startMode });
    }

    scenes.register(
      MENU_KEY,
      new MainMenuScene({
        saveAdapter,
        onStartGame: (startMode) => beginSession(startMode),
        audio,
      })
    );

    const game = new Game({
      clock,
      scheduler,
      viewport,
      surface,
      input,
      scenes,
      events,
    });

    // Production entry point: the player starts at the main menu, not in gameplay.
    await scenes.switchTo(MENU_KEY, sessionBase);
    game.start();
    syncMobileLayout();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        game.pause();
        audio.suspend();
      } else {
        game.resume();
        audio.resume();
      }
    });

    if (typeof window !== 'undefined') {
      window.__JRPG__ = { game, scenes, events, input, surface, textures, Config, touch, audio };
    }
    registerServiceWorker('./service-worker.js').then((r) => log.info('SW', r));
    log.info('Bootstrap complete — MainMenuScene');
  } catch (err) {
    console.error(err);
    showFatal(err instanceof Error ? err.message : String(err));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
