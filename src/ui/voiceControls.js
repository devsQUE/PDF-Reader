// src/ui/voiceControls.js

import { state } from "../core/state.js";
import { on, emit } from "../core/events.js";

const voiceSelect = document.getElementById("voiceSelect");
const rateControl = document.getElementById("rateControl");
const rateValue = document.getElementById("rateValue");

if (!voiceSelect || !rateControl || !rateValue) {
  console.warn("Voice controls not found");
}

// ---- LOAD & FILTER VOICES ----
function loadVoices() {
  const allVoices = speechSynthesis.getVoices();

  // Filter by current TTS language
  const filtered = allVoices.filter(v =>
    v.lang.toLowerCase().startsWith(
      state.tts.lang.split("-")[0].toLowerCase()
    )
  );

  voiceSelect.innerHTML = "";

  const voices = filtered.length ? filtered : allVoices;

  voices.forEach((voice, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(opt);
  });

  state.tts.voice = voices[0] || null;
}

// Browser async voice load
speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// ---- VOICE CHANGE ----
voiceSelect.addEventListener("change", () => {
  const allVoices = speechSynthesis.getVoices();
  const langPrefix = state.tts.lang.split("-")[0];

  const matching = allVoices.filter(v =>
    v.lang.toLowerCase().startsWith(langPrefix)
  );

  state.tts.voice = matching[voiceSelect.value] || null;

  emit("tts:stop");
});

// ---- SPEED CONTROL ----
rateControl.addEventListener("input", () => {
  state.tts.rate = parseFloat(rateControl.value);
  rateValue.textContent = `${state.tts.rate.toFixed(1)}x`;

  emit("tts:stop");
});

// ---- LANGUAGE CHANGE FIX (THIS WAS MISSING) ----
on("language:changed", () => {
  // Stop speech
  emit("tts:stop");

  // Reload voices for new language
  setTimeout(loadVoices, 100);
});
