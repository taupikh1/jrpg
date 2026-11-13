# Content Schema (JSON-compatible)

Aligned with Batch 5 DialogueEngine / QuestLog / ItemRegistry.

## DialogueDef
```json
{
  "id": "dialogue_village_elder_intro",
  "startNode": "intro",
  "nodes": {
    "intro": {
      "speaker": "Elder Henn",
      "text": "...",
      "choices": [{ "text": "...", "next": "a", "effects": { "acceptQuest": "quest_id" } }],
      "next": "optional_linear"
    }
  }
}
```

## QuestDef
```json
{
  "id": "quest_main_001",
  "name": "Name",
  "description": "...",
  "prerequisites": [],
  "objectives": [
    { "id": "obj1", "type": "talk", "targetId": "character_x", "count": 1, "description": "..." }
  ],
  "rewards": { "items": [{ "id": "herb", "qty": 1 }], "gold": 10 }
}
```

## ChapterDef (documentation / future loader)
```json
{
  "id": "chapter_01",
  "arc": 1,
  "title": "The Village Beneath the Blue Sky",
  "regionId": "region_ashwillow",
  "requiredParty": ["character_orin_vale"],
  "unlocks": ["chapter_02"]
}
```

## CharacterDef (documentation)
```json
{
  "id": "character_orin_vale",
  "name": "Orin Vale",
  "role": "protagonist",
  "joinChapter": "chapter_01"
}
```


## EnemyDef (B19, extended through B24)
```js
{
  id: "thorn_sprite",
  name: "Sprite Duri",
  arc: 1,
  regionId: "region_whispering_wood",
  habitat: "semak berhutan",
  category: "hostile_creature",
  description: "...",
  maxHp: 28, attack: 8, defense: 2, magicAttack: 4, magicDefense: 2, speed: 10,
  exp: 6, gold: 4,
  affinities: { earth: "resist", fire: "weak" },
  ai: { style: "skirmisher", actions: [
    { id: "thorn_prick", name: "Tusuk Duri", type: "physical", power: 0.9 }
  ] }
}
```

Six arc catalogues contain 8–10 regular/elite enemies each (9, 9, 8, 8, 8, 8; 50 total). `ai.actions` is a deterministic cyclic action list. Action `type` is `physical` or `magical`; optional `element` and `effect` use registered combat element and status IDs. `content/enemies/index.js` exports the global `ENEMY_CATALOG` and `getEnemyById()` lookup. Scene/composition code resolves content and injects runtime participants; `BattleManager` does not import `content/`.

## BossDef (B20, B21, B23, B25)
```js
{
  id: "warden_of_first_resonance",
  name: "Penjaga Resonansi Pertama",
  arc: 1,
  chapter: 5,
  regionId: "region_bellhaven",
  role: "main_boss",
  optional: false,
  requiredForMainStory: true,
  description: "...",
  maxHp: 760, attack: 27, defense: 19, magicAttack: 31, magicDefense: 23, speed: 11,
  affinities: { resonance: "resist", dark: "weak" },
  phases: [
    { id: "p1", hpBelowPct: 1, actions: [{ id: "rooted_hammer", name: "Palu Akar", type: "physical", power: 1.1 }] },
    { id: "p2", hpBelowPct: 0.65, actions: [{ id: "memory_tide", name: "Pasang Ingatan", type: "magical", element: "resonance", power: 1.2 }] }
  ],
  rewards: { exp: 260, gold: 180, items: [{ id: "herb", qty: 3 }] },
  flagKey: "ch5_boss_warden_of_first_resonance_defeated"
}
```

Boss phase thresholds must descend from 1.0 toward 0.0. Each main story boss has at least two phases; the six Phase 3 main bosses use two or three. Optional bosses set `optional: true` and `requiredForMainStory: false`; they never gate the main route. Boss victory flags are stored in the existing `world.flags.bosses` map and mirrored into the chapter flag map when that chapter is represented by the current scene. The Arc I finale flag `ch5_boss_warden_of_first_resonance_defeated` is persisted in Chapter 5 flags. This is an additive use of the flexible v6 world flag payload and does not require a save schema bump.
