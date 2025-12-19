// src/ui/pageRange.js

import { loadPDF } from "../pdf/pdfLoader.js";

const fromInput = document.getElementById("pageFrom");
const toInput = document.getElementById("pageTo");
const loadBtn = document.getElementById("loadRangeBtn");
const fileInput = document.getElementById("pdfInput");

if (!fromInput || !toInput || !loadBtn) {
  console.warn("Page range controls not found");
}

loadBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Select a PDF first");
    return;
  }

  const start = parseInt(fromInput.value, 10);
  const end = parseInt(toInput.value, 10);

  if (!start || !end) {
    alert("Enter both page numbers");
    return;
  }

  loadPDF(file, { start, end });
});
