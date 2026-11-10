/* On paraploo.com since the build SITE-ORDER\LIKE-THIS-BUILD (Reach, November 10, 2026: "Perfect", on the preview
   HTML DOCS\PREVIEWS\LIKE-THIS-WHOLE-2026-11-10). The preview's script, copied exactly, but for SITE and PICS (the site's
   own picture pages; each look-alike's -600 file in picture storage), the picture's place (p.s), and one line so that
   opening the band also stops the play once the slideshow has its play button (SITE-ORDER\SLIDESHOW-PLAY-BUILD).
   The answers are read from /marks/like-this-answers.js, loaded just before this script. */
/* ==========================================================================
   "Like this ..." — the look-alike band (preview, November 10, 2026; spec claude/LIKE-THIS-SPEC-2026-11-10.md).
   The browser computes nothing: it reads the answers written once by working files\like-this.py
   (like-this.json; here like-this-answers.js, the same answers, so the preview opens from the disk by double-click).
   marks.js (the slideshow) is left exactly as it is; this script only adds to the page.
   ========================================================================== */
(function () {
  var doc = document, DATA = window.LIKE_THIS;
  if (!DATA) return;
  var SITE = '';                                     /* the site: the picture pages are its own */
  var PICS = 'https://media.paraploo.com/site/images/';   /* the site: each look-alike's -600 file in picture storage */
  var KIND_WORD = { Marks: 'Marks', Placings: 'Placings', Collage: 'Collage' };

  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;   /* Still answers here too */
  function calm() { return !!(reduce && reduce.matches) || doc.documentElement.classList.contains('pp-still'); }
  var fine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 600px)') : null;
  function onComputer() { return !!(fine && fine.matches); }

  function el(tag, cls, text) { var x = doc.createElement(tag); if (cls) x.className = cls; if (text) x.textContent = text; return x; }

  /* ---------- One band, made once, moved where it is wanted (only one is ever open) ---------- */
  var band = el('div', 'lt-band'), clip = el('div', 'lt-clip'), inner = el('div', 'lt-inner');
  var head = el('div', 'lt-head'), row = el('div', 'lt-row');
  var bPrev = el('button', 'lt-btn lt-prev'), bNext = el('button', 'lt-btn lt-next'), bClose = el('button', 'lt-btn lt-close');
  bPrev.type = bNext.type = bClose.type = 'button';
  bPrev.innerHTML = '<span aria-hidden="true">&larr;</span>'; bPrev.setAttribute('aria-label', 'Earlier look-alikes');
  bNext.innerHTML = '<span aria-hidden="true">&rarr;</span>'; bNext.setAttribute('aria-label', 'More look-alikes');
  bClose.innerHTML = '<span aria-hidden="true">&times;</span>'; bClose.setAttribute('aria-label', 'Close the look-alikes');
  head.appendChild(bPrev); head.appendChild(bNext); head.appendChild(bClose);
  inner.appendChild(head); inner.appendChild(row); clip.appendChild(inner); band.appendChild(clip);
  band.id = 'lt-band'; band.setAttribute('role', 'region');
  var openFor = null, opener = null, where = null;   /* where: 'wall' or 'show' */

  function fill(n) {
    var list = DATA.answers[n] || [];
    row.innerHTML = '';
    list.forEach(function (m) {
      var p = DATA.pictures[m]; if (!p) return;
      var a = el('a', 'lt-pic'); a.href = SITE + p.h;
      a.setAttribute('aria-label', (KIND_WORD[p.k] || '') + ' picture ' + m + ': open its page');
      var im = el('img'); im.src = PICS + p.s; im.alt = '';
      im.height = 160; im.width = Math.round(160 * p.a); im.decoding = 'async';
      a.appendChild(im); a.appendChild(el('span', 'lt-n', m));
      row.appendChild(a);
    });
    row.scrollLeft = 0;
    band.setAttribute('aria-label', 'Like this: eight look-alikes of drawing ' + n);
    edges();
  }
  function edges() {
    var max = row.scrollWidth - row.clientWidth - 2;
    bPrev.setAttribute('aria-disabled', row.scrollLeft <= 2 ? 'true' : 'false');
    bNext.setAttribute('aria-disabled', row.scrollLeft >= max ? 'true' : 'false');
  }
  function slide(dir) {
    var by = Math.max(200, row.clientWidth * 0.8) * dir;
    row.scrollBy({ left: by, behavior: calm() ? 'auto' : 'smooth' });
  }
  row.addEventListener('scroll', edges, { passive: true });
  bPrev.addEventListener('click', function () { if (bPrev.getAttribute('aria-disabled') !== 'true') slide(-1); });
  bNext.addEventListener('click', function () { if (bNext.getAttribute('aria-disabled') !== 'true') slide(1); });
  bClose.addEventListener('click', function () { close(true); });
  band.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); } });

  function openBand() {
    if (calm()) { band.classList.add('lt-open'); edges(); return; }
    band.classList.remove('lt-open');
    void band.offsetHeight;                          /* start from nothing, then slide open */
    requestAnimationFrame(function () { band.classList.add('lt-open'); edges(); });
  }
  function close(giveFocusBack) {
    if (!openFor) return;
    var back = opener;
    band.classList.remove('lt-open');
    if (band.parentNode) band.parentNode.removeChild(band);
    if (opener) opener.setAttribute('aria-expanded', 'false');
    openFor = null; opener = null; where = null;
    if (giveFocusBack && back) back.focus({ preventScroll: true });
  }

  /* ---------- On a computer: the pill on each drawing of the wall ---------- */
  var wall = doc.querySelector('.wall');
  var figs = wall ? Array.prototype.slice.call(wall.querySelectorAll('figure')) : [];
  figs.forEach(function (f) {
    var n = (f.querySelector('.cap .n') || {}).textContent;
    if (!n || !DATA.answers[n.trim()]) return;
    n = n.trim();
    var pill = el('button', 'lt-pill', 'Like this ...'); pill.type = 'button';
    pill.setAttribute('aria-expanded', 'false'); pill.setAttribute('aria-controls', 'lt-band');
    pill.setAttribute('aria-label', 'Like this: show eight look-alikes of drawing ' + n);
    f.appendChild(pill);
    pill.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (openFor === n && where === 'wall') { close(false); return; }
      openOnWall(f, n, pill);
    });
  });

  function rowEnd(f) {                               /* the last drawing in the chosen drawing's row */
    var top = Math.round(f.getBoundingClientRect().top), last = f;
    figs.forEach(function (g) { if (Math.abs(Math.round(g.getBoundingClientRect().top) - top) < 4) last = g; });
    return last;
  }
  function aim(f) {                                  /* the notch points up at the middle of the chosen drawing */
    var img = f.querySelector('img') || f, r = img.getBoundingClientRect(), w = wall.getBoundingClientRect();
    var cs = getComputedStyle(wall);
    var left = w.left + parseFloat(cs.paddingLeft);
    band.style.setProperty('--lt-x', Math.round(r.left + r.width / 2 - left) + 'px');
  }
  function openOnWall(f, n, pill) {
    var sameRow = where === 'wall' && band.parentNode && rowEnd(f).nextSibling === band;
    if (opener && opener !== pill) opener.setAttribute('aria-expanded', 'false');
    if (!sameRow) { band.classList.remove('lt-open'); if (band.parentNode) band.parentNode.removeChild(band); }
    fill(n);
    openFor = n; opener = pill; where = 'wall';
    pill.setAttribute('aria-expanded', 'true');
    if (!sameRow) {
      var last = rowEnd(f);
      last.parentNode.insertBefore(band, last.nextSibling);
      aim(f); openBand();
    } else { aim(f); }
    edges();
  }
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (where !== 'wall' || !opener) { lastW = window.innerWidth; return; }
    if (!onComputer()) { close(false); return; }
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    var f = opener.parentNode;                       /* the row may now end on another drawing */
    band.parentNode.removeChild(band);
    var last = rowEnd(f);
    last.parentNode.insertBefore(band, last.nextSibling);
    aim(f); edges();
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && where === 'wall') close(true);
  });

  /* ---------- Phones and touch screens: a line on the slideshow panel ---------- */
  /* marks.js makes the slideshow the first time a drawing is chosen; the line is added to it then. */
  function fitShow(box) {
    if (box.querySelector('.lt-line')) return;
    var bar = box.querySelector('.show-bar'), cap = box.querySelector('.show-cap'), capN = cap && cap.querySelector('.n');
    var stage = box.querySelector('.show-stage'), pause = box.querySelector('.show-pause'), play = box.querySelector('.show-play');
    if (!bar || !cap || !capN || !stage) return;
    var line = el('button', 'lt-line', 'Like this ...'); line.type = 'button';
    line.setAttribute('aria-expanded', 'false'); line.setAttribute('aria-controls', 'lt-band');
    bar.insertBefore(line, cap.nextSibling);
    function current() { return (capN.textContent || '').trim(); }
    function sync() { line.hidden = !DATA.answers[current()]; }
    line.addEventListener('click', function () {
      if (where === 'show') { close(false); return; }
      if (where === 'wall') close(false);
      if (pause && !pause.hidden && pause.textContent === 'Pause') pause.click();   /* looking closely stops the play */
      else if (play && !play.hidden && box.classList.contains('playing')) play.click();   /* the same, with the play button */
      fill(current());
      openFor = current(); opener = line; where = 'show';
      line.setAttribute('aria-expanded', 'true');
      stage.parentNode.insertBefore(band, stage.nextSibling);
      band.style.setProperty('--lt-x', '50%');
      openBand();
    });
    /* a new drawing in the slideshow: the open band shows its look-alikes instead */
    new MutationObserver(function () {
      sync();
      if (where === 'show') {
        var n = current();
        if (DATA.answers[n]) { fill(n); openFor = n; } else close(false);
      }
    }).observe(capN, { childList: true, characterData: true, subtree: true });
    /* the slideshow closed: the band closes with it */
    new MutationObserver(function () { if (box.hidden && where === 'show') close(false); })
      .observe(box, { attributes: true, attributeFilter: ['hidden'] });
    sync();
  }
  var seek = new MutationObserver(function () {
    var box = doc.querySelector('.show');
    if (box) { fitShow(box); seek.disconnect(); }
  });
  seek.observe(doc.body, { childList: true });
})();
