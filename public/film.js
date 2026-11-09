/* The film page (preview, November 8, 2026). The video never plays by itself: it shows its still frame until
   the visitor presses play or presses one of the nine frames. Then it plays with sound and the browser's own
   plain controls. A frame starts the video at that frame's exact second. While the film plays, the frame of
   the stretch it has reached carries a thin light line. */
(function () {
  var screen = document.querySelector('.fm-screen');
  if (!screen) return;
  var video = screen.querySelector('video');
  var play = screen.querySelector('.fm-play');
  var strips = document.querySelector('.fm-strips');
  var frames = Array.prototype.slice.call(document.querySelectorAll('.fm-frame'));
  var times = frames.map(function (f) { return parseFloat(f.getAttribute('data-seconds')) || 0; });
  var length = parseFloat(screen.getAttribute('data-seconds')) || 0;

  function calm() {
    if (window.ppCalm) return window.ppCalm();
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function begin(at) {
    screen.classList.add('is-playing');
    video.controls = true;
    function go() {
      if (typeof at === 'number') { try { video.currentTime = at; } catch (e) {} }
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
    if (video.readyState >= 1) go();
    else video.addEventListener('loadedmetadata', go, { once: true });
  }

  play.addEventListener('click', function () { begin(); video.focus({ preventScroll: true }); });

  frames.forEach(function (f, i) {
    f.addEventListener('click', function () {
      begin(times[i]);
      var r = screen.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        screen.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' });
      }
    });
  });

  // Which of the nine stretches the film is in: each frame stands for its own ninth of the film.
  function mark() {
    var t = video.currentTime;
    var n = frames.length;
    var part = (length || video.duration || 1) / n;
    var k = Math.min(n - 1, Math.max(0, Math.floor(t / part)));
    frames.forEach(function (f, i) { f.classList.toggle('is-now', i === k); });
  }
  video.addEventListener('timeupdate', mark);
  video.addEventListener('seeked', mark);
  video.addEventListener('play', function () { strips.classList.add('is-playing'); mark(); });
  video.addEventListener('pause', function () { strips.classList.remove('is-playing'); });
  video.addEventListener('ended', function () {
    strips.classList.remove('is-playing');
    frames.forEach(function (f) { f.classList.remove('is-now'); });
  });
})();
