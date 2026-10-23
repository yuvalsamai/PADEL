// Order-confirmation email (sent once, when a payment is first verified).
// Kept short and upbeat; the footer links to the terms and the cancellation
// form (the legal minimum for the written distance-sale confirmation) without
// spelling the cancellation terms out in the body.
// Uses Resend (https://resend.com). No-op unless RESEND_API_KEY is set; never throws.
// Files starting with "_" in /api are helpers, not endpoints.
import { BUSINESS, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../src/lib/business.js';

const SITE = 'https://netcamsport.co.il';
const LIME = '#A6D720';
const INK = '#0D0D0D';

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function row(label, value, strong = false) {
  if (value == null || value === '') return '';
  return `<tr>
    <td style="padding:10px 0;color:#6B7280;font-size:14px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #EEF0EC">${esc(label)}</td>
    <td style="padding:10px 16px 10px 0;color:${INK};font-size:${strong ? '18px' : '14px'};font-weight:${strong ? '800' : '600'};text-align:left;border-bottom:1px solid #EEF0EC">${esc(value)}</td>
  </tr>`;
}

function render({ name, order, product, quantity, amount, address }) {
  const b = BUSINESS;
  const first = (name || '').trim().split(/\s+/)[0];
  // Business identity line (no personal email); hidden parts stay hidden until filled in.
  const business = [
    b.legalName ? `${b.legalName} (${b.brand})` : b.brand,
    b.businessType && b.businessId ? `${b.businessType} ${b.businessId}` : '',
    b.address,
  ].filter(Boolean).map(esc).join(' · ');

  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>אישור הזמנה</title></head>
<body style="margin:0;padding:0;background:#EEF0EC;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0EC;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="rtl" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.06)">

  <tr><td bgcolor="${INK}" style="background:${INK};background-color:${INK};padding:18px 24px 14px;text-align:center">
    <img src="${SITE}/email-logo-v2.png" alt="NETCAM" width="168" style="display:inline-block;width:168px;height:auto;border:0;background:${INK}">
  </td></tr>
  <tr><td bgcolor="${LIME}" style="background:${LIME};background-color:${LIME};height:6px;line-height:6px;font-size:0">&nbsp;</td></tr>

  <tr><td style="padding:32px 28px 8px;text-align:center">
    <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background:${LIME};color:${INK};font-size:30px;font-weight:900">&#10003;</div>
    <h1 style="margin:18px 0 6px;font-size:26px;line-height:1.25;color:${INK};font-weight:900">תודה על ההזמנה${first ? `, ${esc(first)}` : ''}!</h1>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#374151">התשלום התקבל וההזמנה שלך כבר בדרך להכנה 🎾</p>
  </td></tr>

  <tr><td style="padding:22px 28px 6px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9F6;border-radius:14px;padding:4px 18px">
      ${row('מספר הזמנה', order)}
      ${row('מוצר', product)}
      ${row('כמות', quantity)}
      ${row('כתובת למשלוח', address)}
      ${row('סה״כ שולם', amount != null ? `₪${amount}` : '', true)}
    </table>
  </td></tr>

  <tr><td style="padding:14px 28px 4px;text-align:center">
    <p style="margin:0;font-size:15px;color:${INK}"><b>🚚 משלוח חינם עד הדלת</b> · תוך 7–12 ימי עסקים</p>
  </td></tr>

  <tr><td style="padding:24px 28px 30px;text-align:center">
    <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:${INK}">יש לכם שאלות?</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151">מוזמנים לפנות אלינו באינסטגרם</p>
    <a href="${INSTAGRAM_URL}" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:999px">
      <span style="color:${LIME}">&#9679;</span>&nbsp; <span dir="ltr">${esc(INSTAGRAM_HANDLE)}</span>
    </a>
  </td></tr>

  <tr><td style="padding:16px 24px 20px;text-align:center;border-top:1px solid #EEF0EC;font-size:12px;line-height:1.7;color:#6B7280">
    ${business}<br>
    זהו מייל אוטומטי ואין להשיב אליו.<br>
    <a href="${SITE}/terms" style="color:#6B7280;text-decoration:underline">תקנון האתר</a>
    &nbsp;·&nbsp;
    <a href="${SITE}/cancel" style="color:#6B7280;text-decoration:underline">ביטול עסקה</a>
  </td></tr>

</table></td></tr></table></body></html>`;

  const text = [
    `תודה על ההזמנה${first ? `, ${first}` : ''}!`,
    'התשלום התקבל וההזמנה שלך כבר בדרך להכנה.',
    '',
    order && `מספר הזמנה: ${order}`,
    product && `מוצר: ${product}`,
    quantity && `כמות: ${quantity}`,
    address && `כתובת למשלוח: ${address}`,
    amount != null && `סה״כ שולם: ₪${amount}`,
    '',
    'משלוח חינם עד הדלת, תוך 7–12 ימי עסקים.',
    '',
    `יש לכם שאלות? מוזמנים לפנות אלינו באינסטגרם: ${INSTAGRAM_URL}`,
    '',
    [b.legalName ? `${b.legalName} (${b.brand})` : b.brand, b.businessType && b.businessId ? `${b.businessType} ${b.businessId}` : '', b.address].filter(Boolean).join(' · '),
    'זהו מייל אוטומטי ואין להשיב אליו.',
    `תקנון: ${SITE}/terms · ביטול עסקה: ${SITE}/cancel`,
  ].filter((l) => l !== false && l != null).join('\n');

  return { html, text };
}

// Returns { status: 'sent' | 'failed' | 'skipped', id?, error? } — never throws.
export async function sendOrderEmail({ to, subjectPrefix = '', ...order }) {
  const { RESEND_API_KEY, ORDER_EMAIL_FROM } = process.env;
  if (!RESEND_API_KEY) return { status: 'skipped', error: 'RESEND_API_KEY is not set' };
  if (!to) return { status: 'skipped', error: 'no customer email' };
  const { html, text } = render(order);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // No-reply by design: customer service is via Instagram (see the email body).
        from: ORDER_EMAIL_FROM || 'NETCAM <no-reply@netcamsport.co.il>',
        to: [to],
        subject: `${subjectPrefix}אישור הזמנה ${order.order || ''} · NETCAM`.replace(/\s+/g, ' ').trim(),
        html,
        text,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok) return { status: 'sent', id: data.id || null };
    return { status: 'failed', error: `${r.status}: ${data.message || data.name || 'Resend error'}` };
  } catch (e) {
    return { status: 'failed', error: String(e) };
  }
}

// Stores the outcome on the order so the admin panel can show it.
export async function recordEmailResult(supabase, orderId, result) {
  if (!orderId) return;
  try {
    await supabase
      .from('orders')
      .update({
        email_status: result.status,
        email_sent_at: result.status === 'sent' ? new Date().toISOString() : null,
        email_error: result.error ? String(result.error).slice(0, 300) : null,
        email_id: result.id || null,
      })
      .eq('id', orderId);
  } catch {
    /* tracking must never break the payment flow */
  }
}

export { render as renderOrderEmail };
