// Головний контролер студії «3D Кузня Чудес»
(function () {
  const STORAGE_KEY = '3d_kuznya_project_autosave_v1';

  class StudioApp {
    constructor() {
      this.activeTab = 'minecraft'; // 'minecraft', 'illusion', 'physics', 'mob'
      this.viewMode = 'split';      // 'editor', 'split', 'viewport'
      this.sceneManager = null;

      this.undoStack = [];
      this.redoStack = [];
      this.maxHistory = 35;
      this._isRestoring = false;

      this.mcGen = new window.MinecraftForgeGenerator();
      this.illusionGen = new window.DualIllusionGenerator();
      this.physicsGen = new window.PhysicsMechanicsGenerator();
      this.mobGen = new window.MobMutatorGenerator();

      this.mcGen.onBeforeMutate = () => this.recordUndoSnapshot();
      this.mcGen.onAfterMutate = () => {
        this.updateMinecraftConnectivityUI();
        this.markModelModified();
        this.autosave();
      };
    }

    init() {
      this.sceneManager = new window.SceneManager('viewport-container');
      this.sceneManager.init();
      this.sceneManager.onDimensionsUpdated = () => {
        this.updateDiagnosticsUI();
      };

      // Кешуємо DOM-елементи
      this._domCache = {
        workspace: document.getElementById('main-workspace'),
        autosaveTag: document.getElementById('autosave-tag'),
        btnUndo: document.getElementById('btn-undo'),
        btnRedo: document.getElementById('btn-redo'),
        btnMcUndo: document.getElementById('btn-mc-undo'),
        btnToggleMono: document.getElementById('btn-toggle-mono'),
        btnHudMono: document.getElementById('btn-hud-mono'),
        monoColorPicker: document.getElementById('mono-color-picker'),
        verificationBadge: document.getElementById('print-verification-badge'),
        verificationSelect: document.getElementById('verification-status-select'),
        slicerTimeInput: document.getElementById('slicer-time-input'),
        geomCheckPill: document.getElementById('geom-check-pill'),
        mcConnectivityStatus: document.getElementById('mc-connectivity-status'),
        illusionCameraBar: document.getElementById('illusion-camera-bar'),
        physicsActionBar: document.getElementById('physics-action-bar'),
        mcVoxelSize: document.getElementById('mc-voxel-size'),
        mcHeightStep: document.getElementById('mc-height-step'),
        mcSolidBase: document.getElementById('mc-solid-base'),
        mcMountType: document.getElementById('mc-mount-type'),
        mcCustomLabel: document.getElementById('mc-custom-label'),
        valMcVoxel: document.getElementById('val-mc-voxel'),
        valMcStep: document.getElementById('val-mc-step'),
        ilWord1: document.getElementById('il-word1'),
        ilWord2: document.getElementById('il-word2'),
        ilVoxelSize: document.getElementById('il-voxel-size'),
        ilSafeSupports: document.getElementById('il-safe-supports'),
        ilLayoutMode: document.getElementById('il-layout-mode'),
        ilColorPrimary: document.getElementById('il-color-primary'),
        valIlVoxel: document.getElementById('val-il-voxel'),
        phSubmode: document.getElementById('ph-submode'),
        phExtrudeHeight: document.getElementById('ph-extrude-height'),
        phSpringThickness: document.getElementById('ph-spring-thickness'),
        phWingWeight: document.getElementById('ph-wing-weight'),
        phArmLength: document.getElementById('ph-arm-length'),
        phIncludeAmmo: document.getElementById('ph-include-ammo'),
        phCustomText: document.getElementById('ph-custom-text'),
        phSpringGroup: document.getElementById('ph-spring-group'),
        phWeightGroup: document.getElementById('ph-weight-group'),
        btnPhysicsDemo: document.getElementById('btn-physics-demo'),
        valPhHeight: document.getElementById('val-ph-height'),
        valPhSpring: document.getElementById('val-ph-spring'),
        valPhWeight: document.getElementById('val-ph-weight'),
        valPhArm: document.getElementById('val-ph-arm'),
        mobArchetype: document.getElementById('mob-archetype'),
        mobHeadScale: document.getElementById('mob-head-scale'),
        mobBodyBulk: document.getElementById('mob-body-bulk'),
        mobEyeType: document.getElementById('mob-eye-type'),
        mobHeadgear: document.getElementById('mob-headgear'),
        mobBackgear: document.getElementById('mob-backgear'),
        mobWeapon: document.getElementById('mob-weapon'),
        mobName: document.getElementById('mob-name'),
        mobTinkercadBlank: document.getElementById('mob-tinkercad-blank'),
        valMobHead: document.getElementById('val-mob-head'),
        valMobBulk: document.getElementById('val-mob-bulk')
      };

      this.bindTabs();
      this.bindTopActions();
      this.bindViewModeControls();
      this.bindVerificationControls();
      this.bindMinecraftControls();
      this.bindIllusionControls();
      this.bindPhysicsControls();
      this.bindMobControls();

      // Відновлюємо попереднє автозбереження (якщо є) або рендеримо стартовий стан
      const restored = this.restoreAutosave();
      if (!restored) {
        this.mcGen.renderCanvasUI();
        this.rebuildCurrentModel(true);
      }
      this.updateHistoryButtons();
    }

    // -------------------------------------------------------------------------
    // ІСТОРІЯ ЗМІН (UNDO / REDO) ТА ЗБЕРЕЖЕННЯ ПРОЄКТУ (.JSON + LOCALSTORAGE)
    // -------------------------------------------------------------------------
    serializeState() {
      const dom = this._domCache || {};
      return {
        app: '3d-club-studio',
        version: '1.2.0',
        savedAt: new Date().toISOString(),
        activeTab: this.activeTab,
        monochrome: this.sceneManager ? this.sceneManager.isMonochrome : false,
        monoColor: dom.monoColorPicker?.value || '#cfd6df',
        verificationStatus: dom.verificationSelect?.value || 'generated',
        slicerNote: dom.slicerTimeInput?.value || '',
        minecraft: this.mcGen.getState(),
        controls: {
          mcVoxelSize: dom.mcVoxelSize?.value,
          mcHeightStep: dom.mcHeightStep?.value,
          mcSolidBase: dom.mcSolidBase?.checked,
          mcMountType: dom.mcMountType?.value,
          mcCustomLabel: dom.mcCustomLabel?.value,
          ilWord1: dom.ilWord1?.value,
          ilWord2: dom.ilWord2?.value,
          ilVoxelSize: dom.ilVoxelSize?.value,
          ilSafeSupports: dom.ilSafeSupports?.checked,
          ilLayoutMode: dom.ilLayoutMode?.value,
          ilColorPrimary: dom.ilColorPrimary?.value,
          phSubmode: dom.phSubmode?.value,
          phExtrudeHeight: dom.phExtrudeHeight?.value,
          phSpringThickness: dom.phSpringThickness?.value,
          phWingWeight: dom.phWingWeight?.value,
          phArmLength: dom.phArmLength?.value,
          phIncludeAmmo: dom.phIncludeAmmo?.checked,
          phCustomText: dom.phCustomText?.value,
          mobArchetype: dom.mobArchetype?.value,
          mobHeadScale: dom.mobHeadScale?.value,
          mobBodyBulk: dom.mobBodyBulk?.value,
          mobEyeType: dom.mobEyeType?.value,
          mobHeadgear: dom.mobHeadgear?.value,
          mobBackgear: dom.mobBackgear?.value,
          mobWeapon: dom.mobWeapon?.value,
          mobName: dom.mobName?.value,
          mobTinkercadBlank: dom.mobTinkercadBlank?.checked
        }
      };
    }

    applyState(state, animatePop = false) {
      if (!state || typeof state !== 'object') return;
      this._isRestoring = true;
      const dom = this._domCache || {};
      const c = state.controls || {};

      const setVal = (el, val) => {
        if (el && val !== undefined && val !== null) el.value = val;
      };
      const setChk = (el, val) => {
        if (el && typeof val === 'boolean') el.checked = val;
      };

      setVal(dom.mcVoxelSize, c.mcVoxelSize);
      setVal(dom.mcHeightStep, c.mcHeightStep);
      setChk(dom.mcSolidBase, c.mcSolidBase);
      setVal(dom.mcMountType, c.mcMountType);
      setVal(dom.mcCustomLabel, c.mcCustomLabel);

      setVal(dom.ilWord1, c.ilWord1);
      setVal(dom.ilWord2, c.ilWord2);
      setVal(dom.ilVoxelSize, c.ilVoxelSize);
      setChk(dom.ilSafeSupports, c.ilSafeSupports);
      setVal(dom.ilLayoutMode, c.ilLayoutMode);
      setVal(dom.ilColorPrimary, c.ilColorPrimary);

      setVal(dom.phSubmode, c.phSubmode);
      setVal(dom.phExtrudeHeight, c.phExtrudeHeight);
      setVal(dom.phSpringThickness, c.phSpringThickness);
      setVal(dom.phWingWeight, c.phWingWeight);
      setVal(dom.phArmLength, c.phArmLength);
      setChk(dom.phIncludeAmmo, c.phIncludeAmmo);
      setVal(dom.phCustomText, c.phCustomText);

      if (dom.phSubmode) {
        const isBalancer = dom.phSubmode.value === 'balancer';
        if (dom.phSpringGroup) dom.phSpringGroup.style.display = isBalancer ? 'none' : 'block';
        if (dom.phWeightGroup) dom.phWeightGroup.style.display = isBalancer ? 'block' : 'none';
        if (dom.btnPhysicsDemo) {
          dom.btnPhysicsDemo.textContent = isBalancer
            ? '👆 Протестувати Магічний Баланс!'
            : '🚀 ВИСТРІЛИТИ З КАТАПУЛЬТИ!';
        }
      }

      setVal(dom.mobArchetype, c.mobArchetype);
      setVal(dom.mobHeadScale, c.mobHeadScale);
      setVal(dom.mobBodyBulk, c.mobBodyBulk);
      setVal(dom.mobEyeType, c.mobEyeType);
      setVal(dom.mobHeadgear, c.mobHeadgear);
      setVal(dom.mobBackgear, c.mobBackgear);
      setVal(dom.mobWeapon, c.mobWeapon);
      setVal(dom.mobName, c.mobName);
      setChk(dom.mobTinkercadBlank, c.mobTinkercadBlank);

      if (state.minecraft) {
        this.mcGen.setState(state.minecraft, false);
        document.querySelectorAll('[data-mc-preset]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-mc-preset') === this.mcGen.currentPresetKey);
        });
      }

      setVal(dom.verificationSelect, state.verificationStatus || 'generated');
      setVal(dom.slicerTimeInput, state.slicerNote || '');
      this.syncVerificationBadgeUI();

      if (state.monoColor && dom.monoColorPicker) {
        dom.monoColorPicker.value = state.monoColor;
        this.sceneManager.setMonochromeColor(parseInt(state.monoColor.replace('#', '0x'), 16));
      }
      if (typeof state.monochrome === 'boolean') {
        this.setMonochromeMode(state.monochrome);
      }

      this.updateValueLabels();
      const targetTab = state.activeTab || 'minecraft';
      this.switchTab(targetTab, true);
      this.rebuildCurrentModel(animatePop, true);
      this._isRestoring = false;
    }

    recordUndoSnapshot() {
      if (this._isRestoring) return;
      const snap = JSON.stringify(this.serializeState());
      if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === snap) {
        return;
      }
      this.undoStack.push(snap);
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift();
      }
      this.redoStack = [];
      this.updateHistoryButtons();
    }

    undo() {
      if (this.undoStack.length === 0) return;
      const currentSnap = JSON.stringify(this.serializeState());
      this.redoStack.push(currentSnap);
      const prevSnap = this.undoStack.pop();
      this.applyState(JSON.parse(prevSnap), false);
      this.updateHistoryButtons();
      this.autosave();
      if (window.StudioSound) window.StudioSound.playPop(360);
    }

    redo() {
      if (this.redoStack.length === 0) return;
      const currentSnap = JSON.stringify(this.serializeState());
      this.undoStack.push(currentSnap);
      const nextSnap = this.redoStack.pop();
      this.applyState(JSON.parse(nextSnap), false);
      this.updateHistoryButtons();
      this.autosave();
      if (window.StudioSound) window.StudioSound.playPop(520);
    }

    updateHistoryButtons() {
      const dom = this._domCache || {};
      const canUndo = this.undoStack.length > 0;
      const canRedo = this.redoStack.length > 0;
      if (dom.btnUndo) dom.btnUndo.disabled = !canUndo;
      if (dom.btnMcUndo) dom.btnMcUndo.disabled = !canUndo;
      if (dom.btnRedo) dom.btnRedo.disabled = !canRedo;
    }

    autosave() {
      if (this._isRestoring) return;
      try {
        const payload = JSON.stringify(this.serializeState());
        localStorage.setItem(STORAGE_KEY, payload);
        const dom = this._domCache || {};
        if (dom.autosaveTag) {
          const now = new Date();
          const hh = String(now.getHours()).padStart(2, '0');
          const mm = String(now.getMinutes()).padStart(2, '0');
          const ss = String(now.getSeconds()).padStart(2, '0');
          dom.autosaveTag.textContent = `💾 Автозбережено о ${hh}:${mm}:${ss}`;
        }
      } catch (_) {
        // Ігноруємо помилки квоти або приватного режиму браузера
      }
    }

    restoreAutosave() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.app !== '3d-club-studio') return false;
        this.applyState(parsed, false);
        const dom = this._domCache || {};
        if (dom.autosaveTag) {
          dom.autosaveTag.textContent = '💾 Відновлено попередню роботу';
        }
        return true;
      } catch (_) {
        return false;
      }
    }

    saveProjectToFile() {
      const state = this.serializeState();
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = this.getSuggestedFilename().replace(/\.stl$/i, '');
      a.download = `${baseName}_project.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (window.StudioSound) window.StudioSound.playExportSuccess();
    }

    loadProjectFromFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed || parsed.app !== '3d-club-studio') {
            alert('Цей файл не схожий на проєкт «3D Кузні Чудес» (.json).');
            return;
          }
          this.recordUndoSnapshot();
          this.applyState(parsed, true);
          this.autosave();
          if (window.StudioSound) window.StudioSound.playMagicGenerate();
        } catch (_) {
          alert('Не вдалося прочитати файл проєкту. Перевірте, що це правильний .json файл.');
        }
      };
      reader.readAsText(file);
    }

    // При будь-якій зміні геометрії скидаємо статус "Надруковано/Перевірено" на "Згенеровано"
    markModelModified() {
      if (this._isRestoring) return;
      const dom = this._domCache || {};
      if (dom.verificationSelect && dom.verificationSelect.value !== 'generated') {
        dom.verificationSelect.value = 'generated';
        this.syncVerificationBadgeUI();
      }
    }

    setMonochromeMode(enable) {
      const active = this.sceneManager.toggleMonochrome(enable);
      const dom = this._domCache || {};
      if (dom.btnToggleMono) {
        dom.btnToggleMono.classList.toggle('active', active);
        dom.btnToggleMono.textContent = active ? '🪨 1 Пластик: ВКЛ' : '🪨 1 Пластик';
      }
      if (dom.btnHudMono) {
        dom.btnHudMono.classList.toggle('active', active);
        dom.btnHudMono.textContent = active ? '🪨 1 Пластик: ВКЛ' : '🪨 Одним пластиком';
      }
      return active;
    }

    bindViewModeControls() {
      const viewBtns = document.querySelectorAll('[data-view-mode]');
      viewBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-view-mode') || 'split';
          this.setViewMode(mode);
        });
      });
    }

    setViewMode(mode) {
      this.viewMode = mode;
      const dom = this._domCache || {};
      if (dom.workspace) {
        dom.workspace.classList.remove('mode-editor', 'mode-split', 'mode-viewport');
        dom.workspace.classList.add(`mode-${mode}`);
      }
      document.querySelectorAll('[data-view-mode]').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-view-mode') === mode);
      });
      if (this.sceneManager) {
        requestAnimationFrame(() => this.sceneManager.onResize());
      }
    }

    bindVerificationControls() {
      const dom = this._domCache || {};
      if (dom.verificationSelect) {
        dom.verificationSelect.addEventListener('change', () => {
          this.syncVerificationBadgeUI();
          this.autosave();
        });
      }
      if (dom.slicerTimeInput) {
        dom.slicerTimeInput.addEventListener('input', () => {
          this.sceneManager.updateDimensionsUI(dom.slicerTimeInput.value.trim());
          this.autosave();
        });
      }
    }

    syncVerificationBadgeUI() {
      const dom = this._domCache || {};
      const badge = dom.verificationBadge;
      const sel = dom.verificationSelect;
      if (!badge || !sel) return;
      badge.classList.remove('status-generated', 'status-sliced', 'status-printed');
      badge.classList.add(`status-${sel.value || 'generated'}`);
    }

    updateDiagnosticsUI() {
      const dom = this._domCache || {};
      const d = this.sceneManager?.dimensions;
      if (!d) return;

      const note = dom.slicerTimeInput?.value?.trim() || '';
      this.sceneManager.updateDimensionsUI(note);

      const pill = dom.geomCheckPill;
      if (!pill) return;

      // Перевірка габаритів столу та зв'язності
      const conn = this.mcGen?.lastConnectivity;
      if (!d.fitsBed) {
        pill.textContent = `🚨 Габарит ${d.x}×${d.y} мм виходить за межі столу 200×200 мм!`;
        pill.className = 'geom-check-pill danger';
      } else if (!d.safeBed) {
        pill.textContent = `⚠️ ${d.x}×${d.y} мм — майже впритул до краю столу (>190 мм)`;
        pill.className = 'geom-check-pill warn';
      } else if (this.activeTab === 'minecraft' && conn && conn.activeCount > 0 && conn.finalIslands > 1) {
        pill.textContent = `⚠️ Деталь розірвана на ${conn.finalIslands} частини!`;
        pill.className = 'geom-check-pill danger';
      } else if (d.isMini) {
        pill.textContent = '🌟 Міні-виріб (<=38 мм) • Плоске дно Z=0';
        pill.className = 'geom-check-pill';
      } else {
        pill.textContent = '📐 У межах столу • Плоске дно Z=0';
        pill.className = 'geom-check-pill';
      }
    }

    updateMinecraftConnectivityUI() {
      const dom = this._domCache || {};
      const pill = dom.mcConnectivityStatus;
      if (!pill || !this.mcGen) return;

      const c = this.mcGen.lastConnectivity;
      if (!c || c.activeCount === 0) {
        pill.textContent = '✏️ Полотно порожнє: намалюй власний знак або обери шаблон.';
        pill.className = 'connectivity-pill warn';
      } else if (c.finalIslands === 1 && c.bridgedCount > 0) {
        pill.textContent = `🔗 Суцільна підкладка автоматично з'єднала ${c.rawIslands} острови в 1 деталь!`;
        pill.className = 'connectivity-pill bridged';
      } else if (c.finalIslands === 1 && c.hasDiagonalOnly && !dom.mcSolidBase?.checked) {
        pill.textContent = '⚠️ Є тонкі кутики по діагоналі: увімкніть «Суцільна підкладка» для міцності!';
        pill.className = 'connectivity-pill warn';
      } else if (c.finalIslands === 1) {
        pill.textContent = '✅ 1 суцільна деталь: усі частини значка надійно з\'єднані.';
        pill.className = 'connectivity-pill';
      } else {
        pill.textContent = `🚨 Розірвано на ${c.finalIslands} окремих частин! Увімкніть «Суцільна підкладка» або домалюйте з'єднання.`;
        pill.className = 'connectivity-pill danger';
      }
    }

    bindTabs() {
      const tabBtns = document.querySelectorAll('.gen-tab-btn');
      tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-tab');
          this.recordUndoSnapshot();
          this.switchTab(tab);
          this.autosave();
        });
      });
    }

    switchTab(tabName, skipRebuild = false) {
      this.activeTab = tabName;
      if (!skipRebuild && window.StudioSound) window.StudioSound.playTabSwitch(tabName);

      document.querySelectorAll('.gen-tab-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
      });

      document.querySelectorAll('.panel-section').forEach((sec) => {
        sec.classList.toggle('active', sec.id === `panel-${tabName}`);
      });

      // Оновлюємо контекстні кнопки внизу 3D-сцени
      const illusionCameraBar = this._domCache?.illusionCameraBar || document.getElementById('illusion-camera-bar');
      const physicsActionBar = this._domCache?.physicsActionBar || document.getElementById('physics-action-bar');
      if (illusionCameraBar) illusionCameraBar.style.display = tabName === 'illusion' ? 'flex' : 'none';
      if (physicsActionBar) physicsActionBar.style.display = tabName === 'physics' ? 'flex' : 'none';

      // Підбираємо найкращий стартовий ракурс камери
      if (tabName === 'illusion') {
        this.sceneManager.setCameraView('front');
      } else {
        this.sceneManager.setCameraView('iso');
      }

      if (!skipRebuild) {
        this.rebuildCurrentModel(true, true);
      }
    }

    // Універсальний звуковий відгук для повзунків, полів вводу, чекбоксів та селектів
    _playControlFeedback(el) {
      if (!window.StudioSound || !el) return;
      if (el.type === 'range') {
        const min = parseFloat(el.min) || 0;
        const max = parseFloat(el.max) || 100;
        const val = parseFloat(el.value) || 0;
        const ratio = max > min ? (val - min) / (max - min) : 0.5;
        window.StudioSound.playSliderTick(ratio);
      } else if (el.type === 'text') {
        const lastCh = (el.value || '').slice(-1) || 'A';
        window.StudioSound.playKeyType(lastCh);
      } else if (el.type === 'checkbox') {
        window.StudioSound.playPop(el.checked ? 580 : 340);
      } else if (el.tagName === 'SELECT') {
        const themedIds = ['mob-archetype', 'mob-weapon', 'mob-headgear', 'mob-backgear', 'mob-eye-type'];
        if (themedIds.includes(el.id) && el.value && el.value !== 'none') {
          window.StudioSound.playThemeSound(el.value);
        } else {
          window.StudioSound.playPop(480);
        }
      } else if (el.type === 'color') {
        window.StudioSound.playSliderTick(Math.random());
      }
    }

    bindTopActions() {
      // Пасхалка при кліку на логотип ковадла ⚒️
      const brandLogo = document.querySelector('.brand-logo');
      if (brandLogo) {
        brandLogo.addEventListener('click', () => {
          if (window.StudioSound) window.StudioSound.playAnvilEasterEgg();
        });
      }

      // Кнопки Скасувати / Повернути (Undo / Redo)
      const dom = this._domCache || {};
      if (dom.btnUndo) dom.btnUndo.addEventListener('click', () => this.undo());
      if (dom.btnMcUndo) dom.btnMcUndo.addEventListener('click', () => this.undo());
      if (dom.btnRedo) dom.btnRedo.addEventListener('click', () => this.redo());

      // Гарячі клавіші Ctrl+Z / Ctrl+Y
      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) this.redo();
          else this.undo();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          this.redo();
        }
      });

      // Перемикач одноколірного прев'ю ("Як виглядатиме одним пластиком")
      const toggleMonoHandler = () => {
        const isMono = this.setMonochromeMode();
        if (window.StudioSound) window.StudioSound.playPop(isMono ? 440 : 560);
        this.autosave();
      };
      if (dom.btnToggleMono) dom.btnToggleMono.addEventListener('click', toggleMonoHandler);
      if (dom.btnHudMono) dom.btnHudMono.addEventListener('click', toggleMonoHandler);
      if (dom.monoColorPicker) {
        dom.monoColorPicker.addEventListener('input', () => {
          const hex = parseInt(dom.monoColorPicker.value.replace('#', '0x'), 16);
          this.sceneManager.setMonochromeColor(hex);
          if (!this.sceneManager.isMonochrome) {
            this.setMonochromeMode(true);
          }
          this.autosave();
        });
      }

      // Збереження та відкриття редагованого проєкту (.json)
      const btnSaveProj = document.getElementById('btn-save-project');
      const btnLoadProj = document.getElementById('btn-load-project');
      const inpLoadProj = document.getElementById('input-load-project');
      if (btnSaveProj) {
        btnSaveProj.addEventListener('click', () => this.saveProjectToFile());
      }
      if (btnLoadProj && inpLoadProj) {
        btnLoadProj.addEventListener('click', () => inpLoadProj.click());
        inpLoadProj.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            this.loadProjectFromFile(file);
            inpLoadProj.value = '';
          }
        });
      }

      const btnSound = document.getElementById('btn-toggle-sound');
      const btnMusic = document.getElementById('btn-toggle-music');

      // Кнопка звуку
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          const on = window.StudioSound.toggle();
          btnSound.textContent = on ? '🔊 Звук' : '🔇 Тихо';
          btnSound.classList.toggle('muted', !on);
          if (!on && btnMusic) {
            btnMusic.textContent = '🎵 Музика';
            btnMusic.classList.remove('playing');
          }
        });
      }

      // Кнопка веселої 8-бітної фонової музики кузні
      if (btnMusic) {
        btnMusic.addEventListener('click', () => {
          const playing = window.StudioSound.toggleMusic();
          btnMusic.textContent = playing ? '🎵 Грає' : '🎵 Музика';
          btnMusic.classList.toggle('playing', playing);
          if (playing && btnSound) {
            btnSound.textContent = '🔊 Звук';
            btnSound.classList.remove('muted');
          }
        });
      }

      // Кнопка Симуляції 3D-Принтера
      const btnSim = document.getElementById('btn-simulate-print');
      if (btnSim) {
        btnSim.addEventListener('click', () => {
          const started = this.sceneManager.startSlicerSimulation();
          if (window.StudioSound) window.StudioSound.playPop(started ? 580 : 320);
          btnSim.textContent = started
            ? '⏹️ Стоп'
            : '🔥 Симуляція';
        });
      }

      // Кнопка "Випадковий ВАУ! / Мутація"
      const btnRandom = document.getElementById('btn-random-wow');
      if (btnRandom) {
        btnRandom.addEventListener('click', () => {
          this.recordUndoSnapshot();
          this.randomizeCurrentTab();
          this.markModelModified();
          this.autosave();
        });
      }

      // Кнопка Скачування .STL
      const btnExport = document.getElementById('btn-export-stl');
      if (btnExport) {
        btnExport.addEventListener('click', () => {
          const fname = this.getSuggestedFilename();
          this.sceneManager.exportBinarySTL(fname);
        });
      }

      // Кнопки швидкого повороту камери
      document.querySelectorAll('[data-cam-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const v = btn.getAttribute('data-cam-view');
          this.sceneManager.setCameraView(v);
        });
      });
    }

    getSuggestedFilename() {
      const dom = this._domCache || {};
      if (this.activeTab === 'minecraft') {
        const lbl = (dom.mcCustomLabel?.value || '').trim();
        return `minecraft_${this.mcGen.currentPresetKey}${lbl ? '_' + lbl : ''}.stl`;
      }
      if (this.activeTab === 'illusion') {
        const w1 = (dom.ilWord1?.value || 'WORD1').trim();
        const w2 = (dom.ilWord2?.value || 'WORD2').trim();
        return `illusion_${w1}_${w2}.stl`;
      }
      if (this.activeTab === 'physics') {
        const sub = dom.phSubmode?.value || 'catapult';
        return `physics_${sub}.stl`;
      }
      if (this.activeTab === 'mob') {
        const arch = dom.mobArchetype?.value || 'boss';
        const name = (dom.mobName?.value || '').trim();
        return `mob_${arch}${name ? '_' + name : ''}.stl`;
      }
      return '3d_kuznya_model.stl';
    }

    // -------------------------------------------------------------------------
    // 1. КОНТРОЛЕРИ МАЙНКРАФТ-КУЗНІ
    // -------------------------------------------------------------------------
    bindMinecraftControls() {
      // Пресети з фірмовими тематичними звуками
      document.querySelectorAll('[data-mc-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-mc-preset]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const key = btn.getAttribute('data-mc-preset');
          if (window.StudioSound) window.StudioSound.playThemeSound(key);
          this.mcGen.loadPreset(key, false, true);
          this.rebuildCurrentModel(true, true);
        });
      });

      // Швидкий пресет "Міні-значок (~35 мм)"
      const btnMini = document.getElementById('btn-mc-mini-preset');
      if (btnMini) {
        btnMini.addEventListener('click', () => {
          this.recordUndoSnapshot();
          const dom = this._domCache || {};
          if (dom.mcVoxelSize) dom.mcVoxelSize.value = '2.2';
          if (dom.mcHeightStep) dom.mcHeightStep.value = '1.2';
          if (dom.mcSolidBase) dom.mcSolidBase.checked = true;
          this.updateValueLabels();
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      }

      // Вибір пензля (рівня висоти 1..4 або Гумки 0)
      document.querySelectorAll('[data-mc-brush]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-mc-brush]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.mcGen.activeBrush = parseInt(btn.getAttribute('data-mc-brush'), 10);
          if (window.StudioSound) {
            if (this.mcGen.activeBrush === 0) {
              window.StudioSound.playErase();
            } else {
              window.StudioSound.playPop(350 + this.mcGen.activeBrush * 75);
            }
          }
        });
      });

      const btnClear = document.getElementById('btn-mc-clear');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          this.mcGen.clearGrid();
        });
      }

      const ids = ['mc-voxel-size', 'mc-height-step', 'mc-solid-base', 'mc-mount-type', 'mc-custom-label'];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('focus', () => this.recordUndoSnapshot());
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          });
        }
      });
    }

    // -------------------------------------------------------------------------
    // 2. КОНТРОЛЕРИ ПОДВІЙНОЇ ОПТИЧНОЇ ІЛЮЗІЇ
    // -------------------------------------------------------------------------
    bindIllusionControls() {
      // Швидка кнопка короткого знака (1-2 літери)
      const btnShort = document.getElementById('btn-il-short-mode');
      if (btnShort) {
        btnShort.addEventListener('click', () => {
          this.recordUndoSnapshot();
          const dom = this._domCache || {};
          if (dom.ilWord1) dom.ilWord1.value = '3D';
          if (dom.ilWord2) dom.ilWord2.value = '★!';
          if (dom.ilVoxelSize) dom.ilVoxelSize.value = '2.4';
          this.updateValueLabels();
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      }

      // Пресети слів
      document.querySelectorAll('[data-il-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.recordUndoSnapshot();
          const w1 = btn.getAttribute('data-w1');
          const w2 = btn.getAttribute('data-w2');
          document.getElementById('il-word1').value = w1;
          document.getElementById('il-word2').value = w2;
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      });

      // Кнопки швидкої вставки спецсимволів Minecraft у активне поле
      let lastFocusedInput = document.getElementById('il-word2');
      ['il-word1', 'il-word2'].forEach((id) => {
        const inp = document.getElementById(id);
        if (inp) {
          inp.addEventListener('focus', () => {
            lastFocusedInput = inp;
            this.recordUndoSnapshot();
          });
          inp.addEventListener('input', () => {
            this._playControlFeedback(inp);
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          });
        }
      });

      const symThemeMap = {
        '⚔': 'sword',
        '⛏': 'pickaxe',
        '💀': 'creeper',
        '👑': 'crown',
        '♥': 'heart',
        '★': 'totem'
      };

      document.querySelectorAll('[data-insert-sym]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sym = btn.getAttribute('data-insert-sym');
          if (lastFocusedInput && lastFocusedInput.value.length < 9) {
            this.recordUndoSnapshot();
            lastFocusedInput.value += sym;
            if (window.StudioSound) {
              window.StudioSound.playThemeSound(symThemeMap[sym] || 'totem');
            }
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          }
        });
      });

      ['il-voxel-size', 'il-safe-supports', 'il-layout-mode', 'il-color-primary'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          });
        }
      });
    }

    // -------------------------------------------------------------------------
    // 3. КОНТРОЛЕРИ ФІЗИКИ БЕЗ ШЕСТЕРЕНЬ (КАТАПУЛЬТА ТА БАЛАНСИР)
    // -------------------------------------------------------------------------
    bindPhysicsControls() {
      const subSelect = document.getElementById('ph-submode');
      if (subSelect) {
        subSelect.addEventListener('change', () => {
          this.recordUndoSnapshot();
          const isBalancer = subSelect.value === 'balancer';
          document.getElementById('ph-spring-group').style.display = isBalancer ? 'none' : 'block';
          document.getElementById('ph-weight-group').style.display = isBalancer ? 'block' : 'none';
          const heightInput = this._domCache?.phExtrudeHeight || document.getElementById('ph-extrude-height');
          if (heightInput) {
            heightInput.value = isBalancer ? '6.0' : '10.0';
          }
          this.updateValueLabels();
          const fireBtn = document.getElementById('btn-physics-demo');
          if (fireBtn) {
            fireBtn.textContent = isBalancer
              ? '👆 Протестувати Магічний Баланс!'
              : '🚀 ВИСТРІЛИТИ З КАТАПУЛЬТИ!';
          }
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      }

      ['ph-extrude-height', 'ph-spring-thickness', 'ph-wing-weight', 'ph-arm-length', 'ph-include-ammo', 'ph-custom-text'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          });
        }
      });

      const demoBtn = document.getElementById('btn-physics-demo');
      if (demoBtn) {
        demoBtn.addEventListener('click', () => {
          const sub = (this._domCache?.phSubmode || document.getElementById('ph-submode'))?.value || 'catapult';
          this.physicsGen.triggerInteractiveDemo(this.sceneManager, sub);
        });
      }
    }

    // -------------------------------------------------------------------------
    // 4. КОНТРОЛЕРИ МУТАТОРА МОБІВ ТА БОСІВ
    // -------------------------------------------------------------------------
    bindMobControls() {
      const ids = [
        'mob-archetype', 'mob-head-scale', 'mob-body-bulk',
        'mob-eye-type', 'mob-headgear', 'mob-backgear',
        'mob-weapon', 'mob-name', 'mob-tinkercad-blank'
      ];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            const isArch = id === 'mob-archetype';
            this.markModelModified();
            this.rebuildCurrentModel(isArch, true);
            this.autosave();
          });
        }
      });
    }

    updateValueLabels() {
      const dom = this._domCache || {};
      const pairs = [
        [dom.mcVoxelSize, dom.valMcVoxel, ' мм'],
        [dom.mcHeightStep, dom.valMcStep, ' мм'],
        [dom.ilVoxelSize, dom.valIlVoxel, ' мм'],
        [dom.phExtrudeHeight, dom.valPhHeight, ' мм'],
        [dom.phSpringThickness, dom.valPhSpring, ' мм'],
        [dom.phWingWeight, dom.valPhWeight, ' мм'],
        [dom.phArmLength, dom.valPhArm, ' мм'],
        [dom.mobHeadScale, dom.valMobHead, 'x'],
        [dom.mobBodyBulk, dom.valMobBulk, 'x']
      ];
      for (const [inp, lbl, suffix] of pairs) {
        if (inp && lbl) {
          lbl.textContent = inp.value + suffix;
        }
      }
    }

    // Випадкова генерація ("ВАУ-Мутація") залежно від відкритої вкладки
    randomizeCurrentTab() {
      if (window.StudioSound) window.StudioSound.playRandomJackpot();
      const dom = this._domCache || {};

      if (this.activeTab === 'minecraft') {
        this.mcGen.randomizeArtifact();
        return;
      }

      if (this.activeTab === 'illusion') {
        const pairs = [
          ['3D', '★!'],
          ['МАЙН!', 'КРАФТ'],
          ['ГЕРОЙ', '★PRO★'],
          ['ЛІДЕР', '👑100👑'],
          ['ДРАКОН', '⚔БОС!⚔'],
          ['АЛМАЗ', '⛏★⚔★⛏']
        ];
        const pick = pairs[Math.floor(Math.random() * pairs.length)];
        if (dom.ilWord1) dom.ilWord1.value = pick[0];
        if (dom.ilWord2) dom.ilWord2.value = pick[1];
        this.rebuildCurrentModel(true, true);
        return;
      }

      if (this.activeTab === 'physics') {
        const sub = dom.phSubmode;
        if (sub) {
          sub.value = sub.value === 'catapult' ? 'balancer' : 'catapult';
          sub.dispatchEvent(new Event('change'));
        }
        return;
      }

      if (this.activeTab === 'mob') {
        const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        if (dom.mobArchetype) dom.mobArchetype.value = randPick(['creeper', 'golem', 'knight', 'dragon', 'cyborg']);
        if (dom.mobEyeType) dom.mobEyeType.value = randPick(['one', 'two', 'three', 'visor', 'creeper']);
        if (dom.mobHeadgear) dom.mobHeadgear.value = randPick(['none', 'horns', 'crown', 'ears', 'antenna']);
        if (dom.mobBackgear) dom.mobBackgear.value = randPick(['none', 'wings', 'jetpack', 'cape']);
        if (dom.mobWeapon) dom.mobWeapon.value = randPick(['sword', 'hammer', 'shield', 'dual_axes']);
        if (dom.mobHeadScale) dom.mobHeadScale.value = (0.85 + Math.random() * 0.55).toFixed(2);
        if (dom.mobBodyBulk) dom.mobBodyBulk.value = (0.85 + Math.random() * 0.45).toFixed(2);
        this.updateValueLabels();
        this.rebuildCurrentModel(true, true);
      }
    }

    // Головна функція побудови поточної 3D-моделі
    rebuildCurrentModel(animatePop = false, skipSound = false) {
      if (animatePop && !skipSound && window.StudioSound) {
        window.StudioSound.playMagicGenerate();
      }

      const dom = this._domCache || {};
      let group = null;

      if (this.activeTab === 'minecraft') {
        group = this.mcGen.build3D({
          voxelSize: dom.mcVoxelSize?.value,
          heightStep: dom.mcHeightStep?.value,
          solidBase: dom.mcSolidBase?.checked,
          mountType: dom.mcMountType?.value,
          customLabel: dom.mcCustomLabel?.value
        });
        this.updateMinecraftConnectivityUI();
      } else if (this.activeTab === 'illusion') {
        const colorHex = dom.ilColorPrimary?.value || '#10b981';
        group = this.illusionGen.build3D({
          word1: dom.ilWord1?.value,
          word2: dom.ilWord2?.value,
          voxelSize: dom.ilVoxelSize?.value,
          safeSupports: dom.ilSafeSupports?.checked,
          layoutMode: dom.ilLayoutMode?.value,
          colorPrimary: parseInt(colorHex.replace('#', '0x'), 16)
        });
      } else if (this.activeTab === 'physics') {
        group = this.physicsGen.build3D({
          submode: dom.phSubmode?.value,
          extrudeHeight: dom.phExtrudeHeight?.value,
          springThickness: dom.phSpringThickness?.value,
          wingWeight: dom.phWingWeight?.value,
          armLength: dom.phArmLength?.value,
          includeAmmo: dom.phIncludeAmmo?.checked,
          customText: dom.phCustomText?.value
        });
      } else if (this.activeTab === 'mob') {
        group = this.mobGen.build3D({
          archetype: dom.mobArchetype?.value,
          headScale: dom.mobHeadScale?.value,
          bodyBulk: dom.mobBodyBulk?.value,
          eyeType: dom.mobEyeType?.value,
          headgear: dom.mobHeadgear?.value,
          backGear: dom.mobBackgear?.value,
          weapon: dom.mobWeapon?.value,
          mobName: dom.mobName?.value,
          tinkercadBlank: dom.mobTinkercadBlank?.checked
        });
      }

      if (group) {
        this.sceneManager.setModel(group, animatePop);
      }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.StudioApp = new StudioApp();
    window.StudioApp.init();
  });
})();
