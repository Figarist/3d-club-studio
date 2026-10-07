// Генератор 2: Магія Подвійного Тексту (3D Оптична Ілюзія / Перевертень з підтримкою Української Кирилиці та Іконок)
(function () {
  const IL_CONFIG = {
    DEFAULT_VOXEL_SIZE: 2.6,
    DEFAULT_BASE_HEIGHT: 4.0,
    SUPPORT_SCALE: 0.78,
    GRID_ROWS: 7,
    GRID_COLS: 5,
    CHAR_SPACING: 6,
    PAD_EXTRA: 1.4,
    RIM_HEIGHT: 1.4,
    RIM_EXTRA: 1.0
  };

  function rowsFromSpans(spans, width = 11) {
    return Object.freeze(spans.map((row) => {
      const cells = Array(width).fill('.');
      row.forEach(([start, end]) => {
        for (let column = start; column <= end; column += 1) cells[column] = '#';
      });
      return cells.join('');
    }));
  }

  function mirrorRows(rows) {
    return Object.freeze(rows.map((row) => Array.from(row).reverse().join('')));
  }

  const MOUNTAIN_BOAT_DIAGONAL = Object.freeze({
    front: rowsFromSpans([
      [[3, 3], [7, 7]], [[2, 4], [6, 8]], [[1, 4], [6, 9]], [[0, 10]],
      [[0, 10]], [[0, 10]], [[0, 10]], [[0, 10]], [[0, 10]], [[0, 10]], [[0, 10]]
    ]),
    side: rowsFromSpans([
      [[5, 5]], [[4, 5]], [[3, 5]], [[2, 5]], [[1, 5]], [[1, 6]],
      [[1, 7]], [[1, 8]], [[0, 9]], [[0, 10]], [[1, 9]]
    ]),
    spineX: 3,
    spineZ: 5
  });

  const MOUNTAIN_BOAT_LINE = Object.freeze({
    front: rowsFromSpans([
      [[4, 4], [8, 8]], [[3, 5], [7, 9]], [[2, 5], [7, 10]], [[1, 10]],
      [[0, 10]], [[0, 10]], [[0, 10]], [[0, 10]], [[0, 10]], [[0, 10]], [[0, 10]]
    ]),
    side: mirrorRows(MOUNTAIN_BOAT_DIAGONAL.side),
    spineX: 4,
    spineZ: 5
  });

  function authoredDesign(front, side, spineX = 5, spineZ = 5) {
    const frontRows = rowsFromSpans(front);
    const sideRows = rowsFromSpans(side);
    return Object.freeze({
      diagonal: Object.freeze({ front: frontRows, side: sideRows, spineX, spineZ }),
      line: Object.freeze({
        front: mirrorRows(frontRows),
        side: mirrorRows(sideRows),
        spineX: 10 - spineX,
        spineZ: 10 - spineZ
      })
    });
  }

  const IL_DESIGN_MASKS = Object.freeze({
    mountain_boat: Object.freeze({ diagonal: MOUNTAIN_BOAT_DIAGONAL, line: MOUNTAIN_BOAT_LINE }),
    pine_candle: authoredDesign(
      [[[5, 5]], [[4, 6]], [[4, 6]], [[3, 7]], [[3, 7]], [[2, 8]], [[2, 8]], [[1, 9]], [[1, 9]], [[0, 10]], [[0, 10]]],
      [[[3, 4]], [[3, 5]], [[4, 6]], [[4, 6]], [[4, 6]], [[4, 6]], [[3, 7]], [[3, 7]], [[3, 7]], [[2, 8]], [[2, 8]]],
      5, 4
    ),
    mushroom_kite: authoredDesign(
      [[[4, 6]], [[3, 7]], [[2, 8]], [[1, 9]], [[0, 10]], [[0, 10]], [[1, 9]], [[2, 8]], [[3, 7]], [[4, 6]], [[4, 6]]],
      [[[5, 6]], [[4, 7]], [[3, 8]], [[2, 9]], [[1, 10]], [[0, 10]], [[1, 10]], [[2, 9]], [[3, 8]], [[4, 7]], [[4, 6]]]
    ),
    rocket_key: authoredDesign(
      [[[5, 5]], [[4, 6]], [[3, 7]], [[3, 7]], [[3, 7]], [[3, 7]], [[2, 8]], [[1, 9]], [[0, 10]], [[0, 10]], [[1, 9]]],
      [[[2, 6]], [[1, 7]], [[1, 8]], [[2, 8]], [[3, 7]], [[4, 6]], [[4, 6]], [[4, 6]], [[4, 6]], [[3, 7]], [[3, 7]]]
    ),
    coral_lighthouse: authoredDesign(
      [[[1, 2], [5, 5], [8, 10]], [[1, 3], [4, 6], [7, 9]], [[1, 4], [5, 5], [6, 9]], [[2, 8]], [[2, 8]], [[1, 9]], [[1, 9]], [[0, 10]], [[0, 10]], [[1, 9]], [[1, 9]]],
      [[[5, 5]], [[4, 6]], [[4, 6]], [[3, 7]], [[3, 7]], [[3, 7]], [[2, 8]], [[2, 8]], [[1, 9]], [[1, 9]], [[0, 10]]]
    ),
    moon_arch: authoredDesign(
      [[[0, 2], [8, 10]], [[0, 3], [7, 10]], [[0, 4], [6, 10]], [[0, 10]], [[0, 10]], [[1, 9]], [[1, 8]], [[1, 7]], [[1, 7]], [[1, 8]], [[1, 9]]],
      [[[5, 5]], [[4, 6]], [[3, 7]], [[2, 8]], [[1, 8]], [[1, 8]], [[2, 8]], [[3, 7]], [[4, 6]], [[4, 6]], [[3, 7]]],
      1, 5
    ),
    leaf_vane: authoredDesign(
      [[[4, 6]], [[3, 7]], [[2, 7]], [[1, 7]], [[1, 8]], [[1, 9]], [[2, 10]], [[3, 10]], [[4, 10]], [[5, 10]], [[6, 10]]],
      [[[5, 5]], [[4, 6]], [[3, 7]], [[2, 8]], [[1, 9]], [[1, 9]], [[2, 8]], [[3, 7]], [[4, 6]], [[4, 6]], [[3, 7]]],
      6, 5
    ),
    wave_tower: authoredDesign(
      [[[2, 4], [7, 8]], [[1, 4], [6, 9]], [[0, 10]], [[1, 9]], [[2, 8]], [[3, 7]], [[3, 7]], [[2, 8]], [[1, 9]], [[0, 10]], [[0, 10]]],
      [[[4, 6]], [[3, 7]], [[2, 8]], [[1, 9]], [[1, 9]], [[2, 8]], [[3, 7]], [[4, 6]], [[4, 6]], [[3, 7]], [[2, 8]]],
      3, 5
    )
  });
  const IL_SUPPORTED_DESIGN_KEYS = Object.freeze([
    'classic', 'mountain_boat', 'pine_candle', 'mushroom_kite', 'rocket_key',
    'coral_lighthouse', 'moon_arch', 'leaf_vane', 'wave_tower'
  ]);

  function rowsToMatrix(rows) {
    return rows.map((row) => Array.from(row, (cell) => cell === '#' ? 1 : 0));
  }

  function activeColumns(row) {
    const active = [];
    row.forEach((cell, column) => {
      if (cell === 1) active.push(column);
    });
    return active;
  }

  function activeRuns(row) {
    const runs = [];
    let start = -1;
    row.forEach((cell, column) => {
      if (cell === 1 && start < 0) start = column;
      if (cell === 0 && start >= 0) {
        runs.push([start, column - 1]);
        start = -1;
      }
    });
    if (start >= 0) runs.push([start, row.length - 1]);
    return runs;
  }

  function assertMaskRows(rows, label) {
    if (!Array.isArray(rows) || rows.length !== 11 || rows.some((row) => row.length !== 11 || !/^[.#]{11}$/.test(row))) {
      throw new Error('Optical design mask must be an 11 by 11 authored silhouette: ' + label);
    }
    for (let row = 0; row < rows.length - 1; row += 1) {
      const current = Array.from(rows[row]).flatMap((cell, column) => cell === '#' ? [column] : []);
      const next = Array.from(rows[row + 1]).flatMap((cell, column) => cell === '#' ? [column] : []);
      if (!current.length || !next.length || Math.abs(current[0] - next[0]) > 1 ||
          Math.abs(current[current.length - 1] - next[next.length - 1]) > 1 ||
          !current.some((column) => next.includes(column))) {
        throw new Error('Optical design rows need an overlapping, one-cell taper: ' + label + ' row ' + row);
      }
    }
  }

  function assertProjection(grid, frontRows, sideRows) {
    const rowCount = frontRows.length;
    const xCount = frontRows[0].length;
    const zCount = sideRows[0].length;
    for (let row = 0; row < rowCount; row += 1) {
      const y = rowCount - 1 - row;
      const projectedFront = Array.from({ length: xCount }, (_, x) =>
        grid[y][x].some((cell) => cell > 0) ? '#' : '.').join('');
      const projectedSide = Array.from({ length: zCount }, (_, z) =>
        grid[y].some((xRow) => xRow[z] > 0) ? '#' : '.').join('');
      if (projectedFront !== frontRows[row] || projectedSide !== sideRows[row]) {
        throw new Error('Optical design support changed an authored projection.');
      }
    }
  }

  function assertConnected(grid) {
    const height = grid.length;
    const width = grid[0].length;
    const depth = grid[0][0].length;
    let first = null;
    let occupiedCount = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        for (let z = 0; z < depth; z += 1) {
          if (grid[y][x][z] > 0) {
            occupiedCount += 1;
            if (!first) first = [y, x, z];
          }
        }
      }
    }

    const queue = [first];
    const visited = new Set([first.join(':')]);
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const [y, x, z] = queue[cursor];
      [[y - 1, x, z], [y + 1, x, z], [y, x - 1, z], [y, x + 1, z], [y, x, z - 1], [y, x, z + 1]]
        .forEach(([nextY, nextX, nextZ]) => {
          if (nextY < 0 || nextY >= height || nextX < 0 || nextX >= width || nextZ < 0 || nextZ >= depth ||
              grid[nextY][nextX][nextZ] === 0) return;
          const key = nextY + ':' + nextX + ':' + nextZ;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push([nextY, nextX, nextZ]);
          }
        });
    }
    if (visited.size !== occupiedCount) throw new Error('Optical design contains disconnected voxel components.');
  }

  function buildMaskDesign(params, mask) {
    const group = new THREE.Group();
    const frontRows = rowsToMatrix(mask.front);
    const sideRows = rowsToMatrix(mask.side);
    const rowCount = frontRows.length;
    const xCount = frontRows[0].length;
    const zCount = sideRows[0].length;
    const voxelSizeValue = parseFloat(params.voxelSize);
    const baseHeightValue = parseFloat(params.baseHeight);
    const voxelSize = Number.isFinite(voxelSizeValue) && voxelSizeValue > 0 ? voxelSizeValue : IL_CONFIG.DEFAULT_VOXEL_SIZE;
    const baseHeight = Number.isFinite(baseHeightValue) && baseHeightValue > 0 ? baseHeightValue : IL_CONFIG.DEFAULT_BASE_HEIGHT;
    const safeSupports = params.safeSupports !== false;
    const grid = Array.from({ length: rowCount }, () =>
      Array.from({ length: xCount }, () => Array(zCount).fill(0))
    );

    assertMaskRows(mask.front, 'front');
    assertMaskRows(mask.side, 'side');
    for (let row = 0; row < rowCount; row += 1) {
      const y = rowCount - 1 - row;
      const xs = activeColumns(frontRows[row]);
      const zs = activeColumns(sideRows[row]);
      xs.forEach((x) => zs.forEach((z) => { grid[y][x][z] = 1; }));
    }

    // The two silhouettes share a continuous voxel column. Each authored row
    // changes its outer edge by one cell, so no broad downward fill is needed;
    // that fill widened the projections and made the earlier design look like towers.
    if (safeSupports) {
      for (let y = 0; y < rowCount; y += 1) {
        if (grid[y][mask.spineX][mask.spineZ] === 0) {
          throw new Error('Optical design is missing its shared print spine.');
        }
        grid[y][mask.spineX][mask.spineZ] = 2;
      }
    }
    assertProjection(grid, mask.front, mask.side);
    assertConnected(grid);

    const matPrimary = new THREE.MeshStandardMaterial({ color: params.colorPrimary || 0x10b981, roughness: 0.4, metalness: 0.1 });
    const matAccent = new THREE.MeshStandardMaterial({ color: params.colorAccent || 0xf59e0b, roughness: 0.45, metalness: 0.1 });
    const matBase = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.1 });
    const centerX = (xCount - 1) / 2;
    const centerZ = (zCount - 1) / 2;

    const bottomMaskRow = rowCount - 1;
    const baseXRuns = activeRuns(frontRows[bottomMaskRow]);
    const baseZRuns = activeRuns(sideRows[bottomMaskRow]);
    baseXRuns.forEach(([xStart, xEnd]) => baseZRuns.forEach(([zStart, zEnd]) => {
      const width = (xEnd - xStart + 1) * voxelSize;
      const depth = (zEnd - zStart + 1) * voxelSize;
      const tile = new THREE.Mesh(new THREE.BoxGeometry(width, baseHeight, depth), matBase);
      tile.position.set(((xStart + xEnd) / 2 - centerX) * voxelSize, baseHeight / 2,
        ((zStart + zEnd) / 2 - centerZ) * voxelSize);
      group.add(tile);
    }));

    for (let y = 0; y < rowCount; y += 1) {
      const maskRow = rowCount - 1 - y;
      const xRuns = activeRuns(frontRows[maskRow]);
      const zRuns = activeRuns(sideRows[maskRow]);
      xRuns.forEach(([xStart, xEnd]) => zRuns.forEach(([zStart, zEnd]) => {
        const width = (xEnd - xStart + 1) * voxelSize;
        const depth = (zEnd - zStart + 1) * voxelSize;
        // A small vertical overlap joins neighboring rows and the base despite
        // floating-point placement at millimeter-scale boundaries.
        const geo = new THREE.BoxGeometry(width, voxelSize + 0.05, depth);
        const mesh = new THREE.Mesh(geo, y === rowCount - 1 ? matAccent : matPrimary);
        mesh.position.set(((xStart + xEnd) / 2 - centerX) * voxelSize,
          baseHeight + y * voxelSize + voxelSize / 2,
          ((zStart + zEnd) / 2 - centerZ) * voxelSize);
        group.add(mesh);
      }));
    }

    return group;
  }

  class DualIllusionGenerator {
    constructor() {
      this.presets = [
        { name: '⚡ Короткий знак (3D ↔ ★!)', w1: '3D', w2: '★!', voxelSize: 2.2 },
        { name: '🔮 Секретний шифр (ОК ↔ ⚔👑)', w1: 'ОК', w2: '⚔👑', voxelSize: 2.2 },
        { name: '👦 Ім\'я + BOSS', w1: 'МАКСИМ', w2: '★BOSS★', voxelSize: 2.6 },
        { name: '⛏️ МАЙН + КРАФТ', w1: 'МАЙН!', w2: 'КРАФТ', voxelSize: 2.6 },
        { name: '💀 КРІПЕР + ІКОНКИ', w1: 'КРІПЕР', w2: '⚔💀⛏♥👑★', voxelSize: 2.6 },
        { name: '👧 СОФІЯ + ЗІРКА', w1: 'СОФІЯ', w2: '★PRO★', voxelSize: 2.6 }
      ];
    }

    // Доповнює коротше слово симетричними символами (наприклад, зірками або мечами), щоб довжини збігалися
    equalizeWords(str1, str2, padChar = '★') {
      const a1 = Array.from((str1 || 'МАЙН').trim().toUpperCase().replace(/\s+/g, '-')).slice(0, 9);
      const a2 = Array.from((str2 || 'КРАФТ').trim().toUpperCase().replace(/\s+/g, '-')).slice(0, 9);

      if (a1.length === 0) a1.push('А');
      if (a2.length === 0) a2.push('Б');

      const maxLen = Math.max(a1.length, a2.length);

      while (a1.length < maxLen) {
        if (a1.length % 2 === 0) a1.push(padChar);
        else a1.unshift(padChar);
      }
      while (a2.length < maxLen) {
        if (a2.length % 2 === 0) a2.push(padChar);
        else a2.unshift(padChar);
      }

      return { chars1: a1, chars2: a2, length: maxLen };
    }

    build3D(params) {
      params = params || {};
      const design = IL_DESIGN_MASKS[params.design];
      if (design) {
        return buildMaskDesign(params, design[params.layoutMode === 'line' ? 'line' : 'diagonal']);
      }

      const group = new THREE.Group();

      const word1 = params.word1 || 'МАКСИМ';
      const word2 = params.word2 || '★BOSS★';
      const voxelSize = parseFloat(params.voxelSize) || IL_CONFIG.DEFAULT_VOXEL_SIZE; // мм на 1 воксель літери
      const baseHeight = parseFloat(params.baseHeight) || IL_CONFIG.DEFAULT_BASE_HEIGHT; // мм висота платформи
      const safeSupports = params.safeSupports !== false;
      const layoutMode = params.layoutMode || 'diagonal'; // 'diagonal' або 'line'

      const { chars1, chars2, length } = this.equalizeWords(word1, word2, params.padSymbol || '★');

      const matPrimary = new THREE.MeshStandardMaterial({
        color: params.colorPrimary || 0x10b981,
        roughness: 0.32,
        metalness: 0.2
      });

      const matAccent = new THREE.MeshStandardMaterial({
        color: params.colorAccent || 0xf59e0b,
        roughness: 0.4,
        metalness: 0.25
      });

      const matSupport = new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.55,
        metalness: 0.1
      });

      const matBase = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6,
        metalness: 0.15
      });

      const charSpan = IL_CONFIG.CHAR_SPACING * voxelSize; // 5 вокселів + 1 проміжок
      const letterBlockSize = IL_CONFIG.GRID_COLS * voxelSize;

      const voxelGeo = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
      const sSize = voxelSize * IL_CONFIG.SUPPORT_SCALE;
      const supportGeo = new THREE.BoxGeometry(sSize, voxelSize, sSize);
      const padSize = letterBlockSize + voxelSize * IL_CONFIG.PAD_EXTRA;
      const padGeo = new THREE.BoxGeometry(padSize, baseHeight, padSize);
      const rimGeo = new THREE.BoxGeometry(padSize + IL_CONFIG.RIM_EXTRA, IL_CONFIG.RIM_HEIGHT, padSize + IL_CONFIG.RIM_EXTRA);

      // Будуємо кожну пару літер (Char1[i] перетинається з Char2[i] під кутом 90°)
      for (let i = 0; i < length; i++) {
        const m1 = window.VoxelFont.getCharMatrix(chars1[i]);
        const m2 = window.VoxelFont.getCharMatrix(chars2[i]);

        const charGroup = new THREE.Group();

        // 3D-масив зайнятості [yLevel 0..6][x 0..4][z 0..4], де yLevel 0 — самий низ, 6 — верх
        const grid3D = Array.from({ length: IL_CONFIG.GRID_ROWS }, () =>
          Array.from({ length: IL_CONFIG.GRID_COLS }, () => Array(IL_CONFIG.GRID_COLS).fill(0))
        );

        for (let row = 0; row < IL_CONFIG.GRID_ROWS; row++) {
          const yLevel = 6 - row;
          let row1Active = [];
          let row2Active = [];

          for (let c = 0; c < IL_CONFIG.GRID_COLS; c++) {
            if (m1[row][c] === 1) row1Active.push(c);
            if (m2[row][c] === 1) row2Active.push(c);
          }

          if (row1Active.length === 0) row1Active.push(2);
          if (row2Active.length === 0) row2Active.push(2);

          for (const x of row1Active) {
            for (const z of row2Active) {
              grid3D[yLevel][x][z] = 1;
            }
          }
        }

        // Якщо увімкнено "Бронебійний друк без підтримок":
        // Перевіряємо знизу вгору (yLevel = 1..6), щоб кожен воксель мав опору знизу або під кутом 45°
        if (safeSupports) {
          for (let y = 1; y < IL_CONFIG.GRID_ROWS; y++) {
            for (let x = 0; x < IL_CONFIG.GRID_COLS; x++) {
              for (let z = 0; z < IL_CONFIG.GRID_COLS; z++) {
                if (grid3D[y][x][z] > 0) {
                  // Чи є опора прямо під ним у (x, y-1, z)?
                  if (grid3D[y - 1][x][z] === 0) {
                    // Додаємо опорний стовпчик вниз до бази або найближчого нижнього блоку
                    for (let sy = y - 1; sy >= 0; sy--) {
                      if (grid3D[sy][x][z] === 0) {
                        grid3D[sy][x][z] = 2; // 2 = допоміжна внутрішня опора
                      } else {
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Створюємо меші вокселів для поточної 3D-літери
        for (let y = 0; y < IL_CONFIG.GRID_ROWS; y++) {
          for (let x = 0; x < IL_CONFIG.GRID_COLS; x++) {
            for (let z = 0; z < IL_CONFIG.GRID_COLS; z++) {
              const cellType = grid3D[y][x][z];
              if (cellType === 1) {
                const mesh = new THREE.Mesh(voxelGeo, y === 6 ? matAccent : matPrimary);
                mesh.position.set(
                  (x - 2) * voxelSize,
                  baseHeight + y * voxelSize + voxelSize / 2,
                  (z - 2) * voxelSize
                );
                charGroup.add(mesh);
              } else if (cellType === 2) {
                // Трохи тонший опорний стовпчик (80% ширини), щоб не заважав читанню літер, але тримав нависання!
                const mesh = new THREE.Mesh(supportGeo, matSupport);
                mesh.position.set(
                  (x - 2) * voxelSize,
                  baseHeight + y * voxelSize + voxelSize / 2,
                  (z - 2) * voxelSize
                );
                charGroup.add(mesh);
              }
            }
          }
        }

        // Індивідуальна сходинка-п'єдестал під кожною 3D-літерою
        const padMesh = new THREE.Mesh(padGeo, matBase);
        padMesh.position.set(0, baseHeight / 2, 0);
        charGroup.add(padMesh);

        // Золотий ободок навколо п'єдесталу літери
        const rimMesh = new THREE.Mesh(rimGeo, matAccent);
        rimMesh.position.set(0, 0.7, 0);
        charGroup.add(rimMesh);

        // Розташування літер:
        // У режимі 'diagonal' літери стоять по діагоналі (X та Z зростають одночасно),
        // тому ні спереду (по осі Z), ні збоку (по осі X) літери НЕ перекривають одна одну!
        const idxOffset = i - (length - 1) / 2;
        if (layoutMode === 'diagonal') {
          charGroup.position.set(idxOffset * charSpan, 0, -idxOffset * charSpan);
        } else {
          charGroup.position.set(idxOffset * charSpan, 0, 0);
        }

        group.add(charGroup);
      }

      // З'єднуємо всі п'єдестали літер єдиною міцною монолітною балкою знизу, щоб модель була одним цілим!
      if (length > 1) {
        const bridgeW = letterBlockSize * 1.15;
        const bridgeGeo = new THREE.BoxGeometry(bridgeW, baseHeight * 0.9, bridgeW);
        for (let i = 0; i < length - 1; i++) {
          const i1 = i - (length - 1) / 2;
          const i2 = i + 1 - (length - 1) / 2;

          const x1 = i1 * charSpan;
          const z1 = layoutMode === 'diagonal' ? -i1 * charSpan : 0;
          const x2 = i2 * charSpan;
          const z2 = layoutMode === 'diagonal' ? -i2 * charSpan : 0;

          const midX = (x1 + x2) / 2;
          const midZ = (z1 + z2) / 2;

          const bridgeMesh = new THREE.Mesh(bridgeGeo, matBase);
          bridgeMesh.position.set(midX, (baseHeight * 0.9) / 2, midZ);
          group.add(bridgeMesh);
        }
      }

      return group;
    }
  }

  DualIllusionGenerator.supportedDesignKeys = IL_SUPPORTED_DESIGN_KEYS;
  window.DualIllusionGenerator = DualIllusionGenerator;
})();
