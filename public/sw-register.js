// Registers the minimal service worker so the site is reliably installable.
// Silent on failure; does not change page behavior.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
