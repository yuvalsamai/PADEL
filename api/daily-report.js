// Vercel Cron (see vercel.json): once a day, posts yesterday's raw numbers to the
// Telegram group — site visits, checkout funnel, orders, and Meta ad spend /
// cost per visit. Data only, no commentary.
//   GET /api/daily-report             → yesterday (Israel time)
//   GET /api/daily-report?date=YYYY-MM-DD
// Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
// Meta numbers need META_ADS_TOKEN (ads_read), as in admin-ads.js; without it the
// message says so and still sends the site numbers.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwmydcfhedcquktxqsis.supabase.co';
const AD_ACCOUNT = (process.env.META_AD_ACCOUNT || '719187083904912').replace(/^act_/, '');
const TZ = 'Asia/Jerusalem';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Israel's UTC offset (in minutes) at a given instant, e.g. 120 or 180.
function tzOffset(at) {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName')?.value || 'GMT+2';
  const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 120;
}

// UTC instant of local midnight at the start of `date` (YYYY-MM-DD) in Israel.
function localMidnight(date) {
  const guess = new Date(`${date}T00:00:00Z`);
  // Second pass uses the offset at the result itself (right on DST-change days).
  const first = new Date(guess.getTime() - tzOffset(guess) * 60000);
  return new Date(guess.getTime() - tzOffset(first) * 60000);
}

const yesterday = () => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date()); // YYYY-MM-DD
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};
const nextDay = (date) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

const LPV_TYPES = ['omni_landing_page_view', 'landing_page_view'];
const PURCHASE_TYPES = ['omni_purchase', 'purchase', 'offsite_conversion.fb_pixel_purchase'];
const pick = (list, types) =>
  Math.max(0, ...types.map((t) => Number((list || []).find((a) => a.action_type === t)?.value) || 0));

async function metaDay(date) {
  const { META_ADS_TOKEN } = process.env;
  if (!META_ADS_TOKEN) return { error: 'META_ADS_TOKEN לא מוגדר' };
  const params = new URLSearchParams({
    fields: 'spend,impressions,inline_link_clicks,actions',
    level: 'account',
    time_range: JSON.stringify({ since: date, until: date }),
    access_token: META_ADS_TOKEN,
  });
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/act_${AD_ACCOUNT}/insights?${params}`);
    const body = await r.json();
    if (!r.ok || body.error) return { error: body.error?.message || `HTTP ${r.status}` };
    const row = body.data?.[0] || {};
    return {
      spend: Number(row.spend) || 0,
      impressions: Number(row.impressions) || 0,
      clicks: Number(row.inline_link_clicks) || 0,
      lpv: pick(row.actions, LPV_TYPES),
      purchases: pick(row.actions, PURCHASE_TYPES),
    };
  } catch (e) {
    return { error: String(e?.message || e) };
  }
}

const ils = (n) => `₪${n.toFixed(2)}`;
const per = (spend, n) => (n > 0 ? ils(spend / n) : '—');

export default async function handler(req, res) {
  const { CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  const auth = req.headers.authorization || '';
  const fromCron = String(req.headers['user-agent'] || '').startsWith('vercel-cron/');
  if (CRON_SECRET ? auth !== `Bearer ${CRON_SECRET}` : !fromCron) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ error: 'Server is not fully configured' });
  }

  const date = DATE.test(String(req.query?.date || '')) ? String(req.query.date) : yesterday();
  const from = localMidnight(date).toISOString();
  const to = localMidnight(nextDay(date)).toISOString();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const count = async (type, path) => {
    let q = supabase.from('analytics_events').select('id', { count: 'exact', head: true })
      .eq('type', type).gte('created_at', from).lt('created_at', to);
    if (path) q = q.eq('path', path);
    const { count: n } = await q;
    return n || 0;
  };

  const [visits, payViews, toHyp, paidOrders, meta] = await Promise.all([
    count('pageview', '/'),
    count('pageview', '/pay'),
    count('begin_checkout'),
    supabase.from('orders').select('amount').eq('status', 'paid').gte('created_at', from).lt('created_at', to)
      .then(({ data }) => data || []),
    metaDay(date),
  ]);
  const revenue = paidOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0);

  const [y, m, d] = date.split('-');
  const lines = [
    `סיכום יומי NETCAM · ${d}.${m}.${y}`,
    '',
    'אתר',
    `כניסות לדף הבית: ${visits}`,
    `כניסות לדף ההזמנה: ${payViews}`,
    `מעבר לתשלום: ${toHyp}`,
    `הזמנות ששולמו: ${paidOrders.length} (${ils(revenue)})`,
    '',
    'מודעות (Meta)',
  ];
  if (meta.error) {
    lines.push(`לא זמין: ${meta.error}`);
  } else {
    lines.push(
      `הוצאה: ${ils(meta.spend)}`,
      `חשיפות: ${meta.impressions}`,
      `קליקים: ${meta.clicks}`,
      `עלות לקליק: ${per(meta.spend, meta.clicks)}`,
      `עלות לכניסה לאתר: ${per(meta.spend, visits)}`,
      `עלות לכניסה לדף ההזמנה: ${per(meta.spend, payViews)}`,
      `עלות להזמנה: ${per(meta.spend, paidOrders.length)}`,
    );
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: lines.join('\n') }),
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: `telegram ${r.status}` });
  } catch (e) {
    return res.status(502).json({ ok: false, error: String(e?.message || e) });
  }
  return res.status(200).json({ ok: true, date });
}
