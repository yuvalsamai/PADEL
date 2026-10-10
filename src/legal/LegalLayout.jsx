import React, { useEffect } from 'react';
import Logo from '../Logo.jsx';
import { BUSINESS } from '../lib/business.js';
import { openConsentSettings } from '../lib/consent.js';

/* Shared shell for the legal pages (/terms, /privacy, /cancel, /accessibility). */
export function LegalLayout({ title, children }) {
  useEffect(() => {
    document.title = `${title} · ${BUSINESS.brand}`;
  }, [title]);

  return (
    <div dir="rtl" className="min-h-screen bg-bone font-sans text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-bone">
        דלג לתוכן הראשי
      </a>
      <header className="border-b border-ink/10 bg-chalk">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <a href="/" aria-label={`${BUSINESS.brand} - לדף הבית`}>
            <Logo className="h-12" />
          </a>
          <a href="/" className="text-sm font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline">
            חזרה לאתר
          </a>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="mb-2 font-display text-3xl font-black text-ink sm:text-4xl">{title}</h1>
        <p className="mb-8 text-sm text-ink/60">עודכן לאחרונה: {BUSINESS.updated}</p>
        {children}
        <nav aria-label="מסמכים משפטיים" className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/10 pt-6 text-sm">
          <a href="/terms" className="text-ink/70 underline underline-offset-4 hover:text-ink">תקנון האתר</a>
          <a href="/cancel" className="text-ink/70 underline underline-offset-4 hover:text-ink">ביטול עסקה</a>
          <a href="/privacy" className="text-ink/70 underline underline-offset-4 hover:text-ink">מדיניות פרטיות</a>
          <a href="/accessibility" className="text-ink/70 underline underline-offset-4 hover:text-ink">הצהרת נגישות</a>
          <button type="button" onClick={openConsentSettings} className="text-ink/70 underline underline-offset-4 hover:text-ink">הגדרות עוגיות</button>
        </nav>
      </main>
    </div>
  );
}

export const Section = ({ id, h, children }) => (
  <section id={id} className="mb-8 scroll-mt-6">
    <h2 className="mb-3 font-display text-xl font-bold text-ink">{h}</h2>
    <div className="space-y-3 text-[15px] leading-relaxed text-ink/80">{children}</div>
  </section>
);

/* Business identity block — only fields that are filled in are shown. */
export function BusinessDetails() {
  const b = BUSINESS;
  const rows = [
    ['שם העסק', b.legalName ? `${b.legalName} (${b.brand})` : b.brand],
    [b.businessType || 'מספר עוסק / ח.פ.', b.businessId],
    ['כתובת', b.address],
    ['טלפון', b.phone && <a href={`tel:${b.phone}`} dir="ltr" className="underline">{b.phone}</a>],
    ['דוא״ל', b.email && <a href={`mailto:${b.email}`} dir="ltr" className="underline">{b.email}</a>],
  ].filter(([, v]) => v);
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-2xl bg-chalk p-5 ring-1 ring-ink/10">
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="font-semibold text-ink">{k}:</dt>
          <dd className="text-ink/80">{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
