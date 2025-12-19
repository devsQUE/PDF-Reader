// ---- IMPORTS (MUST BE AT TOP) ----
import { getDocument, GlobalWorkerOptions }
    from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs";

// ---- PDF.JS WORKER ----
GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs";

// ---- STATE ----
const pages = [];
let currentSpeechPage = null;
let longPressTimer = null;
let longPressTriggered = false;


// ---- TTS STATE ----
let ttsQueue = [];
let currentChunkIndex = 0;
// let activePageIndex = -1;
let currentUtterance = null;
let isPaused = false;
let speechRate = 1;

let ocrLang = "hin";     // Tesseract language code
let ttsLang = "hi-IN";  // SpeechSynthesis language


// ---- VOICES ----
let displayedVoices = [];
let selectedVoice = null;

// ---- DOM ----
const pdfInput = document.getElementById("pdfInput");
const pagesDiv = document.getElementById("pages");
const textPanel = document.getElementById("textPanel");
const voiceSelect = document.getElementById("voiceSelect");
const rateControl = document.getElementById("rateControl");
const languageSelect = document.getElementById("languageSelect");
const rateValue = document.getElementById("rateValue");
const currentPageEl = document.getElementById("currentPage");
const totalPagesEl = document.getElementById("totalPages");


const loader = document.getElementById("loader");
const loaderText = document.getElementById("loaderText");

document.addEventListener("contextmenu", e => e.preventDefault());


function showLoader(text = "Loading…") {
    loaderText.textContent = text;
    loader.classList.remove("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}


// ---- OCR WORKER ----
const ocrWorker = new Worker("ocr-worker.js");

// ---- OCR RESULT HANDLER ----
ocrWorker.onmessage = (e) => {
    const { pageNumber, text, error } = e.data;
    const pageIndex = pageNumber - 1;
    const page = pages[pageIndex];

    if (!page) return;

    if (error) {
        hideLoader();
        alert("OCR failed for this page");
        page.status = "idle";
        return;
    }

    hideLoader();
    page.text = text;
    page.status = "done";

    // Speak only if still selected AND not stopped
    if (currentSpeechPage === pageIndex) {
        speakChunked(text, pageIndex);
    }
};

// ---- PDF INPUT ----
pdfInput.addEventListener("change", async (evt) => {
    const file = evt.target.files[0];
    if (!file) return;

    showLoader("Loading PDF…");

    pages.length = 0;
    pagesDiv.innerHTML = "";

    const buffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: buffer }).promise;

    totalPagesEl && (totalPagesEl.textContent = pdf.numPages);
    currentPageEl && (currentPageEl.textContent = "–");

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        const scale = 2.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // canvas.addEventListener("click", () => selectPage(i - 1));

        canvas.addEventListener("pointerdown", (e) => {
            e.preventDefault(); // VERY IMPORTANT
            longPressTriggered = false;

            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                showPreview(canvas);
            }, 450);
        });

        canvas.addEventListener("pointerup", (e) => {
            e.preventDefault();
            clearTimeout(longPressTimer);

            if (!longPressTriggered) {
                selectPage(i - 1);
            }
        });

        canvas.addEventListener("pointercancel", () => {
            clearTimeout(longPressTimer);
        });

        canvas.addEventListener("pointermove", () => {
            clearTimeout(longPressTimer);
        });

        pagesDiv.appendChild(canvas);

        canvas.toBlob(blob => {
            pages.push({
                pageNumber: i,
                imageBlob: blob,
                text: null,
                status: "idle"
            });
        }, "image/png");
    }

    hideLoader();
});

