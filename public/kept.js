/* The Kept page (the preview of October 23, 2026, as built November 2026; SITE-ORDER\KEEP-LIST-BUILD): everything kept in this browser,
   newest kept first. Letting go of something here leaves it in place, reading
   "Keep", until the visitor leaves, so nothing jumps under the hand and it can
   be kept again. The band takes the colour of the newest thing kept. A picture shows its name as its own page
   heads it, with its gallery and catalogue number under it. */
(function () {
  var html = document.documentElement;
  var list = document.querySelector('.kept-list');
  var empty = document.querySelector('.kept-empty');
  var off = document.querySelector('.kept-off');
  var changedElsewhere = false;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function keepButton(it) {
    var b = el('button', 'keep');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'true');
    b.dataset.keepU = it.u;
    b.dataset.keepPage = '1';
    b.appendChild(el('span', 'keep-word', 'Kept'));
    b.appendChild(el('span', 'keep-vh', ' ' + it.t));
    b.__item = it;
    return b;
  }
  function writingRow(it) {
    var li = el('li', 'kept-item kept-writing');
    var a = el('a', 'kept-row'); a.href = it.u;
    var words = el('span', 'kept-row-words');
    words.appendChild(el('span', 'kept-row-title', it.t));
    if (it.m) words.appendChild(el('span', 'kept-row-meta', it.m));
    a.appendChild(words);
    var arrow = el('span', 'row-arrow', '→'); arrow.setAttribute('aria-hidden', 'true');
    a.appendChild(arrow);
    li.appendChild(a);
    li.appendChild(keepButton(it));
    return li;
  }
  function pictureItem(it) {
    var li = el('li', 'kept-item kept-picture');
    var a = el('a', 'kept-pic'); a.href = it.u;
    var img = el('img');
    img.src = it.s; img.alt = it.t;
    if (it.w && it.h) { img.width = it.w; img.height = it.h; }
    img.loading = 'lazy'; img.decoding = 'async';
    a.appendChild(img);
    li.appendChild(a);
    var under = el('div', 'kept-under');
    var num = el('a', 'kept-num', it.t); num.href = it.u;
    under.appendChild(num);
    var from = [it.m, it.n].filter(function (x) { return x; }).join(' \u00b7 ');
    if (from) under.appendChild(el('span', 'kept-from', from));
    under.appendChild(keepButton(it));
    li.appendChild(under);
    return li;
  }

  function render() {
    changedElsewhere = false;
    var K = window.ParaplooKeep;
    while (list.firstChild) list.removeChild(list.firstChild);
    if (!K) {               // this browser keeps nothing
      html.classList.add('kept-is-empty');
      off.hidden = false; empty.hidden = true;
      return;
    }
    var items = K.read().filter(function (x) { return x && x.u; })
      .sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    if (!items.length) {
      html.classList.add('kept-is-empty');
      empty.hidden = false;
      return;
    }
    html.classList.remove('kept-is-empty');
    empty.hidden = true;
    var first = items[0];
    if (first.l) html.style.setProperty('--kept-l', first.l);
    if (first.d) html.style.setProperty('--kept-d', first.d);
    for (var i = 0; i < items.length; i++) {
      var li = items[i].k === 'picture' && items[i].s ? pictureItem(items[i]) : writingRow(items[i]);
      list.appendChild(li);
      K.wire(li.querySelector('.keep'));
    }
  }

  window.addEventListener('storage', function (e) { if (!window.ParaplooKeep || e.key === window.ParaplooKeep.KEY) changedElsewhere = true; });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && changedElsewhere) render(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) render(); });
  render();
})();
