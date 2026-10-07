// Менеджер навчальних місій (12 місій гуртка, чек-листи, фільтри) для студії «3D Кузня Чудес»
(function () {
  const STUDIO_MISSIONS = [
    // === 4 РЕЛЬЄФИ ===
    {
      id: 1,
      key: 'studio-core:mission-01',
      category: 'relief',
      categoryLabel: '🛡️ Рельєф (1/4)',
      title: '⚡ Паспорт таємного дослідника',
      targetSize: 'до 35×35 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«Твоя команда вирушає на невідому планету, де немає кольорових екранів. Створи рельєфний знак суперсили, за яким тебе впізнають на дотик і за тінню — без імені й кольору!»',
      grade23: 'Обери шаблон «Паспорт Героя», зміни центральний символ суперсили та використай щонайменше 2 рівні висоти (Шар 1 — основа, Шар 3–4 — високий знак).',
      grade46: 'Побудуй власну емблему професії чи суперсили з 3 рівнями висоти (рамка, фон, головний символ) у габариті до 35×35 мм так, щоб жодна деталь не розпадалася.',
      steps: {
        riddle: 'Яка твоя суперсила в експедиції? Обери простий символ (блискавка, зірка, ключ).',
        design: 'Намалюй фон на Шарі 1, захисну рамку на Шарі 2–3 та головний знак на Шарі 4.',
        mono: 'Увімкни «🪨 1 Пластик» і перевір, чи добре читається рельєф завдяки тіні.',
        improve: 'Прибери поодинокі пікселі та переконайся, що вушко брелока надійно тримається.',
        result: 'Збережи проєкт у .json, покажи 3D-модель друзям і поясни обрані рівні висоти!'
      },
      checklist: [
        'Чи з\'єднані всі частини значка в 1 деталь?',
        'Чи впізнається силует суперсили в 1 кольорі (🪨 1 Пластик)?',
        'Чи вкладається модель у габарит до 35×35 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'hero_badge',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.2', mcSolidBase: true, mcMountType: 'keychain', mcCustomLabel: '' }
      }
    },
    {
      id: 2,
      key: 'studio-core:mission-02',
      category: 'relief',
      categoryLabel: '🛡️ Рельєф (2/4)',
      title: '🛡️ Герб космічної фортеці',
      targetSize: 'до 35×35 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«Над воротами стародавньої бази зберігся лише контур щита. Віднови його рельєфний герб так, щоб сторожа бачила знак здалеку при бічному світлі ліхтаря!»',
      grade23: 'Намалюй усередині контуру щита великий симетричний символ (хрест, крила або вежу) високими блоками (Шар 3 або 4).',
      grade46: 'Спроєктуй трирівневий герб на щиті до 35×35 мм так, щоб між бортиком (Шар 3) і центральним знаком лишався читабельний заглиблений фон (Шар 1–2), або підготуй заготовку для Tinkercad.',
      steps: {
        riddle: 'Чому на стародавніх щитах і печатках робили високі бортики й глибокий фон?',
        design: 'Залиш міцний контур щита (Шар 3) і створи всередині рельєфний герб (Шар 4).',
        mono: 'Перемкни на «🪨 1 Пластик» і покрути камеру — чи не зливається символ із рамкою?',
        improve: 'Зроби лінії символу товщиною щонайменше 2 клітинки, щоб сопло принтера промалювало їх чітко.',
        result: 'Презентуй легенду свого герба або експортуй .STL у Tinkercad для додавання кріплення!'
      },
      checklist: [
        'Чи з\'єднані всі частини герба зі щитом?',
        'Чи впізнається силует герба в 1 кольорі без розфарбування?',
        'Чи вкладається щит у габарит до 35×35 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'shield',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.2', mcSolidBase: true, mcMountType: 'none', mcCustomLabel: '' }
      }
    },
    {
      id: 3,
      key: 'studio-core:mission-03',
      category: 'relief',
      categoryLabel: '🛡️ Рельєф (3/4)',
      title: '⚔️ Артефакт світла й тіні',
      targetSize: 'до 35×35 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«У темній печері всі предмети здаються сірими. Як зробити так, щоб міні-артефакт виглядав об\'ємним і виразним, коли принтер друкує лише одним пластиком?»',
      grade23: 'Увімкни кнопку «🪨 1 Пластик» і підніми центральні клітинки леза або кристала на Шар 4, щоб посередині з\'явилося високе ребро.',
      grade46: 'Побудуй ступінчастий перехід висот від країв (Шар 1) до центру (Шар 4) у габариті до 35×35 мм, усунувши вузькі діагональні з\'єднання.',
      steps: {
        riddle: 'Як створити відчуття гострого леза або гранованого кристала за допомогою 4 сходинок висоти?',
        design: 'Використай Шар 1 для основи рукояті, Шар 2–3 для схилів і Шар 4 для центрального хребта.',
        mono: 'Перевір у режимі «🪨 1 Пластик» та увімкни «🔥 Симуляція», щоб побачити порядок друку шарів.',
        improve: 'Перевір, чи немає клітинок, що тримаються лише кутиком по діагоналі.',
        result: 'Поясни парі, як кожна сходинка висоти змінює тінь на моделі!'
      },
      checklist: [
        'Чи з\'єднані всі частини в 1 міцну деталь?',
        'Чи впізнається ступінчастий рельєф в 1 кольорі?',
        'Чи вкладається артефакт у габарит до 35×35 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'sword',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.3', mcSolidBase: true, mcMountType: 'none', mcCustomLabel: '' }
      }
    },
    {
      id: 4,
      key: 'studio-core:mission-04',
      category: 'relief',
      categoryLabel: '🛡️ Рельєф (4/4)',
      title: '🔧 Інженерний ремонт (V1 → V2)',
      targetSize: 'до 32×32 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«Перша версія артефакту (V1) виявилася занадто масивною або мала слабкі місця. Твоя місія — створити покращену версію V2: компактнішу, міцнішу та виразнішу!»',
      grade23: 'Збережи початкову модель (кнопка «📥 Зберегти»), прибери зайві блоки по кутах і зроби очі/серцевину тотема вищими (Шар 4).',
      grade46: 'Збережи V1 у .json, оптимізуй силует до ≤32×32 мм, перевір індикатор зв\'язності та порівняй V1 і V2 за габаритами й об\'ємом.',
      steps: {
        riddle: 'Знайди на моделі V1 місця, де деталі зливаються або витрачають зайвий пластик.',
        design: 'Збережи V1 («📥 Зберегти»), потім відредагуй форму до чіткої версії V2.',
        mono: 'Увімкни «🪨 1 Пластик» і перевір, чи стали очі та контур виразнішими.',
        improve: 'Перевір у верхньому бейджі, на скільки зменшився габарит і чернетковий об\'єм (см³).',
        result: 'Покажи однокласникам різницю між V1 та V2 і поясни, чому V2 краща для друку!'
      },
      checklist: [
        'Чи з\'єднані всі частини V2 без розривів?',
        'Чи став силует V2 чіткішим в 1 кольорі порівняно з V1?',
        'Чи вкладається оновлена модель у габарит до 32×32 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'totem',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.2', mcSolidBase: true, mcMountType: 'none', mcCustomLabel: '' }
      }
    },

    // === 2 ФАКТУРИ / СЛІДИ ===
    {
      id: 5,
      key: 'studio-core:mission-05',
      category: 'texture',
      categoryLabel: '🐾 Фактури і сліди (1/2)',
      title: '🐾 Хто залишив цей слід?',
      targetSize: 'до 32×32 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«Біля табору дослідників на застиглій глині знайшли загадковий відбиток лапи! Відтвори плитку зі слідом так, щоб за рельєфом подушечок і кігтів можна було вгадати, чий він.»',
      grade23: 'Зміни форму подушечки та кількість пальців на плитці, використовуючи низький шар для поля (Шар 1) і високий для сліду та кігтів (Шар 3–4).',
      grade46: 'Створи рельєфну плитку-штамп до 32×32 мм із двома типами висот (обрамлення, глибоке дно, випуклі подушечки й кігті) та загадай сусіду по парті, якій істоті належить слід.',
      steps: {
        riddle: 'Скільки пальців, пазурів чи перетинок має твоя фантастична або лісова істота?',
        design: 'Намалюй на плитці подушечку лапи (Шар 3) та гострі кінчики кігтів (Шар 4) на фоні Шару 1.',
        mono: 'Увімкни «🪨 1 Пластик» і подивись зверху («⬇️ Зверху») — чи чітко видно кожен палець?',
        improve: 'Залиш між подушечками проміжок у 1 клітинку Шару 1, щоб вони не злилися під час друку.',
        result: 'Зіграйте в парі у гру «Вгадай істоту за її 3D-слідом» прямо на екрані!'
      },
      checklist: [
        'Чи лежать усі елементи сліду на спільній суцільній плитці?',
        'Чи впізнається відбиток лапи в 1 кольорі (🪨 1 Пластик)?',
        'Чи вкладається плитка у габарит до 32×32 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'creature_track',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.3', mcSolidBase: true, mcMountType: 'none', mcCustomLabel: '' }
      }
    },
    {
      id: 6,
      key: 'studio-core:mission-06',
      category: 'texture',
      categoryLabel: '🐾 Фактури і сліди (2/2)',
      title: '🐚 Археологічна експедиція (Скам\'янілість)',
      targetSize: 'до 32×32 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«Під час розкопок знайдено кам\'яну породу з відбитком стародавньої мушлі-амоніта або доісторичного листка. Прояви спіраль чи прожилки за допомогою сходинок висоти!»',
      grade23: 'Промалюй спіраль раковини або прожилки листка високими блоками (Шар 3–4) поверх кам\'яної плитки (Шар 1).',
      grade46: 'Побудуй багатошарову скам\'янілість (порода Шар 1, схил Шар 2, гребені спіралі Шар 3–4) у межах 32×32 мм і перевір, як бічне світло проявляє фактуру без жодної фарби.',
      steps: {
        riddle: 'Як археологи бачать ледь помітні відбитки мушель і рослин на сірому камені?',
        design: 'Створи на плитці спіраль амоніта, панцир трилобіта або гілку папороті з переходами висот 1→2→3→4.',
        mono: 'Перемкни на «🪨 1 Пластик» і покрути модель мишкою, спостерігаючи за грою світла й тіні.',
        improve: 'Підкресли центральну лінію або витки спіралі найвищим Шаром 4.',
        result: 'Оформи паспорт своєї археологічної знахідки (вік, глибина шару, розмір у мм)!'
      },
      checklist: [
        'Чи з\'єднані всі гребені скам\'янілості з кам\'яною плиткою?',
        'Чи проявляється фактура раковини/листка в 1 кольорі?',
        'Чи вкладається знахідка у габарит до 32×32 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'fossil_shell',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.2', mcSolidBase: true, mcMountType: 'none', mcCustomLabel: '' }
      }
    },

    // === 2 НАСТІЛЬНІ ІГРИ / ЖЕТОНИ ===
    {
      id: 7,
      key: 'studio-core:mission-07',
      category: 'boardgame',
      categoryLabel: '🎲 Настільні ігри (1/2)',
      title: '🪙 Монета вигаданого міста',
      targetSize: 'до 32×32 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«У нашому вигаданому місті паперові гроші зникли. Потрібно викарбувати монету із захисним бортиком, емблемою та номіналом без дрібного тексту, щоб її впізнавали навіть на дотик!»',
      grade23: 'Збережи круглий обідок монети (Шар 3) і намалюй у центрі великий символ міста або число рисками (I, II, V, ★) на Шарі 4.',
      grade46: 'Спроєктуй монету до 32×32 мм із захисним рантом (Шар 3), заглибленим полем (Шар 1) і центральним знаком номіналу (Шар 4) без дрібних літер; придумай правила обміну в парі.',
      steps: {
        riddle: 'Чому на справжніх монетах по краю завжди є опуклий бортик (гурт/рант), а дрібні літери на 3D-принтері зливаються?',
        design: 'Залиш кільцевий бортик (Шар 3) і викарбуй у центрі (Шар 4) великий герб або номінал.',
        mono: 'Увімкни «🪨 1 Пластик» і перевір, чи можна відрізнити твою монету від монети сусіда за силуетом.',
        improve: 'Прибери занадто дрібні деталі — залиш чіткий геометричний знак і риски номіналу.',
        result: 'Презентуй назву своєї валюти та курс обміну в економічній грі гуртка!'
      },
      checklist: [
        'Чи утворює монета 1 суцільний круглий жетон?',
        'Чи читається номінал і символ в 1 кольорі без дрібного тексту?',
        'Чи вкладається монета у габарит до 32×32 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'city_coin',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.2', mcSolidBase: true, mcMountType: 'none', mcCustomLabel: '' }
      }
    },
    {
      id: 8,
      key: 'studio-core:mission-08',
      category: 'boardgame',
      categoryLabel: '🎲 Настільні ігри (2/2)',
      title: '🎲 Гра, якої ще не існувало (Жетон гравця)',
      targetSize: 'до 32×32 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«Наш гурток створює спільну настільну гру на великому картонному полі! Оскільки всі фішки друкуються одним пластиком, кожен клас гравця має відрізнятися формою та рельєфом.»',
      grade23: 'Створи фішку свого класу (Маг, Будівельник, Дослідник, Захисник) із виразним силуетом і придумай, як він ходить по клітинках.',
      grade46: 'У парі розробіть 2 різних класи жетонів (до 32×32 мм) із контрастними контурами, щоб їх неможливо було сплутати в одному кольорі, та протестуйте баланс правил.',
      steps: {
        riddle: 'Як гравці впізнають свою фішку на ігровому полі, якщо всі фішки сірі або білі?',
        design: 'Зміни зовнішній контур жетона (круглий, ромбовий, зубчастий) та додай символ класу на Шарі 4.',
        mono: 'Увімкни «🪨 1 Пластик» і порівняй свій жетон із жетоном напарника з відстані витягнутої руки.',
        improve: 'Підсиль контраст між основою (Шар 1–2) та центральною емблемою класу (Шар 4).',
        result: 'Намалюйте на аркуші паперу клітинкове поле і зіграйте тестову партію!'
      },
      checklist: [
        'Чи з\'єднані всі частини жетона в 1 деталь?',
        'Чи легко відрізнити цей клас гравця від інших в 1 кольорі?',
        'Чи вкладається жетон у габарит клітинки поля (до 32×32 мм)?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'game_token',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.3', mcSolidBase: true, mcMountType: 'none', mcCustomLabel: '' }
      }
    },

    // === 2 КОРИСНІ ДРІБНИЦІ ===
    {
      id: 9,
      key: 'studio-core:mission-09',
      category: 'useful',
      categoryLabel: '🏷️ Корисна дрібниця (1/2)',
      title: '🏷️ Табличка-маркер для рослини чи коробки',
      targetSize: 'до 35×35 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«У шкільній майстерні переплуталися коробки з деталями та горщики з рослинами. Створи довговічну пластикову мітку з зрозумілою піктограмою, яка не боїться води!»',
      grade23: 'Намалюй на табличці просту піктограму (росток, краплину, шестерню чи блискавку) на Шарі 3–4 поверх міцної основи (Шар 1–2).',
      grade46: 'Спроєктуй компактну табличку-маркер до 35×35 мм із захисною рамкою (Шар 2) та піктограмою (Шар 4), обери тип кріплення (вушко або чиста плитка) і поясни її призначення.',
      steps: {
        riddle: 'Яку річ у класі або вдома потрібно промаркувати зрозумілим знаком без слів?',
        design: 'Використай шаблон «Міні-Табличка»: залиш рамку Шару 2 і намалюй всередині чітку піктограму Шару 4.',
        mono: 'Перевір у режимі «🪨 1 Пластик», чи зрозуміла піктограма з першого погляду.',
        improve: 'Якщо табличка вішається на шнурок — обери «🔑 Міцне вушко»; якщо клеїться на ящик — «🧱 Чиста плитка».',
        result: 'Покажи готову 3D-табличку та розкажи, де саме вона працюватиме!'
      },
      checklist: [
        'Чи з\'єднані рамка, фон і піктограма в 1 деталь?',
        'Чи зрозуміла піктограма в 1 кольорі без підписів?',
        'Чи вкладається табличка у габарит до 35×35 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'mini_tag',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.2', mcSolidBase: true, mcMountType: 'keychain', mcCustomLabel: '' }
      }
    },
    {
      id: 10,
      key: 'studio-core:mission-10',
      category: 'useful',
      categoryLabel: '🏷️ Корисна дрібниця (2/2)',
      title: '🔑 Іменний брелок-ідентифікатор для рюкзака',
      targetSize: 'до 35×35 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«Десять однакових чорних рюкзаків лежать у роздягальні після уроку. Створи компактний рельєфний брелок із міцним вушком, за яким ти знайдеш свій рюкзак за 1 секунду!»',
      grade23: 'Обери улюблений символ або емблему, увімкни «🔑 Міцне вушко для брелока» та перевір, щоб верхній край фігури надійно тримався за кільце.',
      grade46: 'Побудуй персональний жетон (воксель 2.0 мм) із рельєфним знаком суперсили або ініціалом у центрі, перевір міцність перемички біля вушка (отвір 6 мм) та відсутність крихких кутиків.',
      steps: {
        riddle: 'Чому занадто тонкі й довгі виступи на брелоку можуть зламатися в кишені чи на рюкзаку?',
        design: 'Створи компактну округлу або щитоподібну форму (Шар 1–2) і викарбуй свій знак зверху (Шар 3–4).',
        mono: 'Увімкни «🪨 1 Пластик» і подивись, чи добре виділяється твій знак над основою.',
        improve: 'Переконайся, що верхній рядок малюнка достатньо широкий для надійного з\'єднання з вушком.',
        result: 'Збережи персональний файл .json та .STL для черги друку!'
      },
      checklist: [
        'Чи надійно з\'єднане вушко брелока з основною фігурою?',
        'Чи впізнається твій знак в 1 кольорі (🪨 1 Пластик)?',
        'Чи вкладається брелок у компактний габарит до 35×35 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'hero_badge',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.2', mcSolidBase: true, mcMountType: 'keychain', mcCustomLabel: '' }
      }
    },

    // === 1 КАРТОННИЙ МЕГАПОЛІС ===
    {
      id: 11,
      key: 'studio-core:mission-11',
      category: 'cardboard',
      categoryLabel: '🏙️ Картонний мегаполіс (1/1)',
      title: '🏙️ Місто майбутнього (Пазова підставка для картону)',
      targetSize: 'до 32×32 мм',
      generatorLabel: '⛏️ Майнкрафт-Кузня',
      targetTab: 'minecraft',
      riddle: '«Друкувати цілий будинок на 3D-принтері — це 5 годин, а вирізати з картону — 5 хвилин! Але картонні стіни падають. Спроєктуй маленьку 3D-підставку з пазом, яка триматиме високу картонну вежу або героя!»',
      grade23: 'Розглянь шаблон «Паз для Картону» або протестуй картон на «Калібраторі пазів». Налаштуй ширину паза (1.5–3.0 мм) та прикрась боки підставки контрфорсами (Шар 2–3).',
      grade46: 'Протестуй картон на «Калібраторі пазів гуртка», обери точну ширину паза (1.5, 2.0, 2.5 або 3.0 мм з авто-допуском +0.2 мм та фаскою) і створи підставку до 32×32 мм.',
      steps: {
        riddle: 'Як поєднати швидке макетування з картону та точність 3D-друку в одному спільному мегаполісі?',
        design: 'Обери ширину паза під свій картон (за зразком калібратора), перевір наявність фаски на вході та зміцни бічні підпори Шарами 2–3.',
        mono: 'Увімкни «🪨 1 Пластик» і поверни камеру збоку («🔄 Збоку 90°»), щоб побачити глибину канавки для картону!',
        improve: 'Зроби широкі бічні сходинки (Шар 2 і 3), щоб підставка не перекидалася під вагою картонної декорації.',
        result: 'Виріж із картону силует будівлі чи персонажа і презентуй макет своєї споруди!'
      },
      checklist: [
        'Чи підібрано точну ширину паза під картон за калібратором?',
        'Чи з\'єднані обидва борти тримача спільною підошвою та фаскою?',
        'Чи вкладається підставка у габарит до 32×32 мм?'
      ],
      config: {
        tab: 'minecraft',
        mcPreset: 'cardboard_stand',
        controls: { mcVoxelSize: '2.0', mcHeightStep: '1.6', mcSolidBase: true, mcMountType: 'none', mcSlotWidth: '2.0', mcCustomLabel: '' }
      }
    },

    // === 1 ОПТИЧНИЙ ЕКСПЕРИМЕНТ ===
    {
      id: 12,
      key: 'studio-core:mission-12',
      category: 'optical',
      categoryLabel: '🔮 Оптичний експеримент (1/1)',
      title: '🔮 Одна річ — дві тіні (Секретний знак 0° / 90°)',
      targetSize: 'до 32×32 мм (1–2 символи)',
      generatorLabel: '🔮 Оптичний Перевертень',
      targetTab: 'illusion',
      riddle: '«Чи може один суцільний нерухомий шматочок пластику показувати одну літеру спереду (0°), а при повороті на 90° — зовсім інший секретний символ? Перевір магію перетину двох проєкцій!»',
      grade23: 'Введи 1 або 2 символи (наприклад, «ОК» у Слово 1 та «⚔👑» або «★!» у Слово 2) і по черзі натискай кнопки «Ракурс 0°» та «Ракурс 90°».',
      grade46: 'Спроєктуй компактний двосимвольний шифр (1–2 знаки, воксель 2.2 мм, габарит ~28–32 мм), увімкни внутрішні опори під нависаннями й перевір читабельність обох проєкцій у режимі «🪨 1 Пластик».',
      steps: {
        riddle: 'Як перетин двох фігур (Intersection) дозволяє заховати два різних силуети в одному об\'єкті?',
        design: 'Введи короткий код із 1–2 символів у «Слово 1» та «Слово 2» (довгі слова друкуються занадто довго!).',
        mono: 'Увімкни «🪨 1 Пластик» і перевір ракурси «👁️ Спереду (0°)» та «🔄 Збоку (90°)».',
        improve: 'Увімкни галочку «Внутрішні стовпчики під нависаючими вокселями літер» і зменш воксель до 2.2 мм.',
        result: 'Загадай друзям загадку: покажи модель під кутом 45°, щоб вони вгадали обидва сховані символи!'
      },
      checklist: [
        'Чи з\'єднані літери спільним п\'єдесталом та внутрішніми опорами?',
        'Чи чітко читаються обидва символи під кутами 0° та 90° в 1 кольорі?',
        'Чи вкладається коротка ілюзія (1–2 символи) у габарит до 32×32 мм?'
      ],
      config: {
        tab: 'illusion',
        controls: { ilWord1: 'ОК', ilWord2: '⚔👑', ilVoxelSize: '2.2', ilSafeSupports: true, ilLayoutMode: 'diagonal' }
      }
    }
  ];

  const contentRegistry = window.StudioContentRegistry;
  if (!contentRegistry) {
    throw new Error('MissionManager requires src/contentRegistry.js to be loaded first.');
  }
  contentRegistry.registerBaseMissions(STUDIO_MISSIONS);

  class MissionManager {
    constructor(options = {}) {
      this.registry = contentRegistry;
      this.missions = this.registry.missions;
      this.activeMissionId = options.initialMissionId || 1;
      this.activeMissionKey = this.registry.getMissionKey(this.activeMissionId);
      this.missionFilter = 'all';
      this.missionChecks = { connected: false, mono: false, size: false };
      this.bodyCollapsed = false;
      this.cardVisible = options.initialCardVisible !== undefined ? !!options.initialCardVisible : true;
      this.onMissionChange = options.onMissionChange || null;
      this.onChecklistChange = options.onChecklistChange || null;
    }

    getActiveMission() {
      return this.registry.resolveMission(this.activeMissionKey || this.activeMissionId);
    }

    setMission(id, forceShow = false) {
      const found = this.registry.resolveMission(id);
      if (!found) return null;

      this.activeMissionId = found.id;
      this.activeMissionKey = found.key;
      this.missionChecks = { connected: false, mono: false, size: false };
      if (forceShow) {
        this.cardVisible = true;
      }
      if (typeof this.onMissionChange === 'function') {
        this.onMissionChange(found);
      }
      return found;
    }

    nextMission() {
      const current = this.getActiveMission();
      if (!current) return null;
      const idx = this.missions.indexOf(current);
      if (idx < 0 || this.missions.length === 0) return null;
      const nextIdx = (idx + 1) % this.missions.length;
      return this.setMission(this.missions[nextIdx].id, true);
    }

    prevMission() {
      const current = this.getActiveMission();
      if (!current) return null;
      const idx = this.missions.indexOf(current);
      if (idx < 0 || this.missions.length === 0) return null;
      const prevIdx = (idx - 1 + this.missions.length) % this.missions.length;
      return this.setMission(this.missions[prevIdx].id, true);
    }

    setFilter(cat) {
      this.missionFilter = cat || 'all';
    }

    setCardVisibility(visible) {
      this.cardVisible = !!visible;
      return this.cardVisible;
    }

    toggleCardVisibility() {
      this.cardVisible = !this.cardVisible;
      return this.cardVisible;
    }

    setBodyCollapse(collapsed) {
      this.bodyCollapsed = !!collapsed;
      return this.bodyCollapsed;
    }

    toggleBodyCollapse() {
      this.bodyCollapsed = !this.bodyCollapsed;
      return this.bodyCollapsed;
    }

    setCheck(key, val) {
      if (Object.prototype.hasOwnProperty.call(this.missionChecks, key)) {
        this.missionChecks[key] = !!val;
        if (typeof this.onChecklistChange === 'function') {
          this.onChecklistChange(this.missionChecks);
        }
      }
    }

    getState() {
      return {
        activeMissionId: this.activeMissionId,
        activeMissionKey: this.activeMissionKey,
        missionChecks: Object.assign({}, this.missionChecks),
        cardVisible: this.cardVisible,
        bodyCollapsed: this.bodyCollapsed
      };
    }

    applyState(state) {
      if (!state || typeof state !== 'object') return false;
      const hasStableKey = Object.prototype.hasOwnProperty.call(state, 'activeMissionKey');
      const missionReference = hasStableKey ? state.activeMissionKey : state.activeMissionId;
      const activeMission = missionReference === undefined ? this.getActiveMission() : this.registry.resolveMission(missionReference);
      if (!activeMission) return false;

      this.activeMissionId = activeMission.id;
      this.activeMissionKey = activeMission.key;
      if (typeof state.cardVisible === 'boolean') {
        this.cardVisible = state.cardVisible;
      }
      if (typeof state.bodyCollapsed === 'boolean') {
        this.bodyCollapsed = state.bodyCollapsed;
      }
      if (state.missionChecks && typeof state.missionChecks === 'object') {
        this.missionChecks = {
          connected: !!state.missionChecks.connected,
          mono: !!state.missionChecks.mono,
          size: !!state.missionChecks.size
        };
      }
      return true;
    }

    updateActiveMissionUI(domCache) {
      const dom = domCache || {};
      const m = this.getActiveMission();
      if (!m) return;

      if (dom.activeMissionBadge) {
        dom.activeMissionBadge.textContent = `🗺️ Місія #${m.id} • ${m.categoryLabel}`;
      }
      if (dom.activeMissionTitle) {
        dom.activeMissionTitle.textContent = m.title;
      }
      if (dom.activeMissionMeta) {
        dom.activeMissionMeta.textContent = `🎯 Габарит: ${m.targetSize} • ${m.generatorLabel}`;
      }
      if (dom.activeMissionRiddle) {
        dom.activeMissionRiddle.textContent = m.riddle;
      }
      if (dom.activeMissionG23) {
        dom.activeMissionG23.textContent = m.grade23;
      }
      if (dom.activeMissionG46) {
        dom.activeMissionG46.textContent = m.grade46;
      }
      if (dom.activeMissionSteps) {
        dom.activeMissionSteps.innerHTML = [
          `<span class="mission-step-pill"><b>1. Загадка:</b> ${m.steps.riddle}</span>`,
          `<span class="mission-step-pill"><b>2. Власний дизайн:</b> ${m.steps.design}</span>`,
          `<span class="mission-step-pill"><b>3. Перевірка 1 пластиком:</b> ${m.steps.mono}</span>`,
          `<span class="mission-step-pill"><b>4. Вдосконалення:</b> ${m.steps.improve}</span>`,
          `<span class="mission-step-pill"><b>5. Результат (і без друку):</b> ${m.steps.result}</span>`
        ].join('');
      }

      if (dom.chkMissionConnected) {
        dom.chkMissionConnected.checked = !!this.missionChecks.connected;
        if (dom.chkMissionConnected.nextElementSibling && m.checklist[0]) {
          dom.chkMissionConnected.nextElementSibling.textContent = m.checklist[0];
        }
      }
      if (dom.chkMissionMono) {
        dom.chkMissionMono.checked = !!this.missionChecks.mono;
        if (dom.chkMissionMono.nextElementSibling && m.checklist[1]) {
          dom.chkMissionMono.nextElementSibling.textContent = m.checklist[1];
        }
      }
      if (dom.chkMissionSize) {
        dom.chkMissionSize.checked = !!this.missionChecks.size;
        if (dom.chkMissionSize.nextElementSibling && m.checklist[2]) {
          dom.chkMissionSize.nextElementSibling.textContent = m.checklist[2];
        }
      }
      if (dom.activeMissionBody) {
        dom.activeMissionBody.classList.toggle('collapsed', this.bodyCollapsed);
      }

      const card = dom.activeMissionCard || document.getElementById('active-mission-card');
      const btnToggle = dom.btnToggleMissionBody || document.getElementById('btn-toggle-mission-body');

      if (card) {
        card.style.display = this.cardVisible ? 'flex' : 'none';
      }
      if (btnToggle) {
        btnToggle.innerHTML = this.bodyCollapsed ? '🔽 Розгорнути' : '🔼 Згорнути';
        btnToggle.title = this.bodyCollapsed ? 'Розгорнути опис місії' : 'Згорнути опис місії';
      }
    }

    renderMissionsModal(domCache, onStartCallback) {
      const dom = domCache || {};
      const container = dom.missionsGrid;
      if (!container) return;

      const list = this.missionFilter === 'all'
        ? this.missions
        : this.missions.filter((m) => m.category === this.missionFilter);

      container.innerHTML = '';
      list.forEach((m) => {
        const card = document.createElement('article');
        card.className = 'mission-card' + (m.id === this.activeMissionId ? ' active-mission' : '');
        card.innerHTML = `
          <div class="mission-card-inner">
            <div class="mission-card-header">
              <span class="mission-card-num">Місія #${m.id} • ${m.categoryLabel}</span>
              <span class="mission-card-size">📐 ${m.targetSize}</span>
            </div>
            <h3 class="mission-card-title">${m.title}</h3>
            <div class="mission-riddle-box">${m.riddle}</div>
            <div class="mission-grades-row">
              <div class="mission-grade-item"><span class="grade-tag grade-23">2–3 класи</span>${m.grade23}</div>
              <div class="mission-grade-item"><span class="grade-tag grade-46">4–6 класи</span>${m.grade46}</div>
            </div>
            <div class="mission-card-steps">
              <div><b>1. Загадка →</b> ${m.steps.riddle}</div>
              <div><b>2. Власний дизайн →</b> ${m.steps.design}</div>
              <div><b>3. Огляд в 1 кольорі →</b> ${m.steps.mono}</div>
              <div><b>4. Вдосконалення →</b> ${m.steps.improve}</div>
              <div><b>5. Результат →</b> ${m.steps.result}</div>
            </div>
            <div class="mission-card-checklist">
              <div class="checklist-title">✅ Чек-лист самоперевірки:</div>
              <div>• ${m.checklist[0]}</div>
              <div>• ${m.checklist[1]}</div>
              <div>• ${m.checklist[2]}</div>
            </div>
          </div>
          <div class="mission-card-footer">
            <span class="mission-gen-label">${m.generatorLabel}</span>
            <button class="btn-start-mission" data-start-mission="${m.id}">🚀 Почати місію</button>
          </div>
        `;
        const startBtn = card.querySelector('[data-start-mission]');
        if (startBtn) {
          startBtn.addEventListener('click', () => {
            if (typeof onStartCallback === 'function') {
              onStartCallback(m.id);
            }
          });
        }
        container.appendChild(card);
      });
    }
  }

  window.STUDIO_MISSIONS = contentRegistry.missions;
  window.MissionManager = MissionManager;
})();
