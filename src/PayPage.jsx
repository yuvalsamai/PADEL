import React, { useState } from 'react';

/* Collects the customer details we want on record (full name, phone, email,
   address) and forwards them to the backend, which signs a Hyp Pay page.
   Credit-card details are entered only on Hyp's secure page (the iframe) —
   they never touch our servers. */

const FIELDS = [
  { key: 'fullName', label: 'שם מלא', type: 'text', autoComplete: 'name', placeholder: 'ישראל ישראלי' },
  { key: 'cell', label: 'טלפון', type: 'tel', autoComplete: 'tel', placeholder: '050-0000000' },
  { key: 'email', label: 'אימייל', type: 'email', autoComplete: 'email', placeholder: 'you@example.com' },
  { key: 'street', label: 'כתובת למשלוח', type: 'text', autoComplete: 'street-address', placeholder: 'רחוב, מספר, עיר' },
];

// Optional amount override for testing, e.g. /pay?amount=7 — falls back to ₪89.
// Guards against junk/negative values so it can't be abused into a zero charge.
function getAmount() {
  const raw = new URLSearchParams(window.location.search).get('amount');
  const n = Number(raw);
  return raw && Number.isFinite(n) && n > 0 ? String(n) : '89';
}

export default function PayPage() {
  const [form, setForm] = useState({ fullName: '', cell: '', email: '', street: '' });
  const [amount] = useState(getAmount);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
          clientName,
          clientLName,
          cell: form.cell.trim(),
          email: form.email.trim(),
          street: form.street.trim(),
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

      {url ? (
        <iframe
          src={url}
          title="תשלום מאובטח - CourtCheck"
          className="w-full flex-1 border-0 bg-white"
          allow="payment"
        />
      ) : (
        <div dir="rtl" className="flex flex-1 items-start justify-center overflow-y-auto px-5 py-8">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <h1 className="font-display text-3xl font-black text-bone">פרטי ההזמנה</h1>
            <p className="mt-2 text-sm text-bone/70">
              מלאו את הפרטים ותועברו לדף תשלום מאובטח להזנת פרטי האשראי.
            </p>

            <div className="mt-7 space-y-4">
              {FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1.5 block text-sm font-medium text-bone/90">{f.label}</span>
                  <input
                    type={f.type}
                    required
                    value={form[f.key]}
                    onChange={update(f.key)}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-bone placeholder-bone/30 outline-none transition-colors focus:border-ball focus:bg-white/10"
                  />
                </label>
              ))}
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-ball py-3.5 font-semibold text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'מעבר לתשלום…' : `המשך לתשלום מאובטח ₪${amount}`}
            </button>

            <p className="mt-4 text-center text-xs text-bone/50">
              🔒 פרטי האשראי מוזנים בדף מאובטח של Hyp ואינם נשמרים אצלנו.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
