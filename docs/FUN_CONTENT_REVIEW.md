# Fun content review — work in progress

Baseline `ac5f5e1`, 2026-10-07. This document is a recovery checkpoint and
does not certify a completed release. Source and originals remain uncommitted
at this checkpoint. Final captures must be made against committed source.

Owner priority: a single-color Anycubic i3 Mega. Recognizability depends on
geometry, relief and silhouette. Colors are secondary preview only. New
mission selection starts in one-plastic mode; saved child projects retain
their own monochrome setting.

## Main visual review checkpoints

| Entry | Observation from actual local HTTP UI | Verdict |
|---|---|---|
| Baseline catapult | Stripes at spring/base and arm/support; oversized ТАНК competes with mechanism; separate ammo block | REWORK |
| ID101 funrelief_compass_treasure_map | After X repair, mono iso/top show compass cross, winding path and distinct X; no observed surface stripes | PASS for slice grammar; final source-revision captures pending |
| ID151 iron_mole | Mono iso/color/side show large cuboid body, small face, chimney tail; no clear digging snout | REWORK; owner worker repairing |
| ID163 mountain_boat | Actual ortho mono front/side show two stepped towers; sailboat not recognizable | REWORK; optical geometry under redesign |

Capture/setup evidence: first browser reload retained old JS. Readback confirmed
toneMapping 0 / mono roughness .52 before cache disabling, then 2 / .9 after.
An initial 5-second scene-settle wait was INDETERMINATE. It completed its bounded
wait and stopped; no process was killed. Source inspection identified per-frame
camera damping and slow animation accumulation. Camera/pop now use elapsed frame
time; the repaired focused settle observation succeeded. Previous captures are
drafts and are not final release evidence.

Actual mono clicks also exposed a missing `StudioSound.playMonoSwitch` method,
which threw before autosave. The handler now uses the supported optional playPop.
The separate checkbox feedback used another missing method and was repaired too.

## Remaining required work

Complete 20 reliefs, 12 characters, 8 optical and 8 engineering entries; review
repaired catapult and all weak retained finite configurations. Add the final
machine-readable manifest and offline gallery, three original views per entry
plus resting/action proof for interactive entries. Verify >=12 interactions,
schema/selection/undo/reload/reset, desktop/tablet layout and focused export.
Commit owned units, push origin/main, capture committed source and check coverage.

Physical spring reliability, force, durability, manifold/slicer acceptance and
child enjoyment remain Not verified. Agent screenshot review is visual evidence,
not physical or child/teacher testing.
