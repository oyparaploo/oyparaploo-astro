/* The Noguchi split (preview, October 23, 2026): the left panel follows the header as it slides away and back,
   marks the volume going past, and jumps to a volume when its name is chosen. Nothing turns by itself. */
(function () {
  var split = document.getElementById('split');
  if (!split) return;
  var left = document.getElementById('split-left');
  var links = Array.prototype.slice.call(split.querySelectorAll('.split-names a[data-to]'));
  var entries = Array.prototype.slice.call(split.querySelectorAll('.split-entry'));
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var phone = window.matchMedia('(max-width: 768px)');

  /* The panel sits under the header while the header shows, and rises to the top when it slides away. */
  var header = document.querySelector('header.site-header');
  function follow() {
    var on = header && header.classList.contains('is-pinned') && !header.classList.contains('is-hidden');
    split.style.setProperty('--top', on ? header.offsetHeight + 'px' : '0px');
  }
  if (header) new MutationObserver(follow).observe(header, { attributes: true, attributeFilter: ['class'] });
  follow();

  /* The volume going past: the one crossing a line a little above the middle of the window. */
  var here = null;
  function mark(id) {
    if (id === here) return;
    here = id;
    links.forEach(function (a) {
      var on = a.getAttribute('data-to') === id;
      a.parentNode.classList.toggle('is-here', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      if (on && !phone.matches && left.scrollHeight > left.clientHeight + 2) {
        var r = a.getBoundingClientRect(), p = left.getBoundingClientRect();
        if (r.top < p.top + 24 || r.bottom > p.bottom - 24) {
          left.scrollTo({ top: left.scrollTop + (r.top - p.top) - left.clientHeight / 2, behavior: still.matches ? 'auto' : 'smooth' });
        }
      }
    });
  }
  function pick() {
    var line = window.innerHeight * 0.42, best = null;
    for (var i = 0; i < entries.length; i++) {
      var r = entries[i].getBoundingClientRect();
      if (r.top <= line) best = entries[i]; else break;
    }
    if (!best && entries.length && entries[0].getBoundingClientRect().top < window.innerHeight) best = entries[0];
    mark(best ? best.id : null);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; pick(); });
  }, { passive: true });
  window.addEventListener('resize', pick);
  pick();

  /* A name chosen: go to its volume. Every picture's place is kept before it loads, so the jump lands true. */
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.getElementById(a.getAttribute('data-to'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', '#' + target.id);
      mark(target.id);
    });
  });
})();
