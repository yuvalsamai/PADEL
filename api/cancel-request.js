// Vercel serverless function: receives a cancellation request from /cancel
// (the online cancellation channel required for distance sales) and forwards it
// to the business via Telegram. Returns a reference number for the customer.

const clip = (v, n = 300) => String(v ?? '').trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const src = req.body || {};
  const name = clip(src.name, 120);
  const phone = clip(src.phone, 30);
  const email = clip(src.email, 120);
  const order = clip(src.order, 60);
  const reason = clip(src.reason, 1000);
  if (!name || (!phone && !email)) {
    return res.status(400).json({ error: 'נא למלא שם וטלפון או דוא״ל' });
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(503).json({ error: 'not configured' });
  }

  const ref = `CX-${Date.now().toString(36).toUpperCase()}`;
  const text = [
    '↩️ בקשת ביטול עסקה - NETCAM',
    '',
    `🔖 מס׳ פנייה: ${ref}`,
    `👤 שם: ${name}`,
    `📱 טלפון: ${phone || '—'}`,
    `✉️ אימייל: ${email || '—'}`,
    `🧾 מס׳ הזמנה: ${order || '—'}`,
    `📝 סיבה: ${reason || '—'}`,
    `🕒 התקבלה: ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })}`,
  ].join('\n');

  try {
    const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    });
    if (!r.ok) throw new Error(`telegram ${r.status}`);
  } catch (e) {
    return res.status(502).json({ error: 'send failed', detail: String(e) });
  }

  return res.status(200).json({ ok: true, ref });
}
