/* "Made Of +" on a Placings set page (ruled perfect November 10, 2026). The bar opens and closes the panel.
   Closes with the bar's ×, a press outside the panel, or the Escape key. The slide is CSS only, so the
   Still switch and less motion need nothing here. */
(function () {
  var bar = document.querySelector('.mo-bar');
  var panel = document.getElementById('mo-panel');
  if (!bar || !panel) return;
  var sign = bar.querySelector('.mo-bar-sign');
  var root = document.documentElement;
  var phone = window.matchMedia ? window.matchMedia('(max-width: 700px)') : null;

  function isOpen() { return panel.classList.contains('is-open'); }

  function open() {
    panel.classList.add('is-open');
    panel.removeAttribute('aria-hidden');
    panel.removeAttribute('inert');
    bar.setAttribute('aria-expanded', 'true');
    if (sign) sign.textContent = '×';
    if (phone && phone.matches) root.classList.add('mo-open-phone');
    try { panel.focus({ preventScroll: true }); } catch (e) { panel.focus(); }
  }

  function close(back) {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('inert', '');
    bar.setAttribute('aria-expanded', 'false');
    if (sign) sign.textContent = '+';
    root.classList.remove('mo-open-phone');
    if (back) bar.focus();
  }

  bar.addEventListener('click', function () { if (isOpen()) close(false); else open(); });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) { e.preventDefault(); close(true); }
  });

  document.addEventListener('pointerdown', function (e) {
    if (!isOpen()) return;
    if (panel.contains(e.target) || bar.contains(e.target)) return;
    close(false);
  });

  close(false);
})();
