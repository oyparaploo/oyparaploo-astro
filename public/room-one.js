/* Come In: the list beside each writing shows which part is being read
   (a solid bar beside it). A tap on a part glides there (the page's own smooth scroll). */
(function () {
  var lists = document.querySelectorAll('.parts-list');
  if (!lists.length || !('IntersectionObserver' in window)) return;
  var links = {};
  Array.prototype.forEach.call(document.querySelectorAll('.parts-list a'), function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  var parts = document.querySelectorAll('.w-part');
  function mark() {
    var line = window.innerHeight * 0.35, best = null;
    Array.prototype.forEach.call(parts, function (p) {
      var r = p.getBoundingClientRect();
      if (r.top <= line && r.bottom > 0) best = p;
    });
    Array.prototype.forEach.call(lists, function (l) {
      Array.prototype.forEach.call(l.querySelectorAll('a'), function (a) { a.classList.remove('is-here'); });
    });
    if (best && links[best.id]) {
      var sec = best.closest('.reading'), here = links[best.id];
      if (sec && sec.getBoundingClientRect().bottom > line) here.classList.add('is-here');
    }
  }
  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return; queued = true;
    requestAnimationFrame(function () { queued = false; mark(); });
  }, { passive: true });
  window.addEventListener('resize', mark);
  mark();
})();
