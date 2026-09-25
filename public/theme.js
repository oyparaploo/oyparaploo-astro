(function() {
  var saved = null;
  try {
    var v = localStorage.getItem('theme');
    if (v === 'dark' || v === 'light') saved = v;
  } catch (e) {}
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  function currentChoice() {
    return saved || 'auto';
  }

  function markActive(choice) {
    var buttons = document.querySelectorAll('.theme-choice');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      if (btn.getAttribute('data-theme-choice') === choice) {
        btn.setAttribute('data-active', 'true');
      } else {
        btn.removeAttribute('data-active');
      }
    }
  }

  function applyChoice(choice) {
    saved = choice === 'auto' ? null : choice;
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('theme', choice); } catch (e) {}
    markActive(choice);
  }

  function writeDate() {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var d = new Date();
    var full = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    var short = months[d.getMonth()].slice(0, 3) + ' ' + d.getDate() + ', ' + d.getFullYear();
    var fullEls = document.querySelectorAll('.theme-date-full');
    var shortEls = document.querySelectorAll('.theme-date-short');
    for (var i = 0; i < fullEls.length; i++) fullEls[i].textContent = full;
    for (var j = 0; j < shortEls.length; j++) shortEls[j].textContent = short;
  }

  function init() {
    writeDate();
    markActive(currentChoice());
    var buttons = document.querySelectorAll('.theme-choice');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function() {
        applyChoice(this.getAttribute('data-theme-choice'));
      });
    }
  }

  function initHeaderReturn() {
    var header = document.querySelector('header.site-header');
    if (!header) return;

    var spacer = document.createElement('div');
    spacer.className = 'site-header-spacer';
    header.parentNode.insertBefore(spacer, header.nextSibling);

    var lastY = window.pageYOffset || document.documentElement.scrollTop;
    var pinned = false;
    var ticking = false;

    function setPinned(on) {
      if (on === pinned) return;
      pinned = on;
      if (on) {
        spacer.style.height = header.offsetHeight + 'px';
        header.classList.add('is-pinned');
      } else {
        header.classList.remove('is-pinned', 'is-hidden');
        spacer.style.height = '0px';
      }
    }

    function update() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var headerHeight = header.offsetHeight;
      var delta = y - lastY;

      if (y <= headerHeight) {
        setPinned(false);
      } else if (delta <= -10) {
        setPinned(true);
        header.classList.remove('is-hidden');
      } else if (delta > 0 && pinned) {
        header.classList.add('is-hidden');
      }

      lastY = y;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('DOMContentLoaded', initHeaderReturn);
  } else {
    init();
    initHeaderReturn();
  }
})();
