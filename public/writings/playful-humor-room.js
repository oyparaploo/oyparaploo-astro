/* Playful Humor: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\CLEAN-broadcast-blend_2.html: the stage, the row of cards and the schedule's band each fade in
   once as they are reached, in under a second. The draft's chooser, on the schedule's left, shows every type or one:
   one type shows all its writings in the list at once, and the cards of the other types step back. Show more, in the
   draft's footer seat, brings the next 24 writings. Visitors who ask for less motion see everything at once. */
(function () {
  var doc = document;
  function all(s, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(s)); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* each part fades in as it is reached */
  if (!calm && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.classList.add('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    all('.ph-room .reveal').forEach(function (el) { io.observe(el); });
  }

  var band = doc.querySelector('.ph-room .ph-band');
  var more = doc.querySelector('.ph-room .ph-more');
  var btn = more && more.querySelector('.show-more');

  /* Show more */
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.ph-item.later');
    var now = rest.slice(0, 24);
    now.forEach(function (a) { a.classList.remove('later'); });
    if (rest.length <= 24) more.hidden = true;
    if (now[0]) now[0].focus({ preventScroll: true });
  });

  /* the draft's chooser: every type, or one */
  var box = doc.querySelector('.ph-room .ph-controls');
  var sel = box && box.querySelector('select');
  if (sel && band) {
    box.hidden = false;
    sel.value = '';
    sel.addEventListener('change', function () {
      var k = sel.value;
      all('.ph-item', band).forEach(function (a) { a.classList.toggle('off', !!k && a.getAttribute('data-kind') !== k); });
      all('.ph-room .ph-card').forEach(function (c) { c.classList.toggle('dim', !!k && c.getAttribute('data-kind') !== k); });
      band.classList.toggle('filtered', !!k);
      if (more) more.hidden = !!k || !doc.querySelector('.ph-item.later');
    });
  }
})();
