/* The Collage page, a design room: the turning cylinder (from HTML DOCS\BRANDING_1.html, the cylinder version only)
   and the picture beside the rows. Visitors who ask for less motion get none: the cylinder stands still and turns
   only under their own hand, and nothing fades. */
(function () {
  var room = document.querySelector('.collage-room');
  if (!room) return;
  room.classList.add('c-js');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================ 1. the cylinder */
  var band = room.querySelector('.c-turn');
  var seats = [].slice.call(band.querySelectorAll('.c-seat'));
  var marker = band.querySelector('.c-marker');
  var markerNum = band.querySelector('.c-marker-num');
  var cap = band.querySelector('.c-open-cap');
  var capNum = band.querySelector('.c-open-num');
  var capGallery = band.querySelector('.c-open-gallery');
  var closeBtn = band.querySelector('.c-close');
  var N = seats.length;                         // eighteen: three rings of six
  var R = 440, TILT = 18 * Math.PI / 180, D = 1400;   // the draft's own numbers
  var PHONE = 1.7;                              // on a phone the pictures shrink less than the cylinder
  var SEAT_H = 220, SEAT_W = 360;              // one height for every picture, so the three rings read as rings; each keeps its own shape
  var AUTO = 0.0042;                            // degrees per millisecond: one turn in about a minute and a half
  var angle = 0, target = 0, fit = 1, seatFit = 1, cx = 0, cy = 0, W = 0, H = 0;
  var hoverIndex = -1, hoverScales = seats.map(function () { return 1; });
  var openIndex = null, morphing = false, inView = true, pointerIn = false, last = 0, frontIndex = -1;

  seats.forEach(function (s) {
    var w = +s.getAttribute('data-w'), h = +s.getAttribute('data-h'), k = Math.min(SEAT_H / h, SEAT_W / w);
    s._w = Math.round(w * k); s._h = Math.round(h * k);
  });
  /* How far the turning cylinder reaches above and below its centre, over a whole turn (at full size). */
  var REACH = (function () {
    var lo = Infinity, hi = -Infinity, wide = 0, wide2 = 0;
    for (var A = 0; A < 360; A += 4) {
      var pts = points(A);
      for (var i = 0; i < N; i++) {
        var k = D / (D - pts[i].z), sc = 0.63 * k;
        lo = Math.min(lo, k * pts[i].y - seats[i]._h / 2 * sc); hi = Math.max(hi, k * pts[i].y + seats[i]._h / 2 * sc);
        wide = Math.max(wide, Math.abs(k * pts[i].x) + seats[i]._w / 2 * sc);
        wide2 = Math.max(wide2, Math.abs(k * pts[i].x) + PHONE * seats[i]._w / 2 * sc);
      }
    }
    return { lo: lo, hi: hi, wide: wide, wide2: wide2 };
  })();

  function points(A) {
    var pts = new Array(N);
    for (var row = 0; row < 3; row++) {
      var yBase = -260 + row * 260;
      for (var c = 0; c < 6; c++) {
        var idx = row * 6 + c;
        var th = (c * 60 + row * 20 + A) * Math.PI / 180;
        var x = R * Math.sin(th), z0 = R * Math.cos(th);
        pts[idx] = { x: x, y: yBase * Math.cos(TILT) - z0 * Math.sin(TILT), z: yBase * Math.sin(TILT) + z0 * Math.cos(TILT) };
      }
    }
    return pts;
  }
  function project(pt) {
    var k = D / (D - pt.z);
    var o = 0.35 + 0.65 * (pt.z + R) / (2 * R);
    return { x: k * pt.x * fit, y: k * pt.y * fit, s: 0.63 * k * seatFit, o: Math.max(0.35, Math.min(1, o)), z: Math.round(1000 + pt.z) };
  }
  function layout() {
    W = band.clientWidth;
    var head = band.querySelector('.c-head');
    var narrow = W < 700;
    var ceil = !head ? 32 : narrow ? head.offsetTop + head.offsetHeight + 8   // on a phone the word stays whole
                                   : head.offsetTop + 4;                      // the top ring may cross the whole word
    var span = REACH.hi - REACH.lo;
    if (narrow) {
      /* On a phone the width decides: the cylinder shrinks to the window, its pictures less than it, and the band
         takes the height the cylinder needs. */
      fit = Math.min(1, (W / 2 - 6) / REACH.wide2);           // every picture stays whole inside the band
      seatFit = Math.min(1, fit * PHONE);
      band.style.height = Math.round(Math.max(440, Math.min(640, ceil + span * fit * 1.2 + 84))) + 'px';
    } else {
      band.style.height = '';
    }
    H = band.clientHeight;
    var floor = H - 66;                                        // the two captions sit under the cylinder
    if (!narrow) {
      fit = Math.min(1, (W / 2 - 12) / REACH.wide, (floor - ceil) / span);
      seatFit = fit;
    }
    cx = W / 2;
    cy = ceil - REACH.lo * fit + Math.max(0, (floor - ceil) - span * fit) / 2;
    seats.forEach(function (s, i) {
      if (i === openIndex) return;
      s.style.width = s._w + 'px'; s.style.height = s._h + 'px';
    });
    if (openIndex !== null) place(openIndex, false);
  }
  function seatTransform(s, p, extra) {
    return 'translate(' + (cx + p.x - s._w / 2).toFixed(1) + 'px,' + (cy + p.y - s._h / 2).toFixed(1) + 'px) scale(' + (p.s * (extra || 1)).toFixed(4) + ')';
  }
  function draw() {
    var pts = points(angle), maxZ = -Infinity, fi = 0, fp = null;
    for (var i = 0; i < N; i++) {
      var s = seats[i], p = project(pts[i]);
      var want = hoverIndex === i ? 1.04 : 1;
      hoverScales[i] += (want - hoverScales[i]) * (still ? 1 : 0.18);
      s.style.transform = seatTransform(s, p, hoverScales[i]);
      s.style.opacity = p.o;
      s.style.zIndex = p.z;
      if (pts[i].z > maxZ) { maxZ = pts[i].z; fi = i; fp = p; }
    }
    if (fp) {
      var bottom = cy + fp.y + (seats[fi]._h / 2) * fp.s;
      marker.style.transform = 'translate(' + (cx + fp.x).toFixed(1) + 'px,' + (bottom + 14).toFixed(1) + 'px) translateX(-50%)';
      if (fi !== frontIndex) { frontIndex = fi; markerNum.textContent = seats[fi].getAttribute('data-n'); }
      marker.classList.add('is-on');
    }
  }
  function frame(t) {
    var dt = last ? Math.min(64, t - last) : 16; last = t;
    if (openIndex === null && !morphing) {
      if (!still && !pointerIn && !dragging) target += AUTO * dt;
      angle += (target - angle) * (still ? 1 : 0.08);
      draw();
    }
    if (inView && !document.hidden) requestAnimationFrame(frame); else last = 0, running = false;
  }
  var running = false;
  function run() { if (!running && inView && !document.hidden) { running = true; requestAnimationFrame(frame); } }

  layout(); draw();
  window.addEventListener('resize', function () { layout(); if (openIndex === null) draw(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; run(); }).observe(band);
  }
  document.addEventListener('visibilitychange', run);
  run();

  /* It turns further as the page is scrolled, while the band is in sight; the wheel scrolls the page as always. */
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (!still && inView && openIndex === null) target += (y - lastY) * 0.12;
    lastY = y;
  }, { passive: true });

  band.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pointerIn = true; });
  band.addEventListener('pointerleave', function () { pointerIn = false; hoverIndex = -1; });

  /* A hand or a finger turns it: drag sideways. A press that does not travel is a choice. */
  var dragging = false, downX = 0, downAngle = 0, moved = false, downId = null;
  band.addEventListener('pointerdown', function (e) {
    if (openIndex !== null || e.button > 0) return;
    if (e.target.closest('.c-caps, .c-open-cap, .c-close')) return;
    downId = e.pointerId; downX = e.clientX; downAngle = target; moved = false;
  });
  band.addEventListener('pointermove', function (e) {
    if (downId !== e.pointerId) return;
    var dx = e.clientX - downX;
    if (!moved && Math.abs(dx) > 6) { moved = true; dragging = true; band.classList.add('is-dragging'); try { band.setPointerCapture(e.pointerId); } catch (_) {} }
    if (moved) { target = downAngle + dx * 0.32 / Math.max(fit, 0.4); if (still) { angle = target; draw(); } }
  });
  function up(e) {
    if (downId !== e.pointerId) return;
    downId = null; band.classList.remove('is-dragging');
    if (dragging) setTimeout(function () { dragging = false; }, 0);
  }
  band.addEventListener('pointerup', up);
  band.addEventListener('pointercancel', up);

  seats.forEach(function (s, i) {
    s.addEventListener('mouseenter', function () { if (openIndex === null) hoverIndex = i; });
    s.addEventListener('mouseleave', function () { if (hoverIndex === i) hoverIndex = -1; });
    s.addEventListener('click', function (e) {
      if (moved || dragging) { e.preventDefault(); moved = false; return; }
      if (openIndex === i) return;                 // chosen again: its own page opens
      e.preventDefault();
      if (openIndex !== null) closeSeat(true);
      openSeat(i);
    });
    /* With the keyboard, the picture with focus turns to the front. */
    s.addEventListener('focus', function () {
      if (openIndex !== null) return;
      var row = Math.floor(i / 6), c = i % 6;
      var want = -(c * 60 + row * 20);
      target = want + 360 * Math.round((target - want) / 360);
      if (still) { angle = target; draw(); }
    });
  });

  function openBox(i) {
    var s = seats[i], w = +s.getAttribute('data-w'), h = +s.getAttribute('data-h');
    var narrow = W < 700;
    var maxW = narrow ? W - 48 : Math.min(620, W * 0.44);
    var maxH = narrow ? H * 0.56 : H * 0.62;
    var k = Math.min(maxW / w, maxH / h);
    var bw = Math.round(w * k), bh = Math.round(h * k);
    var x = narrow ? W / 2 : W * 0.66, y = narrow ? H * 0.5 : H * 0.55;
    return { w: bw, h: bh, l: Math.round(x - bw / 2), t: Math.round(y - bh / 2) };
  }
  function place(i, animate) {
    var s = seats[i], b = openBox(i);
    s.style.transition = animate && !still ? 'transform 600ms ease, opacity 600ms ease, width 600ms ease, height 600ms ease' : '';
    s.style.width = b.w + 'px'; s.style.height = b.h + 'px';
    s.style.transform = 'translate(' + b.l + 'px,' + b.t + 'px) scale(1)';
    s.style.opacity = 1; s.style.zIndex = 5000;
    var narrow = W < 700;
    if (narrow) {
      cap.style.left = b.l + 'px'; cap.style.top = (b.t + b.h + 12) + 'px';
      closeBtn.style.left = (b.l + b.w - 48) + 'px'; closeBtn.style.top = (b.t - 54) + 'px';
    } else {
      cap.style.left = b.l + 'px'; cap.style.top = (b.t + b.h + 12) + 'px';
      closeBtn.style.left = (b.l + b.w + 8) + 'px'; closeBtn.style.top = (b.t - 8) + 'px';
    }
  }
  function openSeat(i) {
    openIndex = i; hoverIndex = -1;
    var s = seats[i], img = s.querySelector('img');
    if (!img.getAttribute('srcset')) {            // the large file for a sharp picture
      img.setAttribute('sizes', Math.round(openBox(i).w) + 'px');
      img.setAttribute('srcset', img.getAttribute('src') + ' 600w, ' + s.getAttribute('data-full') + ' ' + s.getAttribute('data-w') + 'w');
    }
    seats.forEach(function (o, j) {
      if (j === i) return;
      o.style.transition = still ? '' : 'opacity 600ms ease';
      o.style.opacity = 0.15;
    });
    place(i, true);
    capNum.textContent = s.getAttribute('data-n');
    capNum.setAttribute('href', s.getAttribute('href'));
    capGallery.innerHTML = '';
    capGallery.appendChild(document.createTextNode(s.getAttribute('data-gallery') + ' '));
    var a = document.createElement('span'); a.className = 'c-arr'; a.setAttribute('aria-hidden', 'true'); a.textContent = '→';
    capGallery.appendChild(a);
    capGallery.setAttribute('href', s.getAttribute('data-gallery-href'));
    cap.classList.add('is-on'); closeBtn.classList.add('is-on');
    marker.classList.remove('is-on');
    band.classList.add('is-open');
  }
  function closeSeat(quick) {
    var i = openIndex; if (i === null) return;
    openIndex = null;
    cap.classList.remove('is-on'); closeBtn.classList.remove('is-on');
    band.classList.remove('is-open');
    var s = seats[i], pts = points(angle);
    var t = still || quick ? '' : 'transform 600ms ease, opacity 600ms ease, width 600ms ease, height 600ms ease';
    seats.forEach(function (o) { o.style.transition = t; });
    s.style.width = s._w + 'px'; s.style.height = s._h + 'px';
    morphing = !still && !quick;
    pts.forEach(function (pt, j) {
      var p = project(pt), o = seats[j];
      o.style.transform = seatTransform(o, p, 1); o.style.opacity = p.o; o.style.zIndex = p.z;
    });
    setTimeout(function () { seats.forEach(function (o) { o.style.transition = ''; }); morphing = false; run(); }, still || quick ? 0 : 620);
  }
  closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeSeat(); });
  document.addEventListener('click', function (e) {
    if (openIndex === null) return;
    if (e.target.closest('.c-seat, .c-open-cap, .c-close')) return;
    closeSeat();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openIndex !== null) { var s = seats[openIndex]; closeSeat(); s.focus({ preventScroll: true }); } });

  /* ================================================================ 2. the picture beside the rows */
  var wide = window.matchMedia('(min-width: 1000px)');
  var kinds = [].slice.call(room.querySelectorAll('.c-kind')).map(function (k) {
    return { el: k, rows: [].slice.call(k.querySelectorAll('.c-row')), show: k.querySelector('.c-show'), cur: null };
  });
  var lastPoint = 0;

  function setCurrent(K, row) {
    if (!K.show || K.cur === row) return;
    if (K.cur) K.cur.classList.remove('is-current');
    K.cur = row; row.classList.add('is-current');
    var src = row.querySelector('.c-pic img');
    var img = K.show.querySelector('.c-show-pic img');
    var link = K.show.querySelector('.c-show-pic');
    link.setAttribute('href', row.getAttribute('href'));
    K.show.querySelector('.c-show-name').textContent = row.querySelector('.c-name').textContent;
    K.show.querySelector('.c-show-count').textContent = row.querySelector('.c-count').textContent.trim();
    var s = src.getAttribute('src'), ss = src.getAttribute('srcset');
    if (img.getAttribute('src') === s) return;
    img.classList.remove('is-in');
    var swap = function () {
      if (ss) { img.setAttribute('srcset', ss); img.setAttribute('sizes', '600px'); } else { img.removeAttribute('srcset'); img.removeAttribute('sizes'); }
      img.setAttribute('width', src.getAttribute('width')); img.setAttribute('height', src.getAttribute('height'));
      img.onload = function () { if (K.cur === row) img.classList.add('is-in'); };
      img.setAttribute('src', s);
      if (img.complete && img.naturalWidth) img.classList.add('is-in');
    };
    if (still) swap(); else setTimeout(swap, img.getAttribute('src') ? 120 : 0);
  }
  kinds.forEach(function (K) {
    if (!K.rows.length) return;
    K.rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () { lastPoint = Date.now(); if (wide.matches) setCurrent(K, row); });
      row.addEventListener('focus', function () { if (wide.matches) setCurrent(K, row); });
    });
  });
  function follow() {
    if (!wide.matches || Date.now() - lastPoint < 1200) return;
    var line = window.innerHeight * 0.45;
    kinds.forEach(function (K) {
      var r = K.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var best = null, bd = Infinity;
      K.rows.forEach(function (row) {
        var b = row.getBoundingClientRect(), d = b.top <= line && b.bottom >= line ? 0 : Math.min(Math.abs(b.top - line), Math.abs(b.bottom - line));
        if (d < bd) { bd = d; best = row; }
      });
      if (best) setCurrent(K, best);
    });
  }
  function startStages() {
    if (!wide.matches) return;
    kinds.forEach(function (K) { if (K.rows.length && !K.cur) setCurrent(K, K.rows[0]); });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; follow(); });
  }, { passive: true });
  if (wide.addEventListener) wide.addEventListener('change', startStages);
  startStages();
})();
