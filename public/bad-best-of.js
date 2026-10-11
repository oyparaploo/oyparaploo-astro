/* Bad Best Of: the room's own small script. Without it the page stands whole: the writings, then the pictures.
   With it: the draft's two tabs under the title show one view at a time, the writings first (an address ending
   #pictures opens the pictures); "The pictures" at the foot of the writings turns to the pictures; and the seats
   arrive as they are reached, within a second. Less motion: the seats simply stand, and nothing scrolls smoothly. */
(function () {
  'use strict';
  var root = document.documentElement;
  var room = document.querySelector('.bb-room');
  if (!room) return;
  root.classList.add('bb-js');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the two tabs ---------- */
  var tabs = room.querySelectorAll('.bb-tab');
  var views = { writings: document.getElementById('writings'), pictures: document.getElementById('pictures') };
  var bar = room.querySelector('.bb-tabs');
  if (bar) bar.setAttribute('role', 'tablist');
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].setAttribute('role', 'tab');
    tabs[t].setAttribute('aria-controls', tabs[t].getAttribute('data-view'));
  }
  for (var k in views) if (views[k]) views[k].setAttribute('role', 'tabpanel');

  function show(name, focus) {
    if (!views[name]) name = 'writings';
    for (var v in views) if (views[v]) views[v].hidden = (v !== name);
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-view') === name;
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[i].tabIndex = on ? 0 : -1;
    }
    reveal(views[name]);
    if (focus) {
      var target = views[name];
      target.setAttribute('tabindex', '-1');
      target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    }
  }
  function fromHash() { return (location.hash === '#pictures') ? 'pictures' : 'writings'; }

  room.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-view]');
    if (!a || !room.contains(a)) return;
    e.preventDefault();
    var name = a.getAttribute('data-view');
    if (history.replaceState) history.replaceState(null, '', name === 'pictures' ? '#pictures' : location.pathname + location.search);
    /* a tab keeps the visitor where they are; the turn at the foot carries them to the top of the pictures */
    show(name, !a.classList.contains('bb-tab'));
  });
  if (bar) bar.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var cur = room.querySelector('.bb-tab[aria-selected="true"]');
    var next = (cur && cur.getAttribute('data-view') === 'writings') ? 'pictures' : 'writings';
    show(next, false);
    var nt = room.querySelector('.bb-tab[data-view="' + next + '"]'); if (nt) nt.focus();
    e.preventDefault();
  });
  window.addEventListener('hashchange', function () { show(fromHash(), false); });

  /* ---------- the seats arrive as they are reached ---------- */
  var io = (!still && 'IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('bb-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -6% 0px' }) : null;
  function reveal(view) {
    if (!view) return;
    var parts = view.querySelectorAll('.bb-will:not(.bb-in)');
    if (!io) { for (var i = 0; i < parts.length; i++) parts[i].classList.add('bb-in'); return; }
    for (var j = 0; j < parts.length; j++) io.observe(parts[j]);
    setTimeout(function () {   /* nothing waits more than about a second once it is on the screen */
      for (var n = 0; n < parts.length; n++) {
        var r = parts[n].getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) parts[n].classList.add('bb-in');
      }
    }, 900);
  }

  show(fromHash(), false);
})();
