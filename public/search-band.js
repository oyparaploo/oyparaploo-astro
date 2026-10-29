/* ==========================================================================
   THE SEARCH BAND: behaviour (preview, SEARCH-BAND-WHOLE-2026-10-29), after Hermès.
   - The header word Search opens and closes the band; Escape closes it too.
   - The band opens downward from the header and pushes the page down.
     If the header has slid back in (the visitor is far down the page), the band
     opens under it there, and the page is pushed down under both.
   - Before typing: five places to go, from the site's own names. No counts.
   - Typing: the five best matches from the site's own names, the typed letters
     in bold. Enter, or "Every match on the Search page", opens the existing
     Search page with every match. Up and Down move through the rows.
   - On a phone the band fills the width and the keyboard opens on its own.
   - Less motion: the band is simply there, and simply gone.
   Reads the names from /search-index.json, the site's own, the first time the
   band opens (the preview read them from search-band-data.js, made from it).
   Built by SITE-ORDER\SEARCH-BAND-BUILD, October 29, 2026.
   ========================================================================== */
(function () {
  var header = document.querySelector('header.site-header');
  if (!header) return;
  var word = header.querySelector('nav a[href="/search"], nav a[href="https://paraploo.com/search"]');
  if (!word) return;
  var BASE = window.PARAPLOO_BASE || '';   /* the preview sets this to the live site; a build leaves it empty */
  var SEARCH = BASE + '/search';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* The five places offered before anything is typed: the site's own names,
     writing first, then Marks, Placings and Collage. The same five everywhere. */
  var SUGGEST = [
    { t: 'Start here', h: '/writings/start-here', k: 'Where to begin, in the Writings' },
    { t: 'The Goodness of Grief', h: '/writings/the-goodness-of-grief', k: 'Shelf of Poems' },
    { t: 'Handwritten Every Which Way', h: '/words/hand-writings/', k: 'Marks' },
    { t: 'Placed Outside ...', h: '/physical/placed-outside', k: 'Placings' },
    { t: 'Saved Again ...', h: '/digital/saved-pieces/', k: 'Collage' }
  ];

  /* ---------- the names ---------- */
  var SECTIONS = { 'Writings': 1, 'Marks': 1, 'Placings': 1, 'Collage': 1 };
  function galleryKind(h) {
    if (/^\/physical\//.test(h)) return 'Placings gallery';
    if (/^\/digital\//.test(h)) return 'Collage gallery';
    if (/^\/(marks|sumi|mind-mapping)\b|^\/words\/hand-writings\//.test(h)) return 'Marks gallery';
    if (/^\/writings\//.test(h)) return 'Writings gallery';
    return 'Gallery';
  }
  function writingKind(w) {
    if (w.k === 'Song') return 'Song' + (w.a ? ' · ' + w.a : '');
    if (w.k === 'Question') return 'Question, on the FAQ';
    if (!w.s) return 'Writing';
    var p = w.s.split(' · ');            /* "Story · 2025 · 8 minutes" becomes "Story · 8 minutes" */
    return p.length === 3 ? p[0] + ' · ' + p[2] : w.s;
  }
  var items = null;
  function build(d) {
    items = [];
    var seen = {};
    function add(t, h, k, order) {
      if (!t || !h || seen[h]) return;
      seen[h] = 1;
      items.push({ t: t, f: fold(t), h: h, k: k, o: order });
    }
    (d.pages || []).forEach(function (p) {
      var k = p.s === 'Page' ? (SECTIONS[p.t] ? 'Section' : 'Page') : p.s;
      add(p.t, p.h, k, 0);
    });
    (d.galleries || []).forEach(function (g) { add(g.t, g.h, galleryKind(g.h), 1); });
    (d.writings || []).forEach(function (w) { add(w.t, w.h, writingKind(w), 2); });
    items.numbers = d.explicit || [];
  }

  /* ---------- matching ---------- */
  function fold(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  /* each letter folded on its own, so a match found in the folded name can be bolded in the real one */
  function foldMap(s) {
    var out = '', map = [];
    for (var i = 0; i < s.length; i++) {
      var f = fold(s.charAt(i));
      for (var j = 0; j < f.length; j++) { out += f.charAt(j); map.push(i); }
    }
    map.push(s.length);
    return { s: out, map: map };
  }
  function wordStart(f, q) {
    var i = f.indexOf(q);
    while (i !== -1) {
      if (i === 0 || !/[a-z0-9]/.test(f.charAt(i - 1))) return i;
      i = f.indexOf(q, i + 1);
    }
    return -1;
  }
  function best(raw) {
    var q = fold(raw.trim()).replace(/\s+/g, ' ');
    if (!q) return [];
    var found = [];
    if (/^\d{2,5}$/.test(q)) {
      var n = String(parseInt(q, 10));
      items.numbers.forEach(function (x) {
        var num = x.n.padStart(5, '0');
        /* typed with its leading zero ("0535"), the number is read as written; without it ("535"), from its first digit */
        var hit = q.charAt(0) === '0' ? num.indexOf(q) === 0 : x.n.indexOf(n) === 0;
        if (hit) {
          found.push({ r: x.n === n ? 0 : 1, o: 0, l: -parseInt(x.n, 10), t: (x.m ? x.m + ' · ' : '') + num, h: x.h, k: 'Picture', q: q });
        }
      });
    }
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var at = it.f.indexOf(q);
      if (at === -1) continue;
      var r = it.f === q ? 0 : (at === 0 ? 1 : (wordStart(it.f, q) !== -1 ? 2 : 3));
      found.push({ r: r, o: it.o, l: it.t.length, t: it.t, h: it.h, k: it.k, q: q });
    }
    found.sort(function (a, b) { return (a.r - b.r) || (a.o - b.o) || (a.l - b.l); });
    return found.slice(0, 5);
  }

  /* ---------- writing a row ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cutAt(s, n) { if (s.length <= n) return s; var c = s.lastIndexOf(' ', n); return s.slice(0, c > n * 0.6 ? c : n); }
  /* The name with the typed letters in bold. A very long name is shown in part, around the match. */
  function marked(t, q) {
    var fm = foldMap(t);
    var at = q ? wordStart(fm.s, q) : -1;
    if (q && at === -1) at = fm.s.indexOf(q);
    var a = at === -1 ? -1 : fm.map[at], b = at === -1 ? -1 : fm.map[at + q.length];
    var start = 0, end = t.length, MAX = 76;
    if (t.length > MAX) {
      if (a === -1 || b <= MAX - 6) { end = cutAt(t, MAX - 4).length; }
      else {
        var s0 = t.lastIndexOf(' ', Math.max(0, a - 24));
        start = s0 === -1 ? 0 : s0 + 1;
        end = start + cutAt(t.slice(start), MAX - 8).length;
        if (end < b) end = b;
      }
    }
    var pre = start > 0 ? '... ' : '', post = end < t.length ? ' ...' : '';
    if (a === -1 || a < start) return pre + esc(t.slice(start, end)) + post;
    return pre + esc(t.slice(start, a)) + '<b>' + esc(t.slice(a, b)) + '</b>' + esc(t.slice(b, end)) + post;
  }
  function row(x, q, i) {
    return '<li><a class="sb-row" id="sb-opt-' + i + '" href="' + esc(BASE + x.h) + '">' +
      '<span class="sb-name">' + marked(x.t, q) + '</span>' +
      '<span class="sb-kind">' + esc(x.k) + '</span>' +
      '<span class="sb-arrow" aria-hidden="true">&rarr;</span></a></li>';
  }

  /* ---------- the band ---------- */
  var band, input, head, list, all, spacer, active = -1, isOpen = false, watch = null, seenBand = null;
  function make() {
    if (band) return;
    band = document.createElement('div');
    band.className = 'sb';
    band.id = 'search-band';
    band.hidden = true;
    band.innerHTML =
      '<div class="sb-in">' +
        '<form class="sb-form" role="search" action="' + SEARCH + '" method="get">' +
          '<label class="sb-label" for="sb-q">Search the site</label>' +
          '<input class="sb-q" id="sb-q" name="q" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"' +
          ' placeholder="A word, a name, or a catalogue number" role="combobox" aria-expanded="true" aria-controls="sb-list" aria-autocomplete="list">' +
        '</form>' +
        '<p class="sb-head" id="sb-head" aria-live="polite">Places to go</p>' +
        '<div class="sb-right">' +
          '<ul class="sb-list" id="sb-list" aria-labelledby="sb-head"></ul>' +
          '<a class="sb-all" href="' + SEARCH + '" hidden>Every match on the Search page <span class="arr" aria-hidden="true">&rarr;</span></a>' +
        '</div>' +
      '</div>';
    spacer = header.nextElementSibling && header.nextElementSibling.classList.contains('site-header-spacer') ? header.nextElementSibling : null;
    var after = spacer || header;
    after.parentNode.insertBefore(band, after.nextSibling);
    input = band.querySelector('.sb-q');
    var narrow = window.matchMedia('(max-width: 600px)');
    function words() { input.placeholder = narrow.matches ? 'A word or a number' : 'A word, a name, or a catalogue number'; }
    words();
    if (narrow.addEventListener) narrow.addEventListener('change', words);
    head = band.querySelector('.sb-head');
    list = band.querySelector('.sb-list');
    all = band.querySelector('.sb-all');
    input.addEventListener('input', show);
    input.addEventListener('keydown', keys);
    band.querySelector('.sb-form').addEventListener('submit', function (e) {
      var v = input.value.trim();
      if (!v) { e.preventDefault(); return; }
      var a = active > -1 ? list.querySelectorAll('.sb-row')[active] : null;
      if (a) { e.preventDefault(); location.href = a.href; }
    });
  }

  /* The names: /search-index.json (the Search page reads the same file), read the first time the band opens.
     Until they arrive the five places to go stay; when they arrive, what is typed is matched at once.
     If they cannot be read, the band tries again the next time it opens. */
  var loading = false;
  function load() {
    if (items || loading) return;
    loading = true;
    fetch(BASE + '/search-index.json').then(function (r) {
      if (!r.ok) throw new Error('search-index.json ' + r.status);
      return r.json();
    }).then(function (d) {
      build(d);
      if (isOpen && input && input.value.trim()) show();
    }).catch(function () { loading = false; });
  }

  function show() {
    var v = input.value;
    var q = fold(v.trim()).replace(/\s+/g, ' ');
    setActive(-1);
    if (!q || !items) {
      head.textContent = 'Places to go';
      list.innerHTML = SUGGEST.map(function (x, i) { return row(x, '', i); }).join('');
      all.hidden = true;
      return;
    }
    var found = items ? best(v) : [];
    if (!found.length) {
      head.textContent = 'Nothing matches yet';
      list.innerHTML = '<li><p class="sb-none">Try another word, or a catalogue number.</p></li>';
      all.hidden = true;
      return;
    }
    head.textContent = 'Best matches';
    list.innerHTML = found.map(function (x, i) { return row(x, x.q, i); }).join('');
    all.href = SEARCH + '?q=' + encodeURIComponent(v.trim());
    all.hidden = false;
  }

  function setActive(i) {
    var rows = list ? list.querySelectorAll('.sb-row') : [];
    for (var j = 0; j < rows.length; j++) rows[j].classList.toggle('is-active', j === i);
    active = i;
    if (i > -1 && rows[i]) input.setAttribute('aria-activedescendant', rows[i].id);
    else if (input) input.removeAttribute('aria-activedescendant');
  }
  function keys(e) {
    var rows = list.querySelectorAll('.sb-row');
    if (e.key === 'ArrowDown') { e.preventDefault(); if (rows.length) setActive(Math.min(active + 1, rows.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, -1)); }
  }

  /* ---------- opening and closing ---------- */
  function pinnedNow() { return header.classList.contains('is-pinned'); }
  function place() {
    if (!isOpen) return;
    if (pinnedNow()) {
      band.classList.add('sb-pinned');
      band.style.top = header.offsetHeight + 'px';
      if (spacer) spacer.style.height = (header.offsetHeight + band.offsetHeight) + 'px';
    } else {
      band.classList.remove('sb-pinned');
      band.style.top = '';
    }
  }
  function grow(to, done) {
    var from = band.offsetHeight;
    var pinned = band.classList.contains('sb-pinned');
    if (still.matches) {
      band.style.height = to === 'auto' ? '' : to + 'px';
      if (pinned && spacer) spacer.style.height = (header.offsetHeight + (to === 'auto' ? band.offsetHeight : to)) + 'px';
      done();
      return;
    }
    var target = to === 'auto' ? band.querySelector('.sb-in').offsetHeight : to;
    band.style.height = from + 'px';
    void band.offsetHeight;
    band.classList.add('is-moving');
    if (pinned && spacer) spacer.classList.add('sb-moving');
    band.style.height = target + 'px';
    if (pinned && spacer) spacer.style.height = (header.offsetHeight + target) + 'px';
    var finished = false;
    function end(ev) {
      if (ev && ev.target !== band) return;
      if (finished) return;
      finished = true;
      band.removeEventListener('transitionend', end);
      band.classList.remove('is-moving');
      if (spacer) spacer.classList.remove('sb-moving');
      if (to === 'auto') band.style.height = '';
      done();
    }
    band.addEventListener('transitionend', end);
    setTimeout(end, 450);
  }

  function open(e) {
    if (e) e.preventDefault();
    make();
    load();
    if (isOpen) return;
    isOpen = true;
    document.documentElement.classList.add('sb-open');
    word.classList.add('is-open');
    word.setAttribute('aria-expanded', 'true');
    header.classList.remove('is-hidden');
    band.hidden = false;
    band.style.height = '0px';
    input.value = '';
    show();
    place();
    /* the keyboard opens on its own: focus inside the press itself */
    input.focus({ preventScroll: true });
    grow('auto', function () { band.classList.add('is-shown'); place(); });
    watchHeader(true);
  }
  function close(back) {
    if (!isOpen) return;
    isOpen = false;
    watchHeader(false);
    word.classList.remove('is-open');
    word.setAttribute('aria-expanded', 'false');
    band.classList.remove('is-shown');
    var pinned = band.classList.contains('sb-pinned');
    grow(0, function () {
      band.hidden = true;
      document.documentElement.classList.remove('sb-open');
      band.classList.remove('sb-pinned');
      band.style.top = '';
      if (pinned && spacer && pinnedNow()) spacer.style.height = header.offsetHeight + 'px';
      if (back !== false) word.focus({ preventScroll: true });
    });
  }

  /* While the band is open the header stays with it; if the band scrolls away
     with the page, it closes quietly, so nothing is left open out of sight. */
  function watchHeader(on) {
    if (watch) { watch.disconnect(); watch = null; }
    if (seenBand) { seenBand.disconnect(); seenBand = null; }
    if (!on) return;
    watch = new MutationObserver(function () {
      if (header.classList.contains('is-hidden')) header.classList.remove('is-hidden');
      place();
    });
    watch.observe(header, { attributes: true, attributeFilter: ['class'] });
    if ('IntersectionObserver' in window) {
      seenBand = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting && isOpen && !band.classList.contains('sb-pinned') && band.classList.contains('is-shown')) {
            document.documentElement.classList.remove('sb-open');
            close(false);
          }
        });
      });
      seenBand.observe(band);
    }
  }

  word.classList.add('sb-word');
  word.setAttribute('role', 'button');
  word.setAttribute('aria-controls', 'search-band');
  word.setAttribute('aria-expanded', 'false');
  word.addEventListener('click', function (e) {
    e.preventDefault();
    if (isOpen) close(); else open();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) { e.preventDefault(); close(); }
  });
  window.addEventListener('resize', place);

  /* for the preview's own pictures of the three states */
  window.SEARCH_BAND = { open: open, close: close, type: function (s) { make(); input.value = s; show(); } };
})();
