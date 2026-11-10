// Deterministic verification for the HeightmapReliefGenerator and STL export.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const THREE = require(path.join(root, 'lib/three.min.js'));

let captured;
const context = {
  window: {},
  THREE,
  Blob: class { constructor(parts) { captured = parts[0]; } },
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
  setTimeout: () => 0,
  alert: (msg) => { throw new Error(msg); },
  document: {
    getElementById: () => null,
    createElement: (tag) => {
      if (tag === 'canvas') {
        const fakeCanvas = {
          width: 128,
          height: 128,
          getContext: () => ({
            fillStyle: '#000',
            fillRect() {},
            beginPath() {},
            moveTo() {},
            lineTo() {},
            arc() {},
            closePath() {},
            fill() {},
            drawImage() {},
            createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
            getImageData: (x, y, w, h) => {
              // Create high-contrast test pattern: left half white (255), right half black (0)
              const data = new Uint8ClampedArray(w * h * 4);
              for (let j = 0; j < h; j++) {
                for (let i = 0; i < w; i++) {
                  const idx = (j * w + i) * 4;
                  const val = i < w / 2 ? 255 : 0;
                  data[idx] = val;
                  data[idx + 1] = val;
                  data[idx + 2] = val;
                  data[idx + 3] = 255;
                }
              }
              return { data };
            },
            putImageData() {}
          })
        };
        return fakeCanvas;
      }
      return { click() {} };
    },
    body: { appendChild() {}, removeChild() {} }
  },
  Image: class {
    constructor() {
      this.src = '';
    }
  }
};

context.window = context;
vm.createContext(context);

// Load generator and scene manager
['src/generators/heightmapRelief.js', 'src/sceneManager.js'].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
});

const HeightmapReliefGenerator = context.window.HeightmapReliefGenerator;
const SceneManager = context.window.SceneManager;
assert.ok(HeightmapReliefGenerator, 'HeightmapReliefGenerator is registered on window');

const gen = new HeightmapReliefGenerator();

// Test Case 1: Rectangular Plate with Frame
{
  const group = gen.build3D({
    width: 60,
    reliefHeight: 4.0,
    baseThickness: 2.0,
    shape: 'rect',
    frame: true,
    keychain: false,
    resolution: 64,
    invert: false
  });
  group.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(group);
  const size = bounds.getSize(new THREE.Vector3());
  assert.ok(Math.abs(size.x - 60) < 0.1, 'Rect width is 60mm');
  assert.ok(Math.abs(size.z - 60) < 0.1, 'Rect depth is 60mm');
  assert.ok(size.y >= 6.0, 'Height includes base + relief + frame elevation');

  // Verify STL Export
  const scene = Object.create(SceneManager.prototype);
  Object.assign(scene, {
    modelGroup: new THREE.Group(),
    effectsGroup: new THREE.Group(),
    popAnimBlocks: [],
    slicerActive: false,
    nozzleMesh: null,
    clipPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 500)
  });
  scene.modelGroup.add(group);
  scene.exportBinarySTL('rect_test.stl');

  const view = new DataView(captured);
  const triangles = view.getUint32(80, true);
  assert.ok(triangles > 0, 'Exported triangles > 0');
  assert.equal(captured.byteLength, 84 + triangles * 50, 'STL binary record length matches');

  let minZ = Infinity;
  for (let t = 0; t < triangles; t++) {
    for (let v = 0; v < 3; v++) {
      const offset = 84 + t * 50 + 12 + v * 12;
      const x = view.getFloat32(offset, true);
      const y = view.getFloat32(offset + 4, true);
      const z = view.getFloat32(offset + 8, true);
      assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z), 'Coordinates are finite');
      minZ = Math.min(minZ, z);
    }
  }
  assert.ok(Math.abs(minZ) < 1e-5, 'STL lowest point settled exactly at Z=0');
  scene.clearModel();
  console.log('PASS: rectangular solid heightmap exports with valid binary STL, bounds ' + [size.x, size.z, size.y].map(n => n.toFixed(1)).join('x') + ' mm, settled at Z=0');
}

// Test Case 2: Circular Medallion with Keychain Loop
{
  const group = gen.build3D({
    width: 50,
    reliefHeight: 3.0,
    baseThickness: 2.0,
    shape: 'circle',
    frame: true,
    keychain: true,
    resolution: 64,
    invert: false
  });
  group.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(group);
  const size = bounds.getSize(new THREE.Vector3());
  assert.ok(Math.abs(size.x - 50) < 0.1, 'Diameter is 50mm');
  assert.ok(size.z > 50, 'Keychain loop extends along Z');

  const scene = Object.create(SceneManager.prototype);
  Object.assign(scene, {
    modelGroup: new THREE.Group(),
    effectsGroup: new THREE.Group(),
    popAnimBlocks: [],
    slicerActive: false,
    nozzleMesh: null,
    clipPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 500)
  });
  scene.modelGroup.add(group);
  scene.exportBinarySTL('coin_keychain_test.stl');

  const view = new DataView(captured);
  const triangles = view.getUint32(80, true);
  assert.ok(triangles > 0, 'Exported triangles > 0');
  assert.equal(captured.byteLength, 84 + triangles * 50, 'STL binary record length matches');

  let minZ = Infinity;
  for (let t = 0; t < triangles; t++) {
    for (let v = 0; v < 3; v++) {
      const offset = 84 + t * 50 + 12 + v * 12;
      const x = view.getFloat32(offset, true);
      const y = view.getFloat32(offset + 4, true);
      const z = view.getFloat32(offset + 8, true);
      assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z), 'Coordinates are finite');
      minZ = Math.min(minZ, z);
    }
  }
  assert.ok(Math.abs(minZ) < 1e-5, 'STL lowest point settled exactly at Z=0');
  scene.clearModel();
  console.log('PASS: circular medallion with keychain loop exports cleanly to STL, triangles: ' + triangles);
}

// Test Case 3: Invert heightmap verification
{
  const normalHeights = gen._sampleHeightGrid(32, 32, { invert: false });
  const invertedHeights = gen._sampleHeightGrid(32, 32, { invert: true });
  assert.ok(Math.abs((normalHeights[0] + invertedHeights[0]) - 1.0) < 0.05, 'Invert flips pixel values: normal + inverted ~= 1.0');
  console.log('PASS: heightmap inversion arithmetic verified');
}

console.log('All HeightmapReliefGenerator verification checks passed successfully.');
