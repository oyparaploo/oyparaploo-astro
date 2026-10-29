/* ==========================================================================
   THE PINNED SECTION ROW on the Writings page
   (preview SECTION-ROW-WHOLE-2026-10-29; the spec Reach confirmed October 29, 2026)

   - Pins the row once its place reaches the foot of the header (or the top of
     the window when the header has slid away), and keeps it pinned to the end
     of the page. It follows the header's own slide frame by frame, so it is
     always just under it and never leaves a gap.
   - Underlines the name of the section the visitor is in.
   - Pressing a name slides the page to that section; a visitor whose screen
     asks for less motion gets a plain jump.
   - On a phone, keeps the underlined name in view inside the row.
   ========================================================================== */
(function () {
  var doc = document, win = window;
  var row = doc.getElementById('section-row');
  if (!row) return;
  var slot = row.parentNode, track = row.querySelector('.section-row-in');
  var header = doc.querySelector('header.site-header');
  var calm = win.matchMedia('(prefers-reduced-motion: reduce)');

  /* The names and the sections they lead to. A section that is not showing (Brought Back Up ... on a day with
     nothing old enough) takes its name out of the row. */
  var items = Array.prototype.slice.call(row.querySelectorAll('a[href^="#"]')).map(function (a) {
    return { a: a, el: doc.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (it) { return !!it.el; });
  function hideEmpty() {
    items.forEach(function (it) { it.a.hidden = !!(it.el.hidden || it.el.closest('[hidden]')); });
  }

  /* The foot of whatever chrome is showing at the top of the window: the date strip, the header (static, pinned or
     sliding), and the search band when it rides pinned under the header. */
  function chromeFoot() {
    var t = 0, b;
    var strip = doc.querySelector('.theme-strip');
    if (strip) { b = strip.getBoundingClientRect().bottom; if (b > t) t = b; }
    if (header) { b = header.getBoundingClientRect().bottom; if (b > t) t = b; }
    var sb = doc.querySelector('.sb.sb-pinned');
    if (sb && !sb.hidden) { b = sb.getBoundingClientRect().bottom; if (b > t) t = b; }
    return Math.max(0, Math.round(t));
  }

  var pinned = false, held = null, heldUntil = 0, current = null;
  function rowHeight() { return row.offsetHeight; }

  function setCurrent(it) {
    if (it === current) return;
    current = it;
    items.forEach(function (x) {
      if (x === it) x.a.setAttribute('aria-current', 'location'); else x.a.removeAttribute('aria-current');
    });
    if (it) keepInView(it.a);
  }

  /* On a phone the row is wider than the screen: the underlined name slides into view inside it. */
  function keepInView(a) {
    if (track.scrollWidth <= track.clientWidth + 1) return;
    var pad = 24, left = a.offsetLeft, right = left + a.offsetWidth;
    var view = track.scrollLeft, viewR = view + track.clientWidth;
    var to = null;
    if (left - pad < view) to = left - pad;
    else if (right + pad > viewR) to = right + pad - track.clientWidth;
    if (to === null) return;
    track.scrollTo({ left: Math.max(0, to), behavior: calm.matches ? 'instant' : 'smooth' });
  }

  function update() {
    var foot = chromeFoot();
    var h = rowHeight();
    doc.documentElement.style.setProperty('--sr-h', h + 'px');
    var slotTop = slot.getBoundingClientRect().top;
    var want = slotTop <= foot;
    if (want !== pinned) {
      pinned = want;
      slot.style.height = pinned ? h + 'px' : '';
      row.classList.toggle('is-pinned', pinned);
    }
    var top = pinned ? foot : slotTop;
    if (pinned) row.style.setProperty('--sr-top', foot + 'px');
    /* The Subjects picture, held still beside the rows, stops under the row instead of behind it. */
    doc.documentElement.style.setProperty('--sr-foot', Math.round(top + h) + 'px');

    /* The section the visitor is in: the one whose span holds the line just under the row. */
    var line = top + h + 2, found = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].a.hidden) continue;
      var r = items[i].el.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) found = items[i];
    }
    if (held && performance.now() < heldUntil) found = held; else held = null;
    setCurrent(found);
  }

  /* Run on every frame while anything is moving (a scroll, the header sliding), then rest. */
  var until = 0, looping = false;
  function loop() { update(); if (performance.now() < until) win.requestAnimationFrame(loop); else looping = false; }
  function wake(ms) { until = Math.max(until, performance.now() + (ms || 260)); if (!looping) { looping = true; win.requestAnimationFrame(loop); } }

  /* Pressing a name: slide to the section, so its top lands just under the row. Going down, the header slides away;
     going up, it slides back in, so the landing allows for it. */
  items.forEach(function (it) {
    it.a.addEventListener('click', function (e) {
      e.preventDefault();
      var h = rowHeight();
      var r = it.el.getBoundingClientRect();
      var foot = chromeFoot();
      var goingDown = r.top > foot + h;
      var headerRoom = goingDown || !header ? 0 : header.offsetHeight;
      var y = win.pageYOffset + r.top - h - headerRoom + 1;   /* + 1: the section's own top line sits under the row's */
      held = it; heldUntil = performance.now() + (calm.matches ? 150 : 1400);
      setCurrent(it);
      win.scrollTo({ top: Math.max(0, y), behavior: calm.matches ? 'instant' : 'smooth' });
      wake(calm.matches ? 300 : 1600);
      /* A keyboard press carries the reading place there too. */
      if (e.detail === 0) {
        var heading = it.el.querySelector('h2');
        if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
      }
    });
  });
  if ('onscrollend' in win) win.addEventListener('scrollend', function () { held = null; wake(120); });

  win.addEventListener('scroll', function () { wake(300); }, { passive: true });
  win.addEventListener('resize', function () { wake(300); });
  if (header) {
    header.addEventListener('transitionrun', function () { wake(400); });
    header.addEventListener('transitionend', function () { wake(60); });
    new MutationObserver(function () { wake(400); }).observe(header, { attributes: true, attributeFilter: ['class', 'style'] });
  }
  /* The search band opening or closing moves the header's foot. */
  new MutationObserver(function () { hideEmpty(); wake(600); }).observe(doc.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  doc.addEventListener('transitionend', function () { wake(60); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { wake(200); });
  win.addEventListener('load', function () { hideEmpty(); wake(400); });
  hideEmpty();
  wake(400);
})();
