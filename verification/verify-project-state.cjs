// Bounded deterministic checks for the pure project-state normalizer.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'projectState.js'), 'utf8');
const fixtureText = fs.readFileSync(path.join(__dirname, 'fixtures', 'project-state-legacy-v1.json'), 'utf8');
const context = { window: {}, fixtureText };
vm.runInNewContext(source + '\nwindow.__fixture = JSON.parse(fixtureText);', context, { filename: 'src/projectState.js' });
const ProjectState = context.window.ProjectState;
const fixture = context.window.__fixture;
const options = vm.runInNewContext("({ missions: [{ id: 1, key: 'quest.alpha' }, { id: 42, key: 'quest.beta' }], presets: ['sword'] })", context);
let passed = 0;

function cloneFixture() {
  return vm.runInNewContext('JSON.parse(JSON.stringify(window.__fixture))', context);
}

function loadFixture(name) {
  context.fixtureText = fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
  return vm.runInNewContext('JSON.parse(fixtureText)', context);
}

function check(name, callback) {
  callback();
  passed += 1;
  process.stdout.write('PASS ' + name + '\n');
}

function rejected(name, mutate, fragment) {
  check(name, function () {
    const state = cloneFixture();
    mutate(state);
    assert.throws(function () { ProjectState.normalize(state, options); }, new RegExp(fragment));
  });
}

check('legacy fixture migrates with safe defaults and detached grid', function () {
  const normalized = ProjectState.normalize(fixture, options);
  assert.strictEqual(normalized.schemaVersion, 1);
  assert.strictEqual(normalized.activeMissionKey, 'quest.alpha');
  assert.strictEqual(normalized.controls.phWingWeight, '7');
  assert.strictEqual(normalized.controls.phArmLength, '52');
  assert.strictEqual(normalized.controls.mobHeadgear, 'none');
  assert.strictEqual(normalized.controls.ilColorPrimary, '#10b981');
  assert.strictEqual(normalized.v1Snapshot.gridGroups, null);
  assert.strictEqual(normalized.v1Snapshot.slicerRecord, '');
  assert.strictEqual(Object.prototype.hasOwnProperty.call(normalized.v1Snapshot, 'estimatedMinutes'), false);
  assert.notStrictEqual(normalized.minecraft.grid, fixture.minecraft.grid);
  assert.notStrictEqual(normalized.minecraft.grid[0], fixture.minecraft.grid[0]);
});

check('stable mission key is authoritative and resolves the current numeric id', function () {
  const state = cloneFixture();
  state.activeMissionId = 1;
  state.activeMissionKey = 'quest.beta';
  const normalized = ProjectState.normalize(state, options);
  assert.strictEqual(normalized.activeMissionId, 42);
  assert.strictEqual(normalized.activeMissionKey, 'quest.beta');
});

rejected('unknown schema version is rejected', function (state) { state.schemaVersion = 2; }, 'schemaVersion');
rejected('unknown stable mission key is rejected despite valid numeric id', function (state) { state.activeMissionKey = 'quest.missing'; }, 'activeMissionKey');
rejected('unknown active tab is rejected', function (state) { state.activeTab = 'unknown'; }, 'activeTab');
rejected('malformed grid row is rejected before application', function (state) { state.minecraft.grid[3] = {}; }, 'minecraft.grid');
rejected('grid values outside 0..4 are rejected', function (state) { state.minecraft.grid[0][0] = 5; }, 'minecraft.grid');
rejected('non-finite RGB colors are rejected', function (state) { state.minecraft.colors['2'] = Infinity; }, 'minecraft.colors');
rejected('unsafe thumbnail URL is rejected', function (state) { state.v1Snapshot.thumbnail = 'data:text/html;base64,PHNjcmlwdD4='; }, 'thumbnail');

check('strict schema rejects out-of-range controls while legacy clamps finite values', function () {
  const modern = cloneFixture();
  modern.schemaVersion = 1;
  modern.controls.phWingWeight = '3.5';
  assert.throws(function () { ProjectState.normalize(modern, options); }, /phWingWeight/);
  const legacy = cloneFixture();
  const normalized = ProjectState.normalize(legacy, options);
  assert.strictEqual(normalized.controls.phWingWeight, '7');
  assert.strictEqual(normalized.controls.phArmLength, '52');
});

check('explicit null snapshot and empty pair code clear prior values in normalized output', function () {
  const state = cloneFixture();
  state.v1Snapshot = null;
  state.studentPairCode = '';
  const normalized = ProjectState.normalize(state, options);
  assert.strictEqual(normalized.v1Snapshot, null);
  assert.strictEqual(normalized.studentPairCode, '');
});

check('saved controls preserve a valid custom color', function () {
  const state = cloneFixture();
  state.controls.ilColorPrimary = '#AABBCC';
  assert.strictEqual(ProjectState.normalize(state, options).controls.ilColorPrimary, '#aabbcc');
});

check('normalized current schema is stable across a second normalization', function () {
  const once = ProjectState.normalize(fixture, options);
  const twice = ProjectState.normalize(once, options);
  assert.strictEqual(JSON.stringify(twice), JSON.stringify(once));
});

check('the malformed-grid browser fixture is rejected before use', function () {
  assert.throws(function () { ProjectState.normalize(loadFixture('project-state-malformed-grid.json'), options); }, /minecraft\.grid/);
});

check('the future-schema browser fixture is rejected before use', function () {
  assert.throws(function () { ProjectState.normalize(loadFixture('project-state-future-schema.json'), options); }, /schemaVersion/);
});

process.stdout.write('Verified ' + passed + ' deterministic project-state cases.\n');
