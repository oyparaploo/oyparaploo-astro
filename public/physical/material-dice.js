/* Found Together ... (the name, November 10, 2026; the preview carried a working label). Spec: claude/MATERIAL-DICE-SPEC-2026-11-09.md.
   The galleries and their words come from the page's own data (pbm-data, made from the Placings materials log by
   the page's make script), read the other way round: for each gallery, the materials seen in it for certain.
   A roll takes one gallery (never the same one twice in a row) and three of its words at random, so a roll is never
   empty and the three are always found together. The photograph is that gallery's own, from its card below.
   A word leads to its material further down the page: it presses that material's pill, so the galleries gather and
   the page goes to them, as a press on the pill itself does.
   Still, or the visitor's less-motion setting: the words swap and the photograph changes, with no movement at all. */
(function () {
  var band = document.getElementById('md-band');
  var data = document.getElementById('pbm-data');
  if (!band || !data) return;

  var groups = JSON.parse(data.textContent);
  var rows = {};
  groups.forEach(function (g) {
    if (g.name === 'Not Quite Sure') return;              /* only what the log saw for certain */
    g.words.forEach(function (w) {
      w.doors.forEach(function (d) { (rows[d] = rows[d] || []).push({ id: w.id, word: w.word }); });
    });
  });

  var galleries = [];
  var cards = document.querySelectorAll('.p-card[data-door]');
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i], door = c.getAttribute('data-door'), img = c.querySelector('img');
    if (!rows[door] || rows[door].length < 3 || !img) continue;
    galleries.push({
      door: door,
      name: c.querySelector('.p-name').textContent,
      href: (c.getAttribute('href').charAt(0) === '/' ? (window.PARAPLOO_BASE || '') : '') + c.getAttribute('href'),  /* the site's own addresses stay as they are */
      src: img.getAttribute('src'),
      srcset: img.getAttribute('srcset'),
      w: img.getAttribute('width'), h: img.getAttribute('height'),
      words: rows[door]
    });
  }
  if (!galleries.length) return;

  var words = band.querySelectorAll('.md-word');
  var roll = band.querySelector('.md-roll');
  var pic = band.querySelector('.md-pic img');
  var picLink = band.querySelector('.md-pic-link');
  var gName = band.querySelector('.md-gallery');
  var look = band.querySelector('.md-look');
  var live = band.querySelector('.md-live');

  function calm() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function three(list) {
    var a = list.slice();
    for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; }
    return a.slice(0, 3);
  }

  var last = -1;
  function pick() {
    var n;
    do { n = Math.floor(Math.random() * galleries.length); } while (galleries.length > 1 && n === last);
    last = n;
    return galleries[n];
  }

  function setWord(el, w) {
    el.setAttribute('href', '#' + w.id);
    el.setAttribute('data-word', w.id);
    el.setAttribute('aria-label', w.word + ': every gallery that holds it, further down');
    el.querySelector('.md-word-in').textContent = w.word;
  }

  var picTimer = null;
  function setPicture(g, moving) {
    var url = g.src;
    var done = false;
    function swap() {
      if (done) return;
      done = true;
      clearTimeout(picTimer);
      pic.setAttribute('src', g.src);
      if (g.srcset) pic.setAttribute('srcset', g.srcset); else pic.removeAttribute('srcset');
      pic.setAttribute('width', g.w); pic.setAttribute('height', g.h);
      pic.setAttribute('alt', 'A photograph from ' + g.name + ', a Placings gallery');
      if (moving && !calm()) {
        pic.classList.add('is-coming');
        void pic.offsetWidth;
        requestAnimationFrame(function () { pic.classList.remove('is-coming'); });
      }
    }
    picLink.setAttribute('href', g.href);
    gName.textContent = g.name;
    look.setAttribute('href', g.href);
    look.setAttribute('aria-label', 'Look at this one: ' + g.name);
    /* wait for the larger picture only so long; nothing waits more than about a second */
    var pre = new Image();
    if (g.srcset) { pre.sizes = pic.getAttribute('sizes') || ''; pre.srcset = g.srcset; }
    pre.onload = swap; pre.onerror = swap;
    pre.src = url;
    picTimer = setTimeout(swap, 900);
  }

  function show(moving) {
    var g = pick();
    var w = three(g.words);
    var still = !moving || calm();
    if (still) {
      roll.classList.remove('is-turning');
      for (var i = 0; i < words.length; i++) { words[i].classList.remove('is-in', 'is-out'); setWord(words[i], w[i]); }
    } else {
      roll.classList.remove('is-turning'); void roll.offsetWidth; roll.classList.add('is-turning');
      [0, 1, 2].forEach(function (i) {
        var el = words[i], delay = i * 90;
        setTimeout(function () {
          el.classList.remove('is-in'); el.classList.add('is-out');
          setTimeout(function () {
            setWord(el, w[i]);
            el.classList.remove('is-out'); void el.offsetWidth; el.classList.add('is-in');
          }, 170);
        }, delay);
      });
    }
    setPicture(g, moving);
    if (moving) live.textContent = w[0].word + ', ' + w[1].word + ' and ' + w[2].word + ', from ' + g.name;
  }

  roll.addEventListener('click', function () { show(true); });

  /* A word leads to its material further down: press that material's own pill. */
  for (var k = 0; k < words.length; k++) {
    words[k].addEventListener('click', function (e) {
      var chip = document.querySelector('.pbm-chip[data-word="' + this.getAttribute('data-word') + '"]');
      if (!chip) return;
      e.preventDefault();
      chip.click();
      var head = document.getElementById('pbm-word');
      if (head) head.focus({ preventScroll: true });
    });
  }

  show(false);
})();
