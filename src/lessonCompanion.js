// Планувальник заняття гуртка з 3D-моделювання.
(function () {
  const STORAGE_KEY = '3d-club-studio.lesson-companion.v1';
  const LESSON_MS = 60 * 60 * 1000;
  let instanceCount = 0;

  const PHASES = [
    { minutes: 5, title: 'Знайомство й задум', detail: 'Сформулюйте завдання та домовтеся, як діти чергуються за комп’ютером.' },
    { minutes: 7, title: 'Ескіз та вибір', detail: 'Оберіть сюжет, намалюйте простий контур і назвіть одну важливу деталь.' },
    { minutes: 20, title: 'Створення моделі', detail: 'Моделюйте по черзі; решта команди планує, спостерігає й радить.' },
    { minutes: 10, title: 'Перевірка й зміна', detail: 'Перевірте силует, основу та з’єднання; внесіть одну цілеспрямовану зміну.' },
    { minutes: 10, title: 'Показ і пояснення', detail: 'Покажіть модель і поясніть, для кого вона та яке рішення ви обрали.' },
    { minutes: 8, title: 'Підсумок і порядок', detail: 'Назвіть наступний крок, збережіть роботу за потреби й упорядкуйте робоче місце.' }
  ];

  const SCENARIOS = [
    {
      id: 'plant-marker', missionId: 9, title: 'Мітка для рослини', tag: 'Знак, який читається',
      goal: 'Побачити, як контур і висота допомагають упізнати знак без кольору.',
      steps: {
        '2-3': ['Оберіть одну рослину або простий символ.', 'Зробіть широку основу й один великий опуклий знак.'],
        '4-6': ['Спроєктуйте мітку з назвою або символом.', 'Розділіть фон і знак двома рівнями та перевірте читабельність.']
      }
    },
    {
      id: 'space-shield', missionId: 2, title: 'Герб космічної фортеці', tag: 'Симетрія та рельєф',
      goal: 'Порівняти симетричні форми й перевірити, чи помітний головний символ.',
      steps: {
        '2-3': ['Намалюйте щит і великий знак посередині.', 'Зробіть знак вищим за широку основу.'],
        '4-6': ['Створіть рамку, поле й центральний символ.', 'Використайте симетрію та щонайменше два рівні рельєфу.']
      }
    },
    {
      id: 'forest-trail', missionId: 5, title: 'Слід із лісу', tag: 'Спостереження за формою',
      goal: 'Перетворити спостережений контур на просту, зв’язану форму.',
      steps: {
        '2-3': ['Оберіть слід вигаданої або знайомої тварини.', 'Зробіть одну широку лапу з великими помітними пальцями.'],
        '4-6': ['Порівняйте два сліди різного розміру.', 'Зробіть коротку послідовність відбитків і з’єднайте її з основою.']
      }
    },
    {
      id: 'future-fossil', missionId: 6, title: 'Скам’янілість майбутнього', tag: 'Форма з природи',
      goal: 'Помітити в природному об’єкті повтори, лінії та великі форми.',
      steps: {
        '2-3': ['Вигадайте листок, мушлю або кісточку.', 'Покажіть її одним великим рельєфним контуром.'],
        '4-6': ['Поєднайте природний контур із рамкою або міткою знахідки.', 'Залиште дрібні лінії достатньо широкими для помітного рельєфу.']
      }
    },
    {
      id: 'game-token', missionId: 8, title: 'Жетон нової гри', tag: 'Правило стає предметом',
      goal: 'Пов’язати призначення предмета з його розміром, символом і формою.',
      steps: {
        '2-3': ['Вигадайте, що означає жетон у вашій грі.', 'Додайте великий символ на суцільну основу.'],
        '4-6': ['Придумайте жетон, який легко відрізнити від інших.', 'Використайте форму краю та рельєф як підказки для гравця.']
      }
    },
    {
      id: 'two-shadows', missionId: 12, title: 'Один знак — два ракурси', tag: 'Уява про проєкції',
      goal: 'Дослідити, як поворот моделі змінює видимий силует.',
      steps: {
        '2-3': ['З учителем оберіть два прості знаки для різних боків.', 'Перевірте форму спочатку спереду, потім збоку.'],
        '4-6': ['Спроєктуйте зв’язану форму з різними силуетами спереду й збоку.', 'Змінюйте ширину та висоту, щоб кожен ракурс залишався впізнаваним.']
      }
    }
  ];

  const CHALLENGES = [
    { id: 'two-heights', text: 'Зроби основу низькою, а головний знак помітно вищим.', goal: 'Планування рівнів: зрозуміти, як висота створює рельєф.' },
    { id: 'one-colour', text: 'Перевір, чи впізнається твоя модель одним кольором.', goal: 'Читабельність силуету без підказки кольором.' },
    { id: 'connected', text: 'З’єднай усі частини з основою хоча б одним широким місцем.', goal: 'Просторова цілісність і планування з’єднань.' },
    { id: 'symmetry', text: 'Зроби ліву й праву частини однаковими відносно середини.', goal: 'Помічати вісь і будувати симетричну форму.' },
    { id: 'one-asymmetry', text: 'Почни із симетрії, а потім додай одну особливу деталь.', goal: 'Порівняння повтору та контрольованої відмінності.' },
    { id: 'wide-base', text: 'Зроби основу ширшою за найвищу деталь.', goal: 'Зв’язок між пропорціями та стійкою формою.' },
    { id: 'bold-outline', text: 'Заміни тонкі лінії широкими, які можна легко побачити.', goal: 'Спрощення контуру та усвідомлений вибір деталей.' },
    { id: 'nature-pattern', text: 'Знайди в листку, мушлі чи сліді один повтор і покажи його.', goal: 'Спостереження за природою та перенесення закономірності у модель.' },
    { id: 'small-large', text: 'Зроби одну велику форму й дві менші деталі навколо неї.', goal: 'Ієрархія розмірів і розміщення елементів.' },
    { id: 'clear-edge', text: 'Залиш проміжок між знаком і рамкою, щоб вони не злилися.', goal: 'Керування простором і візуальною ясністю.' },
    { id: 'friend-test', text: 'Попроси напарника назвати форму з першого погляду; зміни одну нечітку частину.', goal: 'Уміння приймати відгук і перевіряти власний задум.' },
    { id: 'turn-test', text: 'Поверни модель і знайди ракурс, де її силует стає найвиразнішим.', goal: 'Просторове мислення та спостереження з кількох боків.' }
  ];

  function shuffledChallenges(previousId) {
    const result = CHALLENGES.map(function (item) { return item.id; });
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    if (result.length > 1 && result[0] === previousId) {
      const swapAt = 1 + Math.floor(Math.random() * (result.length - 1));
      const temp = result[0];
      result[0] = result[swapAt];
      result[swapAt] = temp;
    }
    return result;
  }

  function makeDefaultState() {
    const order = shuffledChallenges(null);
    return {
      grade: '2-3',
      scenarioId: SCENARIOS[0].id,
      challengeOrder: order,
      challengeCursor: 1,
      challengeId: order[0],
      challengeEdits: {},
      elapsedMs: 0,
      running: false,
      startedAtMs: 0
    };
  }

  function readState() {
    const storage = window.SafeStorage;
    if (!storage || typeof storage.getItem !== 'function') return null;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function LessonCompanion(options) {
    this.options = options || {};
    this._state = this._restoreState(readState());
    this._root = null;
    this._dialog = null;
    this._timerHandle = null;
    this._returnFocus = null;
    this._previousBodyOverflow = '';
    this._boundClick = this._handleClick.bind(this);
    this._boundInput = this._handleInput.bind(this);
    this._boundKeydown = this._handleKeydown.bind(this);
    this._id = 'lesson-companion-' + (++instanceCount);
  }

  LessonCompanion.prototype._restoreState = function (saved) {
    const state = makeDefaultState();
    if (!saved || typeof saved !== 'object') return state;
    if (saved.grade === '2-3' || saved.grade === '4-6') state.grade = saved.grade;
    if (SCENARIOS.some(function (item) { return item.id === saved.scenarioId; })) state.scenarioId = saved.scenarioId;
    const validIds = CHALLENGES.map(function (item) { return item.id; });
    if (Array.isArray(saved.challengeOrder) && saved.challengeOrder.length === validIds.length && validIds.every(function (id) { return saved.challengeOrder.indexOf(id) >= 0; })) {
      state.challengeOrder = saved.challengeOrder.slice();
    }
    if (Number.isInteger(saved.challengeCursor)) state.challengeCursor = Math.max(1, Math.min(validIds.length, saved.challengeCursor));
    if (validIds.indexOf(saved.challengeId) >= 0) state.challengeId = saved.challengeId;
    if (saved.challengeEdits && typeof saved.challengeEdits === 'object') {
      validIds.forEach(function (id) {
        if (typeof saved.challengeEdits[id] === 'string') state.challengeEdits[id] = saved.challengeEdits[id].slice(0, 280);
      });
    }
    if (Number.isFinite(saved.elapsedMs)) state.elapsedMs = Math.max(0, Math.min(LESSON_MS, saved.elapsedMs));
    state.running = saved.running === true && state.elapsedMs < LESSON_MS;
    if (state.running && Number.isFinite(saved.startedAtMs)) state.startedAtMs = saved.startedAtMs;
    if (state.running && !state.startedAtMs) state.running = false;
    return state;
  };

  LessonCompanion.prototype._persist = function () {
    const storage = window.SafeStorage;
    if (!storage || typeof storage.setItem !== 'function') return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (_) {}
  };

  LessonCompanion.prototype.init = function () {
    if (this._root || !document.body) return this;
    const titleId = this._id + '-title';
    const introId = this._id + '-intro';
    this._root = document.createElement('div');
    this._root.className = 'lesson-backdrop';
    this._root.hidden = true;
    this._root.setAttribute('aria-hidden', 'true');
    this._root.innerHTML =
      '<section class="lesson-dialog" role="dialog" aria-modal="true" aria-labelledby="' + titleId + '" aria-describedby="' + introId + '" tabindex="-1">' +
        '<header class="lesson-header">' +
          '<div><p class="lesson-eyebrow">План роботи для гуртка</p><h2 id="' + titleId + '">Урок за 60 хвилин</h2><p class="lesson-intro" id="' + introId + '">Для групи до 10 дітей, 2–6 класи, один спільний 3D-принтер.</p></div>' +
          '<button class="lesson-close" type="button" data-action="close" aria-label="Закрити план заняття">✕</button>' +
        '</header>' +
        '<div class="lesson-body">' +
          '<section class="lesson-panel lesson-timeline-panel" aria-labelledby="' + this._id + '-timeline-title">' +
            '<div class="lesson-panel-heading"><div><p class="lesson-eyebrow">Один спільний маршрут</p><h3 id="' + this._id + '-timeline-title">Ритм заняття</h3></div><span class="lesson-total">60 хв</span></div>' +
            '<div class="lesson-clock" aria-live="off"><div><span class="lesson-clock-label">Минуло</span><strong class="lesson-clock-value" data-role="clock">00:00</strong><span class="lesson-clock-total">з 60:00</span></div><span class="lesson-clock-icon" aria-hidden="true">◷</span></div>' +
            '<div class="lesson-progress-track" role="progressbar" aria-label="Хід заняття" aria-valuemin="0" aria-valuemax="60" aria-valuenow="0" data-role="progress"><span data-role="progress-fill"></span></div>' +
            '<div class="lesson-timer-controls"><button class="lesson-button lesson-button-primary" type="button" data-action="start">Почати таймер</button><button class="lesson-button lesson-button-primary" type="button" data-action="pause" hidden>Пауза</button><button class="lesson-button lesson-button-quiet" type="button" data-action="reset">Скинути</button></div>' +
            '<p class="lesson-timer-status" role="status" data-role="timer-status"></p>' +
            '<ol class="lesson-timeline" data-role="timeline"></ol>' +
          '</section>' +
          '<div class="lesson-planning-column">' +
            '<section class="lesson-panel" aria-labelledby="' + this._id + '-scenario-title">' +
              '<div class="lesson-panel-heading"><div><p class="lesson-eyebrow">Виберіть одну спільну тему</p><h3 id="' + this._id + '-scenario-title">Сюжети для моделювання</h3></div></div>' +
              '<div class="lesson-grade-switch" role="group" aria-label="Вікова група"><button type="button" data-action="grade" data-grade="2-3" aria-pressed="true">2–3 класи</button><button type="button" data-action="grade" data-grade="4-6" aria-pressed="false">4–6 класи</button></div>' +
              '<div class="lesson-scenarios" data-role="scenarios"></div>' +
              '<div class="lesson-scenario-detail" data-role="scenario-detail"></div>' +
            '</section>' +
            '<section class="lesson-panel lesson-challenge-panel" aria-labelledby="' + this._id + '-challenge-title">' +
              '<div class="lesson-panel-heading"><div><p class="lesson-eyebrow">Короткий виклик для дітей</p><h3 id="' + this._id + '-challenge-title">Спробуйте це</h3></div><span class="lesson-cycle-count" data-role="challenge-count"></span></div>' +
              '<p class="lesson-challenge-goal" data-role="challenge-goal"></p>' +
              '<label class="lesson-edit-label" for="' + this._id + '-challenge-edit">Завдання (можна змінити)</label>' +
              '<textarea id="' + this._id + '-challenge-edit" class="lesson-challenge-edit" rows="2" maxlength="280" data-role="challenge-edit"></textarea>' +
              '<div class="lesson-challenge-actions"><button class="lesson-button lesson-button-quiet" type="button" data-action="restore-challenge">Повернути початковий текст</button><button class="lesson-button lesson-button-primary" type="button" data-action="next-challenge">Наступний виклик</button></div>' +
              '<p class="lesson-small-note" data-role="challenge-status" role="status">Ваші зміни зберігаються автоматично.</p>' +
            '</section>' +
          '</div>' +
        '</div>' +
        '<footer class="lesson-footer"><span>Друк можна спланувати окремо; таймер не оцінює готовність моделі.</span><button class="lesson-button lesson-button-quiet" type="button" data-action="close">Закрити</button></footer>' +
      '</section>';
    document.body.appendChild(this._root);
    this._dialog = this._root.querySelector('.lesson-dialog');
    this._root.addEventListener('click', this._boundClick);
    this._root.addEventListener('input', this._boundInput);
    document.addEventListener('keydown', this._boundKeydown);
    this._renderTimeline();
    this._renderScenarios();
    this._renderScenarioDetail();
    this._renderChallenge();
    this._renderTimer();
    if (this._state.running) this._startTicker();
    return this;
  };

  LessonCompanion.prototype.open = function () {
    this.init();
    if (!this._root || !this._root.hidden) return this;
    this._returnFocus = document.activeElement;
    this._previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this._root.hidden = false;
    this._root.setAttribute('aria-hidden', 'false');
    this._dialog.focus();
    this._renderTimer();
    return this;
  };

  LessonCompanion.prototype.close = function () {
    if (!this._root || this._root.hidden) return this;
    this._saveChallengeEdit();
    this._root.hidden = true;
    this._root.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = this._previousBodyOverflow;
    if (this._returnFocus && typeof this._returnFocus.focus === 'function') this._returnFocus.focus();
    return this;
  };

  LessonCompanion.prototype.destroy = function () {
    if (this._timerHandle) window.clearInterval(this._timerHandle);
    this._timerHandle = null;
    if (this._root) {
      if (!this._root.hidden) {
        document.body.style.overflow = this._previousBodyOverflow;
        if (this._returnFocus && typeof this._returnFocus.focus === 'function') this._returnFocus.focus();
      }
      this._root.removeEventListener('click', this._boundClick);
      this._root.removeEventListener('input', this._boundInput);
      document.removeEventListener('keydown', this._boundKeydown);
      this._root.remove();
    }
    this._root = null;
    this._dialog = null;
  };

  LessonCompanion.prototype._renderTimeline = function () {
    const list = this._root.querySelector('[data-role="timeline"]');
    list.innerHTML = PHASES.map(function (phase, index) {
      return '<li class="lesson-phase" data-phase="' + index + '"><span class="lesson-phase-time">' + phase.minutes + '<small>хв</small></span><div class="lesson-phase-copy"><strong>' + phase.title + '</strong><span>' + phase.detail + '</span></div></li>';
    }).join('');
  };

  LessonCompanion.prototype._renderScenarios = function () {
    const host = this._root.querySelector('[data-role="scenarios"]');
    host.innerHTML = SCENARIOS.map(function (scenario) {
      const selected = scenario.id === this._state.scenarioId;
      return '<button class="lesson-scenario-card' + (selected ? ' is-selected' : '') + '" type="button" data-action="scenario" data-scenario="' + scenario.id + '" aria-pressed="' + selected + '"><span class="lesson-scenario-tag">' + scenario.tag + '</span><strong>' + scenario.title + '</strong><span class="lesson-scenario-mission">Місія ' + scenario.missionId + '</span></button>';
    }, this).join('');
    const gradeButtons = this._root.querySelectorAll('[data-action="grade"]');
    gradeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-grade') === this._state.grade));
    }, this);
  };

  LessonCompanion.prototype._renderScenarioDetail = function () {
    const scenario = SCENARIOS.find(function (item) { return item.id === this._state.scenarioId; }, this) || SCENARIOS[0];
    const detail = this._root.querySelector('[data-role="scenario-detail"]');
    const steps = scenario.steps[this._state.grade];
    detail.innerHTML =
      '<p class="lesson-detail-kicker">Навчальна мета</p><p class="lesson-scenario-goal">' + scenario.goal + '</p>' +
      '<ol class="lesson-steps">' + steps.map(function (step) { return '<li>' + step + '</li>'; }).join('') + '</ol>' +
      '<div class="lesson-mission-action"><button class="lesson-button lesson-button-outline" type="button" data-action="mission"' + (typeof this.options.onSelectMission === 'function' ? '' : ' disabled') + '>Показати місію ' + scenario.missionId + '</button><span data-role="mission-status" role="status">' + (typeof this.options.onSelectMission === 'function' ? 'Сюжет відкриється у студії.' : 'Відкриття місій підключається під час інтеграції.') + '</span></div>';
  };

  LessonCompanion.prototype._currentChallenge = function () {
    return CHALLENGES.find(function (item) { return item.id === this._state.challengeId; }, this) || CHALLENGES[0];
  };

  LessonCompanion.prototype._renderChallenge = function () {
    const challenge = this._currentChallenge();
    const textarea = this._root.querySelector('[data-role="challenge-edit"]');
    const progress = Math.max(1, Math.min(CHALLENGES.length, this._state.challengeCursor));
    textarea.value = Object.prototype.hasOwnProperty.call(this._state.challengeEdits, challenge.id) ? this._state.challengeEdits[challenge.id] : challenge.text;
    this._root.querySelector('[data-role="challenge-goal"]').textContent = challenge.goal;
    this._root.querySelector('[data-role="challenge-count"]').textContent = progress + ' / ' + CHALLENGES.length + ' цього кола';
    this._root.querySelector('[data-role="challenge-status"]').textContent = 'Ваші зміни зберігаються автоматично.';
  };

  LessonCompanion.prototype._getElapsed = function (now) {
    const elapsed = this._state.elapsedMs + (this._state.running ? Math.max(0, now - this._state.startedAtMs) : 0);
    return Math.max(0, Math.min(LESSON_MS, elapsed));
  };

  LessonCompanion.prototype._renderTimer = function () {
    if (!this._root) return;
    const now = Date.now();
    let elapsed = this._getElapsed(now);
    if (this._state.running && elapsed >= LESSON_MS) {
      this._state.elapsedMs = LESSON_MS;
      this._state.running = false;
      this._state.startedAtMs = 0;
      this._persist();
      if (this._timerHandle) window.clearInterval(this._timerHandle);
      this._timerHandle = null;
      elapsed = LESSON_MS;
    }
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const clock = this._root.querySelector('[data-role="clock"]');
    clock.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    const progress = Math.floor(elapsed / 60000);
    const progressNode = this._root.querySelector('[data-role="progress"]');
    progressNode.setAttribute('aria-valuenow', String(progress));
    this._root.querySelector('[data-role="progress-fill"]').style.width = (elapsed / LESSON_MS * 100) + '%';
    this._root.querySelector('[data-action="start"]').hidden = this._state.running || elapsed >= LESSON_MS;
    this._root.querySelector('[data-action="pause"]').hidden = !this._state.running;
    const status = this._root.querySelector('[data-role="timer-status"]');
    if (elapsed >= LESSON_MS) status.textContent = '60 хвилин завершено. За потреби скиньте таймер для нового заняття.';
    else if (this._state.running) status.textContent = 'Таймер працює, навіть коли вікно закрите.';
    else if (elapsed > 0) status.textContent = 'Таймер на паузі.';
    else status.textContent = 'Таймер запускається лише на прохання вчителя.';
    let phaseIndex = PHASES.length - 1;
    let phaseEdge = 0;
    if (elapsed < LESSON_MS) {
      phaseIndex = 0;
      for (let i = 0; i < PHASES.length; i += 1) {
        phaseEdge += PHASES[i].minutes * 60000;
        if (elapsed < phaseEdge) { phaseIndex = i; break; }
      }
    }
    this._root.querySelectorAll('.lesson-phase').forEach(function (phase, index) {
      if (index === phaseIndex && elapsed < LESSON_MS) phase.setAttribute('aria-current', 'step');
      else phase.removeAttribute('aria-current');
    });
  };

  LessonCompanion.prototype._startTicker = function () {
    if (this._timerHandle) return;
    const self = this;
    this._timerHandle = window.setInterval(function () { self._renderTimer(); }, 1000);
    this._renderTimer();
  };

  LessonCompanion.prototype._saveChallengeEdit = function () {
    if (!this._root) return;
    const textarea = this._root.querySelector('[data-role="challenge-edit"]');
    if (!textarea) return;
    const challenge = this._currentChallenge();
    this._state.challengeEdits[challenge.id] = textarea.value.slice(0, 280);
    this._persist();
    const status = this._root.querySelector('[data-role="challenge-status"]');
    if (status) status.textContent = 'Текст цього виклику збережено.';
  };

  LessonCompanion.prototype._handleInput = function (event) {
    if (!event.target.matches('[data-role="challenge-edit"]')) return;
    const challenge = this._currentChallenge();
    this._state.challengeEdits[challenge.id] = event.target.value.slice(0, 280);
    this._persist();
    const status = this._root.querySelector('[data-role="challenge-status"]');
    if (status) status.textContent = 'Зміни збережено автоматично.';
  };

  LessonCompanion.prototype._nextChallenge = function () {
    this._saveChallengeEdit();
    if (this._state.challengeCursor >= CHALLENGES.length) {
      this._state.challengeOrder = shuffledChallenges(this._state.challengeId);
      this._state.challengeCursor = 0;
    }
    this._state.challengeId = this._state.challengeOrder[this._state.challengeCursor];
    this._state.challengeCursor += 1;
    this._persist();
    this._renderChallenge();
  };

  LessonCompanion.prototype._handleClick = function (event) {
    if (event.target === this._root) { this.close(); return; }
    const button = event.target.closest('[data-action]');
    if (!button || !this._root.contains(button)) return;
    const action = button.getAttribute('data-action');
    if (action === 'close') { this.close(); return; }
    if (action === 'grade') {
      this._state.grade = button.getAttribute('data-grade') === '4-6' ? '4-6' : '2-3';
      this._persist();
      this._renderScenarios();
      this._renderScenarioDetail();
      return;
    }
    if (action === 'scenario') {
      const selectedId = button.getAttribute('data-scenario');
      if (!SCENARIOS.some(function (item) { return item.id === selectedId; })) return;
      this._state.scenarioId = selectedId;
      this._persist();
      this._renderScenarios();
      this._renderScenarioDetail();
      return;
    }
    if (action === 'mission') {
      const scenario = SCENARIOS.find(function (item) { return item.id === this._state.scenarioId; }, this);
      if (scenario && typeof this.options.onSelectMission === 'function') {
        this.options.onSelectMission(scenario.missionId);
        this._root.querySelector('[data-role="mission-status"]').textContent = 'Місію передано студії.';
      }
      return;
    }
    if (action === 'start') {
      if (this._getElapsed(Date.now()) < LESSON_MS && !this._state.running) {
        this._state.running = true;
        this._state.startedAtMs = Date.now();
        this._persist();
        this._startTicker();
      }
      return;
    }
    if (action === 'pause') {
      this._state.elapsedMs = this._getElapsed(Date.now());
      this._state.running = false;
      this._state.startedAtMs = 0;
      this._persist();
      if (this._timerHandle) window.clearInterval(this._timerHandle);
      this._timerHandle = null;
      this._renderTimer();
      return;
    }
    if (action === 'reset') {
      this._state.elapsedMs = 0;
      this._state.running = false;
      this._state.startedAtMs = 0;
      this._persist();
      if (this._timerHandle) window.clearInterval(this._timerHandle);
      this._timerHandle = null;
      this._renderTimer();
      return;
    }
    if (action === 'next-challenge') { this._nextChallenge(); return; }
    if (action === 'restore-challenge') {
      const challenge = this._currentChallenge();
      delete this._state.challengeEdits[challenge.id];
      this._persist();
      this._renderChallenge();
    }
  };

  LessonCompanion.prototype._handleKeydown = function (event) {
    if (!this._root || this._root.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(this._dialog.querySelectorAll('button:not([disabled]):not([hidden]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(function (element) { return element.offsetParent !== null; });
    if (!focusable.length) { event.preventDefault(); this._dialog.focus(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === this._dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  window.LessonCompanion = LessonCompanion;
})();
