/**
 * Optional SW registration. Safe no-op if unsupported.
 * Uses relative URL for GitHub Pages subpath.
 */
export async function registerServiceWorker(path = './service-worker.js') {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { ok: false, reason: 'unsupported' };
  }
  try {
    const reg = await navigator.serviceWorker.register(path, { scope: './' });
    return { ok: true, scope: reg.scope };
  } catch (err) {
    return { ok: false, reason: String(err?.message || err) };
  }
}
