// Процедурний звуковий рушій (Web Audio API) — працює без зовнішніх MP3 файлів та інтернету!
(function () {
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) this.playPop(520);
      return this.enabled;
    }

    // Короткий приємний клік/поп як у Minecraft при встановленні блоку
    playPop(freq = 380) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const jitter = (Math.random() - 0.5) * 50;
        osc.frequency.setValueAtTime(freq + jitter, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.065);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.075);
      } catch (e) {}
    }

    // Магічний акорд при генерації 3D моделі або мутації
    playMagicGenerate() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major pentatonic
        notes.forEach((note, idx) => {
          const now = this.ctx.currentTime + idx * 0.045;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, now);
          osc.frequency.exponentialRampToValueAtTime(note * 1.03, now + 0.22);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.26);
        });
      } catch (e) {}
    }

    // Звук пострілу катапульти!
    playCatapultLaunch() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.35);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      } catch (e) {}
    }

    // Фанфари при скачуванні .STL файлу
    playExportSuccess() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const seq = [392.0, 523.25, 659.25, 783.99];
        seq.forEach((f, i) => {
          const now = this.ctx.currentTime + i * 0.07;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        });
      } catch (e) {}
    }

    // Тихий звук крокового двигуна 3D-принтера під час симуляції друку
    playPrinterStep(progress = 0.5) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220 + progress * 320, now);

        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } catch (e) {}
    }
  }

  window.StudioSound = new SoundEngine();
})();
