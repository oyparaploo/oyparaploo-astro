/* ==========================================================================
   By colour (preview, October 23, 2026): behaviour.
   - Builds the bar from window.BY_COLOUR (data/colours.js, made by script).
   - Choosing a swatch (click, tap, Enter or Space; the arrow keys move along
     the bar) loads that colour's pictures (data/colour-<key>.js), turns the
     room to the colour's own tone (the band stays neutral grey), and hangs the pictures in
     the hung room, newest first: the newest one large under the colour's
     name, then wide, medium, small, repeating, 24 at a time ("Show more").
   - The address carries the colour (#blue), so a link can open on it.
   - Less motion: no fades or slides (by-colour.css); nothing turns by itself.
   ========================================================================== */
(function () {
  var COLOURS = window.BY_COLOUR || [];
  var MEDIA = 'https://media.paraploo.com/site/images/';
  var STEP = 24;
  var SIZES = ['wide', 'medium', 'small'];
  var IMG_SIZES = {
    arrival: '(max-width: 700px) 100vw, min(1336px, 100vw)',
    wide: '(max-width: 700px) 100vw, min(1336px, 100vw)',
    medium: '(max-width: 700px) 80vw, min(882px, 66vw)',
    small: '(max-width: 700px) 60vw, min(588px, 44vw)'
  };
  var root = document.documentElement;
  var bar = document.querySelector('.bc-bar');
  var room = document.querySelector('.bc-room');
  var moreWrap = document.querySelector('.bc-more');
  var moreBtn = document.querySelector('.bc-more-btn');
  var foot = document.querySelector('.bc-foot');
  var live = document.querySelector('.bc-live');
  var loaded = {}, waiting = {};
  var current = null, rows = [], shown = 0;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function byKey(k) { for (var i = 0; i < COLOURS.length; i++) if (COLOURS[i].key === k) return i; return -1; }
  function count(n) { return n.toLocaleString('en-US'); }
  function line(c) {
    // Only the count (Reach, October 23, 2026: "We don't need to say the color and go with just > 55 images.").
    return count(c.count) + (c.count === 1 ? ' image' : ' images');
  }

  // The bar.
  bar.innerHTML = COLOURS.map(function (c) {
    return '<li><button type="button" class="bc-swatch" data-key="' + c.key + '" aria-pressed="false" style="--sw:' + c.swatch + '">' +
      '<span class="bc-well" aria-hidden="true"><span class="bc-chip"></span></span><span class="bc-name">' + esc(c.name) + '</span></button></li>';
  }).join('');
  var swatches = bar.querySelectorAll('.bc-swatch');

  function src(row) {
    var full = MEDIA + row[2];
    var thumb = row[3] ? MEDIA + row[3] : full.replace(/\.webp$/, '-600.webp');
    return 'src="' + esc(full) + '" srcset="' + esc(thumb) + ' 600w, ' + esc(full) + ' 2000w"';
  }
  function figure(row, size) {
    return '<figure class="hung-item hung-' + size + '" id="cat-' + row[0] + '">' +
      '<img ' + src(row) + ' sizes="' + IMG_SIZES[size] + '" width="' + row[4] + '" height="' + row[5] + '" alt="' + esc(row[6]) + '" loading="lazy" decoding="async">' +
      '<figcaption><a class="gallery-item" href="' + esc(row[1]) + '">' + row[0] + '</a></figcaption></figure>';
  }
  function arrival(row, c) {
    return '<figure class="hung-arrival" id="cat-' + row[0] + '"><div class="hung-arrival-frame">' +
      '<a class="gallery-item" href="' + esc(row[1]) + '" aria-label="' + row[0] + '">' +
      '<img ' + src(row) + ' sizes="' + IMG_SIZES.arrival + '" width="' + row[4] + '" height="' + row[5] + '" alt="' + esc(row[6]) + '" loading="eager" fetchpriority="high" decoding="async"></a>' +
      '<div class="hung-band"><h2 class="bc-live">' + esc(c.name) + '</h2><p class="hung-line bc-count">' + esc(line(c)) + '</p></div>' +
      '</div></figure>';
  }
  function hangMore(focusFirst) {
    var end = Math.min(rows.length, shown + STEP), html = '';
    for (var i = Math.max(shown, 1); i < end; i++) html += figure(rows[i], SIZES[(i - 1) % 3]);
    var first = shown;
    room.insertAdjacentHTML('beforeend', html);
    shown = end;
    moreWrap.hidden = shown >= rows.length;
    if (focusFirst && rows[first]) {
      var a = room.querySelector('#cat-' + rows[first][0] + ' a');
      if (a) a.focus({ preventScroll: false });
    }
  }
  function setTones(c) {
    root.style.setProperty('--bc-ground-l', c.groundLight);
    root.style.setProperty('--bc-ground-d', c.groundDark);
  }
  function setFoot(i) {
    var n = COLOURS.length, prev = COLOURS[(i - 1 + n) % n], next = COLOURS[(i + 1) % n];
    foot.innerHTML =
      '<a class="arrow-link arrow-back" href="#' + prev.key + '" data-key="' + prev.key + '"><span class="arrow-glyph" aria-hidden="true">&larr;</span> ' + esc(prev.name) + '</a>' +
      '<a class="arrow-link arrow-next" href="#' + next.key + '" data-key="' + next.key + '">' + esc(next.name) + ' <span class="arrow-glyph" aria-hidden="true">&rarr;</span></a>';
  }
  function show(key) {
    var c = COLOURS[byKey(key)];
    current = key; rows = loaded[key]; shown = 0;
    room.innerHTML = rows.length ? arrival(rows[0], c) : '';
    shown = rows.length ? 1 : 0;
    hangMore(false);
    live.textContent = c.name + ', ' + line(c);
  }
  function choose(key, fromAddress) {
    var i = byKey(key);
    if (i < 0) i = 0;
    var c = COLOURS[i];
    key = c.key;
    for (var k = 0; k < swatches.length; k++) swatches[k].setAttribute('aria-pressed', swatches[k].getAttribute('data-key') === key ? 'true' : 'false');
    setTones(c);
    setFoot(i);
    document.title = (key === COLOURS[0].key && !fromAddress ? 'By color' : 'By color: ' + c.name) + ' · Paraploo';
    if (!fromAddress && location.hash !== '#' + key) history.replaceState(null, '', '#' + key);
    if (loaded[key]) { show(key); return; }
    current = key;
    if (waiting[key]) return;
    waiting[key] = true;
    var s = document.createElement('script');
    s.src = '/by-color/color-' + key + '.js';
    document.body.appendChild(s);
  }
  window.byColourArrive = function (key, data) {
    loaded[key] = data; waiting[key] = false;
    if (current === key) show(key);
  };

  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.bc-swatch');
    if (b) choose(b.getAttribute('data-key'));
  });
  bar.addEventListener('keydown', function (e) {
    var b = e.target.closest('.bc-swatch');
    if (!b) return;
    var list = Array.prototype.slice.call(swatches), i = list.indexOf(b), j = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % list.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + list.length) % list.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = list.length - 1;
    if (j < 0) return;
    e.preventDefault();
    list[j].focus();
    choose(list[j].getAttribute('data-key'));
  });
  moreBtn.addEventListener('click', function () { hangMore(true); });
  foot.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-key]');
    if (!a) return;
    e.preventDefault();
    choose(a.getAttribute('data-key'));
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector('.bc-band').scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
    var on = bar.querySelector('[aria-pressed="true"]');
    if (on) on.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', function () {
    var k = location.hash.slice(1);
    if (k && k !== current && byKey(k) >= 0) choose(k, true);
  });

  var start = location.hash.slice(1);
  choose(byKey(start) >= 0 ? start : COLOURS[0].key, byKey(start) >= 0);
})();
