import React, { useEffect, useState } from 'react';
import { Accessibility, X, Plus, Minus, RotateCcw } from 'lucide-react';

/* ==========================================================================
   Accessibility toolkit — built to the Israeli service-accessibility
   regulations (תקנות שוויון זכויות לאנשים עם מוגבלות, ת"י 5568 / WCAG 2.0 AA).
   Pure client-side, no external services. Preferences persist per browser.
   ========================================================================== */

// 👉 Fill these with your real accessibility-coordinator details.
export const A11Y_CONTACT = {
  business: 'CourtCheck',
  email: 'yuvalsamai@gmail.com',
  phone: '', // e.g. '050-0000000'
};

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

/* ---- Accessibility statement (הצהרת נגישות) ---- */

const Row = ({ children }) => <p className="mb-3">{children}</p>;

export const AccessibilityStatementModal = ({ open, onClose }) => {
  if (!open) return null;
  const { business, email, phone } = A11Y_CONTACT;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        role="dialog"
        aria-label="הצהרת נגישות"
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 text-ink/80 shadow-2xl sm:p-9"
      >
        <button
          onClick={onClose}
          aria-label="סגור"
          className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-ink hover:bg-black/10"
        >
          <X size={18} />
        </button>
        <h3 className="mb-5 text-2xl font-black text-ink">הצהרת נגישות</h3>
        <div className="text-sm leading-relaxed">
          <Row>
            אתר {business} רואה חשיבות רבה במתן שירות שוויוני לכלל הלקוחות ובשיפור חוויית
            הגלישה עבור אנשים עם מוגבלות. אנו פועלים ככל האפשר להנגשת האתר בהתאם
            לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013,
            ולתקן הישראלי ת"י 5568 המבוסס על הנחיות WCAG 2.0 ברמה AA.
          </Row>
          <Row>
            <b>אמצעי הנגישות באתר:</b> באתר מותקן תפריט נגישות (הלחצן בפינת המסך) המאפשר,
            בין היתר: הגדלה והקטנה של גודל הטקסט, ניגודיות גבוהה, גווני אפור, הדגשת
            קישורים, גופן קריא, סמן עכבר מוגדל ועצירת אנימציות. ניתן לאפס את ההגדרות
            בכל עת.
          </Row>
          <Row>
            <b>התאמות נוספות:</b> האתר תומך בניווט מקלדת, בקורא מסך, ובמבנה כותרות
            סמנטי. אנו ממשיכים לשפר את הנגישות באופן שוטף.
          </Row>
          <Row>
            <b>הסתייגות:</b> ייתכן שחלקים מסוימים באתר טרם הונגשו במלואם או שנמצאים
            בתהליך הנגשה. אם נתקלתם בקושי או בתקלת נגישות, נשמח שתפנו אלינו ונטפל
            בכך בהקדם.
          </Row>
          <Row>
            <b>פרטי רכז/ת הנגישות:</b>
            <br />
            שם העסק: {business}
            <br />
            דוא"ל: <a className="text-moss underline" href={`mailto:${email}`}>{email}</a>
            {phone ? (
              <>
                <br />
                טלפון: <a className="text-moss underline" href={`tel:${phone}`} dir="ltr">{phone}</a>
              </>
            ) : null}
          </Row>
          <Row>הצהרה זו עודכנה לאחרונה בחודש הפעלת האתר ותתעדכן מעת לעת.</Row>
        </div>
      </div>
    </div>
  );
};

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
  const [showStatement, setShowStatement] = useState(false);
  const [s, setS] = useState(load);

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

          <button
            onClick={() => setShowStatement(true)}
            className="mt-2 w-full rounded-xl py-2 text-center text-sm font-semibold text-moss hover:underline"
          >
            הצהרת נגישות
          </button>
        </div>
      )}

      <AccessibilityStatementModal open={showStatement} onClose={() => setShowStatement(false)} />
    </div>
  );
}
