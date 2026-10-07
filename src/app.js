// Головний контролер студії «3D Кузня Чудес» (Чистий Vanilla JS + Three.js r128, 100% офлайн)
(function () {
  const STORAGE_KEY = '3d_kuznya_project_autosave_v1';

  class StudioApp {
    constructor() {
      this.activeTab = 'minecraft'; // 'minecraft', 'illusion', 'physics', 'mob'
      this.viewMode = 'split';      // 'editor', 'split', 'viewport'
      this.sceneManager = null;
      this._isRestoring = false;

      // Підсистеми
      this.safeStorage = window.SafeStorage;
      this.history = new window.HistoryManager({
        maxHistory: 35,
        onStateChange: (canUndo, canRedo) => this.updateHistoryButtons(canUndo, canRedo)
      });
      this.missions = new window.MissionManager({
        initialMissionId: 1,
        onMissionChange: (m) => this.onMissionSelected(m),
        onChecklistChange: () => this.autosave()
      });
      this.compare = new window.SnapshotCompareController();
      this.passport = new window.PassportPrintController();

      // Генератори
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

      this._domCache = null;
    }

    init() {
      this.sceneManager = new window.SceneManager('viewport-container');
      this.sceneManager.init();
      this.sceneManager.onDimensionsUpdated = () => {
        this.updateDiagnosticsUI();
      };

      // Кеш DOM-елементів (єдина точка правди)
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

        // Модалка місій
        missionsModal: document.getElementById('missions-modal'),
        missionsGrid: document.getElementById('missions-grid-container'),
        activeMissionCard: document.getElementById('active-mission-card'),
        btnCloseActiveMission: document.getElementById('btn-close-active-mission'),
        btnToggleMissionBody: document.getElementById('btn-toggle-mission-body'),
        activeMissionBadge: document.getElementById('active-mission-badge'),
        activeMissionTitle: document.getElementById('active-mission-title'),
        activeMissionMeta: document.getElementById('active-mission-meta'),
        activeMissionBody: document.getElementById('active-mission-body'),
        activeMissionRiddle: document.getElementById('active-mission-riddle'),
        activeMissionG23: document.getElementById('active-mission-g23'),
        activeMissionG46: document.getElementById('active-mission-g46'),
        activeMissionSteps: document.getElementById('active-mission-steps'),
        chkMissionConnected: document.getElementById('chk-mission-connected'),
        chkMissionMono: document.getElementById('chk-mission-mono'),
        chkMissionSize: document.getElementById('chk-mission-size'),
        btnToggleOrtho: document.getElementById('btn-toggle-ortho'),

        // Контроли Майнкрафт
        mcVoxelSize: document.getElementById('mc-voxel-size'),
        mcHeightStep: document.getElementById('mc-height-step'),
        mcSolidBase: document.getElementById('mc-solid-base'),
        mcMountType: document.getElementById('mc-mount-type'),
        mcSlotWidth: document.getElementById('mc-slot-width'),
        mcSlotWidthGroup: document.getElementById('mc-slot-width-group'),
        valMcSlot: document.getElementById('val-mc-slot'),
        mcCustomLabel: document.getElementById('mc-custom-label'),
        valMcVoxel: document.getElementById('val-mc-voxel'),
        valMcStep: document.getElementById('val-mc-step'),

        // Контроли Ілюзії
        ilWord1: document.getElementById('il-word1'),
        ilWord2: document.getElementById('il-word2'),
        ilVoxelSize: document.getElementById('il-voxel-size'),
        ilSafeSupports: document.getElementById('il-safe-supports'),
        ilLayoutMode: document.getElementById('il-layout-mode'),
        ilColorPrimary: document.getElementById('il-color-primary'),
        valIlVoxel: document.getElementById('val-il-voxel'),

        // Контроли Фізики
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

        // Контроли Мобів
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
        valMobBulk: document.getElementById('val-mob-bulk'),

        // V1 та Порівняння V1 ↔ V2
        btnSnapshotV1: document.getElementById('btn-snapshot-v1'),
        btnCompareV1V2: document.getElementById('btn-compare-v1v2'),
        btnPrintCard: document.getElementById('btn-print-card'),
        compareModal: document.getElementById('compare-modal'),
        btnCloseCompare: document.getElementById('btn-close-compare'),
        btnCloseCompareFooter: document.getElementById('btn-close-compare-footer'),
        btnReSnapshotV1: document.getElementById('btn-re-snapshot-v1'),
        btnCompareToPassport: document.getElementById('btn-compare-to-passport'),
        compareSummaryBanner: document.getElementById('compare-summary-banner'),
        v1PreviewImg: document.getElementById('v1-preview-img'),
        v2PreviewImg: document.getElementById('v2-preview-img'),
        v1Timestamp: document.getElementById('v1-timestamp'),
        v2Timestamp: document.getElementById('v2-timestamp'),
        v1Metrics: document.getElementById('v1-metrics'),
        v2Metrics: document.getElementById('v2-metrics'),

        // Паспорт деталі для друку
        printCardModal: document.getElementById('print-card-modal'),
        btnClosePrintCard: document.getElementById('btn-close-print-card'),
        btnActionPrint: document.getElementById('btn-action-print'),
        btnActionDownloadPng: document.getElementById('btn-action-download-png'),
        btnActionCopyText: document.getElementById('btn-action-copy-text'),
        cardPairInput: document.getElementById('card-pair-input'),
        pCardPair: document.getElementById('p-card-pair'),
        pCardDate: document.getElementById('p-card-date'),
        pCardImg: document.getElementById('p-card-img'),
        pCardFilename: document.getElementById('p-card-filename'),
        pCardMission: document.getElementById('p-card-mission'),
        pVerV1: document.getElementById('p-ver-v1'),
        pVerV2: document.getElementById('p-ver-v2'),
        pCardDims: document.getElementById('p-card-dims'),
        pCardConn: document.getElementById('p-card-conn'),
        pCardBase: document.getElementById('p-card-base'),
        pCardCustomParam: document.getElementById('p-card-custom-param'),
        pCardMono: document.getElementById('p-card-mono'),
        pCardChecklist: document.getElementById('p-card-checklist')
      };

      if (window.StudioAdventurePack && window.AdventureShelf) {
        this.adventureShelf = new window.AdventureShelf({
          pack: window.StudioAdventurePack,
          onSelectMission: (id) => this.startMission(id)
        });
        this.adventureShelf.mount(document.getElementById('adventure-shelf'));
      }

      if (window.PixelEditorTools) {
        this.pixelTools = new window.PixelEditorTools({
          generator: this.mcGen,
          onBeforeChange: () => this.recordUndoSnapshot(),
          onAfterChange: () => {
            this.markModelModified();
            this.rebuildCurrentModel(false, true);
            this.updateMinecraftConnectivityUI();
            this.autosave();
          }
        });
        this.pixelTools.mount(document.getElementById('pixel-editor-tools'));
      }

      this.bindTabs();
      this.bindTopActions();
      this.bindMissionControls();
      this.bindViewModeControls();
      this.bindVerificationControls();
      this.bindMinecraftControls();
      this.bindIllusionControls();
      this.bindPhysicsControls();
      this.bindMobControls();
      this.bindCameraControls();

      // Відновлюємо автозбереження або рендеримо стартову модель
      const restored = this.restoreAutosave();
      if (this.adventureShelf) this.adventureShelf.selectMission(this.missions.activeMissionId);
      this.missions.updateActiveMissionUI(this._domCache);
      this.missions.renderMissionsModal(this._domCache, (id) => this.startMission(id));
      if (!restored) {
        this.mcGen.renderCanvasUI();
        this.rebuildCurrentModel(true);
      }
      this.history.updateUI(this._domCache.btnUndo, this._domCache.btnRedo, this._domCache.btnMcUndo);
    }

    // -------------------------------------------------------------------------
    // СЕРІАЛІЗАЦІЯ СТАНУ ТА СТІЙКІСТЬ ДО ПОМИЛОК
    // -------------------------------------------------------------------------
    serializeState() {
      const dom = this._domCache || {};
      const savedPair = this.safeStorage.getItem('3d_kuznya_pair_code') || '';
      return {
        app: '3d-club-studio',
        version: '1.7.0',
        savedAt: new Date().toISOString(),
        activeTab: this.activeTab,
        activeMissionId: this.missions.activeMissionId,
        activeMissionVisible: this.missions ? this.missions.cardVisible : true,
        activeMissionCollapsed: this.missions ? this.missions.bodyCollapsed : false,
        isOrthographic: this.sceneManager ? this.sceneManager.isOrthographic : false,
        v1Snapshot: this.compare.getV1(),
        studentPairCode: dom.cardPairInput?.value || savedPair,
        missionChecks: Object.assign({}, this.missions.missionChecks),
        monochrome: this.sceneManager ? this.sceneManager.isMonochrome : false,
        monoColor: dom.monoColorPicker?.value || '#cfd6df',
        verificationStatus: dom.verificationSelect?.value || 'generated',
        slicerNote: dom.slicerTimeInput?.value || '',
        minecraft: this.mcGen.getState(),
        controls: {
          mcVoxelSize: dom.mcVoxelSize?.value || '2.0',
          mcHeightStep: dom.mcHeightStep?.value || '1.2',
          mcSolidBase: !!dom.mcSolidBase?.checked,
          mcMountType: dom.mcMountType?.value || 'keychain',
          mcSlotWidth: dom.mcSlotWidth?.value || '2.0',
          mcCustomLabel: dom.mcCustomLabel?.value || '',
          ilWord1: dom.ilWord1?.value || '3D',
          ilWord2: dom.ilWord2?.value || '★!',
          ilVoxelSize: dom.ilVoxelSize?.value || '2.2',
          ilSafeSupports: dom.ilSafeSupports ? !!dom.ilSafeSupports.checked : true,
          ilLayoutMode: dom.ilLayoutMode?.value || 'diagonal',
          ilColorPrimary: dom.ilColorPrimary?.value || '#10b981',
          phSubmode: dom.phSubmode?.value || 'catapult',
          phExtrudeHeight: dom.phExtrudeHeight?.value || '10.0',
          phSpringThickness: dom.phSpringThickness?.value || '2.0',
          phWingWeight: dom.phWingWeight?.value || '3.5',
          phArmLength: dom.phArmLength?.value || '50',
          phIncludeAmmo: dom.phIncludeAmmo ? !!dom.phIncludeAmmo.checked : true,
          phCustomText: dom.phCustomText?.value || '',
          mobArchetype: dom.mobArchetype?.value || 'creeper',
          mobHeadScale: dom.mobHeadScale?.value || '1.0',
          mobBodyBulk: dom.mobBodyBulk?.value || '1.0',
          mobEyeType: dom.mobEyeType?.value || 'two',
          mobHeadgear: dom.mobHeadgear?.value || 'none',
          mobBackgear: dom.mobBackgear?.value || 'none',
          mobWeapon: dom.mobWeapon?.value || 'sword',
          mobName: dom.mobName?.value || '',
          mobTinkercadBlank: !!dom.mobTinkercadBlank?.checked
        }
      };
    }

    applyState(state, animatePop = false) {
      if (!state || typeof state !== 'object') return;
      this._isRestoring = true;
      const dom = this._domCache || {};
      const c = state.controls || {};

      if (state.activeMissionId) {
        this.missions.activeMissionId = parseInt(state.activeMissionId, 10) || 1;
      }
      if (typeof state.activeMissionVisible === 'boolean') {
        this.missions.setCardVisibility(state.activeMissionVisible);
      }
      if (typeof state.activeMissionCollapsed === 'boolean') {
        this.missions.setBodyCollapse(state.activeMissionCollapsed);
      }
      if (typeof state.isOrthographic === 'boolean' && this.sceneManager) {
        this.sceneManager.setProjectionMode(state.isOrthographic);
        this.updateOrthoButtonUI(state.isOrthographic);
      }
      if (state.v1Snapshot) {
        this.compare.setV1(state.v1Snapshot);
        if (dom.btnCompareV1V2) dom.btnCompareV1V2.style.display = 'inline-block';
        if (dom.btnSnapshotV1) dom.btnSnapshotV1.textContent = '📸 V1 збережено ✅';
      }
      if (state.studentPairCode) {
        this.safeStorage.setItem('3d_kuznya_pair_code', state.studentPairCode);
        if (dom.cardPairInput) dom.cardPairInput.value = state.studentPairCode;
      }
      if (state.missionChecks && typeof state.missionChecks === 'object') {
        this.missions.applyState({ missionChecks: state.missionChecks });
      }
      this.missions.updateActiveMissionUI(this._domCache);

      const setVal = (el, val, defaultVal = '') => {
        if (el) el.value = val !== undefined && val !== null ? val : defaultVal;
      };
      const setChk = (el, val, defaultVal = false) => {
        if (el) el.checked = typeof val === 'boolean' ? val : defaultVal;
      };

      setVal(dom.mcVoxelSize, c.mcVoxelSize, '2.0');
      setVal(dom.mcHeightStep, c.mcHeightStep, '1.2');
      setChk(dom.mcSolidBase, c.mcSolidBase, true);
      setVal(dom.mcMountType, c.mcMountType, 'keychain');
      setVal(dom.mcSlotWidth, c.mcSlotWidth, '2.0');
      setVal(dom.mcCustomLabel, c.mcCustomLabel, '');

      setVal(dom.ilWord1, c.ilWord1, '3D');
      setVal(dom.ilWord2, c.ilWord2, '★!');
      setVal(dom.ilVoxelSize, c.ilVoxelSize, '2.2');
      setChk(dom.ilSafeSupports, c.ilSafeSupports, true);
      setVal(dom.ilLayoutMode, c.ilLayoutMode, 'diagonal');
      setVal(dom.ilColorPrimary, c.ilColorPrimary, '#10b981');

      setVal(dom.phSubmode, c.phSubmode, 'catapult');
      setVal(dom.phExtrudeHeight, c.phExtrudeHeight, '10.0');
      setVal(dom.phSpringThickness, c.phSpringThickness, '2.0');
      setVal(dom.phWingWeight, c.phWingWeight, '3.5');
      setVal(dom.phArmLength, c.phArmLength, '50');
      setChk(dom.phIncludeAmmo, c.phIncludeAmmo, true);
      setVal(dom.phCustomText, c.phCustomText, '');

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

      setVal(dom.mobArchetype, c.mobArchetype, 'creeper');
      setVal(dom.mobHeadScale, c.mobHeadScale, '1.0');
      setVal(dom.mobBodyBulk, c.mobBodyBulk, '1.0');
      setVal(dom.mobEyeType, c.mobEyeType, 'two');
      setVal(dom.mobHeadgear, c.mobHeadgear, 'none');
      setVal(dom.mobBackgear, c.mobBackgear, 'none');
      setVal(dom.mobWeapon, c.mobWeapon, 'sword');
      setVal(dom.mobName, c.mobName, '');
      setChk(dom.mobTinkercadBlank, c.mobTinkercadBlank, false);

      if (state.minecraft) {
        this.mcGen.setState(state.minecraft, false);
        document.querySelectorAll('[data-mc-preset]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-mc-preset') === this.mcGen.currentPresetKey);
        });
      }

      setVal(dom.verificationSelect, state.verificationStatus, 'generated');
      setVal(dom.slicerTimeInput, state.slicerNote, '');
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
      if (this.adventureShelf) this.adventureShelf.selectMission(this.missions.activeMissionId);
      this._isRestoring = false;
    }

    recordUndoSnapshot() {
      if (this._isRestoring) return;
      this.history.recordSnapshot(this.serializeState());
    }

    undo() {
      const restoredState = this.history.undo(this.serializeState());
      if (restoredState) {
        this.applyState(restoredState, false);
        this.autosave();
        if (window.StudioSound) window.StudioSound.playPop(380);
      }
    }

    redo() {
      const restoredState = this.history.redo(this.serializeState());
      if (restoredState) {
        this.applyState(restoredState, false);
        this.autosave();
        if (window.StudioSound) window.StudioSound.playPop(480);
      }
    }

    updateHistoryButtons(canUndo, canRedo) {
      const dom = this._domCache || {};
      this.history.updateUI(dom.btnUndo, dom.btnRedo, dom.btnMcUndo);
    }

    autosave() {
      if (this._isRestoring) return;
      try {
        const payload = JSON.stringify(this.serializeState());
        this.safeStorage.setItem(STORAGE_KEY, payload);
        const dom = this._domCache || {};
        if (dom.autosaveTag) {
          const now = new Date();
          const hh = String(now.getHours()).padStart(2, '0');
          const mm = String(now.getMinutes()).padStart(2, '0');
          const ss = String(now.getSeconds()).padStart(2, '0');
          dom.autosaveTag.textContent = `💾 Автозбережено о ${hh}:${mm}:${ss}`;
        }
      } catch (_) {}
    }

    restoreAutosave() {
      try {
        const raw = this.safeStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.app !== '3d-club-studio') return false;
        this.applyState(parsed, false);
        const dom = this._domCache || {};
        if (dom.autosaveTag) {
          dom.autosaveTag.textContent = '💾 Відновлено попередній проєкт';
        }
        return true;
      } catch (_) {
        return false;
      }
    }

    saveProjectToFile() {
      const state = this.serializeState();
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const mission = this.missions.getActiveMission();
      const cleanTitle = (mission ? mission.title : 'project').replace(/[^a-zA-Z0-9а-яА-ЯіїєґІЇЄҐ_-]/g, '_');
      a.download = `3d_kuznya_${cleanTitle}_${Date.now()}.json`;
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
            alert('Цей файл не є файлом проєкту «3D Кузня Чудес».');
            return;
          }
          this.recordUndoSnapshot();
          this.applyState(parsed, true);
          this.autosave();
          if (window.StudioSound) window.StudioSound.playMagicGenerate();
        } catch (_) {
          alert('Не вдалося прочитати файл проєкту. Перевірте цілісність .json файлу.');
        }
      };
      reader.readAsText(file);
    }

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

      const conn = this.mcGen?.lastConnectivity;
      if (!d.fitsBed) {
        pill.textContent = `🚨 Габарит ${d.x}×${d.y} мм за межами столу!`;
        pill.className = 'geom-check-pill danger';
      } else if (!d.safeBed) {
        pill.textContent = `⚠️ ${d.x}×${d.y} мм — близько до краю столу (>190 мм)`;
        pill.className = 'geom-check-pill warn';
      } else if (this.activeTab === 'minecraft' && conn && conn.activeCount > 0 && conn.finalIslands > 1) {
        pill.textContent = `⚠️ Деталь розірвана на ${conn.finalIslands} частини!`;
        pill.className = 'geom-check-pill danger';
      } else if (d.isMini) {
        pill.textContent = '🌟 Міні-формат (≤35 мм) • Плоске дно Z=0';
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
        pill.textContent = `🔗 Суцільна підкладка з'єднала ${c.rawIslands} острови в 1 деталь!`;
        pill.className = 'connectivity-pill bridged';
      } else if (c.finalIslands === 1 && c.hasDiagonalOnly && !dom.mcSolidBase?.checked) {
        pill.textContent = '⚠️ Є тонкі діагональні кутики: увімкніть підкладку для міцності!';
        pill.className = 'connectivity-pill warn';
      } else if (c.finalIslands === 1) {
        pill.textContent = '✅ 1 суцільна деталь: усі частини надійно з\'єднані.';
        pill.className = 'connectivity-pill';
      } else {
        pill.textContent = `🚨 Розірвано на ${c.finalIslands} окремих частин! Увімкніть підкладку або домалюйте містки.`;
        pill.className = 'connectivity-pill danger';
      }
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

      const illusionCameraBar = this._domCache?.illusionCameraBar || document.getElementById('illusion-camera-bar');
      const physicsActionBar = this._domCache?.physicsActionBar || document.getElementById('physics-action-bar');
      if (illusionCameraBar) illusionCameraBar.style.display = tabName === 'illusion' ? 'flex' : 'none';
      if (physicsActionBar) physicsActionBar.style.display = tabName === 'physics' ? 'flex' : 'none';

      if (tabName === 'illusion') {
        this.sceneManager.setCameraView('front');
        if (this.missions && this.missions.getActiveMission()?.targetTab !== 'illusion') {
          this.missions.setMission(12, false);
        }
      } else {
        this.sceneManager.setCameraView('iso');
        if (this.missions && this.missions.getActiveMission()?.targetTab === 'illusion') {
          this.missions.setMission(1, false);
        }
      }
      if (this.missions) {
        this.missions.updateActiveMissionUI(this._domCache);
      }

      if (!skipRebuild) {
        this.rebuildCurrentModel(true, true);
      }
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

    captureV1Snapshot(silent = false) {
      const snap = this.compare.captureV1(
        this.sceneManager,
        this.mcGen,
        this.activeTab,
        this.missions.getActiveMission(),
        this._domCache?.slicerTimeInput,
        silent
      );
      if (snap) {
        const dom = this._domCache || {};
        if (dom.btnCompareV1V2) {
          dom.btnCompareV1V2.style.display = 'inline-block';
          dom.btnCompareV1V2.disabled = false;
          dom.btnCompareV1V2.classList.add('has-v1');
          dom.btnCompareV1V2.title = `V1 зафіксовано о ${snap.displayTime}. Натисніть для порівняння!`;
        }
        if (dom.btnSnapshotV1) {
          dom.btnSnapshotV1.textContent = '📸 V1 збережено ✅';
          setTimeout(() => {
            if (dom.btnSnapshotV1) dom.btnSnapshotV1.textContent = '📸 Оновити V1';
          }, 2200);
        }
        this.autosave();
      }
    }

    openCompareModal() {
      this.compare.openCompareModal(
        this._domCache,
        this.sceneManager,
        this.mcGen,
        this.activeTab,
        this.missions.getActiveMission(),
        this._domCache?.slicerTimeInput
      );
    }

    closeCompareModal() {
      this.compare.closeCompareModal(this._domCache);
    }

    openPrintCardModal(version = 'V2') {
      this.passport.openModal({
        version,
        domCache: this._domCache,
        sceneManager: this.sceneManager,
        mcGen: this.mcGen,
        activeTab: this.activeTab,
        mission: this.missions.getActiveMission(),
        checks: this.missions.missionChecks,
        v1Snapshot: this.compare.getV1(),
        filename: this.getSuggestedFilename()
      });
    }

    closePrintCardModal() {
      this.passport.closeModal(this._domCache);
    }

    downloadPassportPng() {
      this.passport.downloadPassportPng({
        domCache: this._domCache,
        sceneManager: this.sceneManager,
        mcGen: this.mcGen,
        activeTab: this.activeTab,
        mission: this.missions.getActiveMission(),
        checks: this.missions.missionChecks,
        v1Snapshot: this.compare.getV1(),
        filename: this.getSuggestedFilename()
      });
    }

    copyPassportText() {
      this.passport.copyPassport({
        domCache: this._domCache,
        sceneManager: this.sceneManager,
        mcGen: this.mcGen,
        activeTab: this.activeTab,
        mission: this.missions.getActiveMission(),
        checks: this.missions.missionChecks,
        v1Snapshot: this.compare.getV1(),
        filename: this.getSuggestedFilename()
      });
    }

    startMission(missionId) {
      const m = this.missions.setMission(missionId, true);
      if (!m) return;

      this.recordUndoSnapshot();
      const dom = this._domCache || {};
      const cfg = m.config || {};
      const c = cfg.controls || {};

      if (cfg.tab === 'minecraft') {
        if (c.mcVoxelSize && dom.mcVoxelSize) dom.mcVoxelSize.value = c.mcVoxelSize;
        if (c.mcHeightStep && dom.mcHeightStep) dom.mcHeightStep.value = c.mcHeightStep;
        if (typeof c.mcSolidBase === 'boolean' && dom.mcSolidBase) dom.mcSolidBase.checked = c.mcSolidBase;
        if (c.mcMountType && dom.mcMountType) dom.mcMountType.value = c.mcMountType;
        if (typeof c.mcCustomLabel === 'string' && dom.mcCustomLabel) dom.mcCustomLabel.value = c.mcCustomLabel;
        if (c.mcSlotWidth && dom.mcSlotWidth) dom.mcSlotWidth.value = c.mcSlotWidth;

        if (cfg.mcPreset) {
          this.mcGen.loadPreset(cfg.mcPreset, false, false);
          document.querySelectorAll('[data-mc-preset]').forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-mc-preset') === cfg.mcPreset);
          });
          if (window.StudioSound) window.StudioSound.playThemeSound(cfg.mcPreset);
        }
      } else if (cfg.tab === 'illusion') {
        if (c.ilWord1 && dom.ilWord1) dom.ilWord1.value = c.ilWord1;
        if (c.ilWord2 && dom.ilWord2) dom.ilWord2.value = c.ilWord2;
        if (c.ilVoxelSize && dom.ilVoxelSize) dom.ilVoxelSize.value = c.ilVoxelSize;
        if (typeof c.ilSafeSupports === 'boolean' && dom.ilSafeSupports) dom.ilSafeSupports.checked = c.ilSafeSupports;
        if (c.ilLayoutMode && dom.ilLayoutMode) dom.ilLayoutMode.value = c.ilLayoutMode;
      }

      this.updateValueLabels();
      this.missions.updateActiveMissionUI(this._domCache);
      this.missions.renderMissionsModal(this._domCache, (id) => this.startMission(id));
      this.closeMissionsModal();

      const targetTab = cfg.tab || m.targetTab || 'minecraft';
      this.switchTab(targetTab, true);
      this.markModelModified();
      this.rebuildCurrentModel(true, true);
      this.autosave();
    }

    onMissionSelected(m) {
      if (this.adventureShelf) this.adventureShelf.selectMission(m.id);
      this.missions.updateActiveMissionUI(this._domCache);
      this.missions.renderMissionsModal(this._domCache, (id) => this.startMission(id));
      this.autosave();
    }

    openMissionsModal() {
      const dom = this._domCache || {};
      if (!dom.missionsModal) return;
      this.missions.renderMissionsModal(this._domCache, (id) => this.startMission(id));
      dom.missionsModal.style.display = 'flex';
      const btnTop = document.getElementById('btn-open-missions');
      if (btnTop) btnTop.classList.add('active');
      if (window.StudioSound) window.StudioSound.playPop(540);
    }

    closeMissionsModal() {
      const dom = this._domCache || {};
      if (!dom.missionsModal) return;
      dom.missionsModal.style.display = 'none';
      const btnTop = document.getElementById('btn-open-missions');
      if (btnTop) btnTop.classList.remove('active');
      if (window.StudioSound) window.StudioSound.playPop(360);
    }

    toggleMissionsModal() {
      const dom = this._domCache || {};
      if (dom.missionsModal && dom.missionsModal.style.display === 'flex') {
        this.closeMissionsModal();
      } else {
        this.openMissionsModal();
      }
    }

    // -------------------------------------------------------------------------
    // ПРИВ'ЯЗКА ПОДІЙ ТА ІНТЕРФЕЙСУ
    // -------------------------------------------------------------------------
    bindTabs() {
      document.querySelectorAll('.gen-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-tab');
          if (tab) {
            this.recordUndoSnapshot();
            this.switchTab(tab);
            this.autosave();
          }
        });
      });
    }

    bindTopActions() {
      const dom = this._domCache || {};

      const logo = document.querySelector('.brand-logo');
      if (logo) {
        logo.addEventListener('click', () => {
          if (window.StudioSound) window.StudioSound.playAnvilClang();
        });
      }

      if (dom.btnUndo) dom.btnUndo.addEventListener('click', () => this.undo());
      if (dom.btnRedo) dom.btnRedo.addEventListener('click', () => this.redo());
      if (dom.btnMcUndo) dom.btnMcUndo.addEventListener('click', () => this.undo());

      // Гарячі клавіші (Undo, Redo, Save, Escape, Ортографія)
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) this.redo();
          else this.undo();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          this.redo();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          this.saveProjectToFile();
        } else if (e.key === 'Escape') {
          if (dom.missionsModal && dom.missionsModal.style.display !== 'none') this.closeMissionsModal();
          if (dom.compareModal && dom.compareModal.style.display !== 'none') this.closeCompareModal();
          if (dom.printCardModal && dom.printCardModal.style.display !== 'none') this.closePrintCardModal();
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key.toLowerCase() === 'o' || e.key === '5')) {
          if (!['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
            e.preventDefault();
            if (this.sceneManager) {
              const isOrtho = this.sceneManager.toggleProjection();
              this.updateOrthoButtonUI(isOrtho);
              this.autosave();
            }
          }
        }
      });

      if (dom.btnToggleMono) {
        dom.btnToggleMono.addEventListener('click', () => {
          const act = this.setMonochromeMode();
          if (window.StudioSound) window.StudioSound.playMonoSwitch(act);
          this.autosave();
        });
      }
      if (dom.btnHudMono) {
        dom.btnHudMono.addEventListener('click', () => {
          const act = this.setMonochromeMode();
          if (window.StudioSound) window.StudioSound.playMonoSwitch(act);
          this.autosave();
        });
      }
      if (dom.monoColorPicker) {
        dom.monoColorPicker.addEventListener('input', (e) => {
          const hex = parseInt(e.target.value.replace('#', '0x'), 16);
          this.sceneManager.setMonochromeColor(hex);
          this.autosave();
        });
      }

      const btnSave = document.getElementById('btn-save-project');
      const btnLoad = document.getElementById('btn-load-project');
      const inputLoad = document.getElementById('input-load-project');

      if (btnSave) btnSave.addEventListener('click', () => this.saveProjectToFile());
      if (btnLoad && inputLoad) {
        btnLoad.addEventListener('click', () => inputLoad.click());
        inputLoad.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            this.loadProjectFromFile(file);
            inputLoad.value = '';
          }
        });
      }

      if (dom.btnSnapshotV1) dom.btnSnapshotV1.addEventListener('click', () => this.captureV1Snapshot());
      if (dom.btnCompareV1V2) dom.btnCompareV1V2.addEventListener('click', () => this.openCompareModal());
      if (dom.btnPrintCard) dom.btnPrintCard.addEventListener('click', () => this.openPrintCardModal());

      const btnSound = document.getElementById('btn-toggle-sound');
      const btnMusic = document.getElementById('btn-toggle-music');
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          if (window.StudioSound) {
            const on = window.StudioSound.toggleSound();
            btnSound.classList.toggle('muted', !on);
            btnSound.textContent = on ? '🔊 Звук' : '🔇 Звук: ВИМК';
            btnSound.title = on ? 'Звукові ефекти увімкнено (натисніть, щоб вимкнути)' : 'Звукові ефекти вимкнено (натисніть, щоб увімкнути)';
            if (!on && btnMusic) {
              btnMusic.classList.remove('playing');
              btnMusic.textContent = '🎵 Музика';
              btnMusic.title = 'Фонова мелодія кузні вимкнена';
            }
          }
        });
      }

      if (btnMusic) {
        btnMusic.addEventListener('click', () => {
          if (window.StudioSound) {
            const on = window.StudioSound.toggleMusic();
            btnMusic.classList.toggle('playing', on);
            btnMusic.textContent = on ? '🎵 Мелодія: ГРАЄ' : '🎵 Музика';
            btnMusic.title = on ? 'Фонова мелодія грає (натисніть для паузи)' : 'Увімкнути фонову мелодію кузні';
            if (on && btnSound) {
              btnSound.classList.remove('muted');
              btnSound.textContent = '🔊 Звук';
            }
          }
        });
      }

      const btnRandom = document.getElementById('btn-random-wow');
      if (btnRandom) {
        btnRandom.addEventListener('click', () => {
          this.recordUndoSnapshot();
          this.randomizeCurrentTab();
          this.markModelModified();
          this.autosave();
        });
      }

      const btnSim = document.getElementById('btn-simulate-print');
      if (btnSim) {
        btnSim.addEventListener('click', () => {
          const active = this.sceneManager.startSlicerSimulation();
          if (active) {
            btnSim.textContent = '⏹️ Зупинити симуляцію';
            if (window.StudioSound) window.StudioSound.playSimStart();
          } else {
            btnSim.textContent = '🔥 Симуляція';
          }
        });
      }

      const btnExport = document.getElementById('btn-export-stl');
      if (btnExport) {
        btnExport.addEventListener('click', () => {
          const fname = this.getSuggestedFilename();
          this.sceneManager.exportBinarySTL(fname);
        });
      }

      // Керування модальним вікном порівняння V1 ↔ V2
      if (dom.btnCloseCompare) dom.btnCloseCompare.addEventListener('click', () => this.closeCompareModal());
      if (dom.btnCloseCompareFooter) dom.btnCloseCompareFooter.addEventListener('click', () => this.closeCompareModal());
      if (dom.btnReSnapshotV1) {
        dom.btnReSnapshotV1.addEventListener('click', () => {
          this.captureV1Snapshot();
          this.openCompareModal();
        });
      }
      if (dom.btnCompareToPassport) {
        dom.btnCompareToPassport.addEventListener('click', () => {
          this.closeCompareModal();
          this.openPrintCardModal('V2');
        });
      }
      if (dom.compareModal) {
        dom.compareModal.addEventListener('click', (e) => {
          if (e.target === dom.compareModal) this.closeCompareModal();
        });
      }

      // Керування модальним вікном Паспорта
      if (dom.btnClosePrintCard) dom.btnClosePrintCard.addEventListener('click', () => this.closePrintCardModal());
      if (dom.printCardModal) {
        dom.printCardModal.addEventListener('click', (e) => {
          if (e.target === dom.printCardModal) this.closePrintCardModal();
        });
      }
      if (dom.btnActionPrint) dom.btnActionPrint.addEventListener('click', () => window.print());
      if (dom.btnActionDownloadPng) dom.btnActionDownloadPng.addEventListener('click', () => this.downloadPassportPng());
      if (dom.btnActionCopyText) dom.btnActionCopyText.addEventListener('click', () => this.copyPassportText());

      if (dom.cardPairInput) {
        dom.cardPairInput.addEventListener('input', (e) => {
          const val = e.target.value.trim();
          this.safeStorage.setItem('3d_kuznya_pair_code', val);
          this.passport.updatePrintCardContent({
            domCache: this._domCache,
            version: dom.pVerV1?.checked ? 'V1' : 'V2',
            sceneManager: this.sceneManager,
            mcGen: this.mcGen,
            activeTab: this.activeTab,
            mission: this.missions.getActiveMission(),
            checks: this.missions.missionChecks,
            v1Snapshot: this.compare.getV1(),
            filename: this.getSuggestedFilename()
          });
        });
      }

      if (dom.pVerV1) {
        dom.pVerV1.addEventListener('change', () => {
          if (dom.pVerV1.checked) {
            this.passport.updatePrintCardContent({
              domCache: this._domCache,
              version: 'V1',
              sceneManager: this.sceneManager,
              mcGen: this.mcGen,
              activeTab: this.activeTab,
              mission: this.missions.getActiveMission(),
              checks: this.missions.missionChecks,
              v1Snapshot: this.compare.getV1(),
              filename: this.getSuggestedFilename()
            });
          }
        });
      }

      if (dom.pVerV2) {
        dom.pVerV2.addEventListener('change', () => {
          if (dom.pVerV2.checked) {
            this.passport.updatePrintCardContent({
              domCache: this._domCache,
              version: 'V2',
              sceneManager: this.sceneManager,
              mcGen: this.mcGen,
              activeTab: this.activeTab,
              mission: this.missions.getActiveMission(),
              checks: this.missions.missionChecks,
              v1Snapshot: this.compare.getV1(),
              filename: this.getSuggestedFilename()
            });
          }
        });
      }
    }

    bindMissionControls() {
      const dom = this._domCache || {};

      const btnOpenTop = document.getElementById('btn-open-missions');
      const btnOpenInline = document.getElementById('btn-open-missions-inline');
      const btnCloseModal = document.getElementById('btn-close-missions');
      const btnToggleBody = document.getElementById('btn-toggle-mission-body');
      const btnCloseCard = document.getElementById('btn-close-active-mission');
      const btnPrev = document.getElementById('btn-prev-mission');
      const btnNext = document.getElementById('btn-next-mission');
      const btnStartActive = document.getElementById('btn-start-active-mission');

      if (btnOpenTop) btnOpenTop.addEventListener('click', () => this.toggleMissionsModal());
      if (btnOpenInline) btnOpenInline.addEventListener('click', () => this.openMissionsModal());
      if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeMissionsModal());

      if (btnCloseCard) {
        btnCloseCard.addEventListener('click', () => {
          this.missions.setCardVisibility(false);
          this.missions.updateActiveMissionUI(this._domCache);
          if (window.StudioSound) window.StudioSound.playPop(340);
          this.autosave();
        });
      }

      if (dom.missionsModal) {
        dom.missionsModal.addEventListener('click', (e) => {
          if (e.target === dom.missionsModal) this.closeMissionsModal();
        });
      }

      if (btnToggleBody) {
        btnToggleBody.addEventListener('click', () => {
          const col = this.missions.toggleBodyCollapse();
          this.missions.updateActiveMissionUI(this._domCache);
          if (window.StudioSound) window.StudioSound.playPop(col ? 360 : 520);
          this.autosave();
        });
      }

      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          this.missions.prevMission();
          if (window.StudioSound) window.StudioSound.playPop(420);
        });
      }

      if (btnNext) {
        btnNext.addEventListener('click', () => {
          this.missions.nextMission();
          if (window.StudioSound) window.StudioSound.playPop(500);
        });
      }

      if (btnStartActive) {
        btnStartActive.addEventListener('click', () => {
          this.startMission(this.missions.activeMissionId);
        });
      }

      document.querySelectorAll('[data-mission-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cat = btn.getAttribute('data-mission-filter') || 'all';
          this.missions.setFilter(cat);
          document.querySelectorAll('[data-mission-filter]').forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-mission-filter') === cat);
          });
          this.missions.renderMissionsModal(this._domCache, (id) => this.startMission(id));
          if (window.StudioSound) window.StudioSound.playPop(460);
        });
      });

      const checkMap = [
        [dom.chkMissionConnected, 'connected'],
        [dom.chkMissionMono, 'mono'],
        [dom.chkMissionSize, 'size']
      ];
      checkMap.forEach(([chkEl, key]) => {
        if (chkEl) {
          chkEl.addEventListener('change', () => {
            this.missions.setCheck(key, chkEl.checked);
            if (window.StudioSound) window.StudioSound.playPop(chkEl.checked ? 620 : 340);
            this.autosave();
          });
        }
      });
    }

    bindViewModeControls() {
      document.querySelectorAll('[data-view-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-view-mode') || 'split';
          this.setViewMode(mode);
        });
      });
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

    bindCameraControls() {
      if (this.sceneManager) {
        this.sceneManager.onUserCameraInteraction = () => {
          document.querySelectorAll('[data-camera-view]').forEach(b => b.classList.remove('active-cam'));
        };
      }

      document.querySelectorAll('[data-camera-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const preset = btn.getAttribute('data-camera-view');
          if (this.sceneManager && preset) {
            this.sceneManager.setCameraView(preset);
            document.querySelectorAll('[data-camera-view]').forEach(b => b.classList.remove('active-cam'));
            btn.classList.add('active-cam');
          }
        });
      });

      const btnToggleOrtho = document.getElementById('btn-toggle-ortho');
      if (btnToggleOrtho) {
        btnToggleOrtho.addEventListener('click', () => {
          if (this.sceneManager) {
            const isOrtho = this.sceneManager.toggleProjection();
            this.updateOrthoButtonUI(isOrtho);
            this.autosave();
          }
        });
      }
    }

    updateOrthoButtonUI(isOrtho) {
      const btn = this._domCache?.btnToggleOrtho || document.getElementById('btn-toggle-ortho');
      if (!btn) return;
      btn.classList.toggle('active-cam', !!isOrtho);
      btn.textContent = isOrtho ? '📐 Орто: Вкл' : '📐 Орто';
      btn.title = isOrtho
        ? 'Ортографічна проєкція активна (паралельні лінії без спотворень). Натисніть для переходу на Перспективу (Клавіша O)'
        : 'Перспективна проєкція. Натисніть для переходу на Ортографічну проєкцію (Клавіша O)';
    }

    bindMinecraftControls() {
      document.querySelectorAll('[data-mc-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.recordUndoSnapshot();
          document.querySelectorAll('[data-mc-preset]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const key = btn.getAttribute('data-mc-preset');
          if (window.StudioSound) window.StudioSound.playThemeSound(key);

          const presetDef = window.MINECRAFT_PRESETS && window.MINECRAFT_PRESETS[key];
          if (presetDef && presetDef.recommendedParams) {
            const dom = this._domCache || {};
            const rp = presetDef.recommendedParams;
            if (rp.voxelSize && dom.mcVoxelSize) dom.mcVoxelSize.value = rp.voxelSize;
            if (rp.heightStep && dom.mcHeightStep) dom.mcHeightStep.value = rp.heightStep;
            if (typeof rp.solidBase === 'boolean' && dom.mcSolidBase) dom.mcSolidBase.checked = rp.solidBase;
            if (rp.mountType && dom.mcMountType) dom.mcMountType.value = rp.mountType;
            if (rp.slotWidth && dom.mcSlotWidth) dom.mcSlotWidth.value = rp.slotWidth;
            this.updateValueLabels();
          }

          this.mcGen.loadPreset(key, false, false);
          this.markModelModified();
          this.rebuildCurrentModel(true, true);
          this.autosave();
        });
      });

      const btnMini = document.getElementById('btn-mc-mini-preset');
      if (btnMini) {
        btnMini.addEventListener('click', () => {
          this.recordUndoSnapshot();
          const dom = this._domCache || {};
          if (dom.mcVoxelSize) dom.mcVoxelSize.value = '2.0';
          if (dom.mcHeightStep) dom.mcHeightStep.value = '1.2';
          if (dom.mcSolidBase) dom.mcSolidBase.checked = true;
          this.updateValueLabels();
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      }

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

      const ids = ['mc-voxel-size', 'mc-height-step', 'mc-solid-base', 'mc-mount-type', 'mc-slot-width', 'mc-custom-label'];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('focus', () => this.recordUndoSnapshot());
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          const handleUpdate = () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
        }
      });
    }

    bindIllusionControls() {
      const btnShort = document.getElementById('btn-il-short-mode');
      if (btnShort) {
        btnShort.addEventListener('click', () => {
          this.recordUndoSnapshot();
          const firstPreset = document.querySelector('[data-il-preset="short"]');
          if (firstPreset) {
            document.querySelectorAll('[data-il-preset]').forEach(b => b.classList.remove('active'));
            firstPreset.classList.add('active');
          }
          const dom = this._domCache || {};
          if (dom.ilWord1) dom.ilWord1.value = '3D';
          if (dom.ilWord2) dom.ilWord2.value = '★!';
          if (dom.ilVoxelSize) dom.ilVoxelSize.value = '2.2';
          this.updateValueLabels();
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      }

      document.querySelectorAll('[data-il-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.recordUndoSnapshot();
          document.querySelectorAll('[data-il-preset]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const dom = this._domCache || {};
          const w1 = btn.getAttribute('data-w1');
          const w2 = btn.getAttribute('data-w2');
          const vox = btn.getAttribute('data-voxel');
          if (dom.ilWord1) dom.ilWord1.value = w1;
          if (dom.ilWord2) dom.ilWord2.value = w2;
          if (vox && dom.ilVoxelSize) dom.ilVoxelSize.value = vox;
          this.updateValueLabels();
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      });

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
          const handleUpdate = () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
        }
      });
    }

    bindPhysicsControls() {
      const subSelect = document.getElementById('ph-submode');
      if (subSelect) {
        subSelect.addEventListener('change', () => {
          this.recordUndoSnapshot();
          const isBalancer = subSelect.value === 'balancer';
          const springG = document.getElementById('ph-spring-group');
          const weightG = document.getElementById('ph-weight-group');
          if (springG) springG.style.display = isBalancer ? 'none' : 'block';
          if (weightG) weightG.style.display = isBalancer ? 'block' : 'none';

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
          const handleUpdate = () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
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
          const handleUpdate = () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            const isArch = id === 'mob-archetype';
            this.markModelModified();
            this.rebuildCurrentModel(isArch, true);
            this.autosave();
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
        }
      });
    }

    _playControlFeedback(el) {
      if (!window.StudioSound) return;
      if (el.type === 'range') {
        const now = performance.now();
        if (now - (this._lastSliderSoundTime || 0) > 45) {
          this._lastSliderSoundTime = now;
          const val = parseFloat(el.value);
          const min = parseFloat(el.min) || 0;
          const max = parseFloat(el.max) || 100;
          const pct = max > min ? (val - min) / (max - min) : 0.5;
          window.StudioSound.playSliderTick(pct);
        }
      } else if (el.type === 'checkbox') {
        window.StudioSound.playToggle(el.checked);
      } else if (el.tagName === 'SELECT') {
        window.StudioSound.playPop(440);
      }
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

      if (dom.mcSlotWidth && dom.valMcSlot) {
        dom.valMcSlot.textContent = dom.mcSlotWidth.value + ' мм';
      }
      if (dom.mcSlotWidthGroup) {
        const isStandOrCalib = this.mcGen?.currentPresetKey === 'cardboard_stand' ||
                              this.mcGen?.currentPresetKey === 'slot_calibrator' ||
                              dom.mcMountType?.value === 'cardboard_stand';
        dom.mcSlotWidthGroup.style.display = isStandOrCalib ? 'flex' : 'none';
      }
    }

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
          customLabel: dom.mcCustomLabel?.value,
          slotWidth: dom.mcSlotWidth?.value || '2.0'
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

  window.StudioApp = StudioApp;

  window.addEventListener('DOMContentLoaded', () => {
    window.StudioApp = new StudioApp();
    window.StudioApp.init();
  });
})();
