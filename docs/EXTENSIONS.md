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

Use unique preset keys and stable mission IDs. Supply the existing mission fields (`category`, `targetTab`, `config`, prompts, steps, checklist), and bind each mission to an actual registered preset. Check every 16×16 grid and height value, then verify its real generated bounds. Catalog filter counts are computed from the registry.

Lesson prompts must request a child-authored change, include a presentation or investigation that works without completed printing, and avoid promising unmeasured print time. The model verification status remains owned by StudioApp. Content registration does not mark a design sliced or physically printed.

## Camera framing

The explicit `btn-fit-model` button calls `SceneManager.fitModelView()`. Framing uses settled dimensions rather than transient appearance-animation bounds. It preserves camera angles, centers on the model, and adapts to viewport aspect and projection. Wheel and pinch share the adjusted zoom limit. Empty scenes are ignored.

## Verification boundaries

Focused isolated-browser checks exercised all new mission buttons, catalog filtering, project save/import/reload, transform/undo/redo, teacher scenario links, grade switching, challenge edits, timer controls, and desktop/tablet layouts. Initial recovery also checked direct `file://` launch. Synthetic slicer estimates were removed from the visible print-time field; teacher-entered slicer notes render as literal text.

Physical prints, material durability, slicer manifold repair, and printer throughput remain unverified. The one-hour timer was checked through short real ticking/pause/resume interactions; a full-hour session was not run.
