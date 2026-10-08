/* The walks page, a design room (the first of the second set), from CLEAN-portraits-landing-v4.html.
   1. The sky drifts from one walk's colours to the next, in Reach's order, while the first window is in view.
   2. How long do you have? A choice keeps the walks that fit and lets the others step back; chosen again, it lets go.
   3. The strip and the walks rise once as they come into view.
   For visitors who ask for less motion: the sky rests on Running Jokes and nothing rises; the choices still work. */
(function () {
  var doc = document;
  function all(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. the sky */
  var hero = doc.querySelector('.w-hero');
  var pics = all('.w-sky-pic');
  if (hero && pics.length > 1 && !still) {
    var cur = 0, timer = null, seen = true, HOLD = 7000;
    var ready = function (el, then) {
      if (el.style.backgroundImage) { then(); return; }
      var url = el.getAttribute('data-sky'), im = new Image();
      im.onload = im.onerror = function () { el.style.backgroundImage = 'url("' + url + '")'; then(); };
      im.src = url;
    };
    var step = function () {
      var next = (cur + 1) % pics.length;
      ready(pics[next], function () {
        pics[next].classList.add('is-on');
        pics[cur].classList.remove('is-on');
        cur = next;
        ready(pics[(cur + 1) % pics.length], function () {});   /* the one after, ahead of time */
      });
    };
    var run = function () {
      clearInterval(timer); timer = null;
      if (seen && !doc.hidden) timer = setInterval(step, HOLD);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { seen = en[0].isIntersecting; run(); }, { threshold: 0.15 }).observe(hero);
    }
    doc.addEventListener('visibilitychange', run);
    window.addEventListener('load', function () { ready(pics[1], function () {}); });
    run();
  }

  /* 2. How long do you have? */
  var tabs = all('.w-tab'), cards = all('.w-card'), on = null;
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var f = t.getAttribute('data-fit');
      on = on === f ? null : f;
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-fit') === on ? 'true' : 'false'); });
      cards.forEach(function (c) { c.classList.toggle('is-faded', !!on && c.getAttribute('data-fit') !== on); });
    });
  });

  /* 3. rising once */
  if (!still && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add('is-in'); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    all('.w-strip, .w-card, .w-band, .w-passage').forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('w-rise'); io.observe(el); }
    });
  }
})();
