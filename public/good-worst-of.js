/* Good Worst Of: the room's own small script. Without it the page stands whole.
   With it: the parts arrive as they are reached, within a second; and the draft's
   tab on the left edge of the window comes in once the hero is passed, taking the
   visitor back to the top. Less motion: the parts simply stand, and the tab still works. */
(function () {
  'use strict';
  var root = document.documentElement;
  var room = document.querySelector('.gw-room');
  if (!room) return;
  root.classList.add('gw-js');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the parts arrive as they are reached ---------- */
  var parts = room.querySelectorAll('.gw-will');
  function showAll() { for (var i = 0; i < parts.length; i++) parts[i].classList.add('gw-in'); }
  if (still || !('IntersectionObserver' in window)) { showAll(); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('gw-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    for (var i = 0; i < parts.length; i++) io.observe(parts[i]);
    setTimeout(function () {   /* nothing waits more than about a second once it is on the screen */
      for (var j = 0; j < parts.length; j++) {
        var r = parts[j].getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) parts[j].classList.add('gw-in');
      }
    }, 900);
  }

  /* ---------- the tab on the left edge ---------- */
  var tab = room.querySelector('.gw-tab');
  var hero = room.querySelector('.gw-hero');
  if (tab && hero) {
    var ticking = false;
    function place() {
      ticking = false;
      var past = hero.getBoundingClientRect().bottom < 0;
      tab.classList.toggle('gw-tab-on', past);
      tab.tabIndex = past ? 0 : -1;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(place); } }, { passive: true });
    place();
    tab.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
      var t = room.querySelector('.gw-title'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  }
})();
