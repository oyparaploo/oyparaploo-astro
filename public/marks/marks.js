/* ==========================================================================
   The whole Marks section: the preview's own script. October 3, 2026;
   the slideshow added October 4, 2026, and Every Title's rows the same day.
   On the site (step 7, October 4, 2026): the uneven wall and the slideshow. The
   header, menu and footer run from the site's own /theme.js and /nav.js.
   ========================================================================== */
(function () {
  var doc = document;

  /* 1. (Left out on the site, October 4, 2026: in the preview this pointed the live header, menu and
        footer links back into the preview folder. On the site they are the site's own links.) */

  /* 2. The uneven wall (kept from the Maps preview). Every drawing is whole and at
        one width; each goes to the shortest column, so a tall drawing never leaves a
        hole beside it, and the newest stay at the top. Three or four columns on a wide
        window, three on a middle one, two on a small tablet, one on a phone. The words
        under each drawing are measured at the column's width, so a long title counts
        for its real height. Without this script the wall is a plain grid, still whole
        and in order. */
  var walls = [];
  Array.prototype.forEach.call(doc.querySelectorAll('.uneven'), function (wall) {
    var figs = Array.prototype.slice.call(wall.querySelectorAll('figure'));
    figs.sort(function (a, b) { return (+a.getAttribute('data-i')) - (+b.getAttribute('data-i')); });
    walls.push({ el: wall, figs: figs });
    var wide = parseInt(wall.getAttribute('data-cols'), 10) || 3, lastN = 0, lastW = 0;
    function lay() {
      var w = window.innerWidth, n = w >= 1100 ? wide : (w >= 800 ? 3 : (w >= 600 ? 2 : 1));
      if (n === lastN && Math.abs(w - lastW) < 40) return;
      lastN = n; lastW = w;
      wall.innerHTML = '';
      wall.classList.add('laid');
      var cols = [], hs = [];
      for (var i = 0; i < n; i++) { var c = doc.createElement('div'); c.className = 'col'; wall.appendChild(c); cols.push(c); hs.push(0); }
      /* measure: every figure in the first column, at the column's own width */
      figs.forEach(function (f) { cols[0].appendChild(f); });
      var cw = cols[0].getBoundingClientRect().width || 300;
      var gap = parseFloat(getComputedStyle(cols[0]).rowGap) || 0;
      var h = figs.map(function (f) {
        var cap = f.querySelector('figcaption');
        return cw * parseFloat(f.getAttribute('data-r')) + (cap ? cap.getBoundingClientRect().height + 12 : 0) + gap;
      });
      figs.forEach(function (f, i) {
        var k = 0;
        for (var j = 1; j < n; j++) if (hs[j] < hs[k] - 2) k = j;
        cols[k].appendChild(f);
        hs[k] += h[i];
      });
    }
    lay();
    window.addEventListener('resize', lay);
  });

  /* 3. The slideshow (ruled October 3, 2026). Choosing a drawing opens it whole and
        large on the page's own ground, and moves on through this page's drawings by
        itself, newest first, round again after the last. Pause, Previous, Next and
        Close; the arrow keys, the space bar and Escape; a swipe on a phone. Each
        drawing holds five seconds and dissolves into the next over a second and a half,
        as the live picture pages' slideshow does; a step by hand dissolves in under half
        a second. Visitors who ask for less motion get no automatic motion and no
        dissolve: the slideshow opens still, Pause is not shown, and they step by hand.
        Without this script a drawing opens whole, at its largest, as before. */
  /* Every Title (October 4, 2026) holds rows, not a wall: choosing a row opens the
     slideshow too, moving through the page in the page's own order. */
  var sets = walls.slice();
  Array.prototype.forEach.call(doc.querySelectorAll('.stamps'), function (list) {
    sets.push({ el: list, figs: Array.prototype.slice.call(list.querySelectorAll('li')) });
  });
  if (!sets.length) return;
  var HOLD = 5000, AUTO_FADE = 1500, HAND_FADE = 400;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function lessMotion() { return !!(still && still.matches); }

  var items = [], label = '';
  sets.forEach(function (w) {
    label = label || w.el.getAttribute('aria-label') || '';
    w.figs.forEach(function (f) {
      var a = f.querySelector('a.tile, a.stamp'), im = f.querySelector('img'), cap = f.querySelector('figcaption') || a;
      if (!a || !im) return;
      /* a row of Every Title shows the small copy; its larger copies wait in data-srcset */
      var ss = a.getAttribute('data-srcset') || im.getAttribute('srcset') || '';
      var it = {
        tile: a,
        srcset: ss,
        src: ss.split(',').pop().trim().split(' ')[0] || im.getAttribute('src'),
        alt: im.getAttribute('alt') || '',
        w: cap ? cap.querySelector('.w').textContent : '',
        n: cap ? cap.querySelector('.n').textContent : ''
      };
      it.index = items.length;
      items.push(it);
      a.addEventListener('click', function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        open(it.index);
      });
    });
  });

  function el(tag, cls, text) { var x = doc.createElement(tag); if (cls) x.className = cls; if (text) x.textContent = text; return x; }
  var box, stage, layers, capW, capN, capBox, measure, bPrev, bPause, bNext, bClose;
  var cur = 0, want = 0, front = 0, playing = false, timer = null, token = 0, opener = null, lastFocus = null;

  function build() {
    box = el('div', 'show');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Slideshow: ' + label);
    box.hidden = true;
    box.tabIndex = -1;
    var top = el('div', 'show-top');
    bClose = el('button', 'show-btn show-close', 'Close'); bClose.type = 'button';
    top.appendChild(bClose);
    stage = el('div', 'show-stage');
    layers = [el('img', 'show-img'), el('img', 'show-img')];
    layers.forEach(function (im) { im.decoding = 'async'; im.alt = ''; stage.appendChild(im); });
    var bar = el('div', 'show-bar');
    capBox = el('p', 'show-cap cap'); capBox.setAttribute('aria-live', 'polite');
    capW = el('span', 'w'); capN = el('span', 'n');
    capBox.appendChild(capW); capBox.appendChild(doc.createTextNode(' ')); capBox.appendChild(capN);
    measure = el('p', 'show-cap cap show-measure'); measure.setAttribute('aria-hidden', 'true');
    var ctl = el('div', 'show-ctl');
    bPrev = el('button', 'show-btn show-prev'); bPrev.type = 'button';
    bPrev.innerHTML = '<span class="arr" aria-hidden="true">&larr;</span> Previous';
    bPause = el('button', 'show-btn show-pause', 'Pause'); bPause.type = 'button';
    bNext = el('button', 'show-btn show-next'); bNext.type = 'button';
    bNext.innerHTML = 'Next <span class="arr" aria-hidden="true">&rarr;</span>';
    ctl.appendChild(bPrev); ctl.appendChild(bPause); ctl.appendChild(bNext);
    bar.appendChild(capBox); bar.appendChild(measure); bar.appendChild(ctl);
    box.appendChild(top); box.appendChild(stage); box.appendChild(bar);
    doc.body.appendChild(box);

    bClose.addEventListener('click', close);
    bPrev.addEventListener('click', function () { step(-1); });
    bNext.addEventListener('click', function () { step(1); });
    bPause.addEventListener('click', function () { setPlaying(!playing); });
    box.addEventListener('keydown', key);
    /* a swipe on a phone: left for the next drawing, right for the one before */
    var sx = 0, sy = 0, st = 0;
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { st = 0; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = 1;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (!st) return; st = 0;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
    }, { passive: true });
    window.addEventListener('resize', function () { if (!box.hidden) fitCaption(); });
  }

  /* The words under the drawing keep one height for the whole page (the tallest), so
     the drawing does not jump as a longer or shorter title comes in. */
  var measuredAt = -1;
  function fitCaption() {
    /* measured once for each width (Every Title holds all 811 words) */
    var cw = capBox.getBoundingClientRect().width;
    if (Math.abs(cw - measuredAt) < 1) return;
    measuredAt = cw;
    var tallest = 0;
    measure.style.width = cw + 'px';
    measure.innerHTML = '<span class="w"></span> <span class="n"></span>';
    var mw = measure.firstChild, mn = measure.lastChild;
    items.forEach(function (it) {
      mw.textContent = it.w; mn.textContent = it.n;
      tallest = Math.max(tallest, measure.getBoundingClientRect().height);
    });
    capBox.style.minHeight = Math.ceil(tallest) + 'px';
  }

  function load(im, it) {
    return new Promise(function (done) {
      im.onload = im.onerror = function () { im.onload = im.onerror = null; done(); };
      im.sizes = '100vw';
      im.srcset = it.srcset;
      im.src = it.src;
      im.alt = it.alt;
      if (im.complete && im.naturalWidth) { im.onload = im.onerror = null; done(); }
    });
  }

  function show(i, fade) {
    var my = ++token, it = items[i], back = 1 - front;
    want = i;   /* steps taken quickly, before a drawing has arrived, count from where they are headed */
    clearTimeout(timer);
    return load(layers[back], it).then(function () {
      if (my !== token) return;
      var d = lessMotion() ? 0 : fade;
      layers[back].style.transitionDuration = d + 'ms';
      layers[front].style.transitionDuration = d + 'ms';
      layers[back].classList.add('on');
      layers[front].classList.remove('on');
      layers[front].removeAttribute('aria-hidden');
      layers[back].removeAttribute('aria-hidden');
      layers[front].setAttribute('aria-hidden', 'true');
      front = back; cur = i;
      capW.textContent = it.w; capN.textContent = it.n;
      if (playing) schedule();
      /* fetch the next drawing ahead, so the dissolve never waits */
      var nx = items[(i + 1) % items.length], pre = new Image();
      pre.sizes = '100vw'; pre.srcset = nx.srcset; pre.src = nx.src;
    });
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(function () { show((want + 1) % items.length, AUTO_FADE); }, HOLD); }
  function step(d) { show((want + d + items.length) % items.length, HAND_FADE); }
  function setPlaying(p) {
    playing = p && !lessMotion();
    bPause.textContent = playing ? 'Pause' : 'Play';
    bPause.setAttribute('aria-label', playing ? 'Pause the slideshow' : 'Play the slideshow');
    if (playing) schedule(); else clearTimeout(timer);
  }

  function open(i) {
    if (!box) build();
    opener = items[i].tile;
    lastFocus = doc.activeElement;
    box.classList.toggle('still', lessMotion());
    layers.forEach(function (im) { im.classList.remove('on'); im.style.transitionDuration = '0ms'; });
    box.hidden = false;
    doc.documentElement.classList.add('show-open');
    fitCaption();
    playing = !lessMotion();
    bPause.hidden = lessMotion();
    bPause.textContent = 'Pause';
    bPause.setAttribute('aria-label', 'Pause the slideshow');
    show(i, 0);
    box.focus({ preventScroll: true });
  }
  function close() {
    token++;
    clearTimeout(timer);
    playing = false;
    box.hidden = true;
    doc.documentElement.classList.remove('show-open');
    var back = items[cur] && items[cur].tile;
    (back || opener || lastFocus || doc.body).focus({ preventScroll: false });
  }
  function key(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if ((e.key === ' ' || e.key === 'Spacebar') && !lessMotion() && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === 'Tab') {
      /* keep the keyboard inside the slideshow while it is open */
      var f = [bClose, bPrev, bPause, bNext].filter(function (b) { return !b.hidden; });
      var at = f.indexOf(doc.activeElement);
      if (at < 0) { e.preventDefault(); (e.shiftKey ? f[f.length - 1] : f[0]).focus(); }
      else if (e.shiftKey && at === 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && at === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  }
  if (still && still.addEventListener) still.addEventListener('change', function () { if (box && !box.hidden) { bPause.hidden = lessMotion(); setPlaying(!lessMotion()); } });
})();
