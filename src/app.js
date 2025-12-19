// src/app.js

// UI modules (they register listeners when imported)
import "./ui/pageList.js";
import "./ui/textPanel.js";
import "./ocr/ocrService.js";
import "./tts/ttsService.js";
import "./ui/controls.js";
import "./ui/voiceControls.js";
import "./ui/loader.js";
import "./ui/preview.js";
import "./ui/copyText.js";
import "./ui/languageSwitch.js";
import "./ui/pageIndicator.js";
import "./ui/pageRange.js";
import "./ui/pdfInfo.js";


// Logic modules
import { loadPDF } from "./pdf/pdfLoader.js";


// ---- HTML WIRING ----
const pdfInput = document.getElementById("pdfInput");
const uploadBtn = document.getElementById("uploadBtn");

if (!pdfInput) {
  console.error("pdfInput not found in HTML");
}

pdfInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  
  if (!file) return;
  loadPDF(file);
});

// This btn is Only for android devices
uploadBtn?.addEventListener("click", () => {
  pdfInput.click();
});
