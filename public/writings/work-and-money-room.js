/* Work and Money: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\CLEAN-dispatch-blend_2.html: the pictures, the writings and the band fade in once as they are
   reached, in under a second. The line of section titles above the writings chooses the type: Every type, or one;
   one type shows all its writings at once. Show more brings the next 24. Without this script the chooser stays
   hidden and the list is the plain list. Visitors who ask for less motion see everything at once. */
(function () {
  var doc = document;
  function all(s, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    all('.wm-room .reveal, .wm-room .wm-row').forEach(function (el) { io.observe(el); });
  }

  var list = doc.querySelector('.wm-room .wm-list');
  var more = doc.querySelector('.wm-room .wm-more');
  var btn = more && more.querySelector('.show-more');

  /* Show more */
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.wm-row.later', list);
    var now = rest.slice(0, 24);
    now.forEach(function (c) { c.classList.remove('later'); });
    if (rest.length <= 24) more.hidden = true;
    var a = now[0] && now[0].querySelector('.wm-row-a');
    if (a) a.focus({ preventScroll: true });
  });

  /* the chooser: every type, or one */
  var bar = doc.querySelector('.wm-room .wm-choices');
  if (bar && list) {
    bar.hidden = false;
    var choices = all('.wm-choice', bar);
    choices.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-kind');
        choices.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        all('.wm-row', list).forEach(function (c) { c.classList.toggle('off', !!k && c.getAttribute('data-kind') !== k); });
        list.classList.toggle('filtered', !!k);
        if (more) more.hidden = !!k || !list.querySelector('.wm-row.later');
        /* a long list chosen from far down: bring the chooser back into view */
        if (bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }
})();
