/* The About room, a design room (the third set), from making-v2_2.html.
   The tips and the chapters' doors rise once as they come into view, as the draft's rooms fade in.
   For visitors who ask for less motion, and without the script, everything simply shows. */
(function () {
  var doc = document;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = Array.prototype.slice.call(doc.querySelectorAll('.ab-tip, .ab-card'));
  if (still || !els.length || !('IntersectionObserver' in window)) return;
  doc.documentElement.classList.add('js');
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
  });
})();
