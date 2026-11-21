/* The "Newest ..." wall (SITE-ORDER\NEWEST-WALL-BUILD; the preview Reach called perfect, November 9, 2026). Reads window.NW_CARDS (newest first), shows thirty, and
   "More ..." shows the next thirty. Each card goes into the shortest column, so the wall reads newest first from the
   top while every picture keeps its own height, whole. Pointing at a card (computers only) keeps its gallery lit. */
(function () {
  var cards = window.NW_CARDS || [];
  var wall = document.querySelector('.nw-wall');
  var more = document.querySelector('.nw-more');
  if (!wall) return;
  var STEP = 30, shown = 0, cols = [];
  var MONTHS = 'January February March April May June July August September October November December'.split(' ');

  function say(d) {
    var p = d.split('-');
    return MONTHS[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0];
  }
  function count() {
    var w = window.innerWidth;
    return w < 700 ? 1 : (w <= 1000 ? 2 : 3);
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  /* SENTENCE CARDS (SITE-ORDER\SENTENCE-CARDS-BUILD; the preview Reach called perfect, November 13, 2026; spec
     claude/SENTENCE-CARDS-SPEC-2026-11-13.md, from the Pew Center for Arts & Heritage home page): one sentence from
     the middle of a writing, large in Lora italic, and under it a dash and the writing's title. The whole card opens
     the writing, and it counts with the writings for the pointing highlight. */
  function makeSaid(c) {
    var a = el('a', 'nw-card nw-card-sentence');
    a.href = c.href;
    a.setAttribute('data-group', c.group);
    a.appendChild(el('p', 'nw-said', c.said));
    a.appendChild(el('p', 'nw-from', '\u2014 ' + c.title));
    return a;
  }
  function make(c) {
    if (c.said) return makeSaid(c);
    var a = el('a', 'nw-card' + (c.src ? ' nw-card-picture' : ' nw-card-writing'));
    a.href = c.href;
    a.setAttribute('data-group', c.group);
    if (c.src) {
      var img = el('img', 'nw-pic');
      img.src = c.src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      img.width = c.w; img.height = c.h;
      img.style.aspectRatio = c.w + ' / ' + c.h;
      a.appendChild(img);
    }
    a.appendChild(el('p', 'nw-kind', c.kind));
    a.appendChild(el('h2', 'nw-name', c.title));
    a.appendChild(el('p', 'nw-line', c.line));
    var d = el('p', 'nw-date'); d.innerHTML = say(c.date);
    a.appendChild(d);
    return a;
  }
  function build() {
    var n = count();
    wall.innerHTML = '';
    cols = [];
    for (var i = 0; i < n; i++) {
      var col = el('div', 'nw-col');
      wall.appendChild(col); cols.push(col);
    }
    var upto = shown; shown = 0;
    add(upto);
  }
  function add(upto) {
    for (; shown < upto && shown < cards.length; shown++) {
      var c = cards[shown], k = 0, best = Infinity;
      /* each picture already holds its own height before it loads (its width and height are written), so the
         columns can be measured as they are: the card goes into the shortest */
      for (var i = 0; i < cols.length; i++) {
        var hgt = cols[i].getBoundingClientRect().height;
        if (hgt < best - 1) { best = hgt; k = i; }
      }
      cols[k].appendChild(make(c));
    }
    if (more) more.hidden = shown >= cards.length;
  }
  shown = 0;
  build(); add(STEP);
  if (more) more.addEventListener('click', function () { add(shown + STEP); });

  var lastN = count();
  window.addEventListener('resize', function () {
    if (count() !== lastN) { lastN = count(); build(); }
  });

  /* the pointing highlight: computers only (a pointer that can hover) */
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');
  var lit = null;
  function light(group) {
    if (group === lit) return;
    lit = group;
    wall.classList.add('is-lit');
    var all = wall.querySelectorAll('.nw-card');
    for (var i = 0; i < all.length; i++) all[i].classList.toggle('is-kin', all[i].getAttribute('data-group') === group);
  }
  function clear() {
    lit = null;
    wall.classList.remove('is-lit');
    var all = wall.querySelectorAll('.nw-card.is-kin');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('is-kin');
  }
  wall.addEventListener('mouseover', function (e) {
    if (!fine || !fine.matches) return;
    var card = e.target.closest && e.target.closest('.nw-card');
    if (card) light(card.getAttribute('data-group'));
  });
  wall.addEventListener('mouseleave', clear);
})();

/* The wall's pictures, sharp on a sharp screen, November 21, 2026 (SITE-ORDER\NEWEST-SHARP-BUILD; Reach: "Confirm").
   Every card arrives with its 600-dot copy, exactly as before. A picture that rests on screen for a moment, and is
   drawn across more screen dots than its copy has, fetches the larger copy and takes it; a screen the small copy
   covers fetches nothing. Cards added by "More ..." and cards made again when the columns change follow the same
   rule. A visitor whose browser asks to save data keeps the small copies. The larger copy is the same address without
   "-600"; if it does not come, the small copy stays. */
(function () {
  if (!('IntersectionObserver' in window) || !('MutationObserver' in window)) return;
  var conn = navigator.connection;
  if (conn && conn.saveData) return;
  var wall = document.querySelector('.nw-wall');
  if (!wall) return;
  var REST = 300;  // milliseconds a picture must rest on screen before its larger copy is asked for
  var got = {};    // larger copies already fetched on this visit

  function full(src) {
    var m = /^(.*)-600(\.webp)$/.exec(src || '');
    return m ? m[1] + m[2] : null;
  }
  function soft(img) {  // drawn across more screen dots than the copy has
    var r = img.getBoundingClientRect();
    var k = window.devicePixelRatio || 1;
    return r.width * k > img.naturalWidth * 1.02 || r.height * k > img.naturalHeight * 1.02;
  }
  function onScreen(img) {
    var r = img.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  }
  function sharpen(img) {
    var to = full(img.currentSrc || img.src);
    if (!to || !soft(img)) return;
    img._ppSharp = 1;
    if (got[to]) { img.src = to; return; }
    var pre = new Image();
    pre.onload = function () {
      got[to] = 1;
      var go = function () { img.src = to; };
      if (pre.decode) pre.decode().then(go, go); else go();
    };
    pre.src = to;  // if it does not come, the small copy stays
  }
  function arm(img) {
    clearTimeout(img._ppT);
    if (img._ppSharp) return;
    img._ppT = setTimeout(function () {
      if (!img._ppOn || img._ppSharp || !onScreen(img)) return;
      if (!img.complete || !img.naturalWidth) {
        if (!img._ppWait) {
          img._ppWait = 1;
          img.addEventListener('load', function () { img._ppWait = 0; if (img._ppOn) arm(img); }, { once: true });
        }
        return;
      }
      sharpen(img);
    }, REST);
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var img = entries[i].target;
      img._ppOn = entries[i].isIntersecting;
      if (img._ppOn) arm(img); else clearTimeout(img._ppT);
    }
  });
  function watch(root) {
    var imgs = root.querySelectorAll ? root.querySelectorAll('img.nw-pic') : [];
    for (var i = 0; i < imgs.length; i++) if (!imgs[i]._ppSeen) { imgs[i]._ppSeen = 1; io.observe(imgs[i]); }
  }
  watch(wall);
  new MutationObserver(function () { watch(wall); }).observe(wall, { childList: true, subtree: true });
  var again;
  window.addEventListener('resize', function () {
    clearTimeout(again);
    again = setTimeout(function () {
      var imgs = wall.querySelectorAll('img.nw-pic');
      for (var i = 0; i < imgs.length; i++) if (imgs[i]._ppOn) arm(imgs[i]);
    }, 200);
  });
})();
