// Shared site-search overlay logic for the standalone pages (home + /writing/ front door).
// Same behaviour as the inline script in BaseLayout/ReadingLayout; MiniSearch + the index
// load only on first open. Vendored MiniSearch import because these pages are not bundled.
const _btn = document.getElementById('searchBtn');
const _overlay = document.getElementById('oySearch');
const _input = document.getElementById('oySearchInput');
const _close = document.getElementById('oySearchClose');
const _status = document.getElementById('oySearchStatus');
const _results = document.getElementById('oySearchResults');
let _mini = null, _docs = null, _loading = null, _topHref = null;
const _esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function ensureIndex() {
  if (_loading) return _loading;
  _loading = (async () => {
    const [{ default: MiniSearch }, data] = await Promise.all([
      import('/vendor/minisearch.js'),
      fetch('/search-index.json').then((r) => r.json()),
    ]);
    _docs = data;
    _mini = new MiniSearch({
      idField: 'slug',
      fields: ['title', 'body'],
      storeFields: ['slug', 'title', 'cluster', 'date', 'excerpt'],
      searchOptions: { boost: { title: 3 }, prefix: true, fuzzy: 0.2 },
    });
    _mini.addAll(_docs);
  })();
  return _loading;
}

function render(q) {
  q = (q || '').trim();
  _topHref = null;
  if (!q) { _results.innerHTML = ''; _status.textContent = _docs ? ('Search ' + _docs.length + ' pieces.') : 'Type to search.'; return; }
  if (!_mini) { _status.textContent = 'Loading…'; return; }
  const hits = _mini.search(q).slice(0, 40);
  if (!hits.length) { _results.innerHTML = ''; _status.textContent = 'No matches for “' + q + '”.'; return; }
  _status.textContent = hits.length + (hits.length === 1 ? ' result' : ' results');
  _topHref = '/writing/' + hits[0].slug + '/';
  _results.innerHTML = hits.map((h) =>
    '<li class="oy-search-item"><a class="oy-search-link" href="/writing/' + encodeURIComponent(h.slug) + '/">' +
    '<span class="oy-search-title">' + _esc(h.title) + '</span>' +
    '<span class="oy-search-meta">' + _esc(h.cluster) + (h.date ? ' · ' + _esc(h.date) : '') + '</span>' +
    '<span class="oy-search-excerpt">' + _esc(h.excerpt) + '</span>' +
    '</a></li>').join('');
}

async function openSearch(e) {
  if (e) e.preventDefault();
  _overlay.classList.add('open');
  _overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  _input.focus();
  _status.textContent = 'Loading…';
  await ensureIndex();
  render(_input.value);
}
function closeSearch() {
  _overlay.classList.remove('open');
  _overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (_btn) _btn.addEventListener('click', openSearch);
if (_close) _close.addEventListener('click', closeSearch);
if (_overlay) _overlay.addEventListener('click', (e) => { if (e.target === _overlay) closeSearch(); });
if (_input) _input.addEventListener('input', () => render(_input.value));
document.addEventListener('keydown', (e) => {
  if (!_overlay || !_overlay.classList.contains('open')) return;
  if (e.key === 'Escape') closeSearch();
  else if (e.key === 'Enter' && _topHref) window.location.href = _topHref;
});
