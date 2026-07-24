import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import recoveredDates from '../data/recovered-dates.json';
import { REVEALED } from '../data/revealed.js';

// frontmatter `date:` is stripped by the Zod schema — read it back from the raw file
// (same pattern the writing pages use), then prefer the recovered date if present.
const raws = import.meta.glob('../content/writing/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const dateMap: Record<string, string> = {};
for (const k in raws) {
  const slug = k.split('/').pop()!.replace(/\.md$/, '');
  const m = raws[k].match(/^date:\s*"?(.*?)"?\s*$/m);
  if (m) dateMap[slug] = m[1];
}
const recovered = recoveredDates as Record<string, string>;

// Markdown body -> clean single-line plain text for indexing.
function plain(s: string): string {
  return (s || '')
    .replace(/\r/g, '')
    .replace(/^#{1,6}\s+/gm, '')        // headings
    .replace(/^>\s?/gm, '')             // blockquotes
    .replace(/^\s*[-*]\s+/gm, '')       // list bullets
    .replace(/\*\*(.+?)\*\*/g, '$1')    // bold
    .replace(/\*([^*\n]+)\*/g, '$1')    // italic
    .replace(/\s+/g, ' ')
    .trim();
}

export const GET: APIRoute = async () => {
  const pieces = (await getCollection('writing')).filter((e) => REVEALED.includes(e.id));
  const index = pieces.map((p) => {
    const body = plain(p.body ?? '');
    return {
      slug: p.id,
      title: p.data.title,
      cluster: p.data.cluster ?? '',
      category: p.data.category ?? '',
      date: recovered[p.id] || dateMap[p.id] || '',
      body,
      excerpt: body.length > 160 ? body.slice(0, 160).trimEnd() + '…' : body,
    };
  });
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
