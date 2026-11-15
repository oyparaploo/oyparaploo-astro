/* The pinned photograph on Placings set pages (preview SET-PINNED-WHOLE-2026-11-13).
   - Pointing at a small photograph, or reaching it with the keyboard, shows it large in the left half, with its
     catalogue number; the large one changes with a quarter-second fade (none with Still on or less motion: set-pinned.css).
   - Pressing a small photograph opens its page, as today. Pressing the large one opens the page of the one showing.
   - On arrival the large photograph is the set's first. Narrow screens: nothing here runs; today's page.
   - Without the script the page still works: the large photograph shows the first, and every small one is a link. */
(function () {
  var root = document.querySelector('.sp');
  if (!root) return;
  var wide = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : { matches: true };
  var link = root.querySelector('.sp-link');
  var numA = root.querySelector('.sp-num a');
  var imgs = [].slice.call(root.querySelectorAll('.sp-img'));
  var tiles = [].slice.call(root.querySelectorAll('.gi-tile'));
  if (!link || imgs.length !== 2 || !tiles.length) return;

  var front = imgs[0].classList.contains('is-in') ? imgs[0] : imgs[1];
  var back = front === imgs[0] ? imgs[1] : imgs[0];
  var cur = tiles[0];
  cur.classList.add('is-shown');

  function full(tile) { return tile.querySelector('img').getAttribute('src').replace(/-600\.webp$/, '.webp'); }
  function num(tile) { return (tile.id || '').replace(/^cat-/, ''); }

  function show(tile) {
    if (!wide.matches || tile === cur) return;
    cur.classList.remove('is-shown');
    cur = tile; tile.classList.add('is-shown');
    var href = tile.getAttribute('href');
    link.setAttribute('href', href);
    numA.setAttribute('href', href);
    numA.textContent = num(tile);
    var src = full(tile);
    var alt = tile.querySelector('img').getAttribute('alt') || '';
    var swap = function () {
      if (cur !== tile) return;
      back.setAttribute('alt', alt); back.removeAttribute('aria-hidden'); back.classList.add('is-in');
      front.classList.remove('is-in'); front.setAttribute('aria-hidden', 'true'); front.setAttribute('alt', '');
      var t = front; front = back; back = t;
    };
    if (back.getAttribute('src') === src && back.complete && back.naturalWidth) { swap(); return; }
    back.onload = function () { back.onload = null; swap(); };
    back.setAttribute('src', src);
    if (back.complete && back.naturalWidth) { back.onload = null; swap(); }
  }

  var touch = false;
  tiles.forEach(function (tile) {
    tile.addEventListener('pointerdown', function (e) { touch = e.pointerType === 'touch'; });
    tile.addEventListener('mouseenter', function () { if (!touch) show(tile); });
    tile.addEventListener('focus', function () { show(tile); });
  });

  /* The large photographs, fetched quietly once the page has arrived, so pointing changes at once. */
  var warm = function () {
    if (!wide.matches) return;
    tiles.forEach(function (t, i) { setTimeout(function () { var im = new Image(); im.src = full(t); }, i * 60); });
  };
  if (document.readyState === 'complete') setTimeout(warm, 300); else window.addEventListener('load', function () { setTimeout(warm, 300); });
})();
