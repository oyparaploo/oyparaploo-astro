/* ==========================================================================
   Handwritten Every Which Way: the one sentence that settles.
   Written fresh for Paraploo, October 22, 2026 (the find: the foot band of
   pitchfork.com/best/, named by Reach himself). No code taken from Pitchfork.

   What it does, once, when the page arrives:
   - every letter of the sentence stands as a broken pen mark, tall where the
     letter is tall and low where it hangs, so the line keeps the shape of its
     words;
   - the marks settle into the real letters from left to right, in reading
     order, in under a second;
   - then the layer of marks is taken away and the sentence stays still, as
     plain text, exactly where it always was.
   The real words stay in the page the whole time (a screen reader reads them
   from the start); the marks are hidden from screen readers. Visitors who ask
   for less motion never get the class hw-settling, so nothing here runs for
   them. If the page's face is slow to arrive, or the window changes size while
   it settles, the sentence simply shows plain.
   ========================================================================== */
(function () {
  var root = document.documentElement;
  var p = document.querySelector('.hw-settle');

  function plain() { root.classList.remove('hw-settling', 'hw-run'); }

  if (!root.classList.contains('hw-settling')) return;              // less motion: plain from the start
  if (!p || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) { plain(); return; }

  // The sentence must be one plain run of words.
  var node = null;
  for (var k = 0; k < p.childNodes.length; k++) {
    var c = p.childNodes[k];
    if (c.nodeType === 3 && c.nodeValue.replace(/\s/g, '') !== '') { if (node) { plain(); return; } node = c; }
    else if (c.nodeType === 1) { plain(); return; }
  }
  if (!node) { plain(); return; }

  // Timing, in thousandths of a second.
  var LATEST_START = 1000;  // if the face is not ready a second after the page began, show the words plain
  var FIRST = 140;          // the first letter settles this long after the marks appear
  var ACROSS = 560;         // the settling runs across the sentence in this time
  var FLIP = 100;           // an unsettled mark changes shape this often
  var FADE = 140;           // a mark gives way to its letter in this time (hw-settle.css)

  var TALL = /[bdfhklt0-9A-Z]/, HANG = /[gjpqy]/;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  // Each kind of letter gets marks of its own height, set where that letter sits on the line.
  function kindOf(ch) {
    if (ch === '.') return 'stop';
    if (/[,;:'"’]/.test(ch)) return 'comma';
    if (HANG.test(ch)) return 'hang';
    if (TALL.test(ch)) return 'tall';
    return 'small';
  }
  var TOP = { small: '57%', tall: '47%', hang: '66%', stop: '78%', comma: '81%' };

  function shape(m) {
    var s, r;
    switch (m.kind) {
      case 'tall': s = pick(['t1', 't2', 't3']); break;
      case 'hang': s = pick(['t1', 't3']); break;
      case 'stop': s = 'p1'; break;
      case 'comma': s = 'p2'; break;
      default: s = pick(['s1', 's2', 's3', 's4', 's5', 's6']);
    }
    if (s === 's1' || s === 's6') r = rnd(0, 360);        // pieces of loops turn every way
    else if (s === 's2') r = rnd(-35, 35);
    else if (s === 's3' || s === 't1') r = rnd(4, 26);    // strokes lean like a hand writing
    else if (s === 's5') r = rnd(-25, 15);
    else if (s === 'p1') r = 0;
    else if (s === 'p2') r = rnd(15, 35);
    else r = rnd(-12, 22);
    m.mk.className = 'mk ' + s;
    m.mk.style.setProperty('--r', r.toFixed(0) + 'deg');
    m.mk.style.setProperty('--y', rnd(-0.06, 0.06).toFixed(3) + 'em');
  }

  var started = false, layer = null, watch = null, ended = false;

  function finish() {
    if (ended) return;
    ended = true;
    if (watch) watch.disconnect();
    window.removeEventListener('resize', finish);
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    plain();
  }

  function run() {
    var s = node.nodeValue;
    var box = p.getBoundingClientRect();
    if (!box.width) { plain(); return; }
    layer = document.createElement('span');
    layer.className = 'hw-marks';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.color = getComputedStyle(p.parentNode).color;   // the colour the words wear on their band

    var range = document.createRange(), marks = [];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i), len = 1;
      var code = s.charCodeAt(i);
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < s.length) { ch = s.substr(i, 2); len = 2; }
      if (/\s/.test(ch)) continue;
      range.setStart(node, i); range.setEnd(node, i + len);
      var rects = range.getClientRects();
      i += len - 1;
      if (!rects.length) continue;
      var rc = rects[0];
      var el = document.createElement('span');
      el.className = 'hw-ch';
      el.style.left = (rc.left - box.left) + 'px';
      el.style.top = (rc.top - box.top) + 'px';
      el.style.width = rc.width + 'px';
      el.style.height = rc.height + 'px';
      el.style.lineHeight = rc.height + 'px';
      var mk = document.createElement('span');
      var lt = document.createElement('span');
      lt.className = 'lt';
      lt.textContent = ch;
      el.appendChild(mk); el.appendChild(lt);
      layer.appendChild(el);
      var m = { el: el, mk: mk, kind: kindOf(ch), set: false };
      mk.style.setProperty('--top', TOP[m.kind]);
      shape(m);
      marks.push(m);
    }
    if (!marks.length) { plain(); return; }

    p.appendChild(layer);
    root.classList.add('hw-run');

    // If the sentence's own width changes while it settles, show it plain at once.
    var w0 = box.width;
    if (window.ResizeObserver) {
      watch = new ResizeObserver(function () { if (Math.abs(p.getBoundingClientRect().width - w0) > 0.5) finish(); });
      watch.observe(p);
    }
    window.addEventListener('resize', finish);

    var n = marks.length, begin = 0, lastFlip = 0;
    function frame(now) {
      if (ended) return;
      if (!begin) { begin = now; lastFlip = now; layer.classList.add('on'); }
      var t = now - begin, flip = now - lastFlip >= FLIP;
      if (flip) lastFlip = now;
      for (var j = 0; j < n; j++) {
        var m = marks[j];
        if (m.set) continue;
        var at = FIRST + ACROSS * (n === 1 ? 0 : j / (n - 1));
        if (t >= at) { m.el.classList.add('set'); m.set = true; }
        else if (flip) shape(m);
      }
      if (t < FIRST + ACROSS + FADE + 40) requestAnimationFrame(frame); else finish();
    }
    requestAnimationFrame(frame);
  }

  function go() {
    if (started) return;
    started = true;
    if (performance.now() > LATEST_START) { plain(); return; }
    requestAnimationFrame(run);
  }

  // Wait for the sentence's own face, so the marks sit exactly over the letters.
  var cs = getComputedStyle(p);
  var font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
  if (document.fonts && document.fonts.load) {
    document.fonts.load(font, node.nodeValue).then(go, go);
    setTimeout(function () { if (!started) { started = true; plain(); } }, Math.max(0, LATEST_START - performance.now()));
  } else {
    go();
  }
})();
