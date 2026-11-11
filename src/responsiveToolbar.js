// Контролер адаптивної командної панелі студії (Priority+ overflow для робочої смуги)
(function () {
  class ResponsiveToolbar {
    constructor(options = {}) {
      this.bar = options.bar || document.getElementById('view-mode-bar');
      this.toolsGroup = options.toolsGroup || document.getElementById('workspace-tools-group');
      this.toolsSeparator = options.toolsSeparator || document.getElementById('subbar-tools-separator');
      this.overflowWrapper = options.overflowWrapper || document.getElementById('subbar-overflow-wrapper');
      this.overflowButton = options.overflowButton || document.getElementById('btn-subbar-overflow');
      this.overflowCount = options.overflowCount || document.getElementById('subbar-overflow-count');
      this.overflowMenu = options.overflowMenu || document.getElementById('subbar-overflow-menu');

      // Порядок пріоритету згортання: першими ховаються допоміжні інструменти праворуч
      this.priorityIds = options.priorityIds || [
        'btn-simulate-print',
        'btn-print-card',
        'btn-compare-v1v2',
        'btn-snapshot-v1',
        'btn-toggle-mono',
        'btn-open-lesson'
      ];

      // Природний порядок відображення пунктів всередині випадаючого списку
      this.displayOrderIds = [
        'btn-open-lesson',
        'btn-toggle-mono',
        'btn-snapshot-v1',
        'btn-compare-v1v2',
        'btn-print-card',
        'btn-simulate-print'
      ];

      this._homeEntries = [];
      this._isUpdating = false;
      this._rafId = 0;
      this._resizeObserver = null;
      this._mutationObserver = null;
    }

    init() {
      if (!this.bar || !this.toolsGroup || !this.overflowWrapper || !this.overflowButton || !this.overflowMenu) {
        return;
      }

      // Фіксуємо домашні контейнери та порядок усіх керованих кнопок
      this._homeEntries = this.displayOrderIds
        .map((id) => {
          const el = document.getElementById(id);
          if (!el || !el.parentElement) return null;
          return { id, el, homeParent: el.parentElement };
        })
        .filter(Boolean);

      this.bindEvents();
      this.layout();

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.scheduleLayout()).catch(() => {});
      }
    }

    bindEvents() {
      this.overflowButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });

      this.overflowMenu.addEventListener('click', (e) => {
        const clickedBtn = e.target.closest('button');
        if (clickedBtn) {
          this.closeMenu();
        }
      });

      document.addEventListener('click', (e) => {
        if (
          this.overflowMenu.classList.contains('show') &&
          !this.overflowWrapper.contains(e.target)
        ) {
          this.closeMenu();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.overflowMenu.classList.contains('show')) {
          this.closeMenu();
          this.overflowButton.focus();
        }
      });

      // Синхронізуємося з іншим меню шапки, щоб два поповери не перекривались
      const topMenuBtn = document.getElementById('btn-top-menu');
      if (topMenuBtn) {
        topMenuBtn.addEventListener('click', () => this.closeMenu());
      }

      if (typeof ResizeObserver === 'function') {
        this._resizeObserver = new ResizeObserver(() => this.scheduleLayout());
        this._resizeObserver.observe(this.bar);
      }
      window.addEventListener('resize', () => this.scheduleLayout());

      if (typeof MutationObserver === 'function') {
        this._mutationObserver = new MutationObserver(() => {
          if (!this._isUpdating) {
            this.scheduleLayout();
          }
        });
        this._homeEntries.forEach(({ el }) => {
          this._mutationObserver.observe(el, {
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden']
          });
        });
        const missionsBtn = document.getElementById('btn-open-missions');
        if (missionsBtn) {
          this._mutationObserver.observe(missionsBtn, {
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      }
    }

    toggleMenu(forceOpen) {
      const next = forceOpen !== undefined ? forceOpen : !this.overflowMenu.classList.contains('show');
      if (next) {
        const topDropdown = document.getElementById('top-dropdown-menu');
        const topBtn = document.getElementById('btn-top-menu');
        if (topDropdown && topDropdown.classList.contains('show')) {
          topDropdown.classList.remove('show');
          topBtn?.setAttribute('aria-expanded', 'false');
          topBtn?.classList.remove('active');
        }
      }
      this.overflowMenu.classList.toggle('show', next);
      this.overflowButton.setAttribute('aria-expanded', next ? 'true' : 'false');
      this.overflowButton.classList.toggle('active', next);
      if (next && window.StudioSound) {
        window.StudioSound.playPop?.(480);
      }
    }

    closeMenu() {
      if (!this.overflowMenu) return;
      this.overflowMenu.classList.remove('show');
      this.overflowButton?.setAttribute('aria-expanded', 'false');
      this.overflowButton?.classList.remove('active');
    }

    scheduleLayout() {
      if (this._rafId) cancelAnimationFrame(this._rafId);
      this._rafId = requestAnimationFrame(() => {
        this._rafId = 0;
        this.layout();
      });
    }

    _isElementVisible(el) {
      return Boolean(el && !el.hidden && el.style.display !== 'none');
    }

    _restoreAllToHome() {
      this._homeEntries.forEach(({ el, homeParent }) => {
        el.removeAttribute('role');
        if (el.parentElement !== homeParent) {
          homeParent.appendChild(el);
        }
      });
    }

    layout() {
      if (!this.bar || !this.toolsGroup || !this.overflowWrapper || !this.overflowMenu) return;
      if (this._isUpdating) return;

      this._isUpdating = true;
      try {
        // 1. Повертаємо всі кнопки на їхні природні місця перед виміром ширини
        this._restoreAllToHome();
        this.toolsGroup.hidden = false;
        if (this.toolsSeparator) this.toolsSeparator.hidden = false;
        this.overflowWrapper.hidden = true;

        const barClientWidth = this.bar.clientWidth;
        if (barClientWidth <= 0) return;

        // 2. Якщо все вміщується без переповнення — додаткове меню не потрібне
        if (this.bar.scrollWidth <= barClientWidth + 1) {
          this.closeMenu();
          this.overflowButton.classList.remove('has-active-tool');
          if (this.overflowCount) this.overflowCount.textContent = '0';
          return;
        }

        // 3. Показуємо кнопку «Ще» і переносимо кнопки за пріоритетом, доки смуга не влізе в екран
        this.overflowWrapper.hidden = false;
        const movedSet = new Set();

        for (const id of this.priorityIds) {
          const el = document.getElementById(id);
          if (!el || !this._isElementVisible(el)) continue;

          el.setAttribute('role', 'menuitem');
          this.overflowMenu.appendChild(el);
          movedSet.add(el);

          const hasVisibleInToolsGroup = Array.from(this.toolsGroup.children).some((child) =>
            this._isElementVisible(child)
          );
          this.toolsGroup.hidden = !hasVisibleInToolsGroup;

          if (this.overflowCount) {
            this.overflowCount.textContent = String(movedSet.size);
          }

          if (this.bar.scrollWidth <= this.bar.clientWidth + 1) {
            break;
          }
        }

        // 4. Впорядковуємо перенесені кнопки всередині меню у природному порядку зліва направо
        this.displayOrderIds.forEach((id) => {
          const el = document.getElementById(id);
          if (el && movedSet.has(el)) {
            this.overflowMenu.appendChild(el);
          }
        });

        const visibleMovedCount = movedSet.size;
        if (visibleMovedCount === 0) {
          this.overflowWrapper.hidden = true;
          this.closeMenu();
        } else {
          this.overflowWrapper.hidden = false;
          if (this.overflowCount) this.overflowCount.textContent = String(visibleMovedCount);
        }

        const hasActiveMoved = Array.from(movedSet).some((el) =>
          el.classList.contains('active') ||
          el.classList.contains('active-sim') ||
          el.classList.contains('has-v1')
        );
        this.overflowButton.classList.toggle('has-active-tool', hasActiveMoved);
      } finally {
        this._isUpdating = false;
      }
    }
  }

  window.ResponsiveToolbar = ResponsiveToolbar;
})();
