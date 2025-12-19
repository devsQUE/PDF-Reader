// src/pdf/pdfLoader.js

import { getDocument, GlobalWorkerOptions }
  from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs";

import { emit } from "../core/events.js";
import { state } from "../core/state.js";
import { initPages, setPageImage } from "./pageStore.js";
import { LIMITS } from "../utils/performanceLimits.js";

GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs";

function resetBeforeLoad() {
  state.pages = [];
  state.activePage = null;
  emit("pdf:reset");
  console.log("PDF RESET FIRED"); // 🔴 DEBUG

}

/**
 * Load PDF page range safely
 */
export async function loadPDF(file, range = null) {
  if (state.isLoadingPdf) return;

  state.isLoadingPdf = true;
  resetBeforeLoad();

  try {
    const buffer = await file.arrayBuffer();
    state.pdfMeta.name = file.name;
    state.pdfMeta.size = file.size;
    emit("pdf:meta", { ...state.pdfMeta });

    const pdf = await getDocument({ data: buffer }).promise;
    state.pdfMeta.totalPages = pdf.numPages;
    emit("pdf:meta", { ...state.pdfMeta });

    state.pdf = pdf;

    const total = pdf.numPages;

    let start = 1;
    let end = Math.min(total, LIMITS.MAX_PAGES);

    if (range) {
      start = Math.max(1, range.start);
      end = Math.min(total, range.end);

      if (end < start) {
        alert("Invalid page range");
        return;
      }

      if (end - start + 1 > LIMITS.MAX_PAGES) {
        end = start + LIMITS.MAX_PAGES - 1;
        alert(`Range too large. Only ${LIMITS.MAX_PAGES} pages loaded.`);
      }
    } else if (total > LIMITS.MAX_PAGES) {
      alert(
        `This PDF has ${total} pages.\n` +
        `Only the first ${LIMITS.MAX_PAGES} pages are loaded.`
      );
    }

    const count = end - start + 1;
    initPages(count);
    emit("pdf:loaded", count);

    const scale = LIMITS.RENDER_SCALE;

let idx = 0;

for (let pageNum = start; pageNum <= end; pageNum++) {
  if (state.pdf !== pdf) return;

  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  // IMPORTANT: capture idx correctly
  const pageIndex = idx;

canvas.toBlob((blob) => {
  if (!blob) {
    console.warn("Canvas blob failed for page", pageNum);
    return;
  }

  setPageImage(pageIndex, blob);

  emit("pdf:pageRendered", {
    index: pageIndex,
    canvas,
    pageNumber: pageNum
  });
});


  idx++;
}

  } finally {
    state.isLoadingPdf = false;
  }
}
