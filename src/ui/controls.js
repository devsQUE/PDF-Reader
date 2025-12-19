// src/ui/controls.js

import { emit, on } from "../core/events.js";

const playPauseBtn = document.getElementById("playPauseBtn");
const stopBtn = document.getElementById("stopBtn");

if (!playPauseBtn || !stopBtn) {
  console.error("TTS control buttons not found in HTML");
}

// ---- BUTTON ACTIONS ----
playPauseBtn.addEventListener("click", () => {
  emit("tts:toggle");
});

stopBtn.addEventListener("click", () => {
  emit("tts:stop");
});

// ---- UI STATE UPDATES ----
on("tts:started", () => {
  playPauseBtn.innerHTML =
    `<i class="fa-solid fa-pause"></i><span>Pause</span>`;
});

on("tts:paused", () => {
  playPauseBtn.innerHTML =
    `<i class="fa-solid fa-play"></i><span>Play</span>`;
});

on("tts:resumed", () => {
  playPauseBtn.innerHTML =
    `<i class="fa-solid fa-pause"></i><span>Pause</span>`;
});

on("tts:stopped", () => {
  playPauseBtn.innerHTML =
    `<i class="fa-solid fa-play"></i><span>Play</span>`;
});

on("tts:finished", () => {
  playPauseBtn.innerHTML =
    `<i class="fa-solid fa-play"></i><span>Play</span>`;
});
