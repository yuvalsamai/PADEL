import React, { useEffect, useState } from 'react';

export default function ThankYou() {
  // 'checking' | 'ok' | 'failed'
  const [state, setState] = useState('checking');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const search = window.location.search; // Hyp completion params (order preserved)
    if (!search || !search.includes('CCode=')) {
      // Reached directly without payment params — just show a generic confirmation.
      setState('ok');
      return;
    }
    // Fallback display from the Hyp completion params themselves.
    const p = new URLSearchParams(search);
    const fromUrl = {
      order: p.get('Order'),
      amount: Number(p.get('Amount')) || null,
      name: p.get('Fild1'),
      email: p.get('Fild2'),
    };
    fetch(`/api/verify-payment${search}`)
      .then((r) => r.json())
      .then((d) => {
        setState(d.ok ? 'ok' : 'failed');
        if (d.ok) setDetails({ ...fromUrl, ...(d.details || {}) });
      })
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

              {!failed && details && (
                <div dir="rtl" className="mt-8 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 text-right">
                  <h2 className="mb-3 font-display text-lg font-bold text-bone">סיכום ההזמנה</h2>
                  <dl className="space-y-2 text-sm">
                    {details.order && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-bone/60">מס׳ הזמנה</dt>
                        <dd className="font-medium text-bone" dir="ltr">{details.order}</dd>
                      </div>
                    )}
                    {details.name && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-bone/60">שם</dt>
                        <dd className="font-medium text-bone">{details.name}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <dt className="text-bone/60">מוצר</dt>
                      <dd className="font-medium text-bone">תושבת CourtCheck</dd>
                    </div>
                    {details.quantity != null && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-bone/60">כמות</dt>
                        <dd className="font-medium text-bone">{details.quantity}</dd>
                      </div>
                    )}
                    {details.address && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-bone/60">כתובת למשלוח</dt>
                        <dd className="max-w-[60%] font-medium text-bone">{details.address}</dd>
                      </div>
                    )}
                    {details.amount != null && (
                      <div className="mt-1 flex justify-between gap-4 border-t border-white/10 pt-2">
                        <dt className="text-bone/70">סה״כ שולם</dt>
                        <dd className="font-display text-lg font-black text-ball">₪{details.amount}</dd>
                      </div>
                    )}
                  </dl>
                  {details.email && (
                    <p className="mt-4 text-xs text-bone/50">אישור נשלח לכתובת {details.email}</p>
                  )}
                </div>
              )}

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
