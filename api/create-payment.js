// Vercel serverless function: builds a signed Hyp Pay payment-page URL and
// records a *pending* order (with the customer's phone + address, which Hyp's
// completion redirect does NOT return) so the admin has the full details.
// Secrets (HYP_MASOF / HYP_APIKEY / HYP_PASSP) live only here, never in the frontend.

import { createClient } from '@supabase/supabase-js';

const HYP_BASE = 'https://pay.hyp.co.il/p/';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwmydcfhedcquktxqsis.supabase.co';

// Best-effort: store the checkout details as a pending order keyed by order_ref.
// verify-payment finishes it (status → paid) on a confirmed completion redirect.
// Never throws — the buyer must reach the payment page even if the DB write fails.
async function recordPending({ order, amount, quantity, name, email, cell, address, street, city, zip, region }) {
  const { SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    let customerId = null;
    if (name || email || cell) {
      const { data: cust } = await supabase
        .from('customers')
        .insert({ name: name || 'לקוח', email, phone: cell })
        .select('id')
        .single();
      customerId = cust?.id ?? null;
    }

    const { data: newOrder } = await supabase
      .from('orders')
      .insert({
        order_ref: order,
        customer_id: customerId,
        customer_name: name,
        product: 'תושבת CourtCheck',
        quantity: quantity || 1,
        amount: Number(amount) || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (newOrder?.id) {
      await supabase.from('shipments').insert({
        order_id: newOrder.id,
        address: address || null,
        street: street || null,
        city: city || null,
        zip: zip || null,
        region: region || null,
        status: 'pending',
      });
    }
  } catch {
    /* ignore — never block the payment flow on a DB write */
  }
}

export default async function handler(req, res) {
  const { HYP_MASOF, HYP_APIKEY, HYP_PASSP } = process.env;
  if (!HYP_MASOF || !HYP_APIKEY || !HYP_PASSP) {
    return res.status(500).json({ error: 'Hyp credentials are not configured' });
  }

  // Accept optional customer fields from the query (GET) or JSON body (POST).
  const src = req.method === 'POST' ? req.body || {} : req.query || {};

  // SECURITY: the price is fixed server-side — never trust an amount from the
  // client, or a buyer could sign a ₪1 charge for this product. A different
  // amount is honored ONLY for testing, and only when the request carries the
  // secret TEST_AMOUNT_TOKEN (set as an env var, known to the site owner alone).
  const PRODUCT_PRICE = process.env.PRODUCT_PRICE || '89';
  const testToken = process.env.TEST_AMOUNT_TOKEN;
  const requested = src.amount != null ? String(src.amount) : PRODUCT_PRICE;
  const n = Number(requested);
  const testAllowed = Boolean(testToken) && src.testToken === testToken && Number.isFinite(n) && n > 0;
  const unitPrice = testAllowed ? Number(requested) : Number(PRODUCT_PRICE);

  // Quantity is clamped to 1..10 server-side; total is derived, never trusted.
  const qty = Math.min(10, Math.max(1, Math.floor(Number(src.quantity)) || 1));
  // Quantity discount: 1→0%, then 2×qty+1 (2→5%, 3→7% … 10→21%).
  const discountPct = qty < 2 ? 0 : 2 * qty + 1;
  const amount = String(Math.round(unitPrice * qty * (1 - discountPct / 100)));

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
    // Tell Hyp the incoming Hebrew values are UTF-8 (UTF8) and to return the
    // completion redirect in UTF-8 too (UTF8out) — otherwise Hebrew names/address
    // come back garbled ("gibberish") on the receipt and the completion params.
    UTF8: 'True',
    UTF8out: 'True',
    // NOTE: `sendemail` is intentionally omitted. It triggers a *transaction
    // confirmation* email on top of the receipt/invoice (sent by Hyp's invoicing
    // module), which double-mailed the buyer. We keep only the receipt.
  });

  // Optional customer fields
  for (const [k, hypKey] of [
    ['clientName', 'ClientName'],
    ['clientLName', 'ClientLName'],
    ['email', 'email'],
    ['cell', 'cell'],
    ['street', 'street'],
    ['city', 'city'],
    ['zip', 'zip'],
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

    // Persist the checkout details (phone + full address) before handing off to Hyp.
    const fullName = [src.clientName, src.clientLName].filter(Boolean).join(' ').trim();
    // Combine street + city + postal code into one shipping address for the admin.
    const cityZip = [src.city, src.zip].filter(Boolean).join(' ').trim();
    const fullAddress = [src.street, cityZip].filter(Boolean).join(', ').trim();
    await recordPending({
      order,
      amount,
      quantity: qty,
      name: fullName || null,
      email: src.email ? String(src.email) : null,
      cell: src.cell ? String(src.cell) : null,
      address: fullAddress || null,
      street: src.street ? String(src.street) : null,
      city: src.city ? String(src.city) : null,
      zip: src.zip ? String(src.zip) : null,
      region: src.region ? String(src.region) : null,
    });

    // Append the response verbatim (order preserved) to the payment-page base.
    const paymentUrl = `${HYP_BASE}?${body}`;
    return res.status(200).json({ url: paymentUrl, order });
  } catch (e) {
    return res.status(502).json({ error: 'Failed to reach Hyp', detail: String(e) });
  }
}
