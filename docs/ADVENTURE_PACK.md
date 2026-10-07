# Adventure Pack

Adventure Pack adds twelve Ukrainian classroom missions and twelve matching 16×16 Minecraft Forge relief presets. Its themes are Space Expedition, Nature Detectives, and City Makers. Each mission opens its named starter preset and gives children a concrete edit to make before they review the model.

## Integration

Load the module after both public registries have been created and before the app starts:

```html
<script src="src/contentRegistry.js"></script>
<script src="src/missionManager.js"></script>
<script src="src/generators/minecraftForge.js"></script>
<script src="src/content/adventurePack.js"></script>
<script src="src/app.js"></script>
```

The module stages its data and calls `StudioContentRegistry.registerPack` once. The registry validates the complete pack before extending `window.MINECRAFT_PRESETS` and the ordered mission list exposed as `window.STUDIO_MISSIONS`. It exposes `window.StudioAdventurePack` with `metadata`, `presetKeys`, numeric `missionIds`, `missionIdByPresetKey`, and three `groups` records. Mission IDs are permanently 13–24; stable keys are `studio-adventure-pack:<presetKey>`. Preset keys retain the `adv_` prefix. A collision or invalid reference rejects registration without a partial pack. See [EXTENSIONS](EXTENSIONS.md) for the full load order and extension recipe; this snippet shows only the relevant dependency edges.

## Mission cards and presets

| Theme | Mission | Filter | Preset key | Student investigation |
|---|---|---|---|---|
| Space Expedition | 🚀 Рятувальна ракета | relief | `adv_space_rocket` | Edit the window and body; inspect the silhouette. |
| Space Expedition | 🌙 Місяцехід для кам’яної долини | relief | `adv_space_rover` | Move wheel and sensor cells; compare the support width. |
| Space Expedition | 🛰️ Супутник для мапи сигналу | relief | `adv_space_satellite` | Redesign the two connected solar wings and receiver. |
| Space Expedition | ☄️ Слід комети | texture | `adv_space_comet` | Make connected tail bands with different lengths. |
| Nature Detectives | 🍃 Листок під лупою | texture | `adv_nature_leaf` | Redraw a central vein and two side veins. |
| Nature Detectives | 🐝 Бджола на квітковому маршруті | texture | `adv_nature_bee` | Change the bands and wings while preserving joins. |
| Nature Detectives | 🏔️ Карта гірської стежки | boardgame | `adv_nature_mountain` | Move the snow cap and mark a route up the profile. |
| Nature Detectives | 🍄 Маркер лісового пошуку | boardgame | `adv_nature_mushroom` | Make a new cap pattern joined to the stem. |
| City Makers | 🏠 Знак дружнього будинку | useful | `adv_city_house` | Redesign the windows, door, and roof. |
| City Makers | 🌉 Міст для картонного міста | cardboard | `adv_city_bridge` | Change the arch and trace the deck’s support path. |
| City Makers | 🌬️ Вітрова турбіна району | cardboard | `adv_city_turbine` | Move a blade and check its connection to the hub. |
| City Makers | ☀️ Сонячний годинник світла й тіні | optical | `adv_city_sundial` | Reorient the shadow and inspect its raised height. |

The cards use the existing `relief`, `texture`, `boardgame`, `useful`, `cardboard`, and `optical` categories so the current mission filters can find them. Each mission contains a starter edit, a grade 2–3 path, a grade 4–6 challenge, a five-part activity, and a three-item self-check. The starter model is deliberately a draft: children are asked to change at least three cells or a named design feature.

## Relief dimensions

Every preset is a deterministic, full 16×16 grid whose cells use levels 0–4. A 1.8 mm voxel gives a maximum grid footprint of 28.8×28.8 mm. The recommended 0.9 mm level step and enabled 2.0 mm base give a maximum top height of 7.2 mm at level 4: 2.0 mm base + 2.5 mm generator offset + three 0.9 mm steps. Mounting is set to `none`, so no keychain loop or label extends the footprint. The designs are authored as one four-neighbor-connected group; the module checks grid dimensions, level values, use of levels 1–4, and connectivity before registering each preset.

These are configuration dimensions, not a guarantee that a sliced or printed part will meet a particular tolerance or survive a particular use. Inspect the generated model and validate printer and material settings in the slicer before printing.

## A 60-minute club session

The outline fits a club of 2–10 children in grades 2–6. With shared computers, pairs can alternate the designer and checker roles; each child should contribute a visible edit.

| Minutes | Activity |
|---:|---|
| 0–5 | Read a mission card and make a prediction about shape, support, texture, or shadow. |
| 5–12 | Open the linked starter, identify the 16×16 grid and four height levels, then choose one edit. |
| 12–32 | Redesign the model. Younger children follow the grade 2–3 prompt; older children take the grade 4–6 constraint. |
| 32–42 | Inspect the silhouette, turn on the one-color view, and use the connectivity indicator to revise the model. |
| 42–52 | Show a partner the change and explain one design decision using the card’s question. |
| 52–60 | Save the project and share a short gallery explanation. |

The session ends with a saved digital model. Slicing, printer setup, and fabrication are outside this 60-minute activity; the pack makes no print-time or print-success claim.
