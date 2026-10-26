import React, { useEffect, useRef, useState } from 'react';
import { getConsent, setConsent } from './lib/consent.js';

/* Cookie / browser-storage notice. Strictly necessary storage always; the Meta
   Pixel (advertising cookies) runs unless the visitor picks "הכרחיות בלבד"; a
   persistent statistics id only after "אישור". Reopened from the footer
   ("הגדרות עוגיות"). */
export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  // Publish the banner's height (--cc-banner-h) so bottom-fixed UI such as the
  // mobile order bar sits above it instead of being hidden underneath.
  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!show || !el) return undefined;
    const set = () => root.style.setProperty('--cc-banner-h', `${el.offsetHeight + 8}px`);
    set();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(set) : null;
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      root.style.removeProperty('--cc-banner-h');
    };
  }, [show]);

  useEffect(() => {
    if (!getConsent()) setShow(true);
    const reopen = () => setShow(true);
    window.addEventListener('cc-consent-open', reopen);
    return () => window.removeEventListener('cc-consent-open', reopen);
  }, []);

  const choose = (value) => {
    setConsent(value);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      ref={ref}
      dir="rtl"
      role="region"
      aria-label="הודעת עוגיות"
      className="fixed inset-x-2 bottom-2 z-[100] mx-auto flex max-w-2xl flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-white/10 bg-ink/95 px-3 py-2.5 text-bone shadow-2xl backdrop-blur-md sm:flex-nowrap"
    >
      <p className="min-w-0 flex-1 text-xs leading-snug text-bone/80">
        האתר משתמש בעוגיות לסטטיסטיקה ולמדידת פרסום (Meta). אפשר לבחור הכרחיות בלבד.{' '}
        <a href="/privacy#cookies" className="text-ball underline underline-offset-2">פרטים</a>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => choose('necessary')}
          className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-bone hover:bg-white/10"
        >
          הכרחיות בלבד
        </button>
        <button
          onClick={() => choose('all')}
          className="rounded-full bg-ball px-4 py-1.5 text-xs font-semibold text-ink hover:bg-white"
        >
          אישור
        </button>
      </div>
    </div>
  );
}
