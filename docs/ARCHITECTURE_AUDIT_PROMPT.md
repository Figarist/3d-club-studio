# Verification audit and scalable architecture — execution prompt

Copy the prompt below to the user's selected **Sol model with low reasoning effort**. Delegate the focused investigations to **`gpt-6-luna` with `reasoning_effort: "xhigh"`**. This document prepares the next task; it is not a completed architecture audit.

## Objective and authority

Work in `D:\GitHub\3d-club-studio`. Audit the current implementation, then complete evidence-backed, incremental structural improvements that make future content packs, generators, classroom workflows, and independent agent contributions easier to add safely.

The owner authorizes this architecture work, bounded agent delegation, separate commits per completed change, and push to `origin/main`. Keep progressing through implementation and verification. Use Ukrainian for progress and handoff; English for code, identifiers, commits, and technical documentation. Optimize token use: delegate focused questions, read targeted source ranges, and report decisions rather than raw logs.

Read the current `AGENTS.md`, applicable nested instructions, and `C:\Users\igors\.codex\RTK.md` first. Inspect Git status, branch, remote, and current commit. Preserve unrelated work and stage explicit paths. Select Basic Memory project `general`; inspect recent activity and only relevant notes. Repository evidence outranks prior reports. Do not create durable memories for routine audit/refactoring work.

The prompt was prepared against commit `1d5543a`, app version `1.8.1`: four generators, 24 missions, Adventure Pack/Shelf, Pixel Editor Tools, Lesson Companion, project persistence, undo, snapshots, passport export, and camera framing. Recheck this baseline; the repository may have advanced.

## Constraints that remain binding

- Offline-first, direct `file://` launch and local HTTP launch; no CDN, external fonts, analytics, or new network dependency.
- Vanilla JavaScript, native CSS, local Three.js r128. Preserve IIFE-to-`window.*` modules and the dependency order. No framework, bundler, TypeScript, formatter, package-manager migration, or newly introduced runtime tooling.
- Primary devices: 1366×768 and 1024×768. Preserve reachable topbar actions, projector mode, scrollable modal content, accessible focus, and explicit close controls.
- Children in grades 2–6; up to ten per group; one slow monochrome Anycubic i3 Mega; lessons up to an hour. Preserve meaningful activities without finished printing.
- Do not claim physically validated geometry, print time, material durability, or slicer compatibility from code or browser checks.
- Keep old project JSON/autosaves usable, preserve child-authored edits, and retain undo/redo and verification-status invalidation.
- Use the owner's test budgets: only behavior-justified checks; at most 20 discovered cases and 60 seconds per focused non-Unity batch, 180 seconds per small fix. Documentation-only changes get static checks. Stop on missing progress or timeout; report INDETERMINATE. No full suites, benchmarks, soak tests, repeated large-catalog simulations, or alternate-runner guard bypasses.

## Delegation plan

Use at most three agents concurrently, leaving the main Sol worker available to coordinate. Spawn each with `model: "gpt-6-luna"`, `reasoning_effort: "xhigh"`, and `fork_turns: "none"`; give it the relevant paths, owner constraints, current baseline, and a narrowly defined output. Do not substitute another model without saying that the requested one is unavailable.

First wave is read-only. Each agent returns at most five findings with `path:line`, a concrete trigger, observed or inferred impact, the smallest useful repair, and a focused verifier. Label evidence `Repository-verified`, `Runtime-verified`, `Inference`, or `Not verified`.

| Agent | Owned investigation | Primary source |
|---|---|---|
| Architecture and content contracts | Dependency direction; module/bootstrap boundaries; stable registry identities; adding a pack or generator; content/UI separation | `src/app.js`, `src/missionManager.js`, `src/content/adventurePack.js`, `src/adventureShelf.js`, `index.html` |
| State and interaction integrity | Serialization/import validation and migration; undo transactions; mission changes; persistence; modal focus and lifecycle; lesson state ownership | `src/app.js`, `src/historyManager.js`, `src/safeStorage.js`, `src/pixelEditorTools.js`, `src/lessonCompanion.js`, snapshot/passport controllers |
| Geometry, resources and presentation | Generator interface reality; resource ownership and cleanup; animation/camera lifecycles; export boundaries; CSS/component contracts | `src/generators/*`, `src/sceneManager.js`, `styles.css`, extension styles, `AGENTS.md`, `docs/EXTENSIONS.md` |

