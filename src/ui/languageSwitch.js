// src/ui/languageSwitch.js

import { state } from "../core/state.js";
import { emit } from "../core/events.js";

const languageSelect = document.getElementById("languageSelect");

if (!languageSelect) {
  console.warn("Language selector not found");
}

// Initial sync from HTML
updateLanguage(languageSelect.value);

// On change
languageSelect.addEventListener("change", () => {
  updateLanguage(languageSelect.value);
});

function updateLanguage(value) {
  if (value === "hin") {
    state.ocr.lang = "hin";
    state.tts.lang = "hi-IN";
  } else {
    state.ocr.lang = "eng";
    state.tts.lang = "en-US";
  }

  // Clear existing OCR text (language mismatch)
  state.pages.forEach(p => {
    if (p) p.text = null;
  });

  emit("language:changed", {
    ocr: state.ocr.lang,
    tts: state.tts.lang
  });
}
