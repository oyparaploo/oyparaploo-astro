/* The plain writing page (SITE-ORDER\WRITING-PLAIN-BUILD, November 9, 2026). Only the text size is left of stage.js:
   three steps, remembered in the visitor's browser. Nothing else moves or loads. */
(function () {
  var html = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (mq && mq.matches) html.classList.add('rm');
  function setSize(n) {
    html.classList.remove('size-1', 'size-2', 'size-3');
    html.classList.add('size-' + n);
    var b = document.querySelectorAll('.wp-size button');
    for (var i = 0; i < b.length; i++) b[i].setAttribute('aria-pressed', b[i].getAttribute('data-size') === String(n) ? 'true' : 'false');
    try { localStorage.setItem('textSize', String(n)); } catch (e) {}
  }
  var saved = 1;
  try { var sv = localStorage.getItem('textSize'); if (sv === '2' || sv === '3') saved = +sv; } catch (e) {}
  function start() { setSize(saved); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('.wp-size button') : null;
    if (t) setSize(+t.getAttribute('data-size'));
  });
})();
