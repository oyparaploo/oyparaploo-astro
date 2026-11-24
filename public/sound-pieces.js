/* Ear Reverence (SITE-ORDER\EAR-REVERENCE-BUILD, November 22, 2026): a work whose pieces each have a title, words
   and a drawn line, playing straight through like a record. From the preview Reach called perfect,
   HTML DOCS\PREVIEWS\EAR-REVERENCE-WHOLE-2026-11-22. Nothing plays until pressed. The large button starts at the
   first piece; each runs into the next; after the last it stops and returns to the start. A piece's own small
   button plays that piece from its start. Pressing a line starts the record at that spot. The pinned row names the
   piece playing; pressing the name goes back to it. Less motion and the Still switch are the style sheet's work,
   but for the jumps, which then go at once instead of gliding. */
(function(){
  var main=document.querySelector('.snd-main.snd-work');
  if(!main)return;
  var root=document.documentElement;
  var BASE=main.getAttribute('data-media');
  var DUR=main.getAttribute('data-seconds').split(',').map(parseFloat), N=DUR.length;
  var rows=[].slice.call(main.querySelectorAll('.snd-piece'));
  var NUMS=rows.map(function(r){return r.querySelector('.snd-pnum').textContent});
  var TITLES=rows.map(function(r){return r.querySelector('.snd-ttl').textContent});
  var lines=rows.map(function(r){return r.querySelector('.snd-line')});
  var clips=rows.map(function(r){return r.querySelector('clipPath rect')});
  var play=document.getElementById('snd-play'), playWord=document.getElementById('snd-play-word'),
      time=document.getElementById('snd-time'), nowname=document.getElementById('snd-nowname'),
      controls=document.getElementById('snd-controls');
  var audios=[], shown=[], cur=0, started=false, raf=0;

  function file(i){return NUMS[i]+'.mp3'}
  function fmt(s){s=Math.max(0,Math.floor(s));return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)}
  /* the whole record runs past an hour */
  function fmtH(s){s=Math.max(0,Math.floor(s));var h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h+':'+('0'+m).slice(-2)+':'+('0'+(s%60)).slice(-2)}
  function dur(i){var a=audios[i];return a&&isFinite(a.duration)&&a.duration>0?a.duration:DUR[i]}
  function whole(){var t=0;for(var i=0;i<N;i++)t+=dur(i);return t}
  function before(i){var t=0;for(var k=0;k<i;k++)t+=dur(k);return t}
  function go(a){var p=a.play();if(p&&p.catch)p.catch(function(){})}

  /* one player per piece, made only when needed; the next is made ready before the one playing ends */
  function get(i){
    if(audios[i])return audios[i];
    var a=new Audio();a.preload='auto';a.src=BASE+file(i);
    a.addEventListener('ended',function(){if(i===cur)next()});
    a.addEventListener('play',function(){if(i===cur)showPlaying(true)});
    a.addEventListener('pause',function(){if(i===cur&&!a.ended)showPlaying(false)});
    a.addEventListener('timeupdate',function(){if(i===cur){draw();if(i+1<N&&dur(i)-a.currentTime<20)get(i+1)}});
    a.addEventListener('loadedmetadata',draw);
    audios[i]=a;return a;
  }
  function showPlaying(on){
    controls.classList.toggle('is-playing',on);play.setAttribute('aria-label',on?'Pause':'Play');playWord.textContent=on?'Pause':'Play';
    mark(on);
    cancelAnimationFrame(raf);if(on)tick();else draw();
  }
  /* the pause mark sits on the small button of the piece that is sounding, and nowhere else */
  function mark(on){rows.forEach(function(r,k){var s=on&&k===cur;r.classList.toggle('is-sounding',s);
    var b=r.querySelector('.snd-pplay');if(b)b.setAttribute('aria-label',(s?'Pause ':'Play ')+NUMS[k])})}
  function tick(){draw();var a=audios[cur];if(a&&!a.paused&&!a.ended)raf=requestAnimationFrame(tick)}

  /* everything already played is filled in; everything ahead stays faint */
  function draw(){
    var a=audios[cur], t=a?a.currentTime||0:0;
    for(var i=0;i<N;i++){
      var f=!started?0:(i<cur?1:(i===cur?Math.min(1,t/dur(i)):0));
      var w=(f*1000).toFixed(2);
      if(shown[i]!==w){shown[i]=w;clips[i].setAttribute('width',w);
        rows[i].classList.toggle('is-now',started&&i===cur);
        var here=(i===cur&&started)?t:0;
        lines[i].setAttribute('aria-valuenow',Math.floor(here));lines[i].setAttribute('aria-valuetext',fmt(here))}
      else if(rows[i].classList.contains('is-now')!==(started&&i===cur))rows[i].classList.toggle('is-now',started&&i===cur);
    }
    time.textContent=(started?fmtH(before(cur)+t):'0:00')+' of '+fmtH(Math.round(whole()));
    if(started){nowname.hidden=false;var nm=NUMS[cur]+'  '+TITLES[cur];if(nowname.textContent!==nm)nowname.textContent=nm}else nowname.hidden=true;
  }

  function startAt(i,f){
    var old=audios[cur];
    if(old&&i!==cur){old.pause();old.currentTime=0}
    cur=i;started=true;mark(false);
    var a=get(i);
    try{a.currentTime=f*dur(i)}catch(e){}
    if(f>0&&a.readyState<1){a.addEventListener('loadedmetadata',function once(){a.removeEventListener('loadedmetadata',once);a.currentTime=f*dur(i)})}
    draw();go(a);
  }
  function next(){
    if(cur+1<N){startAt(cur+1,0)}
    else{var a=audios[cur];a.currentTime=0;cur=0;started=false;showPlaying(false);draw()}   /* after the last piece: stop, back to the start */
  }

  play.addEventListener('click',function(){
    if(!started){startAt(0,0);return}
    var a=get(cur);if(a.paused)go(a);else a.pause();
  });

  rows.forEach(function(row,i){
    var line=lines[i], marker=row.querySelector('.snd-marker'), mt=marker.querySelector('span');
    function spot(e){var r=line.getBoundingClientRect();return Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))}
    line.addEventListener('click',function(e){startAt(i,spot(e))});
    /* the piece's own small button: plays this piece from its start; pressed again it pauses, and once more resumes */
    row.querySelector('.snd-pplay').addEventListener('click',function(){
      if(started&&i===cur){var a=get(i);if(a.paused)go(a);else a.pause()}else startAt(i,0)});
    /* hover marker: mouse only, phones have no hover */
    line.addEventListener('pointermove',function(e){
      if(e.pointerType!=='mouse')return;
      var f=spot(e);marker.style.left=(f*100)+'%';mt.textContent=fmt(f*dur(i));line.classList.add('is-hovering')});
    line.addEventListener('pointerleave',function(){line.classList.remove('is-hovering')});
    line.addEventListener('keydown',function(e){
      var a=audios[i], here=started&&i===cur;
      if(e.key===' '||e.key==='Enter'){if(here){if(a.paused)go(a);else a.pause()}else startAt(i,0);e.preventDefault()}
      else if(here&&e.key==='ArrowRight'){a.currentTime=Math.min(dur(i)-0.2,a.currentTime+5);draw();e.preventDefault()}
      else if(here&&e.key==='ArrowLeft'){a.currentTime=Math.max(0,a.currentTime-5);draw();e.preventDefault()}
    });
  });

  /* the eight jump numbers, and the name in the pinned row */
  function calm(){return root.classList.contains('pp-still')||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
  function goTo(i){rows[i].scrollIntoView({behavior:calm()?'auto':'smooth',block:'start'})}
  [].forEach.call(main.querySelectorAll('[data-jump]'),function(l){l.addEventListener('click',function(e){e.preventDefault();goTo(+l.getAttribute('data-jump'))})});
  nowname.addEventListener('click',function(){goTo(cur)});

  /* the fade under the play row, once the row is pinned */
  var sentinel=document.getElementById('snd-sentinel');
  if(sentinel&&'IntersectionObserver' in window){
    new IntersectionObserver(function(en){controls.classList.toggle('is-stuck',!en[0].isIntersecting)},{threshold:0}).observe(sentinel);
  }

  /* when the site's header slides back in on a scroll up, the play row sits just under it instead of behind it */
  var header=document.querySelector('header.site-header');
  if(header&&'MutationObserver' in window){
    var place=function(){
      var up=header.classList.contains('is-pinned')&&!header.classList.contains('is-hidden');
      document.body.style.setProperty('--snd-top',(up?header.offsetHeight:0)+'px');
    };
    new MutationObserver(place).observe(header,{attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',place);
    place();
  }

  draw();
})();
