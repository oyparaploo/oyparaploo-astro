/* Hand-built hairline scrollbar for .work-row-track rows (public/works/*.html).
   No outside libraries. Draws a full-width 4px track under each row with a
   draggable/clickable segment that tracks scroll position, on screens wider
   than 700px, only when the row actually overflows and has more than 4
   items. */
(function () {
  function initRow(track) {
    var wrap = document.createElement('div');
    wrap.className = 'work-row-hairline';

    var railTrack = document.createElement('div');
    railTrack.className = 'work-row-hairline-track';

    var thumb = document.createElement('div');
    thumb.className = 'work-row-hairline-thumb';

    railTrack.appendChild(thumb);
    wrap.appendChild(railTrack);
    track.insertAdjacentElement('afterend', wrap);

    function maxScroll() {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function update() {
      var itemCount = track.children.length;
      var scrollable = track.scrollWidth > track.clientWidth + 1;
      var narrow = window.innerWidth <= 700;
      var tooFew = itemCount <= 4;

      if (narrow || !scrollable || tooFew) {
        wrap.classList.add('wrh-hidden');
        return;
      }
      wrap.classList.remove('wrh-hidden');

      var widthFrac = track.clientWidth / track.scrollWidth;
      var ms = maxScroll();
      var posFrac = ms > 0 ? track.scrollLeft / ms : 0;
      var widthPct = widthFrac * 100;
      var leftPct = posFrac * (100 - widthPct);

      thumb.style.width = widthPct + '%';
      thumb.style.left = leftPct + '%';
    }

    track.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    var dragging = false;
    var startX = 0;
    var startScrollLeft = 0;

    thumb.addEventListener('mousedown', function (e) {
      dragging = true;
      startX = e.clientX;
      startScrollLeft = track.scrollLeft;
      wrap.classList.add('wrh-dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var railWidth = railTrack.getBoundingClientRect().width;
      if (railWidth <= 0) return;
      var deltaPx = e.clientX - startX;
      var deltaScroll = (deltaPx / railWidth) * track.scrollWidth;
      track.scrollLeft = Math.max(0, Math.min(maxScroll(), startScrollLeft + deltaScroll));
    });

    document.addEventListener('mouseup', function () {
      dragging = false;
      wrap.classList.remove('wrh-dragging');
    });

    railTrack.addEventListener('click', function (e) {
      if (e.target === thumb) return;
      var rect = railTrack.getBoundingClientRect();
      if (rect.width <= 0) return;
      var clickFrac = (e.clientX - rect.left) / rect.width;
      track.scrollLeft = clickFrac * maxScroll();
    });

    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var tracks = document.querySelectorAll('.work-row-track');
    for (var i = 0; i < tracks.length; i++) {
      initRow(tracks[i]);
    }

    try {
      var neighborImages = {};

      var arrows = [
        document.getElementById('work-prev'),
        document.getElementById('work-next')
      ];
      arrows.forEach(function (arrow) {
        if (!arrow || !arrow.href) return;
        var href = arrow.href;

        try {
          var link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = href;
          document.head.appendChild(link);
        } catch (e) {}

        fetch(href)
          .then(function (res) { return res.text(); })
          .then(function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var img = doc.getElementById('work-main-pic') || doc.querySelector('.work-picture-col img');
            if (img && img.src) {
              var preload = new Image();
              preload.src = img.src;
              neighborImages[href] = preload;
            }
          })
          .catch(function () {});

        arrow.addEventListener('click', function (e) {
          if (e.defaultPrevented || e.button !== 0) return;
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

          e.preventDefault();

          var go = function () {
            window.location.href = href;
          };

          var preload = neighborImages[href];
          if (!preload) {
            go();
            return;
          }

          var settled = false;
          var settle = function () {
            if (settled) return;
            settled = true;
            go();
          };

          var timeoutId = setTimeout(settle, 1500);

          if (typeof preload.decode === 'function') {
            preload.decode().then(function () {
              clearTimeout(timeoutId);
              settle();
            }).catch(function () {
              clearTimeout(timeoutId);
              settle();
            });
          } else if (preload.complete) {
            clearTimeout(timeoutId);
            settle();
          }
        });
      });

      try {
        var mainPic = document.getElementById('work-main-pic');
        var nextArrow = document.getElementById('work-next');
        if (mainPic && nextArrow) {
          mainPic.addEventListener('click', function (e) {
            if (e.button !== 0) return;
            try {
              nextArrow.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                button: 0
              }));
            } catch (e) {}
          });
        }
      } catch (e) {}
    } catch (e) {}
  });
})();
