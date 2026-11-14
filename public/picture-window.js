/* The picture window above a list of names (preview PICTURE-WINDOW-WHOLE-2026-11-13; piece 3 of
   claude/TWO-INFLUENCES-PLAN-2026-11-13.md, from Back in the Dayz).
   - Pointing at a name, or reaching it with the keyboard, shows its picture in the window, its name and count in the
     caption, and points the window's link at its page. A click on a name opens its page.
   - Touch: the first tap on a name changes the picture; a second tap on the same name opens its page. A tap on the
     window opens the page of the name showing.
   - The picture fades in over a quarter second; with Still on, or for visitors who ask for less motion, at once
     (picture-window.css: html.pp-still, set by still.js, and prefers-reduced-motion both take the fade off).
   - Without the script the page still works: the window shows the first name, and every name is a link. */
(function () {
  var root = document.querySelector('.pw');
  if (!root) return;
  var win = root.querySelector('.pw-window');
  var pic = root.querySelector('.pw-pic');
  var capName = root.querySelector('.pw-name');
  var capCount = root.querySelector('.pw-count');
  var rows = [].slice.call(root.querySelectorAll('.pw-row'));
  if (!win || !pic || !rows.length) return;

  /* Still and less motion are handled in picture-window.css (html.pp-still and prefers-reduced-motion): no fade. */

  /* the large picture of each name, fetched once, quietly, after the page has arrived */
  var ready = {};
  function fetchFull(row) {
    var full = row.getAttribute('data-full');
    if (!full || ready[full]) return;
    ready[full] = 'loading';
    var im = new Image();
    im.onload = function () { ready[full] = 'yes'; if (cur === row) show(row, true); };
    im.onerror = function () { ready[full] = 'no'; };
    im.src = full;
  }

  var front = pic.querySelector('.pw-img.is-in') || pic.querySelector('.pw-img');
  var back = [].slice.call(pic.querySelectorAll('.pw-img')).filter(function (i) { return i !== front; })[0];
  var cur = rows.filter(function (r) { return r.classList.contains('is-current'); })[0] || rows[0];

  function srcFor(row) {
    var full = row.getAttribute('data-full');
    return ready[full] === 'yes' ? full : row.getAttribute('data-thumb');
  }

  function show(row, upgrade) {
    var s = srcFor(row);
    if (upgrade) {                       /* the same name, its large picture now here: swap in place, no fade */
      if (front.getAttribute('src') !== s) front.setAttribute('src', s);
      return;
    }
    back.setAttribute('alt', row.getAttribute('data-alt') || '');
    var swap = function () {
      back.classList.add('is-in'); back.removeAttribute('aria-hidden');
      front.classList.remove('is-in'); front.setAttribute('aria-hidden', 'true'); front.setAttribute('alt', '');
      var t = front; front = back; back = t;
    };
    if (back.getAttribute('src') === s && back.complete) { swap(); return; }
    back.onload = function () { back.onload = null; if (cur === row) swap(); };
    back.setAttribute('src', s);
    if (back.complete && back.naturalWidth) { back.onload = null; swap(); }
  }

  function setCurrent(row) {
    if (row === cur) return;
    cur.classList.remove('is-current'); cur.removeAttribute('aria-current');
    cur = row; row.classList.add('is-current'); row.setAttribute('aria-current', 'true');
    win.setAttribute('href', row.getAttribute('href'));
    capName.textContent = row.querySelector('.pw-row-name').textContent;
    capCount.innerHTML = row.querySelector('.pw-row-count').innerHTML;
    show(row, false);
    fetchFull(row);
  }

  var lastPointer = 'mouse';
  rows.forEach(function (row) {
    row.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType || 'mouse'; });
    row.addEventListener('mouseenter', function () { if (lastPointer !== 'touch') setCurrent(row); });
    row.addEventListener('focus', function () { if (lastPointer !== 'touch') setCurrent(row); });
    row.addEventListener('click', function (e) {
      var touch = lastPointer === 'touch' || lastPointer === 'pen' ||
                  (window.matchMedia && window.matchMedia('(hover: none)').matches && e.detail > 0);
      if (touch && row !== cur) { e.preventDefault(); setCurrent(row); }
      lastPointer = 'mouse';
    });
  });

  /* The large pictures: the one showing at once, the rest after the page has arrived. */
  fetchFull(cur);
  var rest = function () { rows.forEach(fetchFull); };
  if (document.readyState === 'complete') setTimeout(rest, 300); else window.addEventListener('load', function () { setTimeout(rest, 300); });
})();
