// src/ui/loader.js

import { on } from "../core/events.js";

const loader = document.getElementById("loader");
const loaderText = document.getElementById("loaderText");

if (!loader || !loaderText) {
  console.warn("Loader elements not found (safe if not in HTML)");
}

function show(text = "Working…") {
  loaderText.textContent = text;
  loader.classList.remove("hidden");
}

function hide() {
  loader.classList.add("hidden");
}

// ---- EVENTS ----
on("pdf:loaded", () => {
  show("Rendering pages…");
});

on("pdf:pageRendered", () => {
  hide();
});

on("ocr:started", () => {
  show("Extracting text…");
});

on("ocr:done", () => {
  hide();
});

on("ocr:error", () => {
  hide();
});
