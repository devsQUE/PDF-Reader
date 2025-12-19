// src/ui/textPanel.js

import { on } from "../core/events.js";

const textPanel = document.getElementById("textPanel");

if (!textPanel) {
  console.error("textPanel not found");
}

// Clear text when OCR starts
on("ocr:started", () => {
  textPanel.innerHTML = "";
});

// Render OCR text when done
on("ocr:done", ({ text }) => {
  textPanel.textContent = text;
});

// Optional: show error
on("ocr:error", ({ error }) => {
  textPanel.textContent = "OCR failed: " + error;
});