// ---- PAGE SELECTION ----
function selectPage(index) {
    // HARD RESET SPEECH
    speechSynthesis.cancel();
    ttsQueue = [];
    currentChunkIndex = 0;
    currentUtterance = null;
    isPaused = false;

    // activePageIndex = index;
    currentSpeechPage = index;

    currentPageEl && (currentPageEl.textContent = index + 1);

    const canvases = document.querySelectorAll(".page-list canvas");

    canvases.forEach((c, i) => {
        c.classList.toggle("active", i === index);
    });

    const activeCanvas = canvases[index];

    activeCanvas?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
    });


    const page = pages[index];
    if (!page) return;

    if (page.status === "done") {
        speakChunked(page.text, index);
        return;
    }

    if (page.status === "ocr") return;

    page.status = "ocr";

    showLoader("Extracting text…");

    ocrWorker.postMessage({
        pageNumber: page.pageNumber,
        imageBlob: page.imageBlob,
        lang: ocrLang
    });

}

// ---- HINDI TEXT CHUNKING ----
function chunkHindiText(text, maxLength = 180) {
    const sentences = text
        .replace(/\n+/g, " ")
        .split(/(?<=[।?!])/);

    const chunks = [];
    let buffer = "";

    for (const s of sentences) {
        if ((buffer + s).length <= maxLength) {
            buffer += s;
        } else {
            if (buffer.trim()) chunks.push(buffer.trim());
            buffer = s;
        }
    }

    if (buffer.trim()) chunks.push(buffer.trim());
    return chunks;
}

// ---- CHUNKED TTS ----
function speakChunked(text, pageIndex) {
    speechSynthesis.cancel();

    if (currentSpeechPage !== pageIndex) return;

    ttsQueue = chunkHindiText(text);
    currentChunkIndex = 0;
    isPaused = false;

    renderTextChunks(ttsQueue);
    speakNextChunk(pageIndex);
}

function speakNextChunk(pageIndex) {
    if (currentChunkIndex >= ttsQueue.length) {
        currentUtterance = null;
        updatePlayPauseUI(false);
        return;
    }

    if (currentSpeechPage !== pageIndex) return;

    highlightChunk(currentChunkIndex);

    const u = new SpeechSynthesisUtterance(ttsQueue[currentChunkIndex]);
    u.lang = ttsLang;
    u.rate = speechRate;

    if (selectedVoice) u.voice = selectedVoice;

    u.onend = () => {
        if (!isPaused) {
            currentChunkIndex++;
            speakNextChunk(pageIndex);
        }
    };

    u.onerror = () => {
        currentChunkIndex++;
        speakNextChunk(pageIndex);
    };

    currentUtterance = u;
    speechSynthesis.speak(u);
    updatePlayPauseUI(true);
}

// ---- VOICE LOADING ----
function loadVoices() {
    const allVoices = speechSynthesis.getVoices();

    displayedVoices = allVoices.filter(v =>
        v.lang.toLowerCase().startsWith(ttsLang.split("-")[0])
    );

    if (!displayedVoices.length) {
        displayedVoices = allVoices;
    }

    voiceSelect.innerHTML = "";

    displayedVoices.forEach((voice, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(opt);
    });

    selectedVoice = displayedVoices[0] || null;
}


speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// ---- UI CONTROLS ----
document.addEventListener("DOMContentLoaded", () => {
    rateControl?.addEventListener("input", () => {
        speechRate = parseFloat(rateControl.value);
        rateValue.textContent = `${speechRate.toFixed(1)}x`;

    });

    rateControl?.addEventListener("change", () => {
        if (
            currentUtterance &&
            !speechSynthesis.paused &&
            currentSpeechPage !== null &&
            ttsQueue.length
        ) {
            speechSynthesis.cancel();
            speakNextChunk(currentSpeechPage);
        }
    });



    voiceSelect?.addEventListener("change", () => {
        const idx = parseInt(voiceSelect.value, 10);
        selectedVoice = displayedVoices[idx] || null;

        if (currentUtterance && ttsQueue.length && currentSpeechPage !== null) {
            speechSynthesis.cancel();
            speakNextChunk(currentSpeechPage);
        }

    });

    languageSelect?.addEventListener("change", () => {
        const option = languageSelect.selectedOptions[0];

        ocrLang = option.value;
        ttsLang = option.dataset.tts;

        // Stop any ongoing speech
        stopSpeech();

        // Invalidate OCR cache (language changed!)
        pages.forEach(p => {
            p.text = null;
            p.status = "idle";
        });

        loadVoices();

        textPanel && (textPanel.innerHTML = "");

        alert("Language changed. Re-select a page to extract text.");
    });

    document.getElementById("playPauseBtn")?.addEventListener("click", togglePlayPause);
    document.getElementById("stopBtn")?.addEventListener("click", stopSpeech);
    document.getElementById("copyBtn")?.addEventListener("click", copyText);
    document.getElementById("uploadBtn")?.addEventListener("click", clickInput);
});

