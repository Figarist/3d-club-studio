// 3D Рушій студії "3D Кузня Чудес": Three.js сцена, Стіл 3D-принтера, Симулятор Пошарового Друку та Експорт у .STL
(function () {
  class SceneManager {
    constructor(containerId) {
      this.containerId = containerId;
      this.container = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.modelGroup = null;     // Головна група 3D-моделі (експортується в .STL)
      this.effectsGroup = null;   // Допоміжні візуальні ефекти (снаряди, лазер сопла, маркер центру мас)

      // Камера (сферичні координати для плавного керування мишкою та анімації ракурсів)
      this.spherical = {
        radius: 145,
        theta: Math.PI / 4,      // Горизонтальний кут
        phi: Math.PI / 3,        // Вертикальний кут
        target: new THREE.Vector3(0, 18, 0)
      };
      this.targetSpherical = {
        radius: 145,
        theta: Math.PI / 4,
        phi: Math.PI / 3,
        target: new THREE.Vector3(0, 18, 0)
      };

      this.isDragging = false;
      this.isRightDrag = false;
      this.prevMouse = { x: 0, y: 0 };
      this._panTempVec = new THREE.Vector3(); // Попередньо алокований вектор для панорамування
      this._popMinScale = new THREE.Vector3(0.01, 0.01, 0.01); // Попередньо алокований вектор для анімації появи

      // Анімація збирання блоків
      this.popAnimBlocks = [];
      this.clock = new THREE.Clock();

      // Симуляція 3D-друку (пошаровий зріз)
      this.slicerActive = false;
      this.slicerProgress = 1.0;
      this.slicerMaxY = 40;
      this.clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 500);
      this.nozzleMesh = null;

      // Фізична анімація (катапульта / балансир)
      this.physicsUpdateFn = null;

      // Розміри поточної моделі (мм)
      this.dimensions = { x: 0, y: 0, z: 0, volumeCm3: 0, estMinutes: 0 };
    }

    init() {
      this.container = document.getElementById(this.containerId);
      if (!this.container) return;

      const w = this.container.clientWidth || 800;
      const h = this.container.clientHeight || 600;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0b1320);
      this.scene.fog = new THREE.FogExp2(0x0b1320, 0.0018);

      this.camera = new THREE.PerspectiveCamera(42, w / h, 1, 1500);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.localClippingEnabled = true;

      this.container.innerHTML = '';
      this.container.appendChild(this.renderer.domElement);

      this.setupLights();
      this.setupPrintBed();

      this.modelGroup = new THREE.Group();
      this.scene.add(this.modelGroup);

      this.effectsGroup = new THREE.Group();
      this.scene.add(this.effectsGroup);

      this.setupNozzle();
      this.setupControls();

      window.addEventListener('resize', () => this.onResize());
      this.animate();
    }

    setupLights() {
      const hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.75);
      hemi.position.set(0, 200, 0);
      this.scene.add(hemi);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
      dirLight.position.set(90, 160, 110);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 450;
      const d = 110;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      this.scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
      rimLight.position.set(-100, 80, -90);
      this.scene.add(rimLight);
    }

    setupPrintBed() {
      const bedGroup = new THREE.Group();

      // Стіл 3D-принтера 200x200 мм (1 одиниця = 1 мм)
      const bedGeo = new THREE.BoxGeometry(200, 2, 200);
      const bedMat = new THREE.MeshStandardMaterial({
        color: 0x111c2d,
        roughness: 0.8,
        metalness: 0.2
      });
      const bedMesh = new THREE.Mesh(bedGeo, bedMat);
      bedMesh.position.y = -1.05;
      bedMesh.receiveShadow = true;
      bedGroup.add(bedMesh);

      // Сітка 200x200 мм (крок 10 мм)
      const grid = new THREE.GridHelper(200, 20, 0x10b981, 0x1e3a5f);
      grid.position.y = 0.02;
      bedGroup.add(grid);

      // Дрібна сітка в центрі 100x100 мм (крок 5 мм)
      const fineGrid = new THREE.GridHelper(100, 20, 0x059669, 0x17253b);
      fineGrid.position.y = 0.01;
      bedGroup.add(fineGrid);

      // Неонова рамка по краю столу
      const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(202, 2.2, 202));
      const borderMat = new THREE.LineBasicMaterial({ color: 0x10b981 });
      const borderLine = new THREE.LineSegments(borderGeo, borderMat);
      borderLine.position.y = -1.0;
      bedGroup.add(borderLine);

      // Позначка "ПЕРЕД (FRONT)" на передній грані столу (Z = +100)
      const frontIndicatorGeo = new THREE.BoxGeometry(60, 1.5, 3);
      const frontIndicatorMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const frontIndicator = new THREE.Mesh(frontIndicatorGeo, frontIndicatorMat);
      frontIndicator.position.set(0, 0.2, 100);
      bedGroup.add(frontIndicator);

      this.scene.add(bedGroup);
    }

    setupNozzle() {
      // Віртуальне сопло (екструдер) для режиму "Симуляція 3D-принтера"
      const group = new THREE.Group();

      const coneGeo = new THREE.ConeGeometry(4, 10, 16);
      coneGeo.rotateX(Math.PI);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xd97706,
        emissiveIntensity: 0.4
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 5;
      group.add(cone);

      const blockGeo = new THREE.BoxGeometry(14, 10, 14);
      const blockMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.y = 14;
      group.add(block);

      const glowGeo = new THREE.SphereGeometry(2.2, 12, 12);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.y = 0.5;
      group.add(glow);

      group.visible = false;
      this.nozzleMesh = group;
      this.scene.add(this.nozzleMesh);
    }

    setupControls() {
      const dom = this.renderer.domElement;

      dom.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.isRightDrag = e.button === 2 || e.shiftKey;
        this.prevMouse.x = e.clientX;
        this.prevMouse.y = e.clientY;
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.prevMouse.x;
        const dy = e.clientY - this.prevMouse.y;
        this.prevMouse.x = e.clientX;
        this.prevMouse.y = e.clientY;

        if (this.isRightDrag) {
          // Панорамування
          const panSpeed = 0.18;
          const right = this._panTempVec;
          this.camera.getWorldDirection(right);
          right.cross(this.camera.up).normalize();
          this.targetSpherical.target.addScaledVector(right, -dx * panSpeed);
          this.targetSpherical.target.y = Math.max(0, Math.min(120, this.targetSpherical.target.y + dy * panSpeed));
        } else {
          // Обертання
          this.targetSpherical.theta -= dx * 0.0085;
          this.targetSpherical.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.02, this.targetSpherical.phi - dy * 0.0085));
        }
      });

      dom.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.targetSpherical.radius = Math.max(45, Math.min(340, this.targetSpherical.radius + e.deltaY * 0.12));
      }, { passive: false });

      dom.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Плавний поворот камери в заданий ракурс (наприклад, для оптичної ілюзії 0° та 90°)
    setCameraView(preset) {
      if (window.StudioSound) window.StudioSound.playCameraSwoosh(preset);
      if (preset === 'front') {
        this.targetSpherical.theta = 0;
        this.targetSpherical.phi = Math.PI / 2.25;
        this.targetSpherical.radius = 135;
      } else if (preset === 'side90') {
        this.targetSpherical.theta = Math.PI / 2;
        this.targetSpherical.phi = Math.PI / 2.25;
        this.targetSpherical.radius = 135;
      } else if (preset === 'top') {
        this.targetSpherical.theta = 0;
        this.targetSpherical.phi = 0.15;
        this.targetSpherical.radius = 150;
      } else {
        // Ізометрія за замовчуванням
        this.targetSpherical.theta = Math.PI / 4;
        this.targetSpherical.phi = Math.PI / 3.1;
        this.targetSpherical.radius = 145;
      }
    }

    // Рекурсивне звільнення GPU-ресурсів (геометрії та матеріалів) для запобігання витоку WebGL-пам'яті
    _disposeRecursive(obj) {
      if (obj.children) {
        for (let i = obj.children.length - 1; i >= 0; i--) {
          this._disposeRecursive(obj.children[i]);
        }
      }
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    clearModel() {
      this.stopSlicerSimulation();
      this.physicsUpdateFn = null;
      this.popAnimBlocks = [];

      while (this.modelGroup.children.length > 0) {
        const obj = this.modelGroup.children[0];
        this._disposeRecursive(obj);
        this.modelGroup.remove(obj);
      }
      while (this.effectsGroup.children.length > 0) {
        const obj = this.effectsGroup.children[0];
        this._disposeRecursive(obj);
        this.effectsGroup.remove(obj);
      }
    }

    // Додає 3D-групу в сцену, вирівнює низ рівно по Z=0 (Y=0 в Three.js) та запускає ВАУ-анімацію збирання
    setModel(group, animatePop = true) {
      this.clearModel();

      // Обчислюємо габарити і ставимо модель рівно на стіл принтера (minY = 0)
      group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(group);
      if (!box.isEmpty()) {
        const center = new THREE.Vector3();
        box.getCenter(center);
        group.position.x -= center.x;
        group.position.z -= center.z;
        group.position.y -= box.min.y;
      }

      this.modelGroup.add(group);
      this.modelGroup.updateMatrixWorld(true);

      // Підключаємо площину зрізу для симулятора друку та тіні
      const meshes = [];
      group.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.clippingPlanes = [this.clipPlane];
            child.material.clipShadows = true;
          }
          meshes.push(child);
        }
      });

      // Оновлюємо розміри моделі в мм
      const finalBox = new THREE.Box3().setFromObject(this.modelGroup);
      const size = new THREE.Vector3();
      finalBox.getSize(size);

      this.dimensions = {
        x: Math.round(size.x * 10) / 10,
        y: Math.round(size.z * 10) / 10, // Глибина на столі
        z: Math.round(size.y * 10) / 10  // Висота друку
      };

      // Орієнтовний час друку на простому принтері (швидкість ~40 мм/с, шар 0.25 мм)
      const approxVolCm3 = Math.max(1, (size.x * size.y * size.z * 0.32) / 1000);
      this.dimensions.volumeCm3 = Math.round(approxVolCm3 * 10) / 10;
      this.dimensions.estMinutes = Math.max(8, Math.round(approxVolCm3 * 3.2));

      this.slicerMaxY = Math.max(10, size.y + 2);
      this.clipPlane.constant = 500;

      // Центруємо камеру по висоті моделі
      this.targetSpherical.target.set(0, Math.min(40, size.y * 0.45), 0);

      // Анімація "падіння блоків як у Майнкрафті"
      if (animatePop) {
        if (window.StudioSound && meshes.length > 0) {
          window.StudioSound.playBlockCascade(meshes.length);
        }
        meshes.forEach((m, idx) => {
          const targetY = m.position.y;
          const targetScale = m.scale.clone();
          m.position.y = targetY + 25 + Math.random() * 25;
          m.scale.set(0.01, 0.01, 0.01);
          this.popAnimBlocks.push({
            mesh: m,
            targetY,
            targetScale,
            delay: Math.min(0.35, idx * 0.0035),
            elapsed: 0
          });
        });
      }

      this.updateDimensionsUI();
    }

    updateDimensionsUI() {
      const dimEl = document.getElementById('model-dimensions-badge');
      if (dimEl) {
        dimEl.textContent = `📏 Розмір: ${this.dimensions.x} × ${this.dimensions.y} × ${this.dimensions.z} мм | ⏱️ Друк: ~${this.dimensions.estMinutes} хв`;
      }
    }

    // Запуск лазерної симуляції пошарового 3D-друку
    startSlicerSimulation() {
      if (this.slicerActive) {
        this.stopSlicerSimulation();
        return false;
      }
      this.slicerActive = true;
      this.slicerProgress = 0.02;
      this.nozzleMesh.visible = true;
      const btn = document.getElementById('btn-simulate-print');
      if (btn) btn.classList.add('active-sim');
      return true;
    }

    stopSlicerSimulation() {
      this.slicerActive = false;
      this.clipPlane.constant = 500;
      if (this.nozzleMesh) this.nozzleMesh.visible = false;
      const btn = document.getElementById('btn-simulate-print');
      if (btn) {
        btn.classList.remove('active-sim');
        btn.textContent = '🔥 Симуляція 3D-Принтера';
      }
    }

    // Експорт поточної моделі у бінарний .STL файл (100% сумісний з Tinkercad, Makers Empire, Cura, PrusaSlicer)
    exportBinarySTL(filename = '3d_model_for_printer.stl') {
      this.stopSlicerSimulation();
      this.modelGroup.updateMatrixWorld(true);

      const triangles = [];

      this.modelGroup.traverse((child) => {
        if (!child.isMesh || child.userData.exportable === false) return;
        let geom = child.geometry.clone();
        geom.applyMatrix4(child.matrixWorld);

        if (geom.index !== null) {
          const nonIndexed = geom.toNonIndexed();
          geom.dispose();
          geom = nonIndexed;
        }

        const pos = geom.attributes.position;
        if (!pos) {
          geom.dispose();
          return;
        }

        for (let i = 0; i < pos.count; i += 3) {
          // Перетворення з координат Three.js (X, Y-висота, Z-глибина)
          // у стандарт 3D-друку .STL (X, Y = -Z, Z = Y-висота), де визначник матриці = +1
          const v1 = new THREE.Vector3(pos.getX(i), -pos.getZ(i), pos.getY(i));
          const v2 = new THREE.Vector3(pos.getX(i + 1), -pos.getZ(i + 1), pos.getY(i + 1));
          const v3 = new THREE.Vector3(pos.getX(i + 2), -pos.getZ(i + 2), pos.getY(i + 2));

          const e1 = new THREE.Vector3().subVectors(v2, v1);
          const e2 = new THREE.Vector3().subVectors(v3, v1);
          const normal = new THREE.Vector3().crossVectors(e1, e2);

          if (normal.lengthSq() > 1e-12) {
            normal.normalize();
            triangles.push({ v1, v2, v3, normal });
          }
        }
        geom.dispose();
      });

      if (triangles.length === 0) {
        alert('Немає геометрії для експорту!');
        return;
      }

      // Гарантуємо, що найнижча точка моделі лежить РІВНО на Z = 0.00 мм столу принтера
      let minZ = Infinity;
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      for (const t of triangles) {
        for (const v of [t.v1, t.v2, t.v3]) {
          if (v.z < minZ) minZ = v.z;
          if (v.x < minX) minX = v.x;
          if (v.x > maxX) maxX = v.x;
          if (v.y < minY) minY = v.y;
          if (v.y > maxY) maxY = v.y;
        }
      }

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;

      for (const t of triangles) {
        for (const v of [t.v1, t.v2, t.v3]) {
          v.x -= cx;
          v.y -= cy;
          v.z -= minZ;
        }
      }

      // Записуємо бінарний STL (80 байт заголовок + 4 байти кількість трикутників + 50 байт на кожен трикутник)
      const bufferLength = 84 + triangles.length * 50;
      const arrayBuffer = new ArrayBuffer(bufferLength);
      const view = new DataView(arrayBuffer);

      const headerText = '3D Kuznya Chudes - Print-Safe STL for Tinkercad & FDM Printer';
      for (let i = 0; i < 80; i++) {
        view.setUint8(i, i < headerText.length ? headerText.charCodeAt(i) : 32);
      }

      view.setUint32(80, triangles.length, true);

      let offset = 84;
      for (const t of triangles) {
        view.setFloat32(offset, t.normal.x, true); offset += 4;
        view.setFloat32(offset, t.normal.y, true); offset += 4;
        view.setFloat32(offset, t.normal.z, true); offset += 4;

        for (const v of [t.v1, t.v2, t.v3]) {
          view.setFloat32(offset, v.x, true); offset += 4;
          view.setFloat32(offset, v.y, true); offset += 4;
          view.setFloat32(offset, v.z, true); offset += 4;
        }

        view.setUint16(offset, 0, true); offset += 2;
      }

      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.endsWith('.stl') ? filename : `${filename}.stl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.StudioSound) window.StudioSound.playExportSuccess();
    }

    onResize() {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    animate() {
      requestAnimationFrame(() => this.animate());
      const dt = Math.min(0.05, this.clock.getDelta());

      // Плавна інтерполяція камери
      this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * 0.14;
      this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * 0.14;
      this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * 0.14;
      this.spherical.target.lerp(this.targetSpherical.target, 0.14);

      const r = this.spherical.radius;
      const sinPhi = Math.sin(this.spherical.phi);
      this.camera.position.x = this.spherical.target.x + r * sinPhi * Math.sin(this.spherical.theta);
      this.camera.position.y = this.spherical.target.y + r * Math.cos(this.spherical.phi);
      this.camera.position.z = this.spherical.target.z + r * sinPhi * Math.cos(this.spherical.theta);
      this.camera.lookAt(this.spherical.target);

      // Анімація появи блоків
      if (this.popAnimBlocks.length > 0) {
        let anyActive = false;
        for (const item of this.popAnimBlocks) {
          item.elapsed += dt;
          if (item.elapsed < item.delay) {
            anyActive = true;
            continue;
          }
          const t = Math.min(1, (item.elapsed - item.delay) / 0.28);
          // Spring ease-out
          const ease = 1 - Math.pow(1 - t, 3);
          item.mesh.position.y = item.targetY + (1 - ease) * 28;
          item.mesh.scale.lerpVectors(this._popMinScale, item.targetScale, ease);
          if (t < 1) anyActive = true;
        }
        if (!anyActive) this.popAnimBlocks = [];
      }

      // Симуляція пошарового 3D-друку
      if (this.slicerActive) {
        this.slicerProgress += dt * 0.22;
        if (this.slicerProgress >= 1.05) {
          this.stopSlicerSimulation();
          if (window.StudioSound) window.StudioSound.playPrintComplete();
        } else {
          const currentH = this.slicerProgress * this.slicerMaxY;
          this.clipPlane.constant = currentH;
          const t = performance.now() * 0.012;
          const swingX = Math.sin(t * 2.3) * Math.min(35, this.dimensions.x * 0.35);
          const swingZ = Math.cos(t * 1.7) * Math.min(35, this.dimensions.y * 0.35);
          this.nozzleMesh.position.set(swingX, currentH, swingZ);

          if (Math.random() < 0.35 && window.StudioSound) {
            window.StudioSound.playPrinterStep(this.slicerProgress);
          }
        }
      }

      // Додаткова фізична симуляція (постріл катапульти або гойдання балансира)
      if (this.physicsUpdateFn) {
        this.physicsUpdateFn(dt);
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  window.SceneManager = SceneManager;
})();
