# THE ATLAS OF UNREMEMBERED STARS

Original single-player fantasy JRPG set in **Lumerra**. The current playable renderer is Canvas 2D; the approved long-term visual direction is stylized HD 3D, and a full renderer migration has not been authorized or completed.

## Current project

- **Current development checkpoint:** Phase 3 implementation complete through B25 — 50 enemy definitions and 8 multi-phase bosses; G3 owner acceptance and manual device QA remain pending
- **Engine:** HTML5 Canvas 2D, Vanilla JavaScript ES Modules
- **World:** Zone-based exploration
- **Combat:** Turn-based battle framework
- **Content:** JSON/JavaScript data modules for dialogue, quests, items, enemies, and world data
- **Persistence:** Memory and IndexedDB adapters
- **Offline/PWA:** Service Worker foundation

This is an active development project, not a completed game. Browser, physical mobile, IndexedDB persistence, and full offline behavior must only be considered verified when the corresponding QA evidence says so.

## Quick start

Requirements: Node.js compatible with the project scripts.

```bash
npm test
npm run check
npm run check:world
npm run check:narrative
npm run check:enemies
```

Start a local static server from this directory:

```bash
npm start
```

## Project structure

- `src/` — engine, platform adapters, scenes, and gameplay systems
- `content/dialogue/` — chapter, NPC, and party dialogue
- `content/quests/` — quest definitions
- `content/items/` — item catalogue
- `content/enemies/` — 50 regular/elite enemy definitions across six arcs
- `content/bosses/` — six main story bosses and two optional/mini-bosses
- `content/entities/` — entity-content status and future catalogue boundary
- `content/world/` — zone and world data
- `assets/` — visual assets
- `docs/` — design, technical, narrative, production, QA, and handover documentation
- `tests/` — automated tests
- `tools/` — project, world, and narrative validators
- `legacy/` — retained prototype/reference material; not the active game entry point

## Important status notes

- Phase 3 adds 50 enemy definitions (8–10 per arc) and 8 boss definitions (six main, two optional/mini-bosses). All are data-validated and exercised through automated BattleManager encounters.
- Catalogue data does not imply map placement: only the existing Arc I demo world is playable today; Arc II–VI chapter maps, quest flow, and encounter placement remain future work.
- With `?debug=1`, desktop keyboard shortcuts `1–6` launch the six main bosses and `7–8` launch the optional bosses. These are development/test shortcuts, not normal story progression.
- `content/entities/` does not yet provide a complete declarative world-entity catalogue; runtime entities are still created by existing scene code.
- Historical QA reports describe the scope and limitations of their own runs. Read the latest QA and handover documents before treating any behavior as verified.

## Documentation

Start with [`docs/INDEX.md`](docs/INDEX.md), then review the latest files under `docs/qa/` and `docs/handover/`.
