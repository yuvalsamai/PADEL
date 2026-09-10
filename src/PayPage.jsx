import React, { useEffect, useState } from 'react';

export default function PayPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/create-payment')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.url) setUrl(d.url);
        else setError(d.error || 'לא ניתן ליצור דף תשלום כרגע');
      })
      .catch(() => !cancelled && setError('שגיאת רשת ביצירת דף התשלום'));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-screen flex-col bg-ink">
      <header className="flex items-center justify-between border-b border-white/10 bg-court px-5 py-3">
        <a href="/" aria-label="CourtCheck" className="inline-flex items-center">
          <img src="/LOGO-removebg-preview.png" alt="CourtCheck" className="h-9 w-auto" />
        </a>
        <a
          href="/"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-bone hover:bg-white/10"
        >
          חזרה לאתר
        </a>
      </header>

      {error ? (
        <div dir="rtl" className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <p className="text-lg text-bone/80">{error}</p>
          <a href="/" className="rounded-full bg-ball px-6 py-3 font-semibold text-ink hover:bg-white">
            חזרה לדף הבית
          </a>
        </div>
      ) : url ? (
        <iframe
          src={url}
          title="תשלום מאובטח - CourtCheck"
          className="w-full flex-1 border-0 bg-white"
          allow="payment"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-bone/50">טוען דף תשלום מאובטח…</div>
      )}
    </div>
  );
}
