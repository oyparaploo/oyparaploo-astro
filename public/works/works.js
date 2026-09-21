/* Hand-built hairline scrollbar for .work-row-track rows (public/works/*.html).
   No outside libraries. Draws a full-width track under each row with a
   draggable/clickable segment that tracks scroll position, on screens wider
   than 700px, only when the row actually overflows (tiles are natural-width,
   so overflow is measured directly rather than by a fixed item count). */
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
      var scrollable = track.scrollWidth > track.clientWidth + 1;
      var narrow = window.innerWidth <= 700;

      if (narrow || !scrollable) {
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
    window.addEventListener('load', update);

    var images = track.querySelectorAll('img');
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      if (img.complete) {
        update();
      } else {
        img.addEventListener('load', update);
      }
    }

    if (typeof ResizeObserver === 'function') {
      var ro = new ResizeObserver(update);
      ro.observe(track);
    }

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

    try {
      var openBtn = document.getElementById('work-fullscreen-btn');
      var mainPicEl = document.getElementById('work-main-pic');
      if (openBtn && mainPicEl) {
        var reducedMotion = window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var overlay = document.createElement('div');
        overlay.id = 'work-fullscreen-overlay';
        overlay.className = 'work-fs-overlay';
        overlay.hidden = true;

        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'work-fs-close';
        closeBtn.setAttribute('aria-label', 'Close full screen');
        closeBtn.textContent = '✕';

        var imgWrap = document.createElement('div');
        imgWrap.className = 'work-fs-imgwrap';

        var fsImg = document.createElement('img');
        fsImg.className = 'work-fs-img';

        imgWrap.appendChild(fsImg);
        overlay.appendChild(closeBtn);
        overlay.appendChild(imgWrap);
        document.body.appendChild(overlay);

        var pageCache = {};
        var openedHref = window.location.pathname;
        var currentHref = openedHref;

        function pageDataFromDocument(doc, href) {
          var img = doc.getElementById('work-main-pic') || doc.querySelector('.work-picture-col img');
          var prevA = doc.getElementById('work-prev');
          var nextA = doc.getElementById('work-next');
          return {
            href: href,
            src: img ? img.src : '',
            alt: img ? img.alt : '',
            prevHref: prevA ? prevA.getAttribute('href') : null,
            nextHref: nextA ? nextA.getAttribute('href') : null
          };
        }

        pageCache[openedHref] = pageDataFromDocument(document, openedHref);

        function fetchPageData(href) {
          if (pageCache[href]) return Promise.resolve(pageCache[href]);
          return fetch(href)
            .then(function (res) { return res.text(); })
            .then(function (html) {
              var doc = new DOMParser().parseFromString(html, 'text/html');
              var data = pageDataFromDocument(doc, href);
              pageCache[href] = data;
              return data;
            });
        }

        // Desktop zoom state (transform-origin based glide-on-hover).
        var zoomed = false;

        function resetZoom() {
          zoomed = false;
          fsImg.classList.remove('work-fs-zoomed');
          fsImg.style.transformOrigin = '50% 50%';
          fsImg.style.transform = 'none';
          touchScale = 1;
          touchTx = 0;
          touchTy = 0;
        }

        fsImg.addEventListener('click', function (e) {
          if (touchActive) return;
          var rect = fsImg.getBoundingClientRect();
          if (!zoomed) {
            var originX = ((e.clientX - rect.left) / rect.width) * 100;
            var originY = ((e.clientY - rect.top) / rect.height) * 100;
            fsImg.style.transformOrigin = originX + '% ' + originY + '%';
            fsImg.style.transform = 'scale(2.5)';
            fsImg.classList.add('work-fs-zoomed');
            zoomed = true;
          } else {
            resetZoom();
          }
        });

        fsImg.addEventListener('mousemove', function (e) {
          if (!zoomed) return;
          var rect = fsImg.getBoundingClientRect();
          var originX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          var originY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
          fsImg.style.transformOrigin = originX + '% ' + originY + '%';
        });

        // Touch state (pinch-zoom 1x-4x plus drag pan / swipe).
        var touchActive = false;
        var touchScale = 1;
        var touchTx = 0;
        var touchTy = 0;
        var pinchStartDist = 0;
        var pinchStartScale = 1;
        var panStartX = 0;
        var panStartY = 0;
        var panStartTx = 0;
        var panStartTy = 0;
        var swipeStartX = 0;
        var swipeStartY = 0;
        var swiping = false;

        function applyTouchTransform() {
          fsImg.style.transformOrigin = '50% 50%';
          fsImg.style.transform = 'scale(' + touchScale + ') translate(' + touchTx + 'px, ' + touchTy + 'px)';
        }

        function touchDist(touches) {
          var dx = touches[0].clientX - touches[1].clientX;
          var dy = touches[0].clientY - touches[1].clientY;
          return Math.sqrt(dx * dx + dy * dy);
        }

        fsImg.addEventListener('touchstart', function (e) {
          touchActive = true;
          if (e.touches.length === 2) {
            pinchStartDist = touchDist(e.touches);
            pinchStartScale = touchScale;
            swiping = false;
          } else if (e.touches.length === 1) {
            if (touchScale > 1.01) {
              panStartX = e.touches[0].clientX;
              panStartY = e.touches[0].clientY;
              panStartTx = touchTx;
              panStartTy = touchTy;
            } else {
              swipeStartX = e.touches[0].clientX;
              swipeStartY = e.touches[0].clientY;
              swiping = true;
            }
          }
        }, { passive: true });

        fsImg.addEventListener('touchmove', function (e) {
          if (e.touches.length === 2) {
            var dist = touchDist(e.touches);
            touchScale = Math.max(1, Math.min(4, pinchStartScale * (dist / pinchStartDist)));
            applyTouchTransform();
          } else if (e.touches.length === 1) {
            if (touchScale > 1.01) {
              var dx = (e.touches[0].clientX - panStartX) / touchScale;
              var dy = (e.touches[0].clientY - panStartY) / touchScale;
              touchTx = panStartTx + dx;
              touchTy = panStartTy + dy;
              applyTouchTransform();
            }
          }
        }, { passive: true });

        fsImg.addEventListener('touchend', function (e) {
          if (swiping && touchScale <= 1.01 && e.changedTouches && e.changedTouches.length) {
            var endX = e.changedTouches[0].clientX;
            var endY = e.changedTouches[0].clientY;
            var dx = endX - swipeStartX;
            var dy = endY - swipeStartY;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2) {
              changeWork(dx < 0 ? 1 : -1);
            }
          }
          swiping = false;
          if (touchScale <= 1.01) {
            touchScale = 1;
            touchTx = 0;
            touchTy = 0;
            fsImg.style.transform = 'none';
          }
          setTimeout(function () { touchActive = false; }, 50);
        }, { passive: true });

        function changeWork(direction) {
          var data = pageCache[currentHref];
          if (!data) return;
          var targetHref = direction < 0 ? data.prevHref : data.nextHref;
          if (!targetHref) return;

          fetchPageData(targetHref).then(function (newData) {
            var swap = function () {
              fsImg.src = newData.src;
              fsImg.alt = newData.alt;
              currentHref = targetHref;
              resetZoom();
            };

            if (reducedMotion) {
              swap();
              return;
            }

            fsImg.classList.add('work-fs-fading');
            setTimeout(function () {
              swap();
              void fsImg.offsetWidth;
              fsImg.classList.remove('work-fs-fading');
            }, 400);
          });
        }

        function onKeydown(e) {
          if (overlay.hidden) return;
          if (e.key === 'Escape') {
            closeOverlay();
          } else if (e.key === 'ArrowLeft') {
            changeWork(-1);
          } else if (e.key === 'ArrowRight') {
            changeWork(1);
          }
        }

        function openOverlay() {
          var data = pageCache[openedHref];
          currentHref = openedHref;
          fsImg.src = data.src;
          fsImg.alt = data.alt;
          resetZoom();
          overlay.hidden = false;
          document.documentElement.style.overflow = 'hidden';

          try {
            if (overlay.requestFullscreen) {
              overlay.requestFullscreen().catch(function () {});
            } else if (overlay.webkitRequestFullscreen) {
              overlay.webkitRequestFullscreen();
            }
          } catch (e) {}

          document.addEventListener('keydown', onKeydown);
        }

        function closeOverlay() {
          try {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
              if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
              else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
          } catch (e) {}

          overlay.hidden = true;
          document.documentElement.style.overflow = '';
          document.removeEventListener('keydown', onKeydown);

          if (currentHref !== openedHref) {
            window.location.href = currentHref;
          }
        }

        openBtn.addEventListener('click', function (e) {
          e.preventDefault();
          openOverlay();
        });

        closeBtn.addEventListener('click', function () {
          closeOverlay();
        });
      }
    } catch (e) {}
  });
})();
