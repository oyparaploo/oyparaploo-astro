/* Musicology, the room. October 8, 2026 (Claude, Opus, High).
   On a wide window the row of cards glides sideways as the page is scrolled
   (the Sound landing's row, moved by the ordinary scroll, so nothing is held
   back from the visitor); the line under the rooms shows where the row is,
   and the three bars play while it moves. On a phone, or a short window, the
   row is swiped, and the line follows it. Without this script the row is
   swiped or scrolled sideways everywhere. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* A reading page: the bars play a moment as the page arrives. */
  if (document.querySelector('.mr-stage') && !reduce.matches) {
    root.classList.add('mr-arrive');
    setTimeout(function () { root.classList.remove('mr-arrive'); }, 3200);
  }

  var hall = document.querySelector('.mr-hall');
  if (!hall) return;
  var panel = hall.querySelector('.mr-panel');
  var vp = hall.querySelector('.mr-viewport');
  var track = hall.querySelector('.mr-track');
  var line = hall.querySelector('.mr-progress');
  var thumb = hall.querySelector('.mr-thumb');
  var print = hall.querySelector('.mr-print');
  var wide = window.matchMedia('(min-width: 900px) and (min-height: 560px)');
  var max = 0, glide = false, stillTimer = null, lastP = -1;

  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

  function moving() {
    if (reduce.matches) return;
    root.classList.add('mr-moving');
    clearTimeout(stillTimer);
    stillTimer = setTimeout(function () { root.classList.remove('mr-moving'); }, 180);
  }

  function hallTop() { return hall.getBoundingClientRect().top + window.pageYOffset; }

  function show(p, visibleFraction) {
    var lw = line.clientWidth;
    var tw = clamp(visibleFraction, 0.06, 1) * lw;
    thumb.style.width = tw + 'px';
    thumb.style.left = (p * (lw - tw)) + 'px';
    if (print && !reduce.matches) print.style.transform = 'translateX(' + (-p * 5).toFixed(3) + '%)';
    if (lastP !== -1 && Math.abs(p - lastP) > 0.0005) moving();
    lastP = p;
  }

  function update() {
    if (glide) {
      var p = max > 0 ? clamp(-hall.getBoundingClientRect().top / max, 0, 1) : 0;
      track.style.transform = 'translate3d(' + (-p * max).toFixed(1) + 'px,0,0)';
      if (vp.scrollLeft) vp.scrollLeft = 0;
      show(p, vp.clientWidth / Math.max(track.scrollWidth, 1));
    } else {
      var sw = vp.scrollWidth - vp.clientWidth;
      show(sw > 0 ? vp.scrollLeft / sw : 0, vp.clientWidth / Math.max(vp.scrollWidth, 1));
    }
  }

  function measure() {
    glide = wide.matches;
    root.classList.toggle('mr-glide', glide);
    if (glide) {
      track.style.transform = '';
      max = Math.max(0, track.scrollWidth - vp.clientWidth);
      var inset = parseFloat(getComputedStyle(hall).paddingTop) || 0;
      hall.style.height = (panel.offsetHeight + max + 2 * inset) + 'px';
    } else {
      hall.style.height = '';
      track.style.transform = '';
      max = 0;
    }
    update();
  }

  window.addEventListener('scroll', function () { if (glide) update(); }, { passive: true });
  vp.addEventListener('scroll', function () { if (!glide) update(); else if (vp.scrollLeft) vp.scrollLeft = 0; }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if (wide.addEventListener) wide.addEventListener('change', measure);

  /* A card reached by the keyboard is brought into view. */
  track.addEventListener('focusin', function (e) {
    if (!glide || max <= 0) return;
    var card = e.target.closest('.mr-card');
    if (!card) return;
    var x = card.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft);
    var cur = -hall.getBoundingClientRect().top;
    var cardX = card.offsetLeft - clamp(cur, 0, max);
    if (cardX < 0 || cardX + card.offsetWidth > vp.clientWidth) {
      window.scrollTo(0, hallTop() + clamp(x, 0, max));
    }
  });

  /* A sideways push on a trackpad moves the row too. */
  vp.addEventListener('wheel', function (e) {
    if (!glide || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    window.scrollBy(0, e.deltaX);
  }, { passive: false });

  /* The row can be dragged with the mouse, as on the Sound landing. A drag never opens a card. */
  var drag = null, dragged = false;
  vp.addEventListener('pointerdown', function (e) {
    if (!glide || e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, y: window.pageYOffset }; dragged = false;
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var d = drag.x - e.clientX;
    if (Math.abs(d) > 6) { dragged = true; vp.classList.add('is-dragging'); }
    if (dragged) window.scrollTo(0, drag.y + d);
  });
  window.addEventListener('pointerup', function () { drag = null; vp.classList.remove('is-dragging'); });
  vp.addEventListener('click', function (e) { if (dragged) { e.preventDefault(); dragged = false; } }, true);
  vp.addEventListener('dragstart', function (e) { if (glide) e.preventDefault(); });

  measure();
})();
