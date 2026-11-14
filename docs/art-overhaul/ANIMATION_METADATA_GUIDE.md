# Animation Metadata Guide

Example:
```js
animation: {
  idle: { frameCount: 8, frameWidth: 34, frameHeight: 44, frameDuration: 0.12, loop: true },
  walk: { frameCount: 8, frameWidth: 96, frameHeight: 64, frameDuration: 0.1 },
}
```

- Frames are read left-to-right from originX/originY (default 0,0).
- `framesFor()` produces AnimationClip-compatible data.
- If a state is absent, do not invent frames; report the gap.
