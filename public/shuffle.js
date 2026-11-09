/* Shuffle ... (SITE-ORDER\SHUFFLE-BUILD, prepared November 9, 2026; Reach: "Perfect" on
   HTML DOCS\PREVIEWS\SHUFFLE-WHOLE-2026-11-09, from whitney.org's /shuffle). One thing at a time from anywhere live
   on the site, and a round button to draw another. The things are in /shuffle-data/, made at every build by
   BUILD\shuffle.py: pools.json names the kinds, how often each takes its turn, and their parts; a part is read the
   first time a thing from it is drawn. Nothing on the page moves by itself. No count is shown anywhere. */
(function () {
  var DATA = '/shuffle-data/';

  /* The band's colour comes from the kind of thing on it: the Writings types take the left tone of their own
     type page's band; Marks, Placings, Collage and Musicology a pale tone of their footer colour. Deep in Dark. */
  var TONES = {
    'Marks': ['#e4e7ee', '#1f2633'], 'Placings': ['#ece3d8', '#33291f'], 'Collage': ['#e0e8de', '#213024'],
    'Musicology': ['#e8e2f0', '#2c2540'],
    'Poem': ['#E5DEDF', '#3a2a2d'], 'Story': ['#E3E9EF', '#24303c'], 'Play': ['#DFDBEA', '#2e2a3d'],
    'Essay': ['#E3DDCF', '#382f22'], 'Prayer': ['#E1E7EC', '#26313a'], 'Letter': ['#DCE5DE', '#24342a'],
    'Text': ['#DCE5DE', '#24342a'], 'Conversation': ['#E4E0D1', '#36321f'], 'Short Piece': ['#DEEBE9', '#213633']
  };
  /* The one plain line above a picture, and the tone its band takes. */
  var WHAT = {
    marks: ['A Marks drawing', 'Marks'], hand: ['A handwritten page', 'Marks'], sumi: ['A brush and ink drawing', 'Marks'],
    logo: ['A logotype', 'Marks'], placings: ['A Placings photograph', 'Placings'], collage: ['A collage', 'Collage'],
    card: ['A text card', 'Text'], textpic: ['A text picture', 'Text']
  };

  var band = document.getElementById('sh-band');
  var box = document.getElementById('sh-thing');
  var live = document.getElementById('sh-live');
  var btn = document.getElementById('sh-btn');
  if (!band || !box || !btn) return;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function paras(s) { return String(s || '').split(/\n\n+/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join(''); }
  function toneKey(t) {
    if (t.t === 'p') return (WHAT[t.w] || WHAT.placings)[1];
    if (t.t === 's') return 'Musicology';
    if (t.x) return 'Text';
    return String(t.k).split('·')[0].trim();
  }

  function render(t) {
    var h = '';
    if (t.t === 'p') {
      var what = (WHAT[t.w] || WHAT.placings)[0];
      h = '<p class="sh-what">' + what + (t.g ? ', from ' + esc(t.g) : '') + '</p>' +
          '<a class="sh-pic" href="' + esc(t.h) + '"><img src="' + esc(t.s) + '" alt="' + esc(t.a) + '" decoding="async"></a>' +
          '<div><a class="sh-num" href="' + esc(t.h) + '"><span class="nm">' + esc(t.n) + '</span><span class="no">' + esc(t.c) + '</span></a></div>';
      live.textContent = t.n + ', catalogue ' + t.c;
    } else if (t.t === 'w') {
      var poem = /^Poem/.test(t.k);
      h = '<p class="sh-what">' + esc(t.k) + '</p>' +
          '<h2 class="sh-h"><a href="' + esc(t.h) + '">' + esc(t.n) + '</a></h2>' +
          (t.u ? '<p class="sh-sub">' + esc(t.u) + '</p>' : '') +
          '<div class="sh-words' + (poem ? ' is-poem' : '') + '">' + paras(t.o) + '</div>' +
          '<p class="sh-go"><a class="arrow-link arrow-next" href="' + esc(t.h) + '">Read the whole writing <span class="arrow-glyph" aria-hidden="true">&rarr;</span></a></p>';
      live.textContent = t.n;
    } else {
      h = '<p class="sh-what">A favorite song, from Musicology</p>' +
          '<h2 class="sh-h"><a href="' + esc(t.h) + '">' + esc(t.n) + '</a></h2>' +
          '<p class="sh-sub">' + esc(t.r) + '</p>' +
          '<div class="sh-words">' + paras(t.o) + '</div>' +
          (t.e ? '<div class="sh-embed"><iframe src="' + esc(t.e) + '" height="152" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="' + esc(t.n + ', by ' + t.r + ', on Spotify') + '"></iframe></div>' : '') +
          '<p class="sh-go"><a class="arrow-link arrow-next" href="' + esc(t.h) + '">Read the whole writing <span class="arrow-glyph" aria-hidden="true">&rarr;</span></a></p>';
      live.textContent = t.n + ', ' + t.r;
    }
    var tone = TONES[toneKey(t)] || TONES.Placings;
    band.style.setProperty('--bl', tone[0]);
    band.style.setProperty('--bd', tone[1]);
    box.innerHTML = h;
  }

  /* The data, read once each: pools.json, then a part the first time a thing from it is drawn. */
  var pools = null, parts = {};
  function getJSON(u) {
    return fetch(u).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); });
  }
  function loadPools() {
    if (!pools) pools = getJSON(DATA + 'pools.json').then(function (d) { return d.pools || []; });
    return pools;
  }
  function loadPart(f) {
    if (!parts[f[0]]) parts[f[0]] = getJSON(DATA + f[0] + '.json?v=' + f[2]);
    return parts[f[0]];
  }

  /* Chance, but never the same thing twice in a row (a reload remembers the last one for this visit). */
  var last = null, turn = 0;
  try { last = sessionStorage.getItem('pp-shuffle-last'); } catch (e) {}
  function pick(ps) {
    var sum = 0, i, r;
    for (i = 0; i < ps.length; i++) sum += ps[i].w;
    r = Math.random() * sum;
    for (i = 0; i < ps.length; i++) { r -= ps[i].w; if (r < 0) break; }
    var pool = ps[Math.min(i, ps.length - 1)];
    var size = 0;
    for (i = 0; i < pool.f.length; i++) size += pool.f[i][1];
    r = Math.floor(Math.random() * size);
    for (i = 0; i < pool.f.length; i++) { if (r < pool.f[i][1]) break; r -= pool.f[i][1]; }
    return { f: pool.f[Math.min(i, pool.f.length - 1)], n: r };
  }
  function draw() {
    var mine = ++turn;
    function attempt(tries) {
      return loadPools().then(function (ps) {
        if (!ps.length) return null;
        var p = pick(ps);
        return loadPart(p.f).then(function (rows) {
          if (!rows.length) return tries < 12 ? attempt(tries + 1) : null;
          var t = rows[p.n % rows.length];
          if (t.h === last && tries < 12) return attempt(tries + 1);
          return t;
        });
      });
    }
    return attempt(0).then(function (t) {
      if (!t || mine !== turn) return;
      last = t.h;
      try { sessionStorage.setItem('pp-shuffle-last', t.h); } catch (e) {}
      render(t);
    }).catch(function () {});
  }

  btn.addEventListener('click', function () {
    draw();
    /* if the thing's top has gone above the window, bring it back, at once */
    var r = band.getBoundingClientRect();
    if (r.top < 0) window.scrollTo(0, window.pageYOffset + r.top - 72);
  });

  draw();
})();
