import React, { useEffect, useState } from 'react';
import { getConsent, setConsent } from './lib/consent.js';

/* Cookie / browser-storage notice. The site uses no advertising or third-party
   tracking cookies — only strictly necessary storage plus optional first-party
   statistics. Visitors can accept or limit to necessary storage, and reopen this
   from the footer ("הגדרות עוגיות"). */
export default function CookieBanner() {
  const [show, setShow] = useState(false);

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
      dir="rtl"
      role="region"
      aria-label="הודעת עוגיות"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-white/10 bg-ink/95 p-4 text-bone shadow-2xl backdrop-blur-md"
    >
      <p className="text-sm leading-relaxed text-bone/80">
        האתר שומר בדפדפן מידע הכרחי לתפעולו (כמו העדפות נגישות). באישורכם נשמור גם מזהה אנונימי לסטטיסטיקת
        ביקורים. אין באתר עוגיות פרסום או מעקב של צד שלישי.{' '}
        <a href="/privacy#cookies" className="text-ball underline underline-offset-2">מדיניות פרטיות</a>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
        <button
          onClick={() => choose('all')}
          className="rounded-full bg-ball px-6 py-2.5 text-sm font-semibold text-ink hover:bg-white"
        >
          אישור
        </button>
        <button
          onClick={() => choose('necessary')}
          className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-bone hover:bg-white/10"
        >
          הכרחיות בלבד
        </button>
      </div>
    </div>
  );
}
