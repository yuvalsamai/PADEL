// Price for a quantity — shared by the checkout page and the server
// (api/create-payment.js), so what the buyer sees is exactly what is charged.
//   1 unit  → unit price (₪89)
//   2 units → "2 ב-₪149" (₪74.5 each; the ratio scales if the unit price changes)
//   3+      → the 2-unit price per unit, minus 2% for each unit above 2,
//             capped at 10%: 3 → −2%, 4 → −4%, 5 → −6%, 6 → −8%, 7–10 → −10%
export const MAX_QTY = 10;
const PAIR_RATIO = 149 / 178; // ₪149 for two ₪89 units

export function quote(unitPrice, qty) {
  const q = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(qty)) || 1));
  const full = unitPrice * q;
  if (q < 2) return { qty: q, full, total: Math.round(full), savings: 0 };
  const extraPct = Math.min(10, 2 * (q - 2));
  const perUnit = unitPrice * PAIR_RATIO * (1 - extraPct / 100);
  const total = Math.floor(perUnit * q); // round in the buyer's favour
  return { qty: q, full, total, savings: Math.round(full - total) };
}
