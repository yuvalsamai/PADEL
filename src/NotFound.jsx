import React from 'react';

export default function NotFound() {
  return (
    <div dir="rtl" className="min-h-screen bg-olive p-2.5 font-sans text-ink sm:p-4">
      <div className="relative flex min-h-[calc(100vh-20px)] flex-col overflow-hidden rounded-panel bg-court sm:min-h-[calc(100vh-32px)]">
        {/* header */}
        <header className="p-5 sm:p-8">
          <a href="/" aria-label="CourtCheck" className="inline-flex items-center">
            <img src="/LOGO-removebg-preview.png" alt="CourtCheck" className="h-12 w-auto drop-shadow-lg sm:h-14" />
          </a>
        </header>

        {/* center */}
        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center">
          <div className="font-display text-[26vw] font-black leading-none tracking-tight text-ball sm:text-[200px]">
            OUT
          </div>

          <p className="mt-6 max-w-md text-xl leading-relaxed text-bone/80 sm:text-2xl">
            לצערנו הגעת לדף לא קיים.
          </p>

          <a
            href="/"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-ball px-7 py-3 font-semibold text-ink transition-colors hover:bg-white"
          >
            חזרה לדף הבית
          </a>

          <div className="mt-4 font-mono text-sm text-bone/40">404</div>
        </div>
      </div>
    </div>
  );
}
