importScripts("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");

self.onmessage = async (e) => {
  const { pageNumber, imageBlob, lang } = e.data;

  try {
    const result = await Tesseract.recognize(
      imageBlob,
      lang || "hin",
      { logger: () => {} }
    );

    self.postMessage({
      pageNumber,
      text: result.data.text
    });

  } catch (err) {
    self.postMessage({
      pageNumber,
      error: err.message
    });
  }
};

