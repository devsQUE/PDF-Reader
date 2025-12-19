// src/tts/textChunker.js

/**
 * Chunk text into speakable pieces.
 * Works well for Hindi and English.
 */
export function chunkText(text, maxLength = 180) {
  if (!text) return [];

  // Normalize whitespace
  const cleaned = text.replace(/\s+/g, " ").trim();

  // Split by sentence-ending punctuation (Hindi + English)
  const sentences = cleaned.split(/(?<=[।.!?])/);

  const chunks = [];
  let buffer = "";

  for (const sentence of sentences) {
    if ((buffer + sentence).length <= maxLength) {
      buffer += sentence;
    } else {
      if (buffer.trim()) chunks.push(buffer.trim());
      buffer = sentence;
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim());

  return chunks;
}
