/* paraploo.com — the front door's opening: the blind, made to move exactly as the Thom Browne
   homepage's blind moves (studied in Reach's Chrome, November 9, 2026), in Paraploo's own ink colours.

   What it does, in plain words:
     - Thirty slats hang over the homepage, all seen through one shared perspective (2000 pixels),
       so the slats near the top and bottom of the window lean differently from those in the middle.
     - Each slat hangs tilted down (20 degrees) and turns counterclockwise on to 84 degrees over 3 seconds, the way slats open when the string is pulled (the browser's "ease"),
       about its own middle. As it turns, a darker band across its top grows from 14 per cent of
       its depth to 80 per cent, so the slat reads as tipping away.
     - The homepage shows through the widening gaps the whole time. There is no darkness and no
       light: what is behind the blind is simply the page.
     - The whole blind holds fully solid for the first 0.9 seconds, then fades to nothing by
       3 seconds ("ease"). No grain: the blind is as clean as the page under it.
     - No ladder tapes (Reach's ruling, November 9, 2026).
   The blind begins absolutely closed: each slat is a little deeper than its share of the window
   (4.1 per cent against 3.33, the first raised half a per cent), so the slats overlap and no light shows until they turn.
   Homepage only, once per visit, never with Still pressed or when the device asks for less motion.
   Clicks pass straight through, it is hidden from screen readers, and it removes itself at 3 seconds.
   window.ppBlindsPlay() plays it again; pass a moment in milliseconds to hold it still there.   */
(function () {
  var KEY = 'pp-blinds-seen';
  var SLATS = 30;
  var TOTAL = 3000;

  function calm() {
    if (document.documentElement.classList.contains('pp-still')) return true;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function seen() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function mark() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }
  function isHome() { var p = location.pathname; return p === '/' || p === '/' || p === ''; }

  var CSS =
    '.pp-door{position:fixed;inset:0;z-index:2147483000;pointer-events:none;}' +
    '.pp-door__wrap{width:100%;height:100%;font-size:0;overflow:hidden;perspective:2000px;}' +
    /* a slat: matte ink, a light edge all round like the original's pale border, a shadow beneath */
    '.pp-door__slat{position:absolute;left:0;display:block;box-sizing:border-box;width:100%;height:4.1%;' +
      'border:1px solid #2c2119;border-top-color:rgba(138,90,36,.45);' +
      'background:linear-gradient(to bottom,#221a15 0%,#221a15 16%,#1d1612 32%,#17110d 69%,#0f0a08 100%);' +
      'box-shadow:0 3px 7px 0 rgba(0,0,0,.55);transform:rotateX(20deg);will-change:transform;}' +
    /* the band across the slat's top, a shade darker, which grows as the slat turns */
    '.pp-door__band{position:absolute;top:0;left:0;width:100%;height:14%;background:#130e0b;' +
      'box-shadow:0 1px 9px rgba(0,0,0,.35);}';

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'pp-door';
    wrap.setAttribute('aria-hidden', 'true');
    var style = document.createElement('style');
    style.textContent = CSS;
    wrap.appendChild(style);
    var inner = document.createElement('div');
    inner.className = 'pp-door__wrap';
    var slats = [], bands = [];
    for (var i = 0; i < SLATS; i++) {
      var s = document.createElement('div');
      s.className = 'pp-door__slat';
      s.style.top = (i * 100 / SLATS - 0.5) + '%';
      var b = document.createElement('div');
      b.className = 'pp-door__band';
      s.appendChild(b);
      inner.appendChild(s);
      slats.push(s); bands.push(b);
    }
    wrap.appendChild(inner);
    return { wrap: wrap, slats: slats, bands: bands };
  }

  function run(force, freezeAt) {
    if (!force && (seen() || !isHome())) return null;
    if (calm()) return null;
    if (!Element.prototype.animate) return null;
    var old = document.querySelector('.pp-door');
    if (old) old.remove();

    var b = build();
    (document.body || document.documentElement).appendChild(b.wrap);
    mark();
    var anims = [];

    /* the slats start tilted down and turn open, 20 degrees to 84, counterclockwise, over 3 seconds */
    b.slats.forEach(function (s) {
      anims.push(s.animate([
        { transform: 'rotateX(20deg)' },
        { transform: 'rotateX(84deg)' }
      ], { duration: TOTAL, easing: 'ease', fill: 'forwards' }));
    });
    /* the band across each slat grows as it turns */
    b.bands.forEach(function (d) {
      anims.push(d.animate([
        { height: '14%', boxShadow: '0 1px 9px rgba(0,0,0,.35)' },
        { height: '80%', boxShadow: '0 1px 20px rgba(0,0,0,.35)' }
      ], { duration: TOTAL, easing: 'ease', fill: 'forwards' }));
    });
    /* the whole blind holds solid until 0.9 seconds, then fades to nothing by 3 */
    var fade = b.wrap.animate([
      { offset: 0, opacity: 1 },
      { offset: 0.3, opacity: 1, easing: 'ease' },
      { offset: 1, opacity: 0 }
    ], { duration: TOTAL, fill: 'forwards' });
    anims.push(fade);
    fade.onfinish = function () { b.wrap.remove(); };

    if (typeof freezeAt === 'number') {
      anims.forEach(function (a) { a.pause(); a.currentTime = Math.min(freezeAt, a.effect.getTiming().duration); });
    }
    return anims;
  }

  window.ppBlindsPlay = function (freezeAt) { return run(true, freezeAt); };
  run(false);
})();
