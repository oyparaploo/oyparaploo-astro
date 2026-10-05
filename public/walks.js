/* ==========================================================================
   THE WALK'S FOOT (made whole October 4, 2026). One small shared script, with walks-data.js.
   On any stop of a walk it draws, at the foot of the page:
   "Part of" the walk (block 108); the next-stop band, the next stop's picture whole, its name large,
   its time and a "Next →" reversal button (blocks 114 and 54); the whole walk as rows, the stop you are
   on reversed (block 115). The last stop has no next-stop band: in its place, on the deepest band,
   "Before you go", the gift as the browser's own fold, opened by an "Open it" reversal button (blocks
   116 and 35), then "Back to the walks →". Each band one shade deeper than the one before (block 68).
   The walk is carried in the address (?walk=<slug>); in the preview the page also names its walk and
   stop on its <html>, so a double-click works.
   On the site (step 8, October 5, 2026): every link in walks-data.js is a site address, used as it
   is; a writing stop is found by its own address ("at"); its links carry ?walk=<name>. The page's own Previous and Next steps aside (walks.css),
   so there is one clear next step.
   ========================================================================== */
(function () {
  var D = window.PARAPLOO_WALKS;
  if (!D) return;
  var doc = document, html = doc.documentElement;
  var q = new URLSearchParams(location.search);
  var slug = q.get('walk') || html.getAttribute('data-walk');
  var W = D.walks[slug];
  if (!W) return;
  var root = html.getAttribute('data-root') || '';
  var k = parseInt(html.getAttribute('data-stop') || '0', 10);
  if (!k) {
    for (var s0 = 0; s0 < W.stops.length; s0++) {
      if (location.pathname.replace(/\/$/, '').replace(/\.html$/, '') === String(W.stops[s0].at || W.stops[s0].href).replace(/\/$/, '').replace(/\.html$/, '')) k = s0 + 1;
    }
  }
  if (!k) return;
  var S = W.stops, sh = W.shades, last = k === S.length;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(h) { return /^(https?:|\/)/.test(h) ? h : root + h; }
  function img(p, lazy) {
    return '<img src="' + url(p.src) + '" width="' + p.w + '" height="' + p.h + '" alt="' + p.n + '"' + (lazy ? ' loading="lazy"' : '') + ' decoding="async">';
  }
  var ARR = '<span class="arr" aria-hidden="true">&rarr;</span>';
  html.classList.add('on-walk');

  var out = [];
  out.push('<section class="walk-foot" aria-label="' + esc(W.name) + '">');
  out.push('<div class="wf-band wf-part" style="--b:' + sh[k] + '"><p class="wf-in">Part of <a href="' + url(W.href) + '"><em>' + esc(W.name) + '</em></a></p></div>');

  var rows = S.map(function (st, i) {
    var here = i === k - 1;
    return '<li><a href="' + url(st.href) + '"' + (here ? ' class="is-here" aria-current="page"' : '') + '>' +
      '<span class="r-name">' + esc(st.name) + '</span><span class="r-time">' + esc(st.time) + '</span>' +
      '<span class="r-arrow" aria-hidden="true">&rarr;</span></a></li>';
  }).join('');
  var walkRows = function (band) {
    return '<nav class="wf-band wf-walk" style="--b:' + band + '" aria-label="' + esc(W.name) + ', the whole walk"><div class="wf-in">' +
      '<p class="wf-label">The whole walk</p><ol class="wf-rows">' + rows + '</ol></div></nav>';
  };

  if (!last) {
    var nx = S[k], p = nx.pic;
    var under = (nx.kind === 'writing' || nx.words) ? '<p class="wf-next-num">' + p.n + '</p>' : '';
    var where = (nx.kind === 'picture' && !nx.words && nx.where) ? '<p class="wf-next-where">' + esc(nx.where[0]) + '</p>' : '';
    out.push('<div class="wf-band wf-next" style="--b:' + sh[k + 1] + '"><div class="wf-in wf-next-grid">' +
      '<div class="wf-next-pic"><a href="' + url(nx.href) + '" tabindex="-1" aria-hidden="true">' + img(p, true) + '</a>' + under + '</div>' +
      '<div class="wf-next-words"><h2 class="wf-next-name">' + esc(nx.name) + '</h2>' + where +
      '<p class="wf-next-time">' + esc(nx.time) + '</p>' +
      '<a class="wbtn" href="' + url(nx.href) + '">Next ' + ARR + '</a></div></div></div>');
    out.push(walkRows(sh[k + 1]));
    html.style.setProperty('--walk-last', sh[k + 1]);
  } else {
    out.push(walkRows(sh[k]));
    var g = W.gift, body;
    if (g.kind === 'picture') {
      /* the picture is put in when the fold opens, so the drawing over the page is never cut away for a picture still folded */
      body = '';
    } else {
      body = '<div class="wf-sheet">' + (g.phone ? '' : '<p class="wf-sheet-kind">' + g.kindline + '</p><h3 class="wf-sheet-title">' + g.title + '</h3>') +
        '<div class="wf-sheet-body">' + g.html + '</div></div>';
    }
    out.push('<div class="wf-band wf-gift" style="--b:' + sh[11] + '"><div class="wf-in">' +
      '<h2 class="wf-gift-title">Before you go</h2>' +
      '<details class="wf-fold"><summary class="wbtn"><span class="wf-open">Open it</span><span class="wf-close">Close it</span></summary>' +
      '<div class="wf-gift-body">' + body + '</div></details>' +
      '<p class="wf-back"><a class="w-arrow" href="' + url(D.walksHref) + '">Back to the walks ' + ARR + '</a></p></div></div>');
    html.style.setProperty('--walk-last', sh[11]);
  }
  out.push('</section>');

  var main = doc.querySelector('main');
  if (!main) return;
  /* An old Book room (Come Sit) keeps its words in a narrow main column: the foot goes after it, full width. */
  if (main.classList.contains('core-main')) main.insertAdjacentHTML('afterend', out.join(''));
  else main.insertAdjacentHTML('beforeend', out.join(''));
  var fold = doc.querySelector('.walk-foot .wf-fold');
  if (fold && W.gift.kind === 'picture') {
    var gp = W.gift, box = fold.querySelector('.wf-gift-body');
    var fill = function () {
      box.innerHTML = fold.open ? '<figure class="wf-gift-pic">' + img(gp.pic, false) + '<figcaption><a href="' + gp.page + '">' + gp.pic.n + '</a></figcaption></figure>' : '';
    };
    fold.addEventListener('toggle', fill);
    fill();
  }
})();
