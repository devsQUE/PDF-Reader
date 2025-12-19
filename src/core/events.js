// src/core/events.js

const listeners = Object.create(null);

export function on(event, handler) {
  (listeners[event] ??= []).push(handler);
}

export function emit(event, payload) {
  const fns = listeners[event];
  if (!fns) return;
  for (const fn of fns) fn(payload);
}

export function off(event, handler) {
  const fns = listeners[event];
  if (!fns) return;
  const idx = fns.indexOf(handler);
  if (idx !== -1) fns.splice(idx, 1);
}
