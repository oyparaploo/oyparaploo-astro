/* Come Sit: the counts are kept by hand. When the line that counts them is reached, the tally
   draws itself in under a second, and at the treeline the one damp mark comes up. Visitors who ask
   for less motion, and pages without this script, see every mark already there. */
(function () {
  var marks = document.querySelectorAll('.tally, .damp');
  if (!marks.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('counting');
  var seen = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('is-counted');
        seen.unobserve(entries[i].target);
      }
    }
  }, { rootMargin: '0px 0px -15% 0px' });
  for (var j = 0; j < marks.length; j++) seen.observe(marks[j]);
})();
