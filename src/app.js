// Головний контролер студії «3D Кузня Чудес»
(function () {
  class StudioApp {
    constructor() {
      this.activeTab = 'minecraft'; // 'minecraft', 'illusion', 'physics', 'mob'
      this.sceneManager = null;

      this.mcGen = new window.MinecraftForgeGenerator();
      this.illusionGen = new window.DualIllusionGenerator();
      this.physicsGen = new window.PhysicsMechanicsGenerator();
      this.mobGen = new window.MobMutatorGenerator();
    }

    init() {
      this.sceneManager = new window.SceneManager('viewport-container');
      this.sceneManager.init();

      this.bindTabs();
      this.bindTopActions();
      this.bindMinecraftControls();
      this.bindIllusionControls();
      this.bindPhysicsControls();
      this.bindMobControls();

      // Кешуємо DOM-елементи один раз після прив'язки контролів
      this._domCache = {
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

      // Рендеримо піксель-сітку Майнкрафт-Кузні та будуємо першу модель
      this.mcGen.renderCanvasUI();
      this.rebuildCurrentModel(true);
    }

    bindTabs() {
      const tabBtns = document.querySelectorAll('.gen-tab-btn');
      tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-tab');
          this.switchTab(tab);
        });
      });
    }

    switchTab(tabName) {
      this.activeTab = tabName;
      if (window.StudioSound) window.StudioSound.playTabSwitch(tabName);

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

      this.rebuildCurrentModel(true, true);
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

      const btnSound = document.getElementById('btn-toggle-sound');
      const btnMusic = document.getElementById('btn-toggle-music');

      // Кнопка звуку
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          const on = window.StudioSound.toggle();
          btnSound.textContent = on ? '🔊 Звук: ВКЛ' : '🔇 Звук: ВИКЛ';
          btnSound.classList.toggle('muted', !on);
          if (!on && btnMusic) {
            btnMusic.textContent = '🎵 Музика: ВИКЛ';
            btnMusic.classList.remove('playing');
          }
        });
      }

      // Кнопка веселої 8-бітної фонової музики кузні
      if (btnMusic) {
        btnMusic.addEventListener('click', () => {
          const playing = window.StudioSound.toggleMusic();
          btnMusic.textContent = playing ? '🎵 Музика: ВКЛ' : '🎵 Музика: ВИКЛ';
          btnMusic.classList.toggle('playing', playing);
          if (playing && btnSound) {
            btnSound.textContent = '🔊 Звук: ВКЛ';
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
            ? '⏹️ Зупинити Друк'
            : '🔥 Симуляція 3D-Принтера';
        });
      }

      // Кнопка "Випадковий ВАУ! / Мутація"
      const btnRandom = document.getElementById('btn-random-wow');
      if (btnRandom) {
        btnRandom.addEventListener('click', () => {
          this.randomizeCurrentTab();
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
        return `physics_${sub}_print_safe.stl`;
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
      // Пресети з фірмовими тематичними звуками (меч, кріпер, TNT, серце, дракон тощо)
      document.querySelectorAll('[data-mc-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-mc-preset]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const key = btn.getAttribute('data-mc-preset');
          if (window.StudioSound) window.StudioSound.playThemeSound(key);
          this.mcGen.loadPreset(key, false);
          this.rebuildCurrentModel(true, true);
        });
      });

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
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.rebuildCurrentModel(false);
          });
        }
      });
    }

    // -------------------------------------------------------------------------
    // 2. КОНТРОЛЕРИ ПОДВІЙНОЇ ОПТИЧНОЇ ІЛЮЗІЇ
    // -------------------------------------------------------------------------
    bindIllusionControls() {
      // Пресети слів
      document.querySelectorAll('[data-il-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const w1 = btn.getAttribute('data-w1');
          const w2 = btn.getAttribute('data-w2');
          document.getElementById('il-word1').value = w1;
          document.getElementById('il-word2').value = w2;
          this.rebuildCurrentModel(true);
        });
      });

      // Кнопки швидкої вставки спецсимволів Minecraft у активне поле
      let lastFocusedInput = document.getElementById('il-word2');
      ['il-word1', 'il-word2'].forEach((id) => {
        const inp = document.getElementById(id);
        if (inp) {
          inp.addEventListener('focus', () => { lastFocusedInput = inp; });
          inp.addEventListener('input', () => {
            this._playControlFeedback(inp);
            this.rebuildCurrentModel(false);
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
            lastFocusedInput.value += sym;
            if (window.StudioSound) {
              window.StudioSound.playThemeSound(symThemeMap[sym] || 'totem');
            }
            this.rebuildCurrentModel(false);
          }
        });
      });

      ['il-voxel-size', 'il-safe-supports', 'il-layout-mode', 'il-color-primary'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.rebuildCurrentModel(false);
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
          this.rebuildCurrentModel(true);
        });
      }

      ['ph-extrude-height', 'ph-spring-thickness', 'ph-wing-weight', 'ph-arm-length', 'ph-include-ammo', 'ph-custom-text'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.rebuildCurrentModel(false);
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
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            const isArch = id === 'mob-archetype';
            this.rebuildCurrentModel(isArch, true);
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
          ['МАЙН!', 'КРАФТ'],
          ['КРІПЕР', '⚔💀⛏♥👑★'],
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
