// src/ocr/ocrService.js

import { on, emit } from "../core/events.js";
import { state } from "../core/state.js";
import { getPage } from "../pdf/pageStore.js";

// service worker
const worker = new Worker(new URL("ocrWorker.js", import.meta.url), {
    type: "classic"
});

let busy = false;

// When user selects a page
on("page:selected", (index) => {

    const page = getPage(index);
    if (!page || busy || !page.imageBlob) return;

    busy = true;
    state.activePage = index;

    emit("ocr:started", index);

    worker.postMessage({
        pageNumber: index + 1,
        imageBlob: page.imageBlob,
        lang: state.ocr.lang
    });
});

// OCR result
worker.onmessage = (e) => {
    const { pageNumber, text, error } = e.data;
    const index = pageNumber - 1;

    busy = false;

    if (error) {
        emit("ocr:error", { index, error });
        return;
    }

    state.pages[index].text = text;
    emit("ocr:done", { index, text });
};

// Cleanup
window.addEventListener("beforeunload", () => {
    worker.terminate();
});
