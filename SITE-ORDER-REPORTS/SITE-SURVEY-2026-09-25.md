# Site Survey — 2026-09-25

Read-only structural survey of `public/` (the live paraploo.com site source), built by walking every `.html` file, parsing its links/title/meta/header/footer, and resolving every internal link against the actual file tree. Colour, contrast, and text-size are out of scope (covered by a separate job).

18,997 HTML files were read, in batches of ~2,000:

```
BATCH read 2000/18997
BATCH read 4000/18997
BATCH read 6000/18997
BATCH read 8000/18997
BATCH read 10000/18997
BATCH read 12000/18997
BATCH read 14000/18997
BATCH read 16000/18997
BATCH read 18000/18997
BATCH read 18997/18997
```

## 1. Page kinds and counts

| Kind | Count | Notes |
|---|---|---|
| Front door | 1 | `index.html` |
| Section pages | 5 | `writings.html` (Words), `marks.html` (Marks), `physical.html` (Physical), `digital.html` (Screen), `mind-mapping/index.html` (Maps) — the header's five words map to these five files, not to `words.html`/`screen.html`/`maps.html` by name |
| Gallery grid pages (contain a `.gallery-grid` of `.gallery-item` tiles) | 324 | one per named gallery folder's `index.html` |
| Other group/listing pages (`.../index.html` without a gallery grid — subgroup or year listings) | ~2,456 | remainder of the 2,780 `index.html` pages under the five sections + `about/` + `sumi/` |
| Individual picture/item pages | 13,943 | numbered pages (`0001.html`, `0002.html`, …) and per-writing pages |
| Writing pages under `words/` | 4,444 files total in `words/` (mostly one `index.html` per writing, grouped under year/collection folders) | |
| The Book | `the-book.html` + `book-door-1.html` … `book-door-4.html` (4 doors) + `room-one.html` … `room-six.html` (6 rooms) | 11 files total; the task brief expected "room doors," the actual site has 4 **book doors** and 6 **rooms** as separate files |
| Wander | 1 | `wander/index.html` — exists as a folder, not `wander.html` |
| Everything | 1 | `everything.html` |
| Survival | 1 | `survival/index.html` — exists as a folder, not `survival.html` |
| Search | 0 | **no Search page exists anywhere in `public/`** |
| 404 | 1 | `404.html` |
| Other root-level pages | 62 | standalone writing/art pages directly under `public/` (e.g. `a-little-bend-worth-enjoying.html`) |
| `about/` tree (not named in the survey brief) | 1,988 files | five galleries: `a-family`, `bomayka-identity`, `brrd-roots`, `our-history-in-pictures`, `paraploo-logotype-styles` |
| `sumi/` tree (not named in the survey brief) | 150 files | four galleries: `desert-murat-fait`, `fluid-ink-instrumental`, `ga-assortment`, `shoe-whah-si-daye-sew` |
| `logotypes/` | 57 files | one gallery |

## 2. Broken internal links

**31,013 broken-link occurrences, but only 96 unique broken destinations.** Every one of the 96 is the same structural gap: a folder that exists and is full of numbered picture pages, but has **no `index.html`** to serve as its own gallery grid — so any trailing-slash link to that folder 404s, even though the pictures inside it are all reachable individually.

Examples (destination · occurrences · example source page):
- `/about/a-family/` — 1,986 occurrences (linked from every page inside `about/a-family/`)
- `/about/bomayka-identity/` — 1,986 occurrences
- `/about/brrd-roots/` — 1,986 occurrences
- `/digital/saw-shur-shee-symmet/` — 6,772 occurrences (its own 0001.html…, and this folder is one of the largest galleries site-wide)
- `/words/hand-writings/eclipse-mind-mapping/`, `/mind-maping-deep/`, `/neutral-mind-mapping/` — 1,974 occurrences each
- `/marks/agitation-exercise/`, `/blossom-petal-garden/`, `/clouds-redefined/`, `/dry-grass-and-tears/`, `/how-to-remain-a-modern-artist/`, `/loops-hopes/`, `/most-complexy-asemities/`, `/slanted-character/`, `/slap-maps/`, `/water-surfaces/` — 809 occurrences each (the ten subgroups of `marks/fast-thin-dues/`)
- `/digital/longest-assortment-ever/`, `/digital/biggest/`, `/digital/maud-text-popkern/`, `/sumi/desert-murat-fait/`, `/physical/cool-warming-pieces-a/`, `/marks/pages-for-baby-divine-a/`, `/digital/sista-ro-spirit-extreme-heat/`, `/digital/inspiration-boards-dept/inspiration-boards-dept-lidi-gray-boards/` — same pattern, fewer occurrences

(External links: 56,985, not checked — out of scope for "internal links pointing to a file not in the public folder.")

## 3. Tab titles, description meta, header, footer

- **Tab titles**: not a single page's `<title>` ends with "· Paraploo" (the separator character never appears anywhere in the corpus).
  - 363 gallery/group pages use `Name | Paraploo` (pipe, not middle dot) — e.g. `Fast Thin Dues | Paraploo`.
  - 16,115 individual picture/item pages use `Catalog Number – Group Name` with **no site name at all** — e.g. `07305 – Ah Ah Ah Ah`.
  - 2,515 root-level writing/art pages use a bare title with no site name — e.g. `A Little Bend Worth Enjoying`.
  - 4 pages end in "Paraploo" with some other separator.
  - **18,634 of 18,997 pages (98%) have no "· Paraploo" (or any Paraploo) suffix in the tab title.**
