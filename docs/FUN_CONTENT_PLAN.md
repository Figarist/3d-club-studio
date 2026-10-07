# Classroom content implementation plan

Baseline: clean main `ac5f5e1`, app 1.8.2, schema 1 (2026-10-07).
This is a plan, not acceptance evidence. See FUN_CONTENT_REVIEW.md for verdicts.

## Finite inventory

The reproducible inventory is `verification/inventory-content.cjs`.
There are 28 Minecraft presets: sword, pickaxe, creeper, tnt, heart, shield,
totem, dragon, hero_badge, creature_track, fossil_shell, city_coin, game_token,
mini_tag, cardboard_stand, slot_calibrator, and twelve `adv_*` reliefs.
Core missions 1–11 use curated smaller configurations; missions 1 and 10 share
exactly the same hero_badge configuration. Adventure missions 13–24 share the
same small default controls but distinct grids. Capture different configurations
separately; do not count aliases twice.

Optical inventory: six generator presets, four visible preset controls and
core mission 12. Character inventory: five selectable archetypes and the
actual startup equipment configuration. Engineering: catapult and balancer
startup configurations. Continuous sliders, random variations and child drawings
are outside the finite inventory. Exact defaults will be frozen in the manifest.

## Repairs and allocation

The supplied screenshot and actual local HTTP view show striped joins on the
catapult, an obscure fork, an oversized text label and detached ammo. Repair
surface boundaries and hierarchy; add clear launch target, result and reset.
Printed spring strength, force and durability remain Not verified.

| Owner | New content | Permanent ID range | Isolated source |
|---|---:|---|---|
| Luna A | 20 authored relief grids | 101–120 | content/funReliefs.js |
| Luna B | 12 characters + 8 optical arrangements | 151–170 | mobMutator.js, dualIllusion.js, content/funDiscoveries.js |
| Luna C | 8 engineering silhouettes | 201–208 | physicsMechanics.js, content/funEngineering.js |
| Main | Catalog/configuration integration, schema, shared UI, evidence | none | app/registry/HTML/CSS |

Theme loops include tracking, archaeological reconstruction, map routes,
constellation spotting, face expressions, character roles, two-view predictions,
launch targets and balance investigations. Geometry, not color/name/scale alone,
must distinguish entries. Twelve or more entries use actual actions across launch,
balance/retry, reveal and edited silhouette comparison patterns.

## Sequence and gates

1. Three read-only investigations, at most five findings each.
2. Build a repaired catapult plus one relief, character and optical vertical slice.
3. Main reviews actual color, mono and complementary/action screenshots before expansion.
4. Disjoint content waves; register stable model keys and complete mission configs
   atomically. No new runtime packages, parallel state, or implicit preset reload.
5. Capture originals from real visible selection controls, four models per batch,
   at most 20 cases/60 seconds. Open every view and record PASS/REWORK/BLOCKED.
6. Focused schema/identity/undo/reset/layout/export checks. Commit source, then
   capture evidence against committed source; affected edits invalidate captures.
7. Offline gallery and manifest coverage check, explicit physical limitations.

Acceptance requires 48 distinct new accessible entries, improved weak existing
models, at least 12 meaningful interactions, all finite configurations covered,
no unresolved REWORK, compatible old projects and confirmed pushed HEAD.
Actual child enjoyment and physical printing are separate unverified gates.
