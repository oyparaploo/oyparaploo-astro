/* Science, Senses and the Body: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\support-iaam.html, its shape only: one fold per kind, then a grid. The panel beside the passage
   holds Every type and one fold per type of writing on the page. Opening a fold shows that type's own line from the
   Writings page and chooses that type in the grid below: all its writings at once, newest first; opening another
   closes the first; closing it, or Every type, puts the grid back as it was. Every writing carries a small
   thermometer in its type's colour; under the hand its column rises (in the stylesheet). The rules of the dark cards
   draw in once, and the pictures and the writings fade in once, as they are reached, in under a second. Show more
   brings the next 24. Without this script the panel stays hidden and the list is the plain list. */
(function () {
  var doc = document;
  function all(s, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var room = doc.querySelector('.sb-room');
  if (!room) return;

  /* the rules draw in, and the pictures and the writings fade in, as they are reached */
  if (!calm && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.classList.add('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    all('.ruled, .reveal, .sb-word', room).forEach(function (el) { io.observe(el); });
  }

  var grid = room.querySelector('.sb-grid');
  var more = room.querySelector('.sb-more');
  var btn = more && more.querySelector('.show-more');

  /* Show more */
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.sb-word.later', grid);
    var now = rest.slice(0, 24);
    now.forEach(function (c) { c.classList.remove('later'); });
    if (rest.length <= 24) more.hidden = true;
    var a = now[0] && now[0].querySelector('.sb-word-a');
    if (a) a.focus({ preventScroll: true });
  });

  /* the folds: Every type, or one type */
  var panel = room.querySelector('.sb-folds');
  if (!panel || !grid) return;
  panel.hidden = false;
  var wrap = room.querySelector('.sb-fold-in');
  if (wrap) wrap.classList.add('folds-on');
  var every = panel.querySelector('.sb-every');
  var folds = all('.sb-fold', panel);

  function choose(fold) {
    var kinds = fold ? fold.getAttribute('data-kinds').split('|') : null;
    folds.forEach(function (f) {
      var on = f === fold;
      f.classList.toggle('open', on);
      f.querySelector('.sb-fold-head').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    if (every) every.setAttribute('aria-pressed', fold ? 'false' : 'true');
    all('.sb-word', grid).forEach(function (c) {
      c.classList.toggle('off', !!kinds && kinds.indexOf(c.getAttribute('data-kind')) < 0);
    });
    grid.classList.toggle('filtered', !!kinds);
    if (more) more.hidden = !!kinds || !grid.querySelector('.sb-word.later');
  }

  if (every) every.addEventListener('click', function () { choose(null); });
  folds.forEach(function (f) {
    f.querySelector('.sb-fold-head').addEventListener('click', function () {
      choose(f.classList.contains('open') ? null : f);
    });
  });
})();
