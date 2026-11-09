/* THE PAGE IT BEGAN ON (built from the preview Reach called perfect, November 9, 2026; SITE-ORDER\ORIGINAL-PAGES-BUILD).
   Pressing the small page opens the pages large on a dark ground, one page at a time, whole and fitted to
   the screen: "1 of 2" at the top, Previous and Next, swiping on phones, Close, and the Escape key closing it.
   The arrow keys step between pages. Visitors who ask for less motion, or who pressed Still, get plain jumps. */
(function () {
  var root = document.documentElement;
  var band = document.querySelector('.wp-origin');
  if (!band) return;
  var opener = band.querySelector('.wp-origin-open');
  var data = band.querySelector('.wp-origin-data');
  var pages = [];
  try { pages = JSON.parse(data.textContent); } catch (e) { return; }
  if (!opener || !pages.length) return;

  var WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

  function calm() {
    if (typeof window.ppCalm === 'function' && window.ppCalm()) return true;
    if (root.classList.contains('pp-still') || root.classList.contains('rm')) return true;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  /* ---- the view, made once ---- */
  var view = document.createElement('div');
  view.className = 'op-view' + (pages.length === 1 ? ' is-single' : '');
  view.setAttribute('role', 'dialog');
  view.setAttribute('aria-modal', 'true');
  view.setAttribute('aria-label', 'The page it began on');
  view.hidden = true;
  var slides = '';
  for (var i = 0; i < pages.length; i++) {
    slides += '<figure class="op-slide" style="margin:0" aria-hidden="' + (i ? 'true' : 'false') + '">' +
      '<img data-src="' + pages[i].src + '" alt="' + pages[i].alt.replace(/"/g, '&quot;') + '" width="' +
      pages[i].w + '" height="' + pages[i].h + '" decoding="async"></figure>';
  }
  view.innerHTML =
    '<div class="op-top"><span class="op-count" aria-live="polite"></span>' +
    '<button type="button" class="op-close">Close</button></div>' +
    '<div class="op-stage"><div class="op-track">' + slides + '</div></div>' +
    '<div class="op-nav">' +
    '<button type="button" class="op-step op-prev"><span class="arrow-glyph">&larr;</span> Previous</button>' +
    '<button type="button" class="op-step op-next">Next <span class="arrow-glyph">&rarr;</span></button></div>';
  document.body.appendChild(view);

  var track = view.querySelector('.op-track');
  var stage = view.querySelector('.op-stage');
  var count = view.querySelector('.op-count');
  var closeB = view.querySelector('.op-close');
  var prevB = view.querySelector('.op-prev');
  var nextB = view.querySelector('.op-next');
  var figs = view.querySelectorAll('.op-slide');
  var at = 0, lastFocus = null, fadeTimer = null;

  function load() {
    var imgs = view.querySelectorAll('img[data-src]');
    for (var i = 0; i < imgs.length; i++) { imgs[i].src = imgs[i].getAttribute('data-src'); imgs[i].removeAttribute('data-src'); }
  }

  function place(offsetPx) {
    track.style.transform = 'translateX(calc(' + (-at * 100) + '% + ' + (offsetPx || 0) + 'px))';
  }

  function show(n, still) {
    at = Math.max(0, Math.min(pages.length - 1, n));
    if (still || calm()) {
      track.classList.add('is-dragging');
      place(0);
      void track.offsetWidth;
      track.classList.remove('is-dragging');
    } else {
      place(0);
    }
    count.textContent = (at + 1) + ' of ' + pages.length;
    prevB.disabled = at === 0;
    nextB.disabled = at === pages.length - 1;
    for (var i = 0; i < figs.length; i++) figs[i].setAttribute('aria-hidden', i === at ? 'false' : 'true');
    if (document.activeElement && document.activeElement.disabled) closeB.focus();
  }

  function open() {
    lastFocus = document.activeElement;
    load();
    clearTimeout(fadeTimer);
    view.hidden = false;
    root.classList.add('op-open');
    show(0, true);
    if (calm()) view.classList.add('is-in');
    else { void view.offsetWidth; view.classList.add('is-in'); }
    closeB.focus();
  }

  function close() {
    root.classList.remove('op-open');
    view.classList.remove('is-in');
    if (calm()) view.hidden = true;
    else fadeTimer = setTimeout(function () { view.hidden = true; }, 250);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* The small page is a link to the first page whole, so it still works with no script; with the script it opens
     the large view instead. */
  opener.addEventListener('click', function (e) {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open();
  });
  closeB.addEventListener('click', close);
  prevB.addEventListener('click', function () { show(at - 1); });
  nextB.addEventListener('click', function () { show(at + 1); });

  /* Escape closes; the arrow keys step; Tab stays inside the view */
  document.addEventListener('keydown', function (e) {
    if (view.hidden || !root.classList.contains('op-open')) return;
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); return; }
    if (e.key === 'Tab') {
      var f = [closeB, prevB, nextB].filter(function (b) { return !b.disabled && b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden'; });
      if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      var j = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === f.length - 1 ? 0 : i + 1);
      f[j].focus();
    }
  });

  /* Swiping: the page follows the finger, and lets go to the next or previous page past 50 pixels.
     With less motion the page does not follow; the swipe just jumps when the finger lifts. */
  var x0 = null, y0 = 0, dx = 0, pid = null, sideways = false;
  stage.addEventListener('pointerdown', function (e) {
    if (pages.length < 2 || (e.pointerType === 'mouse' && e.button !== 0)) return;
    x0 = e.clientX; y0 = e.clientY; dx = 0; pid = e.pointerId; sideways = false;
  });
  stage.addEventListener('pointermove', function (e) {
    if (x0 === null || e.pointerId !== pid) return;
    dx = e.clientX - x0;
    var dy = e.clientY - y0;
    if (!sideways && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      sideways = true;
      try { stage.setPointerCapture(pid); } catch (err) {}
    }
    if (!sideways) return;
    if (!calm()) {
      var edge = (at === 0 && dx > 0) || (at === pages.length - 1 && dx < 0);
      track.classList.add('is-dragging');
      place(edge ? dx / 3 : dx);
    }
  });
  function end(e) {
    if (x0 === null || (e && e.pointerId !== pid)) return;
    var moved = sideways ? dx : 0;
    x0 = null; pid = null;
    track.classList.remove('is-dragging');
    if (moved < -50 && at < pages.length - 1) show(at + 1);
    else if (moved > 50 && at > 0) show(at - 1);
    else show(at);
  }
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
})();
