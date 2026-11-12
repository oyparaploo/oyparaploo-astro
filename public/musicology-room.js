/* Musicology, the room. October 8, 2026 (Claude, Opus, High).
   November 12, 2026 (finding 7 of the site review): the row of cards no longer
   holds the page still on a wide window. On every window the page scrolls down
   normally and the row moves sideways by itself; on a computer the two arrows,
   a drag with the mouse and the line under the rooms move it too. The line shows
   where the row is, and the three bars play while it moves. Without this script
   the row is swiped or scrolled sideways everywhere. */
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
  var vp = hall.querySelector('.mr-viewport');
  var track = hall.querySelector('.mr-track');
  var line = hall.querySelector('.mr-progress');
  var thumb = hall.querySelector('.mr-thumb');
  var print = hall.querySelector('.mr-print');
  var prev = hall.querySelector('.mr-step-prev');
  var next = hall.querySelector('.mr-step-next');
  var stillTimer = null, lastP = -1;

  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
  /* Calm when the computer asks for less motion or the visitor pressed Still. */
  function calm() { return reduce.matches || root.classList.contains('pp-still'); }

  function moving() {
    if (calm()) return;
    root.classList.add('mr-moving');
    clearTimeout(stillTimer);
    stillTimer = setTimeout(function () { root.classList.remove('mr-moving'); }, 180);
  }

  function room() { return Math.max(0, vp.scrollWidth - vp.clientWidth); }

  /* The line under the rooms shows where the row is; the arrows rest at the ends. */
  function update() {
    var sw = room();
    var p = sw > 0 ? clamp(vp.scrollLeft / sw, 0, 1) : 0;
    var lw = line.clientWidth;
    var tw = clamp(vp.clientWidth / Math.max(vp.scrollWidth, 1), 0.06, 1) * lw;
    thumb.style.width = tw + 'px';
    thumb.style.left = (p * (lw - tw)) + 'px';
    if (print && !calm()) print.style.transform = 'translateX(' + (-p * 5).toFixed(3) + '%)';
    if (lastP !== -1 && Math.abs(p - lastP) > 0.0005) moving();
    lastP = p;
    if (prev) prev.disabled = vp.scrollLeft <= 2;
    if (next) next.disabled = vp.scrollLeft >= sw - 2;
  }

  /* November 12, 2026 (finding 7 of the site review): the row no longer holds the
     page still on a wide window. The page scrolls down as on every other page; the
     row moves sideways by itself: swiped, pushed sideways on a trackpad, dragged with
     the mouse, moved by the two arrows, or by the line under the rooms. */
  vp.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);

  /* The cards that stand wholly inside the row's window. */
  function cards() { return Array.prototype.slice.call(track.querySelectorAll('.mr-card')); }
  function goLeft(x) {
    x = clamp(x, 0, room());
    try { vp.scrollTo({ left: x, behavior: calm() ? 'auto' : 'smooth' }); }
    catch (err) { vp.scrollLeft = x; }
  }
  function startOf(card) { return card.offsetLeft - (parseFloat(getComputedStyle(track).paddingLeft) || 0); }

  /* The two arrows: one window of cards at a time. Forward, the first card not wholly
     in view becomes the first card; back, the row moves the same number of cards the
     other way, so back always returns to where forward began. */
  function step(dir) {
    var list = cards(), left = vp.scrollLeft, n = list.length, i, f = 0, k = n;
    if (!n) return;
    var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    var right = left + vp.clientWidth - pad;
    for (i = 0; i < n; i++) { if (startOf(list[i]) >= left - 2) { f = i; break; } }
    for (i = f; i < n; i++) { if (list[i].offsetLeft + list[i].offsetWidth > right + 1) { k = i; break; } }
    var per = Math.max(1, k - f);
    if (dir > 0) { if (k >= n) goLeft(room()); else goLeft(startOf(list[k])); }
    else goLeft(startOf(list[Math.max(0, f - per)]));
  }
  if (prev) prev.addEventListener('click', function () { step(-1); });
  if (next) next.addEventListener('click', function () { step(1); });

  /* Dragging with the mouse, as on the Sound landing. A drag never opens a card.
     While the hand holds the row, snapping waits; on letting go the row settles
     on the nearest card. */
  var drag = null, dragged = false;
  vp.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: vp.scrollLeft }; dragged = false;
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var d = drag.x - e.clientX;
    if (Math.abs(d) > 6 && !dragged) { dragged = true; vp.classList.add('is-dragging'); }
    if (dragged) vp.scrollLeft = drag.left + d;
  });
  window.addEventListener('pointerup', function () {
    if (!drag) return;
    drag = null;
    if (!vp.classList.contains('is-dragging')) return;
    vp.classList.remove('is-dragging');
    var list = cards(), best = 0, bestD = Infinity;
    for (var i = 0; i < list.length; i++) {
      var dd = Math.abs(startOf(list[i]) - vp.scrollLeft);
      if (dd < bestD) { bestD = dd; best = startOf(list[i]); }
    }
    goLeft(best);
  });
  vp.addEventListener('click', function (e) { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
  vp.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* The line under the rooms is a scroll bar the hand can hold (October 30, 2026).
     Drag the thumb, or press the track to jump there. */
  if (line && thumb) {
    line.classList.add('mr-bar');
    var held = null;
    function goTo(clientX, grabAt) {
      var r = line.getBoundingClientRect(), tw = thumb.offsetWidth;
      var p = clamp((clientX - r.left - grabAt) / Math.max(r.width - tw, 1), 0, 1);
      vp.scrollLeft = p * room();
    }
    line.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      var tr = thumb.getBoundingClientRect();
      var onThumb = e.clientX >= tr.left && e.clientX <= tr.right;
      held = { grabAt: onThumb ? e.clientX - tr.left : thumb.offsetWidth / 2 };
      line.classList.add('is-held');
      vp.classList.add('is-held');
      if (line.setPointerCapture) line.setPointerCapture(e.pointerId);
      if (!onThumb) goTo(e.clientX, held.grabAt);
    });
    line.addEventListener('pointermove', function (e) { if (held) goTo(e.clientX, held.grabAt); });
    function release() { held = null; line.classList.remove('is-held'); vp.classList.remove('is-held'); }
    line.addEventListener('lostpointercapture', release);
    line.addEventListener('pointerup', release);
    line.addEventListener('pointercancel', release);
  }

  update();
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


/* The listening card: the still turns into Spotify's own compact player when pressed.
   Nothing from Spotify loads before that. November 9, 2026. */
(function () {
  var seat = document.querySelector('.mr-listen-player');
  if (!seat) return;
  var still = seat.querySelector('.mr-listen-still');
  var id = seat.getAttribute('data-playlist') || '';
  still.addEventListener('click', function () {
    if (seat.classList.contains('is-live') || seat.querySelector('iframe')) return;
    if (!id) {
      seat.querySelector('.mr-listen-hint').textContent = 'Playlist link still to come';
      return;
    }
    var f = document.createElement('iframe');
    f.src = 'https://open.spotify.com/embed/playlist/' + encodeURIComponent(id) + '?utm_source=generator&theme=0';
    f.title = 'Paraploo Music Playlist on Spotify';
    f.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
    f.setAttribute('allowfullscreen', '');
    f.addEventListener('load', function () { seat.classList.add('is-live'); try { f.focus(); } catch (e) {} });
    seat.appendChild(f);
    /* If Spotify is slow or blocked, the still stays until the player arrives. */
  });
})();
