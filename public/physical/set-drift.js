/* The slow drift (preview, November 8, 2026). The drift itself is all in set-drift.css; this file only makes a
   swapped picture start its own drift from rest. When the band's script lights another picture (pointing at
   one of the three choices, or reaching it with the keyboard), that picture and its blurred ground begin
   again at their starting position. The picture fading out keeps drifting while it fades, so nothing jumps.
   The band's own script is not changed. */
(function () {
  var band = document.querySelector('.pm-band');
  if (!band || !window.MutationObserver) return;
  var pics = band.querySelectorAll('.pm-pic');
  var hazes = band.querySelectorAll('.pm-haze');
  function fromRest(el) {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;          /* let the browser see the stop before the start */
    el.style.animation = '';
  }
  function watch(list) {
    for (var i = 0; i < list.length; i++) {
      (function (i, el) {
        new MutationObserver(function (records) {
          for (var r = 0; r < records.length; r++) {
            var was = (' ' + (records[r].oldValue || '') + ' ').indexOf(' is-on ') >= 0;
            if (!was && el.classList.contains('is-on')) { fromRest(el); return; }
          }
        }).observe(el, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
      })(i, list[i]);
    }
  }
  watch(pics);
  watch(hazes);
})();
