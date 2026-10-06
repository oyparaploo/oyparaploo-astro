/* Loves: the bar in the list of makers follows the maker being read (parts book block 43).
   A tap on a name or on one of the three panels glides to that maker (the page's smooth scroll;
   none for visitors who ask for less motion). */
(function () {
  var links = {};
  Array.prototype.forEach.call(document.querySelectorAll('.maker-list a[data-for]'), function (a) {
    links[a.getAttribute('data-for')] = a;
  });
  var makers = document.querySelectorAll('.maker');
  if (!makers.length || !('IntersectionObserver' in window)) return;
  var here = null;
  function mark(slug) {
    if (slug === here) return;
    if (here && links[here]) links[here].classList.remove('is-here');
    here = slug;
    if (slug && links[slug]) {
      links[slug].classList.add('is-here');
      links[slug].setAttribute('aria-current', 'true');
    }
    Object.keys(links).forEach(function (k) { if (k !== slug) links[k].removeAttribute('aria-current'); });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) mark(en.target.id); });
  }, { rootMargin: '-45% 0px -54% 0px' });
  Array.prototype.forEach.call(makers, function (m) { io.observe(m); });
  /* Above the first maker, no bar. */
  var first = makers[0];
  window.addEventListener('scroll', function () {
    if (first.getBoundingClientRect().top > window.innerHeight * 0.45) mark(null);
  }, { passive: true });
})();
