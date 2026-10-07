// Optional content-pack browser. Mission selection remains owned by StudioApp.
(function () {
  class AdventureShelf {
    constructor(options = {}) {
      this.pack = options.pack || window.StudioAdventurePack;
      this.onSelectMission = options.onSelectMission;
      this.container = null;
    }

    mount(container) {
      if (!container || !this.pack) return;
      this.container = container;
      container.replaceChildren();
      this.pack.groups.forEach((group, index) => {
        const section = document.createElement('details');
        section.className = 'adventure-shelf-group';
        section.open = index === 0;
        const summary = document.createElement('summary');
        summary.textContent = group.title;
        section.appendChild(summary);
        const grid = document.createElement('div');
        grid.className = 'preset-grid adventure-shelf-grid';
        group.presetKeys.forEach((key) => {
          const preset = window.MINECRAFT_PRESETS[key];
          const id = this.pack.missionIdByPresetKey[key];
          if (!preset || !id) return;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'preset-btn preset-mini-btn';
          button.dataset.adventureMission = String(id);
          button.textContent = preset.name;
          button.title = 'Почати пригоду з маленької заготовки та створити власну версію';
          button.addEventListener('click', () => {
            if (typeof this.onSelectMission === 'function') this.onSelectMission(id);
          });
          grid.appendChild(button);
        });
        section.appendChild(grid);
        container.appendChild(section);
      });
      this.updateCatalogCounts();
    }

    selectMission(id) {
      if (!this.container) return;
      this.container.querySelectorAll('[data-adventure-mission]').forEach((button) => {
        const selected = Number(button.dataset.adventureMission) === Number(id);
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
        if (selected) button.closest('details').open = true;
      });
    }

    updateCatalogCounts() {
      const missions = window.STUDIO_MISSIONS || [];
      const count = missions.length;
      const top = document.getElementById('btn-open-missions');
      if (top) {
        top.textContent = `🗺️ Місії гуртка (${count})`;
        top.title = `Каталог ${count} навчальних місій для 2–6 класів`;
      }
      const inline = document.getElementById('btn-open-missions-inline');
      if (inline) {
        inline.textContent = `🗺️ Усі ${count}`;
        inline.title = `Відкрити всі ${count} місій гуртка`;
      }
      const title = document.getElementById('missions-modal-title');
      if (title) title.textContent = `🗺️ Місії гуртка «3D Кузня Чудес» (${count} проєктів для 2–6 класів)`;
      document.querySelectorAll('[data-mission-filter]').forEach((button) => {
        const category = button.dataset.missionFilter;
        const total = category === 'all' ? count : missions.filter((m) => m.category === category).length;
        button.textContent = button.textContent.replace(/\s*\(\d+\)\s*$/, '') + ` (${total})`;
      });
    }
  }
  window.AdventureShelf = AdventureShelf;
})();
