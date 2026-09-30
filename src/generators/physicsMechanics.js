// Генератор 3: Фізика без Шестерень — Монолітна Пружинна Катапульта та Гравітаційний Балансир (100% друк на старому принтері)
(function () {
  class PhysicsMechanicsGenerator {
    constructor() {
      this.activeAnim = null;
    }

    build3D(params) {
      const submode = params.submode || 'catapult'; // 'catapult' або 'balancer'
      if (submode === 'balancer') {
        return this.buildBalancer(params);
      }
      return this.buildCatapult(params);
    }

    // =========================================================================
    // ПІДРЕЖИМ А: МОНОЛІТНА ПРУЖИННА МІНІ-КАТАПУЛЬТА (ДРУКУЄТЬСЯ ПЛАСКО НА БОЦІ!)
    // =========================================================================
    // Примітка: Для 100% міцності пружної ресори на FDM-принтері катапульта лежить пласко на столі (висота по Y в Three.js = товщина екструзії 10..14 мм).
    // Тоді волокна пластику йдуть вздовж дуги пружини і ніколи не ламаються!
    buildCatapult(params) {
      const group = new THREE.Group();

      const extrudeHeight = parseFloat(params.extrudeHeight) || 11.0; // Ширина катапульти (висота друку по Z), мм
      const springThickness = parseFloat(params.springThickness) || 2.4; // Товщина пластикової ресори, мм
      const armLength = parseFloat(params.armLength) || 68.0; // Довжина важеля, мм
      const includeAmmo = params.includeAmmo !== false;
      const customText = (params.customText || 'ТАНК').trim();

      const matBody = new THREE.MeshStandardMaterial({
        color: params.colorPrimary || 0x10b981,
        roughness: 0.38,
        metalness: 0.15
      });

      const matSpring = new THREE.MeshStandardMaterial({
        color: params.colorAccent || 0xf59e0b,
        roughness: 0.32,
        metalness: 0.2
      });

      const matAmmo = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.4,
        metalness: 0.1
      });

      // 1. Нижня масивна станина (основа катапульти, лежить у площині X-Z, висота = extrudeHeight)
      // У вигляді збоку (в площині X-Z):
      // X від -40 до +35 мм (довжина основи), Z від +18 до +26 мм (нижня підошва станини)
      const baseLen = 76;
      const baseThick = 8.5;
      const baseGeo = new THREE.BoxGeometry(baseLen, extrudeHeight, baseThick);
      const baseMesh = new THREE.Mesh(baseGeo, matBody);
      baseMesh.position.set(0, extrudeHeight / 2, 22);
      group.add(baseMesh);

      // 2. Передня та задня опорні лапки (щоб катапульта впевнено стояла на парті, коли її перевернуть після друку)
      const frontFootGeo = new THREE.BoxGeometry(14, extrudeHeight, 14);
      const frontFoot = new THREE.Mesh(frontFootGeo, matBody);
      frontFoot.position.set(-32, extrudeHeight / 2, 22);
      group.add(frontFoot);

      const backFootGeo = new THREE.BoxGeometry(14, extrudeHeight, 12);
      const backFoot = new THREE.Mesh(backFootGeo, matBody);
      backFoot.position.set(32, extrudeHeight / 2, 22);
      group.add(backFoot);

      // 3. Передній стоппер-арка (обмежує хід ложки, щоб снаряд вилітав уперед під 45°)
      // Піднімається від передньої частини основи вгору (у бік -Z)
      const pillarGeo = new THREE.BoxGeometry(8.5, extrudeHeight, 30);
      const pillarMesh = new THREE.Mesh(pillarGeo, matBody);
      pillarMesh.position.set(-22, extrudeHeight / 2, 7);
      pillarMesh.rotation.y = -0.22;
      group.add(pillarMesh);

      // Підкіс під стоппер для жорсткості
      const braceGeo = new THREE.BoxGeometry(7, extrudeHeight, 24);
      const braceMesh = new THREE.Mesh(braceGeo, matBody);
      braceMesh.position.set(-13, extrudeHeight / 2, 11);
      braceMesh.rotation.y = 0.55;
      group.add(braceMesh);

      // 4. Гнучка C-подібна монолітна ресора (Compliant Spring) з ВЕЛИЧЕЗНИМ зазором (12 мм внутрішній радіус!),
      // який гарантовано друкується без злипання навіть на старому розкаліброваному принтері!
      const springInnerR = 11.5;
      const springOuterR = springInnerR + springThickness;

      const springShape = new THREE.Shape();
      // Зовнішня дуга C-пружини (від -75° до +115°)
      const startAngle = -Math.PI * 0.42;
      const endAngle = Math.PI * 0.68;
      springShape.absarc(0, 0, springOuterR, startAngle, endAngle, false);
      springShape.absarc(0, 0, springInnerR, endAngle, startAngle, true);
      springShape.closePath();

      const springGeo = new THREE.ExtrudeGeometry(springShape, {
        depth: extrudeHeight,
        bevelEnabled: false,
        curveSegments: 32
      });
      springGeo.rotateX(Math.PI / 2);

      const springMesh = new THREE.Mesh(springGeo, matSpring);
      // Центр дуги пружини знаходиться справа (X = +26, Z = +7)
      springMesh.position.set(25, extrudeHeight, 7);
      group.add(springMesh);

      // З'єднувальний блок від низу пружини до задньої частини основи
      const springAnchorGeo = new THREE.BoxGeometry(14, extrudeHeight, 10);
      const springAnchor = new THREE.Mesh(springAnchorGeo, matSpring);
      springAnchor.position.set(29, extrudeHeight / 2, 17);
      group.add(springAnchor);

      // 5. Рухомий важіль із кошиком-ложкою для снаряда (прикріплений до верхнього кінця C-пружини)
      // Будуємо в окремій групі pivotGroup, щоб під час демонстрації на екрані він реально згинався і стріляв!
      const armPivotGroup = new THREE.Group();
      armPivotGroup.position.set(25, 0, 7);
      armPivotGroup.name = 'catapultArmPivot';

      // Сам важіль тягнеться вліво-вгору (від пружини до кошика)
      const armBarGeo = new THREE.BoxGeometry(armLength, extrudeHeight, Math.max(4.0, springThickness * 1.45));
      const armBar = new THREE.Mesh(armBarGeo, matSpring);
      armBar.position.set(-armLength / 2 + 2, extrudeHeight / 2, -springInnerR - springThickness * 0.5);
      armBar.rotation.y = 0.22;
      armPivotGroup.add(armBar);

      // Глибокий кошик (ложка) на кінці важеля для кульки або блоку TNT
      const bucketX = -armLength + 4;
      const bucketZ = -springInnerR - 11;

      const bucketBackGeo = new THREE.BoxGeometry(5.5, extrudeHeight, 16);
      const bucketBack = new THREE.Mesh(bucketBackGeo, matBody);
      bucketBack.position.set(bucketX - 6, extrudeHeight / 2, bucketZ - 4);
      bucketBack.rotation.y = -0.35;
      armPivotGroup.add(bucketBack);

      const bucketBottomGeo = new THREE.BoxGeometry(16, extrudeHeight, 5.5);
      const bucketBottom = new THREE.Mesh(bucketBottomGeo, matBody);
      bucketBottom.position.set(bucketX + 1, extrudeHeight / 2, bucketZ + 2);
      bucketBottom.rotation.y = 0.22;
      armPivotGroup.add(bucketBottom);

      const bucketLipGeo = new THREE.BoxGeometry(5.0, extrudeHeight, 10);
      const bucketLip = new THREE.Mesh(bucketLipGeo, matBody);
      bucketLip.position.set(bucketX + 8, extrudeHeight / 2, bucketZ - 2);
      armPivotGroup.add(bucketLip);

      // Натискний язичок для пальця за кошиком
      const triggerGeo = new THREE.BoxGeometry(12, extrudeHeight, 4.5);
      const triggerMesh = new THREE.Mesh(triggerGeo, matSpring);
      triggerMesh.position.set(bucketX - 11, extrudeHeight / 2, bucketZ + 3);
      triggerMesh.rotation.y = 0.45;
      armPivotGroup.add(triggerMesh);

      group.add(armPivotGroup);

      // 6. Об'ємний напис імені учня на верхній грані основи (друкується ідеально чітко останніми шарами!)
      if (customText.length > 0) {
        const chars = window.VoxelFont.textToCharMatrices(customText, 6);
        const px = 1.45;
        const textH = 1.6;
        const totalW = chars.length * 6 * px;
        const startX = -totalW / 2;
        const startZ = 22 - (7 * px) / 2;

        chars.forEach((item, idx) => {
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 5; c++) {
              if (item.matrix[r][c] === 1) {
                const lGeo = new THREE.BoxGeometry(px, textH, px);
                const lMesh = new THREE.Mesh(lGeo, matSpring);
                lMesh.position.set(
                  startX + (idx * 6 + c) * px,
                  extrudeHeight + textH / 2,
                  startZ + r * px
                );
                group.add(lMesh);
              }
            }
          }
        });
      }

      // 7. Опціональний міні-снаряд (Кубик TNT 9x9x9 мм), який друкується поруч на столі
      if (includeAmmo) {
        const ammoSize = 9.0;
        const ammoGeo = new THREE.BoxGeometry(ammoSize, ammoSize, ammoSize);
        const ammoMesh = new THREE.Mesh(ammoGeo, matAmmo);
        ammoMesh.position.set(0, ammoSize / 2, 38);
        group.add(ammoMesh);

        // Біла смужка "TNT" посередині кубика
        const bandGeo = new THREE.BoxGeometry(ammoSize + 0.6, 3.2, ammoSize + 0.6);
        const bandMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
        const bandMesh = new THREE.Mesh(bandGeo, bandMat);
        bandMesh.position.set(0, ammoSize / 2, 38);
        group.add(bandMesh);
      }

      return group;
    }

    // =========================================================================
    // ПІДРЕЖИМ Б: ГРАВІТАЦІЙНИЙ БАЛАНСИР «МАГІЧНА РІВНОВАГА»
    // =========================================================================
    // Фігурка має винесені вперед важкі кінці крил, тому центр ваги (Center of Mass)
    // знаходиться точно під гострим носиком опори (X = 0, Z = 0).
    // Друкується абсолютно пласко за 20 хвилин, 0 рухомих деталей, 100% ВАУ-ефект!
    buildBalancer(params) {
      const group = new THREE.Group();

      const thickness = parseFloat(params.extrudeHeight) || 6.0; // Товщина пластини, мм
      const wingWeight = parseFloat(params.wingWeight) || 10.0;  // Товщина баласту на кінцях крил, мм
      const spanScale = (parseFloat(params.armLength) || 70.0) / 70.0; // Масштаб розмаху крил
      const includeStand = params.includeAmmo !== false; // Пірамідка-п'єдестал у комплекті

      const matBody = new THREE.MeshStandardMaterial({
        color: params.colorPrimary || 0x8b5cf6,
        roughness: 0.35,
        metalness: 0.2
      });

      const matWeights = new THREE.MeshStandardMaterial({
        color: params.colorAccent || 0xf59e0b,
        roughness: 0.28,
        metalness: 0.35
      });

      // Воксельна матриця Дракона-Балансира (симетрична, 19 стовпчиків x 15 рядків)
      // Рядок 6 у центрі (col 9) — це ТОЧКА ОПОРИ (кінчик носа дракона)!
      // Крила (рядки 0..5) виступають ВПЕРЕД за ніс, а тіло й хвіст (рядки 6..14) йдуть назад.
      // Символи: '.' = порожньо, '1' = тіло/крила, '2' = баластні обтяжувачі на кінцях крил, '3' = точка опори (ніс)
      const pattern = [
        '222.............222',
        '2221...........1222',
        '22211.........11222',
        '.22111.......11122.',
        '..11111.....11111..',
        '...11111...11111...',
        '....11111311111....',
        '.....111111111.....',
        '.......11111.......',
        '........111........',
        '........111........',
        '........111........',
        '.......11111.......',
        '......11...11......',
        '.....1.......1.....'
      ];

      const balancerGroup = new THREE.Group();
      balancerGroup.name = 'balancerBodyGroup';

      const vx = 4.5 * spanScale; // розмір клітинки, мм
      const pivotRow = 6;
      const pivotCol = 9;

      for (let r = 0; r < pattern.length; r++) {
        const rowStr = pattern[r];
        for (let c = 0; c < rowStr.length; c++) {
          const ch = rowStr[c];
          if (ch === '.') continue;

          const isWeight = ch === '2';
          const isNose = ch === '3';
          const h = isWeight ? wingWeight : thickness;

          const geo = new THREE.BoxGeometry(vx * 1.02, h, vx * 1.02);
          const mat = isWeight || isNose ? matWeights : matBody;
          const mesh = new THREE.Mesh(geo, mat);

          const x = (c - pivotCol) * vx;
          const z = (r - pivotRow) * vx;
          mesh.position.set(x, h / 2, z);
          balancerGroup.add(mesh);
        }
      }

      // Додаємо знизу під носиком (r=6, c=9) невеликий центруючий конус-виступ (висотою 2 мм на верхній стороні),
      // щоб фігурка не зісковзувала з пальця або пірамідки!
      const nibGeo = new THREE.ConeGeometry(vx * 0.65, 3.0, 12);
      const nibMesh = new THREE.Mesh(nibGeo, matWeights);
      nibMesh.position.set(0, thickness + 1.5, 0);
      balancerGroup.add(nibMesh);

      group.add(balancerGroup);

      // Якщо увімкнено "Пірамідка-П'єдестал у комплекті" — ставимо її поруч для друку
      if (includeStand) {
        const standGroup = new THREE.Group();
        const steps = 6;
        for (let s = 0; s < steps; s++) {
          const w = 22 - s * 3.2;
          const stepH = 4.5;
          const sGeo = new THREE.BoxGeometry(w, stepH, w);
          const sMesh = new THREE.Mesh(sGeo, s === steps - 1 ? matWeights : matBody);
          sMesh.position.set(0, s * stepH + stepH / 2, 48);
          standGroup.add(sMesh);
        }
        group.add(standGroup);
      }

      return group;
    }

    // Інтерактивна демонстрація пострілу катапульти або балансування прямо на екрані!
    triggerInteractiveDemo(sceneManager, submode) {
      if (!sceneManager) return;

      if (submode === 'balancer') {
        if (window.StudioSound) window.StudioSound.playMagicGenerate();
        const balancer = sceneManager.modelGroup.getObjectByName('balancerBodyGroup');
        if (!balancer) return;

        let elapsed = 0;
        sceneManager.physicsUpdateFn = (dt) => {
          elapsed += dt;
          if (elapsed > 4.5) {
            balancer.rotation.set(0, 0, 0);
            sceneManager.physicsUpdateFn = null;
            return;
          }
          const damp = Math.exp(-elapsed * 0.6);
          balancer.rotation.x = Math.sin(elapsed * 5.5) * 0.22 * damp;
          balancer.rotation.z = Math.cos(elapsed * 4.2) * 0.18 * damp;
        };
        return;
      }

      // Постріл катапульти!
      if (window.StudioSound) window.StudioSound.playCatapultLaunch();

      const armPivot = sceneManager.modelGroup.getObjectByName('catapultArmPivot');
      while (sceneManager.effectsGroup.children.length > 0) {
        sceneManager.effectsGroup.remove(sceneManager.effectsGroup.children[0]);
      }

      // Створюємо снаряд для польоту на екрані (не експортується в .STL)
      const projGeo = new THREE.BoxGeometry(8, 8, 8);
      const projMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 0.4
      });
      const projMesh = new THREE.Mesh(projGeo, projMat);
      projMesh.userData.exportable = false;
      sceneManager.effectsGroup.add(projMesh);

      let t = 0;
      const startPos = new THREE.Vector3(-35, 14, -12);
      const vel = new THREE.Vector3(-55, 95, -85);

      sceneManager.physicsUpdateFn = (dt) => {
        t += dt;
        if (armPivot) {
          if (t < 0.12) {
            // Відтягування важеля назад
            armPivot.rotation.y = -(t / 0.12) * 0.38;
          } else if (t < 0.24) {
            // Різкий удар вперед!
            armPivot.rotation.y = -0.38 + ((t - 0.12) / 0.12) * 0.52;
          } else {
            // Затухаючі коливання пружини
            const springTime = t - 0.24;
            armPivot.rotation.y = Math.sin(springTime * 28) * 0.14 * Math.exp(-springTime * 6);
          }
        }

        if (t < 0.18) {
          projMesh.position.copy(startPos);
        } else {
          const ft = (t - 0.18) * 1.6;
          projMesh.position.x = startPos.x + vel.x * ft;
          projMesh.position.z = startPos.z + vel.z * ft;
          let py = startPos.y + vel.y * ft - 0.5 * 190 * ft * ft;
          if (py < 4) {
            py = 4 + Math.abs(Math.sin(ft * 8)) * 18 * Math.exp(-ft * 1.5);
          }
          projMesh.position.y = py;
          projMesh.rotation.x += dt * 12;
          projMesh.rotation.z += dt * 9;
        }

        if (t > 2.8) {
          if (armPivot) armPivot.rotation.y = 0;
          sceneManager.effectsGroup.remove(projMesh);
          sceneManager.physicsUpdateFn = null;
        }
      };
    }
  }

  window.PhysicsMechanicsGenerator = PhysicsMechanicsGenerator;
})();
