// Builds public/everything.html: a live-counted index of every entrance into the site.
// Counts pictures, writings and galleries by walking the public/ folder directly —
// it does not trust the (sometimes stale) numbers printed on other pages.
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');

const PICTURE_RE = /^\d{4}\.html$/;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// ---- Site-wide totals ----

// Pictures: every numbered picture page anywhere in public/.
const allFiles = walk(publicDir);
const totalPictures = allFiles.filter((f) => PICTURE_RE.test(basename(f))).length;

// Writings: index.html two levels under public/words/<group>/<slug>/index.html,
// excluding the hand-writings group (that's a picture gallery, listed under Marks).
const wordsDir = join(publicDir, 'words');
const wordGroups = readdirSync(wordsDir).filter(
  (g) => statSync(join(wordsDir, g)).isDirectory() && g !== 'hand-writings'
);
function countWritings(groupSlug) {
  const groupDir = join(wordsDir, groupSlug);
  return readdirSync(groupDir).filter((e) => statSync(join(groupDir, e)).isDirectory()).length;
}
const totalWritings = wordGroups.reduce((sum, g) => sum + countWritings(g), 0);

// Galleries: any page (recursively) that renders a gallery-grid, excluding the
// five section index pages themselves (Marks/Physical/Screen/Maps + their nav).
const SECTION_PAGES = new Set(
  ['marks.html', 'physical.html', 'digital.html', 'mind-mapping/index.html'].map((p) =>
    join(publicDir, p)
  )
);
const totalGalleries = allFiles.filter((f) => {
  if (!f.endsWith('.html')) return false;
  if (SECTION_PAGES.has(f)) return false;
  const content = readFileSync(f, 'utf8');
  return content.includes('class="gallery-grid"');
}).length;

// ---- Per-entry counts ----

// Gallery pages link to their contents by href, and those hrefs don't always live
// at the nested filesystem path their href implies (e.g. a group page under
// /marks/fast-thin-dues/ can link out to a sub-gallery physically stored at
// /marks/<slug>/). So counting pictures means following the real link graph,
// not walking directories.
function resolveHrefToFile(href) {
  let p = href.replace(/^\//, '');
  if (p === 'loves') p = 'loves.html';
  else if (p.endsWith('/')) p = p + 'index.html';
  else if (!p.endsWith('.html')) p = p + '.html';
  const full = join(publicDir, p);
  try {
    if (statSync(full).isFile()) return full;
  } catch {}
  return null;
}

function countPicturesFollowingLinks(href, visited = new Set()) {
  if (visited.has(href)) return 0;
  visited.add(href);
  const file = resolveHrefToFile(href);
  if (!file) return 0;
  if (PICTURE_RE.test(basename(file))) return 1;
  const content = readFileSync(file, 'utf8');
  if (content.includes('class="gallery-grid"')) {
    const hrefs = [...content.matchAll(/class="gallery-item"[^>]*href="([^"]+)"/g)].map(
      (m) => m[1]
    );
    return hrefs.reduce((sum, h) => sum + countPicturesFollowingLinks(h, visited), 0);
  }
  return (content.match(/<img\b/g) || []).length;
}

const WORDS_ENTRIES = [
  { years: '2021–25', name: 'Immediate Family', href: '/words/2021-25-immediate-family/', group: '2021-25-immediate-family' },
  { years: '2022–23', name: 'Variety', href: '/words/2022-23-variety/', group: '2022-23-variety' },
  { years: '2023–25', name: 'Phone Texts', href: '/words/2023-25-phone-texts/', group: '2023-25-phone-texts' },
  { years: '2024', name: 'Variety', href: '/words/2024-variety/', group: '2024-variety' },
  { years: '2025', name: 'Variety', href: '/words/2025-variety/', group: '2025-variety' },
  { years: '2026', name: 'Methodology', href: '/words/2026-methodology/', group: '2026-methodology' },
  { years: '2026', name: 'Variety', href: '/words/2026-variety/', group: '2026-variety' },
];
const WORDS_DOORS = [
  { name: 'The Book', href: '/the-book.html' },
  { name: 'Survival of Humanity', href: '/survival/' },
  { name: 'Wander', href: '/wander' },
];

const MARKS_ENTRIES = [
  { name: 'Fast Thin Dues', href: '/marks/fast-thin-dues/' },
  { name: 'Smooth Beh Laye', href: '/marks/smooth-beh-laye/' },
  { name: 'Hand Writings', href: '/words/hand-writings/' },
  { name: 'Logotypes', href: '/logotypes/' },
  { name: 'Sumi', href: '/sumi.html' },
  { name: 'Loves', href: '/loves' },
  { name: 'Our History in Pictures', href: '/about/our-history-in-pictures/' },
  { name: 'History', href: '/history.html' },
];

