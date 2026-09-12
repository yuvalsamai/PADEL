// First-party analytics collector. The browser POSTs small visit events here;
// this function writes them to Supabase with the service-role key, so the
// analytics table stays locked down (no public insert policy) and the anon key
// is never used for writes. Never throws to the caller — tracking must never
// break the page.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwmydcfhedcquktxqsis.supabase.co';
const ALLOWED_TYPES = new Set(['pageview', 'begin_checkout', 'purchase']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_SERVICE_ROLE_KEY) return res.status(200).json({ ok: false });

  const body = req.body || {};
  const type = String(body.type || '');
  if (!ALLOWED_TYPES.has(type)) return res.status(400).json({ error: 'Invalid event type' });

  // Trim to keep rows small and avoid abuse via oversized payloads.
  const clip = (v, n) => (v == null ? null : String(v).slice(0, n));

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    await supabase.from('analytics_events').insert({
      type,
      path: clip(body.path, 300),
      referrer: clip(body.referrer, 500),
      session_id: clip(body.sessionId, 64),
      user_agent: clip(req.headers['user-agent'], 500),
    });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: false });
  }
}
