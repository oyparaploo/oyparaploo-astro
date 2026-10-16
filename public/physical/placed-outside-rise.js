/* The scroll-in (from Kavi Gupta), on trial, October 16, 2026. Each block marked "rise" starts 20 pixels
   lower and see-through, then rises and settles as it comes into view, once. Less motion gets none, and
   without this script (or without IntersectionObserver) everything simply shows. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var els = document.querySelectorAll('.rise');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) { entries[i].target.classList.add('is-in'); io.unobserve(entries[i].target); }
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  document.documentElement.classList.add('rise-on');
  for (var k = 0; k < els.length; k++) io.observe(els[k]);
})();
