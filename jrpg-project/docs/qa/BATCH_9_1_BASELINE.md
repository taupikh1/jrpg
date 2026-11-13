# Batch 9.1 Baseline
Source verified (no Git repo in ZIP; `git status` unavailable).
- package version 0.8.0; Service Worker cache `jrpg-shell-v9` (source verified, not runtime).
- Baseline unit tests: 192 pass / 0 fail / 0 skipped (57 suites).
- Playable zones (world validator): 10 (village, forest, road_bellhaven, bellhaven_gate, bellhaven_plaza, bellhaven_market, bellhaven_archive_hall, bellhaven_archive_stacks, bellhaven_archive_restricted, resonance_ancient_site).
- Active storage adapter in GameplayDemoScene: MemoryStorageAdapter (IndexedDBAdapter exists in src/platform/browser but is not wired into the scene). No IndexedDB persistence is claimed.
- Chapter 5 flags live in in-memory `_ch5Flags`; Ch4->Ch5 trigger at GameplayDemoScene.js ~L744 (`ch4_completed`).
- Validators: check:world OK, check OK, check:narrative OK.
