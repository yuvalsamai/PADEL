// Meta Conversions API: reports the Purchase from the server once Hyp confirms
// the payment. Same event_id (the order ref) as the browser pixel, so Meta
// counts it once. Sent only for buyers who accepted marketing cookies at
// checkout. No-op unless META_CAPI_TOKEN is set; never throws.
import crypto from 'node:crypto';
import { PIXEL_ID, CONTENT } from '../src/lib/meta.js';

const sha = (v) => (v ? crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex') : undefined);

// Israeli mobile → E.164 digits without '+', e.g. 0501234567 → 972501234567.
const phoneDigits = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  if (!d) return null;
  return d.startsWith('972') ? d : d.startsWith('0') ? `972${d.slice(1)}` : d;
};

export async function sendCapiPurchase({ order, amount, quantity, email, phone, name, city, zip, customerId, fbp, fbc, ip, ua }) {
  const { META_CAPI_TOKEN, META_TEST_EVENT_CODE } = process.env;
  if (!META_CAPI_TOKEN) return { status: 'skipped', error: 'META_CAPI_TOKEN is not set' };

  const [fn, ...rest] = String(name || '').trim().split(/\s+/);
  const user_data = Object.fromEntries(
    Object.entries({
      em: email ? [sha(email)] : undefined,
      ph: phoneDigits(phone) ? [sha(phoneDigits(phone))] : undefined,
      fn: fn ? [sha(fn)] : undefined,
      ln: rest.length ? [sha(rest.join(' '))] : undefined,
      ct: city ? [sha(String(city).replace(/\s+/g, ''))] : undefined,
      zp: zip ? [sha(zip)] : undefined,
      country: [sha('il')],
      external_id: customerId ? [sha(`netcam-${customerId}`)] : undefined,
      fbp: fbp || undefined,
      fbc: fbc || undefined,
      client_ip_address: ip || undefined,
      client_user_agent: ua || undefined,
    }).filter(([, v]) => v !== undefined),
  );

  const body = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: order || undefined,
        action_source: 'website',
        event_source_url: 'https://netcamsport.co.il/thank-you',
        user_data,
        custom_data: { ...CONTENT, value: Number(amount) || 0, currency: 'ILS', num_items: quantity || 1, order_id: order || undefined },
      },
    ],
    ...(META_TEST_EVENT_CODE ? { test_event_code: META_TEST_EVENT_CODE } : {}),
  };

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(META_CAPI_TOKEN)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    return r.ok ? { status: 'sent' } : { status: 'failed', error: data?.error?.message || `HTTP ${r.status}` };
  } catch (e) {
    return { status: 'failed', error: String(e) };
  }
}
