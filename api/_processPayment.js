// Shared payment completion logic, used by:
//   • /api/verify-payment — the buyer's browser, from the thank-you page
//   • /api/hyp-notify     — Hyp's server-to-server notification (works even if
//                           the buyer closes the tab before the thank-you page)
// Whichever arrives first records the order, sends the Telegram alert and the
// confirmation email; the other one sees it as a duplicate. Runs server-side only.

import { createClient } from '@supabase/supabase-js';
import { sendOrderEmail } from './_orderEmail.js';

const HYP_BASE = 'https://pay.hyp.co.il/p/';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwmydcfhedcquktxqsis.supabase.co';

// Sends a new-order alert to a Telegram group. No-op if not configured; never throws.
async function notifyTelegram({ name, email, phone, address, product, amount, order, tranId, orderId }) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const lines = [
    '🎾 *הזמנה חדשה - NETCAM*',
    '',
    `👤 שם: ${name || '—'}`,
    `📱 טלפון: ${phone || '—'}`,
    `✉️ אימייל: ${email || '—'}`,
    `🏠 כתובת: ${address || '—'}`,
    product ? `🎨 מוצר: ${product}` : null,
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

// rawQuery: Hyp's completion parameters, in their original order (needed for VERIFY).
// Returns { status, body } for the caller to send.
export async function processPayment(rawQuery) {
  const { HYP_MASOF, HYP_APIKEY, HYP_PASSP, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!HYP_MASOF || !HYP_APIKEY || !HYP_PASSP || !SUPABASE_SERVICE_ROLE_KEY) {
    return { status: 500, body: { error: 'Server is not fully configured' } };
  }
  if (!rawQuery) return { status: 400, body: { error: 'Missing payment parameters' } };

  const p = new URLSearchParams(rawQuery);
  if (p.get('CCode') !== '0') {
    return { status: 400, body: { ok: false, error: 'Payment not approved', ccode: p.get('CCode') } };
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
      return { status: 400, body: { ok: false, error: 'Signature validation failed', body: vBody } };
    }
  } catch (e) {
    return { status: 502, body: { ok: false, error: 'Failed to reach Hyp', detail: String(e) } };
  }

  // 2) Record the order.
  const tranId = p.get('Id');
  const amount = Number(p.get('Amount')) || null;
  const order = p.get('Order') || null;
  const name = p.get('Fild1') || null;
  const email = p.get('Fild2') || null;
  const details = { order, amount, name, email };

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // Atomically claim the pending order created at checkout: only the request
    // whose update flips it from 'pending' to 'paid' carries on, so a browser
    // redirect and Hyp's notification arriving together can't double-process.
    let orderRow = null;
    if (order) {
      const { data: claimed } = await supabase
        .from('orders')
        .update({ tran_id: tranId, amount, status: 'paid' })
        .eq('order_ref', order)
        .eq('status', 'pending')
        .select('id, customer_id, customer_name, product, quantity');
      orderRow = claimed?.[0] || null;
      if (orderRow && !orderRow.customer_name && name) {
        await supabase.from('orders').update({ customer_name: name }).eq('id', orderRow.id);
      }
    }

    if (!orderRow) {
      // Already processed (by the other path or an earlier request)?
      const { data: existing } = tranId
        ? await supabase.from('orders').select('id, quantity').eq('tran_id', tranId).maybeSingle()
        : { data: null };
      if (existing) {
        const { data: ship } = await supabase
          .from('shipments').select('address').eq('order_id', existing.id).limit(1).maybeSingle();
        return {
          status: 200,
          body: { ok: true, duplicate: true, details: { ...details, quantity: existing.quantity, address: ship?.address ?? null } },
        };
      }
    }

    let customerId = orderRow?.customer_id ?? null;
    let orderId = orderRow?.id ?? null;

    if (!orderRow) {
      // Fallback: no pending order (e.g. the checkout DB write had failed) — create it now.
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
        product: 'תושבת NETCAM',
        quantity: 1,
        amount,
        status: 'paid',
      }).select('id').single();
      orderId = newOrder?.id ?? null;
      if (orderId) await supabase.from('shipments').insert({ order_id: orderId, status: 'pending' });
    }

    // Phone, email and address stored at checkout.
    let phone = null;
    let customerEmail = null;
    let address = null;
    if (customerId) {
      const { data: cust } = await supabase
        .from('customers').select('phone, email').eq('id', customerId).maybeSingle();
      phone = cust?.phone ?? null;
      customerEmail = cust?.email ?? null;
    }
    if (orderId) {
      const { data: ship } = await supabase
        .from('shipments').select('address').eq('order_id', orderId).limit(1).maybeSingle();
      address = ship?.address ?? null;
    }
    const quantity = orderRow?.quantity ?? 1;
    const product = orderRow?.product || 'תושבת NETCAM';

    // Conversion for the analytics dashboard (best-effort).
    try {
      await supabase.from('analytics_events').insert({ type: 'purchase', path: '/thank-you', order_ref: order, amount });
    } catch {
      /* ignore analytics failures */
    }

    // Telegram alert + confirmation email (both best-effort, never block the buyer).
    await notifyTelegram({ name, email: email || customerEmail, phone, address, product, amount, order, tranId, orderId });
    await sendOrderEmail({ to: email || customerEmail, name, order, product, quantity, amount, address });

    return { status: 200, body: { ok: true, details: { ...details, quantity, address } } };
  } catch (e) {
    // The payment is valid even if the DB write fails — report success to the
    // buyer, but surface the error for the logs.
    return { status: 200, body: { ok: true, recorded: false, detail: String(e) } };
  }
}