Do not give every agent the entire repository or the same browser. The main worker owns shared integration files, version changes, the browser verification session, commits, and pushes. After reviewing findings, assign disjoint implementation paths. Tell agents not to commit or push. Sequence edits where ownership overlaps; do not reconcile competing rewrites of `app.js`.

## Questions the audit must resolve

1. **Extension cost and boundaries.** Trace one real content-pack registration and one generator interaction end to end. Identify exactly which existing files must change. Can pure model/content code run without DOM access? Is scene manipulation owned by a clear boundary? Extract the smallest cohesive controller or adapter only where it removes demonstrated coupling. Avoid an all-purpose framework or speculative abstraction.

2. **Stable identity.** Adventure Pack currently allocates mission IDs after the maximum existing numeric ID. Check the effect of pack insertion, removal, or reordered loading on saved projects and references. Establish stable identity and a backward-compatible mapping if needed. Preserve existing numeric IDs and presets. Define duplicate-key, missing-reference, and unknown-ID behavior. Keep invalid content from leaving partially mutated registries or silently selecting an unrelated model.

3. **Versioned project state.** Inspect `serializeState()` and its actual restoration path. Separate file-schema compatibility from the app's release number where useful. Validate grid shape, finite numbers, allowed enum values, optional fields, and unknown versions before changing live state. Preserve the previous project on failed import. Use an old-format fixture with synthetic data to prove compatibility; do not manufacture a clean state by injecting preferences into the browser.

4. **Transactions and source of truth.** Check whether starting a mission records the pre-change mission and model, whether one logical action creates one undo entry, and whether undo/import synchronizes both the state and selected UI. Check changed geometry invalidates previous sliced/printed status and stale print notes consistently. Include shelf selection, checklist, snapshots, and teacher-state boundaries. Repair concrete divergent paths rather than adding another copy of state.

5. **Actual generator contract.** Compare the documented `build3D`, `getState`, and `setState` interface against every implementation and actual callers. Document or implement a consistent contract without adding meaningless stubs. Keep generators responsible for geometry/configuration and adapters responsible for controls. Protect existing names, behavior, and project files.

6. **Lifecycle and resources.** Inventory listeners, animation frames, intervals, renderers, geometry/material caches, original versus monochrome materials, image/object URLs, and extension mounts. Determine ownership, reuse, and disposal rules. Prove a bug or label a future lifecycle limitation; do not describe an unmeasured leak as observed. If adding cleanup, verify one bounded mount/use/unmount/remount sequence in an isolated app instance. Never stop the owner's browser, work, or unrelated processes.

7. **Catalog growth and failure isolation.** Identify repeated full-catalog rendering, linear scans on hot paths, heavy startup validation, and repeated binding. Distinguish measured costs from theoretical ones. Assess the structure for hundreds of missions and multiple packs without generating thousands of meshes or running load tests. Implement indexing, filtering, or bounded rendering only when justified by a specific dependency or observed cost. Do not promise a numeric capacity without evidence.

8. **UI and CSS integrity.** Check class/ID/data-attribute contracts, stylesheet parse/cascade failure, keyboard input versus editing shortcuts, focus restoration, and shared modal behavior. Preserve the restored 16×16 editor. Keep extension styles scoped. Reduce duplication through a small shared primitive only when it fixes repeated behavior; do not redesign the visual system during this audit.

9. **Export and print evidence.** Retain millimeter scale, settled dimensions, bed checks, monochrome preview, and binary STL behavior. Distinguish connected visual meshes from a manifold printable union. Keep slice records as literal text. Geometry repair or a new Boolean engine needs its own bounded design and evidence; do not silently introduce one as part of structural cleanup.

