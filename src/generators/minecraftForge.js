// Генератор 1: Майнкрафт-Кузня (Багаторівневий 3D-Воксель Рельєф з піксель-редактором та пресетами)
(function () {
  // Кожен символ у шаблоні 16x16 позначає рівень висоти та колір:
  // '.' = порожньо (0)
  // '1' = Темний контур / Дерево (висота L1)
  // '2' = Середній шар / Сталь / Зелений (висота L2)
  // '3' = Високий шар / Алмаз / Золото (висота L3)
  // '4' = Супер-акцент / Рубін / Світіння (висота L4)

  const PRESETS = {
    sword: {
      name: '⚔️ Алмазний Меч',
      colors: { 1: 0x5c3a21, 2: 0x0284c7, 3: 0x38bdf8, 4: 0xe0f2fe },
      grid: [
        '.............222',
        '............2342',
        '...........23432',
        '..........23432.',
        '.........23432..',
        '........23432...',
        '.......23432....',
        '..22..23432.....',
        '..23223432......',
        '...233432.......',
        '....2332........',
        '...11232........',
        '..141.222.......',
        '.141...22.......',
        '1141............',
        '111.............'
      ]
    },
    pickaxe: {
      name: '⛏️ Алмазна Кірка',
      colors: { 1: 0x6b4423, 2: 0x0369a1, 3: 0x22d3ee, 4: 0xa5f3fc },
      grid: [
        '.....22333322...',
        '....2344444432..',
        '...234322223432.',
        '...232....112342',
        '..........141232',
        '.........141..22',
        '........141...2.',
        '.......141......',
        '......141.......',
        '.....141........',
        '....141.........',
        '...141..........',
        '..141...........',
        '.141............',
        '141.............',
        '11..............'
      ]
    },
    creeper: {
      name: '💚 Кріпер-Трофей',
      colors: { 1: 0x111827, 2: 0x15803d, 3: 0x22c55e, 4: 0x86efac },
      grid: [
        '2222222222222222',
        '2332233332233322',
        '2343223322344322',
        '2211112222111122',
        '2211112332111122',
        '2211112332111122',
        '2211112222111122',
        '2332221111222332',
        '2342221111222432',
        '2222111111112222',
        '2322111111112232',
        '2322111111112232',
        '2222112222112222',
        '2332112332112332',
        '2343222342223432',
        '2222222222222222'
      ]
    },
    tnt: {
      name: '🧨 Динаміт TNT',
      colors: { 1: 0x1f2937, 2: 0xb91c1c, 3: 0xef4444, 4: 0xf8fafc },
      grid: [
        '1111111111111111',
        '1232323232323231',
        '1323232323232321',
        '1232323232323231',
        '1111111111111111',
        '1444444444444441',
        '1411141114141111',
        '1441441414144141',
        '1441441414144141',
        '1441441414144141',
        '1444444444444441',
        '1111111111111111',
        '1232323232323231',
        '1323232323232321',
        '1232323232323231',
        '1111111111111111'
      ]
    },
    heart: {
      name: '❤️ Серце Життя',
      colors: { 1: 0x450a0a, 2: 0xb91c1c, 3: 0xef4444, 4: 0xfecaca },
      grid: [
        '................',
        '..1111....1111..',
        '.123331..133321.',
        '1234433113333321',
        '1344333333333321',
        '1343333333333321',
        '1333333333333221',
        '1233333333332221',
        '.12333333332221.',
        '..123333332221..',
        '...1233332221...',
        '....12332221....',
        '.....122221.....',
        '......1221......',
        '.......11.......',
        '................'
      ]
    },
    shield: {
      name: '🛡️ Щит-Заготовка (Tinkercad)',
      colors: { 1: 0x78350f, 2: 0x9ca3af, 3: 0xf59e0b, 4: 0xfef08a },
      grid: [
        '.33333333333333.',
        '3443333333333443',
        '3431111111111343',
        '3311222222221133',
        '3312222222222133',
        '3312222222222133',
        '3312222222222133',
        '3312222222222133',
        '3312222222222133',
        '.33122222222133.',
        '.33112222221133.',
        '..331222222133..',
        '...3312222133...',
        '....33122133....',
        '.....331133.....',
        '......3443......'
      ]
    },
    totem: {
      name: '🏆 Тотем Безсмертя',
      colors: { 1: 0x92400e, 2: 0xd97706, 3: 0xfacc15, 4: 0x10b981 },
      grid: [
        '....22222222....',
        '...2333333332...',
        '...2344334432...',
        '...2344334432...',
        '...2333113332...',
        '.22223311332222.',
        '2333222222223332',
        '2343233443323432',
        '2222233443322222',
        '....23333332....',
        '....22333322....',
        '.....233332.....',
        '.....223322.....',
        '......2332......',
        '.....233332.....',
        '....22222222....'
      ]
    },
    dragon: {
      name: '🐉 Дракон Енду',
      colors: { 1: 0x090d16, 2: 0x1e1b4b, 3: 0x9333ea, 4: 0xe879f9 },
      grid: [
        '..33........33..',
        '.343........343.',
        '.33111111111133.',
        '..112222222211..',
        '.11221122112211.',
        '.12222222222221.',
        '1121441221441211',
        '1221331221331221',
        '1222222112222221',
        '1112221111222111',
        '.11111222211111.',
        '..112233332211..',
        '..112344443211..',
        '...1122222211...',
        '....11111111....',
        '................'
      ]
    },
    hero_badge: {
      name: '⚡ Паспорт Героя',
      isMiniPreset: true,
      recommendedParams: { voxelSize: '2.0', heightStep: '1.2', solidBase: true, mountType: 'keychain' },
      colors: { 1: 0x1e293b, 2: 0x0284c7, 3: 0x38bdf8, 4: 0xfacc15 },
      grid: [
        '................',
        '................',
        '....22222222....',
        '...2333333332...',
        '..231114411132..',
        '..231144411132..',
        '..231444444132..',
        '..231114441132..',
        '..231144411132..',
        '..231144111132..',
        '...2333333332...',
        '....22222222....',
        '................',
        '................',
        '................',
        '................'
      ]
    },
    creature_track: {
      name: '🐾 Слід Істоти',
      isMiniPreset: true,
      recommendedParams: { voxelSize: '2.0', heightStep: '1.3', solidBase: true, mountType: 'none' },
      colors: { 1: 0x451a03, 2: 0x92400e, 3: 0xd97706, 4: 0xfde68a },
      grid: [
        '................',
        '..222222222222..',
        '.22111111111122.',
        '.21144111144112.',
        '.21433144133412.',
        '.21331433413312.',
        '.21111133111112.',
        '.21113344331112.',
        '.21133444433112.',
        '.21134444443112.',
        '.21133444433112.',
        '.21113311331112.',
        '.22111111111122.',
        '..222222222222..',
        '................',
        '................'
      ]
    },
    fossil_shell: {
      name: '🐚 Скам\'янілість',
      isMiniPreset: true,
      recommendedParams: { voxelSize: '2.0', heightStep: '1.2', solidBase: true, mountType: 'none' },
      colors: { 1: 0x334155, 2: 0x64748b, 3: 0xcbd5e1, 4: 0xf8fafc },
      grid: [
        '................',
        '..111111111111..',
        '.11223333332211.',
        '.12344444443321.',
        '.12432222223431.',
        '.13421111112431.',
        '.13421344312431.',
        '.13421444412431.',
        '.13421433112431.',
        '.13421111123431.',
        '.12433222334321.',
        '.12344444443211.',
        '.11223333221111.',
        '..111111111111..',
        '................',
        '................'
      ]
    },
    city_coin: {
      name: '🪙 Монета Міста',
      isMiniPreset: true,
      recommendedParams: { voxelSize: '2.0', heightStep: '1.2', solidBase: true, mountType: 'none' },
      colors: { 1: 0x78350f, 2: 0xb45309, 3: 0xf59e0b, 4: 0xfef08a },
      grid: [
        '................',
        '....33333333....',
        '..333211112333..',
        '.33211144111233.',
        '.32114144141123.',
        '.31114444441113.',
        '.31112344321113.',
        '.31111144111113.',
        '.31111144111113.',
        '.31111144111113.',
        '.32111444411123.',
        '.33211111111233.',
        '..333211112333..',
        '....33333333....',
        '................',
        '................'
      ]
    },
    game_token: {
      name: '🎲 Жетон Гравця',
      isMiniPreset: true,
      recommendedParams: { voxelSize: '2.0', heightStep: '1.3', solidBase: true, mountType: 'none' },
      colors: { 1: 0x1e1b4b, 2: 0x4338ca, 3: 0x818cf8, 4: 0xfef08a },
      grid: [
        '................',
        '....22222222....',
        '..221141141122..',
        '.21114444441112.',
        '.21113433431112.',
        '.21113344331112.',
        '.21111344311112.',
        '.21123344332112.',
        '.21233444433212.',
        '.21234433443212.',
        '.21123333332112.',
        '.22112233221122.',
        '..222222222222..',
        '....22222222....',
        '................',
        '................'
      ]
    },
    mini_tag: {
      name: '🏷️ Міні-Табличка',
      isMiniPreset: true,
      recommendedParams: { voxelSize: '2.0', heightStep: '1.2', solidBase: true, mountType: 'keychain' },
      colors: { 1: 0x064e3b, 2: 0x059669, 3: 0x34d399, 4: 0xfef08a },
      grid: [
        '................',
        '................',
        '..222222222222..',
        '..211114411112..',
        '..211144441112..',
        '..211443344112..',
        '..211134431112..',
        '..213314413312..',
        '..211334433112..',
        '..211114411112..',
        '..211134431112..',
        '..211111111112..',
        '..222222222222..',
        '................',
        '................',
        '................'
      ]
    },
    cardboard_stand: {
      name: '🏙️ Паз для Картону',
      isMiniPreset: true,
      recommendedParams: { voxelSize: '2.0', heightStep: '1.6', solidBase: true, mountType: 'none', slotWidth: '2.0' },
      colors: { 1: 0x1f2937, 2: 0x475569, 3: 0x38bdf8, 4: 0xf59e0b },
      grid: [
        '................',
        '..222222222222..',
        '.22333333333322.',
        '.23333333333332.',
        '.24444444444442.',
        '.24444444444442.',
        '.11111111111111.',
        '.11111111111111.',
        '.24444444444442.',
        '.24444444444442.',
        '.23333333333332.',
        '.22333333333322.',
        '..222222222222..',
        '................',
        '................',
        '................'
      ]
    },
    slot_calibrator: {
      name: '📏 Калібратор Пазів',
      isMiniPreset: true,
      recommendedParams: { voxelSize: '2.0', heightStep: '1.4', solidBase: true, mountType: 'none', slotWidth: '2.0' },
      colors: { 1: 0x334155, 2: 0x0284c7, 3: 0x38bdf8, 4: 0xf59e0b },
      grid: [
        '................',
        '.22222222222222.',
        '.23333333333332.',
        '.24444444444442.',
        '.24444444444442.',
        '.24.44..444...2.',
        '.24.44..444...2.',
        '.24.44..444...2.',
        '.24.44..444...2.',
        '.24.44..444...2.',
        '.24.44..444...2.',
        '.24444444444442.',
        '.23333333333332.',
        '.22222222222222.',
        '................',
        '................'
      ]
    }
  };

  const MC_CONFIG = {
    GRID_SIZE: 16,
    BASE_PLATE_HEIGHT: 2.0,
    DEFAULT_VOXEL_SIZE: 3.5,
    DEFAULT_HEIGHT_STEP: 1.5,
    BASE_HEIGHT_OFFSET: 2.5,
    KEYCHAIN_RING_OUTER: 7.5,
    KEYCHAIN_RING_INNER: 3.2,
    KEYCHAIN_SEGMENTS: 24,
    LABEL_PIXEL_MIN: 1.8,
    LABEL_PIXEL_SCALE: 0.52,
    LABEL_PLATE_HEIGHT: 3.0,
    LABEL_LETTER_HEIGHT: 2.2
  };

  class MinecraftForgeGenerator {
    constructor() {
      this.currentPresetKey = 'sword';
      this.activeBrush = 3; // 0 = Гумка, 1..4 = Рівні висоти
      this.isPainting = false;
      this._strokeRecorded = false;
      this.onBeforeMutate = null;
      this.onAfterMutate = null;
      this.grid = [];
      this.colors = { 1: 0x5c3a21, 2: 0x0284c7, 3: 0x38bdf8, 4: 0xe0f2fe };
      this.lastConnectivity = {
        activeCount: 0,
        rawIslands: 1,
        finalIslands: 1,
        bridgedCount: 0,
        hasDiagonalOnly: false
      };
      this._onMouseUp = () => {
        if (this.isPainting) {
          this.isPainting = false;
          this._strokeRecorded = false;
          if (this.onAfterMutate) this.onAfterMutate();
        }
      };
      window.addEventListener('mouseup', this._onMouseUp);
      this.loadPreset('sword', false);
    }

    getState() {
      return {
        currentPresetKey: this.currentPresetKey,
        colors: Object.assign({}, this.colors),
        grid: this.grid.map(row => row.slice())
      };
    }

    setState(state, triggerRebuild = true) {
      if (!state || !Array.isArray(state.grid)) return;
      this.currentPresetKey = state.currentPresetKey || 'sword';
      if (state.colors) {
        this.colors = Object.assign({}, state.colors);
      }
      this.grid = state.grid.map(row =>
        row.slice(0, MC_CONFIG.GRID_SIZE).map(v => Math.max(0, Math.min(4, parseInt(v, 10) || 0)))
      );
      while (this.grid.length < MC_CONFIG.GRID_SIZE) {
        this.grid.push(Array(MC_CONFIG.GRID_SIZE).fill(0));
      }
      this.renderCanvasUI();
      if (triggerRebuild && window.StudioApp) {
        window.StudioApp.rebuildCurrentModel(false, true);
      }
    }

    loadPreset(key, triggerRebuild = true, recordHistory = false) {
      if (recordHistory && this.onBeforeMutate) this.onBeforeMutate();
      const p = PRESETS[key] || PRESETS.sword;
      this.currentPresetKey = key;
      this.colors = Object.assign({}, p.colors);
      this.grid = p.grid.map(row =>
        row.split('').map(ch => (ch === '.' ? 0 : parseInt(ch, 10) || 0))
      );
      this.renderCanvasUI();
      if (recordHistory && this.onAfterMutate) this.onAfterMutate();
      if (triggerRebuild && window.StudioApp) {
        window.StudioApp.rebuildCurrentModel(true);
      }
    }

    clearGrid() {
      if (this.onBeforeMutate) this.onBeforeMutate();
      this.grid = Array.from({ length: MC_CONFIG.GRID_SIZE }, () => Array(MC_CONFIG.GRID_SIZE).fill(0));
      this.renderCanvasUI();
      if (this.onAfterMutate) this.onAfterMutate();
      if (window.StudioSound) window.StudioSound.playClearCanvas();
      if (window.StudioApp) window.StudioApp.rebuildCurrentModel(true, true);
    }

    // Випадковий симетричний тотем/меч/артефакт (діти обожнюють кнопку рандому!)
    randomizeArtifact() {
      if (this.onBeforeMutate) this.onBeforeMutate();
      const palettes = [
        { 1: 0x5c3a21, 2: 0x0284c7, 3: 0x38bdf8, 4: 0xe0f2fe },
        { 1: 0x31102f, 2: 0x9333ea, 3: 0xc084fc, 4: 0xfef08a },
        { 1: 0x14532d, 2: 0x16a34a, 3: 0x4ade80, 4: 0xfacc15 },
        { 1: 0x7f1d1d, 2: 0xdc2626, 3: 0xf97316, 4: 0xfef08a }
      ];
      this.colors = palettes[Math.floor(Math.random() * palettes.length)];
      this.grid = Array.from({ length: MC_CONFIG.GRID_SIZE }, () => Array(MC_CONFIG.GRID_SIZE).fill(0));

      for (let r = 1; r < 15; r++) {
        for (let c = 2; c < 8; c++) {
          const distFromCenter = 7.5 - c;
          const prob = 0.78 - distFromCenter * 0.11;
          if (Math.random() < prob) {
            const lvl = Math.min(4, Math.max(1, Math.floor(Math.random() * 4) + 1));
            this.grid[r][c] = lvl;
            this.grid[r][15 - c] = lvl; // Симетрія!
          }
        }
        // Центральна вісь завжди з'єднана, щоб модель була міцною
        this.grid[r][7] = Math.floor(Math.random() * 3) + 2;
        this.grid[r][8] = this.grid[r][7];
      }

      this.renderCanvasUI();
      if (this.onAfterMutate) this.onAfterMutate();
      if (window.StudioApp) window.StudioApp.rebuildCurrentModel(true, true);
    }

    // Пошук зв'язних компонент (4-сусідство по гранях або 8-сусідство з діагоналями)
    _findComponents(maskGrid, allowDiagonal = false) {
      const N = MC_CONFIG.GRID_SIZE;
      const visited = Array.from({ length: N }, () => Array(N).fill(false));
      const components = [];
      const dirs = allowDiagonal
        ? [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
        : [[-1, 0], [1, 0], [0, -1], [0, 1]];

      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (maskGrid[r][c] && !visited[r][c]) {
            const comp = [];
            const queue = [[r, c]];
            visited[r][c] = true;
            while (queue.length > 0) {
              const [cr, cc] = queue.shift();
              comp.push([cr, cc]);
              for (const [dr, dc] of dirs) {
                const nr = cr + dr;
                const nc = cc + dc;
                if (nr >= 0 && nr < N && nc >= 0 && nc < N && maskGrid[nr][nc] && !visited[nr][nc]) {
                  visited[nr][nc] = true;
                  queue.push([nr, nc]);
                }
              }
            }
            components.push(comp);
          }
        }
      }
      return components;
    }

    // Аналізує зв'язність малюнка та будує маску суцільної основи (з автоматичними містками між островами)
    computeBaseAndConnectivity(solidBase) {
      const N = MC_CONFIG.GRID_SIZE;
      const occupied = Array.from({ length: N }, (_, r) =>
        Array.from({ length: N }, (_, c) => this.grid[r][c] > 0)
      );

      let activeCount = 0;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (occupied[r][c]) activeCount++;
        }
      }

      const rawComps4 = this._findComponents(occupied, false);
      const rawComps8 = this._findComponents(occupied, true);
      const hasDiagonalOnly = rawComps4.length > rawComps8.length;

      const baseMask = Array.from({ length: N }, () => Array(N).fill(false));
      let bridgedCount = 0;

      if (solidBase && activeCount > 0) {
        // 1. Контур 1 клітинка навколо всіх активних вокселів
        for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
            if (occupied[r][c]) {
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr;
                  const nc = c + dc;
                  if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
                    baseMask[nr][nc] = true;
                  }
                }
              }
            }
          }
        }

        // 2. Якщо після контуру залишилися окремі острови — з'єднуємо їх містками шириною 2 клітинки
        let baseComps = this._findComponents(baseMask, false);
        while (baseComps.length > 1) {
          let bestDist = Infinity;
          let bestA = null;
          let bestB = null;

          const comp0 = baseComps[0];
          for (let k = 1; k < baseComps.length; k++) {
            for (const [r1, c1] of comp0) {
              for (const [r2, c2] of baseComps[k]) {
                const d = Math.abs(r1 - r2) + Math.abs(c1 - c2);
                if (d < bestDist) {
                  bestDist = d;
                  bestA = [r1, c1];
                  bestB = [r2, c2];
                }
              }
            }
          }

          if (!bestA || !bestB) break;

          const markThick = (rr, cc) => {
            for (let dr = 0; dr <= 1; dr++) {
              for (let dc = 0; dc <= 1; dc++) {
                const nr = Math.min(N - 1, Math.max(0, rr + dr));
                const nc = Math.min(N - 1, Math.max(0, cc + dc));
                if (!baseMask[nr][nc]) {
                  baseMask[nr][nc] = true;
                  bridgedCount++;
                }
              }
            }
          };

          let [cr, cc] = bestA;
          const [tr, tc] = bestB;
          while (cr !== tr) {
            cr += cr < tr ? 1 : -1;
            markThick(cr, cc);
          }
          while (cc !== tc) {
            cc += cc < tc ? 1 : -1;
            markThick(cr, cc);
          }

          baseComps = this._findComponents(baseMask, false);
        }
      }

      const combinedMask = Array.from({ length: N }, (_, r) =>
        Array.from({ length: N }, (_, c) => occupied[r][c] || baseMask[r][c])
      );
      const finalComps = this._findComponents(combinedMask, false);

      this.lastConnectivity = {
        activeCount,
        rawIslands: rawComps4.length,
        finalIslands: finalComps.length,
        bridgedCount,
        hasDiagonalOnly
      };

      return { baseMask, combinedMask, connectivity: this.lastConnectivity };
    }

    renderCanvasUI() {
      const container = document.getElementById('mc-pixel-grid');
      if (!container) return;
      container.innerHTML = '';

      const hexStr = (num) => '#' + num.toString(16).padStart(6, '0');

      for (let r = 0; r < MC_CONFIG.GRID_SIZE; r++) {
        for (let c = 0; c < MC_CONFIG.GRID_SIZE; c++) {
          const cell = document.createElement('div');
          let classNames = 'pixel-cell';
          if (r === 7) classNames += ' axis-x';
          if (c === 7) classNames += ' axis-y';
          cell.className = classNames;
          cell.dataset.r = r;
          cell.dataset.c = c;
          cell.title = `Клітинка [${r + 1}, ${c + 1}] • Шар ${this.grid[r][c] || '0'}`;

          const val = this.grid[r][c];
          if (val > 0) {
            cell.style.backgroundColor = hexStr(this.colors[val] || 0x38bdf8);
            cell.textContent = val;
          } else {
            cell.style.backgroundColor = '#0b1322';
            cell.textContent = '';
          }

          const paintCell = () => {
            if (this.grid[r][c] !== this.activeBrush) {
              if (!this._strokeRecorded) {
                this._strokeRecorded = true;
                if (this.onBeforeMutate) this.onBeforeMutate();
              }
              this.grid[r][c] = this.activeBrush;
              cell.title = `Клітинка [${r + 1}, ${c + 1}] • Шар ${this.activeBrush || '0'}`;
              if (this.activeBrush > 0) {
                cell.style.backgroundColor = hexStr(this.colors[this.activeBrush]);
                cell.textContent = this.activeBrush;
              } else {
                cell.style.backgroundColor = '#0b1322';
                cell.textContent = '';
              }
              if (window.StudioSound) window.StudioSound.playPaintNote(r, c, this.activeBrush);
              if (window.StudioApp) window.StudioApp.rebuildCurrentModel(false);
            }
          };

          cell._paintSelf = paintCell;

          cell.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isPainting = true;
            this._strokeRecorded = false;
            paintCell();
          });
          cell.addEventListener('mouseenter', () => {
            if (this.isPainting) paintCell();
          });

          container.appendChild(cell);
        }
      }

      // Підтримка плавного малювання пальцем на сенсорних дошках та планшетах
      if (!container._touchBound) {
        container._touchBound = true;
        const handleTouchPaint = (e) => {
          if (!e.touches || e.touches.length === 0) return;
          const touch = e.touches[0];
          const el = document.elementFromPoint(touch.clientX, touch.clientY);
          if (el && el._paintSelf) {
            el._paintSelf();
          }
        };

        container.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.isPainting = true;
          this._strokeRecorded = false;
          handleTouchPaint(e);
        }, { passive: false });

        container.addEventListener('touchmove', (e) => {
          e.preventDefault();
          if (this.isPainting) handleTouchPaint(e);
        }, { passive: false });

        container.addEventListener('touchend', () => {
          this.isPainting = false;
        });
      }
    }

    // Спеціальний калібратор пазів гуртка (34 × 24 × 8 мм з 4 пазами під картон: 1.5, 2.0, 2.5, 3.0 мм + допуск +0.2 мм та фасками)
    buildSlotCalibrator(params, materials) {
      const group = new THREE.Group();
      // 1. Нижня монолітна основа: 34 мм (X) × 24 мм (Z) × 2.0 мм (Y)
      const baseGeo = new THREE.BoxGeometry(34.0, 2.0, 24.0);
      const baseMesh = new THREE.Mesh(baseGeo, materials[1]);
      baseMesh.position.set(0, 1.0, 0);
      group.add(baseMesh);

      // 2. Задній хребет (упор для картону та місце для цифр): 34 мм × 6 мм × 7 мм (Y від 2.0 до 8.0, Z від -12.0 до -5.0)
      const spineGeo = new THREE.BoxGeometry(34.0, 6.0, 7.0);
      const spineMesh = new THREE.Mesh(spineGeo, materials[2]);
      spineMesh.position.set(0, 5.0, -8.5);
      group.add(spineMesh);

      // 3. 5 зубців гребінця, що обмежують 4 калібровані пази (Z від -5.0 до +12.0 мм, довжина 17 мм, висота 6 мм)
      // Пази (номінал 1.5, 2.0, 2.5, 3.0 мм з інженерним допуском посадки +0.2 мм):
      // Слот 1: 1.7 мм, Слот 2: 2.2 мм, Слот 3: 2.7 мм, Слот 4: 3.2 мм (разом 9.8 мм)
      // Зубці: 4.8, 4.8, 4.9, 4.8, 4.9 мм (разом 24.2 мм, сумарна ширина = 34.0 мм)
      const toothWidths = [4.8, 4.8, 4.9, 4.8, 4.9];
      const slotWidths = [1.7, 2.2, 2.7, 3.2];
      const toothLenZ = 17.0;
      const toothH = 6.0;
      const toothY = 5.0; // Y від 2.0 до 8.0
      const toothZ = 3.5; // центр по Z

      let currentX = -17.0;
      const slotCentersX = [];

      for (let i = 0; i < 5; i++) {
        const tw = toothWidths[i];
        const toothCenterX = currentX + tw / 2;
        const toothGeo = new THREE.BoxGeometry(tw, toothH, toothLenZ);
        const toothMesh = new THREE.Mesh(toothGeo, materials[3]);
        toothMesh.position.set(toothCenterX, toothY, toothZ);
        group.add(toothMesh);

        currentX += tw;
        if (i < 4) {
          const sw = slotWidths[i];
          const slotCenterX = currentX + sw / 2;
          slotCentersX.push(slotCenterX);

          // Скоси/фаски (45°, 0.85 мм) на вході кожного паза для легкого вставляння без розшарування картону
          const chamferGeo = new THREE.BoxGeometry(0.85, 0.85, toothLenZ);
          const leftChamfer = new THREE.Mesh(chamferGeo, materials[4]);
          leftChamfer.position.set(currentX, 8.0, toothZ);
          leftChamfer.rotation.z = Math.PI / 4;
          group.add(leftChamfer);

          const rightChamfer = new THREE.Mesh(chamferGeo, materials[4]);
          rightChamfer.position.set(currentX + sw, 8.0, toothZ);
          rightChamfer.rotation.z = -Math.PI / 4;
          group.add(rightChamfer);

          currentX += sw;
        }
      }

      // 4. Об'ємні воксельні цифри номіналу товщини картону на хребті: '1.5', '2.0', '2.5', '3.0'
      const labels = ['1.5', '2.0', '2.5', '3.0'];
      const px = 0.4; // Keep three-digit labels within each slot's spacing.
      const textH = 1.0; // мм
      const lGeo = new THREE.BoxGeometry(px, textH, px);

      labels.forEach((lbl, sIdx) => {
        const chars = window.VoxelFont.textToCharMatrices(lbl, 4);
        const charW = chars.length * 6 * px;
        const startX = slotCentersX[sIdx] - charW / 2 + px / 2;
        const startZ = -8.5 - (7 * px) / 2 + px / 2;

        chars.forEach((cItem, cIdx) => {
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 5; c++) {
              if (cItem.matrix[r][c] === 1) {
                const mesh = new THREE.Mesh(lGeo, materials[4]);
                mesh.position.set(
                  startX + (cIdx * 6 + c) * px,
                  8.0 + textH / 2,
                  startZ + r * px
                );
                group.add(mesh);
              }
            }
          }
        });
      });

      // The four calibrated gaps remain unchanged. The selected nominal width
      // moves a raised comparison marker, which is readable without color.
      const selectedSlot = [1.5, 2, 2.5, 3].indexOf(Number(params.slotWidth) || 2);
      const marker = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.2, 3), materials[4]);
      marker.name = 'calibratorSelectedSlot';
      marker.position.set(slotCentersX[Math.max(0, selectedSlot)], 8.6, -11);
      group.add(marker);

      return group;
    }

    // Генерація 3D-геометрії у реальних міліметрах
    build3D(params) {
      const group = new THREE.Group();

      const voxelSize = parseFloat(params.voxelSize) || MC_CONFIG.DEFAULT_VOXEL_SIZE; // мм
      const basePlateHeight = params.solidBase ? MC_CONFIG.BASE_PLATE_HEIGHT : 0.0;  // мм
      const heightStep = parseFloat(params.heightStep) || MC_CONFIG.DEFAULT_HEIGHT_STEP; // мм різниця між шарами
      const mountType = params.mountType || 'keychain';      // 'none', 'keychain', 'stand'
      const customLabel = (params.customLabel || '').trim();

      // Висоти для кожного з 4 рівнів (мм)
      const levelHeights = {
        1: basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET,
        2: basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET + heightStep,
        3: basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET + heightStep * 2,
        4: basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET + heightStep * 3
      };

      const materials = {
        0: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.1 }),
        1: new THREE.MeshStandardMaterial({ color: this.colors[1], roughness: 0.5, metalness: 0.15 }),
        2: new THREE.MeshStandardMaterial({ color: this.colors[2], roughness: 0.4, metalness: 0.2 }),
        3: new THREE.MeshStandardMaterial({ color: this.colors[3], roughness: 0.3, metalness: 0.25 }),
        4: new THREE.MeshStandardMaterial({ color: this.colors[4], roughness: 0.25, metalness: 0.3 })
      };

      // Якщо обрано «Калібратор пазів гуртка» — створюємо прецизійний тестовий гребінець
      if (this.currentPresetKey === 'slot_calibrator') {
        return this.buildSlotCalibrator(params, materials);
      }

      const isCardboardStand = this.currentPresetKey === 'cardboard_stand';
      const nominalSlot = parseFloat(params.slotWidth) || 2.0;
      const actualSlotWidth = nominalSlot + 0.2; // +0.2 мм інженерний допуск посадки

      const totalWidth = MC_CONFIG.GRID_SIZE * voxelSize;
      const offset = -totalWidth / 2 + voxelSize / 2;

      // Обчислення положення рядка по Z (для пазової підставки рядки 0..5 та 8..15 точно розсуваються на ширину паза)
      const getRowZ = (r) => {
        if (!isCardboardStand) return offset + r * voxelSize;
        if (r <= 5) {
          return -actualSlotWidth / 2 - voxelSize / 2 - (5 - r) * voxelSize;
        } else if (r >= 8) {
          return actualSlotWidth / 2 + voxelSize / 2 + (r - 8) * voxelSize;
        } else {
          return (r === 6 ? -1 : 1) * (actualSlotWidth / 4);
        }
      };

      const { baseMask, combinedMask } = this.computeBaseAndConnectivity(params.solidBase);

      // Якщо увімкнено "Суцільна підкладка" — будуємо підкладку під контуром та містками між островами
      if (params.solidBase) {
        const baseGeo = new THREE.BoxGeometry(voxelSize, basePlateHeight, voxelSize);
        for (let r = 0; r < MC_CONFIG.GRID_SIZE; r++) {
          for (let c = 0; c < MC_CONFIG.GRID_SIZE; c++) {
            if (baseMask[r][c] && this.grid[r][c] === 0) {
              const mesh = new THREE.Mesh(baseGeo, materials[0]);
              mesh.position.set(offset + c * voxelSize, basePlateHeight / 2, getRowZ(r));
              group.add(mesh);
            }
          }
        }
      }

      // Будуємо основні різнорівневі вокселі та визначаємо фактичні межі зайнятих клітинок
      const levelGeos = {
        1: new THREE.BoxGeometry(voxelSize, levelHeights[1], voxelSize),
        2: new THREE.BoxGeometry(voxelSize, levelHeights[2], voxelSize),
        3: new THREE.BoxGeometry(voxelSize, levelHeights[3], voxelSize),
        4: new THREE.BoxGeometry(voxelSize, levelHeights[4], voxelSize)
      };

      let minR = MC_CONFIG.GRID_SIZE;
      let maxR = -1;
      let topRowSumC = 0;
      let topRowCount = 0;

      for (let r = 0; r < MC_CONFIG.GRID_SIZE; r++) {
        for (let c = 0; c < MC_CONFIG.GRID_SIZE; c++) {
          if (combinedMask[r][c]) {
            if (r < minR) {
              minR = r;
              topRowSumC = c;
              topRowCount = 1;
            } else if (r === minR) {
              topRowSumC += c;
              topRowCount++;
            }
            if (r > maxR) maxR = r;
          }
          const lvl = this.grid[r][c];
          if (lvl > 0) {
            const h = levelHeights[lvl] || 4.0;
            const geo = levelGeos[lvl];
            const mesh = new THREE.Mesh(geo, materials[lvl]);
            mesh.position.set(offset + c * voxelSize, h / 2, getRowZ(r));
            group.add(mesh);
          }
        }
      }

      // Для пазової підставки: монолітне дно та скошені фаски (45°) на верхніх краях входу
      if (isCardboardStand) {
        const floorH = Math.max(2.0, basePlateHeight + 1.2);
        const slotLenX = 14 * voxelSize;
        const floorGeo = new THREE.BoxGeometry(slotLenX, floorH, actualSlotWidth);
        const floorMesh = new THREE.Mesh(floorGeo, materials[1]);
        floorMesh.position.set(0, floorH / 2, 0);
        group.add(floorMesh);

        // Фаски (скіс 45°, 0.9 мм) на внутрішніх верхніх гранях входу в паз
        const chamferSize = 0.9;
        const chamferGeo = new THREE.BoxGeometry(slotLenX, chamferSize, chamferSize);
        const wallTopY = levelHeights[4];

        const chamferBack = new THREE.Mesh(chamferGeo, materials[4]);
        chamferBack.position.set(0, wallTopY - chamferSize * 0.35, -actualSlotWidth / 2);
        chamferBack.rotation.x = Math.PI / 4;
        group.add(chamferBack);

        const chamferFront = new THREE.Mesh(chamferGeo, materials[4]);
        chamferFront.position.set(0, wallTopY - chamferSize * 0.35, actualSlotWidth / 2);
        chamferFront.rotation.x = -Math.PI / 4;
        group.add(chamferFront);
      }

      // Якщо полотно порожнє — використовуємо стандартні межі
      if (maxR < 0) {
        minR = 0;
        maxR = MC_CONFIG.GRID_SIZE - 1;
        topRowSumC = 7.5;
        topRowCount = 1;
      }

      // Додаємо вушко для брелока (прив'язується до фактичного верхнього краю фігури)
      if (mountType === 'keychain') {
        const ringOuter = MC_CONFIG.KEYCHAIN_RING_OUTER;
        const ringInner = MC_CONFIG.KEYCHAIN_RING_INNER;
        const ringHeight = Math.max(3.5, basePlateHeight + MC_CONFIG.BASE_HEIGHT_OFFSET);

        const shape = new THREE.Shape();
        shape.absarc(0, 0, ringOuter, 0, Math.PI * 2, false);
        const hole = new THREE.Path();
        hole.absarc(0, 0, ringInner, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
          depth: ringHeight,
          bevelEnabled: false,
          curveSegments: MC_CONFIG.KEYCHAIN_SEGMENTS
        });
        extrudeGeo.rotateX(Math.PI / 2);

        const anchorCol = topRowCount > 0 ? topRowSumC / topRowCount : 7.5;
        const anchorX = offset + anchorCol * voxelSize;
        const topEdgeZ = getRowZ(minR);

        const ringMesh = new THREE.Mesh(extrudeGeo, materials[1]);
        ringMesh.position.set(anchorX, ringHeight, topEdgeZ - voxelSize * 1.1);
        group.add(ringMesh);

        // Перемичка до основної фігури
        const bridgeGeo = new THREE.BoxGeometry(voxelSize * 3, ringHeight * 0.85, voxelSize * 2.6);
        const bridgeMesh = new THREE.Mesh(bridgeGeo, materials[1]);
        bridgeMesh.position.set(anchorX, (ringHeight * 0.85) / 2, topEdgeZ + voxelSize * 0.2);
        group.add(bridgeMesh);
      }

      // Якщо обрано плашку з ім'ям внизу (прив'язується до фактичного нижнього краю фігури)
      if (customLabel.length > 0 || mountType === 'stand') {
        const labelText = customLabel.length > 0 ? customLabel : 'МАЙНКРАФТ';
        const charMatrices = window.VoxelFont.textToCharMatrices(labelText, 9);
        const px = Math.max(MC_CONFIG.LABEL_PIXEL_MIN, voxelSize * MC_CONFIG.LABEL_PIXEL_SCALE);
        const textWidth = charMatrices.length * 6 * px;
        const bottomEdgeZ = getRowZ(maxR);
        const plateW = Math.max(voxelSize * 8, textWidth + 8);
        const plateD = 9 * px;
        const plateH = MC_CONFIG.LABEL_PLATE_HEIGHT;

        const plateZ = bottomEdgeZ + voxelSize * 0.8 + plateD / 2;

        const plateGeo = new THREE.BoxGeometry(plateW, plateH, plateD);
        const plateMesh = new THREE.Mesh(plateGeo, materials[1]);
        plateMesh.position.set(0, plateH / 2, plateZ);
        group.add(plateMesh);

        // Місток, що з'єднує фігурку з іменною табличкою
        const connectorGeo = new THREE.BoxGeometry(plateW * 0.65, plateH, voxelSize * 2.5);
        const connectorMesh = new THREE.Mesh(connectorGeo, materials[1]);
        connectorMesh.position.set(0, plateH / 2, plateZ - plateD / 2 - voxelSize * 0.5);
        group.add(connectorMesh);

        // Воксельні літери імені зверху на табличці
        const startX = -textWidth / 2 + px / 2;
        const startZ = plateZ - (7 * px) / 2 + px / 2;
        const letterH = MC_CONFIG.LABEL_LETTER_HEIGHT;
        const lGeo = new THREE.BoxGeometry(px, letterH, px);

        charMatrices.forEach((item, cIdx) => {
          const mat = item.matrix;
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 5; c++) {
              if (mat[r][c] === 1) {
                const lMesh = new THREE.Mesh(lGeo, materials[3]);
                lMesh.position.set(
                  startX + (cIdx * 6 + c) * px,
                  plateH + letterH / 2,
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
  }

  window.MinecraftForgeGenerator = MinecraftForgeGenerator;
  window.MINECRAFT_PRESETS = PRESETS;
})();
