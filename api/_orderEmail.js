// Order-confirmation email (sent once, when a payment is first verified).
// Doubles as the written disclosure Israeli law requires for distance sales:
// business details, what was bought, delivery time and how to cancel.
// Uses Resend (https://resend.com). No-op unless RESEND_API_KEY is set; never throws.
// Files starting with "_" in /api are helpers, not endpoints.
import { BUSINESS } from '../src/lib/business.js';

const SITE = 'https://netcamsport.co.il';

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function row(label, value) {
  if (value == null || value === '') return '';
  return `<tr><td style="padding:6px 0;color:#5B6170;white-space:nowrap;vertical-align:top">${esc(label)}</td>
    <td style="padding:6px 12px 6px 0;color:#0D0D0D;font-weight:600">${esc(value)}</td></tr>`;
}

function render({ name, order, product, quantity, amount, address }) {
  const b = BUSINESS;
  const first = (name || '').trim().split(/\s+/)[0];
  const business = [
    b.legalName ? `${b.legalName} (${b.brand})` : b.brand,
    b.businessType && b.businessId ? `${b.businessType} ${b.businessId}` : '',
    b.address,
    b.phone ? `טלפון ${b.phone}` : '',
    b.email,
  ].filter(Boolean).map(esc).join(' · ');

  const html = `<!doctype html><html lang="he" dir="rtl"><body style="margin:0;background:#F6F7F5;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F7F5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden" dir="rtl">
  <tr><td style="background:#0D0D0D;padding:20px 24px;text-align:right">
    <img src="${SITE}/email-logo.png" alt="NETCAM" width="120" style="display:block;height:auto;border:0">
  </td></tr>
  <tr><td style="padding:28px 24px 8px;text-align:right">
    <h1 style="margin:0 0 8px;font-size:24px;color:#0D0D0D">תודה על ההזמנה${first ? `, ${esc(first)}` : ''}!</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#333">התשלום התקבל וההזמנה שלך בטיפול. נשלח לך מספר מעקב ברגע שהמשלוח יוצא.</p>
  </td></tr>
  <tr><td style="padding:16px 24px;text-align:right">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-top:1px solid #ECEEEA;border-bottom:1px solid #ECEEEA">
      ${row('מספר הזמנה', order)}
      ${row('מוצר', product)}
      ${row('כמות', quantity)}
      ${row('כתובת למשלוח', address)}
      ${row('סה״כ שולם', amount != null ? `₪${amount}` : '')}
    </table>
  </td></tr>
  <tr><td style="padding:4px 24px 8px;text-align:right;font-size:14px;line-height:1.7;color:#333">
    <p style="margin:0 0 10px"><b>משלוח:</b> חינם עד הדלת, תוך 7–12 ימי עסקים.</p>
    <p style="margin:0 0 10px"><b>ביטול עסקה:</b> ניתן לבטל תוך 14 ימים מקבלת המוצר (אזרחים ותיקים, אנשים עם מוגבלות ועולים חדשים — עד 4 חודשים), דרך
      <a href="${SITE}/cancel" style="color:#0D0D0D">טופס ביטול עסקה</a> או בתשובה למייל זה. ההחזר יבוצע תוך 14 ימים, בניכוי דמי ביטול של 5% או 100 ₪ (הנמוך מביניהם); ללא דמי ביטול במוצר פגום.
      התנאים המלאים ב<a href="${SITE}/terms" style="color:#0D0D0D">תקנון</a>.</p>
  </td></tr>
  <tr><td style="padding:16px 24px 24px;text-align:right;font-size:12px;line-height:1.6;color:#5B6170;border-top:1px solid #ECEEEA">
    ${business}
  </td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `תודה על ההזמנה${first ? `, ${first}` : ''}!`,
    'התשלום התקבל וההזמנה שלך בטיפול.',
    '',
    order && `מספר הזמנה: ${order}`,
    product && `מוצר: ${product}`,
    quantity && `כמות: ${quantity}`,
    address && `כתובת למשלוח: ${address}`,
    amount != null && `סה״כ שולם: ₪${amount}`,
    '',
    'משלוח: חינם עד הדלת, תוך 7–12 ימי עסקים.',
    `ביטול עסקה: תוך 14 ימים מקבלת המוצר (אזרחים ותיקים, אנשים עם מוגבלות ועולים חדשים — עד 4 חודשים) דרך ${SITE}/cancel או בתשובה למייל זה. תקנון: ${SITE}/terms`,
    '',
    business.replace(/&[^;]+;/g, ''),
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
        from: ORDER_EMAIL_FROM || 'NETCAM <orders@netcamsport.co.il>',
        to: [to],
        reply_to: BUSINESS.email || undefined,
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
