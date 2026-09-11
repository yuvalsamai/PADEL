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
    tmp: '4',
    sendemail: 'True',
    // Tell Hyp the incoming Hebrew values are UTF-8 (UTF8) and to return the
    // completion redirect in UTF-8 too (UTF8out) — otherwise Hebrew names/address
    // come back garbled ("gibberish") on the receipt and the completion params.
    UTF8: 'True',
    UTF8out: 'True',
  });

  // Optional customer fields
  for (const [k, hypKey] of [
    ['clientName', 'ClientName'],
    ['clientLName', 'ClientLName'],
    ['email', 'email'],
    ['cell', 'cell'],
    ['street', 'street'],
    ['city', 'city'],
    ['userId', 'UserId'],
  ]) {
    if (src[k]) params.set(hypKey, String(src[k]));
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
