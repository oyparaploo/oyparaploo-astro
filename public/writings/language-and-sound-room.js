/* Language and Sound: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\books-berg.html: the band and each book fade in once as they are reached, in under a second, as the
   draft's cards do. The draft's bar of categories chooses the type: Every type, or one; one type shows all its books
   at once, and the picture cards of other types step back. Show more brings the next 24 books. Visitors who ask for
   less motion see everything at once. */
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
    all('.ls-room .reveal, .ls-room .ls-card').forEach(function (el) { io.observe(el); });
  }

  var grid = doc.querySelector('.ls-room .ls-grid');
  var more = doc.querySelector('.ls-room .ls-more');
  var btn = more && more.querySelector('.show-more');

  /* Show more */
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.ls-card.later', grid);
    var now = rest.slice(0, 24);
    now.forEach(function (c) { c.classList.remove('later'); });
    if (rest.length <= 24) more.hidden = true;
    var a = now[0] && now[0].querySelector('.ls-book');
    if (a) a.focus({ preventScroll: true });
  });

  /* the draft's bar of categories: every type, or one */
  var bar = doc.querySelector('.ls-room .ls-bar');
  if (bar && grid) {
    bar.hidden = false;
    var choices = all('.ls-choice', bar);
    choices.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-kind');
        choices.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        all('.ls-card', grid).forEach(function (c) { c.classList.toggle('off', !!k && c.getAttribute('data-kind') !== k); });
        grid.classList.toggle('filtered', !!k);
        if (more) more.hidden = !!k || !grid.querySelector('.ls-card.later');
      });
    });
  }
})();
