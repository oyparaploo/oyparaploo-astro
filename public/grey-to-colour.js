/* Grey pictures that come into colour, on the Placings page (grey-to-colour.css).
   November 20, 2026, Reach's wish: once half of a grey picture is on the screen it takes a little of its own colour,
   and gives it back when it leaves. Only where there is a pointer; phones and tablets keep every picture in full colour. */
(function () {
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || !('IntersectionObserver' in window)) return;
  var pics = document.querySelectorAll('.placings-room .p-set-pic img, .placings-room .p-seat img');
  if (!pics.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle('is-half', e.intersectionRatio >= 0.5); });
  }, { threshold: [0.5] });
  for (var i = 0; i < pics.length; i++) io.observe(pics[i]);
})();
