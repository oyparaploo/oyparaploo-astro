/* Shelter of Tomorrow's Pathetic Overconfidence: the room's own script.
   The rows and the walls of pictures arrive as they are reached, within a second. Less motion: nothing moves.
   Without this script everything stands in its place. */
(function () {
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) return;
  var root = document.documentElement;
  var els = document.querySelectorAll('.sh-rows li, .sh-gal-row, .sh-wall');
  for (var i = 0; i < els.length; i++) els[i].classList.add('sh-will');
  root.classList.add('sh-js');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -30px 0px' });
  for (var j = 0; j < els.length; j++) {
    var r = els[j].getBoundingClientRect();
    if (r.top < window.innerHeight) els[j].classList.add('is-in'); else io.observe(els[j]);
  }
})();
