# Bugs and Fixes — 8.1.1

## Coordinate concern (y=208 on 12-row maps)
**Finding:** Forest is **16** tiles tall (256px), not 12. Trigger y=208 is valid.

## Fix applied
- Opened forest south wall along path columns (`stamp` path on `FH-1`) so players can reach the exit without soft collision against full south wall.

## No other critical defects found in scripted playthrough
- Quest completion and zone transitions behaved correctly.
- Battle return: mode restored to world on same zone (force-end path used in automation when demo battle commands not fully driven).