const PHYSICAL_ENTRIES = [
  { name: 'Cool Warming', href: '/physical/cool-warming/' },
  { name: 'Kandah Dusk Proof', href: '/physical/kandah-dusk-proof/' },
  { name: 'Numbers Game Auction', href: '/physical/numbers-game-auction/' },
  { name: 'Outside Carpet Treaty', href: '/physical/outside-carpet-treaty/' },
  { name: 'Salt of Sand and More', href: '/physical/salt-of-sand-and-more/' },
  { name: 'True Colors and Grit', href: '/physical/true-colors-and-grit/' },
  { name: 'Werg and Gis Middle Labor', href: '/physical/werg-and-gis-middle-labor/' },
  { name: 'Woa Mun', href: '/physical/woa-mun/' },
];

const SCREEN_ENTRIES = [
  { name: 'Photo Realism', href: '/digital/photo-realism/' },
  { name: 'Extra Extra', href: '/digital/extra-extra/' },
  { name: 'Inspiration Boards', href: '/digital/inspiration-boards-dept/' },
  { name: 'Biggest Mosaic Ever', href: '/digital/biggest-mosaic-ever/' },
  { name: 'Shur Shee Symmetrical', href: '/digital/shur-shee-symmetrical/' },
  { name: 'Sista Ro', href: '/digital/sista-ro-extreme-heat/' },
  { name: 'Text Based', href: '/digital/text-based-visual-works/' },
  { name: 'Grand Assortment', href: '/digital/grand-assortment/' },
];

const MAPS_ENTRIES = [
  { name: 'Eclipse', href: '/mind-mapping/eclipse/' },
  { name: 'In The Shade', href: '/mind-mapping/in-the-shade/' },
  { name: 'Neutral', href: '/mind-mapping/neutral/' },
];

function wordsRow(entry) {
  const count = countWritings(entry.group);
  return `    <li>
      <a class="writings-row" href="${entry.href}">
        <span class="writings-row-left">
          <span class="writings-row-years">${entry.years}</span>
          <span class="writings-row-name">${entry.name}</span>
        </span>
        <span class="writings-row-count">${count} writings</span>
      </a>
    </li>`;
}

function doorRow(entry) {
  return `    <li>
      <a class="writings-row" href="${entry.href}">
        <span class="writings-row-name">${entry.name}</span>
      </a>
    </li>`;
}

function pictureRow(entry) {
  const count = countPicturesFollowingLinks(entry.href);
  return `    <li>
      <a class="writings-row" href="${entry.href}">
        <span class="writings-row-left">
          <span class="writings-row-name">${entry.name}</span>
        </span>
        <span class="writings-row-count">${count} pictures</span>
      </a>
    </li>`;
}

function block(title, sectionHref, count, countLabel, rowsHtml) {
  return `  <div class="everything-block">
    <h2 class="everything-block-heading"><a href="${sectionHref}">${title}</a> <span class="everything-block-count">${count} ${countLabel}</span></h2>
    <ul class="writings-rows">
${rowsHtml}
    </ul>
  </div>`;
}

const wordsWritingsTotal = WORDS_ENTRIES.reduce((sum, e) => sum + countWritings(e.group), 0);
const marksPicturesTotal = MARKS_ENTRIES.reduce((sum, e) => sum + countPicturesFollowingLinks(e.href), 0);
const physicalPicturesTotal = PHYSICAL_ENTRIES.reduce((sum, e) => sum + countPicturesFollowingLinks(e.href), 0);
const screenPicturesTotal = SCREEN_ENTRIES.reduce((sum, e) => sum + countPicturesFollowingLinks(e.href), 0);
const mapsPicturesTotal = MAPS_ENTRIES.reduce((sum, e) => sum + countPicturesFollowingLinks(e.href), 0);

const wordsRows = [...WORDS_ENTRIES.map(wordsRow), ...WORDS_DOORS.map(doorRow)].join('\n');
const marksRows = MARKS_ENTRIES.map(pictureRow).join('\n');
const physicalRows = PHYSICAL_ENTRIES.map(pictureRow).join('\n');
const screenRows = SCREEN_ENTRIES.map(pictureRow).join('\n');
const mapsRows = MAPS_ENTRIES.map(pictureRow).join('\n');

