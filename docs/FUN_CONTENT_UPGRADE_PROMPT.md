# Classroom fun and model expansion — execution prompt

> **Closed task status (2026-10-07):** The 48-model implementation is complete.
> Only 4 of 101 configurations have final visual PASS; 97 remain pending under
> the owner's stop instruction. Do not automatically repeat the implementation
> or launch a full-catalog capture from this historical specification; a fresh
> human request may define new work. See
> [FUN_CONTENT_REVIEW.md](FUN_CONTENT_REVIEW.md) and
> [NEXT_AGENT_HANDOFF.md](NEXT_AGENT_HANDOFF.md).

Turn the existing 3D Club Studio models into recognizable, playful things children
can change and use immediately, and add at least **48 genuinely different models**.
Every shipped catalog model must have reviewed screenshots from the actual app.
Implement the work; a proposal, generated definitions or a contact sheet alone
does not satisfy this task.

## Worker configuration and authority

- Main worker: **`gpt-6.1-sol`**, **`reasoning_effort: "xhigh"`**. The owner calls
  this Sol 6.1 / light; use the exact available model ID, not an invented alias.
- Delegated workers: **`gpt-6-luna`**, **`reasoning_effort: "xhigh"`**,
  **`fork_turns: "none"`**; at most three concurrently, leaving the main worker
  to integrate and review. Do not silently substitute a different model.
- The original authorization applied to the implementation that is now complete.
  Follow the scope and verification in any fresh human request. The main worker
  owns commits/pushes and the shared browser session for its active task.
- Ukrainian progress/handoff and child-facing content; English identifiers,
  commits and technical reports. Preserve unrelated dirty work; stage explicit paths.
- Read AGENTS.md, applicable nested instructions, GEMINI.md and
  `C:\Users\igors\.codex\RTK.md`. Inspect branch/status/remote/HEAD. Read
  `docs/ARCHITECTURE_AUDIT.md` and `docs/EXTENSIONS.md`; current code outranks reports.
  Select Basic Memory project `wrist-and-pocket`, recent activity, relevant notes
  only. Routine work does not authorize durable memory writes.

Planning baseline: **`a29f681`, app `1.8.2`, schema 1**. The 48-model
implementation is complete at source commit `3df6a40`, app 1.9.0, schema 1.
Visual release acceptance is still incomplete: 4 of 101 finite configurations
have final PASS reviews, 13 original screenshots cover those four models, and
97 configurations remain pending under the owner's stop instruction. This is
a historical execution specification, not a current expansion request or an
acceptance report. See [FUN_CONTENT_REVIEW.md](FUN_CONTENT_REVIEW.md) and
[NEXT_AGENT_HANDOFF.md](NEXT_AGENT_HANDOFF.md). Do not automatically replay the
48-model task or run a full-catalog capture. A fresh human request may define new
work; any visual acceptance claim still needs complete supporting evidence.

## What the owner's screenshot demonstrates

Reference, if still available:
`C:\Users\igors\AppData\Local\Temp\codex-clipboard-2e5c051b-22da-4b69-a3fa-9cb462f5ff12.png`.
Inspect it. If missing, reproduce the default catapult in the app.

The screenshot shows a flat catapult with a long rectangular arm, angular supports,
a C-shaped spring, a large ТАНК label and a separate red cube. Several colored
joints show striped surface artifacts. Those artifacts are visible; coplanar faces,
z-fighting or overlapping geometry are hypotheses until source/runtime inspection.
The visual does not prove whether the physical mechanism works.

The owner rejects this level of appeal. Improve the silhouette, proportions,
recognizable function and action feedback. A brighter palette, larger label,
extra decorative blocks or merely flattering descriptions will not address it.
Audit the other three generators and all existing catalog entries with the same eye.

## Product outcome and content target

Audience: grades 2–6, up to ten children, lessons up to one hour, one slow monochrome
Anycubic i3 Mega. Most fun must work before anything is printed.

