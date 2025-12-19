// src/ui/copyText.js

import { on } from "../core/events.js";
import { state } from "../core/state.js";

const copyBtn = document.getElementById("copyBtn");

if (!copyBtn) {
  console.warn("Copy button not found");
}

// Handle copy action
copyBtn?.addEventListener("click", async () => {
  const index = state.activePage;
  if (index === null) return;

  const page = state.pages[index];
  if (!page || !page.text) {
    showFeedback("No text");
    return;
  }

  try {
    await navigator.clipboard.writeText(page.text);
    showFeedback("Copied");
  } catch (err) {
    console.error("Copy failed", err);
    showFeedback("Failed");
  }
});

// ---- UI FEEDBACK ----
function showFeedback(text) {
  const original = copyBtn.innerHTML;

  copyBtn.innerHTML =
    `<i class="fa-solid fa-check"></i><span>${text}</span>`;

  setTimeout(() => {
    copyBtn.innerHTML = original;
  }, 1200);
}
