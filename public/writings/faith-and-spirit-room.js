/* Faith and Spirit: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\WRITINGS-INDEX_3.html: each of the four lit bands fades in once as it is reached, in under a
   second. Show more, in the draft's paging seat, brings the next 24 writings into the field. Visitors who ask for
   less motion see everything at once. */
(function () {
  var doc = document;
  function all(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* each band fades in as it is reached */
  if (!calm && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.classList.add('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    all('.fs-room .reveal').forEach(function (el) { io.observe(el); });
  }

  /* Show more */
  var btn = doc.querySelector('.fs-room .show-more');
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.fs-entry.later');
    var now = rest.slice(0, 24);
    now.forEach(function (a) { a.classList.remove('later'); });
    if (rest.length <= 24) btn.parentNode.hidden = true;
    if (now[0]) now[0].focus({ preventScroll: true });
  });
})();
