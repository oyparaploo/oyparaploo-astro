/* The Still switch (preview, November 8, 2026; spec claude/STILL-SWITCH-SPEC-2026-11-08.md, from the Eco Mode
   switch on palaisdetokyo.com, the stop-the-motion half only).

   One word, Still, on the theme strip after Light and Dark. Pressing it makes every moving thing on every page
   show the calm version it already has for visitors whose computers ask for less motion. Pressing it again
   brings the motion back.

   How it reaches every page with one switch:
   - It is loaded first in the head, before any other script.
   - The class pp-still on the page's root element carries the calm CSS (each "less motion" rule of the site is
     written a second time under html.pp-still).
   - Every motion script on the site already asks the browser one question before it moves:
     matchMedia('(prefers-reduced-motion: reduce)'). This file makes that one question answer "calm" when the
     computer asks for less motion OR the visitor pressed Still, and tells the scripts that listen when the
     answer changes, so the drifting wall and the pen line stop and start at once.
   - The choice is kept in the browser (every read and write wrapped, so a refusal never breaks the page), and
     another open page of the site follows a press at once.
   - Page-to-page picture growth is skipped while Still is on. */
(function () {
  var KEY = 'pp-still';
  var root = document.documentElement;
  var on = false;
  try { on = localStorage.getItem(KEY) === 'on'; } catch (e) {}
  if (on) root.classList.add('pp-still');

  var native = window.matchMedia ? window.matchMedia.bind(window) : null;
  var ASK = /\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/;
  var asks = null;
  try { asks = native ? native('(prefers-reduced-motion: reduce)') : null; } catch (e) {}

  function calm() { return on || !!(asks && asks.matches); }
  window.ppCalm = calm;

  /* ---- the one shared check ---- */
  var made = {};
  var watchers = [];
  function makeQuery(q, real) {
    var exact = q.replace(/\s+/g, '') === '(prefers-reduced-motion:reduce)';
    var rest = exact ? null : native(q.replace(ASK, 'all'));
    var w = {
      media: q,
      onchange: null,
      _fns: [],
      get matches() { return exact ? calm() : (real.matches || (on && rest.matches)); },
      addEventListener: function (type, fn) { if (type === 'change' && fn && this._fns.indexOf(fn) < 0) this._fns.push(fn); },
      removeEventListener: function (type, fn) { var i = this._fns.indexOf(fn); if (i >= 0) this._fns.splice(i, 1); },
      addListener: function (fn) { this.addEventListener('change', fn); },
      removeListener: function (fn) { this.removeEventListener('change', fn); },
      dispatchEvent: function () { return true; }
    };
    w._last = w.matches;
    var tell = function () { notify(w); };
    if (real.addEventListener) real.addEventListener('change', tell); else if (real.addListener) real.addListener(tell);
    if (rest) { if (rest.addEventListener) rest.addEventListener('change', tell); else if (rest.addListener) rest.addListener(tell); }
    watchers.push(w);
    return w;
  }
  function notify(w) {
    var now = w.matches;
    if (now === w._last) return;
    w._last = now;
    var ev = { type: 'change', matches: now, media: w.media };
    var fns = w._fns.slice();
    for (var i = 0; i < fns.length; i++) { try { fns[i].call(w, ev); } catch (e) {} }
    if (typeof w.onchange === 'function') { try { w.onchange.call(w, ev); } catch (e) {} }
  }
  if (native) {
    window.matchMedia = function (q) {
      q = String(q);
      if (!ASK.test(q)) return native(q);
      if (!made[q]) made[q] = makeQuery(q, native(q));
      return made[q];
    };
  }

  /* ---- the word on the strip ---- */
  function mark() {
    var b = document.querySelectorAll('.still-choice');
    for (var i = 0; i < b.length; i++) b[i].setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function set(v, keep) {
    on = !!v;
    root.classList.toggle('pp-still', on);
    if (keep) {
      try { if (on) localStorage.setItem(KEY, 'on'); else localStorage.removeItem(KEY); } catch (e) {}
    }
    mark();
    for (var i = 0; i < watchers.length; i++) notify(watchers[i]);
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.still-choice') : null;
    if (!b) return;
    e.preventDefault();
    set(!on, true);
  });
  /* another open page of the site pressed it */
  window.addEventListener('storage', function (e) {
    if (e.key === KEY || e.key === null) {
      var v = false;
      try { v = localStorage.getItem(KEY) === 'on'; } catch (err) {}
      if (v !== on) set(v, false);
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mark); else mark();

  /* ---- no picture grows from page to page while Still is on ---- */
  function skip(e) { if (calm() && e.viewTransition) { try { e.viewTransition.skipTransition(); } catch (err) {} } }
  window.addEventListener('pageswap', skip);
  window.addEventListener('pagereveal', skip);
})();
