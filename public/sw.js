// Service Worker for MITS Campus Helpdesk PWA
const CACHE_NAME = 'mits-helpdesk-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Let network handle dynamic API requests
  if (e.request.url.includes('/api/')) {
    return;
  }
});

