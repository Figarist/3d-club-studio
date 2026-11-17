// Безпечне сховище SafeStorage для захисту від SecurityError у приватному режимі браузера
(function () {
  const SafeStorage = {
    _mem: {},

    isSupported() {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return false;
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
      } catch (_) {
        return false;
      }
    },

    getItem(key) {
      if (Object.prototype.hasOwnProperty.call(this._mem, key)) return this._mem[key];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const val = window.localStorage.getItem(key);
          if (val !== null) return val;
        }
      } catch (_) {}
      return Object.prototype.hasOwnProperty.call(this._mem, key) ? this._mem[key] : null;
    },

    setItem(key, value) {
      const strVal = String(value);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, strVal);
          delete this._mem[key];
          return true;
        }
      } catch (_) {
        // Keep the last persisted value; the newer one lives in memory and getItem prefers it.
      }
      this._mem[key] = strVal;
      return false;
    },

    removeItem(key) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (_) {}
      delete this._mem[key];
    }
  };

  window.SafeStorage = SafeStorage;
})();
