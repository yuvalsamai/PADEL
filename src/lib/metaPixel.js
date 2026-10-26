// Meta (Facebook) Pixel. Loaded on page load for every visitor, unless they chose
// "הכרחיות בלבד" in the cookie banner (opt-out) — then it is never loaded, or is
// revoked the moment they choose it.
import { adsAllowed } from './consent.js';
import { PIXEL_ID } from './meta.js';

let loaded = false;
const pending = [];

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  // No automatic events: Meta otherwise guesses events from button clicks (it was
  // logging stray AddToCart events). The funnel is reported explicitly instead:
  // PageView/ViewContent → InitiateCheckout → AddPaymentInfo → Purchase.
  window.fbq('set', 'autoConfig', false, PIXEL_ID);
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
  // Events fired before consent (e.g. a purchase on the thank-you page) are sent now.
  while (pending.length) window.fbq(...pending.shift());
}

// Call once at startup.
export function initMetaPixel() {
  if (adsAllowed()) load();
  window.addEventListener('cc-consent', () => {
    if (adsAllowed()) {
      if (loaded) window.fbq?.('consent', 'grant');
      else load();
    } else if (loaded) {
      window.fbq?.('consent', 'revoke'); // withdrawn mid-visit: stop sending
    }
  });
}

// Meta's browser id cookies, forwarded to the server so Conversions API events
// match this visitor. Not sent for visitors who opted out.
export function metaBrowserIds() {
  if (!adsAllowed()) return { consent: false };
  const cookie = (k) => document.cookie.split('; ').find((c) => c.startsWith(`${k}=`))?.split('=')[1] || null;
  let fbc = cookie('_fbc');
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (!fbc && fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  return { consent: true, fbp: cookie('_fbp'), fbc };
}

// Standard event, e.g. fbEvent('Purchase', { value: 89, currency: 'ILS' }, { eventID }).
export function fbEvent(name, params, options) {
  const args = ['track', name, params || {}, ...(options ? [options] : [])];
  if (loaded && window.fbq) window.fbq(...args);
  else if (adsAllowed()) pending.push(args);
}
