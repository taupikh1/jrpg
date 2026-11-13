# Batch 9.1.2 — Baseline
- Input: `jrpg-project-batch9_1.zip` (338,599 bytes, root `jrpg-new/`). No `.git`, so no git status/diff possible.
- **Batch 9.1.1 working directory was NOT available** (`/home/claude`, `/mnt/transcripts` empty). Its uncommitted patches were NOT recovered. This batch re-implemented fixes from the 9.1 ZIP; they must be merged by the owner with any 9.1.1 originals.
- Evidence the 9.1.1 patches were absent: `_pendingNodeEffects` was read in `GameplayDemoScene.js` but never populated; flower spawns still used `.entries()` on pair arrays.
- Baseline results (executed): `npm test` 193 pass / 0 fail; `check`, `check:world`, `check:narrative` OK.
- Environment: Node v22.23.4, Playwright 1.63.0 (/opt/npm-tools), Chromium at /opt/pw-browsers/chromium-1243 (an earlier claim that Chromium was unavailable was WRONG: only ~/.cache was checked). Network disabled, not needed (local http.server).
