// Генератор 4: Мутатор Воксельних Мобів та Босів (100% друк без підтримок: зброя та щит спираються на п'єдестал!)
(function () {
  const MOB_CONFIG = {
    PEDESTAL_H1: 3.5,
    PEDESTAL_H2: 2.5,
    PEDESTAL_W: 54,
    PEDESTAL_D: 44,
    LEG_HEIGHT: 16,
    TORSO_HEIGHT: 20,
    ARM_WIDTH: 7.5,
    ARM_HEIGHT: 19,
    ARM_DEPTH: 9.5,
    NAME_PIXEL_SIZE: 1.3,
    NAME_MAX_CHARS: 7
  };

  function createMaterials(palette) {
    return {
      main: new THREE.MeshStandardMaterial({ color: palette.main, roughness: 0.4, metalness: 0.15 }),
      dark: new THREE.MeshStandardMaterial({ color: palette.dark, roughness: 0.5, metalness: 0.15 }),
      accent: new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.3, metalness: 0.3 }),
      metal: new THREE.MeshStandardMaterial({ color: palette.metal, roughness: 0.35, metalness: 0.45 }),
      glow: new THREE.MeshStandardMaterial({ color: palette.glow, roughness: 0.2, emissive: palette.glow, emissiveIntensity: 0.25 })
    };
  }

  class MobMutatorGenerator {
    constructor() {}

    build3D(params) {
      const group = new THREE.Group();

      const archetype = params.archetype || 'golem'; // 'creeper', 'golem', 'knight', 'dragon', 'cyborg'
      const headScale = parseFloat(params.headScale) || 1.0;
      const bodyBulk = parseFloat(params.bodyBulk) || 1.0;
      const eyeType = params.eyeType || 'two'; // 'one', 'two', 'three', 'visor', 'creeper'
      const headgear = params.headgear || 'crown'; // 'none', 'horns', 'crown', 'ears', 'antenna'
      const backGear = params.backGear || 'wings'; // 'none', 'wings', 'jetpack', 'cape'
      const weapon = params.weapon || 'sword';     // 'sword', 'hammer', 'shield', 'dual_axes', 'tinkercad_blank'
      const mobName = (params.mobName || 'БОС').trim();
      const tinkercadBlank = params.tinkercadBlank === true;

      // Палітра залежно від архетипу
      const palettes = {
        creeper: { main: 0x16a34a, dark: 0x14532d, accent: 0x86efac, metal: 0x334155, glow: 0xfef08a },
        golem:   { main: 0x94a3b8, dark: 0x475569, accent: 0xf59e0b, metal: 0xe2e8f0, glow: 0x38bdf8 },
        knight:  { main: 0x2563eb, dark: 0x1e3a8a, accent: 0xfacc15, metal: 0xcbd5e1, glow: 0xf97316 },
        dragon:  { main: 0x7e22ce, dark: 0x3b0764, accent: 0xe879f9, metal: 0x1e293b, glow: 0xf43f5e },
        cyborg:  { main: 0x0d9488, dark: 0x115e59, accent: 0x22d3ee, metal: 0x64748b, glow: 0xa3e635 }
      };

      const pal = palettes[archetype] || palettes.golem;

      const {
        main: matMain,
        dark: matDark,
        accent: matAccent,
        metal: matMetal,
        glow: matGlow
      } = createMaterials(pal);

      const geoCache = new Map();
      const getGeo = (w, h, d) => {
        const key = `${w}_${h}_${d}`;
        if (!geoCache.has(key)) geoCache.set(key, new THREE.BoxGeometry(w, h, d));
        return geoCache.get(key);
      };

      const addBox = (w, h, d, x, yBottom, z, mat) => {
        const geo = getGeo(w, h, d);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, yBottom + h / 2, z);
        group.add(mesh);
        return mesh;
      };

      // 1. Іменний двоступеневий п'єдестал (гарантує ідеальне прилипання першого шару до столу!)
      const pedH1 = MOB_CONFIG.PEDESTAL_H1;
      const pedH2 = MOB_CONFIG.PEDESTAL_H2;
      const pedW = MOB_CONFIG.PEDESTAL_W;
      const pedD = MOB_CONFIG.PEDESTAL_D;

      addBox(pedW, pedH1, pedD, 0, 0, 0, matDark);
      addBox(pedW - 6, pedH2, pedD - 6, 0, pedH1, 0, matMetal);

      const baseTopY = pedH1 + pedH2; // 6.0 мм

      // Об'ємний напис імені моба спереду на п'єдесталі
      if (mobName.length > 0 && !tinkercadBlank) {
        const chars = window.VoxelFont.textToCharMatrices(mobName, MOB_CONFIG.NAME_MAX_CHARS);
        const px = MOB_CONFIG.NAME_PIXEL_SIZE;
        const totalW = chars.length * 6 * px;
        const startX = -totalW / 2;
        const plateZ = pedD / 2 + 1.5;

        // Плашка під текст на передній грані п'єдесталу (лежить на Z=0 столу!)
        addBox(Math.max(24, totalW + 5), pedH1 + pedH2 + 4.5, 4.5, 0, 0, plateZ, matDark);

        chars.forEach((item, idx) => {
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 5; c++) {
              if (item.matrix[r][c] === 1) {
                addBox(
                  px,
                  px,
                  1.8,
                  startX + (idx * 6 + c) * px,
                  1.2 + (6 - r) * px,
                  plateZ + 2.2,
                  matAccent
                );
              }
            }
          }
        });
      }

      // 2. Ноги (або 4 лапи у Кріпера)
      const legH = MOB_CONFIG.LEG_HEIGHT;
      const legW = 9.5 * bodyBulk;
      const legD = 10.5 * bodyBulk;

      if (archetype === 'creeper') {
        // 4 міцні лапи кріпера + центральна тумба
        addBox(legW, legH, legD, -7 * bodyBulk, baseTopY, 6, matMain);
        addBox(legW, legH, legD,  7 * bodyBulk, baseTopY, 6, matMain);
        addBox(legW, legH, legD, -7 * bodyBulk, baseTopY, -6, matMain);
        addBox(legW, legH, legD,  7 * bodyBulk, baseTopY, -6, matMain);
        addBox(12 * bodyBulk, legH, 12 * bodyBulk, 0, baseTopY, 0, matDark);
      } else {
        // 2 масивні ноги лицаря/голема зі ступнями та центральною колоною-опорою (щоб між ногами не було горизонтального мосту!)
        addBox(legW, legH, legD, -6.5 * bodyBulk, baseTopY, 0, matDark);
        addBox(legW, legH, legD,  6.5 * bodyBulk, baseTopY, 0, matDark);
        // Чоботи
        addBox(legW + 2, 5, legD + 3, -6.5 * bodyBulk, baseTopY, 1.5, matMetal);
        addBox(legW + 2, 5, legD + 3,  6.5 * bodyBulk, baseTopY, 1.5, matMetal);
        // Центральна східчаста опора під поясом (0 підтримок!)
        addBox(7 * bodyBulk, legH, legD * 0.8, 0, baseTopY, 0, matDark);
      }

      const torsoBottomY = baseTopY + legH;

      // 3. Тулуб і броня
      const torsoW = 22 * bodyBulk;
      const torsoH = MOB_CONFIG.TORSO_HEIGHT;
      const torsoD = 14 * bodyBulk;

      // Східчастий пояс (фаска 45° від ніг до широкого торсу)
      addBox(torsoW - 3, 3.5, torsoD - 2, 0, torsoBottomY - 2, 0, matAccent);
      addBox(torsoW, torsoH, torsoD, 0, torsoBottomY, 0, matMain);

      if (!tinkercadBlank) {
        // Нагрудне ядро / герб
        addBox(torsoW * 0.55, torsoH * 0.5, 2.5, 0, torsoBottomY + 5, torsoD / 2, matMetal);
        addBox(torsoW * 0.28, torsoH * 0.28, 3.5, 0, torsoBottomY + 7.5, torsoD / 2, matGlow);
      }

      // 4. Руки (притиснуті до тулуба + спираються знизу на скошені ребра жорсткості!)
      const armW = MOB_CONFIG.ARM_WIDTH;
      const armH = MOB_CONFIG.ARM_HEIGHT;
      const armD = MOB_CONFIG.ARM_DEPTH;
      const leftArmX = -(torsoW / 2 + armW / 2 - 0.5);
      const rightArmX = (torsoW / 2 + armW / 2 - 0.5);

      // Підпірки під пахвами (сходинки, щоб руки друкувалися прямо з пояса/ніг без підтримок!)
      addBox(armW * 0.7, legH + 2, armD * 0.75, leftArmX + 1.5, baseTopY, 0, matDark);
      addBox(armW * 0.7, legH + 2, armD * 0.75, rightArmX - 1.5, baseTopY, 0, matDark);

      // Самі руки та наплічники
      addBox(armW, armH, armD, leftArmX, torsoBottomY, 0, matMain);
      addBox(armW, armH, armD, rightArmX, torsoBottomY, 0, matMain);
      addBox(armW + 3, 6, armD + 2, leftArmX, torsoBottomY + armH - 5, 0, matAccent);
      addBox(armW + 3, 6, armD + 2, rightArmX, torsoBottomY + armH - 5, 0, matAccent);

      const headBottomY = torsoBottomY + torsoH;

      // 5. Голова зі східчастим коміром (щоб підборіддя не висіло в повітрі)
      const headW = 20 * headScale;
      const headH = 18 * headScale;
      const headD = 18 * headScale;

      addBox(headW * 0.82, 3, headD * 0.82, 0, headBottomY - 1.5, 0, matDark);
      addBox(headW, headH, headD, 0, headBottomY, 0, matMain);

      // 6. Очі та обличчя (якщо не режим заготовки для Tinkercad)
      if (!tinkercadBlank) {
        const faceZ = headD / 2;
        const eyeY = headBottomY + headH * 0.48;

        if (eyeType === 'one') {
          // Око Циклопа
          addBox(7 * headScale, 6 * headScale, 2.5, 0, eyeY, faceZ, matDark);
          addBox(4.5 * headScale, 3.8 * headScale, 3.2, 0, eyeY + 1, faceZ, matGlow);
        } else if (eyeType === 'three') {
          // Три ока мутанта
          addBox(4 * headScale, 4 * headScale, 2.5, -5 * headScale, eyeY - 1, faceZ, matGlow);
          addBox(4 * headScale, 4 * headScale, 2.5,  5 * headScale, eyeY - 1, faceZ, matGlow);
          addBox(4.5 * headScale, 4.5 * headScale, 3.0, 0, eyeY + 3.5 * headScale, faceZ, matAccent);
        } else if (eyeType === 'visor') {
          // Кібер-візор
          addBox(headW * 0.86, 5 * headScale, 2.8, 0, eyeY, faceZ, matGlow);
          addBox(headW * 0.6, 3 * headScale, 2.2, 0, headBottomY + 3, faceZ, matMetal);
        } else if (eyeType === 'creeper') {
          // Класичне обличчя Кріпера
          addBox(4.5 * headScale, 4.5 * headScale, 2.5, -4.5 * headScale, eyeY, faceZ, matDark);
          addBox(4.5 * headScale, 4.5 * headScale, 2.5,  4.5 * headScale, eyeY, faceZ, matDark);
          addBox(5 * headScale, 6 * headScale, 2.5, 0, headBottomY + 3, faceZ, matDark);
          addBox(2.5 * headScale, 4.5 * headScale, 2.5, -3.5 * headScale, headBottomY + 1.5, faceZ, matDark);
          addBox(2.5 * headScale, 4.5 * headScale, 2.5,  3.5 * headScale, headBottomY + 1.5, faceZ, matDark);
        } else {
          // Два класичні ока + брови
          addBox(4.5 * headScale, 4.5 * headScale, 2.5, -4.8 * headScale, eyeY, faceZ, matGlow);
          addBox(4.5 * headScale, 4.5 * headScale, 2.5,  4.8 * headScale, eyeY, faceZ, matGlow);
          addBox(12 * headScale, 2.8 * headScale, 2.0, 0, headBottomY + 3, faceZ, matDark);
        }
      }

      // 7. Роги / Корона / Антени (все росте вгору з голови — 0 підтримок!)
      const headTopY = headBottomY + headH;
      if (headgear === 'crown') {
        const cw = headW * 0.85;
        addBox(cw, 3.5, cw, 0, headTopY, 0, matAccent);
        // Зубці корони
        addBox(3.5, 4.5, 3.5, -cw / 2 + 1.75, headTopY + 3.5, cw / 2 - 1.75, matAccent);
        addBox(3.5, 5.5, 3.5, 0, headTopY + 3.5, cw / 2 - 1.75, matGlow);
        addBox(3.5, 4.5, 3.5,  cw / 2 - 1.75, headTopY + 3.5, cw / 2 - 1.75, matAccent);
        addBox(3.5, 4.5, 3.5, -cw / 2 + 1.75, headTopY + 3.5, -cw / 2 + 1.75, matAccent);
        addBox(3.5, 4.5, 3.5,  cw / 2 - 1.75, headTopY + 3.5, -cw / 2 + 1.75, matAccent);
      } else if (headgear === 'horns') {
        // Ступінчасті роги вікінга/дракона
        for (let s = 0; s < 4; s++) {
          addBox(4.5, 3.5, 4.5, -(headW / 2 - 2 + s * 2.2), headTopY - 2 + s * 3.0, 0, matAccent);
          addBox(4.5, 3.5, 4.5,  (headW / 2 - 2 + s * 2.2), headTopY - 2 + s * 3.0, 0, matAccent);
        }
      } else if (headgear === 'antenna') {
        addBox(6, 3, 6, 0, headTopY, 0, matMetal);
        addBox(3.2, 10, 3.2, 0, headTopY + 3, 0, matMetal);
        addBox(6.5, 6.5, 6.5, 0, headTopY + 12, 0, matGlow);
      } else if (headgear === 'ears') {
        addBox(6, 7, 4, -headW * 0.32, headTopY, 0, matMain);
        addBox(6, 7, 4,  headW * 0.32, headTopY, 0, matMain);
      }

      // 8. Крила / Реактивний ранець / Плащ (ростуть від самого п'єдесталу по спині вгору — 100% без підтримок!)
      const backZ = -(torsoD / 2 + 2);
      if (backGear === 'wings') {
        for (let step = 0; step < 5; step++) {
          const wSpan = 14 + step * 5.5;
          const hStart = baseTopY + step * 7.0;
          addBox(wSpan * 2, 7.5, 4.0, 0, hStart, backZ, step % 2 === 0 ? matDark : matAccent);
        }
      } else if (backGear === 'jetpack') {
        // Два турбо-циліндри від п'єдесталу до плечей
        addBox(8, torsoBottomY + torsoH - baseTopY, 8, -6.5, baseTopY, backZ - 2, matMetal);
        addBox(8, torsoBottomY + torsoH - baseTopY, 8,  6.5, baseTopY, backZ - 2, matMetal);
        addBox(5, 4, 5, -6.5, torsoBottomY + torsoH, backZ - 2, matGlow);
        addBox(5, 4, 5,  6.5, torsoBottomY + torsoH, backZ - 2, matGlow);
      } else if (backGear === 'cape') {
        addBox(torsoW + 8, torsoBottomY + torsoH - baseTopY - 2, 3.5, 0, baseTopY, backZ, matAccent);
      }

      // 9. Зброя в руках (СПИРАЄТЬСЯ НА П'ЄДЕСТАЛ, працюючи як додаткова колона міцності!)
      const wepX = rightArmX + 2.5;
      const wepZ = 7.5;

      if (weapon === 'sword') {
        // Великий дворучний воксельний меч, вістря якого стоїть на п'єдесталі!
        addBox(5.5, 38, 3.5, wepX, baseTopY, wepZ, matGlow);
        addBox(14, 4.0, 5.5, wepX, baseTopY + 28, wepZ, matAccent);
        addBox(4.5, 10, 4.5, wepX, baseTopY + 32, wepZ, matDark);
        // Місток до правої руки
        addBox(7, 8, 9, wepX - 1.5, torsoBottomY + 4, wepZ - 4, matMain);
      } else if (weapon === 'hammer') {
        // Бойовий молот на довгому древку від п'єдесталу
        addBox(4.5, 36, 4.5, wepX, baseTopY, wepZ, matDark);
        addBox(16, 11, 12, wepX, baseTopY + 32, wepZ, matMetal);
        addBox(17, 4, 13, wepX, baseTopY + 35.5, wepZ, matGlow);
        addBox(7, 8, 9, wepX - 1.5, torsoBottomY + 4, wepZ - 4, matMain);
      } else if (weapon === 'shield') {
        // Масивний лицарський щит від самої підставки
        addBox(18, 28, 4.5, leftArmX - 1, baseTopY, wepZ + 1, matMetal);
        addBox(12, 20, 5.5, leftArmX - 1, baseTopY + 4, wepZ + 1, matAccent);
        addBox(6, 6, 6.5, leftArmX - 1, baseTopY + 11, wepZ + 1, matGlow);
        addBox(8, 10, 9, leftArmX, torsoBottomY + 2, wepZ - 3, matMain);
      } else if (weapon === 'dual_axes') {
        // Дві сокири з опорою на п'єдестал з обох боків!
        [-wepX, wepX].forEach((axX) => {
          addBox(4.2, 35, 4.2, axX, baseTopY, wepZ, matDark);
          addBox(12, 12, 4.5, axX, baseTopY + 23, wepZ, matGlow);
          addBox(7, 8, 9, axX * 0.85, torsoBottomY + 4, wepZ - 4, matMain);
        });
      }

      return group;
    }
  }

  window.MobMutatorGenerator = MobMutatorGenerator;
})();
