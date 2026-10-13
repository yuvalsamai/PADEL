// Vercel serverless function: Hyp's server-to-server payment notification.
// Set this URL in the Hyp terminal settings so paid orders are recorded (and the
// confirmation email sent) even when the buyer never reaches the thank-you page:
//   https://netcamsport.co.il/api/hyp-notify
// Accepts GET (query string) or POST (form-encoded or JSON). Every call is
// re-verified against Hyp, so a forged request can't mark an order as paid.

import { processPayment } from './_processPayment.js';

export default async function handler(req, res) {
  let rawQuery = '';
  const qIndex = req.url.indexOf('?');
  if (qIndex >= 0) rawQuery = req.url.slice(qIndex + 1);

  if (!rawQuery && req.method === 'POST' && req.body) {
    rawQuery =
      typeof req.body === 'string'
        ? req.body
        : new URLSearchParams(Object.entries(req.body).map(([k, v]) => [k, String(v)])).toString();
  }

  const { status, body } = await processPayment(rawQuery);
  // Acknowledge with 200 so Hyp stops retrying — also for declined or invalid
  // notifications, which will never succeed. Only server-side failures (5xx)
  // are passed through so Hyp tries again later.
  if (status >= 500) return res.status(status).send('RETRY');
  return res.status(200).send(body.ok ? 'OK' : `IGNORED: ${body.error || 'invalid'}`);
}
