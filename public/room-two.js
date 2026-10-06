/* Come Through: entries brighten as they arrive, and each room's lamp lights when the visitor
   reaches it. Once lit, a room stays lit, so the corridor fills with its lights as it is walked.
   Visitors who ask for less motion, and pages without this script, see every room lit at once. */
(function () {
  var rooms = document.querySelectorAll('.room');
  if (!rooms.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('arrival');
  function light() {
    var line = window.innerHeight * 0.82;
    for (var i = 0; i < rooms.length; i++) {
      if (!rooms[i].classList.contains('is-lit') && rooms[i].getBoundingClientRect().top < line) {
        rooms[i].classList.add('is-lit');
      }
    }
  }
  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return; queued = true;
    requestAnimationFrame(function () { queued = false; light(); });
  }, { passive: true });
  window.addEventListener('resize', light);
  window.addEventListener('hashchange', function () { setTimeout(light, 50); });
  light();
})();