const blocksHtml = [
  block('Words', '/writings.html', wordsWritingsTotal, 'writings', wordsRows),
  block('Marks', '/marks.html', marksPicturesTotal, 'pictures', marksRows),
  block('Physical', '/physical.html', physicalPicturesTotal, 'pictures', physicalRows),
  block('Screen', '/digital.html', screenPicturesTotal, 'pictures', screenRows),
  block('Maps', '/mind-mapping/', mapsPicturesTotal, 'pictures', mapsRows),
].join('\n\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Everything, in a hundred words.</title>
<meta name="description" content="Everything, in a hundred words — every entrance into Paraploo, with live counts.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:ital@1&family=Inter:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/HISTORY-ASSEMBLED/history.css">
<link rel="stylesheet" href="/chrome.css?v=20260925-wordmark">
<script src="/theme.js"></script>
<style>
  body{
    background:var(--white);
    color:var(--text);
  }
  .writings-content{
    box-sizing:border-box;
    width:100%;
    max-width:768px;
    margin:0 auto;
    padding:64px 24px 96px;
  }
  .writings-heading{
    margin:0 0 8px;
    font-family:'DM Sans',Arial,sans-serif;
    font-weight:500;
    color:var(--text);
    font-size:44px;
    line-height:1.2;
  }
  .writings-intro{
    margin:0 0 40px;
    font-family:'DM Sans',Arial,sans-serif;
    font-weight:400;
    font-size:16px;
    line-height:1.5;
    color:color-mix(in srgb, var(--text) 65%, transparent);
  }
  .everything-block{
    margin:0 0 48px;
  }
  .everything-block-heading{
    margin:0 0 4px;
    font-family:'DM Sans',Arial,sans-serif;
    font-weight:500;
    font-size:22px;
    line-height:1.3;
    color:var(--text);
  }
  .everything-block-heading a{
    color:var(--text);
    text-decoration:none;
  }
  .everything-block-heading a:hover{
    text-decoration:underline;
  }
  .everything-block-count{
    font-family:'DM Sans',Arial,sans-serif;
    font-weight:400;
    font-size:14px;
    color:color-mix(in srgb, var(--text) 65%, transparent);
  }
  .writings-rows{
    list-style:none;
    margin:0;
    padding:0;
  }
  .writings-rows li{
    border-top:1px solid color-mix(in srgb, var(--text) 12%, transparent);
  }
  .writings-rows li:last-child{
    border-bottom:1px solid color-mix(in srgb, var(--text) 12%, transparent);
  }
  .writings-row{
    display:flex;
    align-items:baseline;
    justify-content:space-between;
    gap:16px;
    padding:20px 0;
    text-decoration:none;
    color:var(--text);
    -webkit-tap-highlight-color:transparent;
  }
  .writings-row-left{
    display:flex;
    align-items:baseline;
    gap:16px;
    min-width:0;
  }
  .writings-row-years{
    flex:0 0 auto;
    font-family:'DM Sans',Arial,sans-serif;
    font-weight:400;
    font-size:14px;
    color:color-mix(in srgb, var(--text) 65%, transparent);
  }
  .writings-row-name{
    font-family:'DM Sans',Arial,sans-serif;
    font-weight:400;
    font-size:20px;
    color:var(--text);
  }
  .writings-row-count{
    flex:0 0 auto;
    font-family:'DM Sans',Arial,sans-serif;
    font-weight:400;
    font-size:14px;
    color:color-mix(in srgb, var(--text) 65%, transparent);
  }
  @media (hover:hover) and (min-width:701px){
    .writings-row:hover{
      background:color-mix(in srgb, var(--text) 6%, transparent);
    }
  }
  @media (max-width:700px){
    .writings-content{padding:48px 16px 64px;}
    .writings-heading{font-size:32px;}
    .writings-row{
      flex-direction:column;
      align-items:flex-start;
      gap:4px;
    }
    .writings-row-left{
      flex-direction:column;
      align-items:flex-start;
      gap:4px;
    }
  }
  @media (hover:none){
    .writings-row:active{
      background:color-mix(in srgb, var(--text) 6%, transparent);
    }
  }
</style>
</head>
<body>
<div class="theme-strip"><span class="theme-date"><span class="theme-date-full"></span><span class="theme-date-short"></span></span><span class="theme-controls"><button type="button" class="theme-choice" data-theme-choice="light">Light</button><span class="theme-dot"> &middot; </span><button type="button" class="theme-choice" data-theme-choice="dark">Dark</button><span class="theme-dot"> &middot; </span><button type="button" class="theme-choice" data-theme-choice="auto">Auto</button></span></div>
<header class="site-header"><a href="/" class="wordmark">Paraploo</a><nav><a href="/writings.html">Words</a><a href="/marks.html">Marks</a><a href="/physical.html">Physical</a><a href="/digital.html">Screen</a><a href="/mind-mapping/">Maps</a></nav></header>

<!-- ============ PAGE CONTENT ============ -->
<div class="writings-content">
  <h1 class="writings-heading">Everything, in a hundred words.</h1>
  <p class="writings-intro">${totalPictures.toLocaleString('en-US')} pictures · ${totalWritings.toLocaleString('en-US')} writings · ${totalGalleries.toLocaleString('en-US')} galleries</p>

${blocksHtml}

</div>

<footer class="site-footer">
  <a href="/" class="wordmark">Paraploo</a>
  <nav>
    <a href="/writings.html">Words</a>
    <a href="/marks.html">Marks</a>
    <a href="/physical.html">Physical</a>
    <a href="/digital.html">Screen</a>
    <a href="/mind-mapping/">Maps</a>
  </nav>
  <p class="footer-contact">Brian William Otto — writer and multidisciplinary artist.</p>
  <p class="footer-contact">Twin Cities, Minnesota<a href="mailto:hello@paraploo.com">hello@paraploo.com</a></p>
  <p>&copy; 2026 Brian Otto and Paraploo</p>
</footer>
</body>
</html>
`;

writeFileSync(join(publicDir, 'everything.html'), html);
console.log(
  `everything.html written: ${totalPictures} pictures, ${totalWritings} writings, ${totalGalleries} galleries`
);
