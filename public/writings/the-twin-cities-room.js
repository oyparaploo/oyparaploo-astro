/* The Twin Cities: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\TEST-DARK-OCULA-HOME_3.html, the dark home page with one lead item, and the pictures it holds (Dirty
   Ol Shipyard): the low sun. Where a pointer can hover, a panel catches a raking warm light from its left edge under the
   hand (that part is the room's .css); on a touch screen the panel at the middle of the window catches it as the page
   moves; for visitors who ask for less motion it does not move. The band, the pictures and the cards fade in once as
   they are reached, in under a second. The line above the cards chooses the type: Every type, or one; one type shows
   all its writings at once. Show more brings the next 24. Without this script the chooser stays hidden and the list is
   the plain list. */
(function () {
  var doc = document;
  function all(s, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var room = doc.querySelector('.tc-room');
  if (!room) return;

  /* each part fades in as it is reached */
  if (!calm && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.classList.add('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    all('.reveal, .tc-card', room).forEach(function (el) { io.observe(el); });
  }

  /* the low sun on a touch screen: the panel at the middle of the window catches it */
  var touch = !window.matchMedia('(hover: hover)').matches;
  if (touch && !calm && 'IntersectionObserver' in window) {
    var sun = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('lit', en.isIntersecting); });
    }, { rootMargin: '-42% 0px -42% 0px' });
    all('.tc-card-a', room).forEach(function (a) { if (a.querySelector('.tc-panel')) sun.observe(a); });
  }

  var grid = room.querySelector('.tc-grid');
  var more = room.querySelector('.tc-more');
  var btn = more && more.querySelector('.show-more');

  /* Show more */
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.tc-card.later', grid);
    var now = rest.slice(0, 24);
    now.forEach(function (c) { c.classList.remove('later'); });
    if (rest.length <= 24) more.hidden = true;
    var a = now[0] && now[0].querySelector('.tc-card-a');
    if (a) a.focus({ preventScroll: true });
  });

  /* the chooser: every type, or one */
  var bar = room.querySelector('.tc-choices');
  if (bar && grid) {
    bar.hidden = false;
    var choices = all('.tc-choice', bar);
    choices.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-kind');
        choices.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        all('.tc-card', grid).forEach(function (c) {
          c.classList.toggle('off', !!k && c.getAttribute('data-kind') !== k);
          c.classList.add('visible');
        });
        grid.classList.toggle('filtered', !!k);
        if (more) more.hidden = !!k || !grid.querySelector('.tc-card.later');
        if (bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }
})();
