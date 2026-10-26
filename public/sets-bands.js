/* The picture-sets page: the opening's names and triangles, the glide, and the drifting bands.
   Preview, October 16, 2026. */
(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* The opening fills the window under the date strip and the header. */
  function chrome() {
    var open = document.querySelector('.sets-open');
    if (!open) return;
    var top = open.getBoundingClientRect().top + window.pageYOffset;
    document.documentElement.style.setProperty('--chrome-h', Math.round(top) + 'px');
  }
  chrome();
  window.addEventListener('load', chrome);
  window.addEventListener('resize', chrome);

  /* A triangle opens its set's list in place; one list open at a time. */
  var tris = document.querySelectorAll('.om-tri');
  /* A triangle's spoken label: "Show ..." while its list is shut, "Hide ..." while it is open; the rest of
     the words are the page's own. A triangle shut by another says "Show ..." again (the fifteenth cleanup). */
  function say(t, open) {
    t.setAttribute('aria-label', (t.getAttribute('aria-label') || '').replace(/^(Show|Hide)\b/, open ? 'Hide' : 'Show'));
  }
  function shut(except) {
    for (var i = 0; i < tris.length; i++) {
      if (tris[i] === except) continue;
      tris[i].setAttribute('aria-expanded', 'false');
      say(tris[i], false);
      document.getElementById(tris[i].getAttribute('aria-controls')).hidden = true;
    }
  }
  for (var i = 0; i < tris.length; i++) {
    tris[i].addEventListener('click', function () {
      var open = this.getAttribute('aria-expanded') === 'true';
      shut(this);
      this.setAttribute('aria-expanded', open ? 'false' : 'true');
      document.getElementById(this.getAttribute('aria-controls')).hidden = open;
      say(this, !open);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    for (var i = 0; i < tris.length; i++) {
      if (tris[i].getAttribute('aria-expanded') === 'true') { shut(null); tris[i].focus(); }
    }
  });

  /* Choosing a name glides to its band (straight there for less motion). */
  var names = document.querySelectorAll('.om-name, .arrow-up');
  for (var n = 0; n < names.length; n++) {
    names[n].addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      var to = document.getElementById(id);
      if (!to) return;
      e.preventDefault();
      var y = to.getBoundingClientRect().top + window.pageYOffset - (id === 'top' ? 0 : 24);
      if (id === 'top') y = 0;
      window.scrollTo({ top: y, behavior: still.matches ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', '#' + id);
      var band = to.classList.contains('band') ? to : null;
      if (band) setTimeout(function () { band.focus({ preventScroll: true }); }, still.matches ? 0 : 700);
    });
  }

  /* The bands: each photograph drifts slowly inside its band as the page scrolls. */
  var bands = [].slice.call(document.querySelectorAll('.band'));
  var ticking = false;
  function drift() {
    ticking = false;
    var vh = window.innerHeight;
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i], pic = b.firstElementChild;
      if (still.matches) { pic.style.transform = ''; continue; }
      var r = b.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue;
      var travel = pic.offsetHeight - r.height;
      var p = (vh - r.top) / (vh + r.height);
      p = Math.max(0, Math.min(1, p));
      pic.style.transform = 'translate3d(0,' + (-travel * p).toFixed(1) + 'px,0)';
    }
  }
  function ask() { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }
  window.addEventListener('scroll', ask, { passive: true });
  window.addEventListener('resize', ask);
  window.addEventListener('load', ask);
  if (still.addEventListener) still.addEventListener('change', ask);
  drift();
})();
