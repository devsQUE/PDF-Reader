// src/utils/performanceLimits.js

const deviceMemory = navigator.deviceMemory || 4;

export const LIMITS = {
  MAX_PAGES: deviceMemory <= 2 ? 60 : deviceMemory <= 4 ? 120 : 200,
  RENDER_SCALE: deviceMemory <= 2 ? 1.5 : deviceMemory <= 4 ? 2.0 : 2.5
};

/**
 * Validate PDF size before loading
 */
export function validatePdfPageCount(count) {
  if (count > LIMITS.MAX_PAGES) {
    return {
      ok: false,
      message: `PDF has ${count} pages. Limit is ${LIMITS.MAX_PAGES} for this device.`
    };
  }
  return { ok: true };
}
