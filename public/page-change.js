/* Smooth page changes (preview, PAGE-CHANGE-WHOLE-2026-10-25).
   A small picture that is a link to its own picture page grows into that page's picture when clicked,
   (in the hung room, clicking the catalogue number under a picture grows that picture),
   and the picture shrinks back into its place when the visitor returns to that page.
   Only the picture clicked grows; the arrows between pictures keep their plain fade.
   Browsers without page changes (Firefox for now) skip all of this and load pages as before. */
(function () {
  if (!('onpagereveal' in window) || !window.navigation) return;
  var NAME = 'pp-picture', KEY = 'pp-grow', clicked = null;

  function norm(u) {
    try {
      var p = new URL(u, location.href);
      if (p.origin !== location.origin) return '';
      return p.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
    } catch (e) { return ''; }
  }
  function isPicture(p) { return /\/\d{4,5}$/.test(p); }
  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  }
  // The picture a link stands for: the picture inside it, or, in the hung room, where the
  // catalogue number under a picture is the link, the picture in the same frame.
  function pictureFor(a) {
    var img = a.querySelector('img');
    if (!img) { var f = a.closest('figure'); if (f) img = f.querySelector('img'); }
    return img;
  }
  function setKey(v) { try { if (v) sessionStorage.setItem(KEY, v); else sessionStorage.removeItem(KEY); } catch (e) {} }
  function getKey() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } }
  function name(el) { el.style.viewTransitionName = NAME; el.setAttribute('data-pp-named', ''); }
  // A gallery frame can be wider or taller than the picture shown whole inside it. For the moment
  // of the change the frame is fitted to the picture, so the picture grows as one clean shape.
  // On the page being arrived at only the width is fitted, so nothing below it moves.
  function fit(img, heightToo) {
    if (!img.naturalWidth || getComputedStyle(img).objectFit !== 'contain') return;
    var r = img.getBoundingClientRect(), ar = img.naturalWidth / img.naturalHeight;
    if (!r.width || !r.height) return;
    if (r.width / r.height > ar * 1.01) {
      img.style.width = (r.height * ar) + 'px';
      img.setAttribute('data-pp-sized', '');
    } else if (heightToo && r.width / r.height < ar / 1.01) {
      img.style.height = (r.width / ar) + 'px';
      img.setAttribute('data-pp-sized', '');
    }
  }
  function clearNames() {
    var n = document.querySelectorAll('[data-pp-named]');
    for (var i = 0; i < n.length; i++) { n[i].style.viewTransitionName = ''; n[i].removeAttribute('data-pp-named'); }
    n = document.querySelectorAll('[data-pp-sized]');
    for (i = 0; i < n.length; i++) { n[i].style.width = ''; n[i].style.height = ''; n[i].removeAttribute('data-pp-sized'); }
  }

  document.addEventListener('click', function (e) {
    clicked = (e.target && e.target.closest) ? e.target.closest('a[href]') : null;
  }, true);

  window.addEventListener('pageswap', function (e) {
    var a = clicked; clicked = null; setKey(null);
    if (!e.viewTransition || !e.activation || !e.activation.entry) return;
    var to = norm(e.activation.entry.url);
    var main = document.getElementById('work-main-pic');
    var img = (a && isPicture(to) && norm(a.href) === to) ? pictureFor(a) : null;
    if (img && img !== main && img.complete && img.naturalWidth && inView(img)) {
      if (main) main.style.viewTransitionName = 'none';
      fit(img, true);
      name(img);
      setKey(to);
      return;
    }
    if (main && !isPicture(to) && inView(main)) name(main);
  });

  window.addEventListener('pagereveal', function (e) {
    var key = getKey(); setKey(null);
    if (!e.viewTransition) return;
    var here = norm(location.href);
    var main = document.getElementById('work-main-pic');
    if (main) {
      if (key === here) name(main);
    } else {
      var act = navigation.activation, from = act && act.from ? norm(act.from.url) : '';
      if (isPicture(from)) {
        var links = document.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
          if (norm(links[i].href) !== from) continue;
          var img = pictureFor(links[i]);
          if (img && inView(img)) { fit(img, false); name(img); break; }
        }
      }
    }
    e.viewTransition.finished.then(clearNames, clearNames);
  });

  window.addEventListener('pageshow', function (e) { if (e.persisted) clearNames(); });
})();

/* The pictures themselves open their pages (preview, PAGE-CHANGE-WHOLE-2026-10-25).
   In the hung room only the catalogue number under a picture was a link. Here the picture leads to the
   same page as its number. The number stays the link a keyboard or a screen reader uses, so the picture's
   link is skipped by Tab and not read twice. In the build this goes into the gallery template itself. */
(function () {
  function linkPictures() {
    var figs = document.querySelectorAll('figure.hung-item');
    for (var i = 0; i < figs.length; i++) {
      var num = figs[i].querySelector('figcaption a[href]');
      var img = figs[i].querySelector('img');
      if (!num || !img || img.closest('a')) continue;
      var a = document.createElement('a');
      a.href = num.getAttribute('href');
      a.className = 'hung-picture-link';
      a.tabIndex = -1;
      a.setAttribute('aria-hidden', 'true');
      a.style.display = 'block';
      a.style.cursor = 'pointer';
      img.parentNode.insertBefore(a, img);
      a.appendChild(img);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', linkPictures);
  else linkPictures();
})();
