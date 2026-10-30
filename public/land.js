/* Land Of Pictures ... (the preview Reach called perfect, October 30, 2026; on the site since its build).
   The browser computes no likeness: every place comes from land-positions.json, written once by
   working files\make-land.py. This script only draws the land and answers the hand.
   Nothing moves until the visitor acts.
   One size only (Reach, October 30, 2026): postage-stamp thumbnails, about 85 pixels on their long side on a
   desktop and 64 on phones, that never change size. The wheel moves the land; nothing zooms. */
(function () {
  'use strict';
  var DATA = window.LAND_POSITIONS;
  if (!DATA) return;

  var LIVE = window.PARAPLOO_BASE || '';
  var SMALL = 'https://media.paraploo.com/site/images/land/small/';   // picture storage: each picture's small copy
  var DESK = 85;               // a thumbnail's long side on a desktop, in pixels ("a really good thumbnail size")
  var PHONE = 64;              // and on phones
  var AIR = 54 / 48;           // one cell is the picture and its air: 48 of picture, 6 of air, as before
  var EDGE = 24;               // the land comes to rest this far from the edge of its window
  var SLIDE_MS = 500;
  var GROW = 432;              // pointed at, a picture shows at about 432 pixels on its long side (October 30, 2026)
  var GROW_PAD = 16;           // it stays this far inside the land and the window
  var GROW_GAP = 8;            // and this far beyond the clear area around the thumbnail pointed at
  var LABEL_GAP = 8, LABEL_H = 28;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var coarse = window.matchMedia('(pointer: coarse)');

  var land = document.querySelector('.land');
  var plane = land.querySelector('.land-plane');
  var label = land.querySelector('.land-label');
  var row = document.querySelector('.land-places');

  /* the land scrolls inside its frame with real scroll bars (October 30, 2026): the plane sits in a sizer inside
     a scrolling window; the view (tx, ty) and the scroll position are one and the same */
  var scroller = document.createElement('div');
  scroller.className = 'land-scroll';
  scroller.tabIndex = -1;                 /* the land itself keeps the keyboard */
  var sizer = document.createElement('div');
  sizer.className = 'land-sizer';
  land.insertBefore(scroller, plane);
  sizer.appendChild(plane);
  scroller.appendChild(sizer);
  land.setAttribute('aria-label', 'The land of pictures. Drag or scroll to travel; arrow keys move the land, and 0 returns to the middle.');

  /* the picture pointed at, shown large right beside the clear area around the thumbnail; the hand passes
     through it, so it never stands in the way of choosing */
  var grow = document.createElement('div');
  grow.className = 'land-grow';
  grow.setAttribute('aria-hidden', 'true');
  var growImg = document.createElement('img');
  growImg.alt = '';
  growImg.setAttribute('draggable', 'false');
  grow.appendChild(growImg);
  land.insertBefore(grow, label);

  /* ---- the pictures, in reading order so the keyboard walks the land row by row ---- */
  var pics = DATA.pictures.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; });
  var frag = document.createDocumentFragment();
  pics.forEach(function (p) {
    p.page = p.h;                 // the picture's own page on the site
    var a = document.createElement('a');
    a.className = 'pic';
    a.href = LIVE + p.page;
    a.setAttribute('draggable', 'false');
    a.setAttribute('aria-label', p.n + ', ' + DATA.places[p.p].name);
    var img = document.createElement('img');
    img.src = SMALL + p.n + '.webp';
    img.alt = '';
    img.decoding = 'async';
    img.setAttribute('draggable', 'false');
    a.appendChild(img);
    a._p = p; p.el = a; p.img = img;
    frag.appendChild(a);
  });
  plane.appendChild(frag);

  /* ---- one size: every thumbnail laid out at its own pixels, so nothing is ever scaled ---- */
  var P = 0, C = 0, W = 0, H = 0;
  function layout(size) {
    if (size === P) return;
    P = size; C = P * AIR;
    W = Math.round(DATA.cols * C); H = Math.round(DATA.rows * C);
    plane.style.width = W + 'px';
    plane.style.height = H + 'px';
    pics.forEach(function (p) {
      var w = p.a >= 1 ? P : P * p.a;
      var h = p.a >= 1 ? P / p.a : P;
      p.w = w; p.ht = h;
      p.left = p.x * C + (C - w) / 2;
      p.top = p.y * C + (C - h) / 2;
      p.el.style.cssText = 'left:' + p.left.toFixed(1) + 'px;top:' + p.top.toFixed(1) + 'px;width:' +
        w.toFixed(1) + 'px;height:' + h.toFixed(1) + 'px';
    });
  }

  /* ---- the row of places ---- */
  DATA.places.forEach(function (pl, i) {
    if (pl.row === false) return;         /* in the land, not in the row (Reach, October 30, 2026) */
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = pl.name;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { goTo(i, b); });
    row.appendChild(b);
  });
  /* the row wraps onto as many lines as it needs (October 30, 2026): every name in view, nothing slides */

  function clearPlace() {
    var on = row.querySelector('[aria-pressed="true"]');
    if (on) on.setAttribute('aria-pressed', 'false');
  }

  /* ---- the view: where the land's top-left corner sits in its window (tx, ty) ---- */
  var vw = 0, vh = 0, tx = 0, ty = 0;

  function isPhone() { return coarse.matches && window.innerWidth < 700; }

  function measure() {
    var top = land.getBoundingClientRect().top + window.scrollY;
    var h = Math.max(360, window.innerHeight - top - EDGE);
    /* phones: the opening now runs long (the sentence, and the names on as many lines as they need), so the
       land takes most of the window once it is scrolled to, leaving room for the tapped picture (October 30, 2026) */
    if (isPhone()) h = Math.max(h, Math.round(window.innerHeight * 0.85));
    land.style.height = h + 'px';
    layout(isPhone() ? PHONE : DESK);
    vw = scroller.clientWidth; vh = scroller.clientHeight; sizeSizer();
    vw = scroller.clientWidth; vh = scroller.clientHeight; sizeSizer();   /* again, once the bars have their room */
  }

  /* the sizer holds the land with EDGE pixels of ground round it (more if a side fits, so it is centred) */
  var ox = EDGE, oy = EDGE;
  function sizeSizer() {
    ox = Math.max(EDGE, (vw - W) / 2); oy = Math.max(EDGE, (vh - H) / 2);
    /* and enough ground round the land that every place in the row can be brought to the middle of the frame
       (October 30, 2026: the places at the land's left edge could not be centred) */
    DATA.places.forEach(function (pl) {
      if (pl.row === false) return;
      var cx = (pl.x + 0.5) * C, cy = (pl.y + 0.5) * C;
      ox = Math.max(ox, vw / 2 - cx, cx + vw / 2 - W);
      oy = Math.max(oy, vh / 2 - cy, cy + vh / 2 - H);
    });
    ox = Math.ceil(ox); oy = Math.ceil(oy);
    sizer.style.width = (W + 2 * ox) + 'px'; sizer.style.height = (H + 2 * oy) + 'px';
    plane.style.left = ox + 'px'; plane.style.top = oy + 'px';
  }

  /* the land travels until its edge comes to rest EDGE pixels inside the window; a side that fits is centred */
  function clampView() {
    if (W <= vw - 2 * ox) tx = (vw - W) / 2;
    else tx = Math.min(ox, Math.max(vw - W - ox, tx));
    if (H <= vh - 2 * oy) ty = (vh - H) / 2;
    else ty = Math.min(oy, Math.max(vh - H - oy, ty));
  }

  var frame = 0, rehoverAt = null;
  function draw() {
    frame = 0;
    scroller.scrollLeft = ox - tx; scroller.scrollTop = oy - ty;
    if (rehoverAt) {
      /* the land moved under a resting hand: the picture now under it is the one pointed at */
      var t = document.elementFromPoint(rehoverAt.x, rehoverAt.y);
      t = t && t.closest ? t.closest('.pic') : null;
      rehoverAt = null;
      lift(t && land.contains(t) ? t._p : null);
    }
    placeLabel();
  }
  function redraw() { if (!frame) frame = requestAnimationFrame(draw); }

  /* the scroll bars moved the land (or the browser did, to show a picture the keyboard reached): the view
     follows the scroll position */
  scroller.addEventListener('scroll', function () {
    var sx = ox - scroller.scrollLeft, sy = oy - scroller.scrollTop;
    if (Math.abs(sx - tx) < 1.5 && Math.abs(sy - ty) < 1.5) return;   /* our own move */
    tx = sx; ty = sy;
    clearPlace();
    placeLabel();
  }, { passive: true });

  /* a press on a scroll bar belongs to the bar, not to the hand that drags the land */
  function onBar(e) {
    var r = scroller.getBoundingClientRect();
    return e.clientX - r.left >= scroller.clientWidth || e.clientY - r.top >= scroller.clientHeight;
  }

  /* the opening view: the land's middle in the middle of its window */
  function arrive() {
    measure();
    tx = (vw - W) / 2; ty = (vh - H) / 2;
    clampView(); draw();
  }

  /* ---- the label: the catalogue number under the picture pointed at ---- */
  var up = null;
  function lift(p) {
    if (up === p) return;
    if (up) up.el.classList.remove('is-up');
    up = p;
    if (p) { p.el.classList.add('is-up'); label.textContent = p.n; }
    placeLabel();
  }
  function hideGrow() {
    grow.classList.remove('is-on');
    grow._p = null;
  }
  function placeLabel() {
    if (!up) { label.classList.remove('is-on'); hideGrow(); return; }
    var p = up;
    var sx = tx + p.left, sy = ty + p.top, sw = p.w, sh = p.ht;
    var cx = sx + sw / 2, cy = sy + sh / 2;

    /* the part of the land that shows in the window */
    var r = land.getBoundingClientRect();
    var bx0 = Math.max(0, -r.left) + GROW_PAD, by0 = Math.max(0, -r.top) + GROW_PAD;
    var bx1 = Math.min(vw, window.innerWidth - r.left) - GROW_PAD;
    var by1 = Math.min(vh, window.innerHeight - r.top) - GROW_PAD;

    /* a round area about four rows tall around the thumbnail stays clear, so its nearest neighbours stay easy
       to choose; the large picture sits right beside that area: to the right where it fits, else the left,
       else below or above (a phone); it moves with the pointer as the hand travels the grid */
    var R = Math.max((coarse.matches ? 1 : 2) * C, Math.max(sw, sh) / 2 + 12);   /* a phone keeps one row clear each way */
    var maxK = GROW / Math.max(p.w, p.ht);
    var sides = [
      { name: 'right', w: bx1 - (cx + R + GROW_GAP), h: by1 - by0 - LABEL_GAP - LABEL_H },
      { name: 'left',  w: (cx - R - GROW_GAP) - bx0, h: by1 - by0 - LABEL_GAP - LABEL_H },
      { name: 'below', w: bx1 - bx0, h: by1 - (cy + R + GROW_GAP) - LABEL_GAP - LABEL_H },
      { name: 'above', w: bx1 - bx0, h: (cy - R - GROW_GAP) - by0 - LABEL_GAP - LABEL_H }
    ];
    var best = null;
    sides.forEach(function (sd) {
      sd.k = Math.min(maxK, sd.w / p.w, sd.h / p.ht);
      if (!best || (sd.k >= maxK - 1e-6 && best.k < maxK - 1e-6) || (best.k < maxK - 1e-6 && sd.k > best.k)) best = sd;
    });
    var k = Math.max(0, best.k);
    var gw = p.w * k, gh = p.ht * k, needH = gh + LABEL_GAP + LABEL_H, gx, gy;
    if (best.name === 'right' || best.name === 'left') {
      gx = best.name === 'right' ? cx + R + GROW_GAP : cx - R - GROW_GAP - gw;
      gy = Math.max(by0, Math.min(by1 - needH, cy - gh / 2));
    } else {
      gx = Math.max(bx0, Math.min(bx1 - gw, cx - gw / 2));
      gy = best.name === 'below' ? cy + R + GROW_GAP : cy - R - GROW_GAP - needH;
    }

    if (grow._p !== p) {
      /* the small copy shows at once; the larger copy takes its place as soon as it arrives */
      grow._p = p;
      var want = p.l;
      growImg.src = p.img.src;
      var im = new Image();
      im.onload = function () { if (grow._p === p) growImg.src = want; };
      im.src = want;
    }
    grow.style.left = gx + 'px'; grow.style.top = gy + 'px';
    grow.style.width = gw + 'px'; grow.style.height = gh + 'px';
    grow.classList.add('is-on');

    label.style.left = (gx + gw / 2) + 'px';
    label.style.top = (gy + gh + LABEL_GAP) + 'px';
    label.classList.add('is-on');
  }

  /* is the land wholly in the window? Only then does the wheel move it; otherwise the page scrolls */
  function wholeInView() {
    var r = land.getBoundingClientRect();
    return r.top >= -2 && r.bottom <= window.innerHeight + 2;
  }

  /* ---- the hand: one pointer drags in any direction; a press without travel opens the picture ---- */
  var hand = null, moved = 0, tapArmed = null;

  land.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (hand) return;                         /* one finger only: a second finger does nothing */
    if (onBar(e)) return;
    hand = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, type: e.pointerType };
    moved = 0;
  });

  /* a finger on a phone: once the land reaches its top or bottom edge, the page scrolls on, as the wheel does;
     and while the page is scrolled past the land's top, the page comes back first */
  function touchY(dy) {
    var r = land.getBoundingClientRect();
    if (dy > 0 && r.top < 0) {
      var take = Math.min(dy, -r.top);
      window.scrollBy(0, -take); dy -= take;
    }
    /* and the same the other way (October 30, 2026): while the land's foot is below the window, a finger
       drawing up scrolls the page first, until the whole land is in view; then it moves the land */
    if (dy < 0 && r.bottom > window.innerHeight) {
      var give = Math.min(-dy, r.bottom - window.innerHeight);
      window.scrollBy(0, give); dy += give;
    }
    var old = ty;
    ty += dy; clampView();
    var over = dy - (ty - old);
    if (Math.abs(over) > 0.5) window.scrollBy(0, -over);
  }

  land.addEventListener('pointermove', function (e) {
    if (!hand || hand.id !== e.pointerId) {
      if (e.pointerType === 'mouse' && !hand) {
        var t = e.target.closest && e.target.closest('.pic');
        lift(t ? t._p : null);
      }
      return;
    }
    var dx = e.clientX - hand.x, dy = e.clientY - hand.y;
    hand.x = e.clientX; hand.y = e.clientY;
    moved = Math.max(moved, Math.hypot(e.clientX - hand.x0, e.clientY - hand.y0));
    if (moved > 5) {
      /* the land holds the hand only once it travels, so a plain press still reaches the picture */
      if (!land.classList.contains('is-dragging')) { try { land.setPointerCapture(e.pointerId); } catch (x) {} }
      land.classList.add('is-dragging');
      lift(null); tapArmed = null; clearPlace();
      tx += dx;
      if (hand.type === 'touch') touchY(dy); else ty += dy;
      clampView(); redraw();
    }
  });

  function release(e) {
    if (!hand || hand.id !== e.pointerId) return;
    var wasMouse = hand.type === 'mouse', wasDrag = land.classList.contains('is-dragging');
    hand = null;
    land.classList.remove('is-dragging');
    if (wasMouse && wasDrag) { rehoverAt = { x: e.clientX, y: e.clientY }; redraw(); }
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  land.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !hand) lift(null); });

  /* the press: a mouse opens the page; touch shows the number first, a second tap opens */
  land.addEventListener('click', function (e) {
    var a = e.target.closest('.pic');
    if (!a) return;
    if (moved > 5) { e.preventDefault(); return; }
    if (e.pointerType === 'touch' || (coarse.matches && e.pointerType !== 'mouse')) {
      if (tapArmed !== a) { e.preventDefault(); tapArmed = a; lift(a._p); }
    }
  });

  /* the wheel moves the land up and down, and a trackpad's sideways swipe moves it sideways; nothing zooms.
     Once the land reaches its top or bottom edge, the wheel lets the page scroll on to the footer; and while
     the land is not wholly in the window, the page scrolls until it is. The browser's own page zoom
     (Ctrl and the wheel) stays the visitor's. */
  land.addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;
    var unit = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? vh : 1);
    var dx = e.deltaX * unit, dy = e.deltaY * unit;
    if (e.shiftKey && !dx) { dx = dy; dy = 0; }
    var upright = Math.abs(dy) >= Math.abs(dx);
    if (upright && !wholeInView()) { e.preventDefault(); window.scrollBy(0, dy); return; }   /* the page first */
    var ox = tx, oy = ty;
    tx -= dx; ty -= dy; clampView();
    if (upright && Math.abs(ty - oy) < 0.5) { tx = ox; ty = oy; return; }   /* at its edge: the page scrolls on */
    e.preventDefault();
    clearPlace();
    rehoverAt = { x: e.clientX, y: e.clientY };
    redraw();
  }, { passive: false });

  /* ---- the keyboard: arrow keys move the land, 0 returns to the opening view ---- */
  land.addEventListener('keydown', function (e) {
    var step = 80, done = true;
    if (e.key === 'ArrowLeft') tx += step;
    else if (e.key === 'ArrowRight') tx -= step;
    else if (e.key === 'ArrowUp') ty += step;
    else if (e.key === 'ArrowDown') ty -= step;
    else if (e.key === '0') { arrive(); }
    else done = false;
    if (done) { e.preventDefault(); clearPlace(); clampView(); redraw(); }
  });
  land.addEventListener('focusin', function (e) {
    var a = e.target.closest && e.target.closest('.pic');
    if (!a) return;
    var p = a._p, cx = tx + p.left + p.w / 2, cy = ty + p.top + p.ht / 2;
    if (cx < 60 || cx > vw - 60 || cy < 60 || cy > vh - 60) {
      tx += vw / 2 - cx; ty += vh / 2 - cy; clampView(); draw();
    }
    lift(p);
  });
  land.addEventListener('focusout', function () { lift(null); });

  /* ---- a place pressed: the land slides to its region over about half a second, at the same size ---- */
  var anim = 0;
  function goTo(i, btn) {
    clearPlace(); btn.setAttribute('aria-pressed', 'true');
    lift(null);
    var pl = DATA.places[i];
    var cx = (pl.x + 0.5) * C, cy = (pl.y + 0.5) * C;
    var fx = vw / 2 - tx, fy = vh / 2 - ty;
    function setTo(x, y) { tx = vw / 2 - x; ty = vh / 2 - y; clampView(); }
    cancelAnimationFrame(anim);
    if (calm.matches) { setTo(cx, cy); draw(); return; }
    var t0 = performance.now();
    (function step(now) {
      var t = Math.min(1, (now - t0) / SLIDE_MS);
      var k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setTo(fx + (cx - fx) * k, fy + (cy - fy) * k);
      draw();
      if (t < 1) anim = requestAnimationFrame(step);
    })(t0);
  }

  /* ---- arrival, and a window that changes size (the same spot stays in the middle) ---- */
  arrive();
  function keepMiddle() {
    var atStart = Math.abs(tx - (vw - W) / 2) < 1 && Math.abs(ty - (vh - H) / 2) < 1;
    var mx = (vw / 2 - tx) / C, my = (vh / 2 - ty) / C;
    measure();
    if (atStart) { arrive(); return; }
    tx = vw / 2 - mx * C; ty = vh / 2 - my * C; clampView(); draw();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(keepMiddle);
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(keepMiddle, 120); });
})();
