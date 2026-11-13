# World Connection Graph

## Playable (implemented)

```
zone_village (id: village)  --to_forest-->  zone_forest (id: forest)
zone_forest                 --to_village--> zone_village
```

| Connection ID | From | To | Spawn | Gate |
|---------------|------|-----|-------|------|
| conn_village_to_forest | village | forest | from_village | Open (Ch.1) |
| conn_forest_to_village | forest | village | from_forest | Open |

Rules enforced by `ZoneManager.tryTransitionAt` + scene entity cleanup.

## Planned major-region links (design)

```
Ashwillow --road--> Whispering Wood --road--> Bellhaven
Bellhaven --road--> Starfall Plain --road--> Ashen Crown
Ashen Crown --border--> Silent March
Bellhaven --coast road--> Glass Lantern
Verdant Veil --descent--> Underdeep
Starfall / Veil paths --> Sleeping Kings (highland)
Echo Road stitches scarred corridors toward Heart of Lumerra
```

## Connectivity rules

1. Every mandatory story zone must have a documented path from Chapter 1 start.
2. Connections reference existing zone IDs only when implemented.
3. Story-gated links list unlock flags (e.g. `ch1_to_forest`).
4. Return paths preferred for exploration zones unless narrative one-way is documented.
5. No silent softlocks: if locked, UI/toast must explain.

## Intentional non-connections

- Heart of Lumerra is not reachable in early arcs.
- Underdeep requires Verdant surface access (Arc III).
