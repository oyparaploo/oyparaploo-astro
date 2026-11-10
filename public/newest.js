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
  function make(c) {
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
