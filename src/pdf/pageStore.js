// src/pdf/pageStore.js

import { state } from "../core/state.js";

export function initPages(count) {
  state.pages = Array.from({ length: count }, (_, i) => ({
    pageNumber: i + 1,
    imageBlob: null,
    text: null
  }));
}

export function setPageImage(index, blob) {
  if (!state.pages[index]) return;
  state.pages[index].imageBlob = blob;
}

export function getPage(index) {
  return state.pages[index] || null;
}
