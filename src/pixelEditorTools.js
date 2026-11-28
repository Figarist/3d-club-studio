// Допоміжні перетворення для піксельної сітки Minecraft-Кузні.
(function () {
  const t = (key, vars) => (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(key, vars) : key;

  const TOOL_DEFINITIONS = [
    {
      key: 'mirror-left-right',
      labelKey: 'js.px.mirror_lr',
      titleKey: 'js.px.mirror_lr_title',
      promptKey: 'js.px.mirror_lr_done'
    },
    {
      key: 'mirror-up-down',
      labelKey: 'js.px.mirror_ud',
      titleKey: 'js.px.mirror_ud_title',
      promptKey: 'js.px.mirror_ud_done'
    },
    {
      key: 'rotate-clockwise',
      labelKey: 'js.px.rotate',
      titleKey: 'js.px.rotate_title',
      promptKey: 'js.px.rotate_done'
    },
    {
      key: 'invert-relief',
      labelKey: 'js.px.invert',
      titleKey: 'js.px.invert_title',
      promptKey: 'js.px.invert_done'
    }
  ];

  function copyState(state) {
    if (!state || !Array.isArray(state.grid)) return null;
    return Object.assign({}, state, {
      colors: Object.assign({}, state.colors || {}),
      grid: state.grid.map(row => Array.isArray(row) ? row.slice() : [])
    });
  }

  function mirrorLeftRight(grid) {
    return grid.map(row => row.slice().reverse());
  }

  function mirrorUpDown(grid) {
    return grid.slice().reverse().map(row => row.slice());
  }

  function rotateClockwise(grid) {
    const rowCount = grid.length;
    const columnCount = grid.reduce((largest, row) => Math.max(largest, row.length), 0);
    const rotated = [];

    for (let row = 0; row < columnCount; row++) {
      const nextRow = [];
      for (let column = 0; column < rowCount; column++) {
        const sourceRow = rowCount - 1 - column;
        nextRow.push(grid[sourceRow][row] === undefined ? 0 : grid[sourceRow][row]);
      }
      rotated.push(nextRow);
    }

    return rotated;
  }

  function invertRelief(grid) {
    return grid.map(row => row.map(value => {
      const level = parseInt(value, 10) || 0;
      return level === 0 ? 0 : 5 - level;
    }));
  }

  const TRANSFORMS = {
    'mirror-left-right': mirrorLeftRight,
    'mirror-up-down': mirrorUpDown,
    'rotate-clockwise': rotateClockwise,
    'invert-relief': invertRelief
  };

  class PixelEditorTools {
    constructor({ generator, onBeforeChange, onAfterChange } = {}) {
      if (!generator || typeof generator.getState !== 'function' || typeof generator.setState !== 'function') {
        throw new Error('PixelEditorTools requires a generator with getState() and setState().');
      }

      this.generator = generator;
      this.onBeforeChange = typeof onBeforeChange === 'function' ? onBeforeChange : function () {};
      this.onAfterChange = typeof onAfterChange === 'function' ? onAfterChange : function () {};
      this.container = null;
      this.status = null;
      this._handleClick = this._handleClick.bind(this);
    }

    mount(container) {
      if (!container || !container.ownerDocument) {
        throw new Error('PixelEditorTools.mount(container) requires a DOM element.');
      }

      if (this.container) {
        this.container.removeEventListener('click', this._handleClick);
      }

      this.container = container;
      container.classList.add('pixel-tools');
      container.textContent = '';

      const documentRef = container.ownerDocument;
      const actions = documentRef.createElement('div');
      actions.className = 'pixel-tools-actions';
      actions.setAttribute('role', 'group');
      actions.setAttribute('aria-label', t('js.px.aria'));
      actions.setAttribute('data-i18n-aria', 'js.px.aria');

      TOOL_DEFINITIONS.forEach(definition => {
        const button = documentRef.createElement('button');
        button.type = 'button';
        button.className = 'pixel-tools-button';
        button.setAttribute('data-pixel-tool', definition.key);
        button.setAttribute('data-i18n', definition.labelKey);
        button.setAttribute('data-i18n-title', definition.titleKey);
        button.setAttribute('data-i18n-aria', definition.titleKey);
        button.setAttribute('aria-label', t(definition.titleKey));
        button.title = t(definition.titleKey);
        button.textContent = t(definition.labelKey);
        actions.appendChild(button);
      });

      this.status = documentRef.createElement('p');
      this.status.className = 'pixel-tools-status';
      this.status.setAttribute('role', 'status');
      this.status.setAttribute('aria-live', 'polite');
      this.status.textContent = t('js.px.hint');

      container.appendChild(actions);
      container.appendChild(this.status);
      container.addEventListener('click', this._handleClick);
      return this;
    }

    _handleClick(event) {
      const target = event.target;
      const button = target && typeof target.closest === 'function'
        ? target.closest('[data-pixel-tool]')
        : null;
      if (!button || !this.container.contains(button)) return;
      this.apply(button.getAttribute('data-pixel-tool'));
    }

    apply(toolKey) {
      const transform = TRANSFORMS[toolKey];
      const definition = TOOL_DEFINITIONS.find(item => item.key === toolKey);
      if (!transform || !definition) return false;

      const currentState = copyState(this.generator.getState());
      if (!currentState || currentState.grid.length === 0) {
        this._announce(t('js.px.empty'));
        return false;
      }

      const nextState = Object.assign({}, currentState, {
        grid: transform(currentState.grid)
      });

      if (JSON.stringify(currentState.grid) === JSON.stringify(nextState.grid)) {
        this._announce(t('js.px.unchanged'));
        return false;
      }

      this.onBeforeChange();
      this.generator.setState(nextState, false);
      this.onAfterChange();
      this._announce(t(definition.promptKey));
      return true;
    }

    _announce(message) {
      if (this.status) this.status.textContent = message;
    }
  }

  window.PixelEditorTools = PixelEditorTools;
})();
