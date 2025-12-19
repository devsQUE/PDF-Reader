# 📄 PDF OCR Reader (Offline-First, Android-Friendly)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Platform: Browser](https://img.shields.io/badge/Platform-Browser%20%7C%20Android-brightgreen)
![Privacy: Offline](https://img.shields.io/badge/Privacy-100%25%20Offline-blue)

A lightweight, modular PDF reader that extracts text using OCR, displays structured content, and supports text-to-speech. Designed for high reliability on **Android** and **Desktop browsers**, even when handling large documents.

This project focuses on **stability, performance, and zero-cost operation** (no paid APIs required).

---

## ✨ Features

### 📂 PDF Upload & Rendering
* **Large PDF Support:** Optimized for stability using device-aware performance limits.
* **Page Range Loading:** Load specific page ranges (e.g., pages 101–160) to reduce memory usage.
* **Mobile-Safe Rendering:** Prevents crashes and page reordering issues on Android browsers.
* **Single Load Protection:** Prevents multiple PDFs from loading simultaneously.

---

### 🧠 OCR (Optical Character Recognition)
* **Engine:** Powered by `Tesseract.js`.
* **Multilingual:** Supports Hindi and English OCR with runtime language switching.
* **Per-Page OCR:** Text extraction happens page-by-page for better responsiveness.
* **Offline First:** All OCR processing runs locally in the browser.

---

### 🗣️ Text-to-Speech
* **Native Browser TTS:** Uses the browser’s built-in Speech Synthesis API.
* **Playback Controls:** Play, Pause, Resume, Stop.
* **Customization:** Adjustable speech rate and voice selection.
* **Page-Synced Reading:** Speech is synchronized with selected pages.

---

### 🖼️ Preview & User Experience
* **Thumbnail Previews:** Fast and correctly ordered thumbnails (Android-safe).
* **Preview Overlay:** Full-page preview without disrupting OCR or TTS flow.
* **Info Panel:** Displays PDF name, total page count, and file size.
* **No Browser Menus:** Long-press image context menus are disabled for a native-app feel.

---

### ⚡ Performance & Stability
* **Device-Aware Limits:** Page rendering limits based on available device memory.
* **Async-Safe Rendering:** Eliminates race conditions and ordering bugs.
* **Low-End Friendly:** Designed to work reliably on budget Android devices.

---

## 🧱 Architecture Overview

The application follows a **fully event-driven, modular architecture**, keeping UI, logic, and state cleanly separated.

```text
src/
├── app.js                   # App entry & wiring
├── core/
│   ├── events.js            # Global event bus
│   └── state.js             # Central state management
├── pdf/
│   ├── pdfLoader.js         # PDF.js loading & rendering logic
│   └── pageStore.js         # Page data storage
├── ocr/
│   └── ocrService.js        # Tesseract.js OCR pipeline
├── tts/
│   └── ttsService.js        # Browser Text-to-Speech logic
├── ui/
│   ├── pageList.js          # Thumbnail list (Android-safe ordering)
│   ├── pageIndicator.js     # Page indicator synchronization
│   ├── pageRange.js         # Page range loader
│   ├── pdfInfo.js           # PDF info panel
│   ├── preview.js           # Preview overlay
│   ├── controls.js          # OCR & TTS controls
│   └── loader.js            # Loading indicators
├── utils/
│   └── performanceLimits.js # Device-specific safety limits
└── ocr-worker.js            # Tesseract worker thread ```


## 🚀 Getting Started
1️⃣ Clone or Download
git clone <repository-url>
cd pdf-ocr-reader

2️⃣ Open in Browser

No build step required.

Simply open:

index.html


Recommended browsers:

Chrome

Edge

Android Chrome / WebView

📱 Android Compatibility Notes

Designed to avoid async rendering issues on Android

Prevents page reordering bugs

Disables long-press image context menus

Memory-safe rendering for large PDFs

🔐 Privacy & Cost

❌ No backend server

❌ No API keys

❌ No paid services

✅ Fully offline

✅ User data never leaves the device

⚠️ Known Limitations

OCR accuracy depends on scan quality

Browser TTS voice quality varies by device

No semantic correction or grammar rewriting

Cloud-based AI voices are intentionally excluded

These are deliberate trade-offs to keep the project free, private, and offline-first.

🧠 Design Philosophy

Reliability over flashiness

Offline-first by default

Deterministic behavior on mobile

Modular code over monolithic scripts

The goal is a tool that works consistently, even on constrained devices.

📜 License

This project is licensed under the MIT License.
You are free to use, modify, and distribute it.
# PDF-Reader