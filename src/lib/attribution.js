// Remembers where this visit came from (the first page's utm tags, whether the
// link carried a Meta click id, the referring site) so the order can record it
// and the admin can tell which campaign brought the sale. Campaign tags only —
// no personal data — kept in sessionStorage for the current tab.

const KEY = 'cc_attr';

export function captureAttribution() {
  try {
    if (sessionStorage.getItem(KEY)) return; // first page of the visit wins
    const q = new URLSearchParams(window.location.search);
    let ref = '';
    try {
      const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
      if (host && host !== window.location.hostname.replace(/^www\./, '')) ref = host;
    } catch { /* ignore */ }
    const a = {
      source: q.get('utm_source') || '',
      medium: q.get('utm_medium') || '',
      campaign: q.get('utm_campaign') || '',
      content: q.get('utm_content') || '',
      fbclid: q.has('fbclid'),
      referrer: ref,
      landing: window.location.pathname,
    };
    sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch { /* storage blocked — no attribution */ }
}

export function getAttribution() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

// Human label for the admin: which channel/campaign an order came from.
export function sourceLabel(a) {
  if (!a) return 'לא ידוע';
  const s = (a.source || '').toLowerCase();
  const ref = (a.referrer || '').toLowerCase();
  const isMeta = /instagram|facebook|fb|ig/.test(s) || /instagram|facebook/.test(ref);
  if (s) {
    if (isMeta && /paid|cpc|ads?/.test((a.medium || '').toLowerCase())) {
      return `מודעה באינסטגרם${a.campaign ? ` · ${a.campaign}` : ''}`;
    }
    return [a.source, a.medium, a.campaign].filter(Boolean).join(' · ');
  }
  if (a.fbclid) return 'פוסט מקודם / קישור מאינסטגרם';
  if (/instagram/.test(ref)) return 'אינסטגרם (לא ממומן)';
  if (/facebook/.test(ref)) return 'פייסבוק';
  if (/google/.test(ref)) return 'גוגל';
  if (ref) return ref;
  return 'כניסה ישירה';
}
