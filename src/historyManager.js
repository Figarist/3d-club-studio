// Менеджер історії змін (Undo / Redo) для студії «3D Кузня Чудес»
(function () {
  class HistoryManager {
    constructor(options = {}) {
      this.maxHistory = options.maxHistory || 35;
      this.undoStack = [];
      this.redoStack = [];
      this.onStateChange = options.onStateChange || null;
    }

    canUndo() {
      return this.undoStack.length > 0;
    }

    canRedo() {
      return this.redoStack.length > 0;
    }

    recordSnapshot(state) {
      if (!state) return;
      try {
        const serialized = JSON.stringify(state);
        // Не зберігаємо дублікат останнього стану
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === serialized) {
          return;
        }
        this.undoStack.push(serialized);
        if (this.undoStack.length > this.maxHistory) {
          this.undoStack.shift();
        }
        this.redoStack = [];
        this._notify();
      } catch (err) {
        console.warn('HistoryManager.recordSnapshot error:', err);
      }
    }

    undo(currentState) {
      if (!this.canUndo()) return null;
      try {
        if (currentState) {
          this.redoStack.push(JSON.stringify(currentState));
          if (this.redoStack.length > this.maxHistory) {
            this.redoStack.shift();
          }
        }
        const prevJson = this.undoStack.pop();
        this._notify();
        return JSON.parse(prevJson);
      } catch (err) {
        console.warn('HistoryManager.undo error:', err);
        return null;
      }
    }

    redo(currentState) {
      if (!this.canRedo()) return null;
      try {
        if (currentState) {
          this.undoStack.push(JSON.stringify(currentState));
          if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
          }
        }
        const nextJson = this.redoStack.pop();
        this._notify();
        return JSON.parse(nextJson);
      } catch (err) {
        console.warn('HistoryManager.redo error:', err);
        return null;
      }
    }

    clear() {
      this.undoStack = [];
      this.redoStack = [];
      this._notify();
    }

    _notify() {
      if (typeof this.onStateChange === 'function') {
        this.onStateChange(this.canUndo(), this.canRedo());
      }
    }

    updateUI(btnUndo, btnRedo, btnMcUndo) {
      const u = this.canUndo();
      const r = this.canRedo();
      if (btnUndo) {
        btnUndo.disabled = !u;
        btnUndo.classList.toggle('disabled', !u);
      }
      if (btnRedo) {
        btnRedo.disabled = !r;
        btnRedo.classList.toggle('disabled', !r);
      }
      if (btnMcUndo) {
        btnMcUndo.disabled = !u;
        btnMcUndo.classList.toggle('disabled', !u);
      }
    }
  }

  window.HistoryManager = HistoryManager;
})();
