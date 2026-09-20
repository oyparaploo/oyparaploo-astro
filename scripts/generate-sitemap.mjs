// Scans the site's actual pages and writes public/sitemap.xml.
// Runs automatically before every build (see package.json "prebuild").
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');
const writingContentDir = join(root, 'src', 'content', 'writing');
const pagesDir = join(root, 'src', 'pages');
const siteOrigin = 'https://paraploo.com';

const EXCLUDED_HTML = new Set(['404.html']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

const urls = new Set();

// Static HTML files served directly from public/.
for (const file of walk(publicDir)) {
  if (extname(file) !== '.html') continue;
  const relPath = relative(publicDir, file).replace(/\\/g, '/');
  if (EXCLUDED_HTML.has(relPath)) continue;

  if (basename(file) === 'index.html') {
    const dir = relPath === 'index.html' ? '' : relPath.slice(0, -'index.html'.length);
    urls.add(`/${dir}`);
  } else {
    urls.add(`/${relPath}`);
  }
}

// Static Astro pages (top-level .astro files that render a fixed route).
for (const entry of readdirSync(pagesDir)) {
  const full = join(pagesDir, entry);
  if (statSync(full).isDirectory()) continue;
  if (extname(entry) !== '.astro') continue;
  const slug = entry.replace(/\.astro$/, '');
  urls.add(`/${slug}/`);
}

// Dynamic writing pages, one per content collection entry.
for (const entry of readdirSync(writingContentDir)) {
  if (extname(entry) !== '.md') continue;
  const slug = entry.replace(/\.md$/, '');
  urls.add(`/writing/${slug}/`);
}

const sorted = [...urls].sort();

const body = sorted
  .map((path) => `  <url><loc>${siteOrigin}${path}</loc></url>`)
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

writeFileSync(join(publicDir, 'sitemap.xml'), xml);
console.log(`sitemap.xml written with ${sorted.length} URLs`);
