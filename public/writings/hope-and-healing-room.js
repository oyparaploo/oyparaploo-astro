/* Hope and Healing: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\VR-season-landing_2.html: the line across the top of the window fills as the page is read, in the
   green of the shoots, from the dark at the top to the white at the foot. Each part fades in once as it is reached,
   in under a second. Show more brings the next 24 writings. Visitors who ask for less motion see everything at once,
   and no line. */
(function () {
  var doc = document;
  function all(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* the line across the top of the window */
  var line = doc.querySelector('.hh-room .hh-progress');
  if (line && !calm) {
    var queued = false;
    var draw = function () {
      queued = false;
      var h = doc.documentElement.scrollHeight - window.innerHeight;
      line.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0) + ')';
    };
    var soon = function () { if (!queued) { queued = true; requestAnimationFrame(draw); } };
    window.addEventListener('scroll', soon, { passive: true });
    window.addEventListener('resize', soon);
    draw();
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
    all('.hh-room .reveal').forEach(function (el) { io.observe(el); });
  }

  /* Show more */
  var btn = doc.querySelector('.hh-room .show-more');
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.hh-story.later');
    var now = rest.slice(0, 24);
    now.forEach(function (a) { a.classList.remove('later'); });
    if (rest.length <= 24) btn.parentNode.hidden = true;
    if (now[0]) now[0].focus({ preventScroll: true });
    if (line && !calm) window.dispatchEvent(new Event('resize'));
  });
})();
