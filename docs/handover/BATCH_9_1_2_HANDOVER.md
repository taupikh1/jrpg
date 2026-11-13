# Handover -> next batch (finish 9.1.2 remainder, then 9.1.3)
- State: this ZIP + 215 passing tests. Reconcile with any original 9.1.1 working-tree patches before continuing.
- Remaining 9.1.2 work: Arc I flags, navigation (NoPath), chapter gating, dialogue layout, QuestLog, party banter, First Resonance, finale, SW/storage docs, raw-id toasts.
- Browser: Chromium at /opt/pw-browsers (use /opt/npm-tools/node_modules/playwright), local `python3 -m http.server`. Harness: docs/qa/evidence/batch-9-1-2/walk_ancient_site.mjs.txt (copy to .mjs to run) (keyboard only; advances dialogue with Enter).
- Ch3 first-view hook added: verify Chapter 3 flow end-to-end in browser.
- Storage adapter: MemoryStorageAdapter reported (not re-tested). Service Worker version not inspected.
- 9.1.3 (clean-profile Arc I playthrough) must not start until browser verification of the fixes above exists.

## Continuation update (2026-11-12)

See `docs/qa/BATCH_9_1_2_CONTINUATION_QA.md` and `docs/handover/BATCH_9_1_2_CONTINUATION_HANDOVER.md` for the checkpoint reconciliation, current verification boundary, and remaining browser work. The original QA notes contained stale statements; the D1–D9 audit now has a reconciliation addendum.
