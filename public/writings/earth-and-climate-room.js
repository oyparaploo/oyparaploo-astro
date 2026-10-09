/* Earth and Climate: the room's own play (October 9, 2026, Claude, Opus, High).
   From HTML DOCS\STORIES_2.html: the writings sit as the draft's tiles, a row of two, then a row of three, with the
   page's pictures full width between them; a last row left short shares its width. Show more brings the next 24
   writings, and the rows are laid out again as they arrive. Each part fades in once as it is reached, in under a
   second. Visitors who ask for less motion see everything at once. */
(function () {
  var doc = document;
  function all(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
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
    all('.ec-room .reveal').forEach(function (el) { io.observe(el); });
  }

  /* the draft's rows: two, then three; a picture closes a row; a last row left short shares the width */
  var grid = doc.querySelector('.ec-room .ec-grid');
  function lay() {
    if (!grid) return;
    var row = [], size = 2;
    function set(el, n) { el.classList.remove('ec-s2', 'ec-s3', 'ec-s6'); el.classList.add('ec-s' + n); }
    function close() {
      row.forEach(function (el) { set(el, row.length < size ? 6 / row.length : 6 / size); });
      row = [];
    }
    Array.prototype.forEach.call(grid.children, function (el) {
      if (el.classList.contains('ec-wide')) { if (row.length) close(); size = 2; return; }
      if (el.classList.contains('later')) return;
      row.push(el);
      if (row.length === size) { close(); size = 5 - size; }
    });
    if (row.length) close();
  }
  lay();

  /* Show more */
  var btn = doc.querySelector('.ec-room .show-more');
  if (btn) btn.addEventListener('click', function () {
    var rest = all('.ec-tile.later');
    var now = rest.slice(0, 24);
    now.forEach(function (a) { a.classList.remove('later'); });
    lay();
    if (rest.length <= 24) btn.parentNode.hidden = true;
    if (now[0]) now[0].focus({ preventScroll: true });
  });
})();
