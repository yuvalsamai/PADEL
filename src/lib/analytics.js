// Tiny first-party analytics client. Sends visit/conversion events to
// /api/track. Fire-and-forget: any failure is swallowed so tracking can never
// affect the user experience.

const SID_KEY = 'cc_sid';

// A stable-per-browser id so the admin can count unique visitors. Falls back to
// an in-memory id if localStorage is blocked (private mode, etc.).
let memorySid = null;
function sessionId() {
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    if (!memorySid) memorySid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return memorySid;
  }
}

export function track(type, extra = {}) {
  try {
    const payload = JSON.stringify({
      type,
      path: window.location.pathname,
      referrer: document.referrer || null,
      sessionId: sessionId(),
      ...extra,
    });
    // sendBeacon survives page navigation (e.g. clicking through to /pay);
    // fall back to fetch with keepalive where it isn't available.
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
    }
  } catch {
    /* ignore — analytics must never break the page */
  }
}

export const trackPageview = () => track('pageview');
