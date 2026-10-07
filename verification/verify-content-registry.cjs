'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const readSource = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const registrySource = readSource('src', 'contentRegistry.js');
const managerSource = readSource('src', 'missionManager.js');
const packSource = readSource('src', 'content', 'adventurePack.js');

const validGrid = Array(16).fill('1'.repeat(16));
const validPreset = (color = 0x123456) => ({
  grid: validGrid.slice(),
  colors: { 1: color }
});

function makeMission(id, key, presetKey) {
  return {
    id,
    key,
    presetKey,
    category: 'test',
    categoryLabel: 'Test',
    title: 'Test mission',
    targetSize: 'small',
    generatorLabel: 'Test generator',
    targetTab: 'minecraft',
    riddle: 'Question',
    grade23: 'Starter',
    grade46: 'Challenge',
    steps: {
      riddle: 'Question',
      design: 'Design',
      mono: 'Check',
      improve: 'Improve',
      result: 'Explain'
    },
    checklist: ['One', 'Two', 'Three'],
    config: { tab: 'minecraft', mcPreset: presetKey }
  };
}

function createRegistry() {
  const window = {};
  vm.runInNewContext(registrySource, { window }, { filename: 'src/contentRegistry.js' });
  return window.StudioContentRegistry;
}

function registerBase(registry) {
  registry.registerBaseMissions([
    makeMission(1, 'studio-core:mission-01', undefined)
  ]);
}

function makePack(id, missionId, presetKey) {
  return {
    id,
    presets: { [presetKey]: validPreset() },
    missions: [makeMission(missionId, id + ':' + presetKey, presetKey)]
  };
}

function registerInOrder(reverse) {
  const registry = createRegistry();
  registerBase(registry);
  const presetTarget = {};
  const packs = [makePack('pack-a', 20, 'a'), makePack('pack-b', 21, 'b')];
  if (reverse) packs.reverse();
  packs.forEach((pack) => registry.registerPack(pack, { presetTarget }));
  return { registry, presetTarget };
}

function assertRejectedWithoutMutation(registry, presetTarget, pack, pattern, label) {
  const missionArray = registry.missions;
  const missionRefs = registry.missions.slice();
  const missionIds = Array.from(registry._missionsById.keys());
  const missionKeys = Array.from(registry._missionsByKey.keys());
  const packIds = Array.from(registry._packIds);
  const presetEntries = Object.keys(presetTarget).sort().map((key) => [key, presetTarget[key]]);
  const snapshot = JSON.stringify({ missions: registry.missions, presets: presetTarget });

  assert.throws(() => registry.registerPack(pack, { presetTarget }), pattern, label + ' is rejected');
  assert.equal(registry.missions, missionArray, label + ' keeps the mission array');
  assert.equal(registry.missions.length, missionRefs.length, label + ' keeps mission count');
  missionRefs.forEach((mission, index) => assert.equal(registry.missions[index], mission, label + ' keeps mission order and identity'));
  assert.deepEqual(Array.from(registry._missionsById.keys()), missionIds, label + ' keeps the numeric index');
  assert.deepEqual(Array.from(registry._missionsByKey.keys()), missionKeys, label + ' keeps the stable-key index');
  assert.deepEqual(Array.from(registry._packIds), packIds, label + ' keeps registered pack IDs');
  assert.deepEqual(Object.keys(presetTarget).sort().map((key) => [key, presetTarget[key]]), presetEntries, label + ' keeps preset entries');
  assert.equal(JSON.stringify({ missions: registry.missions, presets: presetTarget }), snapshot, label + ' leaves all catalog arrays unchanged');
}

// Stable identities resolve identically when independent packs register in either order.
const forward = registerInOrder(false);
const reverse = registerInOrder(true);
assert.equal(forward.registry.resolveMission('pack-a:a').id, 20);
assert.equal(reverse.registry.resolveMission('pack-a:a').id, 20);
assert.equal(forward.registry.getMissionKey('20'), 'pack-a:a');
assert.equal(reverse.registry.getMissionId('pack-b:b'), 21);
assert.equal(forward.registry.resolveMission(999), null);
assert.equal(forward.registry.resolveMission('999'), null);

// Each invalid pack is attempted after valid registrations and must preserve all live registries.
assertRejectedWithoutMutation(
  forward.registry,
  forward.presetTarget,
  makePack('pack-c', 20, 'c'),
  /Duplicate mission ID/,
  'duplicate mission ID'
);
assertRejectedWithoutMutation(
  forward.registry,
  forward.presetTarget,
  {
    id: 'pack-missing',
    presets: { newPreset: validPreset() },
    missions: [makeMission(30, 'pack-missing:item', 'missingPreset')]
  },
  /missing preset/,
  'missing preset reference'
);
assertRejectedWithoutMutation(
  forward.registry,
  forward.presetTarget,
  {
    id: 'pack-grid',
    presets: { bad: { grid: ['too short'], colors: { 1: 1 } } },
    missions: [makeMission(30, 'pack-grid:bad', 'bad')]
  },
  /grid/,
  'malformed grid'
);
assertRejectedWithoutMutation(
  forward.registry,
  forward.presetTarget,
  {
    id: 'pack-color',
    presets: { badColor: validPreset(Number.NaN) },
    missions: [makeMission(30, 'pack-color:badColor', 'badColor')]
  },
  /RGB/,
  'invalid RGB color'
);
assertRejectedWithoutMutation(
  forward.registry,
  forward.presetTarget,
  {
    id: 'pack-preset-collision',
    presets: { a: validPreset() },
    missions: []
  },
  /Duplicate or empty preset key/,
  'duplicate preset key'
);

// The production core and Adventure Pack modules register without a DOM.
const window = { MINECRAFT_PRESETS: {} };
const context = { window };
vm.runInNewContext(registrySource, context, { filename: 'src/contentRegistry.js' });
vm.runInNewContext(managerSource, context, { filename: 'src/missionManager.js' });
vm.runInNewContext(packSource, context, { filename: 'src/content/adventurePack.js' });
assert.deepEqual(Array.from(window.StudioAdventurePack.missionIds), Array.from({ length: 12 }, (_, index) => index + 13));
assert.equal(window.StudioContentRegistry.resolveMission('studio-adventure-pack:adv_space_rocket').id, 13);
assert.equal(window.MINECRAFT_PRESETS.adv_space_rocket.grid.length, 16);

const manager = new window.MissionManager();
assert.equal(manager.setMission('studio-adventure-pack:adv_space_rocket').id, 13);
assert.equal(manager.getState().activeMissionKey, 'studio-adventure-pack:adv_space_rocket');
const activeBeforeUnknown = manager.getActiveMission();
assert.equal(manager.setMission(999), null);
assert.equal(manager.getActiveMission(), activeBeforeUnknown);

process.stdout.write('PASS: content identities are order-independent; invalid packs leave registered catalogs unchanged; legacy IDs and Adventure Pack registration resolve correctly.\n');
