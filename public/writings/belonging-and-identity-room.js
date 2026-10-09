/* Belonging and Identity: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\stories-sfmoma.html: the writings sit as the draft's masonry, three columns of cards of different
   heights (two on a narrower window, one on a phone), newest first, each card going to the column that stands
   lowest, the page's pictures whole among them across two columns. The room's script gives each card the height it needs, and lays them out again when a picture
   arrives, the window changes, or Show more brings the next 24. Each part fades in once as it is reached, in under
   a second. Visitors who ask for less motion see everything at once. */
(function () {
  var doc = document;
  function all(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* each part fades in as it is reached */
  if (!calm && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.classList.add('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    all('.bi-room .reveal').forEach(function (el) { io.observe(el); });
  }

  /* the masonry: each card goes to the column that stands lowest; a picture takes the two neighbouring columns that
     stand lowest, and waits a card or two (four at most) until those two stand nearly level, so no gap opens above
     it. Every item spans the rows of 4 pixels its height needs, with 32 pixels below it. */
  var grid = doc.querySelector('.bi-room .bi-mason');
  var ROW = 4, GAP = 32, LEVEL = 30, WAIT = 4, queued = false;
  function lay() {
    queued = false;
    if (!grid) return;
    var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
    var items = Array.prototype.filter.call(grid.children, function (el) { return !el.classList.contains('later'); });
    items.forEach(function (el) { el.style.gridColumn = ''; el.style.gridRow = ''; });
    if (cols < 2) { grid.classList.remove('is-laid'); return; }
    grid.classList.add('is-laid');
    var tops = [], held = [], c;
    for (c = 0; c < cols; c++) tops.push(0);
    function put(el, wide) {
      var best = 0, bestTop = Infinity, bestWaste = Infinity;
      for (var k = 0; k + wide <= cols; k++) {
        var part = tops.slice(k, k + wide), t = Math.max.apply(null, part), w = 0;
        part.forEach(function (x) { w = Math.max(w, t - x); });
        /* a card: the lowest column; a picture: the pair that leaves the least gap above it, then the lowest */
        if (wide === 1 ? t < bestTop : (w < bestWaste || (w === bestWaste && t < bestTop))) { bestTop = t; best = k; bestWaste = w; }
      }
      el.style.gridColumn = (best + 1) + ' / span ' + wide;
      var span = Math.ceil((el.getBoundingClientRect().height + GAP) / ROW);
      el.style.gridRow = (bestTop + 1) + ' / span ' + span;
      for (var m = best; m < best + wide; m++) tops[m] = bestTop + span;
    }
    function waste(wide) {   /* the least gap a wide picture would leave above it, in rows */
      var least = Infinity;
      for (var k = 0; k + wide <= cols; k++) {
        var part = tops.slice(k, k + wide), t = Math.max.apply(null, part), w = 0;
        part.forEach(function (x) { w = Math.max(w, t - x); });
        least = Math.min(least, w);
      }
      return least;
    }
    function release(force) {
      while (held.length) {
        var h = held[0], wide = Math.min(2, cols);
        if (!force && h.n < WAIT && waste(wide) > LEVEL) return;
        held.shift(); put(h.el, wide);
      }
    }
    items.forEach(function (el) {
      if (el.classList.contains('bi-tile')) { held.push({ el: el, n: 0 }); release(false); return; }
      put(el, 1);
      held.forEach(function (h) { h.n++; });
      release(false);
    });
    release(true);
  }
  function soon() { if (!queued) { queued = true; requestAnimationFrame(lay); } }
  lay();
  all('.bi-mason img').forEach(function (img) { if (!img.complete) img.addEventListener('load', soon); });
  window.addEventListener('resize', soon);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(soon);
  window.addEventListener('load', soon);

  /* Show more */
  var btn = doc.querySelector('.bi-room .show-more');
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.bi-card.later');
    var now = rest.slice(0, 24);
    now.forEach(function (a) { a.classList.remove('later'); });
    lay();
    if (rest.length <= 24) btn.parentNode.hidden = true;
    if (now[0]) now[0].focus({ preventScroll: true });
  });
})();
