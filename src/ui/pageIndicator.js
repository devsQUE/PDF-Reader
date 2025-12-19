// src/ui/pageIndicator.js

import { on } from "../core/events.js";
import { state } from "../core/state.js";

const currentPageEl = document.getElementById("currentPage");
const totalPagesEl = document.getElementById("totalPages");
const pagesContainer = document.getElementById("pages");

if (!currentPageEl || !totalPagesEl || !pagesContainer) {
  console.warn("Page indicator elements missing");
}

// ---- TOTAL PAGES ----
on("pdf:loaded", (count) => {
  totalPagesEl.textContent = count;
  currentPageEl.textContent = "–";
});

// ---- PAGE SELECTION ----
on("page:selected", (index) => {
  state.activePage = index;

  // Update indicator
  currentPageEl.textContent = index + 1;

  // Highlight thumbnail
  const canvases = pagesContainer.querySelectorAll("canvas");
  canvases.forEach((canvas, i) => {
    canvas.classList.toggle("active", i === index);
  });

  // Scroll into view (nice UX)
  const activeCanvas = canvases[index];
  activeCanvas?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center"
  });
});
