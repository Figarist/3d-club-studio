// Веселий процедурний звуковий рушій та чіптюн-синтезатор студії «3D Кузня Чудес» (Web Audio API)
// Працює 100% офлайн без зовнішніх MP3-файлів та інтернету!
(function () {
  // C-мажорна та G-мажорна пентатоніка (у Гц) для музичного малювання по сітці 16×16
  const PENTATONIC_SCALE = [
    196.00, 220.00, 261.63, 293.66, 329.63, 392.00,
    440.00, 523.25, 587.33, 659.25, 783.99, 880.00,
    1046.50, 1174.66, 1318.51
  ];

  // Весела мелодія для крокових двигунів 3D-принтера під час симуляції друку
  const PRINTER_MELODY = [
    523.25, 659.25, 783.99, 659.25,
    587.33, 698.46, 880.00, 698.46,
    523.25, 659.25, 783.99, 1046.50,
    987.77, 783.99, 880.00, 783.99,
    659.25, 523.25, 587.33, 659.25,
    698.46, 783.99, 880.00, 987.77,
    1046.50, 783.99, 659.25, 523.25
  ];

  // Ноти для фонової чіптюн-музики «Кузня Пригод» (частоти у Гц, 0 = пауза)
  const BG_MELODY_STEPS = [
    // Такт 1 (C major)
    { lead: 523.25, bass: 130.81, arp: 329.63 },
    { lead: 0,      bass: 0,      arp: 392.00 },
    { lead: 659.25, bass: 196.00, arp: 523.25 },
    { lead: 783.99, bass: 0,      arp: 392.00 },
    { lead: 659.25, bass: 130.81, arp: 329.63 },
    { lead: 523.25, bass: 0,      arp: 392.00 },
    { lead: 587.33, bass: 196.00, arp: 440.00 },
    { lead: 0,      bass: 0,      arp: 392.00 },
    // Такт 2 (F -> G)
    { lead: 698.46, bass: 174.61, arp: 349.23 },
    { lead: 0,      bass: 0,      arp: 440.00 },
    { lead: 880.00, bass: 130.81, arp: 523.25 },
    { lead: 783.99, bass: 0,      arp: 440.00 },
    { lead: 659.25, bass: 196.00, arp: 392.00 },
    { lead: 587.33, bass: 0,      arp: 493.88 },
    { lead: 783.99, bass: 146.83, arp: 587.33 },
    { lead: 0,      bass: 0,      arp: 493.88 },
    // Такт 3 (Am -> Em)
    { lead: 880.00, bass: 220.00, arp: 440.00 },
    { lead: 0,      bass: 0,      arp: 523.25 },
    { lead: 1046.50,bass: 164.81, arp: 659.25 },
    { lead: 880.00, bass: 0,      arp: 523.25 },
    { lead: 783.99, bass: 164.81, arp: 392.00 },
    { lead: 659.25, bass: 0,      arp: 493.88 },
    { lead: 523.25, bass: 196.00, arp: 392.00 },
    { lead: 0,      bass: 0,      arp: 329.63 },
    // Такт 4 (F -> G -> C)
    { lead: 587.33, bass: 174.61, arp: 349.23 },
    { lead: 659.25, bass: 0,      arp: 440.00 },
    { lead: 698.46, bass: 196.00, arp: 493.88 },
    { lead: 783.99, bass: 0,      arp: 587.33 },
    { lead: 1046.50,bass: 130.81, arp: 523.25 },
    { lead: 0,      bass: 196.00, arp: 659.25 },
    { lead: 783.99, bass: 130.81, arp: 523.25 },
    { lead: 0,      bass: 0,      arp: 392.00 }
  ];

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.compressor = null;
      this.noiseBuffer = null;

      this.enabled = true;
      this.musicEnabled = false;
      this._boundInit = false;

      this._printerStepIndex = 0;
      this._lastSliderSoundTime = 0;
      this._musicTimer = null;
      this._musicStepIndex = 0;
    }

    init() {
      if (!this._boundInit) {
        this._boundInit = true;
        // Гарантуємо, що AudioContext створюється тільки після першої взаємодії користувача
        const initOnInteraction = () => {
          this._ensureContext();
          ['click', 'keydown', 'touchstart'].forEach((evt) => {
            document.removeEventListener(evt, initOnInteraction, true);
          });
        };
        ['click', 'keydown', 'touchstart'].forEach((evt) => {
          document.addEventListener(evt, initOnInteraction, { once: true, capture: true });
        });
      }
      this._ensureContext();
    }

    _ensureContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
          this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
          this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
          this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
          this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

          this.masterGain.connect(this.compressor);
          this.compressor.connect(this.ctx.destination);

          this._buildNoiseBuffer();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    _out() {
      return this.masterGain || (this.ctx && this.ctx.destination);
    }

    // Створює буфер білого шуму для звуків шипіння кріпера, фітіля TNT, вітру та ударів
    _buildNoiseBuffer() {
      if (!this.ctx) return;
      const sampleRate = this.ctx.sampleRate;
      const length = sampleRate * 1.0; // 1 секунда шуму
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }

    // Допоміжна функція для швидкого запуску осцилятора з огинаючою гучності та частоти
    _tone({
      type = 'triangle',
      freq = 440,
      endFreq = null,
      midFreq = null,
      midTime = 0.05,
      startTime = 0,
      duration = 0.1,
      gain = 0.15,
      attack = 0.005
    }) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + startTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;

      osc.frequency.setValueAtTime(Math.max(20, freq), now);
      if (midFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, midFreq), now + midTime);
      }
      if (endFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(gain, now + Math.min(attack, duration * 0.4));
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(g);
      g.connect(this._out());
      osc.start(now);
      osc.stop(now + duration + 0.01);
    }

    // Допоміжна функція для фільтрованого шумового імпульсу (вибух, шипіння, вжух, удар молота)
    _noise({
      filterType = 'bandpass',
      freq = 1200,
      endFreq = null,
      q = 2.0,
      startTime = 0,
      duration = 0.15,
      gain = 0.12,
      attack = 0.005
    }) {
      if (!this.ctx || !this.noiseBuffer) return;
      const now = this.ctx.currentTime + startTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = filterType;
      filter.Q.setValueAtTime(q, now);
      filter.frequency.setValueAtTime(Math.max(40, freq), now);
      if (endFreq !== null) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
      }

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(gain, now + Math.min(attack, duration * 0.3));
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      src.connect(filter);
      filter.connect(g);
      g.connect(this._out());
      src.start(now, Math.random() * 0.4);
      src.stop(now + duration + 0.01);
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) {
        this.playPop(520);
        this._tone({ type: 'sine', freq: 784, endFreq: 1046.5, startTime: 0.06, duration: 0.12, gain: 0.14 });
      } else if (this.musicEnabled) {
        this.stopMusic();
      }
      return this.enabled;
    }

    // =========================================================================
    // ФОНОВА ЧІПТЮН-МУЗИКА СТУДІЇ («КУЗНЯ ПРИГОД»)
    // =========================================================================
    toggleMusic() {
      this.init();
      if (this.musicEnabled) {
        this.stopMusic();
        return false;
      }
      if (!this.enabled) {
        this.enabled = true;
      }
      this.startMusic();
      return true;
    }

    startMusic() {
      this.init();
      if (this._musicTimer) clearInterval(this._musicTimer);
      this.musicEnabled = true;
      this._musicStepIndex = 0;

      // Граємо перший крок одразу і запускаємо таймер (150 мс = 100 BPM 16-ті ноти)
      this._playMusicStep();
      this._musicTimer = setInterval(() => {
        if (!this.enabled || !this.musicEnabled) {
          this.stopMusic();
          return;
        }
        this._playMusicStep();
      }, 155);
    }

    stopMusic() {
      this.musicEnabled = false;
      if (this._musicTimer) {
        clearInterval(this._musicTimer);
        this._musicTimer = null;
      }
    }

    _playMusicStep() {
      if (!this.enabled || !this.ctx) return;
      try {
        const step = BG_MELODY_STEPS[this._musicStepIndex % BG_MELODY_STEPS.length];
        const stepIdx = this._musicStepIndex;
        this._musicStepIndex++;

        // М'який арпеджіатор (марімба/чіптюн)
        if (step.arp > 0) {
          this._tone({
            type: 'sine',
            freq: step.arp,
            endFreq: step.arp * 1.005,
            duration: 0.13,
            gain: 0.038,
            attack: 0.008
          });
        }

        // Пружний бас на сильних долях
        if (step.bass > 0) {
          this._tone({
            type: 'triangle',
            freq: step.bass,
            endFreq: step.bass * 0.98,
            duration: 0.18,
            gain: 0.065,
            attack: 0.006
          });
        }

        // Головна весела мелодія
        if (step.lead > 0) {
          this._tone({
            type: 'square',
            freq: step.lead,
            endFreq: step.lead * 1.01,
            duration: 0.14,
            gain: 0.026,
            attack: 0.005
          });
          this._tone({
            type: 'triangle',
            freq: step.lead * 2,
            duration: 0.11,
            gain: 0.018,
            attack: 0.005
          });
        }

        // Легкий ритмічний шейкер кожні 2 кроки
        if (stepIdx % 2 === 1) {
          this._noise({
            filterType: 'highpass',
            freq: stepIdx % 4 === 3 ? 7500 : 9500,
            q: 1.2,
            duration: 0.035,
            gain: stepIdx % 4 === 3 ? 0.018 : 0.01
          });
        }
      } catch (e) { console.warn('StudioSound Music:', e); }
    }

    // =========================================================================
    // БАЗОВІ ТА МУЗИЧНІ ЗВУКИ МАЛЮВАННЯ І КЛІКІВ
    // =========================================================================

    // Веселий пружний бульк/поп (як встановлення блоку з гармонікою)
    playPop(freq = 380) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const jitter = (Math.random() - 0.5) * 40;
        const baseF = Math.max(120, freq + jitter);

        // Пружний «бульк» вгору-вниз
        this._tone({
          type: 'triangle',
          freq: baseF * 0.85,
          midFreq: baseF * 1.35,
          midTime: 0.025,
          endFreq: baseF * 0.55,
          duration: 0.085,
          gain: 0.18
        });
        // Дзвінка дерев'яна гармоніка (ефект ксилофона)
        this._tone({
          type: 'sine',
          freq: baseF * 2.0,
          endFreq: baseF * 2.4,
          duration: 0.045,
          gain: 0.07
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Музичне малювання по сітці 16×16 (кожна клітинка грає ноту пентатоніки!)
    playPaintNote(row = 0, col = 0, brushLevel = 3) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        if (brushLevel === 0) {
          this.playErase();
          return;
        }

        // Індекс ноти залежить від позиції курсора та обраного шару висоти (1..4)
        const scaleIdx = (col + (15 - row) + (brushLevel - 1) * 2) % PENTATONIC_SCALE.length;
        const octaveMul = brushLevel === 4 ? 1.5 : (brushLevel === 1 ? 0.75 : 1.0);
        const noteFreq = PENTATONIC_SCALE[scaleIdx] * octaveMul;

        // Основний тон марімби / нотного блоку Minecraft
        this._tone({
          type: brushLevel === 4 ? 'sine' : 'triangle',
          freq: noteFreq,
          midFreq: noteFreq * 1.04,
          midTime: 0.02,
          endFreq: noteFreq * 0.98,
          duration: 0.11,
          gain: 0.16
        });

        // Іскристий обертон для високих шарів (Алмаз / Пік)
        if (brushLevel >= 3) {
          this._tone({
            type: 'sine',
            freq: noteFreq * 2,
            endFreq: noteFreq * 2.5,
            startTime: 0.015,
            duration: 0.08,
            gain: 0.07
          });
        }
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Смішний звук гумки при стиранні пікселя («чух-бульк»)
    playErase() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        this._tone({
          type: 'sine',
          freq: 360,
          midFreq: 220,
          midTime: 0.03,
          endFreq: 110,
          duration: 0.08,
          gain: 0.15
        });
        this._noise({
          filterType: 'bandpass',
          freq: 1400,
          endFreq: 500,
          q: 3.0,
          duration: 0.06,
          gain: 0.06
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Комічний свист вниз + бульбашка при очищенні всього полотна 16×16
    playClearCanvas() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        // Slide whistle вниз
        this._tone({
          type: 'sine',
          freq: 880,
          midFreq: 420,
          midTime: 0.12,
          endFreq: 150,
          duration: 0.26,
          gain: 0.18
        });
        this._noise({
          filterType: 'bandpass',
          freq: 2200,
          endFreq: 300,
          q: 2.5,
          duration: 0.22,
          gain: 0.09
        });
        // Фінальний «поп!» наприкінці
        this._tone({
          type: 'triangle',
          freq: 240,
          endFreq: 520,
          startTime: 0.24,
          duration: 0.07,
          gain: 0.15
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Тихий ксилофонний тік при перетягуванні повзунка (висота тону росте від min до max!)
    playSliderTick(normalizedRatio = 0.5) {
      if (!this.enabled) return;
      const nowMs = performance.now();
      if (nowMs - this._lastSliderSoundTime < 42) return; // анти-спам тротлінг
      this._lastSliderSoundTime = nowMs;

      try {
        this.init();
        if (!this.ctx) return;
        const clamped = Math.max(0, Math.min(1, normalizedRatio));
        const freq = 280 + clamped * 520;
        this._tone({
          type: 'sine',
          freq,
          endFreq: freq * 1.12,
          duration: 0.038,
          gain: 0.075,
          attack: 0.003
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Веселий звук друкарської бульбашки при введенні тексту імені/слова
    playKeyType(char = 'A') {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const code = (char && char.charCodeAt(0)) || 65;
        const scaleNote = PENTATONIC_SCALE[code % PENTATONIC_SCALE.length];
        this._tone({
          type: 'triangle',
          freq: scaleNote,
          endFreq: scaleNote * 1.25,
          duration: 0.055,
          gain: 0.11
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Музичний джингл перемикання між 4 головними вкладками студії
    playTabSwitch(tabName) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const patterns = {
          minecraft: [392.00, 523.25, 659.25], // Героїчний C-мажор (Кузня)
          illusion:  [440.00, 554.37, 659.25, 880.00], // Магічний A-мажор (Ілюзія)
          physics:   [293.66, 392.00, 493.88, 587.33], // Пружний G-мажор (Катапульта)
          mob:       [329.63, 392.00, 493.88, 659.25]  // Епічний E-мінор/мажор (Моби)
        };
        const notes = patterns[tabName] || patterns.minecraft;
        notes.forEach((f, idx) => {
          this._tone({
            type: tabName === 'illusion' ? 'sine' : 'triangle',
            freq: f,
            endFreq: f * 1.03,
            startTime: idx * 0.045,
            duration: 0.14,
            gain: 0.13
          });
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // =========================================================================
    // ТЕМАТИЧНІ ЗВУКИ ПРЕСЕТІВ, МОБІВ ТА ЗБРОЇ
    // =========================================================================
    playThemeSound(themeKey) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        switch (themeKey) {
          case 'sword':
          case 'knight':
          case 'dual_axes':
          case 'hero_badge': {
            // Дзвінкий металевий «ШІНГ!» виймання меча + героїчний акорд
            this._noise({ filterType: 'bandpass', freq: 2400, endFreq: 5800, q: 6.0, duration: 0.18, gain: 0.14 });
            this._tone({ type: 'sawtooth', freq: 587.33, endFreq: 1174.66, duration: 0.16, gain: 0.09 });
            [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
              this._tone({ type: 'triangle', freq: f, startTime: 0.06 + i * 0.035, duration: 0.22, gain: 0.11 });
            });
            break;
          }

          case 'pickaxe':
          case 'golem':
          case 'hammer':
          case 'shield':
          case 'fossil_shell':
          case 'mini_tag':
          case 'cardboard_stand': {
            // Ковальський удар молота по ковадлу «ДЗЕНЬ-БУМ!»
            this._tone({ type: 'triangle', freq: 130, endFreq: 55, duration: 0.2, gain: 0.24 });
            this._tone({ type: 'square', freq: 840, endFreq: 810, duration: 0.28, gain: 0.08 });
            this._tone({ type: 'sine', freq: 1265, endFreq: 1240, duration: 0.34, gain: 0.09 });
            this._noise({ filterType: 'highpass', freq: 1800, duration: 0.08, gain: 0.15 });
            break;
          }

          case 'creeper':
          case 'creature_track': {
            // Фірмове шипіння Кріпера «Тссссс...» + кумедний 8-бітний стрибок
            this._noise({ filterType: 'bandpass', freq: 3200, endFreq: 1600, q: 1.8, duration: 0.28, gain: 0.16 });
            [330, 311, 293, 261, 392, 523].forEach((f, i) => {
              this._tone({ type: 'square', freq: f, startTime: 0.04 + i * 0.04, duration: 0.07, gain: 0.075 });
            });
            break;
          }

          case 'tnt': {
            // Іскристий фітіль + мультяшний басовий «БАБАХ-БОЇНГ!»
            this._noise({ filterType: 'highpass', freq: 4200, endFreq: 1200, duration: 0.14, gain: 0.14 });
            this._noise({ filterType: 'lowpass', freq: 480, endFreq: 80, startTime: 0.12, duration: 0.32, gain: 0.25 });
            this._tone({
              type: 'sawtooth',
              freq: 220,
              midFreq: 65,
              midTime: 0.18,
              endFreq: 140,
              startTime: 0.12,
              duration: 0.3,
              gain: 0.2
            });
            break;
          }

          case 'heart':
          case 'totem':
          case 'crown':
          case 'city_coin':
          case 'game_token': {
            // Дзвінкий 1-UP / XP Level-Up орб із Minecraft
            const xpNotes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
            xpNotes.forEach((f, i) => {
              this._tone({ type: 'sine', freq: f, endFreq: f * 1.02, startTime: i * 0.045, duration: 0.2, gain: 0.13 });
              this._tone({ type: 'triangle', freq: f * 1.5, startTime: i * 0.045 + 0.01, duration: 0.12, gain: 0.05 });
            });
            break;
          }

          case 'dragon':
          case 'wings':
          case 'horns': {
            // Містичний рик Дракона Енду + магічні кристали
            this._tone({ type: 'sawtooth', freq: 165, midFreq: 230, midTime: 0.12, endFreq: 110, duration: 0.34, gain: 0.14 });
            this._noise({ filterType: 'bandpass', freq: 650, endFreq: 280, q: 3.5, duration: 0.3, gain: 0.12 });
            [587.33, 740.0, 880.0, 1174.66].forEach((f, i) => {
              this._tone({ type: 'sine', freq: f, startTime: 0.08 + i * 0.05, duration: 0.2, gain: 0.09 });
            });
            break;
          }

          case 'cyborg':
          case 'visor':
          case 'antenna': {
            // Веселий робот R2-D2 (біп-буп-цвіріньк!)
            const r2Notes = [720, 1180, 940, 1520, 620, 1380, 1046];
            r2Notes.forEach((f, i) => {
              this._tone({
                type: i % 2 === 0 ? 'sine' : 'square',
                freq: f,
                endFreq: f * (i % 2 === 0 ? 1.25 : 0.8),
                startTime: i * 0.042,
                duration: 0.05,
                gain: 0.11
              });
            });
            break;
          }

          case 'jetpack': {
            // Реактивний турбо-старт ракети!
            this._noise({ filterType: 'bandpass', freq: 350, endFreq: 2800, q: 2.2, duration: 0.32, gain: 0.18 });
            this._tone({ type: 'sawtooth', freq: 180, endFreq: 760, duration: 0.3, gain: 0.12 });
            break;
          }

          default:
            this.playMagicGenerate();
            break;
        }
      } catch (e) { console.warn('StudioSound Theme:', e); }
    }

    // =========================================================================
    // МАГІЧНА ГЕНЕРАЦІЯ, КАСКАД БЛОКІВ ТА ДЖЕКПОТ-РУЛЕТКА «ВИПАДКОВИЙ ВАУ!»
    // =========================================================================

    // Магічний акорд при генерації 3D моделі (тепер з басовою нотою та мерехтливим хорусом!)
    playMagicGenerate() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        // М'який басовий фундамент
        this._tone({ type: 'triangle', freq: 130.81, endFreq: 130.81, duration: 0.32, gain: 0.14 });

        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major pentatonic + G5
        notes.forEach((note, idx) => {
          const delay = idx * 0.042;
          this._tone({
            type: 'sine',
            freq: note,
            endFreq: note * 1.025,
            startTime: delay,
            duration: 0.25,
            gain: 0.11
          });
          // Легкий детюн для чарівного сяйва
          this._tone({
            type: 'triangle',
            freq: note * 1.006,
            endFreq: note * 1.5,
            startTime: delay + 0.01,
            duration: 0.18,
            gain: 0.045
          });
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Каскад дрібних «бульбашкових» кліків, коли воксельні блоки падають на стіл принтера
    playBlockCascade(meshCount = 25) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const steps = Math.min(7, Math.max(3, Math.floor(meshCount / 18)));
        for (let i = 0; i < steps; i++) {
          const f = PENTATONIC_SCALE[(i * 2 + 3) % PENTATONIC_SCALE.length];
          this._tone({
            type: 'sine',
            freq: f * 1.5,
            endFreq: f * 1.8,
            startTime: 0.04 + i * 0.045,
            duration: 0.045,
            gain: 0.055
          });
        }
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Святкова рулетка-джекпот для кнопки «🎲 Випадковий ВАУ!»
    playRandomJackpot() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        // 1. Швидке обертання колеса фортуни (7 кліків з ростом висоти)
        const spinSteps = 7;
        for (let i = 0; i < spinSteps; i++) {
          const f = 300 + i * 75;
          this._tone({
            type: 'square',
            freq: f,
            endFreq: f * 1.2,
            startTime: i * 0.032,
            duration: 0.026,
            gain: 0.08
          });
        }

        // 2. Фінальний святковий акорд «ТА-ДАААМ!»
        const baseDelay = spinSteps * 0.032 + 0.01;
        this._tone({ type: 'triangle', freq: 196.00, startTime: baseDelay, duration: 0.38, gain: 0.18 });
        const chord = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66]; // G major 9
        chord.forEach((f, idx) => {
          this._tone({
            type: idx % 2 === 0 ? 'triangle' : 'sine',
            freq: f,
            endFreq: f * 1.015,
            startTime: baseDelay + idx * 0.03,
            duration: 0.34,
            gain: 0.11
          });
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // =========================================================================
    // КАТАПУЛЬТА, ВІДСКОКИ СНАРЯДА ТА ГРАВІТАЦІЙНИЙ БАЛАНСИР
    // =========================================================================

    // Звук пострілу катапульти: натяг ресори -> пружний «БОЇНГ-ПІУ!» -> свист польоту снаряда!
    playCatapultLaunch() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        // 1. Натяг пластикової пружини (0..0.12с)
        for (let i = 0; i < 4; i++) {
          this._tone({
            type: 'sawtooth',
            freq: 140 + i * 35,
            endFreq: 170 + i * 35,
            startTime: i * 0.028,
            duration: 0.024,
            gain: 0.11
          });
        }

        // 2. Різкий пружинний «БОЇНГ!» при відпусканні важеля (0.12с)
        this._tone({
          type: 'sawtooth',
          freq: 150,
          midFreq: 680,
          midTime: 0.09,
          endFreq: 210,
          startTime: 0.12,
          duration: 0.28,
          gain: 0.22
        });

        // 3. Мультяшний свист снаряда TNT у повітрі («Ф'ююють!»)
        this._tone({
          type: 'sine',
          freq: 980,
          midFreq: 1250,
          midTime: 0.08,
          endFreq: 310,
          startTime: 0.16,
          duration: 0.42,
          gain: 0.13
        });
        this._noise({
          filterType: 'bandpass',
          freq: 1800,
          endFreq: 600,
          q: 3.0,
          startTime: 0.14,
          duration: 0.25,
          gain: 0.11
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Пружний мультяшний звук «Боїнг-Бульк!», коли снаряд TNT відскакує від столу принтера
    playProjectileBounce(bounceIndex = 0) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const attenuation = Math.pow(0.72, bounceIndex);
        const baseF = 240 + bounceIndex * 45;
        this._tone({
          type: 'triangle',
          freq: baseF * 0.7,
          midFreq: baseF * 1.6,
          midTime: 0.03,
          endFreq: baseF * 0.9,
          duration: 0.12 * attenuation + 0.04,
          gain: 0.2 * attenuation
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Магічне «гойдання-вібрато» для демонстрації Гравітаційного Балансира («Дракон на Пальці»)
    playBalancerWobble() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const wobbles = [392.00, 440.00, 392.00, 493.88, 440.00, 523.25, 493.88, 587.33];
        wobbles.forEach((f, idx) => {
          this._tone({
            type: 'sine',
            freq: f * 0.96,
            midFreq: f * 1.06,
            midTime: 0.08,
            endFreq: f,
            startTime: idx * 0.14,
            duration: 0.18,
            gain: 0.12 * Math.pow(0.9, idx)
          });
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // =========================================================================
    // КАМЕРА, ОПТИЧНА ІЛЮЗІЯ, СПІВАЮЧИЙ 3D-ПРИНТЕР ТА ЕКСПОРТ .STL
    // =========================================================================

    // Поворот камери або магічне перемикання ракурсу Оптичної Ілюзії (0° ↔ 90°)
    playCameraSwoosh(preset = 'iso') {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        // Легкий повітряний вжух
        this._noise({
          filterType: 'bandpass',
          freq: preset === 'side90' ? 900 : 1400,
          endFreq: preset === 'side90' ? 1800 : 750,
          q: 2.5,
          duration: 0.14,
          gain: 0.08
        });

        // Двонотна підказка ракурсу (щоб діти чули різницю між СЛОВОМ 1 і СЛОВОМ 2!)
        if (preset === 'front') {
          this._tone({ type: 'sine', freq: 523.25, endFreq: 659.25, duration: 0.11, gain: 0.13 });
        } else if (preset === 'side90') {
          this._tone({ type: 'sine', freq: 659.25, endFreq: 880.00, duration: 0.11, gain: 0.13 });
        } else if (preset === 'top') {
          this._tone({ type: 'triangle', freq: 587.33, endFreq: 783.99, duration: 0.09, gain: 0.12 });
        } else {
          this._tone({ type: 'triangle', freq: 440.00, endFreq: 523.25, duration: 0.09, gain: 0.12 });
        }
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Святкові фанфари перемоги при скачуванні готового .STL файлу!
    playExportSuccess() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        // Урочиста фанфара: та-да-да-ДАААМ!
        const fanfare = [
          { f: 523.25, t: 0.00, d: 0.09 },
          { f: 523.25, t: 0.09, d: 0.09 },
          { f: 523.25, t: 0.18, d: 0.09 },
          { f: 659.25, t: 0.27, d: 0.20 },
          { f: 587.33, t: 0.44, d: 0.14 },
          { f: 659.25, t: 0.56, d: 0.14 },
          { f: 783.99, t: 0.68, d: 0.42 },
          { f: 1046.50,t: 0.68, d: 0.45 }
        ];
        fanfare.forEach((n) => {
          this._tone({ type: 'triangle', freq: n.f, startTime: n.t, duration: n.d, gain: 0.16 });
          this._tone({ type: 'sawtooth', freq: n.f * 0.5, startTime: n.t, duration: n.d, gain: 0.05 });
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Співаючий кроковий двигун 3D-принтера (грає чіптюн-мелодію під час симуляції друку!)
    playPrinterStep(progress = 0.5) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        const melodyNote = PRINTER_MELODY[this._printerStepIndex % PRINTER_MELODY.length];
        this._printerStepIndex++;

        // Зсув висоти тону вгору в міру росту шарів (Z-прогрес)
        const pitchShift = 0.85 + progress * 0.35;
        const freq = melodyNote * pitchShift;

        this._tone({
          type: 'square',
          freq,
          endFreq: freq * 1.02,
          duration: 0.045,
          gain: 0.038,
          attack: 0.003
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Дзвінок готового 3D-друку («Дзінь! Модель надрукована!»)
    playPrintComplete() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        this._printerStepIndex = 0;
        // Подвійний мікрохвильовий/трофейний дзвіночок + акорд
        [1046.50, 1318.51, 1567.98, 2093.00].forEach((f, i) => {
          this._tone({
            type: 'sine',
            freq: f,
            endFreq: f * 1.01,
            startTime: i * 0.07,
            duration: 0.35,
            gain: 0.14
          });
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }

    // Секретна пасхалка при кліку на логотип кузні ⚒️ («Ковальське Ковадло + Іскри»)
    playAnvilEasterEgg() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        // Два дзвінкі удари молота по ковадлу
        [0, 0.18].forEach((t, idx) => {
          const mul = idx === 1 ? 1.25 : 1.0;
          this._tone({ type: 'square', freq: 920 * mul, endFreq: 890 * mul, startTime: t, duration: 0.22, gain: 0.11 });
          this._tone({ type: 'sine', freq: 1840 * mul, endFreq: 1790 * mul, startTime: t, duration: 0.28, gain: 0.1 });
          this._noise({ filterType: 'highpass', freq: 2500, startTime: t, duration: 0.06, gain: 0.14 });
        });
        // Каскад магічних іскор
        [1046.5, 1318.5, 1568.0, 2093.0].forEach((f, i) => {
          this._tone({ type: 'sine', freq: f, startTime: 0.32 + i * 0.04, duration: 0.16, gain: 0.09 });
        });
      } catch (e) { console.warn('StudioSound:', e); }
    }
  }

  window.StudioSound = new SoundEngine();
})();
