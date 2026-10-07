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

  function buildIronMole(params) {
    params = params || {};
    const group = new THREE.Group();
    const headScaleValue = parseFloat(params.headScale);
    const bodyBulkValue = parseFloat(params.bodyBulk);
    const headScale = Number.isFinite(headScaleValue) && headScaleValue > 0 ? headScaleValue : 1.05;
    const bodyBulk = Number.isFinite(bodyBulkValue) && bodyBulkValue > 0 ? bodyBulkValue : 1.05;
    const blank = params.tinkercadBlank === true;
    const palette = {
      main: 0x89745f,
      dark: 0x45392f,
      accent: 0xd4aa67,
      metal: 0x65716f,
      glow: 0xf2c75c
    };
    const { main, dark, accent, metal, glow } = createMaterials(palette);
    const geoCache = new Map();
    const baseTopY = MOB_CONFIG.PEDESTAL_H1 + MOB_CONFIG.PEDESTAL_H2;

    const addBox = (w, h, d, x, yBottom, z, material) => {
      const key = `${w}_${h}_${d}`;
      if (!geoCache.has(key)) geoCache.set(key, new THREE.BoxGeometry(w, h, d));
      const mesh = new THREE.Mesh(geoCache.get(key), material);
      const supportedBottom = Math.abs(yBottom - baseTopY) < 0.0001 ? baseTopY - 0.2 : yBottom;
      mesh.position.set(x, supportedBottom + h / 2, z);
      group.add(mesh);
      return mesh;
    };

    // Keep the display base broad, but let the low body, shovel muzzle, and flat
    // tail carry the character's identity without a name plate.
    addBox(MOB_CONFIG.PEDESTAL_W, MOB_CONFIG.PEDESTAL_H1, MOB_CONFIG.PEDESTAL_D, 0, 0, 0, dark);
    addBox(MOB_CONFIG.PEDESTAL_W - 6, MOB_CONFIG.PEDESTAL_H2, MOB_CONFIG.PEDESTAL_D - 6, 0, MOB_CONFIG.PEDESTAL_H1, 0, metal);

    const bodyW = 24 * bodyBulk;
    const bodyD = 32 * bodyBulk;
    const bodyH = 12;
    const bodyZ = -1;
    const bodyBottomY = baseTopY + 5;
    const bodyTopY = bodyBottomY + bodyH;
    const bodyRearZ = bodyZ - bodyD / 2;

    // The long shell rises only in a low, tapered ridge at the rear.
    addBox(bodyW, bodyH, bodyD, 0, bodyBottomY, bodyZ, main);
    addBox(bodyW * 0.76, 3.2, bodyD * 0.44, 0, bodyTopY - 1.4, bodyZ - 3.3, dark);
    addBox(bodyW * 0.52, 2.2, bodyD * 0.22, 0, bodyTopY + 1.8, bodyZ - 5.2, accent);

    // Broad front digging paws and smaller rear paws sit on the base. Short legs
    // overlap both paws and shell so no limb is a detached island.
    const frontPawZ = bodyZ + bodyD * 0.34;
    const rearPawZ = bodyZ - bodyD * 0.34;
    [-1, 1].forEach((side) => {
      const frontX = side * bodyW * 0.34;
      addBox(12 * bodyBulk, 3.8, 10 * bodyBulk, frontX, baseTopY, frontPawZ, dark);
      addBox(6.2 * bodyBulk, 5.2, 6.0 * bodyBulk, frontX, baseTopY + 2.8, frontPawZ - 0.4, main);

      const rearX = side * bodyW * 0.32;
      addBox(8 * bodyBulk, 3.6, 7 * bodyBulk, rearX, baseTopY, rearPawZ, dark);
      addBox(5.2 * bodyBulk, 5.0, 5.4 * bodyBulk, rearX, baseTopY + 2.7, rearPawZ + 0.3, main);
    });

    const headW = 16 * headScale;
    const headH = 9 * headScale;
    const headD = 11 * headScale;
    const headBottomY = bodyBottomY + 6.6;
    const headZ = 8.2;
    const headFrontZ = headZ + headD / 2;
    addBox(headW, headH, headD, 0, headBottomY, headZ, main);

    // Three overlapping steps form a wide, forward-projecting digging muzzle.
    // Its broad root reads as a shovel and its smaller tip keeps a tapered profile.
    addBox(14.5 * headScale, 5.4 * headScale, 5.2 * headScale, 0,
      headBottomY + 0.7 * headScale, headFrontZ + 1.8 * headScale, accent);
    addBox(11.5 * headScale, 4.3 * headScale, 4.2 * headScale, 0,
      headBottomY + 1.2 * headScale, headFrontZ + 5.6 * headScale, main);
    addBox(7.2 * headScale, 3.0 * headScale, 2.7 * headScale, 0,
      headBottomY + 1.8 * headScale, headFrontZ + 8.3 * headScale, dark);

    if (!blank) {
      const eyeY = headBottomY + headH * 0.72;
      const eyeZ = headFrontZ - 0.2;
      const eyeSize = 2.2 * headScale;
      const eyeOffsets = params.eyeType === 'one' ? [0] : (params.eyeType === 'three' ? [-1, 0, 1] : [-1, 1]);
      eyeOffsets.forEach((offset) => {
        const eyeX = offset * 3.2 * headScale;
        addBox(eyeSize + 1.4, eyeSize + 1.4, 1.8, eyeX, eyeY - 0.5, eyeZ, dark);
        addBox(eyeSize, eyeSize, 1.0, eyeX, eyeY, eyeZ + 0.8, glow);
      });
      addBox(3.2 * headScale, 2.6 * headScale, 1.8, 0,
        headBottomY + 1.5 * headScale, headFrontZ + 9.6 * headScale, metal);
    }

    // A short, horizontal tail narrows in width and length behind the rump.
    // Its top face sits inside the body height and each step overlaps its neighbor.
    const tailLength = Math.min(6.0, Math.max(0.8, 21.8 - Math.abs(bodyRearZ) + 1.4));
    const tailRootDepth = tailLength * 0.40;
    const tailMiddleDepth = tailLength * 0.34;
    const tailTipDepth = tailLength * 0.26;
    const tailY = bodyBottomY + 3.8;
    const tailRootEnd = bodyRearZ + 0.6;
    const tailMiddleEnd = tailRootEnd - tailRootDepth + 0.4;
    const tailTipEnd = tailMiddleEnd - tailMiddleDepth + 0.4;
    addBox(8 * bodyBulk, 3.2, tailRootDepth, 0, tailY, tailRootEnd - tailRootDepth / 2, dark);
    addBox(5.6 * bodyBulk, 2.8, tailMiddleDepth, 0, tailY,
      tailMiddleEnd - tailMiddleDepth / 2, main);
    addBox(3.3 * bodyBulk, 2.8, tailTipDepth, 0, tailY,
      tailTipEnd - tailTipDepth / 2, accent);

    return group;
  }

  const CUSTOM_MOB_DESIGNS = new Set([
    'owl_scout', 'shell_turtle', 'longneck_helper', 'spring_frog', 'antenna_crab',
    'seed_glider', 'lantern_keeper', 'cave_bat', 'pebble_goat', 'reef_guard', 'drillbot'
  ]);
  const MOB_SUPPORTED_DESIGN_KEYS = Object.freeze([
    'classic', 'creeper', 'golem', 'knight', 'dragon', 'cyborg', 'iron_mole',
    'owl_scout', 'shell_turtle', 'longneck_helper', 'spring_frog', 'antenna_crab',
    'seed_glider', 'lantern_keeper', 'cave_bat', 'pebble_goat', 'reef_guard', 'drillbot'
  ]);

  function buildCustomMob(params) {
    const group = new THREE.Group();
    const design = params.design;
    const scaleValue = parseFloat(params.headScale);
    const bulkValue = parseFloat(params.bodyBulk);
    const headScale = Number.isFinite(scaleValue) && scaleValue > 0 ? scaleValue : 1;
    const bodyBulk = Number.isFinite(bulkValue) && bulkValue > 0 ? bulkValue : 1;
    const blank = params.tinkercadBlank === true;
    const palette = { main: 0x758c8b, dark: 0x344c50, accent: 0xd4a45f, metal: 0x9caeaa, glow: 0xffd875 };
    const { main, dark, accent, metal, glow } = createMaterials(palette);
    const cache = new Map();
    const floor = MOB_CONFIG.PEDESTAL_H1 + MOB_CONFIG.PEDESTAL_H2;
    const addBox = (w, h, d, x, y, z, material = main) => {
      const key = `${w}_${h}_${d}`;
      if (!cache.has(key)) cache.set(key, new THREE.BoxGeometry(w, h, d));
      const mesh = new THREE.Mesh(cache.get(key), material);
      const supportedBottom = Math.abs(y - floor) < 0.0001 ? floor - 0.2 : y;
      mesh.position.set(x, supportedBottom + h / 2, z);
      group.add(mesh);
      return mesh;
    };

    addBox(54, MOB_CONFIG.PEDESTAL_H1, 44, 0, 0, 0, dark);
    addBox(48, MOB_CONFIG.PEDESTAL_H2, 38, 0, MOB_CONFIG.PEDESTAL_H1, 0, metal);
    const b = bodyBulk;
    const h = headScale;

    if (design === 'owl_scout') {
      addBox(14 * b, 20, 14 * b, 0, floor, -1, dark);
      addBox(18 * h, 16 * h, 12 * h, 0, floor + 20, 2, main);
      [-1, 1].forEach((side) => {
        addBox(14 * b, 17, 8, side * 14, floor, -1, accent);
        addBox(11 * b, 11, 7, side * 12, floor + 14, -1, dark);
        addBox(5 * h, 7, 5 * h, side * 6 * h, floor + 34 * h, -1, accent);
        addBox(8, 6, 8, side * 8, floor, 7, dark);
      });
      addBox(7, 4, 7, 0, floor + 17, 10, accent);
    } else if (design === 'shell_turtle') {
      [-1, 1].forEach((side) => [-1, 1].forEach((front) => {
        addBox(9 * b, 8, 8 * b, side * 13 * b, floor, front * 11, dark);
        addBox(6 * b, 4, 7 * b, side * 13 * b, floor + 5, front * 11, accent);
      }));
      addBox(32 * b, 10, 27 * b, 0, floor + 7, -1, dark);
      addBox(27 * b, 8, 22 * b, 0, floor + 16, -1, main);
      addBox(20 * b, 6, 16 * b, 0, floor + 23, -1, accent);
      addBox(10 * h, 8 * h, 12 * h, 0, floor + 6, 17, main);
      addBox(7 * h, 4 * h, 4, 0, floor + 7 * h, 24, accent);
    } else if (design === 'longneck_helper') {
      [-1, 1].forEach((side) => [-1, 1].forEach((front) => {
        addBox(8 * b, 12, 8 * b, side * 8 * b, floor, front * 6, dark);
        addBox(6 * b, 4, 8 * b, side * 8 * b, floor + 9, front * 6, accent);
      }));
      addBox(17 * b, 15, 17 * b, 0, floor + 10, -1, main);
      addBox(9 * b, 23, 9 * b, 0, floor + 23, 3, dark);
      addBox(14 * h, 11 * h, 12 * h, 0, floor + 43, 5, main);
      addBox(5, 4, 5, 0, floor + 50 * h, 12, accent);
      addBox(5 * b, 3, 12, 0, floor + 11, -15, accent);
    } else if (design === 'spring_frog') {
      [-1, 1].forEach((side) => {
        addBox(14 * b, 10, 13 * b, side * 13 * b, floor, -7, dark);
        addBox(9 * b, 7, 10 * b, side * 9 * b, floor + 7, -5, accent);
        addBox(7 * b, 9, 8 * b, side * 7 * b, floor, 9, main);
        addBox(6 * h, 5 * h, 6, side * 6 * h, floor + 28 * h, 10, accent);
      });
      addBox(22 * b, 14, 20 * b, 0, floor + 8, -2, main);
      addBox(24 * h, 12 * h, 15 * h, 0, floor + 18, 8, dark);
      addBox(7, 5, 8, 0, floor + 15, 18, accent);
    } else if (design === 'antenna_crab') {
      addBox(20 * b, 13, 15 * b, 0, floor + 10, 0, main);
      addBox(15 * b, 7, 13 * b, 0, floor + 20, -1, accent);
      [-1, 1].forEach((side) => {
        [-1, 0, 1].forEach((row) => {
          addBox(12, 5, 5, side * 16, floor + 2 + (row === 0 ? 4 : 0), row * 8, dark);
          addBox(5, 8, 5, side * 21, floor, row * 8, accent);
        });
        addBox(8, 12, 9, side * 19, floor + 16, 9, dark);
        addBox(11, 5, 5, side * 15, floor + 16, 9, dark);
        addBox(8, 9, 8, side * 22, floor + 26, 10, accent);
        addBox(5, 4, 5, side * 23, floor + 31, 11, main);
      });
      addBox(4, 13, 4, 0, floor + 23, -2, metal);
      addBox(8, 5, 8, 0, floor + 34, -2, glow);
    } else if (design === 'seed_glider') {
      addBox(11 * b, 30, 11 * b, 0, floor, 0, dark);
      addBox(12 * h, 11 * h, 10 * h, 0, floor + 29, 2, main);
      [-1, 1].forEach((side) => {
        addBox(15, 13, 9, side * 12, floor + 21, -1, main);
        addBox(17, 12, 8, side * 19, floor + 10, -2, accent);
        addBox(11, 11, 8, side * 22, floor, -3, dark);
      });
      addBox(6, 8, 6, 0, floor + 40, 7, accent);
    } else if (design === 'lantern_keeper') {
      addBox(12 * b, 49, 12 * b, 0, floor, -1, dark);
      addBox(18 * b, 21, 18 * b, 0, floor + 12, 0, accent);
      addBox(14 * b, 14, 14 * b, 0, floor + 16, 0, glow);
      [-1, 1].forEach((side) => {
        addBox(4, 43, 5, side * 12, floor + 4, 0, main);
        addBox(8, 5, 8, side * 8, floor, 3, metal);
      });
      addBox(25 * b, 5, 24 * b, 0, floor + 34, 0, dark);
      addBox(17 * b, 5, 16 * b, 0, floor + 39, 0, accent);
      addBox(7 * h, 8 * h, 7 * h, 0, floor + 46, 0, main);
    } else if (design === 'cave_bat') {
      addBox(11 * b, 29, 12 * b, 0, floor + 5, 0, dark);
      addBox(15 * h, 12 * h, 10 * h, 0, floor + 32, 2, main);
      [-1, 1].forEach((side) => {
        addBox(13, 12, 8, side * 11, floor + 24, 0, accent);
        addBox(13, 11, 8, side * 19, floor + 13, -1, dark);
        addBox(9, 12, 8, side * 23, floor + 1, -2, accent);
        addBox(5 * h, 8 * h, 5, side * 5 * h, floor + 41 * h, 2, dark);
        addBox(6, 7, 7, side * 5, floor, -3, main);
      });
    } else if (design === 'pebble_goat') {
      [-1, 1].forEach((side) => [-1, 1].forEach((front) => {
        addBox(8 * b, 12, 8 * b, side * 9 * b, floor, front * 8, dark);
        addBox(6 * b, 4, 7 * b, side * 9 * b, floor + 9, front * 8, accent);
      }));
      addBox(22 * b, 14, 25 * b, 0, floor + 10, -2, main);
      addBox(19 * b, 8, 17 * b, 0, floor + 22, -5, dark);
      addBox(13 * h, 12 * h, 12 * h, 0, floor + 12, 14, main);
      [-1, 1].forEach((side) => {
        addBox(5, 6, 5, side * 6 * h, floor + 22 * h, 13, accent);
        addBox(4, 6, 4, side * 7 * h, floor + 27 * h, 12, dark);
      });
      addBox(4, 5, 10, 0, floor + 12, -17, accent);
    } else if (design === 'reef_guard') {
      addBox(14 * b, 41, 12 * b, 0, floor, 1, dark);
      addBox(17 * b, 13, 15 * b, 0, floor + 25, 0, main);
      addBox(13 * h, 12 * h, 10 * h, 0, floor + 40.5, 3, accent);
      [-1, 1].forEach((side) => {
        addBox(13, 11, 7, side * 11, floor + 25, -1, accent);
        addBox(14, 9, 6, side * 20, floor + 17, -2, dark);
        addBox(11, 9, 6, side * 23, floor + 8, -3, main);
        addBox(8, 6, 9, side * 8, floor, -8, metal);
      });
      addBox(9, 13, 8, 0, floor + 2, -12, accent);
      addBox(15, 7, 8, 0, floor + 1, -17, dark);
    } else if (design === 'drillbot') {
      [-1, 1].forEach((side) => {
        addBox(9, 12, 29, side * 15, floor, -1, dark);
        addBox(10, 5, 27, side * 15, floor + 4, -1, accent);
        [-1, 1].forEach((end) => addBox(4, 5, 5, side * 15, floor + 3, end * 10, metal));
      });
      addBox(23 * b, 14, 23 * b, 0, floor + 8, -3, main);
      addBox(18 * h, 13 * h, 15 * h, 0, floor + 20, -1, dark);
      addBox(14 * h, 7 * h, 8, 0, floor + 23 * h, 8, accent);
      addBox(10, 6, 7, 0, floor + 23 * h, 14, metal);
      addBox(5, 5, 6, 0, floor + 23 * h + 0.5, 19, dark);
    }

    // The eye selector and blanking switch remain useful across every authored face.
    if (!blank) {
      const faceZ = design === 'lantern_keeper' ? 4 : (design === 'shell_turtle' ? 24 : (design === 'longneck_helper' ? 12 : (design === 'seed_glider' ? 7 : (design === 'cave_bat' ? 7 : (design === 'reef_guard' ? 9 : (design === 'pebble_goat' ? 21 : 8))))));
      const faceY = design === 'longneck_helper' ? floor + 48 : (design === 'owl_scout' ? floor + 29 : (design === 'antenna_crab' ? floor + 20 : (design === 'seed_glider' ? floor + 33 : (design === 'cave_bat' ? floor + 38 : (design === 'shell_turtle' ? floor + 10 : (design === 'lantern_keeper' ? floor + 49 : (design === 'pebble_goat' ? floor + 18 : (design === 'reef_guard' ? floor + 47 : floor + 27))))))));
      const offsets = params.eyeType === 'one' ? [0] : (params.eyeType === 'three' ? [-1, 0, 1] : [-1, 1]);
      if (params.eyeType === 'visor') {
        addBox(11 * h, 3.4 * h, 2.4, 0, faceY, faceZ, glow);
      } else {
        offsets.forEach((side) => addBox(3.2 * h, 3.2 * h, 2.8,
          side * 3.8 * h, faceY, faceZ, params.eyeType === 'one' ? glow : dark));
      }
    }
    return group;
  }

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
      if (params && params.design === 'iron_mole') return buildIronMole(params);
      if (params && CUSTOM_MOB_DESIGNS.has(params.design)) return buildCustomMob(params);
      const group = new THREE.Group();
      const baseTopY = MOB_CONFIG.PEDESTAL_H1 + MOB_CONFIG.PEDESTAL_H2;

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
        const supportedBottom = Math.abs(yBottom - baseTopY) < 0.0001 ? baseTopY - 0.2 : yBottom;
        mesh.position.set(x, supportedBottom + h / 2, z);
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
      const legW = (archetype === 'golem' ? 12.5 : (archetype === 'dragon' ? 10.5 : 9.5)) * bodyBulk;
      const legD = (archetype === 'dragon' ? 13 : 10.5) * bodyBulk;

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
      const torsoW = (archetype === 'golem' ? 30 : (archetype === 'cyborg' ? 25 : 22)) * bodyBulk;
      const torsoH = archetype === 'golem' ? 17 : (archetype === 'dragon' ? 18 : MOB_CONFIG.TORSO_HEIGHT);
      const torsoD = (archetype === 'dragon' ? 24 : (archetype === 'cyborg' ? 17 : 14)) * bodyBulk;

      // Східчастий пояс (фаска 45° від ніг до широкого торсу)
      addBox(torsoW - 3, 3.5, torsoD - 2, 0, torsoBottomY - 2, 0, matAccent);
      addBox(torsoW, torsoH, torsoD, 0, torsoBottomY, 0, matMain);

      if (archetype === 'golem') {
        // A heavy, low shoulder mantle and wide feet give the golem a broad
        // stone-block silhouette even when SceneManager renders one color.
        addBox(torsoW + 8, 6, torsoD + 4, 0, torsoBottomY + torsoH - 4, 0, matDark);
        addBox(torsoW + 3, 4, torsoD + 1, 0, torsoBottomY + torsoH - 1, 0, matMetal);
      } else if (archetype === 'knight') {
        // Built-in shoulder pauldrons and a tall helmet ridge keep the knight
        // readable with the weapon selector set to "none".
        [-1, 1].forEach((side) => {
          addBox(12, 7, torsoD + 4, side * (torsoW / 2 - 1), torsoBottomY + torsoH - 5, 0, matMetal);
        });
        addBox(torsoW * 0.56, 6, 2.5, 0, torsoBottomY + 7, torsoD / 2 + 0.8, matAccent);
      } else if (archetype === 'cyborg') {
        [-1, 1].forEach((side) => {
          addBox(8, torsoH + 4, torsoD * 0.72, side * (torsoW / 2 + 3), torsoBottomY - 2, -1, matMetal);
          addBox(5, 5, torsoD * 0.78, side * (torsoW / 2 + 3), torsoBottomY + torsoH + 1, -1, matGlow);
        });
        addBox(8, 8, 3, 0, torsoBottomY + 5, torsoD / 2 + 1, matGlow);
      }

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
          addBox(4.5 * headScale, 3.8 * headScale, 3.2, 0, eyeY + 1, faceZ + 0.8, matGlow);
        } else if (eyeType === 'three') {
          // Три ока мутанта
          addBox(4 * headScale, 4 * headScale, 2.5, -5 * headScale, eyeY - 1, faceZ, matDark);
          addBox(4 * headScale, 4 * headScale, 2.5,  5 * headScale, eyeY - 1, faceZ, matDark);
          addBox(2.8 * headScale, 2.8 * headScale, 3.0, -5 * headScale, eyeY - 0.4, faceZ + 0.8, matGlow);
          addBox(2.8 * headScale, 2.8 * headScale, 3.0,  5 * headScale, eyeY - 0.4, faceZ + 0.8, matGlow);
          addBox(4.5 * headScale, 4.5 * headScale, 3.0, 0, eyeY + 3.5 * headScale, faceZ, matDark);
          addBox(3.0 * headScale, 3.0 * headScale, 3.5, 0, eyeY + 4.2 * headScale, faceZ + 0.8, matAccent);
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
          [-4.8, 4.8].forEach((x) => {
            addBox(5.6 * headScale, 5.6 * headScale, 2.6, x * headScale, eyeY - 0.55 * headScale, faceZ, matDark);
            addBox(3.6 * headScale, 3.6 * headScale, 3.0, x * headScale, eyeY + 0.25 * headScale, faceZ + 0.9, matGlow);
          });
          addBox(12 * headScale, 2.8 * headScale, 2.0, 0, headBottomY + 3, faceZ, matDark);
        }
      }

      // Give the named dragon a projecting jaw and a stepped ground-connected
      // tail; its identity survives when SceneManager replaces every color with PLA gray.
      if (archetype === 'dragon') {
        const muzzleLength = 4.6 * headScale;
        const muzzleCenterZ = headD / 2 + muzzleLength / 2 - 1.2 * headScale;
        addBox(headW * 0.58, 5.2 * headScale, muzzleLength, 0, headBottomY + 1.2 * headScale, muzzleCenterZ, matMain);
        const muzzleFrontZ = muzzleCenterZ + muzzleLength / 2;
        addBox(headW * 0.68, 2.4 * headScale, 2.2, 0, headBottomY + 1.3 * headScale, muzzleFrontZ - 0.35, matAccent);
        if (!tinkercadBlank) {
          [-1, 1].forEach((side) => {
            addBox(1.8 * headScale, 1.2 * headScale, 1.8, side * 2.2 * headScale, headBottomY + 3.1 * headScale, muzzleFrontZ + 0.5, matDark);
          });
        }

        const tailRootZ = -(torsoD / 2 + 2);
        addBox(8, torsoBottomY - baseTopY + 2, 7, 0, baseTopY, -(torsoD / 2 - 1), matDark);
        [
          { w: 8, d: 8, z: tailRootZ - 2, material: matDark },
          { w: 6.5, d: 8, z: tailRootZ - 8, material: matAccent },
          { w: 4.5, d: 7, z: tailRootZ - 14, material: matDark },
          { w: 2.5, d: 6, z: tailRootZ - 19.5, material: matAccent }
        ].forEach((segment) => addBox(segment.w, 4.5, segment.d, 0, baseTopY, segment.z, segment.material));

        // Two stepped, ground-reaching wings give the dragon a wide silhouette
        // without leaving detached or floating panels.
        [-1, 1].forEach((side) => {
          addBox(14, 13, 4.5, side * 10, baseTopY + 11, -(torsoD / 2 + 1), matDark);
          addBox(12, 10, 4.5, side * 19, baseTopY + 5, -(torsoD / 2 + 1), matAccent);
          addBox(8, 6, 4.5, side * 21, baseTopY, -(torsoD / 2 + 1), matDark);
        });
        [-1, 1].forEach((side) => {
          addBox(4, 6, 4, side * 7 * headScale, headBottomY + headH - 1, -2, matAccent);
          addBox(4, 5, 4, side * 8 * headScale, headBottomY + headH + 3, -2, matDark);
        });
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

  MobMutatorGenerator.supportedDesignKeys = MOB_SUPPORTED_DESIGN_KEYS;
  window.MobMutatorGenerator = MobMutatorGenerator;
})();
