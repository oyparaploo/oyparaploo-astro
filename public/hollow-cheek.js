/* Hollow Cheek: the room's own script.
   The arrival fills the window under the header, as the draft's screen does. The stations arrive as they are
   reached, within a second. Less motion: nothing moves. Without this script every station stands in its place. */
(function () {
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  var arrival = document.querySelector('.hc-arrival');
  if (arrival) {
    var top = function () { root.style.setProperty('--hc-top', Math.max(0, Math.round(arrival.getBoundingClientRect().top + window.scrollY)) + 'px'); };
    top(); window.addEventListener('resize', top);
  }

  if (still || !('IntersectionObserver' in window)) return;
  root.classList.add('hc-js');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.hc-will').forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
  });
})();
