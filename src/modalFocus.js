// Focus ownership for the three core dialogs; no global listeners or timers.
(function () {
  let active = null;
  const stack = [];
  const focusable = () => active ? Array.from(active.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"], a[href]'
  )).filter((node) => node.getClientRects().length > 0) : [];
  window.ModalFocus = {
    enter(modal) {
      if (!modal || active === modal) return;
      const idx = stack.findIndex((e) => e.modal === modal);
      if (idx >= 0) stack.splice(idx, 1);
      stack.push({ modal, returnFocus: document.activeElement });
      active = modal;
      const dialog = modal.querySelector('.modal-window, .missions-modal') || modal;
      dialog.tabIndex = -1;
      (focusable()[0] || dialog).focus();
    },
    leave(modal) {
      const idx = stack.findIndex((e) => e.modal === modal);
      if (idx < 0) return;
      const [entry] = stack.splice(idx, 1);
      if (active !== modal) return;
      active = stack.length ? stack[stack.length - 1].modal : null;
      if (entry.returnFocus?.isConnected) entry.returnFocus.focus();
    },
    isTopmost(modal) { return active === modal; },
    handleKey(event) {
      if (!active || event.key !== 'Tab') return;
      const nodes = focusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first) { event.preventDefault(); active.focus(); return; }
      if (!active.contains(document.activeElement) ||
          (event.shiftKey && document.activeElement === first) ||
          (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
  };
})();
