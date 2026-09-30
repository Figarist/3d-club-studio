// Генератор 1: Майнкрафт-Кузня (Багаторівневий 3D-Воксель Рельєф з піксель-редактором та пресетами)
(function () {
  // Кожен символ у шаблоні 16x16 позначає рівень висоти та колір:
  // '.' = порожньо (0)
  // '1' = Темний контур / Дерево (висота L1)
  // '2' = Середній шар / Сталь / Зелений (висота L2)
  // '3' = Високий шар / Алмаз / Золото (висота L3)
  // '4' = Супер-акцент / Рубін / Світіння (висота L4)

  const PRESETS = {
    sword: {
      name: '⚔️ Алмазний Меч',
      colors: { 1: 0x5c3a21, 2: 0x0284c7, 3: 0x38bdf8, 4: 0xe0f2fe },
      grid: [
        '.............222',
        '............2342',
        '...........23432',
        '..........23432.',
        '.........23432..',
        '........23432...',
        '.......23432....',
        '..22..23432.....',
        '..23223432......',
        '...233432.......',
        '....2332........',
        '...11232........',
        '..141.222.......',
        '.141...22.......',
        '1141............',
        '111.............'
      ]
    },
    pickaxe: {
      name: '⛏️ Алмазна Кірка',
      colors: { 1: 0x6b4423, 2: 0x0369a1, 3: 0x22d3ee, 4: 0xa5f3fc },
      grid: [
        '.....22333322...',
        '....2344444432..',
        '...234322223432.',
        '...232....112342',
        '..........141232',
        '.........141..22',
        '........141...2.',
        '.......141......',
        '......141.......',
        '.....141........',
        '....141.........',
        '...141..........',
        '..141...........',
        '.141............',
        '141.............',
        '11..............'
      ]
    },
    creeper: {
      name: '💚 Кріпер-Трофей',
      colors: { 1: 0x111827, 2: 0x15803d, 3: 0x22c55e, 4: 0x86efac },
      grid: [
        '2222222222222222',
        '2332233332233322',
        '2343223322344322',
        '2211112222111122',
        '2211112332111122',
        '2211112332111122',
        '2211112222111122',
        '2332221111222332',
        '2342221111222432',
        '2222111111112222',
        '2322111111112232',
        '2322111111112232',
        '2222112222112222',
        '2332112332112332',
        '2343222342223432',
        '2222222222222222'
      ]
    },
    tnt: {
      name: '🧨 Динаміт TNT',
      colors: { 1: 0x1f2937, 2: 0xb91c1c, 3: 0xef4444, 4: 0xf8fafc },
      grid: [
        '1111111111111111',
        '1232323232323231',
        '1323232323232321',
        '1232323232323231',
        '1111111111111111',
        '1444444444444441',
        '1411141114141111',
        '1441441414144141',
        '1441441414144141',
        '1441441414144141',
        '1444444444444441',
        '1111111111111111',
        '1232323232323231',
        '1323232323232321',
        '1232323232323231',
        '1111111111111111'
      ]
    },
    heart: {
      name: '❤️ Серце Життя',
      colors: { 1: 0x450a0a, 2: 0xb91c1c, 3: 0xef4444, 4: 0xfecaca },
      grid: [
        '................',
        '..1111....1111..',
        '.123331..133321.',
        '1234433113333321',
        '1344333333333321',
        '1343333333333321',
        '1333333333333221',
        '1233333333332221',
        '.12333333332221.',
        '..123333332221..',
        '...1233332221...',
        '....12332221....',
        '.....122221.....',
        '......1221......',
        '.......11.......',
        '................'
      ]
    },
    shield: {
      name: '🛡️ Щит-Заготовка (Tinkercad)',
      colors: { 1: 0x78350f, 2: 0x9ca3af, 3: 0xf59e0b, 4: 0xfef08a },
      grid: [
        '.33333333333333.',
        '3443333333333443',
        '3431111111111343',
        '3311222222221133',
        '3312222222222133',
        '3312222222222133',
        '3312222222222133',
        '3312222222222133',
        '3312222222222133',
        '.33122222222133.',
        '.33112222221133.',
        '..331222222133..',
        '...3312222133...',
        '....33122133....',
        '.....331133.....',
        '......3443......'
      ]
    },
    totem: {
      name: '🏆 Тотем Безсмертя',
      colors: { 1: 0x92400e, 2: 0xd97706, 3: 0xfacc15, 4: 0x10b981 },
      grid: [
        '....22222222....',
        '...2333333332...',
        '...2344334432...',
        '...2344334432...',
        '...2333113332...',
        '.22223311332222.',
        '2333222222223332',
        '2343233443323432',
        '2222233443322222',
        '....23333332....',
        '....22333322....',
        '.....233332.....',
        '.....223322.....',
        '......2332......',
        '.....233332.....',
        '....22222222....'
      ]
    },
    dragon: {
      name: '🐉 Дракон Енду',
      colors: { 1: 0x090d16, 2: 0x1e1b4b, 3: 0x9333ea, 4: 0xe879f9 },
      grid: [
        '..33........33..',
        '.343........343.',
        '.33111111111133.',
        '..112222222211..',
        '.11221122112211.',
        '.12222222222221.',
        '1121441221441211',
        '1221331221331221',
        '1222222112222221',
        '1112221111222111',
        '.11111222211111.',
        '..112233332211..',
        '..112344443211..',
        '...1122222211...',
        '....11111111....',
        '................'
      ]
    }
  };

  const MC_CONFIG = {
    GRID_SIZE: 16,
    BASE_PLATE_HEIGHT: 2.0,
    DEFAULT_VOXEL_SIZE: 3.5,
    DEFAULT_HEIGHT_STEP: 1.5,
    BASE_HEIGHT_OFFSET: 2.5,
    KEYCHAIN_RING_OUTER: 7.5,
    KEYCHAIN_RING_INNER: 3.2,
    KEYCHAIN_SEGMENTS: 24,
    LABEL_PIXEL_MIN: 1.8,
    LABEL_PIXEL_SCALE: 0.52,
    LABEL_PLATE_HEIGHT: 3.0,
    LABEL_LETTER_HEIGHT: 2.2
  };

  class MinecraftForgeGenerator {
    constructor() {
      this.currentPresetKey = 'sword';
      this.activeBrush = 3; // 0 = Гумка, 1..4 = Рівні висоти
      this.isPainting = false;
      this.grid = [];
      this.colors = { 1: 0x5c3a21, 2: 0x0284c7, 3: 0x38bdf8, 4: 0xe0f2fe };
      this._onMouseUp = () => { this.isPainting = false; };
      window.addEventListener('mouseup', this._onMouseUp);
      this.loadPreset('sword', false);
    }

    loadPreset(key, triggerRebuild = true) {
      const p = PRESETS[key] || PRESETS.sword;
      this.currentPresetKey = key;
      this.colors = Object.assign({}, p.colors);
      this.grid = p.grid.map(row =>
        row.split('').map(ch => (ch === '.' ? 0 : parseInt(ch, 10) || 0))
      );
      this.renderCanvasUI();
      if (triggerRebuild && window.StudioApp) {
        window.StudioApp.rebuildCurrentModel(true);
      }
    }

    clearGrid() {
      this.grid = Array.from({ length: MC_CONFIG.GRID_SIZE }, () => Array(MC_CONFIG.GRID_SIZE).fill(0));
      this.renderCanvasUI();
      if (window.StudioSound) window.StudioSound.playClearCanvas();
      if (window.StudioApp) window.StudioApp.rebuildCurrentModel(true, true);
    }

    // Випадковий симетричний тотем/меч/артефакт (діти обожнюють кнопку рандому!)
    randomizeArtifact() {
      const palettes = [
        { 1: 0x5c3a21, 2: 0x0284c7, 3: 0x38bdf8, 4: 0xe0f2fe },
        { 1: 0x31102f, 2: 0x9333ea, 3: 0xc084fc, 4: 0xfef08a },
        { 1: 0x14532d, 2: 0x16a34a, 3: 0x4ade80, 4: 0xfacc15 },
        { 1: 0x7f1d1d, 2: 0xdc2626, 3: 0xf97316, 4: 0xfef08a }
      ];
      this.colors = palettes[Math.floor(Math.random() * palettes.length)];
      this.grid = Array.from({ length: MC_CONFIG.GRID_SIZE }, () => Array(MC_CONFIG.GRID_SIZE).fill(0));

      for (let r = 1; r < 15; r++) {
        for (let c = 2; c < 8; c++) {
          const distFromCenter = 7.5 - c;
          const prob = 0.78 - distFromCenter * 0.11;
          if (Math.random() < prob) {
            const lvl = Math.min(4, Math.max(1, Math.floor(Math.random() * 4) + 1));
            this.grid[r][c] = lvl;
            this.grid[r][15 - c] = lvl; // Симетрія!
          }
        }
        // Центральна вісь завжди з'єднана, щоб модель була міцною
        this.grid[r][7] = Math.floor(Math.random() * 3) + 2;
        this.grid[r][8] = this.grid[r][7];
      }

      this.renderCanvasUI();
      if (window.StudioApp) window.StudioApp.rebuildCurrentModel(true, true);
    }

    renderCanvasUI() {
      const container = document.getElementById('mc-pixel-grid');
      if (!container) return;
      container.innerHTML = '';

      const hexStr = (num) => '#' + num.toString(16).padStart(6, '0');

      for (let r = 0; r < MC_CONFIG.GRID_SIZE; r++) {
        for (let c = 0; c < MC_CONFIG.GRID_SIZE; c++) {
          const cell = document.createElement('div');
          cell.className = 'pixel-cell';
          const val = this.grid[r][c];
          if (val > 0) {
            cell.style.backgroundColor = hexStr(this.colors[val] || 0x38bdf8);
            cell.textContent = val;
          } else {
            cell.style.backgroundColor = '#0f172a';
            cell.textContent = '';
          }

          const paintCell = () => {
            if (this.grid[r][c] !== this.activeBrush) {
              this.grid[r][c] = this.activeBrush;
              if (this.activeBrush > 0) {
                cell.style.backgroundColor = hexStr(this.colors[this.activeBrush]);
                cell.textContent = this.activeBrush;
              } else {
                cell.style.backgroundColor = '#0f172a';
                cell.textContent = '';
              }
              if (window.StudioSound) window.StudioSound.playPaintNote(r, c, this.activeBrush);
              if (window.StudioApp) window.StudioApp.rebuildCurrentModel(false);
            }
          };

          cell.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isPainting = true;
            paintCell();
          });
          cell.addEventListener('mouseenter', () => {
            if (this.isPainting) paintCell();
          });

          container.appendChild(cell);
        }
      }
    }

    // Генерація 3D-геометрії у реальних міліметрах
    build3D(params) {
      const group = new THREE.Group();

      const voxelSize = parseFloat(params.voxelSize) || MC_CONFIG.DEFAULT_VOXEL_SIZE; // мм
      const basePlateHeight = params.solidBase ? MC_CONFIG.BASE_PLATE_HEIGHT : 0.0;  // мм
      const heightStep = parseFloat(params.heightStep) || MC_CONFIG.DEFAULT_HEIGHT_STEP; // мм різниця між шарами
      const mountType = params.mountType || 'keychain';      // 'none', 'keychain', 'stand'
      const customLabel = (params.customLabel || '').trim();

      // Висоти для кожного з 4 рівнів (мм)
      const levelHeights = {
        1: basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET,
        2: basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET + heightStep,
        3: basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET + heightStep * 2,
        4: basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET + heightStep * 3
      };

      const materials = {
        0: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.1 }),
        1: new THREE.MeshStandardMaterial({ color: this.colors[1], roughness: 0.5, metalness: 0.15 }),
        2: new THREE.MeshStandardMaterial({ color: this.colors[2], roughness: 0.4, metalness: 0.2 }),
        3: new THREE.MeshStandardMaterial({ color: this.colors[3], roughness: 0.3, metalness: 0.25 }),
        4: new THREE.MeshStandardMaterial({ color: this.colors[4], roughness: 0.25, metalness: 0.3 })
      };

      const totalWidth = MC_CONFIG.GRID_SIZE * voxelSize;
      const offset = -totalWidth / 2 + voxelSize / 2;

      // Якщо увімкнено "Суцільна основа (Бронебійна міцність)" — будуємо підкладку під активними клітинками та їх сусідами
      if (params.solidBase) {
        const baseGeo = new THREE.BoxGeometry(voxelSize, basePlateHeight, voxelSize);
        for (let r = 0; r < MC_CONFIG.GRID_SIZE; r++) {
          for (let c = 0; c < MC_CONFIG.GRID_SIZE; c++) {
            let hasNeighbor = this.grid[r][c] > 0;
            if (!hasNeighbor) {
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr, nc = c + dc;
                  if (nr >= 0 && nr < MC_CONFIG.GRID_SIZE && nc >= 0 && nc < MC_CONFIG.GRID_SIZE && this.grid[nr][nc] > 0) {
                    hasNeighbor = true;
                  }
                }
              }
            }
            if (hasNeighbor && this.grid[r][c] === 0) {
              const mesh = new THREE.Mesh(baseGeo, materials[0]);
              mesh.position.set(offset + c * voxelSize, basePlateHeight / 2, offset + r * voxelSize);
              group.add(mesh);
            }
          }
        }
      }

      // Будуємо основні різнорівневі вокселі
      const levelGeos = {
        1: new THREE.BoxGeometry(voxelSize, levelHeights[1], voxelSize),
        2: new THREE.BoxGeometry(voxelSize, levelHeights[2], voxelSize),
        3: new THREE.BoxGeometry(voxelSize, levelHeights[3], voxelSize),
        4: new THREE.BoxGeometry(voxelSize, levelHeights[4], voxelSize)
      };

      for (let r = 0; r < MC_CONFIG.GRID_SIZE; r++) {
        for (let c = 0; c < MC_CONFIG.GRID_SIZE; c++) {
          const lvl = this.grid[r][c];
          if (lvl > 0) {
            const h = levelHeights[lvl] || 4.0;
            const geo = levelGeos[lvl];
            const mesh = new THREE.Mesh(geo, materials[lvl]);
            mesh.position.set(offset + c * voxelSize, h / 2, offset + r * voxelSize);
            group.add(mesh);
          }
        }
      }

      // Додаємо вушко для брелока (товсте, надійне для старого принтера)
      if (mountType === 'keychain') {
        const ringOuter = MC_CONFIG.KEYCHAIN_RING_OUTER;
        const ringInner = MC_CONFIG.KEYCHAIN_RING_INNER;
        const ringHeight = Math.max(3.5, basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET);

        const shape = new THREE.Shape();
        shape.absarc(0, 0, ringOuter, 0, Math.PI * 2, false);
        const hole = new THREE.Path();
        hole.absarc(0, 0, ringInner, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
          depth: ringHeight,
          bevelEnabled: false,
          curveSegments: MC_CONFIG.KEYCHAIN_SEGMENTS
        });
        extrudeGeo.rotateX(Math.PI / 2);

        const ringMesh = new THREE.Mesh(extrudeGeo, materials[1]);
        // Ставимо вушко у верхньому лівому або центральному верхньому краю, де є вокселі
        ringMesh.position.set(0, ringHeight, offset - voxelSize * 1.1);
        group.add(ringMesh);

        // Перемичка до основної фігури
        const bridgeGeo = new THREE.BoxGeometry(voxelSize * 3, ringHeight * 0.85, voxelSize * 2.5);
        const bridgeMesh = new THREE.Mesh(bridgeGeo, materials[1]);
        bridgeMesh.position.set(0, (ringHeight * 0.85) / 2, offset + voxelSize * 0.3);
        group.add(bridgeMesh);
      }

      // Якщо обрано плашку з ім'ям внизу
      if (customLabel.length > 0 || mountType === 'stand') {
        const labelText = customLabel.length > 0 ? customLabel : 'МАЙНКРАФТ';
        const charMatrices = window.VoxelFont.textToCharMatrices(labelText, 9);
        const px = Math.max(MC_CONFIG.LABEL_PIXEL_MIN, voxelSize * MC_CONFIG.LABEL_PIXEL_SCALE);
        const textWidth = charMatrices.length * 6 * px;
        const plateW = Math.max(totalWidth * 0.85, textWidth + 8);
        const plateD = 9 * px;
        const plateH = MC_CONFIG.LABEL_PLATE_HEIGHT;

        const plateZ = -offset + voxelSize * 0.8 + plateD / 2;

        const plateGeo = new THREE.BoxGeometry(plateW, plateH, plateD);
        const plateMesh = new THREE.Mesh(plateGeo, materials[1]);
        plateMesh.position.set(0, plateH / 2, plateZ);
        group.add(plateMesh);

        // Місток, що з'єднує фігурку з іменною табличкою
        const connectorGeo = new THREE.BoxGeometry(plateW * 0.65, plateH, voxelSize * 2.5);
        const connectorMesh = new THREE.Mesh(connectorGeo, materials[1]);
        connectorMesh.position.set(0, plateH / 2, plateZ - plateD / 2 - voxelSize * 0.5);
        group.add(connectorMesh);

        // Воксельні літери імені зверху на табличці
        const startX = -textWidth / 2 + px / 2;
        const startZ = plateZ - (7 * px) / 2 + px / 2;
        const letterH = MC_CONFIG.LABEL_LETTER_HEIGHT;
        const lGeo = new THREE.BoxGeometry(px, letterH, px);

        charMatrices.forEach((item, cIdx) => {
          const mat = item.matrix;
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 5; c++) {
              if (mat[r][c] === 1) {
                const lMesh = new THREE.Mesh(lGeo, materials[3]);
                lMesh.position.set(
                  startX + (cIdx * 6 + c) * px,
                  plateH + letterH / 2,
                  startZ + r * px
                );
                group.add(lMesh);
              }
            }
          }
        });
      }

      return group;
    }
  }

  window.MinecraftForgeGenerator = MinecraftForgeGenerator;
  window.MINECRAFT_PRESETS = PRESETS;
})();