Keep all existing mission IDs/keys and presets accessible. Review and improve weak
existing models and activities. Add **48 new distinct authored model entries**:

| Family | Target | Examples to develop after feasibility review |
|---|---:|---|
| Reliefs and useful artifacts | 20 | Creature tracks, secret emblems, fossil fragments, map tokens, constellation badges, funny faces, cardboard-world props |
| Characters and creatures | 12 | Expressive robots, tiny companions, explorers, creatures with distinct silhouettes and role-defining equipment |
| Optical discoveries | 8 | Two-view pictograms, silhouettes, secret-message reveals and shadow compositions with different spatial arrangements |
| Playful engineering | 8 | Recognizable catapult themes, balance creatures, bridge investigations, launch targets or other bounded mechanism demonstrations |

This distribution can shift by at most four entries per family if geometry or
monochrome quality warrants it; retain 48 total and all four families. Do not fill
the target with recolors, text replacements, uniform scale changes, random seeds
or the same mesh with renamed missions. At least eight thematic sets should offer
different creative/game loops. New missions can share tools; models must differ.

Treat examples as a creative starting point, not a requirement to build physically
unverified joints. Choose feasible geometry. Use original motifs where practical.
Avoid adding a full game engine, economy, account system or disconnected minigame.

For every entry provide:

- Permanent model key, mission reference, generator/preset/configuration and theme.
- A readable shape and one memorable feature that survives monochrome viewing.
- A real editable design choice that changes shape, arrangement or behavior.
- A short Ukrainian invitation to act, a clear objective and visible feedback.
- A 2–3 grade action and a 4–6 grade investigation, plus a result without printing.
- A reason to try a second version: prediction, target, reveal, character role,
  cooperation, asymmetric transformation or compare-and-explain.

Require at least **12 entries with an actual screen interaction beyond choosing
a preset and orbiting the camera**, using several different interaction patterns.
Examples: aim/launch/reset at visible targets; predict which creature balances;
reveal a hidden symbol from another view; alter a bridge and compare its geometry;
build a character constraint and test whether the visible silhouette meets it.
Any simulation must be labelled as a screen demonstration, with no physical
accuracy claim. Screen-only effects stay out of exported STL and project geometry.

## Improve the existing fun first

Inventory the finite catalog of starter models, curated configurations and mission
models across all four generators. Include classic presets, Adventure Pack entries,
catapult/balancer configurations and character/optical starters. Do not expand this
inventory to every possible continuous slider value or custom child drawing.
Identify duplicate entries by stable model key and complete configuration.

Create `docs/FUN_CONTENT_PLAN.md`: entry inventory, weakest items, proposed repairs,
48-entry allocation, interaction patterns and acceptance criteria. Keep it concise.
Then implement a vertical slice: repaired catapult plus one strong example from
each other family. Inspect actual screenshots and interaction results before
multiplying the content. Fix the visual grammar at this stage.

Catapult acceptance:

- A child can locate the launch end, arm, spring and base visually without reading
  ТАНК. Intentional parts have coherent proportions and visual hierarchy.
- Default and bounded control extremes have no visible striped/coplanar artifacts,
  detached unintended parts, cluttered text or obscured launch mechanism.
- Actual launch control produces visible projectile/target feedback and has a
  working reset/retry. Effects clear when switching models; no ghost projectiles.
- Resting geometry and the screen demonstration have explicit ownership. The
  default is understandable in color and one-plastic mode.
- Printed spring reliability, launch force and durability remain unverified until
  actual print evidence exists. Remove source comments promising guaranteed strength.

For other models reject weak silhouettes, featureless plates, indistinguishable
characters, text slabs used to conceal missing design and decorative noise that
disappears in monochrome. Pixel art can be intentional and readable; do not replace
the working 16×16 editor with cosmetic thumbnails.

## Delegation and implementation ownership

