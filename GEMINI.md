# 🤖 GEMINI.md — Інструкції та Правила Розробки для Gemini & Antigravity

Цей файл визначає обов'язкові правила для Gemini в репозиторії **3D Club Studio**.

Детальні інженерні стандарти дивіться у [AGENTS.md](AGENTS.md).

Current schema/identity and ownership contracts: [docs/EXTENSIONS.md](docs/EXTENSIONS.md).
Use ContentRegistry for packs and ProjectState before applying imported JSON.
Stage only owned paths. Verification evidence and deferred print/file-download
gates are recorded in [docs/ARCHITECTURE_AUDIT.md](docs/ARCHITECTURE_AUDIT.md).

## ⚡ Обов'язкові Дії при завершенні кожної задачі
1. **Завжди робити Git Commit & Push**:
   - Після виконання будь-яких правок чи фіч обов'язково виконати:
     ```bash
     git add <owned-paths>
     git commit -m "..."
     git push origin main
     ```
   - Ніколи не залишати незбережені зміни локально без пушу, якщо користувач дав добро або задача завершена.

2. **Синхронізація версії (якщо версія оновлюється)**:
   - `index.html` — `#app-version-pill` (`.version-pill`) та `#app-version-corner` (`.version-corner-badge`).
   - `src/app.js` — `version` у `serializeState()`.
   - `src/passportPrintController.js` — підвал паспорта у `renderRetinaCanvas()`.
   - `README.md` — заголовок та опис.

3. **100% Offline-First**:
   - Без зовнішніх CDN, зовнішніх шрифтів, npm-пакунків чи мережевих запитів. Лише нативний Vanilla JS/CSS та Three.js r128 з папки `lib/`.

4. **Адаптивність під шкільні ноутбуки**:
   - Мінімальна роздільна здатність: **1366×768** та **1024×768**.
   - Верхня панель (топбар) не повинна ламатися або приховувати кнопку STL.

5. **Стабільність камери та аудіо**:
   - Ізометрія центрує погляд на `(0, 18, 0)`.
   - Звуки через Web Audio API повинні бути достатньо гучними для динаміків ноутбука (`masterGain ≥ 0.70`).
   - Ручне обертання мишкою знімає клас `.active-cam` з кнопок ракурсів.

## 🧭 Gemini-Специфічні Вказівки

### Мова
- **Коментарі у коді:** українською (усталена конвенція проєкту).
- **Повідомлення комітів:** англійською у форматі Conventional Commits (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`).
- **Спілкування з користувачем:** українською.

### Тулінг та Обмеження
- **Заборонено** пропонувати міграцію на TypeScript, webpack, Vite, ESLint або будь-який збирач/лінтер.
- **Заборонено** додавати `package.json`, `node_modules`, `.eslintrc` або подібне.
- Усі модулі — IIFE на `window.*`. Не переводити на ES modules (`import`/`export`).
- Якщо потрібна нова утиліта — створити новий `.js` файл із IIFE та зареєструвати на `window`.

### Порядок Дій при Модифікації UI
1. Відкрити `index.html` → знайти цільовий елемент.
2. Перевірити відповідний CSS у `styles.css` → чи є стилі для всіх класів?
3. Перевірити JS-прив'язки у `src/app.js` → чи є обробники подій?
4. Перевірити `data-*` атрибути → чи збігаються з конвенціями у AGENTS.md §4?
5. Після змін — **відкрити в браузері**, перевірити консоль на помилки.

### Критичні Файли (не чіпати без потреби)
- `lib/three.min.js` — вендорна бібліотека, ніколи не редагувати.
- Порядок `<script>` тегів у `index.html` — змінювати лише з повним розумінням залежностей (AGENTS.md §3.2).
- `src/voxelFont.js` — великий масив піксельних даних шрифту, правки лише при додаванні нових гліфів.
