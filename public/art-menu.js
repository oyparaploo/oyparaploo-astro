/* ==========================================================================
   The Art menu: behaviour. Opens from the header word "Art"; closes on
   Close, on Escape, or when a word is chosen. Pointing at a word (or
   pressing it, on touch) turns it italic, slides its arrow in and turns the
   whole ground to that word's own colour. Less motion: no fades, no slides.
   The other header words and their menus are not touched.
   ========================================================================== */
(function () {
  var WORDS = [
    { key: 'humor',        word: 'Humor',        href: '/writings/playful-humor' },
    { key: 'visual-art',   word: 'Visual Art',   href: '/digital' },
    { key: 'drawing',      word: 'Drawing',      href: '/marks' },
    { key: 'photography',  word: 'Photography',  href: '/digital/photo-realism/' },
    { key: 'installation', word: 'Installation', href: '/physical' },
    { key: 'textile-art',  word: 'Textile Art',  href: '/physical/placed-outside-day-stage-textile-space' },
    { key: 'music',        word: 'Music',        href: '/musicology' },
    { key: 'by-color',     word: 'By color',     href: '/by-color' },
    { key: 'land',         word: 'Land Of Pictures ...', href: '/land' }
  ];
  var SEARCH = '/search';

  var trigger = document.querySelector('.site-header nav a.art-word');
  if (!trigger) return;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var rows = WORDS.map(function (w) {
    if (!w.href) {
      return '<li class="is-empty"><span class="art-empty"><span class="art-word-text">' + esc(w.word) +
        '</span><span class="art-empty-note">Nothing behind this word yet</span></span></li>';
    }
    return '<li><a href="' + w.href + '" data-colour="' + w.key + '"><span class="art-word-text">' + esc(w.word) +
      '<span class="art-arrow" aria-hidden="true">&rarr;</span></span></a></li>';
  }).join('');

  var menu = document.createElement('div');
  menu.className = 'art-menu';
  menu.id = 'art-menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Art');
  menu.setAttribute('tabindex', '-1');
  menu.innerHTML =
    '<div class="art-top">' +
      '<form class="art-search" role="search" action="' + SEARCH + '" method="get">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>' +
        '<input type="search" name="q" placeholder="Search" aria-label="Search the site" autocomplete="off">' +
      '</form>' +
      '<button type="button" class="art-close">Close</button>' +
    '</div>' +
    '<ul class="art-list">' + rows + '</ul>';
  document.body.appendChild(menu);

  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'art-menu');
  trigger.setAttribute('aria-expanded', 'false');

  var closeBtn = menu.querySelector('.art-close');
  var links = menu.querySelectorAll('.art-list a');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  function colour(key) {
    menu.style.setProperty('--art-now', key ? 'var(--art-' + key + ')' : 'var(--art-rest)');
  }
  function open(e) {
    if (e) e.preventDefault();
    colour(null);
    menu.classList.add('is-open');
    document.documentElement.classList.add('art-locked');
    trigger.setAttribute('aria-expanded', 'true');
    menu.scrollTop = 0;
    menu.focus({ preventScroll: true });
  }
  function close() {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    document.documentElement.classList.remove('art-locked');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({ preventScroll: true });
  }
  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  for (var i = 0; i < links.length; i++) {
    (function (a) {
      var key = a.getAttribute('data-colour');
      a.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') colour(key); });
      a.addEventListener('focus', function () { colour(key); });
      a.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse') return;
        a.classList.add('is-pressed');
        colour(key);
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
        a.addEventListener(t, function () { a.classList.remove('is-pressed'); });
      });
    })(links[i]);
  }
  menu.querySelector('.art-list').addEventListener('pointerleave', function (e) {
    if (e.pointerType === 'mouse') colour(null);
  });

  document.addEventListener('keydown', function (e) {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      var f = menu.querySelectorAll('input, button, .art-list a');
      var vis = [];
      for (var k = 0; k < f.length; k++) if (f[k].offsetParent !== null) vis.push(f[k]);
      if (!vis.length) return;
      var first = vis[0], last = vis[vis.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) close(); });
})();
