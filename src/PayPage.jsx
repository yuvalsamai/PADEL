import React, { useEffect, useRef, useState } from 'react';
import { track } from './lib/analytics.js';
import { hasPlacesKey, loadPlaces, parseAddress } from './lib/googlePlaces.js';

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

const INPUT_CLS =
  'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink placeholder-ink/30 outline-none transition-colors focus:border-moss focus:ring-2 focus:ring-moss/20';

/* Street field with Google Places (New) suggestions. Picking one fills street,
   city and zip; without a key / if Google fails it is a plain input. */
function StreetInput({ field, value, onChange, onPick }) {
  const [places, setPlaces] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const tokenRef = useRef(null);
  const reqRef = useRef(0);

  useEffect(() => {
    if (!hasPlacesKey()) return;
    loadPlaces()
      .then((lib) => {
        tokenRef.current = new lib.AutocompleteSessionToken();
        setPlaces(lib);
      })
      .catch(() => {});
  }, []);

  // Debounced suggestion fetch.
  useEffect(() => {
    if (!places || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const id = ++reqRef.current;
    const t = setTimeout(async () => {
      try {
        const { suggestions: res } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value,
          sessionToken: tokenRef.current,
          includedRegionCodes: ['il'],
          language: 'he',
          region: 'il',
        });
        if (id === reqRef.current) setSuggestions(res.filter((s) => s.placePrediction));
      } catch {
        if (id === reqRef.current) setSuggestions([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [value, places]);

  const pick = async (s) => {
    setOpen(false);
    setSuggestions([]);
    const pred = s.placePrediction;
    onChange(pred.mainText?.text || pred.text.text);
    try {
      const place = pred.toPlace();
      await place.fetchFields({ fields: ['addressComponents'] });
      onPick(parseAddress(place));
    } catch {
      /* keep what the user typed */
    }
    // A session ends once a place is fetched — start a fresh one.
    tokenRef.current = new places.AutocompleteSessionToken();
  };

  const onKeyDown = (e) => {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      pick(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink/80">
          {field.label}
          {places && <span className="font-normal text-ink/50"> · התחילו להקליד ונשלים עיר ומיקוד</span>}
        </span>
        <input
          type="text"
          required
          value={value}
          autoComplete={places ? 'off' : field.autoComplete}
          placeholder={field.placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          className={INPUT_CLS}
        />
      </label>

      {open && suggestions.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl">
          {suggestions.map((s, i) => {
            const p = s.placePrediction;
            return (
              <li key={p.placeId}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(s)}
                  className={`flex w-full flex-col items-start px-4 py-2.5 text-right transition-colors ${
                    i === active ? 'bg-ink/5' : 'hover:bg-ink/5'
                  }`}
                >
                  <span className="text-ink">{p.mainText?.text || p.text.text}</span>
                  {p.secondaryText?.text && <span className="text-xs text-ink/50">{p.secondaryText.text}</span>}
                </button>
              </li>
            );
          })}
          <li className="px-4 py-1.5 text-left text-[10px] text-ink/30">powered by Google</li>
        </ul>
      )}
    </div>
  );
}

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
  // Quantity discount: 1→0%, then 2×qty+1 (2→5%, 3→7% … 10→21%).
  const discountPct = qty < 2 ? 0 : 2 * qty + 1;
  const fullTotal = unit * qty;
  const total = Math.round(fullTotal * (1 - discountPct / 100));

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
              {FIELDS.map((f) =>
                f.key === 'street' ? (
                  <StreetInput
                    key={f.key}
                    field={f}
                    value={form.street}
                    onChange={(v) => setForm((prev) => ({ ...prev, street: v }))}
                    onPick={(a) =>
                      setForm((prev) => ({
                        ...prev,
                        street: a.street || prev.street,
                        city: a.city || prev.city,
                        zip: a.zip || prev.zip,
                      }))
                    }
                  />
                ) : (
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
                    className={INPUT_CLS}
                  />
                </label>
                ),
              )}
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

            {discountPct > 0 ? (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-moss/10 px-4 py-2 text-sm font-semibold text-moss">
                <span>🎉 הנחת כמות</span>
                <span>-{discountPct}%</span>
              </div>
            ) : (
              <p className="mt-2 px-1 text-xs text-ink/50">קנו יותר וחסכו — עד 21% הנחה על 10 יחידות</p>
            )}

            <div className="mt-2 flex items-center justify-between px-1 text-sm">
              <span className="text-ink/60">סה״כ לתשלום</span>
              <span className="flex items-baseline gap-2">
                {discountPct > 0 && <span className="text-sm text-ink/40 line-through">₪{fullTotal}</span>}
                <span className="font-display text-xl font-black text-ink">₪{total}</span>
              </span>
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
