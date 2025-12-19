// src/ui/pageList.js

import { on, emit } from "../core/events.js";

const pagesDiv = document.getElementById("pages");

// Reset
on("pdf:reset", () => {
  pagesDiv.innerHTML = "";
});

// 🔒 CREATE SLOTS IN CORRECT ORDER
on("pdf:loaded", (count) => {
  pagesDiv.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const slot = document.createElement("div");
    slot.className = "page-slot";
    slot.dataset.index = i;
    pagesDiv.appendChild(slot);
  }
});

// Fill slots when pages are ready (order-safe)
on("pdf:pageRendered", ({ index, canvas }) => {
  const slot = pagesDiv.querySelector(`[data-index="${index}"]`);
  if (!slot) return;

  slot.innerHTML = "";
  slot.appendChild(canvas);

  canvas.addEventListener("click", () => {
    emit("page:selected", index);
  });
});
