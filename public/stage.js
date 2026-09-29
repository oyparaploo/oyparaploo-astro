(function () {
  var html = document.documentElement;
  var params = new URLSearchParams(location.search);

  /* Text size: three steps, remembered in the visitor's browser (part of the page) */
  function setSize(n) {
    html.classList.remove('size-1', 'size-2', 'size-3');
    html.classList.add('size-' + n);
    var b = document.querySelectorAll('.wp-size button');
    for (var i = 0; i < b.length; i++) b[i].setAttribute('aria-pressed', b[i].getAttribute('data-size') === String(n) ? 'true' : 'false');
    try { localStorage.setItem('textSize', String(n)); } catch (e) {}
  }
  var savedSize = 1;
  try { var sv = localStorage.getItem('textSize'); if (sv === '2' || sv === '3') savedSize = +sv; } catch (e) {}
  setSize(savedSize);
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('.wp-size button') : null;
    if (t) setSize(+t.getAttribute('data-size'));
  });

  /* ======================================================================
     THE STAGE (part of the page)
     ====================================================================== */
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if ((mq && mq.matches) || params.get('rm') === '1') html.classList.add('rm');
  function motionOff() { return html.classList.contains('rm'); }

  var bg = document.querySelector('.stage-bg');
  if (!bg) return;
  var haze = bg.querySelector('.stage-haze');
  var pic = bg.querySelector('.stage-pic');
  var ghost = document.querySelector('.stage-ghost');
  var DEPTH = { near: { w: 300, s: 0.85 }, middle: { w: 240, s: 0.70 }, far: { w: 180, s: 0.55 } };
  var art = null, stage, words, sheet, reading, floatsBox, one, chosen = null;
  var floats = [], W = 0, VH = 0, H = 0, readingTop = 0;

  function big(src) { return src.replace(/-600\.webp$/, '.webp'); }
  function catLabel(c) { return /^\d{5}$/.test(c) ? 'Cat. ' + c : c; }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* Fresh every visit: the background and floating pictures come from the
     fifteen of the writing's twenty that are not in the foot row; never the
     same background twice in a row for the same visitor. */
  function pick(key, pool) {
    var order = shuffle(pool.slice(5));
    var last = null;
    try { last = localStorage.getItem('paraploo-stage:' + key); } catch (e) {}
    if (order.length > 1 && order[0].s === last) order.push(order.shift());
    try { localStorage.setItem('paraploo-stage:' + key, order[0].s); } catch (e) {}
    return { bg: order[0], rest: order.slice(1) };
  }

  function setImg(img, src, fallback) {
    img.classList.remove('is-in');
    img.onload = function () { img.classList.add('is-in'); };
    img.onerror = function () { if (fallback) { var f = fallback; fallback = null; img.src = f; } };
    img.src = src;
  }

  function layout() {
    if (!art || !chosen) return;
    W = document.documentElement.clientWidth;
    VH = window.innerHeight;
    var phone = W < 768;
    var T = stage.getBoundingClientRect().top + window.pageYOffset;
    H = Math.max(420, Math.round(VH - T - (phone ? 40 : 48)));
    stage.style.setProperty('--stage-h', H + 'px');

    /* The veil reaches 80% 32 pixels above the words */
    var wTop = words.offsetTop;
    var vs = Math.max(0, Math.min(100, (wTop - 32) / H * 100));
    stage.style.setProperty('--vs', vs.toFixed(2) + '%');
    html.style.setProperty('--stage-bottom', (T + H) + 'px');

    /* The whole picture, never cropped */
    var r = chosen.bg.w / chosen.bg.ht, pw, ph, top;
    if (!phone) {
      ph = H; pw = ph * r;
      if (pw > W) { pw = W; ph = pw / r; }
      top = T + (H - ph) / 2;
    } else {
      pw = W; ph = pw / r;
      if (ph > H * 0.6) { ph = H * 0.6; pw = ph * r; }
      top = T + Math.max(16, (wTop - 24 - ph) / 2);
    }
    var vr = vs - 28;
    if (phone) vr = Math.min(vs - 4, Math.max(vr, (top - T + ph) / H * 100));
    stage.style.setProperty('--vr', vr.toFixed(2) + '%');
    pic.style.cssText = 'left:' + ((W - pw) / 2).toFixed(1) + 'px;top:' + top.toFixed(1) +
      'px;width:' + pw.toFixed(1) + 'px;height:' + ph.toFixed(1) + 'px';

    placeFloats();
  }

  function placeFloats() {
    if (!art || !chosen) return;
    floatsBox.innerHTML = '';
    floats = [];
    readingTop = reading.getBoundingClientRect().top + window.pageYOffset;
    var wide = W >= 1200;
    one.hidden = wide;
    if (wide) {
      var sheetW = sheet.offsetWidth;
      var margin = (W - sheetW) / 2;
      var f = Math.min(1, (margin - 32) / 300);
      var hgt = sheet.offsetHeight;
      var n = Math.max(1, Math.min(3, Math.floor(hgt / 1000)));
      var order = n === 1 ? ['near'] : n === 2 ? ['near', 'far'] : ['near', 'far', 'middle'];
      for (var i = 0; i < n && i < chosen.rest.length; i++) {
        var p = chosen.rest[i], d = DEPTH[order[i]];
        var w = Math.round(d.w * f), h = Math.round(w * p.ht / p.w);
        var right = i % 2 === 0;
        var x = right ? (W + sheetW) / 2 + (margin - w) / 2 : (margin - w) / 2;
        var y = Math.round(hgt * (i + 0.5) / n - h / 2);
        var a = document.createElement('a');
        a.className = 'wp-float ' + order[i];
        a.href = p.h;
        a.setAttribute('aria-label', catLabel(p.c));
        a.style.cssText = 'left:' + x.toFixed(1) + 'px;top:' + y + 'px;width:' + w + 'px';
        var img = document.createElement('img');
        img.alt = ''; img.width = p.w; img.height = p.ht; img.decoding = 'async'; img.src = p.s;
        a.appendChild(img);
        floatsBox.appendChild(a);
        floats.push({ el: a, c: y + h / 2, s: d.s });
      }
    }
    tick();
  }

  var ticking = false;
  function tick() {
    ticking = false;
    if (!art) return;
    var y = window.pageYOffset;
    if (motionOff()) {
      for (var j = 0; j < floats.length; j++) floats[j].el.style.transform = '';
      return;
    }
    ghost.style.opacity = (0.75 * Math.max(0, Math.min(1, y / (H * 0.8)))).toFixed(3);
    for (var i = 0; i < floats.length; i++) {
      var fl = floats[i];
      var t = (1 - fl.s) * (y + VH / 2 - (readingTop + fl.c));
      fl.el.style.transform = 'translate3d(0,' + t.toFixed(1) + 'px,0)';
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }, { passive: true });

  var lastW = 0, lastH = 0;
  window.addEventListener('resize', function () {
    var w = document.documentElement.clientWidth, h = window.innerHeight;
    if (w !== lastW || Math.abs(h - lastH) > 120) { lastW = w; lastH = h; layout(); }
  });

  var ro = window.ResizeObserver ? new ResizeObserver(function () { placeFloats(); }) : null;

  function stageFor(a, key) {
    if (ro && sheet) ro.unobserve(sheet);
    art = a;
    stage = a.querySelector('.stage');
    words = a.querySelector('.stage-words');
    sheet = a.querySelector('.wp-sheet');
    reading = a.querySelector('.wp-reading');
    floatsBox = a.querySelector('.wp-floats');
    one = a.querySelector('.wp-one');
    var poolTag = a.querySelector('.stage-pool');
    var pool = poolTag ? JSON.parse(poolTag.textContent) : [];
    if (!pool.length) return;
    chosen = pick(key, pool);

    setImg(haze, chosen.bg.s);
    setImg(pic, big(chosen.bg.s), chosen.bg.s);
    var c = a.querySelector('.stage-cat');
    if (c) {
      c.href = chosen.bg.h;
      c.textContent = catLabel(chosen.bg.c);
    }

    if (chosen.rest[0] && one) {
      var p1 = chosen.rest[0], oi = one.querySelector('img');
      one.href = p1.h;
      one.setAttribute('aria-label', catLabel(p1.c));
      oi.width = p1.w; oi.height = p1.ht; oi.src = p1.s;
    }

    lastW = document.documentElement.clientWidth; lastH = window.innerHeight;
    layout();
    if (ro) ro.observe(sheet);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); });

  function init() {
    var a = document.querySelector('article.wp');
    if (a) stageFor(a, 'writing:' + location.pathname);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
