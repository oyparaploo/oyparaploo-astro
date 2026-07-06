// @ts-check
// cache-bust touch 2026-07-05: force CF Pages to re-emit the redirect pages (7 retired parents).
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Retired pieces merged into /writing/in-our-voice-what-does-this-mean-exactly/.
  // Static build emits a meta-refresh + canonical redirect page at each old path,
  // so the old URLs resolve to the combined page instead of falling through to home.
  redirects: {
    '/writing/in-the-oyparaploo-voice-and-language-what-does-this-mean/': '/writing/in-our-voice-what-does-this-mean-exactly/',
    '/writing/in-the-voice-what-does-this-mean/': '/writing/in-our-voice-what-does-this-mean-exactly/',
    // Retired split-original shelf, fully replaced by solitary-fallen-drops + happenings-on-the-ground.
    '/writing/shelf/up-and-in-debt-eviction/': '/writing/',
    // Near-duplicate retirement pass (2026-07-04): each retired piece redirects to its kept (newest) sibling.
    '/writing/chets-trumpet-song/': '/writing/chets-trumpet-song-1/',
    '/writing/cracked-open-stacked/': '/writing/azalea-solemn-heaven-zeal/',
    '/writing/the-chairs-nobody-sits-in-ii/': '/writing/the-chairs-nobody-sits-in-i/',
    '/writing/clothing-and-perfumes/': '/writing/clothing-and-perfumes-1/',
    '/writing/another-balloon-that-doesnt-rhyme-1/': '/writing/another-balloon-that-doesnt-rhyme-3/',
    '/writing/another-balloon-that-doesnt-rhyme-2/': '/writing/another-balloon-that-doesnt-rhyme-3/',
    '/writing/as-a-shock-to-minor-surprises-many-things-came-out-of-the-colors/': '/writing/as-a-shock-to-minor-surprises-1/',
    '/writing/before-the-orange-sky-changed-1/': '/writing/before-the-orange-sky-changed-to-fire-red/',
    '/writing/eviction-notice-meditation/': '/writing/the-eviction-notice-a-meditation-on-the-squatter-in-your-mind/',
    '/writing/rewritten-three-times/': '/writing/rewritten-three-times-1/',
    '/writing/all-senses-examination-of-this-aromous-soil/': '/writing/all-senses-examination-of-this-aromous-soil-1/',
    '/writing/as-words-protests-and-much-more-1/': '/writing/as-words-protests-and-much-more-2/',
    '/writing/apartment-house-shelter-flow-with-compassion-1/': '/writing/apartment-house-shelter-flow-1/',
    '/writing/also-what-will-this-be-further-1/': '/writing/also-what-will-this-be-further-into-the-future-1/',
    '/writing/also-what-will-this-be-further-into-the-future/': '/writing/also-what-will-this-be-further-into-the-future-1/',
    '/writing/benefits-of-art-art-for-when-im-on-my-deathbed/': '/writing/benefits-of-art-art-for-when-im-on-my-deathbed-1/',
    '/writing/also-this-is-all-just-for-the-sake-1/': '/writing/also-this-is-all-just-for-the-sake-of-the-work-itself-1/',
    '/writing/also-this-is-all-just-for-the-sake-of-the-work-itself/': '/writing/also-this-is-all-just-for-the-sake-of-the-work-itself-1/',
    '/writing/benefits-of-art-artmaking-process-possibilities-and-hope/': '/writing/benefits-of-art-artmaking-process-possibilities-and-hope-1/',
    '/writing/blue-ball-mess-and-mix/': '/writing/blue-ball-mess-and-mix-1/',
    '/writing/and-specifically-adult-female-hips-2/': '/writing/and-specifically-adult-female-hips-1/',
    '/writing/be-aware-of-violent-crimes-that-happen-in-your-neighborhood/': '/writing/be-aware-of-violent-crimes-1/',
    '/writing/be-your-different-selves/': '/writing/be-your-different-selves-and-nobody-gets-hurt/',
    '/writing/autobiographies-gray-hairs/': '/writing/autobiographies-gray-hairs-1/',
    '/writing/bender-bender-1/': '/writing/bender-bender/',
    '/writing/busy-as-squirrels-and-bees/': '/writing/busy-as-squirrels-and-bees-human-beings/',
    '/writing/careful-children-2/': '/writing/careful-children-1/',
    '/writing/big-time-art-1/': '/writing/big-time-art/',
    '/writing/all-this-stuff-gratefully-will-carry-us-1/': '/writing/all-this-stuff-gratefully-will-carry-us-to-our-deathbed/',
    '/writing/all-this-stuff-gratefully-will-carry-us-to-our-deathbed-days/': '/writing/all-this-stuff-gratefully-will-carry-us-to-our-deathbed/',
    '/writing/all-this-stuff-gratefully-will-carry-us-to-our-deathbed-days-1/': '/writing/all-this-stuff-gratefully-will-carry-us-to-our-deathbed/',
    // Retired split-original oversized parent shelves (replaced by their sub-shelves).
    '/writing/shelf/invented-tongue-sound-poems/': '/writing/',
    '/writing/shelf/body-instrument-tone/': '/writing/',
    '/writing/shelf/justice-witness-dot-state/': '/writing/',
    '/writing/shelf/listening-and-speaking-warming/': '/writing/',
    '/writing/shelf/climate-and-ecology-verge/': '/writing/',
    '/writing/shelf/our-method-o-logies/': '/writing/',
    '/writing/shelf/grief-held-by-creating/': '/writing/',
    // Retired Good Grounds 3-door split, replaced by the 5-door regroup (11 each).
    '/portraits/good-grounds/minnesota-home-ground/': '/portraits/#good-grounds',
    '/portraits/good-grounds/minnesota-northeast-roads/': '/portraits/#good-grounds',
    '/portraits/good-grounds/southwest-north-waters-abroad/': '/portraits/#good-grounds',
  },
});
