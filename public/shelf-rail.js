/* ==========================================================================
   THE SHELF RAIL on the Writings page (preview WRITINGS-SHELF-RAIL-WHOLE-2026-11-02)
   Reads window.SHELF_RAIL (rail-data.js): the eight types in the Writings page's
   order, each with its shelves and their counts, and every writing on the
   shelves, newest first. Draws the rail and the list; a shelf chosen narrows the
   list to it, chosen again shows the whole list. Forty rows at a time, then
   "Show more".
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, win = window;
  var data = win.SHELF_RAIL, band = doc.getElementById('every-writing');
  if (!data || !band) return;
  var railIn = band.querySelector('.rail-in'), fold = band.querySelector('.rail-fold');
  var list = band.querySelector('.rail-rows'), more = band.querySelector('.rail-more');
  var moreBtn = more.querySelector('button'), status = band.querySelector('.rail-status');
  var calm = win.matchMedia('(prefers-reduced-motion: reduce)');
  var phone = win.matchMedia('(max-width: 700px)');
  var STEP = 40;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  /* A name and its count: the last word and the number held together, so the number never starts a line alone. */
  function named(name, n) {
    var cut = name.lastIndexOf(' ');
    var head = cut < 0 ? '' : name.slice(0, cut + 1), tail = cut < 0 ? name : name.slice(cut + 1);
    return '<span class="rail-name">' + esc(head) + '<span class="rail-tail">' + esc(tail) + '</span></span>' +
      '<sup class="rail-n">' + n + '</sup>';
  }

  /* The rail: every type a heading with a plus; its shelves under it, closed until opened. */
  var shelfIndex = 0, html = '';
  data.types.forEach(function (t, ti) {
    var id = 'rail-sec-' + ti;
    html += '<div class="rail-sec">' +
      '<a class="rail-head" href="' + esc(t.href) + '" role="button" aria-expanded="false" aria-controls="' + id + '">' +
      '<span>' + named(t.name, t.count) + '</span>' +
      '<span class="rail-sign" aria-hidden="true">+</span></a>' +
      '<ul class="rail-shelves" id="' + id + '" hidden>';
    t.shelves.forEach(function (s) {
      html += '<li><a class="rail-shelf" href="' + esc(s.href) + '" role="button" aria-pressed="false" data-shelf="' + shelfIndex + '">' +
        named(s.name, s.count) + '</a></li>';
      s.i = shelfIndex++;
    });
    html += '</ul></div>';
  });
  railIn.innerHTML = html;
  var names = [];
  data.types.forEach(function (t) { t.shelves.forEach(function (s) { names[s.i] = s.name; }); });

  /* The list. */
  var chosen = null, shown = 0, rows = data.rows;
  function rowHtml(r) {
    return '<a href="' + esc(r.h) + '"><span class="row-name-wrap"><span class="row-name">' + esc(r.t) + '</span>' +
      (r.f ? '<span class="row-first">' + esc(r.f) + '</span>' : '') + '</span>' +
      '<span class="row-side">' + esc(r.k) + '</span><span class="row-arrow" aria-hidden="true">&rarr;</span></a>';
  }
  function current() { return chosen === null ? rows : rows.filter(function (r) { return r.s.indexOf(chosen) !== -1; }); }
  function render(add) {
    var all = current();
    var from = add ? shown : 0;
    shown = Math.min(all.length, from + STEP);
    var out = '';
    for (var i = from; i < shown; i++) out += rowHtml(all[i]);
    if (add) list.insertAdjacentHTML('beforeend', out); else list.innerHTML = out;
    more.hidden = shown >= all.length;
    return all.length;
  }
  render(false);

  moreBtn.addEventListener('click', function () {
    var first = list.children.length;
    render(true);
    var a = list.children[first];
    if (a && moreBtn === doc.activeElement) a.focus({ preventScroll: true });
  });

  /* Opening and closing a type. */
  railIn.addEventListener('click', function (e) {
    var head = e.target.closest('.rail-head');
    if (head) {
      e.preventDefault();
      var open = head.getAttribute('aria-expanded') !== 'true';
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      head.querySelector('.rail-sign').textContent = open ? '−' : '+';
      doc.getElementById(head.getAttribute('aria-controls')).hidden = !open;
      return;
    }
    var line = e.target.closest('.rail-shelf');
    if (!line) return;
    e.preventDefault();
    var i = +line.getAttribute('data-shelf');
    chosen = chosen === i ? null : i;
    railIn.querySelectorAll('.rail-shelf').forEach(function (x) {
      x.setAttribute('aria-pressed', +x.getAttribute('data-shelf') === chosen ? 'true' : 'false');
    });
    var n = render(false);
    status.textContent = chosen === null ? 'Every writing.' : names[chosen] + ': ' + n + (n === 1 ? ' writing.' : ' writings.');
    var label = fold.querySelector('.rail-fold-chosen');
    label.textContent = chosen === null ? '' : names[chosen];
    if (phone.matches) setFold(false);
    /* Bring the top of the list into view when it has scrolled up out of sight. */
    var foot = parseFloat(getComputedStyle(doc.documentElement).getPropertyValue('--sr-foot')) || 53;
    var top = list.getBoundingClientRect().top;
    if (top < foot || phone.matches) {
      win.scrollTo({ top: Math.max(0, win.pageYOffset + top - foot - 24), behavior: calm.matches ? 'instant' : 'smooth' });
    }
  });

  /* The heads and lines are links that act as buttons: the space bar presses them too. */
  railIn.addEventListener('keydown', function (e) {
    if (e.key === ' ' && e.target.closest('.rail-head, .rail-shelf')) { e.preventDefault(); e.target.click(); }
  });

  /* Phones: the rail folded into one row reading "Shelves". */
  function setFold(open) {
    fold.setAttribute('aria-expanded', open ? 'true' : 'false');
    fold.querySelector('.rail-sign').textContent = open ? '−' : '+';
    railIn.hidden = !open && phone.matches;
  }
  fold.addEventListener('click', function () { setFold(fold.getAttribute('aria-expanded') !== 'true'); });
  function fit() { if (phone.matches) setFold(fold.getAttribute('aria-expanded') === 'true'); else railIn.hidden = false; }
  if (phone.addEventListener) phone.addEventListener('change', fit); else phone.addListener(fit);
  fit();
})();
