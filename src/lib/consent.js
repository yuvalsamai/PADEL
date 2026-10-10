// Visitor's storage/analytics choice from the cookie banner.
//   'all'       → analytics may keep a persistent anonymous visitor id
//   'necessary' → only strictly necessary storage; analytics ids are per page load
//   null        → not chosen yet (treated like 'necessary')
const KEY = 'cc_cookie_ok';
const SID_KEY = 'cc_sid';

export function getConsent() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === '1') return 'all'; // choice stored by the previous banner version
    return v === 'all' || v === 'necessary' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value) {
  try {
    localStorage.setItem(KEY, value);
    if (value !== 'all') localStorage.removeItem(SID_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('cc-consent'));
}

// Lets any page reopen the banner (e.g. the "הגדרות עוגיות" footer link).
export const openConsentSettings = () => window.dispatchEvent(new Event('cc-consent-open'));
