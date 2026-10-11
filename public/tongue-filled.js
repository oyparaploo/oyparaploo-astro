/* Tongue-Filled: the room's own script.
   The hero turns through the logotypes, one every four seconds, each fading into the next; the round button pauses it
   and starts it again. The tiles arrive as they are reached, within a second. Less motion: nothing turns and
   nothing moves. Without this script the first logotype stands, and every tile stands in its place. */
(function () {
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // the hero fills the window under the header
  var hero = document.querySelector('.tf-hero');
  if (hero) {
    var top = function () { root.style.setProperty('--tf-top', Math.max(0, Math.round(hero.getBoundingClientRect().top + window.scrollY)) + 'px'); };
    top(); window.addEventListener('resize', top);
  }

  // the hero turns
  var pics = document.querySelectorAll('.tf-hero-pic');
  var btn = document.querySelector('.tf-pause');
  if (pics.length > 1 && btn && !still) {
    var i = 0, timer = null;
    var turn = function () {
      pics[i].classList.remove('is-on');
      i = (i + 1) % pics.length;
      var img = pics[i].querySelector('img');
      if (img && img.loading === 'lazy') img.loading = 'eager';
      pics[i].classList.add('is-on');
    };
    var play = function () { if (!timer) timer = setInterval(turn, 4000); btn.classList.remove('is-paused'); btn.setAttribute('aria-label', 'Pause'); };
    var pause = function () { clearInterval(timer); timer = null; btn.classList.add('is-paused'); btn.setAttribute('aria-label', 'Play'); };
    btn.hidden = false;
    btn.addEventListener('click', function () { if (timer) pause(); else play(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && timer) { clearInterval(timer); timer = null; } else if (!document.hidden && !btn.classList.contains('is-paused')) play(); });
    // the pictures waiting in the hero load once the page has arrived
    window.addEventListener('load', function () {
      for (var k = 1; k < pics.length; k++) { var im = pics[k].querySelector('img'); if (im) im.loading = 'eager'; }
    });
    play();
  }

  // the tiles arrive as they are reached
  if (still || !('IntersectionObserver' in window)) return;
  root.classList.add('tf-js');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.tf-will').forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
  });
})();
