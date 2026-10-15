// Meta (Facebook) Pixel. It sets advertising cookies, so it is loaded only after
// the visitor clicks "אישור" in the cookie banner (consent === 'all') — on page
// load if they already accepted, or the moment they accept.
import { getConsent } from './consent.js';
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
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
  // Events fired before consent (e.g. a purchase on the thank-you page) are sent now.
  while (pending.length) window.fbq(...pending.shift());
}

// Call once at startup.
export function initMetaPixel() {
  if (getConsent() === 'all') load();
  window.addEventListener('cc-consent', () => {
    if (getConsent() === 'all') {
      if (loaded) window.fbq?.('consent', 'grant');
      else load();
    } else if (loaded) {
      window.fbq?.('consent', 'revoke'); // withdrawn mid-visit: stop sending
    }
  });
}

// Meta's browser id cookies, forwarded to the server so Conversions API events
// match this visitor. Only meaningful after consent (the pixel sets them).
export function metaBrowserIds() {
  if (getConsent() !== 'all') return { consent: false };
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
  else if (getConsent() !== 'necessary') pending.push(args); // may still be accepted on this page
}
