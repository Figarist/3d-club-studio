'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const THREE = require(path.join(root, 'lib', 'three.min.js'));
const trackedMaps = [];

class TrackedMap extends Map {
  constructor(...args) {
    super(...args);
    trackedMaps.push(this);
  }
}

const window = {};
const context = { THREE, window, Map: TrackedMap, document: { getElementById: () => null } };
const voxelFontSource = fs.readFileSync(path.join(root, 'src', 'voxelFont.js'), 'utf8');
vm.runInNewContext(voxelFontSource, context, { filename: 'voxelFont.js' });
const generatorSource = fs.readFileSync(path.join(root, 'src', 'generators', 'physicsMechanics.js'), 'utf8');
vm.runInNewContext(generatorSource, context, { filename: 'physicsMechanics.js' });
const sceneManagerSource = fs.readFileSync(path.join(root, 'src', 'sceneManager.js'), 'utf8');
vm.runInNewContext(sceneManagerSource, context, { filename: 'sceneManager.js' });

const Generator = window.PhysicsMechanicsGenerator;
const SceneManager = window.SceneManager;
assert.equal(typeof Generator, 'function', 'generator registers its public class');
assert.equal(typeof SceneManager, 'function', 'scene manager registers its public class');
assert.equal(trackedMaps.length, 1, 'one geometry cache is created');
const geometryCache = trackedMaps[0];
const generator = new Generator();
const params = {
  submode: 'catapult',
  extrudeHeight: 8,
  springThickness: 2,
  armLength: 55,
  includeAmmo: false,
  customText: 'QA'
};

function resourcesIn(rootGroup) {
  const geometries = new Set();
  const materials = new Set();
  let meshCount = 0;
  rootGroup.traverse((object) => {
    if (!object.isMesh) return;
    meshCount++;
    if (object.geometry) geometries.add(object.geometry);
    const assigned = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of assigned) if (material) materials.add(material);
  });
  return { geometries, materials, meshCount };
}

function countDisposals(resources) {
  const counts = new Map();
  for (const resource of [...resources.geometries, ...resources.materials]) {
    counts.set(resource, 0);
    resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource) + 1));
  }
  return counts;
}

function assertDisposedOnce(counts, label) {
  for (const count of counts.values()) assert.equal(count, 1, `${label} resource disposes once`);
}

function createSceneManager() {
  const sceneManager = Object.create(SceneManager.prototype);
  sceneManager.modelGroup = new THREE.Group();
  sceneManager.effectsGroup = new THREE.Group();
  sceneManager.monochromeMaterial = null;
  sceneManager.slicerActive = false;
  sceneManager.clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 500);
  sceneManager.nozzleMesh = null;
  sceneManager.physicsUpdateFn = null;
  sceneManager.popAnimBlocks = [];
  return sceneManager;
}

const firstModel = generator.build3D(params);
const firstResources = resourcesIn(firstModel);
const firstDisposalCounts = countDisposals(firstResources);
assert.ok(firstResources.meshCount > firstResources.geometries.size, 'build reuses geometry within the model');
assert.equal(geometryCache.size, 0, 'build releases its construction cache while model meshes retain geometry');

const sceneManager = createSceneManager();
sceneManager.modelGroup.add(firstModel);

generator.triggerInteractiveDemo(sceneManager, 'catapult');
assert.equal(sceneManager.effectsGroup.children.length, 1, 'demo creates one temporary projectile');
assert.equal(geometryCache.size, 0, 'demo does not retain the projectile in the construction cache');
const projectile = sceneManager.effectsGroup.children[0];
let projectileDisposeCount = 0;
projectile.geometry.addEventListener('dispose', () => projectileDisposeCount++);
sceneManager.physicsUpdateFn(2.9);
assert.equal(sceneManager.effectsGroup.children.length, 0, 'demo removes its projectile at completion');
assert.equal(projectileDisposeCount, 1, 'demo disposes the projectile geometry once');
sceneManager.clearModel();
assertDisposedOnce(firstDisposalCounts, 'first model');

const secondModel = generator.build3D(params);
const secondResources = resourcesIn(secondModel);
const secondDisposalCounts = countDisposals(secondResources);
assert.equal(geometryCache.size, 0, 'rebuild also releases its construction cache');
for (const geometry of secondResources.geometries) {
  assert.ok(!firstResources.geometries.has(geometry), 'rebuild creates geometry independent of the disposed model');
}
sceneManager.modelGroup.add(secondModel);
sceneManager.clearModel();
assertDisposedOnce(secondDisposalCounts, 'rebuilt model');

process.stdout.write('PASS: physics geometry cache clears after build and demo; model and projectile resources dispose once across rebuild.\n');
