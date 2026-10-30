/* A Marks drawing that draws itself (from the Hermès homepage's moving sketches; spec confirmed by Reach,
   October 29, 2026). When the visitor scrolls to it, the pen line draws itself once, stroke by stroke, left to
   right, over about two seconds, then rests and stays still. It never loops, and pointing at it does nothing.

   How: the real drawing stays in the page as an ordinary picture. While it waits and while it draws, a canvas
   lies over it showing white paper; the drawing's own strokes (traced from it, in marks-draw-<number>.js) are
   drawn as a growing mask, and the drawing shows through only where the pen has passed. When the pen is done,
   the canvas is taken away and the picture itself stands, untouched.

   Less motion, no script, no canvas or no IntersectionObserver: the picture simply shows, already finished. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var TOTAL = 2.0;     /* seconds, the whole drawing */
  var SWEEP = 1.45;    /* the last stroke on the right begins by this second */
  var PEN = 1500;      /* the pen's speed, in the drawing's own pixels a second */
  var SHORTEST = 0.06; /* the shortest stroke still takes this long */

  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function prepare(fig) {
    var data = (window.MARKS_DRAW || {})[fig.getAttribute('data-draw')];
    var img = fig.querySelector('.draws-pic');
    var cv = document.createElement('canvas');
    if (!data || !img || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;
    cv.className = 'draws-pen';
    cv.setAttribute('aria-hidden', 'true');
    img.parentNode.appendChild(cv);
    fig.classList.add('draws-waiting');

    /* Each stroke: when it starts, how long it takes, its length along the way. */
    var strokes = data.s.map(function (a) {
      var w = a[0], p = a.slice(1), cum = [0], x0 = p[0];
      for (var i = 2; i < p.length; i += 2) {
        cum.push(cum[cum.length - 1] + Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]));
        if (p[i] < x0) x0 = p[i];
      }
      var len = cum[cum.length - 1];
      var start = SWEEP * (x0 / data.W);
      var dur = Math.max(SHORTEST, Math.min(len / PEN, TOTAL - start));
      return { w: w, p: p, cum: cum, len: len, start: start, dur: dur, done: 0, at: 0 };
    });
    strokes.sort(function (a, b) { return a.start - b.start; });

    var mask = document.createElement('canvas'), mctx = mask.getContext('2d');
    var scale = 1, cw = 0, ch = 0;

    function size() {
      var r = img.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.max(1, Math.round(r.width * dpr));
      ch = Math.max(1, Math.round(r.height * dpr));
      cv.width = mask.width = cw;
      cv.height = mask.height = ch;
      scale = cw / data.W;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cw, ch);
    }

    /* Draws a stroke from where the pen last stood to `to` (a length along the stroke). */
    function pen(s, to) {
      var p = s.p, cum = s.cum;
      mctx.lineWidth = Math.max(1, s.w * scale);
      if (p.length === 2) {
        mctx.beginPath();
        mctx.arc(p[0] * scale, p[1] * scale, mctx.lineWidth / 2, 0, Math.PI * 2);
        mctx.fill();
        return;
      }
      var i = s.at;
      mctx.beginPath();
      var fx = p[2 * i], fy = p[2 * i + 1];
      if (s.done > cum[i]) {
        var f = (s.done - cum[i]) / ((cum[i + 1] - cum[i]) || 1);
        fx += (p[2 * i + 2] - fx) * f; fy += (p[2 * i + 3] - fy) * f;
      }
      mctx.moveTo(fx * scale, fy * scale);
      while (i < cum.length - 1 && cum[i + 1] <= to) {
        i++;
        mctx.lineTo(p[2 * i] * scale, p[2 * i + 1] * scale);
      }
      if (i < cum.length - 1 && to > cum[i]) {
        var g = (to - cum[i]) / ((cum[i + 1] - cum[i]) || 1);
        mctx.lineTo((p[2 * i] + (p[2 * i + 2] - p[2 * i]) * g) * scale, (p[2 * i + 1] + (p[2 * i + 3] - p[2 * i + 1]) * g) * scale);
      } else {
        mctx.lineTo(p[2 * i] * scale + 0.01, p[2 * i + 1] * scale);
      }
      mctx.stroke();
      s.at = i; s.done = to;
    }

    function finish() {
      fig.classList.remove('draws-waiting', 'draws-drawing');
      fig.classList.add('draws-done');
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      window.removeEventListener('resize', onResize);
    }
    function onResize() { if (fig.classList.contains('draws-drawing')) finish(); else size(); }
    window.addEventListener('resize', onResize);

    function run() {
      size();
      mctx.strokeStyle = mctx.fillStyle = '#fff';
      mctx.lineCap = mctx.lineJoin = 'round';
      fig.classList.add('draws-drawing');
      var t0 = null, next = 0, live = [];
      function frame(now) {
        if (!fig.classList.contains('draws-drawing')) return;
        if (t0 === null) t0 = now;
        var t = (now - t0) / 1000;
        while (next < strokes.length && strokes[next].start <= t) live.push(strokes[next++]);
        for (var k = live.length - 1; k >= 0; k--) {
          var s = live[k];
          var u = Math.min(1, (t - s.start) / s.dur);
          var to = s.len * ease(u);
          if (to > s.done || s.p.length === 2) pen(s, to);
          if (u >= 1) { if (s.done < s.len) pen(s, s.len); live.splice(k, 1); }
        }
        /* The paper, with the drawing showing only where the pen has passed. */
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(mask, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(img, 0, 0, cw, ch);
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, cw, ch);
        ctx.globalCompositeOperation = 'source-over';
        if (t >= TOTAL && next >= strokes.length && !live.length) { finish(); return; }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    var seen = false, ready = false;
    function go() { if (seen && ready) run(); }
    var loaded = img.decode ? img.decode() : new Promise(function (res) {
      if (img.complete) res(); else img.addEventListener('load', res);
    });
    loaded.then(function () { ready = true; size(); go(); }, function () { finish(); });

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) { io.disconnect(); seen = true; go(); }
      }
    }, { threshold: 0.4 });
    io.observe(img);
  }

  var figs = document.querySelectorAll('.draws[data-draw]');
  for (var i = 0; i < figs.length; i++) prepare(figs[i]);
})();
