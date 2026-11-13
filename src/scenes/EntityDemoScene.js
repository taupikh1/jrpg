import { Config } from '../core/Config.js';
import { RenderPipeline } from '../engine/rendering/RenderPipeline.js';
import { SpriteRenderer } from '../engine/rendering/SpriteRenderer.js';
import { ZoneManager } from '../engine/world/zones/ZoneManager.js';
import { DEMO_TILESET, ZONE_VILLAGE, ZONE_FOREST } from '../../content/world/demo-data.js';
import { Entity } from '../engine/entities/Entity.js';
import { EntityManager } from '../engine/entities/EntityManager.js';
import { MovementComponent } from '../engine/entities/components/MovementComponent.js';
import { SpriteComponent } from '../engine/entities/components/SpriteComponent.js';
import { NavigationComponent } from '../engine/entities/components/NavigationComponent.js';
import { InteractionComponent } from '../engine/entities/components/InteractionComponent.js';
import { PlayerController } from '../engine/entities/controllers/PlayerController.js';
import { InteractionSystem } from '../engine/entities/systems/InteractionSystem.js';
import { Animator } from '../engine/rendering/Animator.js';

/**
 * Batch 4 integrated demo: player, NPCs, collision, nav, interaction, zone transition.
 */
export class EntityDemoScene {
  constructor() {
    this.pipeline = null;
    this.zones = null;
    this.entities = null;
    this.player = null;
    this.controller = null;
    this.interaction = null;
    this._input = null;
    this._events = null;
    this._lastMsg = '';
    this._msgTimer = 0;
  }

  init(data = {}) {
    this._input = data.input;
    this._events = data.events;
    this.pipeline = new RenderPipeline({ surface: data.surface });
    this.zones = new ZoneManager({ events: data.events, textures: data.textures });
    this.zones.registerTileset(DEMO_TILESET);
    this.zones.registerZone(ZONE_VILLAGE);
    this.zones.registerZone(ZONE_FOREST);

    this.entities = new EntityManager();
    this.interaction = new InteractionSystem(this.entities);

    const zone = this.zones.activate('village', 'start');
    this._spawnZoneEntities(zone);
    this._applyCamera();
    this._rebuildStaticLayers();
  }

  _spawnZoneEntities(zone) {
    this.entities.clear();
    const spawn = zone.getSpawn('start') || zone.getDefaultSpawn();
    const col = this.zones.collision;

    // Player
    const player = new Entity({
      id: 'player',
      type: 'player',
      x: spawn.x,
      y: spawn.y,
      w: 12,
      h: 12,
      zoneId: zone.id,
    });
    const anim = new Animator();
    anim.addClip({
      name: 'idle',
      frameDuration: 0.3,
      loop: true,
      frames: [{ sx: 0, sy: 16, sw: 16, sh: 16 }],
    });
    anim.addClip({
      name: 'walk',
      frameDuration: 0.12,
      loop: true,
      frames: [
        { sx: 0, sy: 0, sw: 16, sh: 16 },
        { sx: 16, sy: 0, sw: 16, sh: 16 },
        { sx: 32, sy: 0, sw: 16, sh: 16 },
        { sx: 48, sy: 0, sw: 16, sh: 16 },
      ],
    });
    anim.play('idle');
    player.add('movement', new MovementComponent({ speed: 70, collision: col }));
    player.add(
      'sprite',
      new SpriteComponent({
        color: '#e8c84a',
        animator: anim,
        image: this.zones.textures?.get?.('hero') ?? null,
      })
    );
    this.entities.add(player);
    this.player = player;
    this.controller = new PlayerController({ input: this._input, entity: player });

    // NPC static
    const npc1 = new Entity({
      id: 'npc_guard',
      type: 'npc',
      x: 120,
      y: 100,
      w: 12,
      h: 14,
      zoneId: zone.id,
    });
    npc1.add('sprite', new SpriteComponent({ color: '#6a9ae8' }));
    npc1.add(
      'interaction',
      new InteractionComponent({
        range: 28,
        prompt: 'Talk',
        onInteract: () => this._toast('Guard: "Welcome to the village."'),
      })
    );
    this.entities.add(npc1);

    // NPC with navigation
    const npc2 = new Entity({
      id: 'npc_walker',
      type: 'npc',
      x: 200,
      y: 150,
      w: 12,
      h: 14,
      zoneId: zone.id,
    });
    npc2.add('sprite', new SpriteComponent({ color: '#e86a9a' }));
    const nav = new NavigationComponent({
      getGrid: () => this.zones.navGrid,
      tileSize: 16,
      speed: 35,
    });
    npc2.add('navigation', nav);
    npc2.add(
      'interaction',
      new InteractionComponent({
        range: 24,
        prompt: 'Talk',
        onInteract: () => this._toast('Walker: "I patrol these paths."'),
      })
    );
    this.entities.add(npc2);
    // Start a short patrol path
    nav.setDestination(240, 180, npc2);

    // Sign (interactive object, not zone exit)
    const sign = new Entity({
      id: 'sign_01',
      type: 'object',
      x: 180,
      y: 90,
      w: 14,
      h: 14,
      zoneId: zone.id,
    });
    sign.add('sprite', new SpriteComponent({ color: '#c4a574' }));
    sign.add(
      'interaction',
      new InteractionComponent({
        range: 22,
        prompt: 'Read',
        onInteract: () => this._toast('Sign: "North road leads to the forest."'),
      })
    );
    this.entities.add(sign);
  }

