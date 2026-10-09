/* Grief and Loss: the room's own play (October 8, 2026, Claude, Opus, High).
   From HTML DOCS\artists.html: each part fades in once as it is reached, in under a second. Nothing else moves.
   Show more brings the next 24 writings. Visitors who ask for less motion see everything at once. */
(function () {
  var doc = document;
  function all(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null;
  if (!calm && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-reveal');
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.classList.add('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    all('.reveal').forEach(function (el) { io.observe(el); });
  }
  var btn = doc.querySelector('.gl-room .show-more');
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.gl-w.later');
    var now = rest.slice(0, 24);
    now.forEach(function (a) { a.classList.remove('later'); });
    if (rest.length <= 24) btn.parentNode.hidden = true;
    if (now[0]) now[0].focus({ preventScroll: true });
  });
})();
