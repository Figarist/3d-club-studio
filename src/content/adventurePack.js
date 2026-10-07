// Offline lesson content for 3D Club Studio. Load after missionManager.js and
// generators/minecraftForge.js, before app.js so both public registries exist.
(function () {
  'use strict';

  const PACK_ID = 'studio-adventure-pack';
  const presets = window.MINECRAFT_PRESETS;
  const registry = window.StudioContentRegistry;
  if (!presets || !registry) {
    throw new Error('StudioAdventurePack requires MINECRAFT_PRESETS and StudioContentRegistry.');
  }

  const SIZE = 16;
  const CELL_COUNT = SIZE * SIZE;
  const recommendedParams = Object.freeze({
    voxelSize: '1.8',
    heightStep: '0.9',
    solidBase: true,
    mountType: 'none'
  });

  function paint(grid, x, y, level) {
    if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) grid[y][x] = level;
  }

  function rect(grid, x1, y1, x2, y2, level) {
    for (let y = y1; y <= y2; y += 1) {
      for (let x = x1; x <= x2; x += 1) paint(grid, x, y, level);
    }
  }

  // A Manhattan-stepped line keeps every pair of neighboring cells connected.
  function line4(grid, x1, y1, x2, y2, level) {
    let x = x1;
    let y = y1;
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x2 >= x1 ? 1 : -1;
    const sy = y2 >= y1 ? 1 : -1;
    let movedX = 0;
    let movedY = 0;
    paint(grid, x, y, level);

    while (movedX < dx || movedY < dy) {
      const nextXProgress = dx ? (movedX + 1) / dx : Infinity;
      const nextYProgress = dy ? (movedY + 1) / dy : Infinity;
      if (movedX < dx && (movedY >= dy || nextXProgress <= nextYProgress)) {
        x += sx;
        movedX += 1;
      } else {
        y += sy;
        movedY += 1;
      }
      paint(grid, x, y, level);
    }
  }

  function buildGrid(draw, presetKey) {
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    draw(grid, rect, line4);

    if (grid.length !== SIZE || grid.some((row) => row.length !== SIZE)) {
      throw new Error('Adventure preset must be a full 16×16 grid: ' + presetKey);
    }

    let start = null;
    const levels = new Set();
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        const level = grid[y][x];
        if (!Number.isInteger(level) || level < 0 || level > 4) {
          throw new Error('Adventure preset levels must be integers from 0 to 4: ' + presetKey);
        }
        if (level > 0) {
          levels.add(level);
          if (!start) start = [x, y];
        }
      }
    }

    if (!start || [1, 2, 3, 4].some((level) => !levels.has(level))) {
      throw new Error('Each adventure preset must use all four relief levels: ' + presetKey);
    }

    const pending = [start];
    const visited = new Set([start[1] * SIZE + start[0]]);
    while (pending.length) {
      const [x, y] = pending.pop();
      [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nx, ny]) => {
        if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE || grid[ny][nx] === 0) return;
        const index = ny * SIZE + nx;
        if (visited.has(index)) return;
        visited.add(index);
        pending.push([nx, ny]);
      });
    }

    const activeCount = grid.reduce((count, row) => count + row.filter((level) => level > 0).length, 0);
    if (visited.size !== activeCount) {
      throw new Error('Adventure preset contains a detached pixel: ' + presetKey);
    }
    return grid.map((row) => row.map((level) => level || '.').join(''));
  }

  const motifs = [
    {
      key: 'adv_space_rocket',
      themeId: 'space',
      themeLabel: 'Космічна експедиція',
      name: '🚀 Ракета дослідників',
      concept: 'Порівняй широку основу і вузький ніс ракети; зміни візерунок ілюмінатора.',
      colors: { 1: 0x263449, 2: 0x55718f, 3: 0x38bdf8, 4: 0xfef08a },
      draw(grid, fill) {
        fill(grid, 7, 1, 8, 2, 1);
        fill(grid, 6, 3, 9, 3, 1);
        fill(grid, 5, 4, 10, 9, 1);
        fill(grid, 4, 10, 11, 12, 1);
        fill(grid, 6, 4, 9, 9, 2);
        fill(grid, 6, 8, 9, 8, 3);
        fill(grid, 7, 6, 8, 7, 4);
        fill(grid, 4, 8, 5, 10, 3);
        fill(grid, 10, 8, 11, 10, 3);
        fill(grid, 7, 11, 8, 14, 4);
      }
    },
    {
      key: 'adv_space_rover',
      themeId: 'space',
      themeLabel: 'Космічна експедиція',
      name: '🌙 Місяцехід-шукач',
      concept: 'Зміни датчик і розташування коліс, щоб обговорити опору та центр ваги.',
      colors: { 1: 0x303b30, 2: 0x65834c, 3: 0x9dc76a, 4: 0xffd166 },
      draw(grid, fill) {
        fill(grid, 4, 6, 11, 10, 1);
        fill(grid, 5, 6, 10, 8, 2);
        fill(grid, 3, 10, 5, 12, 1);
        fill(grid, 10, 10, 12, 12, 1);
        fill(grid, 4, 10, 4, 11, 4);
        fill(grid, 11, 10, 11, 11, 4);
        fill(grid, 7, 3, 8, 5, 2);
        fill(grid, 6, 7, 9, 7, 3);
        fill(grid, 7, 6, 8, 6, 4);
      }
    },
    {
      key: 'adv_space_satellite',
      themeId: 'space',
      themeLabel: 'Космічна експедиція',
      name: '🛰️ Супутник зв’язку',
      concept: 'Побудуй велику центральну панель і приєднані сонячні крила.',
      colors: { 1: 0x334155, 2: 0x2563a8, 3: 0x67c7eb, 4: 0xffd166 },
      draw(grid, fill, line) {
        fill(grid, 6, 5, 9, 10, 1);
        fill(grid, 1, 6, 5, 9, 2);
        fill(grid, 10, 6, 14, 9, 2);
        fill(grid, 2, 7, 4, 8, 3);
        fill(grid, 11, 7, 13, 8, 3);
        fill(grid, 7, 6, 8, 9, 3);
        fill(grid, 7, 7, 8, 8, 4);
        line(grid, 7, 2, 8, 4, 3);
        fill(grid, 6, 4, 9, 4, 1);
      }
    },
    {
      key: 'adv_space_comet',
      themeId: 'space',
      themeLabel: 'Космічна експедиція',
      name: '☄️ Комета з хвостом',
      concept: 'Додай або прибери хвостові смуги й поміркуй, як напрямок задає рух.',
      colors: { 1: 0x263449, 2: 0x6755a8, 3: 0xa78bfa, 4: 0xfef08a },
      draw(grid, fill, line) {
        fill(grid, 10, 2, 11, 2, 2);
        fill(grid, 9, 3, 12, 3, 2);
        fill(grid, 8, 4, 13, 4, 2);
        fill(grid, 9, 5, 12, 5, 2);
        fill(grid, 10, 6, 11, 6, 2);
        fill(grid, 10, 3, 11, 5, 3);
        fill(grid, 11, 4, 11, 4, 4);
        line(grid, 2, 13, 9, 6, 1);
        line(grid, 4, 14, 9, 5, 3);
        line(grid, 3, 11, 9, 5, 2);
      }
    },
    {
      key: 'adv_nature_leaf',
      themeId: 'nature',
      themeLabel: 'Природні детективи',
      name: '🍃 Листок із жилками',
      concept: 'Зміни центральну жилку та бічні гілочки, не розділяючи листок.',
      colors: { 1: 0x36513a, 2: 0x4f9a58, 3: 0xa8d56b, 4: 0xf2dc73 },
      draw(grid, fill, line) {
        fill(grid, 7, 2, 8, 2, 1);
        fill(grid, 6, 3, 9, 3, 1);
        fill(grid, 5, 4, 10, 4, 1);
        fill(grid, 4, 5, 11, 5, 1);
        fill(grid, 3, 6, 12, 8, 1);
        fill(grid, 4, 9, 11, 9, 1);
        fill(grid, 5, 10, 10, 10, 1);
        fill(grid, 6, 11, 9, 11, 1);
        fill(grid, 7, 12, 8, 12, 1);
        fill(grid, 5, 5, 10, 9, 2);
        line(grid, 7, 11, 10, 4, 3);
        line(grid, 6, 9, 3, 7, 2);
        line(grid, 8, 8, 12, 6, 2);
        line(grid, 7, 11, 4, 14, 1);
        fill(grid, 10, 4, 10, 4, 4);
      }
    },
    {
      key: 'adv_nature_bee',
      themeId: 'nature',
      themeLabel: 'Природні детективи',
      name: '🐝 Бджола-запилювач',
      concept: 'Познач крила та смуги; простеж, як частини мають з’єднатися з тулубом.',
      colors: { 1: 0x40351e, 2: 0xe3a928, 3: 0xffd85e, 4: 0xf7fbff },
      draw(grid, fill, line) {
        fill(grid, 4, 7, 11, 10, 1);
        fill(grid, 5, 6, 10, 6, 1);
        fill(grid, 5, 3, 7, 7, 2);
        fill(grid, 8, 3, 10, 7, 2);
        fill(grid, 6, 4, 7, 6, 4);
        fill(grid, 8, 4, 9, 6, 3);
        fill(grid, 6, 7, 7, 10, 2);
        fill(grid, 9, 7, 10, 10, 2);
        fill(grid, 5, 7, 5, 7, 4);
        fill(grid, 10, 7, 10, 7, 4);
        line(grid, 5, 6, 4, 4, 3);
        line(grid, 10, 6, 11, 4, 3);
      }
    },
    {
      key: 'adv_nature_mountain',
      themeId: 'nature',
      themeLabel: 'Природні детективи',
      name: '🏔️ Гірський профіль',
      concept: 'Перемісти снігову шапку й порівняй висоту схилів та обриси хребта.',
      colors: { 1: 0x40526a, 2: 0x527d91, 3: 0x76b6b2, 4: 0xf3f7ed },
      draw(grid, fill) {
        fill(grid, 8, 3, 8, 3, 2);
        fill(grid, 7, 4, 9, 4, 2);
        fill(grid, 6, 5, 10, 5, 2);
        fill(grid, 5, 6, 11, 6, 2);
        fill(grid, 4, 7, 12, 7, 2);
        fill(grid, 3, 8, 13, 8, 2);
        fill(grid, 2, 9, 13, 12, 2);
        fill(grid, 2, 13, 13, 13, 1);
        fill(grid, 7, 4, 8, 4, 4);
        fill(grid, 6, 5, 9, 5, 4);
        fill(grid, 5, 6, 7, 6, 3);
        fill(grid, 8, 6, 10, 6, 3);
        fill(grid, 3, 9, 4, 10, 1);
      }
    },
    {
      key: 'adv_nature_mushroom',
      themeId: 'nature',
      themeLabel: 'Природні детективи',
      name: '🍄 Лісовий гриб',
      concept: 'Перероби плями на шапці й залиш ніжку з’єднаною з основою.',
      colors: { 1: 0x5e4832, 2: 0xc84c45, 3: 0xe98168, 4: 0xffe8c7 },
      draw(grid, fill) {
        fill(grid, 7, 3, 8, 3, 2);
        fill(grid, 5, 4, 10, 4, 2);
        fill(grid, 3, 5, 12, 5, 2);
        fill(grid, 2, 6, 13, 6, 2);
        fill(grid, 1, 7, 14, 7, 2);
        fill(grid, 2, 8, 13, 8, 2);
        fill(grid, 6, 8, 9, 13, 1);
        fill(grid, 4, 5, 5, 5, 4);
        fill(grid, 10, 5, 11, 5, 4);
        fill(grid, 7, 6, 8, 6, 4);
        fill(grid, 5, 8, 10, 8, 3);
        fill(grid, 5, 12, 10, 13, 1);
        fill(grid, 7, 9, 8, 12, 3);
        fill(grid, 7, 10, 8, 10, 4);
      }
    },
    {
      key: 'adv_city_house',
      themeId: 'city',
      themeLabel: 'Міські майстри',
      name: '🏠 Будинок із сонячним дахом',
      concept: 'Переплануй двері та вікна, залишивши стіни й дах єдиною пластиною.',
      colors: { 1: 0x58443d, 2: 0xb96b49, 3: 0xe6a552, 4: 0xf4e5a4 },
      draw(grid, fill) {
        fill(grid, 7, 2, 8, 2, 1);
        fill(grid, 6, 3, 9, 3, 1);
        fill(grid, 5, 4, 10, 4, 1);
        fill(grid, 4, 5, 11, 5, 1);
        fill(grid, 3, 6, 12, 6, 1);
        fill(grid, 2, 7, 13, 7, 1);
        fill(grid, 3, 8, 12, 13, 1);
        fill(grid, 4, 8, 11, 12, 2);
        fill(grid, 5, 9, 6, 10, 4);
        fill(grid, 9, 9, 10, 10, 4);
        fill(grid, 7, 10, 8, 13, 3);
        fill(grid, 4, 5, 5, 5, 3);
        fill(grid, 10, 5, 11, 5, 3);
      }
    },
    {
      key: 'adv_city_bridge',
      themeId: 'city',
      themeLabel: 'Міські майстри',
      name: '🌉 Міст через струмок',
      concept: 'Зміни арку та опори; поясни, куди передається вага настилу.',
      colors: { 1: 0x394553, 2: 0x69818d, 3: 0x72b7aa, 4: 0xf3d47b },
      draw(grid, fill, line) {
        fill(grid, 1, 5, 14, 6, 1);
        fill(grid, 2, 5, 13, 5, 2);
        fill(grid, 3, 6, 4, 12, 1);
        fill(grid, 11, 6, 12, 12, 1);
        fill(grid, 7, 7, 8, 12, 2);
        fill(grid, 2, 12, 5, 13, 1);
        fill(grid, 10, 12, 13, 13, 1);
        line(grid, 4, 11, 7, 7, 3);
        line(grid, 8, 7, 11, 11, 3);
        fill(grid, 6, 5, 9, 5, 4);
      }
    },
    {
      key: 'adv_city_turbine',
      themeId: 'city',
      themeLabel: 'Міські майстри',
      name: '🌬️ Вітрова турбіна',
      concept: 'Перестав три лопаті навколо маточини й знайди місце, де вони з’єднані.',
      colors: { 1: 0x35515c, 2: 0x398a9b, 3: 0x79c8c3, 4: 0xf4d66d },
      draw(grid, fill, line) {
        fill(grid, 7, 8, 8, 14, 1);
        fill(grid, 5, 14, 10, 14, 2);
        fill(grid, 6, 6, 9, 9, 2);
        line(grid, 7, 6, 7, 1, 3);
        line(grid, 6, 7, 2, 11, 3);
        line(grid, 9, 7, 13, 11, 3);
        fill(grid, 7, 7, 8, 8, 4);
        fill(grid, 6, 1, 8, 2, 4);
        fill(grid, 1, 11, 3, 12, 4);
        fill(grid, 12, 11, 14, 12, 4);
      }
    },
    {
      key: 'adv_city_sundial',
      themeId: 'city',
      themeLabel: 'Міські майстри',
      name: '☀️ Сонячний годинник',
      concept: 'Зміни напрям тіні та поясни, як світло задає її положення.',
      colors: { 1: 0x51483a, 2: 0x9b8050, 3: 0xe1bb61, 4: 0xfff0a8 },
      draw(grid, fill, line) {
        fill(grid, 4, 6, 11, 6, 1);
        fill(grid, 3, 7, 12, 11, 1);
        fill(grid, 4, 12, 11, 12, 1);
        fill(grid, 4, 7, 11, 10, 2);
        fill(grid, 2, 12, 13, 13, 1);
        line(grid, 8, 9, 8, 2, 3);
        line(grid, 8, 9, 12, 5, 4);
        fill(grid, 7, 8, 9, 9, 4);
        fill(grid, 5, 8, 5, 9, 3);
        fill(grid, 11, 8, 11, 9, 3);
      }
    }
  ];

  const packPresets = Object.create(null);
  motifs.forEach((motif) => {
    if (Object.prototype.hasOwnProperty.call(packPresets, motif.key)) {
      throw new Error('Adventure preset key is duplicated: ' + motif.key);
    }
    packPresets[motif.key] = {
      name: motif.name,
      isMiniPreset: true,
      recommendedParams: Object.assign({}, recommendedParams),
      colors: Object.assign({}, motif.colors),
      grid: buildGrid(motif.draw, motif.key),
      adventure: {
        packId: PACK_ID,
        themeId: motif.themeId,
        themeLabel: motif.themeLabel,
        concept: motif.concept
      }
    };
  });

  const categoryLabels = {
    relief: '🛡️ Рельєф • дослідження',
    texture: '🐾 Фактури і сліди • природа',
    boardgame: '🎲 Настільні ігри • дослідники',
    useful: '🏷️ Корисні дрібниці • місто',
    cardboard: '🏙️ Картонний мегаполіс',
    optical: '🔮 Оптичний експеримент'
  };

  const missionSpecs = [
    {
      id: 13, key: 'adv_space_rocket', category: 'relief',
      title: '🚀 Рятувальна ракета',
      question: 'Яка ракета залишить зрозумілий знак для команди на далекій планеті?',
      starter: 'Зміни форму ілюмінатора та щонайменше три клітинки корпусу.',
      challenge: 'Перероби контур і перевір, чи лишилися ніс, крила й корпус одним рельєфом.',
      test: 'Увімкни один колір і перевір, чи читається ракета за силуетом.',
      explain: 'Покажи, як широкий корпус і короткі крила тримаються разом у сітці.'
    },
    {
      id: 14, key: 'adv_space_rover', category: 'relief',
      title: '🌙 Місяцехід для кам’яної долини',
      question: 'Як місяцехід може триматися на нерівній поверхні Місяця?',
      starter: 'Перемісти один датчик і зміни розташування щонайменше трьох клітинок коліс.',
      challenge: 'Зміни відстань між колесами, зберігши з’єднання з корпусом.',
      test: 'У монохромі перевір, що колеса не злилися з корпусом в одну пляму.',
      explain: 'Порівняй ширину опори й положення датчика на початковому та власному варіанті.'
    },
    {
      id: 15, key: 'adv_space_satellite', category: 'relief',
      title: '🛰️ Супутник для мапи сигналу',
      question: 'Які частини супутника збирають енергію, а які передають сигнал?',
      starter: 'Зміни візерунок обох сонячних крил і познач центральний приймач.',
      challenge: 'Надай крилам симетрію або навмисно її поруш, а потім поясни свій вибір.',
      test: 'Перевір одним кольором, що корпус і обидва крила залишаються з’єднаними.',
      explain: 'Назви на моделі панелі, корпус і приймач; покажи, як вони торкаються.'
    },
    {
      id: 16, key: 'adv_space_comet', category: 'texture',
      title: '☄️ Слід комети',
      question: 'Що допоможе відрізнити ядро комети від її довгого хвоста?',
      starter: 'Перебудуй щонайменше три клітинки хвоста та додай власний відблиск ядра.',
      challenge: 'Створи дві хвостові смуги різної довжини, не відриваючи їх від ядра.',
      test: 'Подивись на силует в одному кольорі й знайди напрямок хвоста.',
      explain: 'Розкажи, яка смуга або фактура передає рух, а яка підкреслює ядро.'
    },
    {
      id: 17, key: 'adv_nature_leaf', category: 'texture',
      title: '🍃 Листок під лупою',
      question: 'Як жилки листка розходяться від середини до краю?',
      starter: 'Зміни центральну жилку та намалюй щонайменше дві бічні гілочки.',
      challenge: 'Проклади жилки так, щоб кожна торкалася центральної та не відділяла край.',
      test: 'Перевір, чи гілочки видно і в одному кольорі, і за різницею висот.',
      explain: 'Покажи центральну жилку та два місця, де вона підтримує візерунок.'
    },
    {
      id: 18, key: 'adv_nature_bee', category: 'texture',
      title: '🐝 Бджола на квітковому маршруті',
      question: 'Які позначки допоможуть упізнати запилювача на квітковому маршруті?',
      starter: 'Зміни порядок смуг і колір крил щонайменше в трьох клітинках.',
      challenge: 'Зроби крила виразними, а тулуб і вусики з’єднаними з основною формою.',
      test: 'Перевір, що крила не стали окремими острівцями та силует лишився впізнаваним.',
      explain: 'Назви ознаки запилювача, які ти передав формою або рельєфом.'
    },
    {
      id: 19, key: 'adv_nature_mountain', category: 'boardgame',
      title: '🏔️ Карта гірської стежки',
      question: 'Як позначити снігову вершину та безпечну стежку на настільній мапі?',
      starter: 'Перемісти снігову шапку й познач щонайменше три клітинки стежки.',
      challenge: 'Зміни профіль схилу, але залиш широку основу та єдину карту-рельєф.',
      test: 'Уявно проведи маршрут від підніжжя до вершини й покажи його на силуеті.',
      explain: 'Покажи, як висота й форма схилу відрізняють вершину від долини.'
    },
    {
      id: 20, key: 'adv_nature_mushroom', category: 'boardgame',
      title: '🍄 Маркер лісового пошуку',
      question: 'Яка ознака допоможе гравцям знайти гриб на карті лісу?',
      starter: 'Перероби плями на шапці та зміни щонайменше три клітинки.',
      challenge: 'Створи власний візерунок шапки, зберігши її з’єднання з ніжкою.',
      test: 'Попроси сусіда знайти шапку, ніжку й основу, дивлячись на модель збоку.',
      explain: 'Поясни, як візерунок допомагає побачити гриб на ігровій мапі.'
    },
    {
      id: 21, key: 'adv_city_house', category: 'useful',
      title: '🏠 Знак дружнього будинку',
      question: 'Який знак на будинку легко помітити й прочитати з першого погляду?',
      starter: 'Зміни вікна, двері й щонайменше одну частину даху.',
      challenge: 'Перебудуй фасад так, щоб вікна не зруйнували суцільну основу.',
      test: 'Перевір одним кольором, чи дах, двері та стіни все ще впізнаються.',
      explain: 'Покажи корисну підказку на фасаді й поясни її призначення.'
    },
    {
      id: 22, key: 'adv_city_bridge', category: 'cardboard',
      title: '🌉 Міст для картонного міста',
      question: 'Де потрібні опори, щоб настил мосту мав шлях до берега?',
      starter: 'Зміни арку та щонайменше одну опору мосту.',
      challenge: 'Перебудуй проліт, зберігши з’єднання настилу з опорами.',
      test: 'Простеж пальцем шлях від середини настилу до обох берегів.',
      explain: 'Поясни, як опори передають навантаження від настилу до землі.'
    },
    {
      id: 23, key: 'adv_city_turbine', category: 'cardboard',
      title: '🌬️ Вітрова турбіна району',
      question: 'Як три лопаті можуть торкатися маточини та залишатися однією моделлю?',
      starter: 'Перемісти одну лопать і зміни щонайменше три клітинки навколо маточини.',
      challenge: 'Зміни напрям лопатей, перевіривши кожне з’єднання з маточиною.',
      test: 'У монохромі простеж усі три лопаті від кінчика до центру.',
      explain: 'Покажи маточину, лопаті й опору та назви їхні ролі.'
    },
    {
      id: 24, key: 'adv_city_sundial', category: 'optical',
      title: '☀️ Сонячний годинник світла й тіні',
      question: 'Куди впаде тінь, якщо сонячне світло прийде з іншого боку?',
      starter: 'Зміни напрям тіні та щонайменше три клітинки шкали.',
      challenge: 'Перемалюй шкалу навколо гномона й покажи інший напрям світла.',
      test: 'Покрути модель і перевір, чи тінь відрізняється від шкали за висотою.',
      explain: 'Покажи гномон і тінь та поясни, як змінив би їх напрямок ліхтарик.'
    }
  ];

  const missions = missionSpecs.map((spec) => {
    if (!Object.prototype.hasOwnProperty.call(packPresets, spec.key)) {
      throw new Error('Adventure mission refers to a missing preset: ' + spec.key);
    }
    return {
      id: spec.id,
      key: PACK_ID + ':' + spec.key,
      packId: PACK_ID,
      presetKey: spec.key,
      category: spec.category,
      categoryLabel: categoryLabels[spec.category],
      title: spec.title,
      targetSize: 'до 28,8 × 28,8 × 7,2 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      theme: packPresets[spec.key].adventure.themeLabel,
      riddle: spec.question,
      grade23: spec.starter + ' Початковий шаблон потрібно змінити власноруч.',
      grade46: spec.challenge + ' Обґрунтуй одне інженерне рішення.',
      steps: {
        riddle: spec.question,
        design: spec.starter + ' Намалюй власну відповідь пензлем.',
        mono: spec.test,
        improve: spec.challenge,
        result: spec.explain
      },
      checklist: [
        'Чи з’єднані всі активні клітинки в одну деталь?',
        'Чи читається твоя власна зміна в одному кольорі?',
        'Чи відповідає форма розміру до 28,8 × 28,8 × 7,2 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: spec.key,
        controls: {
          mcVoxelSize: recommendedParams.voxelSize,
          mcHeightStep: recommendedParams.heightStep,
          mcSolidBase: recommendedParams.solidBase,
          mcMountType: recommendedParams.mountType,
          mcCustomLabel: ''
        }
      }
    };
  });

  const registration = registry.registerPack({
    id: PACK_ID,
    presets: packPresets,
    missions
  }, { presetTarget: presets });
  const missionIds = registration.missionIds;
  const missionIdByPresetKey = Object.create(null);
  missions.forEach((mission) => {
    missionIdByPresetKey[mission.presetKey] = mission.id;
  });

  const presetKeys = motifs.map((motif) => motif.key);
  const groups = [
    { id: 'space', title: 'Космічна експедиція' },
    { id: 'nature', title: 'Природні детективи' },
    { id: 'city', title: 'Міські майстри' }
  ].map((group) => {
    const groupPresetKeys = motifs
      .filter((motif) => motif.themeId === group.id)
      .map((motif) => motif.key);
    return Object.freeze({
      id: group.id,
      title: group.title,
      presetKeys: Object.freeze(groupPresetKeys),
      missionIds: Object.freeze(groupPresetKeys.map((key) => missionIdByPresetKey[key]))
    });
  });

  window.StudioAdventurePack = Object.freeze({
    metadata: Object.freeze({
      id: PACK_ID,
      version: '1.0.0',
      title: 'Експедиції: космос, природа й місто',
      summary: '12 авторських рельєфів і місій для дослідження, власних змін та перевірки геометрії.',
      locale: 'uk',
      gridSize: SIZE,
      activeLevels: [1, 2, 3, 4],
      recommendedParams: Object.assign({}, recommendedParams),
      footprintLimitMm: 28.8,
      heightLimitMm: 7.2,
      themes: ['space', 'nature', 'city'],
      filterCategories: ['relief', 'texture', 'boardgame', 'useful', 'cardboard', 'optical']
    }),
    presetKeys: Object.freeze(presetKeys),
    missionIds: Object.freeze(missionIds),
    missionIdByPresetKey: Object.freeze(missionIdByPresetKey),
    groups: Object.freeze(groups)
  });
})();
