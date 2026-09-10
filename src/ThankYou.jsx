import React, { useEffect, useState } from 'react';

export default function ThankYou() {
  // 'checking' | 'ok' | 'failed'
  const [state, setState] = useState('checking');

  useEffect(() => {
    const search = window.location.search; // Hyp completion params (order preserved)
    if (!search || !search.includes('CCode=')) {
      // Reached directly without payment params — just show a generic confirmation.
      setState('ok');
      return;
    }
    fetch(`/api/verify-payment${search}`)
      .then((r) => r.json())
      .then((d) => setState(d.ok ? 'ok' : 'failed'))
      .catch(() => setState('failed'));
  }, []);

  const failed = state === 'failed';

  return (
    <div dir="rtl" className="min-h-screen bg-olive p-2.5 font-sans text-ink sm:p-4">
      <div className="flex min-h-[calc(100vh-20px)] flex-col overflow-hidden rounded-panel bg-court sm:min-h-[calc(100vh-32px)]">
        <header className="p-5 sm:p-8">
          <a href="/" aria-label="CourtCheck" className="inline-flex items-center">
            <img src="/LOGO-removebg-preview.png" alt="CourtCheck" className="h-12 w-auto drop-shadow-lg sm:h-14" />
          </a>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center">
          {state === 'checking' ? (
            <p className="text-lg text-bone/60">מאמת את התשלום…</p>
          ) : (
            <>
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${failed ? 'bg-rose-500' : 'bg-ball'}`}
              >
                {failed ? (
                  <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </div>

              <h1 className="mt-8 font-display text-4xl font-black tracking-tight text-bone sm:text-5xl">
                {failed ? 'התשלום לא אומת' : 'תודה על ההזמנה!'}
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-bone/80">
                {failed
                  ? 'לא הצלחנו לאמת את התשלום. אם חויבת, פנה אלינו ונבדוק מיד.'
                  : 'התשלום התקבל בהצלחה. הזמנתך נקלטה במערכת ותישלח אליך בהקדם — נעדכן אותך במספר מעקב.'}
              </p>

              <a
                href="/"
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-ball px-7 py-3 font-semibold text-ink transition-colors hover:bg-white"
              >
                חזרה לדף הבית
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
