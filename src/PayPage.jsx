import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { hasPlacesKey, loadPlaces, parseAddress } from './lib/googlePlaces';

const emptyForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  street: '',
  apartment: '',
  city: '',
  zip: '',
};

const inputCls =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-bone placeholder:text-bone/35 outline-none transition focus:border-ball focus:bg-white/10';

const Field = ({ label, className = '', ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-sm font-medium text-bone/70">{label}</span>
    <input className={inputCls} {...props} />
  </label>
);

/* Street input with Google Places (New) suggestions. Picking a suggestion fills
   street, city and zip; typing freely still works if Google is unavailable. */
const AddressAutocomplete = ({ value, onChange, onPick }) => {
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
        const { suggestions: res } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
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
    <div className="relative sm:col-span-2">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-bone/70">
          רחוב ומספר בית{places ? ' — התחילו להקליד ונשלים את השאר' : ''}
        </span>
        <div className="relative">
          <MapPin size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-bone/40" />
          <input
            className={`${inputCls} pr-11`}
            value={value}
            required
            autoComplete={places ? 'off' : 'street-address'}
            placeholder="לדוגמה: הרצל 12, תל אביב"
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKeyDown}
          />
        </div>
      </label>

      {open && suggestions.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-white/15 bg-pine shadow-2xl">
          {suggestions.map((s, i) => {
            const p = s.placePrediction;
            return (
              <li key={p.placeId}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(s)}
                  className={`flex w-full flex-col items-start px-4 py-2.5 text-right transition ${
                    i === active ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-bone">{p.mainText?.text || p.text.text}</span>
                  {p.secondaryText?.text && (
                    <span className="text-xs text-bone/50">{p.secondaryText.text}</span>
                  )}
                </button>
              </li>
            );
          })}
          <li className="px-4 py-1.5 text-left text-[10px] text-bone/30">powered by Google</li>
        </ul>
      )}
    </div>
  );
};

const DetailsForm = ({ onSubmit, submitting, error }) => {
  const [form, setForm] = useState(emptyForm);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const bind = (k) => ({ value: form[k], onChange: (e) => set(k)(e.target.value) });

  return (
    <form
      dir="rtl"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="mx-auto w-full max-w-xl px-5 py-10"
    >
      <h1 className="font-display text-3xl font-black tracking-tight text-bone sm:text-4xl">פרטי משלוח</h1>
      <p className="mt-2 text-bone/60">ממלאים פרטים, ובשלב הבא עוברים לתשלום מאובטח.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="שם פרטי" required autoComplete="given-name" {...bind('firstName')} />
        <Field label="שם משפחה" required autoComplete="family-name" {...bind('lastName')} />
        <Field
          label="טלפון נייד"
          required
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          pattern="0[0-9\-\s]{8,11}"
          title="מספר טלפון ישראלי, לדוגמה 0501234567"
          {...bind('phone')}
        />
        <Field label="אימייל" required type="email" dir="ltr" autoComplete="email" {...bind('email')} />

        <AddressAutocomplete
          value={form.street}
          onChange={set('street')}
          onPick={(a) =>
            setForm((f) => ({
              ...f,
              street: a.street || f.street,
              city: a.city || f.city,
              zip: a.zip || f.zip,
            }))
          }
        />

        <Field label="עיר" required autoComplete="address-level2" {...bind('city')} />
        <Field label="מיקוד" inputMode="numeric" dir="ltr" autoComplete="postal-code" {...bind('zip')} />
        <Field
          label="דירה / קומה / כניסה (לא חובה)"
          className="sm:col-span-2"
          {...bind('apartment')}
        />
      </div>

      {error && <p className="mt-5 text-sm text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full rounded-full bg-ball py-4 text-lg font-bold text-ink transition hover:bg-white disabled:opacity-60"
      >
        {submitting ? 'מכין דף תשלום…' : 'המשך לתשלום · ₪89'}
      </button>
    </form>
  );
};

export default function PayPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const startPayment = async (f) => {
    setSubmitting(true);
    setError('');
    const address = [f.street, f.apartment && `דירה/קומה ${f.apartment}`, f.city, f.zip]
      .filter(Boolean)
      .join(', ');
    try {
      const r = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: f.firstName,
          clientLName: f.lastName,
          email: f.email,
          cell: f.phone.replace(/[\s-]/g, ''),
          street: [f.street, f.apartment].filter(Boolean).join(' '),
          city: f.city,
          zip: f.zip,
          address,
        }),
      });
      const d = await r.json();
      if (d.url) setUrl(d.url);
      else setError(d.error || 'לא ניתן ליצור דף תשלום כרגע');
    } catch {
      setError('שגיאת רשת ביצירת דף התשלום');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink">
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
          style={{ minHeight: 'calc(100vh - 61px)' }}
          allow="payment"
        />
      ) : (
        <DetailsForm onSubmit={startPayment} submitting={submitting} error={error} />
      )}
    </div>
  );
}
