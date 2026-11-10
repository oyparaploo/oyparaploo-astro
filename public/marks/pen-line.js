/* The pen line on Most Recent (paraploo.com/marks/most-recent), ruled perfect by Reach October 30, 2026.
   As the mouse moves over the wall of drawings, a line 1.6 pixels wide in the site's Accent colour at 85 per cent
   is drawn behind the pointer, tracing its exact path; it fades over one second when the hand leaves the wall.
   Phones, tablets and less motion see the still wall. After the Yale School of Art's notice cards.
   From the preview HTML DOCS\PREVIEWS\PEN-LINE-WHOLE-2026-10-30, its block pen-line-script, word for word below.
   Linked from Most Recent only, after marks.js. Built by SITE-ORDER\PEN-LINE-BUILD.
   November 9, 2026: the line becomes a hairline, 70 per cent black (#4d4d4d) at 0.75 pixels, solid, the same in Light
   and Dark, its corners rounded the way a pen moves (Reach, on the preview HTML DOCS\PREVIEWS\MARKS-GREY-WHOLE-2026-11-09:
   "perfect"; SITE-ORDER\MARKS-GREY-BUILD). This replaces Accent at 1.6 pixels and the October 30 "no smoothing" call.
   Where it draws, the one-second fade, and the still wall for phones and less motion are unchanged. */
(function () {
  var doc = document, root = doc.documentElement;
  var wall = doc.querySelector('.wall');
  if (!wall || !window.matchMedia || !window.HTMLCanvasElement) return;

  var WIDTH = 0.75, FADE = 1000, INK = '#4d4d4d';
  var mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  function allowed() { return mouse.matches && !still.matches; }

  var line = null;          /* the line being drawn: its canvas, and every stroke as a list of points */
  var penDown = false;      /* false after a scroll: the next point starts a new stroke of the same line */
  var lastX = -1, lastY = -1;

  /* The hairline's ink (November 9, 2026): 70 per cent black, a solid colour, the same in Light and Dark. */
  function ink() { return INK; }

  function startLine() {
    var r = wall.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var c = doc.createElement('canvas');
    c.className = 'pen-line';
    c.setAttribute('aria-hidden', 'true');
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
    c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
    wall.appendChild(c);
    var ctx = c.getContext('2d');
    line = { canvas: c, ctx: ctx, dpr: dpr, w: r.width, h: r.height, strokes: [] };
    paintSetup(line);
    penDown = false;
  }
  function paintSetup(l) {
    var ctx = l.ctx;
    ctx.setTransform(l.dpr, 0, 0, l.dpr, 0, 0);
    ctx.lineWidth = WIDTH; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = ink();
  }
  function addPoint(clientX, clientY) {
    var r = wall.getBoundingClientRect();
    var x = clientX - r.left, y = clientY - r.top;
    var s;
    if (!penDown) { s = [x, y]; line.strokes.push(s); penDown = true; }
    else {
      s = line.strokes[line.strokes.length - 1];
      var px = s[s.length - 2], py = s[s.length - 1];
      if (px === x && py === y) return;
      s.push(x, y);
      if (!frame) frame = requestAnimationFrame(function () { frame = 0; repaint(); });
    }
  }
  var frame = 0;
  /* One stroke's path, its corners rounded the way a pen moves (November 9, 2026): each corner between two points the
     mouse gave becomes a curve through the midpoints, as the preview's hairline is drawn. */
  function trace(ctx, s) {
    var n = s.length / 2;
    ctx.moveTo(s[0], s[1]);
    if (n === 2) { ctx.lineTo(s[2], s[3]); return; }
    for (var i = 1; i < n - 1; i++) {
      ctx.quadraticCurveTo(s[2 * i], s[2 * i + 1], (s[2 * i] + s[2 * i + 2]) / 2, (s[2 * i + 1] + s[2 * i + 3]) / 2);
    }
    ctx.lineTo(s[2 * n - 2], s[2 * n - 1]);
  }
  /* The whole line, drawn again as one path each time the hand moves (once a frame), so the rounded corners follow
     the newest point and the line never darkens where it crosses itself. Light or Dark pressed: the same line. */
  function repaint() {
    if (!line) return;
    var ctx = line.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, line.canvas.width, line.canvas.height);
    paintSetup(line);
    ctx.beginPath();
    line.strokes.forEach(function (s) { if (s.length >= 4) trace(ctx, s); });
    ctx.stroke();
  }
  function letGo() {
    penDown = false;
    if (!line) return;
    if (frame) { cancelAnimationFrame(frame); frame = 0; repaint(); }   /* the last points the hand gave, before the fade */
    var c = line.canvas; line = null;
    c.classList.add('fading');
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, FADE + 150);
  }

  /* On the wall: the drawings and the air between them. A drawing's words and number are not the wall. */
  function onWall(el) {
    if (!el || !el.closest) return false;
    if (root.classList.contains('show-open')) return false;
    return el.closest('.wall') === wall && !el.closest('.cap');
  }

  doc.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    lastX = e.clientX; lastY = e.clientY;
    if (!allowed() || !onWall(e.target)) { letGo(); return; }
    if (!line) startLine();
    var pts = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
    if (!pts.length) pts = [e];
    for (var i = 0; i < pts.length; i++) addPoint(pts[i].clientX, pts[i].clientY);
  }, { passive: true });

  /* Off the window, or the window put aside. */
  doc.addEventListener('mouseout', function (e) { if (!e.relatedTarget) letGo(); });
  window.addEventListener('blur', letGo);

  /* The page scrolls under a resting hand: the pen lifts, so no line is drawn that the hand did not draw.
     When the scroll settles, if the hand now rests off the wall, the line fades. */
  var settle = 0;
  window.addEventListener('scroll', function () {
    penDown = false;
    clearTimeout(settle);
    settle = setTimeout(function () {
      if (line && lastX >= 0 && !onWall(doc.elementFromPoint(lastX, lastY))) letGo();
    }, 120);
  }, { passive: true });

  /* The wall changes size (the window resized or zoomed): the drawings have moved, so the line lets go. */
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      if (line) {
        var r = wall.getBoundingClientRect();
        if (Math.abs(r.width - line.w) > 0.5 || Math.abs(r.height - line.h) > 0.5) letGo();
      }
    }).observe(wall);
  }

  /* Light or Dark changed by the buttons or by the computer's own setting. */
  new MutationObserver(repaint).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  var dark = window.matchMedia('(prefers-color-scheme: dark)');
  function onDark() { setTimeout(repaint, 0); }
  if (dark.addEventListener) dark.addEventListener('change', onDark); else if (dark.addListener) dark.addListener(onDark);
  function onStill() { if (!allowed()) letGo(); }
  if (still.addEventListener) { still.addEventListener('change', onStill); mouse.addEventListener('change', onStill); }
})();
