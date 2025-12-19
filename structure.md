/src
 ├── app.js                # App bootstrap & wiring
 │
 ├── core/
 │   ├── state.js          # Single source of truth
 │   ├── events.js         # Pub/Sub (decoupling)
 │
 ├── pdf/
 │   ├── pdfLoader.js      # Load PDF & render canvases
 │   ├── pageStore.js      # Page metadata & cache
 │
 ├── ocr/
 │   ├── ocrWorker.js      # Worker (unchanged)
 │   ├── ocrService.js     # Queue + throttling
 │
 ├── tts/
 │   ├── ttsService.js     # Speech controller (FSM)
 │   ├── textChunker.js    # Language-aware chunking
 │
 ├── ui/
 │   ├── controls.js       # Buttons, sliders, selects
 │   ├── pageList.js       # Page thumbnails
 │   ├── preview.js        # Fullscreen preview
 │   ├── textPanel.js      # Highlighted text rendering
 │
 └── utils/
     ├── dom.js
     ├── limits.js
