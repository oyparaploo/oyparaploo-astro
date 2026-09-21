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

        var HOLD_MS = 5000;
        var AUTO_DISSOLVE_MS = 1500;
        var MANUAL_DISSOLVE_MS = 400;
        var CONTROLS_IDLE_MS = 3000;

        var firstHref = openBtn.getAttribute('data-first-href');
        var lastHref = openBtn.getAttribute('data-last-href');

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

        var layers = [document.createElement('img'), document.createElement('img')];
        layers[0].className = 'work-fs-img work-fs-front';
        layers[1].className = 'work-fs-img work-fs-back';
        imgWrap.appendChild(layers[0]);
        imgWrap.appendChild(layers[1]);

        overlay.appendChild(closeBtn);
        overlay.appendChild(imgWrap);
        document.body.appendChild(overlay);

        var frontIndex = 0;
        function frontImg() { return layers[frontIndex]; }
        function backImg() { return layers[1 - frontIndex]; }

        var pageCache = {};
        var openedHref = window.location.pathname;
        var currentHref = openedHref;
        var isPlaying = false;
        var advanceTimer = null;
        var nextPromise = null;

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

        function preloadImage(src) {
          return new Promise(function (resolve) {
            if (!src) { resolve(); return; }
            var im = new Image();
            var done = false;
            var finish = function () {
              if (done) return;
              done = true;
              resolve(im);
            };
            im.addEventListener('load', finish);
            im.addEventListener('error', finish);
            im.src = src;
            if (im.complete) finish();
          });
        }

        function targetHrefForward(href) {
          var data = pageCache[href];
          if (data && data.nextHref) return data.nextHref;
          return firstHref;
        }

        function targetHrefBackward(href) {
          var data = pageCache[href];
          if (data && data.prevHref) return data.prevHref;
          return lastHref;
        }

        function prepareNext() {
          var targetHref = targetHrefForward(currentHref);
          if (!targetHref) return Promise.resolve(null);
          return fetchPageData(targetHref).then(function (data) {
            return preloadImage(data.src).then(function () { return data; });
          });
        }

        function clearAdvanceTimer() {
          if (advanceTimer) {
            clearTimeout(advanceTimer);
            advanceTimer = null;
          }
        }

        function scheduleAdvance() {
          clearAdvanceTimer();
          if (!isPlaying) return;
          advanceTimer = setTimeout(doAutoAdvance, HOLD_MS);
        }

        function doAutoAdvance() {
          if (!isPlaying) return;
          var promise = nextPromise || prepareNext();
          promise.then(function (data) {
            if (!isPlaying || !data) return;
            dissolveTo(data, AUTO_DISSOLVE_MS, true);
          });
        }

        function pauseSlideshow() {
          isPlaying = false;
          clearAdvanceTimer();
        }

        function resumeSlideshow() {
          if (isPlaying) return;
          isPlaying = true;
          if (!nextPromise) nextPromise = prepareNext();
          scheduleAdvance();
        }

        function settleAfterDissolve(restartClock) {
          resetZoomState();
          nextPromise = prepareNext();
          if (isPlaying && restartClock) scheduleAdvance();
        }

        function dissolveTo(data, ms, restartClock) {
          clearAdvanceTimer();
          var effectiveMs = reducedMotion ? 0 : ms;
          var back = backImg();
          var front = frontImg();
          back.src = data.src;
          back.alt = data.alt;
          back.style.transitionDuration = effectiveMs + 'ms';
          currentHref = data.href;

          function flip() {
            back.classList.remove('work-fs-back');
            back.classList.add('work-fs-front');
            front.classList.remove('work-fs-front');
            front.classList.add('work-fs-back');
            frontIndex = 1 - frontIndex;
          }

          if (effectiveMs === 0) {
            flip();
            settleAfterDissolve(restartClock);
          } else {
            requestAnimationFrame(function () {
              requestAnimationFrame(flip);
            });
            setTimeout(function () {
              settleAfterDissolve(restartClock);
            }, effectiveMs);
          }
        }

        function manualStep(direction) {
          var targetHref = direction < 0 ? targetHrefBackward(currentHref) : targetHrefForward(currentHref);
          if (!targetHref) return;
          fetchPageData(targetHref).then(function (data) {
            return preloadImage(data.src).then(function () { return data; });
          }).then(function (data) {
            dissolveTo(data, MANUAL_DISSOLVE_MS, true);
          });
        }

        // Desktop zoom state (transform-origin based glide-on-hover).
        var zoomed = false;

        function resetZoomState() {
          zoomed = false;
          layers.forEach(function (im) {
            im.classList.remove('work-fs-zoomed');
            im.style.transformOrigin = '50% 50%';
            im.style.transform = 'none';
          });
          touchScale = 1;
          touchTx = 0;
          touchTy = 0;
        }

        // Controls (close button + pointer) auto-hide after idle.
        var controlsTimer = null;
        function showControls() {
          overlay.classList.remove('work-fs-controls-hidden');
          clearTimeout(controlsTimer);
          controlsTimer = setTimeout(function () {
            overlay.classList.add('work-fs-controls-hidden');
          }, CONTROLS_IDLE_MS);
        }
        overlay.addEventListener('mousemove', showControls);

        layers.forEach(function (im) {
          im.addEventListener('click', function (e) {
            if (touchActive) return;
            var rect = im.getBoundingClientRect();
            if (!zoomed) {
              var originX = ((e.clientX - rect.left) / rect.width) * 100;
              var originY = ((e.clientY - rect.top) / rect.height) * 100;
              im.style.transformOrigin = originX + '% ' + originY + '%';
              im.style.transform = 'scale(2.5)';
              im.classList.add('work-fs-zoomed');
              zoomed = true;
              pauseSlideshow();
            } else {
              resetZoomState();
              resumeSlideshow();
            }
          });

          im.addEventListener('mousemove', function (e) {
            if (!zoomed) return;
            var rect = im.getBoundingClientRect();
            var originX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            var originY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
            im.style.transformOrigin = originX + '% ' + originY + '%';
          });
        });

        // Touch state (pinch-zoom 1x-4x plus drag pan / swipe / tap).
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

        function applyTouchTransform(im) {
          im.style.transformOrigin = '50% 50%';
          im.style.transform = 'scale(' + touchScale + ') translate(' + touchTx + 'px, ' + touchTy + 'px)';
        }

        function touchDist(touches) {
          var dx = touches[0].clientX - touches[1].clientX;
          var dy = touches[0].clientY - touches[1].clientY;
          return Math.sqrt(dx * dx + dy * dy);
        }

        layers.forEach(function (im) {
          im.addEventListener('touchstart', function (e) {
            touchActive = true;
            showControls();
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

          im.addEventListener('touchmove', function (e) {
            if (e.touches.length === 2) {
              var dist = touchDist(e.touches);
              touchScale = Math.max(1, Math.min(4, pinchStartScale * (dist / pinchStartDist)));
              if (touchScale > 1.01) pauseSlideshow();
              applyTouchTransform(im);
            } else if (e.touches.length === 1) {
              if (touchScale > 1.01) {
                var dx = (e.touches[0].clientX - panStartX) / touchScale;
                var dy = (e.touches[0].clientY - panStartY) / touchScale;
                touchTx = panStartTx + dx;
                touchTy = panStartTy + dy;
                applyTouchTransform(im);
              }
            }
          }, { passive: true });

          im.addEventListener('touchend', function (e) {
            var wasZoomed = touchScale > 1.01;
            if (swiping && !wasZoomed && e.changedTouches && e.changedTouches.length) {
              var endX = e.changedTouches[0].clientX;
              var endY = e.changedTouches[0].clientY;
              var dx = endX - swipeStartX;
              var dy = endY - swipeStartY;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2) {
                manualStep(dx < 0 ? 1 : -1);
              } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
                if (isPlaying) { pauseSlideshow(); } else { resumeSlideshow(); }
              }
            }
            swiping = false;
            if (touchScale <= 1.01) {
              touchScale = 1;
              touchTx = 0;
              touchTy = 0;
              im.style.transform = 'none';
              if (wasZoomed) resumeSlideshow();
            }
            setTimeout(function () { touchActive = false; }, 50);
          }, { passive: true });
        });

        function onKeydown(e) {
          if (overlay.hidden) return;
          if (e.key === 'Escape') {
            closeOverlay();
          } else if (e.key === 'ArrowLeft') {
            manualStep(-1);
          } else if (e.key === 'ArrowRight') {
            manualStep(1);
          } else if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            if (isPlaying) { pauseSlideshow(); } else { resumeSlideshow(); }
          }
        }

        function openOverlay() {
          var data = pageCache[openedHref];
          currentHref = openedHref;
          frontIndex = 0;
          layers[0].className = 'work-fs-img work-fs-front';
          layers[1].className = 'work-fs-img work-fs-back';
          layers[0].src = data.src;
          layers[0].alt = data.alt;
          layers[1].removeAttribute('src');
          resetZoomState();
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
          showControls();

          nextPromise = prepareNext();
          isPlaying = true;
          scheduleAdvance();
        }

        function closeOverlay() {
          try {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
              if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
              else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
          } catch (e) {}

          pauseSlideshow();
          clearTimeout(controlsTimer);
          nextPromise = null;

          overlay.hidden = true;
          overlay.classList.remove('work-fs-controls-hidden');
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
