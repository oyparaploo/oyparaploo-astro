/* Family and Love: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\homepage-iaam_2.html: the tiles and each program card fade in once as they are reached, in under a
   second, as the draft's sections do. The dark card in the blue section chooses the type: Every type, or one; one
   type shows all its writings at once. Show more brings the next 24. Without this script the dark card stays hidden
   and the list is the plain list. Visitors who ask for less motion see everything at once. */
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
    all('.fl-room .reveal, .fl-room .fl-ev').forEach(function (el) { io.observe(el); });
  }

  var grid = doc.querySelector('.fl-room .fl-grid');
  var more = doc.querySelector('.fl-room .fl-more');
  var btn = more && more.querySelector('.show-more');

  /* Show more */
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.fl-ev.later', grid);
    var now = rest.slice(0, 24);
    now.forEach(function (c) { c.classList.remove('later'); });
    if (rest.length <= 24) more.hidden = true;
    var a = now[0] && now[0].querySelector('.fl-ev-a');
    if (a) a.focus({ preventScroll: true });
  });

  /* the dark card: every type, or one */
  var card = doc.querySelector('.fl-room .fl-prog-card');
  if (card && grid) {
    card.hidden = false;
    var choices = all('.fl-choice', card);
    choices.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-kind');
        choices.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        all('.fl-ev', grid).forEach(function (c) { c.classList.toggle('off', !!k && c.getAttribute('data-kind') !== k); });
        grid.classList.toggle('filtered', !!k);
        if (more) more.hidden = !!k || !grid.querySelector('.fl-ev.later');
        /* a long list chosen from far down: bring its top into view */
        var top = grid.getBoundingClientRect().top;
        if (top < 0) grid.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }
})();
