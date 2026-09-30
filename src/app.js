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
      if (window.StudioSound) window.StudioSound.playPop(440);

      document.querySelectorAll('.gen-tab-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
      });

      document.querySelectorAll('.panel-section').forEach((sec) => {
        sec.classList.toggle('active', sec.id === `panel-${tabName}`);
      });

      // Оновлюємо контекстні кнопки внизу 3D-сцени
      const illusionCameraBar = document.getElementById('illusion-camera-bar');
      const physicsActionBar = document.getElementById('physics-action-bar');
      if (illusionCameraBar) illusionCameraBar.style.display = tabName === 'illusion' ? 'flex' : 'none';
      if (physicsActionBar) physicsActionBar.style.display = tabName === 'physics' ? 'flex' : 'none';

      // Підбираємо найкращий стартовий ракурс камери
      if (tabName === 'illusion') {
        this.sceneManager.setCameraView('front');
      } else {
        this.sceneManager.setCameraView('iso');
      }

      this.rebuildCurrentModel(true);
    }

    bindTopActions() {
      // Кнопка звуку
      const btnSound = document.getElementById('btn-toggle-sound');
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          const on = window.StudioSound.toggle();
          btnSound.textContent = on ? '🔊 Звук: ВКЛ' : '🔇 Звук: ВИКЛ';
          btnSound.classList.toggle('muted', !on);
        });
      }

      // Кнопка Симуляції 3D-Принтера
      const btnSim = document.getElementById('btn-simulate-print');
      if (btnSim) {
        btnSim.addEventListener('click', () => {
          const started = this.sceneManager.startSlicerSimulation();
          btnSim.innerHTML = started
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
      if (this.activeTab === 'minecraft') {
        const lbl = (document.getElementById('mc-custom-label')?.value || '').trim();
        return `minecraft_${this.mcGen.currentPresetKey}${lbl ? '_' + lbl : ''}.stl`;
      }
      if (this.activeTab === 'illusion') {
        const w1 = (document.getElementById('il-word1')?.value || 'WORD1').trim();
        const w2 = (document.getElementById('il-word2')?.value || 'WORD2').trim();
        return `illusion_${w1}_${w2}.stl`;
      }
      if (this.activeTab === 'physics') {
        const sub = document.getElementById('ph-submode')?.value || 'catapult';
        return `physics_${sub}_print_safe.stl`;
      }
      if (this.activeTab === 'mob') {
        const arch = document.getElementById('mob-archetype')?.value || 'boss';
        const name = (document.getElementById('mob-name')?.value || '').trim();
        return `mob_${arch}${name ? '_' + name : ''}.stl`;
      }
      return '3d_kuznya_model.stl';
    }

    // -------------------------------------------------------------------------
    // 1. КОНТРОЛЕРИ МАЙНКРАФТ-КУЗНІ
    // -------------------------------------------------------------------------
    bindMinecraftControls() {
      // Пресети
      document.querySelectorAll('[data-mc-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-mc-preset]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const key = btn.getAttribute('data-mc-preset');
          if (window.StudioSound) window.StudioSound.playMagicGenerate();
          this.mcGen.loadPreset(key, true);
        });
      });

      // Вибір пензля (рівня висоти 1..4 або Гумки 0)
      document.querySelectorAll('[data-mc-brush]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-mc-brush]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.mcGen.activeBrush = parseInt(btn.getAttribute('data-mc-brush'), 10);
          if (window.StudioSound) window.StudioSound.playPop(350 + this.mcGen.activeBrush * 60);
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
          inp.addEventListener('input', () => this.rebuildCurrentModel(false));
        }
      });

      document.querySelectorAll('[data-insert-sym]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sym = btn.getAttribute('data-insert-sym');
          if (lastFocusedInput && lastFocusedInput.value.length < 9) {
            lastFocusedInput.value += sym;
            if (window.StudioSound) window.StudioSound.playPop(520);
            this.rebuildCurrentModel(false);
          }
        });
      });

      ['il-voxel-size', 'il-safe-supports', 'il-layout-mode', 'il-color-primary'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', () => {
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
          const fireBtn = document.getElementById('btn-physics-demo');
          if (fireBtn) {
            fireBtn.innerHTML = isBalancer
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
            this.updateValueLabels();
            this.rebuildCurrentModel(false);
          });
        }
      });

      const demoBtn = document.getElementById('btn-physics-demo');
      if (demoBtn) {
        demoBtn.addEventListener('click', () => {
          const sub = document.getElementById('ph-submode')?.value || 'catapult';
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
            this.updateValueLabels();
            this.rebuildCurrentModel(id === 'mob-archetype');
          });
        }
      });
    }

    updateValueLabels() {
      const pairs = [
        ['mc-voxel-size', 'val-mc-voxel', ' мм'],
        ['mc-height-step', 'val-mc-step', ' мм'],
        ['il-voxel-size', 'val-il-voxel', ' мм'],
        ['ph-extrude-height', 'val-ph-height', ' мм'],
        ['ph-spring-thickness', 'val-ph-spring', ' мм'],
        ['ph-wing-weight', 'val-ph-weight', ' мм'],
        ['ph-arm-length', 'val-ph-arm', ' мм'],
        ['mob-head-scale', 'val-mob-head', 'x'],
        ['mob-body-bulk', 'val-mob-bulk', 'x']
      ];
      for (const [inputId, labelId, suffix] of pairs) {
        const inp = document.getElementById(inputId);
        const lbl = document.getElementById(labelId);
        if (inp && lbl) {
          lbl.textContent = inp.value + suffix;
        }
      }
    }

    // Випадкова генерація ("ВАУ-Мутація") залежно від відкритої вкладки
    randomizeCurrentTab() {
      if (window.StudioSound) window.StudioSound.playMagicGenerate();

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
        document.getElementById('il-word1').value = pick[0];
        document.getElementById('il-word2').value = pick[1];
        this.rebuildCurrentModel(true);
        return;
      }

      if (this.activeTab === 'physics') {
        const sub = document.getElementById('ph-submode');
        sub.value = sub.value === 'catapult' ? 'balancer' : 'catapult';
        sub.dispatchEvent(new Event('change'));
        return;
      }

      if (this.activeTab === 'mob') {
        const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        document.getElementById('mob-archetype').value = randPick(['creeper', 'golem', 'knight', 'dragon', 'cyborg']);
        document.getElementById('mob-eye-type').value = randPick(['one', 'two', 'three', 'visor', 'creeper']);
        document.getElementById('mob-headgear').value = randPick(['none', 'horns', 'crown', 'ears', 'antenna']);
        document.getElementById('mob-backgear').value = randPick(['none', 'wings', 'jetpack', 'cape']);
        document.getElementById('mob-weapon').value = randPick(['sword', 'hammer', 'shield', 'dual_axes']);
        document.getElementById('mob-head-scale').value = (0.85 + Math.random() * 0.55).toFixed(2);
        document.getElementById('mob-body-bulk').value = (0.85 + Math.random() * 0.45).toFixed(2);
        this.updateValueLabels();
        this.rebuildCurrentModel(true);
      }
    }

    // Головна функція побудови поточної 3D-моделі
    rebuildCurrentModel(animatePop = false) {
      if (animatePop && window.StudioSound) {
        window.StudioSound.playMagicGenerate();
      }

      let group = null;

      if (this.activeTab === 'minecraft') {
        group = this.mcGen.build3D({
          voxelSize: document.getElementById('mc-voxel-size')?.value,
          heightStep: document.getElementById('mc-height-step')?.value,
          solidBase: document.getElementById('mc-solid-base')?.checked,
          mountType: document.getElementById('mc-mount-type')?.value,
          customLabel: document.getElementById('mc-custom-label')?.value
        });
      } else if (this.activeTab === 'illusion') {
        const colorHex = document.getElementById('il-color-primary')?.value || '#10b981';
        group = this.illusionGen.build3D({
          word1: document.getElementById('il-word1')?.value,
          word2: document.getElementById('il-word2')?.value,
          voxelSize: document.getElementById('il-voxel-size')?.value,
          safeSupports: document.getElementById('il-safe-supports')?.checked,
          layoutMode: document.getElementById('il-layout-mode')?.value,
          colorPrimary: parseInt(colorHex.replace('#', '0x'), 16)
        });
      } else if (this.activeTab === 'physics') {
        group = this.physicsGen.build3D({
          submode: document.getElementById('ph-submode')?.value,
          extrudeHeight: document.getElementById('ph-extrude-height')?.value,
          springThickness: document.getElementById('ph-spring-thickness')?.value,
          wingWeight: document.getElementById('ph-wing-weight')?.value,
          armLength: document.getElementById('ph-arm-length')?.value,
          includeAmmo: document.getElementById('ph-include-ammo')?.checked,
          customText: document.getElementById('ph-custom-text')?.value
        });
      } else if (this.activeTab === 'mob') {
        group = this.mobGen.build3D({
          archetype: document.getElementById('mob-archetype')?.value,
          headScale: document.getElementById('mob-head-scale')?.value,
          bodyBulk: document.getElementById('mob-body-bulk')?.value,
          eyeType: document.getElementById('mob-eye-type')?.value,
          headgear: document.getElementById('mob-headgear')?.value,
          backGear: document.getElementById('mob-backgear')?.value,
          weapon: document.getElementById('mob-weapon')?.value,
          mobName: document.getElementById('mob-name')?.value,
          tinkercadBlank: document.getElementById('mob-tinkercad-blank')?.checked
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
