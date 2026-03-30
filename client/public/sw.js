// TuCooperativa v5.1 - Blank Service Worker (Silence Fix)
// This file is empty to prevent 404/SyntaxError from old registrations.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
