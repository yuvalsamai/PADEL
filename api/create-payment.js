// Vercel serverless function: builds a signed Hyp Pay payment-page URL.
// Secrets (HYP_MASOF / HYP_APIKEY / HYP_PASSP) live only here, never in the frontend.

const HYP_BASE = 'https://pay.hyp.co.il/p/';

export default async function handler(req, res) {
  const { HYP_MASOF, HYP_APIKEY, HYP_PASSP } = process.env;
  if (!HYP_MASOF || !HYP_APIKEY || !HYP_PASSP) {
    return res.status(500).json({ error: 'Hyp credentials are not configured' });
  }

  // Accept optional customer/amount from the query (GET) or JSON body (POST).
  const src = req.method === 'POST' ? req.body || {} : req.query || {};
  const amount = String(src.amount || '89');
  const order = String(src.order || `CC-${Date.now()}`);

  const params = new URLSearchParams({
    action: 'APISign',
    What: 'SIGN',
    Sign: 'True',
    KEY: HYP_APIKEY,
    PassP: HYP_PASSP,
    Masof: HYP_MASOF,
    Amount: amount,
    Order: order,
    Coin: '1',
    PageLang: 'HEB',
    tmp: '13',
    sendemail: 'True',
    // Customer details below are Hebrew — send and receive them as UTF-8.
    UTF8: 'True',
    UTF8out: 'True',
  });

  const clip = (v) => String(v).trim().slice(0, 200);

  // Optional customer fields
  for (const [k, hypKey] of [
    ['clientName', 'ClientName'],
    ['clientLName', 'ClientLName'],
    ['email', 'email'],
    ['cell', 'cell'],
    ['userId', 'UserId'],
    ['street', 'street'],
    ['city', 'city'],
    ['zip', 'zip'],
  ]) {
    if (src[k]) params.set(hypKey, clip(src[k]));
  }

  // Free fields are echoed back on the success redirect, so verify-payment can
  // record who ordered and where to ship: Fild1 = name, Fild2 = email,
  // Fild3 = phone | full shipping address.
  const fullName = [src.clientName, src.clientLName].filter(Boolean).join(' ');
  if (fullName) params.set('Fild1', clip(fullName));
  if (src.email) params.set('Fild2', clip(src.email));
  if (src.cell || src.address) {
    params.set('Fild3', clip(`${src.cell || ''} | ${src.address || ''}`));
  }

  try {
    const signRes = await fetch(`${HYP_BASE}?${params.toString()}`);
    const body = (await signRes.text()).trim();

    // A valid SIGN response is a query string containing a signature.
    if (!body || !body.includes('signature=')) {
      return res.status(502).json({ error: 'Unexpected Hyp response', body });
    }

    // Append the response verbatim (order preserved) to the payment-page base.
    const paymentUrl = `${HYP_BASE}?${body}`;
    return res.status(200).json({ url: paymentUrl, order });
  } catch (e) {
    return res.status(502).json({ error: 'Failed to reach Hyp', detail: String(e) });
  }
}
