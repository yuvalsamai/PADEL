// Vercel serverless function: validates a Hyp Pay completion redirect and records
// the order in Supabase. Runs server-side only (uses the service-role key).

import { createClient } from '@supabase/supabase-js';

const HYP_BASE = 'https://pay.hyp.co.il/p/';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwmydcfhedcquktxqsis.supabase.co';

export default async function handler(req, res) {
  const { HYP_MASOF, HYP_APIKEY, HYP_PASSP, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!HYP_MASOF || !HYP_APIKEY || !HYP_PASSP || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server is not fully configured' });
  }

  // Raw success query string (order preserved) — forwarded from the thank-you page.
  const qIndex = req.url.indexOf('?');
  const rawQuery = qIndex >= 0 ? req.url.slice(qIndex + 1) : '';
  if (!rawQuery) return res.status(400).json({ error: 'Missing payment parameters' });

  const p = new URLSearchParams(rawQuery);
  if (p.get('CCode') !== '0') {
    return res.status(400).json({ ok: false, error: 'Payment not approved', ccode: p.get('CCode') });
  }

  // 1) Verify the signature server-side against Hyp.
  const verifyUrl =
    `${HYP_BASE}?action=APISign&What=VERIFY` +
    `&Masof=${encodeURIComponent(HYP_MASOF)}` +
    `&KEY=${encodeURIComponent(HYP_APIKEY)}` +
    `&PassP=${encodeURIComponent(HYP_PASSP)}` +
    `&${rawQuery}`;

  try {
    const vRes = await fetch(verifyUrl);
    const vBody = (await vRes.text()).trim();
    const vParams = new URLSearchParams(vBody);
    if (vParams.get('CCode') !== '0') {
      return res.status(400).json({ ok: false, error: 'Signature validation failed', body: vBody });
    }
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Failed to reach Hyp', detail: String(e) });
  }

  // 2) Record the order (idempotent on the Hyp transaction id).
  const tranId = p.get('Id');
  const amount = Number(p.get('Amount')) || null;
  const order = p.get('Order') || null;
  const name = p.get('Fild1') || null;
  const email = p.get('Fild2') || null;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    if (tranId) {
      const { data: existing } = await supabase
        .from('orders').select('id').eq('tran_id', tranId).maybeSingle();
      if (existing) return res.status(200).json({ ok: true, duplicate: true });
    }

    let customerId = null;
    if (name || email) {
      const { data: cust } = await supabase
        .from('customers').insert({ name: name || 'לקוח', email }).select('id').single();
      customerId = cust?.id ?? null;
    }

    await supabase.from('orders').insert({
      tran_id: tranId,
      customer_id: customerId,
      customer_name: name,
      product: 'תושבת CourtCheck',
      quantity: 1,
      amount,
      status: 'paid',
    });

    return res.status(200).json({ ok: true, order });
  } catch (e) {
    // Payment is valid even if the DB write fails — surface success to the buyer,
    // but report the error for server logs.
    return res.status(200).json({ ok: true, recorded: false, detail: String(e) });
  }
}
