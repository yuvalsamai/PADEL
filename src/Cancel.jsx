import React, { useState } from 'react';
import { LegalLayout, Section } from './legal/LegalLayout.jsx';
import { BUSINESS } from './lib/business.js';

/* Online cancellation channel (/cancel). Israeli law requires that a sale made
   through a website can also be cancelled through it, via a prominent link. */

const inputCls =
  'w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-ink placeholder-ink/60 outline-none focus:border-ink focus:ring-2 focus:ring-ink/20';

export default function Cancel() {
  const b = BUSINESS;
  const [form, setForm] = useState({ name: '', phone: '', email: '', order: '', reason: '' });
  const [state, setState] = useState({ status: 'idle', ref: '', error: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.phone.trim() && !form.email.trim()) {
      setState({ status: 'error', ref: '', error: 'נא למלא טלפון או דוא״ל כדי שנוכל לחזור אליכם.' });
      return;
    }
    setState({ status: 'sending', ref: '', error: '' });
    try {
      const r = await fetch('/api/cancel-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json().catch(() => ({}));
      if (d.ok) setState({ status: 'done', ref: d.ref, error: '' });
      else throw new Error();
    } catch {
      setState({
        status: 'error',
        ref: '',
        error: `לא הצלחנו לשלוח את הבקשה. אפשר לשלוח אותה בדוא״ל ל-${b.email}${b.phone ? ` או בטלפון ${b.phone}` : ''}.`,
      });
    }
  };

  return (
    <LegalLayout title="ביטול עסקה">
      <Section h="זכות הביטול בקצרה">
        <p>
          ניתן לבטל את העסקה עד 14 ימים מיום קבלת המוצר (אזרחים ותיקים, אנשים עם מוגבלות ועולים חדשים — עד 4
          חודשים, בתנאים הקבועים בחוק). ההחזר יבוצע תוך 14 ימים לכרטיס האשראי, בניכוי דמי ביטול של 5% או 100 ₪,
          הנמוך מביניהם — ובלי דמי ביטול כשמדובר במוצר פגום או שאינו תואם להזמנה. הפרטים המלאים ב
          <a href="/terms#cancel" className="underline underline-offset-4">תקנון</a>.
        </p>
      </Section>

      {state.status === 'done' ? (
        <div role="status" className="rounded-2xl bg-chalk p-6 ring-1 ring-ink/10">
          <h2 className="font-display text-xl font-bold text-ink">בקשת הביטול התקבלה</h2>
          <p className="mt-2 text-ink/80">
            מספר הפנייה שלך: <b dir="ltr">{state.ref}</b>. שמרו אותו. נחזור אליכם בהקדם לתיאום החזרת המוצר וההחזר
            הכספי.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate={false} className="space-y-4 rounded-2xl bg-chalk p-6 ring-1 ring-ink/10" aria-describedby="cancel-note">
          <h2 className="font-display text-xl font-bold text-ink">טופס ביטול עסקה</h2>
          <p id="cancel-note" className="text-sm text-ink/70">שדות המסומנים ב-* הם חובה. יש למלא טלפון או דוא״ל.</p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">שם מלא *</span>
            <input required autoComplete="name" value={form.name} onChange={set('name')} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">טלפון</span>
            <input type="tel" dir="ltr" autoComplete="tel" value={form.phone} onChange={set('phone')} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">דוא״ל</span>
            <input type="email" dir="ltr" autoComplete="email" value={form.email} onChange={set('email')} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">מספר הזמנה (אם ידוע)</span>
            <input value={form.order} onChange={set('order')} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">סיבת הביטול (לא חובה)</span>
            <textarea rows={3} value={form.reason} onChange={set('reason')} className={inputCls} />
          </label>
          {state.status === 'error' && (
            <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={state.status === 'sending'}
            className="w-full rounded-full bg-ink py-3.5 font-semibold text-bone hover:bg-court disabled:opacity-60"
          >
            {state.status === 'sending' ? 'שולח…' : 'שליחת בקשת ביטול'}
          </button>
        </form>
      )}

      <Section h="דרכים נוספות לביטול">
        <p>
          דוא״ל: <a href={`mailto:${b.email}`} dir="ltr" className="underline">{b.email}</a>
          {b.phone ? <> · טלפון: <a href={`tel:${b.phone}`} dir="ltr" className="underline">{b.phone}</a></> : null}
          {b.address ? <> · בדואר לכתובת: {b.address}</> : null}
        </p>
      </Section>
    </LegalLayout>
  );
}
