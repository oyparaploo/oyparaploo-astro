/* Keep: the list the visitor keeps (the preview of October 23, 2026, as built November 2026; SITE-ORDER\KEEP-LIST-BUILD).
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
    if (w) w.textContent = kept ? 'Kept' : 'Keep';
  }
  function wire(btn) {
    if (btn.__keep) return; btn.__keep = true;
    btn.hidden = false;
    if (!btn.dataset.keepPage) show(btn, isKept(btn.dataset.keepU));
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      var item = btn.__item || itemFrom(btn);
      if (on) item.at = Date.now();
      if (!setKept(item, on)) return;
      show(btn, on);
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
    for (var i = 0; i < bs.length; i++) show(bs[i], isKept(bs[i].dataset.keepU));
  });

  window.ParaplooKeep = { read: read, isKept: isKept, show: show, wire: wire, KEY: KEY };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { wireAll(); });
  else wireAll();
})();
