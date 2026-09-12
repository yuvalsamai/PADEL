import React, { useState } from 'react';
import { track } from './lib/analytics.js';

/* Collects the customer details we want on record (full name, phone, email,
   full shipping address + postal code) and forwards them to the backend, which
   signs a Hyp Pay page. Credit-card details are entered only on Hyp's secure
   page (the iframe) — they never touch our servers. */

const FIELDS = [
  { key: 'fullName', label: 'שם מלא', type: 'text', autoComplete: 'name', placeholder: 'ישראל ישראלי' },
  { key: 'cell', label: 'טלפון', type: 'tel', autoComplete: 'tel', placeholder: '050-0000000' },
  { key: 'email', label: 'אימייל', type: 'email', autoComplete: 'email', placeholder: 'you@example.com' },
  { key: 'street', label: 'רחוב ומספר בית', type: 'text', autoComplete: 'street-address', placeholder: 'הרצל 25, דירה 4' },
  { key: 'city', label: 'עיר', type: 'text', autoComplete: 'address-level2', placeholder: 'תל אביב' },
  { key: 'zip', label: 'מיקוד', type: 'text', autoComplete: 'postal-code', inputMode: 'numeric', placeholder: '6100000' },
];

// Amount override for testing, e.g. /pay?amount=7&token=SECRET — falls back to
// ₪89. The server only honors a non-default amount when the token matches its
// secret TEST_AMOUNT_TOKEN, so a plain /pay?amount=7 (no token) is ignored both
// here and server-side and the buyer is charged the real price.
function getCheckout() {
  const q = new URLSearchParams(window.location.search);
  const token = q.get('token') || '';
  const raw = q.get('amount');
  const n = Number(raw);
  const amount = token && raw && Number.isFinite(n) && n > 0 ? String(n) : '89';
  return { amount, token };
}

export default function PayPage() {
  const [form, setForm] = useState({ fullName: '', cell: '', email: '', street: '', city: '', zip: '' });
  const [{ amount, token }] = useState(getCheckout);
  const [qty, setQty] = useState(1);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const unit = Number(amount) || 0;
  const total = unit * qty;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    track('begin_checkout'); // funnel step: submitted details, heading to Hyp

    // Split the full name into first / last for Hyp's ClientName / ClientLName.
    const trimmed = form.fullName.trim();
    const firstSpace = trimmed.indexOf(' ');
    const clientName = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace);
    const clientLName = firstSpace === -1 ? '' : trimmed.slice(firstSpace + 1).trim();

    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          quantity: qty,
          testToken: token,
          clientName,
          clientLName,
          cell: form.cell.trim(),
          email: form.email.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          zip: form.zip.trim(),
        }),
      });
      const d = await res.json();
      if (d.url) setUrl(d.url);
      else setError(d.error || 'לא ניתן ליצור דף תשלום כרגע');
    } catch {
      setError('שגיאת רשת ביצירת דף התשלום');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-bone">
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

      {url ? (
        <iframe
          src={url}
          title="תשלום מאובטח - CourtCheck"
          className="w-full flex-1 border-0 bg-white"
          allow="payment"
        />
      ) : (
        <div dir="rtl" className="flex flex-1 items-start justify-center overflow-y-auto px-5 py-8">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-chalk p-6 shadow-lg ring-1 ring-ink/5 sm:p-8">
            <h1 className="font-display text-3xl font-black text-ink">פרטי ההזמנה</h1>
            <p className="mt-2 text-sm text-ink/60">
              מלאו את הפרטים ותועברו לדף תשלום מאובטח להזנת פרטי האשראי.
            </p>

            <div className="mt-7 space-y-4">
              {FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink/80">{f.label}</span>
                  <input
                    type={f.type}
                    required
                    inputMode={f.inputMode}
                    value={form[f.key]}
                    onChange={update(f.key)}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink placeholder-ink/30 outline-none transition-colors focus:border-moss focus:ring-2 focus:ring-moss/20"
                  />
                </label>
              ))}
            </div>

            {/* Quantity + total */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3">
              <span className="text-sm font-semibold text-ink/80">כמות</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="הפחת כמות"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/5 text-lg font-bold text-ink hover:bg-ink/10"
                >
                  −
                </button>
                <span className="w-6 text-center text-lg font-bold text-ink">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  aria-label="הוסף כמות"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/5 text-lg font-bold text-ink hover:bg-ink/10"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between px-1 text-sm">
              <span className="text-ink/60">סה״כ לתשלום</span>
              <span className="font-display text-xl font-black text-ink">₪{total}</span>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-ink py-3.5 font-semibold text-bone transition-colors hover:bg-court disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'מעבר לתשלום…' : `המשך לתשלום מאובטח · ₪${total}`}
            </button>

            {/* Trust badges */}
            <div className="mt-5 flex items-center justify-center gap-6 text-center text-xs font-medium text-ink/60">
              <span>🔒 תשלום מאובטח · Hyp</span>
              <span>🚚 משלוח חינם</span>
            </div>

            <p className="mt-4 text-center text-xs text-ink/50">
              פרטי האשראי מוזנים בדף מאובטח של Hyp ואינם נשמרים אצלנו.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
