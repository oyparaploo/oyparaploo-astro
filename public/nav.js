(function () {
  var header = document.querySelector('header.site-header');
  if (!header) return;
  header.classList.add('wob-host');

  /* ---- Inject the panels this page's shared file carries ---- */
  var PANEL_HTML = {"writings": "<div class=\"wob-panel\" id=\"wob-writings\" data-panel=\"writings\" aria-label=\"Writings\"><div class=\"wob-inner\"><div class=\"wob-tonight wob-cols wob-narrow\" style=\"--n:2\"><div class=\"wob-col\"><div class=\"wob-group\"><a class=\"wob-h\" href=\"/writings.html\">Where to begin</a><ul class=\"wob-list\"><li><a href=\"/room-one.html\">Come In</a></li><li><a href=\"/room-two.html\">Come Through</a></li><li><a href=\"/room-three.html\">Come Sit</a></li><li><a href=\"/room-four.html\">Come Look</a></li><li><a href=\"/room-five.html\">Come Stand</a></li><li><a href=\"/room-six.html\">Come Down</a></li></ul></div></div><div class=\"wob-col\"><div class=\"wob-group\"><a class=\"wob-h\" href=\"/the-book.html\">The Book</a><ul class=\"wob-list\"><li><a href=\"/book-door-1.html\">A Machine That Can Hear, Too</a></li><li><a href=\"/book-door-2.html\">Too Great a Listener for its own Good</a></li><li><a href=\"/book-door-3.html\">Strange 7:46 Objects</a></li><li><a href=\"/book-door-4.html\">Morning Over Troubled Floors</a></li></ul></div></div></div><div class=\"wob-foot\"><a class=\"wob-all\" href=\"/writings.html\">See all Writings <span class=\"wob-go\" aria-hidden=\"true\">&rarr;</span></a></div></div></div>", "marks": "<div class=\"wob-panel\" id=\"wob-marks\" data-panel=\"marks\" aria-label=\"Marks\"><div class=\"wob-inner\"><div class=\"wob-cols\" style=\"--n:5\"><div class=\"wob-solo\"><a class=\"wob-h\" href=\"/marks/most-recent/\">Most Recent <span class=\"wob-go\" aria-hidden=\"true\">&rarr;</span></a></div><div class=\"wob-group\"><a class=\"wob-h\" href=\"/marks/smooth-beh-laye/\">Smooth Beh Laye</a><ul class=\"wob-list\"><li><a href=\"/marks/smooth-beh-laye/another-booklet/\">Another Booklet</a></li><li><a href=\"/marks/smooth-beh-laye/biology-class/\">Biology Class</a></li><li><a href=\"/marks/smooth-beh-laye/haring-bone/\">Haring Bone</a></li><li><a href=\"/marks/smooth-beh-laye/intense-color/\">Intense Color</a></li><li><a href=\"/marks/smooth-beh-laye/lightly-tinted/\">Lightly Tinted</a></li><li><a href=\"/marks/smooth-beh-laye/minimal-impact/\">Minimal Impact</a></li><li><a href=\"/marks/smooth-beh-laye/one-follicle-at-a-time/\">One Follicle at a Time</a></li><li><a href=\"/marks/smooth-beh-laye/other-worldly/\">Other Worldly</a></li><li><a href=\"/marks/smooth-beh-laye/stained-fog/\">Stained Fog</a></li><li><a href=\"/marks/smooth-beh-laye/student-phase/\">Student Phase</a></li><li><a href=\"/marks/smooth-beh-laye/tears-and-raindrops/\">Tears and Raindrops</a></li><li><a href=\"/marks/smooth-beh-laye/the-chair/\">The Chair</a></li><li><a href=\"/marks/smooth-beh-laye/thousand-marks/\">Thousand Marks</a></li><li><a href=\"/marks/smooth-beh-laye/word-mapping/\">Word Mapping</a></li></ul></div><div class=\"wob-group\"><a class=\"wob-h\" href=\"/marks/fast-thin-dues/\">Fast Thin Dues</a><ul class=\"wob-list\"><li><a href=\"/marks/fast-thin-dues/agitation-exercise/\">Agitation Exercise</a></li><li><a href=\"/marks/fast-thin-dues/blossom-petal-garden/\">Blossom Petal Garden</a></li><li><a href=\"/marks/fast-thin-dues/clouds-redefined/\">Clouds Redefined</a></li><li><a href=\"/marks/fast-thin-dues/dry-grass-and-tears/\">Dry Grass and Tears</a></li><li><a href=\"/marks/fast-thin-dues/how-to-remain-a-modern-artist/\">How to Remain a Modern Artist</a></li><li><a href=\"/marks/fast-thin-dues/loops-hopes/\">Loops Hopes</a></li><li><a href=\"/marks/fast-thin-dues/most-complexy-asemities/\">Most Complexy Asemities</a></li><li><a href=\"/marks/fast-thin-dues/slanted-character/\">Slanted Character</a></li><li><a href=\"/marks/fast-thin-dues/slap-maps/\">Slap Maps</a></li><li><a href=\"/marks/fast-thin-dues/water-surfaces/\">Water Surfaces</a></li></ul></div><div class=\"wob-group\"><a class=\"wob-h\" href=\"/marks/pages-for-baby-divine/\">Pages for Baby Divine</a><ul class=\"wob-list\"><li><a href=\"/marks/pages-for-baby-divine/pages-for-baby-divine-a/\">Part A</a></li><li><a href=\"/marks/pages-for-baby-divine/pages-for-baby-divine-b/\">Part B</a></li></ul></div><div class=\"wob-solo\"><a class=\"wob-h\" href=\"/marks/gog-guldah-variations/\">Gog Guldah Variations</a></div><div class=\"wob-group\"><a class=\"wob-h\" href=\"/words/hand-writings/\">Handwritten Every Which Way</a><ul class=\"wob-list\"><li><a href=\"/words/hand-writings/cool/\">Cool</a></li><li><a href=\"/words/hand-writings/distinct-territory/\">Distinct Territory</a></li><li><a href=\"/mind-mapping/eclipse/\">Eclipse</a></li><li><a href=\"/mind-mapping/in-the-shade/\">In The Shade</a></li><li><a href=\"/words/hand-writings/ink-on-yellow/\">Ink On Yellow</a></li><li><a href=\"/words/hand-writings/looks-like-ox-blood/\">Looks Like Ox Blood</a></li><li><a href=\"/mind-mapping/neutral/\">Neutral</a></li><li><a href=\"/words/hand-writings/vivid-gray-cast/\">Vivid Gray Cast</a></li></ul></div><div class=\"wob-group\"><a class=\"wob-h\" href=\"/sumi.html\">Sumi Brush Drawings</a><ul class=\"wob-list\"><li><a href=\"/digital/fluid-ink-instrumental/\">Fluid Ink Instrumental</a></li><li><a href=\"/digital/shoe-whah-si-daye-sew/\">Shoe Whah Si Daye Sew</a></li><li><a href=\"/digital/ga-assortment/\">Ga Assortment</a></li><li><a href=\"/digital/desert-murat-fait/\">Desert Murat Fait</a></li></ul></div></div><div class=\"wob-foot\"><a class=\"wob-all\" href=\"/marks.html\">See all Marks <span class=\"wob-go\" aria-hidden=\"true\">&rarr;</span></a></div></div></div>", "placings": "<div class=\"wob-panel\" id=\"wob-placings\" data-panel=\"placings\" aria-label=\"Placings\"><div class=\"wob-inner\"><a class=\"wob-h wob-wide-h\" href=\"/physical.html\">Placing of Altered Objects and Materials</a><div class=\"wob-cols\" style=\"--n:5\"><div class=\"wob-col\"><ul class=\"wob-list\"><li><a href=\"/physical/above-stones-feugo/\">Above Stones Feugo</a></li><li><a href=\"/physical/after-a-storm-interpretations/\">After a Storm Interpretations</a></li><li><a href=\"/physical/after-the-party/\">After the Party</a></li><li><a href=\"/physical/anthro-archeo/\">Anthro Archeo</a></li><li><a href=\"/physical/archeo/\">Archeo</a></li><li><a href=\"/physical/archeo-dream/\">Archeo Dream</a></li><li><a href=\"/physical/attempts-to-provoke/\">Attempts to Provoke</a></li><li><a href=\"/physical/beauty-sleeps-here/\">Beauty Sleeps Here</a></li><li><a href=\"/physical/believable/\">Believable</a></li><li><a href=\"/physical/blame-it-on-lame-intentions/\">Blame It on Lame Intentions</a></li><li><a href=\"/physical/blue-glass-ball-and-more/\">Blue Glass Ball and More</a></li><li><a href=\"/physical/boiling-point/\">Boiling Point</a></li><li><a href=\"/physical/brrd-house/\">Brrd House</a></li><li><a href=\"/physical/cool-warming/\">Cool Warming</a></li></ul></div><div class=\"wob-col\"><ul class=\"wob-list\"><li><a href=\"/physical/crutch-and-other-stuff/\">Crutch and Other Stuff</a></li><li><a href=\"/physical/curious-first-every-time/\">Curious First Every Time</a></li><li><a href=\"/physical/day-stage-textile-space/\">Day Stage Textile Space</a></li><li><a href=\"/physical/dirty-ol-shipyard/\">Dirty Ol Shipyard</a></li><li><a href=\"/physical/dug-ity-dig-wonders/\">DUG-ITY Dig Wonders</a></li><li><a href=\"/physical/entitled-white-sheets/\">Entitled White Sheets</a></li><li><a href=\"/physical/flux-art-temperature/\">Flux Art Temperature</a></li><li><a href=\"/physical/foamboard-holes-plus/\">Foamboard Holes Plus</a></li><li><a href=\"/physical/free-attempt/\">Free Attempt</a></li><li><a href=\"/physical/get-the-stuff-out/\">Get the Stuff Out</a></li><li><a href=\"/physical/had-a-concrete-heart-once/\">Had a Concrete Heart Once</a></li><li><a href=\"/physical/handin-pocket-still-life/\">Handin Pocket Still Life</a></li><li><a href=\"/physical/hanging-holes-frame/\">Hanging Holes Frame</a></li><li><a href=\"/physical/holy-stoney-table-and-grade/\">Holy Stoney Table and Grade</a></li></ul></div><div class=\"wob-col\"><ul class=\"wob-list\"><li><a href=\"/physical/host-the-most/\">Host the Most</a></li><li><a href=\"/physical/hot-evening-prayers/\">Hot Evening Prayers</a></li><li><a href=\"/physical/ignore-the-fallen-leaves/\">Ignore the Fallen Leaves</a></li><li><a href=\"/physical/it-is-good-to-not-always-know/\">It Is Good to Not Always Know</a></li><li><a href=\"/physical/kandah-dusk-proof/\">Kandah Dusk Proof</a></li><li><a href=\"/physical/kiwanuk-questions/\">Kiwanuk Questions</a></li><li><a href=\"/physical/late-grief-sun/\">Late Grief Sun</a></li><li><a href=\"/physical/let-it-be-attitude/\">Let It Be Attitude</a></li><li><a href=\"/physical/light-for-marine-hues/\">Light for Marine Hues</a></li><li><a href=\"/physical/materials-for-tinkering/\">Materials for Tinkering</a></li><li><a href=\"/physical/mercy-and-no-mercy/\">Mercy and No Mercy</a></li><li><a href=\"/physical/messornot/\">Messornot</a></li><li><a href=\"/physical/mister-sandman-garbage/\">Mister Sandman Garbage</a></li><li><a href=\"/physical/nariwen-innocence-proof/\">Nariwen Innocence Proof</a></li></ul></div><div class=\"wob-col\"><ul class=\"wob-list\"><li><a href=\"/physical/night-home/\">Night Home</a></li><li><a href=\"/physical/night-red-cross-tent/\">Night Red Cross Tent</a></li><li><a href=\"/physical/noir-music-night-of-day/\">Noir Music Night of Day</a></li><li><a href=\"/physical/numbers-game-auction/\">Numbers Game Auction</a></li><li><a href=\"/physical/orange-fur-project/\">Orange Fur Project</a></li><li><a href=\"/physical/outside-carpet-treaty/\">Outside Carpet Treaty</a></li><li><a href=\"/physical/piles-of-boards/\">Piles of Boards</a></li><li><a href=\"/physical/plethora-at-play-details/\">Plethora At Play Details</a></li><li><a href=\"/physical/pray-for-destroyed-mirrors/\">Pray for Destroyed Mirrors</a></li><li><a href=\"/physical/precious-wet-black-soil/\">Precious Wet Black Soil</a></li><li><a href=\"/physical/rashing-to-show-these-items/\">Rashing to Show These Items</a></li><li><a href=\"/physical/salt-of-sand-and-more/\">Salt of Sand and More</a></li><li><a href=\"/physical/shadeless-lamps-showcased/\">Shadeless Lamps Showcased</a></li><li><a href=\"/physical/signs-of-damage/\">Signs of Damage</a></li></ul></div><div class=\"wob-col\"><ul class=\"wob-list\"><li><a href=\"/physical/soiled-linoleum-cords/\">Soiled Linoleum Cords</a></li><li><a href=\"/physical/stuff-backlit/\">Stuff Backlit</a></li><li><a href=\"/physical/surreal-plastic-fish/\">Surreal Plastic Fish</a></li><li><a href=\"/physical/temporary-frozen-thrill/\">Temporary Frozen Thrill</a></li><li><a href=\"/physical/this-space-for-getting-primed/\">This Space for Getting Primed</a></li><li><a href=\"/physical/true-colors-and-grit/\">True Colors and Grit</a></li><li><a href=\"/physical/unlabeled-package/\">Unlabeled Package</a></li><li><a href=\"/physical/unreal-cowboy-hat/\">Unreal Cowboy Hat</a></li><li><a href=\"/physical/we-did-not-want-to-become-this/\">We Did Not Want to Become This</a></li><li><a href=\"/physical/werg-and-gis-middle-labor/\">Werg and Gis Middle Labor</a></li><li><a href=\"/physical/western-nothing/\">Western Nothing</a></li><li><a href=\"/physical/woa-mun/\">Woa Mun</a></li></ul></div></div><div class=\"wob-foot\"><a class=\"wob-all\" href=\"/physical.html\">See all Placings <span class=\"wob-go\" aria-hidden=\"true\">&rarr;</span></a></div></div></div>", "collage": "<div class=\"wob-panel\" id=\"wob-collage\" data-panel=\"collage\" aria-label=\"Collage\"><div class=\"wob-inner\"><div class=\"wob-cols\" style=\"--n:4\"><div class=\"wob-col\"><div class=\"wob-group\"><a class=\"wob-h\" href=\"/digital.html#collage-work\">Collage Work</a><ul class=\"wob-list\"><li><a href=\"/digital/ah-ah-ah-ah/\">Ah Ah Ah Ah</a></li><li><a href=\"/digital/at-lac-clouse/\">At Lac Clouse</a></li><li><a href=\"/digital/blame-it-on-the-weather/\">Blame It On The Weather</a></li><li><a href=\"/digital/chaud-schwea-couleurs/\">Chaud Schwea Couleurs</a></li><li><a href=\"/digital/conflict-zone-fragments-pages/\">Conflict Zone Fragments Pages</a></li><li><a href=\"/digital/lemon-yellow-accents/\">Lemon Yellow Accents</a></li><li><a href=\"/digital/wild-beyond-burning-ember-go/\">Wild Beyond Burning Ember Go</a></li><li><a href=\"/digital/work-mon-aye-bahta/\">Work Mon Aye Bahta</a></li><li><a href=\"/digital/to-worship-what-we-dig/\">To Worship What We Dig</a></li><li><a href=\"/digital/vivid-memories-of-choice/\">Vivid Memories Of Choice</a></li><li><a href=\"/digital/watch-this-not-get-carried-away/\">Watch This Not Get Carried Away</a></li><li><a href=\"/digital/babel-fascinated-with-shiny-things/\">Babel Fascinated With Shiny Things</a></li><li><a href=\"/digital/drooles-lucid-pah-sahge/\">Drooles Lucid Pah Sahge</a></li><li><a href=\"/digital/far-malaye-medley/\">Far Malaye Medley</a></li><li class=\"wob-more\"><a href=\"/digital.html#collage-work\">All of Collage Work <span class=\"wob-go\" aria-hidden=\"true\">&rarr;</span></a></li></ul></div></div><div class=\"wob-col\"><div class=\"wob-group\"><a class=\"wob-h\" href=\"/digital.html#symmetrical-and-kaleidoscopic\">Symmetrical and Kaleidoscopic</a><ul class=\"wob-list\"><li><a href=\"/digital/mint-plaje-symmet/\">Mint Plaje Symmet</a></li><li><a href=\"/digital/red-stain/\">Red Stain</a></li><li><a href=\"/digital/shur-shee-symmetrical/\">Shur Shee Symmetrical</a></li><li><a href=\"/digital/climate-hand-smoke-voice/\">Climate Hand Smoke Voice</a></li><li><a href=\"/digital/rainbow-coe-shaye-bar/\">Rainbow Coe Shaye Bar</a></li><li><a href=\"/digital/rough-dark-change-mystery/\">Rough Dark Change Mystery</a></li><li><a href=\"/digital/great-conscious-middle-eye-no-cracking/\">Great Conscious Middle Eye No Cracking</a></li><li><a href=\"/digital/tramete-ring-ring-quitah-in-pieces/\">Tramete Ring Ring Quitah In Pieces</a></li><li><a href=\"/digital/hot-and-warming-eyes/\">Hot And Warming Eyes</a></li><li><a href=\"/digital/hot-climate/\">Hot Climate</a></li><li><a href=\"/digital/rahms-intense-unfamiliar-gaze/\">Rahms Intense Unfamiliar Gaze</a></li><li><a href=\"/digital/sista-ro-extreme-heat/\">Sista Ro Extreme Heat</a></li><li><a href=\"/digital/ah-ah-ah-ah-volumes/\">Ah Ah Ah Ah</a></li><li><a href=\"/digital/hot-climate-volumes/\">Hot Climate</a></li></ul></div></div><div class=\"wob-col\"><div class=\"wob-group\"><a class=\"wob-h\" href=\"/digital.html#photomosaics\">Photomosaics</a><ul class=\"wob-list\"><li><a href=\"/digital/say-zone-doanna-heato/\">Say Zone Doanna Heato</a></li><li><a href=\"/digital/biggest-mosaic-ever/\">Biggest Mosaic Ever</a></li></ul></div><div class=\"wob-group\"><a class=\"wob-h\" href=\"/digital.html#photographs-of-places-and-things\">Photographs of Places and Things</a><ul class=\"wob-list\"><li><a href=\"/digital/workspace-incidences-no-people/\">Workspace Incidences No People</a></li><li><a href=\"/digital/photo-realism/\">Photo Realism</a></li><li><a href=\"/digital/boots-dom-maye-waste/\">Boots Dom Maye Waste</a></li><li><a href=\"/digital/bending-rebar/\">Bending Rebar</a></li><li><a href=\"/digital/grit-and-grain-theater/\">Grit And Grain Theater</a></li></ul></div><div class=\"wob-group\"><a class=\"wob-h\" href=\"/digital.html#photographs-of-people\">Photographs of People</a><ul class=\"wob-list\"><li><a href=\"/digital/they-won-the-biggest-contest-question/\">They Won the Biggest Contest Question</a></li><li><a href=\"/digital/collage-blossom/\">Collage Blossom</a></li><li><a href=\"/digital/read-the-red-words-freedom/\">Read The Red Words Freedom</a></li><li><a href=\"/digital/a-family/\">A Family</a></li></ul></div></div><div class=\"wob-col\"><div class=\"wob-group\"><a class=\"wob-h\" href=\"/digital.html#text-and-typographic-pieces\">Text and Typographic Pieces</a><ul class=\"wob-list\"><li><a href=\"/digital/text-based-visual-works/\">Text Based Visual Works</a></li><li><a href=\"/digital/lights-camera-freeze/\">Lights Camera Freeze</a></li><li><a href=\"/digital/numbers/volume-two/\">Numbers</a></li><li><a href=\"/digital/rock-rebar-hammer-theater/\">Rock Rebar Hammer Theater</a></li><li><a href=\"/digital/stained-message/\">Stained Message</a></li><li><a href=\"/digital/this-looks-like-branding/\">This Looks Like Branding</a></li><li><a href=\"/digital/bad-beautiful-good/\">Bad Beautiful Good</a></li><li><a href=\"/digital/grey-to-gray-zone/\">Grey To Gray Zone</a></li><li><a href=\"/digital/oversized-meaning/\">Oversized Meaning</a></li><li><a href=\"/digital/sizable-sepia-series/\">Sizable Sepia Series</a></li></ul></div></div></div><div class=\"wob-foot\"><a class=\"wob-all\" href=\"/digital.html\">See all Collage <span class=\"wob-go\" aria-hidden=\"true\">&rarr;</span></a></div></div></div>"};
  var LABEL_TO_PANEL = { 'Writings': 'writings', 'Marks': 'marks', 'Placings': 'placings', 'Collage': 'collage' };
  var nav = header.querySelector('nav');
  if (nav) {
    var navLinks = nav.querySelectorAll('a');
    for (var li = 0; li < navLinks.length; li++) {
      var key = LABEL_TO_PANEL[navLinks[li].textContent.trim()];
      if (key) {
        navLinks[li].setAttribute('data-panel', key);
        navLinks[li].setAttribute('aria-controls', 'wob-' + key);
        navLinks[li].setAttribute('aria-expanded', 'false');
      }
    }
  }
  Object.keys(PANEL_HTML).forEach(function (key) {
    var holder = document.createElement('div');
    holder.innerHTML = PANEL_HTML[key];
    header.appendChild(holder.firstElementChild);
  });

  /* ==========================================================================
     WORLD OF BOOKS MENU: behaviour
     Computer: opens after the pointer rests 0.15 s on a word; closes 0.3 s
     after the pointer leaves word and panel, on Escape, or a click outside.
     Clicking a word still goes to its page. Keyboard: Down arrow opens the
     panel and moves into it. Tablets: first tap opens, second tap goes.
     Under 800 pixels: no panels.
     ========================================================================== */
  var wide = window.matchMedia('(min-width: 800px)');
  var panels = {}, wordOf = {};
  var ps = header.querySelectorAll('.wob-panel');
  for (var i = 0; i < ps.length; i++) panels[ps[i].getAttribute('data-panel')] = ps[i];
  var ws = header.querySelectorAll('nav a[data-panel]');
  for (var j = 0; j < ws.length; j++) wordOf[ws[j].getAttribute('data-panel')] = ws[j];
  var openName = null, held = false, openT = 0, closeT = 0, openY = 0, lastPointer = 'mouse';

  function setMax(p) {
    var r = header.getBoundingClientRect();
    var room = Math.max(260, window.innerHeight - Math.max(0, r.bottom) - 16);
    p.style.setProperty('--wob-max', room + 'px');
  }
  function shut(name) {
    panels[name].classList.remove('is-open');
    wordOf[name].classList.remove('wob-open');
    wordOf[name].setAttribute('aria-expanded', 'false');
  }
  function open(name, hold) {
    clearTimeout(openT); clearTimeout(closeT);
    if (!wide.matches || !panels[name]) return;
    if (openName && openName !== name) shut(openName);
    if (openName !== name && name === 'writings') showKind(pageKind());
    var p = panels[name];
    setMax(p);
    p.classList.add('is-open');
    wordOf[name].classList.add('wob-open');
    wordOf[name].setAttribute('aria-expanded', 'true');
    if (openName !== name) p.scrollTop = 0;
    openName = name; held = !!hold; openY = window.pageYOffset;
  }
  function close() {
    clearTimeout(openT); clearTimeout(closeT);
    if (!openName) return;
    shut(openName);
    openName = null; held = false;
  }
  function later() {
    clearTimeout(closeT);
    if (held) return;
    closeT = setTimeout(close, 300);
  }
  function visible(el) {
    return el.offsetParent !== null && getComputedStyle(el).visibility === 'visible';
  }
  function focusInto(name) {
    var p = panels[name];
    var first = null;
    if (name === 'writings') {
      var act = p.querySelector('.wob-kind.is-active');
      if (act && visible(act)) first = act;
    }
    if (!first) {
      var links = p.querySelectorAll('a');
      for (var k = 0; k < links.length; k++) if (visible(links[k])) { first = links[k]; break; }
    }
    if (first) first.focus();
  }

  Object.keys(wordOf).forEach(function (name) {
    var w = wordOf[name], p = panels[name];
    w.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; });
    w.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(closeT); clearTimeout(openT);
      if (openName === name) return;
      openT = setTimeout(function () { open(name); }, 150);
    });
    w.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(openT);
      if (openName) later();
    });
    w.addEventListener('click', function (e) {
      if (lastPointer !== 'mouse' && wide.matches && openName !== name) {
        e.preventDefault();
        open(name, true);
      }
      lastPointer = 'mouse';
    });
    w.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && wide.matches) {
        e.preventDefault();
        open(name, true);
        focusInto(name);
      }
    });
    p.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') clearTimeout(closeT); });
    p.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') later(); });
  });

  document.addEventListener('click', function (e) {
    if (!openName || header.contains(e.target)) return;
    close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openName) {
      var w = wordOf[openName];
      close();
      w.focus();
    }
  });
  header.addEventListener('focusout', function (e) {
    if (openName && e.relatedTarget && !header.contains(e.relatedTarget)) close();
  });
  window.addEventListener('scroll', function () {
    if (!openName) return;
    if (header.classList.contains('is-hidden') || (!held && Math.abs(window.pageYOffset - openY) > 60)) close();
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (!wide.matches) close();
    else if (openName) setMax(panels[openName]);
  });

  /* ---- Writings: the kinds down the left side (markup arrives with the book build; no-op until then) ---- */
  var wp = panels.writings;
  var kinds = wp ? wp.querySelectorAll('.wob-kind') : [];
  var sets = wp ? wp.querySelectorAll('.wob-kindset') : [];
  var kindT = 0, activeKind = null, kindPointer = 'mouse';
  var KIND = { 'Story': 'Stories', 'Play': 'Plays and Scripts', 'Essay': 'Essays', 'Poem': 'Poems',
    'Prayer': 'Prayers', 'Letter': 'Letters and Texts', 'Text': 'Letters and Texts',
    'Conversation': 'Conversations', 'Short Piece': 'Short Pieces' };
  function pageKind() {
    var k = document.body.getAttribute('data-kind');
    for (var n = 0; n < kinds.length; n++) if (kinds[n].getAttribute('data-kind') === k) return k;
    return 'Stories';
  }
  function showKind(k) {
    if (!k) return;
    activeKind = k;
    for (var n = 0; n < kinds.length; n++) {
      var on = kinds[n].getAttribute('data-kind') === k;
      kinds[n].classList.toggle('is-active', on);
      if (on) kinds[n].setAttribute('aria-current', 'true'); else kinds[n].removeAttribute('aria-current');
    }
    for (var m = 0; m < sets.length; m++) sets[m].classList.toggle('is-active', sets[m].getAttribute('data-kind') === k);
  }
  function activeSet() {
    for (var m = 0; m < sets.length; m++) if (sets[m].classList.contains('is-active')) return sets[m];
    return null;
  }
  Array.prototype.forEach.call(kinds, function (a, idx) {
    var k = a.getAttribute('data-kind');
    a.addEventListener('pointerdown', function (e) { kindPointer = e.pointerType; });
    a.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(kindT);
      kindT = setTimeout(function () { showKind(k); }, 120);
    });
    a.addEventListener('pointerleave', function () { clearTimeout(kindT); });
    a.addEventListener('focus', function () { showKind(k); });
    a.addEventListener('click', function (e) {
      if (kindPointer !== 'mouse' && activeKind !== k) { e.preventDefault(); showKind(k); }
      kindPointer = 'mouse';
    });
    a.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && idx < kinds.length - 1) { e.preventDefault(); kinds[idx + 1].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (idx > 0) kinds[idx - 1].focus(); else wordOf.writings.focus(); }
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        var s = activeSet(), first = s && s.querySelector('a');
        if (first) first.focus();
      }
    });
  });
  Array.prototype.forEach.call(sets, function (s) {
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        var act = wp.querySelector('.wob-kind.is-active');
        if (act) { e.preventDefault(); act.focus(); }
      }
    });
  });
})();

