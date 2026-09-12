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

// Lock the login form after too many wrong attempts. This is a client-side
// deterrent (Supabase also rate-limits auth server-side); state is kept in
// localStorage so a refresh can't reset the counter.
const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 15;
const FAILS_KEY = 'cc_admin_fails';
const LOCK_KEY = 'cc_admin_lock_until';

const readNum = (k) => {
  try { return Number(localStorage.getItem(k)) || 0; } catch { return 0; }
};
const writeNum = (k, v) => {
  try { localStorage.setItem(k, String(v)); } catch { /* ignore */ }
};
const clearLock = () => {
  try { localStorage.removeItem(FAILS_KEY); localStorage.removeItem(LOCK_KEY); } catch { /* ignore */ }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [lockUntil, setLockUntil] = useState(() => readNum(LOCK_KEY));
  const [now, setNow] = useState(Date.now());

  const locked = lockUntil > now;

  // Tick every second while locked so the countdown updates and unlocks itself.
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [locked]);

  const remaining = Math.max(0, Math.ceil((lockUntil - now) / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const submit = async (e) => {
    e.preventDefault();
    if (locked) return;
    setErr('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (error) {
      const fails = readNum(FAILS_KEY) + 1;
      writeNum(FAILS_KEY, fails);
      if (fails >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCK_MINUTES * 60 * 1000;
        writeNum(LOCK_KEY, until);
        setLockUntil(until);
        setNow(Date.now());
        setErr(`יותר מדי ניסיונות. הכניסה נחסמה ל-${LOCK_MINUTES} דקות.`);
      } else {
        setErr(`פרטי התחברות שגויים · נותרו ${MAX_ATTEMPTS - fails} ניסיונות`);
      }
      return;
    }

    // Success — reset the counter.
    clearLock();
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
            disabled={locked}
            dir="ltr"
          />
          <Field
            label="סיסמה"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={locked}
            dir="ltr"
          />
        </div>

        {err && <p className="mt-4 text-sm text-rose-400">{err}</p>}

        {locked && (
          <p className="mt-4 rounded-xl bg-rose-400/10 px-4 py-3 text-center text-sm text-rose-300">
            הכניסה נחסמה עקב ניסיונות כושלים. נסה שוב בעוד <span dir="ltr">{mm}:{ss}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={busy || locked}
          className="mt-6 w-full rounded-xl bg-ball py-3 font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locked ? 'חסום זמנית' : busy ? 'מתחבר…' : 'התחברות'}
        </button>
      </form>
    </div>
  );
};

/* ================================================================== */
/*  Data table                                                        */
/* ================================================================== */

const Table = ({ columns, rows, onEdit, onDelete }) => {
  const hasActions = onEdit || onDelete;
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-white/10">
      <table className="w-full min-w-[640px] text-right text-sm">
        <thead className="bg-pine text-bone/60">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-4 py-3 font-medium">{c.label}</th>
            ))}
            {hasActions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-4 py-10 text-center text-bone/50">אין נתונים להצגה</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="text-bone/90">
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3">
                    {c.render ? c.render(row) : (row[c.key] ?? '—')}
                  </td>
                ))}
                {hasActions && (
                  <td className="whitespace-nowrap px-4 py-3 text-left">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="rounded-lg px-2 py-1 text-xs text-bone/70 hover:bg-white/10 hover:text-bone"
                        >
                          עריכה
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="rounded-lg px-2 py-1 text-xs text-rose-400 hover:bg-rose-400/10"
                        >
                          מחיקה
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ================================================================== */
/*  Add-record modal                                                  */
/* ================================================================== */

const STATUS_OPTIONS = {
  orders: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
  shipments: ['pending', 'shipped', 'delivered', 'cancelled'],
};

const FORMS = {
  customers: [
    { key: 'name', label: 'שם', required: true },
    { key: 'email', label: 'אימייל', type: 'email' },
    { key: 'phone', label: 'טלפון', dir: 'ltr' },
  ],
  orders: [
    { key: 'customer_name', label: 'שם לקוח' },
    { key: 'quantity', label: 'כמות', type: 'number' },
    { key: 'amount', label: 'סכום (₪)', type: 'number' },
    { key: 'status', label: 'סטטוס', type: 'select', options: STATUS_OPTIONS.orders },
  ],
  shipments: [
    { key: 'order_id', label: 'מס׳ הזמנה', type: 'number' },
    { key: 'courier', label: 'שליח' },
    { key: 'tracking_number', label: 'מספר מעקב', dir: 'ltr' },
    { key: 'address', label: 'כתובת' },
    { key: 'status', label: 'סטטוס', type: 'select', options: STATUS_OPTIONS.shipments },
  ],
};

const RecordModal = ({ table, record, onClose, onSaved }) => {
  const fields = FORMS[table];
  const isEdit = Boolean(record);
  const [form, setForm] = useState(() => {
    if (!record) return {};
    const init = {};
    for (const f of fields) if (record[f.key] != null) init[f.key] = String(record[f.key]);
    return init;
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const setVal = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const payload = {};
    for (const f of fields) {
      let v = form[f.key];
      if (f.type === 'number') v = v === undefined || v === '' ? null : Number(v);
      else if (v === undefined || v === '') v = isEdit ? null : undefined;
      if (v !== undefined) payload[f.key] = v;
    }
    // Single-product store: stamp the product name automatically on new orders.
    if (table === 'orders' && !isEdit) payload.product = 'תושבת CourtCheck';
    const { error } = isEdit
      ? await supabase.from(table).update(payload).eq('id', record.id)
      : await supabase.from(table).insert(payload);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl bg-court p-7 ring-1 ring-white/10"
      >
        <h3 className="font-display text-xl font-black text-bone">{isEdit ? 'עריכת רשומה' : 'רשומה חדשה'}</h3>
        <div className="mt-5 space-y-4">
          {fields.map((f) =>
            f.type === 'select' ? (
              <label key={f.key} className="block">
                <span className="mb-1.5 block text-sm font-medium text-bone/70">{f.label}</span>
                <select
                  value={form[f.key] ?? f.options[0]}
                  onChange={(e) => setVal(f.key, e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-pine px-4 py-3 text-bone outline-none ring-ball/40 focus:ring-2"
                >
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>
            ) : (
              <Field
                key={f.key}
                label={f.label + (f.required ? ' *' : '')}
                type={f.type || 'text'}
                dir={f.dir}
                required={f.required}
                value={form[f.key] ?? ''}
                onChange={(e) => setVal(f.key, e.target.value)}
              />
            ),
          )}
        </div>

        {err && <p className="mt-4 text-sm text-rose-400">{err}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-xl bg-ball py-3 font-semibold text-ink transition hover:bg-white disabled:opacity-60"
          >
            {busy ? 'שומר…' : 'שמירה'}
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/15 px-5 py-3 text-bone hover:bg-white/10">
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================================================================== */
/*  Dashboard                                                         */
/* ================================================================== */

const TABS = [
  { key: 'orders', label: 'הזמנות' },
  { key: 'customers', label: 'לקוחות' },
  { key: 'analytics', label: 'אנליטיקס' },
];

/* ================================================================== */
/*  Orders + shipments (unified view)                                 */
/* ================================================================== */

// Payment status derives from the order status. Only paid/error are editable.
const PAY_LABEL = { pending: 'ממתין', paid: 'שולם', shipped: 'שולם', delivered: 'שולם', cancelled: 'שגיאה' };
const PAY_STYLE = { paid: 'bg-ball/15 text-ball', shipped: 'bg-ball/15 text-ball', delivered: 'bg-ball/15 text-ball', pending: 'bg-amber-400/15 text-amber-300', cancelled: 'bg-rose-400/15 text-rose-300' };
const PAY_OPTIONS = [{ v: 'paid', l: 'שולם' }, { v: 'cancelled', l: 'שגיאה' }];

// Shipment status uses the buyer-facing Hebrew labels over the existing enum.
const SHIP_LABEL = { pending: 'בהכנה למשלוח', shipped: 'נשלח', delivered: 'נמסר', cancelled: 'נאבד' };
const SHIP_OPTIONS = [
  { v: 'pending', l: 'בהכנה למשלוח' },
  { v: 'shipped', l: 'נשלח' },
  { v: 'delivered', l: 'נמסר' },
  { v: 'cancelled', l: 'נאבד' },
];

// Build a CSV string and trigger a download in the browser.
function downloadCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
  // Prepend a BOM so Excel opens Hebrew as UTF-8 correctly.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Normalize an Israeli phone to international format for the supplier.
function intlPhone(phone) {
  if (!phone) return '';
  let p = String(phone).replace(/[\s-]/g, '');
  if (p.startsWith('+')) return p;
  if (p.startsWith('0')) return '+972' + p.slice(1);
  if (p.startsWith('972')) return '+' + p;
  return p;
}

// Derive an Israeli district (in English) from the city, so the supplier's
// Region/State field is filled without asking the customer for a "מחוז".
const CITY_REGION = {
  'תל אביב': 'Tel Aviv', 'תל אביב-יפו': 'Tel Aviv', 'רמת גן': 'Tel Aviv', 'גבעתיים': 'Tel Aviv',
  'בני ברק': 'Tel Aviv', 'חולון': 'Tel Aviv', 'בת ים': 'Tel Aviv', 'הרצליה': 'Tel Aviv',
  'ירושלים': 'Jerusalem', 'בית שמש': 'Jerusalem', 'מעלה אדומים': 'Jerusalem',
  'חיפה': 'Haifa', 'קריית אתא': 'Haifa', 'קריית ביאליק': 'Haifa', 'קריית מוצקין': 'Haifa', 'קריית ים': 'Haifa', 'טירת כרמל': 'Haifa', 'נשר': 'Haifa',
  'ראשון לציון': 'Center', 'פתח תקווה': 'Center', 'נתניה': 'Center', 'רחובות': 'Center', 'רעננה': 'Center',
  'כפר סבא': 'Center', 'הוד השרון': 'Center', 'רמלה': 'Center', 'לוד': 'Center', 'מודיעין': 'Center',
  'נס ציונה': 'Center', 'יבנה': 'Center', 'ראש העין': 'Center', 'קריית אונו': 'Center', 'אור יהודה': 'Center',
  'באר שבע': 'South', 'אשדוד': 'South', 'אשקלון': 'South', 'אילת': 'South', 'דימונה': 'South', 'קריית גת': 'South', 'נתיבות': 'South', 'שדרות': 'South', 'אופקים': 'South',
  'נצרת': 'North', 'עפולה': 'North', 'טבריה': 'North', 'כרמיאל': 'North', 'צפת': 'North', 'קריית שמונה': 'North', 'נהריה': 'North', 'עכו': 'North', 'מגדל העמק': 'North', 'בית שאן': 'North',
};

function regionForCity(city) {
  if (!city) return '';
  const key = String(city).trim();
  return CITY_REGION[key] || '';
}

// Accurate English names for common cities (Hebrew has no vowels, so a
// letter-by-letter transliteration of city names looks wrong — use a table).
const CITY_EN = {
  'תל אביב': 'Tel Aviv', 'תל אביב-יפו': 'Tel Aviv-Yafo', 'רמת גן': 'Ramat Gan', 'גבעתיים': 'Givatayim',
  'בני ברק': 'Bnei Brak', 'חולון': 'Holon', 'בת ים': 'Bat Yam', 'הרצליה': 'Herzliya',
  'ירושלים': 'Jerusalem', 'בית שמש': 'Beit Shemesh', 'מעלה אדומים': 'Maale Adumim',
  'חיפה': 'Haifa', 'קריית אתא': 'Kiryat Ata', 'קריית ביאליק': 'Kiryat Bialik', 'קריית מוצקין': 'Kiryat Motzkin',
  'קריית ים': 'Kiryat Yam', 'טירת כרמל': 'Tirat Carmel', 'נשר': 'Nesher',
  'ראשון לציון': 'Rishon LeZion', 'פתח תקווה': 'Petah Tikva', 'נתניה': 'Netanya', 'רחובות': 'Rehovot',
  'רעננה': 'Raanana', 'כפר סבא': 'Kfar Saba', 'הוד השרון': 'Hod HaSharon', 'רמלה': 'Ramla', 'לוד': 'Lod',
  'מודיעין': 'Modiin', 'נס ציונה': 'Ness Ziona', 'יבנה': 'Yavne', 'ראש העין': 'Rosh HaAyin',
  'קריית אונו': 'Kiryat Ono', 'אור יהודה': 'Or Yehuda',
  'באר שבע': 'Beer Sheva', 'אשדוד': 'Ashdod', 'אשקלון': 'Ashkelon', 'אילת': 'Eilat', 'דימונה': 'Dimona',
  'קריית גת': 'Kiryat Gat', 'נתיבות': 'Netivot', 'שדרות': 'Sderot', 'אופקים': 'Ofakim',
  'נצרת': 'Nazareth', 'עפולה': 'Afula', 'טבריה': 'Tiberias', 'כרמיאל': 'Karmiel', 'צפת': 'Safed',
  'קריית שמונה': 'Kiryat Shmona', 'נהריה': 'Nahariya', 'עכו': 'Acre', 'מגדל העמק': 'Migdal HaEmek', 'בית שאן': 'Beit Shean',
};

// Best-effort letter-by-letter Hebrew → Latin transliteration (for street/name).
const HE_MAP = {
  'א': '', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't',
  'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's',
  'ע': '', 'פ': 'p', 'ף': 'f', 'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
  'ן': 'n',
};

function heToLatin(str) {
  if (!str) return '';
  const s = String(str);
  // If there's no Hebrew, keep it as-is (already Latin).
  if (!/[֐-׿]/.test(s)) return s;
  let out = '';
  for (const ch of s) {
    if (HE_MAP[ch] !== undefined) out += HE_MAP[ch];
    else if (/[֑-ׇ]/.test(ch)) continue; // niqqud/marks
    else out += ch; // spaces, digits, punctuation
  }
  // Capitalize each word for a name/street look.
  return out.replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

const cityEn = (city) => (city && CITY_EN[String(city).trim()]) || heToLatin(city);

// English shipping block for the dropshipping supplier.
function supplierBlock({ order, shipment, phone, email }) {
  const s = shipment || {};
  const address = heToLatin(s.street || s.address || '');
  return [
    `Customer Name: ${heToLatin(order.customer_name || '')}`,
    'Country: Israel',
    `Address: ${address}`,
    `City: ${cityEn(s.city)}`,
    `Region / State: ${s.region || regionForCity(s.city)}`,
    `Post Code: ${s.zip || ''}`,
    `Phone Number: ${intlPhone(phone)}`,
    `E-mail: ${email || ''}`,
  ].join('\n');
}

const OrdersView = ({ orders, shipments, customers, onChanged, onDelete }) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // shipment status filter

  const allRows = useMemo(() => {
    // One shipment per order (latest wins if duplicates exist).
    const shipByOrder = new Map();
    for (const s of shipments) if (!shipByOrder.has(s.order_id)) shipByOrder.set(s.order_id, s);
    // Phone + email lookup by customer id (they live on the customer record).
    const phoneByCustomer = new Map();
    const emailByCustomer = new Map();
    for (const c of customers || []) {
      phoneByCustomer.set(c.id, c.phone || '');
      emailByCustomer.set(c.id, c.email || '');
    }

    // Chronological order number (oldest = 1), stable regardless of display order.
    const asc = [...orders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const seqById = new Map();
    asc.forEach((o, i) => seqById.set(o.id, i + 1));

    // Display newest first.
    return [...orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((o) => ({
        order: o,
        shipment: shipByOrder.get(o.id) || null,
        seq: seqById.get(o.id),
        phone: phoneByCustomer.get(o.customer_id) || '',
        email: emailByCustomer.get(o.customer_id) || '',
      }));
  }, [orders, shipments, customers]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return allRows.filter(({ order, shipment, phone }) => {
      // Text match by customer name or phone.
      if (q) {
        const nameHit = (order.customer_name || '').toLowerCase().includes(q);
        const phoneHit = qDigits && phone.replace(/\D/g, '').includes(qDigits);
        if (!nameHit && !phoneHit) return false;
      }
      // Shipment status filter.
      if (statusFilter !== 'all' && (shipment?.status || 'pending') !== statusFilter) return false;
      return true;
    });
  }, [allRows, query, statusFilter]);

  const exportCsv = () => {
    const headers = ['מס׳ הזמנה', 'שם לקוח', 'טלפון', 'כתובת', 'כמות', 'סכום', 'סטטוס תשלום', 'סטטוס משלוח', 'מספר מעקב', 'תאריך הזמנה'];
    const data = rows.map(({ order, shipment, seq, phone }) => [
      seq,
      order.customer_name || '',
      phone || '',
      shipment?.address || '',
      order.quantity ?? 1,
      order.amount ?? '',
      order.status === 'cancelled' ? 'שגיאה' : 'שולם',
      SHIP_LABEL[shipment?.status || 'pending'] || '',
      shipment?.tracking_number || '',
      fmtDate(order.created_at),
    ]);
    downloadCSV(`courtcheck-orders-${new Date().toISOString().slice(0, 10)}.csv`, headers, data);
  };

  const setPayment = async (order, value) => {
    const { error } = await supabase.from('orders').update({ status: value }).eq('id', order.id);
    if (!error) onChanged();
    else window.alert(error.message);
  };

  // Update (or create) the shipment row tied to an order.
  const setShipment = async (order, shipment, patch) => {
    let error;
    if (shipment) ({ error } = await supabase.from('shipments').update(patch).eq('id', shipment.id));
    else ({ error } = await supabase.from('shipments').insert({ order_id: order.id, status: 'pending', ...patch }));
    if (!error) onChanged();
    else window.alert(error.message);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש לפי שם או טלפון…"
          className="w-full max-w-xs rounded-xl border border-white/10 bg-pine px-4 py-2.5 text-sm text-bone placeholder-bone/40 outline-none focus:border-ball"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-pine px-3 py-2.5 text-sm text-bone outline-none focus:border-ball"
        >
          <option value="all" style={{ color: '#0D0D0D', background: '#fff' }}>כל סטטוסי המשלוח</option>
          {SHIP_OPTIONS.map((o) => (
            <option key={o.v} value={o.v} style={{ color: '#0D0D0D', background: '#fff' }}>{o.l}</option>
          ))}
        </select>
        <button
          onClick={exportCsv}
          className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-bone hover:bg-white/10"
        >
          ⭳ ייצוא CSV
        </button>
        <span className="text-xs text-bone/50">{rows.length} תוצאות</span>
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-white/10">
      <table className="w-full min-w-[900px] text-right text-sm">
        <thead className="bg-pine text-bone/60">
          <tr>
            {['מס׳ הזמנה', 'שם לקוח', 'כתובת', 'כמות', 'סכום', 'סטטוס תשלום', 'סטטוס משלוח', 'מספר מעקב', 'תאריך הזמנה'].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">{h}</th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.length === 0 ? (
            <tr><td colSpan={10} className="px-4 py-10 text-center text-bone/50">אין הזמנות להצגה</td></tr>
          ) : (
            rows.map(({ order, shipment, seq, phone, email }) => (
              <tr key={order.id} className="text-bone/90">
                <td className="whitespace-nowrap px-4 py-3 font-semibold">#{seq}</td>
                <td className="whitespace-nowrap px-4 py-3">{order.customer_name || '—'}</td>
                <td className="max-w-[220px] truncate px-4 py-3" title={shipment?.address || ''}>{shipment?.address || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3">{order.quantity ?? 1}</td>
                <td className="whitespace-nowrap px-4 py-3">{order.amount != null ? `₪${order.amount}` : '—'}</td>

                {/* Payment status — green = שולם, red = שגיאה (by selected value) */}
                <td className="whitespace-nowrap px-4 py-3">
                  {(() => {
                    const payVal = order.status === 'cancelled' ? 'cancelled' : 'paid';
                    const cls = payVal === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                    return (
                      <select
                        value={payVal}
                        onChange={(e) => setPayment(order, e.target.value)}
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none ${cls}`}
                      >
                        {PAY_OPTIONS.map((o) => (
                          <option key={o.v} value={o.v} style={{ color: '#0D0D0D', background: '#fff' }}>{o.l}</option>
                        ))}
                      </select>
                    );
                  })()}
                </td>

                {/* Shipment status */}
                <td className="whitespace-nowrap px-4 py-3">
                  <select
                    value={shipment?.status || 'pending'}
                    onChange={(e) => setShipment(order, shipment, { status: e.target.value })}
                    className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-xs font-semibold text-bone outline-none"
                  >
                    {SHIP_OPTIONS.map((o) => (
                      <option key={o.v} value={o.v} style={{ color: '#0D0D0D', background: '#fff' }}>{o.l}</option>
                    ))}
                  </select>
                </td>

                {/* Tracking number (editable; links to 17track when set) */}
                <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                  <div className="flex items-center gap-2">
                    <input
                      defaultValue={shipment?.tracking_number || ''}
                      placeholder="—"
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v !== (shipment?.tracking_number || '')) setShipment(order, shipment, { tracking_number: v || null });
                      }}
                      className="w-32 rounded-lg border border-white/10 bg-pine px-2 py-1 text-xs text-bone outline-none focus:border-ball"
                    />
                    {shipment?.tracking_number && (
                      <a
                        href={`https://www.17track.net/en/track?nums=${encodeURIComponent(shipment.tracking_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ball hover:text-white"
                        title="עקוב ב-17track"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-bone/70">{fmtDate(order.created_at)}</td>

                <td className="whitespace-nowrap px-4 py-3 text-left">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={async () => {
                        const text = supplierBlock({ order, shipment, phone, email });
                        try {
                          await navigator.clipboard.writeText(text);
                          window.alert('הפרטים הועתקו — הדבק לספק בוואטסאפ.');
                        } catch {
                          window.prompt('העתק את הפרטים לספק:', text);
                        }
                      }}
                      className="rounded-lg px-2 py-1 text-xs text-ball hover:bg-white/10"
                      title="העתק פרטים לספק (אנגלית)"
                    >
                      📋 ספק
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(supplierBlock({ order, shipment, phone, email }))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg px-2 py-1 text-xs text-emerald-300 hover:bg-white/10"
                      title="שלח לספק בוואטסאפ"
                    >
                      וואטסאפ
                    </a>
                    <button
                      onClick={() => onDelete(order)}
                      className="rounded-lg px-2 py-1 text-xs text-rose-400 hover:bg-rose-400/10"
                    >
                      מחיקה
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

/* ================================================================== */
/*  Analytics (first-party tracking)                                  */
/* ================================================================== */

// A labelled horizontal bar, width proportional to its share of `max`.
const BarRow = ({ label, value, max }) => (
  <div className="flex items-center gap-3">
    <span className="w-32 flex-shrink-0 truncate text-sm text-bone/70" title={label}>{label}</span>
    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-ball" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
    <span className="w-10 flex-shrink-0 text-left text-sm font-semibold text-bone">{value}</span>
  </div>
);

const Panel = ({ title, children }) => (
  <div className="rounded-2xl border border-white/10 bg-pine/40 p-5">
    <h3 className="mb-4 font-display text-lg font-bold text-bone">{title}</h3>
    {children}
  </div>
);

const RANGES = [
  { key: '1', label: 'היום' },
  { key: '7', label: '7 ימים' },
  { key: '30', label: '30 ימים' },
  { key: 'all', label: 'הכל' },
];

const Analytics = ({ events, orders, onReset }) => {
  const [range, setRange] = useState('30');

  const { events: fEvents, orders: fOrders } = useMemo(() => {
    if (range === 'all') return { events, orders };
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (Number(range) - 1));
    const inRange = (r) => new Date(r.created_at) >= cutoff;
    return { events: events.filter(inRange), orders: orders.filter(inRange) };
  }, [events, orders, range]);

  const m = useMemo(() => {
    const events = fEvents;
    const orders = fOrders;
    const pageviews = events.filter((e) => e.type === 'pageview');
    const checkouts = events.filter((e) => e.type === 'begin_checkout');
    const purchases = events.filter((e) => e.type === 'purchase');

    const uniqueVisitors = new Set(pageviews.map((e) => e.session_id).filter(Boolean)).size;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const viewsToday = pageviews.filter((e) => new Date(e.created_at) >= startOfToday).length;

    // Revenue from confirmed paid orders (source of truth), not from events.
    const revenue = orders
      .filter((o) => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((s, o) => s + (Number(o.amount) || 0), 0);

    const convRate = uniqueVisitors ? (purchases.length / uniqueVisitors) * 100 : 0;
    const checkoutRate = checkouts.length ? (purchases.length / checkouts.length) * 100 : 0;

    // Group pageviews by path.
    const byPath = {};
    for (const e of pageviews) {
      const key = e.path || '/';
      byPath[key] = (byPath[key] || 0) + 1;
    }
    const paths = Object.entries(byPath).sort((a, b) => b[1] - a[1]).slice(0, 6);

    // Traffic sources by referrer host.
    const bySource = {};
    for (const e of pageviews) {
      let key = 'כניסה ישירה';
      if (e.referrer) {
        try { key = new URL(e.referrer).hostname.replace(/^www\./, ''); } catch { key = e.referrer; }
      }
      bySource[key] = (bySource[key] || 0) + 1;
    }
    const sources = Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 6);

    // Pageviews per day for the last 7 days (oldest → newest).
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = pageviews.filter((e) => {
        const t = new Date(e.created_at);
        return t >= d && t < next;
      }).length;
      days.push({ label: d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }), value: count });
    }

    return {
      totalViews: pageviews.length,
      uniqueVisitors,
      viewsToday,
      checkouts: checkouts.length,
      purchases: purchases.length,
      revenue,
      convRate,
      checkoutRate,
      paths,
      sources,
      days,
    };
  }, [fEvents, fOrders]);

  if (!events.length) {
    return (
      <p className="rounded-2xl border border-white/10 bg-pine/40 py-12 text-center text-bone/50">
        עדיין אין נתוני תנועה. הנתונים יופיעו כאן ברגע שגולשים ייכנסו לאתר.
      </p>
    );
  }

  const maxDay = Math.max(1, ...m.days.map((d) => d.value));
  const maxPath = Math.max(1, ...m.paths.map((p) => p[1]));
  const maxSource = Math.max(1, ...m.sources.map((s) => s[1]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full bg-pine p-1 w-fit">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                range === r.key ? 'bg-ball text-ink' : 'text-bone/70 hover:text-bone'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={onReset}
          className="rounded-xl border border-rose-400/30 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-400/10"
        >
          איפוס סטטיסטיקה
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="צפיות בדפים" value={m.totalViews} />
        <StatCard label="מבקרים ייחודיים" value={m.uniqueVisitors} />
        <StatCard label="צפיות היום" value={m.viewsToday} />
        <StatCard label="התחלות תשלום" value={m.checkouts} />
        <StatCard label="רכישות" value={m.purchases} />
        <StatCard label="אחוז המרה" value={`${m.convRate.toFixed(1)}%`} />
        <StatCard label="המרת עגלה" value={`${m.checkoutRate.toFixed(1)}%`} />
        <StatCard label="הכנסות" value={`₪${m.revenue.toLocaleString('he-IL')}`} />
      </div>

      <Panel title="צפיות ב-7 הימים האחרונים">
        <div className="space-y-2.5">
          {m.days.map((d) => (
            <BarRow key={d.label} label={d.label} value={d.value} max={maxDay} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="דפים מובילים">
          <div className="space-y-2.5">
            {m.paths.map(([p, v]) => (
              <BarRow key={p} label={p} value={v} max={maxPath} />
            ))}
          </div>
        </Panel>

        <Panel title="מקורות תנועה">
          <div className="space-y-2.5">
            {m.sources.map(([s, v]) => (
              <BarRow key={s} label={s} value={v} max={maxSource} />
            ))}
          </div>
        </Panel>
      </div>

      <p className="text-center text-xs text-bone/40">
        המרה = רכישות ÷ מבקרים ייחודיים · המרת עגלה = רכישות ÷ התחלות תשלום · מבוסס על עד 5,000 האירועים האחרונים
      </p>
    </div>
  );
};

const Dashboard = ({ session }) => {
  const [tab, setTab] = useState('orders');
  const [data, setData] = useState({ orders: [], shipments: [], customers: [], analytics: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    const [orders, shipments, customers, analytics] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('shipments').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(5000),
    ]);
    const firstErr = orders.error || shipments.error || customers.error || analytics.error;
    if (firstErr) setError(firstErr.message);
    setData({
      orders: orders.data || [],
      shipments: shipments.data || [],
      customers: customers.data || [],
      analytics: analytics.data || [],
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (row) => {
    if (!window.confirm('למחוק את הרשומה?')) return;
    const { error: delErr } = await supabase.from(tab).delete().eq('id', row.id);
    if (delErr) setError(delErr.message);
    else load();
  };

  // Wipe all analytics events (used to clear numbers inflated by test traffic).
  const handleResetStats = async () => {
    if (!window.confirm('לאפס את כל נתוני הסטטיסטיקה? פעולה זו תמחק לצמיתות את כל אירועי התנועה (צפיות, המרות) ואינה הפיכה.')) return;
    if (!window.confirm('אישור אחרון — האם אתה בטוח שברצונך לאפס את הסטטיסטיקה?')) return;
    // Delete every row (id > 0 matches all).
    const { error: delErr } = await supabase.from('analytics_events').delete().gt('id', 0);
    if (delErr) setError(delErr.message);
    else {
      load();
      window.alert('הסטטיסטיקה אופסה בהצלחה.');
    }
  };

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
        {
          key: 'tracking_number',
          label: 'מעקב',
          // A tracking number links straight to 17track for live status.
          render: (r) =>
            r.tracking_number ? (
              <a
                href={`https://www.17track.net/en/track?nums=${encodeURIComponent(r.tracking_number)}`}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="font-medium text-ball underline underline-offset-2 hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {r.tracking_number} ↗
              </a>
            ) : (
              '—'
            ),
        },
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
          <div className="flex gap-2">
            {tab !== 'analytics' && (
              <button
                onClick={() => setAdding(true)}
                className="rounded-xl bg-ball px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
              >
                + הוספה
              </button>
            )}
            <button onClick={load} className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
              רענון
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            שגיאה בטעינת נתונים: {error}
          </p>
        )}

        <div className="mt-4">
          {loading ? (
            <p className="py-10 text-center text-bone/50">טוען…</p>
          ) : tab === 'analytics' ? (
            <Analytics events={data.analytics} orders={data.orders} onReset={handleResetStats} />
          ) : tab === 'orders' ? (
            <OrdersView orders={data.orders} shipments={data.shipments} customers={data.customers} onChanged={load} onDelete={handleDelete} />
          ) : (
            <Table columns={columns[tab]} rows={data[tab]} onEdit={setEditing} onDelete={handleDelete} />
          )}
        </div>
      </main>

      {adding && (
        <RecordModal
          table={tab}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            load();
          }}
        />
      )}

      {editing && (
        <RecordModal
          table={tab}
          record={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
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
