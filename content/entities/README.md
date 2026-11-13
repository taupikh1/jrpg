# Entity Content Status

This directory is intentionally not populated with duplicate NPC/object records yet.

## Current implementation

- Entity runtime primitives live in `src/engine/entities/`.
- Zone tilemaps, static world-object definitions, and exits live in `content/world/`.
- Chapter-specific NPCs, interactables, and collectible entities are currently spawned by `GameplayDemoScene` factories and chapter-specific methods.
- Their dialogue and quest content is data-driven under `content/dialogue/` and `content/quests/`.

## Why there is no entity catalogue yet

A declarative entity schema/loader is not currently established as the single source of truth. Copying spawn coordinates and interaction behavior into this directory now would create a second, conflicting source of truth. Do not add duplicate entity definitions until a schema and loader migration is implemented with parity tests.

## Planned migration contract

When this directory is productized, each definition should have a stable `id`, `type`, `zoneId`, `position`, optional `footprint`, sprite key, interaction/dialogue reference, trigger behavior, and lifecycle policy. Runtime-specific callbacks must remain in registered behavior handlers rather than JSON.

Status: **NOT IMPLEMENTED as a declarative entity catalogue**. Existing runtime entities are implemented and should not be mistaken for missing engine primitives.
