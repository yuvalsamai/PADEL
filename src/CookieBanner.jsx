import React, { useEffect, useState } from 'react';

/* Minimal cookie-consent banner. Shows once; the choice is remembered in
   localStorage. We only use functional + first-party analytics cookies, so this
   is a notice with an acknowledge action (and a link to the policy). */

const KEY = 'cc_cookie_ok';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-white/10 bg-ink/95 p-4 text-bone shadow-2xl backdrop-blur-md sm:flex sm:items-center sm:gap-4"
    >
      <p className="text-sm leading-relaxed text-bone/80">
        אנו משתמשים בעוגיות לצורך תפעול האתר, שמירת העדפות ומדידת תנועה.
        {' '}
        <a href="/privacy" className="text-ball underline underline-offset-2">מדיניות פרטיות</a>
      </p>
      <button
        onClick={accept}
        className="mt-3 w-full flex-shrink-0 rounded-full bg-ball px-6 py-2.5 text-sm font-semibold text-ink hover:bg-white sm:mt-0 sm:w-auto"
      >
        הבנתי
      </button>
    </div>
  );
}