10. **Documentation truth.** Reconcile `AGENTS.md`, `GEMINI.md`, module maps, script order, version locations, and extension docs with source. Mark historical audit findings as historical when resolved. Give the next contributor a reproducible small extension recipe and an explicit ownership/dependency map.

The items above are investigation targets. Source patterns cited here do not establish every suspected failure.

## Implementation sequence

1. Consolidate findings into `docs/ARCHITECTURE_AUDIT.md`: baseline, dependency/state ownership map, prioritized findings, evidence, selected repairs, and deferred work. Use a compact diagram if it clarifies dependencies.
2. Choose a short ordered set of structural changes that address the strongest findings. Explain which change makes the next one safer. Cover critical verified defects; do not inflate the task with cleanup unrelated to extensibility or correctness.
3. Implement each repair as a reviewable unit. Preserve public contracts or supply compatibility adapters/migrations. Keep geometry/content and UI separate where the source supports that boundary. The main worker reviews agent changes before integrating them.
4. Verify the affected behavior, commit that unit with a Conventional Commit message, and push it. Check command results before continuing. Stage only owned files. When releasing a version, synchronize the five locations required by `AGENTS.md`; documentation-only changes do not require a release bump.
5. Update the report around the final architecture. Separate completed changes, open defects, design limitations, and deferred physical/release checks. Complete the work; do not stop at an audit plan when an authorized repair is feasible.

## Focused verification menu

Choose from this menu according to the changed behavior; do not automatically run every item or duplicate checks across agents. Declare the selected cases and expected runtime before each batch.

- Actual mission-selection button → correct model/configuration → one undo → original mission/model and selected UI.
- Actual transform button → changed grid and generated model → undo/redo → reload with the saved edit.
- Actual save/download and file import with a legacy fixture; malformed/unknown state leaves the current project intact and shows a useful error.
- Register two tiny packs in different orders; resolve the same stable identities and legacy saved references. Pure registry checks may be deterministic source-level checks.
- Duplicate or invalid registration has a defined atomic outcome; no partial pack and no corrupted base catalog.
- Actual verification-status control → edit geometry → consistent invalidation of stale status and slice notes.
- Actual scenario/age/challenge/timer controls; close and reopen the modal; verify focus and short pause/resume behavior only when that code changed.
- Actual camera-fit/projection/view-mode controls with settled model bounds at the two target screen sizes when presentation code changed.
- One bounded resource lifecycle sequence when lifecycle code changed; inspect known resource counters or listener ownership, not a long memory soak.
- Local HTTP and direct-file startup only when loading, paths, or bootstrap changed; confirm local assets, console errors, and absence of newly introduced network calls.
- Static syntax, dependency order, version consistency, documentation links, and `git diff --check` for the relevant files.

Use synthetic student codes and an isolated browser profile. Tests of UI must operate real buttons/inputs and assert resulting state; direct callback calls are not proof of wiring. Keep test helpers outside the runtime and follow the repository's tooling contract. If a minimal repeatable regression check cannot be retained within that contract, save an exact manual verification recipe. Do not claim screenshots or physical prints you did not produce.

## Completion criteria and handoff

- Verified architectural defects have been repaired or have a concrete blocking reason.
- Extension identity and state compatibility are explicitly documented; existing work is preserved.
- Selected changes have focused behavioral evidence and separate commits/pushes.
- No new runtime network/package dependency, violated module order, or unresolved regression introduced by this work.
- The report explains how to add the next pack/generator and names remaining structural limits without claiming unlimited scale.
- Report Git status honestly, preserving unrelated dirty files. Confirm the pushed revision; a push alone does not prove a deployed site is updated.

Final response in Ukrainian: concrete improvements, concise validation, commit references, report link, and meaningful remaining limitations. Keep it short. The main Sol worker synthesizes results; do not paste all agent reports into the chat.
