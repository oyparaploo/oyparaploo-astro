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

  /* October 30, 2026: on a short wide window the cards were taller than the room
     left for them, and their tops were cut. The cards narrow, 16 pixels at a time,
     never under 280, until the whole card fits, even with the header slid in. */
  var siteHeader = document.querySelector('.site-header');
  function fit() {
    hall.style.removeProperty('--mr-card');
    var card = track.querySelector('.mr-card');
    if (!card) return true;
    var hhNow = parseFloat(getComputedStyle(root).getPropertyValue('--mr-hh')) || 0;
    var spare = siteHeader ? siteHeader.offsetHeight - hhNow : 0;
    var room = vp.clientHeight - Math.max(0, spare);
    var w = card.offsetWidth, guard = 0;
    while (track.offsetHeight > room && w > 280 && guard++ < 24) {
      w = Math.max(280, w - 16);
      hall.style.setProperty('--mr-card', w + 'px');
      room = vp.clientHeight - Math.max(0, spare);
    }
    return track.offsetHeight <= room;
  }

  function measure() {
    glide = wide.matches;
    root.classList.toggle('mr-glide', glide);
    if (glide) {
      track.style.transform = '';
      /* A window too short for even the narrowest whole card does not glide:
         the row is swiped or dragged by its bar instead, and nothing is cut. */
      if (!fit()) { glide = false; root.classList.remove('mr-glide'); hall.style.removeProperty('--mr-card'); }
    }
    if (glide) {
      max = Math.max(0, track.scrollWidth - vp.clientWidth);
      var inset = parseFloat(getComputedStyle(hall).paddingTop) || 0;
      hall.style.height = (panel.offsetHeight + max + 2 * inset) + 'px';
    } else {
      hall.style.removeProperty('--mr-card');
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
  /* October 30, 2026: while the hand holds the bar (or drags the row), the page jumps
     straight to the place the hand points at, with no smooth glide, and the site
     header, the headline and the cards stay exactly where they were until the hand
     lets go. The mouse wheel still glides as before. */
  var siteHdr = document.querySelector('.site-header');
  var spacer = document.querySelector('.site-header-spacer');
  var holding = false, saved = null;
  var keep = new MutationObserver(function () {
    if (!holding || !saved) return;
    if (siteHdr && siteHdr.className !== saved.cls) siteHdr.className = saved.cls;
    if (spacer && spacer.style.height !== saved.sp) spacer.style.height = saved.sp;
  });
  function hold(on) {
    if (on === holding) return;
    holding = on;
    root.classList.toggle('mr-holding', on);
    if (on) {
      if (!spacer) spacer = document.querySelector('.site-header-spacer');
      saved = { cls: siteHdr ? siteHdr.className : '', sp: spacer ? spacer.style.height : '' };
      if (siteHdr) keep.observe(siteHdr, { attributes: true, attributeFilter: ['class'] });
      if (spacer) keep.observe(spacer, { attributes: true, attributeFilter: ['style'] });
    } else {
      keep.disconnect(); saved = null;
    }
  }
  root.__mrHolding = function () { return holding; };
  function jump(y) {
    try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }
    catch (err) { window.scrollTo(0, y); }
  }

  var drag = null, dragged = false;
  vp.addEventListener('pointerdown', function (e) {
    if (!glide || e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, y: window.pageYOffset }; dragged = false;
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var d = drag.x - e.clientX;
    if (Math.abs(d) > 6 && !dragged) { dragged = true; vp.classList.add('is-dragging'); hold(true); }
    if (dragged) jump(drag.y + d);
  });
  window.addEventListener('pointerup', function () { if (drag) hold(false); drag = null; vp.classList.remove('is-dragging'); });
  vp.addEventListener('click', function (e) { if (dragged) { e.preventDefault(); dragged = false; } }, true);
  vp.addEventListener('dragstart', function (e) { if (glide) e.preventDefault(); });

  /* October 30, 2026: the line under the rooms is a scroll bar the hand can hold.
     Drag the thumb, or press the track to jump there. */
  if (line && thumb) {
    line.classList.add('mr-bar');
    var held = null;
    function goTo(clientX, grabAt) {
      var r = line.getBoundingClientRect(), tw = thumb.offsetWidth;
      var p = clamp((clientX - r.left - grabAt) / Math.max(r.width - tw, 1), 0, 1);
      if (glide) jump(hallTop() + p * max);
      else vp.scrollLeft = p * (vp.scrollWidth - vp.clientWidth);
    }
    line.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      var tr = thumb.getBoundingClientRect();
      var onThumb = e.clientX >= tr.left && e.clientX <= tr.right;
      held = { grabAt: onThumb ? e.clientX - tr.left : thumb.offsetWidth / 2 };
      line.classList.add('is-held');
      hold(true);
      if (line.setPointerCapture) line.setPointerCapture(e.pointerId);
      if (!onThumb) goTo(e.clientX, held.grabAt);
    });
    line.addEventListener('pointermove', function (e) { if (held) goTo(e.clientX, held.grabAt); });
    function release() { held = null; line.classList.remove('is-held'); hold(false); }
    line.addEventListener('lostpointercapture', release);
    line.addEventListener('pointerup', release);
    line.addEventListener('pointercancel', release);
  }

  measure();
})();

/* Fourth colours, October 30, 2026: when the site header slides back in over the
   gliding hall, the room's title steps down by the header's height (--mr-hh), so
   the header never covers it. */
(function () {
  var header = document.querySelector('.site-header');
  if (!header || !document.querySelector('.mr-hall')) return;
  var root = document.documentElement;
  function set() {
    /* While the bar is held, the headline keeps its place. */
    if (root.__mrHolding && root.__mrHolding()) return;
    var shown = header.classList.contains('is-pinned') && !header.classList.contains('is-hidden');
    root.style.setProperty('--mr-hh', shown ? header.offsetHeight + 'px' : '0px');
  }
  new MutationObserver(function () { set(); }).observe(header, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', set);
  set();
})();

/* October 30, 2026 (Reach's ruling): on a story, artist portrait or soundtrack page
   the purple label under the title names the kind of piece and its reading time,
   word for word in this form: "Our Take · 6 minutes", "Artist Portrait · 3 minutes",
   "Soundtrack · 4 minutes". The number is the piece's own words / 230, rounded,
   never under 1; "minute" for 1. The number and its word stay on one line.
   Song pages keep the artist's name, untouched. */
(function () {
  if (!document.body || !document.body.classList.contains('mus-reading')) return;
  var sub = document.querySelector('.mr-song-sub');
  var piece = document.querySelector('.mr-piece');
  if (!sub || !piece) return;
  var KINDS = { 'Stories and Essays': 'Our Take', 'Artists': 'Artist Portrait', 'Noir Cinema Soundtracks': 'Soundtrack' };
  var kind = KINDS[sub.textContent.trim()];
  if (!kind) return;
  var words = piece.textContent.split(/\s+/).filter(function (w) { return w.length; }).length;
  var n = Math.max(1, Math.round(words / 230));
  var time = document.createElement('span');
  time.className = 'mr-sub-time';
  time.textContent = n + '\u00a0' + (n === 1 ? 'minute' : 'minutes');
  sub.textContent = kind + ' \u00b7 ';
  sub.appendChild(time);
})();
