/* ==========================================================================
   The drawing over the page (step 6 of the knock-down plan, ruled perfect by
   Reach October 2, 2026, on grief-and-loss-THREE.html, and passed on the four
   step 6 test previews: "Everything looks gorgeous").
   Marks drawing 02186 from Slanted Character, over the whole window edge to
   edge, held still while the page moves under it. Behind every line of words
   the drawing is erased and returns over a soft, wide edge; the footer's words
   get twice the clear space. It is cut away exactly at every photograph and
   every button. Its strength and colour are set in drawing.css.
   It also hands the dark bar under a row pointed at the drawing's exact size
   and place (--sig-url, --sig-size, --sig-pos), so the bar's copy lines up.
   Made by D:\PARAPLOO.COM BUILD\SITE-ORDER\STEP-6\make-step-6.py.
   ========================================================================== */
(function () {
  var doc = document, cv = doc.querySelector('canvas.signature');
  if (!cv) {
    cv = doc.createElement('canvas'); cv.className = 'signature'; cv.setAttribute('aria-hidden', 'true');
    doc.body.insertBefore(cv, doc.body.firstChild);
  }
  if (!cv.getContext) return;
  var ctx = cv.getContext('2d');
  var NEAR_PAD = 6, NEAR_SOFT = 14, FAR_PAD = 24, FAR_SOFT = 72;  /* the clearing: a close pass under the type, and a wide pass whose edge fades over about 70 pixels */
  var img = new Image(), ready = false;
  img.onload = function () { ready = true; doc.documentElement.style.setProperty('--sig-url', 'url("' + img.src + '")'); size(); };
  img.src = 'https://media.paraploo.com/site/images/marks/FAST%20THIN%20DUES/SLANTED%20CHARACTER%20%286%29/img146.webp';
  var dpr = 1, texts = [], lastKey = '';
  function gather() {
    texts = [];
    var w = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      if (!/\S/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      var p = n.parentNode;
      if (!p || !p.closest || p.closest('script, style, canvas')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT; } });
    var n; while ((n = w.nextNode())) texts.push(n);
  }
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(window.innerWidth * dpr); cv.height = Math.round(window.innerHeight * dpr);
    draw();
  }
  var range = doc.createRange();
  function draw() {
    if (!ready) return;
    var W = cv.width, H = cv.height, vh = window.innerHeight;
    ctx.globalCompositeOperation = 'source-over'; ctx.shadowColor = 'transparent';
    ctx.clearRect(0, 0, W, H);
    var s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    /* hand the bar under a row pointed at the drawing's exact size and place, so its light copy lines up to the pixel */
    var key = [dw, dh, W, H, dpr].join(',');
    if (key !== lastKey) { lastKey = key; var rs0 = doc.documentElement.style;
      rs0.setProperty('--sig-size', (dw / dpr) + 'px ' + (dh / dpr) + 'px');
      rs0.setProperty('--sig-pos', ((W - dw) / 2 / dpr) + 'px ' + ((H - dh) / 2 / dpr) + 'px'); }
    /* erase behind the words in two passes: a close one keeps the type itself fully clear,
       a wide one makes the edge fade out slowly, with no line where the clearing ends.
       Each line's box is filled far off to the left, so only its blurred shadow lands. */
    var off = W * 2 + 2000, boxes = [];
    for (var i = 0; i < texts.length; i++) {
      range.selectNodeContents(texts[i]);
      var rs = range.getClientRects();
      for (var j = 0; j < rs.length; j++) {
        var r = rs[j];
        if (r.width < 1 || r.bottom < -120 || r.top > vh + 120) continue;
        /* only words a visitor can actually see: a closed menu panel keeps its words in
           place but hidden, and those must not clear the drawing */
        var el = texts[i].parentNode;
        var cx = Math.min(window.innerWidth - 1, Math.max(0, r.left + r.width / 2));
        var cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
        if (r.bottom > 0 && r.top < vh) {
          var hit = doc.elementFromPoint(cx, cy);
          if (!hit || (hit !== el && !el.contains(hit) && !hit.contains(el))) continue;
        }
        boxes.push({ r: r, big: !!el.closest('.directory-footer') });
      }
    }
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000'; ctx.shadowOffsetX = off; ctx.shadowOffsetY = 0;
    [[NEAR_PAD, NEAR_SOFT, 1], [FAR_PAD, FAR_SOFT, 0.85]].forEach(function (pass) {
      var pad = pass[0];
      ctx.shadowBlur = pass[1] * dpr; ctx.shadowColor = 'rgba(0,0,0,' + pass[2] + ')';
      ctx.beginPath();
      boxes.forEach(function (b) {
        var r = b.r, p = b.big ? pad * 2 : pad;   /* the footer's words get twice the clear space */
        ctx.rect((r.left - p) * dpr - off, (r.top - p * 0.5) * dpr, (r.width + 2 * p) * dpr, (r.height + p) * dpr);
      });
      ctx.fill();
    });
    ctx.restore();
    /* buttons: nothing of the drawing inside their borders, cut exactly to their own rounded shape */
    var btns = doc.querySelectorAll('main button, main .btn, main .chip, .theme-strip button, .directory-footer button, .df-write');
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000';
    for (var q = 0; q < btns.length; q++) {
      var e = btns[q], bb = e.getBoundingClientRect();
      if (bb.width < 1 || bb.bottom < 0 || bb.top > vh) continue;
      var rad = Math.min(parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0, bb.height / 2) * dpr;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bb.left * dpr, bb.top * dpr, bb.width * dpr, bb.height * dpr, rad);
      else ctx.rect(bb.left * dpr, bb.top * dpr, bb.width * dpr, bb.height * dpr);
      ctx.fill();
    }
    ctx.restore();
    /* The still picture behind a writing's opening: the drawing is cut away from it only while it is seen
       as the opening, above the reading sheet. Once the sheet has risen over it, the picture is veiled ground
       beside the sheet, and the drawing returns there, so no hard rectangle is ever left behind. */
    var sp = doc.querySelector('.stage-pic.is-in'), rd = doc.querySelector('.wp-reading');
    if (sp) {
      var sb = sp.getBoundingClientRect(), lim = rd ? rd.getBoundingClientRect().top : sb.bottom;
      var bot = Math.min(sb.bottom, lim);
      if (bot > sb.top && bot > 0 && sb.top < vh) {
        var sx0 = Math.floor(sb.left * dpr), sy0 = Math.floor(sb.top * dpr);
        ctx.clearRect(sx0, sy0, Math.ceil(sb.right * dpr) - sx0, Math.ceil(bot * dpr) - sy0);
      }
    }
    /* the photographs sit above the drawing: it is cut away exactly at their edges, nothing over them */
    var pics = doc.querySelectorAll('main img');
    for (var k = 0; k < pics.length; k++) {
      var b = pics[k].getBoundingClientRect();
      if (b.width < 1 || b.bottom < 0 || b.top > vh) continue;
      var x0 = Math.floor(b.left * dpr), y0 = Math.floor(b.top * dpr);
      ctx.clearRect(x0, y0, Math.ceil(b.right * dpr) - x0, Math.ceil(b.bottom * dpr) - y0);
    }
  }
  /* redraw on every frame while anything is moving, then rest */
  var until = 0, looping = false;
  function loop() { draw(); if (performance.now() < until) requestAnimationFrame(loop); else looping = false; }
  function wake(ms) { until = Math.max(until, performance.now() + (ms || 250)); if (!looping) { looping = true; requestAnimationFrame(loop); } }
  window.addEventListener('scroll', function () { wake(300); }, { passive: true });
  window.addEventListener('resize', function () { size(); wake(300); });
  doc.addEventListener('click', function () { setTimeout(function () { gather(); wake(900); }, 0); });
  doc.addEventListener('pointerover', function () { wake(400); });
  doc.addEventListener('transitionend', function () { wake(100); });
  doc.addEventListener('animationend', function () { wake(100); });
  gather(); size(); wake(1500);
  window.addEventListener('load', function () { gather(); wake(1500); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { wake(600); });
  new MutationObserver(function () { gather(); wake(600); }).observe(doc.body, { childList: true, subtree: true });
})();
