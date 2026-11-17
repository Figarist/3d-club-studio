// Головний контролер студії «3D Кузня Чудес» (Чистий Vanilla JS + Three.js r128, 100% офлайн)
(function () {
  const STORAGE_KEY = '3d_kuznya_project_autosave_v1';

  class StudioApp {
    constructor() {
      this.activeTab = 'minecraft'; // 'minecraft', 'illusion', 'physics', 'mob', 'heightmap'
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
        initialCardVisible: false,
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
      this.heightmapGen = new window.HeightmapReliefGenerator();

      this.heightmapGen.onImageReady = () => {
        if (this.activeTab === 'heightmap' && !this._isRestoring) {
          this.updateHeightmapPreview2D();
          this.rebuildCurrentModel(true, true);
          this.autosave();
        }
      };

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
      this.sceneManager.onBeforeExport = () => {
        if (this.activeTab === 'physics') this.physicsGen.resetInteractiveDemo?.(this.sceneManager);
      };
      this.sceneManager.onDimensionsUpdated = () => {
        this.updateDiagnosticsUI();
      };

      // Кеш DOM-елементів (єдина точка правди)
      this._domCache = {
        workspace: document.getElementById('main-workspace'),
        btnExportStl: document.getElementById('btn-export-stl'),
        autosaveTag: document.getElementById('autosave-tag'),
        btnUndo: document.getElementById('btn-undo'),
        btnRedo: document.getElementById('btn-redo'),
        btnToggleMono: document.getElementById('btn-toggle-mono'),
        monoColorPicker: document.getElementById('mono-color-picker'),
        verificationBadge: document.getElementById('print-verification-badge'),
        verificationSelect: document.getElementById('verification-status-select'),
        slicerTimeInput: document.getElementById('slicer-time-input'),
        viewportHudTop: document.getElementById('viewport-hud-top'),
        btnToggleHud: document.getElementById('btn-toggle-hud'),
        geomCheckPill: document.getElementById('geom-check-pill'),
        mcConnectivityStatus: document.getElementById('mc-connectivity-status'),
        illusionCameraBar: document.getElementById('illusion-camera-bar'),
        physicsActionBar: document.getElementById('physics-action-bar'),

        // Модалка місій
        missionsModal: document.getElementById('missions-modal'),
        aboutModal: document.getElementById('about-modal'),
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
        ilDesign: document.getElementById('il-design'),
        valIlVoxel: document.getElementById('val-il-voxel'),

        // Контроли Фізики
        phSubmode: document.getElementById('ph-submode'),
        phDesign: document.getElementById('ph-design'),
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
        mobDesign: document.getElementById('mob-design'),
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

        // Контроли Фото-Барельєфа
        hmDropzone: document.getElementById('hm-dropzone'),
        hmFileInput: document.getElementById('hm-file-input'),
        hmPreviewCanvas: document.getElementById('hm-preview-canvas'),
        hmInvert: document.getElementById('hm-invert'),
        hmAutoLevels: document.getElementById('hm-auto-levels'),
        hmContrast: document.getElementById('hm-contrast'),
        hmBrightness: document.getElementById('hm-brightness'),
        hmGamma: document.getElementById('hm-gamma'),
        hmSmooth: document.getElementById('hm-smooth'),
        hmWidth: document.getElementById('hm-width'),
        hmReliefHeight: document.getElementById('hm-relief-height'),
        hmBaseThickness: document.getElementById('hm-base-thickness'),
        hmShape: document.getElementById('hm-shape'),
        hmResolution: document.getElementById('hm-resolution'),
        hmFrame: document.getElementById('hm-frame'),
        hmKeychain: document.getElementById('hm-keychain'),
        valHmContrast: document.getElementById('val-hm-contrast'),
        valHmBrightness: document.getElementById('val-hm-brightness'),
        valHmGamma: document.getElementById('val-hm-gamma'),
        valHmSmooth: document.getElementById('val-hm-smooth'),
        valHmWidth: document.getElementById('val-hm-width'),
        valHmReliefHeight: document.getElementById('val-hm-relief-height'),
        valHmBaseThickness: document.getElementById('val-hm-base-thickness'),
        hmGeomCheck: document.getElementById('hm-geom-check'),

        // V1 та Порівняння V1 ↔ V2
        btnMyPiece: document.getElementById('btn-my-piece'),
        btnRunCompare: document.getElementById('btn-run-compare'),
        compareResults: document.getElementById('compare-results'),
        pieceV1Status: document.getElementById('piece-v1-status'),
        pieceCompareHint: document.getElementById('piece-compare-hint'),
        compareModal: document.getElementById('compare-modal'),
        btnCloseCompare: document.getElementById('btn-close-compare'),
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
      this.bindModelCatalog();
      this.bindTopActions();
      this.bindMissionControls();
      this.bindViewModeControls();
      this.bindVerificationControls();
      this.bindMinecraftControls();
      this.bindIllusionControls();
      this.bindPhysicsControls();
      this.bindMobControls();
      this.bindHeightmapControls();
      this.bindCameraControls();

      // Відновлюємо автозбереження або рендеримо стартову модель
      const restored = this.restoreAutosave();
      this.missions.updateActiveMissionUI(this._domCache);
      this.missions.renderMissionsModal(this._domCache, (id) => this.startMission(id));
      if (!restored) {
        // Свіжий старт: прев'ю одним пластиком (збережені проєкти зберігають власне значення)
        this.setMonochromeMode(true);
        this.mcGen.renderCanvasUI();
        this.rebuildCurrentModel(true);
      }
      this.history.updateUI(this._domCache.btnUndo, this._domCache.btnRedo);
      if (window.location.hash === '#about') {
        setTimeout(() => this.openAboutModal(), 150);
      }
    }

    // -------------------------------------------------------------------------
    // СЕРІАЛІЗАЦІЯ СТАНУ ТА СТІЙКІСТЬ ДО ПОМИЛОК
    // -------------------------------------------------------------------------
    serializeState() {
      const dom = this._domCache || {};
      const savedPair = this.safeStorage.getItem('3d_kuznya_pair_code') || '';
      return {
        app: '3d-club-studio',
        version: '2.3.0',
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        activeTab: this.activeTab,
        activeMissionId: this.missions.activeMissionId,
        activeMissionKey: this.missions.getActiveMission()?.key,
        activeMissionVisible: this.missions ? this.missions.cardVisible : false,
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
          ilWord1: dom.ilWord1 ? dom.ilWord1.value : '3D',
          ilWord2: dom.ilWord2 ? dom.ilWord2.value : '★!',
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
          mobTinkercadBlank: !!dom.mobTinkercadBlank?.checked,
          mobDesign: dom.mobDesign?.value || 'classic',
          ilDesign: dom.ilDesign?.value || 'classic',
          phDesign: dom.phDesign?.value || 'classic',
          hmPreset: this.heightmapGen ? this.heightmapGen.currentPresetKey : 'cat',
          hmInvert: dom.hmInvert ? !!dom.hmInvert.checked : false,
          hmAutoLevels: dom.hmAutoLevels ? !!dom.hmAutoLevels.checked : true,
          hmContrast: dom.hmContrast?.value || '1',
          hmBrightness: dom.hmBrightness?.value || '0',
          hmGamma: dom.hmGamma?.value || '1',
          hmSmooth: dom.hmSmooth?.value || '0',
          hmWidth: dom.hmWidth?.value || '60',
          hmReliefHeight: dom.hmReliefHeight?.value || '3.5',
          hmBaseThickness: dom.hmBaseThickness?.value || '2',
          hmShape: dom.hmShape?.value || 'rect',
          hmResolution: dom.hmResolution?.value || '128',
          hmFrame: dom.hmFrame ? !!dom.hmFrame.checked : true,
          hmKeychain: dom.hmKeychain ? !!dom.hmKeychain.checked : false,
          hmCustomImage: (this.heightmapGen && this.heightmapGen.customImageDataUrl) || ''
        }
      };
    }

    applyState(state, animatePop = false) {
      state = window.ProjectState.normalize(state, {
        missions: this.missions.missions,
        presets: window.MINECRAFT_PRESETS
      });
      this._isRestoring = true;
      try {
        const dom = this._domCache || {};
        const c = state.controls || {};

        this.missions.applyState({ activeMissionId: state.activeMissionId, activeMissionKey: state.activeMissionKey });
        if (typeof state.activeMissionVisible === 'boolean') {
          this.missions.setCardVisibility(state.activeMissionVisible);
        } else {
          this.missions.setCardVisibility(false);
        }
        if (typeof state.activeMissionCollapsed === 'boolean') {
          this.missions.setBodyCollapse(state.activeMissionCollapsed);
        }
        if (typeof state.isOrthographic === 'boolean' && this.sceneManager) {
          this.sceneManager.setProjectionMode(state.isOrthographic);
          this.updateOrthoButtonUI(state.isOrthographic);
        }
        this.compare.setV1(state.v1Snapshot);
        clearTimeout(this._snapshotLabelTimer);
        this._setSnapshotButtonState(!!state.v1Snapshot);
        this.safeStorage.setItem('3d_kuznya_pair_code', state.studentPairCode);
        if (dom.cardPairInput) dom.cardPairInput.value = state.studentPairCode;
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
        ['mobDesign', 'ilDesign', 'phDesign'].forEach(key => setVal(dom[key], c[key], 'classic'));

        setChk(dom.hmInvert, c.hmInvert, false);
        setChk(dom.hmAutoLevels, c.hmAutoLevels, true);
        setVal(dom.hmContrast, c.hmContrast, '1');
        setVal(dom.hmBrightness, c.hmBrightness, '0');
        setVal(dom.hmGamma, c.hmGamma, '1');
        setVal(dom.hmSmooth, c.hmSmooth, '0');
        setVal(dom.hmWidth, c.hmWidth, '60');
        setVal(dom.hmReliefHeight, c.hmReliefHeight, '3.5');
        setVal(dom.hmBaseThickness, c.hmBaseThickness, '2');
        setVal(dom.hmShape, c.hmShape, 'rect');
        setVal(dom.hmResolution, c.hmResolution, '128');
        setChk(dom.hmFrame, c.hmFrame, true);
        setChk(dom.hmKeychain, c.hmKeychain, false);

        if (this.heightmapGen) {
          if (c.hmCustomImage) {
            this.heightmapGen.loadCustomImage(c.hmCustomImage, () => this.updateHeightmapPreview2D());
            document.querySelectorAll('[data-hm-preset]').forEach((b) => b.classList.remove('active'));
          } else {
            const preset = c.hmPreset || 'cat';
            this.heightmapGen.loadPreset(preset, () => this.updateHeightmapPreview2D());
            document.querySelectorAll('[data-hm-preset]').forEach((b) => {
              b.classList.toggle('active', b.getAttribute('data-hm-preset') === preset);
            });
          }
        }

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
          this.sceneManager.setMonochromeColor(parseInt(state.monoColor.slice(1), 16));
        }
        if (typeof state.monochrome === 'boolean') {
          this.setMonochromeMode(state.monochrome);
        }

        this.updateValueLabels();
        const targetTab = state.activeTab || 'minecraft';
        this.switchTab(targetTab, true);
        this.rebuildCurrentModel(animatePop, true);
      } finally {
        this._isRestoring = false;
      }
    }

    recordUndoSnapshot() {
      if (this._isRestoring) return;
      this.history.recordSnapshot(this.serializeState());
    }

    undo() {
      const current = this.serializeState();
      const restoredState = this.history.undo(current);
      if (restoredState) {
        try {
          this.applyState(restoredState, false);
        } catch (error) {
          this.history.redo(restoredState);
          this.showToast('⚠️ Не вдалося скасувати дію: ' + error.message);
          return;
        }
        this.autosave();
        if (window.StudioSound) window.StudioSound.playPop(380);
      }
    }

    redo() {
      const restoredState = this.history.redo(this.serializeState());
      if (restoredState) {
        try {
          this.applyState(restoredState, false);
        } catch (error) {
          this.history.undo(restoredState);
          this.showToast('⚠️ Не вдалося повторити дію: ' + error.message);
          return;
        }
        this.autosave();
        if (window.StudioSound) window.StudioSound.playPop(480);
      }
    }

    _syncAudioButtons() {
      const snd = window.StudioSound;
      const btnSound = document.getElementById('btn-toggle-sound');
      const btnMusic = document.getElementById('btn-toggle-music');
      if (!snd) return;
      const soundOn = !!snd.enabled;
      const musicOn = !!(snd.enabled && snd.musicEnabled);
      if (btnSound) {
        btnSound.classList.toggle('muted', !soundOn);
        btnSound.textContent = soundOn ? '🔊 Звук' : '🔇 Звук: ВИМК';
        btnSound.title = soundOn ? 'Звукові ефекти увімкнено (натисніть, щоб вимкнути)' : 'Звукові ефекти вимкнено (натисніть, щоб увімкнути)';
        btnSound.setAttribute('aria-checked', soundOn ? 'true' : 'false');
      }
      if (btnMusic) {
        btnMusic.classList.toggle('playing', musicOn);
        btnMusic.textContent = musicOn ? '🎵 Мелодія: ГРАЄ' : '🎵 Музика';
        btnMusic.title = musicOn ? 'Фонова мелодія грає (натисніть для паузи)' : 'Увімкнути фонову мелодію кузні';
        btnMusic.setAttribute('aria-checked', musicOn ? 'true' : 'false');
      }
    }

    updateHistoryButtons(canUndo, canRedo) {
      const dom = this._domCache || {};
      this.history.updateUI(dom.btnUndo, dom.btnRedo);
    }

    _setButtonLabel(btn, ico, text) {
      if (!btn) return;
      const icoEl = btn.querySelector('.btn-ico');
      const lblEl = btn.querySelector('.btn-lbl');
      if (icoEl && lblEl) {
        icoEl.textContent = ico;
        lblEl.textContent = text;
      } else {
        btn.textContent = `${ico} ${text}`;
      }
    }

    _setSnapshotButtonState(hasV1) {
      const dom = this._domCache || {};
      if (dom.btnMyPiece) {
        dom.btnMyPiece.classList.toggle('has-v1', Boolean(hasV1));
        dom.btnMyPiece.title = hasV1
          ? `Мій виріб: чернетку V1 збережено${this.compare.getV1()?.displayTime ? ` о ${this.compare.getV1().displayTime}` : ''}`
          : 'Мій виріб: чернетка V1, порівняння з поточною моделлю та паспорт деталі';
      }
      this.compare.syncSteps(dom);
    }

    _updateAutosaveTag(shortText, detailText, tooltipText) {
      const tag = this._domCache?.autosaveTag;
      if (!tag) return;
      const shortEl = tag.querySelector('.autosave-short');
      const fullEl = tag.querySelector('.autosave-full');
      if (shortEl && fullEl) {
        shortEl.textContent = shortText;
        fullEl.textContent = detailText;
      } else {
        tag.textContent = `💾 ${tooltipText}`;
      }
      tag.title = tooltipText;
      tag.setAttribute('aria-label', tooltipText);
      tag.classList.remove('pulse-saved');
      void tag.offsetWidth;
      tag.classList.add('pulse-saved');
    }

    autosave() {
      if (this._isRestoring) return;
      this._autosaveDirty = true;
      clearTimeout(this._autosaveTimer);
      this._autosaveTimer = setTimeout(() => this._autosaveNow(), 400);
    }

    flushAutosave() {
      if (!this._autosaveDirty) return;
      clearTimeout(this._autosaveTimer);
      this._autosaveNow();
    }

    _scheduleRebuild(animatePop = false, skipSound = false) {
      this._rebuildArgs = {
        animatePop: !!(this._rebuildArgs?.animatePop || animatePop),
        skipSound: this._rebuildArgs ? (this._rebuildArgs.skipSound && skipSound) : skipSound
      };
      if (this._rebuildRaf) return;
      this._rebuildRaf = requestAnimationFrame(() => {
        this._rebuildRaf = 0;
        const args = this._rebuildArgs;
        this._rebuildArgs = null;
        if (!args) return;
        this._rebuildFromInput = true;
        try {
          this.rebuildCurrentModel(args.animatePop, args.skipSound);
        } finally {
          this._rebuildFromInput = false;
        }
      });
      this.autosave();
    }

    _autosaveNow() {
      this._autosaveDirty = false;
      if (this._isRestoring) return;
      try {
        const payload = JSON.stringify(this.serializeState());
        if (this.safeStorage.setItem(STORAGE_KEY, payload) === false) {
          console.warn('Автозбереження не вдалося: сховище браузера недоступне або заповнене');
          this._updateAutosaveTag('⚠️ Не збережено', '• сховище повне', 'Не збережено: сховище повне або недоступне');
          return;
        }
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        this._updateAutosaveTag('Авто', `• ${hh}:${mm}:${ss}`, `Автозбережено о ${hh}:${mm}:${ss} у пам'яті браузера`);
      } catch (error) {
        console.warn('Автозбереження не вдалося:', error);
        this._updateAutosaveTag('⚠️ Не збережено', '• помилка', 'Не збережено: ' + (error && error.message || 'помилка'));
      }
    }

    restoreAutosave() {
      try {
        const raw = this.safeStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.app !== '3d-club-studio') return false;
        this.applyState(parsed, false);
        this._updateAutosaveTag('Авто', '• Відновлено', 'Відновлено попередній проєкт із пам\'яті браузера');
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
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (window.StudioSound) window.StudioSound.playExportSuccess();
    }

    loadProjectFromFile(file, inputEl) {
      if (!file) return;
      const MAX_BYTES = 2 * 1024 * 1024;
      if (file.size > MAX_BYTES) {
        this.showToast('⚠️ Файл завеликий (максимум 2 МБ).');
        if (inputEl) inputEl.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => {
        this.showToast('⚠️ Не вдалося прочитати файл.');
        if (inputEl) inputEl.value = '';
      };
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed || parsed.app !== '3d-club-studio') {
            this.showToast('⚠️ Цей файл не є файлом проєкту «3D Кузня Чудес».');
            return;
          }
          const candidate = window.ProjectState.normalize(parsed, {
            missions: this.missions.missions, presets: window.MINECRAFT_PRESETS
          });
          const previous = this.serializeState();
          try {
            this.applyState(candidate, true);
          } catch (error) {
            try { this.applyState(previous, false); } catch (restoreError) { console.warn('Не вдалося відновити попередній стан:', restoreError); }
            throw error;
          }
          this.history.recordSnapshot(previous);
          this.autosave();
          if (window.StudioSound) window.StudioSound.playMagicGenerate();
        } catch (error) {
          this.showToast('⚠️ Не вдалося відкрити проєкт: ' + error.message);
        } finally {
          if (inputEl) inputEl.value = '';
        }
      };
      reader.readAsText(file);
    }

    markModelModified() {
      if (this._isRestoring) return;
      const dom = this._domCache || {};
      if (dom.slicerTimeInput) dom.slicerTimeInput.value = '';
      if (dom.verificationSelect && dom.verificationSelect.value !== 'generated') {
        dom.verificationSelect.value = 'generated';
        this.syncVerificationBadgeUI();
      }
      this.updateDiagnosticsUI();
    }

    setMonochromeMode(enable) {
      const active = this.sceneManager.toggleMonochrome(enable);
      const dom = this._domCache || {};
      if (dom.btnToggleMono) {
        dom.btnToggleMono.classList.toggle('active', active);
        dom.btnToggleMono.setAttribute('aria-pressed', active ? 'true' : 'false');
        dom.btnToggleMono.setAttribute('aria-checked', active ? 'true' : 'false');
        this._setButtonLabel(dom.btnToggleMono, '🪨', active ? '1 Пластик ✓' : '1 Пластик');
      }
      return active;
    }

    setViewMode(mode) {
      if (mode === 'editor') mode = 'split';
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
        requestAnimationFrame(() => {
          this.sceneManager.onResize();
          this.sceneManager.fitModelView();
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
        pill.textContent = '🌟 Міні-формат (≤35 мм) • Стоїть рівно на столі (Z=0)';
        pill.className = 'geom-check-pill';
      } else {
        pill.textContent = '📐 Поміщається на столі • Стоїть рівно на столі (Z=0)';
        pill.className = 'geom-check-pill';
      }
    }

    updateMinecraftConnectivityUI() {
      const dom = this._domCache || {};
      const pill = dom.mcConnectivityStatus;
      if (!pill || !this.mcGen) return;

      const c = this.mcGen.lastConnectivity;
      if (!c || c.activeCount === 0) {
        pill.textContent = '✏️ Полотно порожнє: намалюй власний знак або обери зразок вище.';
        pill.className = 'connectivity-pill warn';
      } else if (c.finalIslands === 1 && c.bridgedCount > 0) {
        pill.textContent = `🔗 Суцільна підкладка з'єднала ${c.rawIslands} деталі в 1 міцну фігурку!`;
        pill.className = 'connectivity-pill bridged';
      } else if (c.finalIslands === 1 && c.hasDiagonalOnly && !dom.mcSolidBase?.checked) {
        pill.textContent = '⚠️ Є тонкі діагональні кутики: увімкни підкладку для міцності!';
        pill.className = 'connectivity-pill warn';
      } else if (c.finalIslands === 1) {
        pill.textContent = '✅ Чудово! Усі деталі з’єднані в одну міцну фігурку.';
        pill.className = 'connectivity-pill';
      } else {
        pill.textContent = `🚨 Розірвано на ${c.finalIslands} окремі частини! Вони розпадуться при друці. Додай підкладку або з'єднай їх.`;
        pill.className = 'connectivity-pill danger';
      }
    }

    switchTab(tabName, skipRebuild = false) {
      this.activeTab = tabName;
      if (!skipRebuild && window.StudioSound) window.StudioSound.playTabSwitch(tabName);

      document.querySelectorAll('.gen-tab-btn').forEach((b) => {
        const isActive = b.getAttribute('data-tab') === tabName;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      document.querySelectorAll('.panel-section').forEach((sec) => {
        sec.classList.toggle('active', sec.id === `panel-${tabName}`);
      });

      const illusionCameraBar = this._domCache?.illusionCameraBar || document.getElementById('illusion-camera-bar');
      const physicsActionBar = this._domCache?.physicsActionBar || document.getElementById('physics-action-bar');
      if (illusionCameraBar) illusionCameraBar.style.display = tabName === 'illusion' ? 'flex' : 'none';
      if (physicsActionBar) physicsActionBar.style.display = tabName === 'physics' ? 'flex' : 'none';

      const dom = this._domCache || {};
      if (tabName === 'illusion') {
        this.sceneManager.setCameraView('front');
        if (!this._isRestoring && this.missions && this.missions.getActiveMission()?.targetTab !== 'illusion') {
          this.missions.setMission(12, false);
        }
      } else {
        this.sceneManager.setCameraView('iso');
        if (!this._isRestoring && this.missions && this.missions.getActiveMission()?.targetTab === 'illusion') {
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
      if (this.activeTab === 'heightmap') {
        const shape = dom.hmShape?.value === 'circle' ? 'coin' : 'relief';
        const preset = (this.heightmapGen && this.heightmapGen.currentPresetKey) || 'custom';
        const w = dom.hmWidth?.value || '60';
        return `${shape}_${preset}_${w}mm.stl`;
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
        this._setSnapshotButtonState(true);
        if (this._domCache?.compareResults && !this._domCache.compareResults.hidden) this.renderComparison();
        this.showToast('📸 V1 (Ескіз) зафіксовано для порівняння!');
        this.autosave();
      }
    }

    showToast(message, { duration = 4000, actionText = null, onAction = null } = {}) {
      let toast = document.getElementById('app-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
      }
      toast.innerHTML = '';

      const textSpan = document.createElement('span');
      textSpan.className = 'toast-text';
      textSpan.textContent = message;
      toast.appendChild(textSpan);

      if (actionText && typeof onAction === 'function') {
        const actBtn = document.createElement('button');
        actBtn.className = 'toast-action-btn';
        actBtn.textContent = actionText;
        actBtn.addEventListener('click', () => {
          try { onAction(); } catch (err) { console.warn(err); }
          toast.classList.remove('visible');
        });
        toast.appendChild(actBtn);
      }

      const closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close-btn';
      closeBtn.textContent = '✕';
      closeBtn.setAttribute('aria-label', 'Закрити сповіщення');
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('visible');
      });
      toast.appendChild(closeBtn);

      toast.classList.add('visible');
      clearTimeout(this._toastTimer);
      if (duration > 0) {
        this._toastTimer = setTimeout(() => {
          toast.classList.remove('visible');
        }, duration);
      }
    }

    launchConfetti() {
      let canvas = document.getElementById('confetti-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.className = 'confetti-canvas';
        document.body.appendChild(canvas);
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.display = 'block';

      const colors = ['#f59e0b', '#fbbf24', '#10b981', '#38bdf8', '#c084fc', '#f43f5e'];
      const particles = [];
      const particleCount = 65;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: canvas.width * 0.5 + (Math.random() - 0.5) * 260,
          y: canvas.height * 0.35,
          vx: (Math.random() - 0.5) * 14,
          vy: -Math.random() * 12 - 4,
          size: Math.random() * 8 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1
        });
      }

      let startTime = null;
      const duration = 2400;

      const render = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        if (elapsed > duration) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.style.display = 'none';
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const progress = elapsed / duration;

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.38;
          p.vx *= 0.98;
          p.rotation += p.rotationSpeed;
          p.opacity = Math.max(0, 1 - progress * 1.2);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        });

        requestAnimationFrame(render);
      };

      requestAnimationFrame(render);
    }

    recordAccomplishment() {
      try {
        const key = '3d_kuznya_stl_exports_count';
        const currentCount = parseInt(this.safeStorage?.getItem?.(key) || '0', 10);
        this.safeStorage?.setItem?.(key, String(currentCount + 1));

        const activeMission = this.missions?.getActiveMission?.();
        if (activeMission && activeMission.id) {
          const compKey = '3d_kuznya_completed_missions';
          let completed = JSON.parse(this.safeStorage?.getItem?.(compKey) || '[]');
          if (!Array.isArray(completed)) completed = [];
          if (!completed.includes(activeMission.id)) {
            completed.push(activeMission.id);
            this.safeStorage?.setItem?.(compKey, JSON.stringify(completed));
          }
        }
      } catch (err) {
        console.warn('Accomplishment storage error:', err);
      }
    }

    triggerCelebration(message = '🎉 STL-файл завантажено і готовий до друку!') {
      this.launchConfetti();
      this.recordAccomplishment();
      this.showToast(message, {
        duration: 6000,
        actionText: '📋 Паспорт друку',
        onAction: () => this.openPrintCardModal('V2')
      });
    }

    openCompareModal() {
      this.compare.openCompareModal(this._domCache);
      window.ModalFocus.enter(this._domCache.compareModal);
    }

    renderComparison() {
      this.compare.renderComparison(
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
      window.ModalFocus.leave(this._domCache.compareModal);
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
      window.ModalFocus.enter(this._domCache.printCardModal);
    }

    closePrintCardModal() {
      this.passport.closeModal(this._domCache);
      window.ModalFocus.leave(this._domCache.printCardModal);
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

    startMission(missionId, skipUndo = false) {
      const m = window.StudioContentRegistry.resolveMission(missionId);
      if (!m) return;
      if (!skipUndo) this.recordUndoSnapshot();
      this._isRestoring = true;
      try {
        this.missions.setMission(m.id, true);
      } finally {
        this._isRestoring = false;
      }
      const dom = this._domCache || {};
      const cfg = m.config || {};
      const c = cfg.controls || {};
      const designKey = { mob: 'mobDesign', illusion: 'ilDesign', physics: 'phDesign' }[cfg.tab];
      if (designKey && dom[designKey]) dom[designKey].value = c[designKey] || 'classic';
      // The mission configuration is the sole adapter input for all four families.
      Object.keys(c).forEach(key => {
        const control = dom[key];
        if (!control) return;
        if (control.type === 'checkbox') control.checked = c[key];
        else control.value = c[key];
      });
      if (dom.phSubmode) {
        const balance = dom.phSubmode.value === 'balancer';
        if (dom.phSpringGroup) dom.phSpringGroup.style.display = balance ? 'none' : 'block';
        if (dom.phWeightGroup) dom.phWeightGroup.style.display = balance ? 'block' : 'none';
        if (dom.btnPhysicsDemo) dom.btnPhysicsDemo.textContent = balance ? '👆 Перевірити баланс' : '🚀 Запустити';
      }

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
      if (m.modelKey) this.setMonochromeMode(true);
      this.markModelModified();
      this.rebuildCurrentModel(true, true);
      this.sceneManager.fitModelView();
      this.autosave();
    }

    bindModelCatalog() {
      const models = window.StudioContentRegistry.listModels();
      ['mobDesign', 'ilDesign', 'phDesign'].forEach(key => {
        const control = this._domCache[key];
        if (!control) return;
        const seen = new Set(['classic']);
        models.forEach(m => {
          const value = m.config.controls && m.config.controls[key];
          if (!value || seen.has(value)) return;
          seen.add(value);
          const option = document.createElement('option');
          option.value = value;
          option.textContent = m.title;
          control.appendChild(option);
        });
        control.addEventListener('change', () => {
          this.history.recordSnapshot(this._designSelectionState || this.serializeState());
          const selected = models.find(m => m.config.controls && m.config.controls[key] === control.value);
          if (selected) {
            this.startMission(selected.id, true);
            this._designSelectionState = this.serializeState();
            return;
          }
          this.markModelModified();
          this.rebuildCurrentModel(true, true);
          this.sceneManager.fitModelView();
          this.autosave();
          this._designSelectionState = this.serializeState();
        });
        control.addEventListener('focus', () => { this._designSelectionState = this.serializeState(); });
      });
      const search = document.getElementById('model-search');
      const theme = document.getElementById('model-theme');
      if (theme) Array.from(new Set(models.map(m => m.theme))).forEach(value => {
        const option = document.createElement('option');
        option.value = value; option.textContent = value; theme.appendChild(option);
      });
      const render = () => {
        this.missions.catalogQuery = search ? search.value : '';
        this.missions.catalogTheme = theme ? theme.value : '';
        this.missions.renderMissionsModal(this._domCache, id => this.startMission(id));
      };
      search?.addEventListener('input', render);
      theme?.addEventListener('change', render);
      document.getElementById('btn-physics-reset')?.addEventListener('click', () => {
        this.physicsGen.resetInteractiveDemo(this.sceneManager);
      });
    }

    onMissionSelected(m) {
      this.missions.updateActiveMissionUI(this._domCache);
      this.missions.renderMissionsModal(this._domCache, (id) => this.startMission(id));
      this.autosave();
    }

    openMissionsModal() {
      const dom = this._domCache || {};
      if (!dom.missionsModal) return;
      this.missions.renderMissionsModal(this._domCache, (id) => this.startMission(id));
      dom.missionsModal.style.display = 'flex';
      window.ModalFocus.enter(dom.missionsModal);
      const btnTop = document.getElementById('btn-open-missions');
      if (btnTop) btnTop.classList.add('active');
      if (window.StudioSound) window.StudioSound.playPop(540);
    }

    closeMissionsModal() {
      const dom = this._domCache || {};
      if (!dom.missionsModal) return;
      dom.missionsModal.style.display = 'none';
      window.ModalFocus.leave(dom.missionsModal);
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

    openAboutModal() {
      const dom = this._domCache || {};
      if (!dom.aboutModal) return;
      document.getElementById('top-dropdown-menu')?.classList.remove('show');
      const btnMenu = document.getElementById('btn-top-menu');
      if (btnMenu) {
        btnMenu.setAttribute('aria-expanded', 'false');
        btnMenu.classList.remove('active');
      }
      dom.aboutModal.style.display = 'flex';
      if (window.ModalFocus) window.ModalFocus.enter(dom.aboutModal);
      const btnTop = document.getElementById('btn-open-about');
      if (btnTop) btnTop.classList.add('active');
      if (window.StudioSound) window.StudioSound.playPop(520);
    }

    closeAboutModal() {
      const dom = this._domCache || {};
      if (!dom.aboutModal) return;
      dom.aboutModal.style.display = 'none';
      if (window.ModalFocus) window.ModalFocus.leave(dom.aboutModal);
      const btnTop = document.getElementById('btn-open-about');
      if (btnTop) btnTop.classList.remove('active');
      if (window.StudioSound) window.StudioSound.playPop(340);
    }

    toggleAboutModal() {
      const dom = this._domCache || {};
      if (dom.aboutModal && dom.aboutModal.style.display === 'flex') {
        this.closeAboutModal();
      } else {
        this.openAboutModal();
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

      // Гарячі клавіші (Undo, Redo, Save, Escape, Ортографія)
      window.addEventListener('keydown', (e) => {
        window.ModalFocus.handleKey(e);
        const editing = e.target?.closest?.('input, textarea, select, [contenteditable="true"]');
        if (editing && e.key !== 'Escape') return;
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
          if (e.defaultPrevented) return;
          const open = (m) => m && m.style.display !== 'none' && m.style.display !== '';
          const modals = [
            [dom.aboutModal, () => this.closeAboutModal()],
            [dom.missionsModal, () => this.closeMissionsModal()],
            [dom.compareModal, () => this.closeCompareModal()],
            [dom.printCardModal, () => this.closePrintCardModal()]
          ].filter(([m]) => open(m));
          const top = modals.find(([m]) => window.ModalFocus.isTopmost(m)) || modals[modals.length - 1];
          if (top) top[1]();
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
          window.StudioSound?.playPop?.(act ? 620 : 380);
          this.autosave();
        });
      }
      if (dom.monoColorPicker) {
        dom.monoColorPicker.addEventListener('input', (e) => {
          const hex = parseInt(e.target.value.slice(1), 16);
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
            this.loadProjectFromFile(file, inputLoad);
            inputLoad.value = '';
          }
        });
      }

      if (dom.btnMyPiece) dom.btnMyPiece.addEventListener('click', () => this.openCompareModal());

      const btnToggleSlicer = document.getElementById('btn-toggle-slicer-notes');
      const slicerPanel = document.getElementById('slicer-notes-panel');
      if (btnToggleSlicer && slicerPanel) {
        btnToggleSlicer.addEventListener('click', () => {
          const isHidden = slicerPanel.style.display === 'none' || !slicerPanel.style.display;
          slicerPanel.style.display = isHidden ? 'flex' : 'none';
          btnToggleSlicer.textContent = isHidden ? '🧾 Нотатки друку ▴' : '🧾 Нотатки друку ▾';
          btnToggleSlicer.classList.toggle('active', isHidden);
          window.StudioSound?.playPop?.(isHidden ? 520 : 360);
        });
      }

      // Керування випадними меню шапки: «Опції» і «Друк» (одночасно відкрите лише одне)
      const dropdowns = [
        [document.getElementById('btn-top-menu'), document.getElementById('top-dropdown-menu')],
        [document.getElementById('btn-print-menu'), document.getElementById('print-dropdown-menu')]
      ].filter(([btn, menu]) => btn && menu);
      const setDropdown = (btn, menu, isOpen) => {
        if (isOpen) {
          dropdowns.forEach(([otherBtn, otherMenu]) => {
            if (otherMenu !== menu) {
              otherMenu.classList.remove('show');
              otherBtn.setAttribute('aria-expanded', 'false');
              otherBtn.classList.remove('active');
            }
          });
        }
        menu.classList.toggle('show', isOpen);
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        btn.classList.toggle('active', isOpen);
        if (isOpen && window.StudioSound) window.StudioSound.playPop?.(480);
      };
      dropdowns.forEach(([btn, menu]) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          setDropdown(btn, menu, !menu.classList.contains('show'));
        });
        document.addEventListener('click', (e) => {
          if (menu.classList.contains('show') && !menu.contains(e.target) && e.target !== btn) {
            setDropdown(btn, menu, false);
          }
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && menu.classList.contains('show')) {
            setDropdown(btn, menu, false);
            btn.focus();
          }
        });
      });

      const btnSound = document.getElementById('btn-toggle-sound');
      const btnMusic = document.getElementById('btn-toggle-music');
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          if (window.StudioSound) {
            window.StudioSound.toggleSound();
            this._syncAudioButtons();
          }
        });
      }

      if (btnMusic) {
        btnMusic.addEventListener('click', () => {
          if (window.StudioSound) {
            window.StudioSound.toggleMusic();
            this._syncAudioButtons();
          }
        });
      }
      window.addEventListener('studio-sound-change', () => this._syncAudioButtons());
      this._syncAudioButtons();
      window.addEventListener('beforeunload', () => this.flushAutosave());
      window.addEventListener('pagehide', () => this.flushAutosave());

      const btnRandom = document.getElementById('btn-random-wow');
      if (btnRandom) {
        btnRandom.addEventListener('click', () => {
          this.recordUndoSnapshot();
          this.randomizeCurrentTab();
          this.markModelModified();
          this.autosave();
          if (menuDropdown) {
            menuDropdown.classList.remove('show');
            btnMenu?.setAttribute('aria-expanded', 'false');
            btnMenu?.classList.remove('active');
          }
        });
      }

      if (dom.autosaveTag) {
        dom.autosaveTag.addEventListener('click', () => {
          this._autosaveNow();
          this.showToast(`💾 ${dom.autosaveTag.title || 'Проєкт збережено у пам\'яті браузера'}`);
          window.StudioSound?.playPop?.(520);
        });
      }

      const btnSim = document.getElementById('btn-simulate-print');
      if (btnSim) {
        btnSim.addEventListener('click', () => {
          const active = this.sceneManager.startSlicerSimulation();
          if (active) {
            this._setButtonLabel(btnSim, '⏹️', 'Стоп');
            if (window.StudioSound) window.StudioSound.playSimStart();
          } else {
            this._setButtonLabel(btnSim, '🔥', 'Симуляція');
          }
        });
      }

      const btnExport = document.getElementById('btn-export-stl');
      if (btnExport) {
        btnExport.addEventListener('click', () => {
          const fname = this.getSuggestedFilename();
          const ok = this.sceneManager.exportBinarySTL(fname);
          if (ok === false) {
            this.showToast('⚠️ Не вдалося зберегти STL.');
            return;
          }
          this.triggerCelebration('🎉 Ура! Твій STL-файл завантажено і готовий до друку!');
        });
      }

      // Керування модальним вікном порівняння V1 ↔ V2
      if (dom.btnCloseCompare) dom.btnCloseCompare.addEventListener('click', () => this.closeCompareModal());
      if (dom.btnReSnapshotV1) dom.btnReSnapshotV1.addEventListener('click', () => this.captureV1Snapshot());
      if (dom.btnRunCompare) dom.btnRunCompare.addEventListener('click', () => this.renderComparison());
      if (dom.btnCompareToPassport) {
        // Паспорт відкривається поверх «Мій виріб»; ModalFocus повертає фокус при закритті
        dom.btnCompareToPassport.addEventListener('click', () => this.openPrintCardModal('V2'));
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
      const btnCloseModal = document.getElementById('btn-close-missions');
      const btnToggleBody = document.getElementById('btn-toggle-mission-body');
      const btnCloseCard = document.getElementById('btn-close-active-mission');
      const btnPrev = document.getElementById('btn-prev-mission');
      const btnNext = document.getElementById('btn-next-mission');
      const btnStartActive = document.getElementById('btn-start-active-mission');

      if (btnOpenTop) btnOpenTop.addEventListener('click', () => this.toggleMissionsModal());
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

      document.querySelectorAll('#btn-open-about, .btn-about, .about-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => this.toggleAboutModal());
      });
      const btnCloseAbout = document.getElementById('btn-close-about');
      if (btnCloseAbout) btnCloseAbout.addEventListener('click', () => this.closeAboutModal());
      if (dom.aboutModal) {
        dom.aboutModal.addEventListener('click', (e) => {
          if (e.target === dom.aboutModal) this.closeAboutModal();
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
          this.recordUndoSnapshot();
          this.missions.prevMission();
          if (window.StudioSound) window.StudioSound.playPop(420);
        });
      }

      if (btnNext) {
        btnNext.addEventListener('click', () => {
          this.recordUndoSnapshot();
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
            const isActive = b.getAttribute('data-mission-filter') === cat;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
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
            this.recordUndoSnapshot();
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
      if (dom.btnToggleHud && dom.viewportHudTop) {
        dom.btnToggleHud.addEventListener('click', () => {
          const isCollapsed = dom.viewportHudTop.classList.toggle('hud-collapsed');
          dom.btnToggleHud.textContent = isCollapsed ? '👁️ Показати інфо' : '👁️ Інфо';
          if (window.StudioSound) window.StudioSound.playPop(420);
        });
      }
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
      document.getElementById('btn-fit-model')?.addEventListener('click', () => this.sceneManager?.fitModelView());
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
      btn.textContent = isOrtho ? '📐 Орто: УВІМК' : '📐 Орто';
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
          const hadPixels = Boolean(
            this.mcGen?.grid && this.mcGen.grid.some(row => row.some(v => v > 0))
          );
          this.mcGen.clearGrid();
          if (hadPixels) {
            this.showToast('🧽 Полотно очищено', {
              duration: 5000,
              actionText: '↩️ Скасувати',
              onAction: () => this.undo()
            });
          }
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
            this._scheduleRebuild(false);
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
        }
      });
    }

    bindIllusionControls() {
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
          if (dom.ilDesign) dom.ilDesign.value = 'classic';
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
            this._scheduleRebuild(false);
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
            this._scheduleRebuild(false);
          }
        });
      });

      ['il-voxel-size', 'il-safe-supports', 'il-layout-mode', 'il-color-primary'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('focus', () => this.recordUndoSnapshot());
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          const handleUpdate = () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this._scheduleRebuild(false);
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
        }
      });
    }

    bindPhysicsControls() {
      const subSelect = document.getElementById('ph-submode');
      if (subSelect) {
        subSelect.addEventListener('focus', () => this.recordUndoSnapshot());
        subSelect.addEventListener('mousedown', () => this.recordUndoSnapshot());
        subSelect.addEventListener('change', () => {
          if (this._domCache.phDesign) this._domCache.phDesign.value = 'classic';
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
          el.addEventListener('focus', () => this.recordUndoSnapshot());
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          const handleUpdate = () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this._scheduleRebuild(false);
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
        }
      });

      const demoBtn = document.getElementById('btn-physics-demo');
      if (demoBtn) {
        demoBtn.addEventListener('click', () => {
          const sub = (this._domCache?.phSubmode || document.getElementById('ph-submode'))?.value || 'catapult';
          this.physicsGen.triggerInteractiveDemo(this.sceneManager, sub, {
            design: this._domCache.phDesign?.value || 'classic',
            armLength: this._domCache.phArmLength?.value,
            wingWeight: this._domCache.phWingWeight?.value
          });
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
          el.addEventListener('focus', () => this.recordUndoSnapshot());
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          const handleUpdate = () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            const isArch = id === 'mob-archetype';
            if (isArch && this._domCache.mobDesign) this._domCache.mobDesign.value = 'classic';
            this.markModelModified();
            this._scheduleRebuild(isArch, true);
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
        }
      });
    }

    bindHeightmapControls() {
      const dom = this._domCache || {};

      // Швидкі дитячі пресети
      document.querySelectorAll('[data-hm-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const preset = btn.getAttribute('data-hm-preset');
          if (!preset) return;
          this.recordUndoSnapshot();
          document.querySelectorAll('[data-hm-preset]').forEach((b) => {
            b.classList.toggle('active', b === btn);
          });
          this.heightmapGen.loadPreset(preset, () => {
            this.updateHeightmapPreview2D();
            this.markModelModified();
            this.rebuildCurrentModel(true, true);
            this.autosave();
            if (window.StudioSound) window.StudioSound.playPop(520);
          });
        });
      });

      // Зона вибору файлу та Drag & Drop
      if (dom.hmDropzone && dom.hmFileInput) {
        dom.hmDropzone.addEventListener('click', () => dom.hmFileInput.click());
        dom.hmDropzone.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dom.hmFileInput.click();
          }
        });

        const handleImageFile = (file) => {
          if (!file || !file.type.startsWith('image/')) return;
          if (file.type === 'image/svg+xml') { this.showToast('⚠️ SVG не підтримується. Оберіть PNG або JPG.'); return; }
          if (file.size > 8 * 1024 * 1024) { this.showToast('⚠️ Зображення завелике (максимум 8 МБ).'); return; }
          const reader = new FileReader();
          reader.onerror = () => this.showToast('⚠️ Не вдалося прочитати зображення.');
          reader.onload = (e) => {
            const rawUrl = e.target.result;
            const img = new Image();
            img.onerror = () => this.showToast('⚠️ Не вдалося відкрити зображення.');
            img.onload = () => {
              const maxDim = 256;
              let w = img.width;
              let h = img.height;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = Math.round((h * maxDim) / w);
                  w = maxDim;
                } else {
                  w = Math.round((w * maxDim) / h);
                  h = maxDim;
                }
              }
              const offCanvas = document.createElement('canvas');
              offCanvas.width = w;
              offCanvas.height = h;
              const offCtx = offCanvas.getContext('2d');
              offCtx.drawImage(img, 0, 0, w, h);
              const compactUrl = offCanvas.toDataURL('image/jpeg', 0.88);

              this.recordUndoSnapshot();
              document.querySelectorAll('[data-hm-preset]').forEach((b) => b.classList.remove('active'));
              this.heightmapGen.loadCustomImage(compactUrl, () => {
                this.updateHeightmapPreview2D();
                this.markModelModified();
                this.rebuildCurrentModel(true, true);
                this.autosave();
                if (window.StudioSound) window.StudioSound.playMagicGenerate();
              });
            };
            img.src = rawUrl;
          };
          reader.readAsDataURL(file);
        };

        dom.hmFileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0]);
          }
        });

        dom.hmDropzone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dom.hmDropzone.classList.add('dragover');
        });
        dom.hmDropzone.addEventListener('dragleave', () => {
          dom.hmDropzone.classList.remove('dragover');
        });
        dom.hmDropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dom.hmDropzone.classList.remove('dragover');
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0]);
          }
        });
      }

      // Слухачі налаштувань
      const ids = [
        'hm-invert', 'hm-auto-levels', 'hm-contrast', 'hm-brightness', 'hm-gamma', 'hm-smooth',
        'hm-width', 'hm-relief-height', 'hm-base-thickness',
        'hm-shape', 'hm-resolution', 'hm-frame', 'hm-keychain'
      ];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('focus', () => this.recordUndoSnapshot());
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          const handleUpdate = () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.updateHeightmapPreview2D();
            this.markModelModified();
            this._scheduleRebuild(false, true);
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
        }
      });
    }

    updateHeightmapPreview2D() {
      const dom = this._domCache || {};
      if (!dom.hmPreviewCanvas || !this.heightmapGen) return;
      this.heightmapGen.render2DPreview(dom.hmPreviewCanvas, {
        invert: dom.hmInvert?.checked,
        autoLevels: dom.hmAutoLevels ? dom.hmAutoLevels.checked : true,
        contrast: dom.hmContrast?.value,
        brightness: dom.hmBrightness?.value,
        gamma: dom.hmGamma?.value,
        smooth: dom.hmSmooth?.value
      });
    }

    updateHeightmapMeshValidation(group) {
      const dom = this._domCache || {};
      if (!dom.hmGeomCheck) return;
      if (!window.MeshValidator || !group) {
        dom.hmGeomCheck.className = 'connectivity-pill bridged';
        dom.hmGeomCheck.textContent = '🛡️ Модель сформовано';
        return;
      }

      const res = window.MeshValidator.analyze(group);
      if (res.ok) {
        dom.hmGeomCheck.className = 'connectivity-pill';
        dom.hmGeomCheck.textContent = `🛡️ Монолітна суцільна оболонка (${res.triangles} поліг.) ✅`;
        dom.hmGeomCheck.title = 'Модель замкнена, не має дірок і повністю готова до слайсера (Cura / PrusaSlicer)';
      } else {
        dom.hmGeomCheck.className = 'connectivity-pill warn';
        if (!res.isWatertight) {
          dom.hmGeomCheck.textContent = `⚠️ Незамкнена оболонка (дірки: ${res.boundaryEdges})`;
        } else if (!res.hasConsistentNormals) {
          dom.hmGeomCheck.textContent = `⚠️ Вивернуті грані (${res.flippedEdges})`;
        } else {
          dom.hmGeomCheck.textContent = '⚠️ Потребує перевірки';
        }
      }
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
        window.StudioSound.playPop?.(el.checked ? 620 : 380);
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

      if (dom.valHmContrast && dom.hmContrast) {
        dom.valHmContrast.textContent = Number(dom.hmContrast.value).toFixed(1) + 'x';
      }
      if (dom.valHmBrightness && dom.hmBrightness) {
        dom.valHmBrightness.textContent = dom.hmBrightness.value;
      }
      if (dom.valHmGamma && dom.hmGamma) {
        dom.valHmGamma.textContent = Number(dom.hmGamma.value).toFixed(1);
      }
      if (dom.valHmSmooth && dom.hmSmooth) {
        dom.valHmSmooth.textContent = dom.hmSmooth.value === '0' ? 'Вимк' : dom.hmSmooth.value + ' px';
      }
      if (dom.valHmWidth && dom.hmWidth) {
        dom.valHmWidth.textContent = dom.hmWidth.value + ' мм';
      }
      if (dom.valHmReliefHeight && dom.hmReliefHeight) {
        dom.valHmReliefHeight.textContent = Number(dom.hmReliefHeight.value).toFixed(1) + ' мм';
      }
      if (dom.valHmBaseThickness && dom.hmBaseThickness) {
        dom.valHmBaseThickness.textContent = Number(dom.hmBaseThickness.value).toFixed(1) + ' мм';
      }

      if (dom.mcSlotWidth && dom.valMcSlot) {
        dom.valMcSlot.textContent = dom.mcSlotWidth.value + ' мм';
      }
      if (dom.mcSlotWidthGroup) {
        const isStandOrCalib = this.mcGen?.currentPresetKey === 'cardboard_stand' ||
                              this.mcGen?.currentPresetKey === 'slot_calibrator' ||
                              dom.mcMountType?.value === 'cardboard_stand';
        dom.mcSlotWidthGroup.style.display = isStandOrCalib ? 'flex' : 'none';
        const label = dom.mcSlotWidthGroup.querySelector('.control-label span');
        if (label) label.textContent = this.mcGen?.currentPresetKey === 'slot_calibrator'
          ? 'Позначити паз калібратора для порівняння:' : 'Номінальна товщина картону:';
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
        return;
      }

      if (this.activeTab === 'heightmap') {
        const presets = ['cat', 'rocket', 'star', 'coin', 'smiley', 'dino'];
        const pick = presets[Math.floor(Math.random() * presets.length)];
        document.querySelectorAll('[data-hm-preset]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-hm-preset') === pick);
        });
        if (dom.hmShape) dom.hmShape.value = Math.random() > 0.5 ? 'circle' : 'rect';
        if (dom.hmInvert) dom.hmInvert.checked = Math.random() > 0.6;
        this.heightmapGen.loadPreset(pick, () => {
          this.updateValueLabels();
          this.updateHeightmapPreview2D();
          this.rebuildCurrentModel(true, true);
        });
        return;
      }
    }

    rebuildCurrentModel(animatePop = false, skipSound = false) {
      this.syncCustomDesignControls();
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
          design: dom.ilDesign?.value || 'classic',
          word1: dom.ilWord1?.value,
          word2: dom.ilWord2?.value,
          voxelSize: dom.ilVoxelSize?.value,
          safeSupports: dom.ilSafeSupports?.checked,
          layoutMode: dom.ilLayoutMode?.value,
          colorPrimary: parseInt(colorHex.slice(1), 16)
        });
      } else if (this.activeTab === 'physics') {
        group = this.physicsGen.build3D({
          design: dom.phDesign?.value || 'classic',
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
          design: dom.mobDesign?.value || 'classic',
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
      } else if (this.activeTab === 'heightmap') {
        group = this.heightmapGen.build3D({
          invert: dom.hmInvert ? dom.hmInvert.checked : false,
          autoLevels: dom.hmAutoLevels ? dom.hmAutoLevels.checked : true,
          contrast: dom.hmContrast?.value || '1',
          brightness: dom.hmBrightness?.value || '0',
          gamma: dom.hmGamma?.value || '1',
          smooth: dom.hmSmooth?.value || '0',
          width: dom.hmWidth?.value || '60',
          reliefHeight: dom.hmReliefHeight?.value || '3.5',
          baseThickness: dom.hmBaseThickness?.value || '2',
          shape: dom.hmShape?.value || 'rect',
          resolution: dom.hmResolution?.value || '128',
          frame: dom.hmFrame ? dom.hmFrame.checked : true,
          keychain: dom.hmKeychain ? dom.hmKeychain.checked : false
        });
        this.updateHeightmapPreview2D();
        if (this._rebuildFromInput) {
          this._pendingHmGroup = group;
          clearTimeout(this._hmValidateTimer);
          this._hmValidateTimer = setTimeout(() => {
            if (this._pendingHmGroup) this.updateHeightmapMeshValidation(this._pendingHmGroup);
            this._pendingHmGroup = null;
          }, 300);
        } else {
          this.updateHeightmapMeshValidation(group);
        }
      }

      if (group) {
        this.sceneManager.setModel(group, animatePop);
      }
    }

    syncCustomDesignControls() {
      const dom = this._domCache || {};
      const customOptical = (dom.ilDesign?.value || 'classic') !== 'classic';
      const wordCard = dom.ilWord1?.closest('.card');
      if (wordCard) wordCard.hidden = customOptical;
      const opticalSupports = dom.ilSafeSupports?.closest('label');
      if (opticalSupports) opticalSupports.hidden = customOptical;
      document.querySelectorAll('#illusion-camera-bar [data-camera-view]').forEach(button => {
        const first = button.dataset.cameraView === 'front';
        button.textContent = customOptical
          ? (first ? '👁️ Відкрити силует 1 (0°)' : '🔄 Відкрити силует 2 (90°)')
          : (first ? '👁️ Показати СЛОВО 1 (0°)' : '🔄 Показати СЛОВО 2 (90°)');
      });
      const customMob = (dom.mobDesign?.value || 'classic') !== 'classic';
      ['mobHeadgear', 'mobBackgear', 'mobWeapon', 'mobName'].forEach(key => {
        const row = dom[key]?.closest('.control-row');
        if (row) row.hidden = customMob;
      });
      if (dom.mobArchetype) dom.mobArchetype.disabled = customMob;
      const physicsDesign = dom.phDesign?.value || 'classic';
      const bridge = physicsDesign === 'truss_bridge' || physicsDesign === 'arch_bridge';
      const balance = dom.phSubmode?.value === 'balancer';
      const classicLauncher = physicsDesign === 'classic' && !balance;
      const visiblePhysics = {
        phExtrudeHeight: !bridge, phSpringThickness: classicLauncher,
        phWingWeight: balance, phCustomText: classicLauncher
      };
      Object.entries(visiblePhysics).forEach(([key, visible]) => {
        const row = dom[key]?.closest('.control-row');
        if (row) row.hidden = !visible;
      });
      const kit = dom.phIncludeAmmo?.closest('label');
      if (kit) kit.hidden = bridge;
      if (dom.phSubmode) dom.phSubmode.disabled = physicsDesign !== 'classic';
    }
  }

  window.StudioApp = StudioApp;

  window.addEventListener('DOMContentLoaded', () => {
    window.StudioApp = new StudioApp();
    window.StudioApp.init();
  });
})();
