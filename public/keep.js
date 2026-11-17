/* Keep: the list the visitor keeps (the preview of October 23, 2026, as built November 2026; SITE-ORDER\KEEP-LIST-BUILD;
   the word "Keep for later" and the line after a press since SITE-ORDER\KEEP-FOR-LATER-BUILD, November 17, 2026).
   Lives only in this browser (localStorage, key "paraploo-kept"), every read and
   write wrapped, so a page whose browser refuses works exactly as it does today.
   Nothing is counted, nothing pops up, nothing is sent anywhere.
   Each kept thing: u address, k kind ("writing" or "picture"), t title or number,
   m small line (kind and reading time, or gallery), n a picture's catalogue number, s picture, w and h its size,
   l and d the band tones (Light, Dark), at the moment kept. */
(function () {
  var KEY = 'paraploo-kept';
  var html = document.documentElement;
  var store = null;
  try { var probe = '__paraploo_probe'; window.localStorage.setItem(probe, '1'); window.localStorage.removeItem(probe); store = window.localStorage; } catch (e) { store = null; }
  if (!store) { html.classList.add('no-keep'); return; }

  function read() {
    try { var a = JSON.parse(store.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function write(a) {
    try { store.setItem(KEY, JSON.stringify(a)); return true; } catch (e) { return false; }
  }
  function indexOf(a, u) { for (var i = 0; i < a.length; i++) if (a[i] && a[i].u === u) return i; return -1; }
  function isKept(u) { return indexOf(read(), u) > -1; }

  function itemFrom(btn) {
    var d = btn.dataset;
    var it = { u: d.keepU, k: d.keepK || 'writing', t: d.keepT || '', m: d.keepM || '', at: Date.now() };
    if (d.keepS) { it.s = d.keepS; it.w = +d.keepW || 0; it.h = +d.keepH || 0; }
    if (d.keepN) it.n = d.keepN;
    if (d.keepL) it.l = d.keepL;
    if (d.keepD) it.d = d.keepD;
    return it;
  }
  function setKept(item, on) {
    var a = read(), i = indexOf(a, item.u);
    if (on && i < 0) a.push(item);
    if (!on && i > -1) a.splice(i, 1);
    return write(a);
  }

  function show(btn, kept) {
    btn.setAttribute('aria-pressed', kept ? 'true' : 'false');
    var w = btn.querySelector('.keep-word');
    if (w) w.textContent = kept ? 'Kept' : 'Keep for later';
    var h = btn.querySelector('.keep-word-hold');
    if (h) h.textContent = kept ? 'Keep for later' : 'Kept';
  }
  // Keep for later (SITE-ORDER\KEEP-FOR-LATER-BUILD, November 2026): the two words share one place, so the button
  // keeps one width.
  function box(btn) {
    var w = btn.querySelector('.keep-word');
    if (!w || w.parentNode.className === 'keep-word-box') return;
    var b = document.createElement('span'); b.className = 'keep-word-box';
    var h = document.createElement('span'); h.className = 'keep-word-hold'; h.setAttribute('aria-hidden', 'true');
    h.textContent = w.textContent === 'Kept' ? 'Keep for later' : 'Kept';
    w.parentNode.insertBefore(b, w); b.appendChild(w); b.appendChild(h);
  }
  // Keep for later: after a press that keeps, one quiet line beside the button says where kept things live.
  // Nothing shows on arrival, even when the page is already kept; letting go takes the line away.
  // The Kept page's own buttons never carry it. The line's empty place is made when the button is wired,
  // so a screen reader hears the words when they arrive.
  function noteFor(btn) {
    if (btn.dataset.keepPage || !btn.parentNode) return null;
    if (btn.__note) return btn.__note;
    var n = document.createElement('span');
    n.className = 'keep-note';
    n.setAttribute('role', 'status');
    btn.parentNode.insertBefore(n, btn.nextSibling);
    btn.__note = n;
    return n;
  }
  function note(btn, on) {
    var n = noteFor(btn);
    if (!n) return;
    if (on) {
      n.innerHTML = 'Kept. Find it any time on <a href="/kept"><span class="keep-note-words">your Kept page</span> <span class="arrow-glyph" aria-hidden="true">&rarr;</span></a>';
      void n.offsetWidth;
      n.classList.add('is-shown');
    } else {
      n.classList.remove('is-shown');
      n.textContent = '';
    }
  }
  function wire(btn) {
    if (btn.__keep) return; btn.__keep = true;
    btn.hidden = false;
    box(btn);
    noteFor(btn);
    if (!btn.dataset.keepPage) show(btn, isKept(btn.dataset.keepU));
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      var item = btn.__item || itemFrom(btn);
      if (on) item.at = Date.now();
      if (!setKept(item, on)) return;
      show(btn, on);
      note(btn, on);
      btn.classList.add('is-just');
    });
    btn.addEventListener('mouseleave', function () { btn.classList.remove('is-just'); });
    btn.addEventListener('blur', function () { btn.classList.remove('is-just'); });
  }
  function wireAll(root) {
    var bs = (root || document).querySelectorAll('.keep[data-keep-u]');
    for (var i = 0; i < bs.length; i++) wire(bs[i]);
  }
  // Another tab kept or let go: the buttons on this page follow (not on the Kept page's own list).
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    var bs = document.querySelectorAll('.keep[data-keep-u]:not([data-keep-page])');
    for (var i = 0; i < bs.length; i++) { var k = isKept(bs[i].dataset.keepU); show(bs[i], k); if (!k) note(bs[i], false); }
  });

  window.ParaplooKeep = { read: read, isKept: isKept, show: show, wire: wire, KEY: KEY };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { wireAll(); });
  else wireAll();
})();
