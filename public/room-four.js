/* Come Look. Two plays, both from the writing.
   1. "Take any page and remove all the text from it. Look at what is left standing." The button takes every
      word on the page away and brings it back; Escape brings the words back too. Without this script the
      button never shows.
   2. "One alternates, light and dark, as a visitor moves through it." That room goes dark while it passes the
      middle of the window, and light again after. */
(function () {
  var root = document.documentElement;
  var toggles = document.querySelectorAll('.words-toggle');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fade = 0;
  function set(off) {
    if (!still) {
      root.classList.add('words-fade');
      clearTimeout(fade);
      fade = setTimeout(function () { root.classList.remove('words-fade'); }, 700);
    }
    root.classList.toggle('wordless', off);
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].setAttribute('aria-pressed', off ? 'true' : 'false');
      if (!toggles[i].classList.contains('words-back')) {
        toggles[i].textContent = off ? 'Bring the words back' : 'Take the words away';
      }
    }
  }
  for (var j = 0; j < toggles.length; j++) {
    toggles[j].hidden = false;
    toggles[j].addEventListener('click', function () { set(!root.classList.contains('wordless')); });
  }
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && root.classList.contains('wordless')) set(false);
  });

  // The room is dark while its middle crosses the middle of the window: light as it comes up, dark as it
  // passes, light again as it goes.
  var alt = document.querySelector('.light-alt');
  if (alt && 'IntersectionObserver' in window) {
    var middle = document.createElement('span');
    middle.className = 'alt-middle';
    middle.setAttribute('aria-hidden', 'true');
    alt.appendChild(middle);
    new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) alt.classList.toggle('is-dark', entries[k].isIntersecting);
    }, { rootMargin: '-36% 0px -36% 0px' }).observe(middle);
  }
})();
