// Vercel serverless function: called from the thank-you page with Hyp's
// completion parameters. Verifies and records the payment (see _processPayment.js).

import { processPayment } from './_processPayment.js';

export default async function handler(req, res) {
  // Raw success query string (order preserved) — forwarded from the thank-you page.
  const qIndex = req.url.indexOf('?');
  const rawQuery = qIndex >= 0 ? req.url.slice(qIndex + 1) : '';
  const { status, body } = await processPayment(rawQuery);
  return res.status(status).json(body);
}
