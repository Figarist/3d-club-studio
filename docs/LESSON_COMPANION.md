# Lesson companion

The optional lesson companion gives a teacher a practical 60-minute plan for a group of up to 10 children in grades 2–6 sharing one Anycubic i3 Mega. It adds six scenario cards linked to existing mission IDs, age-specific instructions, an editable challenge deck, and an optional elapsed-time timer.

## Integration

Keep this feature opt-in. Add `lesson-companion.css` as a local stylesheet and load `src/lessonCompanion.js` after `src/safeStorage.js` and before `src/app.js`. The root controller can connect the topbar button with:

```js
const lessonCompanion = new window.LessonCompanion({
  onSelectMission: function (missionId) {
    // Root-owned mission selection, such as calling the existing mission UI.
  }
}).init();

document.getElementById('btn-open-lesson').addEventListener('click', function () {
  lessonCompanion.open();
});
```

The callback receives one existing numeric mission ID: 2, 5, 6, 8, 9, or 12. It is optional; without it, the lesson plan remains usable and the mission button is disabled. The companion does not select a tab, mutate the model, print, or call other studio globals.

## Behavior

- `open()`, `close()`, and `destroy()` control the modal. Escape, the close buttons, and a backdrop click close it. Focus returns to the opener, Tab stays inside the dialog, and the page scroll lock is restored on close.
- The grade switch updates the selected scenario's two or three age-appropriate steps. Scenario selection is remembered.
- Twelve concrete design constraints cycle in shuffled order without repeats until all twelve have appeared. The teacher can edit a constraint or restore its original wording. Edits, the selected scenario, grade, deck position, and timer state use `window.SafeStorage` when available.
- The timer is opt-in and capped at 60 minutes. It calculates elapsed time from wall-clock timestamps, so throttled browser intervals do not add drift. It continues while the modal is closed and shows that status when reopened. Reset or pause it explicitly; the timer makes no claim about print completion.
- No audio, external requests, new dependencies, print-time estimates, or printer-ready claims are introduced.

The stylesheet and script are standalone assets. The host page remains responsible for adding the stylesheet, script tag, and topbar button.
