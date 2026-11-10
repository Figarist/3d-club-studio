// Генератор «Фото-Барельєф» (Grayscale Heightmap to Solid Print-Safe STL)
// 100% чистий офлайн Vanilla JS + Three.js r128 для дитячої студії «3D Кузня Чудес».
(function () {
  class HeightmapReliefGenerator {
    constructor() {
      this.currentPresetKey = 'cat';
      this.customImageDataUrl = null;
      this.currentImage = null;
      this.isImageLoaded = false;
      this.onImageReady = null;

      // Позаекранний canvas для растрової обробки пікселів
      this.canvas = document.createElement('canvas');
      this.canvas.width = 128;
      this.canvas.height = 128;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      // Початкове процедурне заповнення (котик) на випадок негайного виклику build3D
      this._drawDefaultProceduralCat(this.ctx, 128, 128);
      this.isImageLoaded = true;

      // Вбудовані векторні дитячі пресети (SVG Data URL)
      this.presets = {
        cat: this._createCatSvg(),
        rocket: this._createRocketSvg(),
        star: this._createStarSvg(),
        coin: this._createCoinSvg(),
        smiley: this._createSmileySvg(),
        dino: this._createDinoSvg()
      };
    }

    // -------------------------------------------------------------------------
    // ВБУДОВАНІ ВЕКТОРНІ ПРЕСЕТИ ДЛЯ ДІТЕЙ
    // -------------------------------------------------------------------------
    _createCatSvg() {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#000000"/>
        <!-- Вушка -->
        <polygon points="35,90 60,20 95,75" fill="#ffffff"/>
        <polygon points="165,90 140,20 105,75" fill="#ffffff"/>
        <polygon points="45,82 62,35 88,72" fill="#888888"/>
        <polygon points="155,82 138,35 112,72" fill="#888888"/>
        <!-- Голова -->
        <circle cx="100" cy="115" r="70" fill="#ffffff"/>
        <!-- Очі -->
        <ellipse cx="75" cy="105" rx="14" ry="18" fill="#111111"/>
        <ellipse cx="125" cy="105" rx="14" ry="18" fill="#111111"/>
        <circle cx="79" cy="100" r="5" fill="#ffffff"/>
        <circle cx="129" cy="100" r="5" fill="#ffffff"/>
        <!-- Нісик і мордочка -->
        <polygon points="94,122 106,122 100,130" fill="#222222"/>
        <path d="M 90,133 Q 100,140 100,130 Q 100,140 110,133" stroke="#222222" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Вуса -->
        <line x1="30" y1="118" x2="68" y2="124" stroke="#444444" stroke-width="3" stroke-linecap="round"/>
        <line x1="28" y1="130" x2="68" y2="132" stroke="#444444" stroke-width="3" stroke-linecap="round"/>
        <line x1="170" y1="118" x2="132" y2="124" stroke="#444444" stroke-width="3" stroke-linecap="round"/>
        <line x1="172" y1="130" x2="132" y2="132" stroke="#444444" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    _createRocketSvg() {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#000000"/>
        <!-- Полум'я -->
        <polygon points="85,160 100,195 115,160" fill="#ffffff"/>
        <polygon points="92,160 100,180 108,160" fill="#999999"/>
        <!-- Бічні крила -->
        <polygon points="70,120 40,155 70,150" fill="#cccccc"/>
        <polygon points="130,120 160,155 130,150" fill="#cccccc"/>
        <!-- Корпус ракети -->
        <path d="M 100,15 Q 135,65 130,155 L 70,155 Q 65,65 100,15 Z" fill="#ffffff"/>
        <!-- Носовий конус -->
        <path d="M 100,15 Q 120,55 125,75 L 75,75 Q 80,55 100,15 Z" fill="#999999"/>
        <!-- Ілюмінатор -->
        <circle cx="100" cy="105" r="18" fill="#444444"/>
        <circle cx="100" cy="105" r="14" fill="#ffffff"/>
        <circle cx="96" cy="101" r="5" fill="#888888"/>
      </svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    _createStarSvg() {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#000000"/>
        <!-- Зовнішнє коло-основа -->
        <circle cx="100" cy="100" r="92" fill="#222222"/>
        <circle cx="100" cy="100" r="82" fill="#555555"/>
        <!-- 5-променева об'ємна зірка -->
        <polygon points="100,20 124,72 181,77 138,116 151,172 100,143 49,172 62,116 19,77 76,72" fill="#ffffff"/>
        <!-- Тіньові грані для барельєфного об'єму -->
        <polygon points="100,20 100,100 124,72" fill="#e0e0e0"/>
        <polygon points="181,77 100,100 138,116" fill="#e0e0e0"/>
        <polygon points="151,172 100,100 100,143" fill="#e0e0e0"/>
        <polygon points="49,172 100,100 62,116" fill="#b0b0b0"/>
        <polygon points="19,77 100,100 76,72" fill="#b0b0b0"/>
      </svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    _createCoinSvg() {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#000000"/>
        <!-- Бортик монети -->
        <circle cx="100" cy="100" r="94" fill="#ffffff"/>
        <circle cx="100" cy="100" r="82" fill="#333333"/>
        <circle cx="100" cy="100" r="76" fill="#555555"/>
        <!-- Рельєфна корона/герб у центрі -->
        <path d="M 50,135 L 60,85 L 80,108 L 100,65 L 120,108 L 140,85 L 150,135 Z" fill="#ffffff"/>
        <circle cx="60" cy="80" r="6" fill="#ffffff"/>
        <circle cx="100" cy="58" r="8" fill="#ffffff"/>
        <circle cx="140" cy="80" r="6" fill="#ffffff"/>
        <!-- Напис або стрічка -->
        <rect x="55" y="142" width="90" height="12" rx="4" fill="#ffffff"/>
      </svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    _createSmileySvg() {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#000000"/>
        <!-- Обличчя смайлика -->
        <circle cx="100" cy="100" r="85" fill="#ffffff"/>
        <!-- Очі -->
        <circle cx="70" cy="80" r="14" fill="#111111"/>
        <circle cx="130" cy="80" r="14" fill="#111111"/>
        <circle cx="74" cy="76" r="5" fill="#ffffff"/>
        <circle cx="134" cy="76" r="5" fill="#ffffff"/>
        <!-- Щічки -->
        <ellipse cx="52" cy="105" rx="10" ry="6" fill="#cccccc"/>
        <ellipse cx="148" cy="105" rx="10" ry="6" fill="#cccccc"/>
        <!-- Весела посмішка -->
        <path d="M 60,115 Q 100,165 140,115 Q 100,135 60,115 Z" fill="#111111"/>
      </svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    _createDinoSvg() {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#000000"/>
        <!-- Силует динозаврика -->
        <path d="M 40,160 Q 60,150 75,130 Q 80,90 95,70 L 135,60 Q 155,60 160,80 L 155,100 L 125,100 Q 130,120 120,150 L 125,175 L 105,175 L 105,155 L 85,155 L 80,175 L 60,175 Q 65,155 55,145 Q 40,140 25,160 Z" fill="#ffffff"/>
        <!-- Гребінці на спині -->
        <polygon points="80,95 72,85 85,90" fill="#aaaaaa"/>
        <polygon points="90,75 84,65 95,70" fill="#aaaaaa"/>
        <polygon points="105,62 102,50 112,58" fill="#aaaaaa"/>
        <!-- Око і зубки -->
        <circle cx="145" cy="75" r="5" fill="#111111"/>
        <polygon points="135,100 140,93 145,100" fill="#ffffff"/>
        <polygon points="145,100 150,93 155,100" fill="#ffffff"/>
      </svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    _drawDefaultProceduralCat(ctx, w, h) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';

      // Вушка
      ctx.beginPath();
      ctx.moveTo(w * 0.18, h * 0.45);
      ctx.lineTo(w * 0.3, h * 0.1);
      ctx.lineTo(w * 0.48, h * 0.38);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w * 0.82, h * 0.45);
      ctx.lineTo(w * 0.7, h * 0.1);
      ctx.lineTo(w * 0.52, h * 0.38);
      ctx.fill();

      // Голова
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.58, w * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Очі (чорні з відблиском)
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(w * 0.38, h * 0.53, w * 0.07, 0, Math.PI * 2);
      ctx.arc(w * 0.62, h * 0.53, w * 0.07, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(w * 0.4, h * 0.51, w * 0.025, 0, Math.PI * 2);
      ctx.arc(w * 0.64, h * 0.51, w * 0.025, 0, Math.PI * 2);
      ctx.fill();

      // Нісик і ротик
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.moveTo(w * 0.47, h * 0.62);
      ctx.lineTo(w * 0.53, h * 0.62);
      ctx.lineTo(w * 0.5, h * 0.66);
      ctx.closePath();
      ctx.fill();
    }

    // -------------------------------------------------------------------------
    // ЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ
    // -------------------------------------------------------------------------
    loadPreset(presetKey, callback) {
      const url = this.presets[presetKey] || this.presets.cat;
      this.currentPresetKey = presetKey;
      this.customImageDataUrl = null;
      this._loadImageFromUrl(url, callback);
    }

    loadCustomImage(dataUrl, callback) {
      this.customImageDataUrl = dataUrl;
      this.currentPresetKey = 'custom';
      this._loadImageFromUrl(dataUrl, callback);
    }

    _loadImageFromUrl(url, callback) {
      const img = new Image();
      img.onload = () => {
        this.currentImage = img;
        this.isImageLoaded = true;
        if (callback) callback();
        if (this.onImageReady) this.onImageReady();
      };
      img.onerror = () => {
        console.warn('HeightmapReliefGenerator: failed to load image URL');
        if (callback) callback();
      };
      img.src = url;
    }

    // -------------------------------------------------------------------------
    // ОБРОБКА ПІКСЕЛІВ ТА ГЕНЕРАЦІЯ КАРТИ ВИСОТ
    // -------------------------------------------------------------------------
    _sampleHeightGrid(resX, resY, options = {}) {
      const invert = Boolean(options.invert);
      const contrast = parseFloat(options.contrast) || 1.0;
      const brightness = parseFloat(options.brightness) || 0;
      const smoothRadius = Math.max(0, parseInt(options.smooth, 10) || 0);

      this.canvas.width = resX;
      this.canvas.height = resY;
      const ctx = this.ctx;

      // Малюємо поточне зображення розтягнутим на розмір сітки
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, resX, resY);
      if (this.currentImage) {
        ctx.drawImage(this.currentImage, 0, 0, resX, resY);
      } else {
        this._drawDefaultProceduralCat(ctx, resX, resY);
      }

      const imgData = ctx.getImageData(0, 0, resX, resY);
      const data = imgData.data;
      const heights = new Float32Array(resX * resY);

      // Крок 1: Grayscale + Contrast + Brightness + Invert
      for (let i = 0, p = 0; i < heights.length; i++, p += 4) {
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        // Стандартна фотометрична яскравість
        let lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Контраст навколо середини (128)
        lum = (lum - 128) * contrast + 128 + brightness;
        lum = Math.max(0, Math.min(255, lum));

        if (invert) {
          lum = 255 - lum;
        }

        heights[i] = lum / 255.0; // 0.0 .. 1.0
      }

      // Крок 2: Згладжування (Box Blur 3x3) для усунення цифрового шуму
      if (smoothRadius > 0) {
        return this._applyBlur(heights, resX, resY, smoothRadius);
      }

      return heights;
    }

    _applyBlur(src, w, h, radius) {
      const dst = new Float32Array(src.length);
      const r = Math.min(3, radius);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let sum = 0;
          let count = 0;
          for (let dy = -r; dy <= r; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            for (let dx = -r; dx <= r; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              sum += src[ny * w + nx];
              count++;
            }
          }
          dst[y * w + x] = count > 0 ? sum / count : src[y * w + x];
        }
      }
      return dst;
    }

    // Оновлення 2D Canvas для прев'ю в панелі інструментів
    render2DPreview(targetCanvas, options = {}) {
      if (!targetCanvas) return;
      const w = targetCanvas.width || 120;
      const h = targetCanvas.height || 120;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      const heights = this._sampleHeightGrid(w, h, options);
      const imgData = ctx.createImageData(w, h);
      const data = imgData.data;

      for (let i = 0, p = 0; i < heights.length; i++, p += 4) {
        const val = Math.round(heights[i] * 255);
        data[p] = val;
        data[p + 1] = val;
        data[p + 2] = val;
        data[p + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // -------------------------------------------------------------------------
    // ПОБУДОВА 100% SOLID WATERTIGHT 3D МОДЕЛІ (PRINT-SAFE ДЛЯ STL)
    // -------------------------------------------------------------------------
    build3D(params = {}) {
      const width = Math.max(25, Math.min(160, parseFloat(params.width) || 60));
      const reliefHeight = Math.max(0.5, Math.min(15, parseFloat(params.reliefHeight) || 3.5));
      const baseThickness = Math.max(1.0, Math.min(8, parseFloat(params.baseThickness) || 2.0));
      const shape = params.shape === 'circle' ? 'circle' : 'rect';
      const frame = params.frame !== false;
      const keychain = Boolean(params.keychain);
      const resolution = Math.max(48, Math.min(192, parseInt(params.resolution, 10) || 128));

      // Зберігаємо квадрат або пропорційність
      const resX = resolution;
      const resY = resolution;
      const depth = width; // Квадратний або круглий габарит

      const heights = this._sampleHeightGrid(resX, resY, params);

      const group = new THREE.Group();
      group.name = 'HeightmapReliefModel';

      let mesh = null;
      if (shape === 'circle') {
        mesh = this._buildCircularSolidMesh({
          radius: width / 2,
          reliefHeight,
          baseThickness,
          frame,
          heights,
          resX,
          resY
        });
      } else {
        mesh = this._buildRectangularSolidMesh({
          width,
          depth,
          reliefHeight,
          baseThickness,
          frame,
          heights,
          resX,
          resY
        });
      }

      if (mesh) {
        group.add(mesh);
      }

      // Додаткове вушко для брелока (Keychain Loop)
      if (keychain) {
        const loopMesh = this._buildKeychainLoop({
          shape,
          width,
          depth,
          baseThickness
        });
        if (loopMesh) {
          group.add(loopMesh);
        }
      }

      return group;
    }

    // -------------------------------------------------------------------------
    // ПРЯМОКУТНИЙ SOLID MESH: Верх + Дно (Y=0) + 4 Стінки
    // -------------------------------------------------------------------------
    _buildRectangularSolidMesh({ width, depth, reliefHeight, baseThickness, frame, heights, resX, resY }) {
      const halfW = width / 2;
      const halfD = depth / 2;
      const dx = width / (resX - 1);
      const dz = depth / (resY - 1);

      // Рамка (бортик): 2-3 крайні клітинки по периметру
      const frameCellsX = frame ? Math.max(2, Math.round(resX * 0.04)) : 0;
      const frameCellsY = frame ? Math.max(2, Math.round(resY * 0.04)) : 0;
      const frameElevation = baseThickness + reliefHeight + 0.6; // Бортик трохи вищий за піки

      const vertices = [];
      const indices = [];

      // 1. ВЕРХНІ ВЕРШИНИ (індекси: 0 .. resX * resY - 1)
      for (let j = 0; j < resY; j++) {
        const z = -halfD + j * dz;
        for (let i = 0; i < resX; i++) {
          const x = -halfW + i * dx;
          const isBorder = frame && (i < frameCellsX || i >= resX - frameCellsX || j < frameCellsY || j >= resY - frameCellsY);
          let y = 0;
          if (isBorder) {
            y = frameElevation;
          } else {
            const hNorm = heights[j * resX + i];
            y = baseThickness + hNorm * reliefHeight;
          }
          vertices.push(x, y, z);
        }
      }

      // 2. НИЖНІ ВЕРШИНИ (ДНО на Y = 0) (індекси: topCount .. 2 * topCount - 1)
      const topCount = resX * resY;
      for (let j = 0; j < resY; j++) {
        const z = -halfD + j * dz;
        for (let i = 0; i < resX; i++) {
          const x = -halfW + i * dx;
          vertices.push(x, 0, z);
        }
      }

      // ТРИКУТНИКИ ВЕРХНЬОЇ ПОВЕРХНІ (нормалі дивляться ВГОРУ)
      for (let j = 0; j < resY - 1; j++) {
        for (let i = 0; i < resX - 1; i++) {
          const a = j * resX + i;
          const b = a + 1;
          const c = (j + 1) * resX + i;
          const d = c + 1;
          indices.push(a, b, d);
          indices.push(a, d, c);
        }
      }

      // ТРИКУТНИКИ ДНА (нормалі дивляться ВНИЗ, обхід за годинниковою стрілкою)
      for (let j = 0; j < resY - 1; j++) {
        for (let i = 0; i < resX - 1; i++) {
          const a = topCount + j * resX + i;
          const b = a + 1;
          const c = topCount + (j + 1) * resX + i;
          const d = c + 1;
          indices.push(a, d, b);
          indices.push(a, c, d);
        }
      }

      // 3. ЧОТИРИ БІЧНІ СТІНКИ (Side Walls)
      // Стінка 1: Північ (j = 0, Z = -halfD)
      for (let i = 0; i < resX - 1; i++) {
        const topA = i;
        const topB = i + 1;
        const botA = topCount + i;
        const botB = topCount + i + 1;
        // Нормаль назовні (Z < 0)
        indices.push(topA, botA, botB);
        indices.push(topA, botB, topB);
      }

      // Стінка 2: Південь (j = resY - 1, Z = +halfD)
      const southTopRow = (resY - 1) * resX;
      const southBotRow = topCount + southTopRow;
      for (let i = 0; i < resX - 1; i++) {
        const topA = southTopRow + i;
        const topB = southTopRow + i + 1;
        const botA = southBotRow + i;
        const botB = southBotRow + i + 1;
        // Нормаль назовні (Z > 0)
        indices.push(topA, botB, botA);
        indices.push(topA, topB, botB);
      }

      // Стінка 3: Захід (i = 0, X = -halfW)
      for (let j = 0; j < resY - 1; j++) {
        const topA = j * resX;
        const topB = (j + 1) * resX;
        const botA = topCount + topA;
        const botB = topCount + topB;
        // Нормаль назовні (X < 0)
        indices.push(topA, topB, botB);
        indices.push(topA, botB, botA);
      }

      // Стінка 4: Схід (i = resX - 1, X = +halfW)
      for (let j = 0; j < resY - 1; j++) {
        const topA = j * resX + (resX - 1);
        const topB = (j + 1) * resX + (resX - 1);
        const botA = topCount + topA;
        const botB = topCount + topB;
        // Нормаль назовні (X > 0)
        indices.push(topA, botA, botB);
        indices.push(topA, botB, topB);
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: 0xd8dde4, // Світлий сіро-сріблястий шовковий пластик
        roughness: 0.55,
        metalness: 0.1,
        side: THREE.FrontSide
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.exportable = true;
      return mesh;
    }

    // -------------------------------------------------------------------------
    // КРУГЛИЙ SOLID MESH (МЕДАЛЬЙОН / МОНЕТА): Полярна сітка + Циліндрична стінка
    // -------------------------------------------------------------------------
    _buildCircularSolidMesh({ radius, reliefHeight, baseThickness, frame, heights, resX, resY }) {
      const rings = Math.max(24, Math.floor(resX * 0.45));
      const sectors = Math.max(48, Math.floor(resX * 0.85));
      const frameRadius = radius * 0.88;
      const frameElevation = baseThickness + reliefHeight + 0.6;

      const vertices = [];
      const indices = [];

      // Функція білінійної вибірки висоти з квадратної карти (UV)
      const sampleBilinear = (u, v) => {
        const cu = Math.max(0, Math.min(1, u));
        const cv = Math.max(0, Math.min(1, v));
        const fx = cu * (resX - 1);
        const fy = cv * (resY - 1);
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const x1 = Math.min(resX - 1, x0 + 1);
        const y1 = Math.min(resY - 1, y0 + 1);
        const wx = fx - x0;
        const wy = fy - y0;
        const h00 = heights[y0 * resX + x0];
        const h10 = heights[y0 * resX + x1];
        const h01 = heights[y1 * resX + x0];
        const h11 = heights[y1 * resX + x1];
        return (1 - wx) * (1 - wy) * h00 + wx * (1 - wy) * h10 + (1 - wx) * wy * h01 + wx * wy * h11;
      };

      // 1. ВЕРХНІ ВЕРШИНИ
      // Центр (індекс 0)
      const centerH = heights[Math.floor(resY / 2) * resX + Math.floor(resX / 2)];
      vertices.push(0, baseThickness + centerH * reliefHeight, 0);

      // Кільця від 1 до rings
      for (let rIdx = 1; rIdx <= rings; rIdx++) {
        const curR = (rIdx / rings) * radius;
        const isBorder = frame && curR >= frameRadius;
        for (let sIdx = 0; sIdx < sectors; sIdx++) {
          const theta = (sIdx / sectors) * Math.PI * 2;
          const x = curR * Math.cos(theta);
          const z = curR * Math.sin(theta);
          let y = 0;
          if (isBorder) {
            y = frameElevation;
          } else {
            // Мапимо коло в UV карти [0, 1]
            const u = (x / radius + 1) * 0.5;
            const v = (z / radius + 1) * 0.5;
            const hNorm = sampleBilinear(u, v);
            y = baseThickness + hNorm * reliefHeight;
          }
          vertices.push(x, y, z);
        }
      }

      // ТРИКУТНИКИ ВЕРХНЬОГО ДИСКА
      // Центральний віяловий сектор (кільце 1)
      for (let sIdx = 0; sIdx < sectors; sIdx++) {
        const next = (sIdx + 1) % sectors;
        indices.push(0, 1 + sIdx, 1 + next);
      }
      // Решта кілець
      for (let rIdx = 1; rIdx < rings; rIdx++) {
        const r1Start = 1 + (rIdx - 1) * sectors;
        const r2Start = 1 + rIdx * sectors;
        for (let sIdx = 0; sIdx < sectors; sIdx++) {
          const next = (sIdx + 1) % sectors;
          const a = r1Start + sIdx;
          const b = r1Start + next;
          const c = r2Start + sIdx;
          const d = r2Start + next;
          indices.push(a, c, d);
          indices.push(a, d, b);
        }
      }

      // 2. НИЖНІ ВЕРШИНИ (ДНО на Y = 0)
      const topCount = 1 + rings * sectors;
      const botCenterIdx = topCount;
      vertices.push(0, 0, 0);

      for (let rIdx = 1; rIdx <= rings; rIdx++) {
        const curR = (rIdx / rings) * radius;
        for (let sIdx = 0; sIdx < sectors; sIdx++) {
          const theta = (sIdx / sectors) * Math.PI * 2;
          vertices.push(curR * Math.cos(theta), 0, curR * Math.sin(theta));
        }
      }

      // ТРИКУТНИКИ ДНА (нормалі ВНИЗ)
      for (let sIdx = 0; sIdx < sectors; sIdx++) {
        const next = (sIdx + 1) % sectors;
        indices.push(botCenterIdx, botCenterIdx + 1 + next, botCenterIdx + 1 + sIdx);
      }
      for (let rIdx = 1; rIdx < rings; rIdx++) {
        const r1Start = botCenterIdx + 1 + (rIdx - 1) * sectors;
        const r2Start = botCenterIdx + 1 + rIdx * sectors;
        for (let sIdx = 0; sIdx < sectors; sIdx++) {
          const next = (sIdx + 1) % sectors;
          const a = r1Start + sIdx;
          const b = r1Start + next;
          const c = r2Start + sIdx;
          const d = r2Start + next;
          indices.push(a, d, c);
          indices.push(a, b, d);
        }
      }

      // 3. БІЧНА ЦИЛІНДРИЧНА СТІНКА (З'єднує зовнішнє кільце верху з дном)
      const outerRingTop = 1 + (rings - 1) * sectors;
      const outerRingBot = botCenterIdx + 1 + (rings - 1) * sectors;
      for (let sIdx = 0; sIdx < sectors; sIdx++) {
        const next = (sIdx + 1) % sectors;
        const topA = outerRingTop + sIdx;
        const topB = outerRingTop + next;
        const botA = outerRingBot + sIdx;
        const botB = outerRingBot + next;
        // Нормалі назовні циліндра
        indices.push(topA, botA, botB);
        indices.push(topA, botB, topB);
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: 0xd8dde4,
        roughness: 0.55,
        metalness: 0.1,
        side: THREE.FrontSide
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.exportable = true;
      return mesh;
    }

    // -------------------------------------------------------------------------
    // ВУШКО ДЛЯ БРЕЛОКА (Solid Loop for Keychain)
    // -------------------------------------------------------------------------
    _buildKeychainLoop({ shape, width, depth, baseThickness }) {
      const outerR = 5.0; // 10 мм ширина вушка
      const holeR = 2.4;  // 4.8 мм діаметр отвору (легко заходить шнурок або кільце)
      const height = baseThickness; // Заввишки з основу
      const segments = 24;

      // Розташування: верхня точка моделі
      const attachZ = shape === 'circle' ? -(width / 2) : -(depth / 2);
      const centerZ = attachZ - (outerR - 1.2);

      const vertices = [];
      const indices = [];

      // Створюємо плоске кільце (дугу 360) з верхньою, нижньою поверхнею та 2 стінками
      for (let s = 0; s < segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        // Верхнє зовнішнє
        vertices.push(cos * outerR, height, centerZ + sin * outerR);
        // Верхнє внутрішнє (отвір)
        vertices.push(cos * holeR, height, centerZ + sin * holeR);
        // Нижнє зовнішнє
        vertices.push(cos * outerR, 0, centerZ + sin * outerR);
        // Нижнє внутрішнє
        vertices.push(cos * holeR, 0, centerZ + sin * holeR);
      }

      for (let s = 0; s < segments; s++) {
        const next = (s + 1) % segments;
        const tOutA = s * 4;
        const tInA = s * 4 + 1;
        const bOutA = s * 4 + 2;
        const bInA = s * 4 + 3;

        const tOutB = next * 4;
        const tInB = next * 4 + 1;
        const bOutB = next * 4 + 2;
        const bInB = next * 4 + 3;

        // Верхній торець
        indices.push(tOutA, tInA, tInB);
        indices.push(tOutA, tInB, tOutB);

        // Нижній торець
        indices.push(bOutA, bInB, bInA);
        indices.push(bOutA, bOutB, bInB);

        // Зовнішня бічна стінка
        indices.push(tOutA, bOutA, bOutB);
        indices.push(tOutA, bOutB, tOutB);

        // Внутрішня стінка отвору
        indices.push(tInA, tInB, bInB);
        indices.push(tInA, bInB, bInA);
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: 0xd8dde4,
        roughness: 0.55,
        metalness: 0.1,
        side: THREE.FrontSide
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.exportable = true;
      return mesh;
    }
  }

  window.HeightmapReliefGenerator = HeightmapReliefGenerator;
})();