// ---- SPEECH CONTROLS ----

function togglePlayPause() {
    const btn = document.getElementById("playPauseBtn");
    if (!btn) return;

    // Nothing loaded yet
    if (!currentUtterance && currentSpeechPage === null) return;

    // If currently speaking → pause
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        isPaused = true;
        btn.innerHTML = `<i class="fa-solid fa-play"></i> <span>Play</span>`;
        return;
    }

    // If paused → resume
    if (speechSynthesis.paused) {
        speechSynthesis.resume();
        isPaused = false;
        btn.innerHTML = `<i class="fa-solid fa-pause"></i> <span>Pause</span>`;
        return;
    }

    // If not speaking at all → start
    if (!speechSynthesis.speaking && ttsQueue.length) {
        speakNextChunk(currentSpeechPage);
        btn.innerHTML = `<i class="fa-solid fa-pause"></i> <span>Pause</span>`;
    }
}

function updatePlayPauseUI(isPlaying) {
    const btn = document.getElementById("playPauseBtn");
    if (!btn) return;

    if (isPlaying) {
        btn.innerHTML = `<i class="fa-solid fa-pause"></i> <span>Pause</span>`;
    } else {
        btn.innerHTML = `<i class="fa-solid fa-play"></i> <span>Play</span>`;
    }
}

function stopSpeech() {
    speechSynthesis.cancel();
    ttsQueue = [];
    currentChunkIndex = 0;
    currentUtterance = null;
    isPaused = false;
    currentSpeechPage = null;
    textPanel && (textPanel.innerHTML = "");

    updatePlayPauseUI(false);
}

function copyText() {
    // No page selected
    if (currentSpeechPage === null) {
        alert("No page selected");
        return;
    }

    const page = pages[currentSpeechPage];

    // OCR not done yet
    if (!page || !page.text) {
        alert("Text not ready yet");
        return;
    }

    navigator.clipboard.writeText(page.text)
        .then(() => {
            showCopyFeedback();
        })
        .catch(err => {
            console.error("Copy failed:", err);
            alert("Copy failed");
        });
}

function showCopyFeedback() {
    const btn = document.getElementById("copyBtn");
    if (!btn) return;

    const original = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Copied</span>`;

    setTimeout(() => {
        btn.innerHTML = original;
    }, 1200);
}

function clickInput() {
    pdfInput.click();
}

// ---- TEXT PANEL ----
function renderTextChunks(chunks) {
    if (!textPanel) return;
    textPanel.innerHTML = "";

    chunks.forEach((chunk, i) => {
        const span = document.createElement("span");
        span.textContent = chunk + " ";
        span.className = "tts-chunk";
        span.id = `chunk-${i}`;
        textPanel.appendChild(span);
    });
}

function highlightChunk(index) {
    document
        .querySelectorAll(".tts-chunk")
        .forEach(el => el.classList.remove("tts-active"));

    const el = document.getElementById(`chunk-${index}`);
    el && el.classList.add("tts-active");
}

const previewOverlay = document.getElementById("previewOverlay");
const previewImage = document.getElementById("previewImage");

function showPreview(canvas) {
    if (!previewOverlay || !previewImage) return;

    previewImage.src = canvas.toDataURL("image/png");
    previewOverlay.classList.remove("hidden");
}

previewOverlay?.addEventListener("click", () => {
    previewOverlay.classList.add("hidden");
    previewImage.src = "";
});
