import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Entity, resetEntityIdCounter } from '../../../src/engine/entities/Entity.js';
import { EntityManager } from '../../../src/engine/entities/EntityManager.js';
import { MovementComponent } from '../../../src/engine/entities/components/MovementComponent.js';
import { InteractionComponent } from '../../../src/engine/entities/components/InteractionComponent.js';
import { NavigationComponent } from '../../../src/engine/entities/components/NavigationComponent.js';
import { NavGrid } from '../../../src/engine/world/navigation/NavGrid.js';
import { CollisionWorld } from '../../../src/engine/world/collision/Collision.js';
import { InteractionSystem } from '../../../src/engine/entities/systems/InteractionSystem.js';

describe('Entity', () => {
  it('unique ids and components', () => {
    resetEntityIdCounter(1);
    const a = new Entity({ x: 10, y: 20 });
    const b = new Entity();
    assert.notEqual(a.id, b.id);
    a.add('movement', new MovementComponent({ speed: 50 }));
    assert.ok(a.has('movement'));
    assert.equal(a.get('movement').speed, 50);
    a.remove('movement');
    assert.equal(a.has('movement'), false);
  });

  it('rejects duplicate component key', () => {
    const e = new Entity();
    e.add('movement', new MovementComponent());
    assert.throws(() => e.add('movement', new MovementComponent()), /already/);
  });

  it('destroy cleans components', () => {
    const e = new Entity();
    e.add('movement', new MovementComponent());
    e.destroy();
    assert.equal(e.destroyed, true);
    assert.equal(e.has('movement'), false);
  });
});

describe('EntityManager', () => {
  it('register retrieve remove', () => {
    const m = new EntityManager();
    const e = new Entity({ id: 'p1', type: 'player' });
    m.add(e);
    assert.equal(m.get('p1'), e);
    assert.equal(m.getByType('player').length, 1);
    m.remove('p1');
    assert.equal(m.get('p1'), null);
    assert.equal(m.count, 0);
  });

  it('rejects duplicate id', () => {
    const m = new EntityManager();
    m.add(new Entity({ id: 'x' }));
    assert.throws(() => m.add(new Entity({ id: 'x' })), /duplicate/);
  });

  it('safe remove during update', () => {
    const m = new EntityManager();
    const e = new Entity({ id: 'dead' });
    e.add('movement', {
      update() {
        m.remove('dead');
      },
    });
    m.add(e);
    m.update(0.016);
    assert.equal(m.get('dead'), null);
  });

  it('clearZone', () => {
    const m = new EntityManager();
    m.add(new Entity({ id: 'a', zoneId: 'z1' }));
    m.add(new Entity({ id: 'b', zoneId: 'z2' }));
    m.clearZone('z1');
    assert.equal(m.get('a'), null);
    assert.ok(m.get('b'));
  });
});

describe('MovementComponent', () => {
  it('normalizes diagonal and moves with dt', () => {
    const e = new Entity({ x: 0, y: 0, w: 8, h: 8 });
    const mov = new MovementComponent({ speed: 100 });
    e.add('movement', mov);
    mov.setDirection(1, 1);
    e.update(0.1);
    // distance should be ~10 not ~14.14
    const dist = Math.hypot(e.x, e.y);
    assert.ok(Math.abs(dist - 10) < 0.01, `dist=${dist}`);
  });

  it('blocked by collision', () => {
    const cw = new CollisionWorld();
    cw.addObstacle({ x: 20, y: 0, w: 20, h: 20 });
    const e = new Entity({ x: 10, y: 10, w: 8, h: 8 });
    const mov = new MovementComponent({ speed: 100, collision: cw });
    e.add('movement', mov);
    mov.setDirection(1, 0);
    e.update(0.2);
    // should not cross into obstacle far
    assert.ok(e.x < 25);
  });

  it('stop clears velocity intent', () => {
    const e = new Entity();
    const mov = new MovementComponent({ speed: 50 });
    e.add('movement', mov);
    mov.setDirection(1, 0);
    mov.stop();
    e.update(0.1);
    assert.equal(e.x, 0);
    assert.equal(mov.moving, false);
  });
});

describe('NavigationComponent', () => {
  it('follows path on open grid', () => {
    const grid = new NavGrid(10, 10, () => 1);
    const e = new Entity({ x: 8, y: 8 });
    const nav = new NavigationComponent({
      getGrid: () => grid,
      tileSize: 16,
      speed: 200,
      arriveDist: 2,
    });
    e.add('navigation', nav);
    assert.equal(nav.setDestination(80, 80, e), true);
    for (let i = 0; i < 200; i++) e.update(0.05);
    assert.equal(nav.reached || !nav.active, true);
  });

  it('fails on blocked goal', () => {
    const grid = new NavGrid(5, 5, (x, y) => (x === 4 && y === 4 ? Infinity : 1));
    const e = new Entity({ x: 8, y: 8 });
    const nav = new NavigationComponent({ getGrid: () => grid, tileSize: 16 });
    e.add('navigation', nav);
    assert.equal(nav.setDestination(72, 72, e), false);
    assert.equal(nav.failed, true);
  });
});

describe('InteractionSystem', () => {
  it('detects and interacts within range', () => {
    const m = new EntityManager();
    const player = new Entity({ id: 'p', x: 0, y: 0 });
    const npc = new Entity({ id: 'n', x: 10, y: 0 });
    let hit = false;
    npc.add(
      'interaction',
      new InteractionComponent({
        range: 20,
        onInteract: () => {
          hit = true;
        },
      })
    );
    m.add(player);
    m.add(npc);
    const sys = new InteractionSystem(m);
    assert.equal(sys.findTarget(player)?.id, 'n');
    assert.equal(sys.tryInteract(player), true);
    assert.equal(hit, true);
  });

  it('rejects out of range', () => {
    const m = new EntityManager();
    const player = new Entity({ id: 'p', x: 0, y: 0 });
    const npc = new Entity({ id: 'n', x: 100, y: 0 });
    npc.add('interaction', new InteractionComponent({ range: 20 }));
    m.add(player);
    m.add(npc);
    const sys = new InteractionSystem(m);
    assert.equal(sys.findTarget(player), null);
  });
});
