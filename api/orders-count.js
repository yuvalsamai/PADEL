// Public aggregate endpoint: returns ONLY the number of completed orders.
// The orders table itself stays locked to the admin (RLS); this reads it with
// the service-role key server-side and exposes just a count — no PII. Used by
// the home-page "orders completed" counter so real purchases bump it live.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwmydcfhedcquktxqsis.supabase.co';

export default async function handler(req, res) {
  const { SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_SERVICE_ROLE_KEY) return res.status(200).json({ count: 0 });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    // Count paid/shipped/delivered orders (i.e. real completed purchases).
    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['paid', 'shipped', 'delivered']);

    if (error) return res.status(200).json({ count: 0 });

    // Let the CDN cache it briefly so a traffic spike doesn't hammer the DB.
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ count: count || 0 });
  } catch {
    return res.status(200).json({ count: 0 });
  }
}
