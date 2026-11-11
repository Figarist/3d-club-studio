// 3D Рушій студії "3D Кузня Чудес": Three.js сцена, Стіл 3D-принтера, Симулятор Пошарового Друку та Експорт у .STL
(function () {
  class SceneManager {
    constructor(containerId) {
      this.containerId = containerId;
      this.container = null;
      this.scene = null;
      this.camera = null;
      this.perspCamera = null;
      this.orthoCamera = null;
      this.isOrthographic = false;
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
      this._maxZoomRadius = 340;

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
      this._simLayerIndex = 0;
      this._simTotalLayers = 1;
      this._simLastPtIdx = -1;

      // Фізична анімація (катапульта / балансир)
      this.physicsUpdateFn = null;

      // Одноколірне прев'ю ("Як виглядатиме одним пластиком")
      this.isMonochrome = false;
      this.monochromeColor = 0xcfd6df; // Нейтральний сіро-сріблястий PLA пластик
      this.monochromeMaterial = new THREE.MeshStandardMaterial({
        color: this.monochromeColor,
        roughness: 0.9,
        metalness: 0,
        clippingPlanes: [this.clipPlane],
        clipShadows: true
      });

      // Розміри та чесна діагностика моделі (мм)
      this.dimensions = {
        x: 0,
        y: 0,
        z: 0,
        fitsBed: true,
        safeBed: true,
        isMini: false
      };
      this.onDimensionsUpdated = null;
      this.onUserCameraInteraction = null;
    }


    init() {
      this.container = document.getElementById(this.containerId);
      if (!this.container) return;

      const w = this.container.clientWidth || 800;
      const h = this.container.clientHeight || 600;
      this.cachedWidth = w;
      this.cachedHeight = h;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x1a1a2e);
      this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.0018);

      this.perspCamera = new THREE.PerspectiveCamera(42, w / h, 1, 1500);
      this.orthoCamera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 1, 1500);
      this.camera = this.perspCamera;
      this.updateOrthoProjection(w, h);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.localClippingEnabled = true;
      // Preserve relief shading on light plastic instead of clipping highlights.
      this.renderer.toneMapping = THREE.ReinhardToneMapping;
      this.renderer.toneMappingExposure = 1;

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
      window.addEventListener('orientationchange', () => {
        requestAnimationFrame(() => this.onResize());
        setTimeout(() => this.onResize(), 100);
        setTimeout(() => this.onResize(), 300);
      });
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => this.onResize());
      }
      if (window.ResizeObserver && this.container) {
        this._resizeObserver = new ResizeObserver(() => this.onResize());
        this._resizeObserver.observe(this.container);
      }
      this.animate();
    }

    setupLights() {
      const hemi = new THREE.HemisphereLight(0xdbeafe, 0x16213e, 0.75);
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

      // Матова скляна основа Anycubic Ultrabase 200x200 мм (1 одиниця = 1 мм)
      const bedGeo = new THREE.BoxGeometry(200, 2.4, 200);
      const bedMat = new THREE.MeshStandardMaterial({
        color: 0x0c121e,
        roughness: 0.88,
        metalness: 0.08
      });
      const bedMesh = new THREE.Mesh(bedGeo, bedMat);
      bedMesh.position.y = -1.21;
      bedMesh.receiveShadow = true;
      bedGroup.add(bedMesh);

      // Основна сітка 200x200 мм (крок 10 мм)
      const grid = new THREE.GridHelper(200, 20, 0x334155, 0x0f3460);
      grid.position.y = 0.02;
      bedGroup.add(grid);

      // Центральна точна сітка 100x100 мм (крок 5 мм)
      const fineGrid = new THREE.GridHelper(100, 20, 0x24334a, 0x141f31);
      fineGrid.position.y = 0.025;
      bedGroup.add(fineGrid);

      // Безпечна зона друку 190x190 мм (контур із приємним акцентом)
      const safeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(190, 0.2, 190));
      const safeMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.45 });
      const safeLine = new THREE.LineSegments(safeGeo, safeMat);
      safeLine.position.y = 0.03;
      bedGroup.add(safeLine);

      // Зовнішній мікро-кант столу 200x200 мм
      const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(200.4, 2.45, 200.4));
      const borderMat = new THREE.LineBasicMaterial({ color: 0x475569 });
      const borderLine = new THREE.LineSegments(borderGeo, borderMat);
      borderLine.position.y = -1.2;
      bedGroup.add(borderLine);

      // Гравірування центру столу (перехрестя ⊕)
      const crossMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.75 });
      const crossGeoX = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-8, 0.035, 0), new THREE.Vector3(8, 0.035, 0)]);
      const crossGeoZ = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.035, -8), new THREE.Vector3(0, 0.035, 8)]);
      bedGroup.add(new THREE.Line(crossGeoX, crossMat));
      bedGroup.add(new THREE.Line(crossGeoZ, crossMat));

      // Передній індикатор орієнтації "ПЕРЕД (FRONT) • ANYCUBIC 200×200"
      const frontBarGeo = new THREE.BoxGeometry(72, 1.4, 2.4);
      const frontBarMat = new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.6 });
      const frontBar = new THREE.Mesh(frontBarGeo, frontBarMat);
      frontBar.position.set(0, 0.1, 100);
      bedGroup.add(frontBar);

      const frontLipGeo = new THREE.BoxGeometry(32, 0.8, 1.0);
      const frontLipMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const frontLip = new THREE.Mesh(frontLipGeo, frontLipMat);
      frontLip.position.set(0, 0.45, 100.8);
      bedGroup.add(frontLip);

      this.scene.add(bedGroup);
    }

    setupNozzle() {
      // Реалістичний хотенд світового стандарту (латунне сопло 0.4 мм, алюмінієвий термоблок, радіатор)
      const group = new THREE.Group();

      // 1. Латунне сопло стандарту 0.4 мм (E3D V6 / MK8 Brass Nozzle)
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Золотиста латунь
        metalness: 0.88,
        roughness: 0.22
      });

      // Шестигранна основа під ключ (Hex Nut 7 мм)
      const hexGeo = new THREE.CylinderGeometry(3.5, 3.5, 3.2, 6);
      const hexNut = new THREE.Mesh(hexGeo, brassMat);
      hexNut.position.y = 1.6 + 2.4;
      group.add(hexNut);

      // Конічний наконечник (перехід від 6 мм до 0.4 мм на кінчику)
      const coneGeo = new THREE.CylinderGeometry(0.2, 2.8, 2.4, 18);
      const cone = new THREE.Mesh(coneGeo, brassMat);
      cone.position.y = 1.2;
      group.add(cone);

      // Калібрований вихідний отвір сопла 0.4 мм (діаметр 0.4 мм = радіус 0.2 мм)
      const orificeGeo = new THREE.CircleGeometry(0.2, 12);
      orificeGeo.rotateX(Math.PI / 2);
      const orificeMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
      const orifice = new THREE.Mesh(orificeGeo, orificeMat);
      orifice.position.y = 0.01;
      group.add(orifice);

      // Мікро-крапля свіжого розплавленого пластику на кінчику 0.4 мм
      const beadGeo = new THREE.SphereGeometry(0.28, 8, 8);
      const beadMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const bead = new THREE.Mesh(beadGeo, beadMat);
      bead.position.y = 0.15;
      group.add(bead);

      // 2. Алюмінієвий нагрівальний блок (Heater Block V6/MK8: 20 x 16 x 11.5 мм)
      const blockMat = new THREE.MeshStandardMaterial({
        color: 0xc4cbd4, // Матовий сріблястий алюміній
        metalness: 0.65,
        roughness: 0.35
      });
      const blockGeo = new THREE.BoxGeometry(16, 11.5, 20);
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(0, 3.2 + 2.4 + 11.5 / 2, 2.0);
      group.add(block);

      // Гніздо нагрівального патрона з гвинтом фіксації
      const heaterGeo = new THREE.CylinderGeometry(3.0, 3.0, 16.2, 12);
      heaterGeo.rotateZ(Math.PI / 2);
      const heaterMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.7, roughness: 0.3 });
      const heater = new THREE.Mesh(heaterGeo, heaterMat);
      heater.position.set(0, 3.2 + 2.4 + 4.5, 5.0);
      group.add(heater);

      // 3. Термобар'єр (Stainless Steel Throat 4 мм)
      const throatMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.85, roughness: 0.25 });
      const throatGeo = new THREE.CylinderGeometry(2.0, 2.0, 5, 16);
      const throat = new THREE.Mesh(throatGeo, throatMat);
      throat.position.y = 17.1 + 2.5;
      group.add(throat);

      // 4. Алюмінієвий радіатор охолодження з ребрами (Heat Sink V6)
      const sinkMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb, // Класичний анодований синій V6
        metalness: 0.65,
        roughness: 0.35
      });
      const finCount = 5;
      for (let i = 0; i < finCount; i++) {
        const finGeo = new THREE.CylinderGeometry(11, 11, 1.2, 24);
        const fin = new THREE.Mesh(finGeo, sinkMat);
        fin.position.y = 22.0 + i * 3.2;
        group.add(fin);
      }
      const coreGeo = new THREE.CylinderGeometry(6, 6, finCount * 3.2, 20);
      const core = new THREE.Mesh(coreGeo, sinkMat);
      core.position.y = 22.0 + (finCount * 3.2) / 2 - 1.6;
      group.add(core);

      // М'яке світло свіжого друку під соплом
      const glowGeo = new THREE.SphereGeometry(1.6, 10, 10);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.65 });
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

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          if (this.onUserCameraInteraction) this.onUserCameraInteraction();
        }

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
        this.targetSpherical.radius = Math.max(45, Math.min(this._maxZoomRadius, this.targetSpherical.radius + e.deltaY * 0.12));
        if (this.onUserCameraInteraction) this.onUserCameraInteraction();
      }, { passive: false });

      // Сенсорне керування для планшетів та вузьких екранів
      let prevTouchDist = 0;
      dom.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.isRightDrag = false;
          this.prevMouse.x = e.touches[0].clientX;
          this.prevMouse.y = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          this.isDragging = false;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          prevTouchDist = Math.hypot(dx, dy);
        }
      }, { passive: true });

      dom.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && this.isDragging) {
          const dx = e.touches[0].clientX - this.prevMouse.x;
          const dy = e.touches[0].clientY - this.prevMouse.y;
          this.prevMouse.x = e.touches[0].clientX;
          this.prevMouse.y = e.touches[0].clientY;
          this.targetSpherical.theta -= dx * 0.0085;
          this.targetSpherical.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.02, this.targetSpherical.phi - dy * 0.0085));
          if (this.onUserCameraInteraction) this.onUserCameraInteraction();
        } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          if (prevTouchDist > 0) {
            this.targetSpherical.radius = Math.max(45, Math.min(this._maxZoomRadius, this.targetSpherical.radius - (dist - prevTouchDist) * 0.45));
            if (this.onUserCameraInteraction) this.onUserCameraInteraction();
          }
          prevTouchDist = dist;
        }
      }, { passive: true });

      dom.addEventListener('touchend', () => {
        this.isDragging = false;
        prevTouchDist = 0;
      });

      dom.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Перемикач одноколірного прев'ю ("Як виглядатиме одним пластиком")
    toggleMonochrome(forceState) {
      this.isMonochrome = typeof forceState === 'boolean' ? forceState : !this.isMonochrome;
      if (this.modelGroup) {
        this.modelGroup.traverse((child) => {
          if (child.isMesh && child.userData._origMaterial) {
            child.material = this.isMonochrome ? this.monochromeMaterial : child.userData._origMaterial;
          }
        });
      }
      return this.isMonochrome;
    }

    setMonochromeColor(hexNum) {
      this.monochromeColor = hexNum;
      if (this.monochromeMaterial) {
        this.monochromeMaterial.color.setHex(hexNum);
      }
    }

    // Оновлення меж ортографічної камери відповідно до поточної відстані камери та пропорцій екрана
    updateOrthoProjection(w, h) {
      if (!this.orthoCamera) return;
      const containerW = w || this.cachedWidth || (this.container ? this.container.clientWidth : 800);
      const containerH = h || this.cachedHeight || (this.container ? this.container.clientHeight : 600);
      const aspect = containerW / Math.max(1, containerH);

      // Масштаб ортографічної камери ідеально узгоджений із PerspectiveCamera FOV 42° на відстані spherical.radius
      const halfH = this.spherical.radius * Math.tan(THREE.MathUtils.degToRad(21));
      const halfW = halfH * aspect;

      this.orthoCamera.left = -halfW;
      this.orthoCamera.right = halfW;
      this.orthoCamera.top = halfH;
      this.orthoCamera.bottom = -halfH;
      this.orthoCamera.near = 1;
      this.orthoCamera.far = 1500;
      this.orthoCamera.updateProjectionMatrix();
    }

    setProjectionMode(isOrtho) {
      this.isOrthographic = !!isOrtho;
      this.onResize();
      if (this.isOrthographic) {
        this.camera = this.orthoCamera;
        if (Math.abs(this.targetSpherical.phi - Math.PI / 2.25) < 0.06) {
          this.targetSpherical.phi = Math.PI / 2 - 0.001;
        }
      } else {
        this.camera = this.perspCamera;
        if (Math.abs(this.targetSpherical.phi - (Math.PI / 2 - 0.001)) < 0.03) {
          this.targetSpherical.phi = Math.PI / 2.25;
        }
      }
      if (window.StudioSound) window.StudioSound.playCameraSwoosh(this.isOrthographic ? 'ortho' : 'iso');
      return this.isOrthographic;
    }

    toggleProjection() {
      return this.setProjectionMode(!this.isOrthographic);
    }

    // Плавний поворот камери в заданий ракурс (наприклад, для оптичної ілюзії 0° та 90°, або скидання в ізометрію)
    setCameraView(preset) {
      if (window.StudioSound) window.StudioSound.playCameraSwoosh(preset);

      // Скидаємо зміщення панорамування рівно в центр столу
      this.targetSpherical.target.set(0, 18, 0);

      const twoPi = Math.PI * 2;
      const getShortestTheta = (target) => {
        let current = this.spherical.theta;
        let diff = (target - (current % twoPi));
        diff = ((diff + Math.PI) % twoPi) - Math.PI;
        return current + diff;
      };

      if (preset === 'front') {
        this.targetSpherical.theta = getShortestTheta(0);
        this.targetSpherical.phi = this.isOrthographic ? (Math.PI / 2 - 0.001) : (Math.PI / 2.25);
        this.targetSpherical.radius = 135;
      } else if (preset === 'side90') {
        this.targetSpherical.theta = getShortestTheta(Math.PI / 2);
        this.targetSpherical.phi = this.isOrthographic ? (Math.PI / 2 - 0.001) : (Math.PI / 2.25);
        this.targetSpherical.radius = 135;
      } else if (preset === 'top') {
        this.targetSpherical.theta = getShortestTheta(0);
        this.targetSpherical.phi = 0.001;
        this.targetSpherical.radius = 150;
      } else {
        // Ізометрія за замовчуванням: 45° збоку, канонічний нахил 54.74° (аксонометрія) для Орто та 60° для Перспективи
        this.targetSpherical.theta = getShortestTheta(Math.PI / 4);
        this.targetSpherical.phi = this.isOrthographic ? Math.atan(Math.SQRT2) : (Math.PI / 3.0);
        this.targetSpherical.radius = 145;
      }
    }

    // Підігнати поточну модель до вікна, зберігши чинний ракурс камери.
    fitModelView() {
      if (!this.modelGroup || this.modelGroup.children.length === 0 || (!this.perspCamera && !this.orthoCamera)) {
        return false;
      }

      // dimensions записуються до анімації появи, тож їхні межі не залежать від поточного pop-кадру.
      const width = Math.max(0, Number(this.dimensions.x) || 0);
      const depth = Math.max(0, Number(this.dimensions.y) || 0);
      const height = Math.max(0, Number(this.dimensions.z) || 0);
      if (width === 0 && depth === 0 && height === 0) return false;

      const viewportWidth = (this.container && this.container.clientWidth) || this.cachedWidth || 800;
      const viewportHeight = (this.container && this.container.clientHeight) || this.cachedHeight || 600;
      const aspect = viewportWidth / Math.max(1, viewportHeight);
      const verticalFov = THREE.MathUtils.degToRad(this.perspCamera ? this.perspCamera.fov : 42);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
      const limitingHalfFov = Math.max(0.01, Math.min(verticalFov, horizontalFov) / 2);
      const halfDiagonal = Math.sqrt(width * width + depth * depth + height * height) / 2;
      const fitScale = this.isOrthographic
        ? 1 / Math.tan(limitingHalfFov)
        : 1 / Math.sin(limitingHalfFov);
      const fitRadius = Math.max(45, halfDiagonal * fitScale * 1.16);

      // setModel() centers X/Z on the table and keeps the settled model bottom at Y=0.
      this.targetSpherical.target.set(0, height / 2, 0);
      this.targetSpherical.radius = fitRadius;
      this._maxZoomRadius = Math.max(340, Math.ceil(fitRadius * 1.35));

      if (this.onUserCameraInteraction) this.onUserCameraInteraction();
      return true;
    }


    finishPopAnimation() {
      if (this.popAnimBlocks && this.popAnimBlocks.length > 0) {
        this.popAnimBlocks.forEach((item) => {
          if (item && item.mesh) {
            item.mesh.position.y = item.targetY;
            item.mesh.scale.copy(item.targetScale);
          }
        });
        this.popAnimBlocks = [];
      }
    }

    // Рекурсивне звільнення GPU-ресурсів (геометрії, текстур та матеріалів) для запобігання витоку WebGL-пам'яті
    _disposeRecursive(obj, disposedGeoms = new Set(), disposedMats = new Set()) {
      if (!obj) return;
      if (obj.children) {
        for (let i = obj.children.length - 1; i >= 0; i--) {
          this._disposeRecursive(obj.children[i], disposedGeoms, disposedMats);
        }
      }
      if (obj.geometry && !disposedGeoms.has(obj.geometry)) {
        disposedGeoms.add(obj.geometry);
        obj.geometry.dispose();
      }
      const candidateMats = [];
      if (obj.userData && obj.userData._origMaterial) candidateMats.push(obj.userData._origMaterial);
      if (obj.material) candidateMats.push(obj.material);

      candidateMats.forEach((mat) => {
        if (!mat || mat === this.monochromeMaterial) return;
        const list = Array.isArray(mat) ? mat : [mat];
        list.forEach((m) => {
          if (m && !disposedMats.has(m) && m !== this.monochromeMaterial) {
            disposedMats.add(m);
            if (m.map) m.map.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
            if (m.metalnessMap) m.metalnessMap.dispose();
            if (m.normalMap) m.normalMap.dispose();
            if (m.alphaMap) m.alphaMap.dispose();
            m.dispose();
          }
        });
      });
    }

    clearModel() {
      this.stopSlicerSimulation();
      this.physicsUpdateFn = null;
      const demoResult = document.getElementById('physics-demo-result');
      if (demoResult) demoResult.textContent = 'Екранна демонстрація — не прогноз сили або міцності.';
      this.finishPopAnimation();

      const disposedGeoms = new Set();
      const disposedMats = new Set();

      while (this.modelGroup.children.length > 0) {
        const obj = this.modelGroup.children[0];
        this._disposeRecursive(obj, disposedGeoms, disposedMats);
        this.modelGroup.remove(obj);
      }
      while (this.effectsGroup.children.length > 0) {
        const obj = this.effectsGroup.children[0];
        this._disposeRecursive(obj, disposedGeoms, disposedMats);
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

      // Підключаємо площину зрізу для симулятора друку, тіні та одноколірний режим
      const meshes = [];
      group.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.clippingPlanes = [this.clipPlane];
            child.material.clipShadows = true;
            child.userData._origMaterial = child.material;
            if (this.isMonochrome) {
              child.material = this.monochromeMaterial;
            }
          }
          meshes.push(child);
        }
      });

      // Оновлюємо розміри моделі в мм
      const finalBox = new THREE.Box3().setFromObject(this.modelGroup);
      const size = new THREE.Vector3();
      finalBox.getSize(size);

      const dx = Math.round(size.x * 10) / 10;
      const dy = Math.round(size.z * 10) / 10; // Глибина на столі
      const dz = Math.round(size.y * 10) / 10; // Висота друку

      this.dimensions = {
        x: dx,
        y: dy,
        z: dz,
        fitsBed: dx <= 200 && dy <= 200,
        safeBed: dx <= 190 && dy <= 190,
        isMini: dx <= 35 && dy <= 35
      };

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
      if (this.onDimensionsUpdated) {
        this.onDimensionsUpdated(this.dimensions);
      }
    }

    updateDimensionsUI(slicerNote = '') {
      const dimEl = document.getElementById('model-dimensions-badge');
      if (!dimEl) return;
      const d = this.dimensions;
      const sizeCategory = !d.fitsBed
        ? '🚨 За межами столу (>200 мм)'
        : !d.safeBed
          ? '⚠️ Впритул до краю (>190 мм)'
          : d.isMini
            ? '🌟 Міні-формат (≤35 мм)'
            : '📐 У межах норми (Anycubic)';

      const timeText = slicerNote
        ? `⏱️ Запис зі слайсера: ${slicerNote}`
        : '⏱️ Час і витрати: додай запис зі слайсера';

      dimEl.innerHTML = `
        <div class="hud-dim-header">
          <span class="hud-status-chip ${!d.fitsBed ? 'chip-danger' : !d.safeBed ? 'chip-warn' : 'chip-ok'}">${sizeCategory}</span>
          <span class="hud-flat-chip">Дно Z = 0.00 мм ✅</span>
        </div>
        <div class="hud-dim-primary num-tabular">
          <b>${d.x} × ${d.y} × ${d.z}</b> <span class="hud-dim-unit">мм</span>
        </div>
        <div class="hud-dim-meta num-tabular">
        </div>
      `;
      // Notes are editable project data, so render them as text rather than HTML.
      dimEl.querySelector('.hud-dim-meta').textContent = timeText;
      dimEl.classList.toggle('badge-warn', !d.safeBed && d.fitsBed);
      dimEl.classList.toggle('badge-danger', !d.fitsBed);
      dimEl.classList.toggle('badge-good', d.safeBed);
    }

    // Запуск лазерної симуляції пошарового 3D-друку
    startSlicerSimulation() {
      if (this.slicerActive) {
        this.stopSlicerSimulation();
        return false;
      }
      this.slicerActive = true;
      this.slicerProgress = 0.01;
      this._simLastPtIdx = -1;

      // Підготовка загальної кількості шарів зі стандартною висотою шару 0.2 мм для сопла 0.4 мм
      const totalH = Math.max(1.0, this.dimensions.z || (this.slicerMaxY - 2) || 4);
      this._simLayerHeight = 0.2; // 0.2 мм світовий стандарт
      this._simTotalLayers = Math.max(1, Math.ceil(totalH / this._simLayerHeight));
      this._simLayerIndex = 0;

      if (this.nozzleMesh) this.nozzleMesh.visible = true;

      // Тимчасово вмикаємо двосторонній рендер на моделях, щоб внутрішні порожнини зрізу не провалювалися в чорну дірку
      this.modelGroup.traverse((child) => {
        if (child.isMesh && child.material) {
          if (!child.userData._simPrevSide) {
            child.userData._simPrevSide = child.material.side;
          }
          child.material.side = THREE.DoubleSide;
        }
      });

      const btn = document.getElementById('btn-simulate-print');
      if (btn) btn.classList.add('active-sim');
      return true;
    }

    stopSlicerSimulation() {
      this.slicerActive = false;
      this.clipPlane.constant = 500;
      if (this.nozzleMesh) this.nozzleMesh.visible = false;

      // Повертаємо початковий side матеріалам моделі
      this.modelGroup.traverse((child) => {
        if (child.isMesh && child.material && child.userData._simPrevSide !== undefined) {
          child.material.side = child.userData._simPrevSide;
          delete child.userData._simPrevSide;
        }
      });

      const btn = document.getElementById('btn-simulate-print');
      if (btn) {
        btn.classList.remove('active-sim');
        const ico = btn.querySelector('.btn-ico');
        const lbl = btn.querySelector('.btn-lbl');
        if (ico && lbl) {
          ico.textContent = '🔥';
          lbl.textContent = 'Симуляція';
        } else {
          btn.textContent = '🔥 Симуляція';
        }
      }
    }

    // Експорт поточної моделі у бінарний .STL файл (100% сумісний з Tinkercad, Makers Empire, Cura, PrusaSlicer)
    exportBinarySTL(filename = '3d_model_for_printer.stl') {
      if (this.onBeforeExport) this.onBeforeExport();
      this.stopSlicerSimulation();
      this.finishPopAnimation();
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
      if (!this.container || !this.renderer) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (!w || !h) return;
      this.cachedWidth = w;
      this.cachedHeight = h;
      if (this.perspCamera) {
        this.perspCamera.aspect = w / h;
        this.perspCamera.updateProjectionMatrix();
      }
      this.updateOrthoProjection(w, h);
      this.renderer.setSize(w, h);
    }

    // Розрахунок реалістичної траєкторії сопла 0.4 мм: периметр + заповнення під кутом 45/135 градусів
    _calculateGcodeTrajectory(halfX, halfZ, layerIndex, subProgress) {
      const minX = -halfX;
      const maxX = halfX;
      const minZ = -halfZ;
      const maxZ = halfZ;

      // Створюємо опорні точки друку поточного шару:
      // 1. Зовнішній периметр (Perimeter 1)
      const pts = [
        { x: minX, z: minZ },
        { x: maxX, z: minZ },
        { x: maxX, z: maxZ },
        { x: minX, z: maxZ },
        { x: minX, z: minZ }
      ];

      // 2. Внутрішній периметр (Perimeter 2 зі зміщенням товщини сопла 0.4 мм)
      const nozzleOffset = 0.4;
      pts.push(
        { x: minX + nozzleOffset, z: minZ + nozzleOffset },
        { x: maxX - nozzleOffset, z: minZ + nozzleOffset },
        { x: maxX - nozzleOffset, z: maxZ - nozzleOffset },
        { x: minX + nozzleOffset, z: maxZ - nozzleOffset },
        { x: minX + nozzleOffset, z: minZ + nozzleOffset }
      );

      // 3. Растрове заповнення (Infill) зі зміною кута на 90° між шарами (+45° / -45°)
      const infillDensity = 2.4; // крок ліній заповнення в мм
      const isEven = layerIndex % 2 === 0;
      const spanZ = (maxZ - minZ) - 2 * nozzleOffset;
      const numLines = Math.max(2, Math.floor(spanZ / infillDensity));

      for (let i = 0; i <= numLines; i++) {
        const lineZ = minZ + nozzleOffset + (i / numLines) * spanZ;
        if ((i % 2 === 0) === isEven) {
          pts.push({ x: minX + nozzleOffset, z: lineZ });
          pts.push({ x: maxX - nozzleOffset, z: lineZ });
        } else {
          pts.push({ x: maxX - nozzleOffset, z: lineZ });
          pts.push({ x: minX + nozzleOffset, z: lineZ });
        }
      }

      // Обчислення кумулятивних довжин відрізків
      let totalDist = 0;
      const segDists = [0];
      for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
        totalDist += d;
        segDists.push(totalDist);
      }

      if (totalDist <= 0.001) {
        return { x: 0, z: 0, segIdx: 0 };
      }

      const targetDist = Math.max(0, Math.min(1, subProgress)) * totalDist;

      // Пошук поточного відрізка
      for (let i = 1; i < segDists.length; i++) {
        if (targetDist <= segDists[i] || i === segDists.length - 1) {
          const segLen = segDists[i] - segDists[i - 1] || 1;
          const t = (targetDist - segDists[i - 1]) / segLen;
          const pA = pts[i - 1];
          const pB = pts[i];
          return {
            x: pA.x + (pB.x - pA.x) * t,
            z: pA.z + (pB.z - pA.z) * t,
            segIdx: i
          };
        }
      }

      return { x: pts[0].x, z: pts[0].z, segIdx: 0 };
    }

    animate() {
      requestAnimationFrame(() => this.animate());
      const frameDelta = Math.min(0.25, this.clock.getDelta());
      const dt = Math.min(0.05, frameDelta);
      const cameraBlend = 1 - Math.exp(-9 * frameDelta);

      // Плавна інтерполяція камери
      this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * cameraBlend;
      this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * cameraBlend;
      this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * cameraBlend;
      this.spherical.target.lerp(this.targetSpherical.target, cameraBlend);

      const r = this.spherical.radius;
      const sinPhi = Math.sin(this.spherical.phi);
      const camX = this.spherical.target.x + r * sinPhi * Math.sin(this.spherical.theta);
      const camY = this.spherical.target.y + r * Math.cos(this.spherical.phi);
      const camZ = this.spherical.target.z + r * sinPhi * Math.cos(this.spherical.theta);

      if (this.isOrthographic && this.orthoCamera) {
        this.updateOrthoProjection();
        this.orthoCamera.position.set(camX, camY, camZ);
        this.orthoCamera.lookAt(this.spherical.target);
        this.camera = this.orthoCamera;
      } else if (this.perspCamera) {
        this.perspCamera.position.set(camX, camY, camZ);
        this.perspCamera.lookAt(this.spherical.target);
        this.camera = this.perspCamera;
      }

      // Анімація появи блоків
      if (this.popAnimBlocks.length > 0) {
        let anyActive = false;
        for (const item of this.popAnimBlocks) {
          item.elapsed += frameDelta;
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

      // Симуляція пошарового 3D-друку зі стандартом сопла 0.4 мм та кроком 0.2 мм
      if (this.slicerActive) {
        // Швидкість просування по моделі: динамічно адаптована до загальної висоти
        const totalHeight = Math.max(1.0, this.dimensions.z || (this.slicerMaxY - 2) || 4);
        const layerH = this._simLayerHeight || 0.2;
        const totalLayers = Math.max(1, Math.ceil(totalHeight / layerH));
        this._simTotalLayers = totalLayers;

        // Повний цикл симуляції ~12-16 секунд для комфортного візуального спостереження
        const simSpeed = 1.0 / Math.max(10, Math.min(22, totalLayers * 0.45));
        this.slicerProgress += dt * simSpeed;

        if (this.slicerProgress >= 1.0) {
          this.stopSlicerSimulation();
          if (window.StudioSound) window.StudioSound.playPrintComplete();
        } else {
          // Розрахунок поточного шару (0 .. totalLayers - 1)
          const currentLayerIdx = Math.min(totalLayers - 1, Math.floor(this.slicerProgress * totalLayers));
          const layerSubProgress = (this.slicerProgress * totalLayers) - currentLayerIdx; // 0.0 .. 1.0 всередині шару
          const currentH = Math.min(totalHeight, (currentLayerIdx + 1) * layerH);

          this._simLayerIndex = currentLayerIdx;
          this.clipPlane.constant = currentH;

          // Отримуємо реалістичні межі моделі (X та Z)
          const halfX = Math.max(8, (this.dimensions.x || 30) * 0.48);
          const halfZ = Math.max(8, (this.dimensions.y || 30) * 0.48);

          // Побудова траєкторії G-code: периметри + штрихування під кутом 45/135 градусів
          const nozzlePos = this._calculateGcodeTrajectory(halfX, halfZ, currentLayerIdx, layerSubProgress);
          this.nozzleMesh.position.set(nozzlePos.x, currentH, nozzlePos.z);

          // Звук крокових двигунів при зміні сегмента або лінії
          if (nozzlePos.segIdx !== this._simLastPtIdx) {
            this._simLastPtIdx = nozzlePos.segIdx;
            if (window.StudioSound) {
              window.StudioSound.playPrinterStep(this.slicerProgress);
            }
          }

          // Оновлюємо статус/підказку на кнопці симуляції (номер шару та висота Z)
          const btn = document.getElementById('btn-simulate-print');
          if (btn) {
            const lbl = btn.querySelector('.btn-lbl');
            const layerText = `Шар ${currentLayerIdx + 1}/${totalLayers} (${currentH.toFixed(1)} мм)`;
            if (lbl) {
              lbl.textContent = layerText;
            } else {
              btn.textContent = `🔥 ${layerText}`;
            }
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
