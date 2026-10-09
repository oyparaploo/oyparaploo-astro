/* Art and Making: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\DRAWINGS_1.html: choosing a still life opens the walk, the page's four pictures one at a time,
   each whole on the dark, with arrows either side, the arrow keys, a swipe, and Escape or "← Art and Making" to
   come back; each picture's number leads to its picture page. Each part fades in once as it is reached, in under a
   second. Show more brings the next 24 writings. Visitors who ask for less motion see everything at once. */
(function () {
  var doc = document;
  function all(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* each part fades in as it is reached */
  var io = null;
  if (!calm && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-reveal');
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.classList.add('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    all('.am-room .reveal').forEach(function (el) { io.observe(el); });
  }

  /* Show more */
  var btn = doc.querySelector('.am-room .show-more');
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.am-w.later');
    var now = rest.slice(0, 24);
    now.forEach(function (a) { a.classList.remove('later'); });
    if (rest.length <= 24) btn.parentNode.hidden = true;
    if (now[0]) now[0].focus({ preventScroll: true });
  });

  /* the walk through the four still lifes */
  var seats = all('.am-room .am-seat-pic');
  if (!seats.length) return;
  var pics = seats.map(function (a) {
    var img = a.querySelector('img');
    return { href: a.getAttribute('href'), src: img.getAttribute('src'), num: a.getAttribute('aria-label'),
             w: img.getAttribute('width'), h: img.getAttribute('height') };
  });
  var title = doc.querySelector('.am-room h1');
  var walk = doc.createElement('div');
  walk.className = 'am-walk';
  walk.hidden = true;
  walk.setAttribute('role', 'dialog');
  walk.setAttribute('aria-modal', 'true');
  walk.setAttribute('aria-label', title ? title.textContent : '');
  walk.innerHTML =
    '<button type="button" class="am-walk-back"><span aria-hidden="true">&larr;</span> </button>' +
    '<button type="button" class="am-walk-arrow am-walk-prev" aria-label="Previous">&#8249;</button>' +
    '<div class="am-walk-stage"><img class="am-walk-img" alt=""><a class="am-walk-num" href="#"></a></div>' +
    '<button type="button" class="am-walk-arrow am-walk-next" aria-label="Next">&#8250;</button>';
  doc.body.appendChild(walk);
  var back = walk.querySelector('.am-walk-back');
  back.appendChild(doc.createTextNode(title ? title.textContent : ''));
  var wImg = walk.querySelector('.am-walk-img');
  var wNum = walk.querySelector('.am-walk-num');
  var at = 0, opener = null, startX = null;

  function show(i) {
    var n = pics.length;
    at = ((i % n) + n) % n;
    var p = pics[at];
    wImg.src = p.src;
    wImg.width = p.w; wImg.height = p.h;
    wImg.alt = p.num;
    wNum.textContent = p.num;
    wNum.href = p.href;
    var pre = new Image();
    pre.src = pics[(at + 1) % n].src;
  }
  function open(i, from) {
    opener = from || null;
    show(i);
    walk.hidden = false;
    doc.documentElement.style.overflow = 'hidden';
    if (calm) walk.classList.add('open');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { walk.classList.add('open'); }); });
    back.focus({ preventScroll: true });
  }
  function close() {
    walk.classList.remove('open');
    walk.hidden = true;
    doc.documentElement.style.overflow = '';
    wImg.removeAttribute('src');
    if (opener) opener.focus({ preventScroll: true });
  }
  seats.forEach(function (a, i) {
    a.addEventListener('click', function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;   // a new tab opens the picture page
      ev.preventDefault();
      open(i, a);
    });
  });
  back.addEventListener('click', close);
  walk.querySelector('.am-walk-prev').addEventListener('click', function () { show(at - 1); });
  walk.querySelector('.am-walk-next').addEventListener('click', function () { show(at + 1); });
  doc.addEventListener('keydown', function (ev) {
    if (walk.hidden) return;
    if (ev.key === 'ArrowLeft') show(at - 1);
    else if (ev.key === 'ArrowRight') show(at + 1);
    else if (ev.key === 'Escape') close();
    else if (ev.key === 'Tab') {
      var f = all('.am-walk button, .am-walk a');
      var first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && doc.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && doc.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  });
  walk.addEventListener('touchstart', function (ev) { startX = ev.changedTouches[0].screenX; }, { passive: true });
  walk.addEventListener('touchend', function (ev) {
    if (startX === null) return;
    var dx = ev.changedTouches[0].screenX - startX;
    if (Math.abs(dx) > 40) show(dx < 0 ? at + 1 : at - 1);
    startX = null;
  }, { passive: true });
})();
