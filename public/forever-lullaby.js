/* Forever Lullaby: either picture opens the whole drawing large on the dark ground; a tap, a click or Escape closes it. */
(function () {
  var opener = null, view = null;
  function close() {
    if (!view) return;
    view.remove(); view = null;
    document.removeEventListener('keydown', onKey);
    if (opener) opener.focus();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.fl-open');
    if (!b) return;
    opener = b;
    view = document.createElement('div');
    view.className = 'fl-view';
    view.setAttribute('role', 'dialog');
    view.setAttribute('aria-modal', 'true');
    view.setAttribute('aria-label', 'Forest Gull Enda Totalis, whole. Tap or press Escape to close.');
    view.tabIndex = -1;
    var img = document.createElement('img');
    img.src = b.getAttribute('data-full');
    img.alt = 'Forest Gull Enda Totalis, the whole drawing';
    view.appendChild(img);
    view.addEventListener('click', close);
    document.body.appendChild(view);
    document.addEventListener('keydown', onKey);
    view.focus();
  });
})();
