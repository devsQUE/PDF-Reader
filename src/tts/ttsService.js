// src/tts/ttsService.js

import { on, emit } from "../core/events.js";
import { state } from "../core/state.js";
import { chunkText } from "./textChunker.js";

let utterance = null;

/**
 * Speak next chunk in queue
 */
function speakNext() {
  if (state.tts.index >= state.tts.chunks.length) {
    state.tts.playing = false;
    emit("tts:finished");
    return;
  }

  const text = state.tts.chunks[state.tts.index];
  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.tts.lang;
  utterance.rate = state.tts.rate;

  if (state.tts.voice) utterance.voice = state.tts.voice;

  utterance.onend = () => {
    if (!state.tts.paused) {
      state.tts.index++;
      speakNext();
    }
  };

  utterance.onerror = () => {
    state.tts.index++;
    speakNext();
  };

  speechSynthesis.speak(utterance);
  state.tts.playing = true;
}

/**
 * Start speaking text
 */
function start(text) {
  speechSynthesis.cancel();

  state.tts.chunks = chunkText(text);
  state.tts.index = 0;
  state.tts.paused = false;

  if (state.tts.chunks.length) {
    speakNext();
    emit("tts:started");
  }
}

/**
 * Toggle play / pause
 */
function toggle() {
  if (!state.tts.playing) return;

  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    state.tts.paused = false;
    emit("tts:resumed");
  } else {
    speechSynthesis.pause();
    state.tts.paused = true;
    emit("tts:paused");
  }
}

/**
 * Stop speaking
 */
function stop() {
  speechSynthesis.cancel();
  state.tts.playing = false;
  state.tts.paused = false;
  state.tts.index = 0;
  emit("tts:stopped");
}

// Auto-start TTS when OCR finishes on active page
on("ocr:done", ({ index, text }) => {
  if (index === state.activePage) {
    start(text);
  }
});

// Control events
on("tts:toggle", toggle);
on("tts:stop", stop);

// Cleanup
window.addEventListener("beforeunload", () => {
  speechSynthesis.cancel();
});

on("language:changed", () => {
  speechSynthesis.cancel();
  state.tts.playing = false;
  state.tts.paused = false;
});

