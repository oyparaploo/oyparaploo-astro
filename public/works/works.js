/* Hand-built hairline scrollbar for .work-row-track rows (public/works/*.html).
   No outside libraries. Draws a full-width 2px track under each row with a
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
  });
})();
