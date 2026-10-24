// Admin-only Meta ad performance for the /YUVAL panel.
//   POST { since: 'YYYY-MM-DD', until: 'YYYY-MM-DD' } → spend / clicks / purchases
//   POST {}                                          → lifetime of the ad account
// Needs META_ADS_TOKEN: a Meta token with ads_read on the ad account
// (META_AD_ACCOUNT, default the FY global account). Auth: the admin's
// Supabase session token, checked against ADMIN_EMAIL like admin-email.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwmydcfhedcquktxqsis.supabase.co';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'yuvalsamai@gmail.com').toLowerCase();
const AD_ACCOUNT = (process.env.META_AD_ACCOUNT || '719187083904912').replace(/^act_/, '');
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Meta reports the same purchase under several action types; take the largest.
const PURCHASE_TYPES = ['omni_purchase', 'purchase', 'offsite_conversion.fb_pixel_purchase'];
const pick = (list) =>
  Math.max(0, ...PURCHASE_TYPES.map((t) => Number((list || []).find((a) => a.action_type === t)?.value) || 0));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { SUPABASE_SERVICE_ROLE_KEY, META_ADS_TOKEN } = process.env;
  if (!SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server is not fully configured' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const { data: auth } = token ? await supabase.auth.getUser(token) : { data: null };
  if (!auth?.user?.email || auth.user.email.toLowerCase() !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!META_ADS_TOKEN) return res.status(200).json({ configured: false });

  const { since, until } = req.body || {};
  const params = new URLSearchParams({
    fields: 'spend,impressions,inline_link_clicks,actions,action_values',
    level: 'account',
    access_token: META_ADS_TOKEN,
  });
  if (DATE.test(since || '') && DATE.test(until || '')) params.set('time_range', JSON.stringify({ since, until }));
  else params.set('date_preset', 'maximum');

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/act_${AD_ACCOUNT}/insights?${params}`);
    const body = await r.json();
    if (!r.ok || body.error) {
      return res.status(200).json({ configured: true, error: body.error?.message || `HTTP ${r.status}` });
    }
    const row = body.data?.[0] || {};
    const spend = Number(row.spend) || 0;
    const purchases = pick(row.actions);
    return res.status(200).json({
      configured: true,
      currency: 'ILS',
      spend,
      impressions: Number(row.impressions) || 0,
      clicks: Number(row.inline_link_clicks) || 0,
      purchases,
      purchaseValue: pick(row.action_values),
      costPerPurchase: purchases ? spend / purchases : null,
    });
  } catch (e) {
    return res.status(200).json({ configured: true, error: String(e?.message || e) });
  }
}
