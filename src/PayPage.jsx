import React from 'react';

// Hyp secure payment form. Swap the stage URL for production before launch.
const PAY_URL = 'https://stage.hyp.co.il/sp/?key=a78d3ee6-a5dc-4434-bd14-c2f00b6d7812&id=13231';

export default function PayPage() {
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

      <iframe
        src={PAY_URL}
        title="תשלום מאובטח - CourtCheck"
        className="w-full flex-1 border-0 bg-white"
        allow="payment"
      />
    </div>
  );
}
