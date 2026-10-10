/* The Placings page, a design room (dressed in oyparaploo-thyssen_2.html).
   PLAY, from the draft: every section fades in as it is reached, the cards one by one along their row, and the
   fading vertical line between sections draws itself downward. Each is in place within a second.
   Visitors who ask for less motion get none: everything stands from the start. Without this script, or without
   IntersectionObserver, everything stands from the start too. */
(function () {
  var root = document.documentElement;
  var room = document.querySelector('.placings-room');
  if (!room || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Each card in a row arrives a beat after the one before it, so a row fills from the left.
  var cards = room.querySelectorAll('.p-card');
  function stagger() {
    var top = null, col = 0;
    for (var i = 0; i < cards.length; i++) {
      var t = cards[i].offsetTop;
      col = (t === top) ? col + 1 : 0;
      top = t;
      cards[i].style.setProperty('--p-d', Math.min(col, 4) * 0.06 + 's');
    }
  }

  root.classList.add('p-js');
  stagger();
  window.addEventListener('resize', stagger);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  var all = room.querySelectorAll('.p-reveal, .p-card, .p-river');
  for (var i = 0; i < all.length; i++) io.observe(all[i]);

  // Anything already passed (a visitor arriving at an anchor, or coming back down the page) stands at once.
  function settle() {
    for (var i = 0; i < all.length; i++) {
      if (all[i].getBoundingClientRect().bottom < 0) { all[i].classList.add('is-in'); io.unobserve(all[i]); }
    }
  }
  window.addEventListener('load', settle);
})();
