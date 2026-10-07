# Focused verification

These helpers are outside the runtime. Use installed Node and local files only;
do not add packages or run every script automatically for an unrelated change.
Select a single affected batch under the owner's 20-case / 60-second budget.

| Change | Command | Scope |
|---|---|---|
| Catalog registration | `rtk proxy node verification/verify-content-registry.cjs` | Tiny opposite-order packs, invalid registration, real core/Adventure registration |
| Project schema | `rtk proxy node verification/verify-project-state.cjs` | 15 cases, synthetic fixtures, field errors, detached state and roundtrip |
| History | `rtk proxy node verification/verify-history-transactions.cjs` | 2 cases, timestamp dedup and undo/redo |
| Physics resources | `rtk proxy node verification/verify-physics-geometry-cache.cjs` | One bounded build/demo/dispose/rebuild using actual SceneManager cleanup |

## Exact manual interaction recipes

Use an isolated profile and local HTTP origin with no prior student data. Inspect
console errors. Do not inject preferences or call callbacks as proof of UI wiring.

1. Note mission title/grid and checks. Click Rocket on the shelf, Undo once and
   compare all three plus selected shelf; Redo must restore Rocket. Set sliced
   and a synthetic note, click Rotate, and confirm generated/empty note. Undo
   should restore grid and the original sliced/note values. Reload after Redo
   and compare the saved grid.
2. Capture V1 and enter `TEST-PAIR` in Passport. Open
   `fixtures/project-state-legacy-v1.json` through the actual Open button. The
   legacy grid/checks restore, and a blank pair replaces TEST-PAIR. Open
   `project-state-empty-v1.json`; V1 comparison disappears. Open malformed-grid
   and future-schema fixtures; each shows a field/version error and preserves
   the previous project and Undo/Redo state.
3. Enter `<b>TEST 14 хв</b>` in the slicer field. Capture V1 and open Compare.
   The text appears literally in both records, without markup or invented
   duration percentages. Switch to Physics and open Passport: pixel connectivity
   must say it is not verified for that mode.
4. At 1366×768 and 1024×768, open a core dialog, Shift+Tab from its first control,
   and confirm focus stays inside; Escape/close returns to its opener. Content
   scrolls, the close button and topbar export remain reachable.
5. Download gate (INDETERMINATE in this embedded-browser run): click Save in a
   browser that exposes downloads, read the actual downloaded JSON and confirm
   `schemaVersion:1` plus stable/numeric mission references. Change the model,
   reopen that exact download and compare grid/mission/controls. Stop on a
   bounded timeout; do not infer a downloaded file from the click alone.

Direct `file://` startup needs a permitted manual browser check. It was blocked
by this run's browser URL policy, so no indirect launch workaround was used.