Start with three narrowly scoped read-only investigations. Each returns at most
five findings: model/configuration, source location, concrete visual/play weakness,
smallest repair, creative options and focused verifier. Label observed evidence
versus inference. Do not let agents independently edit the same app file.

Then assign disjoint implementation waves:

| Worker | Owned work |
|---|---|
| Luna A | Relief pack definitions and child activities in a new isolated content file; preserve hand-authored grids |
| Luna B | Character and optical generator/content files, sequenced if ownership overlaps; distinctive shapes and reveal activities |
| Luna C | Physics generator repair and engineering configurations/demonstrations; effect/resource ownership |
| Main Sol | Source/identity contracts, app adapters, registry, shared HTML/CSS, catalog discovery, evidence capture, final visual review, docs/version/commits |

Agents send code and configuration summaries to the main worker; no commits/pushes.
Another bounded review pass may use a Luna worker to inspect the saved images with
the acceptance rubric. Passing requires the main worker to open and review them too.
Keep browser capture single-owner; do not parallel-control one browser or regenerate
the same catalog in several agent sessions. Give each agent only its relevant files,
baseline, schema constraints, entry allocation and deliverable.

## Architecture and compatibility constraints

Keep offline Vanilla JS, local Three.js r128, IIFE-to-window modules and dependency
order. No CDN, fonts, analytics, new runtime packages, bundler or Boolean library.
Use StudioContentRegistry for atomic registration and stable identities; allocate
non-conflicting permanent IDs, never max-ID-plus-loading-order identities.

The registry currently indexes missions, and the shelf explicitly mounts one pack.
Adding multi-family model entries requires a small catalog/configuration boundary:
do not pretend a general model registry or physics/mob mission adapter already exists.
Extend the actual startup/selection dispatcher coherently, without a parallel
source of state or a generic plug-in framework.

ProjectState validates imports before live mutation. Every new configuration and
field must serialize, validate and restore, with explicit defaults/migration for
older files. Keep schema 1 if its shape remains compatible; otherwise implement
and verify a supported migration rather than accepting arbitrary versions.
Do not overwrite a restored child's grid with a redesigned starter preset. Preserve
old keys and parameter meanings; new presets load only through explicit selection.

One logical action gets one undo transaction. Mission/model/checks/selected UI
restore together. Geometry changes invalidate verification status and stale slicer
notes. Preserve V1, passports, literal records and the separate teacher timer state.
Returned groups belong to SceneManager; release resources and keep demo state scoped.

Maintain 1366×768 and 1024×768, reachable topbar actions, projector mode, scrollable
dialogs, close controls and focus. Catalog growth must be discoverable by themes,
model type and simple activity descriptions; avoid a giant wall of 48 extra buttons.
Thumbnails, if added, must depict actual generated defaults and use local assets.

Keep millimeter scale, settled bounds, bed checks and binary STL. Separate visual
adjacency from manifold geometry and physical acceptance. Validate target size
against actual generated bounds, including bases, mounts, labels and equipment.

## Mandatory screenshot evidence for every shipped model

Create `docs/FUN_CONTENT_REVIEW.md`, a machine-readable manifest under
`verification/content-evidence/`, and an offline browsable gallery with links to
full-size original captures. Evidence images belong under
`docs/evidence/fun-content/<stable-model-key>/`; use portable filesystem-safe names.

**Every new model, every revised existing model, and every retained catalog model
reviewed for this release needs an evidence row and actual screenshots.** A finite
catalog variant with different geometry/configuration needs its own row. Duplicate
missions pointing to exactly the same model/configuration may share captures, with
explicit links. Continuous slider/custom-drawing possibilities do not each need rows.

Capture at least three views per entry after the model settles:

1. Color overview at the intended presentation angle, fitted to the viewport.
2. One-plastic view showing the same full model and its readable relief/silhouette.
3. A complementary side/top/reveal view, or an actual action-result screenshot
   where the model's fun depends on interaction.

