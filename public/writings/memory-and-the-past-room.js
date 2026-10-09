/* Memory and the Past: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\VIDEO_2.html: the page's four pictures are held still on the left while the writings run down the
   right; whichever writing last crossed the middle of the window decides which picture is held, the next picture
   after every sixth writing, fading in as the draft's does. The four short lines under the picture show which is
   held. On a phone the four pictures are a row that swipes sideways, and the lines follow the swipe. Each part
   fades in once as it is reached, in under a second. Show more brings the next 24 writings. Visitors who ask for
   less motion see everything at once, and the picture changes without fading. */
(function () {
  var doc = document;
  function all(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 900px)');

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
    all('.mp-room .reveal').forEach(function (el) { io.observe(el); });
  }

  var held = all('.mp-room .mp-held');
  var ticks = all('.mp-room .mp-tick');
  var at = 0;
  function hold(i) {
    if (i === at || i < 0 || i >= held.length) return;
    at = i;
    held.forEach(function (f, k) { f.classList.toggle('on', k === i); });
    ticks.forEach(function (t, k) { t.classList.toggle('on', k === i); });
  }

  /* the held picture follows the writing that last crossed the middle of the window (wide windows) */
  var mid = null;
  function watch(a) { if (mid) mid.observe(a); }
  if ('IntersectionObserver' in window && held.length) {
    mid = new IntersectionObserver(function (entries) {
      if (!wide.matches) return;
      entries.forEach(function (en) {
        if (en.isIntersecting) hold(parseInt(en.target.getAttribute('data-pic'), 10) || 0);
      });
    }, { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    all('.mp-room .mp-group:not(.later)').forEach(watch);
  }

  /* on a phone the four pictures swipe sideways, and the short lines follow */
  var stack = doc.querySelector('.mp-room .mp-stack');
  if (stack) stack.addEventListener('scroll', function () {
    if (wide.matches) return;
    var w = stack.scrollWidth - stack.clientWidth;
    if (w <= 0) return;
    var i = Math.round(stack.scrollLeft / w * (held.length - 1));
    ticks.forEach(function (t, k) { t.classList.toggle('on', k === i); });
  }, { passive: true });
  wide.addEventListener && wide.addEventListener('change', function () {
    ticks.forEach(function (t, k) { t.classList.toggle('on', k === at); });
  });

  /* Show more */
  var btn = doc.querySelector('.mp-room .show-more');
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.mp-group.later');
    var now = rest.slice(0, 24);
    now.forEach(function (a) { a.classList.remove('later'); watch(a); });
    if (rest.length <= 24) btn.parentNode.hidden = true;
    if (now[0]) now[0].focus({ preventScroll: true });
  });
})();
