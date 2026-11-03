/* signs.js -- the Paraploo signs (SITE-ORDER\SIGNS-BUILD, November 2, 2026; ruled in claude/SIGNS-RULED-2026-10-30.md).
   The previews' shared script (pp-sign-script), word for word: each sign builds once as it scrolls into view
   and builds again on hover. Loaded at the foot of each room that carries a sign. */
(function () {
  var STEP = 0.45, DUR = 0.55, timers = new WeakMap();
  function lum(hex) {
    var m = hex.replace('#', '');
    if (m.length === 3) m = m.split('').map(function (x) { return x + x; }).join('');
    var v = [0, 2, 4].map(function (i) {
      var s = parseInt(m.substr(i, 2), 16) / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function prepareTone(svg) {
    var parts = Array.prototype.slice.call(svg.querySelectorAll('g.part'));
    parts.sort(function (a, b) { return lum(b.getAttribute('fill')) - lum(a.getAttribute('fill')); });
    parts.forEach(function (g, i) { g.style.setProperty('--d', (i * STEP).toFixed(2) + 's'); });
    svg.dataset.end = ((parts.length - 1) * STEP + DUR).toFixed(2);
  }
  function play(svg) {
    clearTimeout(timers.get(svg));
    svg.classList.remove('go', 'done');
    void svg.getBoundingClientRect();
    svg.classList.add('go');
    timers.set(svg, setTimeout(function () { svg.classList.add('done'); }, parseFloat(svg.dataset.end) * 1000));
  }
  var signs = document.querySelectorAll('.pp-sign .sign');
  signs.forEach(function (svg) {
    if (svg.classList.contains('tone')) prepareTone(svg);
    svg.addEventListener('mouseenter', function () { play(svg); });
  });
  if (!('IntersectionObserver' in window)) { signs.forEach(play); return; }
  var seen = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { play(e.target); seen.unobserve(e.target); } });
  }, { threshold: 0.5 });
  signs.forEach(function (svg) { seen.observe(svg); });
})();
