// Focus ownership for the three core dialogs; no global listeners or timers.
(function () {
  let active = null;
  let returnFocus = null;
  const focusable = () => active ? Array.from(active.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
  )).filter((node) => node.getClientRects().length > 0) : [];
  window.ModalFocus = {
    enter(modal) {
      if (!modal || active === modal) return;
      returnFocus = document.activeElement;
      active = modal;
      const dialog = modal.querySelector('.modal-window, .missions-modal') || modal;
      dialog.tabIndex = -1;
      (focusable()[0] || dialog).focus();
    },
    leave(modal) {
      if (active !== modal) return;
      active = null;
      if (returnFocus?.isConnected) returnFocus.focus();
      returnFocus = null;
    },
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
