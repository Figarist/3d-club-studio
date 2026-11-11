// Генератор «Фото-Барельєф» (Grayscale Heightmap to Solid Print-Safe STL) v2.2.0
// 100% чистий офлайн Vanilla JS + Three.js r128 для дитячої студії «3D Кузня Чудес».
// Монолітна топологія на основі 2D SDF-маскованої регулярної сітки:
// - Єдина замкнена оболонка (watertight/manifold).
// - Вушко брелока монолітно зрощене з основою (без перетинань двох тіл).
// - Гарантована орієнтація нормалей (CCW, знаковий об'єм > 0).
(function () {
  'use strict';

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
    // КОНВЕЄР ОБРОБКИ ПІКСЕЛІВ ТА ГЕНЕРАЦІЯ КАРТИ ВИСОТ
    // -------------------------------------------------------------------------
    _sampleHeightGrid(resX, resY, options = {}) {
      const invert = Boolean(options.invert);
      const contrast = parseFloat(options.contrast) || 1.0;
      const brightness = parseFloat(options.brightness) || 0;
      const smoothRadius = Math.max(0, parseInt(options.smooth, 10) || 0);
      const autoLevels = options.autoLevels !== false;
      const gamma = Math.max(0.4, Math.min(2.5, parseFloat(options.gamma) || 1.0));

      this.canvas.width = resX;
      this.canvas.height = resY;
      const ctx = this.ctx;

      // Малюємо чорний фон (поля = основа)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, resX, resY);

      if (this.currentImage && this.currentImage.width && this.currentImage.height) {
        // Вписування зображення (contain) зі збереженням пропорцій по центру
        const iw = this.currentImage.width;
        const ih = this.currentImage.height;
        const scale = Math.min(resX / iw, resY / ih);
        const dw = Math.round(iw * scale);
        const dh = Math.round(ih * scale);
        const dx = Math.round((resX - dw) / 2);
        const dy = Math.round((resY - dh) / 2);

        ctx.drawImage(this.currentImage, dx, dy, dw, dh);
      } else {
        this._drawDefaultProceduralCat(ctx, resX, resY);
      }

      const imgData = ctx.getImageData(0, 0, resX, resY);
      const data = imgData.data;
      const totalPixels = resX * resY;
      const lums = new Float32Array(totalPixels);

      // Крок 1: Фотометричний Grayscale
      for (let i = 0, p = 0; i < totalPixels; i++, p += 4) {
        lums[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
      }

      // Крок 2: Медіанний фільтр 3x3 для прибирання одиничних гострих пікселів-шипів
      const cleanLums = this._applyMedian3(lums, resX, resY);

      // Крок 3: Автоконтраст за перцентилями (2%..98%) якщо увімкнено
      let minLum = 0;
      let maxLum = 255;
      if (autoLevels) {
        const hist = new Int32Array(256);
        for (let i = 0; i < totalPixels; i++) {
          const val = Math.max(0, Math.min(255, Math.round(cleanLums[i])));
          hist[val]++;
        }
        const lowCut = totalPixels * 0.02;
        const highCut = totalPixels * 0.98;
        let accum = 0;
        for (let i = 0; i < 256; i++) {
          accum += hist[i];
          if (accum >= lowCut) {
            minLum = i;
            break;
          }
        }
        accum = 0;
        for (let i = 255; i >= 0; i--) {
          accum += hist[i];
          if (accum >= (totalPixels - highCut)) {
            maxLum = i;
            break;
          }
        }
        if (maxLum <= minLum) {
          minLum = 0;
          maxLum = 255;
        }
      }

      const lumRange = maxLum - minLum || 255;
      const heights = new Float32Array(totalPixels);

      // Крок 4: Нормалізація, Гамма, Контраст, Яскравість та Інверсія
      for (let i = 0; i < totalPixels; i++) {
        let norm = (cleanLums[i] - minLum) / lumRange;
        norm = Math.max(0, Math.min(1, norm));

        // Гамма-корекція (поглиблення тіней чи висвітлення середніх тонів)
        if (Math.abs(gamma - 1.0) > 0.01) {
          norm = Math.pow(norm, gamma);
        }

        // Ручний контраст та яскравість
        let lumVal = norm * 255.0;
        lumVal = (lumVal - 128.0) * contrast + 128.0 + brightness;
        lumVal = Math.max(0, Math.min(255.0, lumVal));

        if (invert) {
          lumVal = 255.0 - lumVal;
        }

        heights[i] = lumVal / 255.0; // 0.0 .. 1.0
      }

      // Крок 5: Двостороннє згладжування (Edge-Preserving Bilateral Filter)
      if (smoothRadius > 0) {
        return this._applyBilateralFilter(heights, resX, resY, smoothRadius);
      }

      return heights;
    }

    _applyMedian3(src, w, h) {
      const dst = new Float32Array(src.length);
      const buf = new Float32Array(9);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              buf[n++] = src[ny * w + nx];
            }
          }
          for (let i = 1; i < n; i++) {
            const val = buf[i];
            let j = i - 1;
            while (j >= 0 && buf[j] > val) {
              buf[j + 1] = buf[j];
              j--;
            }
            buf[j + 1] = val;
          }
          dst[y * w + x] = buf[Math.floor(n / 2)];
        }
      }
      return dst;
    }

    _applyBilateralFilter(src, w, h, radius) {
      const dst = new Float32Array(src.length);
      const r = Math.min(3, radius);
      const sigmaSpatial = r * 0.75;
      const sigmaIntensity = 0.12;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const centerVal = src[y * w + x];
          let sum = 0;
          let weightSum = 0;

          for (let dy = -r; dy <= r; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            for (let dx = -r; dx <= r; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;

              const val = src[ny * w + nx];
              const distSq = dx * dx + dy * dy;
              const diff = val - centerVal;

              const wSpatial = Math.exp(-distSq / (2 * sigmaSpatial * sigmaSpatial));
              const wRange = Math.exp(-(diff * diff) / (2 * sigmaIntensity * sigmaIntensity));
              const wTotal = wSpatial * wRange;

              sum += val * wTotal;
              weightSum += wTotal;
            }
          }

          dst[y * w + x] = weightSum > 0 ? sum / weightSum : centerVal;
        }
      }
      return dst;
    }

    // Оновлення 2D Canvas для прев'ю в панелі інструментів
    render2DPreview(targetCanvas, options = {}) {
      if (!targetCanvas) return;
      const w = targetCanvas.width || 128;
      const h = targetCanvas.height || 128;
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
      const resolution = Math.max(48, Math.min(256, parseInt(params.resolution, 10) || 128));

      const resX = resolution;
      const resY = resolution;
      const heights = this._sampleHeightGrid(resX, resY, params);

      const group = new THREE.Group();
      group.name = 'HeightmapReliefModel';

      // Єдина монолітна модель на базі SDF-маскованої сітки (WATERTIGHT MANIFOLD)
      const mesh = this._buildUnifiedSolidMesh({
        width,
        depth: width,
        reliefHeight,
        baseThickness,
        shape,
        frame,
        keychain,
        heights,
        resX,
        resY
      });

      if (mesh) {
        group.add(mesh);
      }

      return group;
    }

    // -------------------------------------------------------------------------
    // ЄДИНА МОНОЛІТНА СІТКА НА SDF-МАСЦІ (Rectangle / Circle + Fused Keychain)
    // Гарантує:
    // 1. Повна відсутність швів або перетинань окремих мешів.
    // 2. Строгий CCW обхід граней: нормалі дивляться строго назовні.
    // 3. Закрите дно Y=0, закриті бічні стінки, закритий верх.
    // -------------------------------------------------------------------------
    _buildUnifiedSolidMesh(cfg) {
      const {
        width,
        depth,
        reliefHeight,
        baseThickness,
        shape,
        frame,
        keychain,
        heights,
        resX,
        resY
      } = cfg;

      const halfW = width / 2;
      const halfD = depth / 2;
      const radius = width / 2;

      // Параметри міцного зрощеного вушка (всі значення в мм):
      const holeR = 2.4;          // 4.8 мм внутрішній отвір під кільце/шнурок
      const tabR = 4.6;           // 9.2 мм зовнішня ширина вушка (стінка 2.2 мм)
      const tabHeight = Math.max(2.8, baseThickness + 0.8); // міцна висота вушка

      // Положення центру отвору: прямо біля верхньої кромки (Z = -halfD або -radius)
      const edgeZ = shape === 'circle' ? -radius : -halfD;
      const tabCenterZ = edgeZ - (holeR + 1.2);
      const tabOverlapZ = edgeZ + 3.0; // заглиблення всередину тіла на 3 мм для монолітного зрощення

      // Габаритний бокс сітки з запасом під вушко
      const minX = -halfW - (keychain ? 2 : 1);
      const maxX = halfW + (keychain ? 2 : 1);
      const minZ = (keychain ? (tabCenterZ - tabR - 1.5) : -halfD) - 1;
      const maxZ = halfD + 1;

      // Крок решітки (мм на клітинку)
      const cellSize = width / (resX - 1);
      const gridCols = Math.ceil((maxX - minX) / cellSize) + 1;
      const gridRows = Math.ceil((maxZ - minZ) / cellSize) + 1;

      // 2D Signed Distance Field (SDF) для об'єднаної форми
      const sdfAt = (x, z) => {
        // 1. Основне тіло
        let dBody = 0;
        if (shape === 'circle') {
          dBody = Math.sqrt(x * x + z * z) - radius;
        } else {
          // Прямокутник з радіусом скруглення кутів 2.0 мм
          const cornerR = 2.0;
          const qx = Math.abs(x) - (halfW - cornerR);
          const qz = Math.abs(z) - (halfD - cornerR);
          const extDist = Math.hypot(Math.max(qx, 0), Math.max(qz, 0));
          const intDist = Math.min(Math.max(qx, qz), 0);
          dBody = extDist + intDist - cornerR;
        }

        if (!keychain) {
          return dBody;
        }

        // 2. Вушко: капсула / язичок від tabOverlapZ до tabCenterZ
        const capP1 = tabOverlapZ;
        const capP2 = tabCenterZ;
        const clampedZ = Math.max(Math.min(z, capP1), capP2);
        const dTabSolid = Math.hypot(x, z - clampedZ) - tabR;

        // 3. Отвір вушка
        const dHole = Math.hypot(x, z - tabCenterZ) - holeR;

        // Плавне об'єднання тіла та язичка (smooth minimum з радіусом 2.0 мм)
        const k = 2.0;
        const h = Math.max(0, Math.min(1, 0.5 + 0.5 * (dTabSolid - dBody) / k));
        const dFused = (dTabSolid * (1 - h) + dBody * h) - k * h * (1 - h);

        // Віднімання отвору: max(dFused, -dHole)
        return Math.max(dFused, -dHole);
      };

      // Функція зчитування висоти барельєфа в точці (x, z)
      const frameThickness = Math.max(2.0, width * 0.04);
      const frameElevation = baseThickness + reliefHeight + 0.6;

      const heightAt = (x, z) => {
        if (keychain) {
          const distToHoleCenter = Math.hypot(x, z - tabCenterZ);
          if (distToHoleCenter <= tabR + 0.8 && z < edgeZ + 1.0) {
            return tabHeight;
          }
        }

        if (frame) {
          let distToEdge = 0;
          if (shape === 'circle') {
            distToEdge = radius - Math.sqrt(x * x + z * z);
          } else {
            distToEdge = Math.min(halfW - Math.abs(x), halfD - Math.abs(z));
          }

          if (distToEdge <= frameThickness) {
            const t = Math.max(0, Math.min(1, distToEdge / frameThickness));
            return frameElevation * (1.0 - t * 0.05);
          }
        }

        const u = (x / width) + 0.5;
        const v = (z / depth) + 0.5;

        if (u < 0 || u > 1 || v < 0 || v > 1) {
          return baseThickness;
        }

        const fx = u * (resX - 1);
        const fy = v * (resY - 1);
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
        const hNorm = (1 - wx) * (1 - wy) * h00 + wx * (1 - wy) * h10 + (1 - wx) * wy * h01 + wx * wy * h11;

        return baseThickness + hNorm * reliefHeight;
      };

      const cellInside = new Uint8Array(gridCols * gridRows);
      for (let r = 0; r < gridRows - 1; r++) {
        const cz = minZ + (r + 0.5) * cellSize;
        for (let c = 0; c < gridCols - 1; c++) {
          const cx = minX + (c + 0.5) * cellSize;
          if (sdfAt(cx, cz) <= 0) {
            cellInside[r * gridCols + c] = 1;
          }
        }
      }

      for (let r = 0; r < gridRows - 2; r++) {
        for (let c = 0; c < gridCols - 2; c++) {
          const c00 = cellInside[r * gridCols + c];
          const c10 = cellInside[r * gridCols + c + 1];
          const c01 = cellInside[(r + 1) * gridCols + c];
          const c11 = cellInside[(r + 1) * gridCols + c + 1];
          if (c00 && c11 && !c10 && !c01) {
            cellInside[r * gridCols + c + 1] = 1;
          } else if (!c00 && !c11 && c10 && c01) {
            cellInside[r * gridCols + c] = 1;
          }
        }
      }

      const topVertexIndices = new Int32Array(gridRows * gridCols).fill(-1);
      const botVertexIndices = new Int32Array(gridRows * gridCols).fill(-1);
      const vertices = [];
      const indices = [];

      const getOrCreateNode = (c, r) => {
        const idx = r * gridCols + c;
        if (topVertexIndices[idx] !== -1) {
          return { top: topVertexIndices[idx], bot: botVertexIndices[idx] };
        }

        let x = minX + c * cellSize;
        let z = minZ + r * cellSize;

        const d = sdfAt(x, z);
        if (Math.abs(d) < cellSize * 0.75) {
          const eps = 0.05;
          const dx = (sdfAt(x + eps, z) - sdfAt(x - eps, z)) / (2 * eps);
          const dz = (sdfAt(x, z + eps) - sdfAt(x, z - eps)) / (2 * eps);
          const len = Math.hypot(dx, dz) || 1.0;
          const shift = Math.max(-cellSize * 0.45, Math.min(cellSize * 0.45, d));
          x -= (dx / len) * shift;
          z -= (dz / len) * shift;
        }

        const topY = heightAt(x, z);
        const topIdx = vertices.length / 3;
        vertices.push(x, topY, z);

        const botIdx = vertices.length / 3;
        vertices.push(x, 0.0, z);

        topVertexIndices[idx] = topIdx;
        botVertexIndices[idx] = botIdx;
        return { top: topIdx, bot: botIdx };
      };

      // 1. ВЕРХ ТА ДНО
      for (let r = 0; r < gridRows - 1; r++) {
        for (let c = 0; c < gridCols - 1; c++) {
          if (!cellInside[r * gridCols + c]) continue;

          const nodeA = getOrCreateNode(c, r);
          const nodeB = getOrCreateNode(c + 1, r);
          const nodeC = getOrCreateNode(c, r + 1);
          const nodeD = getOrCreateNode(c + 1, r + 1);

          // Верхня поверхня (A -> C -> B та C -> D -> B, нормалі дивляться ВГОРУ +Y назовні):
          indices.push(nodeA.top, nodeC.top, nodeB.top);
          indices.push(nodeC.top, nodeD.top, nodeB.top);

          // Дно (C_bot -> A_bot -> D_bot та A_bot -> B_bot -> D_bot, нормалі дивляться ВНИЗ -Y назовні):
          indices.push(nodeC.bot, nodeA.bot, nodeD.bot);
          indices.push(nodeA.bot, nodeB.bot, nodeD.bot);
        }
      }

      // 2. БІЧНІ СТІНКИ (Side Walls)
      // Горизонтальні ребра: між рядками r-1 та r
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols - 1; c++) {
          const below = r > 0 ? cellInside[(r - 1) * gridCols + c] : 0;
          const above = r < gridRows - 1 ? cellInside[r * gridCols + c] : 0;

          if (below !== above) {
            const nodeLeft = getOrCreateNode(c, r);
            const nodeRight = getOrCreateNode(c + 1, r);

            if (below && !above) {
              // Тіло знизу (менший Z), стінка дивиться на +Z назовні
              indices.push(nodeLeft.top, nodeLeft.bot, nodeRight.top);
              indices.push(nodeLeft.bot, nodeRight.bot, nodeRight.top);
            } else {
              // Тіло зверху (більший Z), стінка дивиться на -Z назовні
              indices.push(nodeRight.top, nodeRight.bot, nodeLeft.top);
              indices.push(nodeRight.bot, nodeLeft.bot, nodeLeft.top);
            }
          }
        }
      }

      // Вертикальні ребра: між стовпчиками c-1 та c
      for (let r = 0; r < gridRows - 1; r++) {
        for (let c = 0; c < gridCols; c++) {
          const left = c > 0 ? cellInside[r * gridCols + c - 1] : 0;
          const right = c < gridCols - 1 ? cellInside[r * gridCols + c] : 0;

          if (left !== right) {
            const nodeBot = getOrCreateNode(c, r);
            const nodeTop = getOrCreateNode(c, r + 1);

            if (left && !right) {
              // Тіло ліворуч (менший X), стінка дивиться на +X назовні
              indices.push(nodeTop.top, nodeTop.bot, nodeBot.top);
              indices.push(nodeTop.bot, nodeBot.bot, nodeBot.top);
            } else {
              // Тіло праворуч (більший X), стінка дивиться на -X назовні
              indices.push(nodeBot.top, nodeBot.bot, nodeTop.top);
              indices.push(nodeBot.bot, nodeTop.bot, nodeTop.top);
            }
          }
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.35,
        metalness: 0.15,
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