Interactive entries also need resting and action/result proof; add a fourth capture
when the first three do not show both. New and repaired defaults must be selected
through their **real visible UI controls**. Pure callback/build calls are useful for
geometry checks but do not prove catalog or interaction wiring.

Each row records: stable model/mission keys, exact parameters, source revision or
hashes of relevant generator/content files, viewport, camera/projection, bounds,
screenshot paths, interaction exercised/result, reviewer verdict, physical-evidence
status and any known limitations. Capture originals must remain unretouched. No
ImageGen, mockups, invented renders or screenshot reuse across different shapes.
Contact sheets may supplement originals, never replace per-entry evidence.

The main worker must open every model's three views, not merely check that files
exist. Review these concrete gates:

- **Recognizable:** name and rendered silhouette agree; distinguishing feature visible.
- **Readable monochrome:** relief/shape carries meaning without relying on colors.
- **Clean geometry presentation:** no visible flicker/stripes, unintended islands,
  clipping, hidden features, extreme proportions or unreadable embossed text.
- **Meaningful variation:** model is materially different from other counted entries.
- **Playable:** stated editable action/interaction has visible consequences and retry.
- **Evidence complete:** images/configuration/revision match, full model visible.

Verdicts are PASS / REWORK / BLOCKED with a reason. Repair REWORK entries and
recapture affected views before counting them as complete. Screenshot review is
agent visual evidence; child enjoyment remains **Not verified** without actual
child/teacher feedback. Do not invent user testing, engagement or learning outcomes.

If capture is blocked, do not claim screenshot verification or replace it with
source checks. Continue independent work, identify the exact blocked entries and
tool limitation, and hand off the smallest remaining capture/review step. Do not
quietly lower the 48-model goal or declare the release fully accepted.

## Bounded verification and completion

Use owner budgets: at most 20 discovered cases and 60 seconds per non-Unity batch,
180 seconds per small fix. Declare cases/expected runtime before each batch. Split
capture into small batches (for example, four models × three views), with a
checkpoint between batches. Do not turn catalog-wide evidence into a single heavy
test or repeatedly rebuild every mesh after a narrow repair.

Stop on timeout, lost responsiveness or missing progress; make one bounded
cancellation attempt and report INDETERMINATE. Never bypass guards, kill the owner's
browser/processes or silently substitute an unapproved capture surface. Use local
HTTP if file URLs are policy-blocked, and report direct-file evidence separately.
Previous audit download/file-launch limitations are not proof that this release passes.

Choose only behavior-relevant checks: registry atomicity/identity, schema legacy
import and failed-import preservation, actual model selection, one undo/redo,
reload, verification invalidation, interactive reset/tab cleanup, changed camera
framing/layout and focused binary export checks. Verify all catalog evidence
coverage with a lightweight manifest check: no orphan entry, missing image,
stale source hash or duplicate-count inflation. No full suites or load/soak tests.

Ship in reviewable thematic units. Validate each affected unit, commit owned files,
push and check results. Capture/review evidence against committed source; commit
the evidence with an explicit source revision. Later relevant source changes
invalidate affected captures. Synchronize the five release-version locations when
releasing; docs/evidence-only commits do not need another version bump.

Completion requires improved existing weak models, 48 distinct new accessible
models, at least 12 meaningful screen interactions, and 100% evidence coverage of
the finite shipped catalog with no unresolved REWORK verdict. Preserve compatibility
and offline behavior, and confirm the pushed HEAD and honest Git status.

Final Ukrainian handoff: concrete improvements, counts by family, complete/pending
evidence coverage, a few representative screenshots, gallery/report links, commits
and remaining physical/tool blockers. Do not report a plan as a finished content release.

Workflow reference: [OpenAI — Run long horizon tasks with Codex](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex).
The model IDs/effort above come from the owner's requested host configuration.
