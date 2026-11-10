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
  if (pics.length > 1 && btn) {
    /* The Still mend (November 9, 2026; SITE-ORDER\STILL-MEND-BUILD): the turning is set up every time the page opens,
       Still or not. Opened Still (or with less motion), the hero rests on the first logotype and the round button
       goes; the moment Still is turned off, the button comes back and the hero turns, with no reload. */
    var calmQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    var i = 0, timer = null;
    var turn = function () {
      pics[i].classList.remove('is-on');
      i = (i + 1) % pics.length;
      var img = pics[i].querySelector('img');
      if (img && img.loading === 'lazy') img.loading = 'eager';
      pics[i].classList.add('is-on');
    };
    var play = function () { if (calmQ.matches) return; if (!timer) timer = setInterval(turn, 4000); btn.classList.remove('is-paused'); btn.setAttribute('aria-label', 'Pause'); };
    var pause = function () { clearInterval(timer); timer = null; btn.classList.add('is-paused'); btn.setAttribute('aria-label', 'Play'); };
    var rest = function () { pause(); btn.hidden = true; pics[i].classList.remove('is-on'); i = 0; pics[0].classList.add('is-on'); };
    var wake = function () { for (var k = 1; k < pics.length; k++) { var im = pics[k].querySelector('img'); if (im) im.loading = 'eager'; } };
    btn.addEventListener('click', function () { if (timer) pause(); else play(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && timer) { clearInterval(timer); timer = null; } else if (!document.hidden && !btn.classList.contains('is-paused')) play(); });
    // the pictures waiting in the hero load once the page has arrived (opened Still, once Still is turned off)
    window.addEventListener('load', function () { if (!calmQ.matches) wake(); });
    /* The Still switch (November 8, 2026; SITE-ORDER\STILL-SWITCH-BUILD): pressed while the hero turns, it rests on
       the first logotype and the round button goes, as for less motion; pressed again, the hero turns again. */
    var onCalm = function (ev) {
      if (ev.matches) rest();
      else { btn.hidden = false; wake(); play(); }
    };
    if (calmQ.addEventListener) calmQ.addEventListener('change', onCalm);
    if (calmQ.matches) rest(); else { btn.hidden = false; play(); }
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
