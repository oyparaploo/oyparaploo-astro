/* War and Displacement: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\TEST-DARK-OCULA-ENTRANCE_4.html, the dark entrance, and the pictures it holds (Night Red Cross Tent):
   where a pointer can hover, a faint light the colour of the lit tarp follows the hand across the night, as a lamp
   moves inside the tent; on a touch screen, and for visitors who ask for less motion, it sits still behind the title.
   The pictures, the band and the writings fade in once as they are reached, in under a second. The line above the
   writings chooses the type: Every type, or one; one type shows all its writings at once, and the three cards above
   that are not of it step back. Show more brings the next 24. Without this script the chooser stays hidden and the
   list is the plain list. */
(function () {
  var doc = document;
  function all(s, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var room = doc.querySelector('.wd-room');
  if (!room) return;

  /* the lamp follows the hand */
  var lamp = room.querySelector('.wd-lamp');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (lamp && fine && !calm) {
    room.classList.add('lamp-follows');
    var x = 0, y = 0, raf = 0;
    room.addEventListener('pointermove', function (ev) {
      var r = room.getBoundingClientRect();
      x = ev.clientX - r.left; y = ev.clientY - r.top;
      if (!raf) raf = window.requestAnimationFrame(function () {
        raf = 0;
        lamp.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      });
      room.classList.add('lit');
    });
    room.addEventListener('pointerleave', function () { room.classList.remove('lit'); });
  }

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
    all('.reveal, .wd-word', room).forEach(function (el) { io.observe(el); });
  }

  var grid = room.querySelector('.wd-grid');
  var more = room.querySelector('.wd-more');
  var btn = more && more.querySelector('.show-more');

  /* Show more */
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.wd-word.later', grid);
    var now = rest.slice(0, 24);
    now.forEach(function (c) { c.classList.remove('later'); });
    if (rest.length <= 24) more.hidden = true;
    var a = now[0] && now[0].querySelector('.wd-word-a');
    if (a) a.focus({ preventScroll: true });
  });

  /* the chooser: every type, or one */
  var bar = room.querySelector('.wd-choices');
  if (bar && grid) {
    bar.hidden = false;
    var choices = all('.wd-choice', bar);
    choices.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-kind');
        choices.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        all('.wd-word', grid).forEach(function (c) { c.classList.toggle('off', !!k && c.getAttribute('data-kind') !== k); });
        all('.wd-witness', room).forEach(function (c) { c.classList.toggle('off', !!k && c.getAttribute('data-kind') !== k); });
        grid.classList.toggle('filtered', !!k);
        if (more) more.hidden = !!k || !grid.querySelector('.wd-word.later');
        /* a long list chosen from far down: bring the chooser back into view */
        if (bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }
})();
