/* Picture pages, November 17, 2026 (SITE-ORDER\PICTURE-PAGE-ORDER-FRAME-SLIDESHOW-2026-11-17).
   Beside works.js, which builds the slideshow overlay and asks the browser for full screen:
   1. Leaving full screen by any way (Escape, the browser's own control) closes the slideshow and returns to the page at the
      same picture, the way the close button does. Where the browser refuses full screen no event comes, and the overlay,
      which fills the window, stays until the close button or Escape.
   2. A picture saved with a white mat shows without it in the slideshow, in every look: the overlay's picture is placed so
      the cut picture is as large as the screen allows. The mat of each picture is on its page (data-mat, from the build). */
(function () {
  var mats = {};  // picture address -> [top, right, bottom, left] fractions of the white mat

  function parse(v) {
    if (!v) return null;
    var a = v.split(',').map(Number);
    return a.length === 4 && a.every(function (n) { return n >= 0 && n < 1; }) ? a : null;
  }
  function note(doc) {
    var img = doc.getElementById('work-main-pic');
    if (img && img.src) mats[img.src] = parse(img.getAttribute('data-mat'));
  }
  note(document);

  // the pages works.js fetches for the next and the previous picture
  if (window.fetch) {
    var realFetch = window.fetch;
    window.fetch = function () {
      var p = realFetch.apply(this, arguments);
      try {
        p.then(function (res) {
          if (!res || !res.ok) return;
          res.clone().text().then(function (html) {
            if (html.indexOf('work-main-pic') > -1) note(new DOMParser().parseFromString(html, 'text/html'));
          });
        }, function () {});
      } catch (e) {}
      return p;
    };
  }

  function place(layer) {
    var m = mats[layer.src];
    var s = layer.style;
    var box = layer.parentNode;
    if (!m || !layer.naturalWidth || !box) {
      s.width = s.height = s.maxWidth = s.maxHeight = s.left = s.top = s.margin = s.clipPath = s.objectFit = s.transformOrigin = '';
      return;
    }
    var W = layer.naturalWidth, H = layer.naturalHeight;
    var cw = W * (1 - m[1] - m[3]), ch = H * (1 - m[0] - m[2]);
    var vw = box.clientWidth, vh = box.clientHeight;
    var k = Math.min(vw / cw, vh / ch);
    s.maxWidth = s.maxHeight = 'none';
    s.margin = '0';
    s.objectFit = 'fill';
    s.width = (W * k) + 'px';
    s.height = (H * k) + 'px';
    s.left = ((vw - cw * k) / 2 - m[3] * W * k) + 'px';
    s.top = ((vh - ch * k) / 2 - m[0] * H * k) + 'px';
    s.right = s.bottom = 'auto';
    s.clipPath = 'inset(' + (m[0] * 100) + '% ' + (m[1] * 100) + '% ' + (m[2] * 100) + '% ' + (m[3] * 100) + '%)';
    s.transformOrigin = ((m[3] + (1 - m[1] - m[3]) / 2) * 100) + '% ' + ((m[0] + (1 - m[0] - m[2]) / 2) * 100) + '%';
  }
  function placeAll() {
    var imgs = document.querySelectorAll('#work-fullscreen-overlay .work-fs-img');
    for (var i = 0; i < imgs.length; i++) place(imgs[i]);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var overlay = document.getElementById('work-fullscreen-overlay');
    if (!overlay) return;
    var imgs = overlay.querySelectorAll('.work-fs-img');
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        img.addEventListener('load', function () { place(img); });
        new MutationObserver(function () { place(img); }).observe(img, { attributes: true, attributeFilter: ['src'] });
      })(imgs[i]);
    }
    window.addEventListener('resize', placeAll);
    new MutationObserver(placeAll).observe(overlay, { attributes: true, attributeFilter: ['hidden'] });
  });

  function left() {
    var overlay = document.getElementById('work-fullscreen-overlay');
    if (!overlay || overlay.hidden) { return; }
    if (document.fullscreenElement || document.webkitFullscreenElement) { setTimeout(placeAll, 50); return; }
    var close = overlay.querySelector('.work-fs-close');
    if (close) close.click();
  }
  document.addEventListener('fullscreenchange', function () { left(); setTimeout(placeAll, 50); });
  document.addEventListener('webkitfullscreenchange', function () { left(); setTimeout(placeAll, 50); });
})();

/* The rows of other pictures, November 20, 2026 (SITE-ORDER\PICTURE-ROWS-SHARP-BUILD): no tile is drawn larger than its
   own dots. Every tile arrives with its small copy, exactly as before. A tile that rests on screen for a moment, and is
   drawn across more screen dots than its copy has, fetches the full picture and takes it; a screen the small copy
   covers fetches nothing. A tile passing by under a dragging hand fetches nothing. A visitor whose browser asks to save
   data keeps the small copies. The full picture is the same address without "-600" (or without "thumbs/"). */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var conn = navigator.connection;
  if (conn && conn.saveData) return;
  var REST = 300;  // milliseconds a tile must rest on screen before its full picture is asked for

  function full(src) {
    var m = /^(.*)-600(\.webp)$/.exec(src);
    if (m) return m[1] + m[2];
    if (src.indexOf('/thumbs/') > -1) return src.replace('/thumbs/', '/');
    return null;
  }
  function soft(img) {  // drawn across more screen dots than the copy has
    var r = img.getBoundingClientRect();
    var k = window.devicePixelRatio || 1;
    return r.width * k > img.naturalWidth * 1.02 || r.height * k > img.naturalHeight * 1.02;
  }
  function onScreen(img) {  // asked afresh when the moment is up, in case the page was too busy to say the tile had left
    var r = img.getBoundingClientRect();
    var t = img.closest ? img.closest('.work-row-track') : null;
    var b = t ? t.getBoundingClientRect() : { left: 0, right: window.innerWidth };
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight &&
      r.right > Math.max(0, b.left) && r.left < Math.min(window.innerWidth, b.right);
  }
  function sharpen(img) {
    var to = full(img.currentSrc || img.src);
    if (!to || !soft(img)) return;
    img._ppSharp = 1;
    var pre = new Image();
    pre.onload = function () {
      var go = function () { img.src = to; };
      if (pre.decode) pre.decode().then(go, go); else go();
    };
    pre.src = to;  // if it does not come, the small copy stays
  }
  function arm(img) {
    clearTimeout(img._ppT);
    if (img._ppSharp) return;
    img._ppT = setTimeout(function () {
      if (!img._ppOn || img._ppSharp || !onScreen(img)) return;
      if (!img.complete || !img.naturalWidth) {
        if (!img._ppWait) {
          img._ppWait = 1;
          img.addEventListener('load', function () { img._ppWait = 0; if (img._ppOn) arm(img); }, { once: true });
        }
        return;
      }
      sharpen(img);
    }, REST);
  }

  var imgs = document.querySelectorAll('.work-rows .work-tile img');
  if (!imgs.length) return;
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var img = entries[i].target;
      img._ppOn = entries[i].isIntersecting;
      if (img._ppOn) arm(img); else clearTimeout(img._ppT);
    }
  });
  for (var i = 0; i < imgs.length; i++) io.observe(imgs[i]);
  var again;
  window.addEventListener('resize', function () {
    clearTimeout(again);
    again = setTimeout(function () { for (var i = 0; i < imgs.length; i++) if (imgs[i]._ppOn) arm(imgs[i]); }, 200);
  });
})();
