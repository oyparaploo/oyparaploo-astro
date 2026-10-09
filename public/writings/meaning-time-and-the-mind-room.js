/* Meaning, Time and the Mind: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\05-met-exhibitions_2.html, the museum's exhibitions page: each row of cards slides sideways under its
   pair of round arrows (and with a finger or a trackpad), the rail under it showing where the row stands; the arrows
   rest at the row's two ends. The line above the second row chooses the type: Every type, or one; one type shows all
   its writings at once, and the cards above that are not of it step back. Show more brings the next 24. The grid's
   cards fade in once as they are reached, in under a second. Under the hand each clock's minute hand goes once around
   the hour and comes back to its minute (the room's .css). Without this script the arrows and the chooser stay hidden,
   the rows still slide, and the list is the plain list. */
(function () {
  var doc = document;
  function all(s, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var room = doc.querySelector('.mt-room');
  if (!room) return;

  /* each row slides under its arrows; the rail shows where it stands */
  all('.mt-section', room).forEach(function (sec) {
    var row = sec.querySelector('.mt-slider');
    if (!row) return;
    var pair = sec.querySelector('.mt-arrows');
    var track = sec.querySelector('.mt-track');
    var bar = track && track.querySelector('span');
    var prev = pair && pair.querySelector('.mt-prev');
    var next = pair && pair.querySelector('.mt-next-b');
    function step() {
      var c = all('.mt-word', row).filter(function (x) { return x.offsetParent !== null; })[0];
      return c ? c.getBoundingClientRect().width + 24 : 360;
    }
    function show() {
      var max = row.scrollWidth - row.clientWidth;
      var fits = max < 4;
      if (pair) pair.hidden = fits;
      if (track) track.hidden = fits;
      if (prev) prev.disabled = row.scrollLeft < 4;
      if (next) next.disabled = row.scrollLeft > max - 4;
      if (bar && !fits) {
        var w = row.clientWidth / row.scrollWidth;
        bar.style.width = (w * 100) + '%';
        bar.style.marginLeft = ((1 - w) * (row.scrollLeft / max) * 100) + '%';
      }
    }
    if (prev) prev.addEventListener('click', function () { row.scrollBy({ left: -step(), behavior: calm ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { row.scrollBy({ left: step(), behavior: calm ? 'auto' : 'smooth' }); });
    var raf = 0;
    row.addEventListener('scroll', function () { if (!raf) raf = window.requestAnimationFrame(function () { raf = 0; show(); }); }, { passive: true });
    window.addEventListener('resize', show);
    sec._show = show;
    show();
    window.addEventListener('load', show);
  });

  /* the grid's cards fade in as they are reached */
  if (!calm && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.classList.add('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    all('.reveal, .mt-grid .mt-word', room).forEach(function (el) { io.observe(el); });
  }

  var grid = room.querySelector('.mt-grid');
  var more = room.querySelector('.mt-more');
  var btn = more && more.querySelector('.show-more');

  /* Show more */
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.mt-word.later', grid);
    var now = rest.slice(0, 24);
    now.forEach(function (c) { c.classList.remove('later'); });
    if (rest.length <= 24) more.hidden = true;
    var a = now[0] && now[0].querySelector('.mt-word-a');
    if (a) a.focus({ preventScroll: true });
  });

  /* the chooser: every type, or one */
  var choiceBar = room.querySelector('.mt-choices');
  if (choiceBar && grid) {
    choiceBar.hidden = false;
    var choices = all('.mt-choice', choiceBar);
    var recent = room.querySelector('.mt-recent');
    choices.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-kind');
        choices.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        all('.mt-word', room).forEach(function (c) { c.classList.toggle('off', !!k && c.getAttribute('data-kind') !== k); });
        grid.classList.toggle('filtered', !!k);
        if (more) more.hidden = !!k || !grid.querySelector('.mt-word.later');
        all('.mt-section', room).forEach(function (s) {
          var row = s.querySelector('.mt-slider');
          if (row) row.scrollLeft = 0;
          if (s._show) s._show();
        });
        /* chosen from far down: bring the chooser back into view */
        if (recent && choiceBar.getBoundingClientRect().top < 0) recent.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }
})();
