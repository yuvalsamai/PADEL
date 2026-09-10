import React from 'react';

export default function ThankYou() {
  return (
    <div dir="rtl" className="min-h-screen bg-olive p-2.5 font-sans text-ink sm:p-4">
      <div className="flex min-h-[calc(100vh-20px)] flex-col overflow-hidden rounded-panel bg-court sm:min-h-[calc(100vh-32px)]">
        <header className="p-5 sm:p-8">
          <a href="/" aria-label="CourtCheck" className="inline-flex items-center">
            <img src="/LOGO-removebg-preview.png" alt="CourtCheck" className="h-12 w-auto drop-shadow-lg sm:h-14" />
          </a>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center">
          {/* check mark */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ball">
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="mt-8 font-display text-4xl font-black tracking-tight text-bone sm:text-5xl">
            תודה על ההזמנה!
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-bone/80">
            התשלום התקבל בהצלחה. הזמנתך נקלטה במערכת ותישלח אליך בהקדם — נעדכן אותך במספר מעקב.
          </p>

          <a
            href="/"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-ball px-7 py-3 font-semibold text-ink transition-colors hover:bg-white"
          >
            חזרה לדף הבית
          </a>
        </div>
      </div>
    </div>
  );
}
