# Phase 3 — Manual Browser and Device Test Guide

## Scope
This guide checks the Phase 3 battle content and the existing browser presentation. The automated suite does not replace physical-device testing.

## Desktop debug boss launch
1. Open the game URL with `?debug=1`.
2. Start a new game or continue a save and enter free exploration.
3. Press `1`–`6` to launch the six main bosses by arc.
4. Press `7` for the optional Arc I mini-boss and `8` for the optional Arc II boss.
5. Confirm the opening phase message, phase-transition dialogue where configured, enemy action cycle, battle controls, victory/defeat state, reward summary, and no duplicate reward claim.
6. Press `F5`/`F` to save after the Arc I boss; reload/continue and confirm the Chapter 5 defeat flag is retained. Do not use a production save for destructive testing.

## iPhone 13 Safari Add to Home Screen
1. Install/open the web app from the Home Screen and rotate to landscape.
2. Confirm safe areas, canvas fit, no stretched battle layout, and that touch targets remain reachable.
3. Test a normal encounter and the existing Chapter 1–5 world flow.
4. Phase 3 debug keyboard shortcuts are desktop-only; they are not available on iPhone without a connected keyboard. Do not treat missing mobile boss shortcuts as a game defect.
5. Confirm battle phase text/dialogue does not trap input and can be advanced/closed using the normal touch/confirm controls.

## Android Chrome and desktop
- Repeat landscape/responsive checks, battle commands, pause/resume, save/load, and repeated victory/restart.

## Evidence recording
For each device, record browser/OS version, viewport/orientation, exact steps, expected vs actual behavior, screenshots/video if a defect occurs, and whether the save was fresh or migrated.

## Current status
Physical iPhone 13 Safari, Android Chrome, and manual desktop browser playtests were NOT RUN in the container. This guide is for owner-run verification.
