/* The title "The Writings": its letters thicken under the hand, like ink pooling under a pen.
   Preview WRITINGS-TITLE-INK-WHOLE-2026-10-31, from proposal 29 of the sixth sites survey (Exat, Hot Type).
   - Letters near the hand swell from Archivo weight 600 toward 800; about 200 pixels away or more they stay at 600.
   - As a letter's weight rises its width narrows, measured letter by letter, so the word keeps its length.
   - When the hand leaves, the letters ease back over about half a second. Nothing moves while the hand is still.
   - On a touch screen a finger drawn along the title does the same.
   - Visitors who ask for less motion see the plain title; this file does nothing for them.
   - Colour is never touched. The rest of the page is never touched. */
(function () {
  'use strict';
  var title = document.querySelector('h1.stage-title');
  if (!title || !window.matchMedia || !window.FontFace || !document.fonts) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var FAMILY = 'Archivo Ink';   /* the whole Archivo file, weights 600 to 800 and every width; only the title uses it */
  var SRC = 'url(https://fonts.gstatic.com/s/archivo/v25/k3kQo8UDI-1M0wlSfdnoLg.woff2) format("woff2")';
  var W0 = 600, W1 = 800, S0 = 112;   /* rest weight, fullest weight, rest width (per cent) */
  var REACH = 200;                    /* pixels: at this distance or more a letter stays at 600 */
  var RISE = 0.06, FALL = 0.12;       /* seconds: how quickly a letter answers the hand, and eases back (about 0.5 s) */
  var STEP = 10;                      /* the width table holds one width for every ten weights */

  var word = title.textContent;
  var spans = [], centres = [], cur = [], tgt = [], table = {};
  var built = false, frame = 0, last = 0, hand = null;

  /* ---------- the width table: for each letter and weight, the width that keeps the letter's length ----------
     Measured once, in one hidden box, every letter and every weight side by side, so it takes a few hundredths of a
     second. Each letter is measured ten times in a row, so the font's rounding of widths shows ten times smaller. */
  var kerns = [];   /* the space the font takes out between two letters at rest, kept by hand once the letters split */
  function measure() {
    var box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;white-space:pre;' +
      'font-family:"' + FAMILY + '";font-size:200px;letter-spacing:0;line-height:1;font-kerning:none;';
    function probe(text, w, s, kern) {
      var p = document.createElement('span');
      p.style.cssText = 'display:block;width:max-content;font-weight:' + w + ';font-stretch:' + s + '%;' +
        (kern ? 'font-kerning:normal;' : '');
      p.textContent = text; box.appendChild(p); return p;
    }
    var chars = [], seen = {}, i;
    for (i = 0; i < word.length; i++) {
      var c = word.charAt(i);
      if (c !== ' ' && !seen[c]) { seen[c] = true; chars.push(c); }
    }
    var ten = function (c) { return new Array(11).join(c); };
    var goals = chars.map(function (c) { return probe(ten(c), W0, S0); });
    var runs = [];   /* one per letter and weight: [letter index, weight, low, high, span] */
    chars.forEach(function (c, ci) {
      for (var w = W0; w <= W1; w += STEP) runs.push([ci, w, 62, S0, probe(ten(c), w, S0)]);
    });
    /* the kerning between neighbours, at rest: the pair together, less each letter alone */
    var pairs = [];
    for (i = 0; i < word.length - 1; i++) {
      var a = word.charAt(i), b = word.charAt(i + 1);
      if (a === ' ' || b === ' ') { pairs.push(null); continue; }
      pairs.push([probe(a + b, W0, S0, true), probe(a, W0, S0, true), probe(b, W0, S0, true)]);
    }
    document.body.appendChild(box);
    var goalW = goals.map(function (p) { return p.getBoundingClientRect().width; });
    kerns = pairs.map(function (q) {
      return q ? (q[0].getBoundingClientRect().width - q[1].getBoundingClientRect().width -
                  q[2].getBoundingClientRect().width) / 200 : 0;   /* in em */
    });
    for (var k = 0; k < 16; k++) {               /* halve every gap sixteen times, all letters at once */
      runs.forEach(function (r) { r[4].style.fontStretch = ((r[2] + r[3]) / 2) + '%'; });
      runs.forEach(function (r) {
        if (r[4].getBoundingClientRect().width > goalW[r[0]]) r[3] = (r[2] + r[3]) / 2; else r[2] = (r[2] + r[3]) / 2;
      });
    }
    chars.forEach(function (c) { table[c] = []; });
    runs.forEach(function (r) { table[chars[r[0]]].push(r[1] === W0 ? S0 : (r[2] + r[3]) / 2); });
    box.remove();
  }
  function stretchFor(ch, w) {
    var row = table[ch]; if (!row) return S0;
    var x = (w - W0) / STEP, i = Math.floor(x);
    if (i >= row.length - 1) return row[row.length - 1];
    if (i < 0) return row[0];
    return row[i] + (row[i + 1] - row[i]) * (x - i);
  }

  /* ---------- the letters: one span each; the heading keeps its words for screen readers ---------- */
  function build() {
    title.setAttribute('aria-label', word);
    title.textContent = '';
    for (var i = 0; i < word.length; i++) {
      var ch = word.charAt(i);
      if (ch === ' ') { title.appendChild(document.createTextNode(' ')); continue; }
      var s = document.createElement('span');
      s.className = 'ink'; s.setAttribute('aria-hidden', 'true'); s.textContent = ch;
      if (kerns[i]) s.style.marginRight = kerns[i].toFixed(4) + 'em';   /* the font's own kerning, kept by hand */
      title.appendChild(s);
      spans.push(s); cur.push(W0); tgt.push(W0);
    }
    title.classList.add('is-inked');
    built = true;
    place();
  }
  /* where each letter's centre sits inside the title; widths never change, so this holds until the page is resized */
  function place() {
    var box = title.getBoundingClientRect();
    centres = spans.map(function (s) {
      var r = s.getBoundingClientRect();
      return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2];
    });
  }

  /* ---------- the motion: runs only while a letter is still changing, and stops ---------- */
  function aim() {
    var box = hand ? title.getBoundingClientRect() : null;
    for (var i = 0; i < spans.length; i++) {
      var f = 0;
      if (box) {
        var dx = hand[0] - (box.left + centres[i][0]), dy = hand[1] - (box.top + centres[i][1]);
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < REACH) f = (Math.cos(Math.PI * d / REACH) + 1) / 2;   /* full at the hand, gone at 200 pixels */
      }
      tgt[i] = W0 + (W1 - W0) * f;
    }
  }
  function tick(now) {
    frame = 0;
    var dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
    last = now;
    aim();
    var moving = false;
    for (var i = 0; i < spans.length; i++) {
      var gap = tgt[i] - cur[i];
      if (Math.abs(gap) < 0.4) { cur[i] = tgt[i]; }
      else { cur[i] += gap * (1 - Math.exp(-dt / (gap > 0 ? RISE : FALL))); moving = true; }
      var s = spans[i];
      if (cur[i] <= W0 + 0.01) { s.style.fontWeight = ''; s.style.fontStretch = ''; }
      else {
        s.style.fontWeight = cur[i].toFixed(1);
        s.style.fontStretch = stretchFor(s.textContent, cur[i]).toFixed(3) + '%';
      }
    }
    if (moving) frame = requestAnimationFrame(tick); else last = 0;
  }
  function wake() { if (built && !frame && !calm.matches) frame = requestAnimationFrame(tick); }

  function move(e) {
    if (calm.matches || !built) return;
    if (e.pointerType === 'touch' && !e.isPrimary) return;
    hand = [e.clientX, e.clientY];
    wake();
  }
  function leave() { if (hand) { hand = null; wake(); } }

  function rest() {
    hand = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0; last = 0;
    for (var i = 0; i < spans.length; i++) { cur[i] = tgt[i] = W0; spans[i].style.fontWeight = ''; spans[i].style.fontStretch = ''; }
  }

  function start() {
    if (calm.matches || built) return;
    var face = new FontFace(FAMILY, SRC, { weight: '600 800', stretch: '62% 125%', display: 'swap' });
    face.load().then(function (f) {
      document.fonts.add(f);
      if (calm.matches || built) return;
      measure();
      build();
    }).catch(function () { /* the font did not come: the plain title stays, as it is */ });
  }

  window.addEventListener('pointermove', move, { passive: true });
  title.addEventListener('pointerdown', move, { passive: true });
  window.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') leave(); }, { passive: true });
  window.addEventListener('pointercancel', leave, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave);
  window.addEventListener('blur', leave);
  window.addEventListener('resize', function () { if (built) place(); }, { passive: true });
  if (calm.addEventListener) calm.addEventListener('change', function () { if (calm.matches) rest(); else start(); });

  /* The file loads after the page has shown, so nothing on the page waits for it. */
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
