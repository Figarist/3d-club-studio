// Two focused history cases; no DOM or runtime dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/historyManager.js'), 'utf8'), { window });
const history = new window.HistoryManager();
const before = { app: '3d-club-studio', savedAt: 'first', activeMissionId: 1, minecraft: { grid: [[1]] } };
const after = { ...before, savedAt: 'second', activeMissionId: 13, minecraft: { grid: [[2]] } };
history.recordSnapshot(before);
history.recordSnapshot({ ...before, savedAt: 'later-focus' });
assert.equal(history.undoStack.length, 1, 'focus and pointer snapshots of the same project deduplicate');
assert.equal(history.undo(after).activeMissionId, 1);
assert.equal(history.redo(before).activeMissionId, 13);
history.recordSnapshot({ ...before, savedAt: 'after-redo' });
assert.equal(history.undoStack.length, 1, 'redo preserves the same canonical snapshot format');
process.stdout.write('PASS: timestamp-independent transactions and undo/redo preserve mission state.\n');
