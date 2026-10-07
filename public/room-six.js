/* Come Down. Two plays, each from the writing.
   1. The ten: a numbered list of names runs one panel. The puppet chosen stands in the panel whole, and the
      walls take its colour. On a phone the panel opens under the name tapped. Without this script all ten stand
      one under another, and every name leads to its puppet.
   2. The walls give light, and the light pays attention: "It brightens when the puppets are joyful. It goes dim
      when the weight arrives." As the visitor reads, the walls take the colour and brightness the part being
      read carries (data-wall, data-k). When the third act is reached ("the puppets go one at a time into spores
      of light, and the walls pulse"), the walls take the ten puppets' colours one at a time, then pulse once,
      and settle. Once only.
   Visitors who ask for less motion keep the selector, and the walls rest in a quiet foxfire. */
(function () {
  var root = document.documentElement;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var walls = document.querySelector('.down .walls');
  var blooms = walls ? walls.querySelectorAll('.bloom') : [];
  var MAX = 0.22;                  // the brightest the walls go: every word over them keeps 7 to 1 or better
  var holding = false;             // true while the third act's spores are passing

  function light(colours, k) {
    if (!walls || still) return;
    for (var i = 0; i < blooms.length; i++) blooms[i].style.backgroundColor = colours[i] || colours[0];
    walls.style.opacity = (MAX * k).toFixed(3);
  }
  function wallOf(el, attr) {
    return [(el.getAttribute(attr) || '#5FD39A').split(' '), parseFloat(el.getAttribute('data-k') || '0.5')];
  }

  // ---------- 1. the ten ----------
  var cast = document.querySelector('.cast');
  var puppets = cast ? cast.querySelectorAll('.puppet') : [];
  var chosen = 0;
  var wide = window.matchMedia('(min-width: 1000px)');
  function choose(i, how) {
    var row = puppets[i].querySelector('.cast-row');
    var before = row.getBoundingClientRect().top;
    chosen = i;
    for (var j = 0; j < puppets.length; j++) {
      var on = j === i;
      puppets[j].classList.toggle('is-on', on);
      puppets[j].querySelector('.cast-row').setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    if (current === cast && !holding) { var w = wallOf(puppets[i], 'data-glow'); light(w[0], w[1]); }
    if (wide.matches || !how) return;
    // On a phone the panel opens under its name, and the one above closes. A tapped name stays where the finger
    // left it; "Next" brings the next name up to the top of the window.
    if (how === 'row') window.scrollBy({ top: row.getBoundingClientRect().top - before, behavior: 'instant' });
    else row.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' });
  }
  if (puppets.length) {
    root.classList.add('cast-on');
    var byId = {};
    for (var p = 0; p < puppets.length; p++) {
      (function (i) {
        var row = puppets[i].querySelector('.cast-row');
        byId[row.getAttribute('aria-controls')] = i;
        row.addEventListener('click', function (e) { e.preventDefault(); choose(i, 'row'); });
        var next = puppets[i].querySelector('.cast-next');
        if (next) next.addEventListener('click', function (e) {
          e.preventDefault();
          choose(i + 1, 'next');
          if (wide.matches) puppets[i + 1].querySelector('.cast-row').focus({ preventScroll: true });
        });
      })(p);
    }
    var want = byId[(location.hash || '').slice(1)];
    choose(want === undefined ? 0 : want, '');
  }

  // ---------- 2. the walls follow the reading ----------
  var current = null;
  if (still || !walls || !('IntersectionObserver' in window)) return;
  var parts = [].slice.call(document.querySelectorAll('.down [data-wall]'));
  if (cast) parts.push(cast);
  parts.sort(function (a, b) { return a.compareDocumentPosition(b) & 2 ? 1 : -1; });
  var third = document.querySelector('.act-3');
  var spent = false, waiting = 0;
  function inView() {
    var t3 = third.getBoundingClientRect();
    return t3.top >= 0 && t3.bottom <= window.innerHeight && t3.top < window.innerHeight * 0.7;
  }

  function pick() {
    ticking = false;
    if (!spent && third && inView() && !waiting) {
      // the third act whole in the window for most of a second: the visitor is reading it, not passing by
      waiting = setTimeout(function () { waiting = 0; if (!spent && inView()) { current = third; spores(); } }, 700);
    }
    var line = window.innerHeight * 0.45, best = null, gap = Infinity;
    for (var i = 0; i < parts.length; i++) {
      var r = parts[i].getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = r.top <= line && r.bottom >= line ? 0 : Math.min(Math.abs(r.top - line), Math.abs(r.bottom - line));
      if (d < gap) { gap = d; best = parts[i]; }
    }
    if (!best || best === current) return;
    current = best;
    if (holding) return;
    var w = best === cast ? wallOf(puppets[chosen], 'data-glow') : wallOf(best, 'data-wall');
    light(w[0], w[1]);
  }
  var ticking = false;
  function ask() { if (!ticking) { ticking = true; requestAnimationFrame(pick); } }

  // the third act: the ten go one at a time into spores of light, and the walls pulse
  function spores() {
    spent = true; holding = true;
    walls.classList.add('quick');
    var i = 0;
    var step = function () {
      if (i < puppets.length) {
        var w = wallOf(puppets[i], 'data-glow');
        light(w[0], 0.8);
        i++;
        setTimeout(step, 520);
      } else {
        walls.classList.remove('quick');
        var f = wallOf(third, 'data-wall');
        light(f[0], 1);
        setTimeout(function () { holding = false; current = null; ask(); }, 1600);
      }
    };
    step();
  }

  window.addEventListener('scroll', ask, { passive: true });
  window.addEventListener('resize', ask);
  ask();
})();
