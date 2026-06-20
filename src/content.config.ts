import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Writing collection — one .md per piece, rendered through one shared template.
// Additive: does NOT affect the existing verbatim public/<slug>/index.html pages.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    variant: z.enum(['breath-display', 'reading']).default('breath-display'),
    ground: z.enum(['light', 'dark']).default('dark'),
    breadcrumb: z.string().optional(),
    hero: z
      .object({
        src: z.string(),       // plain path, e.g. /images/<slug>/<file>.webp
        alt: z.string(),
        caption: z.string().optional(),
      })
      .optional(),
    readNext: z.array(z.string()).optional(),
    category: z.string().optional(),
    cluster: z.string().optional(),
    secondaryCategory: z.string().optional(),
  }),
});

export const collections = { writing };
