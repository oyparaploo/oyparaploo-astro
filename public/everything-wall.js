/* The slow wall on the Everything page (preview, October 17, 2026).
   BOMB's wall: drifts left by itself at about 8 pixels a second, forever, looping;
   it does not stop when pointed at; a hand or a finger can drag it, and it glides a
   little when let go. Visitors who ask for less motion get a still wall (dragging
   still works, since it only moves when they move it). While the keyboard is inside
   the wall it holds still, and the door in focus is brought into view. */
(function () {
  var wall = document.querySelector('.wall');
  if (!wall) return;
  var track = wall.querySelector('.wall-track');
  var first = wall.querySelector('.wall-set');
  var SPEED = 8;                       // pixels a second
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = motionQuery.matches;
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', function (e) { still = e.matches; });
  else if (motionQuery.addListener) motionQuery.addListener(function (e) { still = e.matches; });

  /* ---- the words on each block: as large as fits, 16 pixels at the least ---- */
  function fitWords(root) {
    var blocks = root.querySelectorAll('.door-block');
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i], w = b.firstChild;
      var size = window.innerWidth <= 700 ? 22 : 28;
      b.style.visibility = 'hidden'; b.style.opacity = '1';
      w.style.setProperty('--fs', size + 'px');
      while (size > 16 && (w.scrollHeight > b.clientHeight - 28 || w.scrollWidth > b.clientWidth - 30)) {
        size -= 1; w.style.setProperty('--fs', size + 'px');
      }
      b.style.visibility = ''; b.style.opacity = '';
    }
  }

  /* ---- copies of the set, so the wall runs off both edges and loops ---- */
  var setW = 0;
  function build() {
    var copies = track.querySelectorAll('.wall-set.is-copy');
    for (var i = 0; i < copies.length; i++) track.removeChild(copies[i]);
    setW = first.getBoundingClientRect().width;
    var need = Math.ceil((window.innerWidth + setW) / Math.max(setW, 1)) + 1;
    for (var k = 0; k < need; k++) {
      var c = first.cloneNode(true);
      c.classList.add('is-copy');
      c.setAttribute('aria-hidden', 'true');
      var links = c.querySelectorAll('a');
      for (var j = 0; j < links.length; j++) links[j].setAttribute('tabindex', '-1');
      track.appendChild(c);
    }
  }

  // the wall begins half a column in, so it runs off the left edge too
  var offset = 120, velocity = 0, last = 0, visible = true, held = false;
  function place() {
    if (setW <= 0) return;
    var x = ((offset % setW) + setW) % setW;
    track.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)';
  }
  function frame(t) {
    var dt = last ? Math.min((t - last) / 1000, 0.1) : 0;
    last = t;
    if (visible && !dragging) {
      if (Math.abs(velocity) > 2) {                     // the glide after a drag
        offset += velocity * dt;
        velocity *= Math.pow(0.04, dt);
      } else {
        velocity = 0;
        if (!still && !held) offset += SPEED * dt;
      }
      place();
    }
    requestAnimationFrame(frame);
  }

  /* ---- dragging with a hand or a finger ---- */
  var down = false, dragging = false, startX = 0, startOffset = 0, lastX = 0, lastT = 0, suppress = false, pid = null;
  wall.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    down = true; dragging = false; pid = e.pointerId;
    startX = lastX = e.clientX; lastT = performance.now(); startOffset = offset; velocity = 0;
  });
  wall.addEventListener('pointermove', function (e) {
    if (!down || e.pointerId !== pid) return;
    var dx = e.clientX - startX;
    if (!dragging && Math.abs(dx) > 6) {
      dragging = true; suppress = true;
      wall.classList.add('is-dragging');
      try { wall.setPointerCapture(pid); } catch (err) {}
    }
    if (dragging) {
      var now = performance.now(), dt = Math.max(now - lastT, 1) / 1000;
      velocity = -(e.clientX - lastX) / dt;
      lastX = e.clientX; lastT = now;
      offset = startOffset - dx;
      place();
    }
  });
  function end(e) {
    if (!down || (e && e.pointerId !== pid)) return;
    down = false;
    if (dragging) {
      dragging = false;
      wall.classList.remove('is-dragging');
      if (still || performance.now() - lastT > 120) velocity = 0;
      velocity = Math.max(-2400, Math.min(2400, velocity));
      setTimeout(function () { suppress = false; }, 0);
    }
  }
  wall.addEventListener('pointerup', end);
  wall.addEventListener('pointercancel', function (e) { end(e); dragging = false; suppress = false; wall.classList.remove('is-dragging'); });
  wall.addEventListener('click', function (e) {
    if (suppress) { e.preventDefault(); e.stopPropagation(); suppress = false; }
  }, true);
  wall.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* ---- a sideways swipe on a trackpad moves it too ---- */
  wall.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); offset += e.deltaX; velocity = 0; place(); }
  }, { passive: false });

  /* ---- the keyboard: hold still, and bring the door in focus into view ---- */
  wall.addEventListener('focusin', function (e) {
    held = true;
    var r = e.target.getBoundingClientRect(), W = window.innerWidth;
    if (r.left < 24 || r.right > W - 24) { offset += r.left - Math.max(24, (W - r.width) / 2); velocity = 0; place(); }
  });
  wall.addEventListener('focusout', function (e) {
    if (!wall.contains(e.relatedTarget)) held = false;
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; last = 0; }).observe(wall);
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { fitWords(first); build(); place(); }, 150);
  });

  function start() { fitWords(first); build(); place(); requestAnimationFrame(frame); }
  if (document.fonts && document.fonts.ready) {
    var started = false;
    var go = function () { if (!started) { started = true; start(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 1000);               // nothing waits more than about a second
  } else start();
})();
