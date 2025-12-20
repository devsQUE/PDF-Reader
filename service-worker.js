const CACHE_NAME = "pdf-ocr-reader-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",

  // JS entry
  "./src/app.js",

  // Core
  "./src/core/events.js",
  "./src/core/state.js",

  // PDF
  "./src/pdf/pdfLoader.js",
  "./src/pdf/pageStore.js",

  // OCR
  "./src/ocr/ocrService.js",
  "./src/ocr/ocrWorker.js",

  // TTS
  "./src/tts/ttsService.js",
  "./src/tts/ttsChunker.js",

  // UI
  "./src/ui/pageList.js",
  "./src/ui/pageIndicator.js",
  "./src/ui/pageRange.js",
  "./src/ui/pdfInfo.js",
  "./src/ui/preview.js",
  "./src/ui/controls.js",
  "./src/ui/loader.js",
  "./src/ui/copyText.js",
  "./src/ui/languageSwitch.js",
  "./src/ui/voiceControls.js",
  "./src/ui/textPanel.js",

  // Utils
  "./src/utils/performanceLimits.js"
];

// INSTALL — never fail install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of APP_SHELL) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn("SW cache skipped:", url);
        }
      }
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH — cache-first, then network, then cache
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((res) => {
          // Cache same-origin files only
          if (
            res.ok &&
            event.request.url.startsWith(self.location.origin)
          ) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});