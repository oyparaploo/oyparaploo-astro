/* A Marks drawing that draws itself, as if someone were drawing it behind the glass (Reach, October 29, 2026:
   "It needs to look like somebody is behind the picture ... you see the action happening as the medium moves.
   Often how I will do these pen drawings is I will start at the middle and draw until I reach the outer edge."
   And: "usually it's one mark at a time. It's not multiple marks drawn at the same time.")

   How it moves:
   - One pen, one mark at a time. It begins at the centre of the drawing's burst (cx, cy in marks-draw-<number>.js)
     and works out to the edges: after each mark it lifts and goes to the nearest mark still to draw among the
     next ones outward, taking as long as a hand takes to travel there.
   - Each mark grows from its end nearest the centre at a pen's steady pace: its time follows its length, so a
     short tick takes about a fifth of a second and a long level line across the whole drawing about four and a
     half. The pen gathers speed at the start of a mark, holds it, and slows at the end. No jitter, no chance:
     the same every visit.
   - At this pace the whole drawing takes about eight minutes. The pen rests while the drawing is out of view
     or the page is in a hidden tab, and goes on from where it stopped when the drawing is back in view.
   - The order is the computer's reading of the drawing, not a record of the order Reach's hand made it.
   - It draws once, never loops, and pointing at it does nothing.

   The real drawing stays in the page as an ordinary picture. While it waits, nothing shows in its place; when the
   pen begins, a canvas showing white paper fades in over it in three-tenths of a second (marks-draw.css). The
   drawing's own strokes are drawn as a growing mask, so the drawing shows through only where the pen has passed.
   When the pen is done, the canvas is taken away and the picture itself stands, untouched.

   Less motion, no script, no canvas or no IntersectionObserver: the picture simply shows, already finished. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var INK = 450;      /* the pen's steady speed, in the drawing's own pixels a second (its 2,000 across in about 4.5 s) */
  var SETTLE = 0.12;  /* seconds the pen takes to reach its speed at the start of a mark, and to stop at the end */
  var NEAR = 30;      /* after each mark the pen chooses the nearest of the next this-many marks outward */
  function markTime(len) { return 0.1 + len / INK; }                   /* seconds for a mark this long */
  function liftTime(far) { return 0.08 + far / 2000; }                 /* seconds to lift and travel this far */

  /* How far along its mark the pen is, `e` seconds in: it gathers speed, holds it steady, and slows to a stop. */
  function along(s, e) {
    var r = Math.min(SETTLE, s.dur / 2), v = s.len / (s.dur - r), a = v / r;
    if (e <= 0) return 0;
    if (e >= s.dur) return s.len;
    if (e < r) return 0.5 * a * e * e;
    if (e < s.dur - r) return 0.5 * v * r + v * (e - r);
    var f = s.dur - e;
    return s.len - 0.5 * a * f * f;
  }

  /* Gives every mark its start: one pen, from the centre outward, each time to the nearest of the next marks. */
  function schedule(order) {
    var left = order.slice(), out = [], t = 0, x = 0, y = 0, first = true;
    while (left.length) {
      var pick = 0;
      if (!first) {
        var bestD = Infinity, K = Math.min(left.length, NEAR);
        for (var k = 0; k < K; k++) {
          var d = Math.hypot(left[k].p[0] - x, left[k].p[1] - y);
          if (d < bestD) { bestD = d; pick = k; }
        }
      }
      var s = left.splice(pick, 1)[0];
      s.start = first ? 0 : t + liftTime(Math.hypot(s.p[0] - x, s.p[1] - y));
      t = s.start + s.dur;
      x = s.p[s.p.length - 2]; y = s.p[s.p.length - 1]; first = false;
      out.push(s);
    }
    return out;
  }

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

    var cx = data.cx != null ? data.cx : data.W / 2, cy = data.cy != null ? data.cy : data.H / 2;

    /* Each mark turned to start at its end nearest the centre, with its length along the way. */
    var order = data.s.map(function (a) {
      var w = a[0], p = a.slice(1), n = p.length;
      var dA = Math.hypot(p[0] - cx, p[1] - cy), dB = Math.hypot(p[n - 2] - cx, p[n - 1] - cy);
      if (dB < dA) {
        var q = [];
        for (var j = n - 2; j >= 0; j -= 2) q.push(p[j], p[j + 1]);
        p = q;
      }
      var cum = [0];
      for (var i = 2; i < p.length; i += 2) cum.push(cum[cum.length - 1] + Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]));
      var len = cum[cum.length - 1];
      return { w: w, p: p, cum: cum, len: len, near: Math.min(dA, dB), dur: markTime(len), done: 0, at: 0 };
    });
    order.sort(function (a, b) { return a.near - b.near; });
    var marks = schedule(order);

    var mask = document.createElement('canvas'), mctx = mask.getContext('2d');
    var scale = 1, cw = 0, ch = 0;
    var dx0, dy0, dx1, dy1; /* the patch the pen touched since the last frame */

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
    function touch(x, y, half) {
      if (x - half < dx0) dx0 = x - half; if (y - half < dy0) dy0 = y - half;
      if (x + half > dx1) dx1 = x + half; if (y + half > dy1) dy1 = y + half;
    }

    /* Draws a mark from where the pen last stood to `to` (a length along the mark). */
    function pen(s, to) {
      var p = s.p, cum = s.cum, lw = Math.max(1, s.w * scale), h = lw / 2 + 2;
      mctx.lineWidth = lw;
      if (p.length === 2) {
        mctx.beginPath();
        mctx.arc(p[0] * scale, p[1] * scale, lw / 2, 0, Math.PI * 2);
        mctx.fill();
        touch(p[0] * scale, p[1] * scale, h);
        s.done = s.len;
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
      touch(fx * scale, fy * scale, h);
      while (i < cum.length - 1 && cum[i + 1] <= to) {
        i++;
        mctx.lineTo(p[2 * i] * scale, p[2 * i + 1] * scale);
        touch(p[2 * i] * scale, p[2 * i + 1] * scale, h);
      }
      var ex, ey;
      if (i < cum.length - 1 && to > cum[i]) {
        var g = (to - cum[i]) / ((cum[i + 1] - cum[i]) || 1);
        ex = (p[2 * i] + (p[2 * i + 2] - p[2 * i]) * g) * scale; ey = (p[2 * i + 1] + (p[2 * i + 3] - p[2 * i + 1]) * g) * scale;
      } else {
        ex = p[2 * i] * scale + 0.01; ey = p[2 * i + 1] * scale;
      }
      mctx.lineTo(ex, ey);
      touch(ex, ey, h);
      mctx.stroke();
      s.at = i; s.done = to;
    }

    var inView = true;
    function finish() {
      fig.classList.remove('draws-waiting', 'draws-drawing');
      fig.classList.add('draws-done');
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      window.removeEventListener('resize', onResize);
      if (watch) watch.disconnect();
    }
    function onResize() { if (fig.classList.contains('draws-drawing')) finish(); else size(); }
    window.addEventListener('resize', onResize);

    /* The pen rests while the drawing is out of view, and goes on when it is back. */
    var watch = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) inView = entries[i].isIntersecting;
    }, { threshold: 0 });

    function run() {
      size();
      mctx.strokeStyle = mctx.fillStyle = '#fff';
      mctx.lineCap = mctx.lineJoin = 'round';
      fig.classList.add('draws-drawing');
      watch.observe(img);
      var t = 0, before = null, next = 0, live = null;
      function frame(now) {
        if (!fig.classList.contains('draws-drawing')) return;
        var step = before === null ? 0 : (now - before) / 1000;
        before = now;
        if (inView && !document.hidden) t += Math.min(step, 0.1);
        dx0 = dy0 = Infinity; dx1 = dy1 = -Infinity;
        for (;;) {
          if (!live) {
            if (next < marks.length && marks[next].start <= t) live = marks[next++];
            else break;
          }
          var to = along(live, t - live.start);
          if (to > live.done || (live.p.length === 2 && !live.done)) pen(live, to);
          if (t - live.start >= live.dur) { if (live.done < live.len) pen(live, live.len); live = null; }
          else break;
        }
        /* The paper, with the drawing showing only where the pen has passed: only the patch it touched. */
        if (dx1 > dx0) {
          var x0 = Math.max(0, Math.floor(dx0)), y0 = Math.max(0, Math.floor(dy0));
          var x1 = Math.min(cw, Math.ceil(dx1)), y1 = Math.min(ch, Math.ceil(dy1));
          if (x1 > x0 && y1 > y0) {
            ctx.save();
            ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
            ctx.globalCompositeOperation = 'copy';
            ctx.drawImage(mask, 0, 0);
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(img, 0, 0, cw, ch);
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, cw, ch);
            ctx.restore();
          }
        }
        if (next >= marks.length && !live) { finish(); return; }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    /* On the Marks page the pen waits as long as the drawing's rise used to (data-delay, in seconds), so it
       starts with the rest of the opening and the page still moves only once. */
    var delay = parseFloat(fig.getAttribute('data-delay')) || 0;
    var seen = false, ready = false;
    function go() { if (seen && ready) setTimeout(run, delay * 1000); }
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
