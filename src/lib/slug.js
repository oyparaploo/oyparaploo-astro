// Single source for cluster/category slugs.
// Identical algorithm to the front door's inline clusterSlug (writing/index.astro)
// and the cluster interior's — so doorway hrefs and generated route paths can
// never drift. Lowercase; & -> "and"; any run of non-alphanumerics -> a single
// hyphen; trim leading/trailing hyphens.
export function slugify(name) {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
