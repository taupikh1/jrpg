# Phase 3 Touch Runtime Compatibility Fix

Date: 2026-11-13

## Reported error

`touch.setBounds is not a function` during the `syncMobileLayout()` call in `src/main.js`.

## Findings

- The delivered source contains `TouchControls.setBounds(rect)` in `src/platform/browser/TouchControls.js`.
- `src/main.js` constructs `touch` from `new TouchControls()` and calls `setBounds` during layout synchronization.
- The reported runtime error is consistent with a mixed/stale JavaScript module cache in which `main.js` and `TouchControls.js` are not from the same app revision. This is a likely explanation, not a confirmed diagnosis of the user's browser cache.

## Fix

1. Guard the optional alignment call with `typeof touch.setBounds === 'function'`. If an older cached module is loaded, the game no longer aborts during startup. Touch controls retain their existing CSS viewport layout until the current module is loaded.
2. Bump the service-worker cache name from `jrpg-shell-v12` to `jrpg-shell-v13`. The new worker activates with `skipWaiting()` and removes the previous cache, forcing subsequent code requests to repopulate from the current deployment.
3. Update PWA tests to enforce the guard and cache-version bump.

## Verification

- `node --check src/main.js`: PASS
- `node --check service-worker.js`: PASS
- `npm test`: 634/634 PASS
- `npm run check`: PASS
- `npm run check:world`: PASS
- `npm run check:narrative`: PASS
- `npm run check:enemies`: PASS
- ZIP integrity: to be recorded in the delivery manifest.
- Physical device test: NOT RUN.

## Deployment note

Deploy the updated project to the same GitHub Pages source/branch. After deployment, close the existing installed web app, reopen it while online, and reload once to allow the v13 service worker to activate. If the old error persists, remove the Home Screen shortcut and site data for the deployed origin, then add the app again. Do not delete site data before confirming the save is backed up, because browser storage may contain local progress.
