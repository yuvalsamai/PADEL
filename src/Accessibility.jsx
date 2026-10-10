import React, { useEffect, useRef, useState } from 'react';
import { Accessibility, X, Plus, Minus, RotateCcw } from 'lucide-react';

/* ==========================================================================
   Accessibility toolkit — built to the Israeli service-accessibility
   regulations (תקנות שוויון זכויות לאנשים עם מוגבלות, ת"י 5568 / WCAG 2.0 AA).
   Pure client-side, no external services. Preferences persist per browser.
   ========================================================================== */

const STORE_KEY = 'cc_a11y';
const DEFAULTS = {
  fontScale: 1,
  contrast: false,
  grayscale: false,
  links: false,
  readable: false,
  bigCursor: false,
  stopAnim: false,
};

function load() {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(STORE_KEY)) || {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

function apply(s) {
  const html = document.documentElement;
  html.style.fontSize = s.fontScale === 1 ? '' : `${Math.round(s.fontScale * 100)}%`;
  html.classList.toggle('acc-links', s.links);
  html.classList.toggle('acc-readable', s.readable);
  html.classList.toggle('acc-bigcursor', s.bigCursor);
  html.classList.toggle('acc-no-animations', s.stopAnim);
  // Contrast + grayscale are combined into one filter on <body>.
  const filters = [];
  if (s.contrast) filters.push('contrast(1.35)');
  if (s.grayscale) filters.push('grayscale(1)');
  document.body.style.filter = filters.join(' ');
}

/* ---- The floating widget ---- */

const Toggle = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
      active ? 'border-moss bg-moss/10 text-ink' : 'border-black/10 bg-white text-ink/70 hover:bg-black/5'
    }`}
  >
    {children}
  </button>
);

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState(load);
  const launcherRef = useRef(null);
  const panelRef = useRef(null);

  // Esc closes the panel and returns focus to the launcher; focus moves into the panel on open.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector('button')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    apply(s);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s]);

  const set = (patch) => setS((prev) => ({ ...prev, ...patch }));
  const toggle = (key) => set({ [key]: !s[key] });
  const reset = () => setS({ ...DEFAULTS });

  const clampScale = (v) => Math.min(1.6, Math.max(0.8, Math.round(v * 10) / 10));

  return (
    <div id="a11y-widget" dir="rtl">
      {/* Launcher button */}
      <button
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="תפריט נגישות"
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-[110] flex h-14 w-14 items-center justify-center rounded-full bg-moss text-white shadow-xl ring-2 ring-white/70 transition hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-moss/40"
      >
        <Accessibility size={28} />
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="אפשרויות נגישות"
          className="fixed bottom-20 right-4 z-[110] w-[min(92vw,340px)] rounded-2xl border border-black/10 bg-white p-4 text-ink shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">נגישות</h2>
            <button onClick={() => setOpen(false)} aria-label="סגור" className="rounded-full p-1 hover:bg-black/5">
              <X size={18} />
            </button>
          </div>

          {/* Font size */}
          <div className="mb-3 flex items-center justify-between rounded-xl border border-black/10 px-3 py-2">
            <button onClick={() => set({ fontScale: clampScale(s.fontScale - 0.1) })} aria-label="הקטן טקסט" className="rounded-lg p-2 hover:bg-black/5">
              <Minus size={16} />
            </button>
            <span className="text-sm font-semibold">גודל טקסט · {Math.round(s.fontScale * 100)}%</span>
            <button onClick={() => set({ fontScale: clampScale(s.fontScale + 0.1) })} aria-label="הגדל טקסט" className="rounded-lg p-2 hover:bg-black/5">
              <Plus size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Toggle active={s.contrast} onClick={() => toggle('contrast')}>ניגודיות גבוהה</Toggle>
            <Toggle active={s.grayscale} onClick={() => toggle('grayscale')}>גווני אפור</Toggle>
            <Toggle active={s.links} onClick={() => toggle('links')}>הדגשת קישורים</Toggle>
            <Toggle active={s.readable} onClick={() => toggle('readable')}>גופן קריא</Toggle>
            <Toggle active={s.bigCursor} onClick={() => toggle('bigCursor')}>סמן מוגדל</Toggle>
            <Toggle active={s.stopAnim} onClick={() => toggle('stopAnim')}>עצירת אנימציות</Toggle>
          </div>

          <button
            onClick={reset}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black/5 py-2.5 text-sm font-medium text-ink hover:bg-black/10"
          >
            <RotateCcw size={15} /> איפוס הגדרות
          </button>

          <a
            href="/accessibility"
            className="mt-2 block w-full rounded-xl py-2 text-center text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            הצהרת נגישות
          </a>
        </div>
      )}

    </div>
  );
}
