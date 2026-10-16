/* The Marks picture sets band (October 16, 2026). Pointing at a set (or reaching it with the keyboard)
   swaps the drawing above the glass to that set's drawing. Nothing turns by itself. Touch and phones
   get no swap: each set is a link, and a tap opens it. Less motion gets the plain swap (the CSS drops
   the fades). */
(function () {
  var band = document.querySelector('.pm-band');
  if (!band) return;
  var choices = band.querySelectorAll('.pm-choice');
  var pics = band.querySelectorAll('.pm-pic');
  var hazes = band.querySelectorAll('.pm-haze');
  var num = band.querySelector('.pm-num a');
  var link = band.querySelector('.pm-pic-link');
  var pointer = window.matchMedia('(hover: hover) and (min-width: 701px)');
  var current = 0;
  function show(i) {
    if (i === current && band.classList.contains('is-pointing')) return;
    current = i;
    band.classList.add('is-pointing');
    for (var k = 0; k < choices.length; k++) {
      var on = k === i;
      choices[k].classList.toggle('is-on', on);
      if (pics[k]) pics[k].classList.toggle('is-on', on);
      if (hazes[k]) hazes[k].classList.toggle('is-on', on);
    }
    var c = choices[i];
    if (num) { num.textContent = c.getAttribute('data-num-words'); num.setAttribute('href', c.getAttribute('href')); }
    if (link) link.setAttribute('href', c.getAttribute('href'));
  }
  // With a pointer, the first set starts lit, so the drawing above is plainly the first set's.
  if (pointer.matches) { current = -1; show(0); }
  for (var k = 0; k < choices.length; k++) {
    (function (i) {
      choices[i].addEventListener('mouseenter', function () { if (pointer.matches) show(i); });
      choices[i].addEventListener('focus', function () { if (pointer.matches) show(i); });
    })(k);
  }
})();
