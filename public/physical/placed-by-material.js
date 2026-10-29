/* Placed By Material ... (preview, October 29, 2026).
   Choosing a word (click, tap, Enter or Space) shows only the Placings cards that hold it, in the Placings page's
   own order, with a fade under a third of a second; less motion gets a plain swap. The address carries the word
   (#rope opens on rope); Soil is open on arrival. If the word's heading is out of view after a choice (always on a
   phone), the page goes to it: a glide under half a second, a plain jump for less motion. */
(function () {
  var el = document.getElementById('pbm-data');
  if (!el) return;
  var groups = JSON.parse(el.textContent);
  var words = [], byId = {};
  groups.forEach(function (g) { g.words.forEach(function (w) { words.push(w); byId[w.id] = w; }); });

  var chips = document.querySelectorAll('.pbm-chip');
  var cards = document.querySelectorAll('.p-card[data-door]');
  var grid = document.querySelector('.pbm-grid');
  var head = document.getElementById('pbm-word');
  var headWord = head.querySelector('.pbm-head-word');
  var headN = head.querySelector('.pbm-head-n');
  var prev = document.querySelector('.pbm-prev'), next = document.querySelector('.pbm-next');
  var live = document.querySelector('.pbm-live');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = null;

  function count(n) { return n + (n === 1 ? ' gallery' : ' galleries'); }

  function show(id, opts) {
    var w = byId[id];
    if (!w) return;
    opts = opts || {};
    var changed = current !== id;
    current = id;
    for (var i = 0; i < chips.length; i++) {
      chips[i].setAttribute('aria-pressed', chips[i].getAttribute('data-word') === id ? 'true' : 'false');
    }
    var doors = {};
    w.doors.forEach(function (d) { doors[d] = true; });
    if (changed && !still && opts.fade) grid.classList.add('is-changing');
    for (var j = 0; j < cards.length; j++) cards[j].hidden = !doors[cards[j].getAttribute('data-door')];
    headWord.textContent = w.word;
    headN.textContent = count(w.doors.length);
    var k = words.indexOf(w);
    var p = words[(k - 1 + words.length) % words.length], n = words[(k + 1) % words.length];
    prev.setAttribute('href', '#' + p.id); prev.querySelector('.pbm-prev-word').textContent = p.word;
    next.setAttribute('href', '#' + n.id); next.querySelector('.pbm-next-word').textContent = n.word;
    if (grid.classList.contains('is-changing')) {
      void grid.offsetWidth;
      requestAnimationFrame(function () { grid.classList.remove('is-changing'); });
    }
    if (opts.announce) live.textContent = w.word + ', ' + count(w.doors.length);
    if (opts.hash && location.hash !== '#' + id) {
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
    }
    if (opts.go) {
      var r = head.getBoundingClientRect();
      var out = r.top < 80 || r.top > window.innerHeight - 160;
      if (out) {
        head.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
      }
    }
  }

  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener('click', function () {
      show(this.getAttribute('data-word'), { fade: true, announce: true, hash: true, go: true });
    });
  }

  // The words either side: walk the ring, keep the reader at the word's heading.
  [prev, next].forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      show(a.getAttribute('href').slice(1), { fade: true, announce: true, hash: true, go: true });
      head.focus({ preventScroll: true });
    });
  });

  // Choose another material: back up to the tabs, the chosen word under the hand.
  var up = document.querySelector('.pbm-up');
  up.addEventListener('click', function (e) {
    e.preventDefault();
    var tabs = document.getElementById('pbm-tabs');
    tabs.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
    var on = document.querySelector('.pbm-chip[aria-pressed="true"]');
    if (on) on.focus({ preventScroll: true });
  });

  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    if (byId[id]) show(id, { fade: true, announce: true });
  });

  var start = location.hash.slice(1);
  show(byId[start] ? start : words[0].id, {});
  if (byId[start]) { setTimeout(function () { head.scrollIntoView({ block: 'start' }); }, 0); }
})();
