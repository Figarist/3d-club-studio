# Optional classroom extensions

The studio keeps its offline Vanilla JavaScript/IIFE architecture. Extensions have their own source, styles, and integration notes. They introduce no CDN, network calls, package manager, or runtime build step.

| Module | Responsibility | Dependency / state owner |
|---|---|---|
| `content/adventurePack.js` | Twelve deterministic mini reliefs and twelve mission definitions | Extends `MINECRAFT_PRESETS` and `STUDIO_MISSIONS` before app construction |
| `adventureShelf.js` | Three expandable theme groups and dynamic catalog counts | Calls a supplied mission-selection callback; does not rebuild models |
| `pixelEditorTools.js` | Mirror, rotation, and relief inversion | Reads/writes the generator; callbacks let StudioApp own undo, geometry, verification, and autosave |
| `lessonCompanion.js` | Lesson phases, scenario prompts, editable challenge deck, and teacher timer | Separate SafeStorage key; supplies mission IDs through a callback |

Load registries first, the pack next, shelf/tools/companion next, and `app.js` last. Existing core-script relative order remains unchanged. `StudioApp.init()` mounts each available extension once. New source classes are attached to `window` just like the existing core modules.

## Adding a content pack

Use `StudioContentRegistry.registerPack({ id, presets, missions }, { presetTarget: window.MINECRAFT_PRESETS })` before app startup. This DOM-free boundary stages validation before publishing either presets or missions. Each mission supplies a unique positive numeric `id`, permanent namespaced `key` (`pack-id:mission-name`), and the existing renderer fields (`category`, `categoryLabel`, `targetSize`, `generatorLabel`, `targetTab`, `title`, `riddle`, `grade23`, `grade46`, `steps`, `checklist`, `config`). Presets use sixteen strings of sixteen `.`/`0`–`4` cells and integer RGB colors for active levels. Minecraft mission `config.mcPreset` must resolve to an existing or staged preset.

Do not allocate IDs from catalog length or maximum. Core IDs 1–12 and Adventure IDs 13–24 retain their historical meaning; reserve a non-conflicting numeric range for a new pack and never reuse an old ID/key. Core keys are `studio-core:mission-01` through `mission-12`; Adventure keys are `studio-adventure-pack:<presetKey>`. Duplicate pack IDs, mission IDs/keys, preset keys, malformed content and missing references reject the entire registration. Unknown mission references return `null`; they do not silently select another model. There is no dynamic pack unload or post-start refresh contract.

Small extension recipe:

1. Create a local IIFE under `src/content/` containing the pack data and one registration call. Keep student prompts and geometry definitions out of UI controllers.
2. Load it after Minecraft presets and base missions, before the shelf and app. Preserve other dependency order. A pure registry check can use `.create()` for isolated catalogs without DOM.
3. To expose a new shelf, supply `groups`, `missionIdByPresetKey` and preset metadata to a separate `AdventureShelf` mount; its callback calls `StudioApp.startMission`. The current app explicitly mounts one Adventure Pack shelf.
4. Verify two tiny packs in opposite registration orders and an invalid registration that leaves both registries intact. Click the real mission button, undo once, and inspect model, mission and selected UI. Check real generated bounds, not just the grid footprint.
5. Document physical/slicer checks separately. Registration does not establish printable geometry or print duration.

## Adding a generator

The common generator contract is `build3D(params) -> THREE.Group`. Only Minecraft has grid/palette `getState`/`setState`; other project parameters live in `StudioApp.controls`. Add a local script before the app, instantiate it in the app, add tab/panel/data-attribute controls and scoped styles, map those controls in the rebuild dispatcher, and update ProjectState's allowed tab/fields plus serialization/restoration. Add a mission configuration adapter when missions should start that generator. SceneManager owns the returned group's disposable resources. Do not add empty serialization stubs or a second scene owner.

## Project state and transactions

`ProjectState.normalize(state, { missions, presets })` validates and returns detached data before import/autosave restoration. New files carry `schemaVersion: 1`; absent schemaVersion means legacy v1. Release `version` is metadata, not the schema gate. A stable `activeMissionKey` is authoritative; legacy numeric IDs map to the same missions. Missing pack keys/IDs or preset references reject rather than substitute a different design.

Grids are exactly 16×16 integer heights 0–4, palettes contain finite integer RGB values, controls have bounded finite numbers and allowed enum values, and optional fields receive explicit defaults. Legacy numeric strings remain accepted. Legacy finite range values are clamped to the current control limits; malformed values and unknown future schemas are rejected. A null V1 and empty pair code clear the previous values. Legacy computed `estimatedMinutes` is discarded; only literal `slicerRecord` is print-time evidence supplied by the teacher.

Mission launch records the complete previous project before selection/model changes and suppresses intermediate autosave. Geometry changes clear verification status and stale slicer notes. Undo/redo restore mission identity, checks, model, controls, selected shelf and V1 together. Teacher timer/challenges remain separately owned. Core dialogs use ModalFocus for trap/return; LessonCompanion retains its own dialog lifecycle.

Retained verification scripts and synthetic legacy fixtures live in `verification/` and are not loaded by the application. They use Node built-ins and the already bundled Three.js; no package manager or build step is added.

Lesson prompts must request a child-authored change, include a presentation or investigation that works without completed printing, and avoid promising unmeasured print time. The model verification status remains owned by StudioApp. Content registration does not mark a design sliced or physically printed.

## Camera framing

The explicit `btn-fit-model` button calls `SceneManager.fitModelView()`. Framing uses settled dimensions rather than transient appearance-animation bounds. It preserves camera angles, centers on the model, and adapts to viewport aspect and projection. Wheel and pinch share the adjusted zoom limit. Empty scenes are ignored.

## Verification boundaries

Focused isolated-browser checks exercised all new mission buttons, catalog filtering, project save/import/reload, transform/undo/redo, teacher scenario links, grade switching, challenge edits, timer controls, and desktop/tablet layouts. Initial recovery also checked direct `file://` launch. Synthetic slicer estimates were removed from the visible print-time field; teacher-entered slicer notes render as literal text.

Physical prints, material durability, slicer manifold repair, and printer throughput remain unverified. The one-hour timer was checked through short real ticking/pause/resume interactions; a full-hour session was not run.
