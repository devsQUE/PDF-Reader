// src/core/state.js

export const state = {
  // PDF
  pdf: null,
  pdfMeta: {
    name: "",
    size: 0,
    totalPages: 0
  },

  isLoadingPdf: false,

  // Pages
  pages: [],
  activePage: null,

  // OCR
  ocr: {
    busy: false,
    lang: "hin"
  },

  // TTS
  tts: {
    lang: "hi-IN",
    rate: 1,
    voice: null,
    chunks: [],
    index: 0,
    playing: false,
    paused: false
  }
};