  _applyCamera() {
    const zone = this.zones.activeZone;
    const cam = this.pipeline.camera;
    cam.setBounds(0, 0, zone.pixelWidth, zone.pixelHeight);
    cam.follow(this.player);
    cam.followLerp = 0.12;
    cam.deadZoneW = 24;
    cam.deadZoneH = 16;
  }

  _rebuildStaticLayers() {
    const layers = this.pipeline.layers;
    layers.clearAll();
    const zm = this.zones;
    const ents = this.entities;
    const self = this;

    layers.add('ground', {
      x: 0,
      y: 0,
      width: zm.activeZone.pixelWidth,
      height: zm.activeZone.pixelHeight,
      draw: (ctx, camera) => {
        if (zm.tileRenderer) zm.tileRenderer.render(ctx, camera, 1);
      },
    });

    for (const obj of zm.activeZone.objects) {
      layers.add('world_objects', {
        x: obj.x,
        y: obj.y,
        width: obj.w ?? 16,
        height: obj.h ?? 16,
        draw: (ctx) => {
          SpriteRenderer.fillRect(ctx, obj.x, obj.y, obj.w ?? 16, obj.h ?? 16, '#8a5a3a');
        },
      });
    }

    layers.add('characters', {
      x: 0,
      y: 0,
      width: zm.activeZone.pixelWidth,
      height: zm.activeZone.pixelHeight,
      draw: (ctx, camera) => {
        ents.render(ctx, camera);
      },
    });

    layers.add('ui', {
      x: 0,
      y: 0,
      draw: (ctx) => {
        SpriteRenderer.fillRect(ctx, 0, 0, ctx.canvas?.width ?? Config.LOGICAL_WIDTH, 40, '#000', 0.55);
        ctx.fillStyle = '#f6e7c1';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        const p = self.player;
        const mov = p?.get('movement');
        const target = self.interaction?.currentTarget;
        ctx.fillText(
          `Batch 4 Entity · arrows move · E interact · zone edge transitions`,
          6,
          12
        );
        ctx.fillText(
          `zone=${zm.activeZone?.id} pos=(${p?.x.toFixed(0)},${p?.y.toFixed(0)}) face=${p?.facing} mov=${mov?.moving ? 'walk' : 'idle'} ents=${ents.count}`,
          6,
          24
        );
        const tName = target ? `${target.id}` : 'none';
        ctx.fillText(`target=${tName}  ${self._lastMsg}`, 6, 36);
      },
    });
  }

  _toast(msg) {
    this._lastMsg = msg;
    this._msgTimer = 3;
  }

  update(dt) {
    if (this._msgTimer > 0) this._msgTimer -= dt;
    else this._lastMsg = '';

    this.controller?.update();

    // Animation state from movement
    const mov = this.player?.get('movement');
    const spr = this.player?.get('sprite');
    if (mov && spr?.animator) {
      const want = mov.moving ? 'walk' : 'idle';
      if (spr.animator.currentClipName !== want) {
        try {
          spr.animator.play(want);
        } catch {
          /* missing clip ok */
        }
      }
    }

    this.entities.update(dt);

    // Interaction
    if (this.controller?.interactPressed) {
      this.interaction.tryInteract(this.player);
    } else {
      this.interaction.findTarget(this.player);
    }

    // Zone transition via existing triggers
    const tr = this.zones.tryTransitionAt(this.player.x, this.player.y);
    if (tr) {
      this.entities.clearZone(this.player.zoneId);
      this.player.zoneId = tr.zone.id;
      this.player.x = tr.spawn.x;
      this.player.y = tr.spawn.y;
      // re-bind collision on movement
      const movC = this.player.get('movement');
      if (movC) movC.collision = this.zones.collision;
      // respawn zone npcs
      this._spawnNpcsOnly(tr.zone);
      this._applyCamera();
      this._rebuildStaticLayers();
      this._toast(`Entered ${tr.zone.name}`);
    }

    this.pipeline.update(dt);
  }

  _spawnNpcsOnly(zone) {
    // Keep player, clear others, respawn NPCs for new zone
    for (const e of [...this.entities.all()]) {
      if (e.type !== 'player') this.entities.remove(e.id);
    }
    if (zone.id === 'village') {
      // minimal: one sign in village already handled in full spawn; forest gets a note
    }
    if (zone.id === 'forest') {
      const hermit = new Entity({
        id: 'npc_hermit',
        type: 'npc',
        x: 200,
        y: 120,
        w: 12,
        h: 14,
        zoneId: zone.id,
      });
      hermit.add('sprite', new SpriteComponent({ color: '#9ae86a' }));
      hermit.add(
        'interaction',
        new InteractionComponent({
          range: 28,
          onInteract: () => this._toast('Hermit: "The woods are deep."'),
        })
      );
      this.entities.add(hermit);
    }
  }

  render() {
    this.pipeline.render();
  }

  exit() {
    this.entities?.clear();
    this.zones?.deactivate();
  }

  destroy() {
    this.exit();
    this.pipeline = null;
  }
}