- **Description meta**: 18,656 of 18,997 pages (98%) have no `<meta name="description">` at all — essentially every individual picture/item page. Section pages, group pages, and root writing pages generally do have one.
- **Header**: 18,995 of 18,997 pages carry the current header (theme strip, live-text `Paraploo` wordmark, `Words · Marks · Physical · Screen · Maps` nav). Two pages do not: `lines.html` and `placemaking.html`.
- **Footer**: same two pages, `lines.html` and `placemaking.html`, lack the current footer — and both are also the only two orphaned pages found in §7. They read as legacy pages that predate the current template and were never linked back in.

## 4. Section/group counts vs. actual counts

`everything.html`'s "live counts" were checked against the actual on-disk file counts for all 35 rows it lists (7 word-year rows, 6 marks rows, 1 "hand-writings," 1 logotypes, 1 about/history, 8 physical rows, 8 digital rows, 3 mind-mapping rows), using each category's real content convention (numbered picture pages, per-writing `index.html`, or embedded single-page gallery image counts as appropriate).

**All 35 counts on `everything.html` check out against the real content.** No stale counts were found there — this matches the recent commit history ("Everything page: counts to full depth"). The only discrepancies seen during verification (a handful of off-by-one counts in `physical/*` and `digital/grand-assortment/`) trace back to the orphaned duplicate folders in §6, not to a stale number.

No other page in the site displays a visible "N pictures"/"N writings" count next to a name — `digital.html`, `marks.html`, `physical.html`, `writings.html`, and `mind-mapping/index.html` are plain tile grids with no counts to check.

## 5. Gallery grids: next/previous navigation

**None of the 324 gallery grid pages have next-gallery or previous-gallery links.** A site-wide search for any "Next gallery"/"Previous gallery" pattern returned zero matches. Every gallery grid's only way out (besides its own pictures) is a single "Back to [Section]" link — so **all 324 are dead ends** by the task's definition.

## 6. Doubled names and orphaned old-address twins

**Doubled names** (same name shown twice in the same list):
- `digital.html`: "Ah Ah Ah Ah" appears twice, linking to two different galleries — `/digital/ah-ah-ah-ah/` and `/digital/ah-ah-ah-ah-volumes/`.
- `digital.html`: "Hot Climate" appears twice — `/digital/hot-climate/` and `/digital/hot-climate-volumes/`.
- `writings.html` / `everything.html`: "Variety" appears four times (2022–23, 2024, 2025, 2026), distinguished only by an adjacent year label.

**Orphaned old-address twins** — 9 folders that contain a same-named subfolder nested one level inside themselves (a `.../name/name/` pattern), each holding its own small, unlinked set of content:
- `digital/biggest-mosaic-ever/biggest-mosaic-ever/`
- `digital/grand-assortment/grand-assortment/`
- `logotypes/logotypes/`
- `physical/kandah-dusk-proof/kandah-dusk-proof/`
- `physical/numbers-game-auction/numbers-game-auction/`
- `physical/outside-carpet-treaty/outside-carpet-treaty/`
- `physical/salt-of-sand-and-more/salt-of-sand-and-more/`
- `physical/true-colors-and-grit/true-colors-and-grit/`
- `physical/werg-and-gis-middle-labor/werg-and-gis-middle-labor/`
- `physical/woa-mun/woa-mun/`

## 7. Reachability

- **Pages reachable from only one other page**: 144 (mostly root-level writing pages and single-volume gallery subfolders, e.g. `a-little-bend-worth-enjoying.html`, `digital/biggest-mosaic-ever/volume-one/index.html`).
- **Pages reachable from nowhere** (no incoming internal link found anywhere on the site): 3 — `lines.html`, `placemaking.html`, and `404.html` (the last is expected; it's never linked to on purpose).
- **Pages unreachable by any path from the front door** (BFS from `index.html`): 6 — the same `404.html`, `lines.html`, `placemaking.html`, plus three paginated pages with no link back to page 1: `digital/sista-ro-spirit-extreme-heat/page-2/index.html`, `page-3/index.html`, `page-4/index.html`.

## Totals

| Metric | Count |
|---|---|
| Pages read | 18,997 |
| Broken internal links (occurrences / unique destinations) | 31,013 / 96 |
| Stale counts found on `everything.html` | 0 of 35 |
| Pages with an old (non-current) header/footer | 2 (`lines.html`, `placemaking.html`) |
| Pages with a tab title not ending "· Paraploo" | 18,634 of 18,997 |
| Pages missing a description meta line | 18,656 of 18,997 |
| Dead-end gallery grids (no next/previous, only Back) | 324 of 324 |
| Doubled names found | 3 lists (Ah Ah Ah Ah / Hot Climate on `digital.html`; Variety ×4 on `writings.html`/`everything.html`) |
| Orphaned old-address twin folders | 9 |
| Pages reachable from only one other page | 144 |
| Pages reachable from nowhere | 3 |
| Pages unreachable from the front door | 6 |
