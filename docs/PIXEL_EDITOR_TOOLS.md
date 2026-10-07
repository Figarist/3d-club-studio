# Перетворення піксельної сітки

`PixelEditorTools` надає чотири операції над сіткою Minecraft-Кузні:

- віддзеркалення зліва направо;
- віддзеркалення зверху вниз;
- поворот за годинниковою стрілкою на 90°;
- інверсія висоти: `1↔4`, `2↔3`, порожні клітинки лишаються порожніми.

Операції змінюють сітку й зберігають інші поля стану, зокрема палітру кольорів і ключ пресету. Після реальної зміни поточний застосунок додає крок Undo, оновлює 3D-модель та індикатор зв’язності й запускає автозбереження. Порожня сітка або перетворення без змін показує пояснення, не створюючи крок Undo.

## Підключення в поточному застосунку

Сторінка вже завантажує `pixel-editor-tools.css` і `src/pixelEditorTools.js`. Модуль завантажується після `minecraftForge.js` та до `app.js`; у `app.js` він підключається після створення `mcGen` і монтується в наявний елемент:

```html
<div id="pixel-editor-tools"></div>
```

```js
this.pixelTools = new window.PixelEditorTools({
  generator: this.mcGen,
  onBeforeChange: () => this.recordUndoSnapshot(),
  onAfterChange: () => {
    this.markModelModified();
    this.rebuildCurrentModel(false, true);
    this.updateMinecraftConnectivityUI();
    this.autosave();
  }
});
this.pixelTools.mount(document.getElementById('pixel-editor-tools'));
```

Зберігайте назви дій у `data-pixel-tool`: `mirror-left-right`, `mirror-up-down`, `rotate-clockwise`, `invert-relief`. Кнопки є звичайними діями, а повідомлення результату оголошується через статусний текст із `aria-live="polite"`.

Зв’язність клітинок після перетворення не підтверджує manifold-геометрію, сумісність зі слайсером або фізичну міцність. Для друку потрібна окрема перевірка фактичного STL у слайсері; дивіться [посібник перевірки](SLICER_PROFILES.md).
