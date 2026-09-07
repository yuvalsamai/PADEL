import React, { useEffect, useMemo, useState } from 'react';
import { supabase, supabaseEnabled } from '../lib/supabase.js';

/* ================================================================== */
/*  Small UI helpers                                                  */
/* ================================================================== */

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-bone/70">{label}</span>
    <input
      {...props}
      className="w-full rounded-xl border border-white/10 bg-pine px-4 py-3 text-bone outline-none ring-ball/40 transition focus:ring-2"
    />
  </label>
);

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl bg-pine p-5 ring-1 ring-white/10">
    <div className="text-sm text-bone/60">{label}</div>
    <div className="mt-1 font-display text-3xl font-black text-bone">{value}</div>
  </div>
);

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('he-IL');
};

const statusStyles = {
  pending: 'bg-amber-400/15 text-amber-300',
  paid: 'bg-ball/15 text-ball',
  shipped: 'bg-sky-400/15 text-sky-300',
  delivered: 'bg-emerald-400/15 text-emerald-300',
  cancelled: 'bg-rose-400/15 text-rose-300',
};

const Badge = ({ value }) => (
  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[value] || 'bg-white/10 text-bone/70'}`}>
    {value || '—'}
  </span>
);

/* ================================================================== */
/*  Login                                                             */
/* ================================================================== */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr('פרטי התחברות שגויים');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-court p-8 ring-1 ring-white/10">
        <h1 className="font-display text-2xl font-black text-bone">כניסת מנהל</h1>
        <p className="mt-1 text-sm text-bone/60">COURTCHECK · אזור מאובטח</p>

        <div className="mt-6 space-y-4">
          <Field
            label="שם משתמש (אימייל)"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
          />
          <Field
            label="סיסמה"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
          />
        </div>

        {err && <p className="mt-4 text-sm text-rose-400">{err}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-ball py-3 font-semibold text-ink transition hover:bg-white disabled:opacity-60"
        >
          {busy ? 'מתחבר…' : 'התחברות'}
        </button>
      </form>
    </div>
  );
};

/* ================================================================== */
/*  Data table                                                        */
/* ================================================================== */

const Table = ({ columns, rows }) => (
  <div className="overflow-x-auto rounded-2xl ring-1 ring-white/10">
    <table className="w-full min-w-[640px] text-right text-sm">
      <thead className="bg-pine text-bone/60">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="whitespace-nowrap px-4 py-3 font-medium">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-10 text-center text-bone/50">אין נתונים להצגה</td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} className="text-bone/90">
              {columns.map((c) => (
                <td key={c.key} className="whitespace-nowrap px-4 py-3">
                  {c.render ? c.render(row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

/* ================================================================== */
/*  Dashboard                                                         */
/* ================================================================== */

const TABS = [
  { key: 'orders', label: 'הזמנות' },
  { key: 'shipments', label: 'משלוחים' },
  { key: 'customers', label: 'לקוחות' },
];

const Dashboard = ({ session }) => {
  const [tab, setTab] = useState('orders');
  const [data, setData] = useState({ orders: [], shipments: [], customers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const [orders, shipments, customers] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('shipments').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
    ]);
    const firstErr = orders.error || shipments.error || customers.error;
    if (firstErr) setError(firstErr.message);
    setData({
      orders: orders.data || [],
      shipments: shipments.data || [],
      customers: customers.data || [],
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () => ({
      orders: [
        { key: 'id', label: 'מס׳' },
        { key: 'customer_name', label: 'לקוח' },
        { key: 'product', label: 'מוצר' },
        { key: 'quantity', label: 'כמות' },
        { key: 'amount', label: 'סכום', render: (r) => (r.amount != null ? `₪${r.amount}` : '—') },
        { key: 'status', label: 'סטטוס', render: (r) => <Badge value={r.status} /> },
        { key: 'created_at', label: 'נוצר', render: (r) => fmtDate(r.created_at) },
      ],
      shipments: [
        { key: 'id', label: 'מס׳' },
        { key: 'order_id', label: 'הזמנה' },
        { key: 'courier', label: 'שליח' },
        { key: 'tracking_number', label: 'מעקב', render: (r) => r.tracking_number || '—' },
        { key: 'address', label: 'כתובת' },
        { key: 'status', label: 'סטטוס', render: (r) => <Badge value={r.status} /> },
        { key: 'created_at', label: 'נוצר', render: (r) => fmtDate(r.created_at) },
      ],
      customers: [
        { key: 'id', label: 'מס׳' },
        { key: 'name', label: 'שם' },
        { key: 'email', label: 'אימייל' },
        { key: 'phone', label: 'טלפון' },
        { key: 'created_at', label: 'הצטרף', render: (r) => fmtDate(r.created_at) },
      ],
    }),
    [],
  );

  const totalRevenue = data.orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((s, o) => s + (Number(o.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-ink text-bone">
      <header className="border-b border-white/10 bg-court">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img src="/LOGO-removebg-preview.png" alt="CourtCheck" className="h-8 w-auto" />
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-bone/70">אדמין</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-bone/60 sm:inline" dir="ltr">{session.user?.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              יציאה
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="הזמנות" value={data.orders.length} />
          <StatCard label="משלוחים פעילים" value={data.shipments.filter((s) => s.status !== 'delivered' && s.status !== 'cancelled').length} />
          <StatCard label="לקוחות" value={data.customers.length} />
          <StatCard label="הכנסות" value={`₪${totalRevenue.toLocaleString('he-IL')}`} />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-1 rounded-full bg-pine p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  tab === t.key ? 'bg-ball text-ink' : 'text-bone/70 hover:text-bone'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={load} className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
            רענון
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            שגיאה בטעינת נתונים: {error}
          </p>
        )}

        <div className="mt-4">
          {loading ? (
            <p className="py-10 text-center text-bone/50">טוען…</p>
          ) : (
            <Table columns={columns[tab]} rows={data[tab]} />
          )}
        </div>
      </main>
    </div>
  );
};

/* ================================================================== */
/*  Root                                                              */
/* ================================================================== */

export default function Admin() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabaseEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-5 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-black text-bone">האדמין לא מוגדר</h1>
          <p className="mt-3 text-bone/70">
            חסרים משתני הסביבה <code className="text-ball">VITE_SUPABASE_URL</code> ו-
            <code className="text-ball">VITE_SUPABASE_ANON_KEY</code>. ראו הוראות ב-README.
          </p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-ink text-bone/50">טוען…</div>;
  }

  return session ? <Dashboard session={session} /> : <Login />;
}
