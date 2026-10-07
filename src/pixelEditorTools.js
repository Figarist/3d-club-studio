// Допоміжні перетворення для піксельної сітки Minecraft-Кузні.
(function () {
  const TOOL_DEFINITIONS = [
    {
      key: 'mirror-left-right',
      label: '↔ Дзеркало',
      title: 'Віддзеркалити малюнок по вертикальній осі: ліва й права сторони поміняються місцями.',
      prompt: 'Малюнок віддзеркалено зліва направо.'
    },
    {
      key: 'mirror-up-down',
      label: '↕ Дзеркало',
      title: 'Віддзеркалити малюнок по горизонтальній осі: верх і низ поміняються місцями.',
      prompt: 'Малюнок віддзеркалено зверху вниз.'
    },
    {
      key: 'rotate-clockwise',
      label: '↻ 90°',
      title: 'Повернути малюнок на 90° за годинниковою стрілкою.',
      prompt: 'Малюнок повернуто на 90° за годинниковою стрілкою.'
    },
    {
      key: 'invert-relief',
      label: 'Рельєф 1↔4',
      title: 'Перевернути висоту рельєфу: 1 стане 4, 2 стане 3; порожні клітинки не зміняться.',
      prompt: 'Порожні клітинки лишилися порожніми, а висоти стали протилежними.'
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
      actions.setAttribute('aria-label', 'Перетворення піксельного малюнка');

      TOOL_DEFINITIONS.forEach(definition => {
        const button = documentRef.createElement('button');
        button.type = 'button';
        button.className = 'pixel-tools-button';
        button.setAttribute('data-pixel-tool', definition.key);
        button.setAttribute('aria-label', definition.title);
        button.title = definition.title;
        button.textContent = definition.label;
        actions.appendChild(button);
      });

      this.status = documentRef.createElement('p');
      this.status.className = 'pixel-tools-status';
      this.status.setAttribute('role', 'status');
      this.status.setAttribute('aria-live', 'polite');
      this.status.textContent = 'Порівняй віддзеркалення та поворот. Як зміниться тінь після зміни висот?';

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
        this._announce('Сітка порожня. Намалюй фігуру, а тоді спробуй перетворення.');
        return false;
      }

      const nextState = Object.assign({}, currentState, {
        grid: transform(currentState.grid)
      });

      if (JSON.stringify(currentState.grid) === JSON.stringify(nextState.grid)) {
        this._announce('Без змін: малюнок уже має таку форму. Спробуй інше перетворення.');
        return false;
      }

      this.onBeforeChange();
      this.generator.setState(nextState, false);
      this.onAfterChange();
      this._announce(definition.prompt);
      return true;
    }

    _announce(message) {
      if (this.status) this.status.textContent = message;
    }
  }

  window.PixelEditorTools = PixelEditorTools;
})();
