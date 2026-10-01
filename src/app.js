// Головний контролер студії «3D Кузня Чудес»
(function () {
  const STORAGE_KEY = '3d_kuznya_project_autosave_v1';

  // Каталог із 12 навчальних місій гуртка (4 рельєфи, 2 фактури/сліди, 2 настільні ігри/жетони, 2 корисні дрібниці, 1 картонний мегаполіс, 1 оптичний експеримент)
  const STUDIO_MISSIONS = [
    // === 4 РЕЛЬЄФИ ===
    {
      id: 1,
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

  window.STUDIO_MISSIONS = STUDIO_MISSIONS;

  class StudioApp {
    constructor() {
      this.activeTab = 'minecraft'; // 'minecraft', 'illusion', 'physics', 'mob'
      this.viewMode = 'split';      // 'editor', 'split', 'viewport'
      this.sceneManager = null;

      this.activeMissionId = 1;
      this.missionFilter = 'all';
      this.missionChecks = { connected: false, mono: false, size: false };
      this.missionBodyCollapsed = false;

      this.undoStack = [];
      this.redoStack = [];
      this.maxHistory = 35;
      this._isRestoring = false;
      this.v1Snapshot = null;

      this.mcGen = new window.MinecraftForgeGenerator();
      this.illusionGen = new window.DualIllusionGenerator();
      this.physicsGen = new window.PhysicsMechanicsGenerator();
      this.mobGen = new window.MobMutatorGenerator();

      this.mcGen.onBeforeMutate = () => this.recordUndoSnapshot();
      this.mcGen.onAfterMutate = () => {
        this.updateMinecraftConnectivityUI();
        this.markModelModified();
        this.autosave();
      };
    }

    init() {
      this.sceneManager = new window.SceneManager('viewport-container');
      this.sceneManager.init();
      this.sceneManager.onDimensionsUpdated = () => {
        this.updateDiagnosticsUI();
      };

      // Кешуємо DOM-елементи
      this._domCache = {
        workspace: document.getElementById('main-workspace'),
        autosaveTag: document.getElementById('autosave-tag'),
        btnUndo: document.getElementById('btn-undo'),
        btnRedo: document.getElementById('btn-redo'),
        btnMcUndo: document.getElementById('btn-mc-undo'),
        btnToggleMono: document.getElementById('btn-toggle-mono'),
        btnHudMono: document.getElementById('btn-hud-mono'),
        monoColorPicker: document.getElementById('mono-color-picker'),
        verificationBadge: document.getElementById('print-verification-badge'),
        verificationSelect: document.getElementById('verification-status-select'),
        slicerTimeInput: document.getElementById('slicer-time-input'),
        geomCheckPill: document.getElementById('geom-check-pill'),
        mcConnectivityStatus: document.getElementById('mc-connectivity-status'),
        illusionCameraBar: document.getElementById('illusion-camera-bar'),
        physicsActionBar: document.getElementById('physics-action-bar'),
        missionsModal: document.getElementById('missions-modal'),
        missionsGrid: document.getElementById('missions-grid-container'),
        activeMissionBadge: document.getElementById('active-mission-badge'),
        activeMissionTitle: document.getElementById('active-mission-title'),
        activeMissionMeta: document.getElementById('active-mission-meta'),
        activeMissionBody: document.getElementById('active-mission-body'),
        activeMissionRiddle: document.getElementById('active-mission-riddle'),
        activeMissionG23: document.getElementById('active-mission-g23'),
        activeMissionG46: document.getElementById('active-mission-g46'),
        activeMissionSteps: document.getElementById('active-mission-steps'),
        chkMissionConnected: document.getElementById('chk-mission-connected'),
        chkMissionMono: document.getElementById('chk-mission-mono'),
        chkMissionSize: document.getElementById('chk-mission-size'),
        mcVoxelSize: document.getElementById('mc-voxel-size'),
        mcHeightStep: document.getElementById('mc-height-step'),
        mcSolidBase: document.getElementById('mc-solid-base'),
        mcMountType: document.getElementById('mc-mount-type'),
        mcSlotWidth: document.getElementById('mc-slot-width'),
        mcSlotWidthGroup: document.getElementById('mc-slot-width-group'),
        valMcSlot: document.getElementById('val-mc-slot'),
        mcCustomLabel: document.getElementById('mc-custom-label'),
        valMcVoxel: document.getElementById('val-mc-voxel'),
        valMcStep: document.getElementById('val-mc-step'),
        ilWord1: document.getElementById('il-word1'),
        ilWord2: document.getElementById('il-word2'),
        ilVoxelSize: document.getElementById('il-voxel-size'),
        ilSafeSupports: document.getElementById('il-safe-supports'),
        ilLayoutMode: document.getElementById('il-layout-mode'),
        ilColorPrimary: document.getElementById('il-color-primary'),
        valIlVoxel: document.getElementById('val-il-voxel'),
        phSubmode: document.getElementById('ph-submode'),
        phExtrudeHeight: document.getElementById('ph-extrude-height'),
        phSpringThickness: document.getElementById('ph-spring-thickness'),
        phWingWeight: document.getElementById('ph-wing-weight'),
        phArmLength: document.getElementById('ph-arm-length'),
        phIncludeAmmo: document.getElementById('ph-include-ammo'),
        phCustomText: document.getElementById('ph-custom-text'),
        phSpringGroup: document.getElementById('ph-spring-group'),
        phWeightGroup: document.getElementById('ph-weight-group'),
        btnPhysicsDemo: document.getElementById('btn-physics-demo'),
        valPhHeight: document.getElementById('val-ph-height'),
        valPhSpring: document.getElementById('val-ph-spring'),
        valPhWeight: document.getElementById('val-ph-weight'),
        valPhArm: document.getElementById('val-ph-arm'),
        mobArchetype: document.getElementById('mob-archetype'),
        mobHeadScale: document.getElementById('mob-head-scale'),
        mobBodyBulk: document.getElementById('mob-body-bulk'),
        mobEyeType: document.getElementById('mob-eye-type'),
        mobHeadgear: document.getElementById('mob-headgear'),
        mobBackgear: document.getElementById('mob-backgear'),
        mobWeapon: document.getElementById('mob-weapon'),
        mobName: document.getElementById('mob-name'),
        mobTinkercadBlank: document.getElementById('mob-tinkercad-blank'),
        valMobHead: document.getElementById('val-mob-head'),
        valMobBulk: document.getElementById('val-mob-bulk'),
        btnSnapshotV1: document.getElementById('btn-snapshot-v1'),
        btnCompareV1V2: document.getElementById('btn-compare-v1v2'),
        btnPrintCard: document.getElementById('btn-print-card'),
        btnMissionV1Compare: document.getElementById('btn-mission-v1-compare'),
        btnMissionPrintCard: document.getElementById('btn-mission-print-card'),
        compareModal: document.getElementById('compare-modal'),
        btnCloseCompare: document.getElementById('btn-close-compare'),
        btnCloseCompareFooter: document.getElementById('btn-close-compare-footer'),
        btnReSnapshotV1: document.getElementById('btn-re-snapshot-v1'),
        btnCompareToPassport: document.getElementById('btn-compare-to-passport'),
        compareSummaryBanner: document.getElementById('compare-summary-banner'),
        v1PreviewImg: document.getElementById('v1-preview-img'),
        v2PreviewImg: document.getElementById('v2-preview-img'),
        v1Timestamp: document.getElementById('v1-timestamp'),
        v2Timestamp: document.getElementById('v2-timestamp'),
        v1Metrics: document.getElementById('v1-metrics'),
        v2Metrics: document.getElementById('v2-metrics'),
        printCardModal: document.getElementById('print-card-modal'),
        btnClosePrintCard: document.getElementById('btn-close-print-card'),
        btnActionPrint: document.getElementById('btn-action-print'),
        btnActionDownloadPng: document.getElementById('btn-action-download-png'),
        btnActionCopyText: document.getElementById('btn-action-copy-text'),
        cardPairInput: document.getElementById('card-pair-input'),
        pCardPair: document.getElementById('p-card-pair'),
        pCardDate: document.getElementById('p-card-date'),
        pCardImg: document.getElementById('p-card-img'),
        pCardFilename: document.getElementById('p-card-filename'),
        pCardMission: document.getElementById('p-card-mission'),
        pVerV1: document.getElementById('p-ver-v1'),
        pVerV2: document.getElementById('p-ver-v2'),
        pCardDims: document.getElementById('p-card-dims'),
        pCardConn: document.getElementById('p-card-conn'),
        pCardBase: document.getElementById('p-card-base'),
        pCardCustomParam: document.getElementById('p-card-custom-param'),
        pCardMono: document.getElementById('p-card-mono'),
        pCardChecklist: document.getElementById('p-card-checklist')
      };

      this.bindTabs();
      this.bindTopActions();
      this.bindMissionControls();
      this.bindViewModeControls();
      this.bindVerificationControls();
      this.bindMinecraftControls();
      this.bindIllusionControls();
      this.bindPhysicsControls();
      this.bindMobControls();

      // Відновлюємо попереднє автозбереження (якщо є) або рендеримо стартовий стан
      const restored = this.restoreAutosave();
      this.updateActiveMissionUI();
      this.renderMissionsModal();
      if (!restored) {
        this.mcGen.renderCanvasUI();
        this.rebuildCurrentModel(true);
      }
      this.updateHistoryButtons();
    }

    // -------------------------------------------------------------------------
    // ІСТОРІЯ ЗМІН (UNDO / REDO) ТА ЗБЕРЕЖЕННЯ ПРОЄКТУ (.JSON + LOCALSTORAGE)
    // -------------------------------------------------------------------------
    serializeState() {
      const dom = this._domCache || {};
      return {
        app: '3d-club-studio',
        version: '1.4.0',
        savedAt: new Date().toISOString(),
        activeTab: this.activeTab,
        activeMissionId: this.activeMissionId,
        v1Snapshot: this.v1Snapshot ? this.v1Snapshot : null,
        studentPairCode: dom.cardPairInput?.value || localStorage.getItem('3d_kuznya_pair_code') || '',
        missionChecks: Object.assign({}, this.missionChecks),
        monochrome: this.sceneManager ? this.sceneManager.isMonochrome : false,
        monoColor: dom.monoColorPicker?.value || '#cfd6df',
        verificationStatus: dom.verificationSelect?.value || 'generated',
        slicerNote: dom.slicerTimeInput?.value || '',
        minecraft: this.mcGen.getState(),
        controls: {
          mcVoxelSize: dom.mcVoxelSize?.value,
          mcHeightStep: dom.mcHeightStep?.value,
          mcSolidBase: dom.mcSolidBase?.checked,
          mcMountType: dom.mcMountType?.value,
          mcSlotWidth: dom.mcSlotWidth?.value || '2.0',
          mcCustomLabel: dom.mcCustomLabel?.value,
          ilWord1: dom.ilWord1?.value,
          ilWord2: dom.ilWord2?.value,
          ilVoxelSize: dom.ilVoxelSize?.value,
          ilSafeSupports: dom.ilSafeSupports?.checked,
          ilLayoutMode: dom.ilLayoutMode?.value,
          ilColorPrimary: dom.ilColorPrimary?.value,
          phSubmode: dom.phSubmode?.value,
          phExtrudeHeight: dom.phExtrudeHeight?.value,
          phSpringThickness: dom.phSpringThickness?.value,
          phWingWeight: dom.phWingWeight?.value,
          phArmLength: dom.phArmLength?.value,
          phIncludeAmmo: dom.phIncludeAmmo?.checked,
          phCustomText: dom.phCustomText?.value,
          mobArchetype: dom.mobArchetype?.value,
          mobHeadScale: dom.mobHeadScale?.value,
          mobBodyBulk: dom.mobBodyBulk?.value,
          mobEyeType: dom.mobEyeType?.value,
          mobHeadgear: dom.mobHeadgear?.value,
          mobBackgear: dom.mobBackgear?.value,
          mobWeapon: dom.mobWeapon?.value,
          mobName: dom.mobName?.value,
          mobTinkercadBlank: dom.mobTinkercadBlank?.checked
        }
      };
    }

    applyState(state, animatePop = false) {
      if (!state || typeof state !== 'object') return;
      this._isRestoring = true;
      const dom = this._domCache || {};
      const c = state.controls || {};

      if (state.activeMissionId) {
        this.activeMissionId = parseInt(state.activeMissionId, 10) || 1;
      }
      if (state.v1Snapshot) {
        this.v1Snapshot = state.v1Snapshot;
        if (dom.btnCompareV1V2) dom.btnCompareV1V2.style.display = 'inline-block';
        if (dom.btnSnapshotV1) dom.btnSnapshotV1.textContent = '📸 V1 збережено';
        if (dom.btnMissionV1Compare) dom.btnMissionV1Compare.classList.add('highlight');
      }
      if (state.studentPairCode) {
        localStorage.setItem('3d_kuznya_pair_code', state.studentPairCode);
        if (dom.cardPairInput) dom.cardPairInput.value = state.studentPairCode;
      }
      if (state.missionChecks && typeof state.missionChecks === 'object') {
        this.missionChecks = {
          connected: !!state.missionChecks.connected,
          mono: !!state.missionChecks.mono,
          size: !!state.missionChecks.size
        };
      }
      this.updateActiveMissionUI();

      const setVal = (el, val) => {
        if (el && val !== undefined && val !== null) el.value = val;
      };
      const setChk = (el, val) => {
        if (el && typeof val === 'boolean') el.checked = val;
      };

      setVal(dom.mcVoxelSize, c.mcVoxelSize);
      setVal(dom.mcHeightStep, c.mcHeightStep);
      setChk(dom.mcSolidBase, c.mcSolidBase);
      setVal(dom.mcMountType, c.mcMountType);
      setVal(dom.mcSlotWidth, c.mcSlotWidth || '2.0');
      setVal(dom.mcCustomLabel, c.mcCustomLabel);

      setVal(dom.ilWord1, c.ilWord1);
      setVal(dom.ilWord2, c.ilWord2);
      setVal(dom.ilVoxelSize, c.ilVoxelSize);
      setChk(dom.ilSafeSupports, c.ilSafeSupports);
      setVal(dom.ilLayoutMode, c.ilLayoutMode);
      setVal(dom.ilColorPrimary, c.ilColorPrimary);

      setVal(dom.phSubmode, c.phSubmode);
      setVal(dom.phExtrudeHeight, c.phExtrudeHeight);
      setVal(dom.phSpringThickness, c.phSpringThickness);
      setVal(dom.phWingWeight, c.phWingWeight);
      setVal(dom.phArmLength, c.phArmLength);
      setChk(dom.phIncludeAmmo, c.phIncludeAmmo);
      setVal(dom.phCustomText, c.phCustomText);

      if (dom.phSubmode) {
        const isBalancer = dom.phSubmode.value === 'balancer';
        if (dom.phSpringGroup) dom.phSpringGroup.style.display = isBalancer ? 'none' : 'block';
        if (dom.phWeightGroup) dom.phWeightGroup.style.display = isBalancer ? 'block' : 'none';
        if (dom.btnPhysicsDemo) {
          dom.btnPhysicsDemo.textContent = isBalancer
            ? '👆 Протестувати Магічний Баланс!'
            : '🚀 ВИСТРІЛИТИ З КАТАПУЛЬТИ!';
        }
      }

      setVal(dom.mobArchetype, c.mobArchetype);
      setVal(dom.mobHeadScale, c.mobHeadScale);
      setVal(dom.mobBodyBulk, c.mobBodyBulk);
      setVal(dom.mobEyeType, c.mobEyeType);
      setVal(dom.mobHeadgear, c.mobHeadgear);
      setVal(dom.mobBackgear, c.mobBackgear);
      setVal(dom.mobWeapon, c.mobWeapon);
      setVal(dom.mobName, c.mobName);
      setChk(dom.mobTinkercadBlank, c.mobTinkercadBlank);

      if (state.minecraft) {
        this.mcGen.setState(state.minecraft, false);
        document.querySelectorAll('[data-mc-preset]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-mc-preset') === this.mcGen.currentPresetKey);
        });
      }

      setVal(dom.verificationSelect, state.verificationStatus || 'generated');
      setVal(dom.slicerTimeInput, state.slicerNote || '');
      this.syncVerificationBadgeUI();

      if (state.monoColor && dom.monoColorPicker) {
        dom.monoColorPicker.value = state.monoColor;
        this.sceneManager.setMonochromeColor(parseInt(state.monoColor.replace('#', '0x'), 16));
      }
      if (typeof state.monochrome === 'boolean') {
        this.setMonochromeMode(state.monochrome);
      }

      this.updateValueLabels();
      const targetTab = state.activeTab || 'minecraft';
      this.switchTab(targetTab, true);
      this.rebuildCurrentModel(animatePop, true);
      this._isRestoring = false;
    }

    recordUndoSnapshot() {
      if (this._isRestoring) return;
      const snap = JSON.stringify(this.serializeState());
      if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === snap) {
        return;
      }
      this.undoStack.push(snap);
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift();
      }
      this.redoStack = [];
      this.updateHistoryButtons();
    }

    undo() {
      if (this.undoStack.length === 0) return;
      const currentSnap = JSON.stringify(this.serializeState());
      this.redoStack.push(currentSnap);
      const prevSnap = this.undoStack.pop();
      this.applyState(JSON.parse(prevSnap), false);
      this.updateHistoryButtons();
      this.autosave();
      if (window.StudioSound) window.StudioSound.playPop(360);
    }

    redo() {
      if (this.redoStack.length === 0) return;
      const currentSnap = JSON.stringify(this.serializeState());
      this.undoStack.push(currentSnap);
      const nextSnap = this.redoStack.pop();
      this.applyState(JSON.parse(nextSnap), false);
      this.updateHistoryButtons();
      this.autosave();
      if (window.StudioSound) window.StudioSound.playPop(520);
    }

    updateHistoryButtons() {
      const dom = this._domCache || {};
      const canUndo = this.undoStack.length > 0;
      const canRedo = this.redoStack.length > 0;
      if (dom.btnUndo) dom.btnUndo.disabled = !canUndo;
      if (dom.btnMcUndo) dom.btnMcUndo.disabled = !canUndo;
      if (dom.btnRedo) dom.btnRedo.disabled = !canRedo;
    }

    autosave() {
      if (this._isRestoring) return;
      try {
        const payload = JSON.stringify(this.serializeState());
        localStorage.setItem(STORAGE_KEY, payload);
        const dom = this._domCache || {};
        if (dom.autosaveTag) {
          const now = new Date();
          const hh = String(now.getHours()).padStart(2, '0');
          const mm = String(now.getMinutes()).padStart(2, '0');
          const ss = String(now.getSeconds()).padStart(2, '0');
          dom.autosaveTag.textContent = `💾 Автозбережено о ${hh}:${mm}:${ss}`;
        }
      } catch (_) {
        // Ігноруємо помилки квоти або приватного режиму браузера
      }
    }

    restoreAutosave() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.app !== '3d-club-studio') return false;
        this.applyState(parsed, false);
        const dom = this._domCache || {};
        if (dom.autosaveTag) {
          dom.autosaveTag.textContent = '💾 Відновлено попередню роботу';
        }
        return true;
      } catch (_) {
        return false;
      }
    }

    saveProjectToFile() {
      const state = this.serializeState();
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = this.getSuggestedFilename().replace(/\.stl$/i, '');
      a.download = `${baseName}_project.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (window.StudioSound) window.StudioSound.playExportSuccess();
    }

    loadProjectFromFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed || parsed.app !== '3d-club-studio') {
            alert('Цей файл не схожий на проєкт «3D Кузні Чудес» (.json).');
            return;
          }
          this.recordUndoSnapshot();
          this.applyState(parsed, true);
          this.autosave();
          if (window.StudioSound) window.StudioSound.playMagicGenerate();
        } catch (_) {
          alert('Не вдалося прочитати файл проєкту. Перевірте, що це правильний .json файл.');
        }
      };
      reader.readAsText(file);
    }

    // При будь-якій зміні геометрії скидаємо статус "Надруковано/Перевірено" на "Згенеровано"
    markModelModified() {
      if (this._isRestoring) return;
      const dom = this._domCache || {};
      if (dom.verificationSelect && dom.verificationSelect.value !== 'generated') {
        dom.verificationSelect.value = 'generated';
        this.syncVerificationBadgeUI();
      }
    }

    setMonochromeMode(enable) {
      const active = this.sceneManager.toggleMonochrome(enable);
      const dom = this._domCache || {};
      if (dom.btnToggleMono) {
        dom.btnToggleMono.classList.toggle('active', active);
        dom.btnToggleMono.textContent = active ? '🪨 1 Пластик: ВКЛ' : '🪨 1 Пластик';
      }
      if (dom.btnHudMono) {
        dom.btnHudMono.classList.toggle('active', active);
        dom.btnHudMono.textContent = active ? '🪨 1 Пластик: ВКЛ' : '🪨 Одним пластиком';
      }
      return active;
    }

    bindViewModeControls() {
      const viewBtns = document.querySelectorAll('[data-view-mode]');
      viewBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-view-mode') || 'split';
          this.setViewMode(mode);
        });
      });
    }

    setViewMode(mode) {
      this.viewMode = mode;
      const dom = this._domCache || {};
      if (dom.workspace) {
        dom.workspace.classList.remove('mode-editor', 'mode-split', 'mode-viewport');
        dom.workspace.classList.add(`mode-${mode}`);
      }
      document.querySelectorAll('[data-view-mode]').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-view-mode') === mode);
      });
      if (this.sceneManager) {
        requestAnimationFrame(() => this.sceneManager.onResize());
      }
    }

    bindVerificationControls() {
      const dom = this._domCache || {};
      if (dom.verificationSelect) {
        dom.verificationSelect.addEventListener('change', () => {
          this.syncVerificationBadgeUI();
          this.autosave();
        });
      }
      if (dom.slicerTimeInput) {
        dom.slicerTimeInput.addEventListener('input', () => {
          this.sceneManager.updateDimensionsUI(dom.slicerTimeInput.value.trim());
          this.autosave();
        });
      }
    }

    syncVerificationBadgeUI() {
      const dom = this._domCache || {};
      const badge = dom.verificationBadge;
      const sel = dom.verificationSelect;
      if (!badge || !sel) return;
      badge.classList.remove('status-generated', 'status-sliced', 'status-printed');
      badge.classList.add(`status-${sel.value || 'generated'}`);
    }

    updateDiagnosticsUI() {
      const dom = this._domCache || {};
      const d = this.sceneManager?.dimensions;
      if (!d) return;

      const note = dom.slicerTimeInput?.value?.trim() || '';
      this.sceneManager.updateDimensionsUI(note);

      const pill = dom.geomCheckPill;
      if (!pill) return;

      // Перевірка габаритів столу та зв'язності
      const conn = this.mcGen?.lastConnectivity;
      if (!d.fitsBed) {
        pill.textContent = `🚨 Габарит ${d.x}×${d.y} мм виходить за межі столу 200×200 мм!`;
        pill.className = 'geom-check-pill danger';
      } else if (!d.safeBed) {
        pill.textContent = `⚠️ ${d.x}×${d.y} мм — майже впритул до краю столу (>190 мм)`;
        pill.className = 'geom-check-pill warn';
      } else if (this.activeTab === 'minecraft' && conn && conn.activeCount > 0 && conn.finalIslands > 1) {
        pill.textContent = `⚠️ Деталь розірвана на ${conn.finalIslands} частини!`;
        pill.className = 'geom-check-pill danger';
      } else if (d.isMini) {
        pill.textContent = '🌟 Міні-виріб (<=38 мм) • Плоске дно Z=0';
        pill.className = 'geom-check-pill';
      } else {
        pill.textContent = '📐 У межах столу • Плоске дно Z=0';
        pill.className = 'geom-check-pill';
      }
    }

    updateMinecraftConnectivityUI() {
      const dom = this._domCache || {};
      const pill = dom.mcConnectivityStatus;
      if (!pill || !this.mcGen) return;

      const c = this.mcGen.lastConnectivity;
      if (!c || c.activeCount === 0) {
        pill.textContent = '✏️ Полотно порожнє: намалюй власний знак або обери шаблон.';
        pill.className = 'connectivity-pill warn';
      } else if (c.finalIslands === 1 && c.bridgedCount > 0) {
        pill.textContent = `🔗 Суцільна підкладка автоматично з'єднала ${c.rawIslands} острови в 1 деталь!`;
        pill.className = 'connectivity-pill bridged';
      } else if (c.finalIslands === 1 && c.hasDiagonalOnly && !dom.mcSolidBase?.checked) {
        pill.textContent = '⚠️ Є тонкі кутики по діагоналі: увімкніть «Суцільна підкладка» для міцності!';
        pill.className = 'connectivity-pill warn';
      } else if (c.finalIslands === 1) {
        pill.textContent = '✅ 1 суцільна деталь: усі частини значка надійно з\'єднані.';
        pill.className = 'connectivity-pill';
      } else {
        pill.textContent = `🚨 Розірвано на ${c.finalIslands} окремих частин! Увімкніть «Суцільна підкладка» або домалюйте з'єднання.`;
        pill.className = 'connectivity-pill danger';
      }
    }

    bindTabs() {
      const tabBtns = document.querySelectorAll('.gen-tab-btn');
      tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-tab');
          this.recordUndoSnapshot();
          this.switchTab(tab);
          this.autosave();
        });
      });
    }

    switchTab(tabName, skipRebuild = false) {
      this.activeTab = tabName;
      if (!skipRebuild && window.StudioSound) window.StudioSound.playTabSwitch(tabName);

      document.querySelectorAll('.gen-tab-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
      });

      document.querySelectorAll('.panel-section').forEach((sec) => {
        sec.classList.toggle('active', sec.id === `panel-${tabName}`);
      });

      // Оновлюємо контекстні кнопки внизу 3D-сцени
      const illusionCameraBar = this._domCache?.illusionCameraBar || document.getElementById('illusion-camera-bar');
      const physicsActionBar = this._domCache?.physicsActionBar || document.getElementById('physics-action-bar');
      if (illusionCameraBar) illusionCameraBar.style.display = tabName === 'illusion' ? 'flex' : 'none';
      if (physicsActionBar) physicsActionBar.style.display = tabName === 'physics' ? 'flex' : 'none';

      // Підбираємо найкращий стартовий ракурс камери
      if (tabName === 'illusion') {
        this.sceneManager.setCameraView('front');
      } else {
        this.sceneManager.setCameraView('iso');
      }

      if (!skipRebuild) {
        this.rebuildCurrentModel(true, true);
      }
    }

    // Універсальний звуковий відгук для повзунків, полів вводу, чекбоксів та селектів
    _playControlFeedback(el) {
      if (!window.StudioSound || !el) return;
      if (el.type === 'range') {
        const min = parseFloat(el.min) || 0;
        const max = parseFloat(el.max) || 100;
        const val = parseFloat(el.value) || 0;
        const ratio = max > min ? (val - min) / (max - min) : 0.5;
        window.StudioSound.playSliderTick(ratio);
      } else if (el.type === 'text') {
        const lastCh = (el.value || '').slice(-1) || 'A';
        window.StudioSound.playKeyType(lastCh);
      } else if (el.type === 'checkbox') {
        window.StudioSound.playPop(el.checked ? 580 : 340);
      } else if (el.tagName === 'SELECT') {
        const themedIds = ['mob-archetype', 'mob-weapon', 'mob-headgear', 'mob-backgear', 'mob-eye-type'];
        if (themedIds.includes(el.id) && el.value && el.value !== 'none') {
          window.StudioSound.playThemeSound(el.value);
        } else {
          window.StudioSound.playPop(480);
        }
      } else if (el.type === 'color') {
        window.StudioSound.playSliderTick(Math.random());
      }
    }

    bindTopActions() {
      // Пасхалка при кліку на логотип ковадла ⚒️
      const brandLogo = document.querySelector('.brand-logo');
      if (brandLogo) {
        brandLogo.addEventListener('click', () => {
          if (window.StudioSound) window.StudioSound.playAnvilEasterEgg();
        });
      }

      // Кнопки Скасувати / Повернути (Undo / Redo)
      const dom = this._domCache || {};
      if (dom.btnUndo) dom.btnUndo.addEventListener('click', () => this.undo());
      if (dom.btnMcUndo) dom.btnMcUndo.addEventListener('click', () => this.undo());
      if (dom.btnRedo) dom.btnRedo.addEventListener('click', () => this.redo());

      // Гарячі клавіші Ctrl+Z / Ctrl+Y
      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) this.redo();
          else this.undo();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          this.redo();
        }
      });

      // Перемикач одноколірного прев'ю ("Як виглядатиме одним пластиком")
      const toggleMonoHandler = () => {
        const isMono = this.setMonochromeMode();
        if (window.StudioSound) window.StudioSound.playPop(isMono ? 440 : 560);
        this.autosave();
      };
      if (dom.btnToggleMono) dom.btnToggleMono.addEventListener('click', toggleMonoHandler);
      if (dom.btnHudMono) dom.btnHudMono.addEventListener('click', toggleMonoHandler);
      if (dom.monoColorPicker) {
        dom.monoColorPicker.addEventListener('input', () => {
          const hex = parseInt(dom.monoColorPicker.value.replace('#', '0x'), 16);
          this.sceneManager.setMonochromeColor(hex);
          if (!this.sceneManager.isMonochrome) {
            this.setMonochromeMode(true);
          }
          this.autosave();
        });
      }

      // Збереження та відкриття редагованого проєкту (.json)
      const btnSaveProj = document.getElementById('btn-save-project');
      const btnLoadProj = document.getElementById('btn-load-project');
      const inpLoadProj = document.getElementById('input-load-project');
      if (btnSaveProj) {
        btnSaveProj.addEventListener('click', () => this.saveProjectToFile());
      }
      if (btnLoadProj && inpLoadProj) {
        btnLoadProj.addEventListener('click', () => inpLoadProj.click());
        inpLoadProj.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            this.loadProjectFromFile(file);
            inpLoadProj.value = '';
          }
        });
      }

      const btnSound = document.getElementById('btn-toggle-sound');
      const btnMusic = document.getElementById('btn-toggle-music');

      // Кнопка звуку
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          const on = window.StudioSound.toggle();
          btnSound.textContent = on ? '🔊 Звук' : '🔇 Тихо';
          btnSound.classList.toggle('muted', !on);
          if (!on && btnMusic) {
            btnMusic.textContent = '🎵 Музика';
            btnMusic.classList.remove('playing');
          }
        });
      }

      // Кнопка веселої 8-бітної фонової музики кузні
      if (btnMusic) {
        btnMusic.addEventListener('click', () => {
          const playing = window.StudioSound.toggleMusic();
          btnMusic.textContent = playing ? '🎵 Грає' : '🎵 Музика';
          btnMusic.classList.toggle('playing', playing);
          if (playing && btnSound) {
            btnSound.textContent = '🔊 Звук';
            btnSound.classList.remove('muted');
          }
        });
      }

      // Кнопка Симуляції 3D-Принтера
      const btnSim = document.getElementById('btn-simulate-print');
      if (btnSim) {
        btnSim.addEventListener('click', () => {
          const started = this.sceneManager.startSlicerSimulation();
          if (window.StudioSound) window.StudioSound.playPop(started ? 580 : 320);
          btnSim.textContent = started
            ? '⏹️ Стоп'
            : '🔥 Симуляція';
        });
      }

      // Кнопка "Випадковий ВАУ! / Мутація"
      const btnRandom = document.getElementById('btn-random-wow');
      if (btnRandom) {
        btnRandom.addEventListener('click', () => {
          this.recordUndoSnapshot();
          this.randomizeCurrentTab();
          this.markModelModified();
          this.autosave();
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

      // Кнопки V1 Snapshot, V1 ↔ V2 Compare та Картки для черги друку
      if (dom.btnSnapshotV1) {
        dom.btnSnapshotV1.addEventListener('click', () => this.captureV1Snapshot());
      }
      if (dom.btnCompareV1V2) {
        dom.btnCompareV1V2.addEventListener('click', () => this.openCompareModal());
      }
      if (dom.btnPrintCard) {
        dom.btnPrintCard.addEventListener('click', () => this.openPrintCardModal());
      }

      // Керування модальним вікном порівняння V1 ↔ V2
      if (dom.btnCloseCompare) {
        dom.btnCloseCompare.addEventListener('click', () => this.closeCompareModal());
      }
      if (dom.btnCloseCompareFooter) {
        dom.btnCloseCompareFooter.addEventListener('click', () => this.closeCompareModal());
      }
      if (dom.btnReSnapshotV1) {
        dom.btnReSnapshotV1.addEventListener('click', () => {
          this.captureV1Snapshot();
          this.openCompareModal();
        });
      }
      if (dom.btnCompareToPassport) {
        dom.btnCompareToPassport.addEventListener('click', () => {
          this.closeCompareModal();
          this.openPrintCardModal('V2');
        });
      }
      if (dom.compareModal) {
        dom.compareModal.addEventListener('click', (e) => {
          if (e.target === dom.compareModal) this.closeCompareModal();
        });
      }

      // Керування модальним вікном Паспорта черги друку
      if (dom.btnClosePrintCard) {
        dom.btnClosePrintCard.addEventListener('click', () => this.closePrintCardModal());
      }
      if (dom.printCardModal) {
        dom.printCardModal.addEventListener('click', (e) => {
          if (e.target === dom.printCardModal) this.closePrintCardModal();
        });
      }
      if (dom.btnActionPrint) {
        dom.btnActionPrint.addEventListener('click', () => window.print());
      }
      if (dom.btnActionDownloadPng) {
        dom.btnActionDownloadPng.addEventListener('click', () => this.downloadPassportPng());
      }
      if (dom.btnActionCopyText) {
        dom.btnActionCopyText.addEventListener('click', () => this.copyPassportText());
      }
      if (dom.cardPairInput) {
        dom.cardPairInput.addEventListener('input', (e) => {
          const val = e.target.value.trim();
          localStorage.setItem('3d_kuznya_pair_code', val);
          this.updatePrintCardContent(dom.pVerV1?.checked ? 'V1' : 'V2');
        });
      }
      if (dom.pVerV1) {
        dom.pVerV1.addEventListener('change', () => {
          if (dom.pVerV1.checked) this.updatePrintCardContent('V1');
        });
      }
      if (dom.pVerV2) {
        dom.pVerV2.addEventListener('change', () => {
          if (dom.pVerV2.checked) this.updatePrintCardContent('V2');
        });
      }
    }

    getSuggestedFilename() {
      const dom = this._domCache || {};
      if (this.activeTab === 'minecraft') {
        const lbl = (dom.mcCustomLabel?.value || '').trim();
        return `minecraft_${this.mcGen.currentPresetKey}${lbl ? '_' + lbl : ''}.stl`;
      }
      if (this.activeTab === 'illusion') {
        const w1 = (dom.ilWord1?.value || 'WORD1').trim();
        const w2 = (dom.ilWord2?.value || 'WORD2').trim();
        return `illusion_${w1}_${w2}.stl`;
      }
      if (this.activeTab === 'physics') {
        const sub = dom.phSubmode?.value || 'catapult';
        return `physics_${sub}.stl`;
      }
      if (this.activeTab === 'mob') {
        const arch = dom.mobArchetype?.value || 'boss';
        const name = (dom.mobName?.value || '').trim();
        return `mob_${arch}${name ? '_' + name : ''}.stl`;
      }
      return '3d_kuznya_model.stl';
    }

    // -------------------------------------------------------------------------
    // 0. СИСТЕМА «🗺️ МІСІЇ ГУРТКА (12)» ТА КАРТКА ПОТОЧНОЇ МІСІЇ
    // -------------------------------------------------------------------------
    getActiveMission() {
      return STUDIO_MISSIONS.find((m) => m.id === this.activeMissionId) || STUDIO_MISSIONS[0];
    }

    bindMissionControls() {
      const dom = this._domCache || {};

      const btnOpenTop = document.getElementById('btn-open-missions');
      const btnOpenInline = document.getElementById('btn-open-missions-inline');
      const btnCloseModal = document.getElementById('btn-close-missions');
      const btnToggleBody = document.getElementById('btn-toggle-mission-body');
      const btnPrev = document.getElementById('btn-prev-mission');
      const btnNext = document.getElementById('btn-next-mission');
      const btnStartActive = document.getElementById('btn-start-active-mission');

      if (btnOpenTop) btnOpenTop.addEventListener('click', () => this.openMissionsModal());
      if (btnOpenInline) btnOpenInline.addEventListener('click', () => this.openMissionsModal());
      if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeMissionsModal());

      if (dom.missionsModal) {
        dom.missionsModal.addEventListener('click', (e) => {
          if (e.target === dom.missionsModal) this.closeMissionsModal();
        });
      }

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (dom.missionsModal && dom.missionsModal.style.display !== 'none') this.closeMissionsModal();
          if (dom.compareModal && dom.compareModal.style.display !== 'none') this.closeCompareModal();
          if (dom.printCardModal && dom.printCardModal.style.display !== 'none') this.closePrintCardModal();
        }
      });

      if (dom.btnMissionV1Compare) {
        dom.btnMissionV1Compare.addEventListener('click', () => this.openCompareModal());
      }
      if (dom.btnMissionPrintCard) {
        dom.btnMissionPrintCard.addEventListener('click', () => this.openPrintCardModal());
      }

      if (btnToggleBody) {
        btnToggleBody.addEventListener('click', () => {
          this.missionBodyCollapsed = !this.missionBodyCollapsed;
          if (dom.activeMissionBody) {
            dom.activeMissionBody.classList.toggle('collapsed', this.missionBodyCollapsed);
          }
          btnToggleBody.textContent = this.missionBodyCollapsed ? '📋 Розгорнути' : '📋 Чек-лист';
          if (window.StudioSound) window.StudioSound.playPop(this.missionBodyCollapsed ? 360 : 520);
        });
      }

      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          const idx = STUDIO_MISSIONS.findIndex((m) => m.id === this.activeMissionId);
          const prevIdx = (idx - 1 + STUDIO_MISSIONS.length) % STUDIO_MISSIONS.length;
          this.activeMissionId = STUDIO_MISSIONS[prevIdx].id;
          this.updateActiveMissionUI();
          this.renderMissionsModal();
          this.autosave();
          if (window.StudioSound) window.StudioSound.playPop(420);
        });
      }

      if (btnNext) {
        btnNext.addEventListener('click', () => {
          const idx = STUDIO_MISSIONS.findIndex((m) => m.id === this.activeMissionId);
          const nextIdx = (idx + 1) % STUDIO_MISSIONS.length;
          this.activeMissionId = STUDIO_MISSIONS[nextIdx].id;
          this.updateActiveMissionUI();
          this.renderMissionsModal();
          this.autosave();
          if (window.StudioSound) window.StudioSound.playPop(500);
        });
      }

      if (btnStartActive) {
        btnStartActive.addEventListener('click', () => {
          this.startMission(this.activeMissionId);
        });
      }

      // Фільтри категорій у модальному вікні
      document.querySelectorAll('[data-mission-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.missionFilter = btn.getAttribute('data-mission-filter') || 'all';
          document.querySelectorAll('[data-mission-filter]').forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-mission-filter') === this.missionFilter);
          });
          this.renderMissionsModal();
          if (window.StudioSound) window.StudioSound.playPop(460);
        });
      });

      // Чек-лист самоперевірки у компактній картці місії
      const checkMap = [
        [dom.chkMissionConnected, 'connected'],
        [dom.chkMissionMono, 'mono'],
        [dom.chkMissionSize, 'size']
      ];
      checkMap.forEach(([chkEl, key]) => {
        if (chkEl) {
          chkEl.addEventListener('change', () => {
            this.missionChecks[key] = chkEl.checked;
            if (window.StudioSound) window.StudioSound.playPop(chkEl.checked ? 620 : 340);
            this.autosave();
          });
        }
      });
    }

    openMissionsModal() {
      const dom = this._domCache || {};
      if (!dom.missionsModal) return;
      this.renderMissionsModal();
      dom.missionsModal.style.display = 'flex';
      if (window.StudioSound) window.StudioSound.playPop(540);
    }

    closeMissionsModal() {
      const dom = this._domCache || {};
      if (!dom.missionsModal) return;
      dom.missionsModal.style.display = 'none';
      if (window.StudioSound) window.StudioSound.playPop(360);
    }

    // -------------------------------------------------------------------------
    // 0.1 ГАЛЕРЕЯ ІНЖЕНЕРНОГО ПОСТУПУ (V1 ↔ V2) ТА ПАСПОРТ ЧЕРГИ ДРУКУ
    // -------------------------------------------------------------------------
    captureV1Snapshot(silent = false) {
      const dom = this._domCache || {};
      if (this.sceneManager) {
        this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
      }
      const thumbUrl = this.sceneManager?.renderer?.domElement?.toDataURL('image/png') || '';
      const d = this.sceneManager?.dimensions || { x: 0, y: 0, z: 0 };
      const conn = this.mcGen?.lastConnectivity || { finalIslands: 1, rawIslands: 1, activeCount: 0 };
      const mission = this.getActiveMission();
      const date = new Date();

      this.v1Snapshot = {
        capturedAt: date.toISOString(),
        displayTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        thumbnail: thumbUrl,
        activeTab: this.activeTab,
        missionId: this.activeMissionId,
        missionTitle: mission ? mission.title : '',
        dimensions: { x: d.x, y: d.y, z: d.z },
        islands: conn.finalIslands || 1,
        rawIslands: conn.rawIslands || 1,
        activeCount: conn.activeCount || 0,
        solidBase: !!dom.mcSolidBase?.checked,
        estimatedMinutes: dom.slicerTimeInput?.value?.trim() || (d.z > 0 ? Math.ceil(d.x * d.y * d.z / 180) + ' хв' : '~15 хв')
      };

      if (dom.btnCompareV1V2) {
        dom.btnCompareV1V2.style.display = 'inline-block';
        dom.btnCompareV1V2.disabled = false;
        dom.btnCompareV1V2.classList.add('has-v1');
        dom.btnCompareV1V2.title = `V1 зафіксовано о ${this.v1Snapshot.displayTime}. Натисніть для порівняння!`;
      }
      if (dom.btnMissionV1Compare) {
        dom.btnMissionV1Compare.disabled = false;
        dom.btnMissionV1Compare.classList.add('highlight');
      }
      if (dom.btnSnapshotV1) {
        dom.btnSnapshotV1.textContent = '📸 V1 збережено ✅';
        setTimeout(() => {
          if (dom.btnSnapshotV1) dom.btnSnapshotV1.textContent = '📸 Оновити V1';
        }, 2200);
      }

      this.autosave();

      if (!silent && window.StudioSound) {
        window.StudioSound.playPop(620);
      }
    }

    openCompareModal() {
      const dom = this._domCache || {};
      if (!dom.compareModal) return;

      if (!this.v1Snapshot) {
        this.captureV1Snapshot(true);
      }

      const v1 = this.v1Snapshot;
      if (this.sceneManager) {
        this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
      }
      const v2Thumb = this.sceneManager?.renderer?.domElement?.toDataURL('image/png') || '';
      const d2 = this.sceneManager?.dimensions || { x: 0, y: 0, z: 0 };
      const conn2 = this.mcGen?.lastConnectivity || { finalIslands: 1, rawIslands: 1, activeCount: 0 };
      const d1 = v1.dimensions || { x: 0, y: 0, z: 0 };
      const now = new Date();
      const v2Time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (dom.v1PreviewImg) dom.v1PreviewImg.src = v1.thumbnail;
      if (dom.v1Timestamp) dom.v1Timestamp.textContent = `Зафіксовано: ${v1.displayTime}`;
      if (dom.v1Metrics) {
        dom.v1Metrics.innerHTML = `
          <div class="metric-row"><span>📐 Габарити:</span><b>${d1.x} × ${d1.y} × ${d1.z} мм</b></div>
          <div class="metric-row"><span>🧩 Островів:</span><b class="${v1.islands > 1 ? 'metric-bad' : 'metric-good'}">${v1.islands} ${v1.islands > 1 ? '🚨 (розірвано)' : '✅ (1 суцільна)'}</b></div>
          <div class="metric-row"><span>🪨 Підкладка:</span><b>${v1.solidBase ? 'Увімкнено' : 'Вимкнено'}</b></div>
          <div class="metric-row"><span>⏱️ Орієнтовний час:</span><b>${v1.estimatedMinutes}</b></div>
        `;
      }

      if (dom.v2PreviewImg) dom.v2PreviewImg.src = v2Thumb;
      if (dom.v2Timestamp) dom.v2Timestamp.textContent = `Поточний стан: ${v2Time}`;
      if (dom.v2Metrics) {
        const v2Islands = conn2.finalIslands || 1;
        dom.v2Metrics.innerHTML = `
          <div class="metric-row"><span>📐 Габарити:</span><b>${d2.x} × ${d2.y} × ${d2.z} мм</b></div>
          <div class="metric-row"><span>🧩 Островів:</span><b class="${v2Islands > 1 ? 'metric-bad' : 'metric-good'}">${v2Islands} ${v2Islands > 1 ? '🚨 (розірвано)' : '✅ (1 суцільна)'}</b></div>
          <div class="metric-row"><span>🪨 Підкладка:</span><b>${dom.mcSolidBase?.checked ? 'Увімкнено' : 'Вимкнено'}</b></div>
          <div class="metric-row"><span>⏱️ Орієнтовний час:</span><b>${dom.slicerTimeInput?.value?.trim() || (d2.z > 0 ? Math.ceil(d2.x * d2.y * d2.z / 180) + ' хв' : '~15 хв')}</b></div>
        `;
      }

      if (dom.compareSummaryBanner) {
        const v1Islands = v1.islands || 1;
        const v2Islands = conn2.finalIslands || 1;
        let badgeClass = 'banner-good';
        let text = '';

        if (v1Islands > 1 && v2Islands === 1) {
          text = `🎉 <b>Інженерний поступ:</b> У V1 було ${v1Islands} розірваних островів, а у V2 модель об'єднана в <b>1 суцільну міцну деталь</b>!`;
          badgeClass = 'banner-success';
        } else if (v2Islands === 1) {
          text = `✅ <b>Готово до друку:</b> Виріб суцільний (1 деталь), габарити в межах норми (${d2.x}×${d2.y} мм).`;
          badgeClass = 'banner-good';
        } else {
          text = `⚠️ <b>Зверніть увагу:</b> У V2 залишилося ${v2Islands} розірваних острівців. Увімкніть «Суцільна підкладка» або домалюйте містки перед відправкою до черги друку.`;
          badgeClass = 'banner-warn';
        }
        dom.compareSummaryBanner.className = `compare-summary-banner ${badgeClass}`;
        dom.compareSummaryBanner.innerHTML = text;
      }

      dom.compareModal.style.display = 'flex';
      if (window.StudioSound) window.StudioSound.playPop(520);
    }

    closeCompareModal() {
      const dom = this._domCache || {};
      if (dom.compareModal) dom.compareModal.style.display = 'none';
      if (window.StudioSound) window.StudioSound.playPop(340);
    }

    updatePrintCardContent(chosenVer = 'V2') {
      const dom = this._domCache || {};
      const isV1 = chosenVer === 'V1' && this.v1Snapshot;
      const snap = isV1 ? this.v1Snapshot : null;

      const pairCode = dom.cardPairInput?.value?.trim() || localStorage.getItem('3d_kuznya_pair_code') || 'Пара #___';
      if (dom.pCardPair) dom.pCardPair.textContent = pairCode;

      const now = new Date();
      const dateStr = now.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (dom.pCardDate) dom.pCardDate.textContent = isV1 && snap.displayTime ? `V1 (${snap.displayTime})` : dateStr;

      // Зображення попереднього перегляду
      if (dom.pCardImg) {
        if (isV1 && snap.thumbnail) {
          dom.pCardImg.src = snap.thumbnail;
        } else {
          if (this.sceneManager) {
            this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
            dom.pCardImg.src = this.sceneManager.renderer.domElement.toDataURL('image/png');
          }
        }
      }

      // Назва файлу моделі
      const fname = this.getSuggestedFilename();
      const verSuffix = isV1 ? '_V1_draft.stl' : '_V2_final.stl';
      const displayFname = fname.replace(/\.stl$/i, verSuffix);
      if (dom.pCardFilename) dom.pCardFilename.textContent = displayFname;

      // Назва місії
      const mission = this.getActiveMission();
      if (dom.pCardMission) {
        dom.pCardMission.textContent = mission ? `Місія #${mission.id}: ${mission.title}` : 'Вільне моделювання';
      }

      // Габарити
      const d = isV1 ? snap.dimensions : (this.sceneManager?.dimensions || { x: 0, y: 0, z: 0 });
      if (dom.pCardDims) {
        dom.pCardDims.textContent = `${d.x} × ${d.y} × ${d.z} мм`;
      }

      // Зв'язність
      const conn = isV1 ? { finalIslands: snap.islands } : (this.mcGen?.lastConnectivity || { finalIslands: 1 });
      if (dom.pCardConn) {
        if (conn.finalIslands === 1) {
          dom.pCardConn.textContent = '✅ 1 суцільна деталь (готово)';
          dom.pCardConn.className = 'status-good';
        } else {
          dom.pCardConn.textContent = `🚨 ${conn.finalIslands} розірваних острівців`;
          dom.pCardConn.className = 'status-bad';
        }
      }

      // Суцільна підкладка
      const baseOn = isV1 ? snap.solidBase : !!dom.mcSolidBase?.checked;
      if (dom.pCardBase) {
        dom.pCardBase.textContent = baseOn ? 'Увімкнено (1.0 мм шар)' : 'Без підкладки';
      }

      // Параметризовані налаштування (паз картону або крок висоти)
      if (dom.pCardCustomParam) {
        if (this.activeTab === 'minecraft') {
          const slot = dom.mcSlotWidth?.value || '2.0';
          const isStand = this.mcGen?.currentPresetKey === 'cardboard_stand' || this.mcGen?.currentPresetKey === 'slot_calibrator';
          if (isStand) {
            dom.pCardCustomParam.textContent = `Паз картону: ${slot} мм (+0.2 мм допуск)`;
          } else {
            const vox = dom.mcVoxelSize?.value || '2.0';
            dom.pCardCustomParam.textContent = `Воксель: ${vox} мм, сходинка: ${dom.mcHeightStep?.value || '1.2'} мм`;
          }
        } else if (this.activeTab === 'illusion') {
          dom.pCardCustomParam.textContent = `Слова: "${dom.ilWord1?.value || ''}" ↔ "${dom.ilWord2?.value || ''}"`;
        } else if (this.activeTab === 'physics') {
          dom.pCardCustomParam.textContent = `Підрежим: ${dom.phSubmode?.value || 'механіка'}`;
        } else {
          dom.pCardCustomParam.textContent = `Архетип: ${dom.mobArchetype?.value || 'моб'}`;
        }
      }

      // Перевірка монохрому
      if (dom.pCardMono) {
        dom.pCardMono.textContent = this.missionChecks.mono ? '✅ Перевірено в "🪨 1 Пластик"' : '⏳ Очікує візуальної перевірки';
      }

      // Чек-лист місії
      if (dom.pCardChecklist && mission && mission.checklist) {
        dom.pCardChecklist.innerHTML = mission.checklist.map((item, idx) => {
          const isChecked = idx === 0 ? this.missionChecks.connected : idx === 1 ? this.missionChecks.mono : this.missionChecks.size;
          return `<li class="${isChecked ? 'chk-done' : 'chk-pending'}">${isChecked ? '☑️' : '⬜'} ${item}</li>`;
        }).join('');
      }
    }

    openPrintCardModal(version = 'V2') {
      const dom = this._domCache || {};
      if (!dom.printCardModal) return;

      const savedPair = localStorage.getItem('3d_kuznya_pair_code') || '';
      if (dom.cardPairInput) {
        if (!dom.cardPairInput.value && savedPair) {
          dom.cardPairInput.value = savedPair;
        }
      }

      const chosenVer = (version === 'V1' && this.v1Snapshot) ? 'V1' : 'V2';
      if (dom.pVerV1) dom.pVerV1.checked = (chosenVer === 'V1');
      if (dom.pVerV2) dom.pVerV2.checked = (chosenVer === 'V2');

      this.updatePrintCardContent(chosenVer);
      dom.printCardModal.style.display = 'flex';
      if (window.StudioSound) window.StudioSound.playPop(520);
    }

    closePrintCardModal() {
      const dom = this._domCache || {};
      if (dom.printCardModal) dom.printCardModal.style.display = 'none';
      if (window.StudioSound) window.StudioSound.playPop(340);
    }

    downloadPassportPng() {
      const dom = this._domCache || {};
      const isV1 = dom.pVerV1?.checked && this.v1Snapshot;
      const snap = isV1 ? this.v1Snapshot : null;
      const pairCode = dom.cardPairInput?.value?.trim() || localStorage.getItem('3d_kuznya_pair_code') || 'Пара #___';
      const mission = this.getActiveMission();
      const d = isV1 ? snap.dimensions : (this.sceneManager?.dimensions || { x: 0, y: 0, z: 0 });
      const conn = isV1 ? { finalIslands: snap.islands } : (this.mcGen?.lastConnectivity || { finalIslands: 1 });
      const verLabel = isV1 ? 'V1 (Ескіз)' : 'V2 (Фінал)';
      const filename = this.getSuggestedFilename().replace(/\.stl$/i, isV1 ? '_V1.stl' : '_V2.stl');

      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');

      // Біле тло
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Рамка паспорта
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 768, 1068);

      // Верхній темний банер кузні
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, 20, 760, 80);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('3D КУЗНЯ ЧУДЕС • ПАСПОРТ ДЕТАЛІ ДЛЯ ЧЕРГИ', 40, 56);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Інженерний бланк перевірки якості перед 3D-друком на Anycubic i3 Mega', 40, 82);

      // Рядок пари та дати
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(24, 110, 752, 54);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 110, 752, 54);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(`👤 Пара: ${pairCode}`, 40, 144);

      ctx.fillStyle = isV1 ? '#d97706' : '#16a34a';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText(`🏷️ Версія: ${verLabel}`, 400, 144);

      const now = new Date();
      const dateStr = now.toLocaleDateString('uk-UA') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ctx.fillStyle = '#64748b';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(`📅 ${dateStr}`, 600, 144);

      const renderRestOfCard = (imgElement) => {
        // Поле 3D прев'ю
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(40, 180, 320, 260);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 180, 320, 260);

        if (imgElement) {
          try {
            ctx.drawImage(imgElement, 40, 180, 320, 260);
          } catch (_) {}
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '16px system-ui, sans-serif';
          ctx.fillText('3D Модель', 150, 310);
        }

        // Блок технічних характеристик
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(380, 180, 380, 260);
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('📐 ТЕХНІЧНІ ХАРАКТЕРИСТИКИ', 400, 210);

        ctx.fillStyle = '#334155';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(`📁 Файл: ${filename.slice(0, 32)}`, 400, 240);
        ctx.fillText(`🗺️ Місія: #${mission ? mission.id : 0} ${mission ? mission.title.slice(0, 26) : 'Вільна'}`, 400, 270);
        ctx.fillText(`📏 Габарити: ${d.x} × ${d.y} × ${d.z} мм`, 400, 300);
        ctx.fillText(`🧩 Зв'язність: ${conn.finalIslands === 1 ? '✅ 1 суцільна деталь' : '🚨 ' + conn.finalIslands + ' окремих частин'}`, 400, 330);
        ctx.fillText(`🪨 Підкладка: ${dom.mcSolidBase?.checked ? 'Увімкнено (1.0 мм)' : 'Без підкладки'}`, 400, 360);

        let customParamText = '';
        if (this.activeTab === 'minecraft') {
          const isStand = this.mcGen?.currentPresetKey === 'cardboard_stand' || this.mcGen?.currentPresetKey === 'slot_calibrator';
          customParamText = isStand ? `Паз картону: ${dom.mcSlotWidth?.value || '2.0'} мм (+0.2 мм)` : `Воксель: ${dom.mcVoxelSize?.value || '2.0'} мм`;
        } else if (this.activeTab === 'illusion') {
          customParamText = `Слова: "${dom.ilWord1?.value || ''}" / "${dom.ilWord2?.value || ''}"`;
        } else {
          customParamText = `Режим: ${this.activeTab}`;
        }
        ctx.fillText(`⚙️ Параметр: ${customParamText}`, 400, 390);
        ctx.fillText(`👁️ Монохром: ${this.missionChecks.mono ? '✅ Перевірено' : '⏳ Не перевірено'}`, 400, 420);

        // Блок чек-листа
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(40, 460, 720, 150);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(40, 460, 720, 150);

        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('✅ ЧЕК-ЛИСТ САМОПЕРЕВІРКИ (ПАРА ДИЗАЙНЕР + ПЕРЕВІРЯЛЬНИК)', 60, 490);

        const chk1 = this.missionChecks.connected ? '[X] Зв\'язність: усі частини з\'єднані в одну міцну деталь' : '[ ] Зв\'язність: потребує з\'єднання або підкладки';
        const chk2 = this.missionChecks.mono ? '[X] Монохром: перевірено в режимі «1 Пластик», рельєф читається' : '[ ] Монохром: огляд в 1 кольорі ще не пройдено';
        const chk3 = this.missionChecks.size ? '[X] Габарити: розмір вкладається у норму столу та час уроку' : '[ ] Габарити: перевірити розмір зі слайсером';

        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = this.missionChecks.connected ? '#16a34a' : '#64748b';
        ctx.fillText(chk1, 60, 525);
        ctx.fillStyle = this.missionChecks.mono ? '#16a34a' : '#64748b';
        ctx.fillText(chk2, 60, 555);
        ctx.fillStyle = this.missionChecks.size ? '#16a34a' : '#64748b';
        ctx.fillText(chk3, 60, 585);

        // Блок контролю викладача для черги друку
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 630, 720, 380);

        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('📋 КОНТРОЛЬ ВИКЛАДАЧА ТА ВІДМІТКА СЛАЙСЕРА (ЧЕРГА ДРУКУ)', 60, 665);

        ctx.fillStyle = '#1e293b';
        ctx.font = '15px system-ui, sans-serif';
        ctx.fillText('1. Розрахунок у слайсері (Cura / PrusaSlicer / OrcaSlicer):', 60, 705);
        ctx.fillText('   • Час друку: __________________ хв', 60, 735);
        ctx.fillText('   • Витрата філаменту: __________ грам (PLA)', 400, 735);
        ctx.fillText('   • Висота шару:  [  ] 0.20 мм (швидкий)   [  ] 0.16 мм (рельєф)', 60, 765);

        ctx.fillText('2. Черга та запуск на принтері Anycubic i3 Mega:', 60, 810);
        ctx.fillText('   • Номер у черзі друку уроку: № ______', 60, 840);
        ctx.fillText('   • Точний час запуску: _______________', 400, 840);

        ctx.fillText('3. Інженерний вердикт викладача:', 60, 885);
        ctx.fillText('[  ] ДОПУЩЕНО ДО ДРУКУ (деталь надійна, стіл калібровано)', 80, 920);
        ctx.fillText('[  ] ВІДХИЛЕНО НА ДООПРАЦЮВАННЯ (острови / габарит / товщина)', 80, 950);

        ctx.fillText('Підпис викладача / чергового інженера: ________________________', 60, 990);

        // Підвал
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('«3D Кузня Чудес v1.4.0» • Шкільний гурток 3D-моделювання та друку • Anycubic i3 Mega', 160, 1045);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const cleanPair = pairCode.replace(/[^a-zA-Z0-9а-яА-ЯіїєґІЇЄҐ_-]/g, '_');
          a.download = `passport_${cleanPair}_${filename.replace(/\.stl$/i, '')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          if (window.StudioSound) window.StudioSound.playExportSuccess();
        }, 'image/png');
      };

      const thumbSrc = isV1 ? snap.thumbnail : (dom.pCardImg?.src || '');
      if (thumbSrc) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => renderRestOfCard(img);
        img.onerror = () => renderRestOfCard(null);
        img.src = thumbSrc;
      } else {
        renderRestOfCard(null);
      }
    }

    copyPassportText() {
      const dom = this._domCache || {};
      const isV1 = dom.pVerV1?.checked && this.v1Snapshot;
      const verLabel = isV1 ? 'V1 (Ескіз)' : 'V2 (Фінал)';
      const pairCode = dom.cardPairInput?.value?.trim() || localStorage.getItem('3d_kuznya_pair_code') || 'Пара #___';
      const fname = this.getSuggestedFilename().replace(/\.stl$/i, isV1 ? '_V1.stl' : '_V2.stl');
      const mission = this.getActiveMission();
      const d = isV1 ? this.v1Snapshot.dimensions : (this.sceneManager?.dimensions || { x: 0, y: 0, z: 0 });
      const conn = isV1 ? { finalIslands: this.v1Snapshot.islands } : (this.mcGen?.lastConnectivity || { finalIslands: 1 });

      const text = [
        `📋 ПАСПОРТ ДЕТАЛІ ДО ЧЕРГИ ДРУКУ («3D КУЗНЯ ЧУДЕС»)`,
        `----------------------------------------------------`,
        `👤 Пара / Учень: ${pairCode}`,
        `🏷️ Версія: ${verLabel} | Дата: ${new Date().toLocaleString('uk-UA')}`,
        `📁 Файл моделі: ${fname}`,
        `🗺️ Місія: #${mission ? mission.id : 0} ${mission ? mission.title : 'Вільне моделювання'}`,
        `📐 Габарити: ${d.x} × ${d.y} × ${d.z} мм`,
        `🧩 Зв'язність деталей: ${conn.finalIslands === 1 ? '1 суцільна деталь (ОК)' : conn.finalIslands + ' окремих островів (ПОТРІБНА ПІДКЛАДКА)'}`,
        `🪨 Суцільна підкладка: ${dom.mcSolidBase?.checked ? 'Увімкнено (1.0 мм)' : 'Вимкнено'}`,
        `----------------------------------------------------`,
        `✅ Самоперевірка учнів:`,
        `- Зв'язність форми: ${this.missionChecks.connected ? '[X] Так' : '[ ] Ні'}`,
        `- Огляд в "1 пластику": ${this.missionChecks.mono ? '[X] Так' : '[ ] Ні'}`,
        `- Контроль габаритів: ${this.missionChecks.size ? '[X] Так' : '[ ] Ні'}`,
        `----------------------------------------------------`,
        `📝 ПОЛЯ ДЛЯ ВИКЛАДАЧА (СЛАЙСЕР ТА ЧЕРГА):`,
        `[ ] Слайсер: ____ хв / ____ грам PLA`,
        `[ ] Дата й час запуску на Anycubic i3 Mega: ____________`,
        `[ ] Статус: [ ] ДОПУЩЕНО ДО ДРУКУ  [ ] ПОТРЕБУЄ ДООПРАЦЮВАННЯ`,
        `[ ] Підпис викладача: ____________________`
      ].join('\n');

      navigator.clipboard.writeText(text).then(() => {
        if (dom.btnActionCopyText) {
          const orig = dom.btnActionCopyText.textContent;
          dom.btnActionCopyText.textContent = '✅ Скопійовано!';
          setTimeout(() => { if (dom.btnActionCopyText) dom.btnActionCopyText.textContent = orig; }, 2000);
        }
        if (window.StudioSound) window.StudioSound.playPop(600);
      }).catch(() => {
        alert('Будь ласка, скопіюйте текст вручну:\n\n' + text);
      });
    }

    updateActiveMissionUI() {
      const dom = this._domCache || {};
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
    }

    renderMissionsModal() {
      const dom = this._domCache || {};
      const container = dom.missionsGrid;
      if (!container) return;

      const list = this.missionFilter === 'all'
        ? STUDIO_MISSIONS
        : STUDIO_MISSIONS.filter((m) => m.category === this.missionFilter);

      container.innerHTML = '';
      list.forEach((m) => {
        const card = document.createElement('article');
        card.className = 'mission-card' + (m.id === this.activeMissionId ? ' active-mission' : '');
        card.innerHTML = `
          <div>
            <div class="mission-card-header">
              <span class="mission-card-num">Місія #${m.id} • ${m.categoryLabel}</span>
              <span class="mission-card-size">📐 ${m.targetSize}</span>
            </div>
            <h3 class="mission-card-title" style="margin: 6px 0;">${m.title}</h3>
            <div class="mission-riddle-box" style="margin-bottom: 7px;">${m.riddle}</div>
            <div class="mission-grades-row" style="margin-bottom: 7px;">
              <div class="mission-grade-item"><span class="grade-tag grade-23">👶 2–3 класи:</span>${m.grade23}</div>
              <div class="mission-grade-item"><span class="grade-tag grade-46">🧑 4–6 класи:</span>${m.grade46}</div>
            </div>
            <div class="mission-card-steps" style="margin-bottom: 7px;">
              <div><b>1. Загадка →</b> ${m.steps.riddle}</div>
              <div><b>2. Власний дизайн →</b> ${m.steps.design}</div>
              <div><b>3. Перевірка одним пластиком →</b> ${m.steps.mono}</div>
              <div><b>4. Вдосконалення →</b> ${m.steps.improve}</div>
              <div><b>5. Результат (навіть без друку) →</b> ${m.steps.result}</div>
            </div>
            <div class="mission-card-checklist">
              <b>✅ Чек-лист самоперевірки:</b><br/>
              • ${m.checklist[0]}<br/>
              • ${m.checklist[1]}<br/>
              • ${m.checklist[2]}
            </div>
          </div>
          <div class="mission-card-footer">
            <span class="mission-gen-label">Генератор: ${m.generatorLabel}</span>
            <button class="btn-start-mission" data-start-mission="${m.id}">🚀 Почати місію</button>
          </div>
        `;
        const startBtn = card.querySelector('[data-start-mission]');
        if (startBtn) {
          startBtn.addEventListener('click', () => {
            this.startMission(m.id);
          });
        }
        container.appendChild(card);
      });
    }

    startMission(missionId) {
      const m = STUDIO_MISSIONS.find((item) => item.id === parseInt(missionId, 10)) || STUDIO_MISSIONS[0];
      if (!m) return;

      this.recordUndoSnapshot();
      this.activeMissionId = m.id;
      this.missionChecks = { connected: false, mono: false, size: false };

      const dom = this._domCache || {};
      const cfg = m.config || {};
      const c = cfg.controls || {};

      if (cfg.tab === 'minecraft') {
        if (c.mcVoxelSize && dom.mcVoxelSize) dom.mcVoxelSize.value = c.mcVoxelSize;
        if (c.mcHeightStep && dom.mcHeightStep) dom.mcHeightStep.value = c.mcHeightStep;
        if (typeof c.mcSolidBase === 'boolean' && dom.mcSolidBase) dom.mcSolidBase.checked = c.mcSolidBase;
        if (c.mcMountType && dom.mcMountType) dom.mcMountType.value = c.mcMountType;
        if (typeof c.mcCustomLabel === 'string' && dom.mcCustomLabel) dom.mcCustomLabel.value = c.mcCustomLabel;

        if (cfg.mcPreset) {
          this.mcGen.loadPreset(cfg.mcPreset, false, false);
          document.querySelectorAll('[data-mc-preset]').forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-mc-preset') === cfg.mcPreset);
          });
          if (window.StudioSound) window.StudioSound.playThemeSound(cfg.mcPreset);
        }
      } else if (cfg.tab === 'illusion') {
        if (c.ilWord1 && dom.ilWord1) dom.ilWord1.value = c.ilWord1;
        if (c.ilWord2 && dom.ilWord2) dom.ilWord2.value = c.ilWord2;
        if (c.ilVoxelSize && dom.ilVoxelSize) dom.ilVoxelSize.value = c.ilVoxelSize;
        if (typeof c.ilSafeSupports === 'boolean' && dom.ilSafeSupports) dom.ilSafeSupports.checked = c.ilSafeSupports;
        if (c.ilLayoutMode && dom.ilLayoutMode) dom.ilLayoutMode.value = c.ilLayoutMode;
      }

      this.updateValueLabels();
      this.updateActiveMissionUI();
      this.renderMissionsModal();
      this.closeMissionsModal();

      const targetTab = cfg.tab || m.targetTab || 'minecraft';
      this.switchTab(targetTab, true);
      this.markModelModified();
      this.rebuildCurrentModel(true, true);
      this.autosave();
    }

    // -------------------------------------------------------------------------
    // 1. КОНТРОЛЕРИ МАЙНКРАФТ-КУЗНІ
    // -------------------------------------------------------------------------
    bindMinecraftControls() {
      // Пресети з фірмовими тематичними звуками та автоматичними міні-параметрами (25–35 мм)
      document.querySelectorAll('[data-mc-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.recordUndoSnapshot();
          document.querySelectorAll('[data-mc-preset]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const key = btn.getAttribute('data-mc-preset');
          if (window.StudioSound) window.StudioSound.playThemeSound(key);

          const presetDef = window.MINECRAFT_PRESETS && window.MINECRAFT_PRESETS[key];
          if (presetDef && presetDef.recommendedParams) {
            const dom = this._domCache || {};
            const rp = presetDef.recommendedParams;
            if (rp.voxelSize && dom.mcVoxelSize) dom.mcVoxelSize.value = rp.voxelSize;
            if (rp.heightStep && dom.mcHeightStep) dom.mcHeightStep.value = rp.heightStep;
            if (typeof rp.solidBase === 'boolean' && dom.mcSolidBase) dom.mcSolidBase.checked = rp.solidBase;
            if (rp.mountType && dom.mcMountType) dom.mcMountType.value = rp.mountType;
            if (rp.slotWidth && dom.mcSlotWidth) dom.mcSlotWidth.value = rp.slotWidth;
            this.updateValueLabels();
          }

          this.mcGen.loadPreset(key, false, false);
          this.markModelModified();
          this.rebuildCurrentModel(true, true);
          this.autosave();
        });
      });

      // Швидкий пресет "Міні-значок (~30 мм)"
      const btnMini = document.getElementById('btn-mc-mini-preset');
      if (btnMini) {
        btnMini.addEventListener('click', () => {
          this.recordUndoSnapshot();
          const dom = this._domCache || {};
          if (dom.mcVoxelSize) dom.mcVoxelSize.value = '2.0';
          if (dom.mcHeightStep) dom.mcHeightStep.value = '1.2';
          if (dom.mcSolidBase) dom.mcSolidBase.checked = true;
          this.updateValueLabels();
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      }

      // Вибір пензля (рівня висоти 1..4 або Гумки 0)
      document.querySelectorAll('[data-mc-brush]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-mc-brush]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.mcGen.activeBrush = parseInt(btn.getAttribute('data-mc-brush'), 10);
          if (window.StudioSound) {
            if (this.mcGen.activeBrush === 0) {
              window.StudioSound.playErase();
            } else {
              window.StudioSound.playPop(350 + this.mcGen.activeBrush * 75);
            }
          }
        });
      });

      const btnClear = document.getElementById('btn-mc-clear');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          this.mcGen.clearGrid();
        });
      }

      const ids = ['mc-voxel-size', 'mc-height-step', 'mc-solid-base', 'mc-mount-type', 'mc-slot-width', 'mc-custom-label'];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('focus', () => this.recordUndoSnapshot());
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          const handleUpdate = () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          };
          el.addEventListener('input', handleUpdate);
          el.addEventListener('change', handleUpdate);
        }
      });
    }

    // -------------------------------------------------------------------------
    // 2. КОНТРОЛЕРИ ПОДВІЙНОЇ ОПТИЧНОЇ ІЛЮЗІЇ
    // -------------------------------------------------------------------------
    bindIllusionControls() {
      // Швидка кнопка короткого знака (1-2 літери, ~28 мм)
      const btnShort = document.getElementById('btn-il-short-mode');
      if (btnShort) {
        btnShort.addEventListener('click', () => {
          this.recordUndoSnapshot();
          const dom = this._domCache || {};
          if (dom.ilWord1) dom.ilWord1.value = '3D';
          if (dom.ilWord2) dom.ilWord2.value = '★!';
          if (dom.ilVoxelSize) dom.ilVoxelSize.value = '2.2';
          this.updateValueLabels();
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      }

      // Пресети слів
      document.querySelectorAll('[data-il-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.recordUndoSnapshot();
          const dom = this._domCache || {};
          const w1 = btn.getAttribute('data-w1');
          const w2 = btn.getAttribute('data-w2');
          const vox = btn.getAttribute('data-voxel');
          if (dom.ilWord1) dom.ilWord1.value = w1;
          if (dom.ilWord2) dom.ilWord2.value = w2;
          if (vox && dom.ilVoxelSize) dom.ilVoxelSize.value = vox;
          this.updateValueLabels();
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      });

      // Кнопки швидкої вставки спецсимволів Minecraft у активне поле
      let lastFocusedInput = document.getElementById('il-word2');
      ['il-word1', 'il-word2'].forEach((id) => {
        const inp = document.getElementById(id);
        if (inp) {
          inp.addEventListener('focus', () => {
            lastFocusedInput = inp;
            this.recordUndoSnapshot();
          });
          inp.addEventListener('input', () => {
            this._playControlFeedback(inp);
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          });
        }
      });

      const symThemeMap = {
        '⚔': 'sword',
        '⛏': 'pickaxe',
        '💀': 'creeper',
        '👑': 'crown',
        '♥': 'heart',
        '★': 'totem'
      };

      document.querySelectorAll('[data-insert-sym]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sym = btn.getAttribute('data-insert-sym');
          if (lastFocusedInput && lastFocusedInput.value.length < 9) {
            this.recordUndoSnapshot();
            lastFocusedInput.value += sym;
            if (window.StudioSound) {
              window.StudioSound.playThemeSound(symThemeMap[sym] || 'totem');
            }
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          }
        });
      });

      ['il-voxel-size', 'il-safe-supports', 'il-layout-mode', 'il-color-primary'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
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
          this.recordUndoSnapshot();
          const isBalancer = subSelect.value === 'balancer';
          document.getElementById('ph-spring-group').style.display = isBalancer ? 'none' : 'block';
          document.getElementById('ph-weight-group').style.display = isBalancer ? 'block' : 'none';
          const heightInput = this._domCache?.phExtrudeHeight || document.getElementById('ph-extrude-height');
          if (heightInput) {
            heightInput.value = isBalancer ? '6.0' : '10.0';
          }
          this.updateValueLabels();
          const fireBtn = document.getElementById('btn-physics-demo');
          if (fireBtn) {
            fireBtn.textContent = isBalancer
              ? '👆 Протестувати Магічний Баланс!'
              : '🚀 ВИСТРІЛИТИ З КАТАПУЛЬТИ!';
          }
          this.markModelModified();
          this.rebuildCurrentModel(true);
          this.autosave();
        });
      }

      ['ph-extrude-height', 'ph-spring-thickness', 'ph-wing-weight', 'ph-arm-length', 'ph-include-ammo', 'ph-custom-text'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            this.markModelModified();
            this.rebuildCurrentModel(false);
            this.autosave();
          });
        }
      });

      const demoBtn = document.getElementById('btn-physics-demo');
      if (demoBtn) {
        demoBtn.addEventListener('click', () => {
          const sub = (this._domCache?.phSubmode || document.getElementById('ph-submode'))?.value || 'catapult';
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
          el.addEventListener('mousedown', () => this.recordUndoSnapshot());
          el.addEventListener('input', () => {
            this._playControlFeedback(el);
            this.updateValueLabels();
            const isArch = id === 'mob-archetype';
            this.markModelModified();
            this.rebuildCurrentModel(isArch, true);
            this.autosave();
          });
        }
      });
    }

    updateValueLabels() {
      const dom = this._domCache || {};
      const pairs = [
        [dom.mcVoxelSize, dom.valMcVoxel, ' мм'],
        [dom.mcHeightStep, dom.valMcStep, ' мм'],
        [dom.ilVoxelSize, dom.valIlVoxel, ' мм'],
        [dom.phExtrudeHeight, dom.valPhHeight, ' мм'],
        [dom.phSpringThickness, dom.valPhSpring, ' мм'],
        [dom.phWingWeight, dom.valPhWeight, ' мм'],
        [dom.phArmLength, dom.valPhArm, ' мм'],
        [dom.mobHeadScale, dom.valMobHead, 'x'],
        [dom.mobBodyBulk, dom.valMobBulk, 'x']
      ];
      for (const [inp, lbl, suffix] of pairs) {
        if (inp && lbl) {
          lbl.textContent = inp.value + suffix;
        }
      }

      if (dom.mcSlotWidth && dom.valMcSlot) {
        dom.valMcSlot.textContent = dom.mcSlotWidth.value + ' мм';
      }
      if (dom.mcSlotWidthGroup) {
        const isStandOrCalib = this.mcGen?.currentPresetKey === 'cardboard_stand' ||
                              this.mcGen?.currentPresetKey === 'slot_calibrator' ||
                              dom.mcMountType?.value === 'cardboard_stand';
        dom.mcSlotWidthGroup.style.display = isStandOrCalib ? 'flex' : 'none';
      }
    }

    // Випадкова генерація ("ВАУ-Мутація") залежно від відкритої вкладки
    randomizeCurrentTab() {
      if (window.StudioSound) window.StudioSound.playRandomJackpot();
      const dom = this._domCache || {};

      if (this.activeTab === 'minecraft') {
        this.mcGen.randomizeArtifact();
        return;
      }

      if (this.activeTab === 'illusion') {
        const pairs = [
          ['3D', '★!'],
          ['МАЙН!', 'КРАФТ'],
          ['ГЕРОЙ', '★PRO★'],
          ['ЛІДЕР', '👑100👑'],
          ['ДРАКОН', '⚔БОС!⚔'],
          ['АЛМАЗ', '⛏★⚔★⛏']
        ];
        const pick = pairs[Math.floor(Math.random() * pairs.length)];
        if (dom.ilWord1) dom.ilWord1.value = pick[0];
        if (dom.ilWord2) dom.ilWord2.value = pick[1];
        this.rebuildCurrentModel(true, true);
        return;
      }

      if (this.activeTab === 'physics') {
        const sub = dom.phSubmode;
        if (sub) {
          sub.value = sub.value === 'catapult' ? 'balancer' : 'catapult';
          sub.dispatchEvent(new Event('change'));
        }
        return;
      }

      if (this.activeTab === 'mob') {
        const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        if (dom.mobArchetype) dom.mobArchetype.value = randPick(['creeper', 'golem', 'knight', 'dragon', 'cyborg']);
        if (dom.mobEyeType) dom.mobEyeType.value = randPick(['one', 'two', 'three', 'visor', 'creeper']);
        if (dom.mobHeadgear) dom.mobHeadgear.value = randPick(['none', 'horns', 'crown', 'ears', 'antenna']);
        if (dom.mobBackgear) dom.mobBackgear.value = randPick(['none', 'wings', 'jetpack', 'cape']);
        if (dom.mobWeapon) dom.mobWeapon.value = randPick(['sword', 'hammer', 'shield', 'dual_axes']);
        if (dom.mobHeadScale) dom.mobHeadScale.value = (0.85 + Math.random() * 0.55).toFixed(2);
        if (dom.mobBodyBulk) dom.mobBodyBulk.value = (0.85 + Math.random() * 0.45).toFixed(2);
        this.updateValueLabels();
        this.rebuildCurrentModel(true, true);
      }
    }

    // Головна функція побудови поточної 3D-моделі
    rebuildCurrentModel(animatePop = false, skipSound = false) {
      if (animatePop && !skipSound && window.StudioSound) {
        window.StudioSound.playMagicGenerate();
      }

      const dom = this._domCache || {};
      let group = null;

      if (this.activeTab === 'minecraft') {
        group = this.mcGen.build3D({
          voxelSize: dom.mcVoxelSize?.value,
          heightStep: dom.mcHeightStep?.value,
          solidBase: dom.mcSolidBase?.checked,
          mountType: dom.mcMountType?.value,
          customLabel: dom.mcCustomLabel?.value,
          slotWidth: dom.mcSlotWidth?.value || '2.0'
        });
        this.updateMinecraftConnectivityUI();
      } else if (this.activeTab === 'illusion') {
        const colorHex = dom.ilColorPrimary?.value || '#10b981';
        group = this.illusionGen.build3D({
          word1: dom.ilWord1?.value,
          word2: dom.ilWord2?.value,
          voxelSize: dom.ilVoxelSize?.value,
          safeSupports: dom.ilSafeSupports?.checked,
          layoutMode: dom.ilLayoutMode?.value,
          colorPrimary: parseInt(colorHex.replace('#', '0x'), 16)
        });
      } else if (this.activeTab === 'physics') {
        group = this.physicsGen.build3D({
          submode: dom.phSubmode?.value,
          extrudeHeight: dom.phExtrudeHeight?.value,
          springThickness: dom.phSpringThickness?.value,
          wingWeight: dom.phWingWeight?.value,
          armLength: dom.phArmLength?.value,
          includeAmmo: dom.phIncludeAmmo?.checked,
          customText: dom.phCustomText?.value
        });
      } else if (this.activeTab === 'mob') {
        group = this.mobGen.build3D({
          archetype: dom.mobArchetype?.value,
          headScale: dom.mobHeadScale?.value,
          bodyBulk: dom.mobBodyBulk?.value,
          eyeType: dom.mobEyeType?.value,
          headgear: dom.mobHeadgear?.value,
          backGear: dom.mobBackgear?.value,
          weapon: dom.mobWeapon?.value,
          mobName: dom.mobName?.value,
          tinkercadBlank: dom.mobTinkercadBlank?.checked
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
