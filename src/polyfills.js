if (typeof globalThis !== 'undefined') {
  globalThis.global = globalThis;
}

if (typeof window !== 'undefined') {
  window.global = window;
  if (!window.process) {
    window.process = { env: {} };
  }
}
