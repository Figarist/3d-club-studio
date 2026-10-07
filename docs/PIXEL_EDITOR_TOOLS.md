# Pixel editor tools

`PixelEditorTools` adds four reversible transformations below the Minecraft pixel grid: left-right mirror, up-down mirror, clockwise 90° rotation, and relief inversion. Relief inversion maps levels `1↔4` and `2↔3`; empty cells remain empty. Each action keeps the generator's current preset key and color palette.

Load the module after `minecraftForge.js` and before `app.js`, and load `pixel-editor-tools.css` with the other local stylesheets. Add a mount element after the pixel grid:

```html
<div data-pixel-tools-mount></div>
```

Mount the toolbar after creating `mcGen` in the app constructor. The callbacks connect it to the existing undo and model-update flow:

```js
this.pixelEditorTools = new window.PixelEditorTools({
  generator: this.mcGen,
  onBeforeChange: () => this.recordUndoSnapshot(),
  onAfterChange: () => {
    this.rebuildCurrentModel(true, true);
    this.markModelModified();
    this.autosave();
  }
});
this.pixelEditorTools.mount(document.querySelector('[data-pixel-tools-mount]'));
```

The toolbar edits a copied `getState()` value and commits it with `setState(state, false)`. It calls the before callback only when the grid will change, then calls the after callback once. Symmetric shapes and empty grids produce a short live hint without creating an undo entry.