/* ---- Directory footer: put it in place of the page's small old footer ---- */
(function () {
  var old = document.querySelector('footer.site-footer');
  if (!old) return;
  var holder = document.createElement('div');
  holder.innerHTML = "<footer class=\"directory-footer\" id=\"footer\"><div class=\"df-in\"><p class=\"df-wordmark\"><a href=\"/\">Paraploo</a></p><section class=\"df-row df-writings df-foldable\"><div class=\"df-head\"><h2 class=\"df-label\"><a href=\"/writings.html\">Writings</a></h2><button type=\"button\" class=\"df-fold\" aria-expanded=\"false\" aria-controls=\"df-writings-cols\" aria-label=\"Open Writings\" data-name=\"Writings\"></button></div><div class=\"df-cols df-writings-tonight\" id=\"df-writings-cols\"><div class=\"df-col\"><div class=\"df-block\"><a class=\"df-h\" href=\"/writings.html\">Where to begin</a><ul class=\"df-list\"><li><a href=\"/room-one.html\">Come In</a></li><li><a href=\"/room-two.html\">Come Through</a></li><li><a href=\"/room-three.html\">Come Sit</a></li><li><a href=\"/room-four.html\">Come Look</a></li><li><a href=\"/room-five.html\">Come Stand</a></li><li><a href=\"/room-six.html\">Come Down</a></li></ul></div></div><div class=\"df-col\"><div class=\"df-block\"><a class=\"df-h\" href=\"/the-book.html\">The Book</a><ul class=\"df-list\"><li><a href=\"/book-door-1.html\">A Machine That Can Hear, Too</a></li><li><a href=\"/book-door-2.html\">Too Great a Listener for its own Good</a></li><li><a href=\"/book-door-3.html\">Strange 7:46 Objects</a></li><li><a href=\"/book-door-4.html\">Morning Over Troubled Floors</a></li></ul></div></div></div></section><section class=\"df-row df-marks df-foldable\"><div class=\"df-head\"><h2 class=\"df-label\"><a href=\"/marks.html\">Marks</a></h2><button type=\"button\" class=\"df-fold\" aria-expanded=\"false\" aria-controls=\"df-marks-cols\" aria-label=\"Open Marks\" data-name=\"Marks\"></button></div><div class=\"df-cols df-cols-dated\" id=\"df-marks-cols\"><div class=\"df-lead\"><a class=\"df-h df-lead-link\" href=\"/marks/most-recent/\">Most Recent <span aria-hidden=\"true\">&rarr;</span></a></div><div class=\"df-col df-grp-smooth-beh-laye\"><div class=\"df-block\"><a class=\"df-h\" href=\"/marks/smooth-beh-laye/\">Smooth Beh Laye</a><ul class=\"df-list\"><li><a href=\"/marks/smooth-beh-laye/another-booklet/\">Another Booklet</a></li><li><a href=\"/marks/smooth-beh-laye/biology-class/\">Biology Class</a></li><li><a href=\"/marks/smooth-beh-laye/haring-bone/\">Haring Bone</a></li><li><a href=\"/marks/smooth-beh-laye/intense-color/\">Intense Color</a></li><li><a href=\"/marks/smooth-beh-laye/lightly-tinted/\">Lightly Tinted</a></li><li><a href=\"/marks/smooth-beh-laye/minimal-impact/\">Minimal Impact</a></li><li><a href=\"/marks/smooth-beh-laye/one-follicle-at-a-time/\">One Follicle at a Time</a></li><li><a href=\"/marks/smooth-beh-laye/other-worldly/\">Other Worldly</a></li><li><a href=\"/marks/smooth-beh-laye/stained-fog/\">Stained Fog</a></li><li><a href=\"/marks/smooth-beh-laye/student-phase/\">Student Phase</a></li><li><a href=\"/marks/smooth-beh-laye/tears-and-raindrops/\">Tears and Raindrops</a></li><li><a href=\"/marks/smooth-beh-laye/the-chair/\">The Chair</a></li><li><a href=\"/marks/smooth-beh-laye/thousand-marks/\">Thousand Marks</a></li><li><a href=\"/marks/smooth-beh-laye/word-mapping/\">Word Mapping</a></li></ul></div></div><div class=\"df-col df-grp-fast-thin-dues\"><div class=\"df-block\"><a class=\"df-h\" href=\"/marks/fast-thin-dues/\">Fast Thin Dues</a><ul class=\"df-list\"><li><a href=\"/marks/fast-thin-dues/agitation-exercise/\">Agitation Exercise</a></li><li><a href=\"/marks/fast-thin-dues/blossom-petal-garden/\">Blossom Petal Garden</a></li><li><a href=\"/marks/fast-thin-dues/clouds-redefined/\">Clouds Redefined</a></li><li><a href=\"/marks/fast-thin-dues/dry-grass-and-tears/\">Dry Grass and Tears</a></li><li><a href=\"/marks/fast-thin-dues/how-to-remain-a-modern-artist/\">How to Remain a Modern Artist</a></li><li><a href=\"/marks/fast-thin-dues/loops-hopes/\">Loops Hopes</a></li><li><a href=\"/marks/fast-thin-dues/most-complexy-asemities/\">Most Complexy Asemities</a></li><li><a href=\"/marks/fast-thin-dues/slanted-character/\">Slanted Character</a></li><li><a href=\"/marks/fast-thin-dues/slap-maps/\">Slap Maps</a></li><li><a href=\"/marks/fast-thin-dues/water-surfaces/\">Water Surfaces</a></li></ul></div></div><div class=\"df-col df-grp-pages-for-baby-divine\"><div class=\"df-block\"><a class=\"df-h\" href=\"/marks/pages-for-baby-divine/\">Pages for Baby Divine</a><ul class=\"df-list\"><li><a href=\"/marks/pages-for-baby-divine/pages-for-baby-divine-a/\">Part A</a></li><li><a href=\"/marks/pages-for-baby-divine/pages-for-baby-divine-b/\">Part B</a></li></ul></div></div><div class=\"df-col df-grp-gog-guldah-variations\"><div class=\"df-block\"><a class=\"df-h\" href=\"/marks/gog-guldah-variations/\">Gog Guldah Variations</a></div></div><div class=\"df-col df-grp-handwritten\"><div class=\"df-block\"><a class=\"df-h\" href=\"/words/hand-writings/\">Handwritten Every Which Way</a><ul class=\"df-list\"><li><a href=\"/words/hand-writings/cool/\">Cool</a></li><li><a href=\"/words/hand-writings/distinct-territory/\">Distinct Territory</a></li><li><a href=\"/mind-mapping/eclipse/\">Eclipse</a></li><li><a href=\"/mind-mapping/in-the-shade/\">In The Shade</a></li><li><a href=\"/words/hand-writings/ink-on-yellow/\">Ink On Yellow</a></li><li><a href=\"/words/hand-writings/looks-like-ox-blood/\">Looks Like Ox Blood</a></li><li><a href=\"/mind-mapping/neutral/\">Neutral</a></li><li><a href=\"/words/hand-writings/vivid-gray-cast/\">Vivid Gray Cast</a></li></ul></div></div><div class=\"df-col df-grp-sumi-brush-drawings\"><div class=\"df-block\"><a class=\"df-h\" href=\"/sumi.html\">Sumi Brush Drawings</a><ul class=\"df-list\"><li><a href=\"/digital/fluid-ink-instrumental/\">Fluid Ink Instrumental</a></li><li><a href=\"/digital/shoe-whah-si-daye-sew/\">Shoe Whah Si Daye Sew</a></li><li><a href=\"/digital/ga-assortment/\">Ga Assortment</a></li><li><a href=\"/digital/desert-murat-fait/\">Desert Murat Fait</a></li></ul></div></div></div></section><section class=\"df-row df-placings df-foldable\"><div class=\"df-head\"><h2 class=\"df-label\"><a href=\"/physical.html\">Placings</a></h2><button type=\"button\" class=\"df-fold\" aria-expanded=\"false\" aria-controls=\"df-placings-cols\" aria-label=\"Open Placings\" data-name=\"Placings\"></button></div><div class=\"df-cols\" id=\"df-placings-cols\"><div class=\"df-col\"><ul class=\"df-list\"><li><a href=\"/physical/above-stones-feugo/\">Above Stones Feugo</a></li><li><a href=\"/physical/after-a-storm-interpretations/\">After a Storm Interpretations</a></li><li><a href=\"/physical/after-the-party/\">After the Party</a></li><li><a href=\"/physical/anthro-archeo/\">Anthro Archeo</a></li><li><a href=\"/physical/archeo/\">Archeo</a></li><li><a href=\"/physical/archeo-dream/\">Archeo Dream</a></li><li><a href=\"/physical/attempts-to-provoke/\">Attempts to Provoke</a></li><li><a href=\"/physical/beauty-sleeps-here/\">Beauty Sleeps Here</a></li><li><a href=\"/physical/believable/\">Believable</a></li><li><a href=\"/physical/blame-it-on-lame-intentions/\">Blame It on Lame Intentions</a></li><li><a href=\"/physical/blue-glass-ball-and-more/\">Blue Glass Ball and More</a></li><li><a href=\"/physical/boiling-point/\">Boiling Point</a></li><li><a href=\"/physical/brrd-house/\">Brrd House</a></li><li><a href=\"/physical/cool-warming/\">Cool Warming</a></li></ul></div><div class=\"df-col\"><ul class=\"df-list\"><li><a href=\"/physical/crutch-and-other-stuff/\">Crutch and Other Stuff</a></li><li><a href=\"/physical/curious-first-every-time/\">Curious First Every Time</a></li><li><a href=\"/physical/day-stage-textile-space/\">Day Stage Textile Space</a></li><li><a href=\"/physical/dirty-ol-shipyard/\">Dirty Ol Shipyard</a></li><li><a href=\"/physical/dug-ity-dig-wonders/\">DUG-ITY Dig Wonders</a></li><li><a href=\"/physical/entitled-white-sheets/\">Entitled White Sheets</a></li><li><a href=\"/physical/flux-art-temperature/\">Flux Art Temperature</a></li><li><a href=\"/physical/foamboard-holes-plus/\">Foamboard Holes Plus</a></li><li><a href=\"/physical/free-attempt/\">Free Attempt</a></li><li><a href=\"/physical/get-the-stuff-out/\">Get the Stuff Out</a></li><li><a href=\"/physical/had-a-concrete-heart-once/\">Had a Concrete Heart Once</a></li><li><a href=\"/physical/handin-pocket-still-life/\">Handin Pocket Still Life</a></li><li><a href=\"/physical/hanging-holes-frame/\">Hanging Holes Frame</a></li><li><a href=\"/physical/holy-stoney-table-and-grade/\">Holy Stoney Table and Grade</a></li></ul></div><div class=\"df-col\"><ul class=\"df-list\"><li><a href=\"/physical/host-the-most/\">Host the Most</a></li><li><a href=\"/physical/hot-evening-prayers/\">Hot Evening Prayers</a></li><li><a href=\"/physical/ignore-the-fallen-leaves/\">Ignore the Fallen Leaves</a></li><li><a href=\"/physical/it-is-good-to-not-always-know/\">It Is Good to Not Always Know</a></li><li><a href=\"/physical/kandah-dusk-proof/\">Kandah Dusk Proof</a></li><li><a href=\"/physical/kiwanuk-questions/\">Kiwanuk Questions</a></li><li><a href=\"/physical/late-grief-sun/\">Late Grief Sun</a></li><li><a href=\"/physical/let-it-be-attitude/\">Let It Be Attitude</a></li><li><a href=\"/physical/light-for-marine-hues/\">Light for Marine Hues</a></li><li><a href=\"/physical/materials-for-tinkering/\">Materials for Tinkering</a></li><li><a href=\"/physical/mercy-and-no-mercy/\">Mercy and No Mercy</a></li><li><a href=\"/physical/messornot/\">Messornot</a></li><li><a href=\"/physical/mister-sandman-garbage/\">Mister Sandman Garbage</a></li><li><a href=\"/physical/nariwen-innocence-proof/\">Nariwen Innocence Proof</a></li></ul></div><div class=\"df-col\"><ul class=\"df-list\"><li><a href=\"/physical/night-home/\">Night Home</a></li><li><a href=\"/physical/night-red-cross-tent/\">Night Red Cross Tent</a></li><li><a href=\"/physical/noir-music-night-of-day/\">Noir Music Night of Day</a></li><li><a href=\"/physical/numbers-game-auction/\">Numbers Game Auction</a></li><li><a href=\"/physical/orange-fur-project/\">Orange Fur Project</a></li><li><a href=\"/physical/outside-carpet-treaty/\">Outside Carpet Treaty</a></li><li><a href=\"/physical/piles-of-boards/\">Piles of Boards</a></li><li><a href=\"/physical/plethora-at-play-details/\">Plethora At Play Details</a></li><li><a href=\"/physical/pray-for-destroyed-mirrors/\">Pray for Destroyed Mirrors</a></li><li><a href=\"/physical/precious-wet-black-soil/\">Precious Wet Black Soil</a></li><li><a href=\"/physical/rashing-to-show-these-items/\">Rashing to Show These Items</a></li><li><a href=\"/physical/salt-of-sand-and-more/\">Salt of Sand and More</a></li><li><a href=\"/physical/shadeless-lamps-showcased/\">Shadeless Lamps Showcased</a></li><li><a href=\"/physical/signs-of-damage/\">Signs of Damage</a></li></ul></div><div class=\"df-col\"><ul class=\"df-list\"><li><a href=\"/physical/soiled-linoleum-cords/\">Soiled Linoleum Cords</a></li><li><a href=\"/physical/stuff-backlit/\">Stuff Backlit</a></li><li><a href=\"/physical/surreal-plastic-fish/\">Surreal Plastic Fish</a></li><li><a href=\"/physical/temporary-frozen-thrill/\">Temporary Frozen Thrill</a></li><li><a href=\"/physical/this-space-for-getting-primed/\">This Space for Getting Primed</a></li><li><a href=\"/physical/true-colors-and-grit/\">True Colors and Grit</a></li><li><a href=\"/physical/unlabeled-package/\">Unlabeled Package</a></li><li><a href=\"/physical/unreal-cowboy-hat/\">Unreal Cowboy Hat</a></li><li><a href=\"/physical/we-did-not-want-to-become-this/\">We Did Not Want to Become This</a></li><li><a href=\"/physical/werg-and-gis-middle-labor/\">Werg and Gis Middle Labor</a></li><li><a href=\"/physical/western-nothing/\">Western Nothing</a></li><li><a href=\"/physical/woa-mun/\">Woa Mun</a></li></ul></div></div></section><section class=\"df-row df-collage df-foldable\"><div class=\"df-head\"><h2 class=\"df-label\"><a href=\"/digital.html\">Collage</a></h2><button type=\"button\" class=\"df-fold\" aria-expanded=\"false\" aria-controls=\"df-collage-cols\" aria-label=\"Open Collage\" data-name=\"Collage\"></button></div><div class=\"df-cols\" id=\"df-collage-cols\"><div class=\"df-col\"><div class=\"df-block\"><a class=\"df-h\" href=\"/digital.html#collage-work\">Pieces Together</a></div><div class=\"df-block\"><a class=\"df-h\" href=\"/digital.html#symmetrical-and-kaleidoscopic\">Symmetrical and Kaleidoscopic</a></div></div><div class=\"df-col\"><div class=\"df-block\"><a class=\"df-h\" href=\"/digital.html#photomosaics\">Photomosaics</a></div></div><div class=\"df-col\"><div class=\"df-block\"><a class=\"df-h\" href=\"/digital.html#photographs-of-places-and-things\">Photographs of Places and Things</a></div></div><div class=\"df-col\"><div class=\"df-block\"><a class=\"df-h\" href=\"/digital.html#photographs-of-people\">Photographs of People</a></div></div><div class=\"df-col\"><div class=\"df-block\"><a class=\"df-h\" href=\"/digital.html#text-and-typographic-pieces\">Text and Typographic Pieces</a></div></div></div></section><section class=\"df-row df-song\"><div class=\"df-head\"><h2 class=\"df-label\"><a href=\"/musicology.html\">Favorite Songs</a></h2></div><p class=\"df-line\">We often love to listen to music while we work.</p><ul class=\"df-rooms\"><li><a href=\"/musicology.html\">Songs</a></li><li><a href=\"/musicology/artists.html\">Artists</a></li><li><a href=\"/musicology/stories-and-essays.html\">Stories and Essays</a></li><li><a href=\"/musicology/soundtracks.html\">Noir Cinema Soundtracks</a></li></ul></section><section class=\"df-row df-last\"><div class=\"df-cols\"><div class=\"df-ways\"><h2 class=\"df-label df-plain\">Ways In</h2><ul class=\"df-list\"><li><a href=\"/the-book.html\">The Book</a></li><li><a href=\"/wander/\">Wander</a></li><li><a href=\"/walks.html\">Walks</a></li><li><a href=\"/history.html\">History</a></li><li><a href=\"/about/our-history-in-pictures/\">Our History in Pictures</a></li></ul></div><div class=\"df-contact\"><h2 class=\"df-label df-plain\">Contact Us</h2><p>Twin Cities, Minnesota</p><p><a href=\"mailto:hello@paraploo.com\">hello@paraploo.com</a></p><a class=\"df-write\" href=\"mailto:hello@paraploo.com\">Write to us <svg viewBox=\"0 0 14 14\" aria-hidden=\"true\"><path d=\"M1 7h12M8 2l5 5-5 5\"/></svg></a></div></div></section><div class=\"df-legal\"><p><a href=\"/privacy.html\">Your privacy</a><span aria-hidden=\"true\">&middot;</span><a href=\"/legal-notice.html\">Legal notice</a></p><p>&copy; 2026 Paraploo</p></div></div></footer>";
  var f = holder.firstElementChild;
  old.parentNode.replaceChild(f, old);
/* ==========================================================================
   DIRECTORY FOOTER: behaviour (the shared footer file carries this part)
   On phones the four section rows start folded; the + opens one.
   ========================================================================== */
(function () {
  var rows = document.querySelectorAll('.directory-footer .df-foldable');
  Array.prototype.forEach.call(rows, function (row) {
    var b = row.querySelector('.df-fold');
    if (!b) return;
    var name = b.getAttribute('data-name') || '';
    b.addEventListener('click', function () {
      var on = row.classList.toggle('is-open');
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
      b.setAttribute('aria-label', (on ? 'Close ' : 'Open ') + name);
    });
  });
})();

})();

/* Step 6 (October 2, 2026): the footer's names are set in Archivo; pages that do not load it yet get it here. */
(function () {
  if (document.querySelector('link[href*="family=Archivo"]')) return;
  var l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112,600&display=swap';
  document.head.appendChild(l);
})();
