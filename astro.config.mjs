// @ts-check
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
  },
});
