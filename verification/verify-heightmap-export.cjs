// Deterministic verification for the HeightmapReliefGenerator and STL export v2.2.0.
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
              // High-contrast test pattern: left half white (255), right half black (0)
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

// Load validator, generator and scene manager
['src/meshValidator.js', 'src/generators/heightmapRelief.js', 'src/sceneManager.js'].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
});

const MeshValidator = context.window.MeshValidator;
const HeightmapReliefGenerator = context.window.HeightmapReliefGenerator;
const SceneManager = context.window.SceneManager;
assert.ok(MeshValidator, 'MeshValidator is registered on window');
assert.ok(HeightmapReliefGenerator, 'HeightmapReliefGenerator is registered on window');

const gen = new HeightmapReliefGenerator();

// 1. Повна топологічна перевірка всієї комбінаторної матриці (watertight, manifold, positive volume)
const shapes = ['rect', 'circle'];
const keychains = [false, true];
const frames = [false, true];

for (const shape of shapes) {
  for (const keychain of keychains) {
    for (const frame of frames) {
      const group = gen.build3D({
        shape,
        keychain,
        frame,
        width: 60,
        reliefHeight: 3.5,
        baseThickness: 2.0,
        resolution: 64
      });
      const analysis = MeshValidator.analyze(group);
      assert.equal(analysis.ok, true, `Mesh analysis must pass for ${shape} keychain=${keychain} frame=${frame}`);
      assert.equal(analysis.boundaryEdges, 0, `Boundary edges must be 0 for ${shape}`);
      assert.equal(analysis.nonManifoldEdges, 0, `Non-manifold edges must be 0 for ${shape}`);
      assert.equal(analysis.flippedEdges, 0, `Flipped edges must be 0 for ${shape}`);
      assert.ok(analysis.signedVolume > 0, `Signed volume must be positive for ${shape}`);
    }
  }
}

// 2. Тест експорту STL через SceneManager
const scene = Object.create(SceneManager.prototype);
Object.assign(scene, {
  modelGroup: new THREE.Group(),
  effectsGroup: new THREE.Group(),
  popAnimBlocks: [],
  slicerActive: false,
  nozzleMesh: null,
  clipPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 500)
});

const testGroup = gen.build3D({
  shape: 'circle',
  keychain: true,
  frame: true,
  width: 50,
  reliefHeight: 3.0,
  baseThickness: 2.0,
  resolution: 64
});

scene.modelGroup.add(testGroup);
scene.exportBinarySTL('test_circle_keychain.stl');

assert.ok(captured, 'Binary STL blob was captured');
const byteLength = captured.byteLength || 0;
assert.ok(byteLength > 84, 'Binary STL has valid size');

const view = new DataView(captured.buffer || captured);
const triCount = view.getUint32(80, true);
assert.ok(triCount > 1000, `Triangle count should be significant, got: ${triCount}`);
assert.equal(byteLength, 84 + triCount * 50, 'STL file size strictly matches 84 + N * 50 bytes');

console.log(`[PASS] verify-heightmap-export: Matrix verified. STL exported ${triCount} watertight triangles.`);
