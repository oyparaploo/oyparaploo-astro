/* Come Stand. Three plays, each from the writing, none for visitors who ask for less motion.
   1. The tube of brown: a line across the top of the window, full when the writing begins, spent as it is
      read, and left at two ninths when it ends ("One tube of R43.20 brown, nearly empty." "Enough for two
      more.").
   2. The paragraphs arrive as the reader reaches them, as the faces come back while Grace paints.
   3. The silence after it is the room: a band of the brown, wet when the visitor reaches it, deepening while
      the visitor stands in it, "as the water evaporates". Once dry it stays dry.
   Without this script nothing is hidden: no line, every paragraph in place, the band already dry. */
(function () {
  var root = document.documentElement;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) return;
  var writing = document.querySelector('.writing-in');

  // 1. The tube.
  var tube = document.querySelector('.tube');
  var paint = tube && tube.querySelector('.tube-paint');
  var LEFT = 2 / 9;
  if (paint && writing) {
    var ticking = false;
    var spend = function () {
      ticking = false;
      var r = writing.getBoundingClientRect();
      var p = (window.innerHeight * 0.6 - r.top) / Math.max(1, r.height);
      p = Math.min(1, Math.max(0, p));
      paint.style.transform = 'scaleX(' + (1 - p * (1 - LEFT)).toFixed(4) + ')';
    };
    var ask = function () { if (!ticking) { ticking = true; requestAnimationFrame(spend); } };
    tube.hidden = false;
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    spend();
  }

  if (!('IntersectionObserver' in window)) return;

  // 2. The paragraphs arrive.
  if (writing) {
    var ps = writing.querySelectorAll('p');
    root.classList.add('stand-fade');
    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) {
        if (es[i].isIntersecting) { es[i].target.classList.add('in'); io.unobserve(es[i].target); }
      }
    }, { rootMargin: '0px 0px -6% 0px' });
    for (var j = 0; j < ps.length; j++) io.observe(ps[j]);
  }

  // 3. The silence dries while the visitor stands in it.
  var band = document.querySelector('.silence');
  if (band) {
    var WET = [110, 86, 64];        // #6E5640: the brown wet, the pale cloth showing through it
    var DRY = [78, 49, 24];         // #4E3118: the brown of the strokes, dry
    var SECONDS = 14;
    var t = 0, inside = false, last = 0, run = 0;
    var colour = function (k) {
      var c = [];
      for (var i = 0; i < 3; i++) c.push(Math.round(WET[i] + (DRY[i] - WET[i]) * k));
      band.style.backgroundColor = 'rgb(' + c.join(', ') + ')';
    };
    var frame = function (now) {
      run = 0;
      if (!inside) { last = 0; return; }
      if (last) t += Math.min(0.1, (now - last) / 1000);
      last = now;
      var k = Math.min(1, t / SECONDS);
      colour(1 - (1 - k) * (1 - k));
      if (k < 1) run = requestAnimationFrame(frame);
    };
    colour(0);
    var steps = [];
    for (var s = 0; s <= 20; s++) steps.push(s / 20);
    new IntersectionObserver(function (es) {
      var e = es[es.length - 1];
      inside = e.isIntersecting && e.intersectionRect.height >= 0.45 * window.innerHeight;
      if (inside && !run && t < SECONDS) { last = 0; run = requestAnimationFrame(frame); }
    }, { threshold: steps }).observe(band);
  }
})();
