// Vercel serverless function: validates a Hyp Pay completion redirect and records
// the order in Supabase. Runs server-side only (uses the service-role key).

import { createClient } from '@supabase/supabase-js';

const HYP_BASE = 'https://pay.hyp.co.il/p/';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwmydcfhedcquktxqsis.supabase.co';

// Sends a new-order alert to a Telegram group. No-op if not configured; never throws.
async function notifyTelegram({ name, email, phone, address, amount, order, tranId, orderId }) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const lines = [
    '🎾 *הזמנה חדשה - CourtCheck*',
    '',
    `👤 שם: ${name || '—'}`,
    `📱 טלפון: ${phone || '—'}`,
    `✉️ אימייל: ${email || '—'}`,
    `🏠 כתובת: ${address || '—'}`,
    `💰 סכום: ₪${amount ?? '—'}`,
    `🧾 מס׳ הזמנה: ${order || '—'}`,
    `🔖 עסקת Hyp: ${tranId || '—'}`,
    orderId ? `🗂️ מזהה במערכת: ${orderId}` : null,
  ].filter(Boolean);

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: lines.join('\n'),
        parse_mode: 'Markdown',
      }),
    });
  } catch {
    /* ignore notification failures */
  }
}

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
    const details = { order, amount, name, email };

    if (tranId) {
      const { data: existing } = await supabase
        .from('orders').select('id, quantity').eq('tran_id', tranId).maybeSingle();
      if (existing) return res.status(200).json({ ok: true, duplicate: true, details: { ...details, quantity: existing.quantity } });
    }

    // Prefer the pending order created at checkout (it carries phone + address,
    // which Hyp's completion redirect does not return). Fall back to a fresh
    // insert if none is found (e.g. the checkout DB write had failed).
    let orderRow = null;
    if (order) {
      const { data: pending } = await supabase
        .from('orders')
        .select('id, customer_id, customer_name')
        .eq('order_ref', order)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      orderRow = pending || null;
    }

    let customerId = orderRow?.customer_id ?? null;
    let orderId = orderRow?.id ?? null;

    if (orderRow) {
      // Finish the existing pending order — keep its phone/address, mark paid.
      await supabase
        .from('orders')
        .update({
          tran_id: tranId,
          amount,
          status: 'paid',
          customer_name: orderRow.customer_name || name,
        })
        .eq('id', orderRow.id);
    } else {
      // Fallback path: no pending order — create customer + order + shipment now.
      if (name || email) {
        const { data: cust } = await supabase
          .from('customers').insert({ name: name || 'לקוח', email }).select('id').single();
        customerId = cust?.id ?? null;
      }

      const { data: newOrder } = await supabase.from('orders').insert({
        order_ref: order,
        tran_id: tranId,
        customer_id: customerId,
        customer_name: name,
        product: 'תושבת CourtCheck',
        quantity: 1,
        amount,
        status: 'paid',
      }).select('id').single();
      orderId = newOrder?.id ?? null;

      if (orderId) {
        await supabase.from('shipments').insert({ order_id: orderId, status: 'pending' });
      }
    }

    // Pull phone + address (stored at checkout) to enrich the Telegram alert.
    let phone = null;
    let address = null;
    if (customerId) {
      const { data: cust } = await supabase
        .from('customers').select('phone').eq('id', customerId).maybeSingle();
      phone = cust?.phone ?? null;
    }
    if (orderId) {
      const { data: ship } = await supabase
        .from('shipments').select('address').eq('order_id', orderId).limit(1).maybeSingle();
      address = ship?.address ?? null;
    }
    // Quantity for the order summary shown on the thank-you page.
    let quantity = null;
    if (orderId) {
      const { data: ord } = await supabase
        .from('orders').select('quantity').eq('id', orderId).maybeSingle();
      quantity = ord?.quantity ?? null;
    }

    // Record the conversion for the analytics dashboard (best-effort).
    try {
      await supabase.from('analytics_events').insert({
        type: 'purchase',
        path: '/thank-you',
        order_ref: order,
        amount,
      });
    } catch {
      /* ignore analytics failures */
    }

    // Fire a Telegram notification (best-effort — never blocks the buyer's success).
    await notifyTelegram({ name, email, phone, address, amount, order, tranId, orderId });

    return res.status(200).json({ ok: true, details: { ...details, quantity, address } });
  } catch (e) {
    // Payment is valid even if the DB write fails — surface success to the buyer,
    // but report the error for server logs.
    return res.status(200).json({ ok: true, recorded: false, detail: String(e) });
  }
}
