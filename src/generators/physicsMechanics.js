// Генератор 3: Фізика без Шестерень — катапульта, баліста й балансир.
(function () {
  const PH_CONFIG = {
    CATAPULT: {
      DEFAULT_EXTRUDE_HEIGHT: 10.0,
      DEFAULT_SPRING_THICKNESS: 2.4,
      DEFAULT_ARM_LENGTH: 68.0,
      BASE_LENGTH: 76,
      BASE_THICKNESS: 8.5,
      SPRING_INNER_RADIUS: 11.5,
      SPRING_START_ANGLE: -Math.PI * 0.42,
      SPRING_END_ANGLE: Math.PI * 0.68,
      SPRING_CURVE_SEGMENTS: 32,
      AMMO_SIZE: 9.0,
      TEXT_PIXEL_SIZE: 1.45,
      TEXT_HEIGHT: 1.6
    },
    BALANCER: {
      DEFAULT_THICKNESS: 6.0,
      DEFAULT_WING_WEIGHT: 11.0,
      DEFAULT_SPAN_REF: 70.0,
      VOXEL_SCALE: 4.5,
      PIVOT_ROW: 6,
      PIVOT_COL: 9,
      NIB_HEIGHT: 3.0,
      STAND_STEPS: 6,
      STAND_BASE_WIDTH: 22,
      STAND_STEP_SHRINK: 3.2,
      STAND_STEP_HEIGHT: 4.5
    },
    DEMO: {
      BALANCER_DURATION: 4.5,
      PROJECTILE_SIZE: 8,
      GRAVITY: 190,
      FLIGHT_DURATION: 2.8
    }
  };

  // Reuse geometries only while constructing a model; its meshes own references after build.
  const geoCache = new Map();
  const getGeo = (w, h, d) => {
    const key = `${w}_${h}_${d}`;
    if (!geoCache.has(key)) geoCache.set(key, new THREE.BoxGeometry(w, h, d));
    return geoCache.get(key);
  };

  function makePrism(points, depth) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(point => shape.lineTo(point[0], point[1]));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: 2
    });
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }

  function addBeamBetween(parent, start, end, thickness, material) {
    const from = new THREE.Vector3(start[0], start[1], start[2]);
    const to = new THREE.Vector3(end[0], end[1], end[2]);
    const delta = to.clone().sub(from);
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(delta.length(), thickness, thickness),
      material
    );
    beam.position.copy(from.add(to).multiplyScalar(0.5));
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), delta.normalize());
    parent.add(beam);
    return beam;
  }

  function makeBodyMaterial(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.12 });
  }

  function makeAmmoMaterial() {
    return new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.1 });
  }

  function addPrintedAmmoKit(group, bodyMaterial, centerZ) {
    const size = 8;
    const block = new THREE.Mesh(getGeo(size, size, size), bodyMaterial);
    block.name = 'printedAmmo';
    block.position.set(0, size / 2, centerZ);
    block.userData.exportable = true;
    block.userData.kitPart = 'optional-flat-bottom-ammo-blank';
    block.userData.kitLabel = 'Комплектна заготовка снаряда';
    group.add(block);
    return block;
  }

  function clearDemoEffects(sceneManager) {
    if (!sceneManager) return;
    sceneManager.physicsUpdateFn = null;
    const effects = sceneManager.effectsGroup;
    if (!effects) return;
    const demoRoot = effects.getObjectByName('physicsDemoEffects');
    if (!demoRoot) return;
    sceneManager._disposeRecursive(demoRoot);
    effects.remove(demoRoot);
  }

  function getDemoEffects(sceneManager) {
    let root = sceneManager.effectsGroup.getObjectByName('physicsDemoEffects');
    if (!root) {
      root = new THREE.Group();
      root.name = 'physicsDemoEffects';
      root.userData.exportable = false;
      sceneManager.effectsGroup.add(root);
    }
    return root;
  }

  function setDemoResult(message) {
    const output = document.getElementById('physics-demo-result');
    if (output) output.textContent = message;
  }

  function addScreenTarget(sceneManager, position) {
    const target = new THREE.Group();
    target.name = 'physicsDemoTarget';
    target.userData.exportable = false;
    target.position.copy(position);
    [7, 4.5, 2.2].forEach((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.8, 6, 32),
        new THREE.MeshStandardMaterial({
          color: index === 2 ? 0xfacc15 : 0x38bdf8,
          emissive: index === 2 ? 0x854d0e : 0x075985,
          emissiveIntensity: 0.25,
          roughness: 0.55
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.userData.exportable = false;
      target.add(ring);
    });
    getDemoEffects(sceneManager).add(target);
    return target;
  }

  function addScreenProjectile(sceneManager, color = 0xef4444) {
    const projectile = new THREE.Mesh(
      new THREE.SphereGeometry(PH_CONFIG.DEMO.PROJECTILE_SIZE / 2, 12, 8),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.22,
        roughness: 0.4
      })
    );
    projectile.name = 'physicsDemoProjectile';
    projectile.userData.exportable = false;
    getDemoEffects(sceneManager).add(projectile);
    return projectile;
  }

  function createPhysicsMaterials(palette) {
    return {
      body: new THREE.MeshStandardMaterial({
        color: palette.body,
        roughness: palette.bodyRoughness || 0.38,
        metalness: palette.bodyMetalness || 0.15
      }),
      accent: new THREE.MeshStandardMaterial({
        color: palette.accent,
        roughness: palette.accentRoughness || 0.32,
        metalness: palette.accentMetalness || 0.2
      }),
      ammo: new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.4,
        metalness: 0.1
      }),
      band: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.3
      })
    };
  }

  class PhysicsMechanicsGenerator {
    constructor() {}

    build3D(params) {
      setDemoResult('Екранна демонстрація — не прогноз сили або міцності.');
      geoCache.clear();
      try {
        const submode = params.submode || 'catapult'; // 'catapult' або 'balancer'
        if (submode === 'balancer') {
          return this.buildBalancer(params);
        }
        if (params.design === 'frog_launcher') return this.buildFrogLauncher(params);
        if (params.design === 'trebuchet') return this.buildTrebuchet(params);
        if (params.design === 'truss_bridge') return this.buildBridge(params, 'truss');
        if (params.design === 'arch_bridge') return this.buildBridge(params, 'arch');
        return this.buildCatapult(params);
      } finally {
        geoCache.clear();
      }
    }

    // =========================================================================
    // ПІДРЕЖИМ А: КАТАПУЛЬТА
    // =========================================================================
    buildCatapult(params) {
      if (params.design === 'ballista_bow') return this.buildBallista(params);

      const group = new THREE.Group();
      const extrudeHeight = parseFloat(params.extrudeHeight) || PH_CONFIG.CATAPULT.DEFAULT_EXTRUDE_HEIGHT;
      const springThickness = parseFloat(params.springThickness) || PH_CONFIG.CATAPULT.DEFAULT_SPRING_THICKNESS;
      const armLength = parseFloat(params.armLength) || PH_CONFIG.CATAPULT.DEFAULT_ARM_LENGTH;
      const includeAmmo = params.includeAmmo !== false;
      const customText = (params.customText || '').trim().slice(0, 6);
      const mats = createPhysicsMaterials({
        body: params.colorPrimary || 0x10b981,
        accent: params.colorAccent || 0xf59e0b
      });
      const matBody = mats.body;
      const pivotX = 20;
      const baseLength = Math.max(PH_CONFIG.CATAPULT.BASE_LENGTH + 6, armLength + 14);
      const baseHeight = Math.max(6, extrudeHeight);
      const baseWidth = 28;

      // One broad deck replaces the coincident feet and under-spring blocks.
      const baseGeo = getGeo(baseLength, baseHeight, baseWidth);
      const baseMesh = new THREE.Mesh(baseGeo, matBody);
      baseMesh.name = 'catapultBase';
      baseMesh.position.set(0, baseHeight / 2, 0);
      group.add(baseMesh);
      const targetAnchor = new THREE.Object3D();
      targetAnchor.name = 'catapultTargetAnchor';
      targetAnchor.position.set(-12, baseHeight + 1.2, 10);
      group.add(targetAnchor);

      // A tapered pivot web gives the lever a visible support instead of a thin fork.
      const supportGeo = makePrism([
        [-12, 0], [12, 0], [9, 7], [5, 13], [-5, 13], [-9, 7]
      ], 18);
      const supportMesh = new THREE.Mesh(supportGeo, matBody);
      supportMesh.name = 'catapultPivotSupport';
      supportMesh.position.set(pivotX, baseHeight - 0.45, 0);
      group.add(supportMesh);

      // The C spring rises above the deck. Its visible faces no longer share the deck's plane.
      const springInnerR = PH_CONFIG.CATAPULT.SPRING_INNER_RADIUS;
      const springOuterR = springInnerR + springThickness;
      const springShape = new THREE.Shape();
      const startAngle = -Math.PI * 0.76;
      const endAngle = Math.PI * 0.76;
      springShape.absarc(0, 0, springOuterR, startAngle, endAngle, false);
      springShape.absarc(0, 0, springInnerR, endAngle, startAngle, true);
      springShape.closePath();
      const springGeo = new THREE.ExtrudeGeometry(springShape, {
        depth: baseHeight + 3,
        bevelEnabled: false,
        curveSegments: PH_CONFIG.CATAPULT.SPRING_CURVE_SEGMENTS
      });
      springGeo.rotateX(Math.PI / 2);
      const springMesh = new THREE.Mesh(springGeo, matBody);
      springMesh.name = 'catapultSpring';
      springMesh.position.set(pivotX, baseHeight * 2 + 2.5, 0);
      group.add(springMesh);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 18, 12), matBody);
      hub.name = 'catapultPivotHub';
      hub.rotation.x = Math.PI / 2;
      hub.position.set(pivotX, baseHeight + 9, 0);
      group.add(hub);

      // The long beam and U-shaped cup are one moving group for the screen demonstration.
      const armPivotGroup = new THREE.Group();
      armPivotGroup.position.set(pivotX, baseHeight + 9, 0);
      armPivotGroup.name = 'catapultArmPivot';
      const armBar = new THREE.Mesh(getGeo(armLength, 4.8, 6.5), matBody);
      armBar.name = 'catapultArm';
      armBar.position.set(-armLength / 2 + 2, 0, 0);
      armPivotGroup.add(armBar);

      const cupX = -armLength + 5;
      const launchPoint = new THREE.Object3D();
      launchPoint.name = 'catapultLaunchPoint';
      launchPoint.position.set(cupX - 1, 4.1, 0);
      armPivotGroup.add(launchPoint);
      const cupFloor = new THREE.Mesh(getGeo(16, 4.2, 18), matBody);
      cupFloor.name = 'catapultCupFloor';
      cupFloor.position.set(cupX, -0.3, 0);
      armPivotGroup.add(cupFloor);
      [-7.5, 7.5].forEach(z => {
        const rail = new THREE.Mesh(getGeo(15, 6.5, 3), matBody);
        rail.position.set(cupX, 3, z);
        armPivotGroup.add(rail);
      });
      const cupStop = new THREE.Mesh(getGeo(4, 7.5, 12), matBody);
      cupStop.position.set(cupX + 7, 3.4, 0);
      armPivotGroup.add(cupStop);

      const loadedDisplay = new THREE.Mesh(new THREE.SphereGeometry(4.1, 10, 8), mats.ammo);
      loadedDisplay.name = 'restingAmmo';
      loadedDisplay.userData.exportable = false;
      loadedDisplay.position.set(cupX - 1, 4.1, 0);
      armPivotGroup.add(loadedDisplay);

      group.add(armPivotGroup);
      if (includeAmmo) addPrintedAmmoKit(group, matBody, baseWidth / 2 + 6);

      // An optional small name plaque keeps custom labels subordinate to the mechanism.
      if (customText.length > 0) {
        const chars = window.VoxelFont.textToCharMatrices(customText, 6);
        const px = Math.min(0.72, 22 / Math.max(1, chars.length * 6));
        const textH = 1.2;
        const totalW = chars.length * 6 * px;
        const plaque = new THREE.Mesh(getGeo(27, 1.4, 9), matBody);
        plaque.position.set(-19, baseHeight + 0.7, 0);
        group.add(plaque);
        const startX = -19 - totalW / 2;
        const startZ = -(7 * px) / 2;
        const lGeo = getGeo(px, textH, px);

        chars.forEach((item, idx) => {
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 5; c++) {
              if (item.matrix[r][c] === 1) {
                const lMesh = new THREE.Mesh(lGeo, matBody);
                lMesh.position.set(
                  startX + (idx * 6 + c) * px,
                  baseHeight + 1.5,
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

    addLauncherArm(group, params, options = {}) {
      const armLength = parseFloat(params.armLength) || PH_CONFIG.CATAPULT.DEFAULT_ARM_LENGTH;
      const baseHeight = options.baseHeight || Math.max(6, parseFloat(params.extrudeHeight) || PH_CONFIG.CATAPULT.DEFAULT_EXTRUDE_HEIGHT);
      const pivotX = options.pivotX === undefined ? 20 : options.pivotX;
      const pivotY = options.pivotY === undefined ? baseHeight + 9 : options.pivotY;
      const depth = options.depth || 6.5;
      const materials = options.materials || createPhysicsMaterials({
        body: params.colorPrimary || 0x10b981,
        accent: params.colorAccent || 0xf59e0b
      });
      const pivot = new THREE.Group();
      pivot.position.set(pivotX, pivotY, 0);
      pivot.name = 'catapultArmPivot';
      const beamLength = options.beamLength || armLength;
      const beamCenterX = options.beamCenterX === undefined ? -beamLength / 2 + 2 : options.beamCenterX;
      const armBar = new THREE.Mesh(getGeo(beamLength, options.beamHeight || 4.8, depth), materials.body);
      armBar.name = 'catapultArm';
      armBar.position.x = beamCenterX;
      pivot.add(armBar);

      const cupX = options.cupX === undefined ? -armLength + 5 : options.cupX;
      const launchPoint = new THREE.Object3D();
      launchPoint.name = 'catapultLaunchPoint';
      launchPoint.position.set(cupX - 1, options.launchY || 4.1, 0);
      pivot.add(launchPoint);
      if (options.sling) {
        const sling = new THREE.Mesh(getGeo(12, 4, 12), materials.body);
        sling.name = 'trebuchetSlingCup';
        sling.position.set(cupX - 1, 0, 0);
        pivot.add(sling);
      } else {
        const cupFloor = new THREE.Mesh(getGeo(16, 4.2, 18), materials.body);
        cupFloor.name = 'catapultCupFloor';
        cupFloor.position.set(cupX, -0.3, 0);
        pivot.add(cupFloor);
        [-7.5, 7.5].forEach(z => {
          const rail = new THREE.Mesh(getGeo(15, 6.5, 3), materials.body);
          rail.position.set(cupX, 3, z);
          pivot.add(rail);
        });
        const cupStop = new THREE.Mesh(getGeo(4, 7.5, 12), materials.body);
        cupStop.position.set(cupX + 7, 3.4, 0);
        pivot.add(cupStop);
      }

      if (options.counterweight) {
        const counterweight = new THREE.Mesh(getGeo(18, 11, 16), materials.body);
        counterweight.name = 'trebuchetCounterweight';
        counterweight.position.set(options.counterweight.x, options.counterweight.y, 0);
        pivot.add(counterweight);
      }
      const display = new THREE.Mesh(
        new THREE.SphereGeometry(4.1, 10, 8),
        materials.ammo
      );
      display.name = 'restingAmmo';
      display.userData.exportable = false;
      display.position.set(cupX - 1, options.launchY || 4.1, 0);
      pivot.add(display);
      group.add(pivot);
      if (params.includeAmmo !== false) addPrintedAmmoKit(group, materials.body, options.kitZ || 24);
      return pivot;
    }

    buildFrogLauncher(params) {
      const group = new THREE.Group();
      const armLength = parseFloat(params.armLength) || PH_CONFIG.CATAPULT.DEFAULT_ARM_LENGTH;
      const baseHeight = Math.max(6, parseFloat(params.extrudeHeight) || PH_CONFIG.CATAPULT.DEFAULT_EXTRUDE_HEIGHT);
      const body = makeBodyMaterial(params.colorPrimary || 0x10b981);
      const baseLength = Math.max(82, armLength + 14);
      const base = new THREE.Mesh(getGeo(baseLength, baseHeight, 34), body);
      base.name = 'frogLauncherDeck';
      base.position.y = baseHeight / 2;
      group.add(base);

      // A low, broad frog profile sits behind the lever; raised eyes make its silhouette legible.
      const frogProfile = makePrism([
        [-10, 0], [-7, 7], [1, 11], [9, 8], [15, 13],
        [19, 12], [23, 7], [31, 6], [35, 2], [32, 0]
      ], 20);
      const torso = new THREE.Mesh(frogProfile, body);
      torso.name = 'frogLauncherBody';
      torso.position.set(1, baseHeight - 0.5, 0);
      group.add(torso);
      [-5, 5].forEach(z => {
        const eyeStem = new THREE.Mesh(getGeo(5.5, 8, 5.5), body);
        eyeStem.position.set(23, baseHeight + 8, z);
        group.add(eyeStem);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(3.6, 10, 8), body);
        eye.position.set(23, baseHeight + 13, z);
        group.add(eye);
      });
      // Paired rear haunches form a second, wider cue for the frog shape.
      [-11, 11].forEach(z => {
        const haunch = new THREE.Mesh(new THREE.SphereGeometry(8, 10, 8), body);
        haunch.scale.set(1.25, 0.72, 1);
        haunch.position.set(4, baseHeight + 3.5, z);
        group.add(haunch);
      });

      const targetAnchor = new THREE.Object3D();
      targetAnchor.name = 'catapultTargetAnchor';
      targetAnchor.position.set(-12, baseHeight + 1.2, 12);
      group.add(targetAnchor);
      const pivotSupport = new THREE.Mesh(getGeo(12, 12, 18), body);
      pivotSupport.position.set(20, baseHeight + 5.5, 0);
      group.add(pivotSupport);
      this.addLauncherArm(group, params, {
        baseHeight,
        kitZ: 26,
        materials: { body, ammo: makeAmmoMaterial() }
      });
      return group;
    }

    buildTrebuchet(params) {
      const group = new THREE.Group();
      const armLength = parseFloat(params.armLength) || PH_CONFIG.CATAPULT.DEFAULT_ARM_LENGTH;
      const baseHeight = Math.max(6, parseFloat(params.extrudeHeight) || PH_CONFIG.CATAPULT.DEFAULT_EXTRUDE_HEIGHT);
      const body = makeBodyMaterial(params.colorPrimary || 0x10b981);
      const baseLength = armLength + 34;
      const base = new THREE.Mesh(getGeo(baseLength, baseHeight, 32), body);
      base.name = 'trebuchetBase';
      base.position.y = baseHeight / 2;
      group.add(base);

      const pivotX = 5;
      const pivotY = baseHeight + 31;
      const frameDepth = 24;
      [-1, 1].forEach(side => {
        const z = side * 9;
        addBeamBetween(group, [pivotX, baseHeight + 1, z], [pivotX - 19, baseHeight + 29, z], 5.2, body);
        addBeamBetween(group, [pivotX, baseHeight + 1, z], [pivotX + 19, baseHeight + 29, z], 5.2, body);
      });
      const crossbar = new THREE.Mesh(getGeo(8, 8, frameDepth), body);
      crossbar.position.set(pivotX, pivotY, 0);
      group.add(crossbar);
      const targetAnchor = new THREE.Object3D();
      targetAnchor.name = 'catapultTargetAnchor';
      targetAnchor.position.set(-12, baseHeight + 1.2, 12);
      group.add(targetAnchor);
      this.addLauncherArm(group, params, {
        baseHeight,
        pivotX,
        pivotY,
        beamLength: armLength,
        beamCenterX: -armLength * 0.22,
        cupX: -armLength * 0.72,
        launchY: 6.3,
        beamHeight: 5.6,
        depth: 7,
        sling: true,
        kitZ: 22,
        counterweight: { x: armLength * 0.28, y: -7 },
        materials: { body, ammo: makeAmmoMaterial() }
      });
      return group;
    }

    buildBridge(params, kind) {
      const group = new THREE.Group();
      const span = parseFloat(params.armLength) || PH_CONFIG.BALANCER.DEFAULT_SPAN_REF;
      const body = makeBodyMaterial(params.colorPrimary || 0x10b981);
      const deckY = 13;
      const deckWidth = 24;
      const halfSpan = span / 2;
      const deck = new THREE.Mesh(getGeo(span, 5, deckWidth), body);
      deck.name = kind === 'truss' ? 'trussBridgeDeck' : 'archBridgeDeck';
      deck.position.y = deckY;
      group.add(deck);
      [-1, 1].forEach(side => {
        const z = side * 8;
        const pier = new THREE.Mesh(getGeo(10, deckY, 8), body);
        pier.position.set(side * (halfSpan - 2), deckY / 2, z);
        group.add(pier);
      });

      if (kind === 'truss') {
        const railY = deckY + 18;
        [-9, 9].forEach(z => {
          addBeamBetween(group, [-halfSpan, deckY + 3, z], [halfSpan, deckY + 3, z], 3.8, body);
          addBeamBetween(group, [-halfSpan, railY, z], [halfSpan, railY, z], 3.8, body);
          const panels = Math.max(4, Math.round(span / 12));
          for (let i = 0; i <= panels; i++) {
            const x = -halfSpan + span * i / panels;
            addBeamBetween(group, [x, deckY + 3, z], [x, railY, z], 3.2, body);
            if (i < panels) {
              const nextX = -halfSpan + span * (i + 1) / panels;
              const lower = (i % 2 === 0) ? x : nextX;
              const upper = (i % 2 === 0) ? nextX : x;
              addBeamBetween(group, [lower, deckY + 3, z], [upper, railY, z], 3.4, body);
            }
          }
        });
        addBeamBetween(group, [0, railY, -9], [0, railY, 9], 3.2, body);
      } else {
        [-9, 9].forEach(z => {
          const archPoints = [];
          const pieces = Math.max(12, Math.round(span / 4));
          for (let i = 0; i <= pieces; i++) {
            const t = i / pieces;
            const x = -halfSpan + span * t;
            const y = deckY + 2 + Math.sin(Math.PI * t) * 16;
            archPoints.push(new THREE.Vector3(x, y, z));
          }
          const curve = new THREE.CatmullRomCurve3(archPoints);
          const arch = new THREE.Mesh(new THREE.TubeGeometry(curve, pieces, 2.1, 6, false), body);
          group.add(arch);
          for (let i = 1; i < 8; i++) {
            const t = i / 8;
            const x = -halfSpan + span * t;
            const y = deckY + 2 + Math.sin(Math.PI * t) * 16;
            addBeamBetween(group, [x, deckY + 2.5, z], [x, y, z], 2.6, body);
          }
        });
        [-11, 11].forEach(z => {
          addBeamBetween(group, [-halfSpan, deckY + 6, z], [halfSpan, deckY + 6, z], 2.4, body);
        });
      }

      const start = new THREE.Object3D();
      start.name = 'bridgeProbeStart';
      start.position.set(-halfSpan + 5, deckY + 7, 0);
      group.add(start);
      const end = new THREE.Object3D();
      end.name = 'bridgeProbeEnd';
      end.position.set(halfSpan - 5, deckY + 7, 0);
      group.add(end);
      return group;
    }

    buildBallista(params) {
      const group = new THREE.Group();
      const armLength = parseFloat(params.armLength) || PH_CONFIG.CATAPULT.DEFAULT_ARM_LENGTH;
      const baseHeight = Math.max(6, parseFloat(params.extrudeHeight) || PH_CONFIG.CATAPULT.DEFAULT_EXTRUDE_HEIGHT);
      const includeAmmo = params.includeAmmo !== false;
      const mats = createPhysicsMaterials({
        body: params.colorPrimary || 0x10b981,
        accent: params.colorAccent || 0xf59e0b
      });
      const body = mats.body;
      const bowX = 22;
      const bowHalfSpan = 22;
      const baseLeft = bowX - armLength - 7;
      const baseRight = 38;
      const baseShape = new THREE.Shape();
      baseShape.moveTo(baseLeft, -13);
      baseShape.lineTo(15, -13);
      baseShape.lineTo(26, -bowHalfSpan);
      baseShape.lineTo(baseRight, -bowHalfSpan);
      baseShape.lineTo(baseRight, bowHalfSpan);
      baseShape.lineTo(26, bowHalfSpan);
      baseShape.lineTo(15, 13);
      baseShape.lineTo(baseLeft, 13);
      baseShape.closePath();
      const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
        depth: baseHeight,
        bevelEnabled: false,
        curveSegments: 2
      });
      baseGeo.rotateX(Math.PI / 2);
      const base = new THREE.Mesh(baseGeo, body);
      base.name = 'ballistaBase';
      base.position.y = baseHeight;
      group.add(base);
      const targetAnchor = new THREE.Object3D();
      targetAnchor.name = 'ballistaTargetAnchor';
      targetAnchor.position.set(0, baseHeight + 2, 12);
      group.add(targetAnchor);

      // A flared bow and a long central track make a crossbow silhouette in one color.
      const limbY = baseHeight + 2.4;
      [[bowHalfSpan, 1], [-bowHalfSpan, -1]].forEach(([tipZ, sign]) => {
        const fromX = bowX - 7;
        const fromZ = 0;
        const toX = bowX + 5;
        const toZ = tipZ;
        const dx = toX - fromX;
        const dz = toZ - fromZ;
        const limb = new THREE.Mesh(getGeo(Math.hypot(dx, dz), 5.2, 5.4), body);
        limb.position.set((fromX + toX) / 2, limbY, sign * Math.abs(toZ) / 2);
        limb.rotation.y = Math.atan2(-dz, dx);
        group.add(limb);
      });
      const stringMesh = new THREE.Mesh(getGeo(3.2, 3.2, bowHalfSpan * 2 - 5), body);
      stringMesh.position.set(bowX + 5, limbY, 0);
      group.add(stringMesh);

      const rail = new THREE.Mesh(getGeo(armLength, 4.4, 9), body);
      rail.name = 'ballistaTrack';
      rail.position.set(bowX - armLength / 2, baseHeight + 4.2, 0);
      group.add(rail);
      const carriageX = -armLength / 2;
      const carriage = new THREE.Group();
      carriage.name = 'ballistaCarriage';
      carriage.position.set(carriageX, baseHeight + 7, 0);
      carriage.userData.homeX = carriageX;
      const carriageBlock = new THREE.Mesh(getGeo(10, 4, 14), body);
      carriage.add(carriageBlock);
      const loadedBolt = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 12, 8),
        mats.ammo
      );
      loadedBolt.rotation.z = Math.PI / 2;
      loadedBolt.userData.exportable = false;
      loadedBolt.name = 'restingAmmo';
      carriage.add(loadedBolt);
      group.add(carriage);
      if (includeAmmo) addPrintedAmmoKit(group, body, bowHalfSpan + 10);

      return group;
    }

    // =========================================================================
    // ПІДРЕЖИМ Б: ГРАВІТАЦІЙНИЙ БАЛАНСИР «МАГІЧНА РІВНОВАГА»
    // =========================================================================
    buildBalancer(params) {
      const group = new THREE.Group();

      const thickness = parseFloat(params.extrudeHeight) || PH_CONFIG.BALANCER.DEFAULT_THICKNESS; // Товщина пластини, мм
      const wingWeight = parseFloat(params.wingWeight) || PH_CONFIG.BALANCER.DEFAULT_WING_WEIGHT;  // Товщина баласту на кінцях крил, мм
      const spanScale = (parseFloat(params.armLength) || PH_CONFIG.BALANCER.DEFAULT_SPAN_REF) / PH_CONFIG.BALANCER.DEFAULT_SPAN_REF; // Масштаб розмаху крил
      const includeStand = params.includeAmmo !== false; // Пірамідка-п'єдестал у комплекті

      const {
        body: matBody,
        accent: matWeights
      } = createPhysicsMaterials({
        body: params.colorPrimary || 0x8b5cf6,
        bodyRoughness: 0.35,
        bodyMetalness: 0.2,
        accent: params.colorAccent || 0xf59e0b,
        accentRoughness: 0.28,
        accentMetalness: 0.35
      });

      // The animal silhouette and its two weighted tips are voxels; exact cell
      // dimensions avoid coplanar overlap bands when rendered in one material.
      const fromSpans = rows => rows.map((spans, rowIndex) => {
        const cells = Array(19).fill('.');
        spans.forEach(([start, end, value = '1']) => {
          for (let col = start; col <= end; col++) cells[col] = value;
        });
        if (rowIndex === PH_CONFIG.BALANCER.PIVOT_ROW) cells[PH_CONFIG.BALANCER.PIVOT_COL] = '3';
        return cells.join('');
      });
      const patterns = {
        balance_dragon: [
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
        ],
        balance_owl: fromSpans([
          [[4, 5], [13, 14]],
          [[3, 6], [12, 15]],
          [[2, 7], [11, 16]],
          [[1, 17]],
          [[0, 0, '2'], [2, 16], [18, 18, '2']],
          [[1, 17]],
          [[2, 16]],
          [[3, 15]],
          [[4, 14]],
          [[4, 14]],
          [[5, 13]],
          [[6, 12]],
          [[7, 11]],
          [[6, 8], [10, 12]],
          [[5, 7], [11, 13]]
        ]),
        balance_turtle: fromSpans([
          [[0, 3, '2'], [15, 18, '2']],
          [[1, 4, '2'], [14, 17, '2']],
          [[3, 15]],
          [[4, 14]],
          [[3, 15]],
          [[2, 16]],
          [[1, 17]],
          [[2, 16]],
          [[3, 15]],
          [[4, 14]],
          [[5, 13]],
          [[3, 5], [13, 15]],
          [[2, 5], [13, 16]],
          [[2, 5], [13, 16]],
          [[0, 4, '2'], [14, 18, '2']]
        ])
      };
      const pattern = patterns[params.design] || patterns.balance_dragon;

      const balancerGroup = new THREE.Group();
      balancerGroup.name = 'balancerBodyGroup';

      const vx = PH_CONFIG.BALANCER.VOXEL_SCALE * spanScale; // розмір клітинки, мм
      const pivotRow = PH_CONFIG.BALANCER.PIVOT_ROW;
      const pivotCol = PH_CONFIG.BALANCER.PIVOT_COL;

      for (let r = 0; r < pattern.length; r++) {
        const rowStr = pattern[r];
        for (let c = 0; c < rowStr.length; c++) {
          const ch = rowStr[c];
          if (ch === '.') continue;

          const isWeight = ch === '2';
          const isNose = ch === '3';
          const h = isWeight ? wingWeight : thickness;

          const geo = getGeo(vx, h, vx);
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
      const nibGeo = new THREE.ConeGeometry(vx * 0.65, PH_CONFIG.BALANCER.NIB_HEIGHT, 12);
      const nibMesh = new THREE.Mesh(nibGeo, matWeights);
      nibMesh.position.set(0, thickness + 1.5, 0);
      balancerGroup.add(nibMesh);

      group.add(balancerGroup);

      // Якщо увімкнено "Пірамідка-П'єдестал у комплекті" — ставимо її поруч для друку
      if (includeStand) {
        const standGroup = new THREE.Group();
        const steps = PH_CONFIG.BALANCER.STAND_STEPS;
        for (let s = 0; s < steps; s++) {
          const w = PH_CONFIG.BALANCER.STAND_BASE_WIDTH - s * PH_CONFIG.BALANCER.STAND_STEP_SHRINK;
          const stepH = PH_CONFIG.BALANCER.STAND_STEP_HEIGHT;
          const sGeo = getGeo(w, stepH, w);
          const sMesh = new THREE.Mesh(sGeo, s === steps - 1 ? matWeights : matBody);
          sMesh.position.set(0, s * stepH + stepH / 2, 48);
          standGroup.add(sMesh);
        }
        group.add(standGroup);
      }

      return group;
    }

    resetInteractiveDemo(sceneManager) {
      if (!sceneManager) return;
      clearDemoEffects(sceneManager);
      const model = sceneManager.modelGroup;
      model?.getObjectByName('catapultArmPivot')?.rotation.set(0, 0, 0);
      const carriage = model?.getObjectByName('ballistaCarriage');
      if (carriage) carriage.position.x = carriage.userData.homeX || 0;
      model?.getObjectByName('balancerBodyGroup')?.rotation.set(0, 0, 0);
      model?.traverse(object => {
        if (object.name === 'restingAmmo') object.visible = true;
      });
      setDemoResult('Екранна демонстрація — не прогноз сили або міцності.');
    }

    // All targets and moving projectiles belong to effectsGroup and stay out of STL.
    triggerInteractiveDemo(sceneManager, submode, params = {}) {
      if (!sceneManager || !sceneManager.modelGroup || !sceneManager.effectsGroup) return;
      this.resetInteractiveDemo(sceneManager);
      const model = sceneManager.modelGroup;

      if (submode === 'balancer') {
        const balancer = model.getObjectByName('balancerBodyGroup');
        if (!balancer) return;
        const wingWeight = Math.max(7, Math.min(16, parseFloat(params.wingWeight) || PH_CONFIG.BALANCER.DEFAULT_WING_WEIGHT));
        const span = Math.max(52, Math.min(85, parseFloat(params.armLength) || PH_CONFIG.BALANCER.DEFAULT_SPAN_REF));
        const momentProxy = wingWeight * span;
        const settleAngle = 0.04 + 0.35 * Math.sqrt((7 * 52) / momentProxy);
        const settleDegrees = Math.round(settleAngle * 180 / Math.PI);
        const animal = params.design === 'balance_owl' ? 'сова' : params.design === 'balance_turtle' ? 'черепаха' : 'дракон';
        if (window.StudioSound?.playBalancerWobble) window.StudioSound.playBalancerWobble();
        setDemoResult(`Екранний нахил «${animal}» після умовного поштовху: ${settleDegrees}°. Більша вага × розмах зменшує нахил у цій моделі; це не вимір сили.`);
        let elapsed = 0;
        sceneManager.physicsUpdateFn = (dt) => {
          elapsed += dt;
          if (elapsed > PH_CONFIG.DEMO.BALANCER_DURATION) {
            balancer.rotation.set(0, 0, settleAngle);
            sceneManager.physicsUpdateFn = null;
            setDemoResult(`Модель осіла на ${settleDegrees}°. Зміни вагу крил або розмах і порівняй екранну реакцію; це не доказ реальної стійкості чи міцності.`);
            return;
          }
          const damp = Math.exp(-elapsed * 0.72);
          const ease = 1 - Math.exp(-elapsed * 1.1);
          balancer.rotation.x = Math.sin(elapsed * 5.5) * 0.12 * damp;
          balancer.rotation.z = settleAngle * ease + Math.cos(elapsed * 4.2) * 0.12 * damp;
        };
        return;
      }

      const design = params.design || 'classic';
      if (design === 'truss_bridge' || design === 'arch_bridge') {
        const startAnchor = model.getObjectByName('bridgeProbeStart');
        const endAnchor = model.getObjectByName('bridgeProbeEnd');
        if (!startAnchor || !endAnchor) return;
        const start = startAnchor.getWorldPosition(new THREE.Vector3());
        const landing = endAnchor.getWorldPosition(new THREE.Vector3());
        const target = addScreenTarget(sceneManager, landing);
        const probe = addScreenProjectile(sceneManager, design === 'truss_bridge' ? 0x38bdf8 : 0xf59e0b);
        setDemoResult('Екранний пробник перетинає прогін мосту; навантаження не вимірюється.');
        let elapsed = 0;
        const duration = 1.55;
        sceneManager.physicsUpdateFn = dt => {
          elapsed += dt;
          const progress = Math.min(1, elapsed / duration);
          const eased = progress * progress * (3 - 2 * progress);
          probe.position.lerpVectors(start, landing, eased);
          probe.position.y += Math.sin(progress * Math.PI) * 2;
          probe.rotation.z += dt * 6;
          if (progress >= 1) {
            target.children.forEach(ring => ring.material.color.setHex(0x22c55e));
            sceneManager.physicsUpdateFn = null;
            setDemoResult('Екранний пробник дістався кінця прогону. Це анімація маршруту, не перевірка вантажності чи міцності.');
          }
        };
        return;
      }

      const isBallista = design === 'ballista_bow';
      const armLength = parseFloat(params.armLength) || PH_CONFIG.CATAPULT.DEFAULT_ARM_LENGTH;
      const armPivot = model.getObjectByName('catapultArmPivot');
      const carriage = model.getObjectByName('ballistaCarriage');
      const launchPoint = isBallista ? carriage : model.getObjectByName('catapultLaunchPoint');
      const targetAnchor = model.getObjectByName(isBallista ? 'ballistaTargetAnchor' : 'catapultTargetAnchor');
      if (!launchPoint || !targetAnchor) return;
      let start;
      if (isBallista) {
        start = launchPoint.getWorldPosition(new THREE.Vector3());
      } else {
        const pivotWorld = armPivot.getWorldPosition(new THREE.Vector3());
        const pivotRotation = armPivot.getWorldQuaternion(new THREE.Quaternion());
        const localOffset = launchPoint.position.clone().applyQuaternion(pivotRotation);
        start = pivotWorld.add(localOffset);
      }
      const targetPosition = targetAnchor.getWorldPosition(new THREE.Vector3());
      const landing = targetPosition.clone();
      landing.x += (armLength - PH_CONFIG.CATAPULT.DEFAULT_ARM_LENGTH) * 0.9;
      const target = addScreenTarget(sceneManager, targetPosition);
      const projectile = addScreenProjectile(sceneManager, isBallista ? 0xf97316 : 0xef4444);
      model.traverse(object => {
        if (object.name === 'restingAmmo') object.visible = false;
      });
      const hit = landing.distanceTo(targetPosition) <= 6;
      if (isBallista && window.StudioSound?.playCatapultLaunch) window.StudioSound.playCatapultLaunch();
      if (!isBallista && window.StudioSound?.playCatapultLaunch) window.StudioSound.playCatapultLaunch();
      setDemoResult('Екранна демонстрація: снаряд летить до кільцевої мішені.');

      let elapsed = 0;
      const launchDelay = 0.22;
      const flightDuration = 1.35;
      sceneManager.physicsUpdateFn = (dt) => {
        elapsed += dt;
        if (armPivot) {
          const pull = Math.min(1, elapsed / 0.18);
          const release = Math.max(0, Math.min(1, (elapsed - 0.18) / 0.12));
          armPivot.rotation.z = elapsed < 0.18 ? -0.34 * pull : -0.34 + 0.46 * release;
          if (elapsed > 0.3) armPivot.rotation.z *= Math.exp(-(elapsed - 0.3) * 4.2);
        }
        if (carriage) {
          const homeX = carriage.userData.homeX || 0;
          carriage.position.x = homeX + (elapsed < 0.25 ? 0 : 5 * Math.max(0, 1 - (elapsed - 0.25) * 2));
        }

        if (elapsed < launchDelay) {
          projectile.position.copy(start);
          return;
        }
        const progress = Math.min(1, (elapsed - launchDelay) / flightDuration);
        const eased = progress * progress * (3 - 2 * progress);
        projectile.position.x = start.x + (landing.x - start.x) * eased;
        projectile.position.y = targetPosition.y + (start.y - targetPosition.y) * (1 - progress) + Math.sin(progress * Math.PI) * 26;
        projectile.position.z = start.z + (landing.z - start.z) * eased + Math.sin(progress * Math.PI) * 3;
        projectile.rotation.x += dt * 8;
        projectile.rotation.z += dt * 10;

        if (progress >= 1) {
          if (armPivot) armPivot.rotation.set(0, 0, 0);
          if (carriage) carriage.position.x = carriage.userData.homeX || 0;
          target.children.forEach(ring => ring.material.color.setHex(hit ? 0x22c55e : 0xf59e0b));
          sceneManager.physicsUpdateFn = null;
          setDemoResult(hit
            ? 'Влучання в екранну мішень! Це візуальна вправа, не вимір сили чи дальності.'
            : 'Спробуй іншу довжину важеля й повтори екранний запуск.');
        }
      };
    }
  }

  PhysicsMechanicsGenerator.supportedDesignKeys = Object.freeze([
    'classic',
    'ballista_bow',
    'frog_launcher',
    'trebuchet',
    'truss_bridge',
    'arch_bridge',
    'balance_dragon',
    'balance_owl',
    'balance_turtle'
  ]);

  window.PhysicsMechanicsGenerator = PhysicsMechanicsGenerator;
})();
