/* Where this picture hangs (SITE-ORDER\PICTURE-PAGE-BUILD, October 25, 2026). The picture's own gallery, from
   /works/hangs/<gallery>.js, is set into the row before works.js draws its bar; the picture being looked at is the one
   named by the row's data-here, and is not a link. The row then opens with that picture in the middle; after that it
   moves only under a hand or finger. The tiles are written exactly as the preview Reach called perfect wrote them. */
(function () {
  var row = document.querySelector('.work-hangs');
  var d = window.PP_HANGS;
  if (!row || !d || !d.t) return;
  var here = row.getAttribute('data-here');
  var all = row.querySelector('.work-hangs-all');
  var out = [];
  for (var i = 0; i < d.t.length; i++) {
    var p = d.t[i];
    var size = p[4] ? ' width="' + p[4] + '" height="280"' : '';
    var pic = '<span class="work-tile-pic"><span class="work-tile-imgwrap"><img src="' + p[2] + '" alt="' + p[3] +
      '" loading="lazy"' + size + '></span></span><span class="work-tile-bar" aria-hidden="true"></span>' +
      '<span class="work-tile-catnum">' + p[1] + '</span>';
    out.push(p[0] === here
      ? '<span class="work-tile work-tile-here" aria-current="page">' + pic + '</span>'
      : '<a class="work-tile" href="' + d.b + p[0] + '">' + pic + '</a>');
  }
  all.insertAdjacentHTML('beforebegin', out.join('\n      ') + '\n      ');
  document.addEventListener('DOMContentLoaded', function () {
    var here = document.querySelector('.work-hangs .work-tile-here');
    if (!here) return;
    var track = here.parentNode;
    var snap = track.style.scrollSnapType;
    track.style.scrollSnapType = 'none';
    track.scrollLeft = here.offsetLeft - track.offsetLeft - (track.clientWidth - here.offsetWidth) / 2;
    track.dispatchEvent(new Event('scroll'));
    requestAnimationFrame(function () { track.style.scrollSnapType = snap; });
  });
})();
