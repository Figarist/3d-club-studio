// Генератор 2: Магія Подвійного Тексту (3D Оптична Ілюзія / Перевертень з підтримкою Української Кирилиці та Іконок)
(function () {
  class DualIllusionGenerator {
    constructor() {
      this.presets = [
        { name: '👦 Ім\'я + BOSS', w1: 'МАКСИМ', w2: '★BOSS★' },
        { name: '⛏️ МАЙН + КРАФТ', w1: 'МАЙН!', w2: 'КРАФТ' },
        { name: '💀 КРІПЕР + ІКОНКИ', w1: 'КРІПЕР', w2: '⚔💀⛏♥👑★' },
        { name: '👧 СОФІЯ + ЗІРКА', w1: 'СОФІЯ', w2: '★PRO★' },
        { name: '🏆 ШКОЛА + ГЕРОЙ', w1: 'ГЕРОЙ', w2: '👑100👑' }
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
      const group = new THREE.Group();

      const word1 = params.word1 || 'МАКСИМ';
      const word2 = params.word2 || '★BOSS★';
      const voxelSize = parseFloat(params.voxelSize) || 2.6; // мм на 1 воксель літери
      const baseHeight = parseFloat(params.baseHeight) || 4.0; // мм висота платформи
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

      const charSpan = 6 * voxelSize; // 5 вокселів + 1 проміжок
      const letterBlockSize = 5 * voxelSize;

      // Будуємо кожну пару літер (Char1[i] перетинається з Char2[i] під кутом 90°)
      for (let i = 0; i < length; i++) {
        const m1 = window.VoxelFont.getCharMatrix(chars1[i]);
        const m2 = window.VoxelFont.getCharMatrix(chars2[i]);

        const charGroup = new THREE.Group();

        // 3D-масив зайнятості [yLevel 0..6][x 0..4][z 0..4], де yLevel 0 — самий низ, 6 — верх
        const grid3D = Array.from({ length: 7 }, () =>
          Array.from({ length: 5 }, () => Array(5).fill(0))
        );

        for (let row = 0; row < 7; row++) {
          const yLevel = 6 - row;
          let row1Active = [];
          let row2Active = [];

          for (let c = 0; c < 5; c++) {
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
          for (let y = 1; y < 7; y++) {
            for (let x = 0; x < 5; x++) {
              for (let z = 0; z < 5; z++) {
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
        for (let y = 0; y < 7; y++) {
          for (let x = 0; x < 5; x++) {
            for (let z = 0; z < 5; z++) {
              const cellType = grid3D[y][x][z];
              if (cellType === 1) {
                const geo = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
                const mesh = new THREE.Mesh(geo, y === 6 ? matAccent : matPrimary);
                mesh.position.set(
                  (x - 2) * voxelSize,
                  baseHeight + y * voxelSize + voxelSize / 2,
                  (z - 2) * voxelSize
                );
                charGroup.add(mesh);
              } else if (cellType === 2) {
                // Трохи тонший опорний стовпчик (80% ширини), щоб не заважав читанню літер, але тримав нависання!
                const sSize = voxelSize * 0.78;
                const geo = new THREE.BoxGeometry(sSize, voxelSize, sSize);
                const mesh = new THREE.Mesh(geo, matSupport);
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
        const padSize = letterBlockSize + voxelSize * 1.4;
        const padGeo = new THREE.BoxGeometry(padSize, baseHeight, padSize);
        const padMesh = new THREE.Mesh(padGeo, matBase);
        padMesh.position.set(0, baseHeight / 2, 0);
        charGroup.add(padMesh);

        // Золотий ободок навколо п'єдесталу літери
        const rimGeo = new THREE.BoxGeometry(padSize + 1.0, 1.4, padSize + 1.0);
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
        for (let i = 0; i < length - 1; i++) {
          const i1 = i - (length - 1) / 2;
          const i2 = i + 1 - (length - 1) / 2;

          const x1 = i1 * charSpan;
          const z1 = layoutMode === 'diagonal' ? -i1 * charSpan : 0;
          const x2 = i2 * charSpan;
          const z2 = layoutMode === 'diagonal' ? -i2 * charSpan : 0;

          const midX = (x1 + x2) / 2;
          const midZ = (z1 + z2) / 2;

          const bridgeW = letterBlockSize * 1.15;
          const bridgeGeo = new THREE.BoxGeometry(bridgeW, baseHeight * 0.9, bridgeW);
          const bridgeMesh = new THREE.Mesh(bridgeGeo, matBase);
          bridgeMesh.position.set(midX, (baseHeight * 0.9) / 2, midZ);
          group.add(bridgeMesh);
        }
      }

      return group;
    }
  }

  window.DualIllusionGenerator = DualIllusionGenerator;
})();
